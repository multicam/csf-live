# IMPLEMENTATION_PLAN.md — CSF Live Tier 1 Frontend

---

## 0. Spec Gaps & Analysis

### Current Tier
**TIER = 1** — Frontend only. Mock data. React + Vite + Tailwind + Radix + tldraw + TipTap. No server, no database, no auth service, no file storage, no AI.

### Spec Inconsistency: views.md vs layout.md v3.0 + canvas.md ⚠️

**The conflict:** `views.md` (undated, no version) states "The tldraw canvas is the permanent background of the entire application... In project mode: content items as custom card shapes." The `phasing.md` deliverables table echoes this with "Canvas as permanent background, content items as shapes in project mode."

**The authoritative sources:** `layout.md` v3.0 (2026-03-21, Status: Definitive) explicitly states: "No canvas background — just columns" and "Canvas ≠ Project Spatial View." `canvas.md` states: "Project drawings are NOT a background canvas."

**Resolution applied throughout this plan:** `layout.md` v3.0 and `canvas.md` are authoritative. The two canvas contexts are:
1. `/` route — full-screen tldraw scratchpad (app-level, single document, not per-project)
2. Drawing content items — open in Detail column (column 3) as embedded tldraw editors

`views.md` needs updating. Until then, treat its List Panel mode-switching behavior (Timeline / Categorized / Search) as valid, and disregard its "permanent background" claims entirely.

### Greenfield State

**Last verified**: 2026-03-21. Phases A–F (Tasks 1.1–3.21) are complete.

Phases A and B (Tasks 1.1–2.5) are fully implemented: monorepo, deps, types, router, Biome, Tailwind, Vitest, mock data, Zustand store, mock API, Minisearch, React Query hooks.

Phase C (Tasks 3.1–3.5) is fully implemented: root layout/app shell, canvas scratchpad (including `ProjectNodeShapeUtil` and `FeedNodeShapeUtil` as custom tldraw ShapeUtils in `packages/web/src/components/canvas/`; nodes synced on editor mount and after `loadSnapshot` calls; canvas scenarios 2/3/4 passing), 3-column feed shell, projects column, general feed.

Phases D+E (Tasks 3.6–3.12) are fully implemented — see notes on each task below.

