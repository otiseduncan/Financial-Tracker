"use client"

import { useRef, useEffect, useState } from "react"

const COLORS = [
  "#ef4444", "#f97316", "#eab308", "#22c55e", "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899",
  "#f43f5e", "#d97706", "#84cc16", "#14b8a6", "#0ea5e9", "#6366f1", "#a855f7", "#e11d48",
  "#b91c1c", "#c2410c", "#a16207", "#15803d", "#0e7490", "#1d4ed8", "#7c3aed", "#be185d",
  "#9f1239", "#9a3412", "#854d0e", "#166534", "#155e75", "#1e40af",
]

interface CategoryData {
  name: string
  amount: number
}

const RADIAN = Math.PI / 180
const LINE_H = 18

export function ExpensePieChart({ data }: { data: CategoryData[] }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [dims, setDims] = useState({ w: 800, h: 400 })

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const obs = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect
      if (width > 0 && height > 0) setDims({ w: width, h: height })
    })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const { w, h } = dims
  const total = data.reduce((s, d) => s + d.amount, 0)

  // Donut sizing — use available height, leave room for labels on sides
  const labelColWidth = 200
  const donutAreaW = w - labelColWidth * 2
  const maxR = Math.min(donutAreaW / 2, h / 2) - 10
  const outerR = Math.max(60, maxR)
  const innerR = outerR * 0.72
  const cx = w / 2
  const cy = h / 2

  // Build slices with angles (clockwise from top)
  let cumAngle = -90 // start at top
  const slices = data.map((d, i) => {
    const sweep = (d.amount / total) * 360
    const startA = cumAngle
    const endA = cumAngle + sweep
    const midA = (startA + endA) / 2
    cumAngle = endA
    return { ...d, startA, endA, midA, color: COLORS[i % COLORS.length] }
  })

  // Split labels left/right by which side their midpoint falls on
  const leftItems: typeof slices = []
  const rightItems: typeof slices = []
  slices.forEach((s) => {
    const mx = Math.cos(s.midA * RADIAN)
    if (mx >= 0) rightItems.push(s)
    else leftItems.push(s)
  })

  // Sort each side by Y position of their midpoint on the donut
  const sortByMidY = (a: typeof slices[0], b: typeof slices[0]) =>
    Math.sin(a.midA * RADIAN) - Math.sin(b.midA * RADIAN)
  leftItems.sort(sortByMidY)
  rightItems.sort(sortByMidY)

  // Space labels evenly, centered vertically
  function spaceLabels(items: typeof slices) {
    const totalH = items.length * LINE_H
    const startY = cy - totalH / 2
    return items.map((item, idx) => ({
      ...item,
      labelY: startY + idx * LINE_H + LINE_H / 2,
    }))
  }

  const spacedLeft = spaceLabels(leftItems)
  const spacedRight = spaceLabels(rightItems)

  const leftX = cx - outerR - 16
  const rightX = cx + outerR + 16

  // Build donut arc paths
  function arcPath(startDeg: number, endDeg: number, r: number, ir: number) {
    const s1 = startDeg * RADIAN
    const e1 = endDeg * RADIAN
    const largeArc = endDeg - startDeg > 180 ? 1 : 0
    const x1 = cx + r * Math.cos(s1)
    const y1 = cy + r * Math.sin(s1)
    const x2 = cx + r * Math.cos(e1)
    const y2 = cy + r * Math.sin(e1)
    const x3 = cx + ir * Math.cos(e1)
    const y3 = cy + ir * Math.sin(e1)
    const x4 = cx + ir * Math.cos(s1)
    const y4 = cy + ir * Math.sin(s1)
    return `M${x1},${y1} A${r},${r} 0 ${largeArc} 1 ${x2},${y2} L${x3},${y3} A${ir},${ir} 0 ${largeArc} 0 ${x4},${y4} Z`
  }

  // Tooltip state
  const [hover, setHover] = useState<number | null>(null)

  return (
    <div ref={containerRef} className="w-full h-full min-h-0">
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        {/* Donut slices */}
        {slices.map((s, i) => (
          <path
            key={i}
            d={arcPath(s.startA, s.endA - 0.3, outerR, innerR)}
            fill={s.color}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
            opacity={hover !== null && hover !== i ? 0.6 : 1}
            style={{ transition: "opacity 0.15s" }}
          />
        ))}

        {/* Left labels */}
        {spacedLeft.map((item, idx) => {
          const edgeX = cx + outerR * Math.cos(item.midA * RADIAN)
          const edgeY = cy + outerR * Math.sin(item.midA * RADIAN)
          return (
            <g key={`l-${idx}`}>
              <line x1={edgeX} y1={edgeY} x2={leftX} y2={item.labelY} stroke={item.color} strokeWidth={1} opacity={0.5} />
              <text x={leftX - 4} y={item.labelY} textAnchor="end" dominantBaseline="central" fill="hsl(var(--foreground))" fontSize={11}>
                {item.name} ${item.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </text>
            </g>
          )
        })}

        {/* Right labels */}
        {spacedRight.map((item, idx) => {
          const edgeX = cx + outerR * Math.cos(item.midA * RADIAN)
          const edgeY = cy + outerR * Math.sin(item.midA * RADIAN)
          return (
            <g key={`r-${idx}`}>
              <line x1={edgeX} y1={edgeY} x2={rightX} y2={item.labelY} stroke={item.color} strokeWidth={1} opacity={0.5} />
              <text x={rightX + 4} y={item.labelY} textAnchor="start" dominantBaseline="central" fill="hsl(var(--foreground))" fontSize={11}>
                {item.name} ${item.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </text>
            </g>
          )
        })}

        {/* Hover tooltip */}
        {hover !== null && (
          <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fill="hsl(var(--foreground))" fontSize={14} fontWeight="bold">
            {slices[hover].name}: ${slices[hover].amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </text>
        )}
      </svg>
    </div>
  )
}
