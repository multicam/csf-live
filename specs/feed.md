# CSF Live — Feed & Quick Capture

**Source**: Sections 5-6 of original spec
**Related**: [Content Model](content.md), [Discussions](discussions.md), [Claude Integration](claude-integration.md)

---

## Home and Feed

### What the User Sees on Login

The home screen (`/`) is a full-screen tldraw canvas — the shared scratchpad. Projects and a "Feed" entry point appear as clickable nodes on the canvas. Click a project → `/feed/:slug`. Click Feed → `/feed`.

The feed layout (`/feed`) is a 3-column email client:
- **Column 1 (left)**: Projects list — click to scope the feed to a project
- **Column 2 (center)**: Feed — messages + content items
- **Column 3 (right)**: Detail — editor/viewer for the selected item (including tldraw for drawings)

The compose input at the bottom of column 2 **is** Quick Capture — one input with two modes (simple text or enhanced with voice/camera/file/targeting). See [Layout](layout.md) for the full model.

### General Feed

The feed (`/feed`) is the default shared space. It behaves like a linear discussion between platform owners (like a Slack DM channel) mixed with captured content. Everything that doesn't belong to a project lives here. The feed lives in the center column.

When a project is selected (`/feed/:project-slug`), the feed column scopes to that project's content items and discussion messages. The canvas becomes the project's spatial view.

### Feed Data Model

The feed is a **unified stream** joining two tables:

- **Messages** (`messages` table, `discussion_id` = feed discussion) — chat messages, Claude responses
- **Content items** (`content_items` table, `project_id` IS NULL) — captured ideas, links, photos, voice recordings, files

Both are interleaved chronologically by `created_at`. The feed view is a UNION query across both tables ordered by timestamp.

**Moving content to a project:** Only content items can be moved (`UPDATE content_items SET project_id = X`). Messages stay in the feed forever — they are the conversation record.

### Feed Capabilities

- Post text messages (stored as messages)
- Drop images, files, voice recordings, links (stored as content items)
- Content items in the feed can be grabbed and moved into a project
- Chronological ordering — newest at bottom, scroll up for history
- Each feed item shows: author, timestamp, content type indicator, content
- Content items can be tagged or labeled for later reference
- Claude can be invoked in the feed (see [Claude Integration](claude-integration.md))

---

## Quick Capture

### Purpose

Minimize friction between "I have an idea" and "it's in CSF Live." This is critical for mobile use but should work identically on desktop.

### Entry Points

1. **App Menu** — Quick Capture accessible from the App Menu dropdown (top-left), or a floating action button (FAB) on mobile
2. **Keyboard shortcut** on desktop (`Cmd+N`) — opens Quick Capture in the workspace panel
3. **Share target** (Phase 2 PWA) — share from other apps directly to CSF Live

### Quick Capture Platform

The Quick Capture UI adapts to the device context:

- **Mobile / tablet**: bottom sheet sliding up from the bottom edge
- **Desktop**: centered modal

### Quick Capture Interface

A single modal or bottom sheet that accepts anything:

- **Text input** — type or paste. Auto-detects URLs and enriches them with metadata.
- **Voice button** — hold to record, release to stop. Stored as audio with transcription.
- **Camera button** — opens device camera directly for photo capture.
- **Photo library button** — opens device photo picker.
- **File drop zone** — drag and drop (desktop) or file picker (mobile).

### Targeting

Two modes available at capture time:

1. **Quick dump** — content goes to the General Feed with no further input required. One tap/click to capture.
2. **Targeted** — user optionally selects a project and/or section before submitting. Should be fast — a dropdown or recent-projects shortlist, not a long form.

The default is quick dump. Targeting is optional and should not slow down the capture flow.

### Post-Capture

- Content item appears immediately in the feed or target project
- If voice: transcription begins in background, item shows audio player while processing
- If image: thumbnail displayed immediately, any processing (OCR, description) happens in background
- If URL: link preview card generated asynchronously

---

## Feed Item Rendering

The feed is a unified stream of two distinct item types rendered differently:

### Message Rendering (Chat Bubble Style)

Messages (`messages` table) render as chat bubbles — compact, author avatar on the side, timestamp inline. Styled conversationally, similar to a messaging app.

### Content Item Rendering (Card Style)

Content items (`content_items` table) render as cards — more prominent, with type-specific layout. Each card type:

| Type | Card Contents |
|------|--------------|
| `idea` | Body text, author avatar, timestamp |
| `link` | URL with link preview card: title, description, favicon. In Tier 1, previews are pre-populated in mock data. New links posted during the session show as plain URL (no live fetch). |
| `voice` | Audio player with play/pause button, duration indicator, waveform placeholder. In Tier 1, mock audio URLs. |
| `photo` | Thumbnail image, author avatar, timestamp |
| `sketch` | Thumbnail image, "Sketch" type label, author avatar, timestamp |
| `drawing` | Thumbnail preview of the tldraw canvas, title |
| `document` | Title, `document_type` badge (e.g., "PRD", "Note"), first line of body as preview |
| `research` | Title, "AI Research" badge, summary preview (first ~100 chars) |
| `file` | Filename, file size, file type icon, download action. Download is disabled in Tier 1 (no real file storage). |

> **Note:** Message rendering and content item rendering are intentionally distinct visual treatments. Messages feel conversational; content items feel like objects you can act on (move, tag, open).
