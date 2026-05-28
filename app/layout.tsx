import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/layout/ThemeProvider'
import { NavBar } from '@/components/layout/NavBar'

export const metadata: Metadata = {
  title: 'TippKing – WM 2026',
  description: 'Das TippKing WM 2026 Tippspiel für Freunde und Familie',
  icons: { icon: '/favicon.ico' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" suppressHydrationWarning style={{ background: '#080808' }}>
      <body style={{ minHeight: '100vh', background: 'var(--pitch-bg)', color: 'var(--pitch-text)', transition: 'background 0.2s, color 0.2s' }}>
        <ThemeProvider>
          <NavBar />
          <main style={{ maxWidth: 960, margin: '0 auto', padding: '16px 16px 64px' }}>
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  )
}
