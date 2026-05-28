'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function ProfilPage() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.push('/auth'); return }
      setEmail(data.user.email ?? '')
      const { data: profile } = await supabase.from('profiles').select('username').eq('id', data.user.id).single()
      setUsername(profile?.username ?? '')
    })
  }, [])

  async function save() {
    setSaving(true)
    setMsg('')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { error } = await supabase.from('profiles').update({ username } as any).eq('id', user.id)
    setSaving(false)
    setMsg(error ? '❌ ' + error.message : '✅ Gespeichert')
  }

  return (
    <div className="animate-fade-in" style={{ maxWidth: 480, margin: '0 auto' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, marginBottom: 24 }}>PROFIL</h1>
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--pitch-muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>E-Mail</label>
          <input value={email} disabled className="input-field" style={{ opacity: 0.6 }} />
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--pitch-muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Benutzername</label>
          <input value={username} onChange={e => setUsername(e.target.value)} className="input-field" placeholder="deinname" />
        </div>
        {msg && <p style={{ fontSize: 13, color: msg.startsWith('✅') ? 'var(--pitch-green)' : '#ef4444', margin: 0 }}>{msg}</p>}
        <button onClick={save} disabled={saving} className="btn-primary" style={{ alignSelf: 'flex-start' }}>
          {saving ? 'Speichere...' : 'Speichern'}
        </button>
      </div>
    </div>
  )
}
