'use client'

import { useEffect, useRef, useMemo } from 'react'
import * as d3 from 'd3'
import { useTrades } from '@/stores/tradesStore'
import { useCandles } from '@/stores/candlesStore'

const BUCKETS = 40

export default function VolumeProfile() {
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const trades = useTrades()
  const candles = useCandles()

  const valid = useMemo(
    () =>
      candles.filter(
        (c) =>
          isFinite(c.time) && isFinite(c.open) && isFinite(c.high) && isFinite(c.low) && isFinite(c.close) && isFinite(c.volume),
      ),
    [candles],
  )

  const priceLow = useMemo(() => (valid.length > 0 ? d3.min(valid, (d) => d.low)! : 0), [valid])
  const priceHigh = useMemo(() => (valid.length > 0 ? d3.max(valid, (d) => d.high)! : 0), [valid])

  useEffect(() => {
    const container = containerRef.current
    const svgEl = svgRef.current
    if (!container || !svgEl || candles.length === 0) return

    const width = container.clientWidth
    const height = container.clientHeight
    if (width < 10 || height < 10) return

    const pad = (priceHigh - priceLow) * 0.05 || priceHigh * 0.01
    const lo = priceLow - pad
    const hi = priceHigh + pad
    const bucketSize = (hi - lo) / BUCKETS

    const buckets = Array.from({ length: BUCKETS }, (_, i) => ({
      priceLo: lo + i * bucketSize,
      priceHi: lo + (i + 1) * bucketSize,
      buyVol: 0,
      sellVol: 0,
    }))

    for (const t of trades) {
      if (t.price < lo || t.price >= hi) continue
      const idx = Math.min(Math.floor((t.price - lo) / bucketSize), BUCKETS - 1)
      if (t.side === 'buy') buckets[idx].buyVol += t.size
      else buckets[idx].sellVol += t.size
    }

    const maxVol = d3.max(buckets, (b) => b.buyVol + b.sellVol) || 0
    const margin = { top: 10, right: 10, bottom: 25, left: 60 }
    const innerW = width - margin.left - margin.right
    const innerH = height - margin.top - margin.bottom

    const yScale = d3.scaleLinear().domain([lo, hi]).range([innerH, 0])
    const xScale = d3
      .scaleLinear()
      .domain([0, maxVol * 1.1])
      .range([0, innerW])

    const svg = d3.select(svgEl)
    svg.selectAll('*').remove()
    svg.attr('width', width).attr('height', height)

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

    buckets.forEach((b) => {
      const y0 = yScale(b.priceLo)
      const y1 = yScale(b.priceHi)
      const barH = Math.max(1, y0 - y1)

      const total = b.buyVol + b.sellVol
      if (total === 0) return

      if (b.buyVol > 0) {
        const buyW = xScale(b.buyVol)
        g.append('rect')
          .attr('x', 0)
          .attr('y', y1)
          .attr('width', buyW)
          .attr('height', barH)
          .attr('fill', '#22c55e')
          .attr('opacity', 0.5)
      }

      if (b.sellVol > 0) {
        const sellW = xScale(b.sellVol)
        const buyW = xScale(b.buyVol)
        g.append('rect')
          .attr('x', buyW)
          .attr('y', y1)
          .attr('width', sellW)
          .attr('height', barH)
          .attr('fill', '#ef4444')
          .attr('opacity', 0.5)
      }
    })

    svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)
      .call(
        d3
          .axisLeft(yScale)
          .ticks(8)
          .tickFormat((d) => (d as number).toFixed(2)),
      )
      .style('color', '#71717a')
      .style('font-size', '10px')
  }, [candles, trades, priceLow, priceHigh])

  return (
    <div ref={containerRef} className="w-full h-full overflow-hidden">
      <svg ref={svgRef} className="w-full h-full" />
    </div>
  )
}
