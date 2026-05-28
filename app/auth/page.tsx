'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'signup' | 'magic'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      if (mode === 'magic') {
        const { error } = await supabase.auth.signInWithOtp({ email })
        if (error) throw error
        setMessage('✅ Magic Link gesendet! Prüfe deine E-Mail.')
      } else if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { data: { username } }
        })
        if (error) throw error
        // Update username in profile
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          await supabase.from('profiles').update({ username }).eq('id', user.id)
        }
        setMessage('✅ Account erstellt! Bitte bestätige deine E-Mail.')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        router.push('/dashboard')
        router.refresh()
      }
    } catch (err: any) {
      setMessage('❌ ' + (err.message ?? 'Fehler aufgetreten'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-8 animate-slide-up">
      <div className="card">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">⚽</div>
          <h1 className="font-display text-3xl font-bold">WM 2026 Tippspiel</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Melde dich an oder erstelle einen Account</p>
        </div>

        {/* Mode Tabs */}
        <div className="flex gap-1 bg-slate-100 dark:bg-slate-700 rounded-lg p-1 mb-6">
          {[
            { key: 'login', label: 'Anmelden' },
            { key: 'signup', label: 'Registrieren' },
            { key: 'magic', label: 'Magic Link' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setMode(tab.key as any)}
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${
                mode === tab.key
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-medium mb-1">Benutzername</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="input-field w-full"
                placeholder="deinname"
                required
                minLength={3}
                maxLength={20}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">E-Mail</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="input-field w-full"
              placeholder="mail@example.com"
              required
            />
          </div>

          {mode !== 'magic' && (
            <div>
              <label className="block text-sm font-medium mb-1">Passwort</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="input-field w-full"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>
          )}

          {message && (
            <div className={`text-sm p-3 rounded-lg ${message.startsWith('✅') ? 'bg-pitch-50 dark:bg-pitch-900/20 text-pitch-700 dark:text-pitch-300' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'}`}>
              {message}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full py-3">
            {loading ? 'Bitte warten...' : mode === 'login' ? 'Anmelden' : mode === 'signup' ? 'Account erstellen' : 'Magic Link senden'}
          </button>
        </form>
      </div>
    </div>
  )
}
