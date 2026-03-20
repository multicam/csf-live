import MiniSearch from 'minisearch'
import type { ContentItem } from '@csf-live/shared'
import { useMockStore } from '../mocks/store'
import type { SearchFilters } from '../mocks/api'

export interface ContentItemWithSnippet extends ContentItem {
  snippet: string
}

interface SearchDoc {
  id: string
  title: string
  body: string
  linkTitle: string
  transcription: string
  fileName: string
}

let searchIndex: MiniSearch<SearchDoc> | null = null

function buildIndex(items: ContentItem[]): MiniSearch<SearchDoc> {
  const index = new MiniSearch<SearchDoc>({
    fields: ['title', 'body', 'linkTitle', 'transcription', 'fileName'],
    storeFields: ['id'],
    searchOptions: {
      boost: { title: 2 },
      fuzzy: 0.2,
    },
  })

  const docs: SearchDoc[] = items.map(item => ({
    id: item.id,
    title: item.title ?? '',
    body: item.body ?? '',
    linkTitle: (item.metadata.title as string) ?? (item.metadata.linkTitle as string) ?? '',
    transcription: (item.metadata.transcription as string) ?? '',
    fileName: (item.metadata.fileName as string) ?? '',
  }))

  index.addAll(docs)
  return index
}

function getIndex(): MiniSearch<SearchDoc> {
  if (!searchIndex) {
    const { contentItems } = useMockStore.getState()
    searchIndex = buildIndex(contentItems)
  }
  return searchIndex
}

// Invalidate index when store changes
useMockStore.subscribe(() => {
  searchIndex = null
})

/**
 * Extract a snippet around the first match of `query` in `text`.
 * Returns up to ~160 chars centred on the match.
 */
export function extractSnippet(text: string, query: string): string {
  if (!text || !query) return text?.slice(0, 160) ?? ''

  const lowerText = text.toLowerCase()
  const lowerQuery = query.toLowerCase().split(/\s+/)[0] ?? ''
  const idx = lowerText.indexOf(lowerQuery)

  if (idx === -1) {
    return text.slice(0, 160) + (text.length > 160 ? '…' : '')
  }

  const radius = 60
  const start = Math.max(0, idx - radius)
  const end = Math.min(text.length, idx + lowerQuery.length + radius)
  const prefix = start > 0 ? '…' : ''
  const suffix = end < text.length ? '…' : ''
  return prefix + text.slice(start, end) + suffix
}

export function searchItems(query: string, filters?: SearchFilters): ContentItem[] {
  const index = getIndex()
  const { contentItems } = useMockStore.getState()

  const results = index.search(query)
  const resultIds = new Set(results.map(r => r.id))

  let filtered = contentItems.filter(
    item => resultIds.has(item.id) && item.status === 'active' && item.deletedAt === null
  )

  if (filters?.type?.length) {
    filtered = filtered.filter(item => filters.type!.includes(item.type))
  }

  if (filters?.authorId?.length) {
    filtered = filtered.filter(item => filters.authorId!.includes(item.authorId))
  }

  if (filters?.projectId) {
    filtered = filtered.filter(item => item.projectId === filters.projectId)
  }

  if (filters?.dateRange && filters.dateRange !== 'all') {
    const now = new Date()
    const days = filters.dateRange === 'last7' ? 7 : 30
    const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
    filtered = filtered.filter(item => new Date(item.createdAt) >= cutoff)
  }

  // Sort by search relevance (results are already ranked)
  const rankMap = new Map(results.map((r, i) => [r.id, i]))
  filtered.sort((a, b) => (rankMap.get(a.id) ?? 999) - (rankMap.get(b.id) ?? 999))

  return filtered
}

export function searchItemsWithSnippets(query: string, filters?: SearchFilters): ContentItemWithSnippet[] {
  const results = searchItems(query, filters)
  return results.map(item => {
    const searchableText = item.body ?? item.title ?? ''
    return {
      ...item,
      snippet: extractSnippet(searchableText, query),
    }
  })
}
