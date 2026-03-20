# CSF Live — Tech Stack Decision Document

**Version**: 2.0
**Date**: 2026-03-21
**Status**: Final
**Context**: Supersedes Section 23 of `specs/README.md` (originally written for "The Forge")

---

## Table of Contents

1. [Decision Summary](#1-decision-summary)
2. [Architecture Overview](#2-architecture-overview)
3. [Frontend — React Vite SPA](#3-frontend--react-vite-spa)
4. [Backend — Hono on Bun](#4-backend--hono-on-bun)
5. [Database — PlanetScale Postgres](#5-database--planetscale-postgres)
6. [File Storage — Cloudflare R2](#6-file-storage--cloudflare-r2)
7. [Realtime — Bun Native WebSockets](#7-realtime--bun-native-websockets)
8. [Authentication — WorkOS](#8-authentication--workos)
9. [Claude Integration](#9-claude-integration)
10. [Frontend Libraries](#10-frontend-libraries)
11. [Infrastructure and Hosting](#11-infrastructure-and-hosting)
12. [Development Tools](#12-development-tools)
13. [Database Schema Approach](#13-database-schema-approach)
14. [Alternatives Considered](#14-alternatives-considered)
15. [Cost Analysis](#15-cost-analysis)

---

## 1. Decision Summary

The stack was chosen through systematic evaluation against CSF Live's core requirements: a 2-user collaborative workspace with realtime discussions, canvas drawing (tldraw), rich content management, and Claude Code CLI integration. **Vendor independence** was the deciding factor — every component is replaceable without rewriting the application.

### Final Stack

| Layer | Choice | Replaces (from original spec) |
|-------|--------|-------------------------------|
| **Frontend** | React 19 + Vite SPA | unchanged (Vite was original recommendation) |
| **Backend / API** | Hono on Bun | unchanged |
| **Database** | PlanetScale Postgres | Supabase Postgres |
| **ORM** | Drizzle | unchanged |
| **File storage** | Cloudflare R2 | Supabase Storage |
| **Realtime** | Bun native WebSockets | Supabase Realtime |
| **Background jobs** | BullMQ + Redis (or simple in-process queue) | BullMQ + Redis (unchanged) |
| **Authentication** | WorkOS AuthKit | Passphrase-based / Supabase Auth |
| **Canvas/Drawing** | tldraw SDK | unchanged |
| **Rich text** | TipTap or Milkdown | unchanged |

### Why This Stack

Every piece does one thing and can be swapped independently. PlanetScale can be replaced with any Postgres host (Neon, RDS, self-hosted) — the app talks to Postgres via Drizzle, not a proprietary SDK. R2 can be replaced with S3 or any S3-compatible store. Hono runs on Bun, Node, or Deno. No vendor lock-in at any layer.

The trade-off is more wiring upfront versus a batteries-included platform like Convex or Supabase. For a tool intended to be a persistent shared brain, owning the pieces is worth the setup cost.

---

## 2. Architecture Overview

```
┌──────────────────────────────────────────────────────┐
│                  Client (Browser)                     │
│                                                       │
│  React 19 SPA (Vite) — Pages, Components, tldraw     │
│  Zustand (local state) + React Query / SWR (server)  │
│  WorkOS AuthKit (login/signup UI)                     │
│  WebSocket client (native)                            │
└────────┬──────────────┬───────────────┬───────────────┘
         │ HTTPS        │ WebSocket     │ OAuth/JWT
         │              │               │
         ▼              ▼               ▼
┌──────────────────────────────┐  ┌──────────────┐
│    Hono on Bun (API server)  │  │    WorkOS    │
│                              │  │              │
│  REST API routes             │  │  AuthKit     │
│  WebSocket server (native)   │  │  User Mgmt   │
│  Background job runner       │  │  SSO-ready   │
│  Claude CLI spawning         │  └──────────────┘
│                              │
│  ┌────────┐  ┌───────────┐  │
│  │Drizzle │  │ R2 Client │  │
│  │  ORM   │  │ (S3 SDK)  │  │
│  └───┬────┘  └─────┬─────┘  │
│      │             │         │
└──────┼─────────────┼─────────┘
       │             │
       ▼             ▼
┌──────────────┐  ┌──────────────┐
│ PlanetScale  │  │ Cloudflare   │
│ Postgres     │  │ R2           │
│              │  │              │
│ Schema       │  │ Images       │
│ branching    │  │ Voice files  │
│ Connection   │  │ Drawings     │
│ pooling      │  │ Attachments  │
│ PITR         │  │ Zero egress  │
└──────────────┘  └──────────────┘

Hosting:
  Frontend  → Vercel or Cloudflare Pages (static SPA, CDN)
  API       → Railway, Fly.io, or AWS (persistent Bun process)
  Database  → PlanetScale (managed Postgres)
  Storage   → Cloudflare R2 (S3-compatible)
  Auth      → WorkOS (managed)
```

### Data Flow

1. **Reads**: React component fetches via React Query / SWR → Hono API route → Drizzle query → PlanetScale Postgres → JSON response → cache + render
2. **Writes**: Component calls mutation → Hono API route → Drizzle mutation → Postgres → response → React Query invalidation → re-fetch
3. **Realtime**: Client opens WebSocket to Hono → Bun native WebSocket server → broadcasts on data changes (pub/sub in-memory for 2 users)
4. **File uploads**: Client requests presigned URL from Hono → Hono generates R2 presigned URL → Client uploads directly to R2 → confirms to API → metadata saved in Postgres
5. **Background work**: Hono API schedules job (in-process queue or BullMQ) → job runs Claude CLI / transcription / research → writes results to Postgres → broadcasts via WebSocket
6. **Auth**: User logs in via WorkOS AuthKit → JWT returned → all API requests include JWT in Authorization header → Hono middleware validates via WorkOS SDK

---

## 3. Frontend — React Vite SPA

### Why Vite SPA Over Next.js

CSF Live is ~90% interactive client-side code: tldraw canvas, realtime chat, rich text editing, drag-and-drop content management. Server-Side Rendering adds complexity (server/client component boundary, hydration) without meaningful benefit for a private 2-user app.

| Factor | Vite SPA | Next.js |
|--------|----------|---------|
| Mental model | Simple — everything is client-side | Complex — server vs client components |
| tldraw compatibility | Native — tldraw is a client-side React lib | Requires `"use client"` everywhere |
| Build speed | ~1s HMR | Slower (App Router overhead) |
| Bundle size control | Full control | Framework overhead |
| SEO | Irrelevant (private app, auth-gated) | Irrelevant |
| Deployment | Static files → any CDN | Needs Vercel or Node server |

### Routing

React Router v7 or TanStack Router — both support:
- File-based or config-based route definitions
- Nested layouts (sidebar + project + section)
- URL params for project slugs, section IDs, document IDs
- Lazy loading per route

### Routing Structure (Preliminary)

```
src/
├── routes/
│   ├── _layout.tsx               # Root layout (auth check, sidebar, providers)
│   ├── feed.tsx                  # General Feed
│   ├── projects/
│   │   ├── index.tsx             # Project list
│   │   ├── new.tsx               # Create project
│   │   └── $slug/
│   │       ├── _layout.tsx       # Project layout (header, section nav)
│   │       ├── index.tsx         # Project dashboard
│   │       ├── discussion.tsx    # Project root discussion
│   │       ├── canvas.tsx        # Spatial view (tldraw)
│   │       ├── documents/
│   │       │   └── $id.tsx       # Document viewer/editor
│   │       └── sections/
│   │           └── $id.tsx       # Section view
│   ├── search.tsx                # Global search
│   └── settings.tsx              # Settings
```

### Data Fetching

React Query (TanStack Query) or SWR for server state:
- Automatic caching, deduplication, background refetching
- Optimistic updates for mutations
- WebSocket events trigger targeted cache invalidation (not full refetch)
- Stale-while-revalidate pattern for smooth UX

```typescript
// Example: feed messages with realtime updates
const { data: messages } = useQuery({
  queryKey: ['feed', 'messages'],
  queryFn: () => api.feed.getMessages(),
});

// WebSocket listener invalidates specific queries
useWebSocket('feed:new-message', () => {
  queryClient.invalidateQueries({ queryKey: ['feed', 'messages'] });
});
```

---

## 4. Backend — Hono on Bun

### Why Hono + Bun

- **Hono**: ~14KB, zero dependencies, TypeScript-native, runs everywhere (Bun/Node/Deno/edge)
- **Bun**: Fast startup, native TypeScript execution, built-in WebSocket server, built-in SQLite (useful for local dev/caching)
- Combined: a lightweight, fast API server with native WebSocket support and full access to Node.js APIs (child_process for Claude CLI)

### API Structure

```
server/
├── src/
│   ├── index.ts                 # Hono app entry, middleware stack
│   ├── middleware/
│   │   ├── auth.ts              # WorkOS JWT validation
│   │   ├── cors.ts              # CORS configuration
│   │   └── error.ts             # Error handling
│   ├── routes/
│   │   ├── feed.ts              # GET/POST /feed/messages
│   │   ├── projects.ts          # CRUD /projects
│   │   ├── sections.ts          # CRUD /projects/:id/sections
│   │   ├── content.ts           # CRUD /content-items
│   │   ├── messages.ts          # CRUD /discussions/:id/messages
│   │   ├── search.ts            # GET /search
│   │   ├── upload.ts            # POST /upload/presign, confirm
│   │   ├── notifications.ts     # GET /notifications
│   │   └── claude.ts            # POST /claude/invoke
│   ├── ws/
│   │   └── handler.ts           # WebSocket connection management
│   ├── jobs/
│   │   ├── queue.ts             # Job queue (BullMQ or in-process)
│   │   ├── claude.ts            # Claude CLI invocation job
│   │   ├── research.ts          # Research agent job
│   │   ├── transcription.ts     # Voice transcription job
│   │   └── housekeeping.ts      # Cleanup/digest jobs
│   ├── db/
│   │   ├── schema.ts            # Drizzle schema definition
│   │   ├── migrations/          # SQL migrations
│   │   └── index.ts             # Drizzle client
│   └── lib/
│       ├── r2.ts                # R2/S3 client
│       ├── workos.ts            # WorkOS SDK wrapper
│       └── claude.ts            # Claude CLI/API wrapper
```

### WebSocket Server

Bun has native WebSocket support — no additional library needed:

```typescript
// Minimal pub/sub for 2 users
const connections = new Map<string, Set<ServerWebSocket>>();

Bun.serve({
  fetch(req, server) {
    if (server.upgrade(req)) return;
    return app.fetch(req); // Hono handles HTTP
  },
  websocket: {
    open(ws) { /* register connection */ },
    message(ws, msg) { /* handle subscription changes */ },
    close(ws) { /* cleanup */ },
  },
});
```

For 2 users, an in-memory pub/sub is sufficient. No Redis, no external service. When data changes (via API mutation), the server broadcasts to subscribed WebSocket connections.

### Background Jobs

Two options depending on complexity needs:

**Option 1: In-process queue (Phase 1)**
Simple `Map`-based job queue running in the same Bun process. Fine for 2 users, zero infrastructure.

**Option 2: BullMQ + Redis (Phase 4+)**
When Claude integration adds longer-running jobs, add Redis for durable job queuing with retries, progress tracking, and concurrency control.

Start with Option 1, upgrade to Option 2 when needed.

---

## 5. Database — PlanetScale Postgres

### Why PlanetScale

- **Managed Postgres** — no database administration
- **Schema branching** — branch your database schema like git (dev branches get their own DB state)
- **Built-in connection pooling** (PgBouncer) — no separate pooler needed
- **Query Insights** — built-in slow query analysis
- **PITR** — point-in-time recovery for backups
- **Standard Postgres** — no proprietary query language, full SQL, works with any Postgres client/ORM

### Why Not Supabase for DB

Supabase bundles auth + realtime + storage + DB. Since we're using WorkOS (auth), R2 (storage), and native WebSockets (realtime), Supabase's value-add is just the database — and its free tier auto-pauses after 7 days of inactivity. PlanetScale at $5/mo is a reliable, always-on Postgres with better DX (schema branching, connection pooling, query insights).

### Why Not Neon

Neon is a valid alternative (serverless Postgres with branching). PlanetScale was chosen based on the team's initial research. If PlanetScale's pricing or features change, switching to Neon requires only changing the connection string — Drizzle abstracts the Postgres driver.

### Drizzle ORM

TypeScript-first ORM that generates SQL. Key benefits:
- Schema defined in TypeScript, migrations auto-generated
- Type-safe queries with full IDE autocomplete
- Lightweight — no heavy runtime, compiles to SQL
- Works with any Postgres provider

```typescript
// Example schema (Drizzle)
export const projects = pgTable('projects', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  status: text('status', { enum: ['active', 'paused', 'archived', 'completed'] }).default('active'),
  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
```

### Migration Workflow

1. Modify Drizzle schema in TypeScript
2. `drizzle-kit generate` → produces SQL migration
3. On PlanetScale: create a schema branch → apply migration → test → merge to main
4. Production migration happens on merge

### Full-Text Search

Postgres native `tsvector` + GIN indexes (as specified in the original spec, Section 24). No external search service needed for the data volumes of a 2-user app.

---

## 6. File Storage — Cloudflare R2

### Why R2

| | S3 | R2 |
|---|---|---|
| Storage | $0.023/GB | $0.015/GB |
| Egress | **$0.09/GB** | **$0** |
| S3 API compatible | Yes | Yes |

**Zero egress fees.** CSF Live serves images, voice recordings, drawings, sketches, and file attachments. Users browse and review content frequently — reads dominate writes. R2 eliminates the dominant cost vector.

### Integration

R2 is S3 API-compatible. Use the AWS S3 SDK (`@aws-sdk/client-s3`):

```typescript
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const r2 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});
```

### Upload Flow

1. Client requests a presigned upload URL from the API
2. API generates presigned PUT URL via R2/S3 SDK (expires in 15 min)
3. Client uploads directly to R2 (no file data passes through the API server)
4. Client confirms upload to API → API saves file metadata (URL, MIME type, size) in Postgres
5. Serving: files served directly from R2 via public URL or presigned GET URL

### Portability

If R2 is ever replaced, swap the S3Client endpoint to any S3-compatible store (AWS S3, MinIO, Backblaze B2). No application code changes — just environment variables.

---

## 7. Realtime — Bun Native WebSockets

### Why Not a Managed Service

For 2 concurrent users, a managed realtime service (Supabase Realtime, Ably, Pusher) is overkill. Bun's built-in WebSocket server handles this with zero dependencies and zero cost.

### Architecture

```
Client A ──WebSocket──► Bun Server ──WebSocket──► Client B
                           │
                     In-memory pub/sub
                     (Map<channel, Set<ws>>)
```

### Channel Design

| Channel | Purpose | Events |
|---------|---------|--------|
| `feed` | General feed updates | `message:new`, `content:new`, `content:moved` |
| `project:{id}` | Project-level updates | `message:new`, `content:new`, `section:created` |
| `project:{id}:section:{id}` | Section-level updates | `message:new`, `content:updated` |
| `presence` | Online/offline status | `user:online`, `user:offline`, `user:location` |
| `notifications:{userId}` | Per-user notifications | `notification:new`, `notification:read` |

### Event Flow

1. Client A posts a message → API mutation saves to Postgres
2. API mutation succeeds → server publishes event to relevant channel(s)
3. Server broadcasts to all WebSocket connections subscribed to that channel
4. Client B receives event → React Query invalidates relevant cache → UI updates

### Scaling Considerations

This architecture works for 2-10 concurrent users. If CSF Live ever needs to scale beyond that:
- Add Redis pub/sub for cross-process communication (multiple API server instances)
- Or switch to a managed service (Ably, Pusher)
- The WebSocket event contract stays the same — only the transport layer changes

---

## 8. Authentication — WorkOS

### Why WorkOS

- Enterprise-grade auth without building it
- Email + password, Magic Link, Social OAuth (Google, GitHub)
- SSO-ready for future Tier 2 collaborators
- User management built-in
- Free for up to 1M monthly active users
- Clean SDK for both frontend (AuthKit) and backend (JWT validation)

### Integration Architecture

```
Browser → WorkOS AuthKit (hosted login page or embedded component)
       → OAuth flow completes → JWT returned to client
       → Client stores JWT (httpOnly cookie or localStorage)
       → All API requests include JWT in Authorization header
       → Hono middleware validates JWT via WorkOS SDK
       → User identity available in all route handlers
```

### Hono Middleware

```typescript
import { WorkOS } from '@workos-inc/node';

const workos = new WorkOS(process.env.WORKOS_API_KEY);

const authMiddleware = createMiddleware(async (c, next) => {
  const token = c.req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return c.json({ error: 'Unauthorized' }, 401);

  const { user } = await workos.userManagement.authenticateWithSessionToken({ sessionToken: token });
  c.set('user', user);
  await next();
});
```

### Access Control

For Phase 1 (2 platform owners):
- All authenticated users are owners — simple role check
- Every route handler has access to `c.get('user')` for identity

For Phase 2+ (Tier 2 collaborators):
- Project membership table in Postgres
- Middleware or per-route check: does this user have access to this project?
- No complex RBAC needed — just owner vs collaborator per project

---

## 9. Claude Integration

### Architecture

Claude integration runs through the Hono API server, which has full access to the filesystem and can spawn child processes — no restrictions.

| Method | Implementation | Use Case |
|--------|---------------|----------|
| **Claude Code CLI** | `child_process.spawn('claude', ['-p', prompt])` on the API server | Discussion @claude mentions, document generation, scaffolding interviews |
| **Anthropic API** | Direct HTTP calls from Hono route/job | Agent tasks, research, structured output |
| **Claude Code SDK** | `@anthropic-ai/claude-code` TS SDK | Programmatic CLI invocation with streaming |

### Why This Works (and Why Convex/Vercel Couldn't)

The API server is a persistent Bun process running on a real machine (Railway/Fly.io/AWS). It has:
- **Filesystem access** — Claude Code CLI stores auth state in `~/.claude/`, which persists
- **No execution timeout** — jobs can run for minutes
- **Child process spawning** — unrestricted, native OS process management
- **Max subscription support** — CLI authenticates with the user's Max plan, stored on the server

This was the primary reason serverless platforms (Vercel, Convex actions) were problematic for Claude integration.

### Invocation Flow

```
User posts "@claude summarize this project"
  → API: save message to Postgres
  → API: enqueue Claude job
  → Job: assemble context (project description, recent messages, relevant content)
  → Job: spawn Claude Code CLI with assembled context as prompt
  → Job: capture output, save as message in Postgres with source='claude'
  → API: broadcast 'message:new' event via WebSocket
  → Client: receives event, React Query refetches, Claude's response appears
```

### Context Assembly

When Claude is invoked, the job assembles context from Postgres:

```typescript
async function assembleContext(projectId: string, sectionId?: string) {
  const project = await db.query.projects.findFirst({ where: eq(projects.id, projectId) });
  const sections = await db.query.sections.findMany({ where: eq(sections.projectId, projectId) });
  const recentMessages = await db.query.messages.findMany({
    where: eq(messages.discussionId, discussionId),
    orderBy: desc(messages.createdAt),
    limit: 50,
  });
  const documents = await db.query.contentItems.findMany({
    where: and(eq(contentItems.projectId, projectId), eq(contentItems.type, 'document')),
  });

  return formatAsPrompt({ project, sections, recentMessages, documents });
}
```

### Timeout Considerations

| Task | Typical Duration | Constraint | Solution |
|------|-----------------|-----------|----------|
| Discussion response | 5-30s | None (persistent process) | Direct invocation |
| Document generation | 30s-2min | None | Background job |
| Research agent | 2-5 min | None | Background job |
| Heavy research | 5-10 min | None | Background job with progress updates via WebSocket |
| Scaffolding interview | 10-30s per question | None | Sequential invocations |

No timeouts to worry about. The persistent server process is the core advantage of this architecture for Claude integration.

---

## 10. Frontend Libraries

### Confirmed

| Component | Choice | Rationale |
|-----------|--------|-----------|
| **Styling** | Tailwind CSS 4 | Utility-first, fast iteration, responsive built-in |
| **UI primitives** | Radix UI (unstyled) | Accessible, composable, style-agnostic |
| **Canvas/Drawing** | tldraw SDK (hobby license) | Best-in-class embeddable canvas for React |
| **Rich text editing** | TipTap or Milkdown | Markdown document editing in-browser |
| **State management (server)** | React Query (TanStack Query) | Caching, deduplication, cache invalidation on WebSocket events |
| **State management (local)** | Zustand | Lightweight, TypeScript-native, for UI state (view prefs, canvas viewport) |
| **Routing** | React Router v7 or TanStack Router | File-based routing, nested layouts |
| **Markdown rendering** | react-markdown + remark plugins | Rendering document content |
| **Mermaid diagrams** | mermaid.js | Structured diagrams Claude can generate |
| **Icons** | Lucide React | Clean, consistent, open-source |

### State Management Strategy

Two layers:

1. **Server state** (React Query): all data from the API — messages, projects, content items, notifications. Cached, deduplicated, invalidated via WebSocket events.
2. **Local UI state** (Zustand or useState): view preferences, modal state, canvas viewport, form drafts. Never persisted to the server unless explicitly saved.

---

## 11. Infrastructure and Hosting

### Production

| Component | Service | Why |
|-----------|---------|-----|
| **Frontend (SPA)** | Vercel or Cloudflare Pages | Static file hosting with CDN. Free tier. Instant deploys from git push. |
| **API server** | Railway or Fly.io | Persistent Bun process. Docker container deployment. ~$5/mo. Claude CLI runs here. |
| **Database** | PlanetScale Postgres | Managed, schema branching, connection pooling. $5/mo (single node). |
| **File storage** | Cloudflare R2 | S3-compatible, zero egress. Free tier: 10 GB storage, 10M reads/mo. |
| **Auth** | WorkOS | Managed. Free up to 1M MAU. |
| **DNS** | Cloudflare | Free tier. SSL, caching, DDoS protection. |
| **Error tracking** | Sentry | Free tier. |

### Why Railway or Fly.io (Not AWS Directly)

For a 2-user app, AWS is overkill operationally (VPC, security groups, IAM, ECS/EC2 setup). Railway and Fly.io provide:
- Docker container deployment from Dockerfile
- Automatic SSL
- Simple scaling (add replicas if ever needed)
- Built-in logging
- $5-10/mo for a small container

If the app grows or needs more control, migrating to AWS ECS/Fargate is straightforward — it's just a Docker container.

### Deployment Pipeline

```
git push → GitHub Actions CI
  → Run tests (Vitest + Playwright)
  → Lint (Biome)
  → Build frontend (Vite) → Deploy to Vercel/CF Pages
  → Build API (Bun) → Deploy to Railway/Fly.io
  → Run Drizzle migrations against PlanetScale (if schema changed)
```

### Preview Environments

- Frontend: Vercel/CF Pages preview deployments (automatic per PR)
- API: Railway preview environments or feature branch deployment
- Database: PlanetScale schema branches for migration testing
- Each PR can be tested end-to-end with isolated infrastructure

---

## 12. Development Tools

| Tool | Choice | Rationale |
|------|--------|-----------|
| **Monorepo** | Bun workspaces | Frontend + API in one repo, shared types |
| **Code quality** | Biome | Linting + formatting, replaces ESLint + Prettier |
| **Testing (unit)** | Vitest | Fast, TypeScript-native |
| **Testing (E2E)** | Playwright | Cross-browser, reliable |
| **Testing (API)** | Vitest + supertest | API route testing |
| **CI/CD** | GitHub Actions | Free for the repo size |
| **Version control** | Git + GitHub | Standard |

### Project Structure

```
csf-live/
├── packages/
│   ├── web/                      # React Vite SPA
│   │   ├── src/
│   │   │   ├── routes/           # Page components (see Section 3)
│   │   │   ├── components/       # React components
│   │   │   │   ├── ui/           # Radix-based primitives
│   │   │   │   ├── feed/
│   │   │   │   ├── projects/
│   │   │   │   ├── canvas/
│   │   │   │   ├── editor/
│   │   │   │   └── shared/
│   │   │   ├── hooks/            # Custom React hooks
│   │   │   ├── lib/              # Client utilities
│   │   │   │   ├── api.ts        # API client (fetch wrapper)
│   │   │   │   ├── ws.ts         # WebSocket client
│   │   │   │   └── auth.ts       # WorkOS client helpers
│   │   │   └── main.tsx          # App entry point
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   └── tailwind.config.ts
│   │
│   ├── api/                      # Hono on Bun API server
│   │   ├── src/
│   │   │   ├── index.ts          # Hono app entry
│   │   │   ├── middleware/       # Auth, CORS, error handling
│   │   │   ├── routes/           # API route handlers
│   │   │   ├── ws/               # WebSocket handler
│   │   │   ├── jobs/             # Background job definitions
│   │   │   ├── db/
│   │   │   │   ├── schema.ts     # Drizzle schema
│   │   │   │   ├── migrations/   # SQL migrations
│   │   │   │   └── index.ts      # DB client
│   │   │   └── lib/              # Server utilities (R2, WorkOS, Claude)
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   └── shared/                   # Shared types and constants
│       ├── types.ts              # API request/response types
│       └── constants.ts          # Shared enums, config
│
├── specs/                        # Product and technical specs
├── biome.json
├── package.json                  # Root workspace config
└── bun.lockb
```

### Shared Types

The `shared` package ensures API contracts are type-safe across frontend and backend:

```typescript
// packages/shared/types.ts
export interface Project {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  status: 'active' | 'paused' | 'archived' | 'completed';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectRequest {
  title: string;
  description?: string;
}

// Used by both Hono route handlers and React Query hooks
```

---

## 13. Database Schema Approach

The database schema follows the guidance in `specs/README.md` Section 24, implemented via Drizzle ORM against PlanetScale Postgres.

### Core Tables

All tables follow these conventions:
- UUID primary keys (`gen_random_uuid()`)
- `created_at` and `updated_at` timestamps
- Soft deletes via nullable `deleted_at` where appropriate
- JSONB columns for flexible metadata
- Indexes on all foreign keys and commonly filtered columns

### Key Tables (Drizzle Schema)

```typescript
// users, projects, project_members, sections,
// content_items, content_versions, tags, content_item_tags,
// discussions, messages, notifications, agent_runs, presence
```

Full schema definition will be implemented from the spec's Section 24 guidance using Drizzle's `pgTable` API. The relational model maps directly to Postgres — no compromises needed (unlike document databases that would require denormalization).

### Full-Text Search

Postgres native `tsvector` with GIN indexes as specified in the original spec. Triggers auto-update search vectors on content_items and messages tables.

### Migration Strategy

1. Define schema in `packages/api/src/db/schema.ts`
2. Generate migrations via `drizzle-kit generate`
3. Test on PlanetScale branch
4. Merge branch to apply to production

---

## 14. Alternatives Considered

### Option A: Original Spec (React Vite SPA + Hono + Supabase)

| Aspect | Assessment |
|--------|-----------|
| **Architecture** | Vite SPA on Vercel/CF Pages + Hono API on Railway/Fly.io + Supabase (DB + Realtime + Storage + Auth) |
| **Pros** | Supabase bundles DB + realtime + storage + auth. Generous free tier. Less initial wiring. |
| **Cons** | Supabase free tier auto-pauses after 7 days inactivity. Using WorkOS for auth makes Supabase's auth redundant. Using native WebSockets makes Supabase Realtime redundant. Paying for Supabase Pro ($25/mo) just for the database is expensive vs PlanetScale ($5/mo). |
| **Verdict** | Once auth and realtime moved to WorkOS and native WebSockets, Supabase's value proposition collapsed to just "managed Postgres" — PlanetScale does that better and cheaper. |

### Option B: Next.js on Vercel + Supabase

| Aspect | Assessment |
|--------|-----------|
| **Architecture** | Next.js on Vercel (API routes + frontend) + Supabase (DB + Realtime + Storage) |
| **Pros** | Single codebase and deployment. Server Components for initial data loading. |
| **Cons** | Vercel serverless timeouts (60s Pro) block Claude CLI sessions. No persistent process for background jobs. 90% client-side app doesn't benefit from Server Components. |
| **Verdict** | Serverless timeout is a hard blocker for Claude CLI integration. |

### Option C: Next.js on AWS Instance + Supabase

| Aspect | Assessment |
|--------|-----------|
| **Architecture** | Next.js on EC2/ECS (persistent process) + Supabase (DB + Realtime + Storage) |
| **Pros** | Single codebase. Persistent process handles everything. No timeout constraints. |
| **Cons** | AWS ops overhead for a 2-user app. Next.js framework weight for an app that barely uses SSR. |
| **Verdict** | Viable but over-engineered. Hono on Bun is lighter and simpler. |

### Option E: Next.js on Vercel + Convex + WorkOS

| Aspect | Assessment |
|--------|-----------|
| **Architecture** | Next.js on Vercel (frontend) + Convex (backend + DB + realtime + storage + jobs) + WorkOS (auth) |
| **Pros** | Three services total. Zero infrastructure management. Automatic realtime. End-to-end TypeScript type safety. Free at 2-user scale. Native WorkOS integration. |
| **Cons** | **Vendor lock-in** — Convex is closed-source, no self-hosting option. Entire backend on a single proprietary platform. Document database limitations (no JOINs, no aggregates). Bandwidth risk with large tldraw canvases (aggressive cache invalidation). |
| **Verdict** | Excellent DX but unacceptable vendor risk for a tool meant to be a persistent shared brain. If Convex changes pricing, goes down, or shuts down, the entire backend must be rewritten. |

### Supabase Free Tier (Reference)

| Resource | Limit |
|----------|-------|
| Database | 500 MB |
| File storage | 1 GB |
| Bandwidth | 5 GB egress |
| Realtime connections | 200 concurrent |
| Realtime messages | 2M/month |
| Auth MAU | 50,000 |
| Edge functions | 500K invocations |
| Projects | 2 active |
| **Catches** | Auto-pause after 7 days inactivity. No backups. Read-only at 500 MB. |

### Convex Free Tier (Reference)

| Resource | Limit |
|----------|-------|
| Function calls | 1M/month |
| Database storage | 0.5 GB |
| File storage | 1 GB |
| Team members | 6 |
| Deployments | 40 |
| **Catches** | Closed source. No self-hosting. Bandwidth can spike with reactive queries (reported 600 GB/mo on 5 MB DB). No offline dev. |

---

## 15. Cost Analysis

### Phase 1 (Development + Launch)

| Service | Tier | Monthly Cost |
|---------|------|-------------|
| Vercel / CF Pages | Free | $0 |
| Railway / Fly.io | Starter | ~$5/mo |
| PlanetScale Postgres | Single Node | $5/mo |
| Cloudflare R2 | Free tier (10 GB) | $0 |
| WorkOS | Free (< 1M MAU) | $0 |
| Cloudflare DNS | Free | $0 |
| Sentry | Free | $0 |
| Domain | Annual | ~$1/mo |
| **Total** | | **~$11/mo** |

### Phase 4+ (Claude Integration Active)

| Service | Tier | Monthly Cost |
|---------|------|-------------|
| All above | — | ~$11/mo |
| Anthropic API (or Max subscription) | Pay-per-use | ~$5-20/mo |
| Whisper API / Deepgram | Pay-per-use | ~$1-5/mo |
| **Total** | | **~$17-36/mo** |

### Comparison with Alternatives

| Stack | Monthly Cost | Vendor Lock-in | Wiring Effort |
|-------|-------------|----------------|---------------|
| **Option D (selected)** | ~$11/mo | None | Medium |
| Option A (Hono + Supabase) | ~$5/mo (free tier) | Low (Supabase) | Medium |
| Option E (Convex) | ~$0/mo (free tier) | **High** | Low |
| Option C (Next.js + AWS) | ~$15-25/mo | Low | High |

Option D costs slightly more than free-tier options but buys complete vendor independence and a standard Postgres database with full SQL capabilities.

---

## End of Tech Stack Document

This document should be used alongside `specs/README.md` (product specification) for implementation planning. The product spec's Section 23 (Tech Stack) and Section 24 (Database Schema) should be read with the understanding that this document supersedes those technology choices while preserving all product requirements.

### Key Architectural Principles

1. **Every component is replaceable.** PlanetScale → any Postgres. R2 → any S3. Railway → any Docker host. WorkOS → any OAuth provider.
2. **Standard protocols only.** Postgres SQL, S3 API, WebSocket, JWT. No proprietary query languages or SDKs that can't be swapped.
3. **Persistent server is non-negotiable.** Claude Code CLI integration requires filesystem access, child process spawning, and no execution timeouts. This rules out serverless-only architectures.
4. **Complexity is deferred, not designed away.** Start with in-process job queue, upgrade to BullMQ when needed. Start with in-memory pub/sub, add Redis when scaling demands it.
