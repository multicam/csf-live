# CSF Live — Implementation Plan

**Generated**: 2026-03-21
**Spec version**: 2.0
**Implementation state**: Greenfield — zero source code exists
**Spec state**: Complete — all 6 phases specified, no inconsistencies found

---

## Pre-Implementation Checklist

These must be resolved or provisioned before Phase 1 can start:

- [ ] **PlanetScale account** — create project, get connection string, create dev schema branch
- [ ] **WorkOS account** — create AuthKit application, get API key + client ID
- [ ] **Cloudflare R2 bucket** — create bucket, get access key + secret
- [ ] **Railway or Fly.io account** — for persistent API server (Claude CLI requires this)
- [ ] **Vercel or CF Pages account** — for frontend static hosting
- [ ] **Decision 1: Claude auth model** — see claude-integration.md §9. *Recommendation: Option A (API key only) for Phase 4. Revisit if costs exceed $50/mo.*
- [ ] **Decision 2: Streaming UX** — see claude-integration.md §9. *Recommendation: Option B (complete response + spinner) for Phase 4. Add streaming in Phase 5.*
- [ ] **tldraw hobby license** — required before Phase 3

---

## Open Decisions (from claude-integration.md §9)

| # | Decision | Recommendation | Phase needed |
|---|----------|---------------|-------------|
| 1 | API key vs Max subscription vs Hybrid | Option A: API key only | Before Phase 4 |
| 2 | Full streaming vs complete response | Option B: complete + spinner for Phase 4; upgrade in Phase 5 | Before Phase 4 |
| 3 | Default model per use case | Sonnet for interactive, Opus for generation/research | Before Phase 4 |
| 4 | Claude Code Plugin scope | `--add-dir` context sync in Phase 5; full plugin in Phase 6 | Before Phase 5 |

---

## Phase 1: Foundation + Feed (Weeks 1–2)

**Goal**: Two people can log in, see a shared feed, and post content to it.
**Blocks**: Everything else.

### 1.1 Monorepo Setup

- [ ] Initialize Bun workspace — `packages/web`, `packages/api`, `packages/shared`
- [ ] Root `package.json` with workspace scripts: `dev`, `build`, `test`, `lint`, `db:generate`, `db:migrate`
- [ ] `biome.json` configured (lint + format, replaces ESLint + Prettier)
- [ ] `bun.lockb` committed
- [ ] GitHub Actions CI: lint → test → build (runs on every PR)

### 1.2 Shared Types (`packages/shared`)

- [ ] `packages/shared/types.ts` — all API request/response types:
  - `User`, `Project`, `Section`, `ContentItem`, `ContentVersion`, `Message`, `Discussion`, `Notification`, `AgentRun`, `Presence`
  - Request types: `CreateProjectRequest`, `CreateMessageRequest`, `CreateContentItemRequest`, etc.
  - WebSocket event types: channel names + payload shapes for all events
- [ ] `packages/shared/constants.ts` — content type enum, discussion context types, project status values, WebSocket channel name helpers

### 1.3 Database Schema (`packages/api`)

Define all tables in `packages/api/src/db/schema.ts` via Drizzle:

