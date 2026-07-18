'use client'

import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { useTrades } from '@/stores/tradesStore'
import { useCandles } from '@/stores/candlesStore'
import { useSettingsStore } from '@/stores/settingsStore'

export default function Chart() {
  const candles = useCandles()
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const trades = useTrades()
  const minBigTradeSize = useSettingsStore((s) => s.minBigTradeSize)
  const alarmEnabled = useSettingsStore((s) => s.alarmEnabled)

  useEffect(() => {
    const container = containerRef.current
    const svgEl = svgRef.current
    if (!container || !svgEl || candles.length === 0) return

    const width = container.clientWidth
    const height = container.clientHeight
    if (width < 10 || height < 10) return

    const svg = d3.select(svgEl)
    const margin = { top: 10, right: 60, bottom: 25, left: 10 }
    const innerW = width - margin.left - margin.right
    const innerH = height - margin.top - margin.bottom

    const xDomain = [candles[0].time, candles[candles.length - 1].time]
    const xPad = (xDomain[1] - xDomain[0]) * 0.05
    const xScale = d3
      .scaleLinear()
      .domain([xDomain[0] - xPad, xDomain[1] + xPad])
      .range([0, innerW])

    const priceLo = d3.min(candles, (d) => d.low) || 0
    const priceHi = d3.max(candles, (d) => d.high) || 0
    const yPad = (priceHi - priceLo) * 0.05 || priceHi * 0.01
    const yScale = d3
      .scaleLinear()
      .domain([priceLo - yPad, priceHi + yPad])
      .range([innerH, 0])

    const cw = Math.max(1, (innerW / candles.length) * 0.6)

    svg.selectAll('*').remove()
    svg.attr('width', width).attr('height', height)

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

    candles.forEach((c) => {
      const x = xScale(c.time)
      if (!isFinite(x)) return
      const up = c.close >= c.open
      const color = up ? '#22c55e' : '#ef4444'

      const highY = yScale(c.high)
      const lowY = yScale(c.low)
      if (isFinite(highY) && isFinite(lowY)) {
        g.append('line')
          .attr('x1', x)
          .attr('x2', x)
          .attr('y1', highY)
          .attr('y2', lowY)
          .attr('stroke', color)
          .attr('stroke-width', 1)
      }

      const bodyTop = yScale(Math.max(c.open, c.close))
      const bodyBot = yScale(Math.min(c.open, c.close))
      const bodyH = isFinite(bodyTop) && isFinite(bodyBot) ? Math.max(1, bodyBot - bodyTop) : 0
      g.append('rect')
        .attr('x', x - cw / 2)
        .attr('width', cw)
        .attr('y', bodyTop)
        .attr('height', bodyH)
        .attr('fill', color)
    })

    svg
      .append('g')
      .attr('transform', `translate(${width - margin.right},${margin.top})`)
      .call(
        d3
          .axisRight(yScale)
          .ticks(8)
          .tickFormat((d) => (d as number).toFixed(2)),
      )
      .style('color', '#71717a')
      .style('font-size', '10px')

    const timeSpan = xDomain[1] - xDomain[0]
    svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top + innerH})`)
      .call(
        d3
          .axisBottom(xScale)
          .ticks(8)
          .tickFormat((d) => {
            const date = new Date(d as number)
            if (timeSpan > 86400000 * 3) return `${date.getMonth() + 1}/${date.getDate()}`
            if (timeSpan > 86400000)
              return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}h`
            return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
          }),
      )
      .style('color', '#71717a')
      .style('font-size', '10px')

    if (trades && minBigTradeSize && trades.length > 0) {
      const threshold = minBigTradeSize
      const big = trades.filter((t) => t.size >= threshold)
      const tradeG = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

      big.forEach((t) => {
        const cx = xScale(t.time)
        const cy = yScale(t.price)
        if (!isFinite(cx) || !isFinite(cy)) return
        tradeG
          .append('circle')
          .attr('cx', cx)
          .attr('cy', cy)
          .attr('r', 3)
          .attr('fill', t.side === 'buy' ? '#22c55e' : '#ef4444')
          .attr('opacity', 0.7)
          .attr('stroke', 'none')
      })
    }
  }, [candles, trades, minBigTradeSize])

  const bigTradeCountRef = useRef(0)
  const lastTradeTimeRef = useRef(0)

  useEffect(() => {
    if (!alarmEnabled) return
    const threshold = minBigTradeSize
    const big = trades.filter((t) => t.size >= threshold)

    if (big.length < bigTradeCountRef.current) {
      bigTradeCountRef.current = 0
    }

    if (big.length > bigTradeCountRef.current) {
      const start = bigTradeCountRef.current
      for (let i = start; i < big.length; i++) {
        const t = big[i]
        if (t.time <= lastTradeTimeRef.current) continue
        lastTradeTimeRef.current = t.time
        try {
          const audio = new Audio(t.side === 'buy' ? '/long.mp3' : '/short.mp3')
          audio.volume = 0.3
          audio.play()
        } catch {}
      }
      bigTradeCountRef.current = big.length
    }
  }, [trades, minBigTradeSize, alarmEnabled])

  return (
    <div ref={containerRef} className="flex-1 min-h-0 overflow-hidden">
      <svg ref={svgRef} className="w-full h-full overflow-hidden" />
    </div>
  )
}
