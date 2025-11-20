import { useCallback, useEffect, useMemo, useState } from 'react'
import SudokuGrid from './components/SudokuGrid'
import StatsPanel from './components/StatsPanel'

const API = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

function App() {
  const [difficulty, setDifficulty] = useState('easy')
  const [puzzle, setPuzzle] = useState(null)
  const [solution, setSolution] = useState(null)
  const [current, setCurrent] = useState(null)
  const [selected, setSelected] = useState(null)
  const [mistakes, setMistakes] = useState(0)
  const [seconds, setSeconds] = useState(0)
  const [running, setRunning] = useState(false)
  const [stats, setStats] = useState([])

  const playerId = useMemo(() => {
    const key = 'sudoco-player-id'
    let v = localStorage.getItem(key)
    if (!v) { v = Math.random().toString(36).slice(2); localStorage.setItem(key, v) }
    return v
  }, [])

  const loadStats = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/statistics?limit=100`)
      const data = await res.json()
      setStats(data.items.filter(x => x.player_id === playerId))
    } catch (e) { /* ignore */ }
  }, [playerId])

  const newGame = useCallback(async () => {
    setRunning(false)
    setSeconds(0)
    setMistakes(0)
    setSelected(null)
    try {
      const res = await fetch(`${API}/api/new-game`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ difficulty })
      })
      const data = await res.json()
      setPuzzle(data.puzzle)
      setSolution(data.solution)
      setCurrent(JSON.parse(JSON.stringify(data.puzzle)))
      setRunning(true)
    } catch (e) {
      console.error(e)
    }
  }, [difficulty])

  useEffect(() => { loadStats() }, [loadStats])

  useEffect(() => {
    if (!running) return
    const t = setInterval(() => setSeconds(s => s + 1), 1000)
    return () => clearInterval(t)
  }, [running])

  const onSelect = useCallback((pos) => setSelected(pos), [])

  const onInput = useCallback((val) => {
    if (!current || !selected) return
    const [r, c] = selected
    if (puzzle[r][c] !== 0) return
    setCurrent(prev => {
      const next = prev.map(row => row.slice())
      next[r][c] = val
      return next
    })
    if (val !== 0 && solution && val !== solution[r][c]) {
      setMistakes(m => m + 1)
    }
  }, [current, selected, puzzle, solution])

  const solved = useMemo(() => {
    if (!current || !solution) return false
    for (let r=0;r<9;r++){
      for (let c=0;c<9;c++){
        if (current[r][c] !== solution[r][c]) return false
      }
    }
    return true
  }, [current, solution])

  useEffect(() => {
    const submit = async () => {
      if (!puzzle || !solution) return
      try {
        await fetch(`${API}/api/statistics`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ player_id: playerId, difficulty, seconds, solved: true, mistakes })
        })
        loadStats()
      } catch (e) { /* ignore */ }
    }
    if (solved && running) {
      setRunning(false)
      submit()
    }
  }, [solved])

  useEffect(() => { newGame() }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="max-w-5xl mx-auto p-6">
        <header className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <h1 className="text-3xl font-bold">Sudoco</h1>
          <div className="flex items-center gap-3">
            <select value={difficulty} onChange={e=>setDifficulty(e.target.value)} className="bg-slate-800 border border-slate-600 rounded px-3 py-2">
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
            <button onClick={newGame} className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded font-semibold">New Game</button>
          </div>
        </header>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 flex items-center justify-center">
            {puzzle && current ? (
              <SudokuGrid
                puzzle={puzzle}
                current={current}
                selected={selected}
                onSelect={onSelect}
                onInput={onInput}
              />
            ) : (
              <div className="text-blue-200">Loading puzzle...</div>
            )}
          </div>

          <div className="lg:w-80 space-y-4">
            <div className="bg-slate-800/60 border border-blue-500/20 rounded-xl p-4">
              <div className="grid grid-cols-3 gap-3">
                {[1,2,3,4,5,6,7,8,9].map(n => (
                  <button key={n} onClick={()=>onInput(n)} className="bg-slate-900/60 hover:bg-slate-700/60 rounded p-3 font-bold">{n}</button>
                ))}
                <button onClick={()=>onInput(0)} className="col-span-3 bg-red-600/70 hover:bg-red-600 rounded p-3 font-semibold">Clear</button>
              </div>
            </div>

            <div className="bg-slate-800/60 border border-blue-500/20 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="opacity-80">Time</span>
                <span className="text-xl font-bold">{seconds}s</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="opacity-80">Mistakes</span>
                <span className="text-xl font-bold">{mistakes}</span>
              </div>
            </div>

            <StatsPanel stats={stats} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
