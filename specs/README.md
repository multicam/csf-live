# THE FORGE — Product Specification Document

**Version**: 1.0  
**Date**: 2026-03-20  
**Authors**: JM (me) + Ben  
**Status**: Pre-development — Ready for Claude Code itemization  
**Purpose**: This document is the single source of truth for The Forge. It is written to be consumed by Claude Code for work order generation, architecture planning, and phased implementation.

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [Users and Access Model](#2-users-and-access-model)
3. [Platform and Device Strategy](#3-platform-and-device-strategy)
4. [Information Architecture](#4-information-architecture)
5. [Home and Feed](#5-home-and-feed)
6. [Quick Capture](#6-quick-capture)
7. [Projects](#7-projects)
8. [Sections within Projects](#8-sections-within-projects)
9. [Content and Documents](#9-content-and-documents)
10. [Views and Navigation](#10-views-and-navigation)
11. [Canvas and Drawing](#11-canvas-and-drawing)
12. [Discussion and Communication](#12-discussion-and-communication)
13. [Claude Integration](#13-claude-integration)
14. [Search](#14-search)
15. [Presence and Awareness](#15-presence-and-awareness)
16. [Notifications](#16-notifications)
17. [Housekeeping and Lifecycle](#17-housekeeping-and-lifecycle)
18. [Content Fluidity](#18-content-fluidity)
19. [Versioning](#19-versioning)
20. [Software Factory Pipeline Integration](#20-software-factory-pipeline-integration)
21. [Future Considerations](#21-future-considerations)
22. [Frontend Design Principles](#22-frontend-design-principles)
23. [Tech Stack](#23-tech-stack)
24. [Database Schema Guidance](#24-database-schema-guidance)
25. [Claude Code Integration Points](#25-claude-code-integration-points)
26. [Phasing Strategy](#26-phasing-strategy)

---

## 1. Product Overview

### What is The Forge?

The Forge is a private, collaborative AI workspace where a small team (initially two people) captures ideas, discusses them, draws and diagrams, organizes research, and shapes raw thinking into structured material ready for software development.

### Core Problem

The gap between having ideas and executing on them. Specifically:

- Ideas emerge during Friday sessions, on the bus, in Claude Code sessions, from Twitter bookmarks, from web research — and they scatter across tools with no shared persistent home.
- Claude Code and AI models amplify capability but also create information overload. There is no system to receive, organize, rank, and consolidate the flood.
- Two collaborators (JM and Ben) need a shared brain — a place where discussions, visual thinking, and AI-generated output converge and persist.

### What The Forge Is NOT

- It is not a Software Factory (that comes after). It is the pre-factory layer where ideas are shaped before entering the Refinery → Foundry → Planner → Assembler → Validator pipeline.
- It is not a co-editing tool. Users edit their own documents. No real-time simultaneous editing of the same artifact.
- It is not a project management tool with tickets, sprints, or boards. It is fluid and organic.
- It is not a native app. It is a responsive website that behaves like an app.

### Core Design Philosophy

- **Fluidity above structure**: Content stays loose until the user deliberately organizes it. The system never forces premature categorization.
- **Boring backend, magical frontend**: The database and API should use proven, standard patterns. All innovation goes into the frontend experience — how naturally and effortlessly users interact with their content.
- **Minimal friction capture**: Getting an idea into The Forge should require the absolute minimum number of taps, clicks, or words.
- **Multiple lenses, same data**: Every piece of content can be viewed through different perspectives (timeline, spatial, categorized, search) without duplication.

---

## 2. Users and Access Model

### Current Scope

Two platform owners: JM and Ben. They see everything on the platform — all projects, all content, all activity.

### Access Tiers

**Tier 1 — Platform Owners (JM, Ben)**
- Full visibility across all projects, feed, settings
- Can see all users on the platform
- Can create projects, invite third parties
- Can access all administrative functions

**Tier 2 — Third-Party Collaborators (future, design for it now)**
- Invited to specific projects only
- Can only see the project(s) they have been granted access to
- Can see the presence of platform owners within those projects (if owners choose to participate)
- Cannot see other projects, the general feed, or other third parties outside their project scope

### Authentication

- Simple authentication — passphrase-based login for Phase 1
- Design the database to support proper auth (email + password, OAuth) for later expansion
- No complex role management, permission matrices, or team hierarchies at this stage
- Session persistence — stay logged in across visits

### Implications for Database

- Users table with a `role` field (owner, collaborator)
- Project membership table mapping users to projects with access level
- All queries must respect access scoping — a collaborator must never see data outside their project(s)

---

## 3. Platform and Device Strategy

### Primary Platform

Responsive website. Not a native app, not an Electron wrapper. A well-built web application that feels like an app on every device.

### Device Targets

**Desktop (primary work environment)**
- Full experience — sidebar, multi-panel views, canvas drawing, keyboard shortcuts
- Where deep work happens — project editing, drawing, long discussions

**Tablet (Ben's primary drawing device)**
- Near-full experience — optimized for touch and stylus input
- Canvas/drawing is a first-class experience on tablet
- Comfortable for browsing, reading, light editing

**Mobile phone (capture and review)**
- Optimized for quick capture — voice, photo, text, link sharing
- Comfortable for reading the feed, browsing projects, reviewing content
- Push notifications lead back into relevant content
- Not optimized for heavy editing or canvas work

### Progressive Web App (Phase 2)

- PWA registration enables "Add to Home Screen" on mobile
- Enables push notifications via service worker
- Enables share target API — "Share to The Forge" from other apps (Twitter, browser, camera)
- Enables offline capture with background sync when connection returns

### Technical Requirements

- Camera access via standard HTML file input (`accept="image/*"` with optional `capture="camera"`)
- Photo library access via file input without capture attribute
- Voice recording via MediaRecorder API — hold button to record, release to stop
- Clipboard paste support — detect URLs, images, text
- Responsive breakpoints: mobile (<768px), tablet (768-1024px), desktop (>1024px)

---

## 4. Information Architecture

### Content Hierarchy

```
Platform
├── General Feed (shared, unstructured, chronological)
│   └── Feed Items (ideas, messages, links, photos, voice memos)
│
├── Projects
│   ├── Project Metadata (title, description, status, members)
│   ├── Sections (emergent or scaffolded)
│   │   ├── Discussion (linear, per section)
│   │   └── Content Items (documents, drawings, research, ideas)
│   ├── Project-level Canvas (tldraw)
│   ├── Project-level Discussion (root, shows all sections)
│   └── Documents (versioned, editable, typed)
│
└── Users
    ├── Presence (online/offline, current location)
    └── Activity (recent actions)
```

### Content Types

Every piece of content in The Forge is a **Content Item** with a type. Types include:

| Type | Description | Source |
|------|-------------|--------|
| `idea` | A raw thought, concept, or spark | Human input |
| `message` | A discussion message | Human input |
| `drawing` | A tldraw canvas document | Created in-app |
| `sketch` | A photo of hand-drawn content | Uploaded photo |
| `document` | A text document (markdown, PRD, notes) | Human or Claude |
| `link` | A web URL with optional metadata | Pasted or shared |
| `voice` | A voice recording (with transcription) | Recorded in-app |
| `photo` | An image (not a sketch — e.g. screenshot, reference) | Uploaded |
| `research` | AI-generated research output | Claude |
| `file` | Any other file attachment | Uploaded |

### Content Lifecycle

```
Captured → Feed (unassigned)
              ↓ (user assigns to project)
         Project / Section (active)
              ↓ (project completes or content stales)
         Archived
```

Content can also move between projects, be copied, or be split (part stays, part moves or spawns a new project).

---

## 5. Home and Feed

### What the User Sees on Login

The home screen has a **sidebar** for navigation and a **main content area** that defaults to the General Feed.

### Sidebar

- **Feed** — the shared general discussion (default view on login)
- **Projects** — list of active projects, with status indicators
- **Quick Capture** — persistent button/shortcut available from anywhere
- **Search** — global search entry point
- **Notifications** — unread count badge
- **User presence** — who's online (subtle indicator)

The sidebar feel should be soft, warm, conversational. Not corporate. Think Mud/Matter-style aesthetic — rounded, breathing, organic.

### General Feed

The feed is the default shared space. It behaves like a linear discussion between platform owners (like a Slack DM channel). Everything that doesn't belong to a project lives here.

**Feed capabilities:**
- Post text messages
- Drop images, files, voice recordings, links
- Content items in the feed can be grabbed and moved into a project
- Chronological ordering — newest at bottom, scroll up for history
- Each feed item shows: author, timestamp, content type indicator, content
- Feed items can be tagged or labeled for later reference
- Claude can be invoked in the feed (see Section 13)

---

## 6. Quick Capture

### Purpose

Minimize friction between "I have an idea" and "it's in The Forge." This is critical for mobile use but should work identically on desktop.

### Entry Points

1. **Persistent button** in the sidebar or bottom nav (mobile) — always accessible
2. **Keyboard shortcut** on desktop (e.g., `Cmd+K` or `Cmd+N`)
3. **Share target** (Phase 2 PWA) — share from other apps directly to The Forge

### Quick Capture Interface

A single modal or bottom sheet that accepts anything:

- **Text input** — type or paste. Auto-detects URLs and enriches them with metadata.
- **Voice button** — hold to record, release to stop. Stored as audio with transcription.
- **Camera button** — opens device camera directly for photo capture.
- **Photo library button** — opens device photo picker.
- **File drop zone** — drag and drop (desktop) or file picker (mobile).

### Targeting

Two modes available at capture time:

1. **Quick dump** — content goes to the General Feed with no further input required. One tap/click to capture.
2. **Targeted** — user optionally selects a project and/or section before submitting. Should be fast — a dropdown or recent-projects shortlist, not a long form.

The default is quick dump. Targeting is optional and should not slow down the capture flow.

### Post-Capture

- Content item appears immediately in the feed or target project
- If voice: transcription begins in background, item shows audio player while processing
- If image: thumbnail displayed immediately, any processing (OCR, description) happens in background
- If URL: link preview card generated asynchronously

---

## 7. Projects

### What is a Project?

A project is the primary organizing unit in The Forge. It is a container for related content — discussions, drawings, documents, research, ideas — around a shared goal or concept.

### Creating a Project

Projects can be created:

1. **From scratch** — user creates a new project with a title and optional description
2. **From the feed** — user selects one or more feed items and says "make this a project"
3. **From a split** — part of an existing project's content spawns a new project
4. **With scaffolding** — user creates a project and defines initial sections upfront, optionally with Claude interviewing them section by section to flesh out requirements

### Project Properties

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | UUID | auto | Unique identifier |
| `title` | string | yes | Human-readable project name |
| `slug` | string | auto | URL-friendly identifier |
| `description` | text | no | Brief description of the project's purpose |
| `status` | enum | auto | `active`, `paused`, `archived`, `completed` |
| `created_by` | user_id | auto | Who created it |
| `created_at` | timestamp | auto | When |
| `updated_at` | timestamp | auto | Last activity |
| `members` | user_id[] | auto | Who has access (owners always included) |

### Project States

- **Active** — default state, project is being worked on
- **Paused** — temporarily shelved, still visible but flagged
- **Archived** — out of active view, searchable but hidden from default lists
- **Completed** — finished, may have produced output (a shipped product, a PRD, etc.)

### Project Dashboard

When you open a project, you see:

- Project title and description (editable)
- Section list (if sections exist)
- Activity summary (recent items, who contributed)
- Entry points: Discussion, Canvas, Documents, Search within project
- View switcher (timeline, spatial, categorized, search — see Section 10)

---

## 8. Sections within Projects

### Purpose

Sections subdivide a project into logical areas. They are optional — a project can exist with no sections (everything lives at the project root).

### Creation

Sections emerge in two ways:

1. **Organic** — during a discussion, a user decides "this should be its own section" and creates one, optionally moving existing content into it
2. **Scaffolded** — when creating a project, the user defines sections upfront (e.g., "Research", "Design", "Technical Architecture", "Business Model"). When scaffolded, Claude can interview the user section by section to populate initial requirements and context.

### Section Properties

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | UUID | auto | Unique identifier |
| `project_id` | UUID | yes | Parent project |
| `title` | string | yes | Section name |
| `description` | text | no | What this section covers |
| `order` | integer | auto | Display order within project |
| `created_by` | user_id | auto | Who created it |
| `created_at` | timestamp | auto | When |

### Section Behavior

- Each section has its own **linear discussion thread**
- Content items belong to a section (or to the project root if no section is assigned)
- At the **project root view**, you see all discussions across all sections, with each message labeled by its section
- Sections can be reordered, renamed, merged, or deleted (content moves to project root)

---

## 9. Content and Documents

### Content Items

Every piece of content in The Forge is a Content Item. This is the atomic unit.

**Content Item Properties:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | UUID | auto | Unique identifier |
| `type` | enum | yes | See content types table in Section 4 |
| `title` | string | no | Optional title (auto-generated if absent) |
| `body` | text | no | Text content (markdown supported) |
| `media_url` | string | no | URL to attached media (image, audio, file) |
| `media_type` | string | no | MIME type of attached media |
| `metadata` | JSON | no | Flexible metadata (link previews, transcriptions, etc.) |
| `source` | enum | yes | `human`, `claude`, `agent`, `import` |
| `source_detail` | string | no | Additional source info (e.g., "claude-code", "mobile-capture", "twitter-share") |
| `project_id` | UUID | no | null = lives in general feed |
| `section_id` | UUID | no | null = lives at project root |
| `parent_id` | UUID | no | For threaded/linked content |
| `author_id` | UUID | yes | Who created it |
| `status` | enum | auto | `active`, `archived`, `merged` |
| `version` | integer | auto | Current version number |
| `created_at` | timestamp | auto | When created |
| `updated_at` | timestamp | auto | Last modified |

### Documents

Documents are a special class of Content Item with richer capabilities:

- **Editable** — full markdown editing in the browser
- **Versioned** — every save creates a new version with author attribution
- **Typed** — documents have a document_type field: `note`, `prd`, `blueprint`, `work-orders`, `research-summary`, `meeting-notes`, `freeform`
- **AI-generated documents** are clearly marked with `source: claude` and are fully editable by humans
- **Version history** is browseable — you can see who changed what and when, and revert to a previous version

### Tags

Content items and documents can be tagged with freeform tags for cross-cutting organization.

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Tag identifier |
| `name` | string | Tag label (lowercase, no spaces — use hyphens) |

Many-to-many relationship: a content item can have multiple tags, a tag applies to multiple items. Tags are global (not scoped to a project) so you can find related content across projects.

---

## 10. Views and Navigation

### Core Principle

The same underlying data, viewed through different lenses. The user switches views without affecting the data. All views are available at both the project level and the platform level.

### View 1: Timeline (default)

- Chronological list of all content items
- Newest at bottom (chat-style) or newest at top (feed-style) — user preference
- Each item shows: author avatar, timestamp, content type icon, content preview, section label (if in a project)
- Infinite scroll with lazy loading
- Filters: by content type, by author, by date range, by section

### View 2: Spatial / Canvas

- Content items laid out on a 2D canvas (powered by tldraw)
- Items can be freely positioned, grouped, connected with arrows
- This is the "Mac desktop" metaphor — files/items as objects on a surface you can arrange
- Spatial positions are saved per user (each user can have their own arrangement)
- New items appear in an "unsorted" area until positioned
- Can zoom, pan, and navigate freely
- Drawings created in this view are full tldraw canvases (see Section 11)

### View 3: Categorized

- Content grouped by type (Ideas, Drawings, Documents, Research, Links, etc.)
- Each category is a collapsible section
- Within each category, items are listed chronologically
- Counts shown per category
- Can also group by: section, author, tag, status

### View 4: Search

- Full-text search bar at the top
- Results appear as a filtered list with relevance ranking
- Search across: titles, body text, tags, metadata, transcriptions
- Natural language queries supported when Claude is invoked (see Section 14)
- Filter chips for: project, section, type, author, date range

### View Switching

- Persistent view switcher (icon tabs or dropdown) available within any project or at the platform level
- View preference is remembered per context (e.g., "I always use timeline in Project Alpha, spatial in Project Beta")
- Switching views is instant — no page reload, no data refetch

---

## 11. Canvas and Drawing

### Technology

**tldraw SDK** — embedded React component with hobby license.

### Canvas Experiences

There are two distinct canvas contexts:

**1. Project Canvas (Spatial View)**
- The spatial view of a project IS a tldraw canvas
- Content items from the project appear as cards/shapes on the canvas
- Users can draw around them, connect them with arrows, annotate
- This is where the "Mac desktop with files you can draw on" experience lives

**2. Standalone Drawing Documents**
- A user creates a new drawing within a project
- Full tldraw experience — freehand, shapes, text, arrows, connectors
- Saved as a versioned document (the tldraw JSON is the document content)
- Can be opened, edited, versioned like any other document

### Drawing Capabilities (provided by tldraw)

- Freehand drawing with pressure sensitivity (stylus support)
- Geometric shapes: rectangles, ellipses, triangles, diamonds, arrows, lines
- Text labels on shapes and as standalone elements
- Rich text (bold, italic, lists) in text and labels
- Connectors and arrows between shapes (with labels)
- Image and video embedding on canvas
- Bookmark shapes from pasted URLs
- Pan, zoom, scroll navigation
- Touch and stylus optimized
- Export to image (PNG, SVG)
- JSON serialization (for storage and versioning)

### Custom Shapes (Phase 2+)

Leverage tldraw's custom shape system to create Forge-specific shapes:

- **Idea card** — a shape representing a Content Item, showing title and type
- **Project link** — a shape that links to another project
- **Research node** — a shape showing a research summary with source link
- **Decision marker** — a shape indicating a decision was made, with rationale

### Photo/Sketch Input

- Users can upload photos of hand-drawn sketches
- These are stored as `sketch` type Content Items (image files)
- Claude can be asked to interpret the sketch — describe it, extract structure, or convert boxes-and-arrows into a tldraw diagram (future capability)
- Photos are not editable as drawings — they are reference snapshots

### Versioning for Drawings

- Every save of a tldraw canvas creates a new version
- Version history shows: version number, author, timestamp, thumbnail preview
- Users can view any previous version
- Users can restore a previous version (creates a new version based on the old one)

---

## 12. Discussion and Communication

### Discussion Model

Discussions are linear message threads. No sub-threading, no branching.

### Discussion Contexts

| Context | Scope | Behavior |
|---------|-------|----------|
| General Feed | Platform-wide | One continuous discussion between platform owners |
| Project Root | Per project | Shows all messages across all sections, labeled by section |
| Section | Per section | Focused discussion for that section only |

### Message Properties

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Unique identifier |
| `discussion_id` | UUID | Which discussion thread |
| `author_id` | UUID | Who posted (human or Claude) |
| `content` | text | Message body (markdown supported) |
| `content_type` | enum | `text`, `voice`, `image`, `file`, `claude-response` |
| `media_url` | string | Attached media if any |
| `metadata` | JSON | Additional data (e.g., voice transcription, link preview) |
| `source` | enum | `web`, `mobile`, `claude-code`, `agent` |
| `created_at` | timestamp | When posted |

### Discussion Features

- Markdown formatting in messages
- Inline image display
- Link preview cards for URLs
- Voice messages with playback and transcription
- File attachments with download
- Claude responses clearly distinguished (different styling, "Claude" as author)
- Scroll to latest, scroll to load history
- Real-time updates — new messages appear without refresh (WebSocket/SSE)

### Within a Project: Section Labels

When viewing the project root discussion, each message shows which section it belongs to. This gives an overview of all project activity in one stream while maintaining section attribution. Users can click a section label to jump into that section's focused discussion.

---

## 13. Claude Integration

### Architecture Constraint

Claude is invoked through **Claude Code CLI on the users' Max subscriptions**, not through API tokens. This means:

- The backend does not hold Anthropic API keys
- Claude interactions are routed through authenticated Claude Code sessions running on the server
- Each platform owner's Max plan is used for their own invocations
- This has infrastructure implications: the server needs access to an authenticated Claude Code CLI installation

### Fallback

An API token-based approach remains available as a fallback or for agent-initiated tasks (research, consolidation). The system should support both paths.

### Invocation Patterns

**1. Direct invocation in discussion**
- User tags Claude in a discussion message (e.g., `@claude` or a button)
- Claude receives the discussion context (recent messages, project context) and responds
- Claude's response appears as a message in the discussion thread, authored by "Claude"
- Claude can be asked to analyze, summarize, suggest, critique, generate

**2. Document generation**
- User asks Claude to generate a document (PRD, research summary, analysis)
- Claude produces a document that is saved as a versioned Content Item with `source: claude`
- The document appears in the project and is fully editable by humans

**3. Section scaffolding interview**
- When a project is created with sections, Claude interviews the user section by section
- One question at a time, building up requirements and context
- Results are saved as section content (initial requirements document per section)

**4. Research agent (background)**
- User triggers a research task (from discussion, quick capture, or explicitly)
- A background Claude Code session runs the research
- Results are structured and saved as Content Items with `source: agent`
- User is notified when complete

**5. Housekeeping agent (scheduled/manual)**
- Claude reviews project content and suggests: merges, archives, cleanups
- Claude generates weekly digests summarizing activity across projects
- User reviews and approves suggestions before they take effect

**6. Natural language search**
- User types a conversational query (e.g., "What did Ben say about the database last week?")
- Claude searches the knowledge base and returns a synthesized answer with references

### Claude Context Management

When Claude is invoked, it receives:

- **Project context**: title, description, section list, recent activity summary
- **Discussion context**: last N messages in the current thread
- **Relevant content**: documents and items related to the current section/topic
- **User context**: who is asking, their role

Context must be assembled by the backend and kept within token limits. Summarization of older content may be necessary for long-running projects.

---

## 14. Search

### Scope

Search operates at two levels:

1. **Global** — across all projects, the feed, and all content (respects access control)
2. **Project-scoped** — within a specific project and its sections

### Search Capabilities

**Text search:**
- Full-text search across: titles, body content, message text, document content
- Tag search
- Metadata search (e.g., URLs in links, file names)

**Filter search:**
- By content type (idea, drawing, document, link, voice, etc.)
- By author
- By date range
- By project / section
- By status (active, archived)
- By source (human, claude, agent)

**Natural language search (Claude-powered):**
- Conversational queries like "Remind me what Ben said last week about the auth flow"
- Claude interprets the query, searches the database, and returns a synthesized response with citations to specific content items
- This is especially important for mobile/voice — speak a question, get an answer

### Search Results

- Displayed as a list of content items with relevance ranking
- Each result shows: title/preview, type icon, project/section, author, date, relevance snippet
- Click a result to navigate to it in context (opens the project/section/discussion where it lives)

### Future: Content in Images

- OCR and image description for uploaded photos and sketches
- Searchable text extracted from images stored in metadata
- This makes hand-drawn content findable via text search

---

## 15. Presence and Awareness

### Platform Level

- Simple presence indicator: who is currently online
- Shown in the sidebar — small avatar with green dot for online users
- No "last seen" timestamps or detailed status (keep it minimal)

### Project Level

- When inside a project, you can see if the other person is also in that project
- Indicator: "Ben is in this project" with optional current section
- No cursor tracking, no live viewport sync
- Sufficient for awareness: "I know Ben is looking at this too"

### Implementation

- WebSocket-based presence using the real-time subscription layer
- Heartbeat ping every 30 seconds
- User goes "offline" after 2 minutes of no heartbeat
- Presence state: `online`, `offline`
- Current location tracked: `feed`, `project:<id>`, `project:<id>/section:<id>`

---

## 16. Notifications

### Notification Triggers

| Event | Notification | Priority |
|-------|-------------|----------|
| New message in a project you're a member of | Yes | Normal |
| Claude finished generating a document | Yes | Normal |
| Research agent completed | Yes | Normal |
| New content added to a project | Yes (badge only) | Low |
| Someone mentioned you in a discussion | Yes | High |
| Weekly digest available | Yes | Low |
| Housekeeping suggestions ready for review | Yes | Low |

### Delivery Methods

**In-app:**
- Notification bell/icon in sidebar with unread count
- Notification panel with list of recent notifications
- Click notification to navigate to relevant content
- Mark as read, mark all as read

**Push notifications (Phase 2 — PWA):**
- Browser push notifications for high-priority events
- Mobile push notifications when app is added to home screen
- User can configure which events trigger push notifications

### Visual Indicators

- Unread count badges on: sidebar items, project cards, section headers
- New content highlighted in the feed/discussion (e.g., "2 new messages" divider)
- Activity indicators on project cards in the sidebar

---

## 17. Housekeeping and Lifecycle

### The Mess Problem

Over time, The Forge will accumulate content. Without active housekeeping, it becomes a graveyard of stale ideas. Three lines of defense:

### Manual Housekeeping

- Users can archive content items, sections, or entire projects
- Users can merge content items (combine two ideas into one)
- Users can delete content (soft delete — recoverable for 30 days)
- Bulk operations: select multiple items and archive/move/tag

### Scheduled Review (Friday Session)

- A "Review Mode" that surfaces:
  - Projects with no activity in the last 30 days
  - Content items in the feed that have been there for over 2 weeks (unassigned)
  - Sections with no recent discussion
- User can quickly triage: keep, archive, or act on each item

### AI-Assisted Housekeeping

Claude periodically (or on demand) reviews content and suggests:

- **Merge suggestions**: "These three ideas in different projects seem related — merge?"
- **Archive suggestions**: "This project hasn't been touched in 6 weeks — archive?"
- **Stale content**: "These 12 feed items are over a month old — assign to projects or archive?"
- **Consolidation**: When a project has >N research items, Claude offers to produce a consolidated summary
- **Duplicate detection**: "This link was already shared in Project Alpha"

All suggestions require human approval before taking effect.

---

## 18. Content Fluidity

### Core Principle

Nothing is locked in place. Content should flow freely between contexts.

### Supported Operations

| Operation | Description |
|-----------|-------------|
| **Move** | Move a content item from the feed to a project, or between projects/sections |
| **Copy** | Duplicate a content item into another project/section (both copies persist) |
| **Split** | Break a content item into two: part stays, part becomes a new item |
| **Spawn project** | Select content items and create a new project from them |
| **Unassign** | Move a content item out of a project back to the general feed |
| **Merge** | Combine two content items into one (preserving both histories) |

### UX for Fluidity

- Drag-and-drop where possible (desktop/tablet)
- Context menu (right-click or long-press) with move/copy/split options
- Quick action: "Move to..." with project/section picker
- When moving content, any discussion context (messages that reference it) gets a link to the new location

---

## 19. Versioning

### What Gets Versioned

- **Documents** — every save creates a new version
- **Drawings (tldraw canvases)** — every save creates a new version
- **Content items** — edits create new versions (for items that support editing)

### Version Properties

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Version identifier |
| `content_item_id` | UUID | Parent content item |
| `version_number` | integer | Sequential (1, 2, 3...) |
| `content` | text/JSON | The content at this version |
| `author_id` | UUID | Who made this version |
| `change_summary` | text | Optional description of what changed |
| `created_at` | timestamp | When this version was created |

### Version History UI

- Accessible from any versioned document/drawing
- Shows: version list with author, timestamp, optional summary
- Thumbnail preview for drawings
- Diff view for text documents (Phase 2)
- Restore: click "restore" on any version to create a new version based on it

### Naming Convention

Following the CSF (Claude Software Factory) pattern:
- Documents: `{type}-v{N}.md` (e.g., `prd-v1.md`, `prd-v2.md`)
- Always maintain a `{type}-latest.md` that points to / copies the latest version
- This convention enables Claude Code integration — agents know to read `-latest` files

---

## 20. Software Factory Pipeline Integration

### Relationship

The Forge is the pre-factory layer. When a project's content has been discussed, researched, drawn, and refined enough, it enters the Software Factory pipeline.

```
The Forge (capture → discuss → draw → research → organize → shape)
    │
    ↓  "This project is ready — generate a PRD"
    │
Software Factory (Refinery → Foundry → Planner → Assembler → Validator)
    │
    ↓  Results flow back
    │
The Forge (review → iterate → discuss → refine → re-enter pipeline)
```

### Integration Points

**Forge → Factory:**
- User triggers "Run Refinery" on a project (or Claude suggests it)
- The project's content (discussions, documents, drawings, research) is assembled into context
- The Refinery agent generates a PRD, which becomes a versioned document in the project
- Subsequent pipeline stages (Foundry, Planner) also produce documents that live in the project

**Factory → Forge:**
- Pipeline-generated documents (PRDs, Blueprints, Work Orders) appear in the project
- They are fully editable by humans
- Edits can trigger re-processing (e.g., "PRD changed — re-run Foundry?")
- Validation reports surface as documents for review and discussion

### Pipeline as a Feature, Not a Requirement

Not all projects will enter the pipeline. Some are just idea spaces, research collections, or ongoing discussions. The pipeline is available when needed, not mandatory.

---

## 21. Future Considerations

These are NOT in scope for initial phases but the architecture should not preclude them:

### Diderot Integration
- JM uses Diderot for content curation and quality ranking from web sources
- Future: Diderot output feeds into The Forge as curated content items
- Architecture: API endpoint that accepts Diderot-formatted content

### Share Sheet (PWA)
- "Share to The Forge" from any mobile app
- Requires PWA with Web Share Target API
- Content shared this way goes to the feed or a configured default project

### Offline Capture
- Capture content when offline (mobile on the subway)
- Background sync when connection returns
- Requires PWA with service worker and IndexedDB for local queue

### Co-viewing (not co-editing)
- Two users looking at the same canvas/document simultaneously
- Cursor indicators showing where each person is looking
- NOT simultaneous editing — just awareness

### Template Library
- Pre-built project templates (e.g., "Product Idea", "Research Project", "Business Model")
- Each template defines sections, initial documents, and Claude interview prompts

### External Integrations
- GitHub: link projects to repos
- Calendar: Friday session scheduling and agenda generation
- Email: forward emails into The Forge

### Third-Party Collaboration
- Full implementation of Tier 2 access (see Section 2)
- Invitation flow, project-scoped views, limited permissions
- Notification preferences per collaborator

---

## 22. Frontend Design Principles

### Aesthetic Direction

**Soft, warm, conversational.** Not corporate SaaS. Not cold utility.

- Inspired by Mud, Matter, and tools that feel like they were made by humans for humans
- Rounded corners, breathing whitespace, organic color palette
- Typography that is warm and readable — not geometric/technical
- Subtle animations — content that gently appears, not snaps into place
- Dark mode as a first-class option (not an afterthought)

### Interaction Quality

- **Transitions**: Smooth, purposeful. View switching should feel like turning a page, not reloading.
- **Feedback**: Every action has a visible response — optimistic UI updates, subtle toasts, progress indicators.
- **Touch-friendly**: All interactive elements sized for finger/stylus on tablet. No tiny click targets.
- **Keyboard-first on desktop**: Power users can navigate, search, create, and switch views without touching the mouse.

### Visual Hierarchy

- Content is the star. Chrome (navigation, controls) should recede.
- Use size, weight, and color to create clear hierarchy — not borders and dividers.
- Empty states should be inviting, not blank. "No content yet — drop an idea here or start a discussion."

### Responsiveness

- Not "desktop shrunk down" — genuinely redesigned for each breakpoint
- Mobile: single column, bottom nav, swipe gestures, quick capture prominent
- Tablet: two-panel (sidebar + main), full canvas support, touch optimized
- Desktop: multi-panel option, keyboard shortcuts, hover states, drag and drop

---

## 23. Tech Stack

> This section is a recommendation based on the requirements above. It is separated from the spec because stack choices can be revisited without affecting product requirements.

---

### Frontend

| Component | Choice | Rationale |
|-----------|--------|-----------|
| **Framework** | React 19 + TypeScript | Both users know it. tldraw requires React. Massive ecosystem. |
| **Build tool** | Vite | Fast dev server, fast builds, excellent React support |
| **Styling** | Tailwind CSS 4 | Utility-first, fast iteration, responsive built-in |
| **UI primitives** | Radix UI (unstyled) | Accessible, composable, style-agnostic — lets us own the aesthetic |
| **Canvas/Drawing** | tldraw SDK (hobby license) | Best-in-class embeddable canvas for React. Custom shapes, AI primitives, stylus support. |
| **Rich text editing** | TipTap or Milkdown | For markdown document editing in-browser |
| **State management** | Zustand | Lightweight, TypeScript-native, no boilerplate |
| **Real-time** | Supabase Realtime (WebSocket) | Presence, live updates, discussion sync |
| **Routing** | React Router v7 or TanStack Router | File-based routing, nested layouts |
| **Markdown rendering** | react-markdown + remark plugins | For rendering document content |
| **Mermaid diagrams** | mermaid.js | For structured diagrams Claude can generate |
| **Icons** | Lucide React | Clean, consistent, open-source |

### Backend

| Component | Choice | Rationale |
|-----------|--------|-----------|
| **Runtime** | Bun | Fast, TypeScript native, built-in SQLite, good fetch API |
| **API framework** | Hono | Lightweight, fast, excellent TypeScript, runs on Bun/Node/Deno/edge |
| **Database** | Supabase (hosted Postgres) | Auth, Realtime subscriptions, Row Level Security, storage buckets, generous free tier. Eliminates need to build auth, realtime, and file storage from scratch. |
| **ORM / Query** | Drizzle ORM | TypeScript-first, lightweight, works with Postgres, excellent DX |
| **File storage** | Supabase Storage | For images, voice recordings, file attachments. S3-compatible. |
| **Background jobs** | BullMQ + Redis (or Supabase Edge Functions) | For research agents, transcription, consolidation tasks |
| **Voice transcription** | Whisper API (OpenAI) or Deepgram | For converting voice recordings to text |

### Claude Integration

| Component | Choice | Rationale |
|-----------|--------|-----------|
| **Primary** | Claude Code CLI (headless, `-p` flag) | Runs on users' Max subscriptions, no API token cost |
| **Fallback** | Anthropic API (claude-sonnet-4-6) | For agent tasks where CLI isn't practical |
| **Agent SDK** | @anthropic-ai/claude-code-sdk-python or TS SDK | For programmatic Claude Code invocation from the backend |
| **Claude Code Plugin** | Custom plugin (`the-forge`) | Skills, hooks, commands for terminal integration |

### Infrastructure

| Component | Choice | Rationale |
|-----------|--------|-----------|
| **Hosting (frontend)** | Vercel or Cloudflare Pages | Free tier, global CDN, instant deploys |
| **Hosting (API)** | Railway or Fly.io | Simple container deployment, cheap for 2-user app |
| **Domain** | Custom domain + Cloudflare DNS | SSL, caching, DDoS protection |
| **Monitoring** | Sentry (free tier) | Error tracking |
| **Analytics** | Plausible (self-hosted) or none | Privacy-respecting, lightweight — or skip entirely for now |

### Development Tools

| Tool | Purpose |
|------|---------|
| **Monorepo** | Turborepo or Bun workspaces |
| **Code quality** | Biome (linting + formatting, replaces ESLint + Prettier) |
| **Testing** | Vitest (unit) + Playwright (E2E) |
| **CI/CD** | GitHub Actions |
| **Version control** | Git + GitHub |

---

## 24. Database Schema Guidance

### Principles

- All tables have UUID primary keys (`gen_random_uuid()`)
- All tables have `created_at` and `updated_at` timestamps
- Soft deletes where appropriate (`deleted_at` nullable timestamp)
- Row Level Security (RLS) policies via Supabase for access control
- JSONB columns for flexible metadata — don't over-normalize early
- Indexes on all foreign keys and commonly filtered columns

### Core Tables

```
users
  id, name, email, role (owner/collaborator), passphrase_hash,
  avatar_url, created_at, updated_at

projects
  id, title, slug, description, status (active/paused/archived/completed),
  created_by → users, created_at, updated_at

project_members
  project_id → projects, user_id → users, role (owner/member),
  invited_by → users, joined_at

sections
  id, project_id → projects, title, description, order,
  created_by → users, created_at, updated_at

content_items
  id, type (idea/message/drawing/sketch/document/link/voice/photo/
       research/file),
  title, body, media_url, media_type, metadata (JSONB),
  source (human/claude/agent/import), source_detail,
  project_id → projects (nullable), section_id → sections (nullable),
  parent_id → content_items (nullable), author_id → users,
  status (active/archived/merged), version (integer),
  created_at, updated_at, deleted_at

content_versions
  id, content_item_id → content_items, version_number,
  body, media_data (JSONB — for tldraw JSON etc.),
  author_id → users, change_summary, created_at

tags
  id, name (unique, lowercase)

content_item_tags
  content_item_id → content_items, tag_id → tags (composite PK)

discussions
  id, context_type (feed/project/section),
  context_id (nullable — project_id or section_id),
  created_at

messages
  id, discussion_id → discussions, author_id → users,
  content, content_type (text/voice/image/file/claude-response),
  media_url, metadata (JSONB), source (web/mobile/claude-code/agent),
  created_at

notifications
  id, user_id → users, type, title, body,
  reference_type, reference_id,
  read (boolean), created_at

agent_runs
  id, project_id → projects (nullable), agent_type (researcher/
       consolidator/digest/scaffolder),
  trigger (manual/auto/scheduled), input_prompt,
  status (queued/running/completed/failed), result_summary,
  tokens_used, triggered_by → users, created_at, completed_at

presence
  user_id → users, status (online/offline),
  current_location, last_heartbeat
```

### Key Indexes

```sql
CREATE INDEX idx_content_items_project ON content_items(project_id);
CREATE INDEX idx_content_items_section ON content_items(section_id);
CREATE INDEX idx_content_items_type ON content_items(type);
CREATE INDEX idx_content_items_status ON content_items(status);
CREATE INDEX idx_content_items_author ON content_items(author_id);
CREATE INDEX idx_content_items_created ON content_items(created_at);
CREATE INDEX idx_messages_discussion ON messages(discussion_id);
CREATE INDEX idx_messages_created ON messages(created_at);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, read);
CREATE INDEX idx_content_versions_item ON content_versions(content_item_id);
CREATE INDEX idx_sections_project ON sections(project_id);
```

### Full-Text Search

```sql
-- Add tsvector columns for full-text search
ALTER TABLE content_items ADD COLUMN search_vector tsvector;
ALTER TABLE messages ADD COLUMN search_vector tsvector;

-- Auto-update search vectors via trigger
CREATE FUNCTION update_content_search() RETURNS trigger AS $$
BEGIN
  NEW.search_vector := to_tsvector('english',
    coalesce(NEW.title, '') || ' ' || coalesce(NEW.body, ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER content_items_search_update
  BEFORE INSERT OR UPDATE ON content_items
  FOR EACH ROW EXECUTE FUNCTION update_content_search();

-- GIN indexes for fast full-text search
CREATE INDEX idx_content_items_search ON content_items USING GIN(search_vector);
CREATE INDEX idx_messages_search ON messages USING GIN(search_vector);
```

---

## 25. Claude Code Integration Points

### For developers using Claude Code alongside The Forge:

**Plugin: `the-forge`**

```
the-forge/
├── .claude-plugin/
│   └── plugin.json
├── skills/
│   ├── forge-capture/SKILL.md      — Quick capture from terminal
│   ├── forge-discuss/SKILL.md      — Post to a discussion
│   ├── forge-context/SKILL.md      — Pull project context into session
│   ├── forge-status/SKILL.md       — View project status + inbox
│   ├── forge-draw/SKILL.md         — Generate Mermaid/diagram from terminal
│   └── forge-research/SKILL.md     — Trigger research task
├── commands/
│   ├── forge.md                    — /forge main command
│   └── forge-sync.md              — /forge-sync pull latest context
├── hooks/
│   └── hooks.json                 — HTTP hooks for activity logging
├── agents/
│   └── forge-researcher.md        — Sub-agent for deep research
└── README.md
```

**Hooks (HTTP, using Claude Code v2.1.76+ feature):**

- `PostToolUse` → Log significant tool uses to activity feed
- `PostCompact` → Send session summary to knowledge base
- `StopFailure` → Log failed sessions for debugging

**`--add-dir` shared context:**

A synced directory that both users can mount:

```bash
claude --add-dir ~/forge-context
```

Contains auto-generated `CLAUDE.md` files per project with:
- Project description and goals
- Recent discussion highlights
- Key decisions made
- Open questions and blockers
- Current document summaries

Regenerated by the backend on content changes (debounced, max every 5 minutes).

---

## 26. Phasing Strategy

### Phase 1: Foundation + Feed (Weeks 1-2)

**Goal**: Two people can log in, see a shared feed, and post content to it.

- Supabase project setup (database, auth, realtime, storage)
- Database schema: users, content_items, messages, discussions
- Backend API: auth, feed CRUD, message posting
- Frontend: login, sidebar, feed view, basic message posting
- Basic responsive layout (desktop + mobile)
- Text, image upload, and link sharing in feed

### Phase 2: Projects + Sections (Weeks 3-4)

**Goal**: Users can create projects, organize content into them, and discuss within sections.

- Database: projects, sections, project_members
- Backend API: project CRUD, section CRUD, content assignment
- Frontend: project list, project dashboard, section navigation
- Move content from feed to projects
- Discussion per section, project root view showing all sections
- View switcher: timeline view (default)

### Phase 3: Canvas + Drawing (Weeks 5-6)

**Goal**: tldraw embedded for spatial views and standalone drawings.

- tldraw SDK integration (hobby license)
- Spatial view for projects (content items as shapes on canvas)
- Standalone drawing creation and editing
- Drawing versioning (tldraw JSON stored as content versions)
- Photo/sketch upload for hand-drawn content
- Tablet/stylus optimization

### Phase 4: Claude Integration (Weeks 7-8)

**Goal**: Claude participates in discussions, generates documents, and interviews for scaffolding.

- Claude Code CLI integration (headless invocation from backend)
- @claude mention in discussions with context assembly
- Document generation (PRD, summaries)
- Section scaffolding with Claude interview
- API fallback path for Claude invocation

### Phase 5: Search + Notifications + Polish (Weeks 9-10)

**Goal**: Full search, push notifications, and frontend polish.

- Full-text search (Postgres tsvector)
- Natural language search (Claude-powered)
- Filter and faceted search UI
- Notification system (in-app)
- Push notifications (PWA setup)
- Presence indicators (online/offline, current location)
- Quick capture refinement (voice recording, camera access)
- Categorized view
- Mobile experience polish

### Phase 6: Housekeeping + Pipeline Bridge (Weeks 11-12)

**Goal**: The system maintains itself and connects to the Software Factory.

- Archive/merge/delete operations with bulk support
- Review Mode (surface stale content)
- AI-assisted housekeeping suggestions
- Weekly digest generation
- Software Factory pipeline trigger (Run Refinery from a project)
- Pipeline documents flowing back into projects
- Claude Code plugin (the-forge) for terminal integration
- HTTP hooks integration
- `--add-dir` context sync service

---

## End of Specification

This document should be used as input for Claude Code work order generation. Each section maps to capabilities that can be decomposed into concrete implementation tasks. The phasing strategy provides a recommended order of operations, but individual work orders should be generated from the capability descriptions in Sections 5-21, with technical guidance from Sections 23-25.
