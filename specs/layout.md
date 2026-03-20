# CSF Live — Layout & Navigation

**Version**: 3.0
**Date**: 2026-03-21
**Status**: Definitive
**Wireframe**: [tldraw wireframe](https://www.tldraw.com/f/wzJnSeYy6Ndbua3N3Ui9T?d=v15.-219.2166.2399.page) | Export: `specs/CSF-Live-V1.tldr`
**Related**: [Design](design.md), [Feed](feed.md), [Views](views.md), [Canvas](canvas.md)

---

## Core Concept

Two modes, one app:

1. **Canvas** (`/`) — a shared tldraw scratchpad. Draw, think, arrange. Save work to the feed.
2. **Feed** (`/feed/*`) — a 3-column email client. Browse, read, edit, compose.

The canvas produces content. The feed organizes it.

---

## Mode 1: Canvas (`/`)

The default landing page. A full-screen tldraw canvas — the team's shared whiteboard.

This is a **single app-level document** (CSF-Live-V1.tldr). Not per-project. Not a background behind columns. It's the whole screen.

### What's on the Canvas

- Freehand drawings, shapes, text, arrows — anything tldraw supports
- Clickable nodes for navigation: project cards, a "Feed" entry point
- Click a project node → navigates to `/feed/:project-slug`
- Click the Feed node → navigates to `/feed`

### Save Behavior

The canvas is a **scratchpad that produces feed items**:

| Action | What Happens |
|--------|-------------|
| **Save** | Snapshot the current canvas state → create a new `drawing` content item in the feed (or targeted project). Canvas keeps its content. A version of the canvas document is recorded. |
| **Save and Close** | Same snapshot → new `drawing` feed item → canvas is **wiped clean** (blank slate). Fresh scratchpad. |
| **No save** | Canvas content persists between sessions (it's a versioned document). Nothing goes to the feed. |

The canvas itself is versioned — each "Save" creates a new version of the canvas document. The `drawing` content item created in the feed is a **snapshot copy**, not a reference to the canvas.

### Canvas Targeting

When saving, the user chooses where the drawing goes:

- **Quick dump** (default) → drawing goes to the general feed (`/feed`)
- **Targeted** → user picks a project (and optionally a section) → drawing goes to `/feed/:project-slug`

Same targeting pattern as Quick Capture (see [Feed — Quick Capture](feed.md#quick-capture)).

---

## Mode 2: Feed (`/feed/*`)

A 3-column email-client layout. No canvas background — just columns.

```
┌──────────────────────────────────────────────────────────────────┐
│ [●] App Menu                                    [●] Status      │
├────────────┬──────────────────────┬──────────────────────────────┤
│ Projects   │ Feed                 │ Detail                       │
│ (column 1) │ (column 2)           │ (column 3)                   │
│            │                      │                              │
│ ┌────────┐ │ ┌──────────────────┐ │ ┌──────────────────────────┐│
│ │Project │ │ │ Message bubble   │ │ │                          ││
│ ├────────┤ │ ├──────────────────┤ │ │  TipTap editor           ││
│ │Project │ │ │ Content card     │ │ │  or Image viewer         ││
│ ├────────┤ │ ├──────────────────┤ │ │  or Discussion thread    ││
│ │Project │ │ │ Content card     │ │ │  or tldraw canvas        ││
│ ├────────┤ │ ├──────────────────┤ │ │  or Audio player         ││
│ │Project │ │ │ Message bubble   │ │ │  or Project dashboard    ││
│ └────────┘ │ ├──────────────────┤ │ │                          ││
│            │ │ [compose input]  │ │ └──────────────────────────┘│
│            │ └──────────────────┘ │                              │
└────────────┴──────────────────────┴──────────────────────────────┘
```

### Column 1: Projects (Left)

A vertical list of projects.

**Contents:**
- **General Feed** item at the top → click to show global feed (`/feed`)
- Project cards: title, status indicator (active/paused/archived), unread badge
- Active project is highlighted (selected state)
- Click a project → Feed column scopes to that project (`/feed/:slug`)
- Sortable: by recent activity (default), alphabetical, status

**At the bottom:**
- Quick Capture button (or compose shortcut)
- User presence indicators (who's online)

### Column 2: Feed (Center)

The main content stream.

| URL | Feed Shows |
|-----|-----------|
| `/feed` | Global feed — messages + unassigned content items interleaved chronologically |
| `/feed/:slug` | Project feed — project's content items + discussion messages |
| `/feed/:slug?section=:id` | Section-scoped — one section's content + discussion |

**Feed features:**
- Scrollable list of cards (messages as chat bubbles, content items as type-specific cards)
- Compose input at the bottom (see below)
- Feed item rendering per content type: see [Feed Item Rendering](feed.md#feed-item-rendering)
- Modes: chronological (default), categorized by type, search results — see [Views](views.md)

### Compose Input

The compose input at the bottom of the Feed column **is** Quick Capture:

- **Default**: text input for messages. Type and press `Cmd+Enter` to post.
- **Enhanced mode** (click `+` or `Cmd+N`): expands with voice, camera, file, and targeting options.
- **Context-aware**: at `/feed` it posts to global feed. At `/feed/:slug` it posts to the project. A target dropdown lets you redirect to a different project without navigating away.

One input, two modes. No separate Quick Capture modal.

### Column 3: Detail (Right)

Context-specific editor/viewer. Shows the full detail of whatever is selected in the Feed column:

| Selection | Detail Shows |
|-----------|-------------|
| Message → | Full message with thread context, reply input |
| Idea → | Idea body, tags, metadata, edit capability |
| Document → | TipTap editor with full markdown editing |
| Drawing → | **tldraw canvas editor** (editable — this is how project drawings are edited) |
| Link → | Link preview with metadata, original URL, notes |
| Photo / Sketch → | Image viewer, zoom, metadata |
| Voice → | Audio player, transcription text, metadata |
| Research → | AI research output, sources, full content |
| File → | File metadata, preview if possible, download |
| Section → | Section discussion thread |
| Project (no item selected) → | Project dashboard: title, description, sections, activity |
| Nothing selected → | Empty state: "Select an item to view details" |

**The Detail column is the editor:**
- Documents → TipTap inline editing
- Drawings → tldraw inline editing (the drawing content item opens as a full tldraw canvas in column 3)
- Content metadata (tags, title, status) → editable inline
- Version history → accessible from Detail column header

---

## Controls

### App Menu (Top-Left)

A button that opens a command palette / dropdown:

- **Home (Canvas)** — navigate to `/` (the scratchpad)
- **Search** — global search (results appear in Feed column)
- **Notifications** — notification list (overlay or in Feed column)
- **Settings** — app settings
- **Keyboard shortcuts** reference
- **User presence** — who's online

Primary navigation is: column 1 (projects) → column 2 (feed) → column 3 (detail). App Menu is secondary.

### Status Bar (Bottom-Right)

Compact status area:
- Connectivity indicator (online/offline)
- Background task status (transcription, research agent running)
- Settings shortcut

---

## URL Model

```
/                                        → Canvas (full-screen scratchpad)
/feed                                    → Feed (3-column, global feed)
/feed/:project-slug                      → Feed scoped to project
/feed/:project-slug?section=:section-id  → Feed filtered to section
/feed/:project-slug/doc/:doc-id          → Feed + document in Detail
/feed/:project-slug/item/:item-id        → Feed + content item in Detail
/search?q=...                            → Feed layout with search results
```

| URL prefix | Layout | Description |
|------------|--------|-------------|
| `/` | Full-screen tldraw | Scratchpad canvas. Navigation nodes on canvas. |
| `/feed/*` | 3-column email client | Projects (left), Feed (center), Detail (right). |

TanStack Router maps URLs:
- `/` vs `/feed` determines the mode (canvas vs columns)
- Project slug determines Feed column scope + column 1 selection
- Nested params (`/doc/:id`, `/item/:id`) determine Detail column content
- Query params for section filtering and search

---

## Component-Container Cards

All cards in all columns are **component-containers** — they adapt to available space:

- **Narrow column** → compact card: title + type icon + timestamp only
- **Medium column** → standard card: title + preview + author + timestamp
- **Wide column** → expanded card: title + full preview + metadata + action buttons

Implementation uses CSS container queries (`@container`) so each card responds to its container width, not the viewport width.

```css
@container (min-width: 300px) {
  .card { /* show preview text */ }
}
@container (min-width: 500px) {
  .card { /* show full metadata + actions */ }
}
```

---

## Responsive Behavior

### Desktop (>1024px)

- All 3 columns visible in `/feed`, resizable by dragging dividers
- Minimum column widths: Projects ~200px, Feed ~300px, Detail ~350px
- Keyboard shortcuts for navigation, column toggles
- Hover states on cards

### Tablet (768-1024px)

- 3 columns visible but narrower
- Columns resizable by drag (touch-friendly drag handles)
- Projects column collapsible to icon-width
- Cards compact to fit narrower containers

### Mobile (<768px)

- **4 tabs** at bottom: Canvas | Projects | Feed | Detail
- Each tab is full-screen
- Canvas tab = full-screen scratchpad (same as `/`)
- Feed tab = scrollable feed list
- Detail tab = appears when item is tapped in Feed
- Projects tab = project list
- App Menu and Status become bottom-sheet on tap
- Compose input rises above keyboard

### Column Visibility by Breakpoint

| Breakpoint | Projects | Feed | Detail | Canvas (`/`) |
|-----------|---------|------|--------|-------------|
| Desktop | Always visible | Always visible | Visible when item selected | Full screen (separate mode) |
| Tablet | Collapsible | Always visible | Visible when item selected | Full screen (separate mode) |
| Mobile | Tab | Tab (default) | Tab | Tab |

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd+K` | Open App Menu (command palette) |
| `Cmd+N` | Expand compose input to Quick Capture mode |
| `Cmd+1` | Focus Projects column |
| `Cmd+2` | Focus Feed column |
| `Cmd+3` | Focus Detail column |
| `Cmd+\` | Toggle Projects column visibility |
| `Cmd+Shift+F` | Focus search |
| `Escape` | Close overlays, deselect, return focus to Feed |
| `↑/↓` | Navigate items in Feed column |
| `Enter` | Open selected item in Detail column |
| `Cmd+Enter` | Post message (when compose input focused) |

---

## Key Clarifications

### Canvas ≠ Project Spatial View

The canvas at `/` is a **single app-level scratchpad**. It is NOT a per-project background. Project drawings are content items (type: `drawing`) that live in the project feed and are edited in the Detail column (column 3) via an embedded tldraw editor.

### Canvas Produces Feed Items

The scratchpad is where visual thinking happens. When the thinking is ready to be shared or organized, the user saves it — this creates a `drawing` content item in the feed. The canvas can be wiped ("Save and Close") or kept ("Save" with versioning).

### Drawings in the Detail Column

When you click a `drawing` content item in the Feed column, it opens as a fully editable tldraw canvas in the Detail column. This is how project drawings are created and edited — not on the background canvas, but inline in the 3-column layout.

### Compose = Quick Capture

There is no separate Quick Capture modal. The compose input at the bottom of the Feed column serves both purposes: simple text messages (default) and rich capture with voice/camera/file/targeting (enhanced mode via `+` button or `Cmd+N`).
