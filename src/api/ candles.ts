import { CandleInterval, HlCandle } from '@/lib/types'

const INFO_URL = 'https://api.hyperliquid.xyz/info'
const INTERVAL_MS: Record<CandleInterval, number> = {
  '1m': 60000,
  '5m': 300000,
  '15m': 900000,
  '1h': 3600000,
  '4h': 14400000,
  '1d': 86400000,
}

export async function fetchCandles(coin: string, interval: CandleInterval) {
  try {
    const res = await fetch(INFO_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'candleSnapshot',
        req: {
          coin,
          interval,
          startTime: Date.now() - INTERVAL_MS[interval] * 200,
          endTime: Date.now(),
        },
      }),
    })
    return (await res.json()) as HlCandle[]
  } catch {
    return [] as HlCandle[]
  }
}
