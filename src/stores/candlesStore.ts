import { useMemo } from 'react'
import { create } from 'zustand'
import type { Candle } from '@/lib/types'

const MAX = 200
const buf: Candle[] = new Array(MAX)
let head = 0
let count = 0

let cached: Candle[] = []
let cachedVer = -1

function toArray(): Candle[] {
  if (count === 0) return []
  if (count < MAX) return buf.slice(0, count)
  const arr = new Array<Candle>(count)
  let idx = 0
  for (let i = head; i < MAX; i++) arr[idx++] = buf[i]
  for (let i = 0; i < head; i++) arr[idx++] = buf[i]
  return arr
}

type CandleStore = {
  version: number
  setCandles: (candles: Candle[]) => void
  appendCandle: (candle: Candle) => void
}

export const useCandlesStore = create<CandleStore>((set, get) => ({
  version: 0,

  setCandles: (candles: Candle[]) => {
    head = 0
    count = Math.min(candles.length, MAX)
    for (let i = 0; i < count; i++) buf[i] = candles[i]
    cachedVer = -1
    set({ version: get().version + 1 })
  },

  appendCandle: (candle: Candle) => {
    const last = count > 0 ? buf[(head - 1 + MAX) % MAX] : null
    if (last && last.time === candle.time) {
      buf[(head - 1 + MAX) % MAX] = candle
    } else {
      buf[head] = candle
      head = (head + 1) % MAX
      if (count < MAX) count++
    }
    cachedVer = -1
    set({ version: get().version + 1 })
  },
}))

function getAll(): Candle[] {
  const ver = useCandlesStore.getState().version
  if (ver !== cachedVer) {
    cached = toArray()
    cachedVer = ver
  }
  return cached
}

export function useCandles(): Candle[] {
  const version = useCandlesStore((s) => s.version)
  return useMemo(() => (void version, getAll()), [version])
}
