export interface Candle {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface Trade {
  price: number
  size: number
  side: 'buy' | 'sell'
  time: number
  hash?: string
}

export interface BookLevel {
  px: number
  sz: number
  n: number
}

export interface L2Book {
  coin: string
  bids: BookLevel[]
  asks: BookLevel[]
}

export type CandleInterval = '1m' | '5m' | '15m' | '1h' | '4h' | '1d'

export interface VolumeLevel {
  price: number
  volume: number
  delta: number
}

export interface HlCandle {
  t: number
  T: number
  s: string
  i: string
  o: string
  c: string
  h: string
  l: string
  v: string
  n: number
}

export type HlSide = 'A' | 'B'

export interface HlTrade {
  px: string
  sz: string
  side: HlSide
  time: number
  hash?: string
  tid?: number
}

export interface HlBookLevel {
  px: string
  sz: string
  n: number
}

export interface HlL2Book {
  coin: string
  time: number
  levels: HlBookLevel[][]
}

export interface WsMessage<T = HlCandle | HlCandle[] | HlTrade[] | HlL2Book> {
  channel: string
  data: T
}