- [ ] `users` — id (UUID), name, email, workos_user_id, role (owner/collaborator/system), avatar_url, created_at, updated_at
- [ ] `projects` — id, title, slug (unique), description, status (active/paused/archived/completed), created_by → users, created_at, updated_at
- [ ] `project_members` — project_id → projects, user_id → users, role (owner/member), invited_by → users, joined_at
- [ ] `sections` — id, project_id → projects, title, description, order, created_by → users, created_at, updated_at
- [ ] `content_items` — id, type (idea/drawing/sketch/document/link/voice/photo/research/file), title, body, media_url, media_type, metadata (JSONB), source (human/claude/agent/import), source_detail, project_id → projects (nullable), section_id → sections (nullable), parent_id → content_items (nullable), author_id → users, status (active/archived/merged), version (integer), created_at, updated_at, deleted_at
- [ ] `content_versions` — id, content_item_id → content_items, version_number, body, media_data (JSONB — tldraw JSON), author_id → users, change_summary, created_at
- [ ] `tags` — id, name (unique, lowercase)
- [ ] `content_item_tags` — content_item_id + tag_id (composite PK)
- [ ] `discussions` — id, context_type (feed/project/section), context_id (nullable — project_id or section_id), created_at
- [ ] `messages` — id, discussion_id → discussions, author_id → users, content, content_type (text/voice/image/file/claude-response), media_url, metadata (JSONB), source (web/mobile/claude-code/agent), created_at
- [ ] `notifications` — id, user_id → users, type, title, body, reference_type, reference_id, read (boolean), created_at
- [ ] `agent_runs` — id, project_id → projects (nullable), agent_type (researcher/consolidator/digest/scaffolder), trigger (manual/auto/scheduled), input_prompt, status (queued/running/completed/failed), result_summary, tokens_used, triggered_by → users, created_at, completed_at
- [ ] `presence` — user_id → users, status (online/offline), current_location, last_heartbeat
- [ ] All FK indexes + `created_at` indexes + composite indexes (see data-model.md)
- [ ] Full-text search: `search_vector tsvector` columns on `content_items` and `messages` + GIN indexes + auto-update triggers
- [ ] Generate initial migration: `drizzle-kit generate`
- [ ] Seed: Claude system user (`id: 'claude-system-user-uuid'`, `role: 'system'`), feed discussion (one global discussion with `context_type: 'feed'`)
- [ ] Test migration on PlanetScale dev branch

### 1.4 API Server Foundation (`packages/api`)

- [ ] `packages/api/src/index.ts` — `Bun.serve()` entry with Hono app + native WebSocket server
- [ ] `packages/api/src/middleware/auth.ts` — WorkOS JWT validation middleware (`c.set('user', user)`)
- [ ] `packages/api/src/middleware/cors.ts` — CORS for frontend origin
- [ ] `packages/api/src/middleware/error.ts` — global error handler returning typed error responses
- [ ] `packages/api/src/db/index.ts` — Drizzle client with PlanetScale connection string
- [ ] `packages/api/src/lib/r2.ts` — S3Client configured for R2 endpoint with presigned URL helpers
- [ ] `packages/api/src/lib/workos.ts` — WorkOS SDK wrapper (JWT validation, user lookup)
- [ ] `packages/api/src/ws/handler.ts` — WebSocket connection management:
  - In-memory `Map<channel, Set<ServerWebSocket>>`
  - Channel subscription/unsubscribe on message
  - Heartbeat ping handler
  - `broadcast(channel, event)` helper used by all route mutations
  - Channels: `feed`, `project:{id}`, `project:{id}:section:{id}`, `presence`, `notifications:{userId}`

### 1.5 Phase 1 API Routes

All routes require auth middleware. Mutations broadcast WebSocket events.

- [ ] `GET /api/users/me` — current user profile (from WorkOS JWT)
- [ ] `GET /api/feed` — paginated unified feed (UNION of messages WHERE discussion_id = feed_discussion + content_items WHERE project_id IS NULL AND status = 'active'), ordered by created_at DESC, cursor pagination
- [ ] `POST /api/feed/messages` — post text message to feed discussion → broadcast `feed:message:new`
- [ ] `POST /api/content-items` — create content item (idea, link, voice, photo, file) → broadcast `feed:content:new`
- [ ] `POST /api/upload/presign` — generate R2 presigned PUT URL (15min expiry), returns `{ uploadUrl, fileKey }`
- [ ] `POST /api/upload/confirm` — save file metadata to content_item after successful R2 upload

### 1.6 Frontend Foundation (`packages/web`)

- [ ] Vite + React 19 + TypeScript — `packages/web/vite.config.ts`
- [ ] Tailwind CSS 4 — `packages/web/tailwind.config.ts`
- [ ] React Router v7 — route config in `packages/web/src/main.tsx`
- [ ] TanStack Query (React Query) — `QueryClient` in root provider
- [ ] Zustand store — `packages/web/src/store/` for UI state (view prefs, modal state)
- [ ] `packages/web/src/lib/api.ts` — typed fetch wrapper:
  - Auto-injects Authorization header from stored JWT
  - Returns typed responses matching `packages/shared/types.ts`
  - Throws structured API errors
