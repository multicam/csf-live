# CSF Live — Content Model

**Source**: Sections 4, 9, 18, 19 of original spec
**Related**: [Projects](projects.md), [Data Model](data-model.md), [Canvas](canvas.md)

---

## Information Architecture

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

Every piece of content in CSF Live is a **Content Item** with a type:

| Type | Description | Source |
|------|-------------|--------|
| `idea` | A raw thought, concept, or spark | Human input |
| `drawing` | A tldraw canvas document | Created in-app |
| `sketch` | A photo of hand-drawn content | Uploaded photo |
| `document` | A text document (markdown, PRD, notes) | Human or Claude |
| `link` | A web URL with optional metadata | Pasted or shared |
| `voice` | A voice recording (with transcription) | Recorded in-app |
| `photo` | An image (not a sketch — e.g. screenshot, reference) | Uploaded |
| `research` | AI-generated research output | Claude |
| `file` | Any other file attachment | Uploaded |

> **Note:** Discussion messages (chat in feed, projects, sections) are stored in the `messages` table, not as content items. The `message` type does not exist in the content_items enum. See [Discussions](discussions.md) and [Data Model](data-model.md).

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

## Content Items

Every piece of content in CSF Live is a Content Item. This is the atomic unit.

### Content Item Properties

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | UUID | auto | Unique identifier |
| `type` | enum | yes | See content types table above |
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

---

## Documents

Documents are a special class of Content Item with richer capabilities:

- **Editable** — full markdown editing in the browser
- **Versioned** — every save creates a new version with author attribution
- **Typed** — documents have a document_type field: `note`, `prd`, `blueprint`, `work-orders`, `research-summary`, `meeting-notes`, `freeform`
- **AI-generated documents** are clearly marked with `source: claude` and are fully editable by humans
- **Version history** is browseable — you can see who changed what and when, and revert to a previous version

---

## Tags

Content items and documents can be tagged with freeform tags for cross-cutting organization.

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Tag identifier |
| `name` | string | Tag label (lowercase, no spaces — use hyphens) |

Many-to-many relationship: a content item can have multiple tags, a tag applies to multiple items. Tags are global (not scoped to a project) so you can find related content across projects.

---

## Content Fluidity

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

## Versioning

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
