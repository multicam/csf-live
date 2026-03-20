import type { FeedItem, ContentItem, ContentVersion, Message, Project, Section, Notification, Presence, Tag } from '@csf-live/shared'
import { FEED_DISCUSSION_ID } from '@csf-live/shared/constants'
import { useMockStore } from './store'
import { searchItemsWithSnippets } from '../lib/search'
import type { ContentItemWithSnippet } from '../lib/search'

// Helper to get current store state
function store() {
  return useMockStore.getState()
}

// ─── Feed ──────────────────────────────────────────────────────────────────

export async function getFeedItems(_page = 0): Promise<FeedItem[]> {
  const { messages, contentItems } = store()

  const feedMessages = messages
    .filter(m => m.discussionId === FEED_DISCUSSION_ID)
    .map(m => ({ ...m, _sourceTable: 'message' as const }))

  const feedContentItems = contentItems
    .filter(ci => ci.projectId === null && ci.status === 'active' && ci.deletedAt === null)
    .map(ci => ({ ...ci, _sourceTable: 'content_item' as const }))

  const merged: FeedItem[] = [...feedMessages, ...feedContentItems]
  merged.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

  return merged
}

export async function getProjectFeedItems(projectId: string, sectionId?: string | null): Promise<FeedItem[]> {
  const { messages, contentItems, discussions } = store()

  const projectDiscussion = discussions.find(
    d => d.contextType === 'project' && d.contextId === projectId
  )

  let projectMessages: Message[] = []
  if (projectDiscussion) {
    projectMessages = messages.filter(m => m.discussionId === projectDiscussion.id)
  }

  let sectionMessages: Message[] = []
  if (!sectionId) {
    // aggregate: include all section messages
    const sectionDiscussions = discussions.filter(
      d => d.contextType === 'section'
    )
    const sections = store().sections.filter(s => s.projectId === projectId)
    const sectionIds = new Set(sections.map(s => s.id))
    const relevantDiscussions = sectionDiscussions.filter(d => d.contextId && sectionIds.has(d.contextId))
    const relevantDiscussionIds = new Set(relevantDiscussions.map(d => d.id))
    sectionMessages = messages.filter(m => relevantDiscussionIds.has(m.discussionId))
  } else {
    const sectionDiscussion = discussions.find(
      d => d.contextType === 'section' && d.contextId === sectionId
    )
    if (sectionDiscussion) {
      sectionMessages = messages.filter(m => m.discussionId === sectionDiscussion.id)
    }
  }

  const allMessages = [...projectMessages, ...sectionMessages]

  let filteredContentItems = contentItems.filter(
    ci => ci.projectId === projectId && ci.status === 'active' && ci.deletedAt === null
  )
  if (sectionId) {
    filteredContentItems = filteredContentItems.filter(ci => ci.sectionId === sectionId)
  }

  const feedItems: FeedItem[] = [
    ...allMessages.map(m => ({ ...m, _sourceTable: 'message' as const })),
    ...filteredContentItems.map(ci => ({ ...ci, _sourceTable: 'content_item' as const })),
  ]

  // Project feed: newest first
  feedItems.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  return feedItems
}

// ─── Messages ──────────────────────────────────────────────────────────────

export async function getMessages(discussionId: string, _page = 0): Promise<Message[]> {
  return store().messages
    .filter(m => m.discussionId === discussionId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
}

export async function postMessage(discussionId: string, content: string, authorId: string): Promise<Message> {
  return store().postMessage(discussionId, content, authorId)
}

// ─── Projects ──────────────────────────────────────────────────────────────

export async function getProjects(): Promise<Project[]> {
  return [...store().projects].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  )
}

export async function getProject(slug: string): Promise<Project | null> {
  return store().projects.find(p => p.slug === slug) ?? null
}

export async function createProject(title: string, description?: string): Promise<Project> {
  return store().createProject(title, description)
}