- [ ] `packages/web/src/lib/ws.ts` — WebSocket client:
  - Manages single connection, auto-reconnects on disconnect
  - `subscribe(channel)` / `unsubscribe(channel)`
  - Event listener registration: `on(eventType, handler)`
  - `useWebSocket(eventType, handler)` React hook
- [ ] `packages/web/src/lib/auth.ts` — WorkOS AuthKit helpers (login, logout, get JWT)

### 1.7 Frontend: Routing Structure

- [ ] `src/routes/_layout.tsx` — root layout: auth guard (redirect to /login if no JWT), loads current user, sidebar, wraps all protected routes
- [ ] `src/routes/login.tsx` — WorkOS AuthKit login page (email + password, magic link, OAuth)
- [ ] `src/routes/feed.tsx` — general feed (default on login)
- [ ] `src/routes/projects/index.tsx` — project list (placeholder for Phase 2)
- [ ] `src/routes/search.tsx` — global search (placeholder for Phase 5)
- [ ] `src/routes/settings.tsx` — settings (placeholder)

### 1.8 Frontend: Feed + Sidebar UI

**Design direction**: soft, warm, conversational. Rounded corners, breathing whitespace. Inspired by Mud/Matter aesthetic. Inter or Instrument Sans from day 1. Dark mode via `dark:` Tailwind variant from day 1.

- [ ] Sidebar component (`src/components/layout/Sidebar.tsx`):
  - Feed nav item (default active)
  - Projects list section (placeholder — shows "Projects" heading for now)
  - Quick Capture button (prominent)
  - Search entry point
  - Notifications bell with unread badge (placeholder count: 0)
  - Presence indicator (placeholder)
  - User avatar + name at bottom
- [ ] Feed component (`src/components/feed/Feed.tsx`):
  - `useQuery` fetching from `GET /api/feed` via React Query
  - Chronological list, newest at bottom
  - Infinite scroll (load older messages on scroll up)
  - Real-time updates: WebSocket `feed:message:new` + `feed:content:new` → `queryClient.invalidateQueries(['feed'])`
- [ ] `FeedItem` component — renders either a message or a content item:
  - Author avatar + name
  - Timestamp (relative: "2 min ago")
  - Content type icon (from Lucide React)
  - Content preview (markdown rendered via react-markdown)
  - Content item: tag display, "Move to project..." action (placeholder)
- [ ] Message input component — text area, submit on Enter (Shift+Enter for newline), posts to `POST /api/feed/messages`

### 1.9 Frontend: Quick Capture

- [ ] `QuickCaptureModal` component (`src/components/capture/QuickCaptureModal.tsx`):
  - Trigger: Quick Capture sidebar button + `Cmd+K` keyboard shortcut
  - Text input with URL auto-detection (regex check on paste/blur)
  - Voice record button — hold `MediaRecorder` to record, release to stop; shows waveform / duration while recording
  - Camera button — `<input type="file" accept="image/*" capture="camera">` in hidden input
  - Photo library button — `<input type="file" accept="image/*">` in hidden input
  - File drop zone — `dragover` + `drop` event handlers
  - Target selector — "Feed" (default) vs project dropdown (loads recent projects)
  - Submit: calls `POST /api/content-items` (text/link) or presign+confirm flow (files)
- [ ] Optimistic UI — item appears immediately in feed before server confirms

### 1.10 Deployment

- [ ] `packages/api/Dockerfile` — Bun runtime, copies source, `bun run start`
- [ ] Railway config (`railway.json`) or Fly.io config (`fly.toml`) for API
- [ ] Vercel config (`vercel.json`) for web package
- [ ] GitHub Actions `deploy.yml`:
  - On push to `main`: run tests → lint → build → deploy frontend → deploy API → run migrations
  - On PR: run tests + lint only (no deploy)
- [ ] `.env.example` documenting all required environment variables

