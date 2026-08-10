export type ContentSource = {
  label: string;
  publisher: string;
  url: string;
  accessedAt: string;
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
  },
  googleHelpfulContent: {
    label: "Creating helpful, reliable, people-first content",
    publisher: "Google Search Central",
    url: "https://developers.google.com/search/docs/fundamentals/creating-helpful-content",
    accessedAt: "2026-08-10",
  },
  googleCrawling: {
    label: "Crawling and indexing guidance",
    publisher: "Google Search Central",
    url: "https://developers.google.com/search/docs/crawling-indexing",
    accessedAt: "2026-08-10",
  },
  openAiChatGptSearch: {
    label: "ChatGPT Search",
    publisher: "OpenAI Help Center",
    url: "https://help.openai.com/en/articles/9237897-chatgpt-search",
    accessedAt: "2026-08-10",
  },
  anthropicWebSearch: {
    label: "Web search tool",
    publisher: "Claude Platform Docs",
    url: "https://platform.claude.com/docs/en/agents-and-tools/tool-use/web-search-tool",
    accessedAt: "2026-08-10",
  },
  geoPaper: {
    label: "GEO: Generative Engine Optimization",
    publisher: "Aggarwal et al., arXiv:2311.09735",
    url: "https://arxiv.org/abs/2311.09735",
    accessedAt: "2026-08-10",
  },
} satisfies Record<string, ContentSource>;

export const CONTENT_PUBLISHED_AT = "2026-08-09";
export const CONTENT_UPDATED_AT = "2026-08-10";
