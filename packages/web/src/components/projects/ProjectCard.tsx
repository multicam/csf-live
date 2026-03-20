import { useState } from 'react'
import { Link, useParams } from '@tanstack/react-router'
import * as ContextMenu from '@radix-ui/react-context-menu'
import type { Project } from '@csf-live/shared'
import { cn } from '@/lib/utils'
import { useMoveContentItem } from '@/hooks/useContentItem'
import { useNotifications } from '@/hooks/useNotifications'

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-500',
  paused: 'bg-yellow-500',
  archived: 'bg-warm-400',
  completed: 'bg-blue-500',
}

interface ProjectCardProps {
  project: Project
}

export function ProjectCard({ project }: ProjectCardProps) {
  // Use strict: false to read params outside the route they're defined in
  const params = useParams({ strict: false })
  // params may have a `slug` key depending on current route
  const isActive = (params as Record<string, string>).slug === project.slug

  const [isDragOver, setIsDragOver] = useState(false)
  const moveItem = useMoveContentItem()

  const { data: notifications = [] } = useNotifications()
  const unreadCount = notifications.filter(
    n => n.referenceType === 'project' && n.referenceId === project.id && !n.read
  ).length

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setIsDragOver(true)
  }

  function handleDragLeave() {
    setIsDragOver(false)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragOver(false)
    const itemId = e.dataTransfer.getData('text/plain')
    if (!itemId) return
    moveItem.mutate({ itemId, projectId: project.id })
  }

  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger asChild>
        <Link
          to="/feed/$slug"
          params={{ slug: project.slug }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            'flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors',
            'text-warm-700 hover:bg-warm-200 hover:text-warm-900',
            'dark:text-warm-300 dark:hover:bg-warm-800 dark:hover:text-warm-100',
            isActive &&
              'bg-warm-200 text-warm-900 dark:bg-warm-800 dark:text-warm-100',
            isDragOver && 'ring-2 ring-warm-500'
          )}
        >
          <span
            className={cn(
              'h-2 w-2 rounded-full flex-shrink-0',
              STATUS_COLORS[project.status] ?? 'bg-warm-400'
            )}
          />
          <span className="flex-1 truncate">{project.title}</span>
          {unreadCount > 0 && (
            <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-medium text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>
      </ContextMenu.Trigger>

      <ContextMenu.Portal>
        <ContextMenu.Content className="z-50 min-w-40 rounded-lg border border-warm-200 bg-white p-1 shadow-lg dark:border-warm-700 dark:bg-warm-900">
          <ContextMenu.Item
            className="flex cursor-not-allowed items-center rounded-md px-3 py-2 text-sm text-warm-600 hover:bg-warm-100 dark:text-warm-400 dark:hover:bg-warm-800 outline-none opacity-60"
            disabled
          >
            Archive
          </ContextMenu.Item>
          <ContextMenu.Item
            className="flex cursor-not-allowed items-center rounded-md px-3 py-2 text-sm text-warm-600 hover:bg-warm-100 dark:text-warm-400 dark:hover:bg-warm-800 outline-none opacity-60"
            disabled
          >
            Settings
          </ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  )
}
