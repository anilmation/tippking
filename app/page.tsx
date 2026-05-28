import Link from 'next/link'
import { POINT_SYSTEM } from '@/lib/points'

export default function HomePage() {
  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="text-center py-16 px-4">
        <div className="text-6xl mb-4">⚽</div>
        <h1 className="font-display text-5xl md:text-7xl font-bold text-pitch-700 dark:text-pitch-400 mb-2">
          WM 2026
        </h1>
        <p className="font-display text-2xl text-gold-500 mb-6 tracking-wide">TIPPSPIEL</p>
        <p className="text-slate-500 dark:text-slate-400 text-lg max-w-xl mx-auto mb-8">
          Tippe alle Spiele der FIFA Weltmeisterschaft 2026 und miss dich mit Freunden und Familie.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link href="/auth" className="btn-primary text-base px-6 py-3">
            Jetzt mitmachen →
          </Link>
          <Link href="/rangliste" className="btn-secondary text-base px-6 py-3">
            Rangliste ansehen
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-12">
        {[
          { icon: '⚽', title: 'Alle Spiele', desc: 'Tippe alle Gruppenspiele und K.O.-Runden – automatisch aktualisiert' },
          { icon: '🏆', title: 'Sondertipps', desc: 'Weltmeister, Torschützenkönig, Gesamttore und mehr' },
          { icon: '📊', title: 'Rangliste', desc: 'Echtzeit-Rangliste mit Punktestand aller Teilnehmer' },
          { icon: '🎯', title: 'Punktesystem', desc: 'Bis zu 4 Punkte pro Spiel – Bonuspunkte für Sondertipps' },
          { icon: '🌙', title: 'Light & Dark', desc: 'Automatischer Dark Mode – sieht gut aus, egal wann du tippst' },
          { icon: '📱', title: 'Responsive', desc: 'Perfekt auf Handy, Tablet und Desktop' },
        ].map(f => (
          <div key={f.title} className="card hover:shadow-md transition-shadow">
            <div className="text-3xl mb-2">{f.icon}</div>
            <h3 className="font-display text-lg font-semibold mb-1">{f.title}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* Punktesystem */}
      <section className="card mb-8">
        <h2 className="font-display text-2xl font-bold mb-4">Punktesystem</h2>
        <div className="space-y-2">
          {POINT_SYSTEM.map(p => (
            <div key={p.points} className="flex items-center gap-3 py-2 border-b border-slate-100 dark:border-slate-700 last:border-0">
              <span className="font-display text-2xl font-bold text-pitch-600 dark:text-pitch-400 w-8 text-center">{p.points}</span>
              <div>
                <div className="font-medium text-sm">{p.label}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">{p.description}</div>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
          Plus bis zu <strong className="text-gold-500">15 Bonuspunkte</strong> für richtige Sondertipps (Weltmeister, Torschützenkönig etc.)
        </p>
      </section>
    </div>
  )
}
