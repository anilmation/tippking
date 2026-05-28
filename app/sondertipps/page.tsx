'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { format, isBefore } from 'date-fns'
import { de } from 'date-fns/locale'
import type { SpecialQuestion, SpecialTip } from '@/lib/types'
import { useRouter } from 'next/navigation'
import clsx from 'clsx'

const CATEGORY_ICONS: Record<string, string> = {
  WINNER: '🥇', RUNNER_UP: '🥈', THIRD: '🥉',
  TOP_SCORER: '⚽', TOTAL_GOALS: '🔢', CUSTOM: '❓'
}
const CATEGORY_LABELS: Record<string, string> = {
  WINNER: 'Weltmeister', RUNNER_UP: 'Vize-Weltmeister', THIRD: 'Platz 3',
  TOP_SCORER: 'Torschützenkönig', TOTAL_GOALS: 'Gesamttore', CUSTOM: 'Sonderfrage'
}

export default function SondertippsPage() {
  const [questions, setQuestions] = useState<SpecialQuestion[]>([])
  const [myTips, setMyTips] = useState<Map<number, SpecialTip>>(new Map())
  const [pending, setPending] = useState<Map<number, string>>(new Map())
  const [saving, setSaving] = useState<number | null>(null)
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
    const { data: qData } = await supabase
      .from('special_questions').select('*').order('id')
    const { data: tData } = await supabase
      .from('special_tips').select('*').eq('user_id', userId)

    setQuestions(qData ?? [])
    const tipsMap = new Map(tData?.map(t => [t.question_id, t]) ?? [])
    setMyTips(tipsMap)
    const p = new Map<number, string>()
    tData?.forEach(t => p.set(t.question_id, t.answer))
    setPending(p)
  }

  async function saveTip(questionId: number) {
    const answer = pending.get(questionId)?.trim()
    if (!answer || !userId) return
    setSaving(questionId)

    const existing = myTips.get(questionId)
    if (existing) {
      await supabase.from('special_tips').update({ answer }).eq('id', existing.id)
    } else {
      await supabase.from('special_tips').insert({ user_id: userId, question_id: questionId, answer })
    }
    await loadData()
    setSaving(null)
  }

  const now = new Date()
  const totalPossible = questions.reduce((sum, q) => sum + q.points_value, 0)
  const myPossible = [...myTips.values()].reduce((sum, t) => sum + (t.points ?? 0), 0)

  return (
    <div className="animate-fade-in space-y-4">
      <div>
        <h1 className="font-display text-3xl font-bold">Sondertipps</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Bis zu <strong className="text-gold-500">{totalPossible} Extrapunkte</strong> zu vergeben
        </p>
      </div>

      <div className="grid gap-4">
        {questions.map(q => {
          const deadline = new Date(q.deadline)
          const isLocked = !q.is_open || isBefore(deadline, now)
          const myTip = myTips.get(q.id)
          const currentAnswer = pending.get(q.id) ?? ''
          const hasChanges = myTip ? myTip.answer !== currentAnswer : currentAnswer !== ''

          return (
            <div key={q.id} className={clsx(
              'card',
              q.answer && myTip?.answer === q.answer && 'border-pitch-400 dark:border-pitch-600'
            )}>
              <div className="flex items-start gap-3">
                <div className="text-3xl">{CATEGORY_ICONS[q.category]}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className="text-xs font-semibold px-2 py-0.5 bg-gold-100 dark:bg-gold-900/30 text-gold-700 dark:text-gold-400 rounded-full">
                      {CATEGORY_LABELS[q.category]}
                    </span>
                    <span className="text-xs text-slate-500">
                      {q.points_value} Punkte · Deadline: {format(deadline, "dd. MMM yyyy", { locale: de })}
                    </span>
                    {isLocked && <span className="text-xs px-2 py-0.5 bg-slate-200 dark:bg-slate-700 rounded-full text-slate-500">Gesperrt</span>}
                  </div>

                  <h3 className="font-semibold mb-3">{q.question}</h3>

                  {q.answer ? (
                    <div className="space-y-1">
                      <div className="text-sm">
                        <span className="text-slate-500">Richtige Antwort: </span>
                        <strong className="text-pitch-600 dark:text-pitch-400">{q.answer}</strong>
                      </div>
                      {myTip && (
                        <div className="text-sm">
                          <span className="text-slate-500">Dein Tipp: </span>
                          <strong>{myTip.answer}</strong>
                          {myTip.answer === q.answer
                            ? <span className="ml-2 text-pitch-500 font-bold">+{q.points_value} Punkte ✓</span>
                            : <span className="ml-2 text-red-400">+0 Punkte</span>
                          }
                        </div>
                      )}
                    </div>
                  ) : isLocked ? (
                    <div className="text-sm text-slate-500">
                      {myTip ? <>Dein Tipp: <strong>{myTip.answer}</strong></> : 'Kein Tipp abgegeben'}
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type={q.category === 'TOTAL_GOALS' ? 'number' : 'text'}
                        value={currentAnswer}
                        onChange={e => setPending(prev => { const n = new Map(prev); n.set(q.id, e.target.value); return n })}
                        className="input-field flex-1"
                        placeholder={
                          q.category === 'WINNER' ? 'z.B. Brasilien' :
                          q.category === 'TOP_SCORER' ? 'z.B. Mbappé' :
                          q.category === 'TOTAL_GOALS' ? 'z.B. 164' : 'Deine Antwort'
                        }
                      />
                      {hasChanges && (
                        <button
                          onClick={() => saveTip(q.id)}
                          disabled={saving === q.id}
                          className="btn-primary text-sm px-4 shrink-0"
                        >
                          {saving === q.id ? '...' : 'Speichern'}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
