# Architecture

Open Queries is one monorepo with four trust boundaries:

```text
Provider UI
  -> fail-closed Plasmo adapter
  -> Chrome side panel + 30-day local history
       -> optional observed-query donation -> Queue -> D1 raw events
       -> explicit fan-out request -> provider-matched generator
                                   -> gpt-5.6-luna logprob scorer
                                   -> estimated results in side panel

D1 raw events -> daily k-anonymous aggregation (at least 5 donor tags)
Website       -> mission, methodology, privacy, legal and learning pages
```

## Browser boundary

The extension contract contains a query, evidence class, platform, timestamp,
language/locale and adapter versions. Chat messages, conversation identifiers,
chat URLs, titles and account identity have no schema fields. Zod objects are
strict so adding those fields fails validation.

Sensitive-pattern checks run before donation and again at the Worker. Unsafe
queries stay local and cannot be sent for fan-out estimation.

## Worker boundary

The Worker exposes four versioned endpoints:

- `GET /api/v1/config`
- `POST /api/v1/events`
- `POST /api/v1/fan-outs`
- `DELETE /api/v1/donations`

Anonymous fan-out calls are limited to ten per donor tag per UTC day and five
per source IP per minute. Fan-out metadata stores only a normalized seed hash,
models, duration, token counts and candidate count—not the seed or candidates.

Donation deletion writes a 13-month donor tombstone before removing raw events,
fan-out metadata and quota rows. The queue consumer checks tombstones so an
already queued event cannot reappear after deletion.

## Retention

- Local extension history: 30 days, maximum 2,000 events.
- Raw D1 events and fan-out metadata: 13 months.
- Deletion tombstones: 13 months.
- Daily aggregates: durable only after at least five distinct donor tags.
- Estimated fan-outs: excluded from observed-query aggregation.

## Cloudflare provisioning

Before the first production deployment:

1. Create `openqueries-db`, `openqueries-donations` and
   `openqueries-donations-dlq` in the target Cloudflare account.
2. Replace the placeholder D1 `database_id` in `apps/web/wrangler.jsonc`.
3. Add `OPENAI_API_KEY`, `ANTHROPIC_API_KEY` and `GEMINI_API_KEY` with
   `wrangler secret put` from `apps/web`.
4. Set `ALLOWED_EXTENSION_IDS` to the stable Chrome extension ID.
5. Apply remote D1 migrations, run `pnpm check`, deploy from the cumulative
   `main` branch and verify all retained routes plus the four API endpoints.

The credentials borrowed from another local project are test inputs only. New
production secrets should be created specifically for Open Queries.
