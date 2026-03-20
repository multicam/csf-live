# CSF Live — Database Schema & Data Model

**Source**: Section 24 of original spec
**Related**: [Tech Stack — PlanetScale + Drizzle](techstack-study.md#5-database--planetscale-postgres), [Content Model](content.md)

---

## Principles

- All tables have UUID primary keys (`gen_random_uuid()`)
- All tables have `created_at` and `updated_at` timestamps
- Soft deletes where appropriate (`deleted_at` nullable timestamp)
- Access control enforced in Hono middleware (not database RLS)
- JSONB columns for flexible metadata — don't over-normalize early
- Indexes on all foreign keys and commonly filtered columns
- Schema managed via Drizzle ORM with auto-generated migrations
- Hosted on PlanetScale Postgres with schema branching for safe migrations

---

## Core Tables

```
users
  id, name, email, role (owner/collaborator),
  avatar_url, created_at, updated_at
  -- Auth handled by WorkOS. No password hash stored locally.
  -- workos_user_id field links to WorkOS identity.

projects
  id, title, slug, description, status (active/paused/archived/completed),
  created_by → users, created_at, updated_at

project_members
  project_id → projects, user_id → users, role (owner/member),
  invited_by → users, joined_at

sections
  id, project_id → projects, title, description, order,
  created_by → users, created_at, updated_at

content_items
  id, type (idea/drawing/sketch/document/link/voice/photo/
       research/file),
  -- Note: 'message' is NOT a content type. Discussion messages
  -- live in the messages table. See discussions.md.
  title, body, media_url, media_type, metadata (JSONB),
  source (human/claude/agent/import), source_detail,
  project_id → projects (nullable), section_id → sections (nullable),
  parent_id → content_items (nullable), author_id → users,
  status (active/archived/merged), version (integer),
  created_at, updated_at, deleted_at

content_versions
  id, content_item_id → content_items, version_number,
  body, media_data (JSONB — for tldraw JSON etc.),
  author_id → users, change_summary, created_at

tags
  id, name (unique, lowercase)

content_item_tags
  content_item_id → content_items, tag_id → tags (composite PK)

discussions
  id, context_type (feed/project/section),
  context_id (nullable — project_id or section_id),
  created_at

messages
  id, discussion_id → discussions, author_id → users,
  content, content_type (text/voice/image/file/claude-response),
  media_url, metadata (JSONB), source (web/mobile/claude-code/agent),
  created_at

notifications
  id, user_id → users, type, title, body,
  reference_type, reference_id,
  read (boolean), created_at

agent_runs
  id, project_id → projects (nullable), agent_type (researcher/
       consolidator/digest/scaffolder),
  trigger (manual/auto/scheduled), input_prompt,
  status (queued/running/completed/failed), result_summary,
  tokens_used, triggered_by → users, created_at, completed_at

presence
  user_id → users, status (online/offline),
  current_location, last_heartbeat
```

---

## Feed Data Model

The general feed is a **unified stream** joining two tables chronologically:

```sql
-- Feed view: messages + unassigned content items, interleaved by time
SELECT id, 'message' AS source_table, content AS body, created_at, author_id
  FROM messages WHERE discussion_id = :feed_discussion_id
UNION ALL
SELECT id, 'content_item' AS source_table, body, created_at, author_id
  FROM content_items WHERE project_id IS NULL AND status = 'active'
ORDER BY created_at ASC;
```

- **Chat messages** → `messages` table (permanent, never move)
- **Captured content** (ideas, links, photos, voice, files) → `content_items` table with `project_id = NULL`
- **Moving to a project** = `UPDATE content_items SET project_id = :project_id` (only content items, not messages)

---

## Key Indexes

```sql
CREATE INDEX idx_content_items_project ON content_items(project_id);
CREATE INDEX idx_content_items_section ON content_items(section_id);
CREATE INDEX idx_content_items_type ON content_items(type);
CREATE INDEX idx_content_items_status ON content_items(status);
CREATE INDEX idx_content_items_author ON content_items(author_id);
CREATE INDEX idx_content_items_created ON content_items(created_at);
CREATE INDEX idx_messages_discussion ON messages(discussion_id);
CREATE INDEX idx_messages_created ON messages(created_at);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, read);
CREATE INDEX idx_content_versions_item ON content_versions(content_item_id);
CREATE INDEX idx_sections_project ON sections(project_id);
```

---

## Full-Text Search

```sql
-- Add tsvector columns for full-text search
ALTER TABLE content_items ADD COLUMN search_vector tsvector;
ALTER TABLE messages ADD COLUMN search_vector tsvector;

-- Auto-update search vectors via trigger
CREATE FUNCTION update_content_search() RETURNS trigger AS $$
BEGIN
  NEW.search_vector := to_tsvector('english',
    coalesce(NEW.title, '') || ' ' || coalesce(NEW.body, ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER content_items_search_update
  BEFORE INSERT OR UPDATE ON content_items
  FOR EACH ROW EXECUTE FUNCTION update_content_search();

-- GIN indexes for fast full-text search
CREATE INDEX idx_content_items_search ON content_items USING GIN(search_vector);
CREATE INDEX idx_messages_search ON messages USING GIN(search_vector);
```
