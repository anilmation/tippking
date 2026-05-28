import { POINT_SYSTEM } from '@/lib/points'
import Link from 'next/link'

export default function RegelnPage() {
  return (
    <div className="animate-fade-in" style={{ maxWidth: 680, margin: '0 auto' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700, marginBottom: 4 }}>REGELN</h1>
      <p style={{ color: 'var(--pitch-muted)', fontSize: 13, marginBottom: 32 }}>TippKing WM 2026 — alle Infos auf einen Blick</p>

      {/* Grundprinzip */}
      <section className="card" style={{ marginBottom: 16 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, marginBottom: 12 }}>🎯 GRUNDPRINZIP</h2>
        <p style={{ fontSize: 14, color: 'var(--pitch-muted)', lineHeight: 1.8, margin: 0 }}>
          Tippe alle Spiele der FIFA Weltmeisterschaft 2026 und sammle so viele Punkte wie möglich.
          Punkte gibt es für richtige Tendenz-Tipps und Bonuspunkte für das genaue Ergebnis.
          Zusätzlich kannst du bei Sondertipps bis zu <strong style={{ color: '#ca8a04' }}>69 Extrapunkte</strong> holen.
        </p>
      </section>

      {/* Tipps abgeben */}
      <section className="card" style={{ marginBottom: 16 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, marginBottom: 16 }}>✏️ TIPPS ABGEBEN</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { icon: '1️⃣', title: 'Tendenz wählen', desc: 'Wähle wer gewinnt — Heimteam, Unentschieden oder Auswärtsteam. Das ist Pflicht und reicht für Punkte.' },
            { icon: '2️⃣', title: 'Ergebnis tippen (optional)', desc: 'Für Bonuspunkte kannst du zusätzlich das genaue Ergebnis tippen. Je genauer desto mehr Punkte.' },
            { icon: '🔒', title: 'Abgabeschluss', desc: 'Tipps können bis zum Anpfiff abgegeben oder geändert werden. Danach sind sie gesperrt.' },
          ].map(r => (
            <div key={r.title} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 20, flexShrink: 0, marginTop: 2 }}>{r.icon}</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{r.title}</div>
                <div style={{ fontSize: 13, color: 'var(--pitch-muted)', lineHeight: 1.6 }}>{r.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Wichtige Regel K.O. */}
      <section style={{
        marginBottom: 16, padding: 16, borderRadius: 12,
        background: 'rgba(22,163,74,0.08)',
        border: '1px solid rgba(22,163,74,0.3)',
      }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, marginBottom: 10, color: 'var(--pitch-green)' }}>⚽ K.O.-RUNDE — WICHTIGE REGEL</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <span style={{ fontSize: 18, flexShrink: 0 }}>⏱️</span>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>Ergebnis = nach 90 Minuten</div>
              <div style={{ fontSize: 13, color: 'var(--pitch-muted)', lineHeight: 1.6 }}>
                Dein Score-Tipp bezieht sich immer auf das Ergebnis nach regulärer Spielzeit. Verlängerung und Elfmeterschiessen zählen nicht fürs Ergebnis.
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <span style={{ fontSize: 18, flexShrink: 0 }}>🏆</span>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>Sieger/Unentschieden gilt auch nach Verlängerung & Elfmeterschiessen</div>
              <div style={{ fontSize: 13, color: 'var(--pitch-muted)', lineHeight: 1.6 }}>
                Hast du auf Heimsieg getippt und das Team kommt nach Elfmeterschiessen weiter — Tendenz-Punkt bekommst du trotzdem!
              </div>
            </div>
          </div>
          <div style={{ marginTop: 4, padding: '10px 14px', borderRadius: 8, background: 'var(--pitch-bg)', fontSize: 13, color: 'var(--pitch-muted)', lineHeight: 1.6 }}>
            <strong style={{ color: 'var(--pitch-text)' }}>Beispiel:</strong> Deutschland–Frankreich endet nach 90 Min. 1:1, Deutschland gewinnt nach Elfmeterschiessen.
            Wer <em>Deutschland</em> getippt hat → Tendenzpunkt ✓ · Wer <em>1:1</em> getippt hat → Ergebnispunkt ✓
          </div>
        </div>
      </section>

      {/* Punktesystem */}
      <section className="card" style={{ marginBottom: 16 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, marginBottom: 16 }}>📊 PUNKTESYSTEM</h2>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {POINT_SYSTEM.map((p, i) => (
            <div key={p.points} style={{
              display: 'flex', alignItems: 'center', gap: 16,
              padding: '12px 0',
              borderBottom: i < POINT_SYSTEM.length - 1 ? '1px solid var(--pitch-border)' : 'none'
            }}>
              <span style={{
                fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, width: 32, textAlign: 'center', flexShrink: 0,
                color: p.points === 4 ? '#ca8a04' : p.points >= 2 ? 'var(--pitch-green)' : p.points === 1 ? '#f59e0b' : '#ef4444',
              }}>{p.points}</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{p.label}</div>
                <div style={{ fontSize: 12, color: 'var(--pitch-muted)', marginTop: 2 }}>{p.description}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Sondertipps */}
      <section className="card" style={{ marginBottom: 16 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, marginBottom: 16 }}>🏆 SONDERTIPPS</h2>
        <p style={{ fontSize: 13, color: 'var(--pitch-muted)', marginBottom: 14, lineHeight: 1.7 }}>
          Vor Turnierbeginn kannst du zusätzliche Tipps abgeben. Die Deadline ist der <strong style={{ color: 'var(--pitch-text)' }}>11. Juni 2026 um 21:59 Uhr</strong>.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { icon: '🥇', label: 'Weltmeister', pts: 15 },
            { icon: '⚽', label: 'Torschützenkönig', pts: 12 },
            { icon: '🥈', label: 'Vize-Weltmeister', pts: 10 },
            { icon: '🔢', label: 'Gesamttore im Turnier', pts: 10 },
            { icon: '🥉', label: 'Platz 3', pts: 8 },
            { icon: '❓', label: 'Welche Mannschaft schiesst die meisten Tore?', pts: 8 },
          ].map(s => (
            <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--pitch-border)' }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>{s.icon}</span>
              <span style={{ flex: 1, fontSize: 13 }}>{s.label}</span>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: '#ca8a04', fontSize: 16, flexShrink: 0 }}>{s.pts} Pkt</span>
            </div>
          ))}
          <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: 'var(--pitch-muted)' }}>Total Sonderpunkte</span>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: '#ca8a04', fontSize: 20 }}>69 Pkt</span>
          </div>
        </div>
      </section>

      {/* Rangliste */}
      <section className="card" style={{ marginBottom: 32 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, marginBottom: 12 }}>📈 RANGLISTE</h2>
        <div style={{ fontSize: 13, color: 'var(--pitch-muted)', lineHeight: 1.8 }}>
          <p style={{ margin: '0 0 8px' }}>Die Rangliste wird nach jedem Spieltag aktualisiert. Bei Punktegleichstand entscheidet die Anzahl abgegebener Tipps.</p>
          <p style={{ margin: 0 }}>Spielpunkte und Sonderpunkte werden separat ausgewiesen, sodass du immer siehst wo du stehst.</p>
        </div>
      </section>

      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <Link href="/tipps" style={{ textDecoration: 'none' }}>
          <span className="btn-primary" style={{ fontSize: 15, padding: '12px 32px' }}>Jetzt tippen →</span>
        </Link>
      </div>
    </div>
  )
}
