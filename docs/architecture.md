# Architecture

Open Queries is one monorepo with four trust boundaries:

```text
Provider search-tool signal
  -> fail-closed, provider-specific Plasmo adapter
  -> Chrome side panel + 30-day local history
       -> every eligible observation after privacy acceptance -> D1 raw events
       -> privacy accepted + explicit fan-out request -> Cloudflare Worker
            -> ChatGPT: gpt-5.6-luna structured output + native token logprobs
            -> Google: gemini-3.1-flash-lite, 16 native samples + Wilson interval
            -> Claude: claude-haiku-4-5, 16 native samples + Wilson interval
            -> rank-first result with expandable mathematical evidence

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
All capture and history processing happens locally while privacy is unaccepted,
but Current and History display no query data. Accepting privacy sends every
eligible observed query and unlocks the trace plus explicit, user-requested
fan-out estimation.

Sensitive-pattern checks run before transfer and again at the Worker. Unsafe
queries stay local and cannot be sent for fan-out estimation. Old local V1
estimates are discarded during state hydration rather than displayed under the
new evidence contract.

## Provider-native estimation

All providers receive the same versioned minimal prompt. It asks only for the
most likely other web-search queries from the same fan-out as one observed
query; it does not prescribe operators, domains, categories or query syntax.
OpenAI candidates and
their token logprobs come from the same `gpt-5.6-luna` structured response. The
Worker maps each candidate's JSON string to UTF-8 token spans, averages every
overlapping token log probability once, and returns inverse perplexity.

Anthropic does not expose Claude output logprobs. Google's configured Gemini
Developer API model currently rejects `responseLogprobs`. Those providers use
16 independent native structured-output samples, require at least 12 successes,
and return inclusion frequency with a Wilson 95% confidence interval. Claude's
independent calls use SSE so Cloudflare can release connection slots on response
headers while bodies are still streaming; Gemini uses six-request batches.
Transport concurrency does not alter the sample count or estimator. There is
no shared GPT scorer, cross-provider fallback, ordinal pseudo-score or character
weighting. The actual method, model and prompt version travel with every V2
response.

## Worker boundary

The Worker exposes three product endpoints:

- `POST /api/v1/events`
- `POST /api/v2/fan-outs`
- `DELETE /api/v1/query-data`

Anonymous fan-out calls are limited to ten per donor tag per UTC day and five
per source IP per minute. Query events are validated and written directly to D1.
Deletion removes the installation's raw events and quota rows directly.

## Retention

- Local extension history: 30 days, maximum 2,000 events.
- Raw D1 events: 13 months.
- Quota rows: 14 days.
- Estimated fan-outs: returned to the extension, not stored as observations.

## Cloudflare provisioning

The current preview resources were provisioned in the EU jurisdiction on
2026-08-09:

1. D1 database `openqueries-db` is bound in `apps/web/wrangler.jsonc`.
2. The provisioned D1 `database_id` stays in Wrangler config; introduce a
   separate database and environment before adding a staging split.
3. `OPENAI_API_KEY`, `ANTHROPIC_API_KEY` and `GEMINI_API_KEY` are Cloudflare
   secrets, never plain Wrangler variables or extension assets.
4. Set `ALLOWED_EXTENSION_IDS` to the stable Chrome extension ID before public
   distribution.
5. Apply remote D1 migrations, run `pnpm check`, deploy from cumulative `main`
   and verify all retained routes plus every API endpoint.

Credentials borrowed from another local project are test inputs only. New
production secrets should be created specifically for Open Queries.
