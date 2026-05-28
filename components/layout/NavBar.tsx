'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from './ThemeProvider'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'
import clsx from 'clsx'

const NAV_LINKS = [
  { href: '/dashboard', label: 'Dashboard', icon: '⚽' },
  { href: '/tipps', label: 'Meine Tipps', icon: '✏️' },
  { href: '/sondertipps', label: 'Sondertipps', icon: '🏆' },
  { href: '/rangliste', label: 'Rangliste', icon: '📊' },
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

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark')

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="font-display text-xl font-bold text-pitch-700 dark:text-pitch-400 tracking-wide">
          WM<span className="text-gold-500">2026</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={clsx(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                pathname.startsWith(link.href)
                  ? 'bg-pitch-100 dark:bg-pitch-900/40 text-pitch-800 dark:text-pitch-300'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              )}
            >
              {link.icon} {link.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-lg"
            aria-label="Theme wechseln"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          {user ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-sm font-medium"
              >
                <span className="w-6 h-6 rounded-full bg-pitch-500 text-white text-xs flex items-center justify-center">
                  {user.email?.[0].toUpperCase()}
                </span>
                <span className="hidden sm:inline">{user.email?.split('@')[0]}</span>
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-44 card py-1 z-50">
                  <Link href="/profil" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">👤 Profil</Link>
                  <Link href="/admin" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">⚙️ Admin</Link>
                  <button
                    onClick={async () => { await supabase.auth.signOut(); setMenuOpen(false) }}
                    className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                  >
                    🚪 Abmelden
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/auth" className="btn-primary text-sm py-1.5 px-3">Anmelden</Link>
          )}

          {/* Mobile menu toggle */}
          <button
            className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            ☰
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {menuOpen && (
        <nav className="md:hidden border-t border-slate-200 dark:border-slate-800 px-4 py-2 flex flex-col gap-1">
          {NAV_LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={clsx(
                'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                pathname.startsWith(link.href)
                  ? 'bg-pitch-100 dark:bg-pitch-900/40 text-pitch-800 dark:text-pitch-300'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              )}
            >
              {link.icon} {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  )
}
