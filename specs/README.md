# CSF Live — Specifications

**Version**: 2.0
**Date**: 2026-03-21
**Authors**: JM + Ben
**Status**: Pre-development

CSF Live is a private, collaborative AI workspace where a small team captures ideas, discusses them, draws and diagrams, organizes research, and shapes raw thinking into structured material ready for software development.

---

## Spec Index

### Product

| Document | Covers |
|----------|--------|
| [product-overview.md](product-overview.md) | What CSF Live is, users & access model, platform & device strategy |
| [feed.md](feed.md) | Home screen, general feed, quick capture |
| [projects.md](projects.md) | Projects, sections, project dashboard |
| [content.md](content.md) | Content model, documents, tags, fluidity, versioning |
| [views.md](views.md) | Timeline, spatial, categorized, search views |
| [canvas.md](canvas.md) | tldraw integration, drawing, sketches |
| [discussions.md](discussions.md) | Discussion model, message properties, section labels |
| [search.md](search.md) | Full-text search, filters, natural language search |
| [notifications.md](notifications.md) | Presence, awareness, notification triggers & delivery |
| [housekeeping.md](housekeeping.md) | Lifecycle management, pipeline integration, future considerations |
| [design.md](design.md) | Frontend design principles, aesthetic direction, responsiveness |

### Technical

| Document | Covers |
|----------|--------|
| [techstack-study.md](techstack-study.md) | Tech stack decisions, architecture, all alternatives evaluated |
| [data-model.md](data-model.md) | Database schema, tables, indexes, full-text search |
| [claude-integration.md](claude-integration.md) | Claude in production (API, CLI, SDK), development integration, context assembly, streaming, agents |
| [sdd.md](sdd.md) | Scenario-Driven Development methodology, Gherkin formalism, devtools-mcp + react-grab workflow |
| [secrets.md](secrets.md) | API keys and secrets required per tier — what, where, when |

### Planning

| Document | Covers |
|----------|--------|
| [phasing.md](phasing.md) | 3-tier build plan with spec file references per phase |

---

## Quick Reference

### Stack (decided 2026-03-21)

| Layer | Choice |
|-------|--------|
| Frontend | React 19 + Vite SPA |
| Backend | Hono on Bun |
| Database | PlanetScale Postgres + Drizzle ORM |
| File Storage | Cloudflare R2 |
| Realtime | Bun native WebSockets |
| Auth | WorkOS AuthKit |
| Canvas | tldraw SDK |
| Hosting | Vercel/CF Pages (frontend) + Railway/Fly.io (API) |

### Core Design Philosophy

- **Fluidity above structure** — no premature categorization
- **Boring backend, magical frontend** — proven patterns server-side, innovation in UX
- **Minimal friction capture** — idea → CSF Live in minimum taps
- **Multiple lenses, same data** — timeline, spatial, categorized, search
- **Vendor independence** — every component is replaceable

---

## File History

This index replaces the original monolithic spec (`README.md` v1.0, 2026-03-20). Content was split by feature domain and updated to reflect stack decisions made during planning discussions (WorkOS auth, PlanetScale, Hono/Bun, R2, no Supabase, no Convex).