Phase F (Tasks 3.13–3.21) is fully implemented: Timeline mode (sort toggle, filter bar, filter chips, localStorage persistence), Categorized mode (CategorizedFeed.tsx, group-by dropdown, collapse persistence, 200ms crossfade), Search UI (SearchColumn.tsx, SearchResults.tsx, /search route, URL params, Cmd+Shift+F), Content Fluidity (MoveItemDialog, context menu, HTML5 DnD, optimistic move/copy/unassign), Notification Panel (Radix Dialog, navigate by referenceType, unread badges), Presence Indicators (ProjectDashboard + ProjectsColumn + AppMenu Who's Online), Responsive Layouts (MobileTabBar.tsx, 4-tab nav), Dark Mode (useDarkMode hook, dark: variants, tests), Smooth Transitions (ToastProvider.tsx, route pending top bar, fade-in animations).

**Post-plan additions (2026-03-21):** Keyboard shortcuts (Cmd+K app menu, Cmd+N compose, Cmd+Shift+F search — AppMenu.tsx controlled DropdownMenu + KeyboardShortcutsDialog); `specs/scenarios/layout/keyboard-shortcuts.feature` (6 scenarios); Canvas custom shape utils (`ProjectNodeShapeUtil`, `FeedNodeShapeUtil` with tldraw v4 `TLGlobalShapePropsMap` augmentation, node sync via `editorMounted` flag + `useCallback`).

**Routing architecture note:** All feed routes render `FeedShell` directly (passing col2/col3 as props) rather than using `_layout.tsx` nested layouts. TanStack Router's flat `routeTree.gen.ts` generation did not work with the nested `_layout.tsx` approach, so each route file at `feed/index.tsx`, `feed/$slug/index.tsx`, etc. renders the 3-column shell directly.

### Iteration 1 Gap Analysis (2026-03-21)

Cross-referencing specs against plan found these corrections:

**Task 1.3 gaps (shared types):**
- `ProjectMember` type missing entirely — `data-model.md` defines `project_members` table (`projectId`, `userId`, `role`, `invitedBy`, `joinedAt`). Required for mock data (Ben is a member of CSF Live project).
- `ContentItem.deletedAt: Date | null` missing — data model uses soft delete pattern.
- `ContentItem.source` enum not specified: `'human' | 'claude' | 'agent' | 'import'`
- `ContentItem.status` enum not explicit: `'active' | 'archived' | 'merged'`
- `Message.source` enum not specified: `'web' | 'mobile' | 'claude-code' | 'agent'`
- Convention: TypeScript types use camelCase (`createdAt`, `authorId`, etc.) — FK fields are `userId`, not `user` or `user_id`

**Scenario coverage gaps:**
- `content/document-editing.feature` is completely missing — TipTap editing is a major Tier 1 feature (Task 3.11) with zero scenario coverage.
- No `layout/keyboard-shortcuts.feature` — keyboard shortcuts (Cmd+K, Cmd+\, Escape) are scattered across tasks with no scenario validation.

**Sort order clarification confirmed:** General feed (`/feed`) is always newest-at-bottom (chat-style, fixed). Sort toggle applies only to Timeline mode within project feeds. `feed.md` is authoritative; `views.md` is imprecise. Plan already reflects this correctly.

### Tier 2+ Deferred Items

Items explicitly excluded from Tier 1 (not planned here):
- Real backend: Hono, PlanetScale, Drizzle, R2, WorkOS, WebSockets
- Version restore (disabled CTA in Tier 1 with "Phase 2" tooltip)
- Live link preview metadata fetch (pre-populated in mock only)
- Realtime feed delivery to Ben's session
- Per-user spatial canvas positions
- Actual file download / upload to R2
- Voice transcription via Whisper/Deepgram
- PWA service worker, push notifications, share target
- Diff view for document versions (read-only list only)
- Split / Merge content operations
- Spawn project from selected feed items (projects.md §Creating a Project — "user selects one or more feed items")
- Soft-delete recovery UI (content items have `deletedAt`; recovery is Tier 2+)
- Third-party collaborator access model

---

## 1. Project Setup

### Task 1.1 — Monorepo Scaffolding
**Source**: `techstack-study.md` §12

- Initialize `package.json` at repo root with `bun workspaces` pointing to `packages/*`
- Create `packages/web/` — React Vite SPA
- Create `packages/shared/` — TypeScript shared types only (zero runtime deps)
- Initialize `biome.json` at repo root
- Initialize `packages/web/vite.config.ts`
- Initialize `packages/web/index.html`
- Initialize `packages/web/src/main.tsx` (React 19 entry with `createRoot`)
- Create `bun.lockb` via `bun install`
- Create `specs/scenarios/` directory tree

**Target directory shape:**
```
csf-live/
├── packages/
│   ├── web/
│   │   ├── src/
│   │   │   ├── routes/
│   │   │   ├── components/
│   │   │   │   ├── ui/
│   │   │   │   ├── feed/
│   │   │   │   ├── projects/
│   │   │   │   ├── canvas/
│   │   │   │   ├── editor/
│   │   │   │   └── shared/
│   │   │   ├── hooks/
│   │   │   ├── mocks/
│   │   │   └── lib/
│   │   ├── index.html
│   │   └── vite.config.ts
│   └── shared/
│       ├── types.ts
│       └── constants.ts
├── specs/
│   └── scenarios/
│       ├── feed/
│       ├── projects/
│       ├── canvas/
│       ├── discussions/
│       ├── search/
│       ├── notifications/
│       ├── content/
│       ├── views/
│       └── layout/
├── biome.json
└── package.json
```

### Task 1.2 — Dependency Installation
**Source**: `techstack-study.md` §10

Install to `packages/web`:
- `react@19`, `react-dom@19`
- `@tanstack/react-router`
- `@tanstack/react-query`
- `zustand`
- `tailwindcss@4`, `@tailwindcss/vite`
- `@radix-ui/react-dialog`, `react-dropdown-menu`, `react-popover`, `react-separator`, `react-slot`, `react-tooltip`, `react-avatar`, `react-scroll-area`, `react-tabs`, `react-collapsible`, `react-context-menu`, `react-toast`
- `tldraw`
- `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-markdown`
- `react-markdown`, `remark-gfm`
- `lucide-react`
- `minisearch`
- Dev: `@tanstack/router-devtools`, `vite`, `@vitejs/plugin-react`, `vitest`, `@vitest/ui`, `@testing-library/react`, `@testing-library/jest-dom`, `typescript`, `jsdom`

Install to `packages/shared`:
- Dev: `typescript` only

Post-setup (separate step per `phasing.md`):
- `npx -y grab@latest init` — react-grab for Claude Code component inspection

### Task 1.3 — Shared TypeScript Types
**Source**: `data-model.md`, `content.md`, `discussions.md`

Create `packages/shared/types.ts` with complete interfaces matching the data model:

- `User` — id, name, email, role (`'owner' | 'collaborator'`), avatarUrl, createdAt, updatedAt
- `Project` — id, title, slug, description, status (`'active' | 'paused' | 'archived' | 'completed'`), createdBy, createdAt, updatedAt
- `Section` — id, projectId, title, description, order, createdBy, createdAt, updatedAt
- `ProjectMember` — projectId, userId, role (`'owner' | 'collaborator'`), invitedBy, joinedAt
- `ContentItem` — id, type, title, body, mediaUrl, mediaType, metadata (includes `document_type` field for `type === 'document'`), source, sourceDetail, projectId, sectionId, parentId, authorId, status, version, createdAt, updatedAt, deletedAt (nullable)
  - `source`: `'human' | 'claude' | 'agent' | 'import'`
  - `status`: `'active' | 'archived' | 'merged'`
- `ContentVersion` — id, contentItemId, versionNumber, body, mediaData, authorId, changeSummary, createdAt
  - **Field names are `body` + `mediaData`** (NOT `content`)
- `ContentType` — `'idea' | 'drawing' | 'sketch' | 'document' | 'link' | 'voice' | 'photo' | 'research' | 'file'`
  - **`'message'` is NOT a ContentType** — messages live in the `messages` table
- `DocumentType` — `'note' | 'prd' | 'blueprint' | 'work-orders' | 'research-summary' | 'meeting-notes' | 'freeform'` (stored in `metadata.document_type`)
- `Tag` — id, name
- `Discussion` — id, contextType (`'feed' | 'project' | 'section'`), contextId (nullable), createdAt
- `Message` — id, discussionId, authorId, content, contentType (`'text' | 'voice' | 'image' | 'file' | 'claude-response'`), mediaUrl, metadata, source (`'web' | 'mobile' | 'claude-code' | 'agent'`), createdAt
- `Notification` — id, userId, type, title, body, referenceType, referenceId, read, createdAt
- `Presence` — userId, status (`'online' | 'offline'`), currentLocation, lastHeartbeat
- `FeedItem` — discriminated union: `(Message & { _sourceTable: 'message' }) | (ContentItem & { _sourceTable: 'content_item' })`

Create `packages/shared/constants.ts`:
- `FEED_DISCUSSION_ID` — stable UUID constant for the well-known feed discussion
- `CURRENT_USER_ID = 'user-jm'` — hardcoded logged-in user for Tier 1
- Content type labels map
- Document type labels map
- Project status labels + color map
- Route path constants

### Task 1.4 — TanStack Router Configuration
**Source**: `layout.md` §URL Model

File-based routing in `packages/web/src/routes/`:

```
src/routes/
├── __root.tsx              # Root layout: providers, app shell
├── index.tsx               # / → Canvas scratchpad
├── feed/
│   ├── _layout.tsx         # Feed 3-column shell (persistent)
│   ├── index.tsx           # /feed → global feed
│   └── $slug/
│       ├── index.tsx       # /feed/:slug → project feed
│       ├── doc.$id.tsx     # /feed/:slug/doc/:id → document in Detail
│       └── item.$id.tsx    # /feed/:slug/item/:id → item in Detail
└── search.tsx              # /search?q=...
```

Notes:
- `__root.tsx` wraps with `QueryClientProvider`, `RouterProvider`, dark mode management, devtools
- `feed/_layout.tsx` renders 3-column shell; child routes slot into columns
- Section filtering is a `?section=:id` query param handled within `/feed/$slug/index.tsx`

### Task 1.5 — Biome Configuration
**Source**: `techstack-study.md` §12

- `biome.json` at repo root: lint (recommended + React), formatter (tabs, 100-char, double quotes), organize imports
- Root `package.json` scripts: `"lint": "biome check ."`, `"format": "biome format --write ."`, `"test": "vitest run"`, `"dev": "bun --cwd packages/web run dev"`

### Task 1.6 — Tailwind v4 + Dark Mode Setup
**Source**: `design.md`

- Configure Tailwind v4 via `@tailwindcss/vite` plugin
- `packages/web/src/styles/globals.css`: import Tailwind, define CSS custom properties for design tokens (warm palette, radius, spacing), load Inter font
- Dark mode strategy: `class` (not `media`) — allows programmatic toggle
- Dark mode toggle in `__root.tsx` using `localStorage` + `document.documentElement.classList`

### Task 1.7 — Vitest Setup
**Source**: `sdd.md` §7

- `vitest.config.ts` in `packages/web/`: `environment: 'jsdom'`, `setupFiles: ['./src/test-setup.ts']`
- `src/test-setup.ts`: `@testing-library/jest-dom` matchers, mocks for `matchMedia`, `IntersectionObserver`, `ResizeObserver`
- Smoke test: `src/lib/utils.test.ts` with one passing assertion

---

## 2. Mock Dataset

### Task 2.1 — Seed Data Generation
**Source**: `phasing.md` §Mock Dataset, `data-model.md`

Create `packages/web/src/mocks/data.ts` — exports `initialMockData` as typed object. All UUIDs are stable hardcoded strings (not `crypto.randomUUID()`).

**Users (3):**
- `user-jm` — Jean-Marc Giorgi, role: `owner`, status: online
- `user-ben` — Ben, role: `owner`, status: online
- `user-claude` — Claude, role: `owner` (system), status: online

**Projects (4):**
- `project-csf-live` — "CSF Live", slug: `csf-live`, status: `active`
- `project-knowledge-garden` — "Knowledge Garden", slug: `knowledge-garden`, status: `active`
- `project-mobile-capture` — "Mobile Capture", slug: `mobile-capture`, status: `paused`
- `project-legacy-refactor` — "Legacy Refactor", slug: `legacy-refactor`, status: `archived`

**Sections (8 total):**
- CSF Live: "Frontend Architecture" (`section-csf-fe`), "Data Model" (`section-csf-data`)
- Knowledge Garden: "Research Layer" (`section-kg-research`), "Curation Engine" (`section-kg-curation`), "Publishing" (`section-kg-publish`)
- Mobile Capture: "UX Design" (`section-mc-ux`)
- Legacy Refactor: "Audit" (`section-lr-audit`), "Migration Plan" (`section-lr-migration`)

**Discussions (13 total):**
- 1 feed discussion: `disc-feed` (`context_type: 'feed'`, `context_id: null`) — use `FEED_DISCUSSION_ID`
- 4 project discussions: one per project
- 8 section discussions: one per section

**Content items (60+ covering all 9 types):**
- `idea`: 10+, mix of feed and projects
- `document`: 8+, 3 with version history; types: `prd`, `note`, `blueprint`, `meeting-notes`, `research-summary`
- `drawing`: 4, 2 with version history; `mediaData` = minimal valid tldraw v2 JSON
- `sketch`: 4, placeholder image URLs
- `link`: 8, pre-populated metadata (`title`, `description`, `favicon`, `ogImage`) in `metadata` JSONB
- `voice`: 4, mock audio blob URL placeholder, duration in metadata
- `photo`: 5, local placeholder image URLs
- `research`: 5, authored by `user-claude`, `source: 'claude'`
- `file`: 4, fake filename/filesize/MIME in metadata
- At least 10 items in general feed (`projectId: null`)
- At least 5 items with section assignments

**Messages (120+):**
- Feed discussion: 40+ messages
- Project discussions: 20+
- Section discussions: 60+
- 10+ from `user-claude` with `contentType: 'claude-response'`
- Include messages with markdown, code blocks, URLs

**Tags (15+):** `react`, `tldraw`, `auth`, `api-design`, `mobile`, `ux`, `performance`, `database`, `claude`, `ai-generated`, `architecture`, `design-system`, `versioning`, `search`, `capture`

**Version history:**
- 5 documents with 2-3 versions each
- 2 drawings with 2 versions each

**Notifications (10+):**
- 4 unread: new project message, research complete, content added, mention
- 6 read: mixed types
- All `referenceType` + `referenceId` point to real mock IDs

**Presence (static):**
- JM: `status: 'online'`, `currentLocation: 'feed'`
- Ben: `status: 'online'`, `currentLocation: 'project:project-csf-live'`

**tldraw canvas document:**
Create `packages/web/src/mocks/tldraw-canvas.ts` — exports `SCRATCHPAD_TLDRAW_DOC` as minimal valid tldraw v2 JSON with: one text label, one rectangle, one arrow. Used as initial scratchpad state and as `mediaData` for drawing content items.

### Task 2.2 — Zustand Mock Store
**Source**: `phasing.md` §Mock Mutations (exact pattern)

Create `packages/web/src/mocks/store.ts` following the exact pattern from `phasing.md`:

```typescript
export const useMockStore = create((set, get) => ({
  ...initialMockData,
  currentUserId: 'user-jm',
  scratchpadDoc: SCRATCHPAD_TLDRAW_DOC,

  postMessage: (discussionId, content, authorId) => { ... },
  createContentItem: (item) => { ... },
  moveContentItem: (itemId, projectId, sectionId?) => { ... },
  copyContentItem: (itemId, projectId, sectionId?) => { ... },
  updateContentItem: (itemId, patch) => { ... },
  createProject: (title, description?) => { ... },
  createSection: (projectId, title, description?) => { ... },
  saveCanvasVersion: (tldrawDoc) => { ... },
  saveAndCloseCanvas: (tldrawDoc, targetProjectId?, targetSectionId?) => { ... },
  markNotificationRead: (notificationId) => { ... },
  markAllNotificationsRead: () => { ... },
  updateContentItemVersion: (itemId, body?, mediaData?, changeSummary?) => { ... },
}));
```

### Task 2.3 — Mock API Module
**Source**: `phasing.md` §Data Fetching Pattern, `data-model.md` §Feed Data Model

Create `packages/web/src/mocks/api.ts` — reads from and writes to Zustand store. All functions return `Promise<T>`. This is the only layer that changes in Phase 2.

**Query functions:**
- `getFeedItems(page?)` → merged `FeedItem[]` from feed discussion messages + unassigned content items, sorted `created_at` ASC (implements the UNION query from `data-model.md`)
- `getMessages(discussionId, page?)` → sorted ASC
- `getProjects()` → sorted by `updatedAt` DESC
- `getProject(slug)` → single project
- `getSections(projectId)` → sorted by `order`
- `getProjectFeedItems(projectId, sectionId?)` → merged content items + discussion messages
- `getContentItem(id)`, `getContentVersions(contentItemId)`
- `getNotifications(userId)`, `getUnreadNotificationCount(userId)`
- `getPresence()`, `getTags()`
- `searchContentItems(query, filters?)` → runs minisearch

**Mutation functions:** wrap all Zustand store methods

### Task 2.4 — Minisearch Index Setup
**Source**: `phasing.md` §Tier 1 Constraints, `search.md`

Create `packages/web/src/lib/search.ts`:
- `MiniSearch` instance indexing `contentItems` + `messages`
- Index fields: `title`, `body`, `metadata.linkTitle`, `metadata.transcription`, `metadata.fileName`
- Export `searchItems(query, filters?)` → runs search, applies filter chips, returns ranked results

### Task 2.5 — React Query Hooks
**Source**: `phasing.md` §Data Fetching Pattern

Create `packages/web/src/hooks/` — one file per domain. All `queryFn` calls go through `mockApi`. Each mutation invalidates relevant query keys on `onSuccess`.

- `useFeed.ts` — `useFeedItems()`, `useProjectFeedItems(projectId, sectionId?)`
- `useMessages.ts` — `useMessages(discussionId)`, `usePostMessage()`
- `useProjects.ts` — `useProjects()`, `useProject(slug)`, `useCreateProject()`
- `useSections.ts` — `useSections(projectId)`, `useCreateSection()`
- `useContentItem.ts` — `useContentItem(id)`, `useContentVersions(id)`, `useUpdateContentItem()`, `useMoveContentItem()`, `useCopyContentItem()`, `useCreateContentItem()`
- `useCanvas.ts` — `useScratchpadCanvas()`, `useSaveCanvas()`, `useSaveAndCloseCanvas()`
- `useSearch.ts` — `useSearch(query, filters)`
- `useNotifications.ts` — `useNotifications()`, `useUnreadCount()`, `useMarkNotificationRead()`, `useMarkAllRead()`
- `usePresence.ts` — `usePresence()`
- `useTags.ts` — `useTags()`

---

## 3. Feature Implementation Tasks

Features are ordered by dependency. Each task: write `.feature` file → implement → validate via devtools-mcp → Vitest unit tests → commit.

### Task 3.1 — Root Layout + App Shell
**Source**: `layout.md` §App Menu, `design.md`

- `__root.tsx` — wraps app with `QueryClientProvider`, `RouterProvider`; dark mode class management on `<html>`
- `AppMenu.tsx` — Radix DropdownMenu from top-left button; entries: Home (`/`), Search, Notifications, Settings stub, Keyboard Shortcuts modal, Who's Online; unread count badge
- `StatusBar.tsx` — fixed bottom-right; connectivity indicator (always "online" in Tier 1)
- Dark mode toggle: reads/writes `localStorage`, applies `dark` class to `documentElement`, respects `prefers-color-scheme` as default
- Keyboard shortcut global handler: `Cmd+K` App Menu, `Cmd+N` Quick Capture, `Cmd+1/2/3` columns, `Cmd+\` Projects toggle, `Escape` close overlays

### Task 3.2 — Canvas Scratchpad Route (`/`) ✓ DONE
**Source**: `canvas.md` §App-Level Scratchpad, `layout.md` §Mode 1

- `routes/index.tsx` — full-screen layout, renders `<ScratchpadCanvas />`
- `ScratchpadCanvas.tsx`:
  - Embeds `<Tldraw>` with `forceDarkMode={isDark}`
  - Loads initial state from `useScratchpadCanvas()` hook
  - Draft recovery: on mount, checks `localStorage` for newer draft → `<DraftRecoveryBanner>` if exists
  - Auto-save to `localStorage` after 3s inactivity (debounced `onChange`)
  - Save button → canvas targeting picker (Feed default or project dropdown) → `useSaveCanvas()`
  - Save and Close button → `useSaveAndCloseCanvas()` → wipes canvas to blank
- `ProjectNode.tsx` — implemented as `ProjectNodeShapeUtil` (custom tldraw `ShapeUtil`): project title, status dot, unread badge; click → navigate `/feed/:slug`
- `FeedNode.tsx` — implemented as `FeedNodeShapeUtil` (custom tldraw `ShapeUtil`): "Feed" label; click → navigate `/feed`

**Implementation notes:**
- `ProjectNodeShapeUtil` and `FeedNodeShapeUtil` live in `packages/web/src/components/canvas/`
- Both shape types are registered via the `shapeUtils` prop on `<Tldraw>`
- Project and feed nodes are synced onto the editor on mount and re-synced after every `loadSnapshot()` call (snapshot restore wipes editor state, so node sync must follow)
- Required installing `@tldraw/tlschema` as a dev dependency and adding a `tsconfig` path alias for the `TLGlobalShapePropsMap` module augmentation that registers custom shape types with tldraw's type system

**Tier 1 constraints:** No real-time collaboration, no per-user spatial state.

**Tests:**
- Draft recovery: newer localStorage draft triggers banner; older draft does not
- `saveCanvas` creates drawing content item with correct fields
- `saveAndCloseCanvas` resets scratchpad state
- Canvas scenario 2 (project nodes visible on canvas) — passing
- Canvas scenario 3 (clicking a project node navigates to `/feed/:slug`) — passing
- Canvas scenario 4 (clicking feed node navigates to `/feed`) — passing

### Task 3.3 — Feed Layout (3-Column Shell)
**Source**: `layout.md` §Mode 2

- `routes/feed/_layout.tsx` — 3-column flex container:
  - Column 1: min 200px, resizable
  - Column 2: flexible, min 300px
  - Column 3: min 350px, hidden when no item selected
  - Drag handles: `onPointerDown` → track pointer → update widths; persist to `localStorage`
  - `Cmd+\` collapses Projects column
- `ResizableDivider.tsx` — drag handle, keyboard-accessible (arrow keys)
- `useBreakpoint()` hook: `mobile` | `tablet` | `desktop` based on `window.innerWidth`

**Responsive:**
- Desktop (>1024px): all 3 columns
- Tablet (768-1024px): Projects collapsible to icon-width
- Mobile (<768px): `<MobileTabBar />` with 4 bottom tabs (Canvas, Projects, Feed, Detail)

**Tests:** Column visibility logic; `useBreakpoint` returns correct tier at each width

### Task 3.4 — Projects Column (Column 1)
**Source**: `layout.md` §Column 1, `projects.md`

- `ProjectsColumn.tsx`:
  - "General Feed" item at top → navigates `/feed`
  - Project list from `useProjects()`, sorted (recent activity default)
  - Active selection highlighted (matches current `slug` param)
  - Sort toggle: recent, alphabetical, status
  - Unread badges on project cards
  - "New Project" button → `<CreateProjectDialog />`
  - Presence list at bottom (`usePresence()`)
- `ProjectCard.tsx` — title, status dot, unread badge; container-query adaptive; right-click ContextMenu (Archive, Settings stub)
- `CreateProjectDialog.tsx` — title (required) + description; calls `useCreateProject()` → navigate to new project

**Tests:** Sorting logic; active highlighting; unread badge computation

### Task 3.5 — General Feed (Column 2, `/feed`)
**Source**: `feed.md`, `layout.md` §Column 2

- `FeedColumn.tsx` — container with mode switcher tabs (Timeline / Categorized / Search), renders `<GeneralFeed>` or `<ProjectFeed>` based on route
- `GeneralFeed.tsx` — `useFeedItems()` → merged `FeedItem[]` sorted `created_at` ASC; auto-scroll to bottom; "Load more" at top; empty state: "Start a conversation or capture an idea."
- `FeedItemRenderer.tsx` — dispatches to `<MessageBubble>` or `<ContentCard>` by `_sourceTable`
- `MessageBubble.tsx` — chat bubble layout (JM right, others left); Claude badge; `react-markdown` rendering; inline `<AudioPlayer>` for voice; inline thumbnail for image

**Tests:** `getFeedItems` returns correct merged union; message vs content item discrimination

### Task 3.6 — Content Cards (All 9 Types) ✓ DONE
**Source**: `feed.md` §Feed Item Rendering, `content.md` §Content Types

Implemented: `ContentCard.tsx` dispatches to all 9 type-specific card components. Cards support click-to-select and selection highlighting. All 9 types are handled in `DetailColumn` with appropriate detail views.

- `ContentCard.tsx` — dispatcher by `item.type`; container query context; click → navigate to detail route
- `components/feed/cards/`:
  - `IdeaCard.tsx` — body (truncated), author, timestamp, tags
  - `DocumentCard.tsx` — title, `document_type` badge, first-line preview
  - `DrawingCard.tsx` — tldraw snapshot thumbnail, title
  - `SketchCard.tsx` — thumbnail, "Sketch" label
  - `LinkCard.tsx` — og:image, title, description, favicon, domain; plain URL fallback
  - `VoiceCard.tsx` — `<AudioPlayer>`, duration
  - `PhotoCard.tsx` — thumbnail, author, timestamp
  - `ResearchCard.tsx` — title, "AI Research" badge, 100-char summary, Claude badge
  - `FileCard.tsx` — filename, size, MIME icon; download disabled with tooltip "Available in Phase 2"
- `AudioPlayer.tsx` — HTML5 `<audio>`, play/pause, elapsed/total, waveform placeholder SVG

**Container queries:** All cards use `@container` on parent wrapper (`container-type: inline-size`):
- Narrow: title + type icon + timestamp
- Medium: + preview + author
- Wide: + full metadata + action buttons

**Tests:** Each card renders without crashing; container query class logic

### Task 3.7 — Compose Input (= Quick Capture) ✓ DONE
**Source**: `layout.md` §Compose Input, `feed.md` §Quick Capture

- `ComposeInput.tsx` — bottom of Feed column, two modes:

  **Default (text mode):**
  - Auto-expanding textarea (max 5 lines)
  - `+` button or `Cmd+N` → enhanced mode
  - `Cmd+Enter` → post
  - Context-aware placeholder; posts to feed or project discussion based on route
  - URL detection → creates `link` content item with mock metadata

  **Enhanced mode:**
  - Voice: `onPointerDown` starts `MediaRecorder`, `onPointerUp` stops; session blob URL → `createContentItem({ type: 'voice' })`
  - Camera: `<input type="file" accept="image/*" capture="environment">` → session blob URL → `createContentItem({ type: 'photo' })`
  - File: `<input type="file">` → `createContentItem({ type: 'file', metadata: { fileName, fileSize, mimeType } })`
  - Targeting dropdown: Feed (default) or project picker

- Optimistic UI: React Query `onMutate` callback adds item to feed immediately

**Tests:** URL detection; mode switching; correct `discussionId` based on route; MediaRecorder start/stop

### Task 3.8 — Project Feed (Column 2, `/feed/:slug`) ✓ DONE
**Source**: `feed.md`, `projects.md`, `discussions.md`

Implemented: `ProjectFeed.tsx` with `SectionChips` row, navigation between sections, and compose input. Section filter via `?section=:id` query param.

- `ProjectFeed.tsx`:
  - `useProjectFeedItems(projectId, sectionId?)` — messages + content items merged, sorted newest-at-top
  - `<SectionChips>` row above feed — "All" + section chips; clicking pushes `?section=:id`
  - Project root view: read aggregate (not a separate thread) — interleaves project discussion messages + all section messages; section messages labeled with their section name (e.g., "In Frontend Architecture: [message]")
  - Empty state: "Add a section or drop content here to get started."
- `SectionChips.tsx` — horizontal scrollable row; active chip highlighted

**Tests:** Section filter logic; aggregate view labels section messages correctly

### Task 3.9 — Project Dashboard (Column 3, project selected, no item) ✓ DONE
**Source**: `projects.md` §Project Dashboard

Implemented: `ProjectDashboard.tsx` with inline-editable title and description, status badge/picker, section list with navigation, `CreateSectionDialog`, activity summary, and presence indicator for Ben.

- `ProjectDashboard.tsx` — renders when route is `/feed/:slug` with no item sub-route:
  - Inline-editable title (click to edit, blur to save)
  - Inline-editable description
  - Status badge + picker dropdown
  - Section list (clickable rows → `?section=:id`)
  - "Add section" button → `<CreateSectionDialog />`
  - Activity summary: last 5 content items (author, type icon, timestamp)
  - "Ben is in this project" presence indicator if Ben's `currentLocation` matches
- `CreateSectionDialog.tsx` — title + optional description; calls `useCreateSection()`

**Tests:** Presence indicator shows for correct project; absent for others

### Task 3.10 — Detail Column (Column 3) + Item Routing ✓ DONE
**Source**: `layout.md` §Column 3

Implemented: `DetailColumn.tsx` dispatcher with 10 detail views. All routes wired via TanStack Router `navigate()`. Each feed route passes the appropriate col3 content as a prop to `FeedShell` (see routing architecture note in Greenfield State).

- `DetailColumn.tsx` — renders correct detail view based on route + selection:
  - No selection → `EmptyDetail.tsx` ("Select an item to view details")
  - Column header: item title, type badge, version history button (if versioned), close button
- Detail views:
  - `MessageDetail.tsx` — full text, reply compose (posts to same discussion)
  - `IdeaDetail.tsx` — TipTap lite editing, inline tag editor
  - `DocumentDetail.tsx` → Task 3.11
  - `DrawingDetail.tsx` → Task 3.12
  - `LinkDetail.tsx` — full link preview, original URL, editable notes field
  - `PhotoDetail.tsx` — full-size image with CSS zoom
  - `SketchDetail.tsx` — full-size image
  - `VoiceDetail.tsx` — full `<AudioPlayer>`, mock transcription text
  - `ResearchDetail.tsx` — `react-markdown` output, sources list, Claude badge
  - `FileDetail.tsx` — metadata, download disabled in Tier 1
  - `SectionDetail.tsx` — section discussion thread + compose input
  - `ProjectDashboard.tsx` — reused from Task 3.9
  - `EmptyDetail.tsx` — empty state

Clicking a feed item navigates to correct detail route via TanStack Router `navigate()`.

### Task 3.11 — Document Viewer / Editor (TipTap) ✓ DONE
**Source**: `content.md` §Documents

Implemented: `DocumentEditor.tsx` with TipTap StarterKit + Markdown extension, formatting toolbar, 2s auto-save debounce, and `VersionHistoryPanel.tsx` (read-only version list with disabled Restore button).

- `DocumentEditor.tsx`:
  - `<EditorContent>` with `StarterKit` + `@tiptap/extension-markdown`
  - Loads `contentItem.body` on mount
  - Auto-save: 2s debounce → `useUpdateContentItemVersion()` → new version in store
  - Toolbar: Bold, Italic, H1/H2/H3, Code, Blockquote, Bullet List, Ordered List, HR
  - `document_type` badge in header (from `metadata.document_type`)

- `VersionHistoryPanel.tsx` (Radix Dialog):
  - Lists versions from `useContentVersions(itemId)`: number, author, timestamp, changeSummary
  - Click version → read-only preview pane
  - "Restore" button — disabled in Tier 1; Radix Tooltip: "Version restore available in Phase 2"

**Tests:** Auto-save debounce creates new version; restore button is disabled

### Task 3.12 — Drawing Detail Editor (tldraw in Column 3) ✓ DONE
**Source**: `canvas.md` §Drawing Content Items

Implemented: `DrawingEditor.tsx` with embedded tldraw, 3s auto-save to localStorage draft, explicit Save button that calls `useUpdateContentItemVersion()`, and `VersionHistoryPanel` reused from Task 3.11.

- `DrawingEditor.tsx`:
  - `<Tldraw>` embedded in Detail column
  - Loads `item.mediaData` (tldraw JSON from latest version) as initial state
  - Save button → `useUpdateContentItemVersion()` with new snapshot
  - Auto-save: 3s debounce → localStorage draft for this item's ID
  - `<VersionHistoryPanel>` reused; "Restore" disabled in Tier 1
  - Column must have `overflow: hidden` to contain tldraw

### Task 3.13 — Timeline Mode (Feed Column) ✓ DONE
**Source**: `views.md` §Mode 1

- Timeline is the default mode; mode switcher tabs in FeedColumn header: Timeline | Categorized | Search (Radix `<Tabs>`)
- Sort order toggle (newest first / oldest first); persisted to `localStorage` per context
- Filter bar (collapsible):
  - Content type: multi-select checkboxes for all 9 types + "Messages"
  - Author: JM / Ben / Claude
  - Date range: "Last 7 days / Last 30 days / All time" radio group
  - Section filter (project context only)
- Applied filters shown as dismissible chips
- Filter logic is client-side: filter already-loaded array; no refetch
- Infinite scroll: 20 items, "Load more" at top

**Tests:** Type filter removes non-matching; author filter; date range filter

### Task 3.14 — Categorized Mode (Feed Column) ✓ DONE
**Source**: `views.md` §Mode 2

- `CategorizedFeed.tsx`:
  - Renders when mode = "Categorized"
  - Groups content items by `type` into Radix `<Collapsible>` sections
  - Messages excluded (they are not content items)
  - Each category: type label + icon, count badge, chevron
  - Default: all expanded; collapse state persisted to `localStorage`
  - Secondary "Group by" dropdown: type, section, author, tag
  - 200ms crossfade (`transition-opacity duration-200`) when switching modes

**Tests:** Grouping produces correct groups; counts match; collapse toggling

### Task 3.15 — Search UI ✓ DONE
**Source**: `search.md`, `views.md` §Mode 3

- `routes/search.tsx` — same 3-column shell; Feed column shows `<SearchResults>`
- `SearchBar.tsx` — debounced 300ms `useSearch(query, filters)`; `Cmd+Shift+F` focuses it
- `SearchResults.tsx`:
  - Ranked results with highlighted snippets, type icon, project+section, author, date
  - Click → navigate to item's detail route
  - Empty state: "No results found. Try different keywords or adjust your filters."
- `FilterChips.tsx` — project, section, type, author, date range; active as dismissible chips; state in URL search params
- Selecting "Search" tab in mode switcher activates search bar inline

**Tests:** `searchItems('auth')` returns correct results; type filter narrows; empty query returns empty array

### Task 3.16 — Content Fluidity (Move / Copy / Drag-and-Drop) ✓ DONE
**Source**: `content.md` §Content Fluidity

- "Move to..." via content card context menu → Radix Dialog with project + section picker → `useMoveContentItem()` → optimistic UI removes item immediately
- "Copy to..." via same dialog → `useCopyContentItem()` — original stays, duplicate added
- "Unassign" in context menu → `useMoveContentItem(itemId, null)`
- Drag-and-drop (desktop, HTML5 API):
  - Cards are `draggable`; `dataTransfer` carries `itemId`
  - Project cards in Projects column are drop targets
  - `onDrop` → `useMoveContentItem(itemId, projectId)`
  - Visual feedback: dragging card semi-transparent; target project highlighted
- Split and Merge: disabled menu items with "Coming in Phase 2" tooltip

**Tests:** `moveContentItem` removes from source, adds to target; `copyContentItem` leaves original in place

### Task 3.17 — Notification Panel ✓ DONE
**Source**: `notifications.md`

- `NotificationPanel.tsx` — Radix Dialog from App Menu "Notifications":
  - Unread badges: project cards in Projects column + section headers in project feed
  - List from `useNotifications()` sorted DESC
  - Each: title (bold if unread), body, timestamp, type icon
  - Click → `useMarkNotificationRead(id)` + navigate to referenced content
  - "Mark all as read" → `useMarkAllNotificationsRead()`
  - Empty state: "You're all caught up."
- AppMenu update: unread count badge via `useUnreadCount()`
- Project cards: unread badges from notifications with `referenceType: 'project'` and `read: false`

**Tests:** Unread count correct; marking one read decrements; mark all sets count to 0; navigation URL derived from referenceType/referenceId

### Task 3.18 — Presence Indicators ✓ DONE
**Source**: `notifications.md` §Presence

Static presence — no WebSocket in Tier 1:

- `PresenceList.tsx` — bottom of Projects column; lists `status: 'online'` users; avatar + green dot
- `ProjectPresenceIndicator.tsx` — in ProjectDashboard: "Ben is in this project" if Ben's `currentLocation` matches current projectId; avatar clipped to header edge
- App Menu "Who's Online" section: same presence list

**Tests:** Indicator shows for Ben in correct project; absent elsewhere

### Task 3.19 — Responsive Layouts ✓ DONE
**Source**: `layout.md` §Responsive Behavior

- Mobile (`<768px`): `<MobileTabBar />` fixed at bottom (Canvas, Projects, Feed, Detail tabs)
  - Canvas tab → `/`
  - Projects, Feed, Detail → full-screen panels
  - Detail tab only active after item selected
  - Compose input: `position: fixed; bottom: [viewport height]` via `visualViewport` resize event
- Tablet (768-1024px): Projects column collapsible to 48px icon-width
- Desktop (>1024px): 3-column, hover states via `@media (hover: hover)`
- All touch targets: min 44×44px (`min-h-11 min-w-11`)

**Tests:** `useBreakpoint` returns `mobile` at 375px, `tablet` at 800px, `desktop` at 1200px

### Task 3.20 — Dark Mode ✓ DONE
**Source**: `design.md`

- `useDarkMode()` hook: reads `localStorage`, detects system preference, toggles `dark` class on `documentElement`; cycles `light → dark → system`
- All components have `dark:` Tailwind variants for backgrounds, text, borders, status colors
- tldraw: `forceDarkMode={isDark}` prop
- TipTap: `dark:prose-invert` container class

**Tests:** `useDarkMode` applies `dark` class correctly; respects system preference when null

### Task 3.21 — Smooth Transitions ✓ DONE
**Source**: `design.md` §Interaction Quality

- Mode switch (Timeline/Categorized/Search): 200-300ms opacity crossfade
- Route transitions: TanStack Router `pending` state → `opacity-50`
- Card hover (desktop): `transition-shadow duration-150 hover:shadow-md`
- Detail column appear: `transition-[width] duration-200`
- New messages: fade-in via custom keyframe:
  ```css
  @keyframes fade-in { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; } }
  ```
- Toasts (Radix Toast): success/error for mutations; bottom-right, auto-dismiss 3s

---

## 4. Scenario Files

All `.feature` files in `specs/scenarios/`. Each includes a `# Status: 0/N scenarios passing` header and a `Background` block.

