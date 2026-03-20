# CSF Live — Views & Navigation

**Source**: Section 10 of original spec
**Related**: [Canvas](canvas.md), [Search](search.md), [Content Model](content.md)

---

## Core Principle

The same underlying data, viewed through different lenses. The user switches views without affecting the data. All views are available at both the project level and the platform level.

---

## View 1: Timeline (default)

- Chronological list of all content items
- Newest at bottom (chat-style) or newest at top (feed-style) — user preference
- Each item shows: author avatar, timestamp, content type icon, content preview, section label (if in a project)
- Infinite scroll with lazy loading
- Filters: by content type, by author, by date range, by section

## View 2: Spatial / Canvas

- Content items laid out on a 2D canvas (powered by tldraw)
- Items can be freely positioned, grouped, connected with arrows
- This is the "Mac desktop" metaphor — files/items as objects on a surface you can arrange
- Spatial positions are saved per user (each user can have their own arrangement)
- New items appear in an "unsorted" area until positioned
- Can zoom, pan, and navigate freely
- Drawings created in this view are full tldraw canvases (see [Canvas](canvas.md))

## View 3: Categorized

- Content grouped by type (Ideas, Drawings, Documents, Research, Links, etc.)
- Each category is a collapsible section
- Within each category, items are listed chronologically
- Counts shown per category
- Can also group by: section, author, tag, status

## View 4: Search

- Full-text search bar at the top
- Results appear as a filtered list with relevance ranking
- Search across: titles, body text, tags, metadata, transcriptions
- Natural language queries supported when Claude is invoked (see [Search](search.md))
- Filter chips for: project, section, type, author, date range

---

## View Switching

- Persistent view switcher (icon tabs or dropdown) available within any project or at the platform level
- View preference is remembered per context (e.g., "I always use timeline in Project Alpha, spatial in Project Beta")
- Switching views is instant — no page reload, no data refetch
