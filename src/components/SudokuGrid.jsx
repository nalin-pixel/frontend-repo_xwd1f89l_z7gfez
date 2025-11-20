import { useEffect, useMemo } from 'react'

export default function SudokuGrid({ puzzle, current, selected, onSelect, onInput }) {
  const rows = useMemo(() => Array.from({ length: 9 }, (_, r) => r), [])
  const cols = rows

  useEffect(() => {
    const onKey = (e) => {
      if (!selected) return
      const key = e.key
      if (/^[1-9]$/.test(key)) {
        onInput(parseInt(key, 10))
      } else if (key === 'Backspace' || key === 'Delete' || key === '0') {
        onInput(0)
      } else if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(key)) {
        e.preventDefault()
        const [r, c] = selected
        if (key === 'ArrowUp' && r > 0) onSelect([r - 1, c])
        if (key === 'ArrowDown' && r < 8) onSelect([r + 1, c])
        if (key === 'ArrowLeft' && c > 0) onSelect([r, c - 1])
        if (key === 'ArrowRight' && c < 8) onSelect([r, c + 1])
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selected, onInput, onSelect])

  const cellClasses = (r, c, fixed) => {
    const isSelected = selected && selected[0] === r && selected[1] === c
    const inSameGroup = selected && (selected[0] === r || selected[1] === c || (Math.floor(selected[0]/3) === Math.floor(r/3) && Math.floor(selected[1]/3) === Math.floor(c/3)))
    return [
      'w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center select-none cursor-pointer transition-colors',
      fixed ? 'text-white' : 'text-blue-100',
      isSelected ? 'bg-blue-600/60' : inSameGroup ? 'bg-slate-700/40' : 'bg-slate-800/60',
      'border border-slate-600',
      (c === 2 || c === 5) ? 'border-r-4 border-slate-500' : '',
      (r === 2 || r === 5) ? 'border-b-4 border-slate-500' : '',
      fixed ? 'font-bold' : 'font-semibold'
    ].join(' ')
  }

  return (
    <div className="inline-block rounded-xl overflow-hidden shadow-2xl border border-slate-600">
      {rows.map(r => (
        <div key={r} className="flex">
          {cols.map(c => {
            const fixed = puzzle[r][c] !== 0
            const val = current[r][c]
            return (
              <div
                key={`${r}-${c}`}
                className={cellClasses(r,c,fixed)}
                onClick={() => onSelect([r,c])}
              >
                {val !== 0 ? <span>{val}</span> : <span className="text-slate-500">·</span>}
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}