### `feed/posting.feature`
1. JM posts a text message to the general feed
2. Post fails with empty message content
3. JM posts a message containing a URL (renders as link card)
4. JM posts using `Cmd+Enter`
5. Feed shows correct author on JM's message
6. Feed shows Claude's response with Claude author styling

### `feed/quick-capture.feature`
1. JM opens Quick Capture via `+` button
2. JM opens Quick Capture via `Cmd+N`
3. JM captures a plain idea to the general feed
4. JM captures a link — link card with pre-populated metadata
5. JM captures targeted to a specific project — not in general feed
6. JM captures targeted to a project section
7. JM records voice — audio player appears in feed
8. JM uploads a photo — thumbnail appears
9. JM captures a file — file card with metadata
10. JM posts in project feed — goes to project discussion

### `feed/content-movement.feature`
1. JM moves a feed item to a project via "Move to..."
2. Moved item disappears from general feed
3. Moved item appears in target project feed
4. JM copies a feed item — original remains
5. JM unassigns an item from a project back to the feed
6. JM drag-and-drops a feed item onto a project
7. Move to project with section targeting
8. Move dialog dismissed without action — item unchanged

### `projects/creation.feature`
1. JM creates a project (title only)
2. New project appears in Projects column
3. JM navigates to new project feed after creation
4. JM creates project with title and description
5. Slug auto-generated from title
6. Empty title shows validation error

