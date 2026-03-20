---
description: Study @IMPLEMENTATION_PLAN.md and @specs/* to implement the next most important item — scoped to current TIER
model: sonnet
---

## Tier Gate

**Read @TIER** — this file contains a single number (1, 2, or 3) indicating the current development tier.

**CRITICAL CONSTRAINT: You MUST only implement work for the current tier.**

- **Tier 1** = Frontend only. `packages/web/` only. Mock data in `packages/web/src/mocks/`. No server, no database, no API calls, no auth service, no file storage, no AI. React + Vite + Tailwind + Radix + tldraw + TipTap.
- **Tier 2** = Backend + infrastructure. `packages/api/`, `packages/shared/`, and updating `packages/web/` to connect to real API. Hono + Bun + PlanetScale + Drizzle + R2 + WorkOS + WebSockets.
- **Tier 3** = AI integration. Anthropic API, background jobs, Claude in discussions, research agents, transcription, housekeeping, PWA.

**If IMPLEMENTATION_PLAN.md contains items for a later tier, skip them.** Do not implement anything outside the current tier's scope.

---

## Build Process

0a. Study `specs/*` with up to 500 parallel Sonnet subagents to learn the application specifications **relevant to the current tier**.
0b. Study @IMPLEMENTATION_PLAN.md.
0c. For reference, the application source code is in `packages/*`.
0d. Study `specs/scenarios/**/*.feature` files for the current tier's features — these define the expected behavior.

1. Your task is to implement functionality per the specifications using parallel subagents. Follow @IMPLEMENTATION_PLAN.md and choose the most important item to address **within the current tier**. Before making changes, search the codebase (don't assume not implemented). You may use up to 500 parallel subagents for searches/reads (prefer Haiku for quick lookups, Sonnet for analysis) and only 1 Sonnet subagent for build/tests. Use Opus subagents when complex reasoning is needed (debugging, architectural decisions).
2. After implementing functionality or resolving problems, run the tests for that unit of code that was improved. If functionality is missing then it's your job to add it as per the application specifications. Ultrathink.
3. When you discover issues, immediately update @IMPLEMENTATION_PLAN.md with your findings using a subagent. When resolved, update and remove the item.
4. When the tests pass, update @IMPLEMENTATION_PLAN.md, then `git add -A` then `git commit` with a message describing the changes. After the commit, `git push`.

## Tier-Specific Build Rules

### If TIER = 1 (Frontend)

**DO:**
- Create React components, hooks, pages, layouts in `packages/web/`
- Create/update mock data in `packages/web/src/mocks/`
- Use React Query hooks with mock `queryFn` — same hook signatures as the real API will use
- Write Vitest tests for component logic and hooks
- Implement all UI views: feed, projects, sections, canvas, discussions, search, notifications
- Use Tailwind CSS 4, Radix UI, Lucide icons
- Integrate tldraw for canvas/drawing
- Integrate TipTap for rich text editing
- Implement responsive layouts (mobile, tablet, desktop)
- Implement dark mode

**DO NOT:**
- Create any `packages/api/` code
- Make any `fetch()` calls to an API server
- Import or configure WorkOS, PlanetScale, Drizzle, R2, or any backend dependency
- Create `.env` files with API keys
- Set up WebSocket connections
- Implement Claude/AI features
- Create Dockerfiles or deployment configs

**Dev/Test commands:**
```bash
cd packages/web && bun dev    # Vite dev server
bun test                       # Vitest
```

### If TIER = 2 (Backend)

**DO:**
- Create Hono API server in `packages/api/`
- Create Drizzle schema and migrations in `packages/api/src/db/`
- Create shared types in `packages/shared/`
- Set up WorkOS auth middleware
- Set up R2 presigned URL flow
- Set up Bun native WebSocket server
- Swap mock `queryFn` → real `fetch` in frontend React Query hooks
- Wire WebSocket client in frontend for realtime updates
- Create seed script to populate database from mock data
- Write Vitest tests for API routes

**DO NOT:**
- Implement Claude/AI features
- Create background job queue for AI tasks
- Implement voice transcription
- Create the Claude Code plugin
- Set up PWA / push notifications

### If TIER = 3 (AI Integration)

**DO:**
- Implement Anthropic API calls from Hono
- Build context assembly system
- Implement @claude in discussions
- Create background job queue (in-process or BullMQ)
- Implement research agent, housekeeping agent, digest generation
- Implement voice transcription (Whisper/Deepgram)
- Create Claude Code plugin
- Set up PWA with push notifications

## Claude Optimization Notes

**Extended Thinking** (`ultrathink` keyword) is recommended for:
- Complex problem analysis and solving
- Multi-step reasoning tasks
- Technical solution design and architecture

**Model Selection**:
- Use Opus subagents for complex reasoning, architectural decisions, and debugging
- Use Sonnet subagents for implementation tasks, searches, and reads
- Use Haiku subagents for quick lookups

99999. Important: When authoring documentation, capture the "why" — tests and implementation importance.
999999. Important: Single sources of truth, no migrations/adapters. If tests unrelated to your work fail, resolve them as part of the increment.
9999999. As soon as there are no build or test errors create a git tag. If there are no git tags start at 0.0.0 and increment patch by 1.
99999999. You may add extra logging if required to debug issues.
999999999. Keep @IMPLEMENTATION_PLAN.md current with learnings using a subagent — future work depends on this to avoid duplicating efforts.
9999999999. When you learn something new about how to run the application, update @AGENTS.md using a subagent but keep it brief.
99999999999. For any bugs you notice, resolve them or document them in @IMPLEMENTATION_PLAN.md using a subagent.
999999999999. Implement functionality completely. Placeholders and stubs waste efforts and time redoing the same work.
9999999999999. When @IMPLEMENTATION_PLAN.md becomes large periodically clean out items completed.
99999999999999. If you find inconsistencies in the specs/* then use an Opus subagent with Ultrathink to update the specs.
999999999999999. IMPORTANT: Keep @AGENTS.md operational only — status updates belong in `IMPLEMENTATION_PLAN.md`.
9999999999999999. **NEVER implement features from a later tier. Check @TIER before every task.**
