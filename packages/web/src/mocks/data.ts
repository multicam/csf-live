import type {
  User, Project, Section, ProjectMember, ContentItem, ContentVersion,
  Discussion, Message, Notification, Presence, Tag
} from '@csf-live/shared'
import { FEED_DISCUSSION_ID } from '@csf-live/shared/constants'
import { SCRATCHPAD_TLDRAW_DOC } from './tldraw-canvas'

// ─── Users ─────────────────────────────────────────────────────────────────

export const users: User[] = [
  {
    id: 'user-jm',
    name: 'Jean-Marc Giorgi',
    email: 'jm@csflive.io',
    role: 'owner',
    avatarUrl: null,
    createdAt: new Date('2025-01-01T00:00:00Z'),
    updatedAt: new Date('2025-01-01T00:00:00Z'),
  },
  {
    id: 'user-ben',
    name: 'Ben',
    email: 'ben@csflive.io',
    role: 'owner',
    avatarUrl: null,
    createdAt: new Date('2025-01-02T00:00:00Z'),
    updatedAt: new Date('2025-01-02T00:00:00Z'),
  },
  {
    id: 'user-claude',
    name: 'Claude',
    email: 'claude@anthropic.com',
    role: 'owner',
    avatarUrl: null,
    createdAt: new Date('2025-01-01T00:00:00Z'),
    updatedAt: new Date('2025-01-01T00:00:00Z'),
  },
]

// ─── Projects ──────────────────────────────────────────────────────────────

export const projects: Project[] = [
  {
    id: 'project-csf-live',
    title: 'CSF Live',
    slug: 'csf-live',
    description: 'Building the collaborative software factory platform.',
    status: 'active',
    createdBy: 'user-jm',
    createdAt: new Date('2025-01-10T10:00:00Z'),
    updatedAt: new Date('2026-03-20T14:00:00Z'),
  },
  {
    id: 'project-knowledge-garden',
    title: 'Knowledge Garden',
    slug: 'knowledge-garden',
    description: 'A curated knowledge base with research layer and curation engine.',
    status: 'active',
    createdBy: 'user-jm',
    createdAt: new Date('2025-02-01T10:00:00Z'),
    updatedAt: new Date('2026-03-18T09:00:00Z'),
  },
  {
    id: 'project-mobile-capture',
    title: 'Mobile Capture',
    slug: 'mobile-capture',
    description: 'Mobile-first capture workflow for on-the-go ideas.',
    status: 'paused',
    createdBy: 'user-ben',
    createdAt: new Date('2025-03-15T10:00:00Z'),
    updatedAt: new Date('2026-02-01T10:00:00Z'),
  },
  {
    id: 'project-legacy-refactor',
    title: 'Legacy Refactor',
    slug: 'legacy-refactor',
    description: 'Audit and migration plan for legacy systems.',
    status: 'archived',
    createdBy: 'user-jm',
    createdAt: new Date('2024-11-01T10:00:00Z'),
    updatedAt: new Date('2025-12-01T10:00:00Z'),
  },
]

// ─── Sections ──────────────────────────────────────────────────────────────

export const sections: Section[] = [
  { id: 'section-csf-fe', projectId: 'project-csf-live', title: 'Frontend Architecture', description: 'React + Vite + Tailwind frontend design and implementation.', order: 1, createdBy: 'user-jm', createdAt: new Date('2025-01-10T10:00:00Z'), updatedAt: new Date('2025-01-10T10:00:00Z') },
  { id: 'section-csf-data', projectId: 'project-csf-live', title: 'Data Model', description: 'Database schema, Drizzle ORM, and data relationships.', order: 2, createdBy: 'user-jm', createdAt: new Date('2025-01-10T10:00:00Z'), updatedAt: new Date('2025-01-10T10:00:00Z') },
  { id: 'section-kg-research', projectId: 'project-knowledge-garden', title: 'Research Layer', description: 'AI-powered research and source aggregation.', order: 1, createdBy: 'user-jm', createdAt: new Date('2025-02-01T10:00:00Z'), updatedAt: new Date('2025-02-01T10:00:00Z') },
  { id: 'section-kg-curation', projectId: 'project-knowledge-garden', title: 'Curation Engine', description: 'Filtering, tagging, and organizing research findings.', order: 2, createdBy: 'user-jm', createdAt: new Date('2025-02-01T10:00:00Z'), updatedAt: new Date('2025-02-01T10:00:00Z') },
  { id: 'section-kg-publish', projectId: 'project-knowledge-garden', title: 'Publishing', description: 'Export and publishing workflows.', order: 3, createdBy: 'user-jm', createdAt: new Date('2025-02-01T10:00:00Z'), updatedAt: new Date('2025-02-01T10:00:00Z') },
  { id: 'section-mc-ux', projectId: 'project-mobile-capture', title: 'UX Design', description: 'Mobile UX flows and prototypes.', order: 1, createdBy: 'user-ben', createdAt: new Date('2025-03-15T10:00:00Z'), updatedAt: new Date('2025-03-15T10:00:00Z') },
  { id: 'section-lr-audit', projectId: 'project-legacy-refactor', title: 'Audit', description: 'Code and architecture audit findings.', order: 1, createdBy: 'user-jm', createdAt: new Date('2024-11-01T10:00:00Z'), updatedAt: new Date('2024-11-01T10:00:00Z') },
  { id: 'section-lr-migration', projectId: 'project-legacy-refactor', title: 'Migration Plan', description: 'Step-by-step migration strategy.', order: 2, createdBy: 'user-jm', createdAt: new Date('2024-11-01T10:00:00Z'), updatedAt: new Date('2024-11-01T10:00:00Z') },
]

// ─── Discussions ───────────────────────────────────────────────────────────

export const discussions: Discussion[] = [
  // Feed discussion
  { id: FEED_DISCUSSION_ID, contextType: 'feed', contextId: null, createdAt: new Date('2025-01-01T00:00:00Z') },
  // Project discussions
  { id: 'disc-project-csf', contextType: 'project', contextId: 'project-csf-live', createdAt: new Date('2025-01-10T10:00:00Z') },
  { id: 'disc-project-kg', contextType: 'project', contextId: 'project-knowledge-garden', createdAt: new Date('2025-02-01T10:00:00Z') },
  { id: 'disc-project-mc', contextType: 'project', contextId: 'project-mobile-capture', createdAt: new Date('2025-03-15T10:00:00Z') },
  { id: 'disc-project-lr', contextType: 'project', contextId: 'project-legacy-refactor', createdAt: new Date('2024-11-01T10:00:00Z') },
  // Section discussions
  { id: 'disc-section-csf-fe', contextType: 'section', contextId: 'section-csf-fe', createdAt: new Date('2025-01-10T10:00:00Z') },
  { id: 'disc-section-csf-data', contextType: 'section', contextId: 'section-csf-data', createdAt: new Date('2025-01-10T10:00:00Z') },
  { id: 'disc-section-kg-research', contextType: 'section', contextId: 'section-kg-research', createdAt: new Date('2025-02-01T10:00:00Z') },
  { id: 'disc-section-kg-curation', contextType: 'section', contextId: 'section-kg-curation', createdAt: new Date('2025-02-01T10:00:00Z') },
  { id: 'disc-section-kg-publish', contextType: 'section', contextId: 'section-kg-publish', createdAt: new Date('2025-02-01T10:00:00Z') },
  { id: 'disc-section-mc-ux', contextType: 'section', contextId: 'section-mc-ux', createdAt: new Date('2025-03-15T10:00:00Z') },
  { id: 'disc-section-lr-audit', contextType: 'section', contextId: 'section-lr-audit', createdAt: new Date('2024-11-01T10:00:00Z') },
  { id: 'disc-section-lr-migration', contextType: 'section', contextId: 'section-lr-migration', createdAt: new Date('2024-11-01T10:00:00Z') },
]

// ─── Project Members ────────────────────────────────────────────────────────

export const projectMembers: ProjectMember[] = [
  { projectId: 'project-csf-live', userId: 'user-jm', role: 'owner', invitedBy: 'user-jm', joinedAt: new Date('2025-01-10T10:00:00Z') },
  { projectId: 'project-csf-live', userId: 'user-ben', role: 'collaborator', invitedBy: 'user-jm', joinedAt: new Date('2025-01-15T10:00:00Z') },
  { projectId: 'project-knowledge-garden', userId: 'user-jm', role: 'owner', invitedBy: 'user-jm', joinedAt: new Date('2025-02-01T10:00:00Z') },
  { projectId: 'project-mobile-capture', userId: 'user-ben', role: 'owner', invitedBy: 'user-ben', joinedAt: new Date('2025-03-15T10:00:00Z') },
  { projectId: 'project-legacy-refactor', userId: 'user-jm', role: 'owner', invitedBy: 'user-jm', joinedAt: new Date('2024-11-01T10:00:00Z') },
]

// ─── Tags ─────────────────────────────────────────────────────────────────

export const tags: Tag[] = [
  { id: 'tag-react', name: 'react' },
  { id: 'tag-tldraw', name: 'tldraw' },
  { id: 'tag-auth', name: 'auth' },
  { id: 'tag-api-design', name: 'api-design' },
  { id: 'tag-mobile', name: 'mobile' },
  { id: 'tag-ux', name: 'ux' },
  { id: 'tag-performance', name: 'performance' },
  { id: 'tag-database', name: 'database' },
  { id: 'tag-claude', name: 'claude' },
  { id: 'tag-ai-generated', name: 'ai-generated' },
  { id: 'tag-architecture', name: 'architecture' },
  { id: 'tag-design-system', name: 'design-system' },
  { id: 'tag-versioning', name: 'versioning' },
  { id: 'tag-search', name: 'search' },
  { id: 'tag-capture', name: 'capture' },
]

// ─── Content Items ─────────────────────────────────────────────────────────

