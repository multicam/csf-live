import * as Collapsible from '@radix-ui/react-collapsible'
import { Filter, ChevronDown, ChevronUp } from 'lucide-react'
import type { ContentType } from '@csf-live/shared'
import { CONTENT_TYPE_LABELS } from '@csf-live/shared/constants'
import type { TimelineFilters, DateRange } from '@/hooks/useTimelineFilters'
import { countActiveFilters } from '@/hooks/useTimelineFilters'
import { cn } from '@/lib/utils'

const ALL_CONTENT_TYPES: ContentType[] = [
  'idea', 'drawing', 'sketch', 'document', 'link', 'voice', 'photo', 'research', 'file',
]

const AUTHORS = [
  { id: null, label: 'All' },
  { id: 'user-jm', label: 'Me (JM)' },
  { id: 'user-ben', label: 'Ben' },
  { id: 'user-claude', label: 'Claude' },
]

const DATE_RANGES: { value: DateRange; label: string }[] = [
  { value: 'all', label: 'All time' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
]

interface Section {
  id: string
  title: string
}

interface FilterBarProps {
  filters: TimelineFilters
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onUpdateFilter: <K extends keyof TimelineFilters>(key: K, value: TimelineFilters[K]) => void
  sections?: Section[]  // only shown in project context
}

export function FilterBar({ filters, isOpen, onOpenChange, onUpdateFilter, sections }: FilterBarProps) {
  const activeCount = countActiveFilters(filters)

  function toggleType(type: ContentType) {
    const current = filters.types
    if (current.includes(type)) {
      onUpdateFilter('types', current.filter(t => t !== type))
    } else {
      onUpdateFilter('types', [...current, type])
    }
  }

  function toggleSection(sectionId: string) {
    const current = filters.sectionIds
    if (current.includes(sectionId)) {
      onUpdateFilter('sectionIds', current.filter(id => id !== sectionId))
    } else {
      onUpdateFilter('sectionIds', [...current, sectionId])
    }
  }

  return (
    <Collapsible.Root open={isOpen} onOpenChange={onOpenChange}>
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-warm-200 dark:border-warm-800">
        <Collapsible.Trigger asChild>
          <button
            className={cn(
              'flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition-colors',
              isOpen || activeCount > 0
                ? 'bg-warm-900 text-white dark:bg-warm-100 dark:text-warm-900'
                : 'text-warm-500 hover:bg-warm-100 hover:text-warm-700 dark:text-warm-400 dark:hover:bg-warm-800 dark:hover:text-warm-200'
            )}
          >
            <Filter size={12} />
            Filters
            {activeCount > 0 && (
              <span className={cn(
                'flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold',
                isOpen || activeCount > 0
                  ? 'bg-white text-warm-900 dark:bg-warm-900 dark:text-warm-100'
                  : 'bg-warm-900 text-white dark:bg-warm-100 dark:text-warm-900'
              )}>
                {activeCount}
              </span>
            )}
            {isOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
        </Collapsible.Trigger>
      </div>

      <Collapsible.Content>
        <div className="border-b border-warm-200 dark:border-warm-800 bg-warm-50 dark:bg-warm-900 px-3 py-3 space-y-4">
          {/* Content Type */}
          <fieldset>
            <legend className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-warm-400 dark:text-warm-500">
              Content Type
            </legend>
            <div className="flex flex-wrap gap-1.5">
              {/* Messages toggle */}
              <label
                className={cn(
                  'flex cursor-pointer items-center gap-1 rounded-md border px-2 py-1 text-xs transition-colors select-none',
                  !filters.typeMessage
                    ? 'border-warm-900 bg-warm-900 text-white dark:border-warm-100 dark:bg-warm-100 dark:text-warm-900'
                    : 'border-warm-200 text-warm-600 hover:border-warm-400 dark:border-warm-700 dark:text-warm-400 dark:hover:border-warm-500'
                )}
              >
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={!filters.typeMessage}
                  onChange={() => onUpdateFilter('typeMessage', !filters.typeMessage)}
                />
                message
              </label>

              {ALL_CONTENT_TYPES.map(type => (
                <label
                  key={type}
                  className={cn(
                    'flex cursor-pointer items-center gap-1 rounded-md border px-2 py-1 text-xs transition-colors select-none',
                    filters.types.includes(type)
                      ? 'border-warm-900 bg-warm-900 text-white dark:border-warm-100 dark:bg-warm-100 dark:text-warm-900'
                      : 'border-warm-200 text-warm-600 hover:border-warm-400 dark:border-warm-700 dark:text-warm-400 dark:hover:border-warm-500'
                  )}
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={filters.types.includes(type)}
                    onChange={() => toggleType(type)}
                  />
                  {CONTENT_TYPE_LABELS[type] ?? type}
                </label>
              ))}
            </div>
          </fieldset>

          {/* Author */}
          <fieldset>
            <legend className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-warm-400 dark:text-warm-500">
              Author
            </legend>
            <div className="flex flex-wrap gap-1.5">
              {AUTHORS.map(author => (
                <label
                  key={author.id ?? 'all'}
                  className={cn(
                    'flex cursor-pointer items-center rounded-md border px-2 py-1 text-xs transition-colors select-none',
                    filters.authorId === author.id
                      ? 'border-warm-900 bg-warm-900 text-white dark:border-warm-100 dark:bg-warm-100 dark:text-warm-900'
                      : 'border-warm-200 text-warm-600 hover:border-warm-400 dark:border-warm-700 dark:text-warm-400 dark:hover:border-warm-500'
                  )}
                >
                  <input
                    type="radio"
                    className="sr-only"
                    name="author-filter"
                    checked={filters.authorId === author.id}
                    onChange={() => onUpdateFilter('authorId', author.id)}
                  />
                  {author.label}
                </label>
              ))}
            </div>
          </fieldset>

          {/* Date Range */}
          <fieldset>
            <legend className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-warm-400 dark:text-warm-500">
              Date Range
            </legend>
            <div className="flex flex-wrap gap-1.5">
              {DATE_RANGES.map(({ value, label }) => (
                <label
                  key={value}
                  className={cn(
                    'flex cursor-pointer items-center rounded-md border px-2 py-1 text-xs transition-colors select-none',
                    filters.dateRange === value
                      ? 'border-warm-900 bg-warm-900 text-white dark:border-warm-100 dark:bg-warm-100 dark:text-warm-900'
                      : 'border-warm-200 text-warm-600 hover:border-warm-400 dark:border-warm-700 dark:text-warm-400 dark:hover:border-warm-500'
                  )}
                >
                  <input
                    type="radio"
                    className="sr-only"
                    name="date-range-filter"
                    checked={filters.dateRange === value}
                    onChange={() => onUpdateFilter('dateRange', value)}
                  />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>

          {/* Sections (project context only) */}
          {sections && sections.length > 0 && (
            <fieldset>
              <legend className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-warm-400 dark:text-warm-500">
                Section
              </legend>
              <div className="flex flex-wrap gap-1.5">
                {sections.map(section => (
                  <label
                    key={section.id}
                    className={cn(
                      'flex cursor-pointer items-center rounded-md border px-2 py-1 text-xs transition-colors select-none',
                      filters.sectionIds.includes(section.id)
                        ? 'border-warm-900 bg-warm-900 text-white dark:border-warm-100 dark:bg-warm-100 dark:text-warm-900'
                        : 'border-warm-200 text-warm-600 hover:border-warm-400 dark:border-warm-700 dark:text-warm-400 dark:hover:border-warm-500'
                    )}
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={filters.sectionIds.includes(section.id)}
                      onChange={() => toggleSection(section.id)}
                    />
                    {section.title}
                  </label>
                ))}
              </div>
            </fieldset>
          )}
        </div>
      </Collapsible.Content>
    </Collapsible.Root>
  )
}
