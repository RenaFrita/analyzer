'use client'

import { create } from 'zustand'
import type { Trade } from '@/lib/types'

const MAX = 20000

export const useTradesStore = create<{
  trades: Trade[]
  pushTrades: (trades: Trade[]) => void
  reset: () => void
}>((set) => ({
  trades: [],
  pushTrades: (trades: Trade[]) =>
    set((state) => {
      const newTrades = [...state.trades, ...trades]
      return { trades: newTrades.slice(-MAX) }
    }),
  reset: () => set({ trades: [] }),
}))