### `projects/sections.feature`
1. JM adds a section to a project
2. New section appears in section chips row
3. JM clicks section chip — feed filters to that section
4. JM posts a message in a section discussion
5. Section message appears in project root with section label
6. Project root shows interleaved messages from all sections

### `projects/dashboard.feature`
1. No item selected → project dashboard shown
2. Dashboard shows title, description, sections, activity
3. JM edits project title inline
4. JM edits project description inline
5. JM changes project status
6. Presence indicator shows when Ben is in the project
7. Presence indicator absent for other projects

### `canvas/drawing.feature`
1. `/` shows full-screen tldraw canvas
2. Canvas shows project nodes for all projects
3. Clicking project node navigates to `/feed/:slug`
4. Clicking Feed node navigates to `/feed`
5. JM draws a shape on the canvas
6. JM saves canvas — drawing item appears in general feed
7. JM saves canvas targeted to a project
8. JM saves and closes — drawing item created, canvas cleared
9. Canvas is blank on next visit after save-and-close

### `canvas/versioning.feature`
1. Canvas save creates a new version entry
2. Version history lists all saved versions
3. Viewing older version shows that content (read-only)
4. Restore button present but disabled with Phase 2 tooltip
5. Newer localStorage draft triggers recovery banner on load
6. JM accepts draft recovery — canvas loads draft
7. JM dismisses draft recovery — canvas loads last saved version

