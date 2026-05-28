-- WM 2026 Tippspiel – Initial Schema
-- Run this in the Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─────────────────────────────────────────
-- PROFILES (extends Supabase auth.users)
-- ─────────────────────────────────────────
create table public.profiles (
  id          uuid references auth.users(id) on delete cascade primary key,
  username    text unique not null,
  avatar_url  text,
  is_admin    boolean default false,
  created_at  timestamptz default now()
);

alter table public.profiles enable row level security;
create policy "Public profiles are viewable by everyone" on public.profiles for select using (true);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username)
  values (new.id, split_part(new.email, '@', 1));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─────────────────────────────────────────
-- TEAMS
-- ─────────────────────────────────────────
create table public.teams (
  id          serial primary key,
  name        text not null,
  code        text not null unique, -- e.g. "GER", "BRA"
  group_name  text,                 -- e.g. "A", "B"
  flag_url    text
);

alter table public.teams enable row level security;
create policy "Teams viewable by everyone" on public.teams for select using (true);
create policy "Admins can manage teams" on public.teams for all using (
  exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
);

-- ─────────────────────────────────────────
-- MATCHES
-- ─────────────────────────────────────────
create table public.matches (
  id              serial primary key,
  external_id     text unique,          -- from football-data.org
  home_team_id    int references public.teams(id),
  away_team_id    int references public.teams(id),
  home_score      int,
  away_score      int,
  stage           text not null,        -- "GROUP", "R32", "R16", "QF", "SF", "3RD", "FINAL"
  group_name      text,
  matchday        int,
  kickoff         timestamptz not null,
  status          text default 'SCHEDULED', -- SCHEDULED, LIVE, FINISHED
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

alter table public.matches enable row level security;
create policy "Matches viewable by everyone" on public.matches for select using (true);
create policy "Admins can manage matches" on public.matches for all using (
  exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
);

-- ─────────────────────────────────────────
-- TIPS (Spieltipps)
-- ─────────────────────────────────────────
create table public.tips (
  id              uuid default uuid_generate_v4() primary key,
  user_id         uuid references public.profiles(id) on delete cascade,
  match_id        int references public.matches(id) on delete cascade,
  home_score      int not null,
  away_score      int not null,
  points          int default 0,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now(),
  unique(user_id, match_id)
);

alter table public.tips enable row level security;
create policy "Users can view all tips after match starts" on public.tips for select using (
  auth.uid() = user_id or
  exists (select 1 from public.matches m where m.id = match_id and m.kickoff < now())
);
create policy "Users can insert own tips" on public.tips for insert with check (auth.uid() = user_id);
create policy "Users can update own tips before kickoff" on public.tips for update using (
  auth.uid() = user_id and
  exists (select 1 from public.matches m where m.id = match_id and m.kickoff > now())
);

-- ─────────────────────────────────────────
-- SPECIAL TIPS (Sondertipps)
-- ─────────────────────────────────────────
create table public.special_questions (
  id          serial primary key,
  question    text not null,
  category    text not null, -- "WINNER", "RUNNER_UP", "THIRD", "TOP_SCORER", "TOTAL_GOALS", "CUSTOM"
  answer      text,          -- filled when tournament is over
  deadline    timestamptz not null,
  is_open     boolean default true,
  points_value int default 10,
  created_at  timestamptz default now()
);

alter table public.special_questions enable row level security;
create policy "Special questions viewable by everyone" on public.special_questions for select using (true);
create policy "Admins manage special questions" on public.special_questions for all using (
  exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
);

create table public.special_tips (
  id              uuid default uuid_generate_v4() primary key,
  user_id         uuid references public.profiles(id) on delete cascade,
  question_id     int references public.special_questions(id) on delete cascade,
  answer          text not null,
  points          int default 0,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now(),
  unique(user_id, question_id)
);

alter table public.special_tips enable row level security;
create policy "Users see own special tips; others after deadline" on public.special_tips for select using (
  auth.uid() = user_id or
  exists (select 1 from public.special_questions q where q.id = question_id and q.deadline < now())
);
create policy "Users insert own special tips" on public.special_tips for insert with check (auth.uid() = user_id);
create policy "Users update own before deadline" on public.special_tips for update using (
  auth.uid() = user_id and
  exists (select 1 from public.special_questions q where q.id = question_id and q.is_open = true)
);

-- ─────────────────────────────────────────
-- LEADERBOARD VIEW
-- ─────────────────────────────────────────
create or replace view public.leaderboard as
select
  p.id,
  p.username,
  p.avatar_url,
  coalesce(sum(t.points), 0) + coalesce(sum(st.points), 0) as total_points,
  coalesce(sum(t.points), 0) as match_points,
  coalesce(sum(st.points), 0) as special_points,
  count(distinct t.id) as tips_count,
  rank() over (order by (coalesce(sum(t.points), 0) + coalesce(sum(st.points), 0)) desc) as rank
from public.profiles p
left join public.tips t on t.user_id = p.id
left join public.special_tips st on st.user_id = p.id
group by p.id, p.username, p.avatar_url;

-- ─────────────────────────────────────────
-- POINT CALCULATION FUNCTION
-- ─────────────────────────────────────────
create or replace function public.calculate_tip_points(
  tip_home int, tip_away int,
  real_home int, real_away int
) returns int as $$
declare
  tip_diff  int := tip_home - tip_away;
  real_diff int := real_home - real_away;
begin
  -- Exact result: 4 points
  if tip_home = real_home and tip_away = real_away then return 4; end if;
  -- Correct goal difference (non-draw): 3 points
  if tip_diff = real_diff and real_diff != 0 then return 3; end if;
  -- Correct tendency + one correct score: 2 points
  if (tip_diff > 0 and real_diff > 0) or (tip_diff < 0 and real_diff < 0) or (tip_diff = 0 and real_diff = 0) then
    if tip_home = real_home or tip_away = real_away then return 2; end if;
    -- Correct tendency only: 1 point
    return 1;
  end if;
  return 0;
end;
$$ language plpgsql immutable;

-- Trigger to recalculate points when match result is set
create or replace function public.recalculate_match_tips()
returns trigger as $$
begin
  if new.home_score is not null and new.away_score is not null and new.status = 'FINISHED' then
    update public.tips
    set points = public.calculate_tip_points(home_score, away_score, new.home_score, new.away_score),
        updated_at = now()
    where match_id = new.id;
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_match_result_updated
  after update on public.matches
  for each row
  when (old.status is distinct from new.status or old.home_score is distinct from new.home_score)
  execute procedure public.recalculate_match_tips();

-- Insert default special questions for WM 2026
insert into public.special_questions (question, category, deadline, points_value) values
  ('Wer wird Weltmeister 2026?', 'WINNER', '2026-06-11 23:59:00+00', 15),
  ('Wer wird Vize-Weltmeister?', 'RUNNER_UP', '2026-06-11 23:59:00+00', 10),
  ('Wer belegt Platz 3?', 'THIRD', '2026-06-11 23:59:00+00', 8),
  ('Wer wird Torschützenkönig?', 'TOP_SCORER', '2026-06-11 23:59:00+00', 12),
  ('Wie viele Tore fallen insgesamt im Turnier?', 'TOTAL_GOALS', '2026-06-11 23:59:00+00', 10),
  ('Welche Mannschaft schiesst die meisten Tore?', 'CUSTOM', '2026-06-11 23:59:00+00', 8),
  ('Welches Spiel hat das beste Torverhältnis?', 'CUSTOM', '2026-06-11 23:59:00+00', 6);
