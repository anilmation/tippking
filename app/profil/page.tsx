'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function ProfilPage() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [userId, setUserId] = useState<string | null>(null)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.push('/auth'); return }
      setEmail(data.user.email ?? '')
      setUserId(data.user.id)
      const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', data.user.id)
        .single()
      if (profile?.username) setUsername(profile.username)
    })
  }, [])

  async function save() {
    if (!userId || !username.trim()) return
    setSaving(true)
    setMsg('')
    const { error } = await supabase
      .from('profiles')
      .update({ username: username.trim() } as any)
      .eq('id', userId)
    setSaving(false)
    if (error) {
      setMsg('❌ ' + error.message)
    } else {
      setMsg('✅ Gespeichert')
      // Reload to reflect changes in navbar
      window.location.reload()
    }
  }

  return (
    <div className="animate-fade-in" style={{ maxWidth: 480, margin: '0 auto' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, marginBottom: 24 }}>PROFIL</h1>
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--pitch-muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>E-Mail</label>
          <input value={email} disabled className="input-field" style={{ opacity: 0.5, cursor: 'not-allowed' }} />
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--pitch-muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Benutzername</label>
          <input
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="input-field"
            placeholder="deinname"
            minLength={3}
            maxLength={20}
            onKeyDown={e => e.key === 'Enter' && save()}
          />
          <p style={{ fontSize: 11, color: 'var(--pitch-muted)', marginTop: 4 }}>3–20 Zeichen, wird in der Rangliste angezeigt</p>
        </div>
        {msg && (
          <p style={{ fontSize: 13, color: msg.startsWith('✅') ? 'var(--pitch-green)' : '#ef4444', margin: 0 }}>{msg}</p>
        )}
        <button onClick={save} disabled={saving || !username.trim()} className="btn-primary" style={{ alignSelf: 'flex-start' }}>
          {saving ? 'Speichere...' : 'Speichern'}
        </button>
      </div>
    </div>
  )
}
