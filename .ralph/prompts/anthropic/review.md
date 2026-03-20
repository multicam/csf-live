---
description: Deep code review — triage, fix, refactor, test. Track in @REVIEW_PLAN.md. Scoped to current TIER.
model: opus
---

## Tier Gate

**Read @TIER** — this file contains a single number (1, 2, or 3) indicating the current development tier.

**CRITICAL CONSTRAINT: Only review and fix code within the current tier's scope.**

- **Tier 1** = `packages/web/` only. Frontend components, hooks, mocks, styles.
- **Tier 2** = `packages/api/`, `packages/shared/`, and `packages/web/` (API integration). Backend routes, database, auth, storage, WebSockets.
- **Tier 3** = AI integration code. Claude invocation, agents, transcription, housekeeping, PWA.

**If you find code that belongs to a later tier (e.g., API routes during Tier 1 review), flag it in REVIEW_PLAN.md as "Out of scope (Tier N)" — do NOT review or fix it.**

---

## Phase 0: Spec-to-Implementation Gap Analysis

Before reviewing, run this verification to detect drift between specs and code:

**0a. Specs Analysis** — Use up to 250 parallel Sonnet subagents to extract all requirements from `specs/*` **relevant to the current tier**. Note any specs that have been added/modified since last review run.

**0b. Source Inventory** — Use up to 250 parallel Sonnet subagents to catalog everything actually implemented in `packages/*` **for the current tier**. Map: modules → functions/classes → features.

**0c. Gap Finder** — Use Haiku subagents to search for:
- TODO/FIXME comments
- Placeholder implementations (stub functions, `throw new Error('not implemented')`)
- Skipped tests (`.skip`, `xit`)
- Hardcoded values that should be configurable
- Missing error handling

**0d. Scenario Coverage** — Use Sonnet subagents to check which `.feature` scenarios for the current tier have been implemented and validated.

**0e. Deep Analysis (conditional)** — If specs/ have changed since last review run, use an Opus subagent with Ultrathink to analyze impact:
- Which implemented features are now orphaned or conflict with new specs?
- Which code needs deletion vs rewriting?
- **Is there any code that leaked from a later tier? Flag for removal.**

**0f. Update REVIEW_PLAN.md** — Add a "Spec Gaps & Analysis" section at the top.

---

## Phase 1: Triage & Fix

1. If @REVIEW_PLAN.md does not exist, this is the first iteration. Run `bun test` to establish baseline. Then spawn 4 parallel Opus subagents with Ultrathink to triage the codebase **within the current tier's scope**:

### If TIER = 1 (Frontend)
   - **Agent 1 — Components**: React components (error boundaries, memory leaks, stale closures, dependency arrays, cleanup functions), accessibility, semantic HTML.
   - **Agent 2 — State & Data**: React Query hooks, Zustand stores, mock data completeness, data flow correctness.
   - **Agent 3 — Tests**: Run `bun test --coverage`, identify files below 80% statement coverage, untested error paths, modules with zero tests.
   - **Agent 4 — UX & Scenarios**: Cross-reference implemented UI against `specs/scenarios/**/*.feature`. Verify all scenario steps are achievable in the UI. Check responsive breakpoints, dark mode, keyboard navigation.

### If TIER = 2 (Backend)
   - **Agent 1 — API Routes**: Route handlers (auth checks, input validation, error handling, SQL injection, unbounded queries, N+1, missing indexes, race conditions).
   - **Agent 2 — Frontend Integration**: API client error handling, WebSocket reconnection, auth flow, file upload flow.
   - **Agent 3 — Tests**: Coverage analysis for both `packages/api/` and `packages/web/`.
   - **Agent 4 — Security**: OWASP top 10, WorkOS JWT validation, R2 presigned URL expiry, CORS configuration.

### If TIER = 3 (AI Integration)
   - **Agent 1 — Claude Integration**: Context assembly, token budget, prompt quality, error handling, streaming.
   - **Agent 2 — Background Jobs**: Job queue reliability, retry logic, timeout handling, result storage.
   - **Agent 3 — Tests**: Coverage for AI-related code paths.
   - **Agent 4 — Security**: API key handling, prompt injection defense, agent sandboxing.

Compile findings into @REVIEW_PLAN.md. Ultrathink.

## Phase 2: Fix Issues & Improve Coverage

2. If @REVIEW_PLAN.md exists, read it and resume. Find the highest-severity `pending` issues and fix them. Work critical → high → medium → low. For each issue:
   - Read the file fully. Understand context.
   - Fix the issue. Refactor aggressively.
   - **MANDATORY: Write or update tests for every fix.**
   - Run `bun test` after each batch. Never leave tests red.
   - Update @REVIEW_PLAN.md: mark issues `fixed`, note what changed.

## Phase 3: Coverage Gate

3. **MANDATORY COVERAGE GATE**: After fixing issues, write tests for uncovered code.
   - Run `bun test --coverage` at the start and end of every iteration.
   - **Each iteration MUST increase statement coverage by at least 3 percentage points.**
   - Prioritize: CRITICAL coverage gaps first, then HIGH, then MEDIUM.

## Phase 4: Verification

4. Run full verification: `bun test`. Update coverage numbers in @REVIEW_PLAN.md.

## Phase 5: Log & Commit

5. Update @REVIEW_PLAN.md with iteration results using a subagent. Then `git add -A` then `git commit` then `git push`.

## Claude Optimization Notes

**Model Selection**:
- Use Opus subagents for triage analysis and complex refactoring
- Use Sonnet subagents for searches, reads, and test writing
- Use Haiku subagents for quick lookups

99999. Refactoring authority: rename, extract, delete dead code, restructure, split large files, consolidate tiny ones, rewrite brittle tests. Respect existing patterns.
999999. Test rules: mock external dependencies at the boundary, not internals. Group with `describe`. Target 80% coverage.
9999999. Single sources of truth. Consolidate duplicate logic.
99999999. Document bugs in @REVIEW_PLAN.md using a subagent.
999999999. Keep @REVIEW_PLAN.md current — future iterations depend on it.
9999999999. As soon as there are no build or test errors create a git tag.
999999999999999. IMPORTANT: Keep @AGENTS.md operational only.
9999999999999999. **NEVER review or fix code from a later tier. Check @TIER first.**

REVIEW_PLAN.md template (create if absent):
```markdown
# Code Review Plan

**Last updated**: YYYY-MM-DD
**Iteration**: N
**Current Tier**: N (from @TIER)
**Coverage**: XX% statements (target: 80%)
**Tests**: N passing, N failing

## Issue Tracker

### Critical (bugs, security)
| # | File | Line | Issue | Status |

### High (code smells, missing validation)
| # | File | Line | Issue | Status |

### Medium (refactoring, test gaps)
| # | File | Line | Issue | Status |

### Low (style, naming, minor cleanup)
| # | File | Line | Issue | Status |

## Coverage Gaps (files below 80%)
| File | Statements | Branches | Functions | Priority |

## Scenario Coverage
| Feature File | Scenarios | Implemented | Passing |

## Iteration Log
### Iteration 1 — YYYY-MM-DD
- Triaged: N issues
- Fixed: ...
- Coverage: XX% → XX%
```
