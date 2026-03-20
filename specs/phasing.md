# CSF Live — Phasing Strategy

**Version**: 2.0
**Date**: 2026-03-21
**Related**: All spec files. [Layout](layout.md), [Tech Stack](techstack-study.md), [SDD](sdd.md)
**Wireframe**: [tldraw wireframe](https://www.tldraw.com/f/wzJnSeYy6Ndbua3N3Ui9T?d=v15.-219.2166.2399.page) | Export: `specs/CSF-Live-V1.tldr`

---

## Development Approach

Three tiers, each building on the last. Every feature follows [Scenario-Driven Development](sdd.md):

1. Write Gherkin scenarios (`.feature` files)
2. Implement against mock data or real backend
3. Validate via Claude Code + devtools-mcp
4. Write Vitest unit tests after validation
5. Commit: scenario + implementation + tests

A **comprehensive mock dataset** is generated at the start of Phase 1 and evolves with each phase.

---

## Phase 1: Frontend (Mock Data)

**Goal**: Complete UI with all views and interactions working against a static mock dataset. No backend, no server, no database.

### Mock Dataset

Generate a large, realistic dataset covering all content types and states:

- **3 users**: JM (owner), Ben (owner), Claude (system — for AI-authored content and responses)
- **4 projects**: active, active, paused, archived — with descriptions, slugs
- **8 sections** across projects — with descriptions, ordering
- **60+ content items** across all 9 types (idea, drawing, sketch, document, link, voice, photo, research, file)
- **120+ messages** across feed discussion + project/section discussions — including Claude responses
- **15+ tags** with cross-project usage
- **Version history** on 5 documents and 2 drawings
- **10+ notifications** (mix of read/unread, different types)
- **Presence state**: JM as online on the current page, Ben as online in a specific project (static, does not update during session)
- **1 tldraw canvas**: minimal valid tldraw document with a few shapes (text label, rectangle, arrow) — not a blank canvas
- **Discussions**: 1 feed discussion (`context_type='feed'`, `context_id=NULL`) with a well-known ID used throughout mock data; 1 discussion per project (`context_type='project'`); 1 discussion per section (`context_type='section'`)
- **Feed content**: mix of messages and unassigned content items interleaved chronologically

Dataset lives in `packages/web/src/mocks/` as typed TypeScript objects matching the shared types.

### Mock Mutations

The mock API layer uses an in-memory Zustand store so that writes persist for the duration of the browser session. Posting a message, moving content, and creating a project all update the store and are reflected immediately in the UI — without a real backend.

Pattern for mock mutations:

```typescript
// packages/web/src/mocks/store.ts
import { create } from 'zustand';
import { initialMockData } from './data';

export const useMockStore = create((set, get) => ({
  ...initialMockData,

  postMessage: (discussionId: string, content: string, authorId: string) => {
    const newMessage = {
      id: crypto.randomUUID(),
      discussionId,
      content,
      authorId,
      createdAt: new Date().toISOString(),
    };
    set((state) => ({ messages: [...state.messages, newMessage] }));
    return newMessage;
  },

  moveContentItem: (itemId: string, projectId: string | null) => {
    set((state) => ({
      contentItems: state.contentItems.map((item) =>
        item.id === itemId ? { ...item, projectId } : item
      ),
    }));
  },
}));
```

The `mockApi` module reads from and writes to this store. Phase 2 backend integration replaces only the `mockApi` implementation — no component changes required.

### Tier 1 Constraints (Mock Layer)

- **Client-side search**: implemented via [minisearch](https://github.com/lucasc/minisearch) or [fuse.js](https://fusejs.io/) against mock data in the Zustand store. No server required.
- **Voice / photo capture**: creates a local blob URL (session only). The URL is not persisted and disappears on page reload. Full upload to R2 is Phase 2.
- **Link previews**: pre-populated in mock data. New links posted during a session show as plain URL — no live metadata fetch.
- **Realtime delivery to other user**: Tier 2 only. Requires WebSocket infrastructure. In Tier 1, the second user's view is static mock data.
- **Version restore**: read-only in Tier 1. Users can view old versions but clicking "Restore" is a no-op (or shows a "coming in Phase 2" hint). Creating a new version from a restore requires the real backend.
- **Spatial positions**: JM-only in Tier 1. There is no per-user spatial state — all users see the same canvas positions. Per-user layout is Phase 2+.

### Frontend Deliverables

| Feature | Scenarios | Spec |
|---------|-----------|------|
| **Canvas scratchpad (`/`)** | Full-screen tldraw, save/save-and-close to feed, project+feed nav nodes | [Canvas](canvas.md), [Layout](layout.md) |
| **3-column feed (`/feed`)** | Projects column, feed column, detail column, resizable, responsive | [Layout](layout.md), [Feed](feed.md), [Design](design.md) |
| **General Feed** | View messages + content items, post message, scroll history | [Feed](feed.md), [Discussions](discussions.md) |
| **Compose input (= Quick Capture)** | Text posting, enhanced mode with voice/camera/file/targeting | [Feed](feed.md#quick-capture), [Layout](layout.md#compose-input) |
| **Project list** | View projects, status indicators, create project | [Projects](projects.md) |
| **Project dashboard** | Title, sections, activity summary, entry points | [Projects](projects.md) |
| **Section navigation** | Section list, section discussion, root view with labels | [Projects](projects.md) |
| **Content items** | Render all 9 types, content cards, metadata display | [Content](content.md) |
| **Content fluidity** | Move to project, copy, drag-and-drop (desktop) | [Content](content.md#content-fluidity) |
| **Timeline mode (list panel)** | Chronological list, filters, infinite scroll | [Views](views.md) |
| **Drawing in Detail column** | tldraw editor for `drawing` content items in column 3, create/edit/version drawings | [Canvas](canvas.md), [Layout](layout.md) |
| **Categorized mode (list panel)** | Group by type, collapsible sections, counts | [Views](views.md) |
| **Search UI** | Search bar, filter chips, result list (mock results) | [Search](search.md) |
| **Document viewer/editor** | Markdown rendering, TipTap editing, version history | [Content](content.md#documents) |
| **Standalone drawing** | tldraw full canvas, save, version list | [Canvas](canvas.md) |
| **Notification panel** | App Menu → notifications in workspace panel, unread count | [Notifications](notifications.md) |
| **Presence indicators** | Online/offline in App Menu, canvas-edge avatar for "Ben is in this project" | [Notifications](notifications.md#presence-and-awareness) |
| **Responsive layouts** | Mobile (one panel at a time, swipe), tablet (both panels, touch), desktop (resizable panels, keyboard shortcuts) | [Layout](layout.md), [Design](design.md) |
| **Dark mode** | Full dark mode via Tailwind `dark:` variant | [Design](design.md) |

### Data Fetching Pattern

Even with mock data, use React Query hooks with the same signatures as the real API:

```typescript
// packages/web/src/hooks/useMessages.ts
export function useMessages(discussionId: string) {
  return useQuery({
    queryKey: ['messages', discussionId],
    queryFn: () => mockApi.getMessages(discussionId), // → swap to real API in Phase 2
  });
}
```

This ensures Phase 2 backend integration is a `queryFn` swap, not a component rewrite.

### Dev Tools Setup

- **react-grab**: `npx -y grab@latest init` — dev-only, for Claude Code component inspection
- **devtools-mcp**: Already in Claude Code's MCP config — for browser-based scenario validation
- **Vite dev server**: `bun dev` — HMR for frontend development

---

## Phase 2: Backend + Infrastructure

**Goal**: Real database, API server, file storage, auth, realtime. All Phase 1 UI now connected to real data.

### Infrastructure Setup

| Component | Action |
|-----------|--------|
| **PlanetScale** | Create Postgres instance, configure connection |
| **Drizzle** | Define schema from [data-model.md](data-model.md), generate + run migrations |
| **Hono on Bun** | API server with middleware (auth, CORS, error handling) |
| **WorkOS** | Configure AuthKit, JWT validation middleware |
| **Cloudflare R2** | Create bucket, configure presigned URL flow |
| **WebSockets** | Bun native WebSocket server, channel pub/sub |
| **Deployment** | Frontend → Vercel/CF Pages, API → Railway/Fly.io |

### Backend Deliverables

| Feature | Scenarios | Spec |
|---------|-----------|------|
| **Auth flow** | Login via WorkOS, session persistence, JWT validation | [Product Overview](product-overview.md#authentication) |
| **Feed API** | GET messages + content items (UNION query), POST message | [Feed](feed.md), [Data Model](data-model.md#feed-data-model) |
| **Projects API** | CRUD projects, sections, project members | [Projects](projects.md), [Data Model](data-model.md) |
| **Content API** | CRUD content items, move/copy between projects | [Content](content.md) |
| **Discussion API** | CRUD messages, discussion contexts (feed/project/section) | [Discussions](discussions.md) |
| **File upload** | Presigned R2 URLs, upload confirmation, metadata storage | [Tech Stack](techstack-study.md#6-file-storage--cloudflare-r2) |
| **Realtime** | WebSocket broadcast on mutations, presence heartbeat | [Tech Stack](techstack-study.md#7-realtime--bun-native-websockets) |
| **Search** | Postgres FTS (tsvector + GIN), filter API | [Search](search.md), [Data Model](data-model.md#full-text-search) |
| **Notifications** | Create on events, mark read, list per user | [Notifications](notifications.md) |
| **Tags** | CRUD tags, tag content items, cross-project queries | [Content](content.md#tags) |
| **Versioning** | Content versions, document version history, restore | [Content](content.md#versioning) |
| **Seed data** | Migrate mock dataset to real DB seed script | [Data Model](data-model.md) |

### Frontend Integration

- Swap `mockApi` → real `fetch` calls in React Query hooks
- Connect WebSocket client → trigger cache invalidation on events
- Wire WorkOS AuthKit login flow
- Wire R2 presigned URL upload flow
- Voice recording → upload to R2 (transcription deferred to Phase 3)

---

## Phase 3: AI Integration

**Goal**: Claude participates in discussions, generates documents, runs research agents, performs housekeeping.

### AI Deliverables

| Feature | Scenarios | Spec |
|---------|-----------|------|
| **@claude in discussions** | User mentions Claude, context assembled, response appears | [Claude Integration](claude-integration.md#3-production-integration) |
| **Document generation** | Claude generates PRD/summary, saved as versioned content item | [Claude Integration](claude-integration.md#7-agent-patterns) |
| **Section scaffolding** | Claude interviews user section-by-section | [Claude Integration](claude-integration.md#7-agent-patterns) |
| **Research agent** | Background research task, results saved, notification sent | [Claude Integration](claude-integration.md#7-agent-patterns) |
| **Natural language search** | Conversational query → Claude synthesizes answer | [Search](search.md), [Claude Integration](claude-integration.md) |
| **Housekeeping agent** | Suggest merges, archives, cleanups — user approves | [Housekeeping](housekeeping.md) |
| **Weekly digest** | Scheduled summary of activity across projects | [Claude Integration](claude-integration.md#7-agent-patterns) |
| **Voice transcription** | Upload voice → Whisper/Deepgram → transcription in metadata | [Feed](feed.md#post-capture) |
| **Review Mode** | Surface stale projects, unassigned feed items, inactive sections | [Housekeeping](housekeeping.md) |
| **Software Factory bridge** | "Run Refinery" on a project → PRD generated | [Housekeeping](housekeeping.md#software-factory-pipeline-integration) |
| **Claude Code plugin** | `/csf` commands, hooks, `--add-dir` context sync | [Claude Integration](claude-integration.md#8-claude-code-plugin-csf-live) |
| **Push notifications (PWA)** | Service worker, push for high-priority events | [Notifications](notifications.md) |
| **Mobile polish** | Voice capture, camera, share target | [Product Overview](product-overview.md#progressive-web-app-phase-2) |

### Background Job Infrastructure

- In-process job queue for Phase 3 start
- Upgrade to BullMQ + Redis if job volume or durability demands it
- Job types: Claude invocation, research, transcription, digest generation, housekeeping

### Context Assembly

Implement the context assembly system from [Claude Integration — Context Assembly](claude-integration.md#5-context-assembly): layer-based context building with token budget management.