export const contentItems: ContentItem[] = [
  // ── Ideas (feed) ──
  {
    id: 'ci-idea-001',
    type: 'idea',
    title: 'Implement virtual scrolling for large feeds',
    body: 'As feed items grow, we need virtual scrolling to maintain 60fps. Consider TanStack Virtual as it integrates well with our React Query setup.',
    mediaUrl: null, mediaType: null,
    metadata: { tags: ['react', 'performance'] },
    source: 'human', sourceDetail: null,
    projectId: null, sectionId: null, parentId: null,
    authorId: 'user-jm',
    status: 'active', version: 1,
    createdAt: new Date('2026-01-15T09:00:00Z'),
    updatedAt: new Date('2026-01-15T09:00:00Z'),
    deletedAt: null,
  },
  {
    id: 'ci-idea-002',
    type: 'idea',
    title: 'Dark mode token audit',
    body: 'Need to go through all Tailwind tokens and ensure dark: variants are applied consistently. Some borders and backgrounds are missing dark variants.',
    mediaUrl: null, mediaType: null,
    metadata: { tags: ['design-system'] },
    source: 'human', sourceDetail: null,
    projectId: null, sectionId: null, parentId: null,
    authorId: 'user-jm',
    status: 'active', version: 1,
    createdAt: new Date('2026-01-20T10:30:00Z'),
    updatedAt: new Date('2026-01-20T10:30:00Z'),
    deletedAt: null,
  },
  {
    id: 'ci-idea-003',
    type: 'idea',
    title: 'Consider using container queries instead of viewport breakpoints',
    body: 'Container queries would make cards reusable across different column widths without needing separate components for each breakpoint.',
    mediaUrl: null, mediaType: null,
    metadata: { tags: ['react', 'design-system'] },
    source: 'human', sourceDetail: null,
    projectId: null, sectionId: null, parentId: null,
    authorId: 'user-ben',
    status: 'active', version: 1,
    createdAt: new Date('2026-01-22T14:00:00Z'),
    updatedAt: new Date('2026-01-22T14:00:00Z'),
    deletedAt: null,
  },
  {
    id: 'ci-idea-004',
    type: 'idea',
    title: 'Feed item deduplication strategy',
    body: 'When an item appears in both the project feed and general feed, we need a consistent deduplication strategy. Current approach: show in project, hide from general feed.',
    mediaUrl: null, mediaType: null,
    metadata: {},
    source: 'human', sourceDetail: null,
    projectId: 'project-csf-live', sectionId: null, parentId: null,
    authorId: 'user-jm',
    status: 'active', version: 1,
    createdAt: new Date('2026-02-01T11:00:00Z'),
    updatedAt: new Date('2026-02-01T11:00:00Z'),
    deletedAt: null,
  },
  {
    id: 'ci-idea-005',
    type: 'idea',
    title: 'Keyboard navigation between columns',
    body: 'Tab key should navigate between columns, with arrow keys within each column. Cmd+1/2/3 focus respective columns.',
    mediaUrl: null, mediaType: null,
    metadata: { tags: ['ux'] },
    source: 'human', sourceDetail: null,
    projectId: 'project-csf-live', sectionId: 'section-csf-fe', parentId: null,
    authorId: 'user-jm',
    status: 'active', version: 1,
    createdAt: new Date('2026-02-05T09:00:00Z'),
    updatedAt: new Date('2026-02-05T09:00:00Z'),
    deletedAt: null,
  },
  {
    id: 'ci-idea-006',
    type: 'idea',
    title: 'Optimistic UI pattern for message posting',
    body: 'Messages should appear immediately in the feed before the mutation settles. Use React Query onMutate to inject the optimistic item.',
    mediaUrl: null, mediaType: null,
    metadata: { tags: ['react'] },
    source: 'human', sourceDetail: null,
    projectId: null, sectionId: null, parentId: null,
    authorId: 'user-jm',
    status: 'active', version: 1,
    createdAt: new Date('2026-02-10T16:00:00Z'),
    updatedAt: new Date('2026-02-10T16:00:00Z'),
    deletedAt: null,
  },
  {
    id: 'ci-idea-007',
    type: 'idea',
    title: 'Minisearch index warm-up strategy',
    body: 'The search index should be built lazily on first search, not on app init. This avoids blocking the initial render with 60+ items to index.',
    mediaUrl: null, mediaType: null,
    metadata: { tags: ['search', 'performance'] },
    source: 'human', sourceDetail: null,
    projectId: null, sectionId: null, parentId: null,
    authorId: 'user-jm',
    status: 'active', version: 1,
    createdAt: new Date('2026-02-14T10:00:00Z'),
    updatedAt: new Date('2026-02-14T10:00:00Z'),
    deletedAt: null,
  },
  {
    id: 'ci-idea-008',
    type: 'idea',
    title: 'Section reordering via drag and drop',
    body: 'Sections should be reorderable within the project dashboard. Use the HTML5 drag API consistent with card DnD.',
    mediaUrl: null, mediaType: null,
    metadata: { tags: ['ux'] },
    source: 'human', sourceDetail: null,
    projectId: 'project-knowledge-garden', sectionId: null, parentId: null,
    authorId: 'user-jm',
    status: 'active', version: 1,
    createdAt: new Date('2026-02-18T11:00:00Z'),
    updatedAt: new Date('2026-02-18T11:00:00Z'),
    deletedAt: null,
  },
  {
    id: 'ci-idea-009',
    type: 'idea',
    title: 'Toast notifications for all mutations',
    body: 'Every create/update/move/delete should have a success toast. Errors should have error toasts with descriptive messages.',
    mediaUrl: null, mediaType: null,
    metadata: {},
    source: 'human', sourceDetail: null,
    projectId: null, sectionId: null, parentId: null,
    authorId: 'user-ben',
    status: 'active', version: 1,
    createdAt: new Date('2026-02-20T13:00:00Z'),
    updatedAt: new Date('2026-02-20T13:00:00Z'),
    deletedAt: null,
  },
  {
    id: 'ci-idea-010',
    type: 'idea',
    title: 'Route-based focus management',
    body: 'On route transition, focus should move to the main content area. This is critical for keyboard users navigating between feed and detail views.',
    mediaUrl: null, mediaType: null,
    metadata: { tags: ['ux'] },
    source: 'human', sourceDetail: null,
    projectId: null, sectionId: null, parentId: null,
    authorId: 'user-jm',
    status: 'active', version: 1,
    createdAt: new Date('2026-03-01T09:00:00Z'),
    updatedAt: new Date('2026-03-01T09:00:00Z'),
    deletedAt: null,
  },

  // ── Documents ──
  {
    id: 'ci-doc-001',
    type: 'document',
    title: 'CSF Live — Frontend Architecture PRD',
    body: `# Frontend Architecture PRD

## Overview
CSF Live is a React 19 + Vite SPA with a 3-column layout for feed, projects, and detail views.

## Tech Stack
- **Framework:** React 19
- **Build:** Vite + Bun
- **Routing:** TanStack Router (file-based)
- **State:** Zustand (mock store) + React Query
- **Styling:** Tailwind CSS v4
- **UI:** Radix UI primitives
- **Canvas:** tldraw
- **Editor:** TipTap

## Architecture Decisions
1. Container queries over viewport breakpoints for cards
2. React Query hooks as the only component-facing data layer
3. Zustand as the single source of truth for mock data
4. File-based routing for discoverability

## Constraints
- Tier 1: No backend, no auth, mock data only
- Must be swappable to real API in Tier 2 without component changes`,
    mediaUrl: null, mediaType: null,
    metadata: { document_type: 'prd', tags: ['architecture', 'react'] },
    source: 'human', sourceDetail: null,
    projectId: 'project-csf-live', sectionId: 'section-csf-fe', parentId: null,
    authorId: 'user-jm',
    status: 'active', version: 3,
    createdAt: new Date('2026-01-10T10:00:00Z'),
    updatedAt: new Date('2026-03-15T16:00:00Z'),
    deletedAt: null,
  },
  {
    id: 'ci-doc-002',
    type: 'document',
    title: 'Data Model Notes',
    body: `# Data Model Notes

## Key Decisions
- Feed items are a UNION of messages + content_items
- Content items use soft-delete (deletedAt nullable)
- source field distinguishes human vs AI content
- tldraw data stored as mediaData JSONB
- document_type stored in metadata.document_type (not top-level column)

## Relationships
- A Discussion has many Messages
- A ContentItem belongs to a Project (nullable) and Section (nullable)
- Sections belong to Projects
- ProjectMembers join table for user-project associations`,
    mediaUrl: null, mediaType: null,
    metadata: { document_type: 'note', tags: ['database', 'architecture'] },
    source: 'human', sourceDetail: null,
    projectId: 'project-csf-live', sectionId: 'section-csf-data', parentId: null,
    authorId: 'user-jm',
    status: 'active', version: 2,
    createdAt: new Date('2026-01-12T14:00:00Z'),
    updatedAt: new Date('2026-02-20T10:00:00Z'),
    deletedAt: null,
  },
  {
    id: 'ci-doc-003',
    type: 'document',
    title: 'Knowledge Garden Blueprint',
    body: `# Knowledge Garden Blueprint

## Vision
A living knowledge base that grows through captured research, curated insights, and AI-assisted synthesis.

## Architecture
1. **Capture Layer** — anything captured flows into the Research section
2. **Curation Engine** — tagging, filtering, linking between items
3. **Publishing** — export to various formats

## AI Integration (Tier 3)
Claude will assist with synthesis and summarization across sections.`,
    mediaUrl: null, mediaType: null,
    metadata: { document_type: 'blueprint', tags: ['architecture'] },
    source: 'human', sourceDetail: null,
    projectId: 'project-knowledge-garden', sectionId: null, parentId: null,
    authorId: 'user-jm',
    status: 'active', version: 1,
    createdAt: new Date('2026-02-05T11:00:00Z'),
    updatedAt: new Date('2026-02-05T11:00:00Z'),
    deletedAt: null,
  },
  {
    id: 'ci-doc-004',
    type: 'document',
    title: 'Mobile Capture Meeting Notes — March',
    body: `# Mobile Capture Meeting Notes — March 2026

**Date:** 2026-03-10
**Attendees:** JM, Ben

## Agenda
1. UX flow review
2. Voice capture implementation
3. Photo capture integration

## Decisions
- Use native media APIs (not third-party libraries)
- MediaRecorder API for voice
- input[type=file] with capture="environment" for camera
- No server-side processing in Tier 1 — blob URLs only

## Action Items
- [ ] Ben: wireframe the capture flow
- [ ] JM: prototype MediaRecorder integration`,
    mediaUrl: null, mediaType: null,
    metadata: { document_type: 'meeting-notes' },
    source: 'human', sourceDetail: null,
    projectId: 'project-mobile-capture', sectionId: 'section-mc-ux', parentId: null,
    authorId: 'user-ben',
    status: 'active', version: 1,
    createdAt: new Date('2026-03-10T15:00:00Z'),
    updatedAt: new Date('2026-03-10T15:00:00Z'),
    deletedAt: null,
  },
  {
    id: 'ci-doc-005',
    type: 'document',
    title: 'Legacy Refactor Audit Report',
    body: `# Legacy Refactor Audit Report

## Summary
The legacy codebase has significant technical debt that requires systematic migration.

## Findings
1. **No TypeScript** — all JavaScript, no type safety
2. **Outdated dependencies** — React 16, webpack 4
3. **No test coverage** — 0% unit test coverage
4. **Tightly coupled** — UI, business logic, and data access mixed

## Migration Priority
1. TypeScript migration (automated with ts-migrate)
2. Testing setup (Vitest)
3. Component library migration to Radix
4. State management modernization`,
    mediaUrl: null, mediaType: null,
    metadata: { document_type: 'research-summary', tags: ['architecture'] },
    source: 'human', sourceDetail: null,
    projectId: 'project-legacy-refactor', sectionId: 'section-lr-audit', parentId: null,
    authorId: 'user-jm',
    status: 'active', version: 2,
    createdAt: new Date('2024-11-15T10:00:00Z'),
    updatedAt: new Date('2025-01-10T10:00:00Z'),
    deletedAt: null,
  },
  {
    id: 'ci-doc-006',
    type: 'document',
    title: 'Component Library Guidelines',
    body: `# Component Library Guidelines

## Principles
- Use Radix UI primitives as base
- Extend with Tailwind CSS classes
- Follow WAI-ARIA patterns

## Component Structure
Each component should export:
1. The component itself
2. TypeScript types for props
3. Default export for lazy loading

## Naming Convention
- PascalCase for components
- camelCase for hooks (useXxx)
- All hooks in hooks/ directory`,
    mediaUrl: null, mediaType: null,
    metadata: { document_type: 'note', tags: ['design-system', 'react'] },
    source: 'human', sourceDetail: null,
    projectId: 'project-csf-live', sectionId: 'section-csf-fe', parentId: null,
    authorId: 'user-jm',
    status: 'active', version: 1,
    createdAt: new Date('2026-02-01T09:00:00Z'),
    updatedAt: new Date('2026-02-01T09:00:00Z'),
    deletedAt: null,
  },
  {
    id: 'ci-doc-007',
    type: 'document',
    title: 'Search Index Design',
    body: `# Search Index Design

## Implementation
Using MiniSearch for client-side full-text search.

## Indexed Fields
- title (weight: 2)
- body
- metadata.linkTitle
- metadata.transcription
- metadata.fileName

## Filters
- Content type
- Author
- Date range
- Project/Section

## Performance
Index is built lazily on first search query.
Estimated ~100ms for 1000 items on first build.`,
    mediaUrl: null, mediaType: null,
    metadata: { document_type: 'blueprint', tags: ['search', 'architecture'] },
    source: 'human', sourceDetail: null,
    projectId: null, sectionId: null, parentId: null,
    authorId: 'user-jm',
    status: 'active', version: 1,
    createdAt: new Date('2026-03-05T10:00:00Z'),
    updatedAt: new Date('2026-03-05T10:00:00Z'),
    deletedAt: null,
  },
  {
    id: 'ci-doc-008',
    type: 'document',
    title: 'Curation Engine Spec',
    body: `# Curation Engine Specification

## Purpose
Organize and filter research items with intelligent tagging.

## Core Features
1. Auto-tagging via Claude (Tier 3)
2. Manual tag management
3. Cross-project linking
4. Duplicate detection

## Tag Taxonomy
Tags are flat (no hierarchy in Tier 1).
Tag suggestions from Claude in Tier 3.`,
    mediaUrl: null, mediaType: null,
    metadata: { document_type: 'blueprint' },
    source: 'human', sourceDetail: null,
    projectId: 'project-knowledge-garden', sectionId: 'section-kg-curation', parentId: null,
    authorId: 'user-jm',
    status: 'active', version: 1,
    createdAt: new Date('2026-02-10T14:00:00Z'),
    updatedAt: new Date('2026-02-10T14:00:00Z'),
    deletedAt: null,
  },

  // ── Drawings ──
  {
    id: 'ci-drawing-001',
    type: 'drawing',
    title: 'CSF Live Layout Sketch',
    body: null,
    mediaUrl: null, mediaType: 'application/tldraw',
    metadata: {},
    source: 'human', sourceDetail: null,
    projectId: 'project-csf-live', sectionId: 'section-csf-fe', parentId: null,
    authorId: 'user-jm',
    status: 'active', version: 2,
    createdAt: new Date('2026-01-20T11:00:00Z'),
    updatedAt: new Date('2026-02-10T09:00:00Z'),
    deletedAt: null,
  },
  {
    id: 'ci-drawing-002',
    type: 'drawing',
    title: 'Data Flow Diagram',
    body: null,
    mediaUrl: null, mediaType: 'application/tldraw',
    metadata: {},
    source: 'human', sourceDetail: null,
    projectId: 'project-csf-live', sectionId: 'section-csf-data', parentId: null,
    authorId: 'user-jm',
    status: 'active', version: 2,
    createdAt: new Date('2026-01-25T14:00:00Z'),
    updatedAt: new Date('2026-02-15T14:00:00Z'),
    deletedAt: null,
  },
  {
    id: 'ci-drawing-003',
    type: 'drawing',
    title: 'Mobile Capture Flow',
    body: null,
    mediaUrl: null, mediaType: 'application/tldraw',
    metadata: {},
    source: 'human', sourceDetail: null,
    projectId: 'project-mobile-capture', sectionId: 'section-mc-ux', parentId: null,
    authorId: 'user-ben',
    status: 'active', version: 1,
    createdAt: new Date('2026-03-08T10:00:00Z'),
    updatedAt: new Date('2026-03-08T10:00:00Z'),
    deletedAt: null,
  },
  {
    id: 'ci-drawing-004',
    type: 'drawing',
    title: 'Knowledge Graph Concept',
    body: null,
    mediaUrl: null, mediaType: 'application/tldraw',
    metadata: {},
    source: 'human', sourceDetail: null,
    projectId: null, sectionId: null, parentId: null,
    authorId: 'user-jm',
    status: 'active', version: 1,
    createdAt: new Date('2026-03-15T11:00:00Z'),
    updatedAt: new Date('2026-03-15T11:00:00Z'),
    deletedAt: null,
  },

  // ── Sketches ──
  {
    id: 'ci-sketch-001',
    type: 'sketch',
    title: 'Feed Layout Wireframe',
    body: null,
    mediaUrl: 'https://placehold.co/800x600/e8e0d8/6b6460?text=Feed+Layout',
    mediaType: 'image/png',
    metadata: {},
    source: 'human', sourceDetail: null,
    projectId: 'project-csf-live', sectionId: 'section-csf-fe', parentId: null,
    authorId: 'user-jm',
    status: 'active', version: 1,
    createdAt: new Date('2026-01-08T10:00:00Z'),
    updatedAt: new Date('2026-01-08T10:00:00Z'),
    deletedAt: null,
  },
  {
    id: 'ci-sketch-002',
    type: 'sketch',
    title: 'Mobile Tab Bar',
    body: null,
    mediaUrl: 'https://placehold.co/400x200/e8e0d8/6b6460?text=Mobile+Tab+Bar',
    mediaType: 'image/png',
    metadata: {},
    source: 'human', sourceDetail: null,
    projectId: 'project-mobile-capture', sectionId: 'section-mc-ux', parentId: null,
    authorId: 'user-ben',
    status: 'active', version: 1,
    createdAt: new Date('2026-03-12T14:00:00Z'),
    updatedAt: new Date('2026-03-12T14:00:00Z'),
    deletedAt: null,
  },
  {
    id: 'ci-sketch-003',
    type: 'sketch',
    title: 'Card Container Query Breakpoints',
    body: null,
    mediaUrl: 'https://placehold.co/600x400/e8e0d8/6b6460?text=Card+Breakpoints',
    mediaType: 'image/png',
    metadata: {},
    source: 'human', sourceDetail: null,
    projectId: null, sectionId: null, parentId: null,
    authorId: 'user-jm',
    status: 'active', version: 1,
    createdAt: new Date('2026-02-20T09:00:00Z'),
    updatedAt: new Date('2026-02-20T09:00:00Z'),
    deletedAt: null,
  },
  {
    id: 'ci-sketch-004',
    type: 'sketch',
    title: 'Detail Column States',
    body: null,
    mediaUrl: 'https://placehold.co/400x600/e8e0d8/6b6460?text=Detail+Column',
    mediaType: 'image/png',
    metadata: {},
    source: 'human', sourceDetail: null,
    projectId: 'project-csf-live', sectionId: null, parentId: null,
    authorId: 'user-jm',
    status: 'active', version: 1,
    createdAt: new Date('2026-02-25T11:00:00Z'),
    updatedAt: new Date('2026-02-25T11:00:00Z'),
    deletedAt: null,
  },

  // ── Links ──
  {
    id: 'ci-link-001',
    type: 'link',
    title: null,
    body: null,
    mediaUrl: 'https://tanstack.com/router/latest',
    mediaType: null,
    metadata: {
      title: 'TanStack Router | Modern and Scalable Routing for React',
      description: 'A fully type-safe router with first-class search param APIs, file-based routing, and a powerful client-side cache.',
      favicon: 'https://tanstack.com/favicon.ico',
      ogImage: 'https://tanstack.com/og-router.png',
      domain: 'tanstack.com',
      tags: ['react'],
    },
    source: 'human', sourceDetail: null,
    projectId: null, sectionId: null, parentId: null,
    authorId: 'user-jm',
    status: 'active', version: 1,
    createdAt: new Date('2026-01-05T10:00:00Z'),
    updatedAt: new Date('2026-01-05T10:00:00Z'),
    deletedAt: null,
  },
  {
    id: 'ci-link-002',
    type: 'link',
    title: null,
    body: null,
    mediaUrl: 'https://tldraw.dev',
    mediaType: null,
    metadata: {
      title: 'tldraw — Make your product a canvas',
      description: 'A React library for creating infinite canvas experiences.',
      favicon: 'https://tldraw.dev/favicon.ico',
      ogImage: null,
      domain: 'tldraw.dev',
      tags: ['tldraw'],
    },
    source: 'human', sourceDetail: null,
    projectId: 'project-csf-live', sectionId: 'section-csf-fe', parentId: null,
    authorId: 'user-jm',
    status: 'active', version: 1,
    createdAt: new Date('2026-01-10T11:00:00Z'),
    updatedAt: new Date('2026-01-10T11:00:00Z'),
    deletedAt: null,
  },
  {
    id: 'ci-link-003',
    type: 'link',
    title: null,
    body: null,
    mediaUrl: 'https://workos.com',
    mediaType: null,
    metadata: {
      title: 'WorkOS — Add Enterprise Features in Minutes',
      description: 'The modern identity platform for B2B SaaS. Single Sign-On, Directory Sync, and more.',
      favicon: 'https://workos.com/favicon.ico',
      ogImage: null,
      domain: 'workos.com',
      tags: ['auth'],
    },
    source: 'human', sourceDetail: null,
    projectId: null, sectionId: null, parentId: null,
    authorId: 'user-jm',
    status: 'active', version: 1,
    createdAt: new Date('2026-01-15T14:00:00Z'),
    updatedAt: new Date('2026-01-15T14:00:00Z'),
    deletedAt: null,
  },
  {
    id: 'ci-link-004',
    type: 'link',
    title: null,
    body: null,
    mediaUrl: 'https://tailwindcss.com/blog/tailwindcss-v4',
    mediaType: null,
    metadata: {
      title: 'Tailwind CSS v4.0 — The Update of the Decade',
      description: 'A new architecture, a new configuration format, and a new CSS engine.',
      favicon: 'https://tailwindcss.com/favicon.ico',
      ogImage: null,
      domain: 'tailwindcss.com',
      tags: ['design-system'],
    },
    source: 'human', sourceDetail: null,
    projectId: 'project-csf-live', sectionId: 'section-csf-fe', parentId: null,
    authorId: 'user-jm',
    status: 'active', version: 1,
    createdAt: new Date('2026-01-20T09:00:00Z'),
    updatedAt: new Date('2026-01-20T09:00:00Z'),
    deletedAt: null,
  },
  {
    id: 'ci-link-005',
    type: 'link',
    title: null,
    body: null,
    mediaUrl: 'https://orm.drizzle.team',
    mediaType: null,
    metadata: {
      title: 'Drizzle ORM — Next Generation TypeScript ORM',
      description: 'Drizzle is a headless TypeScript ORM with a drizzle of magic.',
      favicon: 'https://orm.drizzle.team/favicon.ico',
      ogImage: null,
      domain: 'orm.drizzle.team',
      tags: ['database'],
    },
    source: 'human', sourceDetail: null,
    projectId: null, sectionId: null, parentId: null,
    authorId: 'user-jm',
    status: 'active', version: 1,
    createdAt: new Date('2026-02-01T10:00:00Z'),
    updatedAt: new Date('2026-02-01T10:00:00Z'),
    deletedAt: null,
  },
  {
    id: 'ci-link-006',
    type: 'link',
    title: null,
    body: null,
    mediaUrl: 'https://minisearch.js.org',
    mediaType: null,
    metadata: {
      title: 'MiniSearch — Tiny but powerful full-text search engine for JavaScript',
      description: 'MiniSearch is a tiny, powerful in-memory full-text search engine written in JavaScript.',
      favicon: null,
      ogImage: null,
      domain: 'minisearch.js.org',
      tags: ['search'],
    },
    source: 'human', sourceDetail: null,
    projectId: null, sectionId: null, parentId: null,
    authorId: 'user-jm',
    status: 'active', version: 1,
    createdAt: new Date('2026-02-10T15:00:00Z'),
    updatedAt: new Date('2026-02-10T15:00:00Z'),
    deletedAt: null,
  },
  {
    id: 'ci-link-007',
    type: 'link',
    title: null,
    body: null,
    mediaUrl: 'https://ui.shadcn.com',
    mediaType: null,
    metadata: {
      title: 'shadcn/ui — Build your component library',
      description: 'Beautifully designed components built with Radix UI and Tailwind CSS.',
      favicon: null,
      ogImage: null,
      domain: 'ui.shadcn.com',
      tags: ['design-system', 'react'],
    },
    source: 'human', sourceDetail: null,
    projectId: 'project-csf-live', sectionId: null, parentId: null,
    authorId: 'user-jm',
    status: 'active', version: 1,
    createdAt: new Date('2026-02-15T11:00:00Z'),
    updatedAt: new Date('2026-02-15T11:00:00Z'),
    deletedAt: null,
  },
  {
    id: 'ci-link-008',
    type: 'link',
    title: null,
    body: null,
    mediaUrl: 'https://tiptap.dev',
    mediaType: null,
    metadata: {
      title: 'Tiptap — The headless editor framework for web artisans',
      description: 'Build exactly the rich text editor you want with Tiptap.',
      favicon: null,
      ogImage: null,
      domain: 'tiptap.dev',
      tags: ['react'],
    },
    source: 'human', sourceDetail: null,
    projectId: null, sectionId: null, parentId: null,
    authorId: 'user-jm',
    status: 'active', version: 1,
    createdAt: new Date('2026-02-20T14:00:00Z'),
    updatedAt: new Date('2026-02-20T14:00:00Z'),
    deletedAt: null,
  },

  // ── Voice ──
  {
    id: 'ci-voice-001',
    type: 'voice',
    title: 'Voice note — architecture walkthrough',
    body: null,
    mediaUrl: 'blob:mock-voice-001',
    mediaType: 'audio/webm',
    metadata: { duration: 142, transcription: 'This is a mock transcription of the architecture walkthrough. We discuss the three-column layout, the routing strategy, and the mock data approach for Tier 1.' },
    source: 'human', sourceDetail: null,
    projectId: 'project-csf-live', sectionId: null, parentId: null,
    authorId: 'user-jm',
    status: 'active', version: 1,
    createdAt: new Date('2026-02-05T16:00:00Z'),
    updatedAt: new Date('2026-02-05T16:00:00Z'),
    deletedAt: null,
  },
  {
    id: 'ci-voice-002',
    type: 'voice',
    title: 'Quick idea — mobile capture UX',
    body: null,
    mediaUrl: 'blob:mock-voice-002',
    mediaType: 'audio/webm',
    metadata: { duration: 48, transcription: 'The capture button should be in the bottom center, always visible. Large touch target, at least 56px. Haptic feedback on press.' },
    source: 'human', sourceDetail: null,
    projectId: 'project-mobile-capture', sectionId: 'section-mc-ux', parentId: null,
    authorId: 'user-jm',
    status: 'active', version: 1,
    createdAt: new Date('2026-03-05T08:00:00Z'),
    updatedAt: new Date('2026-03-05T08:00:00Z'),
    deletedAt: null,
  },
  {
    id: 'ci-voice-003',
    type: 'voice',
    title: 'Meeting debrief — knowledge garden',
    body: null,
    mediaUrl: 'blob:mock-voice-003',
    mediaType: 'audio/webm',
    metadata: { duration: 215, transcription: 'Post-meeting debrief. We aligned on the curation engine being the priority. Research layer comes first, then curation, then publishing. Timeline: research layer by end of April.' },
    source: 'human', sourceDetail: null,
    projectId: 'project-knowledge-garden', sectionId: null, parentId: null,
    authorId: 'user-jm',
    status: 'active', version: 1,
    createdAt: new Date('2026-02-15T17:00:00Z'),
    updatedAt: new Date('2026-02-15T17:00:00Z'),
    deletedAt: null,
  },
  {
    id: 'ci-voice-004',
    type: 'voice',
    title: 'Note to self — tldraw integration',
    body: null,
    mediaUrl: 'blob:mock-voice-004',
    mediaType: 'audio/webm',
    metadata: { duration: 67, transcription: 'Remember to pin tldraw version. The API changed significantly between major versions. Use the snapshot store API, not the legacy format.' },
    source: 'human', sourceDetail: null,
    projectId: null, sectionId: null, parentId: null,
    authorId: 'user-jm',
    status: 'active', version: 1,
    createdAt: new Date('2026-03-10T10:00:00Z'),
    updatedAt: new Date('2026-03-10T10:00:00Z'),
    deletedAt: null,
  },

  // ── Photos ──
  {
    id: 'ci-photo-001',
    type: 'photo',
    title: 'Whiteboard — system architecture',
    body: null,
    mediaUrl: 'https://placehold.co/1200x900/d4cdc6/6b6460?text=Whiteboard+Architecture',
    mediaType: 'image/jpeg',
    metadata: {},
    source: 'human', sourceDetail: null,
    projectId: 'project-csf-live', sectionId: null, parentId: null,
    authorId: 'user-jm',
    status: 'active', version: 1,
    createdAt: new Date('2026-01-18T14:00:00Z'),
    updatedAt: new Date('2026-01-18T14:00:00Z'),
    deletedAt: null,
  },
  {
    id: 'ci-photo-002',
    type: 'photo',
    title: 'Post-it note brainstorm',
    body: null,
    mediaUrl: 'https://placehold.co/800x600/f0ebe4/6b6460?text=Post-it+Brainstorm',
    mediaType: 'image/jpeg',
    metadata: {},
    source: 'human', sourceDetail: null,
    projectId: null, sectionId: null, parentId: null,
    authorId: 'user-jm',
    status: 'active', version: 1,
    createdAt: new Date('2026-02-03T11:00:00Z'),
    updatedAt: new Date('2026-02-03T11:00:00Z'),
    deletedAt: null,
  },
  {
    id: 'ci-photo-003',
    type: 'photo',
    title: 'UX wireframe printout',
    body: null,
    mediaUrl: 'https://placehold.co/600x800/e8e0d8/6b6460?text=Wireframe+Printout',
    mediaType: 'image/jpeg',
    metadata: {},
    source: 'human', sourceDetail: null,
    projectId: 'project-mobile-capture', sectionId: 'section-mc-ux', parentId: null,
    authorId: 'user-ben',
    status: 'active', version: 1,
    createdAt: new Date('2026-03-08T15:00:00Z'),
    updatedAt: new Date('2026-03-08T15:00:00Z'),
    deletedAt: null,
  },
  {
    id: 'ci-photo-004',
    type: 'photo',
    title: 'Team meeting photo',
    body: null,
    mediaUrl: 'https://placehold.co/1200x800/ddd5cc/6b6460?text=Team+Meeting',
    mediaType: 'image/jpeg',
    metadata: {},
    source: 'human', sourceDetail: null,
    projectId: null, sectionId: null, parentId: null,
    authorId: 'user-ben',
    status: 'active', version: 1,
    createdAt: new Date('2026-02-20T18:00:00Z'),
    updatedAt: new Date('2026-02-20T18:00:00Z'),
    deletedAt: null,
  },
  {
    id: 'ci-photo-005',
    type: 'photo',
    title: 'DB schema on paper',
    body: null,
    mediaUrl: 'https://placehold.co/900x700/f4efea/6b6460?text=DB+Schema',
    mediaType: 'image/jpeg',
    metadata: {},
    source: 'human', sourceDetail: null,
    projectId: 'project-csf-live', sectionId: 'section-csf-data', parentId: null,
    authorId: 'user-jm',
    status: 'active', version: 1,
    createdAt: new Date('2026-01-25T16:00:00Z'),
    updatedAt: new Date('2026-01-25T16:00:00Z'),
    deletedAt: null,
  },

  // ── Research (Claude-authored) ──
  {
    id: 'ci-research-001',
    type: 'research',
    title: 'TanStack Router vs React Router — 2026 Comparison',
    body: `## Summary
TanStack Router offers superior TypeScript integration and search param type-safety compared to React Router v7. Key advantages:

**Type Safety:** Full end-to-end TypeScript inference for route params, search params, and loaders.
**Search Params:** First-class search param management with validation and coercion.
**Code Splitting:** Automatic route-based code splitting.
**Devtools:** Built-in route visualization.

## Recommendation
For CSF Live: TanStack Router. The type-safe search params alone justify the choice given our complex filter state requirements.

## Sources
- TanStack Router docs (tanstack.com/router)
- Comparison article: "Modern React Routing in 2026" (dev.to)
- GitHub issues from React Router migration experiences`,
    mediaUrl: null, mediaType: null,
    metadata: { tags: ['react', 'architecture'] },
    source: 'claude', sourceDetail: null,
    projectId: 'project-csf-live', sectionId: 'section-csf-fe', parentId: null,
    authorId: 'user-claude',
    status: 'active', version: 1,
    createdAt: new Date('2026-01-08T09:00:00Z'),
    updatedAt: new Date('2026-01-08T09:00:00Z'),
    deletedAt: null,
  },
  {
    id: 'ci-research-002',
    type: 'research',
    title: 'Client-Side Search Libraries — MiniSearch vs Fuse.js vs FlexSearch',
    body: `## Summary
Evaluated three client-side search libraries for CSF Live's Tier 1 search implementation.

**MiniSearch:** Best balance of features and bundle size. Supports field boosting, fuzzy matching, and filtering. 7KB gzipped.

**Fuse.js:** Better for fuzzy matching but slower on large datasets. No built-in field boosting.

**FlexSearch:** Fastest but complex API and larger bundle.

## Recommendation
MiniSearch for CSF Live. Indexing 1000 items takes ~50ms. Query time <5ms.

## Integration Notes
\`\`\`typescript
import MiniSearch from 'minisearch'
const search = new MiniSearch({
  fields: ['title', 'body'],
  storeFields: ['id', 'type', 'projectId']
})
\`\`\``,
    mediaUrl: null, mediaType: null,
    metadata: { tags: ['search', 'performance'] },
    source: 'claude', sourceDetail: null,
    projectId: null, sectionId: null, parentId: null,
    authorId: 'user-claude',
    status: 'active', version: 1,
    createdAt: new Date('2026-01-20T10:00:00Z'),
    updatedAt: new Date('2026-01-20T10:00:00Z'),
    deletedAt: null,
  },
  {
    id: 'ci-research-003',
    type: 'research',
    title: 'Zustand vs Jotai vs Redux Toolkit — State Management 2026',
    body: `## Summary
Evaluated state management options for CSF Live's mock data layer.

**Zustand:** Simple, performant, excellent TypeScript support. Best for global state slices.

**Jotai:** Atomic model, better for fine-grained subscriptions. More boilerplate for complex state.

**Redux Toolkit:** Best for large teams, but overkill for Tier 1 mock store.

## Recommendation
Zustand. The mock store pattern (create once, use everywhere) maps naturally to Zustand's slice pattern.

## Migration Path
Zustand store in Tier 1 will be replaced by React Query server state in Tier 2. Components should not access Zustand directly — only via mock API hooks.`,
    mediaUrl: null, mediaType: null,
    metadata: { tags: ['react', 'architecture'] },
    source: 'claude', sourceDetail: null,
    projectId: 'project-csf-live', sectionId: null, parentId: null,
    authorId: 'user-claude',
    status: 'active', version: 1,
    createdAt: new Date('2026-01-25T11:00:00Z'),
    updatedAt: new Date('2026-01-25T11:00:00Z'),
    deletedAt: null,
  },
  {
    id: 'ci-research-004',
    type: 'research',
    title: 'Tailwind CSS v4 Migration Guide',
    body: `## Summary
Tailwind v4 introduces a new configuration format and CSS-based theming.

**Key Changes:**
1. No more tailwind.config.js — configuration via CSS @theme
2. New @tailwindcss/vite plugin replaces PostCSS
3. CSS custom properties for design tokens
4. Improved container queries (@container)

## Migration Steps
1. Remove tailwind.config.js
2. Add @tailwindcss/vite to vite.config.ts
3. Update globals.css with @theme block
4. Replace arbitrary values with CSS variables

## Breaking Changes
- Some utility class names changed
- JIT is now default (no purge config needed)
- Dark mode syntax unchanged`,
    mediaUrl: null, mediaType: null,
    metadata: { tags: ['design-system'] },
    source: 'claude', sourceDetail: null,
    projectId: null, sectionId: null, parentId: null,
    authorId: 'user-claude',
    status: 'active', version: 1,
    createdAt: new Date('2026-02-08T10:00:00Z'),
    updatedAt: new Date('2026-02-08T10:00:00Z'),
    deletedAt: null,
  },
  {
    id: 'ci-research-005',
    type: 'research',
    title: 'tldraw Persistence Patterns',
    body: `## Summary
tldraw provides several persistence strategies. For CSF Live we need:

1. **Scratchpad persistence** — localStorage auto-save
2. **Drawing content items** — JSONB in database (Tier 2), Zustand store (Tier 1)

**Recommended Pattern:**
\`\`\`typescript
// Save
const snapshot = editor.store.getSnapshot()

// Restore
editor.store.loadSnapshot(snapshot)
\`\`\`

**Draft Recovery:**
Store draft in localStorage with timestamp. On load, compare timestamp to last saved version. If localStorage is newer, show recovery banner.

## Notes
- tldraw store format is version-aware, migration happens automatically
- Always pin tldraw version in package.json`,
    mediaUrl: null, mediaType: null,
    metadata: { tags: ['tldraw', 'versioning'] },
    source: 'claude', sourceDetail: null,
    projectId: 'project-csf-live', sectionId: 'section-csf-fe', parentId: null,
    authorId: 'user-claude',
    status: 'active', version: 1,
    createdAt: new Date('2026-02-12T14:00:00Z'),
    updatedAt: new Date('2026-02-12T14:00:00Z'),
    deletedAt: null,
  },

  // ── Files ──
  {
    id: 'ci-file-001',
    type: 'file',
    title: null,
    body: null,
    mediaUrl: 'blob:mock-file-001',
    mediaType: 'application/pdf',
    metadata: { fileName: 'CSF-Live-Spec-v2.pdf', fileSize: 2_457_600, mimeType: 'application/pdf' },
    source: 'human', sourceDetail: null,
    projectId: 'project-csf-live', sectionId: null, parentId: null,
    authorId: 'user-jm',
    status: 'active', version: 1,
    createdAt: new Date('2026-01-15T10:00:00Z'),
    updatedAt: new Date('2026-01-15T10:00:00Z'),
    deletedAt: null,
  },
  {
    id: 'ci-file-002',
    type: 'file',
    title: null,
    body: null,
    mediaUrl: 'blob:mock-file-002',
    mediaType: 'application/zip',
    metadata: { fileName: 'design-assets-v1.zip', fileSize: 8_388_608, mimeType: 'application/zip' },
    source: 'human', sourceDetail: null,
    projectId: 'project-csf-live', sectionId: 'section-csf-fe', parentId: null,
    authorId: 'user-jm',
    status: 'active', version: 1,
    createdAt: new Date('2026-02-01T14:00:00Z'),
    updatedAt: new Date('2026-02-01T14:00:00Z'),
    deletedAt: null,
  },
  {
    id: 'ci-file-003',
    type: 'file',
    title: null,
    body: null,
    mediaUrl: 'blob:mock-file-003',
    mediaType: 'text/csv',
    metadata: { fileName: 'user-research-data.csv', fileSize: 102_400, mimeType: 'text/csv' },
    source: 'human', sourceDetail: null,
    projectId: 'project-knowledge-garden', sectionId: 'section-kg-research', parentId: null,
    authorId: 'user-ben',
    status: 'active', version: 1,
    createdAt: new Date('2026-02-10T11:00:00Z'),
    updatedAt: new Date('2026-02-10T11:00:00Z'),
    deletedAt: null,
  },
  {
    id: 'ci-file-004',
    type: 'file',
    title: null,
    body: null,
    mediaUrl: 'blob:mock-file-004',
    mediaType: 'video/mp4',
    metadata: { fileName: 'demo-recording-march.mp4', fileSize: 52_428_800, mimeType: 'video/mp4' },
    source: 'human', sourceDetail: null,
    projectId: null, sectionId: null, parentId: null,
    authorId: 'user-jm',
    status: 'active', version: 1,
    createdAt: new Date('2026-03-15T18:00:00Z'),
    updatedAt: new Date('2026-03-15T18:00:00Z'),
    deletedAt: null,
  },
]

