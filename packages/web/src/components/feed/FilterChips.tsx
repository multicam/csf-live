import { X } from 'lucide-react'
import type { ContentType } from '@csf-live/shared'
import { CONTENT_TYPE_LABELS } from '@csf-live/shared/constants'
import type { TimelineFilters } from '@/hooks/useTimelineFilters'
import { isFiltersActive } from '@/hooks/useTimelineFilters'

const AUTHOR_LABELS: Record<string, string> = {
  'user-jm': 'Me (JM)',
  'user-ben': 'Ben',
  'user-claude': 'Claude',
}

const DATE_RANGE_LABELS: Record<string, string> = {
  '7d': 'Last 7 days',
  '30d': 'Last 30 days',
}

interface SectionMap {
  [id: string]: string
}

interface FilterChipsProps {
  filters: TimelineFilters
  onRemoveType: (type: ContentType) => void
  onRemoveMessageFilter: () => void
  onRemoveAuthor: () => void
  onRemoveDateRange: () => void
  onRemoveSection: (sectionId: string) => void
  onClearAll: () => void
  sectionNames?: SectionMap
}

interface ChipProps {
  label: string
  onRemove: () => void
}

function Chip({ label, onRemove }: ChipProps) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-warm-200 px-2 py-0.5 text-xs font-medium text-warm-700 dark:bg-warm-700 dark:text-warm-200">
      {label}
      <button
        onClick={onRemove}
        className="flex h-3.5 w-3.5 items-center justify-center rounded-full hover:bg-warm-300 dark:hover:bg-warm-600 transition-colors"
        aria-label={`Remove ${label} filter`}
      >
        <X size={9} />
      </button>
    </span>
  )
}

export function FilterChips({
  filters,
  onRemoveType,
  onRemoveMessageFilter,
  onRemoveAuthor,
  onRemoveDateRange,
  onRemoveSection,
  onClearAll,
  sectionNames = {},
}: FilterChipsProps) {
  if (!isFiltersActive(filters)) return null

  const chips: React.ReactNode[] = []

  // Type chips (one per type)
  for (const type of filters.types) {
    chips.push(
      <Chip
        key={`type-${type}`}
        label={`Type: ${CONTENT_TYPE_LABELS[type] ?? type}`}
        onRemove={() => onRemoveType(type)}
      />
    )
  }

  // Message exclusion chip
  if (!filters.typeMessage) {
    chips.push(
      <Chip
        key="no-messages"
        label="No messages"
        onRemove={onRemoveMessageFilter}
      />
    )
  }

  // Author chip
  if (filters.authorId !== null) {
    chips.push(
      <Chip
        key="author"
        label={`Author: ${AUTHOR_LABELS[filters.authorId] ?? filters.authorId}`}
        onRemove={onRemoveAuthor}
      />
    )
  }

  // Date range chip
  if (filters.dateRange !== 'all') {
    chips.push(
      <Chip
        key="date"
        label={DATE_RANGE_LABELS[filters.dateRange] ?? filters.dateRange}
        onRemove={onRemoveDateRange}
      />
    )
  }

  // Section chips
  for (const sectionId of filters.sectionIds) {
    chips.push(
      <Chip
        key={`section-${sectionId}`}
        label={`Section: ${sectionNames[sectionId] ?? sectionId}`}
        onRemove={() => onRemoveSection(sectionId)}
      />
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5 px-3 py-2 border-b border-warm-200 dark:border-warm-800">
      {chips}
      {chips.length > 1 && (
        <button
          onClick={onClearAll}
          className="text-xs text-warm-400 hover:text-warm-700 dark:text-warm-500 dark:hover:text-warm-300 underline transition-colors"
        >
          Clear all
        </button>
      )}
    </div>
  )
}
