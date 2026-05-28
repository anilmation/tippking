'use client'
import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const PRESET_AVATARS = [
  { id: 'crown',   emoji: '👑', bg: '#15803d' },
  { id: 'ball',    emoji: '⚽', bg: '#1d4ed8' },
  { id: 'trophy',  emoji: '🏆', bg: '#b45309' },
  { id: 'lion',    emoji: '🦁', bg: '#7c3aed' },
  { id: 'fire',    emoji: '🔥', bg: '#dc2626' },
  { id: 'eagle',   emoji: '🦅', bg: '#0369a1' },
  { id: 'star',    emoji: '⭐', bg: '#ca8a04' },
  { id: 'rocket',  emoji: '🚀', bg: '#0f766e' },
  { id: 'wolf',    emoji: '🐺', bg: '#4b5563' },
  { id: 'thunder', emoji: '⚡', bg: '#a16207' },
  { id: 'shield',  emoji: '🛡️', bg: '#1e3a5f' },
  { id: 'fist',    emoji: '✊', bg: '#991b1b' },
]

export default function ProfilPage() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [presetId, setPresetId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [msg, setMsg] = useState('')
  const [userId, setUserId] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.push('/auth'); return }
      setEmail(data.user.email ?? '')
      setUserId(data.user.id)
      const { data: profile } = await supabase
        .from('profiles').select('username, avatar_url').eq('id', data.user.id).single()
      if (profile?.username) setUsername(profile.username)
      if (profile?.avatar_url) {
        setAvatarUrl(profile.avatar_url)
        // Detect if it's a preset
        const preset = PRESET_AVATARS.find(p => profile.avatar_url === `preset:${p.id}`)
        if (preset) setPresetId(preset.id)
      }
    })
  }, [])

  function getAvatarDisplay(url: string | null, uname: string) {
    if (!url) return { type: 'initial', value: uname[0]?.toUpperCase() ?? '?', bg: '#15803d' }
    if (url.startsWith('preset:')) {
      const preset = PRESET_AVATARS.find(p => p.id === url.replace('preset:', ''))
      if (preset) return { type: 'emoji', value: preset.emoji, bg: preset.bg }
    }
    return { type: 'image', value: url, bg: '#15803d' }
  }

  async function selectPreset(preset: typeof PRESET_AVATARS[0]) {
    setPresetId(preset.id)
    setAvatarUrl(`preset:${preset.id}`)
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !userId) return
    if (file.size > 2 * 1024 * 1024) { setMsg('❌ Bild max. 2MB'); return }
    setUploading(true)
    setMsg('')
    const ext = file.name.split('.').pop()
    const path = `${userId}/avatar.${ext}`
    const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
    if (error) { setMsg('❌ Upload fehlgeschlagen: ' + error.message); setUploading(false); return }
    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
    setAvatarUrl(publicUrl + '?t=' + Date.now())
    setPresetId(null)
    setUploading(false)
    setMsg('✅ Bild hochgeladen — jetzt speichern')
  }

  async function save() {
    if (!userId || !username.trim()) return
    setSaving(true)
    setMsg('')
    const { error } = await supabase.from('profiles').update({
      username: username.trim(),
      avatar_url: avatarUrl,
    } as any).eq('id', userId)
    setSaving(false)
    if (error) { setMsg('❌ ' + error.message) }
    else { setMsg('✅ Gespeichert'); setTimeout(() => window.location.reload(), 800) }
  }

  const avatar = getAvatarDisplay(avatarUrl, username)

  return (
    <div className="animate-fade-in" style={{ maxWidth: 520, margin: '0 auto' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, marginBottom: 24 }}>PROFIL</h1>

      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Avatar preview */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: avatar.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: avatar.type === 'emoji' ? 32 : 28, fontWeight: 700, color: '#fff',
            overflow: 'hidden', flexShrink: 0, border: '2px solid var(--pitch-border)',
          }}>
            {avatar.type === 'image'
              ? <img src={avatar.value} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : avatar.value
            }
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 15 }}>{username || 'Dein Name'}</div>
            <div style={{ fontSize: 12, color: 'var(--pitch-muted)', marginTop: 2 }}>{email}</div>
          </div>
        </div>

        {/* Preset avatars */}
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--pitch-muted)', display: 'block', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Avatar wählen</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8 }}>
            {PRESET_AVATARS.map(p => (
              <button
                key={p.id}
                onClick={() => selectPreset(p)}
                style={{
                  width: '100%', aspectRatio: '1', borderRadius: '50%',
                  background: p.bg, border: presetId === p.id ? '3px solid var(--pitch-green)' : '3px solid transparent',
                  fontSize: 22, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.15s', transform: presetId === p.id ? 'scale(1.1)' : 'scale(1)',
                }}
                title={p.emoji}
              >
                {p.emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Upload */}
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--pitch-muted)', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Eigenes Bild hochladen</label>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleUpload} style={{ display: 'none' }} />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            style={{
              padding: '8px 16px', borderRadius: 8, border: '1px dashed var(--pitch-border)',
              background: 'transparent', color: 'var(--pitch-muted)', fontSize: 13,
              cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'all 0.15s',
            }}
          >
            {uploading ? '⏳ Lädt hoch...' : '📁 Bild auswählen (max. 2MB)'}
          </button>
        </div>

        {/* Username */}
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
          <p style={{ fontSize: 11, color: 'var(--pitch-muted)', marginTop: 4 }}>3–20 Zeichen, erscheint in der Rangliste</p>
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
