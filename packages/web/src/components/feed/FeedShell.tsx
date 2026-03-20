import { useState, useCallback, useRef, useEffect } from 'react'
import { Outlet } from '@tanstack/react-router'
import { AppMenu } from '@/components/shared/AppMenu'
import { ProjectsColumn } from '@/components/projects/ProjectsColumn'
import { useBreakpoint } from '@/hooks/useBreakpoint'
import { cn } from '@/lib/utils'

const MIN_COL1 = 180
const MAX_COL1 = 400
const MIN_COL2 = 300
const DEFAULT_COL1 = 240

function loadColWidth(): number {
  const stored = localStorage.getItem('col1Width')
  return stored
    ? Math.max(MIN_COL1, Math.min(MAX_COL1, Number(stored)))
    : DEFAULT_COL1
}

export function FeedShell() {
  const breakpoint = useBreakpoint()
  const [col1Width, setCol1Width] = useState(loadColWidth)
  const [col1Collapsed, setCol1Collapsed] = useState(false)
  const dragging = useRef(false)
  const startX = useRef(0)
  const startWidth = useRef(0)

  // Persist col width
  useEffect(() => {
    localStorage.setItem('col1Width', String(col1Width))
  }, [col1Width])

  // Cmd+\ to toggle projects column
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === '\\') {
        e.preventDefault()
        setCol1Collapsed(c => !c)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const onDividerPointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault()
      dragging.current = true
      startX.current = e.clientX
      startWidth.current = col1Width

      function onMove(ev: PointerEvent) {
        if (!dragging.current) return
        const delta = ev.clientX - startX.current
        const newWidth = Math.max(
          MIN_COL1,
          Math.min(MAX_COL1, startWidth.current + delta)
        )
        setCol1Width(newWidth)
      }

      function onUp() {
        dragging.current = false
        window.removeEventListener('pointermove', onMove)
        window.removeEventListener('pointerup', onUp)
      }

      window.addEventListener('pointermove', onMove)
      window.addEventListener('pointerup', onUp)
    },
    [col1Width]
  )

  if (breakpoint === 'mobile') {
    return (
      <div className="flex h-screen flex-col">
        <div className="flex-1 overflow-hidden">
          <Outlet />
        </div>
        {/* Mobile tab bar placeholder — Task 3.19 */}
      </div>
    )
  }

  const showCol1 = !col1Collapsed

  return (
    <div className="flex h-screen overflow-hidden bg-warm-50 dark:bg-warm-950">
      {/* App Menu button — fixed top-left */}
      <div className="fixed top-2 left-2 z-40">
        <AppMenu />
      </div>

      {/* Column 1 — Projects */}
      <div
        className={cn(
          'flex-shrink-0 overflow-hidden border-r border-warm-200 dark:border-warm-800 transition-[width] duration-200'
        )}
        style={{ width: showCol1 ? col1Width : 0 }}
      >
        <ProjectsColumn />
      </div>

      {/* Drag divider */}
      {showCol1 && (
        <div
          className="w-1 flex-shrink-0 cursor-col-resize bg-transparent hover:bg-warm-300 dark:hover:bg-warm-700 transition-colors"
          onPointerDown={onDividerPointerDown}
          role="separator"
          aria-orientation="vertical"
          tabIndex={0}
          onKeyDown={e => {
            if (e.key === 'ArrowLeft')
              setCol1Width(w => Math.max(MIN_COL1, w - 10))
            if (e.key === 'ArrowRight')
              setCol1Width(w => Math.min(MAX_COL1, w + 10))
          }}
        />
      )}

      {/* Column 2 — Feed (main content from child routes) */}
      <div
        className="flex min-w-0 flex-1 flex-col overflow-hidden"
        style={{ minWidth: MIN_COL2 }}
      >
        <Outlet />
      </div>
    </div>
  )
}
