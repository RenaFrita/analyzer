'use client'

import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { useTrades } from '@/stores/tradesStore'
import { useCandles } from '@/stores/candlesStore'

interface CumDeltaCandle {
  time: number
  open: number
  high: number
  low: number
  close: number
}

export default function VolumeDelta() {
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const trades = useTrades()
  const candles = useCandles()

  useEffect(() => {
    const data = candles.filter(
      (c) =>
        isFinite(c.time) &&
        isFinite(c.open) &&
        isFinite(c.high) &&
        isFinite(c.low) &&
        isFinite(c.close) &&
        isFinite(c.volume),
    )

    const container = containerRef.current
    const svgEl = svgRef.current
    if (!container || !svgEl || data.length === 0) return

    const width = container.clientWidth
    const height = container.clientHeight
    if (width < 10 || height < 10) return

    const margin = { top: 5, right: 60, bottom: 20, left: 10 }
    const innerW = width - margin.left - margin.right
    const innerH = height - margin.top - margin.bottom

    const xDomain = [data[0].time, data[data.length - 1].time]
    const xPad = (xDomain[1] - xDomain[0]) * 0.05
    const xScale = d3
      .scaleLinear()
      .domain([xDomain[0] - xPad, xDomain[1] + xPad])
      .range([0, innerW])

    const sortedTrades = [...trades].sort((a, b) => a.time - b.time)

    let runningCum = 0
    let tradeIdx = 0
    const cumCandles: CumDeltaCandle[] = []

    for (let i = 0; i < data.length; i++) {
      const candleStart = data[i].time
      const candleEnd = i + 1 < data.length ? data[i + 1].time : Infinity

      const open = runningCum
      let high = open
      let low = open

      while (tradeIdx < sortedTrades.length && sortedTrades[tradeIdx].time < candleEnd) {
        const t = sortedTrades[tradeIdx]
        if (t.time >= candleStart) {
          const delta = t.side === 'buy' ? t.size : -t.size
          runningCum += delta
          if (runningCum > high) high = runningCum
          if (runningCum < low) low = runningCum
        }
        tradeIdx++
      }

      cumCandles.push({ time: candleStart, open, high, low, close: runningCum })
    }

    if (cumCandles.length === 0) return

    const maxPrice = d3.max(cumCandles, (d) => d.high) || 0
    const minPrice = d3.min(cumCandles, (d) => d.low) || 0
    const yPad = Math.max(maxPrice - minPrice, 1) * 0.05
    const yScale = d3
      .scaleLinear()
      .domain([minPrice - yPad, maxPrice + yPad])
      .range([innerH, 0])

    const svg = d3.select(svgEl)
    svg.selectAll('*').remove()
    svg.attr('width', width).attr('height', height)

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

    if (minPrice < 0 && maxPrice > 0) {
      g.append('line')
        .attr('x1', 0)
        .attr('x2', innerW)
        .attr('y1', yScale(0))
        .attr('y2', yScale(0))
        .attr('stroke', '#52525b')
        .attr('stroke-width', 0.5)
        .attr('stroke-dasharray', '3,3')
    }

    const cw = Math.max(1, (innerW / cumCandles.length) * 0.6)
    const candleWidth = Math.max(1, cw * 0.5)
    const wickWidth = 1

    cumCandles.forEach((c) => {
      const x = xScale(c.time)
      if (!isFinite(x)) return

      const color = c.close >= c.open ? '#22c55e' : '#ef4444'
      const yOpen = yScale(c.open)
      const yClose = yScale(c.close)
      const yHigh = yScale(c.high)
      const yLow = yScale(c.low)
      const bodyTop = Math.min(yOpen, yClose)
      const bodyBottom = Math.max(yOpen, yClose)

      g.append('line')
        .attr('x1', x)
        .attr('x2', x)
        .attr('y1', yHigh)
        .attr('y2', yLow)
        .attr('stroke', color)
        .attr('stroke-width', wickWidth)

      g.append('rect')
        .attr('x', x - candleWidth / 2)
        .attr('width', candleWidth)
        .attr('y', bodyTop)
        .attr('height', Math.max(1, bodyBottom - bodyTop))
        .attr('fill', color)
        .attr('opacity', 0.6)
    })

    const timeSpan = xDomain[1] - xDomain[0]
    svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top + innerH})`)
      .call(
        d3
          .axisBottom(xScale)
          .ticks(6)
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

    svg
      .append('g')
      .attr('transform', `translate(${width - margin.right},${margin.top})`)
      .call(
        d3
          .axisRight(yScale)
          .ticks(4)
          .tickFormat((d) => (d as number).toFixed(0)),
      )
      .style('color', '#71717a')
      .style('font-size', '10px')
  }, [candles, trades])

  return (
    <div ref={containerRef} className="w-full h-full overflow-hidden">
      <svg ref={svgRef} className="w-full h-full" />
    </div>
  )
}
