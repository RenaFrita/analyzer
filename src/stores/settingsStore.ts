import { create } from 'zustand'

export const TIME_FRAMES = ['1m', '5m', '15m', '1h', '4h', '1d'] as const

export const COINS = [
  'BTC',
  'ETH',
  'SOL',
  'ARB',
  'OP',
  'PEPE',
  'DOGE',
  'HYPE',
  'AAVE',
  'LINK',
  'UNI',
  'AVAX',
  'MATIC',
  'ATOM',
  'APT',
  'SUI',
  'SEI',
  'TIA',
  'DYDX',
  'BLUR',
  'xyz:SP500',
  'xyz:XYZ100',
  'xyz:DRAM',
  'xyz:CL',
] as const

export type TimeFrame = (typeof TIME_FRAMES)[number]
export type Coin = (typeof COINS)[number]

interface SettingsState {
  coin: Coin
  timeframe: TimeFrame
  minBigTradeSize: number
  alarmEnabled: boolean
  setCoin: (coin: Coin) => void
  setTimeframe: (timeframe: TimeFrame) => void
  setMinBigTradeSize: (size: number) => void
  setAlarmEnabled: (enabled: boolean) => void
}

export const useSettingsStore = create<SettingsState>((set) => ({
  coin: 'BTC',
  timeframe: '1m',
  minBigTradeSize: 1,
  alarmEnabled: false,
  setCoin: (coin) => set({ coin }),
  setTimeframe: (timeframe) => set({ timeframe }),
  setMinBigTradeSize: (size) => set({ minBigTradeSize: size }),
  setAlarmEnabled: (enabled) => set({ alarmEnabled: enabled }),
}))