### 1.11 Developer DX

- [ ] `CLAUDE.md` at repo root (see claude-integration.md §4 for exact content)
- [ ] `packages/api/CLAUDE.md`
- [ ] `packages/web/CLAUDE.md`
- [ ] `.claude/settings.json` with `permissions.allow` for bun commands

---

## Phase 2: Projects + Sections (Weeks 3–4)

**Goal**: Users can create projects, organize content into them, and discuss within sections.

### 2.1 API Routes

- [ ] `GET /api/projects` — list all projects (status filter, ordered by updated_at DESC)
- [ ] `POST /api/projects` — create project; optionally move feed content items into it (`contentItemIds[]`)
- [ ] `GET /api/projects/:slug` — project detail with sections list and member list
- [ ] `PATCH /api/projects/:id` — update title, description, status
- [ ] `DELETE /api/projects/:id` — soft delete (set deleted_at) → broadcast `project:deleted`
- [ ] `POST /api/projects/:id/sections` — create section; auto-creates a `discussions` row for the section
- [ ] `GET /api/projects/:id/sections` — ordered section list
- [ ] `PATCH /api/sections/:id` — rename, update description, reorder
- [ ] `DELETE /api/sections/:id` — delete section; reassign content items to project root (section_id → NULL)
- [ ] `GET /api/discussions/:id/messages` — paginated messages for any discussion (feed, project root, section)
- [ ] `POST /api/discussions/:id/messages` — post to any discussion → broadcast `project:{id}:message:new` or section variant
- [ ] `PATCH /api/content-items/:id` — update: assign/move to project+section, update title/body/status, add/remove tags
- [ ] `POST /api/projects/:id/discussions` — auto-created on project creation (project root discussion)
- [ ] Access control middleware for project routes: check `project_members` for non-owner users

### 2.2 Frontend: Projects

- [ ] `/projects` route — project list:
  - Project cards: title, description snippet, status badge, section count, last activity
  - Status filter tabs (active/paused/archived/completed)
  - "New project" button → create project modal
- [ ] Create project modal:
  - Title (required), description (optional)
  - Optional: add sections upfront (repeating title input)
  - Optional: select feed items to move into new project
- [ ] Project layout (`/projects/:slug/_layout.tsx`):
  - Project header: title (editable in-place), description, status badge
  - Section navigation sidebar / tabs
  - View switcher placeholder (Timeline | Spatial | Categorized | Search)
- [ ] Project dashboard (`/projects/:slug`) — overview: recent activity, section summaries, entry points
- [ ] Project root discussion — messages from all sections interleaved, each labeled with section badge
- [ ] Section view (`/projects/:slug/sections/:id`):
  - Discussion thread (messages)
  - Content items list (timeline view, Phase 2 default)
  - Message input
- [ ] Move content item flow: context menu (right-click / long-press) → "Move to..." → project+section picker dropdown
- [ ] Project status management: status dropdown on project header

### 2.3 Timeline View

- [ ] `TimelineView` component (`src/components/views/TimelineView.tsx`):
  - Chronological list of content items + messages
  - Each item: author avatar, timestamp, content type icon, content preview, section label (if in project)
  - Infinite scroll with lazy loading
  - Filter bar: by content type, by author, by date range, by section
  - Configurable order: newest at bottom (chat-style) or newest at top (feed-style) — stored in Zustand per context
- [ ] View switcher component — shows Timeline active; Spatial/Categorized/Search disabled with tooltip "Coming in Phase 3/5"
- [ ] View preference persisted per context (project slug or 'feed') in Zustand (localStorage-backed)

---

## Phase 3: Canvas + Drawing (Weeks 5–6)

**Goal**: tldraw embedded for spatial views and standalone drawings. Ben's primary drawing experience.
**Prerequisite**: tldraw hobby license acquired.

### 3.1 API Routes

