# Architecture

Open Queries is one monorepo with four trust boundaries:

```text
Provider search-tool signal
  -> fail-closed, provider-specific Plasmo adapter
  -> Chrome side panel + 30-day local history
       -> optional observed-query donation -> Queue -> D1 raw events
       -> explicit fan-out request -> Cloudflare Worker
            -> ChatGPT: gpt-5.6-luna structured output + native token logprobs
            -> Google: gemini-3.1-flash-lite, 16 native samples + Wilson interval
            -> Claude: claude-haiku-4-5, 16 native samples + Wilson interval
            -> rank-first result with expandable mathematical evidence

D1 raw events -> daily k-anonymous aggregation (at least 5 donor tags)
Website       -> mission, install, methodology, privacy, legal and learning pages
```

## Browser boundary

The extension contract contains a query, evidence class, platform, timestamp,
language/locale and adapter versions. Chat messages, conversation identifiers,
chat URLs, titles and account identity have no schema fields. Zod objects are
strict so adding those fields fails validation.

ChatGPT exposes search queries in structured `search_queries` metadata even
when its interface renders only a website count. A document-start, main-world
adapter clones only ChatGPT conversation transport responses, walks only
explicit search-metadata/tool fields and posts query strings to the isolated
extension context. Ordinary `query` fields and message content are rejected and
never cross that boundary. Claude and Google adapters read explicit search UI.
All processing happens locally unless the user separately requests fan-outs or
enables query contribution.

Sensitive-pattern checks run before donation and again at the Worker. Unsafe
queries stay local and cannot be sent for fan-out estimation. Old local V1
estimates are discarded during state hydration rather than displayed under the
new evidence contract.

## Provider-native estimation

All providers receive the same versioned minimal prompt. OpenAI candidates and
their token logprobs come from the same `gpt-5.6-luna` structured response. The
Worker maps each candidate's JSON string to UTF-8 token spans, averages every
overlapping token log probability once, and returns inverse perplexity.

Anthropic does not expose Claude output logprobs. Google's configured Gemini
Developer API model currently rejects `responseLogprobs`. Those providers use
16 independent native structured-output samples, require at least 12 successes,
and return inclusion frequency with a Wilson 95% confidence interval. There is
no shared GPT scorer, cross-provider fallback, ordinal pseudo-score or character
weighting. The actual method, model and prompt version travel with every V2
response and D1 metadata row.

## Worker boundary

The Worker exposes the retained observation and privacy endpoints plus V2 fan-out
estimation:

- `GET /api/v1/config`
- `POST /api/v1/events`
- `POST /api/v2/fan-outs`
- `DELETE /api/v1/donations`
- `POST /api/v1/fan-outs` returns HTTP 410

Anonymous fan-out calls are limited to ten per donor tag per UTC day and five
per source IP per minute. Fan-out metadata stores only a normalized seed hash,
method, model, prompt version, sample count, duration, token counts and candidate
count—not the seed or candidates.

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

The current preview resources were provisioned in the EU jurisdiction on
2026-08-09:

1. D1 database `openqueries-db` and queues `openqueries-donations` plus
   `openqueries-donations-dlq` are bound in `apps/web/wrangler.jsonc`.
2. The provisioned D1 `database_id` stays in Wrangler config; introduce a
   separate database and environment before adding a staging split.
3. `OPENAI_API_KEY`, `ANTHROPIC_API_KEY` and `GEMINI_API_KEY` are Cloudflare
   secrets, never plain Wrangler variables or extension assets.
4. `GEMINI_SCORING_METHOD` makes the deployed Google evidence path explicit.
   Switch it to `logprobs` only after the configured Google endpoint is verified
   to return chosen-token log probabilities.
5. Set `ALLOWED_EXTENSION_IDS` to the stable Chrome extension ID before public
   distribution.
6. Apply remote D1 migrations, run `pnpm check`, deploy from cumulative `main`
   and verify all retained routes plus every API endpoint.

Credentials borrowed from another local project are test inputs only. New
production secrets should be created specifically for Open Queries.
