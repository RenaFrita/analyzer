'use client'

import { useEffect } from 'react'
import { useHyperliquidContext } from '@/providers/HyperliquidContext'
import type { HlTrade, WsMessage } from '@/lib/types'
import { useTradesStore } from '@/stores/tradesStore'

export function useSubscribeTrades(coin: string, isFetching: boolean) {
  const { connected, wsRef } = useHyperliquidContext()
  const pushTrades = useTradesStore((s) => s.pushTrades)

  useEffect(() => {
    const ws = wsRef.current

    if (!ws || ws.readyState !== WebSocket.OPEN || isFetching) return

    const handleMessage = (event: MessageEvent) => {
      const msg = JSON.parse(event.data) as WsMessage<HlTrade[]>

      if (msg.channel !== 'trades') return

      pushTrades(
        msg.data.map((t) => ({
          price: Number(t.px),
          size: Number(t.sz),
          side: t.side === 'B' ? 'buy' : 'sell',
          time: t.time,
          hash: t.hash,
        })),
      )
    }

    ws.send(
      JSON.stringify({
        method: 'subscribe',
        subscription: { type: 'trades', coin },
      }),
    )

    ws.addEventListener('message', handleMessage)

    return () => {
      ws.removeEventListener('message', handleMessage)

      if (ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            method: 'unsubscribe',
            subscription: { type: 'trades', coin },
          }),
        )
      }
    }
  }, [connected, wsRef, coin, pushTrades, isFetching])
}
