'use client'

import { useEffect } from 'react'
import { useHyperliquidContext } from '@/providers/HyperliquidContext'
import type { CandleInterval, HlCandle, WsMessage } from '@/lib/types'
import { useCandlesStore } from '@/stores/candlesStore'

export function useSubscribeCandles(coin: string, interval: CandleInterval, isFetching: boolean) {
  const { connected, wsRef } = useHyperliquidContext()
  const appendCandle = useCandlesStore((s) => s.appendCandle)

  useEffect(() => {
    const ws = wsRef.current

    if (!ws || ws.readyState !== WebSocket.OPEN || isFetching) return

    const handleMessage = (event: MessageEvent) => {
      const msg = JSON.parse(event.data) as WsMessage<HlCandle>

      if (msg.channel !== 'candle') return

      appendCandle({
        time: msg.data.t,
        open: Number(msg.data.o),
        high: Number(msg.data.h),
        low: Number(msg.data.l),
        close: Number(msg.data.c),
        volume: Number(msg.data.v),
      })
    }

    ws.send(
      JSON.stringify({
        method: 'subscribe',
        subscription: { type: 'candle', coin, interval },
      }),
    )

    ws.addEventListener('message', handleMessage)

    return () => {
      ws.removeEventListener('message', handleMessage)

      if (ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            method: 'unsubscribe',
            subscription: { type: 'candle', coin, interval },
          }),
        )
      }
    }
  }, [connected, wsRef, coin, interval, appendCandle, isFetching])
}
