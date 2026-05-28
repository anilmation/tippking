import { createServerSupabaseClient } from '@/lib/supabase-server'
import type { LeaderboardEntry } from '@/lib/types'

export const revalidate = 60

export default async function RanglistePage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: entries } = await supabase
    .from('leaderboard')
    .select('*')
    .order('rank')

  const myEntry = entries?.find(e => e.id === user?.id)

  return (
    <div className="animate-fade-in space-y-4">
      <div>
        <h1 className="font-display text-3xl font-bold">Rangliste</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          {entries?.length ?? 0} Teilnehmer
        </p>
      </div>

      {/* My rank card */}
      {myEntry && (
        <div className="card border-pitch-400 dark:border-pitch-600 border-2 bg-pitch-50 dark:bg-pitch-900/20">
          <div className="flex items-center gap-3">
            <div className="font-display text-3xl font-bold text-pitch-600 dark:text-pitch-400 w-12 text-center">
              #{myEntry.rank}
            </div>
            <div className="flex-1">
              <div className="font-bold">Du – {myEntry.username}</div>
              <div className="text-xs text-slate-500 mt-0.5">
                {myEntry.match_points} Spielpunkte + {myEntry.special_points} Sonderpunkte
              </div>
            </div>
            <div className="font-display text-2xl font-bold text-gold-500">
              {myEntry.total_points} Pkt
            </div>
          </div>
        </div>
      )}

      {/* Full table */}
      <div className="card p-0 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide w-12">#</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Spieler</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden sm:table-cell">Spiele</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden sm:table-cell">Sonder</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Gesamt</th>
            </tr>
          </thead>
          <tbody>
            {entries?.map((entry, i) => {
              const isMe = entry.id === user?.id
              const medal = entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : null
              return (
                <tr
                  key={entry.id}
                  className={`border-b border-slate-100 dark:border-slate-800 last:border-0 transition-colors
                    ${isMe ? 'bg-pitch-50 dark:bg-pitch-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                >
                  <td className="px-4 py-3 text-center">
                    {medal ? (
                      <span className="text-xl">{medal}</span>
                    ) : (
                      <span className="font-display font-bold text-slate-400">{entry.rank}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-pitch-500 text-white text-sm font-bold flex items-center justify-center shrink-0">
                        {entry.username[0].toUpperCase()}
                      </div>
                      <span className={`font-medium text-sm ${isMe ? 'text-pitch-700 dark:text-pitch-400' : ''}`}>
                        {entry.username}{isMe && ' (Du)'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-slate-500 hidden sm:table-cell">
                    {entry.match_points}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-slate-500 hidden sm:table-cell">
                    {entry.special_points}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="font-display font-bold text-pitch-700 dark:text-pitch-400">
                      {entry.total_points}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {(!entries || entries.length === 0) && (
          <div className="text-center py-12 text-slate-400">
            Noch keine Teilnehmer
          </div>
        )}
      </div>
    </div>
  )
}