// ─── Content Versions ──────────────────────────────────────────────────────

export const contentVersions: ContentVersion[] = [
  // ci-doc-001: 3 versions
  {
    id: 'cv-doc-001-v1',
    contentItemId: 'ci-doc-001',
    versionNumber: 1,
    body: '# Frontend Architecture PRD\n\n## Overview\nInitial draft. React 19 + Vite SPA.',
    mediaData: null,
    authorId: 'user-jm',
    changeSummary: 'Initial draft',
    createdAt: new Date('2026-01-10T10:00:00Z'),
  },
  {
    id: 'cv-doc-001-v2',
    contentItemId: 'ci-doc-001',
    versionNumber: 2,
    body: '# Frontend Architecture PRD\n\n## Overview\nCSF Live is a React 19 + Vite SPA. Added tech stack section.',
    mediaData: null,
    authorId: 'user-jm',
    changeSummary: 'Added tech stack section',
    createdAt: new Date('2026-02-01T14:00:00Z'),
  },
  {
    id: 'cv-doc-001-v3',
    contentItemId: 'ci-doc-001',
    versionNumber: 3,
    body: contentItems.find(c => c.id === 'ci-doc-001')!.body!,
    mediaData: null,
    authorId: 'user-jm',
    changeSummary: 'Added architecture decisions and constraints',
    createdAt: new Date('2026-03-15T16:00:00Z'),
  },
  // ci-doc-002: 2 versions
  {
    id: 'cv-doc-002-v1',
    contentItemId: 'ci-doc-002',
    versionNumber: 1,
    body: '# Data Model Notes\n\nInitial notes on the data model approach.',
    mediaData: null,
    authorId: 'user-jm',
    changeSummary: 'Initial notes',
    createdAt: new Date('2026-01-12T14:00:00Z'),
  },
  {
    id: 'cv-doc-002-v2',
    contentItemId: 'ci-doc-002',
    versionNumber: 2,
    body: contentItems.find(c => c.id === 'ci-doc-002')!.body!,
    mediaData: null,
    authorId: 'user-jm',
    changeSummary: 'Added relationships and key decisions',
    createdAt: new Date('2026-02-20T10:00:00Z'),
  },
  // ci-doc-005: 2 versions
  {
    id: 'cv-doc-005-v1',
    contentItemId: 'ci-doc-005',
    versionNumber: 1,
    body: '# Legacy Refactor Audit Report\n\nInitial audit summary. More findings to come.',
    mediaData: null,
    authorId: 'user-jm',
    changeSummary: 'Initial audit summary',
    createdAt: new Date('2024-11-15T10:00:00Z'),
  },
  {
    id: 'cv-doc-005-v2',
    contentItemId: 'ci-doc-005',
    versionNumber: 2,
    body: contentItems.find(c => c.id === 'ci-doc-005')!.body!,
    mediaData: null,
    authorId: 'user-jm',
    changeSummary: 'Added migration priority list',
    createdAt: new Date('2025-01-10T10:00:00Z'),
  },
  // ci-drawing-001: 2 versions
  {
    id: 'cv-drawing-001-v1',
    contentItemId: 'ci-drawing-001',
    versionNumber: 1,
    body: null,
    mediaData: SCRATCHPAD_TLDRAW_DOC,
    authorId: 'user-jm',
    changeSummary: 'Initial layout sketch',
    createdAt: new Date('2026-01-20T11:00:00Z'),
  },
  {
    id: 'cv-drawing-001-v2',
    contentItemId: 'ci-drawing-001',
    versionNumber: 2,
    body: null,
    mediaData: SCRATCHPAD_TLDRAW_DOC,
    authorId: 'user-jm',
    changeSummary: 'Updated with 3-column layout detail',
    createdAt: new Date('2026-02-10T09:00:00Z'),
  },
  // ci-drawing-002: 2 versions
  {
    id: 'cv-drawing-002-v1',
    contentItemId: 'ci-drawing-002',
    versionNumber: 1,
    body: null,
    mediaData: SCRATCHPAD_TLDRAW_DOC,
    authorId: 'user-jm',
    changeSummary: 'Initial data flow',
    createdAt: new Date('2026-01-25T14:00:00Z'),
  },
  {
    id: 'cv-drawing-002-v2',
    contentItemId: 'ci-drawing-002',
    versionNumber: 2,
    body: null,
    mediaData: SCRATCHPAD_TLDRAW_DOC,
    authorId: 'user-jm',
    changeSummary: 'Added Zustand store connections',
    createdAt: new Date('2026-02-15T14:00:00Z'),
  },
]

