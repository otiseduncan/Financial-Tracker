"use client"

import React, { useState, useCallback } from "react"
import {
  Responsive,
  useContainerWidth,
  type Layout,
  type ResponsiveLayouts,
} from "react-grid-layout"

const STORAGE_KEY = "dashboard-grid-layouts-v6"

interface DashboardGridProps {
  children: React.ReactNode[]
  itemKeys: string[]
  defaultLayouts: ResponsiveLayouts
}

function loadLayouts(): ResponsiveLayouts | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function saveLayouts(layouts: ResponsiveLayouts) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(layouts))
  } catch { /* ignore */ }
}

export function DashboardGrid({ children, itemKeys, defaultLayouts }: DashboardGridProps) {
  const { width, containerRef } = useContainerWidth()
  const [layouts, setLayouts] = useState<ResponsiveLayouts>(() => loadLayouts() || defaultLayouts)

  const onLayoutChange = useCallback((_layout: Layout, allLayouts: ResponsiveLayouts) => {
    setLayouts(allLayouts)
    saveLayouts(allLayouts)
  }, [])

  const handleReset = useCallback(() => {
    setLayouts(defaultLayouts)
    saveLayouts(defaultLayouts)
  }, [defaultLayouts])

  return (
    <div ref={containerRef as React.RefObject<HTMLDivElement>}>
      <div className="flex justify-end mb-2">
        <button
          onClick={handleReset}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded border border-border"
        >
          Reset Layout
        </button>
      </div>
      {width > 0 && (
        <Responsive
          className="layout"
          width={width}
          layouts={layouts}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480 }}
          cols={{ lg: 12, md: 10, sm: 6, xs: 4 }}
          rowHeight={60}
          onLayoutChange={onLayoutChange}
          dragConfig={{ handle: ".drag-handle" }}
          margin={[16, 16]}
          containerPadding={[0, 0]}
        >
          {children.map((child, i) => (
            <div key={itemKeys[i]} className="overflow-hidden">
              {child}
            </div>
          ))}
        </Responsive>
      )}
    </div>
  )
}