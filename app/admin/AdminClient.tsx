'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import type { Match, Team, SpecialQuestion } from '@/lib/types'
import clsx from 'clsx'

type MatchWithTeams = Match & { home_team: Team; away_team: Team }

export default function AdminClient({
  matches, questions
}: {
  matches: MatchWithTeams[]
  questions: SpecialQuestion[]
}) {
  const [tab, setTab] = useState<'matches' | 'special' | 'sync'>('matches')
  const [saving, setSaving] = useState<number | null>(null)
  const [syncing, setSyncing] = useState(false)
  const [syncMsg, setSyncMsg] = useState('')
  const [scores, setScores] = useState<Map<number, { home: string; away: string; status: string }>>(
    new Map(matches.map(m => [m.id, {
      home: m.home_score?.toString() ?? '',
      away: m.away_score?.toString() ?? '',
      status: m.status
    }]))
  )
  const [specialAnswers, setSpecialAnswers] = useState<Map<number, string>>(
    new Map(questions.map(q => [q.id, q.answer ?? '']))
  )
  const supabase = createClient()

  async function saveMatchResult(matchId: number) {
    const s = scores.get(matchId)
    if (!s) return
    setSaving(matchId)
    await supabase.from('matches').update({
      home_score: s.home !== '' ? parseInt(s.home) : null,
      away_score: s.away !== '' ? parseInt(s.away) : null,
      status: s.status as 'SCHEDULED' | 'LIVE' | 'FINISHED',
      updated_at: new Date().toISOString(),
    } as any).eq('id', matchId)
    setSaving(null)
  }

  async function saveSpecialAnswer(questionId: number) {
    const answer = specialAnswers.get(questionId)?.trim()
    await supabase.from('special_questions').update({
      answer: answer || null,
      is_open: !answer
    } as any).eq('id', questionId)

    if (answer) {
      const { data: tips } = await supabase
        .from('special_tips')
        .select('id, answer')
        .eq('question_id', questionId)
      const { data: q } = await supabase
        .from('special_questions')
        .select('points_value')
        .eq('id', questionId)
        .single()

      if (tips && q) {
        for (const tip of tips) {
          const pts = tip.answer.toLowerCase().trim() === answer.toLowerCase().trim() ? q.points_value : 0
          await supabase.from('special_tips').update({ points: pts } as any).eq('id', tip.id)
        }
      }
    }
  }

  async function syncMatches() {
    setSyncing(true)
    setSyncMsg('Synchronisiere mit football-data.org...')
    try {
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET ?? 'dev'}` }
      })
      const data = await res.json()
      setSyncMsg(data.message ?? 'Fertig!')
    } catch {
      setSyncMsg('Fehler beim Sync – API Key prüfen')
    }
    setSyncing(false)
  }

  return (
    <div className="animate-fade-in space-y-4">
      <h1 className="font-display text-3xl font-bold">⚙️ Admin</h1>

      <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
        {[
          { key: 'matches', label: 'Spielergebnisse' },
          { key: 'special', label: 'Sonderfragen' },
          { key: 'sync', label: 'API Sync' },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key as any)}
            className={clsx('flex-1 py-2 text-sm font-medium rounded-md transition-colors',
              tab === t.key ? 'bg-white dark:bg-slate-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            )}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'matches' && (
        <div className="space-y-2">
          {matches.map(match => {
            const s = scores.get(match.id)!
            return (
              <div key={match.id} className="card">
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex-1 text-sm">
                    <div className="font-medium">{match.home_team?.name} vs {match.away_team?.name}</div>
                    <div className="text-xs text-slate-500">{format(new Date(match.kickoff), "dd. MMM yyyy, HH:mm", { locale: de })} · {match.stage}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="number" min={0} value={s.home} onChange={e => setScores(p => { const n = new Map(p); n.set(match.id, { ...s, home: e.target.value }); return n })}
                      className="score-input w-10 h-9 text-sm" placeholder="–" />
                    <span className="text-slate-400">:</span>
                    <input type="number" min={0} value={s.away} onChange={e => setScores(p => { const n = new Map(p); n.set(match.id, { ...s, away: e.target.value }); return n })}
                      className="score-input w-10 h-9 text-sm" placeholder="–" />
                    <select value={s.status} onChange={e => setScores(p => { const n = new Map(p); n.set(match.id, { ...s, status: e.target.value }); return n })}
                      className="input-field text-xs py-1">
                      <option>SCHEDULED</option>
                      <option>LIVE</option>
                      <option>FINISHED</option>
                    </select>
                    <button onClick={() => saveMatchResult(match.id)} disabled={saving === match.id}
                      className="btn-primary text-xs py-1.5 px-3 shrink-0">
                      {saving === match.id ? '...' : 'Speichern'}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {tab === 'special' && (
        <div className="space-y-3">
          {questions.map(q => (
            <div key={q.id} className="card">
              <div className="font-medium mb-2">{q.question}</div>
              <div className="flex gap-2">
                <input
                  type={q.category === 'TOTAL_GOALS' ? 'number' : 'text'}
                  value={specialAnswers.get(q.id) ?? ''}
                  onChange={e => setSpecialAnswers(p => { const n = new Map(p); n.set(q.id, e.target.value); return n })}
                  className="input-field flex-1"
                  placeholder="Richtige Antwort eingeben..."
                />
                <button onClick={() => saveSpecialAnswer(q.id)} className="btn-primary text-sm px-4">
                  Speichern & Punkte vergeben
                </button>
              </div>
              {q.answer && <p className="text-xs text-pitch-600 dark:text-pitch-400 mt-1">✓ Gesetzt: {q.answer}</p>}
            </div>
          ))}
        </div>
      )}

      {tab === 'sync' && (
        <div className="card space-y-4">
          <h2 className="font-display text-xl font-bold">football-data.org Sync</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Synchronisiert alle Spiele und Teams der WM 2026 automatisch von der football-data.org API.
          </p>
          <button onClick={syncMatches} disabled={syncing} className="btn-primary px-6 py-3">
            {syncing ? '⟳ Synchronisiere...' : '⟳ Jetzt synchronisieren'}
          </button>
          {syncMsg && (
            <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded-lg text-sm font-mono">
              {syncMsg}
            </div>
          )}
          <div className="text-xs text-slate-500 mt-4 space-y-1">
            <p>📋 Automatischer Sync: täglich um 06:00 Uhr via Vercel Cron</p>
            <p>📋 Live-Updates: alle 5 Minuten während laufender Spiele</p>
          </div>
        </div>
      )}
    </div>
  )
}