### `canvas/drawing-in-detail.feature`
1. Clicking a drawing content item opens tldraw in Detail column
2. JM edits drawing in Detail and saves — new version created
3. Drawing version history panel lists previous versions
4. Version restore disabled in Tier 1

### `discussions/messaging.feature`
1. JM posts in a project discussion
2. JM posts in a section discussion
3. Section message appears labeled in project root discussion
4. Markdown rendering: bold, code block
5. Message shows correct author
6. Claude messages have distinct styling

### `search/search.feature`
1. JM opens search from App Menu
2. JM opens search via `Cmd+Shift+F`
3. JM types query — results within 300ms (client-side)
4. Results show type icon, preview, project, author, date
5. JM clicks result — navigates to item in context
6. Type filter narrows results
7. Author filter narrows results
8. Clearing filters restores full results
9. Empty query returns no results
10. No matches shows "No results found..." empty state

### `notifications/notifications.feature`
1. App Menu shows unread count badge
2. JM opens notification panel — all notifications listed
3. Unread notifications have bold title
4. JM clicks notification — navigates to referenced content
5. Clicked notification marked as read
6. JM marks all as read — badge goes to zero
7. "You're all caught up." empty state

### `notifications/presence.feature`
1. App Menu shows JM and Ben as online
2. Projects column presence list shows online users
3. "Ben is in this project" on CSF Live project dashboard
4. Ben's indicator absent on other projects
5. No cursor tracking or real-time updates in Tier 1 (static)

