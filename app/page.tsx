import Link from 'next/link'
import { POINT_SYSTEM } from '@/lib/points'

export default function HomePage() {
  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section style={{ textAlign: 'center', padding: '64px 16px 48px' }}>
        <div style={{ fontSize: 64, marginBottom: 12 }}>⚽</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(48px,10vw,80px)', fontWeight: 700, letterSpacing: '0.04em', color: 'var(--pitch-text)', margin: 0, lineHeight: 1 }}>
          TIPP<span style={{ color: 'var(--pitch-green)' }}>KING</span>
        </h1>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: 18, letterSpacing: '0.12em', color: 'var(--pitch-muted)', marginTop: 8, marginBottom: 4 }}>WM 2026</p>
        <p style={{ fontSize: 10, color: 'var(--pitch-muted)', letterSpacing: '0.06em', marginBottom: 32 }}>vibecoded by Anil</p>
        <p style={{ color: 'var(--pitch-muted)', maxWidth: 480, margin: '0 auto 32px', fontSize: 15, lineHeight: 1.6 }}>
          Tippe alle Spiele der FIFA Weltmeisterschaft 2026 und miss dich mit Freunden und Familie.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/auth"><span className="btn-primary" style={{ fontSize: 15, padding: '10px 24px' }}>Jetzt mitmachen →</span></Link>
          <Link href="/rangliste"><span className="btn-secondary" style={{ fontSize: 15, padding: '10px 24px' }}>Rangliste ansehen</span></Link>
        </div>
      </section>

      {/* Features */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 12, marginBottom: 40 }}>
        {[
          { icon: '⚽', title: 'Alle Spiele', desc: 'Gruppenphase bis Final — automatisch aktualisiert' },
          { icon: '🏆', title: 'Sondertipps', desc: 'Weltmeister, Torschützenkönig und mehr' },
          { icon: '📊', title: 'Rangliste', desc: 'Echtzeit-Rangliste aller Teilnehmer' },
          { icon: '🌍', title: 'Flaggen', desc: 'Alle Länder auf Deutsch mit Flagge' },
          { icon: '🌙', title: 'Dark Mode', desc: 'Automatisch oder manuell' },
          { icon: '📱', title: 'Responsive', desc: 'Perfekt auf Handy & Desktop' },
        ].map(f => (
          <div key={f.title} className="card" style={{ transition: 'box-shadow 0.2s' }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>{f.icon}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{f.title}</div>
            <p style={{ fontSize: 13, color: 'var(--pitch-muted)', margin: 0, lineHeight: 1.5 }}>{f.desc}</p>
          </div>
        ))}
      </section>

      {/* Punktesystem */}
      <section className="card" style={{ marginBottom: 40 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, marginBottom: 16 }}>PUNKTESYSTEM</h2>
        {POINT_SYSTEM.map(p => (
          <div key={p.points} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 0', borderBottom: '1px solid var(--pitch-border)' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--pitch-green)', width: 32, textAlign: 'center', flexShrink: 0 }}>{p.points}</span>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{p.label}</div>
              <div style={{ fontSize: 12, color: 'var(--pitch-muted)' }}>{p.description}</div>
            </div>
          </div>
        ))}
        <p style={{ marginTop: 16, fontSize: 13, color: 'var(--pitch-muted)' }}>
          Plus bis zu <strong style={{ color: 'var(--pitch-gold)' }}>15 Bonuspunkte</strong> für Sondertipps
        </p>
      </section>
    </div>
  )
}
