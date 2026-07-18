'use client'

import { useSettingsStore } from '@/stores/settingsStore'
import Header from '@/components/Header'
import Chart from '@/components/Chart'
import Tape from '@/components/Tape'
import { useLoadCandles } from '@/hooks/useLoadCandles'
import { useShallow } from 'zustand/shallow'
import { useSubscribeCandles } from '@/hooks/useSubscribeCandles'
import Volume from '@/components/Volume'
import VolumeDelta from '@/components/VolumeDelta'
import { useSubscribeTrades } from '@/hooks/useSubscribeTrades'
import VolumeProfile from '@/components/VolumeProfile'
import VolumeProfileDelta from '@/components/VolumeProfileDelta'

export default function Dashboard() {
  const { coin, timeframe } = useSettingsStore(
    useShallow((s) => ({
      coin: s.coin,
      timeframe: s.timeframe,
    })),
  )
  const isFetching = useLoadCandles(coin, timeframe)
  useSubscribeCandles(coin, timeframe, isFetching)
  useSubscribeTrades(coin, isFetching)

  return (
    <main className="flex flex-col flex-1 min-h-0 overflow-hidden">
      <Header />
      <div className="flex flex-row flex-1 min-h-0 overflow-hidden">
        <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="flex flex-col flex-[14] min-h-0 overflow-hidden">
            <Chart />
          </div>
          <div className="flex flex-col flex-[3] min-h-0 overflow-hidden">
            <Volume />
          </div>
          <div className="flex flex-col flex-[3] min-h-0 overflow-hidden">
            <VolumeDelta />
          </div>
        </div>
        <div className="flex flex-col w-[21rem] shrink-0 border-l border-zinc-800 overflow-hidden">
          <div className="flex flex-row flex-[14] min-h-0 overflow-hidden">
            <div className="w-48 shrink-0 overflow-hidden">
              <VolumeProfile />
            </div>
            <div className="w-36 shrink-0 border-l border-zinc-800 overflow-hidden">
              <VolumeProfileDelta />
            </div>
          </div>
          <div className="flex flex-col flex-[6] min-h-0 border-t border-zinc-800 overflow-hidden">
            <Tape />
          </div>
        </div>
      </div>
    </main>
  )
}