- [ ] `GET /api/content-items/:id/canvas` — returns latest content_version.media_data (tldraw JSON)
- [ ] `POST /api/content-items/:id/canvas` — saves tldraw state as new content_version; accepts optional `change_summary`
- [ ] `GET /api/content-items/:id/versions` — list versions (id, version_number, author, timestamp, change_summary)
- [ ] `POST /api/content-items/:id/versions/:versionId/restore` — creates new version based on old one
- [ ] `POST /api/projects/:id/drawings` — create new drawing content_item (type: 'drawing') → returns content_item with empty initial canvas version

### 3.2 tldraw Integration

- [ ] Install `tldraw` SDK (hobby license)
- [ ] `TldrawEditor` wrapper component (`src/components/canvas/TldrawEditor.tsx`):
  - Loads initial state from `GET /api/content-items/:id/canvas`
  - `onChange` handler with 3-second debounce → `POST /api/content-items/:id/canvas`
  - localStorage draft recovery: on load, compare localStorage draft timestamp with last persisted version, offer "Restore unsaved draft?" if newer
  - `onBlur` / unmount triggers immediate save
  - `usePersistentStore` hook from tldraw SDK for state management
- [ ] Standalone drawing route: `/projects/:slug/documents/:id` (when content_item.type === 'drawing')
- [ ] Version history panel for drawings: list versions with author, timestamp, change_summary; "Restore" button

### 3.3 Spatial View

- [ ] `SpatialView` component (`src/components/views/SpatialView.tsx`):
  - tldraw canvas as the container
  - Content items from the project rendered as custom shapes (basic: card shape with title + type icon)
  - Spatial positions stored per user in content_items.metadata JSONB (`spatialPositions: { userId: { x, y } }`)
  - New items appear at a default "unsorted" zone (top-right) until manually positioned
  - Canvas pan/zoom via tldraw built-in
  - Save positions on shape drag end (debounced, same API as canvas save)
- [ ] Enable Spatial View in view switcher for projects

### 3.4 Document Infrastructure (prepares Phase 4)

- [ ] Document route: `/projects/:slug/documents/:id` (when content_item.type === 'document')
- [ ] `MarkdownViewer` component (`src/components/editor/MarkdownViewer.tsx`) using react-markdown + remark-gfm
- [ ] Mermaid diagram rendering within markdown (mermaid.js)
- [ ] Version history panel for documents (same UI pattern as drawings)

### 3.5 Tablet Optimization

- [ ] Touch-friendly hit targets (min 44px) across all interactive elements
- [ ] Bottom navigation bar for mobile/tablet (Feed, Projects, Capture, Search, Notifications)
- [ ] Swipe gesture: swipe left/right to switch between views within a project

---

## Phase 4: Claude Integration (Weeks 7–8)

**Goal**: Claude participates in discussions, generates documents, and interviews for scaffolding.
**Prerequisite**: Open Decision 1 resolved (recommend API key). `ANTHROPIC_API_KEY` added to server env.

### 4.1 Claude Infrastructure

- [ ] `packages/api/src/lib/claude.ts` — Anthropic SDK wrapper:
  - `invokeForDiscussion(context): Promise<string>` — Sonnet, for @mentions
  - `invokeForDocument(context): Promise<string>` — Opus, for document generation
  - `invokeForResearch(context): Promise<string>` — Opus with web search tool_use
  - `invokeForHousekeeping(context): Promise<object>` — Sonnet, structured JSON output
  - Error handling: API errors, token limit exceeded, rate limits
- [ ] In-process job queue (`packages/api/src/jobs/queue.ts`):
  - `Map<jobId, JobState>` with status tracking
  - `enqueue(type, payload): jobId`
  - `getStatus(jobId): JobStatus`
  - Worker loop processes one job at a time per type
- [ ] Claude system user confirmed seeded in database (from Phase 1 seed)
- [ ] `agent_runs` table: insert row on job start, update on complete/fail

### 4.2 Context Assembly

