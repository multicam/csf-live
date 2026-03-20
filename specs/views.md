# CSF Live — Views & Navigation

**Source**: Section 10 of original spec
**Related**: [Layout](layout.md), [Canvas](canvas.md), [Search](search.md), [Content Model](content.md)

---

## Core Principle

The same underlying data, viewed through different lenses. The user switches the Feed column (column 2) mode without affecting the data.

### The Canvas Is a Separate Mode

The tldraw canvas lives at `/` as a full-screen scratchpad. It is **not** a background behind the feed columns. The canvas and the feed (`/feed/*`) are two separate top-level modes of the app. See [Layout](layout.md).

Drawing content items (type: `drawing`) open as embedded tldraw editors in the Detail column (column 3) within the feed layout.

### Feed Column Modes

"Views" are **modes of the Feed column** (column 2 in the `/feed/*` layout). They control how content items are organized and displayed.

### Mode Availability

| Mode | Global (`/feed`) | Project (`/feed/:slug`) | Notes |
|------|-----------------|------------------------|-------|
| **Timeline** | Yes | Yes | Default — chronological list |
| **Categorized** | Yes | Yes | Grouped by content type |
| **Search** | Global | Scoped to project | Results with relevance ranking |

> **The General Feed is not a "mode."** At `/feed`, the Feed column shows the global feed (messages + unassigned content items interleaved chronologically). This is the default state, not a mode you switch to. Modes (categorized, search) alter how items are organized within that feed. See [Feed](feed.md).

### Default Sort Orders

- **Feed** (General Feed context): newest at bottom, scroll up for history (chat-style). This is fixed, not a preference.
- **Project Timeline mode**: newest at top (feed-style). User can toggle.

---

## Mode 1: Timeline (default)

- Chronological list of all content items in the Feed column
- Newest at bottom (chat-style) or newest at top (feed-style) — user preference
- Each item shows: author avatar, timestamp, content type icon, content preview, section label (if in a project)
- Infinite scroll with lazy loading
- Filters: by content type, by author, by date range, by section

## Mode 2: Categorized

- Content grouped by type (Ideas, Drawings, Documents, Research, Links, etc.) in the Feed column
- Each category is a collapsible section
- Within each category, items are listed chronologically
- Counts shown per category
- Can also group by: section, author, tag, status

## Mode 3: Search

- Feed column shows search results when a search is active
- Results appear as a filtered list with relevance ranking
- Search across: titles, body text, tags, metadata, transcriptions
- Natural language queries supported when Claude is invoked (see [Search](search.md))
- Filter chips for: project, section, type, author, date range

---

## Mode Switching

- Mode switcher (icon tabs or dropdown) available in the Feed column header
- Mode preference is remembered per context (e.g., "I always use timeline in Project Alpha, categorized in Project Beta")
- **Data**: switching modes is instant — no refetch. The underlying data is already loaded.
- **Visual transition**: brief crossfade, 200–300ms. Not a hard cut, not a full column reload.
