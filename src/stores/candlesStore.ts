import { Candle } from '@/lib/types'
import { create } from 'zustand'

type CandleStore = {
  candles: Candle[]
  setCandles: (candles: Candle[]) => void
  appendCandle: (candle: Candle) => void
}

export const useCandlesStore = create<CandleStore>((set) => ({
  candles: [],

  setCandles: (candles) => set({ candles }),

  appendCandle: (candle) =>
    set((state) => {
      const last = state.candles[state.candles.length - 1]

      const candles =
        last && last.time === candle.time
          ? [
              ...state.candles.slice(0, -1),
              {
                ...last,
                ...candle,
              },
            ]
          : [...state.candles, candle]

      return {
        candles: candles.slice(-200),
      }
    }),
}))
