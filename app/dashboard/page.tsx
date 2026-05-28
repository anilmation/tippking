import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import { TeamName } from '@/components/ui/TeamName'

export const revalidate = 60

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  const { data: rank } = await supabase.from('leaderboard').select('rank, total_points, tips_count').eq('id', user.id).single()

  const now = new Date().toISOString()
  const { data: upcomingMatches } = await supabase
    .from('matches')
    .select('*, home_team:teams!home_team_id(*), away_team:teams!away_team_id(*)')
    .eq('status', 'SCHEDULED').gte('kickoff', now).order('kickoff').limit(5)

  const upcomingIds = upcomingMatches?.map((m: any) => m.id) ?? []
  const { data: myTips } = upcomingIds.length > 0
    ? await supabase.from('tips').select('*').eq('user_id', user.id).in('match_id', upcomingIds)
    : { data: [] }
  const tipsMap = new Map(myTips?.map((t: any) => [t.match_id, t]) ?? [])

  const { data: recentMatches } = await supabase
    .from('matches')
    .select('*, home_team:teams!home_team_id(*), away_team:teams!away_team_id(*)')
    .eq('status', 'FINISHED').order('kickoff', { ascending: false }).limit(5)

  const recentIds = recentMatches?.map((m: any) => m.id) ?? []
  const { data: recentTips } = recentIds.length > 0
    ? await supabase.from('tips').select('*').eq('user_id', user.id).in('match_id', recentIds)
    : { data: [] }
  const recentTipsMap = new Map(recentTips?.map((t: any) => [t.match_id, t]) ?? [])

  const untipped = upcomingMatches?.filter((m: any) => !tipsMap.has(m.id)).length ?? 0

  return (
    <div className="animate-fade-in" style={{ maxWidth: 720, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, margin: 0 }}>
            HALLO, {(profile?.username ?? user.email?.split('@')[0] ?? '').toUpperCase()}! 👋
          </h1>
          <p style={{ color: 'var(--pitch-muted)', fontSize: 13, margin: '4px 0 0' }}>TippKing · WM 2026</p>
        </div>
        {untipped > 0 && (
          <Link href="/tipps" style={{ textDecoration: 'none' }}>
            <span className="btn-primary" style={{ fontSize: 13 }}>
              {untipped} offene Tipp{untipped !== 1 ? 's' : ''} →
            </span>
          </Link>
        )}
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 20 }}>
        {[
          { label: 'Rang', value: rank?.rank ? `#${rank.rank}` : '–', icon: '🏆' },
          { label: 'Punkte', value: rank?.total_points ?? 0, icon: '⭐' },
          { label: 'Tipps', value: rank?.tips_count ?? 0, icon: '✏️' },
          { label: 'Offen', value: untipped, icon: '⏳' },
        ].map(s => (
          <div key={s.label} className="card" style={{ textAlign: 'center', padding: '14px 8px' }}>
            <div style={{ fontSize: 22, marginBottom: 6 }}>{s.icon}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--pitch-green)' }}>{s.value}</div>
            <div style={{ fontSize: 11, color: 'var(--pitch-muted)', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Upcoming */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, margin: 0 }}>NÄCHSTE SPIELE</h2>
          <Link href="/tipps" style={{ fontSize: 12, color: 'var(--pitch-green)', textDecoration: 'none' }}>Alle Tipps →</Link>
        </div>
        {!upcomingMatches?.length ? (
          <p style={{ color: 'var(--pitch-muted)', fontSize: 13, textAlign: 'center', padding: '16px 0' }}>Keine anstehenden Spiele</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {upcomingMatches.map((match: any) => {
              const tip = tipsMap.get(match.id)
              return (
                <Link href="/tipps" key={match.id} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12, padding: '10px 8px', borderRadius: 8, transition: 'background 0.15s' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 500, flexWrap: 'wrap' }}>
                      <TeamName code={match.home_team?.code} name={match.home_team?.name} size="sm" />
                      <span style={{ color: 'var(--pitch-muted)', fontSize: 11 }}>vs</span>
                      <TeamName code={match.away_team?.code} name={match.away_team?.name} size="sm" />
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--pitch-muted)', marginTop: 2 }}>
                      {format(new Date(match.kickoff), "EEE, dd. MMM · HH:mm 'Uhr'", { locale: de })}
                    </div>
                  </div>
                  <div style={{ flexShrink: 0, fontSize: 13 }}>
                    {tip
                      ? <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--pitch-green)', fontSize: 16 }}>{tip.home_score}:{tip.away_score}</span>
                      : <span style={{ fontSize: 12, color: 'var(--pitch-muted)' }}>Tippen →</span>
                    }
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>

      {/* Recent */}
      {recentMatches && recentMatches.length > 0 && (
        <div className="card">
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, marginBottom: 14 }}>LETZTE ERGEBNISSE</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {recentMatches.map((match: any) => {
              const tip = recentTipsMap.get(match.id)
              return (
                <div key={match.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 8px', borderRadius: 8, background: 'var(--pitch-bg)' }}>
                  <div style={{ flex: 1, fontSize: 13 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <TeamName code={match.home_team?.code} name={match.home_team?.name} size="sm" />
                      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--pitch-green)' }}>{match.home_score}:{match.away_score}</span>
                      <TeamName code={match.away_team?.code} name={match.away_team?.name} size="sm" />
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    {tip ? (
                      <>
                        <div style={{ fontSize: 11, color: 'var(--pitch-muted)' }}>Tipp: {tip.home_score}:{tip.away_score}</div>
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: tip.points > 0 ? 'var(--pitch-green)' : '#ef4444' }}>+{tip.points} Pkt</div>
                      </>
                    ) : <span style={{ fontSize: 11, color: 'var(--pitch-muted)' }}>Kein Tipp</span>}
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
