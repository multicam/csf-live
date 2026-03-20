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
- **View switching**: Data is instant (no refetch — already loaded). Visual transition is a brief crossfade: 200–300ms. Not a hard cut.
- **Feedback**: Every action has a visible response — optimistic UI updates, subtle toasts, progress indicators.
- **Touch-friendly**: All interactive elements sized for finger/stylus on tablet. No tiny click targets.
- **Keyboard-first on desktop**: Power users can navigate, search, create, and switch views without touching the mouse.

---

## Visual Hierarchy

- Content is the star. Chrome (navigation, controls) should recede.
- Use size, weight, and color to create clear hierarchy — not borders and dividers.
- Empty states should be inviting, not blank.

### Empty State Copy

| Context | Empty State Message |
|---------|-------------------|
| Empty Feed | "Start a conversation or capture an idea." |
| Empty Project | "Add a section or drop content here to get started." |
| Empty Section | "Nothing here yet — drop an idea, link, or document into this section." |
| Empty Search Results | "No results found. Try different keywords or adjust your filters." |
| Empty Notification Panel | "You're all caught up." |

---

## Phase 1 Design Approach

No formal design system upfront. Design emerges during build:

- **Palette:** Tailwind defaults initially, customize after core screens exist
- **Typography:** Pick one warm font (e.g., Inter, Instrument Sans) from day 1
- **Components:** Radix UI primitives, styled with Tailwind classes
- **Dark mode:** From day 1 using Tailwind `dark:` variant
- **Tokens:** Formalize (colors, spacing, radius, shadows) after feed + panels + project views exist

Design system documentation (`specs/design-system.md`) will be created after Phase 1 based on what actually works.

---

## Responsiveness

- Not "desktop shrunk down" — genuinely redesigned for each breakpoint
- The layout is universal: canvas background + floating panels on all devices. See [Layout](layout.md) for the full responsive model.
- Mobile: one panel visible at a time, swipe between list and workspace, full-screen canvas mode when panels are hidden
- Tablet: both panels visible but narrower, full canvas support, touch and stylus optimized
- Desktop: both panels visible side-by-side, resizable, keyboard shortcuts, hover states, drag and drop
