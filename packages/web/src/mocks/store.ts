import { create } from 'zustand'
import { initialMockData } from './data'
import { SCRATCHPAD_TLDRAW_DOC } from './tldraw-canvas'
import type {
  User, Project, Section, ContentItem, ContentVersion,
  Discussion, Message, Notification, Presence, Tag, ProjectMember,
} from '@csf-live/shared'
import { CURRENT_USER_ID } from '@csf-live/shared/constants'

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

interface MockStore {
  users: User[]
  projects: Project[]
  sections: Section[]
  projectMembers: ProjectMember[]
  discussions: Discussion[]
  contentItems: ContentItem[]
  contentVersions: ContentVersion[]
  messages: Message[]
  tags: Tag[]
  notifications: Notification[]
  presence: Presence[]
  currentUserId: string
  scratchpadDoc: typeof SCRATCHPAD_TLDRAW_DOC

  postMessage: (discussionId: string, content: string, authorId: string) => Message
  createContentItem: (item: Omit<ContentItem, 'id' | 'createdAt' | 'updatedAt' | 'version' | 'status' | 'deletedAt'>) => ContentItem
  updateContentItem: (itemId: string, patch: Partial<ContentItem>) => void
  moveContentItem: (itemId: string, projectId: string | null, sectionId?: string | null) => void
  copyContentItem: (itemId: string, projectId: string | null, sectionId?: string | null) => ContentItem
  createProject: (title: string, description?: string) => Project
  createSection: (projectId: string, title: string, description?: string) => Section
  saveCanvasVersion: (tldrawDoc: unknown) => void
  saveAndCloseCanvas: (tldrawDoc: unknown, targetProjectId?: string | null, targetSectionId?: string | null) => ContentItem
  markNotificationRead: (notificationId: string) => void
  markAllNotificationsRead: () => void
  updateContentItemVersion: (itemId: string, body?: string | null, mediaData?: unknown, changeSummary?: string) => ContentVersion
}

export const useMockStore = create<MockStore>((set, get) => ({
  ...initialMockData,
  currentUserId: CURRENT_USER_ID,
  scratchpadDoc: SCRATCHPAD_TLDRAW_DOC,

  postMessage: (discussionId, content, authorId) => {
    const message: Message = {
      id: generateId('msg'),
      discussionId,
      authorId,
      content,
      contentType: 'text',
      mediaUrl: null,
      metadata: {},
      source: 'web',
      createdAt: new Date(),
    }
    set(state => ({ messages: [...state.messages, message] }))
    return message
  },

  createContentItem: (item) => {
    const newItem: ContentItem = {
      ...item,
      id: generateId('ci'),
      version: 1,
      status: 'active',
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    set(state => ({ contentItems: [...state.contentItems, newItem] }))
    return newItem
  },

  updateContentItem: (itemId, patch) => {
    set(state => ({
      contentItems: state.contentItems.map(item =>
        item.id === itemId ? { ...item, ...patch, updatedAt: new Date() } : item
      ),
    }))
  },

  moveContentItem: (itemId, projectId, sectionId = null) => {
    set(state => ({
      contentItems: state.contentItems.map(item =>
        item.id === itemId
          ? { ...item, projectId, sectionId: sectionId ?? null, updatedAt: new Date() }
          : item
      ),
    }))
  },

  copyContentItem: (itemId, projectId, sectionId = null) => {
    const source = get().contentItems.find(item => item.id === itemId)
    if (!source) throw new Error(`Content item ${itemId} not found`)
    const copy: ContentItem = {
      ...source,
      id: generateId('ci'),
      projectId,
      sectionId: sectionId ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    set(state => ({ contentItems: [...state.contentItems, copy] }))
    return copy
  },

  createProject: (title, description) => {
    const slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    const project: Project = {
      id: generateId('project'),
      title,
      slug,
      description: description ?? null,
      status: 'active',
      createdBy: CURRENT_USER_ID,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    const discussion: Discussion = {
      id: generateId('disc-project'),
      contextType: 'project',
      contextId: project.id,
      createdAt: new Date(),
    }
    set(state => ({
      projects: [...state.projects, project],
      discussions: [...state.discussions, discussion],
    }))
    return project
  },

  createSection: (projectId, title, description) => {
    const existingSections = get().sections.filter(s => s.projectId === projectId)
    const section: Section = {
      id: generateId('section'),
      projectId,
      title,
      description: description ?? null,
      order: existingSections.length + 1,
      createdBy: CURRENT_USER_ID,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    const discussion: Discussion = {
      id: generateId('disc-section'),
      contextType: 'section',
      contextId: section.id,
      createdAt: new Date(),
    }
    set(state => ({
      sections: [...state.sections, section],
      discussions: [...state.discussions, discussion],
    }))
    return section
  },

  saveCanvasVersion: (tldrawDoc) => {
    set({ scratchpadDoc: tldrawDoc as typeof SCRATCHPAD_TLDRAW_DOC })
  },

  saveAndCloseCanvas: (tldrawDoc, targetProjectId = null, targetSectionId = null) => {
    const newItem = get().createContentItem({
      type: 'drawing',
      title: `Canvas — ${new Date().toLocaleDateString()}`,
      body: null,
      mediaUrl: null,
      mediaType: 'application/tldraw',
      metadata: { mediaData: tldrawDoc },
      source: 'human',
      sourceDetail: null,
      projectId: targetProjectId,
      sectionId: targetSectionId ?? null,
      parentId: null,
      authorId: CURRENT_USER_ID,
    })
    set({ scratchpadDoc: SCRATCHPAD_TLDRAW_DOC })
    return newItem
  },

  markNotificationRead: (notificationId) => {
    set(state => ({
      notifications: state.notifications.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
      ),
    }))
  },

  markAllNotificationsRead: () => {
    set(state => ({
      notifications: state.notifications.map(n => ({ ...n, read: true })),
    }))
  },

  updateContentItemVersion: (itemId, body, mediaData, changeSummary) => {
    const item = get().contentItems.find(i => i.id === itemId)
    if (!item) throw new Error(`Content item ${itemId} not found`)
    const existingVersions = get().contentVersions.filter(v => v.contentItemId === itemId)
    const nextVersion = existingVersions.length + 1
    const version: ContentVersion = {
      id: generateId('cv'),
      contentItemId: itemId,
      versionNumber: nextVersion,
      body: body ?? null,
      mediaData: mediaData ?? null,
      authorId: CURRENT_USER_ID,
      changeSummary: changeSummary ?? null,
      createdAt: new Date(),
    }
    set(state => ({
      contentVersions: [...state.contentVersions, version],
      contentItems: state.contentItems.map(i =>
        i.id === itemId
          ? { ...i, version: nextVersion, body: body ?? i.body, updatedAt: new Date() }
          : i
      ),
    }))
    return version
  },
}))
