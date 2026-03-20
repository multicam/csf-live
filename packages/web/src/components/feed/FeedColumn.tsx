import { useRef, useEffect, useState } from 'react'
import { ArrowUp, ArrowDown } from 'lucide-react'
import { useFeedItems } from '@/hooks/useFeed'
import { useTimelineFilters, isFiltersActive } from '@/hooks/useTimelineFilters'
import { FeedItemRenderer } from './FeedItemRenderer'
import { ComposeInput } from './ComposeInput'
import { FilterBar } from './FilterBar'
import { FilterChips } from './FilterChips'
import { CategorizedFeed } from './CategorizedFeed'
import { FEED_DISCUSSION_ID } from '@csf-live/shared/constants'
import type { FeedItem, ContentType } from '@csf-live/shared'
import { cn } from '@/lib/utils'

type FeedMode = 'timeline' | 'categorized'

interface FeedColumnProps {
  onSelectItem?: (item: FeedItem) => void
  selectedItemId?: string | null
}

function loadMode(key: string, defaultValue: FeedMode): FeedMode {
  const stored = localStorage.getItem(key)
  if (stored === 'timeline' || stored === 'categorized') return stored
  return defaultValue
}

function applyFilters(
  items: FeedItem[],
  filters: ReturnType<typeof useTimelineFilters>['filters']
): FeedItem[] {
  let result = [...items]

  const hasTypeFilters = filters.types.length > 0
  const excludeMessages = !filters.typeMessage

  if (hasTypeFilters || excludeMessages) {
    result = result.filter(item => {
      if (item._sourceTable === 'message') {
        return !excludeMessages
      }
      if (hasTypeFilters) {
        return filters.types.includes(item.type as ContentType)
      }
      return true
    })
  }

  if (filters.authorId !== null) {
    result = result.filter(item => item.authorId === filters.authorId)
  }

  if (filters.dateRange !== 'all') {
    const now = new Date()
    const days = filters.dateRange === '7d' ? 7 : 30
    const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
    result = result.filter(item => new Date(item.createdAt) >= cutoff)
  }

  return result
}

export function FeedColumn({ onSelectItem, selectedItemId }: FeedColumnProps) {
  const { data: feedItems = [], isLoading } = useFeedItems()
  const bottomRef = useRef<HTMLDivElement>(null)
  const [mode, setModeState] = useState<FeedMode>(() => loadMode('feed-mode', 'timeline'))

  const {
    filters,
    updateFilter,
    clearFilters,
    removeTypeFilter,
    isOpen: filterOpen,
    setIsOpen: setFilterOpen,
    sortOrder,
    toggleSort,
  } = useTimelineFilters({ context: 'feed', defaultSort: 'asc' })

  function setMode(m: FeedMode) {
    localStorage.setItem('feed-mode', m)
    setModeState(m)
  }

  // Apply sort
  const sortedItems = [...feedItems].sort((a, b) => {
    const diff = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    return sortOrder === 'asc' ? diff : -diff
  })

  // Apply filters
  const displayItems = applyFilters(sortedItems, filters)

  // Auto-scroll to bottom when new items arrive in asc timeline
  useEffect(() => {
    if (bottomRef.current && mode === 'timeline' && sortOrder === 'asc') {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [feedItems.length, mode, sortOrder])

  const filtersActive = isFiltersActive(filters)

  return (
    <div className="flex h-full flex-col pt-12">
      {/* Mode tabs */}
      <div className="flex items-center border-b border-warm-200 dark:border-warm-800 px-3">
        {(['timeline', 'categorized'] as FeedMode[]).map(m => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={cn(
              'px-3 py-2 text-sm font-medium capitalize transition-colors border-b-2 -mb-px',
              mode === m
                ? 'border-warm-900 text-warm-900 dark:border-warm-100 dark:text-warm-100'
                : 'border-transparent text-warm-400 hover:text-warm-600 dark:text-warm-500 dark:hover:text-warm-300'
            )}
          >
            {m}
          </button>
        ))}

        {/* Sort toggle — only in timeline mode */}
        {mode === 'timeline' && (
          <button
            onClick={toggleSort}
            className="ml-auto flex items-center gap-1 rounded-md px-2 py-1 text-xs text-warm-400 hover:bg-warm-100 hover:text-warm-600 dark:text-warm-500 dark:hover:bg-warm-800 dark:hover:text-warm-300 transition-colors"
            title={sortOrder === 'asc' ? 'Oldest first — click to reverse' : 'Newest first — click to reverse'}
          >
            {sortOrder === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
            {sortOrder === 'asc' ? 'Oldest first' : 'Newest first'}
          </button>
        )}
      </div>

      {/* Filter bar — only in timeline mode */}
      {mode === 'timeline' && (
        <FilterBar
          filters={filters}
          isOpen={filterOpen}
          onOpenChange={setFilterOpen}
          onUpdateFilter={updateFilter}
        />
      )}

      {/* Filter chips */}
      {mode === 'timeline' && filtersActive && (
        <FilterChips
          filters={filters}
          onRemoveType={removeTypeFilter}
          onRemoveMessageFilter={() => updateFilter('typeMessage', true)}
          onRemoveAuthor={() => updateFilter('authorId', null)}
          onRemoveDateRange={() => updateFilter('dateRange', 'all')}
          onRemoveSection={id => updateFilter('sectionIds', filters.sectionIds.filter(s => s !== id))}
          onClearAll={clearFilters}
        />
      )}

      {/* Feed content */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {isLoading ? (
          <div className="flex h-full items-center justify-center text-sm text-warm-400">
            Loading…
          </div>
        ) : mode === 'categorized' ? (
          <div className="h-full transition-opacity duration-200">
            <CategorizedFeed
              items={feedItems}
              context="feed"
              onSelectItem={item => onSelectItem?.(item as unknown as FeedItem)}
              selectedItemId={selectedItemId}
            />
          </div>
        ) : displayItems.length === 0 && feedItems.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-warm-400 dark:text-warm-500">
            Start a conversation or capture an idea.
          </div>
        ) : displayItems.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-warm-400 dark:text-warm-500 px-6 text-center">
            No items match the current filters.
          </div>
        ) : (
          <div className="px-3 py-4 space-y-2 transition-opacity duration-200">
            {displayItems.map(item => (
              <FeedItemRenderer
                key={item.id}
                item={item}
                onSelect={onSelectItem}
                isSelected={item.id === selectedItemId}
              />
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Compose input */}
      <ComposeInput discussionId={FEED_DISCUSSION_ID} />
    </div>
  )
}
