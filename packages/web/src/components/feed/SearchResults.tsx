import { useEffect, useRef } from 'react'
import {
  FileText,
  Lightbulb,
  Pencil,
  Link2,
  Mic,
  Camera,
  Search,
  File,
  Image,
} from 'lucide-react'
import type { ContentItemWithSnippet } from '@/lib/search'
import { CONTENT_TYPE_LABELS } from '@csf-live/shared/constants'
import { useMockStore } from '@/mocks/store'
import { formatDistanceToNow } from '@/lib/time'
import { cn } from '@/lib/utils'

const TYPE_ICONS: Record<string, React.ComponentType<{ size?: number }>> = {
  idea: Lightbulb,
  document: FileText,
  drawing: Pencil,
  sketch: Image,
  link: Link2,
  voice: Mic,
  photo: Camera,
  research: Search,
  file: File,
}

/**
 * Wrap each occurrence of `term` in the text with <mark>.
 */
function HighlightedSnippet({ text, term }: { text: string; term: string }) {
  if (!term.trim()) return <span>{text}</span>

  const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const parts = text.split(new RegExp(`(${escapedTerm})`, 'gi'))

  return (
    <span>
      {parts.map((part, i) =>
        part.toLowerCase() === term.toLowerCase() ? (
          <mark key={i} className="bg-yellow-200 text-yellow-900 dark:bg-yellow-700 dark:text-yellow-100 rounded-sm px-0.5">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  )
}

interface SearchResultsProps {
  results: ContentItemWithSnippet[]
  query: string
  selectedIndex: number
  onChangeSelectedIndex: (index: number) => void
  onSelect: (item: ContentItemWithSnippet) => void
}

export function SearchResults({
  results,
  query,
  selectedIndex,
  onChangeSelectedIndex,
  onSelect,
}: SearchResultsProps) {
  const { users, projects, sections } = useMockStore()
  const selectedRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    selectedRef.current?.scrollIntoView({ block: 'nearest' })
  }, [selectedIndex])

  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center px-6">
        <Search size={32} className="mb-4 text-warm-300 dark:text-warm-600" />
        <p className="text-sm text-warm-500 dark:text-warm-400">
          No results found. Try different keywords or adjust your filters.
        </p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-warm-100 dark:divide-warm-800">
      {results.map((item, idx) => {
        const Icon = TYPE_ICONS[item.type] ?? FileText
        const author = users.find(u => u.id === item.authorId)
        const project = item.projectId ? projects.find(p => p.id === item.projectId) : null
        const section = item.sectionId ? sections.find(s => s.id === item.sectionId) : null
        const displayTitle = item.title ?? (item.metadata?.fileName as string | undefined) ?? item.snippet.slice(0, 80)
        const isSelected = idx === selectedIndex
        const isClaude = item.authorId === 'user-claude'

        return (
          <button
            key={item.id}
            ref={isSelected ? selectedRef : undefined}
            onClick={() => onSelect(item)}
            onMouseEnter={() => onChangeSelectedIndex(idx)}
            className={cn(
              'w-full text-left px-4 py-3 transition-colors focus:outline-none',
              isSelected
                ? 'bg-warm-100 dark:bg-warm-800'
                : 'hover:bg-warm-50 dark:hover:bg-warm-900'
            )}
            aria-selected={isSelected}
          >
            {/* Header row */}
            <div className="flex items-start gap-2.5">
              <div
                className={cn(
                  'mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md',
                  isClaude
                    ? 'bg-violet-100 text-violet-600 dark:bg-violet-900 dark:text-violet-400'
                    : 'bg-warm-100 text-warm-600 dark:bg-warm-700 dark:text-warm-300'
                )}
              >
                <Icon size={14} />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-warm-400 dark:text-warm-500">
                    {CONTENT_TYPE_LABELS[item.type] ?? item.type}
                  </span>
                  {isClaude && (
                    <span className="rounded-full bg-violet-100 px-1.5 py-0.5 text-[10px] font-medium text-violet-600 dark:bg-violet-900 dark:text-violet-400">
                      AI
                    </span>
                  )}
                </div>

                {/* Title */}
                <p className="text-sm font-semibold text-warm-900 dark:text-warm-100 truncate">
                  {displayTitle}
                </p>

                {/* Snippet */}
                {item.snippet && (
                  <p className="mt-0.5 text-xs text-warm-500 dark:text-warm-400 line-clamp-2">
                    <HighlightedSnippet text={item.snippet} term={query} />
                  </p>
                )}

                {/* Context + meta */}
                <div className="mt-1 flex items-center gap-2 flex-wrap text-xs text-warm-400 dark:text-warm-500">
                  {project && (
                    <span className="font-medium text-warm-600 dark:text-warm-300">
                      {project.title}
                    </span>
                  )}
                  {section && (
                    <>
                      <span>·</span>
                      <span>{section.title}</span>
                    </>
                  )}
                  <span>·</span>
                  <span>{author?.name ?? 'Unknown'}</span>
                  <span>·</span>
                  <span>{formatDistanceToNow(new Date(item.createdAt))}</span>
                </div>
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}
