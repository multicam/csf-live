# CSF Live — Projects & Sections

**Source**: Sections 7-8 of original spec
**Related**: [Content Model](content.md), [Views](views.md), [Canvas](canvas.md), [Discussions](discussions.md)

---

## Projects

### What is a Project?

A project is the primary organizing unit in CSF Live. It is a container for related content — discussions, drawings, documents, research, ideas — around a shared goal or concept.

### Creating a Project

Projects can be created:

1. **From scratch** — user creates a new project with a title and optional description
2. **From the feed** — user selects one or more feed items and says "make this a project"
3. **From a split** — part of an existing project's content spawns a new project
4. **With scaffolding** — user creates a project and defines initial sections upfront, optionally with Claude interviewing them section by section to flesh out requirements (see [Claude Integration](claude-integration.md#7-agent-patterns))

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

When you enter a project with no item selected, the **Workspace Panel** (left) shows the project dashboard:

- Project title and description (editable)
- Section list (if sections exist)
- Activity summary (recent items, who contributed)

The canvas simultaneously becomes that project's spatial view (content items as custom card shapes). The List Panel shows project content items.

Entry points for project actions (project settings, add section, add content, view options) live in the **Context Menu** (top-right) and in the Workspace Panel. See [Layout](layout.md) for the panel and context menu structure. List Panel modes (timeline, categorized, search) are described in [Views](views.md).

---

## Sections within Projects

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
