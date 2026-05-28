export type Profile = {
  id: string
  username: string
  avatar_url: string | null
  is_admin: boolean
  created_at: string
}

export type Team = {
  id: number
  name: string
  code: string
  group_name: string | null
  flag_url: string | null
}

export type Match = {
  id: number
  external_id: string | null
  home_team_id: number
  away_team_id: number
  home_score: number | null
  away_score: number | null
  stage: 'GROUP' | 'R32' | 'R16' | 'QF' | 'SF' | '3RD' | 'FINAL'
  group_name: string | null
  matchday: number | null
  kickoff: string
  status: 'SCHEDULED' | 'LIVE' | 'FINISHED'
  updated_at?: string
  home_team?: Team
  away_team?: Team
}

export type Tip = {
  id: string
  user_id: string
  match_id: number
  home_score: number
  away_score: number
  points: number
  created_at: string
  updated_at: string
}

export type SpecialQuestion = {
  id: number
  question: string
  category: 'WINNER' | 'RUNNER_UP' | 'THIRD' | 'TOP_SCORER' | 'TOTAL_GOALS' | 'CUSTOM'
  answer: string | null
  deadline: string
  is_open: boolean
  points_value: number
}

export type SpecialTip = {
  id: string
  user_id: string
  question_id: number
  answer: string
  points: number
  created_at: string
}

export type LeaderboardEntry = {
  id: string
  username: string
  avatar_url: string | null
  total_points: number
  match_points: number
  special_points: number
  tips_count: number
  rank: number
}

export type MatchWithTip = Match & {
  tip?: Tip
}

// Loose database type — avoids strict Update<never> conflicts
export type Database = {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile>; Update: Partial<Profile> }
      teams: { Row: Team; Insert: Partial<Team>; Update: Partial<Team> }
      matches: { Row: Match; Insert: Partial<Match>; Update: Partial<Match> }
      tips: { Row: Tip; Insert: Partial<Tip>; Update: Partial<Tip> }
      special_questions: { Row: SpecialQuestion; Insert: Partial<SpecialQuestion>; Update: Partial<SpecialQuestion> }
      special_tips: { Row: SpecialTip; Insert: Partial<SpecialTip>; Update: Partial<SpecialTip> }
    }
    Views: {
      leaderboard: { Row: LeaderboardEntry }
    }
    Functions: Record<string, unknown>
    Enums: Record<string, unknown>
  }
}
