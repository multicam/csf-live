import { describe, it, expect, beforeEach } from 'vitest'
import type { Notification, Project, Section, ContentItem } from '@csf-live/shared'
import { countUnreadNotifications, getNotificationUrl, sortNotificationsByNewest } from '@/lib/notifications'

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
    expect(countUnreadNotifications(notifications)).toBe(2)
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

describe('sortNotificationsByNewest', () => {
  it('sorts newest notifications first without mutating the original array', () => {
    const datedNotifications = [
      makeNotification({ id: 'n-oldest', createdAt: new Date('2026-03-01T12:00:00Z') }),
      makeNotification({ id: 'n-newest', createdAt: new Date('2026-03-03T12:00:00Z') }),
      makeNotification({ id: 'n-middle', createdAt: new Date('2026-03-02T12:00:00Z') }),
    ]

    const sorted = sortNotificationsByNewest(datedNotifications)

    expect(sorted.map(notification => notification.id)).toEqual(['n-newest', 'n-middle', 'n-oldest'])
    expect(datedNotifications.map(notification => notification.id)).toEqual(['n-oldest', 'n-newest', 'n-middle'])
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
    const url = getNotificationUrl(
      { referenceType: 'project', referenceId: 'project-csf-live' },
      { projects: PROJECTS, sections: SECTIONS, contentItems: CONTENT_ITEMS }
    )
    expect(url).toBe('/feed/csf-live')
  })

  it('unknown project id → /feed', () => {
    const url = getNotificationUrl(
      { referenceType: 'project', referenceId: 'project-unknown' },
      { projects: PROJECTS, sections: SECTIONS, contentItems: CONTENT_ITEMS }
    )
    expect(url).toBe('/feed')
  })

  it('section referenceType → /feed/:slug?section=:id', () => {
    const url = getNotificationUrl(
      { referenceType: 'section', referenceId: 'section-csf-fe' },
      { projects: PROJECTS, sections: SECTIONS, contentItems: CONTENT_ITEMS }
    )
    expect(url).toBe('/feed/csf-live?section=section-csf-fe')
  })

  it('unknown section id → /feed', () => {
    const url = getNotificationUrl(
      { referenceType: 'section', referenceId: 'section-unknown' },
      { projects: PROJECTS, sections: SECTIONS, contentItems: CONTENT_ITEMS }
    )
    expect(url).toBe('/feed')
  })

  it('content_item with projectId → /feed/:slug/item/:id', () => {
    const url = getNotificationUrl(
      { referenceType: 'content_item', referenceId: 'ci-doc-001' },
      { projects: PROJECTS, sections: SECTIONS, contentItems: CONTENT_ITEMS }
    )
    expect(url).toBe('/feed/csf-live/item/ci-doc-001')
  })

  it('content_item without projectId (general feed) → /feed', () => {
    const url = getNotificationUrl(
      { referenceType: 'content_item', referenceId: 'ci-idea-006' },
      { projects: PROJECTS, sections: SECTIONS, contentItems: CONTENT_ITEMS }
    )
    expect(url).toBe('/feed')
  })

  it('unknown content_item → /feed', () => {
    const url = getNotificationUrl(
      { referenceType: 'content_item', referenceId: 'ci-unknown' },
      { projects: PROJECTS, sections: SECTIONS, contentItems: CONTENT_ITEMS }
    )
    expect(url).toBe('/feed')
  })

  it('message referenceType → /feed', () => {
    const url = getNotificationUrl(
      { referenceType: 'message', referenceId: 'msg-001' },
      { projects: PROJECTS, sections: SECTIONS, contentItems: CONTENT_ITEMS }
    )
    expect(url).toBe('/feed')
  })

  it('unknown referenceType → /feed', () => {
    const url = getNotificationUrl(
      { referenceType: 'unknown_type', referenceId: 'some-id' },
      { projects: PROJECTS, sections: SECTIONS, contentItems: CONTENT_ITEMS }
    )
    expect(url).toBe('/feed')
  })
})
