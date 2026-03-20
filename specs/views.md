# CSF Live — Views & Navigation

**Source**: Section 10 of original spec
**Related**: [Layout](layout.md), [Canvas](canvas.md), [Search](search.md), [Content Model](content.md)

---

## Core Principle

The same underlying data, viewed through different lenses. The user switches the List Panel mode without affecting the data. The canvas is always present — it is not a view you switch to.

### The Canvas Is Not a View

The tldraw canvas is the permanent background of the entire application. It is always present and always interactive. See [Layout](layout.md) for how the canvas, panels, and controls are structured.

- **Feed mode**: the canvas is a general shared whiteboard
- **Project mode**: the canvas becomes that project's spatial view, with content items as custom card shapes

### List Panel Modes

"Views" in the traditional sense are now **modes of the List Panel** (right side). They control how content items are organized and displayed in the panel.

### View Availability

| View / Mode | Platform level | Project level | Notes |
|-------------|---------------|--------------|-------|
| **Spatial / Canvas** | Always present | Always present | Permanent background — not a switchable view. See [Layout](layout.md) and [Canvas](canvas.md). |
| **Timeline** | Yes | Yes | Default List Panel mode — chronological |
| **Categorized** | Yes | Yes | Alternative List Panel mode — grouped by type |
| **Search** | Global (not scoped to a level) | — | List Panel mode when searching |

> **The Feed is not a view.** The General Feed is a distinct top-level context with its own semantics (chat-style, messages + content items interleaved). It is not the same as the Timeline mode. See [Feed](feed.md).

### Default Sort Orders

- **Feed** (General Feed context): newest at bottom, scroll up for history (chat-style). This is fixed, not a preference.
- **Project Timeline mode**: newest at top (feed-style). User can toggle.

---

## Mode 1: Timeline (default)

- Chronological list of all content items in the List Panel
- Newest at bottom (chat-style) or newest at top (feed-style) — user preference
- Each item shows: author avatar, timestamp, content type icon, content preview, section label (if in a project)
- Infinite scroll with lazy loading
- Filters: by content type, by author, by date range, by section

## Mode 2: Categorized

- Content grouped by type (Ideas, Drawings, Documents, Research, Links, etc.) in the List Panel
- Each category is a collapsible section
- Within each category, items are listed chronologically
- Counts shown per category
- Can also group by: section, author, tag, status

## Mode 3: Search

- List Panel shows search results when a search is active
- Results appear as a filtered list with relevance ranking
- Search across: titles, body text, tags, metadata, transcriptions
- Natural language queries supported when Claude is invoked (see [Search](search.md))
- Filter chips for: project, section, type, author, date range

---

## List Panel Mode Switching

- Mode switcher (icon tabs or dropdown) available within the List Panel header
- Mode preference is remembered per context (e.g., "I always use timeline in Project Alpha, categorized in Project Beta")
- **Data**: switching modes is instant — no refetch. The underlying data is already loaded.
- **Visual transition**: brief crossfade, 200–300ms. Not a hard cut, not a full panel reload.
- Switching modes does not affect the canvas — the canvas state is independent of the list mode.
