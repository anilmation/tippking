'use client'
import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import { format, isBefore } from 'date-fns'
import { de } from 'date-fns/locale'
import type { SpecialQuestion, SpecialTip } from '@/lib/types'
import { COUNTRIES } from '@/lib/countries'
import { useRouter } from 'next/navigation'

const CATEGORY_ICONS: Record<string, string> = {
  WINNER: '🥇', RUNNER_UP: '🥈', THIRD: '🥉',
  TOP_SCORER: '⚽', TOTAL_GOALS: '🔢', CUSTOM: '❓'
}
const CATEGORY_LABELS: Record<string, string> = {
  WINNER: 'Weltmeister', RUNNER_UP: 'Vize-Weltmeister', THIRD: 'Platz 3',
  TOP_SCORER: 'Torschützenkönig', TOTAL_GOALS: 'Gesamttore', CUSTOM: 'Sonderfrage'
}

// All WM 2026 teams as selectable options
const TEAM_OPTIONS = Object.entries(COUNTRIES)
  .filter(([code]) => !code.startsWith('W_') && !code.startsWith('RU_') && !code.startsWith('L_'))
  .map(([code, { name, flag }]) => ({ code, name, flag }))
  .sort((a, b) => a.name.localeCompare(b.name, 'de'))

function CountrySelect({
  value, onChange, placeholder
}: {
  value: string
  onChange: (val: string) => void
  placeholder?: string
}) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const selected = TEAM_OPTIONS.find(t => t.name === value)
  const filtered = query
    ? TEAM_OPTIONS.filter(t => t.name.toLowerCase().includes(query.toLowerCase()))
    : TEAM_OPTIONS

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div ref={ref} style={{ position: 'relative', flex: 1 }}>
      <div
        onClick={() => { setOpen(!open); setQuery('') }}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '9px 12px', borderRadius: 8, cursor: 'pointer',
          background: 'var(--pitch-bg)', border: '1px solid var(--pitch-border)',
          minHeight: 42, transition: 'border-color 0.15s',
          borderColor: open ? 'var(--pitch-green)' : 'var(--pitch-border)',
        }}
      >
        {selected ? (
          <>
            <img src={`https://flagcdn.com/24x18/${selected.flag}.png`} alt="" width={20} height={15} style={{ borderRadius: 2, objectFit: 'cover' }} />
            <span style={{ fontSize: 14, color: 'var(--pitch-text)', fontWeight: 500 }}>{selected.name}</span>
          </>
        ) : (
          <span style={{ fontSize: 14, color: 'var(--pitch-muted)' }}>{placeholder ?? 'Land auswählen...'}</span>
        )}
        <span style={{ marginLeft: 'auto', color: 'var(--pitch-muted)', fontSize: 12 }}>{open ? '▲' : '▼'}</span>
      </div>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 100,
          background: 'var(--pitch-surface)', border: '1px solid var(--pitch-border)',
          borderRadius: 10, overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
        }}>
          {/* Search */}
          <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--pitch-border)' }}>
            <input
              autoFocus
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Suchen..."
              style={{
                width: '100%', padding: '7px 10px', borderRadius: 6, fontSize: 13,
                background: 'var(--pitch-bg)', border: '1px solid var(--pitch-border)',
                color: 'var(--pitch-text)', fontFamily: 'var(--font-body)', outline: 'none',
              }}
            />
          </div>
          {/* Options */}
          <div style={{ maxHeight: 240, overflowY: 'auto' }}>
            {filtered.length === 0 ? (
              <div style={{ padding: '12px 14px', fontSize: 13, color: 'var(--pitch-muted)' }}>Kein Land gefunden</div>
            ) : filtered.map(t => (
              <div
                key={t.code}
                onClick={() => { onChange(t.name); setOpen(false); setQuery('') }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '9px 14px', cursor: 'pointer', transition: 'background 0.1s',
                  background: value === t.name ? 'rgba(22,163,74,0.1)' : 'transparent',
                  borderLeft: value === t.name ? '3px solid var(--pitch-green)' : '3px solid transparent',
                }}
                onMouseEnter={e => { if (value !== t.name) (e.currentTarget as HTMLElement).style.background = 'var(--pitch-bg)' }}
                onMouseLeave={e => { if (value !== t.name) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
              >
                <img src={`https://flagcdn.com/24x18/${t.flag}.png`} alt="" width={20} height={15} style={{ borderRadius: 2, objectFit: 'cover', flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: value === t.name ? 'var(--pitch-green)' : 'var(--pitch-text)', fontWeight: value === t.name ? 600 : 400 }}>{t.name}</span>
                {value === t.name && <span style={{ marginLeft: 'auto', color: 'var(--pitch-green)', fontSize: 14 }}>✓</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function SondertippsPage() {
  const [questions, setQuestions] = useState<SpecialQuestion[]>([])
  const [myTips, setMyTips] = useState<Map<number, SpecialTip>>(new Map())
  const [pending, setPending] = useState<Map<number, string>>(new Map())
  const [saving, setSaving] = useState<number | null>(null)
  const [saved, setSaved] = useState<number | null>(null)
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
    const { data: qData } = await supabase.from('special_questions').select('*').order('id')
    const { data: tData } = await supabase.from('special_tips').select('*').eq('user_id', userId)
    setQuestions(qData ?? [])
    const tipsMap = new Map(tData?.map((t: any) => [t.question_id, t]) ?? [])
    setMyTips(tipsMap)
    const p = new Map<number, string>()
    tData?.forEach((t: any) => p.set(t.question_id, t.answer))
    setPending(p)
  }

  async function saveTip(questionId: number) {
    const answer = pending.get(questionId)?.trim()
    if (!answer || !userId) return
    setSaving(questionId)
    const existing = myTips.get(questionId)
    if (existing) {
      await supabase.from('special_tips').update({ answer } as any).eq('id', existing.id)
    } else {
      await supabase.from('special_tips').insert({ user_id: userId, question_id: questionId, answer } as any)
    }
    // Update local state
    const { data: newTip } = await supabase.from('special_tips').select('*').eq('user_id', userId).eq('question_id', questionId).single()
    if (newTip) setMyTips(prev => { const n = new Map(prev); n.set(questionId, newTip); return n })
    setSaving(null)
    setSaved(questionId)
    setTimeout(() => setSaved(null), 2000)
  }

  const now = new Date()
  const totalPossible = questions.reduce((sum, q) => sum + q.points_value, 0)

  const isCountryQuestion = (q: SpecialQuestion) =>
    ['WINNER', 'RUNNER_UP', 'THIRD', 'CUSTOM'].includes(q.category)

  return (
    <div className="animate-fade-in" style={{ maxWidth: 720, margin: '0 auto' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700, marginBottom: 4 }}>SONDERTIPPS</h1>
      <p style={{ color: 'var(--pitch-muted)', fontSize: 13, marginBottom: 24 }}>
        Bis zu <strong style={{ color: '#ca8a04' }}>{totalPossible} Extrapunkte</strong> zu vergeben
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {questions.map(q => {
          const deadline = new Date(q.deadline)
          const isLocked = !q.is_open || isBefore(deadline, now)
          const myTip = myTips.get(q.id)
          const currentAnswer = pending.get(q.id) ?? ''
          const hasChanges = myTip ? myTip.answer !== currentAnswer : currentAnswer !== ''
          const isCountry = isCountryQuestion(q)

          return (
            <div key={q.id} className="card" style={{
              borderLeft: myTip?.answer && q.answer && myTip.answer === q.answer
                ? '3px solid var(--pitch-green)'
                : myTip ? '3px solid var(--pitch-border)' : '3px solid transparent'
            }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ fontSize: 28, flexShrink: 0, marginTop: 2 }}>{CATEGORY_ICONS[q.category]}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* Header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 999, background: 'rgba(202,138,4,0.15)', color: '#ca8a04', letterSpacing: '0.04em' }}>
                      {CATEGORY_LABELS[q.category]}
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--pitch-muted)' }}>
                      {q.points_value} Punkte · Deadline: {format(deadline, "dd. MMM yyyy", { locale: de })}
                    </span>
                    {isLocked && <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 999, background: 'var(--pitch-bg)', border: '1px solid var(--pitch-border)', color: 'var(--pitch-muted)' }}>🔒 Gesperrt</span>}
                  </div>

                  <h3 style={{ fontWeight: 600, fontSize: 15, marginBottom: 12, color: 'var(--pitch-text)' }}>{q.question}</h3>

                  {/* Answer revealed */}
                  {q.answer ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <div style={{ fontSize: 13 }}>
                        <span style={{ color: 'var(--pitch-muted)' }}>Richtige Antwort: </span>
                        <strong style={{ color: 'var(--pitch-green)' }}>{q.answer}</strong>
                      </div>
                      {myTip && (
                        <div style={{ fontSize: 13 }}>
                          <span style={{ color: 'var(--pitch-muted)' }}>Dein Tipp: </span>
                          <strong>{myTip.answer}</strong>
                          {myTip.answer.toLowerCase() === q.answer.toLowerCase()
                            ? <span style={{ marginLeft: 8, color: 'var(--pitch-green)', fontWeight: 700 }}>+{q.points_value} Punkte ✓</span>
                            : <span style={{ marginLeft: 8, color: '#ef4444' }}>+0 Punkte</span>
                          }
                        </div>
                      )}
                    </div>
                  ) : isLocked ? (
                    <div style={{ fontSize: 13, color: 'var(--pitch-muted)' }}>
                      {myTip
                        ? <span>Dein Tipp: <strong style={{ color: 'var(--pitch-text)' }}>{myTip.answer}</strong></span>
                        : 'Kein Tipp abgegeben'}
                    </div>
                  ) : (
                    /* Input */
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      {isCountry ? (
                        <CountrySelect
                          value={currentAnswer}
                          onChange={val => setPending(prev => { const n = new Map(prev); n.set(q.id, val); return n })}
                          placeholder="Land auswählen..."
                        />
                      ) : (
                        <input
                          type="number"
                          value={currentAnswer}
                          onChange={e => setPending(prev => { const n = new Map(prev); n.set(q.id, e.target.value); return n })}
                          className="input-field"
                          placeholder="z.B. 164"
                          style={{ maxWidth: 140 }}
                        />
                      )}
                      {saved === q.id ? (
                        <span style={{ fontSize: 13, color: 'var(--pitch-green)', fontWeight: 600, flexShrink: 0 }}>✓ Gespeichert</span>
                      ) : (
                        <button
                          onClick={() => saveTip(q.id)}
                          disabled={saving === q.id || !currentAnswer.trim()}
                          className="btn-primary"
                          style={{ fontSize: 13, padding: '8px 16px', flexShrink: 0 }}
                        >
                          {saving === q.id ? '...' : myTip ? 'Aktualisieren' : 'Speichern'}
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
