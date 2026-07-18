'use client'

import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import type { L2Book } from '@/lib/types'

interface Props {
  l2Book: L2Book | null
  currentPrice: number
}

export default function DeltaByLevels({ l2Book, currentPrice }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!ref.current || !svgRef.current) return

    const width = ref.current.clientWidth
    const height = ref.current.clientHeight
    const margin = { top: 10, bottom: 10, left: 50, right: 10 }

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const innerW = width - margin.left - margin.right
    const innerH = height - margin.top - margin.bottom

    const levels: { price: number; delta: number; bidVol: number; askVol: number }[] = []

    if (l2Book) {
      const all = [
        ...l2Book.bids.slice(0, 15).map(b => ({ price: b.px, delta: b.sz, bidVol: b.sz, askVol: 0 })),
        ...l2Book.asks.slice(0, 15).map(a => ({ price: a.px, delta: -a.sz, bidVol: 0, askVol: a.sz })),
      ].sort((a, b) => a.price - b.price)
      levels.push(...all)
    }

    if (levels.length === 0) {
      svg.append('text')
        .attr('x', width / 2).attr('y', height / 2)
        .attr('text-anchor', 'middle').attr('fill', '#52525b')
        .style('font-size', '11px')
        .text('No data')
      return
    }

    const prices = levels.map(d => d.price)
    const pMin = d3.min(prices) || 0
    const pMax = d3.max(prices) || 0

    const yPrice = d3.scaleLinear()
      .domain([pMin - 0.5, pMax + 0.5])
      .range([innerH, 0])

    const maxDelta = d3.max(levels, d => Math.abs(d.delta)) || 1
    const xDelta = d3.scaleLinear()
      .domain([-maxDelta * 1.1, maxDelta * 1.1])
      .range([0, innerW])

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    levels.forEach(d => {
      const y0 = yPrice(d.price - 0.25)
      const y1 = yPrice(d.price + 0.25)
      const barH = Math.max(1, y1 - y0)
      const x0 = xDelta(0)
      const x1 = xDelta(d.delta)

      if (d.delta >= 0) {
        g.append('rect')
          .attr('x', x0).attr('y', y1)
          .attr('width', x1 - x0).attr('height', barH)
          .attr('fill', '#22c55e').attr('opacity', 0.5)
      } else {
        g.append('rect')
          .attr('x', x1).attr('y', y1)
          .attr('width', x0 - x1).attr('height', barH)
          .attr('fill', '#ef4444').attr('opacity', 0.5)
      }
    })

    g.append('line')
      .attr('x1', xDelta(0)).attr('x2', xDelta(0))
      .attr('y1', 0).attr('y2', innerH)
      .attr('stroke', '#52525b').attr('stroke-width', 0.5)

    if (currentPrice) {
      const y = yPrice(currentPrice)
      const isVisible = y >= 0 && y <= innerH
      if (isVisible) {
        g.append('line')
          .attr('x1', 0).attr('x2', innerW)
          .attr('y1', y).attr('y2', y)
          .attr('stroke', '#eab308')
          .attr('stroke-width', 1)
          .attr('stroke-dasharray', '3,3')
      }
    }

    const yAxis = d3.axisRight(yPrice)
      .ticks(Math.floor(innerH / 20))
      .tickFormat(d => (d as number).toFixed(2))

    svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)
      .call(yAxis)
      .style('color', '#71717a')
      .style('font-size', '9px')

  }, [l2Book, currentPrice])

  return (
    <div className="flex flex-col h-full border-t border-zinc-800">
      <div className="text-xs text-zinc-400 font-medium px-2 py-1">Delta by Levels</div>
      <div ref={ref} className="flex-1 min-h-0">
        <svg ref={svgRef} className="w-full h-full" />
      </div>
    </div>
  )
}
