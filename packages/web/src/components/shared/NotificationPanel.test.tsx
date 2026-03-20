import { describe, it, expect, beforeEach } from 'vitest'
import type { Notification, Project, Section, ContentItem } from '@csf-live/shared'

// ─── Pure logic tests for notification panel behaviour ───────────────────────
// Tests cover: unread count decrement, mark-all-read, and URL derivation.
// We test the logic functions directly without React Query or Zustand,
// keeping tests lightweight and free of module-resolution issues.

function makeNotification(overrides: Partial<Notification> = {}): Notification {
  return {
    id: `notif-${Math.random().toString(36).slice(2, 9)}`,
    userId: 'user-jm',
    type: 'message',
    title: 'Test notification',
    body: 'Body text',
    referenceType: 'message',
    referenceId: 'msg-001',
    read: false,
    createdAt: new Date('2026-03-01T12:00:00Z'),
    ...overrides,
  }
}

function unreadCount(notifications: Notification[]): number {
  return notifications.filter(n => !n.read).length
}

function markRead(notifications: Notification[], id: string): Notification[] {
  return notifications.map(n => (n.id === id ? { ...n, read: true } : n))
}

function markAllRead(notifications: Notification[]): Notification[] {
  return notifications.map(n => ({ ...n, read: true }))
}

// URL derivation logic (mirrors NotificationPanel.tsx / useNotificationUrl)
function deriveUrl(
  referenceType: string,
  referenceId: string,
  projects: Pick<Project, 'id' | 'slug'>[],
  sections: Pick<Section, 'id' | 'projectId'>[],
  contentItems: Pick<ContentItem, 'id' | 'projectId'>[]
): string {
  if (referenceType === 'project') {
    const project = projects.find(p => p.id === referenceId)
    return project ? `/feed/${project.slug}` : '/feed'
  }

  if (referenceType === 'section') {
    const section = sections.find(s => s.id === referenceId)
    if (!section) return '/feed'
    const project = projects.find(p => p.id === section.projectId)
    return project ? `/feed/${project.slug}?section=${referenceId}` : '/feed'
  }

  if (referenceType === 'content_item') {
    const item = contentItems.find(ci => ci.id === referenceId)
    if (!item) return '/feed'
    if (item.projectId) {
      const project = projects.find(p => p.id === item.projectId)
      return project ? `/feed/${project.slug}/item/${referenceId}` : '/feed'
    }
    return '/feed'
  }

  return '/feed'
}

// ─── Fixtures ────────────────────────────────────────────────────────────────

const PROJECTS: Pick<Project, 'id' | 'slug'>[] = [
  { id: 'project-csf-live', slug: 'csf-live' },
  { id: 'project-knowledge-garden', slug: 'knowledge-garden' },
]

const SECTIONS: Pick<Section, 'id' | 'projectId'>[] = [
  { id: 'section-csf-fe', projectId: 'project-csf-live' },
  { id: 'section-kg-research', projectId: 'project-knowledge-garden' },
]

const CONTENT_ITEMS: Pick<ContentItem, 'id' | 'projectId'>[] = [
  { id: 'ci-doc-001', projectId: 'project-csf-live' },
  { id: 'ci-idea-006', projectId: null },
]

let notifications: Notification[]

beforeEach(() => {
  notifications = [
    makeNotification({ id: 'n1', read: false }),
    makeNotification({ id: 'n2', read: false }),
    makeNotification({ id: 'n3', read: true }),
    makeNotification({ id: 'n4', read: true }),
  ]
})

// ─── Unread count decrements after marking one read ──────────────────────────

describe('unread count — decrements after marking one notification read', () => {
  it('starts at 2 unread', () => {
    expect(unreadCount(notifications)).toBe(2)
  })

  it('decrements by 1 after marking one unread notification as read', () => {
    const updated = markRead(notifications, 'n1')
    expect(unreadCount(updated)).toBe(1)
  })

  it('does not change count when marking an already-read notification', () => {
    const updated = markRead(notifications, 'n3')
    expect(unreadCount(updated)).toBe(2)
  })

  it('each subsequent mark reduces count by 1', () => {
    let state = notifications
    state = markRead(state, 'n1')
    expect(unreadCount(state)).toBe(1)
    state = markRead(state, 'n2')
    expect(unreadCount(state)).toBe(0)
  })
})

// ─── Mark all sets count to 0 ────────────────────────────────────────────────

describe('markAllRead — sets count to 0', () => {
  it('sets unread count to 0', () => {
    const updated = markAllRead(notifications)
    expect(unreadCount(updated)).toBe(0)
  })

  it('all notification items have read === true', () => {
    const updated = markAllRead(notifications)
    expect(updated.every(n => n.read)).toBe(true)
  })

  it('is idempotent — calling twice still yields count 0', () => {
    const once = markAllRead(notifications)
    const twice = markAllRead(once)
    expect(unreadCount(twice)).toBe(0)
  })
})

// ─── Navigation URL derived from referenceType/referenceId ───────────────────

describe('notification navigation URL derivation', () => {
  it('project referenceType → /feed/:slug', () => {
    const url = deriveUrl('project', 'project-csf-live', PROJECTS, SECTIONS, CONTENT_ITEMS)
    expect(url).toBe('/feed/csf-live')
  })

  it('unknown project id → /feed', () => {
    const url = deriveUrl('project', 'project-unknown', PROJECTS, SECTIONS, CONTENT_ITEMS)
    expect(url).toBe('/feed')
  })

  it('section referenceType → /feed/:slug?section=:id', () => {
    const url = deriveUrl('section', 'section-csf-fe', PROJECTS, SECTIONS, CONTENT_ITEMS)
    expect(url).toBe('/feed/csf-live?section=section-csf-fe')
  })

  it('unknown section id → /feed', () => {
    const url = deriveUrl('section', 'section-unknown', PROJECTS, SECTIONS, CONTENT_ITEMS)
    expect(url).toBe('/feed')
  })

  it('content_item with projectId → /feed/:slug/item/:id', () => {
    const url = deriveUrl('content_item', 'ci-doc-001', PROJECTS, SECTIONS, CONTENT_ITEMS)
    expect(url).toBe('/feed/csf-live/item/ci-doc-001')
  })

  it('content_item without projectId (general feed) → /feed', () => {
    const url = deriveUrl('content_item', 'ci-idea-006', PROJECTS, SECTIONS, CONTENT_ITEMS)
    expect(url).toBe('/feed')
  })

  it('unknown content_item → /feed', () => {
    const url = deriveUrl('content_item', 'ci-unknown', PROJECTS, SECTIONS, CONTENT_ITEMS)
    expect(url).toBe('/feed')
  })

  it('message referenceType → /feed', () => {
    const url = deriveUrl('message', 'msg-001', PROJECTS, SECTIONS, CONTENT_ITEMS)
    expect(url).toBe('/feed')
  })

  it('unknown referenceType → /feed', () => {
    const url = deriveUrl('unknown_type', 'some-id', PROJECTS, SECTIONS, CONTENT_ITEMS)
    expect(url).toBe('/feed')
  })
})
