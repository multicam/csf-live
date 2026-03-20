import { describe, it, expect, beforeEach } from 'vitest'
import type { ContentItem } from '@csf-live/shared'

// ─── Pure logic tests for move/copy semantics ────────────────────────────────
// We test the mutation logic directly without the Zustand store,
// mirroring what moveContentItem and copyContentItem do in store.ts.

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function makeItem(overrides: Partial<ContentItem> = {}): ContentItem {
  return {
    id: overrides.id ?? generateId('ci'),
    type: 'idea',
    title: 'Test item',
    body: null,
    mediaUrl: null,
    mediaType: null,
    metadata: {},
    source: 'human',
    sourceDetail: null,
    projectId: null,
    sectionId: null,
    parentId: null,
    authorId: 'user-jm',
    status: 'active',
    version: 1,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
    deletedAt: null,
    ...overrides,
  }
}

// Pure implementation of moveContentItem logic
function moveContentItem(
  items: ContentItem[],
  itemId: string,
  projectId: string | null,
  sectionId: string | null | undefined = null
): ContentItem[] {
  return items.map(item =>
    item.id === itemId
      ? { ...item, projectId, sectionId: sectionId ?? null, updatedAt: new Date() }
      : item
  )
}

// Pure implementation of copyContentItem logic
function copyContentItem(
  items: ContentItem[],
  itemId: string,
  projectId: string | null,
  sectionId: string | null | undefined = null
): { items: ContentItem[]; copy: ContentItem } {
  const source = items.find(i => i.id === itemId)
  if (!source) throw new Error(`Content item ${itemId} not found`)
  const copy: ContentItem = {
    ...source,
    id: generateId('ci'),
    projectId,
    sectionId: sectionId ?? null,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
  return { items: [...items, copy], copy }
}

// ─── moveContentItem tests ────────────────────────────────────────────────────

let initialItems: ContentItem[]

beforeEach(() => {
  initialItems = [
    makeItem({ id: 'ci-001', projectId: null, sectionId: null }),
    makeItem({ id: 'ci-002', projectId: 'project-a', sectionId: null }),
    makeItem({ id: 'ci-003', projectId: 'project-a', sectionId: 'section-x' }),
  ]
})

describe('moveContentItem — removes item from source project', () => {
  it('moves an item from general feed to a project', () => {
    const result = moveContentItem(initialItems, 'ci-001', 'project-b')
    const moved = result.find(i => i.id === 'ci-001')!

    expect(moved.projectId).toBe('project-b')
    expect(result).toHaveLength(3) // same count — no new item created
  })

  it('moves an item from one project to another (original removed from source)', () => {
    const result = moveContentItem(initialItems, 'ci-002', 'project-b')
    const moved = result.find(i => i.id === 'ci-002')!

    expect(moved.projectId).toBe('project-b')
    const itemsInProjectA = result.filter(i => i.projectId === 'project-a' && i.id === 'ci-002')
    expect(itemsInProjectA).toHaveLength(0)
  })

  it('sets sectionId when provided', () => {
    const result = moveContentItem(initialItems, 'ci-001', 'project-a', 'section-x')
    const moved = result.find(i => i.id === 'ci-001')!

    expect(moved.projectId).toBe('project-a')
    expect(moved.sectionId).toBe('section-x')
  })

  it('leaves other items unchanged', () => {
    const result = moveContentItem(initialItems, 'ci-001', 'project-b')
    const untouched = result.find(i => i.id === 'ci-002')!

    expect(untouched.projectId).toBe('project-a')
  })
})

describe('moveContentItem({ projectId: null }) — removes project assignment', () => {
  it('sets projectId to null (unassign to general feed)', () => {
    const result = moveContentItem(initialItems, 'ci-002', null)
    const item = result.find(i => i.id === 'ci-002')!

    expect(item.projectId).toBeNull()
  })

  it('also clears sectionId when unassigning', () => {
    const result = moveContentItem(initialItems, 'ci-003', null)
    const item = result.find(i => i.id === 'ci-003')!

    expect(item.projectId).toBeNull()
    expect(item.sectionId).toBeNull()
  })
})

// ─── copyContentItem tests ────────────────────────────────────────────────────

describe('copyContentItem — leaves original in place', () => {
  it('creates a new item with the target project', () => {
    const { items, copy } = copyContentItem(initialItems, 'ci-001', 'project-a')

    expect(items).toHaveLength(4) // one more item
    expect(copy.projectId).toBe('project-a')
    expect(copy.id).not.toBe('ci-001')
  })

  it('leaves original item unchanged', () => {
    const { items } = copyContentItem(initialItems, 'ci-001', 'project-a')
    const original = items.find(i => i.id === 'ci-001')!

    expect(original.projectId).toBeNull()
  })

  it('copy has the target sectionId', () => {
    const { copy } = copyContentItem(initialItems, 'ci-001', 'project-a', 'section-x')

    expect(copy.sectionId).toBe('section-x')
  })

  it('original sectionId is unchanged after copy', () => {
    const { items } = copyContentItem(initialItems, 'ci-001', 'project-a', 'section-x')
    const original = items.find(i => i.id === 'ci-001')!

    expect(original.sectionId).toBeNull()
  })

  it('throws when source item does not exist', () => {
    expect(() => copyContentItem(initialItems, 'nonexistent-id', 'project-a')).toThrow()
  })
})
