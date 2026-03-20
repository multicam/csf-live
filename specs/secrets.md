# CSF Live — API Keys & Secrets by Tier

**Purpose**: Track which secrets are needed per development tier. No secrets are stored in this file — only names and where to configure them.

---

## Tier 1: Frontend (Mock Data)

**No secrets required.** Everything runs locally against mock data.

| Secret | Needed? | Why |
|--------|---------|-----|
| Database credentials | No | No database — mock data |
| WorkOS API key | No | Mock auth — hardcoded user in dev |
| R2 credentials | No | No file upload — mock URLs |
| Anthropic API key | No | No Claude integration |
| Whisper/Deepgram key | No | No transcription |
| Sentry DSN | No | No error tracking in dev |

**Environment file**: None needed. Vite dev server only.

---

## Tier 2: Backend + Infrastructure

**Required before starting Tier 2:**

| Secret | Service | Where to get | Env var |
|--------|---------|-------------|---------|
| **PlanetScale connection string** | PlanetScale | Dashboard → Connect → Postgres | `DATABASE_URL` |
| **WorkOS API key** | WorkOS | Dashboard → API Keys | `WORKOS_API_KEY` |
| **WorkOS Client ID** | WorkOS | Dashboard → Configuration | `WORKOS_CLIENT_ID` |
| **WorkOS Redirect URI** | WorkOS | Dashboard → Redirects | `WORKOS_REDIRECT_URI` |
| **R2 Access Key ID** | Cloudflare | Dashboard → R2 → Manage API tokens | `R2_ACCESS_KEY_ID` |
| **R2 Secret Access Key** | Cloudflare | Same as above | `R2_SECRET_ACCESS_KEY` |
| **R2 Endpoint** | Cloudflare | Dashboard → R2 → bucket details | `R2_ENDPOINT` |
| **R2 Bucket Name** | Cloudflare | Dashboard → R2 | `R2_BUCKET_NAME` |
| **Sentry DSN** | Sentry | Project Settings → Client Keys | `SENTRY_DSN` |

**Environment files**:
- `packages/api/.env` — all backend secrets
- `packages/web/.env` — `VITE_WORKOS_CLIENT_ID`, `VITE_API_URL`

**Deployment secrets** (set in Railway/Fly.io dashboard):
- All `packages/api/.env` vars
- Domain configuration for Cloudflare DNS

---

## Tier 3: AI Integration

**Additional secrets needed for Tier 3 (on top of Tier 2):**

| Secret | Service | Where to get | Env var |
|--------|---------|-------------|---------|
| **Anthropic API key** | Anthropic | Console → API Keys | `ANTHROPIC_API_KEY` |
| **Whisper API key** (or Deepgram) | OpenAI / Deepgram | Dashboard → API Keys | `TRANSCRIPTION_API_KEY` |
| **Claude Code auth** (if using CLI path) | Anthropic | `claude login` on server | `~/.claude/` directory |

**Decision pending**: API key vs Max subscription for Claude. See [Claude Integration — Open Decisions](claude-integration.md#9-open-decisions). API key is the recommended Phase 1 approach.

---

## Secret Management Rules

1. **Never commit `.env` files** — add to `.gitignore`
2. **Never put secrets in specs/** — only names and env var keys
3. **Use `.env.example` files** — committed, with placeholder values showing required vars
4. **Deployment secrets** go in the hosting platform's dashboard (Railway, Vercel), not in code
5. **Rotate keys** if they appear in git history — even briefly
