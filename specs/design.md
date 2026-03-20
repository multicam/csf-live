# CSF Live — Frontend Design Principles

**Source**: Section 22 of original spec
**Related**: [Views](views.md), [Feed](feed.md), [Tech Stack — Frontend Libraries](techstack-study.md#10-frontend-libraries)

---

## Aesthetic Direction

**Soft, warm, conversational.** Not corporate SaaS. Not cold utility.

- Inspired by Mud, Matter, and tools that feel like they were made by humans for humans
- Rounded corners, breathing whitespace, organic color palette
- Typography that is warm and readable — not geometric/technical
- Subtle animations — content that gently appears, not snaps into place
- Dark mode as a first-class option (not an afterthought)

---

## Interaction Quality

- **Transitions**: Smooth, purposeful. View switching should feel like turning a page, not reloading.
- **Feedback**: Every action has a visible response — optimistic UI updates, subtle toasts, progress indicators.
- **Touch-friendly**: All interactive elements sized for finger/stylus on tablet. No tiny click targets.
- **Keyboard-first on desktop**: Power users can navigate, search, create, and switch views without touching the mouse.

---

## Visual Hierarchy

- Content is the star. Chrome (navigation, controls) should recede.
- Use size, weight, and color to create clear hierarchy — not borders and dividers.
- Empty states should be inviting, not blank. "No content yet — drop an idea here or start a discussion."

---

## Responsiveness

- Not "desktop shrunk down" — genuinely redesigned for each breakpoint
- Mobile: single column, bottom nav, swipe gestures, quick capture prominent
- Tablet: two-panel (sidebar + main), full canvas support, touch optimized
- Desktop: multi-panel option, keyboard shortcuts, hover states, drag and drop
