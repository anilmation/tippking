'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { format, isBefore } from 'date-fns'
import { de } from 'date-fns/locale'
import type { Match, Tip, Team } from '@/lib/types'
import { TeamName } from '@/components/ui/TeamName'
import { useRouter } from 'next/navigation'
import clsx from 'clsx'

type MatchWithTeams = Match & { home_team: Team; away_team: Team }

const STAGES = ['Alle', 'GROUP', 'R32', 'R16', 'QF', 'SF', '3RD', 'FINAL']
const STAGE_LABELS: Record<string, string> = {
  'Alle': 'Alle', 'GROUP': 'Gruppe', 'R32': 'Runde 32', 'R16': 'Achtelfinale',
  'QF': 'Viertelfinale', 'SF': 'Halbfinale', '3RD': 'Platz 3', 'FINAL': 'Finale'
}

export default function TippsPage() {
  const [matches, setMatches] = useState<MatchWithTeams[]>([])
  const [tips, setTips] = useState<Map<number, Tip>>(new Map())
  const [stage, setStage] = useState('Alle')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<number | null>(null)
  const [saved, setSaved] = useState<number | null>(null)
  const [pendingTips, setPendingTips] = useState<Map<number, { home: string; away: string }>>(new Map())
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
    const tipsMap = new Map(tipData?.map(t => [t.match_id, t]) ?? [])
    setTips(tipsMap)
    const pending = new Map<number, { home: string; away: string }>()
    tipData?.forEach(t => pending.set(t.match_id, { home: String(t.home_score), away: String(t.away_score) }))
    setPendingTips(pending)
    setLoading(false)
  }

  function updatePending(matchId: number, side: 'home' | 'away', val: string) {
    setPendingTips(prev => {
      const next = new Map(prev)
      const curr = next.get(matchId) ?? { home: '', away: '' }
      next.set(matchId, { ...curr, [side]: val })
      return next
    })
  }

  async function saveTip(matchId: number) {
    const pending = pendingTips.get(matchId)
    if (!pending || pending.home === '' || pending.away === '' || !userId) return
    const homeScore = parseInt(pending.home)
    const awayScore = parseInt(pending.away)
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

      {/* Matches */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.map(match => {
          const kickoff = new Date(match.kickoff)
          const isLocked = isBefore(kickoff, now)
          const isLive = match.status === 'LIVE'
          const isFinished = match.status === 'FINISHED'
          const tip = tips.get(match.id)
          const pending = pendingTips.get(match.id)
          const hasChanges = tip
            ? String(tip.home_score) !== pending?.home || String(tip.away_score) !== pending?.away
            : (pending?.home ?? '') !== '' || (pending?.away ?? '') !== ''

          return (
            <div key={match.id} className="card" style={{
              borderLeft: isLive ? '3px solid #ef4444' : tip ? '3px solid var(--pitch-green)' : '3px solid transparent',
              opacity: isFinished ? 0.85 : 1,
            }}>
              {/* Header row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                <span className="stage-tag">{STAGE_LABELS[match.stage]}</span>
                {match.group_name && <span style={{ fontSize: 11, color: 'var(--pitch-muted)' }}>Gruppe {match.group_name}</span>}
                {isLive && <span className="badge-live"><span className="live-dot" />LIVE</span>}
                {isFinished && <span className="badge-finished">Beendet</span>}
                <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--pitch-muted)' }}>
                  {format(kickoff, "EEE, dd. MMM · HH:mm 'Uhr'", { locale: de })}
                </span>
              </div>

              {/* Match row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {/* Home */}
                <div style={{ flex: 1, textAlign: 'right', display: 'flex', justifyContent: 'flex-end' }}>
                  <TeamName code={match.home_team?.code} name={match.home_team?.name} size="md" align="right" />
                </div>

                {/* Score */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  {isFinished || isLive ? (
                    <>
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--pitch-green)', width: 36, textAlign: 'center' }}>{match.home_score ?? '–'}</span>
                      <span style={{ color: 'var(--pitch-muted)', fontWeight: 700 }}>:</span>
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--pitch-green)', width: 36, textAlign: 'center' }}>{match.away_score ?? '–'}</span>
                    </>
                  ) : !isLocked ? (
                    <>
                      <input type="number" min={0} max={20} value={pending?.home ?? ''} onChange={e => updatePending(match.id, 'home', e.target.value)} className="score-input" placeholder="–" />
                      <span style={{ color: 'var(--pitch-muted)', fontWeight: 700, fontSize: 18 }}>:</span>
                      <input type="number" min={0} max={20} value={pending?.away ?? ''} onChange={e => updatePending(match.id, 'away', e.target.value)} className="score-input" placeholder="–" />
                    </>
                  ) : (
                    <>
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, color: 'var(--pitch-muted)', width: 36, textAlign: 'center' }}>{tip?.home_score ?? '–'}</span>
                      <span style={{ color: 'var(--pitch-muted)' }}>:</span>
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, color: 'var(--pitch-muted)', width: 36, textAlign: 'center' }}>{tip?.away_score ?? '–'}</span>
                    </>
                  )}
                </div>

                {/* Away */}
                <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-start' }}>
                  <TeamName code={match.away_team?.code} name={match.away_team?.name} size="md" align="left" />
                </div>
              </div>

              {/* Footer */}
              {isFinished && tip && (
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--pitch-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
                  <span style={{ color: 'var(--pitch-muted)' }}>Dein Tipp: <strong>{tip.home_score}:{tip.away_score}</strong></span>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: tip.points > 0 ? 'var(--pitch-green)' : '#ef4444' }}>+{tip.points} Punkte</span>
                </div>
              )}
              {!isLocked && !isFinished && hasChanges && (
                <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                  {saved === match.id
                    ? <span style={{ fontSize: 13, color: 'var(--pitch-green)', fontWeight: 500 }}>✓ Gespeichert</span>
                    : <button onClick={() => saveTip(match.id)} disabled={saving === match.id} className="btn-primary" style={{ fontSize: 13, padding: '7px 16px' }}>
                        {saving === match.id ? 'Speichere...' : tip ? 'Aktualisieren' : 'Tipp speichern'}
                      </button>
                  }
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
