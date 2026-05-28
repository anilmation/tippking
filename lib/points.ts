export function calculatePoints(
  tipHome: number, tipAway: number,
  realHome: number, realAway: number
): number {
  // Exact result: 4 points
  if (tipHome === realHome && tipAway === realAway) return 4

  const tipDiff = tipHome - tipAway
  const realDiff = realHome - realAway

  // Correct goal difference (not a draw): 3 points
  if (tipDiff === realDiff && realDiff !== 0) return 3

  // Correct tendency
  const tipTendency = tipDiff > 0 ? 'H' : tipDiff < 0 ? 'A' : 'D'
  const realTendency = realDiff > 0 ? 'H' : realDiff < 0 ? 'A' : 'D'

  if (tipTendency === realTendency) {
    // Correct tendency + one correct score: 2 points
    if (tipHome === realHome || tipAway === realAway) return 2
    // Correct tendency only: 1 point
    return 1
  }

  return 0
}

export function getPointsLabel(points: number): string {
  const labels: Record<number, string> = {
    4: '🎯 Volltreffer',
    3: '✅ Differenz',
    2: '👍 Tendenz +',
    1: '〰️ Tendenz',
    0: '❌ Daneben',
  }
  return labels[points] ?? ''
}

export function getPointsColor(points: number): string {
  if (points === 4) return 'text-gold-500'
  if (points >= 2) return 'text-pitch-500'
  if (points === 1) return 'text-yellow-500'
  return 'text-red-400'
}

export const POINT_SYSTEM = [
  { points: 4, label: 'Genaues Ergebnis', description: 'Exakter Tipp – beide Scores stimmen' },
  { points: 3, label: 'Richtige Differenz', description: 'Gleiche Tordifferenz, richtige Tendenz' },
  { points: 2, label: 'Tendenz + Score', description: 'Richtige Tendenz + ein korrekter Score' },
  { points: 1, label: 'Richtige Tendenz', description: 'Sieg/Unentschieden/Niederlage korrekt' },
  { points: 0, label: 'Kein Punkt', description: 'Falsche Tendenz' },
]
