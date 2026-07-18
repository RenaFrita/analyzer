'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { useSettingsStore, COINS, TIME_FRAMES } from '@/stores/settingsStore'
import { useTradesStore } from '@/stores/tradesStore'

export default function Header() {
  const {
    coin,
    timeframe,
    minBigTradeSize,
    alarmEnabled,
    setCoin,
    setTimeframe,
    setMinBigTradeSize,
    setAlarmEnabled,
  } = useSettingsStore()
  const trades = useTradesStore((s) => s.trades)

  const cvd = useMemo(() => {
    if (trades.length === 0) return 0
    let sum = 0
    for (const t of trades) {
      sum += t.side === 'buy' ? t.size : -t.size
    }
    return sum
  }, [trades])

  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const filtered = COINS.filter((c) => c.toLowerCase().includes(search.toLowerCase()))

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <header className="flex items-center gap-3 px-5 h-11 border-b border-zinc-800 bg-black shrink-0 select-none">
      <div className="flex items-center gap-2.5 mr-1">
        <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
          <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </div>
        <span className="text-sm font-semibold text-zinc-100">Analyzer</span>
      </div>

      <div className="w-px h-5 bg-zinc-800" />

      <div ref={dropdownRef} className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-md hover:bg-zinc-800 transition-colors text-sm font-semibold text-zinc-100"
        >
          {coin}
          <svg
            className="w-3.5 h-3.5 text-zinc-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {open && (
          <div className="absolute top-full left-0 mt-1.5 w-44 rounded-lg border border-zinc-700 bg-zinc-900 shadow-2xl z-50 overflow-hidden">
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search coin..."
              className="w-full px-3 py-2.5 bg-zinc-800 text-sm font-medium text-zinc-200 outline-none border-b border-zinc-700/50 placeholder-zinc-500"
            />
            <div className="max-h-64 overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="px-3 py-6 text-center text-sm text-zinc-600">No coins found</div>
              ) : (
                filtered.map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      setCoin(c)
                      setOpen(false)
                      setSearch('')
                    }}
                    className={`flex items-center gap-3 w-full text-left px-3 py-2 text-sm transition-colors ${
                      c === coin
                        ? 'text-white bg-blue-500/20'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                    }`}
                  >
                    {c === coin && (
                      <svg
                        className="w-3 h-3 text-blue-500 shrink-0"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                      </svg>
                    )}
                    <span className={c === coin ? '' : 'ml-6'}>{c}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-1.5 ml-1">
        {TIME_FRAMES.map((tf) => (
          <button
            key={tf}
            onClick={() => setTimeframe(tf)}
            className={`px-3 py-1 rounded text-xs font-semibold font-mono transition-all ${
              tf === timeframe
                ? 'text-blue-500 bg-blue-500/10'
                : 'text-zinc-600 hover:text-zinc-400'
            }`}
          >
            {tf}
          </button>
        ))}
      </div>

      <div className="ml-auto flex items-center gap-5">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
            CVD
          </span>
          <span
            className={`text-sm font-semibold font-mono tabular-nums ${
              cvd >= 0 ? 'text-green-500' : 'text-red-500'
            }`}
          >
            {cvd >= 0 ? '+' : ''}
            {cvd.toFixed(2)}
          </span>
        </div>

        <button
          onClick={() => setAlarmEnabled(!alarmEnabled)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
            alarmEnabled
              ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
              : 'bg-zinc-800/50 text-zinc-600 hover:text-zinc-400'
          }`}
          title={alarmEnabled ? 'Alarm on' : 'Alarm off'}
        >
          <svg
            className="w-3.5 h-3.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            {alarmEnabled ? (
              <>
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </>
            ) : (
              <>
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </>
            )}
          </svg>
          Alarm
        </button>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
            Min Size
          </span>
          <input
            type="number"
            min="0"
            step="0.1"
            value={minBigTradeSize}
            onChange={(e) => setMinBigTradeSize(Number(e.target.value) || 0)}
            className="w-14 px-2 py-1 rounded-md bg-zinc-800 text-xs font-mono text-zinc-200 outline-none border border-zinc-700/50 focus:border-blue-500 transition-colors text-right tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>
      </div>
    </header>
  )
}