export async function updateProject(projectId: string, patch: Partial<Pick<Project, 'title' | 'description' | 'status'>>): Promise<void> {
  const { projects } = store()
  const project = projects.find(p => p.id === projectId)
  if (!project) throw new Error(`Project ${projectId} not found`)
  useMockStore.setState(state => ({
    projects: state.projects.map(p =>
      p.id === projectId ? { ...p, ...patch, updatedAt: new Date() } : p
    ),
  }))
}

// ─── Sections ──────────────────────────────────────────────────────────────

export async function getSections(projectId: string): Promise<Section[]> {
  return store().sections
    .filter(s => s.projectId === projectId)
    .sort((a, b) => a.order - b.order)
}

export async function createSection(projectId: string, title: string, description?: string): Promise<Section> {
  return store().createSection(projectId, title, description)
}

// ─── Content Items ─────────────────────────────────────────────────────────

export async function getContentItem(id: string): Promise<ContentItem | null> {
  return store().contentItems.find(ci => ci.id === id) ?? null
}

export async function getContentVersions(contentItemId: string): Promise<ContentVersion[]> {
  return store().contentVersions
    .filter(v => v.contentItemId === contentItemId)
    .sort((a, b) => a.versionNumber - b.versionNumber)
}

export async function createContentItem(
  item: Omit<ContentItem, 'id' | 'createdAt' | 'updatedAt' | 'version' | 'status' | 'deletedAt'>
): Promise<ContentItem> {
  return store().createContentItem(item)
}

export async function updateContentItem(itemId: string, patch: Partial<ContentItem>): Promise<void> {
  store().updateContentItem(itemId, patch)
}

export async function moveContentItem(itemId: string, projectId: string | null, sectionId?: string | null): Promise<void> {
  store().moveContentItem(itemId, projectId, sectionId)
}

export async function copyContentItem(itemId: string, projectId: string | null, sectionId?: string | null): Promise<ContentItem> {
  return store().copyContentItem(itemId, projectId, sectionId)
}

export async function updateContentItemVersion(
  itemId: string,
  body?: string | null,
  mediaData?: unknown,
  changeSummary?: string
): Promise<ContentVersion> {
  return store().updateContentItemVersion(itemId, body, mediaData, changeSummary)
}

// ─── Canvas ────────────────────────────────────────────────────────────────

export async function getScratchpadCanvas(): Promise<unknown> {
  return store().scratchpadDoc
}

export async function saveCanvas(tldrawDoc: unknown): Promise<void> {
  store().saveCanvasVersion(tldrawDoc)
}

export async function saveAndCloseCanvas(
  tldrawDoc: unknown,
  targetProjectId?: string | null,
  targetSectionId?: string | null
): Promise<ContentItem> {
  return store().saveAndCloseCanvas(tldrawDoc, targetProjectId, targetSectionId)
}

// ─── Notifications ─────────────────────────────────────────────────────────

export async function getNotifications(userId: string): Promise<Notification[]> {
  return store().notifications
    .filter(n => n.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export async function getUnreadNotificationCount(userId: string): Promise<number> {
  return store().notifications.filter(n => n.userId === userId && !n.read).length
}

export async function markNotificationRead(notificationId: string): Promise<void> {
  store().markNotificationRead(notificationId)
}

export async function markAllNotificationsRead(): Promise<void> {
  store().markAllNotificationsRead()
}

// ─── Presence ──────────────────────────────────────────────────────────────

export async function getPresence(): Promise<Presence[]> {
  return store().presence
}

// ─── Tags ──────────────────────────────────────────────────────────────────

export async function getTags(): Promise<Tag[]> {
  return store().tags
}

// ─── Search ────────────────────────────────────────────────────────────────

export interface SearchFilters {
  type?: string[]
  authorId?: string[]
  projectId?: string
  dateRange?: 'last7' | 'last30' | 'all'
}

export async function searchContentItems(query: string, filters?: SearchFilters): Promise<ContentItemWithSnippet[]> {
  if (!query.trim()) return []
  return searchItemsWithSnippets(query, filters)
}
