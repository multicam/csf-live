import { useState, useCallback } from 'react'
import type { ContentType } from '@csf-live/shared'

export type DateRange = 'all' | '7d' | '30d'

export interface TimelineFilters {
  types: ContentType[]      // empty = all content types
  typeMessage: boolean      // include messages (default true)
  authorId: string | null   // null = all authors
  dateRange: DateRange
  sectionIds: string[]      // empty = all sections (project context only)
}

const DEFAULT_FILTERS: TimelineFilters = {
  types: [],
  typeMessage: true,
  authorId: null,
  dateRange: 'all',
  sectionIds: [],
}

export function isFiltersActive(filters: TimelineFilters): boolean {
  return (
    filters.types.length > 0 ||
    !filters.typeMessage ||
    filters.authorId !== null ||
    filters.dateRange !== 'all' ||
    filters.sectionIds.length > 0
  )
}

export function countActiveFilters(filters: TimelineFilters): number {
  let count = 0
  if (filters.types.length > 0 || !filters.typeMessage) count++
  if (filters.authorId !== null) count++
  if (filters.dateRange !== 'all') count++
  if (filters.sectionIds.length > 0) count++
  return count
}

export type SortOrder = 'asc' | 'desc'

function loadSortOrder(context: string, defaultOrder: SortOrder): SortOrder {
  const stored = localStorage.getItem(`feed-sort-${context}`)
  if (stored === 'asc' || stored === 'desc') return stored
  return defaultOrder
}

function saveSortOrder(context: string, order: SortOrder): void {
  localStorage.setItem(`feed-sort-${context}`, order)
}

interface UseTimelineFiltersOptions {
  context: string        // 'feed' or project slug
  defaultSort?: SortOrder
}

interface UseTimelineFiltersReturn {
  filters: TimelineFilters
  setFilters: (filters: TimelineFilters) => void
  updateFilter: <K extends keyof TimelineFilters>(key: K, value: TimelineFilters[K]) => void
  clearFilters: () => void
  removeTypeFilter: (type: ContentType) => void
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  sortOrder: SortOrder
  toggleSort: () => void
}

export function useTimelineFilters({ context, defaultSort = 'asc' }: UseTimelineFiltersOptions): UseTimelineFiltersReturn {
  const [filters, setFiltersState] = useState<TimelineFilters>(DEFAULT_FILTERS)
  const [isOpen, setIsOpen] = useState(false)
  const [sortOrder, setSortOrder] = useState<SortOrder>(() => loadSortOrder(context, defaultSort))

  const setFilters = useCallback((newFilters: TimelineFilters) => {
    setFiltersState(newFilters)
  }, [])

  const updateFilter = useCallback(<K extends keyof TimelineFilters>(key: K, value: TimelineFilters[K]) => {
    setFiltersState(prev => ({ ...prev, [key]: value }))
  }, [])

  const clearFilters = useCallback(() => {
    setFiltersState(DEFAULT_FILTERS)
  }, [])

  const removeTypeFilter = useCallback((type: ContentType) => {
    setFiltersState(prev => ({
      ...prev,
      types: prev.types.filter(t => t !== type),
    }))
  }, [])

  const toggleSort = useCallback(() => {
    setSortOrder(prev => {
      const next: SortOrder = prev === 'asc' ? 'desc' : 'asc'
      saveSortOrder(context, next)
      return next
    })
  }, [context])

  return {
    filters,
    setFilters,
    updateFilter,
    clearFilters,
    removeTypeFilter,
    isOpen,
    setIsOpen,
    sortOrder,
    toggleSort,
  }
}
