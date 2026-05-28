'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { format, isBefore } from 'date-fns'
import { de } from 'date-fns/locale'
import type { Match, Tip, Team } from '@/lib/types'
import { TeamName } from '@/components/ui/TeamName'
import { useRouter } from 'next/navigation'

type MatchWithTeams = Match & { home_team: Team; away_team: Team }
type Tendency = 'H' | 'D' | 'A' | null

const STAGES = ['Alle', 'GROUP', 'R32', 'R16', 'QF', 'SF', '3RD', 'FINAL']
const STAGE_LABELS: Record<string, string> = {
  'Alle': 'Alle', 'GROUP': 'Gruppe', 'R32': 'Runde 32', 'R16': 'Achtelfinale',
  'QF': 'Viertelfinale', 'SF': 'Halbfinale', '3RD': 'Platz 3', 'FINAL': 'Finale'
}

function getTendency(home: string, away: string): Tendency {
  const h = parseInt(home), a = parseInt(away)
  if (isNaN(h) || isNaN(a)) return null
  if (h > a) return 'H'
  if (h === a) return 'D'
  return 'A'
}

export default function TippsPage() {
  const [matches, setMatches] = useState<MatchWithTeams[]>([])
  const [tips, setTips] = useState<Map<number, Tip>>(new Map())
  const [stage, setStage] = useState('Alle')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<number | null>(null)
  const [saved, setSaved] = useState<number | null>(null)
  const [pending, setPending] = useState<Map<number, { home: string; away: string }>>(new Map())
  const [showScore, setShowScore] = useState<Set<number>>(new Set())
  const [userId, setUserId] = useState<string | null>(null)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push('/auth'); return }
      setUserId(data.user.id)
    })
  }, [])

  useEffect(() => { if (userId) loadData() }, [userId])

  async function loadData() {
    setLoading(true)
    const { data: matchData } = await supabase
      .from('matches')
      .select('*, home_team:teams!home_team_id(*), away_team:teams!away_team_id(*)')
      .order('kickoff')
    const { data: tipData } = await supabase.from('tips').select('*').eq('user_id', userId)
    setMatches((matchData as any) ?? [])
    const tipsMap = new Map(tipData?.map((t: any) => [t.match_id, t]) ?? [])
    setTips(tipsMap)
    const p = new Map<number, { home: string; away: string }>()
    tipData?.forEach((t: any) => p.set(t.match_id, { home: String(t.home_score), away: String(t.away_score) }))
    setPending(p)
    // Show score inputs for matches that already have a score tipped
    const withScore = new Set<number>()
    tipData?.forEach((t: any) => withScore.add(t.match_id))
    setShowScore(withScore)
    setLoading(false)
  }

  function setPendingValue(matchId: number, side: 'home' | 'away', val: string) {
    setPending(prev => {
      const next = new Map(prev)
      const curr = next.get(matchId) ?? { home: '', away: '' }
      next.set(matchId, { ...curr, [side]: val })
      return next
    })
  }

  function setTendencyQuick(matchId: number, t: Tendency) {
    if (!t) return
    const existing = pending.get(matchId)
    // Set a default score for the tendency if no score yet
    if (!existing?.home && !existing?.away) {
      const defaults: Record<string, { home: string; away: string }> = {
        H: { home: '1', away: '0' },
        D: { home: '1', away: '1' },
        A: { home: '0', away: '1' },
      }
      setPending(prev => { const n = new Map(prev); n.set(matchId, defaults[t]); return n })
    } else {
      // Adjust existing scores to match tendency
      const h = parseInt(existing.home || '0')
      const a = parseInt(existing.away || '0')
      if (t === 'H' && h <= a) setPending(prev => { const n = new Map(prev); n.set(matchId, { home: String(a + 1), away: String(a) }); return n })
      if (t === 'D' && h !== a) { const avg = Math.max(h, a); setPending(prev => { const n = new Map(prev); n.set(matchId, { home: String(avg), away: String(avg) }); return n }) }
      if (t === 'A' && a <= h) setPending(prev => { const n = new Map(prev); n.set(matchId, { home: String(h), away: String(h + 1) }); return n })
    }
    // Auto-save tendency
    autoSave(matchId, t)
  }

  async function autoSave(matchId: number, tendency: Tendency) {
    if (!userId || !tendency) return
    const p = pending.get(matchId)
    const defaults: Record<string, { home: number; away: number }> = {
      H: { home: 1, away: 0 }, D: { home: 1, away: 1 }, A: { home: 0, away: 1 }
    }
    const scores = p?.home && p?.away
      ? { home: parseInt(p.home), away: parseInt(p.away) }
      : defaults[tendency]

    setSaving(matchId)
    const existing = tips.get(matchId)
    const payload = { user_id: userId, match_id: matchId, home_score: scores.home, away_score: scores.away }
    if (existing) {
      await supabase.from('tips').update(payload as any).eq('id', existing.id)
    } else {
      await supabase.from('tips').insert(payload as any)
    }
    await loadData()
    setSaving(null)
    setSaved(matchId)
    setTimeout(() => setSaved(null), 2000)
  }

  async function saveTip(matchId: number) {
    const p = pending.get(matchId)
    if (!p || p.home === '' || p.away === '' || !userId) return
    const homeScore = parseInt(p.home)
    const awayScore = parseInt(p.away)
    if (isNaN(homeScore) || isNaN(awayScore)) return
    setSaving(matchId)
    const existing = tips.get(matchId)
    const payload = { user_id: userId, match_id: matchId, home_score: homeScore, away_score: awayScore }
    if (existing) {
      await supabase.from('tips').update(payload as any).eq('id', existing.id)
    } else {
      await supabase.from('tips').insert(payload as any)
    }
    await loadData()
    setSaving(null)
    setSaved(matchId)
    setTimeout(() => setSaved(null), 2000)
  }

  function toggleShowScore(matchId: number) {
    setShowScore(prev => {
      const next = new Set(prev)
      next.has(matchId) ? next.delete(matchId) : next.add(matchId)
      return next
    })
  }

  const filtered = stage === 'Alle' ? matches : matches.filter(m => m.stage === stage)
  const now = new Date()

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--pitch-muted)' }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>⚽</div>
      <p>Lade Spiele...</p>
    </div>
  )

  return (
    <div className="animate-fade-in" style={{ maxWidth: 720, margin: '0 auto' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700, marginBottom: 4 }}>MEINE TIPPS</h1>
      <p style={{ color: 'var(--pitch-muted)', fontSize: 13, marginBottom: 20 }}>
        {matches.filter(m => !tips.has(m.id) && m.status === 'SCHEDULED').length} offene Tipps
      </p>

      {/* Stage filter */}
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4, marginBottom: 16 }}>
        {STAGES.map(s => (
          <button key={s} onClick={() => setStage(s)} style={{
            flexShrink: 0, padding: '6px 14px', borderRadius: 999, fontSize: 12, fontWeight: 600,
            border: 'none', cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'var(--font-body)',
            background: stage === s ? 'var(--pitch-green)' : 'var(--pitch-surface)',
            color: stage === s ? '#fff' : 'var(--pitch-muted)',
            outline: stage === s ? 'none' : '1px solid var(--pitch-border)',
          }}>
            {STAGE_LABELS[s]}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.map(match => {
          const kickoff = new Date(match.kickoff)
          const isLocked = isBefore(kickoff, now)
          const isLive = match.status === 'LIVE'
          const isFinished = match.status === 'FINISHED'
          const tip = tips.get(match.id)
          const p = pending.get(match.id)
          const currentTendency = getTendency(p?.home ?? '', p?.away ?? '')
          const isScoreVisible = showScore.has(match.id)
          const hasTip = !!tip

          return (
            <div key={match.id} className="card" style={{
              borderLeft: isLive ? '3px solid #ef4444' : hasTip ? '3px solid var(--pitch-green)' : '3px solid var(--pitch-border)',
              opacity: isFinished ? 0.85 : 1,
              transition: 'border-color 0.2s',
            }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
                <span className="stage-tag">{STAGE_LABELS[match.stage]}</span>
                {match.group_name && <span style={{ fontSize: 11, color: 'var(--pitch-muted)' }}>Gruppe {match.group_name}</span>}
                {isLive && <span className="badge-live"><span className="live-dot" />LIVE</span>}
                {isFinished && <span className="badge-finished">Beendet</span>}
                <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--pitch-muted)' }}>
                  {format(kickoff, "EEE, dd. MMM · HH:mm 'Uhr'", { locale: de })}
                </span>
              </div>

              {/* Teams */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, gap: 8 }}>
                <TeamName code={match.home_team?.code} name={match.home_team?.name} size="md" align="left" />
                {isFinished || isLive ? (
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, color: 'var(--pitch-green)', letterSpacing: '0.04em' }}>
                    {match.home_score} : {match.away_score}
                  </span>
                ) : (
                  <span style={{ fontSize: 12, color: 'var(--pitch-muted)', fontWeight: 500 }}>vs</span>
                )}
                <TeamName code={match.away_team?.code} name={match.away_team?.name} size="md" align="right" />
              </div>

              {/* Tendency buttons or locked state */}
              {isFinished ? (
                tip && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid var(--pitch-border)', fontSize: 13 }}>
                    <span style={{ color: 'var(--pitch-muted)' }}>Dein Tipp: <strong>{tip.home_score}:{tip.away_score}</strong></span>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: tip.points > 0 ? 'var(--pitch-green)' : '#ef4444' }}>+{tip.points} Punkte</span>
                  </div>
                )
              ) : isLocked ? (
                <div style={{ paddingTop: 12, borderTop: '1px solid var(--pitch-border)', fontSize: 13, color: 'var(--pitch-muted)', textAlign: 'center' }}>
                  {tip ? <>🔒 Tipp: <strong style={{ color: 'var(--pitch-text)' }}>{tip.home_score}:{tip.away_score}</strong></> : '🔒 Kein Tipp abgegeben'}
                </div>
              ) : (
                <div style={{ paddingTop: 12, borderTop: '1px solid var(--pitch-border)' }}>

                  {/* Primary: Tendency buttons */}
                  <div style={{ display: 'flex', gap: 8, marginBottom: isScoreVisible ? 12 : 0 }}>
                    {[
                      { key: 'H' as Tendency, label: 'Heimsieg' },
                      { key: 'D' as Tendency, label: 'Unentschieden' },
                      { key: 'A' as Tendency, label: 'Auswärtssieg' },
                    ].map(({ key, label }) => {
                      const isActive = currentTendency === key
                      return (
                        <button
                          key={key}
                          onClick={() => { setTendencyQuick(match.id, key); if (!isScoreVisible) setShowScore(prev => { const n = new Set(prev); n.add(match.id); return n }) }}
                          style={{
                            flex: 1,
                            padding: '9px 6px',
                            borderRadius: 8,
                            fontSize: 12,
                            fontWeight: 600,
                            fontFamily: 'var(--font-body)',
                            cursor: 'pointer',
                            transition: 'all 0.15s',
                            border: isActive ? 'none' : '1px solid var(--pitch-border)',
                            background: isActive ? '#15803d' : 'var(--pitch-bg)',
                            color: isActive ? '#fff' : 'var(--pitch-muted)',
                          }}
                        >
                          {saving === match.id && isActive ? '...' : saved === match.id && isActive ? '✓' : label}
                        </button>
                      )
                    })}
                  </div>

                  {/* Bonus hint — shown after tendency is selected */}
                  {currentTendency && !isScoreVisible && (
                    <button
                      onClick={() => toggleShowScore(match.id)}
                      style={{ width: '100%', marginTop: 8, padding: '7px', borderRadius: 8, fontSize: 12, color: 'var(--pitch-muted)', background: 'transparent', border: '1px dashed var(--pitch-border)', cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'all 0.15s' }}
                    >
                      🎯 Richtiges Ergebnis tippen für bis zu 3 Bonuspunkte
                    </button>
                  )}

                  {/* Secondary: Score inputs */}
                  {isScoreVisible && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
                      <span style={{ fontSize: 12, color: 'var(--pitch-muted)', flexShrink: 0 }}>🎯 Ergebnis:</span>
                      <input
                        type="number" min={0} max={20}
                        value={p?.home ?? ''}
                        onChange={e => setPendingValue(match.id, 'home', e.target.value)}
                        className="score-input"
                        style={{ width: 44, height: 40, fontSize: 18 }}
                        placeholder="–"
                      />
                      <span style={{ color: 'var(--pitch-muted)', fontWeight: 700 }}>:</span>
                      <input
                        type="number" min={0} max={20}
                        value={p?.away ?? ''}
                        onChange={e => setPendingValue(match.id, 'away', e.target.value)}
                        className="score-input"
                        style={{ width: 44, height: 40, fontSize: 18 }}
                        placeholder="–"
                      />
                      <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', gap: 8, alignItems: 'center' }}>
                        {saved === match.id
                          ? <span style={{ fontSize: 12, color: 'var(--pitch-green)', fontWeight: 600 }}>✓ Gespeichert</span>
                          : <button onClick={() => saveTip(match.id)} disabled={saving === match.id} className="btn-primary" style={{ fontSize: 12, padding: '7px 14px' }}>
                              {saving === match.id ? '...' : 'Speichern'}
                            </button>
                        }
                        <button onClick={() => toggleShowScore(match.id)} style={{ fontSize: 18, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--pitch-muted)', padding: '0 4px' }}>×</button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
