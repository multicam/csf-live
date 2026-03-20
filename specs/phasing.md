# CSF Live — Phasing Strategy

**Source**: Section 26 of original spec
**Related**: All spec files. [Tech Stack](techstack-study.md) for implementation details.

> **Note**: Phase descriptions updated to reflect current stack decisions (WorkOS auth, PlanetScale, Hono/Bun, R2, native WebSockets). Original spec referenced Supabase throughout.

---

## Phase 1: Foundation + Feed (Weeks 1-2)

**Goal**: Two people can log in, see a shared feed, and post content to it.

- PlanetScale Postgres setup + Drizzle schema (users, content_items, messages, discussions)
- Hono API server on Bun with WorkOS auth middleware
- Frontend: React Vite SPA with login (WorkOS AuthKit), sidebar, feed view, basic message posting
- WebSocket server for real-time feed updates
- Basic responsive layout (desktop + mobile)
- Text, image upload (R2), and link sharing in feed
- Deployment: frontend to Vercel/CF Pages, API to Railway/Fly.io

**Spec files**: [Product Overview](product-overview.md), [Feed](feed.md), [Discussions](discussions.md), [Data Model](data-model.md)

---

## Phase 2: Projects + Sections (Weeks 3-4)

**Goal**: Users can create projects, organize content into them, and discuss within sections.

- Database: projects, sections, project_members tables
- API: project CRUD, section CRUD, content assignment
- Frontend: project list, project dashboard, section navigation
- Move content from feed to projects
- Discussion per section, project root view showing all sections
- View switcher: timeline view (default)

**Spec files**: [Projects](projects.md), [Views](views.md), [Content Model](content.md)

---

## Phase 3: Canvas + Drawing (Weeks 5-6)

**Goal**: tldraw embedded for spatial views and standalone drawings.

- tldraw SDK integration (hobby license)
- Spatial view for projects (content items as shapes on canvas)
- Standalone drawing creation and editing
- Drawing versioning (tldraw JSON stored as content versions)
- Photo/sketch upload for hand-drawn content
- Tablet/stylus optimization

**Spec files**: [Canvas](canvas.md), [Views](views.md)

---

## Phase 4: Claude Integration (Weeks 7-8)

**Goal**: Claude participates in discussions, generates documents, and interviews for scaffolding.

- Anthropic API integration from Hono (API key approach — see [Claude Integration](claude-integration.md#9-open-decisions))
- @claude mention in discussions with context assembly
- Document generation (PRD, summaries)
- Section scaffolding with Claude interview
- Background job queue for longer-running Claude tasks
- Claude response streaming (or complete-response with thinking indicator)

**Spec files**: [Claude Integration](claude-integration.md)

---

## Phase 5: Search + Notifications + Polish (Weeks 9-10)

**Goal**: Full search, notifications, and frontend polish.

- Full-text search (Postgres tsvector)
- Natural language search (Claude-powered)
- Filter and faceted search UI
- Notification system (in-app)
- Push notifications (PWA setup)
- Presence indicators (online/offline, current location)
- Quick capture refinement (voice recording, camera access)
- Categorized view
- Mobile experience polish

**Spec files**: [Search](search.md), [Notifications](notifications.md), [Feed — Quick Capture](feed.md#quick-capture), [Design](design.md)

---

## Phase 6: Housekeeping + Pipeline Bridge (Weeks 11-12)

**Goal**: The system maintains itself and connects to the Software Factory.

- Archive/merge/delete operations with bulk support
- Review Mode (surface stale content)
- AI-assisted housekeeping suggestions
- Weekly digest generation
- Software Factory pipeline trigger (Run Refinery from a project)
- Pipeline documents flowing back into projects
- Claude Code plugin (`csf-live`) for terminal integration
- HTTP hooks integration
- `--add-dir` context sync service

**Spec files**: [Housekeeping](housekeeping.md), [Claude Integration — Plugin](claude-integration.md#8-claude-code-plugin-csf-live)
