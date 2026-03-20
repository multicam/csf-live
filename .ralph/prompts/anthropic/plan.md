---
description: Establish @IMPLEMENTATION_PLAN.md based on @specs/* — scoped to current TIER
model: opus
---

## Phase 0: Tier Gate

**Read @TIER** — this file contains a single number (1, 2, or 3) indicating the current development tier.

**Read @specs/phasing.md** — this defines what each tier covers.

**CRITICAL CONSTRAINT: You MUST only plan work for the current tier.** Do NOT plan backend API routes during Tier 1. Do NOT plan Claude integration during Tier 1 or 2. The tiers are:

- **Tier 1** = Frontend only. Mock data. React + Vite + Tailwind + Radix + tldraw + TipTap. No server, no database, no auth service, no file storage, no AI. Source: `packages/web/`.
- **Tier 2** = Backend + infrastructure. Hono + Bun + PlanetScale + Drizzle + R2 + WorkOS + WebSockets. Connect frontend to real API. Source: `packages/api/`, `packages/shared/`, update `packages/web/`.
- **Tier 3** = AI integration. Anthropic API, Claude in discussions, research agents, transcription, housekeeping, PWA. Source: `packages/api/src/jobs/`, `packages/api/src/lib/claude.ts`, update all.

If you encounter work that belongs to a later tier, **add it to a "Deferred (Tier N)" section** in IMPLEMENTATION_PLAN.md — do NOT plan implementation steps for it.

---

## Phase 1: Spec-to-Implementation Gap Analysis

Before planning, run this verification to detect drift between specs and code:

**1a. Specs Analysis** — Use up to 250 parallel Sonnet subagents to extract all requirements from `specs/*` **that are in scope for the current tier** (check `specs/phasing.md`). Catalog each spec file, its relevant requirements, and cross-references.

**1b. Source Inventory** — Use up to 250 parallel Sonnet subagents to catalog everything actually implemented in `packages/*`. Map: modules → functions/classes → features.

**1c. Gap Finder** — Use Haiku subagents to search for:
- TODO/FIXME comments
- Placeholder implementations (stub functions, `throw new Error('not implemented')`)
- Skipped tests (`.skip`, `xit`)
- Hardcoded values that should be configurable
- Missing error handling

**1d. Scenario Coverage** — Use Sonnet subagents to read `specs/scenarios/**/*.feature` files and check which scenarios have corresponding implementations. Cross-reference against the current tier's feature list.

**1e. Deep Analysis (conditional)** — If specs/ have changed since last plan run, use an Opus subagent with Ultrathink to analyze impact:
- Which implemented features are now orphaned or conflict with new specs?
- Which code needs deletion vs rewriting?
- Draft concrete tasks for IMPLEMENTATION_PLAN.md
- **Flag any work that has leaked into a later tier and should be removed/deferred**

**1f. Update IMPLEMENTATION_PLAN.md** — Add a "Spec Gaps & Analysis" section at the top containing:
- Current tier (from @TIER)
- List of gaps found (TODOs, placeholders, skipped tests)
- Scenario coverage status
- Deletion tasks for code that doesn't match specs
- Deferred items for later tiers

---

## Phase 2: Implementation Planning

1. Study @IMPLEMENTATION_PLAN.md (if present; it may be incorrect) and use up to 500 Sonnet subagents to study existing source code in `packages/*` and compare it against `specs/*`. Use an Opus subagent to analyze findings, prioritize tasks, and create/update @IMPLEMENTATION_PLAN.md as a bullet point list sorted in priority of items yet to be implemented. Ultrathink. Consider searching for TODO, minimal implementations, placeholders, skipped/flaky tests, and inconsistent patterns.

**IMPORTANT**: Plan only. Do NOT implement anything. Do NOT assume functionality is missing; confirm with code search first. **Do NOT plan work for tiers beyond the current one.**

## Tier-Specific Planning Notes

### If TIER = 1 (Frontend)
- All data comes from `packages/web/src/mocks/` — plan mock dataset generation if missing
- No API calls, no `fetch` to a backend — only React Query hooks with mock queryFn
- Plan scenarios (`.feature` files) for each UI feature
- Plan Vitest tests for component logic and hooks
- Source directory: `packages/web/`
- Dev command: `bun dev` (Vite dev server only)
- Test command: `bun test` (Vitest only)

### If TIER = 2 (Backend)
- Plan API routes, database schema, migrations, middleware
- Plan swapping mock queryFn → real fetch in frontend hooks
- Plan WebSocket server and client integration
- Plan file upload flow (R2 presigned URLs)
- Plan WorkOS auth flow integration
- Source directories: `packages/api/`, `packages/shared/`, update `packages/web/`
- Dev command: `bun dev` (Vite + Hono dev servers)
- Test command: `bun test` (Vitest for API + frontend)

### If TIER = 3 (AI Integration)
- Plan Claude invocation from Hono (API key approach)
- Plan context assembly system
- Plan background job queue
- Plan agent patterns (research, housekeeping, digest)
- Plan transcription pipeline
- Source: `packages/api/src/jobs/`, `packages/api/src/lib/claude.ts`

## Claude Optimization Notes

**Extended Thinking** (`ultrathink` keyword) is recommended for:
- Complex problem analysis and solving
- Multi-step reasoning tasks
- Technical solution design and architecture
- Tier boundary analysis (ensuring no scope creep)

**Model Selection**:
- Use Opus subagents for complex reasoning, architectural decisions, and analysis
- Use Sonnet subagents for searches, reads, and straightforward comparisons
- Use Haiku subagents for quick lookups

99999. When authoring specifications or updating IMPLEMENTATION_PLAN.md, capture the "why" — context and rationale behind requirements matter as much as the requirements themselves.
999999. Keep @IMPLEMENTATION_PLAN.md current with learnings using a subagent — future plan runs depend on this to avoid re-analyzing the same gaps.
9999999. When @IMPLEMENTATION_PLAN.md becomes large, periodically clean out items that are confirmed complete using a subagent.
99999999. If you find inconsistencies in specs/*, use an Opus subagent with Ultrathink to analyze and update the specs before planning around them.
999999999999999. IMPORTANT: Keep @AGENTS.md operational only — planning notes and status belong in `IMPLEMENTATION_PLAN.md`. A bloated AGENTS.md pollutes every future loop's context.

ULTIMATE GOAL: Implement the current tier as defined in `specs/phasing.md`. If a feature or element is missing from the specs but needed for the current tier, author the specification at `specs/FILENAME.md`. **Never plan or implement beyond the current tier.**