### `content/document-editing.feature`
1. Clicking a document item opens TipTap editor in Detail column
2. Toolbar buttons (Bold, Italic, H1/H2/H3, Code, Blockquote) apply formatting
3. Editing content triggers auto-save after 2s inactivity
4. Auto-save creates a new version in version history
5. `document_type` badge shown in editor header (e.g., "PRD", "Note")
6. Switching to a different item discards unsaved draft (no cross-item leakage)

### `content/version-history.feature`
1. Version history panel lists all versions
2. Clicking version loads read-only preview
3. Restore button disabled with Phase 2 tooltip
4. Each version shows author, timestamp, change summary
5. Editing document creates new version on auto-save

### `content/content-cards.feature`
1. Idea card: body text, author, timestamp
2. Document card: title, document_type badge, first-line preview
3. Link card: og:image, title, description, domain
4. Voice card: audio player
5. Photo card: thumbnail
6. Drawing card: thumbnail and title
7. Research card: "AI Research" badge, summary preview
8. File card: filename, size, type icon; download disabled in Tier 1
9. Cards adapt to narrow (compact) and wide (full metadata) containers

### `views/timeline-mode.feature`
1. Feed defaults to Timeline mode
2. Sort order toggle reverses feed
3. Content type filter shows only matching types
4. Author filter shows only that author's items
5. Date range filter hides out-of-range items
6. Applied filters shown as dismissible chips
7. Removing filter chip restores items

