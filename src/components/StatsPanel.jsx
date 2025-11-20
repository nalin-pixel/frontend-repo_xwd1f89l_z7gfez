import { useMemo } from 'react'

export default function StatsPanel({ stats }) {
  const totals = useMemo(() => {
    const t = { games: 0, solved: 0, avgSeconds: 0, mistakes: 0 }
    if (!stats || stats.length === 0) return t
    t.games = stats.length
    t.solved = stats.filter(s => s.solved).length
    t.mistakes = Math.round(stats.reduce((a,b)=>a+(b.mistakes||0),0) / t.games)
    t.avgSeconds = Math.round(stats.reduce((a,b)=>a+(b.seconds||0),0) / t.games)
    return t
  }, [stats])

  return (
    <div className="w-full bg-slate-800/60 border border-blue-500/20 rounded-xl p-4 sm:p-6 text-blue-100">
      <h3 className="text-lg font-semibold mb-3">Your stats</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900/50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold">{totals.games}</div>
          <div className="text-xs opacity-70">Games</div>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold">{totals.solved}</div>
          <div className="text-xs opacity-70">Solved</div>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold">{totals.avgSeconds}s</div>
          <div className="text-xs opacity-70">Avg time</div>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold">{totals.mistakes}</div>
          <div className="text-xs opacity-70">Avg mistakes</div>
        </div>
      </div>
    </div>
  )
}
