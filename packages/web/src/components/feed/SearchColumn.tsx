import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Search, X } from 'lucide-react'
import { useSearch } from '@/hooks/useSearch'
import { useMockStore } from '@/mocks/store'
import { SearchResults } from './SearchResults'
import type { ContentItemWithSnippet } from '@/lib/search'
import type { SearchFilters } from '@/mocks/api'
import { CONTENT_TYPE_LABELS } from '@csf-live/shared/constants'
import type { ContentType } from '@csf-live/shared'
import { cn } from '@/lib/utils'

const ALL_CONTENT_TYPES: ContentType[] = [
  'idea', 'drawing', 'sketch', 'document', 'link', 'voice', 'photo', 'research', 'file',
]

const AUTHORS = [
  { id: 'user-jm', label: 'Me (JM)' },
  { id: 'user-ben', label: 'Ben' },
  { id: 'user-claude', label: 'Claude' },
]

interface SearchColumnProps {
  initialQuery?: string
  initialTypes?: string[]
  initialAuthor?: string
}

export function SearchColumn({ initialQuery = '', initialTypes = [], initialAuthor }: SearchColumnProps) {
  const navigate = useNavigate()
  const { projects } = useMockStore()
  const inputRef = useRef<HTMLInputElement>(null)

  const [inputValue, setInputValue] = useState(initialQuery)
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery)
  const [selectedTypes, setSelectedTypes] = useState<string[]>(initialTypes)
  const [selectedAuthor, setSelectedAuthor] = useState<string | undefined>(initialAuthor)
  const [selectedIndex, setSelectedIndex] = useState(0)

  // Debounce input 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(inputValue)
      setSelectedIndex(0)
    }, 300)
    return () => clearTimeout(timer)
  }, [inputValue])

  // Auto-focus on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Sync URL params (history replace, no re-render loop)
  useEffect(() => {
    const params = new URLSearchParams()
    if (debouncedQuery) params.set('q', debouncedQuery)
    if (selectedTypes.length > 0) params.set('type', selectedTypes.join(','))
    if (selectedAuthor) params.set('author', selectedAuthor)
    const search = params.toString()
    const url = search ? `/search?${search}` : '/search'
    window.history.replaceState(null, '', url)
  }, [debouncedQuery, selectedTypes, selectedAuthor])

  const filters: SearchFilters = {
    type: selectedTypes.length > 0 ? selectedTypes : undefined,
    authorId: selectedAuthor ? [selectedAuthor] : undefined,
  }

  const { data: results = [], isLoading } = useSearch(debouncedQuery, filters)

  function resolveProjectSlug(projectId: string | null): string | null {
    if (!projectId) return null
    return projects.find(p => p.id === projectId)?.slug ?? null
  }

  function handleSelect(item: ContentItemWithSnippet) {
    const slug = resolveProjectSlug(item.projectId)
    if (slug) {
      if (item.type === 'document') {
        navigate({ to: '/feed/$slug/doc/$id', params: { slug, id: item.id } })
      } else {
        navigate({ to: '/feed/$slug/item/$id', params: { slug, id: item.id } })
      }
    } else if (item.projectId) {
      // project exists but no slug found — fallback to feed
      navigate({ to: '/feed' })
    } else {
      // general feed item — no dedicated detail route for general content yet
      navigate({ to: '/feed' })
    }
  }

  function toggleType(type: string) {
    setSelectedTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    )
    setSelectedIndex(0)
  }

  function toggleAuthor(authorId: string) {
    setSelectedAuthor(prev => prev === authorId ? undefined : authorId)
    setSelectedIndex(0)
  }

  function clearFilters() {
    setSelectedTypes([])
    setSelectedAuthor(undefined)
    setSelectedIndex(0)
  }

  const hasFilters = selectedTypes.length > 0 || !!selectedAuthor

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => Math.min(prev + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => Math.max(prev - 1, 0))
    } else if (e.key === 'Enter' && results.length > 0) {
      e.preventDefault()
      const item = results[selectedIndex]
      if (item) handleSelect(item)
    } else if (e.key === 'Escape') {
      if (inputValue) {
        setInputValue('')
      } else {
        navigate({ to: '/feed' })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [results, selectedIndex, inputValue])

  return (
    <div className="flex h-full flex-col pt-12">
      {/* Search bar */}
      <div className="px-4 py-3 border-b border-warm-200 dark:border-warm-800 flex-shrink-0">
        <div className="relative flex items-center gap-2 rounded-lg border border-warm-300 bg-white px-3 py-2 focus-within:border-warm-600 focus-within:ring-1 focus-within:ring-warm-600 dark:border-warm-600 dark:bg-warm-800 dark:focus-within:border-warm-400 dark:focus-within:ring-warm-400 transition-all">
          <Search size={16} className="flex-shrink-0 text-warm-400 dark:text-warm-500" />
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search everything…"
            className="flex-1 bg-transparent text-sm text-warm-900 placeholder-warm-400 outline-none dark:text-warm-100 dark:placeholder-warm-500"
            aria-label="Search"
            autoComplete="off"
            spellCheck={false}
          />
          {inputValue && (
            <button
              onClick={() => { setInputValue(''); inputRef.current?.focus() }}
              className="flex-shrink-0 rounded-full p-0.5 text-warm-400 hover:bg-warm-100 hover:text-warm-600 dark:text-warm-500 dark:hover:bg-warm-700 dark:hover:text-warm-300 transition-colors"
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <p className="mt-1.5 text-[11px] text-warm-400 dark:text-warm-500">
          ↑↓ navigate · Enter select · Esc clear
        </p>
      </div>

      {/* Filter chips */}
      <div className="px-4 py-2 border-b border-warm-200 dark:border-warm-800 flex-shrink-0 space-y-2">
        <div className="flex flex-wrap gap-1.5 items-center">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-warm-400 dark:text-warm-500 mr-1">
            Type
          </span>
          {ALL_CONTENT_TYPES.map(type => (
            <button
              key={type}
              onClick={() => toggleType(type)}
              className={cn(
                'rounded-full border px-2 py-0.5 text-xs transition-colors',
                selectedTypes.includes(type)
                  ? 'border-warm-900 bg-warm-900 text-white dark:border-warm-100 dark:bg-warm-100 dark:text-warm-900'
                  : 'border-warm-200 text-warm-500 hover:border-warm-400 dark:border-warm-700 dark:text-warm-400 dark:hover:border-warm-500'
              )}
            >
              {CONTENT_TYPE_LABELS[type] ?? type}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-1.5 items-center">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-warm-400 dark:text-warm-500 mr-1">
            Author
          </span>
          {AUTHORS.map(author => (
            <button
              key={author.id}
              onClick={() => toggleAuthor(author.id)}
              className={cn(
                'rounded-full border px-2 py-0.5 text-xs transition-colors',
                selectedAuthor === author.id
                  ? 'border-warm-900 bg-warm-900 text-white dark:border-warm-100 dark:bg-warm-100 dark:text-warm-900'
                  : 'border-warm-200 text-warm-500 hover:border-warm-400 dark:border-warm-700 dark:text-warm-400 dark:hover:border-warm-500'
              )}
            >
              {author.label}
            </button>
          ))}
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="text-xs text-warm-400 hover:text-warm-700 dark:text-warm-500 dark:hover:text-warm-300 underline transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {!debouncedQuery.trim() ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-6">
            <Search size={32} className="mb-4 text-warm-300 dark:text-warm-600" />
            <p className="text-sm text-warm-500 dark:text-warm-400">Type to search…</p>
          </div>
        ) : isLoading ? (
          <div className="flex h-32 items-center justify-center text-sm text-warm-400">
            Searching…
          </div>
        ) : (
          <SearchResults
            results={results}
            query={debouncedQuery}
            selectedIndex={selectedIndex}
            onChangeSelectedIndex={setSelectedIndex}
            onSelect={handleSelect}
          />
        )}
      </div>
    </div>
  )
}
