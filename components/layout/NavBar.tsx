'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from './ThemeProvider'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

const NAV_LINKS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/tipps', label: 'Tipps' },
  { href: '/sondertipps', label: 'Sondertipps' },
  { href: '/rangliste', label: 'Rangliste' },
  { href: '/regeln', label: 'Regeln' },
]

export function NavBar() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [user, setUser] = useState<User | null>(null)
  const [username, setUsername] = useState<string>('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  function getAvatarDisplay(url: string | null, name: string) {
    if (!url) return { type: 'initial', value: name[0]?.toUpperCase() ?? '?', bg: '#15803d' }
    if (url.startsWith('preset:')) {
      const presets: Record<string, { emoji: string; bg: string }> = {
        crown: { emoji: '👑', bg: '#15803d' }, ball: { emoji: '⚽', bg: '#1d4ed8' },
        trophy: { emoji: '🏆', bg: '#b45309' }, lion: { emoji: '🦁', bg: '#7c3aed' },
        fire: { emoji: '🔥', bg: '#dc2626' }, eagle: { emoji: '🦅', bg: '#0369a1' },
        star: { emoji: '⭐', bg: '#ca8a04' }, rocket: { emoji: '🚀', bg: '#0f766e' },
        wolf: { emoji: '🐺', bg: '#4b5563' }, thunder: { emoji: '⚡', bg: '#a16207' },
        shield: { emoji: '🛡️', bg: '#1e3a5f' }, fist: { emoji: '✊', bg: '#991b1b' },
      }
      const p = presets[url.replace('preset:', '')]
      if (p) return { type: 'emoji', value: p.emoji, bg: p.bg }
    }
    return { type: 'image', value: url, bg: '#15803d' }
  }
  const [menuOpen, setMenuOpen] = useState(false)
  const supabase = createClient()

  async function loadProfile(uid: string) {
    const { data } = await supabase.from('profiles').select('username, avatar_url').eq('id', uid).single()
    if (data?.username) setUsername(data.username)
    if (data?.avatar_url) setAvatarUrl(data.avatar_url)
  }

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      if (data.user) loadProfile(data.user.id)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
      if (session?.user) loadProfile(session.user.id)
      else setUsername('')
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  const displayName = username || user?.email?.split('@')[0] || ''

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: 'var(--pitch-surface)',
      borderBottom: '1px solid var(--pitch-border)',
    }}>
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 16px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>

        {/* Logo */}
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, letterSpacing: '0.04em', color: 'var(--pitch-text)' }}>
            TIPP<span style={{ color: 'var(--pitch-green)' }}>KING</span>
            <span style={{ color: 'var(--pitch-muted)', fontSize: 13, marginLeft: 6, fontWeight: 400 }}>WM 2026</span>
          </span>
          <span style={{ fontSize: 9, color: 'var(--pitch-muted)', letterSpacing: '0.06em', marginTop: 1, opacity: 0.7 }}>vibecoded by Anil</span>
        </Link>

        {/* Desktop Nav */}
        <nav style={{ display: 'flex', gap: 4, alignItems: 'center' }} className="nav-desktop">
          {NAV_LINKS.map(link => (
            <Link key={link.href} href={link.href} style={{ textDecoration: 'none' }}>
              <span style={{
                padding: '6px 12px', borderRadius: 8, fontSize: 13, fontWeight: 500,
                transition: 'all 0.15s', display: 'block',
                background: pathname.startsWith(link.href) ? 'rgba(22,163,74,0.12)' : 'transparent',
                color: pathname.startsWith(link.href) ? 'var(--pitch-green)' : 'var(--pitch-muted)',
              }}>
                {link.label}
              </span>
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid var(--pitch-border)', background: 'var(--pitch-bg)', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            aria-label="Theme wechseln"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          {user ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 10px', borderRadius: 8, border: '1px solid var(--pitch-border)', background: 'var(--pitch-bg)', cursor: 'pointer', color: 'var(--pitch-text)', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 500 }}
              >
                {(() => {
                  const av = getAvatarDisplay(avatarUrl, displayName)
                  return (
                    <span style={{ width: 26, height: 26, borderRadius: '50%', background: av.bg, color: '#fff', fontSize: av.type === 'emoji' ? 14 : 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                      {av.type === 'image' ? <img src={av.value} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : av.value}
                    </span>
                  )
                })()}
                <span className="nav-username">{displayName}</span>
              </button>
              {menuOpen && (
                <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', width: 160, background: 'var(--pitch-surface)', border: '1px solid var(--pitch-border)', borderRadius: 10, padding: 6, zIndex: 100 }}>
                  <Link href="/profil" onClick={() => setMenuOpen(false)} style={{ display: 'block', padding: '7px 10px', borderRadius: 6, fontSize: 13, color: 'var(--pitch-text)', textDecoration: 'none' }}>👤 Profil</Link>
                  <Link href="/admin" onClick={() => setMenuOpen(false)} style={{ display: 'block', padding: '7px 10px', borderRadius: 6, fontSize: 13, color: 'var(--pitch-text)', textDecoration: 'none' }}>⚙️ Admin</Link>
                  <button onClick={async () => { await supabase.auth.signOut(); setMenuOpen(false) }}
                    style={{ width: '100%', textAlign: 'left', padding: '7px 10px', borderRadius: 6, fontSize: 13, color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                    🚪 Abmelden
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/auth" style={{ textDecoration: 'none' }}>
              <span className="btn-primary" style={{ fontSize: 13, padding: '7px 14px' }}>Anmelden</span>
            </Link>
          )}

          <button className="nav-hamburger" onClick={() => setMenuOpen(!menuOpen)}
            style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid var(--pitch-border)', background: 'var(--pitch-bg)', cursor: 'pointer', fontSize: 18, display: 'none' }}>
            ☰
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {menuOpen && (
        <nav className="nav-mobile" style={{ borderTop: '1px solid var(--pitch-border)', padding: '8px 16px 12px', flexDirection: 'column', gap: 2, display: 'none' }}>
          {NAV_LINKS.map(link => (
            <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)} style={{ textDecoration: 'none' }}>
              <span style={{
                display: 'block', padding: '8px 12px', borderRadius: 8, fontSize: 14, fontWeight: 500,
                background: pathname.startsWith(link.href) ? 'rgba(22,163,74,0.12)' : 'transparent',
                color: pathname.startsWith(link.href) ? 'var(--pitch-green)' : 'var(--pitch-muted)',
              }}>{link.label}</span>
            </Link>
          ))}
        </nav>
      )}

      <style>{`
        @media (min-width: 640px) {
          .nav-desktop { display: flex !important; }
          .nav-hamburger { display: none !important; }
          .nav-username { display: inline !important; }
        }
        @media (max-width: 639px) {
          .nav-desktop { display: none !important; }
          .nav-hamburger { display: flex !important; }
          .nav-username { display: none !important; }
          .nav-mobile { display: flex !important; }
        }
      `}</style>
    </header>
  )
}
