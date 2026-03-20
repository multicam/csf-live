import { describe, it, expect } from 'vitest'
import type { FeedItem, ContentType } from '@csf-live/shared'
import type { TimelineFilters } from '@/hooks/useTimelineFilters'

// ─── Helper: apply filters to a mock feed ──────────────────────────────────

function makeContentItem(overrides: Partial<{
  id: string
  type: ContentType
  authorId: string
  createdAt: Date
  body: string
}>): FeedItem {
  return {
    _sourceTable: 'content_item' as const,
    id: overrides.id ?? 'item-1',
    type: overrides.type ?? 'idea',
    title: null,
    body: overrides.body ?? null,
    mediaUrl: null,
    mediaType: null,
    metadata: {},
    source: 'human',
    sourceDetail: null,
    projectId: null,
    sectionId: null,
    parentId: null,
    authorId: overrides.authorId ?? 'user-jm',
    status: 'active',
    version: 1,
    createdAt: overrides.createdAt ?? new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
    deletedAt: null,
  }
}

function makeMessage(overrides: Partial<{
  id: string
  authorId: string
  createdAt: Date
}>): FeedItem {
  return {
    _sourceTable: 'message' as const,
    id: overrides.id ?? 'msg-1',
    discussionId: 'disc-1',
    authorId: overrides.authorId ?? 'user-jm',
    content: 'hello',
    contentType: 'text',
    mediaUrl: null,
    metadata: {},
    source: 'web',
    createdAt: overrides.createdAt ?? new Date('2026-01-01T00:00:00Z'),
  }
}

function applyFilters(items: FeedItem[], filters: TimelineFilters): FeedItem[] {
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

const DEFAULT_FILTERS: TimelineFilters = {
  types: [],
  typeMessage: true,
  authorId: null,
  dateRange: 'all',
  sectionIds: [],
}

// ─── Tests ─────────────────────────────────────────────────────────────────

describe('FilterBar — filter logic', () => {
  const idea = makeContentItem({ id: 'idea-1', type: 'idea', authorId: 'user-jm' })
  const doc = makeContentItem({ id: 'doc-1', type: 'document', authorId: 'user-claude' })
  const link = makeContentItem({ id: 'link-1', type: 'link', authorId: 'user-ben' })
  const msg = makeMessage({ id: 'msg-1', authorId: 'user-jm' })
  const allItems: FeedItem[] = [idea, doc, link, msg]

  it('no filters — returns all items', () => {
    const result = applyFilters(allItems, DEFAULT_FILTERS)
    expect(result).toHaveLength(4)
  })

  it('type filter — shows only matching content type items + messages', () => {
    const filters: TimelineFilters = { ...DEFAULT_FILTERS, types: ['idea'] }
    const result = applyFilters(allItems, filters)
    // idea + message (messages pass through when typeMessage = true)
    expect(result).toHaveLength(2)
    expect(result.map(i => i.id)).toContain('idea-1')
    expect(result.map(i => i.id)).toContain('msg-1')
    expect(result.map(i => i.id)).not.toContain('doc-1')
    expect(result.map(i => i.id)).not.toContain('link-1')
  })

  it('type filter with multiple types', () => {
    const filters: TimelineFilters = { ...DEFAULT_FILTERS, types: ['idea', 'document'] }
    const result = applyFilters(allItems, filters)
    expect(result).toHaveLength(3)
    expect(result.map(i => i.id)).toContain('idea-1')
    expect(result.map(i => i.id)).toContain('doc-1')
    expect(result.map(i => i.id)).toContain('msg-1')
  })

  it('author filter — keeps only matching items', () => {
    const filters: TimelineFilters = { ...DEFAULT_FILTERS, authorId: 'user-claude' }
    const result = applyFilters(allItems, filters)
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('doc-1')
  })

  it('message exclusion — removes message items', () => {
    const filters: TimelineFilters = { ...DEFAULT_FILTERS, typeMessage: false }
    const result = applyFilters(allItems, filters)
    expect(result).toHaveLength(3)
    expect(result.every(i => i._sourceTable !== 'message')).toBe(true)
  })

  it('date range — hides items older than 7 days', () => {
    const recent = makeContentItem({
      id: 'recent',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    })
    const old = makeContentItem({
      id: 'old',
      createdAt: new Date('2020-01-01T00:00:00Z'), // very old
    })
    const items: FeedItem[] = [recent, old]
    const filters: TimelineFilters = { ...DEFAULT_FILTERS, dateRange: '7d' }
    const result = applyFilters(items, filters)
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('recent')
  })

  it('date range 30 days — includes items within 30 days', () => {
    const within30 = makeContentItem({
      id: 'within30',
      createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
    })
    const tooOld = makeContentItem({
      id: 'tooold',
      createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
    })
    const filters: TimelineFilters = { ...DEFAULT_FILTERS, dateRange: '30d' }
    const result = applyFilters([within30, tooOld], filters)
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('within30')
  })

  it('clearing filters — restores all items', () => {
    const filtered = applyFilters(allItems, { ...DEFAULT_FILTERS, types: ['idea'] })
    expect(filtered).toHaveLength(2)
    const restored = applyFilters(allItems, DEFAULT_FILTERS)
    expect(restored).toHaveLength(4)
  })

  it('combined filters — author + type', () => {
    const jmIdea = makeContentItem({ id: 'jm-idea', type: 'idea', authorId: 'user-jm' })
    const claudeIdea = makeContentItem({ id: 'claude-idea', type: 'idea', authorId: 'user-claude' })
    const jmDoc = makeContentItem({ id: 'jm-doc', type: 'document', authorId: 'user-jm' })
    const items: FeedItem[] = [jmIdea, claudeIdea, jmDoc]
    const filters: TimelineFilters = {
      ...DEFAULT_FILTERS,
      types: ['idea'],
      authorId: 'user-jm',
    }
    const result = applyFilters(items, filters)
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('jm-idea')
  })
})
