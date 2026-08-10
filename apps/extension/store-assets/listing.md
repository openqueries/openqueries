# Open Queries – AI Search Query Inspector

## Summary

See ChatGPT, Claude and Google AI search queries in a local side panel, then inspect likely fan-out queries on demand.

## Detailed description

Open Queries makes the retrieval layer of AI search visible.

When ChatGPT, Claude or Google Search runs a web search, the extension recognizes the provider's explicit search-tool query. ChatGPT and Claude are read from structured provider transport metadata, including cases where the interface shows only a website count. Google supplies the Search seed and query expansions explicitly exposed inside an AI Overview. Open Queries never treats chat messages as search queries. After accepting the privacy setting, you can view the query trace, request likely fan-out queries and inspect the provider-native evidence behind their order.

WHAT YOU CAN INSPECT

• Web-search queries surfaced by ChatGPT Search
• Web-search queries surfaced by Claude web search
• Google Search seeds and expanded queries shown in Google AI Overviews
• Likely fan-out queries, generated only after privacy is accepted and you request them
• Ranking details such as native token log probabilities, perplexity or repeated-sample inclusion frequency

PRIVACY ACCEPTANCE

Privacy starts unaccepted. Until you accept it, Current and History show no query data. Once accepted, every observed query is sent with a random pseudonymous installation tag, the query trace becomes visible and fan-out estimates are unlocked. Open Queries does not collect chat messages, conversation titles, account identity or conversation URLs.

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
search normally; no search-mode selection or disclosure click is required. Open
Settings, switch on “Privacy accepted”, then select the query and click
“Estimate fan-outs”. The parser emits only explicit search-tool metadata or
Google Search evidence and never stores or transfers chat messages. A supported
provider may require its own login.

## Single purpose

Open Queries recognizes only explicit AI search-tool queries and, after the user accepts privacy, displays them in a Chrome side panel and returns requested fan-out queries with provider-native ranking evidence.

## Permission justifications

### sidePanel

The extension’s primary interface is a persistent Chrome side panel beside ChatGPT, Claude and Google Search. The toolbar action opens this panel.

### storage

Stores the user’s local 30-day query trace, privacy choice, anonymous deletion secret and on-demand fan-out results. Local history can be deleted at any time.

### scripting

Registers the bundled ChatGPT and Claude document-start adapters in the page's main world so they can receive provider search metadata that is not rendered in the interface. They emit only explicit search-query fields to the isolated extension context. No remote code is loaded.

### Site access

Declared content scripts run only on ChatGPT, Claude and supported Google Search result pages. ChatGPT and Claude read explicit provider search-tool metadata; Google reads the Search seed and explicit query expansions inside recognized AI Overview containers. The `chatgpt.com` and `claude.ai` host permissions are required to register those bundled main-world adapters. The `openqueries.org` host permission is used only after privacy acceptance for query transfer, deletion and the user-requested fan-out API.

### Remote code

No remote code is used. All executable extension code is included in the submitted package. Network responses contain data only.

## Data-use disclosure

- Website content: explicit web-search query text exposed by a supported provider's search tool.
- Local processing: enabled automatically for the side-panel trace.
- Transfer: after privacy is accepted, every observed query is automatically sent, whether or not its fan-outs are requested.
- Fan-outs: after privacy is accepted, one selected query is sent to the corresponding provider only when the user clicks “Estimate fan-outs”.
- Visibility: until privacy is accepted, Current and History display no query data and offer the privacy slider directly.
- Not collected: chat messages, conversation titles, account identity, browsing history outside the supported search surfaces or conversation URLs.
- Not sold, used for advertising, used for credit decisions or combined with unrelated personal data.
