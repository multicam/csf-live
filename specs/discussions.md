# CSF Live — Discussions & Communication

**Source**: Section 12 of original spec
**Related**: [Feed](feed.md), [Projects](projects.md), [Claude Integration](claude-integration.md)

---

## Discussion Model

Discussions are linear message threads. No sub-threading, no branching.

---

## Discussion Contexts

| Context | Scope | Behavior |
|---------|-------|----------|
| General Feed | Platform-wide | One continuous discussion between platform owners |
| Project Root | Per project | Shows all messages across all sections, labeled by section |
| Section | Per section | Focused discussion for that section only |

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

## Within a Project: Section Labels

When viewing the project root discussion, each message shows which section it belongs to. This gives an overview of all project activity in one stream while maintaining section attribution. Users can click a section label to jump into that section's focused discussion.
