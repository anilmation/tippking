import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { formatDistanceToNow, format, isAfter } from 'date-fns'
import { de } from 'date-fns/locale'

export const revalidate = 60 // Revalidate every minute

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  // Fetch user profile + stats
  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single()

  // Leaderboard rank for this user
  const { data: rank } = await supabase
    .from('leaderboard').select('rank, total_points, tips_count').eq('id', user.id).single()

  // Next upcoming matches (limit 5)
  const now = new Date().toISOString()
  const { data: upcomingMatches } = await supabase
    .from('matches')
    .select('*, home_team:teams!home_team_id(*), away_team:teams!away_team_id(*)')
    .eq('status', 'SCHEDULED')
    .gte('kickoff', now)
    .order('kickoff')
    .limit(5)

  // User's tips for upcoming matches
  const upcomingIds = upcomingMatches?.map(m => m.id) ?? []
  const { data: myTips } = upcomingIds.length > 0
    ? await supabase.from('tips').select('*').eq('user_id', user.id).in('match_id', upcomingIds)
    : { data: [] }

  const tipsMap = new Map(myTips?.map(t => [t.match_id, t]) ?? [])

  // Recent finished matches with my tips
  const { data: recentMatches } = await supabase
    .from('matches')
    .select('*, home_team:teams!home_team_id(*), away_team:teams!away_team_id(*)')
    .eq('status', 'FINISHED')
    .order('kickoff', { ascending: false })
    .limit(5)

  const recentIds = recentMatches?.map(m => m.id) ?? []
  const { data: recentTips } = recentIds.length > 0
    ? await supabase.from('tips').select('*').eq('user_id', user.id).in('match_id', recentIds)
    : { data: [] }
  const recentTipsMap = new Map(recentTips?.map(t => [t.match_id, t]) ?? [])

  // Untipped upcoming matches count
  const untipped = upcomingMatches?.filter(m => !tipsMap.has(m.id)).length ?? 0

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">
            Hallo, {profile?.username ?? user.email?.split('@')[0]}! 👋
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">WM 2026 Tippspiel</p>
        </div>
        {untipped > 0 && (
          <Link href="/tipps" className="btn-primary">
            {untipped} Tipp{untipped !== 1 ? 's' : ''} ausstehend →
          </Link>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Rang', value: rank?.rank ? `#${rank.rank}` : '–', icon: '🏆' },
          { label: 'Punkte', value: rank?.total_points ?? 0, icon: '⭐' },
          { label: 'Abgegebene Tipps', value: rank?.tips_count ?? 0, icon: '✏️' },
          { label: 'Offene Tipps', value: untipped, icon: '⚠️' },
        ].map(s => (
          <div key={s.label} className="card text-center">
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className="font-display text-2xl font-bold text-pitch-700 dark:text-pitch-400">{s.value}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Upcoming matches */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-bold">Nächste Spiele</h2>
          <Link href="/tipps" className="text-sm text-pitch-600 dark:text-pitch-400 hover:underline">Alle Tipps →</Link>
        </div>
        {!upcomingMatches?.length ? (
          <p className="text-slate-500 text-sm text-center py-4">Keine anstehenden Spiele</p>
        ) : (
          <div className="space-y-2">
            {upcomingMatches.map(match => {
              const tip = tipsMap.get(match.id)
              const kickoff = new Date(match.kickoff)
              return (
                <Link href="/tipps" key={match.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 font-medium text-sm">
                      <span className="truncate">{match.home_team?.name}</span>
                      <span className="text-slate-400 shrink-0">vs</span>
                      <span className="truncate">{match.away_team?.name}</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {format(kickoff, "EEE, dd. MMM – HH:mm 'Uhr'", { locale: de })}
                      {' · '}<span className="stage-tag text-xs">{match.stage}</span>
                    </div>
                  </div>
                  <div className="shrink-0 text-sm">
                    {tip ? (
                      <span className="font-bold text-pitch-600 dark:text-pitch-400">
                        {tip.home_score}:{tip.away_score}
                      </span>
                    ) : (
                      <span className="text-slate-400 group-hover:text-pitch-500 transition-colors">Tippen →</span>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>

      {/* Recent results */}
      {recentMatches && recentMatches.length > 0 && (
        <div className="card">
          <h2 className="font-display text-xl font-bold mb-4">Letzte Ergebnisse</h2>
          <div className="space-y-2">
            {recentMatches.map(match => {
              const tip = recentTipsMap.get(match.id)
              return (
                <div key={match.id} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-700/30">
                  <div className="flex-1 text-sm">
                    <div className="flex items-center gap-2 font-medium">
                      <span>{match.home_team?.name}</span>
                      <span className="font-bold text-pitch-700 dark:text-pitch-400">
                        {match.home_score}:{match.away_score}
                      </span>
                      <span>{match.away_team?.name}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    {tip ? (
                      <>
                        <div className="text-xs text-slate-500">Mein Tipp: {tip.home_score}:{tip.away_score}</div>
                        <div className={`font-display font-bold ${tip.points > 0 ? 'text-pitch-500' : 'text-red-400'}`}>
                          {tip.points} Pkt
                        </div>
                      </>
                    ) : (
                      <span className="text-xs text-slate-400">Kein Tipp</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