### `views/categorized-mode.feature`
1. Categorized mode groups items by type
2. Each group shows correct count
3. Collapsing a group hides items, count remains
4. Expanding restores items
5. Switching back to Timeline: 200ms crossfade
6. Mode preference persisted per context

### `layout/responsive.feature`
1. Mobile: 4-tab bottom nav shown
2. Mobile: default tab is Feed
3. Mobile: Detail tab only after item selected
4. Tablet: Projects column collapsible
5. Desktop: all 3 columns visible
6. Column widths persist across page reload

### `layout/dark-mode.feature`
1. Default theme respects system preference
2. Toggle dark mode from App Menu
3. Dark mode persists across page reload
4. tldraw respects dark mode
5. All components render correctly in dark mode

---

## 5. Deferred to Tier 2

Items that have visible entry points in Tier 1 UI should render as disabled with tooltip "Available in Phase 2."

**Backend / Infrastructure:**
- Hono API server, PlanetScale + Drizzle, Cloudflare R2
- WorkOS auth flow (hardcoded `user-jm` in Tier 1)
- Bun native WebSocket server + client

**Features requiring backend:**
- Version restore (disabled CTA)
- Live link preview metadata fetch
- Realtime feed delivery to Ben
- Per-user spatial canvas positions
- Actual file download / R2 upload
- Voice transcription
- PWA push notifications + service worker
- Document diff view

