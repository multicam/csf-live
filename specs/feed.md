# CSF Live — Feed & Quick Capture

**Source**: Sections 5-6 of original spec
**Related**: [Content Model](content.md), [Discussions](discussions.md), [Claude Integration](claude-integration.md)

---

## Home and Feed

### What the User Sees on Login

The home screen has a **sidebar** for navigation and a **main content area** that defaults to the General Feed.

### Sidebar

- **Feed** — the shared general discussion (default view on login)
- **Projects** — list of active projects, with status indicators
- **Quick Capture** — persistent button/shortcut available from anywhere
- **Search** — global search entry point
- **Notifications** — unread count badge
- **User presence** — who's online (subtle indicator)

The sidebar feel should be soft, warm, conversational. Not corporate. Think Mud/Matter-style aesthetic — rounded, breathing, organic (see [Design Principles](design.md)).

### General Feed

The feed is the default shared space. It behaves like a linear discussion between platform owners (like a Slack DM channel). Everything that doesn't belong to a project lives here.

**Feed capabilities:**
- Post text messages
- Drop images, files, voice recordings, links
- Content items in the feed can be grabbed and moved into a project
- Chronological ordering — newest at bottom, scroll up for history
- Each feed item shows: author, timestamp, content type indicator, content
- Feed items can be tagged or labeled for later reference
- Claude can be invoked in the feed (see [Claude Integration](claude-integration.md))

---

## Quick Capture

### Purpose

Minimize friction between "I have an idea" and "it's in CSF Live." This is critical for mobile use but should work identically on desktop.

### Entry Points

1. **Persistent button** in the sidebar or bottom nav (mobile) — always accessible
2. **Keyboard shortcut** on desktop (e.g., `Cmd+K` or `Cmd+N`)
3. **Share target** (Phase 2 PWA) — share from other apps directly to CSF Live

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
