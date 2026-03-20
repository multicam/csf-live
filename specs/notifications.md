# CSF Live — Presence & Notifications

**Source**: Sections 15-16 of original spec
**Related**: [Discussions](discussions.md), [Tech Stack — WebSockets](techstack-study.md#7-realtime--bun-native-websockets)

---

## Presence and Awareness

### Platform Level

- Simple presence indicator: who is currently online
- Shown in the **App Menu** (top-left) as an inline indicator — small avatar with green dot for online users
- No "last seen" timestamps or detailed status (keep it minimal)

### Project Level

- When inside a project, you can see if the other person is also in that project
- Indicator: "Ben is in this project" with optional current section — shown as a subtle avatar overlay on the canvas edge (e.g., Ben's avatar positioned at the canvas boundary indicating his location)
- No cursor tracking, no live viewport sync
- Sufficient for awareness: "I know Ben is looking at this too"

### Implementation

- WebSocket-based presence via Bun native WebSocket server
- Heartbeat ping every 30 seconds
- User goes "offline" after 2 minutes of no heartbeat
- Presence state: `online`, `offline`
- Current location tracked: `feed`, `project:<id>`, `project:<id>/section:<id>`

---

## Notifications

### Notification Triggers

| Event | Notification | Priority |
|-------|-------------|----------|
| New message in a project you're a member of | Yes | Normal |
| Claude finished generating a document | Yes | Normal |
| Research agent completed | Yes | Normal |
| New content added to a project | Yes (badge only) | Low |
| Someone mentioned you in a discussion | Yes | High |
| Weekly digest available | Yes | Low |
| Housekeeping suggestions ready for review | Yes | Low |

### Delivery Methods

**In-app:**
- Notifications accessible via the **App Menu** (top-left) — opens notification list in the Workspace Panel (left)
- Notification list with unread count shown in the App Menu
- Click notification to navigate to relevant content
- Mark as read, mark all as read

**Push notifications (Phase 2 — PWA):**
- Browser push notifications for high-priority events
- Mobile push notifications when app is added to home screen
- User can configure which events trigger push notifications

### Visual Indicators

- Unread count badge on the App Menu button
- Unread count badges on: project cards (in the List Panel), section headers
- New content highlighted in the feed/discussion (e.g., "2 new messages" divider)
- Activity indicators on project cards in the List Panel