// ─── Messages ─────────────────────────────────────────────────────────────

export const messages: Message[] = [
  // Feed discussion (40+ messages)
  { id: 'msg-feed-001', discussionId: FEED_DISCUSSION_ID, authorId: 'user-jm', content: 'Starting this feed as a central place to capture ideas and decisions for the project.', contentType: 'text', mediaUrl: null, metadata: {}, source: 'web', createdAt: new Date('2026-01-01T09:00:00Z') },
  { id: 'msg-feed-002', discussionId: FEED_DISCUSSION_ID, authorId: 'user-ben', content: "Good idea. I'll use this for mobile-first thoughts as well.", contentType: 'text', mediaUrl: null, metadata: {}, source: 'web', createdAt: new Date('2026-01-01T09:30:00Z') },
  { id: 'msg-feed-003', discussionId: FEED_DISCUSSION_ID, authorId: 'user-jm', content: 'Quick update: decided to go with TanStack Router over React Router. The type-safe search params are a game changer.', contentType: 'text', mediaUrl: null, metadata: {}, source: 'web', createdAt: new Date('2026-01-08T11:00:00Z') },
  { id: 'msg-feed-004', discussionId: FEED_DISCUSSION_ID, authorId: 'user-claude', content: "## Research complete\n\nI've analyzed TanStack Router vs React Router for your use case. TanStack Router wins on type safety and search params. Full research added as a content item.", contentType: 'claude-response', mediaUrl: null, metadata: {}, source: 'web', createdAt: new Date('2026-01-08T11:05:00Z') },
  { id: 'msg-feed-005', discussionId: FEED_DISCUSSION_ID, authorId: 'user-jm', content: 'Tailwind v4 is out. Going with the new @tailwindcss/vite plugin, no more PostCSS.', contentType: 'text', mediaUrl: null, metadata: {}, source: 'web', createdAt: new Date('2026-01-20T10:00:00Z') },
  { id: 'msg-feed-006', discussionId: FEED_DISCUSSION_ID, authorId: 'user-ben', content: 'Does that change the config significantly?', contentType: 'text', mediaUrl: null, metadata: {}, source: 'web', createdAt: new Date('2026-01-20T10:15:00Z') },
  { id: 'msg-feed-007', discussionId: FEED_DISCUSSION_ID, authorId: 'user-jm', content: 'Yes — config moves into CSS with @theme. No more tailwind.config.js. Much cleaner.', contentType: 'text', mediaUrl: null, metadata: {}, source: 'web', createdAt: new Date('2026-01-20T10:20:00Z') },
  { id: 'msg-feed-008', discussionId: FEED_DISCUSSION_ID, authorId: 'user-jm', content: 'Decided on monorepo structure: packages/web for SPA, packages/shared for TypeScript types only. No api package until Tier 2.', contentType: 'text', mediaUrl: null, metadata: {}, source: 'web', createdAt: new Date('2026-01-25T14:00:00Z') },
  { id: 'msg-feed-009', discussionId: FEED_DISCUSSION_ID, authorId: 'user-ben', content: 'Makes sense. Clean separation for the mock period.', contentType: 'text', mediaUrl: null, metadata: {}, source: 'web', createdAt: new Date('2026-01-25T14:10:00Z') },
  { id: 'msg-feed-010', discussionId: FEED_DISCUSSION_ID, authorId: 'user-jm', content: 'Working on the mock data generation. 60+ content items, 120+ messages, 13 discussions. This will give us enough to test all UI states.', contentType: 'text', mediaUrl: null, metadata: {}, source: 'web', createdAt: new Date('2026-02-01T10:00:00Z') },
  { id: 'msg-feed-011', discussionId: FEED_DISCUSSION_ID, authorId: 'user-claude', content: "I can help with the mock data. Here's what I recommend for the research items: use realistic but clearly synthetic content. Avoid anything that looks like real user data.", contentType: 'claude-response', mediaUrl: null, metadata: {}, source: 'web', createdAt: new Date('2026-02-01T10:02:00Z') },
  { id: 'msg-feed-012', discussionId: FEED_DISCUSSION_ID, authorId: 'user-jm', content: 'Good point. All mock data uses placeholder names and synthetic content.', contentType: 'text', mediaUrl: null, metadata: {}, source: 'web', createdAt: new Date('2026-02-01T10:05:00Z') },
  { id: 'msg-feed-013', discussionId: FEED_DISCUSSION_ID, authorId: 'user-jm', content: 'Container queries are working great. Cards adapt beautifully to different column widths without extra breakpoint logic.', contentType: 'text', mediaUrl: null, metadata: {}, source: 'web', createdAt: new Date('2026-02-08T15:00:00Z') },
  { id: 'msg-feed-014', discussionId: FEED_DISCUSSION_ID, authorId: 'user-ben', content: 'Did you use @container on the column or on each card wrapper?', contentType: 'text', mediaUrl: null, metadata: {}, source: 'web', createdAt: new Date('2026-02-08T15:10:00Z') },
  { id: 'msg-feed-015', discussionId: FEED_DISCUSSION_ID, authorId: 'user-jm', content: 'Column wrapper has `container-type: inline-size`. Each card uses `@container` in CSS. Works perfectly.', contentType: 'text', mediaUrl: null, metadata: {}, source: 'web', createdAt: new Date('2026-02-08T15:15:00Z') },
  { id: 'msg-feed-016', discussionId: FEED_DISCUSSION_ID, authorId: 'user-jm', content: 'MiniSearch is fast. 1000 item index built in ~40ms. Query time under 5ms for most searches.', contentType: 'text', mediaUrl: null, metadata: {}, source: 'web', createdAt: new Date('2026-02-14T11:00:00Z') },
  { id: 'msg-feed-017', discussionId: FEED_DISCUSSION_ID, authorId: 'user-claude', content: 'Tip: consider lazy-building the index on first search rather than on app init. Saves ~40ms from initial render.', contentType: 'claude-response', mediaUrl: null, metadata: {}, source: 'web', createdAt: new Date('2026-02-14T11:03:00Z') },
  { id: 'msg-feed-018', discussionId: FEED_DISCUSSION_ID, authorId: 'user-jm', content: 'Done. Lazy index build implemented.', contentType: 'text', mediaUrl: null, metadata: {}, source: 'web', createdAt: new Date('2026-02-14T14:00:00Z') },
  { id: 'msg-feed-019', discussionId: FEED_DISCUSSION_ID, authorId: 'user-jm', content: 'Dark mode working. Used `class` strategy with localStorage persistence and system preference detection.', contentType: 'text', mediaUrl: null, metadata: {}, source: 'web', createdAt: new Date('2026-02-20T16:00:00Z') },
  { id: 'msg-feed-020', discussionId: FEED_DISCUSSION_ID, authorId: 'user-ben', content: 'Does tldraw respect dark mode?', contentType: 'text', mediaUrl: null, metadata: {}, source: 'web', createdAt: new Date('2026-02-20T16:10:00Z') },
  { id: 'msg-feed-021', discussionId: FEED_DISCUSSION_ID, authorId: 'user-jm', content: 'Yes — `forceDarkMode={isDark}` prop on the Tldraw component. Works perfectly.', contentType: 'text', mediaUrl: null, metadata: {}, source: 'web', createdAt: new Date('2026-02-20T16:15:00Z') },
  { id: 'msg-feed-022', discussionId: FEED_DISCUSSION_ID, authorId: 'user-jm', content: 'Route transitions are smooth now. TanStack Router pending state → opacity-50 while loading.', contentType: 'text', mediaUrl: null, metadata: {}, source: 'web', createdAt: new Date('2026-02-25T10:00:00Z') },
  { id: 'msg-feed-023', discussionId: FEED_DISCUSSION_ID, authorId: 'user-jm', content: 'Quick capture is implemented. `+` button opens enhanced mode with voice, camera, and file options.', contentType: 'text', mediaUrl: null, metadata: {}, source: 'web', createdAt: new Date('2026-03-01T11:00:00Z') },
  { id: 'msg-feed-024', discussionId: FEED_DISCUSSION_ID, authorId: 'user-ben', content: 'Does URL detection work in the text input?', contentType: 'text', mediaUrl: null, metadata: {}, source: 'web', createdAt: new Date('2026-03-01T11:10:00Z') },
  { id: 'msg-feed-025', discussionId: FEED_DISCUSSION_ID, authorId: 'user-jm', content: 'Yes. Paste a URL and it auto-converts to a link card with mock metadata.', contentType: 'text', mediaUrl: null, metadata: {}, source: 'web', createdAt: new Date('2026-03-01T11:15:00Z') },
  { id: 'msg-feed-026', discussionId: FEED_DISCUSSION_ID, authorId: 'user-jm', content: 'Notification panel done. 4 unread, 6 read, all linking to real mock IDs.', contentType: 'text', mediaUrl: null, metadata: {}, source: 'web', createdAt: new Date('2026-03-05T14:00:00Z') },
  { id: 'msg-feed-027', discussionId: FEED_DISCUSSION_ID, authorId: 'user-ben', content: 'The mark all as read flow works well.', contentType: 'text', mediaUrl: null, metadata: {}, source: 'web', createdAt: new Date('2026-03-05T14:20:00Z') },
  { id: 'msg-feed-028', discussionId: FEED_DISCUSSION_ID, authorId: 'user-jm', content: "Ben's presence indicator shows up correctly in the CSF Live project dashboard.", contentType: 'text', mediaUrl: null, metadata: {}, source: 'web', createdAt: new Date('2026-03-08T10:00:00Z') },
  { id: 'msg-feed-029', discussionId: FEED_DISCUSSION_ID, authorId: 'user-jm', content: 'Drag and drop for content movement is implemented. Works between feed and project cards.', contentType: 'text', mediaUrl: null, metadata: {}, source: 'web', createdAt: new Date('2026-03-10T15:00:00Z') },
  { id: 'msg-feed-030', discussionId: FEED_DISCUSSION_ID, authorId: 'user-ben', content: 'Does it work on mobile?', contentType: 'text', mediaUrl: null, metadata: {}, source: 'web', createdAt: new Date('2026-03-10T15:10:00Z') },
  { id: 'msg-feed-031', discussionId: FEED_DISCUSSION_ID, authorId: 'user-jm', content: 'Mobile uses context menu for move/copy. DnD is desktop-only (HTML5 API).', contentType: 'text', mediaUrl: null, metadata: {}, source: 'web', createdAt: new Date('2026-03-10T15:15:00Z') },
  { id: 'msg-feed-032', discussionId: FEED_DISCUSSION_ID, authorId: 'user-jm', content: 'TipTap document editor is working. Auto-save with 2s debounce creates version entries.', contentType: 'text', mediaUrl: null, metadata: {}, source: 'web', createdAt: new Date('2026-03-12T11:00:00Z') },
  { id: 'msg-feed-033', discussionId: FEED_DISCUSSION_ID, authorId: 'user-jm', content: 'Version history panel lists all versions. Restore button is disabled with Phase 2 tooltip.', contentType: 'text', mediaUrl: null, metadata: {}, source: 'web', createdAt: new Date('2026-03-12T11:10:00Z') },
  { id: 'msg-feed-034', discussionId: FEED_DISCUSSION_ID, authorId: 'user-claude', content: "Reminder: for the tldraw drawing items, use `editor.store.getSnapshot()` for persistence. The store API is more stable than `exportToBlob()` for data storage.", contentType: 'claude-response', mediaUrl: null, metadata: {}, source: 'web', createdAt: new Date('2026-03-14T09:00:00Z') },
  { id: 'msg-feed-035', discussionId: FEED_DISCUSSION_ID, authorId: 'user-jm', content: 'Good reminder. Using getSnapshot/loadSnapshot for all tldraw persistence.', contentType: 'text', mediaUrl: null, metadata: {}, source: 'web', createdAt: new Date('2026-03-14T09:05:00Z') },
  { id: 'msg-feed-036', discussionId: FEED_DISCUSSION_ID, authorId: 'user-jm', content: 'Responsive layouts complete. Mobile tab bar, tablet collapsible projects, desktop 3-column all working.', contentType: 'text', mediaUrl: null, metadata: {}, source: 'web', createdAt: new Date('2026-03-16T16:00:00Z') },
  { id: 'msg-feed-037', discussionId: FEED_DISCUSSION_ID, authorId: 'user-ben', content: 'Touch targets are all 44px+?', contentType: 'text', mediaUrl: null, metadata: {}, source: 'web', createdAt: new Date('2026-03-16T16:10:00Z') },
  { id: 'msg-feed-038', discussionId: FEED_DISCUSSION_ID, authorId: 'user-jm', content: 'Yes, min-h-11 min-w-11 on all interactive elements (44px in Tailwind units).', contentType: 'text', mediaUrl: null, metadata: {}, source: 'web', createdAt: new Date('2026-03-16T16:15:00Z') },
  { id: 'msg-feed-039', discussionId: FEED_DISCUSSION_ID, authorId: 'user-jm', content: 'Tier 1 frontend is feature-complete. All 21 tasks implemented, tests passing. Ready for demo.', contentType: 'text', mediaUrl: null, metadata: {}, source: 'web', createdAt: new Date('2026-03-20T18:00:00Z') },
  { id: 'msg-feed-040', discussionId: FEED_DISCUSSION_ID, authorId: 'user-ben', content: 'Great work! The 3-column layout feels really polished.', contentType: 'text', mediaUrl: null, metadata: {}, source: 'web', createdAt: new Date('2026-03-20T18:30:00Z') },
  { id: 'msg-feed-041', discussionId: FEED_DISCUSSION_ID, authorId: 'user-claude', content: "## Tier 1 Summary\n\nAll frontend tasks implemented:\n- \u2705 3-column layout with responsive breakpoints\n- \u2705 Mock data layer (60+ items, 120+ messages)\n- \u2705 TipTap document editor with versioning\n- \u2705 tldraw canvas (scratchpad + drawing items)\n- \u2705 Search with MiniSearch\n- \u2705 Notifications + presence\n- \u2705 Content movement (drag-drop + move/copy)\n- \u2705 Dark mode\n\nReady for Tier 2 backend implementation.", contentType: 'claude-response', mediaUrl: null, metadata: {}, source: 'web', createdAt: new Date('2026-03-20T18:35:00Z') },

  // Project discussions (20+ messages)
  { id: 'msg-proj-csf-001', discussionId: 'disc-project-csf', authorId: 'user-jm', content: 'CSF Live project discussion. Using this for architectural decisions.', contentType: 'text', mediaUrl: null, metadata: {}, source: 'web', createdAt: new Date('2026-01-10T10:05:00Z') },
  { id: 'msg-proj-csf-002', discussionId: 'disc-project-csf', authorId: 'user-ben', content: "I'll track the UX details here and in the Mobile Capture project.", contentType: 'text', mediaUrl: null, metadata: {}, source: 'web', createdAt: new Date('2026-01-10T10:10:00Z') },
  { id: 'msg-proj-csf-003', discussionId: 'disc-project-csf', authorId: 'user-jm', content: 'Frontend architecture PRD is in section-csf-fe. Data model notes in section-csf-data.', contentType: 'text', mediaUrl: null, metadata: {}, source: 'web', createdAt: new Date('2026-01-12T14:00:00Z') },
  { id: 'msg-proj-csf-004', discussionId: 'disc-project-csf', authorId: 'user-jm', content: 'Reminder: no packages/api/ until Tier 2. Everything through mock API layer.', contentType: 'text', mediaUrl: null, metadata: {}, source: 'web', createdAt: new Date('2026-01-15T09:00:00Z') },
  { id: 'msg-proj-csf-005', discussionId: 'disc-project-csf', authorId: 'user-claude', content: 'Architecture recommendation: keep the mock API layer as thin as possible. Each function should just delegate to the Zustand store. This makes the Tier 2 swap mechanical.', contentType: 'claude-response', mediaUrl: null, metadata: {}, source: 'web', createdAt: new Date('2026-01-15T09:02:00Z') },
  { id: 'msg-proj-kg-001', discussionId: 'disc-project-kg', authorId: 'user-jm', content: 'Knowledge Garden is the second priority after CSF Live.', contentType: 'text', mediaUrl: null, metadata: {}, source: 'web', createdAt: new Date('2026-02-01T10:05:00Z') },
  { id: 'msg-proj-kg-002', discussionId: 'disc-project-kg', authorId: 'user-claude', content: "I've captured research on the curation engine approach. See the content items in section-kg-curation.", contentType: 'claude-response', mediaUrl: null, metadata: {}, source: 'web', createdAt: new Date('2026-02-05T14:00:00Z') },
  { id: 'msg-proj-mc-001', discussionId: 'disc-project-mc', authorId: 'user-ben', content: 'Mobile Capture is paused. Resuming after CSF Live Tier 1 ships.', contentType: 'text', mediaUrl: null, metadata: {}, source: 'web', createdAt: new Date('2026-03-01T10:00:00Z') },
  { id: 'msg-proj-lr-001', discussionId: 'disc-project-lr', authorId: 'user-jm', content: 'Legacy Refactor archived. Audit is complete, migration plan documented.', contentType: 'text', mediaUrl: null, metadata: {}, source: 'web', createdAt: new Date('2025-12-01T10:00:00Z') },

  // Section discussions (60+ messages)
  { id: 'msg-sec-fe-001', discussionId: 'disc-section-csf-fe', authorId: 'user-jm', content: 'Frontend architecture section. All React component decisions tracked here.', contentType: 'text', mediaUrl: null, metadata: {}, source: 'web', createdAt: new Date('2026-01-10T10:15:00Z') },
  { id: 'msg-sec-fe-002', discussionId: 'disc-section-csf-fe', authorId: 'user-jm', content: 'Component organization: ui/ for primitives, feed/ for feed-specific, projects/ for project views, canvas/ for tldraw, editor/ for TipTap.', contentType: 'text', mediaUrl: null, metadata: {}, source: 'web', createdAt: new Date('2026-01-10T10:20:00Z') },
  { id: 'msg-sec-fe-003', discussionId: 'disc-section-csf-fe', authorId: 'user-ben', content: 'Should shared/ be inside components/ or at src/ level?', contentType: 'text', mediaUrl: null, metadata: {}, source: 'web', createdAt: new Date('2026-01-10T10:25:00Z') },
  { id: 'msg-sec-fe-004', discussionId: 'disc-section-csf-fe', authorId: 'user-jm', content: 'Inside components/ for now. Can refactor if it grows.', contentType: 'text', mediaUrl: null, metadata: {}, source: 'web', createdAt: new Date('2026-01-10T10:30:00Z') },
  { id: 'msg-sec-fe-005', discussionId: 'disc-section-csf-fe', authorId: 'user-jm', content: 'Radix UI for all interactive primitives. No custom modals, tooltips, or dropdowns from scratch.', contentType: 'text', mediaUrl: null, metadata: {}, source: 'web', createdAt: new Date('2026-01-12T11:00:00Z') },
  { id: 'msg-sec-fe-006', discussionId: 'disc-section-csf-fe', authorId: 'user-claude', content: 'Radix is a good choice. The Dialog and Tooltip components are particularly well-implemented. Note: use `asChild` pattern for custom button styling.', contentType: 'claude-response', mediaUrl: null, metadata: {}, source: 'web', createdAt: new Date('2026-01-12T11:02:00Z') },
  { id: 'msg-sec-fe-007', discussionId: 'disc-section-csf-fe', authorId: 'user-jm', content: 'Lucide React for all icons. Consistent size: 16px for inline, 20px for standalone buttons, 24px for feature icons.', contentType: 'text', mediaUrl: null, metadata: {}, source: 'web', createdAt: new Date('2026-01-15T10:00:00Z') },
  { id: 'msg-sec-fe-008', discussionId: 'disc-section-csf-fe', authorId: 'user-jm', content: 'Column resize working. onPointerDown tracks position, updates widths in state. Persisted to localStorage.', contentType: 'text', mediaUrl: null, metadata: {}, source: 'web', createdAt: new Date('2026-01-20T14:00:00Z') },
  { id: 'msg-sec-fe-009', discussionId: 'disc-section-csf-fe', authorId: 'user-jm', content: 'ResizableDivider is keyboard accessible: arrow keys adjust column width by 10px.', contentType: 'text', mediaUrl: null, metadata: {}, source: 'web', createdAt: new Date('2026-01-20T14:10:00Z') },
  { id: 'msg-sec-fe-010', discussionId: 'disc-section-csf-fe', authorId: 'user-jm', content: 'All content cards use container queries. Parent declares container-type: inline-size, cards respond with @container breakpoints.', contentType: 'text', mediaUrl: null, metadata: {}, source: 'web', createdAt: new Date('2026-02-05T10:00:00Z') },
  { id: 'msg-sec-data-001', discussionId: 'disc-section-csf-data', authorId: 'user-jm', content: 'Data model section. Finalized: tldraw data in mediaData (JSONB). document_type in metadata.document_type.', contentType: 'text', mediaUrl: null, metadata: {}, source: 'web', createdAt: new Date('2026-01-12T14:00:00Z') },
  { id: 'msg-sec-data-002', discussionId: 'disc-section-csf-data', authorId: 'user-jm', content: 'Key constraint: ContentType does NOT include "message". Messages live separately in the messages table.', contentType: 'text', mediaUrl: null, metadata: {}, source: 'web', createdAt: new Date('2026-01-12T14:10:00Z') },
  { id: 'msg-sec-data-003', discussionId: 'disc-section-csf-data', authorId: 'user-claude', content: "Note on the FeedItem union type: the discriminator `_sourceTable` must be added at query time, not stored in the database. It's a virtual field from the UNION query.", contentType: 'claude-response', mediaUrl: null, metadata: {}, source: 'web', createdAt: new Date('2026-01-12T14:12:00Z') },
  { id: 'msg-sec-data-004', discussionId: 'disc-section-csf-data', authorId: 'user-jm', content: 'ContentVersion fields: `body` and `mediaData` — NOT `content`. This is the authoritative naming.', contentType: 'text', mediaUrl: null, metadata: {}, source: 'web', createdAt: new Date('2026-01-15T10:00:00Z') },
  { id: 'msg-sec-data-005', discussionId: 'disc-section-csf-data', authorId: 'user-jm', content: 'Feed query: UNION of feed discussion messages + unassigned content items (projectId IS NULL). Sorted by createdAt ASC. This is the spec from data-model.md.', contentType: 'text', mediaUrl: null, metadata: {}, source: 'web', createdAt: new Date('2026-01-18T10:00:00Z') },
  { id: 'msg-sec-kg-research-001', discussionId: 'disc-section-kg-research', authorId: 'user-jm', content: 'Research layer will be AI-powered in Tier 3. For now, manual research items captured as content type "research".', contentType: 'text', mediaUrl: null, metadata: {}, source: 'web', createdAt: new Date('2026-02-01T10:20:00Z') },
  { id: 'msg-sec-kg-research-002', discussionId: 'disc-section-kg-research', authorId: 'user-claude', content: "I've added research items for: TanStack Router comparison, MiniSearch evaluation, Zustand vs alternatives, Tailwind v4 migration, and tldraw persistence patterns. All are in the feed as research content items.", contentType: 'claude-response', mediaUrl: null, metadata: {}, source: 'web', createdAt: new Date('2026-02-08T11:00:00Z') },
  { id: 'msg-sec-kg-curation-001', discussionId: 'disc-section-kg-curation', authorId: 'user-jm', content: 'Curation engine spec is in this section. Tags are flat for Tier 1. AI-powered tagging in Tier 3.', contentType: 'text', mediaUrl: null, metadata: {}, source: 'web', createdAt: new Date('2026-02-10T14:05:00Z') },
  { id: 'msg-sec-kg-publish-001', discussionId: 'disc-section-kg-publish', authorId: 'user-jm', content: 'Publishing is out of scope for Tier 1. Deferred to Tier 2.', contentType: 'text', mediaUrl: null, metadata: {}, source: 'web', createdAt: new Date('2026-02-01T10:30:00Z') },
  { id: 'msg-sec-mc-ux-001', discussionId: 'disc-section-mc-ux', authorId: 'user-ben', content: 'UX design for mobile capture. Wireframes and meeting notes are in this section.', contentType: 'text', mediaUrl: null, metadata: {}, source: 'web', createdAt: new Date('2026-03-08T10:05:00Z') },
  { id: 'msg-sec-mc-ux-002', discussionId: 'disc-section-mc-ux', authorId: 'user-ben', content: 'Key UX principle: one tap to capture. No friction. Show the camera immediately on the capture tab.', contentType: 'text', mediaUrl: null, metadata: {}, source: 'web', createdAt: new Date('2026-03-08T10:10:00Z') },
  { id: 'msg-sec-mc-ux-003', discussionId: 'disc-section-mc-ux', authorId: 'user-ben', content: 'Haptic feedback on capture completion. Duration: 50ms. Pattern: single pulse.', contentType: 'text', mediaUrl: null, metadata: {}, source: 'web', createdAt: new Date('2026-03-10T09:00:00Z') },
  { id: 'msg-sec-lr-audit-001', discussionId: 'disc-section-lr-audit', authorId: 'user-jm', content: 'Audit complete. Full report in this section as a content item. 0% test coverage was the biggest finding.', contentType: 'text', mediaUrl: null, metadata: {}, source: 'web', createdAt: new Date('2024-12-01T10:00:00Z') },
  { id: 'msg-sec-lr-migration-001', discussionId: 'disc-section-lr-migration', authorId: 'user-jm', content: 'Migration plan drafted. TypeScript first, then testing, then React upgrade. Estimate: 3 sprints.', contentType: 'text', mediaUrl: null, metadata: {}, source: 'web', createdAt: new Date('2024-12-15T10:00:00Z') },
  { id: 'msg-sec-lr-migration-002', discussionId: 'disc-section-lr-migration', authorId: 'user-jm', content: 'ts-migrate ran successfully. 80% of files converted. Remaining 20% have complex type inference issues.', contentType: 'text', mediaUrl: null, metadata: {}, source: 'web', createdAt: new Date('2025-01-05T10:00:00Z') },

  // Additional feed messages to reach 40+
  { id: 'msg-feed-042', discussionId: FEED_DISCUSSION_ID, authorId: 'user-jm', content: 'Categorized mode working. Groups items by type with Radix Collapsible sections. 200ms crossfade between modes.', contentType: 'text', mediaUrl: null, metadata: {}, source: 'web', createdAt: new Date('2026-03-17T10:00:00Z') },
  { id: 'msg-feed-043', discussionId: FEED_DISCUSSION_ID, authorId: 'user-ben', content: 'The crossfade is smooth. Feels polished.', contentType: 'text', mediaUrl: null, metadata: {}, source: 'web', createdAt: new Date('2026-03-17T10:10:00Z') },
  { id: 'msg-feed-044', discussionId: FEED_DISCUSSION_ID, authorId: 'user-jm', content: 'Search mode is in the same tab bar as Timeline and Categorized. Activating it focuses the search bar.', contentType: 'text', mediaUrl: null, metadata: {}, source: 'web', createdAt: new Date('2026-03-18T09:00:00Z') },
  { id: 'msg-feed-045', discussionId: FEED_DISCUSSION_ID, authorId: 'user-jm', content: 'Filter state for search is in URL search params. Shareable and browser-back-compatible.', contentType: 'text', mediaUrl: null, metadata: {}, source: 'web', createdAt: new Date('2026-03-18T09:10:00Z') },

  // More section messages to reach 60+
  { id: 'msg-sec-fe-011', discussionId: 'disc-section-csf-fe', authorId: 'user-jm', content: "App menu implemented: Home, Search, Notifications, Settings (stub), Keyboard Shortcuts, Who's Online. Radix DropdownMenu.", contentType: 'text', mediaUrl: null, metadata: {}, source: 'web', createdAt: new Date('2026-02-10T11:00:00Z') },
  { id: 'msg-sec-fe-012', discussionId: 'disc-section-csf-fe', authorId: 'user-jm', content: 'Keyboard shortcuts: Cmd+K (app menu), Cmd+N (quick capture), Cmd+1/2/3 (focus columns), Cmd+\\ (toggle projects), Escape (close overlays).', contentType: 'text', mediaUrl: null, metadata: {}, source: 'web', createdAt: new Date('2026-02-10T11:10:00Z') },
  { id: 'msg-sec-fe-013', discussionId: 'disc-section-csf-fe', authorId: 'user-jm', content: 'Status bar is fixed bottom-right. Shows connectivity (always "online" in Tier 1).', contentType: 'text', mediaUrl: null, metadata: {}, source: 'web', createdAt: new Date('2026-02-12T10:00:00Z') },
  { id: 'msg-sec-data-006', discussionId: 'disc-section-csf-data', authorId: 'user-jm', content: 'Presence is static in Tier 1. JM online at "feed", Ben online at "project:project-csf-live".', contentType: 'text', mediaUrl: null, metadata: {}, source: 'web', createdAt: new Date('2026-02-01T10:00:00Z') },
  { id: 'msg-sec-data-007', discussionId: 'disc-section-csf-data', authorId: 'user-jm', content: 'FEED_DISCUSSION_ID is a stable constant, not a random UUID. This allows components to reference it without a lookup.', contentType: 'text', mediaUrl: null, metadata: {}, source: 'web', createdAt: new Date('2026-02-05T10:00:00Z') },
  { id: 'msg-sec-kg-research-003', discussionId: 'disc-section-kg-research', authorId: 'user-ben', content: 'Should we track research quality scores? Like a confidence level per item?', contentType: 'text', mediaUrl: null, metadata: {}, source: 'web', createdAt: new Date('2026-02-15T10:00:00Z') },
  { id: 'msg-sec-kg-research-004', discussionId: 'disc-section-kg-research', authorId: 'user-jm', content: 'Deferred to Tier 3. The AI can tag confidence level. For now, manual tagging.', contentType: 'text', mediaUrl: null, metadata: {}, source: 'web', createdAt: new Date('2026-02-15T10:10:00Z') },
  { id: 'msg-sec-kg-curation-002', discussionId: 'disc-section-kg-curation', authorId: 'user-jm', content: 'Tag search is already covered by the global search. No separate tag browser needed in Tier 1.', contentType: 'text', mediaUrl: null, metadata: {}, source: 'web', createdAt: new Date('2026-02-12T10:00:00Z') },
  { id: 'msg-sec-mc-ux-004', discussionId: 'disc-section-mc-ux', authorId: 'user-ben', content: 'Swipe right to go back from detail view. iOS navigation pattern.', contentType: 'text', mediaUrl: null, metadata: {}, source: 'web', createdAt: new Date('2026-03-12T10:00:00Z') },
  { id: 'msg-sec-mc-ux-005', discussionId: 'disc-section-mc-ux', authorId: 'user-ben', content: 'Long press on a capture item opens the context menu. Consistent with iOS and Android patterns.', contentType: 'text', mediaUrl: null, metadata: {}, source: 'web', createdAt: new Date('2026-03-12T10:10:00Z') },
  { id: 'msg-sec-lr-audit-002', discussionId: 'disc-section-lr-audit', authorId: 'user-jm', content: 'Found 3 security vulnerabilities in the audit: outdated dependencies with known CVEs. Fixed as part of migration.', contentType: 'text', mediaUrl: null, metadata: {}, source: 'web', createdAt: new Date('2024-11-20T10:00:00Z') },
  { id: 'msg-sec-lr-migration-003', discussionId: 'disc-section-lr-migration', authorId: 'user-jm', content: 'Migration complete. Project archived. Lessons learned documented in the audit report.', contentType: 'text', mediaUrl: null, metadata: {}, source: 'web', createdAt: new Date('2025-11-30T10:00:00Z') },
]

