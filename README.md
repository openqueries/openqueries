# Open Queries

Open Queries makes AI web search visible. The Chrome extension captures only
explicitly surfaced web-search queries from ChatGPT, Claude and Google AI
surfaces, shows them in a side panel, and can estimate likely fan-out queries
on demand.

The project is deliberately split into a privacy-constrained browser extension,
a Cloudflare Worker API and an SEO-ready public website. Chat messages and
conversation metadata are outside the data contract.

## Workspace

- `apps/extension` — Plasmo MV3 side-panel extension.
- `apps/web` — vinext/Next website and Cloudflare Worker API.
- `packages/contracts` — versioned public request and response schemas.
- `packages/query-core` — query normalization, redaction and score helpers.

## Development

```bash
pnpm install
pnpm --filter @openqueries/web exec wrangler d1 migrations apply openqueries-db --local
pnpm check
```

For local provider calls, copy `apps/web/.env.example` to `apps/web/.env` and
add test-only provider credentials. Copy `apps/extension/.env.example` to
`apps/extension/.env.development` when the extension should call the local
Worker. Both destination files are ignored. Provider keys must never be copied
into source, extension bundles or committed files.

Run the two development processes separately:

```bash
pnpm dev:web
pnpm dev:extension
```

The production extension build is written to
`apps/extension/build/chrome-mv3-prod`.

## Privacy boundary

Open Queries accepts only observed model search queries, observed expanded
queries, and the explicitly disclosed Google Search seed exception. Synthetic
fan-outs never count as observed demand. Raw donation events expire after 13
months; durable aggregates require at least five distinct donors.

See [the architecture notes](docs/architecture.md) for the event flow and
Cloudflare setup. Adapter contributions must follow [CONTRIBUTING.md](CONTRIBUTING.md).

## License

AGPL-3.0-or-later.
