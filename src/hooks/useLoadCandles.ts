import { useEffect, useState } from 'react'
import { useCandlesStore } from '../stores/candlesStore'
import { fetchCandles } from '@/api/candles'
import { CandleInterval } from '@/lib/types'

export function useLoadCandles(symbol: string, interval: CandleInterval) {
  const setCandles = useCandlesStore((s) => s.setCandles)
  const [isFetching, setIsFetching] = useState(true)
  useEffect(() => {
    let cancelled = false

    async function load() {
      const candles = await fetchCandles(symbol, interval)
      setIsFetching(false)
      if (!cancelled) {
        setCandles(
          candles.map((c) => ({
            time: c.t,
            open: Number(c.o),
            high: Number(c.h),
            low: Number(c.l),
            close: Number(c.c),
            volume: Number(c.v),
          })),
        )
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [symbol, setCandles, interval])
  return isFetching
}