- [ ] `packages/api/src/lib/context-assembly.ts`:
  - `assembleContext(params: { projectId?, sectionId?, discussionId, userMessage, maxTokens? }): Promise<ClaudeContext>`
  - Layer 1: System prompt (~500 tokens) — Claude's role in CSF Live
  - Layer 2: Recent discussion messages (last 50, or until 30% budget used)
  - Layer 3: Project context (title, description, section list) — if project-scoped
  - Layer 4: Relevant documents (content_items of type 'document', budget-fitted, ordered by updated_at)
  - Token estimation: 1 token ≈ 4 characters heuristic
  - Returns `{ systemPrompt, messages: [{role, content}], estimatedTokens }`

### 4.3 @claude Mention in Discussions

- [ ] Message post handler detects `@claude` in content
- [ ] Enqueues `discussion-response` job immediately
- [ ] "Claude is thinking..." ephemeral indicator sent via WebSocket: `{ type: 'claude:thinking', discussionId }`
- [ ] Job runs: assemble context → Anthropic API (Sonnet) → save message with `source: 'claude'`, `content_type: 'claude-response'`, `author_id: CLAUDE_USER_ID`
- [ ] WebSocket broadcast: `message:new` event → client fetches and renders
- [ ] Claude messages styled distinctly in discussion UI: different background, "Claude" label, avatar

### 4.4 Document Generation

- [ ] `POST /api/claude/generate-document` — accepts `{ projectId, sectionId?, documentType, instructions }`
- [ ] Assembles project context + existing docs → Anthropic API (Opus)
- [ ] Saves as content_item: `type: 'document'`, `source: 'claude'`, `source_detail: 'document-generation'`
- [ ] Document types: `note`, `prd`, `blueprint`, `work-orders`, `research-summary`, `meeting-notes`, `freeform`
- [ ] Notification created for all project members on completion
- [ ] UI: "Generate document" button in project → type selector → instructions input → async (shows progress)

### 4.5 Section Scaffolding Interview

- [ ] `POST /api/claude/scaffold/start` — starts interview for a project+section list
- [ ] `POST /api/claude/scaffold/answer` — user answers question; Claude asks next
- [ ] `POST /api/claude/scaffold/complete` — Claude produces requirements doc per section
- [ ] State: no special state machine — conversation history in `messages` table IS the state
- [ ] UI: scaffolding mode activated from "Create project with Claude" flow

### 4.6 Research Agent

- [ ] `packages/api/src/jobs/research.ts` job:
  - Accepts project context + research topic + user questions
  - Calls Anthropic API (Opus) with `web_search` tool_use
  - Structures output as markdown with citations
  - Saves as content_item: `type: 'research'`, `source: 'agent'`
  - Sends notification on completion
- [ ] "Research this" trigger button in project header
- [ ] `@claude research [topic]` parsed in messages as shorthand trigger

### 4.7 Rich Text Editor (Documents)

- [ ] Install TipTap (`@tiptap/react`, `@tiptap/starter-kit`, markdown extension)
- [ ] `MarkdownEditor` component (`src/components/editor/MarkdownEditor.tsx`):
  - Edit mode: TipTap editor with toolbar (bold, italic, headings, lists, code blocks, links)
  - View mode: react-markdown renderer (same component as Phase 3)
  - Toggle edit/view
  - Auto-save after 2 seconds of inactivity → creates new content_version
  - Explicit save creates version with optional `change_summary` prompt

---

## Phase 5: Search + Notifications + Polish (Weeks 9–10)

**Goal**: Full search, notifications, presence, housekeeping, and frontend polish.

### 5.1 Search API

- [ ] `GET /api/search` — query params: `q`, `type[]`, `authorId`, `projectId`, `sectionId`, `dateFrom`, `dateTo`, `status`, `source`
  - Uses `tsvector` `@@` operator with `to_tsquery`
  - UNION of content_items and messages results
  - Returns ranked results with relevance snippet
  - Respects access control (project membership)
- [ ] `POST /api/search/natural` — accepts `{ query }`, Claude interprets → searches DB → synthesizes answer with citations (Sonnet)

### 5.2 Search UI

- [ ] `/search` route — global search page
- [ ] Search bar (also available in project views as project-scoped search)
- [ ] Results list: title/preview, type icon, project/section breadcrumb, author, date, relevance snippet
- [ ] Filter chips: project, section, content type, author, date range, status, source
- [ ] Natural language search toggle: "Ask Claude" button transforms query into NL search
- [ ] Click result → navigate to it in context (opens project/section/discussion)

