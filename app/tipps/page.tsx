'use client'
import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import { format, isAfter, isBefore, addMinutes } from 'date-fns'
import { de } from 'date-fns/locale'
import type { Match, Tip, Team } from '@/lib/types'
import clsx from 'clsx'
import { useRouter } from 'next/navigation'

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

  useEffect(() => {
    if (!userId) return
    loadData()
  }, [userId])

  async function loadData() {
    setLoading(true)
    const { data: matchData } = await supabase
      .from('matches')
      .select('*, home_team:teams!home_team_id(*), away_team:teams!away_team_id(*)')
      .order('kickoff')

    const { data: tipData } = await supabase
      .from('tips')
      .select('*')
      .eq('user_id', userId)

    setMatches((matchData as any) ?? [])
    const tipsMap = new Map(tipData?.map(t => [t.match_id, t]) ?? [])
    setTips(tipsMap)

    // Init pending from existing tips
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
      await supabase.from('tips').update(payload).eq('id', existing.id)
    } else {
      await supabase.from('tips').insert(payload)
    }
    await loadData()
    setSaving(null)
  }

  const filtered = stage === 'Alle' ? matches : matches.filter(m => m.stage === stage)
  const now = new Date()

  if (loading) return (
    <div className="flex items-center justify-center py-20 text-slate-400">
      <div className="text-center"><div className="text-4xl mb-2 animate-pulse-slow">⚽</div><p>Lade Spiele...</p></div>
    </div>
  )

  return (
    <div className="animate-fade-in space-y-4">
      <h1 className="font-display text-3xl font-bold">Meine Tipps</h1>

      {/* Stage filter */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
        {STAGES.map(s => (
          <button
            key={s}
            onClick={() => setStage(s)}
            className={clsx(
              'shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
              stage === s
                ? 'bg-pitch-600 text-white'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
            )}
          >
            {STAGE_LABELS[s]}
          </button>
        ))}
      </div>

      {/* Matches */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-slate-400">Keine Spiele in dieser Runde</div>
      ) : (
        <div className="space-y-2">
          {filtered.map(match => {
            const kickoff = new Date(match.kickoff)
            const isLocked = isBefore(kickoff, now) // Can't tip after kickoff
            const isLive = match.status === 'LIVE'
            const isFinished = match.status === 'FINISHED'
            const tip = tips.get(match.id)
            const pending = pendingTips.get(match.id)
            const hasChanges = tip
              ? String(tip.home_score) !== pending?.home || String(tip.away_score) !== pending?.away
              : (pending?.home ?? '') !== '' || (pending?.away ?? '') !== ''

            return (
              <div key={match.id} className={clsx(
                'card transition-all',
                isLive && 'border-red-400 dark:border-red-600 shadow-red-100 dark:shadow-red-900/20 shadow-md',
                isFinished && 'opacity-80'
              )}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="stage-tag">{STAGE_LABELS[match.stage]}</span>
                  {match.group_name && <span className="text-xs text-slate-500">Gruppe {match.group_name}</span>}
                  {isLive && <span className="badge-live"><span className="live-dot" />LIVE</span>}
                  {isFinished && <span className="badge-finished">Beendet</span>}
                  <span className="ml-auto text-xs text-slate-500">
                    {format(kickoff, "dd. MMM, HH:mm 'Uhr'", { locale: de })}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {/* Home team */}
                  <div className="flex-1 text-right">
                    <span className="font-semibold text-sm">{match.home_team?.name}</span>
                  </div>

                  {/* Score / Tipp */}
                  <div className="flex items-center gap-2 shrink-0">
                    {isFinished || isLive ? (
                      <>
                        <div className="font-display text-2xl font-bold w-10 text-center text-pitch-700 dark:text-pitch-400">
                          {match.home_score ?? '–'}
                        </div>
                        <div className="text-slate-400">:</div>
                        <div className="font-display text-2xl font-bold w-10 text-center text-pitch-700 dark:text-pitch-400">
                          {match.away_score ?? '–'}
                        </div>
                      </>
                    ) : !isLocked ? (
                      <>
                        <input
                          type="number"
                          min={0} max={20}
                          value={pending?.home ?? ''}
                          onChange={e => updatePending(match.id, 'home', e.target.value)}
                          className="score-input"
                          placeholder="–"
                        />
                        <div className="text-slate-400 font-bold">:</div>
                        <input
                          type="number"
                          min={0} max={20}
                          value={pending?.away ?? ''}
                          onChange={e => updatePending(match.id, 'away', e.target.value)}
                          className="score-input"
                          placeholder="–"
                        />
                      </>
                    ) : (
                      <>
                        <div className="font-display text-xl font-bold w-10 text-center text-slate-400">
                          {tip?.home_score ?? '–'}
                        </div>
                        <div className="text-slate-300">:</div>
                        <div className="font-display text-xl font-bold w-10 text-center text-slate-400">
                          {tip?.away_score ?? '–'}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Away team */}
                  <div className="flex-1">
                    <span className="font-semibold text-sm">{match.away_team?.name}</span>
                  </div>
                </div>

                {/* Tip result */}
                {isFinished && tip && (
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-sm">
                    <span className="text-slate-500">Mein Tipp: <strong>{tip.home_score}:{tip.away_score}</strong></span>
                    <span className={clsx('font-display font-bold', tip.points > 0 ? 'text-pitch-500' : 'text-red-400')}>
                      +{tip.points} Punkte
                    </span>
                  </div>
                )}

                {/* Save button */}
                {!isLocked && !isFinished && hasChanges && (
                  <div className="mt-3 flex justify-end">
                    <button
                      onClick={() => saveTip(match.id)}
                      disabled={saving === match.id}
                      className="btn-primary text-sm py-1.5 px-4"
                    >
                      {saving === match.id ? 'Speichere...' : tip ? 'Tipp aktualisieren' : 'Tipp speichern'}
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
