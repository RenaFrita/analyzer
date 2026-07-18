'use client'

import { useEffect, useRef } from 'react'
import { useLastTrades } from '@/stores/tradesStore'

export default function Tape() {
  const listRef = useRef<HTMLDivElement>(null)
  const trades = useLastTrades(100)

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = 0
    }
  }, [trades.length])

  const recent = trades.slice().reverse()

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center px-3 py-1.5 border-b border-zinc-800 shrink-0">
        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Tape</span>
      </div>
      <div ref={listRef} className="flex-1 overflow-y-auto min-h-0">
        {recent.map((t, i) => (
          <div
            key={`${t.time}-${t.price}-${t.side}-${t.size}-${i}`}
            className="flex items-center gap-2 px-3 py-0.5 text-[11px] font-mono border-b border-zinc-900/50"
          >
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${t.side === 'buy' ? 'bg-green-500' : 'bg-red-500'}`}
            />
            <span className="tabular-nums text-zinc-200">{t.price.toFixed(2)}</span>
            <span className="tabular-nums text-zinc-500">{t.size.toFixed(4)}</span>
            <span className="ml-auto text-zinc-600 tabular-nums">
              {new Date(t.time).toLocaleTimeString('en-US', { hour12: false })}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
