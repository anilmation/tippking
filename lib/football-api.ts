// football-data.org Free Tier – WM 2026
// Competition ID for FIFA World Cup 2026: WC (or check after tournament is added)
// Free tier: 10 requests/minute, covers major competitions

const BASE_URL = 'https://api.football-data.org/v4'
const API_KEY = process.env.FOOTBALL_DATA_API_KEY!

// WM 2026 Competition Code – update if needed once available
const WM_2026_ID = 'WC'

async function fetchFD(path: string) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'X-Auth-Token': API_KEY },
    next: { revalidate: 300 }, // cache 5 minutes
  })
  if (!res.ok) throw new Error(`football-data API error: ${res.status} ${path}`)
  return res.json()
}

export async function fetchWMMatches() {
  const data = await fetchFD(`/competitions/${WM_2026_ID}/matches`)
  return data.matches as FDMatch[]
}

export async function fetchWMTeams() {
  const data = await fetchFD(`/competitions/${WM_2026_ID}/teams`)
  return data.teams as FDTeam[]
}

export async function fetchLiveMatches() {
  const data = await fetchFD(`/competitions/${WM_2026_ID}/matches?status=LIVE`)
  return data.matches as FDMatch[]
}

export async function fetchTodayMatches() {
  const today = new Date().toISOString().split('T')[0]
  const data = await fetchFD(`/competitions/${WM_2026_ID}/matches?dateFrom=${today}&dateTo=${today}`)
  return data.matches as FDMatch[]
}

// ─── football-data.org types ─────────────────────────────────────────────────

export type FDTeam = {
  id: number
  name: string
  shortName: string
  tla: string
  crest: string
}

export type FDMatch = {
  id: number
  utcDate: string
  status: 'SCHEDULED' | 'TIMED' | 'IN_PLAY' | 'PAUSED' | 'FINISHED' | 'CANCELLED' | 'POSTPONED'
  stage: string
  group: string | null
  matchday: number | null
  homeTeam: { id: number; name: string; shortName: string; tla: string; crest: string }
  awayTeam: { id: number; name: string; shortName: string; tla: string; crest: string }
  score: {
    fullTime: { home: number | null; away: number | null }
    halfTime: { home: number | null; away: number | null }
    winner: 'HOME_TEAM' | 'AWAY_TEAM' | 'DRAW' | null
  }
}

// Map football-data stage strings to our internal stages
export function mapStage(fdStage: string): string {
  const map: Record<string, string> = {
    'GROUP_STAGE': 'GROUP',
    'ROUND_OF_32': 'R32',
    'ROUND_OF_16': 'R16',
    'QUARTER_FINALS': 'QF',
    'SEMI_FINALS': 'SF',
    'THIRD_PLACE': '3RD',
    'FINAL': 'FINAL',
  }
  return map[fdStage] ?? 'GROUP'
}

export function mapStatus(fdStatus: string): string {
  if (['IN_PLAY', 'PAUSED'].includes(fdStatus)) return 'LIVE'
  if (fdStatus === 'FINISHED') return 'FINISHED'
  return 'SCHEDULED'
}
