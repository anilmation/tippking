# ⚽ WM 2026 Tippspiel

Ein kostenloses, vollständiges Tippspiel für die FIFA Weltmeisterschaft 2026 — gebaut mit Next.js, Supabase und football-data.org.

## ✨ Features

- **Spieltipps** — Alle Gruppen- und K.O.-Spiele tippen (bis zu 4 Punkte pro Spiel)
- **Sondertipps** — Weltmeister, Vize-WM, Platz 3, Torschützenkönig, Gesamttore (bis zu 15 Bonuspunkte)
- **Rangliste** — Echtzeit-Rangliste mit allen Teilnehmern
- **Admin-Panel** — Ergebnisse eintragen, Sondertipps auflösen, API sync
- **API-Sync** — Automatischer täglicher Sync von football-data.org via Vercel Cron
- **Auth** — E-Mail/Passwort + Magic Link via Supabase Auth
- **Responsive** — Mobile-first Design
- **Dark Mode** — Automatisch + manuell umschaltbar
- **100% kostenlos** — Vercel Free + Supabase Free + football-data.org Free

---

## 🛠️ Setup (Schritt für Schritt)

### 1. Supabase Projekt erstellen

1. Gehe zu [supabase.com](https://supabase.com) → "New Project"
2. Projekt benennen (z.B. "wm-tippspiel")
3. Im SQL Editor: Inhalt von `supabase/migrations/001_initial_schema.sql` ausführen
4. Unter **Project Settings → API** notiere:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon (public)` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (**niemals öffentlich!**)

### 2. football-data.org API Key

1. Kostenlos registrieren auf [football-data.org/client/register](https://www.football-data.org/client/register)
2. API Key per E-Mail → `FOOTBALL_DATA_API_KEY`
3. Free Tier: 10 Anfragen/Minute — reicht für tägliche Syncs

> ⚠️ **Hinweis:** Die WM 2026 wird football-data.org erst kurz vor Turnierstart verfügbar sein (Competition ID prüfen in `lib/football-api.ts`). Bis dahin kannst du Teams und Spiele manuell über Supabase eintragen.

### 3. Projekt aufsetzen

```bash
git clone <dein-repo>
cd wm-tippspiel
npm install
cp .env.local.example .env.local
# .env.local mit deinen Werten befüllen
npm run dev
```

### 4. Auf Vercel deployen (kostenlos)

1. [vercel.com/new](https://vercel.com/new) → GitHub Repo importieren
2. Environment Variables in Vercel Dashboard setzen:
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...
   FOOTBALL_DATA_API_KEY=...
   CRON_SECRET=<beliebiges-langes-passwort>
   ```
3. In `vercel.json` das `CRON_SECRET` im Cron-Path anpassen
4. Deploy!

### 5. Admin-Account einrichten

Nach dem ersten Login: im Supabase SQL Editor:
```sql
UPDATE public.profiles SET is_admin = true WHERE username = 'dein-benutzername';
```

---

## 📊 Punktesystem

| Punkte | Beschreibung |
|--------|-------------|
| 4 | Genaues Ergebnis (z.B. 2:1 getippt, 2:1 Ergebnis) |
| 3 | Richtige Tordifferenz (z.B. 2:1 getippt, 3:2 Ergebnis) |
| 2 | Richtige Tendenz + ein korrekter Score |
| 1 | Richtige Tendenz (Sieg/Unentschieden/Niederlage) |
| 0 | Falsche Tendenz |

**Sondertipps:** 6–15 Bonuspunkte je Frage

---

## 🏗️ Architektur

```
wm-tippspiel/
├── app/
│   ├── page.tsx              # Landing Page
│   ├── auth/                 # Login/Registrierung
│   ├── dashboard/            # Übersicht & Stats
│   ├── tipps/                # Spieltipps abgeben
│   ├── sondertipps/          # Sondertipps
│   ├── rangliste/            # Rangliste
│   ├── admin/                # Admin Panel
│   └── api/sync/             # API Sync Endpoint
├── components/
│   └── layout/               # NavBar, ThemeProvider
├── lib/
│   ├── supabase.ts           # Supabase Client
│   ├── football-api.ts       # football-data.org Wrapper
│   ├── points.ts             # Punkteberechnung
│   └── types.ts              # TypeScript Types
└── supabase/
    └── migrations/           # DB Schema
```

---

## 🔄 Spielplan-Sync

Der Sync läuft automatisch täglich um 06:00 Uhr via Vercel Cron. Manuell auslösen im Admin-Panel oder per:

```bash
curl -X POST https://deine-app.vercel.app/api/sync \
  -H "Authorization: Bearer DEIN_CRON_SECRET"
```

---

## 🆓 Kostenlos bleiben

| Service | Free Tier Limits |
|---------|-----------------|
| Vercel | 100GB Bandwidth, unbegrenzte Deployments |
| Supabase | 500MB DB, 2GB Bandwidth, 50k MAU |
| football-data.org | 10 Req/min, alle grossen Turniere |

Alle Limits sind für ein privates Tippspiel mit Freunden/Familie mehr als ausreichend.
