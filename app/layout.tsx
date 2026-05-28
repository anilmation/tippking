import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/layout/ThemeProvider'
import { NavBar } from '@/components/layout/NavBar'

export const metadata: Metadata = {
  title: 'WM 2026 Tippspiel',
  description: 'Das offizielle WM 2026 Tippspiel für Freunde und Familie',
  icons: { icon: '/favicon.ico' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" suppressHydrationWarning>
      <body className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
        <ThemeProvider>
          <NavBar />
          <main className="max-w-5xl mx-auto px-4 pb-16 pt-4">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  )
}
