# Open Queries – AI Search Query Inspector

## Summary

See ChatGPT, Claude and Google AI search queries in a local side panel, then inspect likely fan-out queries on demand.

## Detailed description

Open Queries makes the retrieval layer of AI search visible.

When ChatGPT, Claude or Google Search runs a web search, the extension adds the provider's explicit search-tool query to a clean local side-panel trace. For ChatGPT this includes structured `search_queries` metadata when the interface shows only a website count. It never treats chat messages as search queries. After enabling query contribution, you can request likely fan-out queries for any captured search and inspect the provider-native evidence behind their order.

WHAT YOU CAN INSPECT

• Web-search queries surfaced by ChatGPT Search
• Web-search queries surfaced by Claude web search
• Google Search seeds and expanded queries shown in Google AI Overviews
• Likely fan-out queries, generated only when contribution is enabled and you request them
• Ranking details such as native token log probabilities, perplexity or repeated-sample inclusion frequency

LOCAL BY DEFAULT

Your 30-day query trace stays in Chrome and remains available when contribution is off. Query contribution starts off; enabling it shares privacy-checked observed queries and unlocks fan-out estimates. Open Queries does not collect chat messages, conversation titles, account identity or conversation URLs.

PROVIDER-NATIVE METHODOLOGY

There is no universal GPT ranker. ChatGPT candidates are generated and ranked with GPT-5.6 Luna’s own output log probabilities. Claude and the configured Gemini endpoint use repeated native samples with empirical inclusion frequency and Wilson 95% confidence intervals where usable output log probabilities are unavailable.

OPEN SOURCE AND AUDITABLE

The Plasmo extension, Cloudflare Worker, schemas, provider adapters and mathematical methodology are published under AGPL-3.0-or-later.

Website and methodology: https://openqueries.org
Source code and issues: https://github.com/openqueries/openqueries
Privacy: https://openqueries.org/privacy
Support: https://openqueries.org/support

Open Queries is independent and is not affiliated with, endorsed by or sponsored by OpenAI, Anthropic or Google.

## Store settings

- Category: Developer Tools
- Language: English
- Publisher: Open Queries Contributors
- Homepage: https://openqueries.org
- Support: https://openqueries.org/support
- Privacy policy: https://openqueries.org/privacy
- Official URL: https://openqueries.org
- Chrome Web Store item ID: `ieglcpgkjnieapajeldfhkjpllkcamkl`

## Reviewer instructions

No Open Queries account is required. Pin the toolbar action and open the side
panel beside ChatGPT, Claude or a Google Search result. Trigger a provider web
search; its explicit search-tool query appears in the local trace even while
contribution is off. In Claude, expand “Searched the web” to reveal the query
chip. Open Settings, enable “Donate observed queries”, then select the query and
click “Estimate fan-outs”. The parser emits only explicit search metadata or
search UI and never stores or transfers chat messages. A supported provider may
require its own login.

## Single purpose

Open Queries records only explicit AI search-tool queries in a local Chrome side panel and, after the user enables query contribution and asks, returns likely fan-out queries with provider-native ranking evidence.

## Permission justifications

### sidePanel

The extension’s primary interface is a persistent Chrome side panel beside ChatGPT, Claude and Google Search. The toolbar action opens this panel.

### storage

Stores the user’s local 30-day query trace, privacy choice, anonymous deletion secret and on-demand fan-out results. Local history can be deleted at any time.

### scripting

Registers the bundled ChatGPT document-start adapter in the page's main world so it can receive provider search metadata that is not rendered in the interface. It emits only explicit search-query fields to the isolated extension context. No remote code is loaded.

### Site access

Declared content scripts run only on ChatGPT, Claude and supported Google Search result pages. They read explicit search-tool UI or, on ChatGPT, explicit `search_queries` metadata. The `chatgpt.com` host permission is required to register that bundled main-world adapter. The `openqueries.org` host permission is used only for public configuration, optional query contribution, deletion and the user-requested fan-out API.

### Remote code

No remote code is used. All executable extension code is included in the submitted package. Network responses contain data only.

## Data-use disclosure

- Website content: explicit web-search query text exposed by a supported provider's search tool.
- Local processing: enabled automatically for the side-panel trace.
- Transfer for fan-outs: while contribution is enabled, one selected query is sent only after the user clicks “Estimate fan-outs”.
- Contribution: privacy-checked observed queries are donated only after the user enables the control; it starts off, local capture remains available, and fan-out estimates stay locked until it is enabled.
- Not collected: chat messages, conversation titles, account identity, browsing history outside the supported search surfaces or conversation URLs.
- Not sold, used for advertising, used for credit decisions or combined with unrelated personal data.
