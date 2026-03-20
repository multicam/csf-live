# CSF Live — Discussions & Communication

**Source**: Section 12 of original spec
**Related**: [Feed](feed.md), [Projects](projects.md), [Claude Integration](claude-integration.md)

---

## Discussion Model

Discussions are linear message threads. No sub-threading, no branching.

---

## Discussion Contexts

| Context | `context_type` | `context_id` | Behavior |
|---------|---------------|-------------|----------|
| General Feed | `feed` | NULL | One continuous discussion between platform owners. Single row, well-known ID. |
| Project | `project` | `project_id` | Each project has its own discussion thread for project-wide messages. Messages posted at the project root level go here. |
| Section | `section` | `section_id` | Focused discussion for that section only. |

### Project Root VIEW (Aggregate Display)

The project root **view** is not a separate discussion thread — it is a read aggregate. It displays:

1. Messages from the project's own discussion thread (`context_type = 'project'`, `context_id = project.id`)
2. Messages from all of that project's section discussions, each labeled with their section name

All messages are interleaved chronologically. This gives an overview of all project activity in one stream while maintaining section attribution. Users can click a section label to jump into that section's focused discussion.

**Key rule:** When a user posts a message while viewing the project root, that message goes into the project's own discussion thread (`context_type = 'project'`), not into any section.

---

## Message Properties

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

---

## Discussion Features

- Markdown formatting in messages
- Inline image display
- Link preview cards for URLs
- Voice messages with playback and transcription
- File attachments with download
- Claude responses clearly distinguished (different styling, "Claude" as author)
- Scroll to latest, scroll to load history
- Real-time updates — new messages appear without refresh (via WebSocket)

---