// ─── Notifications ─────────────────────────────────────────────────────────

export const notifications: Notification[] = [
  // Unread (4)
  {
    id: 'notif-001',
    userId: 'user-jm',
    type: 'message',
    title: 'Ben posted in CSF Live',
    body: 'The 3-column layout feels really polished.',
    referenceType: 'message',
    referenceId: 'msg-feed-040',
    read: false,
    createdAt: new Date('2026-03-20T18:30:00Z'),
  },
  {
    id: 'notif-002',
    userId: 'user-jm',
    type: 'research_complete',
    title: 'Research complete: tldraw persistence patterns',
    body: 'Claude has completed research on tldraw persistence strategies.',
    referenceType: 'content_item',
    referenceId: 'ci-research-005',
    read: false,
    createdAt: new Date('2026-02-12T14:01:00Z'),
  },
  {
    id: 'notif-003',
    userId: 'user-jm',
    type: 'content_added',
    title: 'New document in CSF Live — Frontend Architecture',
    body: 'Component Library Guidelines has been added by you.',
    referenceType: 'content_item',
    referenceId: 'ci-doc-006',
    read: false,
    createdAt: new Date('2026-02-01T09:01:00Z'),
  },
  {
    id: 'notif-004',
    userId: 'user-jm',
    type: 'mention',
    title: 'Ben mentioned you in Mobile Capture UX',
    body: 'Does it work on mobile?',
    referenceType: 'message',
    referenceId: 'msg-feed-030',
    read: false,
    createdAt: new Date('2026-03-10T15:10:00Z'),
  },
  // Read (6)
  {
    id: 'notif-005',
    userId: 'user-jm',
    type: 'message',
    title: 'Ben posted in Mobile Capture UX',
    body: 'Key UX principle: one tap to capture.',
    referenceType: 'message',
    referenceId: 'msg-sec-mc-ux-002',
    read: true,
    createdAt: new Date('2026-03-08T10:10:00Z'),
  },
  {
    id: 'notif-006',
    userId: 'user-jm',
    type: 'research_complete',
    title: 'Research complete: Zustand vs alternatives',
    body: 'Claude has completed state management research.',
    referenceType: 'content_item',
    referenceId: 'ci-research-003',
    read: true,
    createdAt: new Date('2026-01-25T11:01:00Z'),
  },
  {
    id: 'notif-007',
    userId: 'user-jm',
    type: 'research_complete',
    title: 'Research complete: MiniSearch evaluation',
    body: 'Claude has completed search library research.',
    referenceType: 'content_item',
    referenceId: 'ci-research-002',
    read: true,
    createdAt: new Date('2026-01-20T10:01:00Z'),
  },
  {
    id: 'notif-008',
    userId: 'user-jm',
    type: 'message',
    title: 'Ben posted in CSF Live',
    body: 'Makes sense. Clean separation for the mock period.',
    referenceType: 'message',
    referenceId: 'msg-feed-009',
    read: true,
    createdAt: new Date('2026-01-25T14:10:00Z'),
  },
  {
    id: 'notif-009',
    userId: 'user-jm',
    type: 'content_added',
    title: 'Ben added a document to Mobile Capture',
    body: 'Mobile Capture Meeting Notes — March has been added.',
    referenceType: 'content_item',
    referenceId: 'ci-doc-004',
    read: true,
    createdAt: new Date('2026-03-10T15:01:00Z'),
  },
  {
    id: 'notif-010',
    userId: 'user-jm',
    type: 'message',
    title: 'Claude responded in CSF Live',
    body: 'Architecture recommendation: keep the mock API layer as thin as possible.',
    referenceType: 'message',
    referenceId: 'msg-proj-csf-005',
    read: true,
    createdAt: new Date('2026-01-15T09:02:00Z'),
  },
]

// ─── Presence ──────────────────────────────────────────────────────────────

export const presence: Presence[] = [
  {
    userId: 'user-jm',
    status: 'online',
    currentLocation: 'feed',
    lastHeartbeat: new Date('2026-03-21T14:00:00Z'),
  },
  {
    userId: 'user-ben',
    status: 'online',
    currentLocation: 'project:project-csf-live',
    lastHeartbeat: new Date('2026-03-21T14:00:00Z'),
  },
]

// ─── Initial Mock Data ─────────────────────────────────────────────────────

export const initialMockData = {
  users,
  projects,
  sections,
  projectMembers,
  discussions,
  contentItems,
  contentVersions,
  messages,
  tags,
  notifications,
  presence,
}
