import Link from 'next/link'
import { POINT_SYSTEM } from '@/lib/points'

export default function HomePage() {
  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section style={{ textAlign: 'center', padding: '64px 16px 48px' }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>⚽</div>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(52px,12vw,88px)',
          fontWeight: 700,
          letterSpacing: '0.04em',
          color: 'var(--pitch-text)',
          margin: 0,
          lineHeight: 1,
        }}>
          TIPP<span style={{ color: 'var(--pitch-green)' }}>KING</span>
        </h1>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: 16, letterSpacing: '0.14em', color: 'var(--pitch-muted)', marginTop: 10, marginBottom: 4 }}>WM 2026</p>
        <p style={{ fontSize: 10, color: 'var(--pitch-muted)', letterSpacing: '0.06em', marginBottom: 36, opacity: 0.7 }}>vibecoded by Anil</p>
        <p style={{ color: 'var(--pitch-muted)', maxWidth: 440, margin: '0 auto 36px', fontSize: 15, lineHeight: 1.7 }}>
          Tippe alle Spiele der FIFA Weltmeisterschaft 2026 und miss dich mit Freunden und Familie.
        </p>

        {/* Buttons – gleiche Höhe, gleicher Stil */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/auth" style={{ textDecoration: 'none' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              height: 48, padding: '0 28px',
              background: '#15803d',
              color: '#fff',
              borderRadius: 10,
              fontFamily: 'var(--font-body)',
              fontSize: 15, fontWeight: 600,
              border: 'none', cursor: 'pointer',
              letterSpacing: '0.01em',
              whiteSpace: 'nowrap',
            }}>
              Jetzt mitmachen →
            </span>
          </Link>
          <Link href="/rangliste" style={{ textDecoration: 'none' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              height: 48, padding: '0 28px',
              background: 'transparent',
              color: 'var(--pitch-text)',
              borderRadius: 10,
              fontFamily: 'var(--font-body)',
              fontSize: 15, fontWeight: 600,
              border: '1.5px solid var(--pitch-border)',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}>
              Rangliste ansehen
            </span>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))', gap: 10, marginBottom: 40 }}>
        {[
          { icon: '⚽', title: 'Alle Spiele', desc: 'Gruppenphase bis Final — automatisch aktualisiert' },
          { icon: '🏆', title: 'Sondertipps', desc: 'Weltmeister, Torschützenkönig und mehr' },
          { icon: '📊', title: 'Rangliste', desc: 'Echtzeit-Rangliste aller Teilnehmer' },
          { icon: '🌍', title: 'Flaggen', desc: 'Alle Länder auf Deutsch mit Flagge' },
          { icon: '🌙', title: 'Dark Mode', desc: 'Automatisch oder manuell' },
          { icon: '📱', title: 'Responsive', desc: 'Perfekt auf Handy & Desktop' },
        ].map(f => (
          <div key={f.title} className="card" style={{ padding: '16px 18px' }}>
            <div style={{ fontSize: 26, marginBottom: 8 }}>{f.icon}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600, marginBottom: 4, letterSpacing: '0.02em' }}>{f.title}</div>
            <p style={{ fontSize: 12, color: 'var(--pitch-muted)', margin: 0, lineHeight: 1.5 }}>{f.desc}</p>
          </div>
        ))}
      </section>

      {/* Punktesystem */}
      <section className="card" style={{ marginBottom: 40, padding: '20px 24px' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, marginBottom: 16, letterSpacing: '0.03em' }}>PUNKTESYSTEM</h2>
        {POINT_SYSTEM.map((p, i) => (
          <div key={p.points} style={{
            display: 'flex', alignItems: 'center', gap: 16,
            padding: '11px 0',
            borderBottom: i < POINT_SYSTEM.length - 1 ? '1px solid var(--pitch-border)' : 'none'
          }}>
            <span style={{
              fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700,
              color: p.points === 4 ? '#ca8a04' : p.points >= 2 ? 'var(--pitch-green)' : p.points === 1 ? '#f59e0b' : '#ef4444',
              width: 32, textAlign: 'center', flexShrink: 0
            }}>{p.points}</span>
            <div>
              <div style={{ fontWeight: 600, fontSize: 13 }}>{p.label}</div>
              <div style={{ fontSize: 12, color: 'var(--pitch-muted)', marginTop: 1 }}>{p.description}</div>
            </div>
          </div>
        ))}
        <p style={{ marginTop: 14, fontSize: 12, color: 'var(--pitch-muted)' }}>
          Plus bis zu <strong style={{ color: '#ca8a04' }}>15 Bonuspunkte</strong> für Sondertipps (Weltmeister, Torschützenkönig etc.)
        </p>
      </section>
    </div>
  )
}
