# CSF Live — Product Overview

**Source**: Sections 1-3 of original spec
**Related**: [Information Architecture](content.md#information-architecture), [Design Principles](design.md)

---

## What is CSF Live?

CSF Live is a private, collaborative AI workspace where a small team (initially two people) captures ideas, discusses them, draws and diagrams, organizes research, and shapes raw thinking into structured material ready for software development.

## Core Problem

The gap between having ideas and executing on them. Specifically:

- Ideas emerge during Friday sessions, on the bus, in Claude Code sessions, from Twitter bookmarks, from web research — and they scatter across tools with no shared persistent home.
- Claude Code and AI models amplify capability but also create information overload. There is no system to receive, organize, rank, and consolidate the flood.
- Two collaborators (JM and Ben) need a shared brain — a place where discussions, visual thinking, and AI-generated output converge and persist.

## What CSF Live Is NOT

- It is not a Software Factory (that comes after). It is the pre-factory layer where ideas are shaped before entering the Refinery → Foundry → Planner → Assembler → Validator pipeline.
- It is not a co-editing tool. Users edit their own documents. No real-time simultaneous editing of the same artifact.
- It is not a project management tool with tickets, sprints, or boards. It is fluid and organic.
- It is not a native app. It is a responsive website that behaves like an app.

## Core Design Philosophy

- **Fluidity above structure**: Content stays loose until the user deliberately organizes it. The system never forces premature categorization.
- **Boring backend, magical frontend**: The database and API should use proven, standard patterns. All innovation goes into the frontend experience — how naturally and effortlessly users interact with their content.
- **Minimal friction capture**: Getting an idea into CSF Live should require the absolute minimum number of taps, clicks, or words.
- **Multiple lenses, same data**: Every piece of content can be viewed through different perspectives (timeline, spatial, categorized, search) without duplication.

---

## Users and Access Model

### Current Scope

Two platform owners: JM and Ben. They see everything on the platform — all projects, all content, all activity.

### Access Tiers

**Tier 1 — Platform Owners (JM, Ben)**
- Full visibility across all projects, feed, settings
- Can see all users on the platform
- Can create projects, invite third parties
- Can access all administrative functions

**Tier 2 — Third-Party Collaborators (future, design for it now)**
- Invited to specific projects only
- Can only see the project(s) they have been granted access to
- Can see the presence of platform owners within those projects (if owners choose to participate)
- Cannot see other projects, the general feed, or other third parties outside their project scope

### Authentication

Handled by **WorkOS AuthKit** (see [techstack-study.md](techstack-study.md#8-authentication--workos)):

- Email + password, Magic Link, Social OAuth (Google, GitHub)
- SSO-ready for future Tier 2 collaborators
- Session persistence — stay logged in across visits
- JWT-based auth validated by Hono middleware on every API request

### Access Control

- Users table with a `role` field (owner, collaborator)
- Project membership table mapping users to projects with access level
- All API queries must respect access scoping — a collaborator must never see data outside their project(s)
- Enforced in Hono middleware, not database RLS

---

## Platform and Device Strategy

### Primary Platform

Responsive website. Not a native app, not an Electron wrapper. A well-built web application that feels like an app on every device.

### Device Targets

**Desktop (primary work environment)**
- Full experience — canvas-first layout with floating panels, keyboard shortcuts. See [Layout](layout.md).
- Where deep work happens — project editing, drawing, long discussions

**Tablet (Ben's primary drawing device)**
- Near-full experience — optimized for touch and stylus input
- Canvas/drawing is a first-class experience on tablet
- Comfortable for browsing, reading, light editing

**Mobile phone (capture and review)**
- Optimized for quick capture — voice, photo, text, link sharing
- Comfortable for reading the feed, browsing projects, reviewing content
- Push notifications lead back into relevant content
- Not optimized for heavy editing or canvas work

### Progressive Web App (Phase 2)

- PWA registration enables "Add to Home Screen" on mobile
- Enables push notifications via service worker
- Enables share target API — "Share to CSF Live" from other apps (Twitter, browser, camera)
- Enables offline capture with background sync when connection returns

### Technical Requirements

- Camera access via standard HTML file input (`accept="image/*"` with optional `capture="camera"`)
- Photo library access via file input without capture attribute
- Voice recording via MediaRecorder API — hold button to record, release to stop
- Clipboard paste support — detect URLs, images, text
- Responsive breakpoints: mobile (<768px), tablet (768-1024px), desktop (>1024px)
