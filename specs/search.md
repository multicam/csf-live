# CSF Live — Search

**Source**: Section 14 of original spec
**Related**: [Claude Integration](claude-integration.md), [Content Model](content.md), [Data Model](data-model.md)

---

## Scope

Search operates at two levels:

1. **Global** — across all projects, the feed, and all content (respects access control)
2. **Project-scoped** — within a specific project and its sections

---

## Search Capabilities

### Text Search
- Full-text search across: titles, body content, message text, document content
- Tag search
- Metadata search (e.g., URLs in links, file names)
- Implemented via Postgres `tsvector` + GIN indexes (see [Data Model](data-model.md))

### Filter Search
- By content type (idea, drawing, document, link, voice, etc.)
- By author
- By date range
- By project / section
- By status (active, archived)
- By source (human, claude, agent)

### Natural Language Search (Claude-powered)
- Conversational queries like "Remind me what Ben said last week about the auth flow"
- Claude interprets the query, searches the database, and returns a synthesized response with citations to specific content items
- This is especially important for mobile/voice — speak a question, get an answer
- See [Claude Integration](claude-integration.md) for implementation details

---

## Search Results

- Displayed as a list of content items with relevance ranking
- Each result shows: title/preview, type icon, project/section, author, date, relevance snippet
- Click a result to navigate to it in context (opens the project/section/discussion where it lives)

---

## Future: Content in Images

- OCR and image description for uploaded photos and sketches
- Searchable text extracted from images stored in metadata
- This makes hand-drawn content findable via text search