### 5.3 Notification System

- [ ] Server-side notification creation in all relevant mutation handlers:
  - New message in your project → notify other members
  - Claude finished document generation → notify trigger user
  - Research agent completed → notify trigger user
  - @mention in discussion → notify mentioned users
  - Weekly digest available → notify all owners
  - Housekeeping suggestions ready → notify all owners
- [ ] `GET /api/notifications` — paginated, unread-first
- [ ] `PATCH /api/notifications/:id/read` — mark read
- [ ] `POST /api/notifications/read-all` — mark all read
- [ ] `notifications:{userId}` WebSocket channel — `notification:new` event → real-time delivery
- [ ] Notification panel UI:
  - Sidebar bell icon with unread count badge
  - Slide-in panel: list with icon, title, body, relative timestamp
  - Click → navigate to `reference_type/reference_id`
  - "Mark all read" button
- [ ] Unread count badges on project cards and section headers

### 5.4 Presence System

- [ ] Client sends heartbeat ping every 30 seconds via WebSocket
- [ ] Server updates `presence.last_heartbeat` on each ping
- [ ] Cron job (or per-request check) marks users offline after 2 min of no heartbeat
- [ ] On route change, client sends `presence:location` event with current path
- [ ] `presence` WebSocket channel: `user:online`, `user:offline`, `user:location` events
- [ ] Sidebar presence indicator: avatar + green dot for online users
- [ ] Within a project: "Ben is also in this project" subtle indicator (if the other person's `current_location` matches)

### 5.5 Housekeeping Agent

- [ ] `packages/api/src/jobs/housekeeping.ts`:
  - Queries: projects inactive 30+ days, feed items unassigned 14+ days, sections with no recent discussion
  - Potential duplicates: content items with similar titles or body (simple similarity check)
  - Claude (Sonnet) produces structured suggestions: merge / archive / assign / consolidate
  - Saved as content_item: `type: 'research'`, `source: 'agent'`, title: "Housekeeping suggestions"
  - Notification created
- [ ] Weekly cron schedule (configurable — default: Monday 9am)
- [ ] Review Mode UI: surfaces stale items grouped by category; each item has triage actions (keep / archive / act)
- [ ] Suggestions panel: read-only list, each suggestion has approve/dismiss action
- [ ] Bulk operations: multi-select items in feed/project → action bar (archive, move, tag)

### 5.6 Weekly Digest

- [ ] `packages/api/src/jobs/digest.ts`:
  - Queries all activity in past 7 days: new content per project, discussion highlights, Claude docs, new projects
  - Claude (Sonnet) produces narrative summary
  - Saved as content_item in feed: `type: 'document'`, title: "Weekly Digest — [date]"
  - Notification sent to both owners
- [ ] Monday 9am cron trigger (configurable)

### 5.7 Categorized View

- [ ] `CategorizedView` component (`src/components/views/CategorizedView.tsx`):
  - Content grouped by type (Ideas, Drawings, Documents, Research, Links, Voice, Photos, Files)
  - Each group: collapsible section header with count
  - Within group: chronological list
  - Group-by selector: type (default), section, author, tag, status
- [ ] Enable Categorized View in view switcher

### 5.8 Mobile Polish

- [ ] Bottom navigation for mobile (Feed, Projects, Capture, Search, Notifications) — shows at <768px
- [ ] Swipe gesture: swipe left/right to switch views within a project
- [ ] Quick Capture: floating action button (FAB) on mobile
- [ ] Touch-optimized hit targets (44px minimum) audit across all components
- [ ] PWA `manifest.json` with app name, icons, theme color, `start_url`, `display: standalone`
- [ ] Service worker registration (basic — enables "Add to Home Screen"; offline capture in Phase 6)

### 5.9 `--add-dir` Context Sync (Minimal Claude Code Integration)

- [ ] `GET /api/claude-context` — generates context files, debounced (max every 5 min):
  - Top-level `CLAUDE.md`: list of projects with descriptions
  - Per-project: `CLAUDE.md` (description, goals, decisions), `recent-discussion.md` (last 50 messages summarized), `key-documents.md` (summaries of active documents)
- [ ] API endpoint writes to a configured output directory on the server filesystem
- [ ] Dev docs: how to mount `~/csf-live-context/` in a Claude Code session with `--add-dir`

---

## Phase 6: Housekeeping + Pipeline Bridge (Weeks 11–12)

**Goal**: System maintains itself and connects to the Software Factory.

### 6.1 Complete Manual Housekeeping

- [ ] Archive content items, sections, projects via PATCH status
- [ ] Merge content items: `POST /api/content-items/:id/merge` — combines body + versions, marks source as merged
- [ ] Soft delete with 30-day recovery: `DELETE /api/content-items/:id` sets deleted_at; `POST /api/content-items/:id/restore` clears it
- [ ] Bulk operations API: `POST /api/bulk` with `{ action, itemIds[], targetProjectId? }`
- [ ] Bulk operations UI: checkboxes in lists + floating action bar

### 6.2 Software Factory Pipeline Integration

- [ ] `POST /api/projects/:id/pipeline/trigger` — assembles full project content → invokes Refinery agent
- [ ] Context assembly for pipeline: all sections, messages, documents, drawings (as summaries), research items
- [ ] PRD document created in project from Refinery output: `type: 'document'`, `document_type: 'prd'`, `source: 'agent'`
- [ ] Subsequent stages (Foundry, Planner) can be triggered similarly → produce blueprint, work-orders documents
- [ ] "Re-run [stage]" action when corresponding document is edited
- [ ] Pipeline status indicator on project dashboard

### 6.3 Full Claude Code Plugin (`csf-live-plugin/`)

- [ ] Plugin structure: `.claude-plugin/plugin.json`, `skills/`, `commands/`, `hooks/`
- [ ] `/csf capture "idea"` — posts to feed or specified project via API
- [ ] `/csf discuss project-slug "message"` — posts to project root discussion
- [ ] `/csf context project-slug` — pulls project CLAUDE.md + recent discussion into session context
- [ ] `/csf status` — shows active projects, unread notifications, recent activity
- [ ] HTTP hooks config: `PostToolUse` → `POST /api/hooks/activity`, `PostCompact` → `POST /api/hooks/session-summary`
- [ ] API endpoints for hooks: log activity as content_item (type: 'idea', source: 'claude-code')

### 6.4 Push Notifications (PWA)

- [ ] Service worker with `push` event handler
- [ ] VAPID key generation + server-side push service
- [ ] `POST /api/notifications/subscribe` — save push subscription
- [ ] Trigger push on high-priority notifications (@mention, agent completion)
- [ ] Notification preference settings UI: per-event toggles

### 6.5 Web Share Target (PWA)

- [ ] Add `share_target` to `manifest.json` — accepts `title`, `text`, `url`
- [ ] `GET /share?title=&text=&url=` route in web app → opens Quick Capture modal pre-filled
- [ ] Content shared this way goes to feed or configured default project

---

## Architecture Notes (Cross-Cutting)

These apply across all phases:

- **TypeScript strict mode** on all packages — no `any` without comment justification
- **All mutations broadcast WebSocket events** — the WS handler's `broadcast()` is called in every route mutation
- **All DB queries via Drizzle** — no raw SQL in route handlers (exceptions: FTS queries can use Drizzle's `sql` template)
- **All API responses typed** against `packages/shared/types.ts` — frontend and backend share the same type contract
- **Access control on every project route** — middleware checks `project_members` table for non-owner users
- **Soft deletes everywhere** — never hard-delete content_items, messages, projects
- **Optimistic UI** — mutations update React Query cache immediately, roll back on error
- **Error tracking** — Sentry configured on both `packages/api` and `packages/web` from Phase 1
- **Tests** — Vitest unit tests for API route handlers; Playwright E2E for critical flows (login, post to feed, create project, @claude mention)
