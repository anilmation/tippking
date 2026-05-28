import { createServerSupabaseClient } from '@/lib/supabase-server'
import type { LeaderboardEntry } from '@/lib/types'

export const revalidate = 60

function AvatarCircle({ url, name }: { url: string | null; name: string }) {
  const presets: Record<string, { emoji: string; bg: string }> = {
    crown: { emoji: '👑', bg: '#15803d' }, ball: { emoji: '⚽', bg: '#1d4ed8' },
    trophy: { emoji: '🏆', bg: '#b45309' }, lion: { emoji: '🦁', bg: '#7c3aed' },
    fire: { emoji: '🔥', bg: '#dc2626' }, eagle: { emoji: '🦅', bg: '#0369a1' },
    star: { emoji: '⭐', bg: '#ca8a04' }, rocket: { emoji: '🚀', bg: '#0f766e' },
    wolf: { emoji: '🐺', bg: '#4b5563' }, thunder: { emoji: '⚡', bg: '#a16207' },
    shield: { emoji: '🛡️', bg: '#1e3a5f' }, fist: { emoji: '✊', bg: '#991b1b' },
  }
  if (url?.startsWith('preset:')) {
    const p = presets[url.replace('preset:', '')]
    if (p) return <span style={{ width: 32, height: 32, borderRadius: '50%', background: p.bg, fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{p.emoji}</span>
  }
  if (url && !url.startsWith('preset:')) {
    return <span style={{ width: 32, height: 32, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, display: 'flex' }}><img src={url} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></span>
  }
  return <span style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--pitch-green)', color: '#fff', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{name[0]?.toUpperCase()}</span>
}

export default async function RanglistePage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: entries } = await supabase.from('leaderboard').select('*').order('rank')
  const myEntry = entries?.find((e: LeaderboardEntry) => e.id === user?.id)

  return (
    <div className="animate-fade-in" style={{ maxWidth: 720, margin: '0 auto' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700, marginBottom: 4 }}>RANGLISTE</h1>
      <p style={{ color: 'var(--pitch-muted)', fontSize: 13, marginBottom: 20 }}>{entries?.length ?? 0} Teilnehmer</p>

      {/* My rank */}
      {myEntry && (
        <div className="card" style={{ borderColor: 'var(--pitch-green)', borderWidth: 2, background: 'rgba(22,163,74,0.06)', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 700, color: 'var(--pitch-green)', width: 48, textAlign: 'center' }}>#{myEntry.rank}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 15 }}>Du — {myEntry.username}</div>
              <div style={{ fontSize: 12, color: 'var(--pitch-muted)', marginTop: 2 }}>{myEntry.match_points} Spielpunkte · {myEntry.special_points} Sonderpunkte</div>
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--pitch-gold)' }}>{myEntry.total_points}</span>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--pitch-border)', background: 'var(--pitch-bg)' }}>
              <th style={{ padding: '10px 16px', fontSize: 11, fontWeight: 600, color: 'var(--pitch-muted)', textAlign: 'left', width: 48, textTransform: 'uppercase', letterSpacing: '0.06em' }}>#</th>
              <th style={{ padding: '10px 16px', fontSize: 11, fontWeight: 600, color: 'var(--pitch-muted)', textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Spieler</th>
              <th style={{ padding: '10px 16px', fontSize: 11, fontWeight: 600, color: 'var(--pitch-muted)', textAlign: 'right', textTransform: 'uppercase', letterSpacing: '0.06em' }} className="hide-xs">Spiele</th>
              <th style={{ padding: '10px 16px', fontSize: 11, fontWeight: 600, color: 'var(--pitch-muted)', textAlign: 'right', textTransform: 'uppercase', letterSpacing: '0.06em' }} className="hide-xs">Sonder</th>
              <th style={{ padding: '10px 16px', fontSize: 11, fontWeight: 600, color: 'var(--pitch-muted)', textAlign: 'right', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Gesamt</th>
            </tr>
          </thead>
          <tbody>
            {entries?.map((entry: LeaderboardEntry) => {
              const isMe = entry.id === user?.id
              const medal = entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : null
              return (
                <tr key={entry.id} style={{
                  borderBottom: '1px solid var(--pitch-border)',
                  background: isMe ? 'rgba(22,163,74,0.05)' : 'transparent',
                  transition: 'background 0.15s',
                }}>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    {medal
                      ? <span style={{ fontSize: 20 }}>{medal}</span>
                      : <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--pitch-muted)', fontSize: 14 }}>{entry.rank}</span>
                    }
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <AvatarCircle url={entry.avatar_url} name={entry.username} />
                      <span style={{ fontWeight: 500, fontSize: 14, color: isMe ? 'var(--pitch-green)' : 'var(--pitch-text)' }}>
                        {entry.username}{isMe && ' (Du)'}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', fontSize: 13, color: 'var(--pitch-muted)' }} className="hide-xs">{entry.match_points}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', fontSize: 13, color: 'var(--pitch-muted)' }} className="hide-xs">{entry.special_points}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: 'var(--pitch-green)' }}>{entry.total_points}</span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {(!entries || entries.length === 0) && (
          <p style={{ textAlign: 'center', padding: 48, color: 'var(--pitch-muted)' }}>Noch keine Teilnehmer</p>
        )}
      </div>
      <style>{`.hide-xs { display: table-cell; } @media (max-width: 480px) { .hide-xs { display: none; } }`}</style>
    </div>
  )
}
