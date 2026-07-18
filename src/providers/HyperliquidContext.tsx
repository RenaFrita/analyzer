'use client'

import { createContext, useContext, type ReactNode } from 'react'
import { useHyperliquid } from '../hooks/useHyperliquid'

type HyperliquidContextValue = {
  connected: boolean
  wsRef: React.RefObject<WebSocket | null>
}

const HyperliquidContext = createContext<HyperliquidContextValue | null>(null)

export function HyperliquidProvider({ children }: { children: ReactNode }) {
  const { connected, wsRef } = useHyperliquid()

  return (
    <HyperliquidContext.Provider value={{ connected, wsRef }}>
      {children}
    </HyperliquidContext.Provider>
  )
}

export function useHyperliquidContext() {
  const ctx = useContext(HyperliquidContext)
  if (!ctx) {
    throw new Error('useHyperliquidContext must be used within HyperliquidProvider')
  }
  return ctx
}
