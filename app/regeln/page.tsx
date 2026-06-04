import Link from 'next/link'
import { POINT_SYSTEM_GROUP, POINT_SYSTEM_KO } from '@/lib/points'

export default function RegelnPage() {
  return (
    <div className="animate-fade-in" style={{ maxWidth: 680, margin: '0 auto' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700, marginBottom: 4 }}>REGELN</h1>
      <p style={{ color: 'var(--pitch-muted)', fontSize: 13, marginBottom: 32 }}>TippKing WM 2026 — alle Infos auf einen Blick</p>

      {/* Tippabgabe */}
      <section className="card" style={{ marginBottom: 16 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, marginBottom: 16 }}>✏️ TIPPABGABE</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { icon: '⏱️', title: '5 Minuten vor Anpfiff', desc: 'Ein Tipp kann bis 5 Minuten vor Anpfiff abgegeben oder geändert werden. Danach ist es nicht mehr möglich.' },
            { icon: '🔐', title: 'Anmeldung erforderlich', desc: 'Um einen Tipp abzugeben oder zu ändern, ist eine Anmeldung erforderlich.' },
            { icon: '🎯', title: 'Tendenz + Ergebnis', desc: 'Wähle zuerst wer gewinnt. Optional kannst du das genaue Ergebnis tippen — das bringt Bonuspunkte.' },
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

      {/* K.O. Regel */}
      <section style={{ marginBottom: 16, padding: 16, borderRadius: 12, background: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.3)' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, marginBottom: 12, color: 'var(--pitch-green)' }}>⚽ K.O.-RUNDE — WICHTIGE REGEL</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <span style={{ fontSize: 18, flexShrink: 0 }}>⏱️</span>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>Ergebnis nach 120 Minuten</div>
              <div style={{ fontSize: 13, color: 'var(--pitch-muted)', lineHeight: 1.6 }}>Bei Spielen mit Verlängerung ist das Resultat nach 120 Minuten massgebend — ohne Tore aus dem Elfmeterschiessen.</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <span style={{ fontSize: 18, flexShrink: 0 }}>🏆</span>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>Sieger gilt auch nach Elfmeterschiessen</div>
              <div style={{ fontSize: 13, color: 'var(--pitch-muted)', lineHeight: 1.6 }}>Hast du auf den richtigen Sieger getippt und das Team kommt nach Elfmeterschiessen weiter — der Tendenzpunkt zählt trotzdem.</div>
            </div>
          </div>
          <div style={{ marginTop: 4, padding: '10px 14px', borderRadius: 8, background: 'var(--pitch-bg)', fontSize: 13, color: 'var(--pitch-muted)', lineHeight: 1.6 }}>
            <strong style={{ color: 'var(--pitch-text)' }}>Beispiel:</strong> Deutschland–Frankreich endet nach 120 Min. 1:1, Deutschland gewinnt im Elfmeterschiessen.
            Wer <em>Deutschland</em> getippt hat → Tendenzpunkt ✓ &nbsp;·&nbsp; Wer <em>1:1</em> getippt hat → Ergebnis-Bonuspunkte ✓
          </div>
        </div>
      </section>

      {/* Punktesystem Gruppenphase */}
      <section className="card" style={{ marginBottom: 16 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, marginBottom: 4 }}>📊 PUNKTESYSTEM GRUPPENPHASE</h2>
        <p style={{ fontSize: 12, color: 'var(--pitch-muted)', marginBottom: 14 }}>Maximum: <strong style={{ color: 'var(--pitch-green)' }}>10 Punkte</strong> pro Spiel</p>
        {POINT_SYSTEM_GROUP.map((p, i) => (
          <div key={p.label} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '11px 0', borderBottom: i < POINT_SYSTEM_GROUP.length - 1 ? '1px solid var(--pitch-border)' : 'none' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, color: p.points === 5 ? '#ca8a04' : p.points === 3 ? 'var(--pitch-green)' : '#60a5fa', width: 32, textAlign: 'center', flexShrink: 0 }}>{p.points}</span>
            <div>
              <div style={{ fontWeight: 600, fontSize: 13 }}>{p.label}</div>
              <div style={{ fontSize: 12, color: 'var(--pitch-muted)', marginTop: 1 }}>{p.description}</div>
            </div>
          </div>
        ))}
      </section>

      {/* Punktesystem K.O. */}
      <section className="card" style={{ marginBottom: 16 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, marginBottom: 4 }}>📊 PUNKTESYSTEM K.O.-PHASE</h2>
        <p style={{ fontSize: 12, color: 'var(--pitch-muted)', marginBottom: 14 }}>Maximum: <strong style={{ color: 'var(--pitch-green)' }}>20 Punkte</strong> pro Spiel</p>
        {POINT_SYSTEM_KO.map((p, i) => (
          <div key={p.label} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '11px 0', borderBottom: i < POINT_SYSTEM_KO.length - 1 ? '1px solid var(--pitch-border)' : 'none' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, color: p.points === 10 ? '#ca8a04' : p.points === 6 ? 'var(--pitch-green)' : '#60a5fa', width: 32, textAlign: 'center', flexShrink: 0 }}>{p.points}</span>
            <div>
              <div style={{ fontWeight: 600, fontSize: 13 }}>{p.label}</div>
              <div style={{ fontSize: 12, color: 'var(--pitch-muted)', marginTop: 1 }}>{p.description}</div>
            </div>
          </div>
        ))}
      </section>

      {/* Sondertipps */}
      <section className="card" style={{ marginBottom: 16 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, marginBottom: 4 }}>🏆 SONDERTIPPS</h2>
        <p style={{ fontSize: 12, color: 'var(--pitch-muted)', marginBottom: 14 }}>Deadline: <strong style={{ color: 'var(--pitch-text)' }}>11. Juni 2026, 21:59 Uhr</strong></p>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {[
            { icon: '🥇', label: 'Weltmeister', pts: 50 },
            { icon: '🥈', label: 'Vize-Weltmeister', pts: 20 },
            { icon: '🥉', label: 'Platz 3', pts: 20 },
            { icon: '⚽', label: 'Tore des Torschützenkönigs (ohne Elfmeterschiessen)', pts: 20 },
            { icon: '🔢', label: 'Gesamttore im Turnier', pts: 20 },
            { icon: '❓', label: 'Welches Land schiesst die meisten Tore?', pts: 20 },
          ].map((s, i, arr) => (
            <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--pitch-border)' : 'none' }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>{s.icon}</span>
              <span style={{ flex: 1, fontSize: 13 }}>{s.label}</span>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: s.pts === 50 ? '#ca8a04' : 'var(--pitch-green)', fontSize: 16, flexShrink: 0 }}>{s.pts} Pkt</span>
            </div>
          ))}
        </div>
      </section>

      {/* Rangliste */}
      <section className="card" style={{ marginBottom: 32 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, marginBottom: 12 }}>📈 RANGLISTE</h2>
        <div style={{ fontSize: 13, color: 'var(--pitch-muted)', lineHeight: 1.8 }}>
          <p style={{ margin: '0 0 8px' }}>Jeder Spieler startet mit 0 Punkten. Die Rangliste wird nach jedem Spieltag aktualisiert.</p>
          <p style={{ margin: '0 0 8px' }}>Bei Punktegleichstand entscheidet die Anzahl abgegebener Tipps.</p>
          <p style={{ margin: 0 }}>Spielpunkte und Sonderpunkte werden separat ausgewiesen.</p>
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