**Content operations (complex, Tier 2):**
- Split content item into two
- Merge content items
- Spawn project from feed items
- Bulk archive/move/tag
- Soft-delete recovery

**Access model:** Tier 2 third-party collaborators, role guards

---

## 6. Deferred to Tier 3 (AI Integration)

All AI features are Phase 3. In Tier 1, `user-claude` exists in mock data with pre-authored messages and research items — rendered with Claude styling, no live invocation.

- `@claude` mention → Claude API invocation
- Document generation by Claude
- Section scaffolding interview
- Research agent
- Natural language search
- AI housekeeping suggestions
- Weekly digest
- Voice transcription (Whisper/Deepgram)
- Review Mode
- Software Factory bridge
- Claude Code plugin (`/csf` commands)
- Context assembly system
- Background job infrastructure

---

## 7. Build Sequence

**Phase A — Foundation:** ✓ COMPLETE
1. Task 1.1 Monorepo scaffolding ✓
2. Task 1.2 Dependency installation ✓
3. Task 1.3 Shared TypeScript types ✓
4. Task 1.4 TanStack Router configuration ✓
5. Task 1.5 Biome configuration ✓
6. Task 1.6 Tailwind v4 + dark mode setup ✓
7. Task 1.7 Vitest setup ✓

**Phase B — Data layer (blocks all feature tasks):** ✓ COMPLETE
8. Task 2.1 Seed data generation ✓
9. Task 2.2 Zustand mock store ✓
10. Task 2.3 Mock API module ✓
11. Task 2.4 Minisearch index ✓
12. Task 2.5 React Query hooks ✓

**Phase C — Core layout + first screens:** ✓ COMPLETE
13. Task 3.1 Root layout + app shell ✓
14. Task 3.3 Feed layout (3-column shell) ✓
15. Task 3.2 Canvas scratchpad route ✓
16. Task 3.4 Projects column ✓
17. Task 3.5 General feed ✓

**Phase D — Content rendering:** ✓ COMPLETE
18. Task 3.6 Content cards (all 9 types) ✓
19. Task 3.7 Compose input / Quick Capture ✓
20. Task 3.10 Detail column + item routing ✓

**Phase E — Project experience:** ✓ COMPLETE
21. Task 3.8 Project feed ✓
22. Task 3.9 Project dashboard ✓
23. Task 3.11 Document editor (TipTap) ✓
24. Task 3.12 Drawing editor (tldraw in Detail) ✓

**Phase F — Views + search:** ← CURRENT STARTING POINT
25. Task 3.13 Timeline mode
26. Task 3.14 Categorized mode
27. Task 3.15 Search UI

**Phase G — Interactions + secondary:**
28. Task 3.16 Content fluidity
29. Task 3.17 Notification panel
30. Task 3.18 Presence indicators

**Phase H — Polish:**
31. Task 3.19 Responsive layouts
32. Task 3.20 Dark mode (formalized across all components)
33. Task 3.21 Smooth transitions

---

## 8. Key Architecture Decisions for Tier 1

**No auth.** Current user is always `user-jm`, hardcoded as `CURRENT_USER_ID` in shared constants. No login screen, no auth guards. Replaced in Tier 2.

**No `packages/api/`.** Not created in Tier 1. All data through `packages/web/src/mocks/`. `packages/shared/` contains types only — no runtime code.

**React Query over direct Zustand access.** Components never import `useMockStore` directly. They use hooks from `packages/web/src/hooks/` which call `mockApi`. This preserves the Phase 2 swap boundary.

**tldraw version pinning.** Pin tldraw (e.g., `"tldraw": "^2.4.0"`). The `SCRATCHPAD_TLDRAW_DOC` mock must match the pinned version's serialization format.

**Container queries over viewport queries for cards.** All content cards use `@container` on parent wrapper. Column wrapper must declare `container-type: inline-size`.

**Zustand store = single source of truth.** `initialMockData` is the seed. All reads and writes through the store. No separate file I/O in Tier 1.

**Spec authority:** `layout.md` v3.0 + `canvas.md` over `views.md` for canvas architecture. `data-model.md` for field names (`body` + `mediaData`, not `content`). `content.md` for `document_type` in `metadata.document_type` (not a top-level column).
