# CSF Live — Scenario-Driven Development

**Version**: 1.0
**Date**: 2026-03-21
**Status**: Methodology defined — scenarios to be written per feature
**Related**: [Tech Stack — SDD Approach](techstack-study.md#sdd-approach), [Phasing](phasing.md)

---

## Table of Contents

1. [What is SDD](#1-what-is-sdd)
2. [CSF Live SDD Stack](#2-csf-live-sdd-stack)
3. [Scenario Formalism](#3-scenario-formalism)
4. [The SDD Loop](#4-the-sdd-loop)
5. [Writing Good Scenarios](#5-writing-good-scenarios)
6. [Example Scenarios](#6-example-scenarios)
7. [Testing Layers](#7-testing-layers)
8. [Scenario Organization](#8-scenario-organization)
9. [Coverage Tracking](#9-coverage-tracking)
10. [Background and Alternatives](#10-background-and-alternatives)

---

## 1. What is SDD

Scenario-Driven Development means every feature starts as a set of human-readable scenarios that describe **who** does **what** and **what happens**. Code is written to make scenarios pass. Tests are written after the scenario is validated.

The development sequence:

```
Scenario → Implementation → Validation → Tests
```

Not TDD (test first), not BDD (shared vocabulary with non-devs). SDD is simpler: **describe the desired outcome, build until it works, then lock it down with tests.**

### How SDD Differs

| Methodology | Artifact first | Who writes it | Validation |
|-------------|---------------|---------------|------------|
| **TDD** | Unit test | Developer | Test runner |
| **BDD** | Gherkin scenario | Dev + stakeholders | Cucumber/Playwright |
| **ATDD** | Acceptance criteria | QA + business | Acceptance test suite |
| **SDD (ours)** | Scenario (Gherkin) | Developer | Claude Code via devtools-mcp + Vitest |

Key difference: **Claude Code is the validator during development.** It reads the scenario, implements the feature, and verifies it interactively through the browser via devtools-mcp. Automated tests come after, not before.

---

## 2. CSF Live SDD Stack

| Tool | Role |
|------|------|
| **Gherkin `.feature` files** | Scenario definition — human-readable, machine-parseable |
| **devtools-mcp** (Brave/Chrome CDP) | Browser automation — Claude Code drives the browser to validate scenarios |
| **react-grab** | Component context — hover any element → get component name, file path, HTML for Claude Code |
| **Vitest** | Unit/integration tests — written after scenario validation, runs in CI |

### What We Don't Use

- **Playwright** — replaced by devtools-mcp for browser automation
- **playwright-bdd / cucumber-js** — no separate BDD test runner needed; Claude Code validates scenarios interactively
- **Cypress, Selenium** — same reason

### Why This Combination

1. **devtools-mcp** gives Claude Code direct browser control via Chrome DevTools Protocol. No test framework abstraction layer — Claude sees the real browser, real DOM, real network.
2. **react-grab** closes the gap between "what's on screen" and "where's the code." Claude Code can inspect any element and know exactly which component and file to edit.
3. **Gherkin scenarios** provide structured, unambiguous feature descriptions that Claude Code can parse and follow step-by-step.
4. **Vitest** covers the CI story — unit tests validate business logic on every push without needing a browser.

---

## 3. Scenario Formalism

Scenarios use **Gherkin syntax** in `.feature` files. Gherkin is the Given/When/Then format created by Dan North for BDD and formalized by the Cucumber project.

### Why Gherkin (Not Plain Markdown)

- **Structured**: parseable by tools and AI — Claude Code can read and follow steps precisely
- **Unambiguous**: Given/When/Then forces separation of precondition, action, and expected outcome
- **Parameterized**: supports Scenario Outlines with Examples tables for data-driven scenarios
- **Industry standard**: widely understood, extensive documentation
- **Step reuse**: same Given/When/Then step phrasing can appear across multiple scenarios

### Gherkin Syntax Reference

```gherkin
Feature: [Feature name]
  [Optional description]

  Background:
    Given [precondition shared by all scenarios in this file]

  Scenario: [Scenario name]
    Given [initial state]
    And [additional precondition]
    When [user action]
    And [additional action]
    Then [expected outcome]
    And [additional verification]

  Scenario Outline: [Parameterized scenario]
    Given [state with <variable>]
    When [action with <variable>]
    Then [outcome with <variable>]

    Examples:
      | variable | expected |
      | value1   | result1  |
      | value2   | result2  |
```

### Rules for CSF Live Scenarios

1. **Declarative, not imperative** — describe *what*, not *how*
   - Bad: `When I click the button with class .btn-primary`
   - Good: `When JM posts a message`

2. **One behavior per scenario** — one When/Then pair. Multiple behaviors = multiple scenarios.

3. **3-7 steps** — fewer lacks context, more mixes behaviors.

4. **Include timing where relevant** — realtime features need SLA:
   - `Then Ben sees the message within 500ms`

5. **Use real names** — JM, Ben, Claude. Not "User A" or "the user."

6. **Scenarios are independent** — any scenario can run in any order. No shared state between scenarios.

---

## 4. The SDD Loop

### During Development (Claude Code)

```
1. Read scenario (.feature file)
     ↓
2. Implement the feature
     ↓
3. Start dev server (bun dev)
     ↓
4. Validate via devtools-mcp:
   a. Open Brave browser
   b. Navigate to the app
   c. Execute each Given/When/Then step:
      - Given: verify precondition (page loaded, user logged in, data present)
      - When: perform action (click, type, navigate, drag)
      - Then: verify outcome (element visible, data changed, notification appeared)
   d. Use react-grab to inspect component structure when needed
     ↓
5. If scenario fails → fix implementation → re-validate
     ↓
6. Scenario passes → write Vitest unit tests for the underlying logic
     ↓
7. Commit: scenario + implementation + tests
```

### In CI (GitHub Actions)

```
git push → GitHub Actions
  → bun install
  → bun run lint (Biome)
  → bun run test (Vitest — unit/integration tests)
  → bun run build
```

CI runs Vitest only. No browser-based E2E in CI. The SDD validation via devtools-mcp happens during development, not in CI.

### When Scenarios Change

1. Update the `.feature` file
2. Claude Code re-validates via devtools-mcp
3. Update or add Vitest tests if the underlying logic changed
4. Commit all together

---

## 5. Writing Good Scenarios

### Scenario Quality Checklist

- [ ] Describes a single user behavior
- [ ] Uses declarative language (what, not how)
- [ ] Has clear preconditions (Given)
- [ ] Has a single action or action sequence (When)
- [ ] Has verifiable outcomes (Then) — not "should work" but "message appears in feed"
- [ ] Includes timing for realtime features
- [ ] Uses real names (JM, Ben, Claude)
- [ ] Can run independently of other scenarios

### Success Criteria in Then Statements

Then statements must be **observable and verifiable**:

| Good | Bad |
|------|-----|
| `Then the message appears in the feed` | `Then it works` |
| `Then the project status shows "archived"` | `Then the project is updated` |
| `Then Ben sees the message within 500ms` | `Then the message is sent in real-time` |
| `Then the canvas shows only the circle` | `Then the canvas is restored` |
| `Then the notification count shows "3"` | `Then notifications are updated` |

### Handling Edge Cases

Use separate scenarios for edge cases, not conditionals in one scenario:

```gherkin
Scenario: Post a message with text
  Given JM is on the feed page
  When JM types "Hello" and clicks Post
  Then the message "Hello" appears in the feed

Scenario: Post fails with empty message
  Given JM is on the feed page
  When JM clicks Post without typing anything
  Then no message is posted
  And the input shows a validation hint

Scenario: Post a message with a URL
  Given JM is on the feed page
  When JM types "Check https://example.com" and clicks Post
  Then the message appears with a link preview card
```

---

## 6. Example Scenarios

### Feed: Posting a Message

```gherkin
Feature: Feed Messaging

  Background:
    Given JM is logged in
    And JM is on the feed page

  Scenario: Post a text message
    When JM types "Check out this auth pattern" in the message input
    And JM clicks Post
    Then the message "Check out this auth pattern" appears in the feed
    And the message shows JM as the author
    And the message shows the current timestamp

  Scenario: Realtime delivery to other user
    Given Ben is logged in on another session
    And Ben is on the feed page
    When JM posts "New idea for the landing page"
    Then Ben sees "New idea for the landing page" within 500ms
```

### Quick Capture

```gherkin
Feature: Quick Capture

  Background:
    Given JM is logged in

  Scenario: Capture a link to the feed
    When JM opens Quick Capture
    And JM pastes "https://example.com/article"
    And JM clicks Capture
    Then a link card appears in the feed
    And the link card shows a preview of the URL

  Scenario: Capture targeted to a project
    Given there is a project "CSF Live Backend"
    When JM opens Quick Capture
    And JM types "Consider using Hono middleware for rate limiting"
    And JM selects project "CSF Live Backend"
    And JM clicks Capture
    Then the idea appears in project "CSF Live Backend"
    And the idea does not appear in the feed
```

### Content Movement

```gherkin
Feature: Content Fluidity

  Scenario: Move content from feed to project
    Given JM is logged in
    And there is an idea "API versioning strategy" in the feed
    And there is a project "Backend Architecture"
    When JM selects the idea "API versioning strategy"
    And JM clicks "Move to..."
    And JM selects project "Backend Architecture"
    Then the idea disappears from the feed
    And the idea appears in project "Backend Architecture"
```

### Canvas Drawing

```gherkin
Feature: Canvas Drawing

  Background:
    Given JM is logged in
    And JM opens the canvas for project "Design Exploration"

  Scenario: Draw and save a version
    When JM draws a freehand shape on the canvas
    And JM clicks "Save Version"
    And JM names the version "initial sketch"
    Then the version "initial sketch" appears in the version history

  Scenario: Restore a previous version
    Given there is a version "initial sketch" with one shape
    And JM has drawn additional shapes since that version
    When JM clicks "Restore" on version "initial sketch"
    Then the canvas shows only the shapes from "initial sketch"
    And a new version is created from the restore
```

### Discussions

```gherkin
Feature: Project Discussion

  Scenario: Post in a section discussion
    Given JM is logged in
    And JM is in section "Auth Design" of project "CSF Live"
    When JM posts "Should we use JWT or session cookies?"
    Then the message appears in the section discussion
    And the message appears in the project root discussion with label "Auth Design"

  Scenario: Claude responds in discussion
    Given JM is in the feed
    When JM posts "@claude What are the trade-offs of JWT vs session cookies?"
    Then a "Claude is thinking..." indicator appears
    And Claude's response appears as a message authored by "Claude"
    And the response is formatted in markdown
```

### Search

```gherkin
Feature: Search

  Scenario: Full-text search across projects
    Given JM is logged in
    And there are messages containing "database migration"
    When JM opens Search
    And JM types "database migration"
    Then results show messages containing "database migration"
    And each result shows the project and section it belongs to
    And clicking a result navigates to the message in context
```

---

## 7. Testing Layers

### Layer 1: SDD Validation (Development Time)

- **Tool**: Claude Code + devtools-mcp + react-grab
- **When**: During development, for every scenario
- **How**: Claude Code reads the `.feature` file, implements the feature, validates each step by driving the browser
- **Artifacts**: None (interactive validation, not recorded)

### Layer 2: Unit/Integration Tests (CI)

- **Tool**: Vitest
- **When**: Written after scenario validation passes
- **How**: Test the underlying business logic, data transformations, API route handlers
- **Artifacts**: `.test.ts` files alongside source code
- **Runs**: Every push via GitHub Actions

```typescript
// packages/api/src/routes/feed.test.ts
import { describe, it, expect } from 'vitest';

describe('Feed: Post a message', () => {
  it('should create a message in the feed discussion', async () => {
    const result = await postMessage({
      discussionId: feedDiscussionId,
      content: 'Hello world',
      authorId: jmUserId,
    });
    expect(result.content).toBe('Hello world');
    expect(result.authorId).toBe(jmUserId);
    expect(result.createdAt).toBeDefined();
  });

  it('should reject empty messages', async () => {
    await expect(postMessage({
      discussionId: feedDiscussionId,
      content: '',
      authorId: jmUserId,
    })).rejects.toThrow('Message content cannot be empty');
  });
});
```

### Layer 3: API Route Tests (CI)

- **Tool**: Vitest + supertest (or Hono test client)
- **When**: Written alongside API routes
- **How**: Test HTTP request/response contracts

```typescript
// packages/api/src/routes/projects.test.ts
import { describe, it, expect } from 'vitest';
import { app } from '../index';

describe('POST /api/projects', () => {
  it('should create a project and return it', async () => {
    const res = await app.request('/api/projects', {
      method: 'POST',
      headers: { Authorization: `Bearer ${testToken}` },
      body: JSON.stringify({ title: 'New Project' }),
    });
    expect(res.status).toBe(201);
    const project = await res.json();
    expect(project.title).toBe('New Project');
    expect(project.slug).toBe('new-project');
    expect(project.status).toBe('active');
  });
});
```

---

## 8. Scenario Organization

```
specs/scenarios/
├── feed/
│   ├── posting.feature           # Post messages, link enrichment
│   ├── quick-capture.feature     # Quick capture modal, targeting
│   └── content-movement.feature  # Move, copy, split, merge content
├── projects/
│   ├── creation.feature          # Create from scratch, from feed, scaffolded
│   ├── sections.feature          # Section CRUD, reorder, merge
│   └── dashboard.feature         # Project dashboard, activity summary
├── canvas/
│   ├── drawing.feature           # Freehand, shapes, tldraw operations
│   └── versioning.feature        # Save, restore, version history
├── discussions/
│   ├── messaging.feature         # Post, format, media attachments
│   └── claude.feature            # @claude invocation, responses
├── search/
│   └── search.feature            # FTS, filters, natural language
├── notifications/
│   ├── presence.feature          # Online/offline, location tracking
│   └── notifications.feature     # Triggers, badges, panel
└── housekeeping/
    ├── archive.feature           # Archive, delete, bulk operations
    └── review-mode.feature       # Friday review, stale content
```

Each `.feature` file maps to one spec document and is self-contained. Scenarios within a file share a `Background` for common preconditions.

---

## 9. Coverage Tracking

Track scenario implementation status in a simple table at the top of each `.feature` file:

```gherkin
# Status: 3/5 scenarios passing
# Last validated: 2026-04-01

Feature: Feed Messaging
  ...
```

Or maintain a central tracker:

```
specs/scenarios/STATUS.md

| Feature File | Scenarios | Passing | Phase |
|---|---|---|---|
| feed/posting.feature | 4 | 4 | 1 |
| feed/quick-capture.feature | 3 | 2 | 1 |
| projects/creation.feature | 4 | 0 | 1 |
| canvas/drawing.feature | 3 | 0 | 1 |
| ...
```

Updated by Claude Code after each validation session.

---

## 10. Background and Alternatives

### Methodology Lineage

- **2003**: Dan North coins "Behavior-Driven Development" — reframes TDD as behavior specification
- **2003-2004**: Given/When/Then template formalized (JBehave, with Liz Keogh and Chris Matts)
- **2008**: Cucumber created — brings Gherkin to Ruby, then all languages
- **2011**: Gojko Adzic publishes *Specification by Example* — 50+ case studies on example-driven specs
- **2020s**: BDD/SDD converges with AI — Gherkin becomes valuable as structured prompt format

### Key References

- Dan North, "Introducing BDD" (2006) — [dannorth.net](https://dannorth.net/blog/article-introducing-behaviour-driven-development/)
- Gojko Adzic, *Specification by Example* (2011, Manning) — the definitive book on example-driven specs
- Martin Fowler, "Given When Then" — [martinfowler.com/bliki/GivenWhenThen.html](https://martinfowler.com/bliki/GivenWhenThen.html)
- Cucumber official docs — [cucumber.io/docs/bdd/](https://cucumber.io/docs/bdd/)
- Example Mapping (Matt Wynne) — [cucumber.io/blog/bdd/example-mapping-introduction/](https://cucumber.io/blog/bdd/example-mapping-introduction/)

### Alternatives Evaluated

| Approach | Verdict for CSF Live |
|----------|---------------------|
| **Markdown scenarios** | Too informal — no structure for Claude Code to parse reliably |
| **playwright-bdd** | Good tool but tied to Playwright runner — we use devtools-mcp instead |
| **cucumber-js** | Legacy, separate runner, not needed when Claude Code validates interactively |
| **Screenplay Pattern** | Over-engineered for 2-person team |
| **YAML/JSON scenarios** | Custom format with no ecosystem — Gherkin is the standard |
| **Example Mapping** | Good for discovery workshops, not a replacement for scenario files. Can be used before writing Gherkin. |

### Gherkin Without a Runner

Traditionally, `.feature` files are consumed by test runners (Cucumber, playwright-bdd). In CSF Live, **Claude Code is the runner** — it reads the Gherkin, understands the steps, and validates them via devtools-mcp. This is unconventional but aligns with the AI-first development approach:

- Gherkin provides the **structure and unambiguity** that Claude Code needs
- devtools-mcp provides the **browser interaction** that Playwright would normally handle
- react-grab provides the **component mapping** that no traditional runner offers
- Vitest provides the **CI safety net** that runs without a browser

The `.feature` files are never "compiled" or "parsed" by a tool. They are read by Claude Code as structured instructions.
