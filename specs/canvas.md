# CSF Live — Canvas & Drawing

**Source**: Section 11 of original spec
**Related**: [Views](views.md), [Content Model](content.md), [Tech Stack](techstack-study.md)

---

## Technology

**tldraw SDK** — embedded React component with hobby license.

---

## Canvas Experiences

There are two distinct canvas contexts:

### 1. Project Canvas (Spatial View)
- The spatial view of a project IS a tldraw canvas
- Content items from the project appear as cards/shapes on the canvas
- Users can draw around them, connect them with arrows, annotate
- This is where the "Mac desktop with files you can draw on" experience lives

### 2. Standalone Drawing Documents
- A user creates a new drawing within a project
- Full tldraw experience — freehand, shapes, text, arrows, connectors
- Saved as a versioned document (the tldraw JSON is the document content)
- Can be opened, edited, versioned like any other document

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

## Custom Shapes (Phase 2+)

Leverage tldraw's custom shape system to create CSF Live-specific shapes:

- **Idea card** — a shape representing a Content Item, showing title and type
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
