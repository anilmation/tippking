'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from './ThemeProvider'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'
import clsx from 'clsx'

const NAV_LINKS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/tipps', label: 'Tipps' },
  { href: '/sondertipps', label: 'Sondertipps' },
  { href: '/rangliste', label: 'Rangliste' },
]

export function NavBar() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [user, setUser] = useState<User | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: sub } = supabase.auth.onAuthStateChange((_, session) => setUser(session?.user ?? null))
    return () => sub.subscription.unsubscribe()
  }, [])

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: 'var(--pitch-surface)',
      borderBottom: '1px solid var(--pitch-border)',
      backdropFilter: 'blur(8px)',
    }}>
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 16px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>

        {/* Logo */}
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, letterSpacing: '0.04em', color: 'var(--pitch-text)' }}>
            TIPP<span style={{ color: 'var(--pitch-green)' }}>KING</span>
            <span style={{ color: 'var(--pitch-muted)', fontSize: 13, marginLeft: 6, fontWeight: 400 }}>WM 2026</span>
          </span>
          <span style={{ fontSize: 9, color: 'var(--pitch-muted)', letterSpacing: '0.06em', marginTop: 1 }}>vibecoded by Anil</span>
        </Link>

        {/* Desktop Nav */}
        <nav style={{ display: 'flex', gap: 4, alignItems: 'center' }} className="hidden-mobile">
          {NAV_LINKS.map(link => (
            <Link key={link.href} href={link.href} style={{ textDecoration: 'none' }}>
              <span style={{
                padding: '6px 12px', borderRadius: 8, fontSize: 13, fontWeight: 500,
                transition: 'all 0.15s',
                background: pathname.startsWith(link.href) ? 'rgba(22,163,74,0.12)' : 'transparent',
                color: pathname.startsWith(link.href) ? 'var(--pitch-green)' : 'var(--pitch-muted)',
                display: 'block',
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
                <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--pitch-green)', color: '#fff', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {user.email?.[0].toUpperCase()}
                </span>
                <span className="hidden-mobile">{user.email?.split('@')[0]}</span>
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
            <Link href="/auth">
              <span className="btn-primary" style={{ fontSize: 13, padding: '7px 14px' }}>Anmelden</span>
            </Link>
          )}

          <button className="show-mobile" onClick={() => setMenuOpen(!menuOpen)}
            style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid var(--pitch-border)', background: 'var(--pitch-bg)', cursor: 'pointer', fontSize: 18 }}>
            ☰
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {menuOpen && (
        <nav className="show-mobile" style={{ borderTop: '1px solid var(--pitch-border)', padding: '8px 16px 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
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
        @media (min-width: 640px) { .hidden-mobile { display: flex !important; } .show-mobile { display: none !important; } }
        @media (max-width: 639px) { .hidden-mobile { display: none !important; } .show-mobile { display: flex !important; } }
      `}</style>
    </header>
  )
}
