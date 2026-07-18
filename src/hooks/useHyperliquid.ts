'use client'

import { useEffect, useState, useRef, useCallback } from 'react'

const WS_URL = 'wss://api.hyperliquid.xyz/ws'
const BASE_DELAY = 1000
const MAX_DELAY = 30000
const PING_INTERVAL = 25000
const PONG_TIMEOUT = 5000

function backoff(attempt: number): number {
  const exp = Math.min(MAX_DELAY, BASE_DELAY * Math.pow(2, attempt))
  const jitter = Math.random() * 0.3 * exp
  return Math.round(exp + jitter)
}

export function useHyperliquid() {
  const [connected, setConnected] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)
  const retryRef = useRef(0)
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pingRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const mountedRef = useRef(false)
  const connectRef = useRef<() => void>(() => {})
  const pongTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const onMessage = useCallback((event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data)
      if (data.method === 'pong') {
        if (pongTimeoutRef.current) {
          clearTimeout(pongTimeoutRef.current)
          pongTimeoutRef.current = null
        }
      }
    } catch (error) {
      console.error(error)
    }
  }, [])

  const onOpen = useCallback(() => {
    if (!mountedRef.current) {
      wsRef.current?.close()
      return
    }
    retryRef.current = 0
    setConnected(true)

    pingRef.current = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ method: 'ping' }))
        pongTimeoutRef.current = setTimeout(() => {
          wsRef.current?.close()
        }, PONG_TIMEOUT)
      }
    }, PING_INTERVAL)
  }, [])

  const onError = useCallback(() => {
    wsRef.current?.close()
  }, [])

  const scheduleReconnect = useCallback(() => {
    const ms = backoff(retryRef.current)
    retryRef.current += 1
    reconnectRef.current = setTimeout(() => {
      if (mountedRef.current) connectRef.current()
    }, ms)
  }, [])

  const onClose = useCallback(() => {
    setConnected(false)
    if (pingRef.current) {
      clearInterval(pingRef.current)
      pingRef.current = null
    }
    if (mountedRef.current) scheduleReconnect()
  }, [scheduleReconnect])

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return

    wsRef.current = new WebSocket(WS_URL)
    wsRef.current.onopen = onOpen
    wsRef.current.onclose = onClose
    wsRef.current.onerror = onError
    wsRef.current.onmessage = onMessage
  }, [onOpen, onClose, onError, onMessage])

  useEffect(() => {
    connectRef.current = connect
  }, [connect])

  useEffect(() => {
    mountedRef.current = true
    retryRef.current = 0
    connect()

    const ws = wsRef.current

    return () => {
      mountedRef.current = false
      if (reconnectRef.current) {
        clearTimeout(reconnectRef.current)
        reconnectRef.current = null
      }
      if (pingRef.current) {
        clearInterval(pingRef.current)
        pingRef.current = null
      }
      if (pongTimeoutRef.current) {
        clearTimeout(pongTimeoutRef.current)
        pongTimeoutRef.current = null
      }
      if (ws) {
        ws.onopen = null
        ws.onclose = null
        ws.onerror = null
        ws.onmessage = null
        ws.close()
      }
    }
  }, [connect])

  return { connected, wsRef }
}
