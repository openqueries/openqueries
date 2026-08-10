# Contributing to Open Queries

Open Queries is a group effort to make AI retrieval more inspectable without
turning conversations into telemetry.

## Before opening a change

1. Install Node 22 or newer and pnpm 8.10.5.
2. Run `pnpm install`.
3. Apply the local D1 migration documented in the README.
4. Run `pnpm check` before submitting the change.

## Adapter rules

Provider adapters must fail closed. They may emit a query only from an explicit
search-scoped transport field or, for Google, an explicit search-scoped page
element. Generic user or assistant message containers are never valid
extraction roots.

Every adapter change must include a sanitized transport or DOM fixture test that
proves both:

- the intended search query is extracted; and
- nearby chat text, titles, URLs, IDs and account details are not extracted.

Never commit real conversations, raw provider responses or account data. Reduce
fixtures to the smallest synthetic payload or markup that preserves the relevant
boundary.

## Evidence labels

- `observed_model_search` is a query visibly surfaced by a model search tool.
- `observed_expanded_query` is a visibly surfaced expansion or fan-out.
- `google_user_search` is the disclosed Google Search seed exception.
- Generated alternatives always use `provenance: estimated` and never enter
  observed-query aggregates.

Changing these meanings requires a versioned contract change, migration,
methodology update and regression tests across extension and Worker.

## Credentials

Use ignored local environment files or Cloudflare secrets. Do not put provider
keys, private DOM captures or production data in issues, fixtures, logs or pull
requests.
