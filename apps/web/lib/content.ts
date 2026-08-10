export type ContentSource = {
  label: string;
  publisher: string;
  url: string;
  accessedAt: string;
  supports: string;
};

export type ContentStep = {
  title: string;
  text: string;
};

export type ContentTable = {
  headers: string[];
  rows: string[][];
};

export type ContentExample = {
  title: string;
  input: string;
  output: string;
  note: string;
};

export type ContentSection = {
  id: string;
  heading: string;
  paragraphs: string[];
  bullets?: string[];
  steps?: ContentStep[];
  table?: ContentTable;
  example?: ContentExample;
  callout?: string;
  equations?: string[];
};

export type RelatedLink = {
  href: string;
  label: string;
};

export const PRIMARY_SOURCES = {
  googleAiFeatures: {
    label: "AI features and your website",
    publisher: "Google Search Central",
    url: "https://developers.google.com/search/docs/appearance/ai-features",
    accessedAt: "2026-08-10",
    supports:
      "Google's documented eligibility, query fan-out, internal-link, structured-data and Search Console guidance for AI Overviews and AI Mode.",
  },
  googleHelpfulContent: {
    label: "Creating helpful, reliable, people-first content",
    publisher: "Google Search Central",
    url: "https://developers.google.com/search/docs/fundamentals/creating-helpful-content",
    accessedAt: "2026-08-10",
    supports:
      "The people-first content and source-quality principles used in the editorial quality framework.",
  },
  googleCrawling: {
    label: "Crawling and indexing guidance",
    publisher: "Google Search Central",
    url: "https://developers.google.com/search/docs/crawling-indexing",
    accessedAt: "2026-08-10",
    supports:
      "The technical discovery, crawling, canonicalization and indexing requirements separated from content quality work.",
  },
  openAiChatGptSearch: {
    label: "ChatGPT Search",
    publisher: "OpenAI Help Center",
    url: "https://help.openai.com/en/articles/9237897-chatgpt-search",
    accessedAt: "2026-08-10",
    supports:
      "OpenAI's description of query rewriting, additional targeted searches, citations and OAI-SearchBot eligibility.",
  },
  anthropicWebSearch: {
    label: "Web search tool",
    publisher: "Claude Platform Docs",
    url: "https://platform.claude.com/docs/en/agents-and-tools/tool-use/web-search-tool",
    accessedAt: "2026-08-10",
    supports:
      "Anthropic's documented web-search tool loop, explicit query input, result fields, repeated searches and source citations.",
  },
  geoPaper: {
    label: "GEO: Generative Engine Optimization",
    publisher: "Aggarwal et al., arXiv:2311.09735",
    url: "https://arxiv.org/abs/2311.09735",
    accessedAt: "2026-08-10",
    supports:
      "The original GEO framing, benchmark design and the finding that optimization effects vary by domain.",
  },
  openQueriesArchitecture: {
    label: "Open Queries architecture and data flow",
    publisher: "Open Queries on GitHub",
    url: "https://github.com/openqueries/openqueries/blob/main/docs/architecture.md",
    accessedAt: "2026-08-10",
    supports:
      "The public adapter, event, local-storage and fail-closed implementation boundaries behind Open Queries product claims.",
  },
  openQueriesMethodology: {
    label: "Open Queries methodology",
    publisher: "Open Queries",
    url: "https://openqueries.org/methodology",
    accessedAt: "2026-08-10",
    supports:
      "The published distinction between observed and estimated queries, provider-native estimation methods and reporting limitations.",
  },
  openQueriesPrivacy: {
    label: "Open Queries privacy policy",
    publisher: "Open Queries",
    url: "https://openqueries.org/privacy",
    accessedAt: "2026-08-10",
    supports:
      "The visible data-minimization, local-history, optional telemetry and deletion commitments described in the privacy sections.",
  },
} satisfies Record<string, ContentSource>;

export const CONTENT_PUBLISHED_AT = "2026-08-09";
export const CONTENT_UPDATED_AT = "2026-08-10";
