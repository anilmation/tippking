export type Stage = 'GROUP' | 'R32' | 'R16' | 'QF' | 'SF' | '3RD' | 'FINAL'

const isKO = (stage: Stage) => stage !== 'GROUP'

export function calculatePoints(
  tipHome: number, tipAway: number,
  realHome: number, realAway: number,
  stage: Stage = 'GROUP'
): number {
  const ko = isKO(stage)
  const tendencyPts = ko ? 10 : 5
  const goalPts = ko ? 2 : 1
  const diffPts = ko ? 6 : 3

  const tipDiff  = tipHome - tipAway
  const realDiff = realHome - realAway
  const tipTend  = tipDiff > 0 ? 'H' : tipDiff < 0 ? 'A' : 'D'
  const realTend = realDiff > 0 ? 'H' : realDiff < 0 ? 'A' : 'D'

  let points = 0

  // Correct tendency
  if (tipTend === realTend) {
    points += tendencyPts
    // Correct goal difference (tendency must be correct)
    if (tipDiff === realDiff) points += diffPts
  }

  // Correct home goals (independent)
  if (tipHome === realHome) points += goalPts

  // Correct away goals (independent)
  if (tipAway === realAway) points += goalPts

  return points
}

export function getMaxPoints(stage: Stage): number {
  // GROUP: 5 (tendency) + 3 (diff) + 1 (home) + 1 (away) = 10 max
  // KO:    10 (tendency) + 6 (diff) + 2 (home) + 2 (away) = 20 max
  return isKO(stage) ? 20 : 10
}

export function getPointsLabel(points: number, stage: Stage = 'GROUP'): string {
  const max = isKO(stage) ? 20 : 10
  if (points === max) return '🎯 Maximum'
  if (points >= max * 0.7) return '✅ Super'
  if (points >= max * 0.4) return '👍 Gut'
  if (points > 0) return '〰️ Teilweise'
  return '❌ Kein Punkt'
}

// For display in rules / UI
export const POINT_SYSTEM_GROUP = [
  { points: 5, label: 'Richtiger Sieger oder Unentschieden', description: 'Tendenz korrekt — unabhängig vom Ergebnis' },
  { points: 3, label: 'Richtige Tordifferenz', description: 'Tordifferenz korrekt + Sieger muss stimmen' },
  { points: 1, label: 'Richtige Anzahl Heim-Tore', description: 'Unabhängig von Tendenz und Differenz' },
  { points: 1, label: 'Richtige Anzahl Gast-Tore', description: 'Unabhängig von Tendenz und Differenz' },
]

export const POINT_SYSTEM_KO = [
  { points: 10, label: 'Richtiger Sieger', description: 'Gilt auch nach Verlängerung & Elfmeterschiessen' },
  { points: 6,  label: 'Richtige Tordifferenz', description: 'Tordifferenz korrekt + Sieger muss stimmen' },
  { points: 2,  label: 'Richtige Anzahl Heim-Tore', description: 'Ergebnis nach 120 Min. (ohne Penaltys)' },
  { points: 2,  label: 'Richtige Anzahl Gast-Tore', description: 'Ergebnis nach 120 Min. (ohne Penaltys)' },
]

// Keep for backward compat
export const POINT_SYSTEM = POINT_SYSTEM_GROUP
