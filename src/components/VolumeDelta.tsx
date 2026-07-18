'use client'

import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { useTrades } from '@/stores/tradesStore'
import { useCandles } from '@/stores/candlesStore'

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

    const deltaMap = new Map<number, number>()
    for (const c of data) deltaMap.set(c.time, 0)
    for (const t of trades) {
      const bucket = [...deltaMap.keys()].reverse().find((k) => t.time >= k)
      if (bucket) {
        deltaMap.set(bucket, deltaMap.get(bucket)! + (t.side === 'buy' ? t.size : -t.size))
      }
    }

    const deltas = data.map((c) => deltaMap.get(c.time) || 0)
    const maxDelta = d3.max(deltas.map(Math.abs)) || 0
    const yScale = d3
      .scaleLinear()
      .domain([-maxDelta * 1.1, maxDelta * 1.1])
      .range([innerH, 0])

    const cw = Math.max(1, (innerW / data.length) * 0.6)

    const svg = d3.select(svgEl)
    svg.selectAll('*').remove()
    svg.attr('width', width).attr('height', height)

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

    g.append('line')
      .attr('x1', 0)
      .attr('x2', innerW)
      .attr('y1', yScale(0))
      .attr('y2', yScale(0))
      .attr('stroke', '#52525b')
      .attr('stroke-width', 0.5)
      .attr('stroke-dasharray', '3,3')

    data.forEach((c) => {
      const x = xScale(c.time)
      if (!isFinite(x)) return
      const net = deltaMap.get(c.time) || 0
      const color = net >= 0 ? '#22c55e' : '#ef4444'
      const y0 = yScale(0)
      const y1 = yScale(net)
      const barH = Math.abs(y1 - y0)
      g.append('rect')
        .attr('x', x - cw / 2)
        .attr('width', cw)
        .attr('y', Math.min(y0, y1))
        .attr('height', Math.max(0, barH))
        .attr('fill', color)
        .attr('opacity', 0.6)
    })

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
  }, [candles, trades])

  return (
    <div ref={containerRef} className="w-full h-full overflow-hidden">
      <svg ref={svgRef} className="w-full h-full" />
    </div>
  )
}
