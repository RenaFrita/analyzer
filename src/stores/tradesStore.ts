'use client'

import { create } from 'zustand'
import { useMemo } from 'react'
import type { Trade } from '@/lib/types'

const MAX = 20000
const buf: Trade[] = new Array(MAX)
let head = 0
let count = 0
const keys = new Set<string>()

function tkey(t: Trade): string {
  return t.hash ? `h:${t.hash}` : `${t.time}:${t.price}:${t.side}:${t.size}`
}

function toArray(): Trade[] {
  if (count === 0) return []
  if (count < MAX) return buf.slice(0, count)
  const arr = new Array<Trade>(count)
  let idx = 0
  for (let i = head; i < MAX; i++) arr[idx++] = buf[i]
  for (let i = 0; i < head; i++) arr[idx++] = buf[i]
  return arr
}

export const useTradesStore = create<{
  version: number
  pushTrades: (trades: Trade[]) => void
  reset: () => void
}>((set, get) => ({
  version: 0,

  pushTrades: (incoming: Trade[]) => {
    let changed = false
    for (const t of incoming) {
      const k = tkey(t)
      if (keys.has(k)) continue
      keys.add(k)
      if (count === MAX) keys.delete(tkey(buf[head]))
      buf[head] = t
      head = (head + 1) % MAX
      if (count < MAX) count++
      changed = true
    }
    if (changed) set({ version: get().version + 1 })
  },

  reset: () => {
    head = 0
    count = 0
    keys.clear()
    set({ version: get().version + 1 })
  },
}))

export function useTrades(): Trade[] {
  const version = useTradesStore((s) => s.version)
  return useMemo(() => toArray(), [version])
}
