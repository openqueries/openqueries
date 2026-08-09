# Open Queries – AI Search Query Inspector

## Summary

See ChatGPT, Claude and Google AI search queries in a local side panel, then inspect likely fan-out queries on demand.

## Detailed description

Open Queries makes the retrieval layer of AI search visible.

When ChatGPT, Claude or Google Search explicitly shows a web-search query, the extension adds it to a clean local side-panel trace. It never treats chat messages as search queries. You can then request likely fan-out queries for any captured search and inspect the provider-native evidence behind their order.

WHAT YOU CAN INSPECT

• Web-search queries surfaced by ChatGPT Search
• Web-search queries surfaced by Claude web search
• Google Search seeds and expanded queries shown in Google AI Overviews
• Likely fan-out queries, generated only when you request them
• Ranking details such as native token log probabilities, perplexity or repeated-sample inclusion frequency

LOCAL BY DEFAULT

Your 30-day query trace stays in Chrome. Query contribution is a separate, optional control and starts off. Open Queries does not collect chat messages, conversation titles, account identity or conversation URLs.

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

## Single purpose

Open Queries records only explicitly surfaced AI web-search queries in a local Chrome side panel and, when the user asks, returns likely fan-out queries with provider-native ranking evidence.

## Permission justifications

### sidePanel

The extension’s primary interface is a persistent Chrome side panel beside ChatGPT, Claude and Google Search. The toolbar action opens this panel.

### storage

Stores the user’s local 30-day query trace, privacy choice, anonymous deletion secret and on-demand fan-out results. Local history can be deleted at any time.

### Site access

Declared content scripts run only on ChatGPT, Claude and supported Google Search result pages so they can read explicit search-tool UI. The `openqueries.org` host permission is used only for the public configuration, optional query contribution, deletion and user-requested fan-out API.

### Remote code

No remote code is used. All executable extension code is included in the submitted package. Network responses contain data only.

## Data-use disclosure

- Website content: explicit web-search query text shown by a supported provider.
- Local processing: enabled automatically for the side-panel trace.
- Transfer for fan-outs: one selected query is sent only after the user clicks “Estimate fan-outs”.
- Optional contribution: privacy-checked observed queries are donated only after the user enables the separate control; it starts off.
- Not collected: chat messages, conversation titles, account identity, browsing history outside the supported search surfaces or conversation URLs.
- Not sold, used for advertising, used for credit decisions or combined with unrelated personal data.
