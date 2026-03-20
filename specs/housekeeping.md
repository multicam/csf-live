# CSF Live — Housekeeping, Lifecycle & Pipeline

**Source**: Sections 17, 20, 21 of original spec
**Related**: [Claude Integration](claude-integration.md#7-agent-patterns), [Content Model](content.md), [Projects](projects.md)

---

## The Mess Problem

Over time, CSF Live will accumulate content. Without active housekeeping, it becomes a graveyard of stale ideas. Three lines of defense:

---

## Manual Housekeeping

- Users can archive content items, sections, or entire projects
- Users can merge content items (combine two ideas into one)
- Users can delete content (soft delete — recoverable for 30 days)
- Bulk operations: select multiple items and archive/move/tag

---

## Scheduled Review (Friday Session)

A "Review Mode" that surfaces:
- Projects with no activity in the last 30 days
- Content items in the feed that have been there for over 2 weeks (unassigned)
- Sections with no recent discussion

User can quickly triage: keep, archive, or act on each item.

---

## AI-Assisted Housekeeping

Claude periodically (or on demand) reviews content and suggests:

- **Merge suggestions**: "These three ideas in different projects seem related — merge?"
- **Archive suggestions**: "This project hasn't been touched in 6 weeks — archive?"
- **Stale content**: "These 12 feed items are over a month old — assign to projects or archive?"
- **Consolidation**: When a project has >N research items, Claude offers to produce a consolidated summary
- **Duplicate detection**: "This link was already shared in Project Alpha"

All suggestions require human approval before taking effect. See [Claude Integration — Agent Patterns](claude-integration.md#7-agent-patterns) for implementation details.

---

## Software Factory Pipeline Integration

### Relationship

CSF Live is the pre-factory layer. When a project's content has been discussed, researched, drawn, and refined enough, it enters the Software Factory pipeline.

```
CSF Live (capture → discuss → draw → research → organize → shape)
    │
    ↓  "This project is ready — generate a PRD"
    │
Software Factory (Refinery → Foundry → Planner → Assembler → Validator)
    │
    ↓  Results flow back
    │
CSF Live (review → iterate → discuss → refine → re-enter pipeline)
```

### Integration Points

**CSF Live → Factory:**
- User triggers "Run Refinery" on a project (or Claude suggests it)
- The project's content (discussions, documents, drawings, research) is assembled into context
- The Refinery agent generates a PRD, which becomes a versioned document in the project
- Subsequent pipeline stages (Foundry, Planner) also produce documents that live in the project

**Factory → CSF Live:**
- Pipeline-generated documents (PRDs, Blueprints, Work Orders) appear in the project
- They are fully editable by humans
- Edits can trigger re-processing (e.g., "PRD changed — re-run Foundry?")
- Validation reports surface as documents for review and discussion

### Pipeline as a Feature, Not a Requirement

Not all projects will enter the pipeline. Some are just idea spaces, research collections, or ongoing discussions. The pipeline is available when needed, not mandatory.

---

## Future Considerations

These are NOT in scope for initial phases but the architecture should not preclude them:

### Diderot Integration
- JM uses Diderot for content curation and quality ranking from web sources
- Future: Diderot output feeds into CSF Live as curated content items
- Architecture: API endpoint that accepts Diderot-formatted content

### Share Sheet (PWA)
- "Share to CSF Live" from any mobile app
- Requires PWA with Web Share Target API
- Content shared this way goes to the feed or a configured default project

### Offline Capture
- Capture content when offline (mobile on the subway)
- Background sync when connection returns
- Requires PWA with service worker and IndexedDB for local queue

### Co-viewing (not co-editing)
- Two users looking at the same canvas/document simultaneously
- Cursor indicators showing where each person is looking
- NOT simultaneous editing — just awareness

### Template Library
- Pre-built project templates (e.g., "Product Idea", "Research Project", "Business Model")
- Each template defines sections, initial documents, and Claude interview prompts

### External Integrations
- GitHub: link projects to repos
- Calendar: Friday session scheduling and agenda generation
- Email: forward emails into CSF Live

### Third-Party Collaboration
- Full implementation of Tier 2 access (see [Product Overview](product-overview.md))
- Invitation flow, project-scoped views, limited permissions
- Notification preferences per collaborator
