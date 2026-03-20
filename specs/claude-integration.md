# CSF Live — Claude Integration Specification

**Version**: 1.0
**Date**: 2026-03-21
**Status**: Draft — key decisions pending (marked with DECISION NEEDED)
**Context**: Expands on Section 13 of `specs/README.md` and Section 9 of `specs/techstack-study.md`

---

## Table of Contents

1. [Overview](#1-overview)
2. [Integration Paths](#2-integration-paths)
3. [Production Integration](#3-production-integration)
4. [Development Integration](#4-development-integration)
5. [Context Assembly](#5-context-assembly)
6. [Streaming Architecture](#6-streaming-architecture)
7. [Agent Patterns](#7-agent-patterns)
8. [Claude Code Plugin (csf-live)](#8-claude-code-plugin-csf-live)
9. [Open Decisions](#9-open-decisions)

---

## 1. Overview

Claude is integrated into CSF Live at two levels:

1. **Production** — Claude as a participant inside the app. Users invoke Claude in discussions, ask it to generate documents, run research, scaffold project sections, and perform housekeeping.
2. **Development** — Claude Code as the primary development tool for building CSF Live itself. The repo is structured so that Claude Code sessions have full context and can operate effectively.

These are independent concerns. Production integration is a product feature. Development integration is a DX concern.

---

## 2. Integration Paths

Three paths exist for invoking Claude from the Hono API server. Each has different trade-offs.

### Path 1: Anthropic API (Direct)

```
Hono server → @anthropic-ai/sdk → Claude API → response
```

| Aspect | Detail |
|--------|--------|
| **How it works** | Standard HTTP API call via the Anthropic TypeScript SDK |
| **Cost** | Per-token (input + output). Estimated $5-30/mo for 2 users with moderate usage. |
| **Reliability** | High — standard REST API with documented error handling and retries |
| **Streaming** | Yes — Server-Sent Events from API, relayed to client via WebSocket |
| **Requirements** | API key stored as environment variable on the server. No filesystem state needed. |
| **Best for** | Discussion responses, document generation, search, structured output, any task that's a single prompt → response cycle |

```typescript
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const response = await client.messages.create({
  model: 'claude-sonnet-4-6',
  max_tokens: 4096,
  messages: [{ role: 'user', content: assembledPrompt }],
});
```

### Path 2: Claude Code CLI (Headless)

```
Hono server → child_process.spawn('claude', ['-p', prompt]) → stdout → response
```

| Aspect | Detail |
|--------|--------|
| **How it works** | Spawns the Claude Code CLI as a child process with the `-p` flag for non-interactive mode |
| **Cost** | Covered by Max subscription — no per-token charge |
| **Reliability** | Medium — depends on CLI auth token persistence, Max plan rate limits, CLI availability |
| **Streaming** | Yes — capture stdout chunks in real-time |
| **Requirements** | Authenticated Claude Code installation on the server (`~/.claude/` directory with valid session). Persistent filesystem. |
| **Best for** | Complex multi-step tasks where Claude Code's built-in tool use (file reading, web search, code execution) adds value. Avoids API costs on Max plans. |

```typescript
import { spawn } from 'child_process';

function invokeClaude(prompt: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const proc = spawn('claude', ['-p', prompt, '--output-format', 'text']);
    let output = '';
    proc.stdout.on('data', (chunk) => { output += chunk.toString(); });
    proc.stderr.on('data', (chunk) => { /* log errors */ });
    proc.on('close', (code) => {
      if (code === 0) resolve(output);
      else reject(new Error(`Claude CLI exited with code ${code}`));
    });
  });
}
```

### Path 3: Claude Code SDK (Programmatic)

```
Hono server → @anthropic-ai/claude-code SDK → managed session → response
```

| Aspect | Detail |
|--------|--------|
| **How it works** | TypeScript SDK wrapping Claude Code with proper session management, error handling, and streaming |
| **Cost** | Max subscription (default) or API key (configurable) |
| **Reliability** | Higher than raw CLI — SDK handles retries, session state, auth refresh |
| **Streaming** | Native streaming support with typed event callbacks |
| **Requirements** | Same as CLI — authenticated Claude Code environment on the server |
| **Best for** | Same use cases as CLI but with better DX, error handling, and TypeScript integration |

```typescript
import { claude } from '@anthropic-ai/claude-code';

const response = await claude({
  prompt: assembledPrompt,
  options: {
    maxTokens: 4096,
  },
});
```

### Comparison Matrix

| Factor | API (Path 1) | CLI (Path 2) | SDK (Path 3) |
|--------|-------------|-------------|-------------|
| Setup complexity | Low (API key) | High (auth on server) | High (auth on server) |
| Reliability | High | Medium | Medium-High |
| Cost model | Per-token | Max subscription | Max subscription or per-token |
| Streaming | SSE | stdout capture | Native |
| Multi-tool tasks | Manual (tool_use API) | Built-in | Built-in |
| Auth maintenance | None (key doesn't expire) | Periodic re-auth | Periodic re-auth |
| Rate limits | API tier limits | Max plan limits | Max plan limits |

---

## 3. Production Integration

### Use Cases (from spec Section 13)

| Use Case | Description | Recommended Path | Why |
|----------|-------------|-----------------|-----|
| **Discussion response** | User @mentions Claude in a discussion thread. Claude receives recent context and responds. | API | Simple prompt→response. Most reliable. Streaming important for UX. |
| **Document generation** | User asks Claude to generate a PRD, research summary, or analysis. Saved as a versioned content item. | API | Structured output. May use tool_use for formatting. |
| **Section scaffolding** | Claude interviews user section-by-section to build out project requirements. One question at a time. | API | Sequential prompt→response pairs. Conversational state managed by the app. |
| **Research agent** | Background task: Claude researches a topic, produces structured findings. | API or SDK | Longer-running. May benefit from Claude Code's web search tool (SDK/CLI). |
| **Housekeeping agent** | Claude reviews content, suggests merges/archives/cleanups. Scheduled or manual. | API | Analytical. Reads data, produces suggestions. No tool use needed. |
| **Natural language search** | User asks a question, Claude searches the knowledge base and synthesizes an answer. | API | Structured: query → search Postgres → assemble results → Claude synthesizes. |
| **Weekly digest** | Scheduled: Claude summarizes the week's activity across projects. | API | Batch job. No interactivity needed. |

### Invocation Architecture

All Claude invocations follow the same pattern:

```
1. Trigger (user action or scheduled job)
   → 2. Hono API receives request or job fires
   → 3. Context assembly (query Postgres for relevant data)
   → 4. Claude invocation (API call with assembled prompt)
   → 5. Response handling:
        a. Stream partial responses to client via WebSocket (if interactive)
        b. Save final response to Postgres (message, document, or content item)
   → 6. WebSocket broadcast: notify connected clients of new content
```

### Authentication and Routing

**> DECISION NEEDED: CLI/Max vs API key approach**

**Option A: API key only (recommended for Phase 1)**
- Single Anthropic API key stored as server environment variable
- All Claude invocations use the same key
- Cost: per-token, estimated $5-30/mo for 2 users
- No auth state to maintain, no session expiry issues
- Upgrade to Max/SDK later if costs justify it

**Option B: Max subscription via CLI/SDK**
- Anthony's and Ben's Max subscriptions authenticated on the server
- App routes invocations to the correct user's CLI session based on who triggered it
- Two separate `~/.claude/` profiles or session tokens
- Risk: auth tokens expire, require manual re-auth, CLI updates can break sessions
- Benefit: no per-token cost

**Option C: Hybrid**
- API key for all interactive features (discussion responses, scaffolding — where reliability matters)
- Max subscription via SDK for background tasks (research, digests — where latency and occasional failures are acceptable)
- Best of both: reliable UX for interactive features, cost savings for batch work

### Response Storage

Claude responses are stored as standard content items or messages:

```typescript
// Discussion response → saved as a message
await db.insert(messages).values({
  discussionId: discussion.id,
  authorId: CLAUDE_USER_ID,  // dedicated "Claude" user in the users table
  content: claudeResponse,
  contentType: 'claude-response',
  source: 'claude-code',
  metadata: {
    model: 'claude-sonnet-4-6',
    tokensUsed: { input: 1234, output: 567 },
    invocationId: jobId,
  },
});

// Document generation → saved as a content item
await db.insert(contentItems).values({
  type: 'document',
  title: 'Research Summary: Auth Patterns',
  body: claudeResponse,
  source: 'claude',
  sourceDetail: 'document-generation',
  projectId: project.id,
  sectionId: section?.id,
  authorId: CLAUDE_USER_ID,
  metadata: {
    model: 'claude-sonnet-4-6',
    documentType: 'research-summary',
    prompt: originalPrompt,  // store the prompt for reproducibility
  },
});
```

### Claude User

A dedicated user record represents Claude in the system:

```typescript
// Seeded in migrations
{
  id: 'claude-system-user-uuid',
  name: 'Claude',
  email: 'claude@csf-live.internal',
  role: 'system',  // not 'owner' or 'collaborator'
  avatarUrl: '/claude-avatar.svg',
}
```

This allows Claude's messages to render naturally in discussions (avatar, name, timestamps) while being distinguishable via styling.

---

## 4. Development Integration

### Purpose

Set up the CSF Live repo so that Claude Code sessions are maximally effective when building the app.

### CLAUDE.md (Repo Root)

The root `CLAUDE.md` provides project context for every Claude Code session:

```markdown
# CSF Live

Collaborative AI workspace for capturing ideas, discussing, drawing, and shaping
raw thinking into structured material ready for software development.

## Specs
- Product spec: specs/README.md
- Tech stack: specs/techstack-study.md
- Claude integration: specs/claude-integration.md

## Stack
- Frontend: React 19 + Vite SPA (packages/web)
- Backend: Hono on Bun (packages/api)
- Database: PlanetScale Postgres + Drizzle ORM
- File storage: Cloudflare R2
- Realtime: Bun native WebSockets
- Auth: WorkOS AuthKit

## Commands
- `bun install` — install all dependencies
- `bun dev` — start both frontend and API dev servers
- `bun test` — run all tests (Vitest)
- `bun run build` — production build
- `bun run db:generate` — generate Drizzle migrations
- `bun run db:migrate` — apply migrations
- `bun run lint` — Biome lint + format check

## Conventions
- TypeScript strict mode everywhere
- Biome for linting and formatting
- API routes return typed responses matching packages/shared/types.ts
- All database queries go through Drizzle — no raw SQL in route handlers
- WebSocket events follow the channel:event naming pattern
- Tests alongside source files (*.test.ts)
```

### Package-Level CLAUDE.md Files

Each package gets its own `CLAUDE.md` for focused sessions:

**`packages/api/CLAUDE.md`**
```markdown
# CSF Live API

Hono on Bun API server.

## Structure
- src/routes/ — API route handlers (one file per resource)
- src/middleware/ — Auth, CORS, error handling
- src/ws/ — WebSocket handler
- src/jobs/ — Background job definitions
- src/db/schema.ts — Drizzle schema (source of truth for database structure)
- src/db/migrations/ — Auto-generated SQL migrations
- src/lib/ — Utilities (R2, WorkOS, Claude wrappers)

## Patterns
- Every route validates auth via WorkOS middleware
- Mutations broadcast WebSocket events after database writes
- File uploads use presigned R2 URLs (never proxy through the API)
- Claude invocations go through src/lib/claude.ts wrapper
```

**`packages/web/CLAUDE.md`**
```markdown
# CSF Live Web

React 19 + Vite SPA.

## Structure
- src/routes/ — Page components (file-based routing)
- src/components/ — React components organized by feature
- src/components/ui/ — Radix-based primitives
- src/hooks/ — Custom React hooks
- src/lib/api.ts — API client (typed fetch wrapper)
- src/lib/ws.ts — WebSocket client

## Patterns
- Server state via React Query (TanStack Query)
- Local UI state via useState or Zustand
- WebSocket events trigger React Query cache invalidation
- All data fetching through hooks (useMessages, useProjects, etc.)
- Tailwind CSS 4 for styling
- Radix UI primitives for accessible interactive components
```

### .claude/settings.json

```json
{
  "permissions": {
    "allow": [
      "bun install",
      "bun dev",
      "bun test",
      "bun run build",
      "bun run lint",
      "bun run db:generate",
      "bun run db:migrate",
      "bunx biome"
    ]
  }
}
```

### Development Workflow with Claude Code

Typical session flow for building a feature:

```
1. Developer opens Claude Code in the repo root
2. Claude reads CLAUDE.md → understands stack, specs, conventions
3. Developer: "Implement the feed message posting endpoint and UI"
4. Claude:
   a. Reads specs/README.md Section 5 (Feed) for requirements
   b. Reads packages/api/src/db/schema.ts for data model
   c. Reads packages/shared/types.ts for API contract
   d. Implements the Hono route in packages/api/src/routes/feed.ts
   e. Implements the React component and hook in packages/web/
   f. Adds WebSocket broadcast on new message
   g. Runs tests
```

---

## 5. Context Assembly

When Claude is invoked as a product feature (not for development), the server must assemble relevant context from the database and format it as a prompt.

### Context Budget

Claude's context window is large but not infinite. Context assembly must be selective:

| Model | Context Window | Practical Limit (leaving room for response) |
|-------|---------------|---------------------------------------------|
| claude-sonnet-4-6 | 200K tokens | ~150K tokens of context |
| claude-opus-4-6 | 200K tokens | ~150K tokens of context |

For most invocations, context will be well under 10K tokens. The budget matters for long-running projects with extensive discussions and documents.

### Context Layers

Each invocation assembles context from multiple layers, included in order of priority:

```
Layer 1: System prompt (always included)
  - Claude's role in CSF Live
  - Output format expectations
  - Behavioral guidelines

Layer 2: Immediate context (always included)
  - The triggering message or request
  - The current discussion thread (last N messages)
  - The current section description (if in a section)

Layer 3: Project context (included for project-scoped invocations)
  - Project title, description, status
  - Section list with descriptions
  - Key decisions or pinned items

Layer 4: Relevant content (selectively included based on the request)
  - Documents in the current section/project
  - Related content items (tagged, linked, or referenced)
  - Search results if the request involves finding information

Layer 5: Historical context (summarized, included for long-running projects)
  - Summarized discussion history (older than last N messages)
  - Project activity summary
  - Previous Claude-generated documents
```

### Context Assembly Implementation

```typescript
interface ClaudeContext {
  systemPrompt: string;
  messages: { role: 'user' | 'assistant'; content: string }[];
  estimatedTokens: number;
}

async function assembleContext(params: {
  projectId?: string;
  sectionId?: string;
  discussionId: string;
  userMessage: string;
  maxTokens?: number;
}): Promise<ClaudeContext> {
  const budget = params.maxTokens ?? 150_000;
  let used = 0;

  // Layer 1: System prompt (~500 tokens)
  const systemPrompt = buildSystemPrompt();
  used += estimateTokens(systemPrompt);

  // Layer 2: Recent discussion messages (last 50, or until budget ~30% used)
  const recentMessages = await db.query.messages.findMany({
    where: eq(messages.discussionId, params.discussionId),
    orderBy: desc(messages.createdAt),
    limit: 50,
  });

  // Layer 3: Project context
  let projectContext = '';
  if (params.projectId) {
    const project = await db.query.projects.findFirst({
      where: eq(projects.id, params.projectId),
    });
    const sections = await db.query.sections.findMany({
      where: eq(sections.projectId, params.projectId),
    });
    projectContext = formatProjectContext(project, sections);
    used += estimateTokens(projectContext);
  }

  // Layer 4: Relevant documents (fit within remaining budget)
  const documents = await db.query.contentItems.findMany({
    where: and(
      eq(contentItems.projectId, params.projectId),
      eq(contentItems.type, 'document'),
      eq(contentItems.status, 'active'),
    ),
    orderBy: desc(contentItems.updatedAt),
  });
  const fittedDocs = fitWithinBudget(documents, budget - used);

  // Assemble final context
  return {
    systemPrompt,
    messages: [
      { role: 'user', content: [projectContext, fittedDocs, params.userMessage].join('\n\n') },
    ],
    estimatedTokens: used,
  };
}
```

### System Prompt (Production)

```
You are Claude, an AI assistant integrated into CSF Live — a collaborative workspace
used by Anthony and Ben for capturing ideas, discussing, and shaping projects.

You are participating in a discussion. Your responses should be:
- Concise and actionable
- Formatted in markdown
- Grounded in the project context provided
- Honest about what you don't know or can't find in the provided context

When asked to generate documents, produce well-structured markdown with clear headings.
When asked to research, cite specific sources or content items.
When asked to analyze, provide concrete observations, not vague summaries.

You are not a general chatbot. You are a project collaborator with access to this
project's full context. Act like a knowledgeable team member, not a search engine.
```

### Token Estimation

Use a simple heuristic (1 token ≈ 4 characters) for budget management during assembly. Exact token counting is unnecessary — the goal is to stay well within limits, not hit them precisely.

---

## 6. Streaming Architecture

### > DECISION NEEDED: Streaming vs Complete Responses

**Option A: Streaming (word-by-word appearance)**
- Better UX — user sees Claude "typing" in real-time
- More complex: API streams SSE → server relays chunks via WebSocket → client renders incrementally
- Requires intermediate state: "Claude is typing..." indicator, partial message rendering

**Option B: Complete response (appears all at once)**
- Simpler: API call completes → save to DB → broadcast → client renders
- Worse UX for long responses (user waits 10-30s with no feedback)
- "Claude is thinking..." spinner while waiting

**Option C: Hybrid**
- Show "Claude is thinking..." immediately
- Stream the response in chunks (e.g., paragraph by paragraph, not token by token)
- Final message saved to DB only after completion
- Balances UX and complexity

### Streaming Implementation (if chosen)

```
Client A posts "@claude explain auth flow"
  │
  ▼
Hono API: save user message to Postgres
Hono API: enqueue Claude job
  │
  ▼
Job: assemble context
Job: call Anthropic API with stream: true
  │
  ├──► Token chunk received
  │    └──► WebSocket broadcast: { type: 'claude:stream', chunk: '...' }
  │         └──► Client renders partial response (temporary, not in DB yet)
  │
  ├──► More chunks...
  │
  └──► Stream complete
       └──► Save full response to Postgres as message
            └──► WebSocket broadcast: { type: 'message:new', message: {...} }
                 └──► Client replaces streaming view with persisted message
```

### Streaming via WebSocket

The WebSocket channel carries two event types for Claude responses:

```typescript
// During streaming
{ type: 'claude:stream', data: { discussionId, chunk: 'partial text', done: false } }

// When complete
{ type: 'claude:stream', data: { discussionId, chunk: '', done: true, messageId: 'uuid' } }

// Then the normal message:new event fires for other clients / cache sync
{ type: 'message:new', data: { discussionId, message: { ...savedMessage } } }
```

### Client-Side Rendering

```typescript
// Hook for streaming Claude responses
function useClaudeStream(discussionId: string) {
  const [streamingText, setStreamingText] = useState<string | null>(null);

  useWebSocket(`claude:stream`, (event) => {
    if (event.data.discussionId !== discussionId) return;
    if (event.data.done) {
      setStreamingText(null); // Clear streaming state, persisted message will appear via React Query
    } else {
      setStreamingText((prev) => (prev ?? '') + event.data.chunk);
    }
  });

  return { streamingText, isStreaming: streamingText !== null };
}
```

---

## 7. Agent Patterns

Agents are Claude invocations that run as background jobs, not as interactive responses.

### Research Agent

**Trigger:** User clicks "Research this" on a topic, or posts "@claude research [topic]"

**Flow:**
1. Job queued with project context + research prompt
2. Claude called with web search instructions (via tool_use or Claude Code SDK with search enabled)
3. Results structured as a research document (markdown with sources)
4. Document saved as content item (`type: 'research'`, `source: 'agent'`)
5. Notification sent to user: "Research complete: [title]"

**Context:**
- Project description and goals
- Existing research in the project (to avoid duplication)
- Specific questions or angles from the user

### Housekeeping Agent

**Trigger:** Manual ("review my projects") or scheduled (weekly cron)

**Flow:**
1. Job queries all projects for staleness indicators:
   - Projects with no activity in 30+ days
   - Feed items unassigned for 14+ days
   - Sections with no recent discussion
   - Potential duplicate content across projects
2. Claude receives the data and produces structured suggestions
3. Suggestions saved as a housekeeping report (content item)
4. Notification sent: "Housekeeping suggestions ready for review"

**Important:** Suggestions are read-only. No automated actions. User approves each action individually.

### Scaffolding Interviewer

**Trigger:** User creates a project with sections and opts for Claude-assisted scaffolding

**Flow:**
1. For each section, Claude asks one focused question
2. User answers in the discussion thread
3. Claude asks the next question (building on previous answers)
4. After all sections are covered, Claude produces an initial requirements document per section
5. Documents saved as content items in their respective sections

**State management:** The interview is a sequence of discussion messages. No special state machine — the conversation history IS the state. Each question includes a system prompt with the full interview context so far.

### Weekly Digest

**Trigger:** Scheduled cron (every Monday at 9am, configurable)

**Flow:**
1. Job queries all activity from the past 7 days:
   - New content items per project
   - Discussion highlights (most-discussed topics)
   - Claude-generated documents
   - New projects or sections created
2. Claude receives the data and produces a narrative summary
3. Digest saved as content item in the feed
4. Notification sent to both users

---

## 8. Claude Code Plugin (csf-live)

> This is a Phase 6 feature. Documented here for architectural awareness — do not build until Phase 6.

### Purpose

A Claude Code plugin that lets developers interact with CSF Live from the terminal during Claude Code sessions.

### Plugin Structure

```
csf-live-plugin/
├── .claude-plugin/
│   └── plugin.json
├── skills/
│   ├── csf-capture/SKILL.md       — Quick capture from terminal to feed/project
│   ├── csf-discuss/SKILL.md       — Post to a discussion thread
│   ├── csf-context/SKILL.md       — Pull project context into current session
│   ├── csf-status/SKILL.md        — View project status + recent activity
│   └── csf-research/SKILL.md      — Trigger a research task
├── commands/
│   ├── csf.md                     — /csf main command
│   └── csf-sync.md                — /csf-sync pull latest context
├── hooks/
│   └── hooks.json                 — HTTP hooks for activity logging
└── README.md
```

### Key Skills

**`/csf capture "idea about auth flow"`**
- Posts a quick idea to the feed or a specified project
- API call: `POST /api/feed/messages` or `POST /api/content-items`

**`/csf discuss project-slug "thoughts on the database schema"`**
- Posts to a project's root discussion
- API call: `POST /api/discussions/:id/messages`

**`/csf context project-slug`**
- Pulls project description, recent activity, key documents into the current Claude Code session context
- Useful when working on code related to a CSF Live project

**`/csf status`**
- Shows active projects, unread notifications, recent activity
- Quick terminal dashboard

### HTTP Hooks

```json
{
  "hooks": {
    "PostToolUse": {
      "url": "https://api.csf-live.com/hooks/activity",
      "events": ["significant-tool-use"]
    },
    "PostCompact": {
      "url": "https://api.csf-live.com/hooks/session-summary",
      "events": ["session-summary"]
    }
  }
}
```

These hooks log Claude Code session activity back into CSF Live, creating a record of development work that feeds into project context.

### `--add-dir` Shared Context

A synced directory that developers can mount in Claude Code sessions:

```bash
claude --add-dir ~/csf-live-context
```

The API server regenerates context files per project (debounced, max every 5 minutes):

```
~/csf-live-context/
├── CLAUDE.md                      # Index of all projects
├── project-alpha/
│   ├── CLAUDE.md                  # Project description, goals, recent decisions
│   ├── recent-discussion.md       # Last 50 messages, summarized
│   └── key-documents.md           # Links/summaries of important documents
└── project-beta/
    └── ...
```

This gives Claude Code sessions access to project context without needing API calls during the session.

---

## 9. Open Decisions

The following decisions need to be made before or during implementation:

### Decision 1: API Key vs Max Subscription vs Hybrid

| Option | Cost | Reliability | Complexity |
|--------|------|-------------|------------|
| **A: API key only** | $5-30/mo | High | Low |
| **B: Max subscription (CLI/SDK)** | $0 (covered by Max) | Medium | High |
| **C: Hybrid** | Lower than A | High for interactive, medium for batch | Medium |

**Recommendation:** Start with Option A (API key) for Phase 4. Revisit if costs exceed $50/mo or if Max subscription tooling matures. The complexity of maintaining authenticated CLI sessions on a server is not justified at this scale.

### Decision 2: Streaming UX

| Option | UX Quality | Complexity |
|--------|-----------|------------|
| **A: Full streaming** | Best — word-by-word | High (WebSocket relay, partial rendering) |
| **B: Complete response** | Adequate — spinner then full message | Low |
| **C: Chunked streaming** | Good — paragraph-by-paragraph | Medium |

**Recommendation:** Start with Option B (complete response with "Claude is thinking..." indicator) for Phase 4. Add streaming in Phase 5 polish if the wait times feel too long.

### Decision 3: Default Model

| Model | Speed | Quality | Cost |
|-------|-------|---------|------|
| claude-sonnet-4-6 | Fast | High | Lower |
| claude-opus-4-6 | Slower | Highest | Higher |

**Recommendation:** Sonnet for all interactive use cases (discussion responses, scaffolding, search). Opus for document generation and research agents where quality matters more than speed.

### Decision 4: Claude Code Plugin Scope

| Option | Scope | Phase |
|--------|-------|-------|
| **A: Full plugin** | Skills, hooks, commands, `--add-dir` context sync | Phase 6 |
| **B: Minimal integration** | Just `--add-dir` context sync | Phase 5 |
| **C: Skip for now** | No terminal integration | Defer indefinitely |

**Recommendation:** Option B in Phase 5 (context sync is high value, low effort), full plugin in Phase 6 if usage patterns justify it.

---

## End of Claude Integration Specification

This document should be read alongside:
- `specs/README.md` Section 13 (Claude Integration) — product requirements
- `specs/techstack-study.md` Section 9 (Claude Integration) — technical architecture
- `specs/techstack-study.md` Section 4 (Hono on Bun) — server capabilities that enable Claude CLI spawning
