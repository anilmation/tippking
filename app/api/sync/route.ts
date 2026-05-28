import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { fetchWMMatches, fetchWMTeams, mapStage, mapStatus } from '@/lib/football-api'

// Use service role key for server-side writes (set in Vercel env vars)
function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(req: Request) {
  // Protect with cron secret
  const auth = req.headers.get('Authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = getAdminClient()
    const messages: string[] = []

    // 1. Sync teams
    try {
      const teams = await fetchWMTeams()
      for (const t of teams) {
        await supabase.from('teams').upsert({
          name: t.name,
          code: t.tla,
          flag_url: t.crest,
        }, { onConflict: 'code', ignoreDuplicates: false })
      }
      messages.push(`✅ ${teams.length} Teams synchronisiert`)
    } catch (e: any) {
      messages.push(`⚠️ Teams: ${e.message}`)
    }

    // 2. Sync matches
    try {
      const fdMatches = await fetchWMMatches()

      for (const fdMatch of fdMatches) {
        // Find team IDs
        const { data: homeTeam } = await supabase
          .from('teams').select('id').eq('code', fdMatch.homeTeam.tla).single()
        const { data: awayTeam } = await supabase
          .from('teams').select('id').eq('code', fdMatch.awayTeam.tla).single()

        if (!homeTeam || !awayTeam) continue

        await supabase.from('matches').upsert({
          external_id: String(fdMatch.id),
          home_team_id: homeTeam.id,
          away_team_id: awayTeam.id,
          home_score: fdMatch.score.fullTime.home,
          away_score: fdMatch.score.fullTime.away,
          stage: mapStage(fdMatch.stage),
          group_name: fdMatch.group?.replace('GROUP_', '') ?? null,
          matchday: fdMatch.matchday,
          kickoff: fdMatch.utcDate,
          status: mapStatus(fdMatch.status),
          updated_at: new Date().toISOString(),
        }, { onConflict: 'external_id' })
      }
      messages.push(`✅ ${fdMatches.length} Spiele synchronisiert`)
    } catch (e: any) {
      messages.push(`⚠️ Matches: ${e.message}`)
    }

    return NextResponse.json({
      message: messages.join('\n'),
      timestamp: new Date().toISOString()
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// Vercel Cron: GET is called by the cron job
export async function GET(req: Request) {
  const url = new URL(req.url)
  if (url.searchParams.get('secret') !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return POST(new Request(req.url, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${process.env.CRON_SECRET}` }
  }))
}
