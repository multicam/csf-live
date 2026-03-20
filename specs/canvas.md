# CSF Live — Canvas & Drawing

**Source**: Section 11 of original spec
**Related**: [Views](views.md), [Content Model](content.md), [Tech Stack](techstack-study.md)

---

## Technology

**tldraw SDK** — embedded React component with hobby license.

---

## Canvas Experiences

There are two distinct canvas contexts:

### 1. App-Level Scratchpad (`/`)

The home screen is a full-screen tldraw canvas — a shared scratchpad for the team. See [Layout](layout.md).

- Full tldraw experience: draw, shapes, text, arrows, images
- Clickable navigation nodes: project cards, "Feed" entry point
- **Save** → snapshots the canvas as a new `drawing` content item in the feed (or targeted project). Canvas content persists, version is recorded.
- **Save and Close** → same snapshot → canvas is **wiped clean** (blank slate for next session)
- The scratchpad is versioned — each save creates a version of the canvas document itself

This is where visual thinking happens. When the thinking is ready to be organized, save it to the feed.

### 2. Drawing Content Items (in Detail Column)

Drawings are content items (type: `drawing`) that live in the feed or a project. They are created when the scratchpad is saved, or created directly within a project.

- Click a `drawing` item in the Feed column → opens as a fully editable tldraw canvas in the **Detail column** (column 3 of the `/feed/*` layout)
- Full tldraw experience within the Detail column
- Versioned: every save creates a new version
- Can be opened, edited, shared like any other content item

**Project drawings are NOT a background canvas.** They are feed items edited inline in the 3-column layout.

---

## Drawing Capabilities (provided by tldraw)

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

---

## Tier 1 Custom Shapes

Custom tldraw shapes for the app-level scratchpad:

- **Project node** — a clickable shape representing a project. Displays: project title, status, unread count. Clicking navigates to `/feed/:slug`. Used on the scratchpad as spatial navigation.
- **Feed node** — a clickable shape that navigates to `/feed`. The entry point to the 3-column layout from the canvas.

---

## Custom Shapes (Phase 2+)

Leverage tldraw's custom shape system to create additional CSF Live-specific shapes:

- **Project link** — a shape that links to another project
- **Research node** — a shape showing a research summary with source link
- **Decision marker** — a shape indicating a decision was made, with rationale

---

## Photo/Sketch Input

- Users can upload photos of hand-drawn sketches
- These are stored as `sketch` type Content Items (image files)
- Claude can be asked to interpret the sketch — describe it, extract structure, or convert boxes-and-arrows into a tldraw diagram (future capability)
- Photos are not editable as drawings — they are reference snapshots

---

## Storage Model

Canvas state is stored as **one content_item per canvas** with the entire tldraw JSON in `content_versions.media_data`:

```
content_items: { id: 'canvas-uuid', type: 'drawing' }
content_versions: {
  content_item_id: 'canvas-uuid',
  version_number: 1,
  media_data: { /* entire tldraw serialized state */ }
}
```

This aligns with tldraw's native serialize/deserialize model. The full canvas state (all shapes, positions, connections) is one JSON blob per version.

**Client-side debouncing:** Don't save on every shape edit. Auto-save after 3 seconds of inactivity or on page leave. Explicit "save" creates a named version. This keeps version counts manageable and reduces storage.

**Draft recovery:** Store the current working state in `localStorage` as a crash recovery mechanism. On load, check if a localStorage draft is newer than the last persisted version and offer to restore.

## Versioning for Drawings

- Auto-saves create versions silently (no user action needed)
- Explicit saves can include a `change_summary` description
- Version history shows: version number, author, timestamp, thumbnail preview
- Users can view any previous version
- Users can restore a previous version (creates a new version based on the old one)
