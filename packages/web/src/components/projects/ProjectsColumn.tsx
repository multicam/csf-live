import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { useProjects } from '@/hooks/useProjects'
import { usePresence } from '@/hooks/usePresence'
import { useMockStore } from '@/mocks/store'
import { ProjectCard } from './ProjectCard'
import { CreateProjectDialog } from './CreateProjectDialog'
import { cn } from '@/lib/utils'

type SortMode = 'recent' | 'alpha' | 'status'

export function ProjectsColumn() {
  const { data: projects = [] } = useProjects()
  const { data: presenceList = [] } = usePresence()
  const { users } = useMockStore()
  const [sortMode, setSortMode] = useState<SortMode>('recent')
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  const onlineUsers = presenceList
    .filter(p => p.status === 'online')
    .map(p => ({ presence: p, user: users.find(u => u.id === p.userId) }))
    .filter((x): x is { presence: typeof x.presence; user: NonNullable<typeof x.user> } => !!x.user)

  const sortedProjects = [...projects].sort((a, b) => {
    if (sortMode === 'alpha') return a.title.localeCompare(b.title)
    if (sortMode === 'status') return a.status.localeCompare(b.status)
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  })

  return (
    <div className="flex h-full flex-col pt-12">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-warm-400 dark:text-warm-500">
          Projects
        </span>
        <select
          className="text-xs text-warm-500 bg-transparent border-none outline-none cursor-pointer dark:text-warm-400"
          value={sortMode}
          onChange={e => setSortMode(e.target.value as SortMode)}
          aria-label="Sort projects"
        >
          <option value="recent">Recent</option>
          <option value="alpha">A–Z</option>
          <option value="status">Status</option>
        </select>
      </div>

      {/* General Feed link */}
      <Link
        to="/feed"
        className={cn(
          'mx-2 mb-1 flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
          'text-warm-700 hover:bg-warm-200 hover:text-warm-900',
          'dark:text-warm-300 dark:hover:bg-warm-800 dark:hover:text-warm-100',
          '[&.active]:bg-warm-200 [&.active]:text-warm-900 dark:[&.active]:bg-warm-800 dark:[&.active]:text-warm-100'
        )}
      >
        <span className="h-2 w-2 rounded-full bg-blue-400 flex-shrink-0" />
        General Feed
      </Link>

      {/* Project list */}
      <div className="flex-1 overflow-y-auto px-2 space-y-0.5">
        {sortedProjects.map(project => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>

      {/* Add project button */}
      <div className="px-2 py-2 border-t border-warm-200 dark:border-warm-800">
        <button
          onClick={() => setShowCreateDialog(true)}
          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-warm-500 hover:bg-warm-200 hover:text-warm-700 dark:text-warm-400 dark:hover:bg-warm-800 dark:hover:text-warm-300 transition-colors"
        >
          <Plus size={14} />
          New Project
        </button>
      </div>

      {/* Presence list */}
      {onlineUsers.length > 0 && (
        <div className="px-3 py-2 border-t border-warm-200 dark:border-warm-800">
          <div className="text-xs text-warm-400 dark:text-warm-500 mb-1 uppercase tracking-wide font-medium">
            Online
          </div>
          {onlineUsers.map(({ presence, user }) => (
            <div
              key={presence.userId}
              className="flex items-center gap-2 py-0.5 text-xs text-warm-600 dark:text-warm-400"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-green-500 flex-shrink-0" />
              {user.name}
            </div>
          ))}
        </div>
      )}

      {showCreateDialog && (
        <CreateProjectDialog onClose={() => setShowCreateDialog(false)} />
      )}
    </div>
  )
}
