export type LearnArticle = {
  slug: string;
  title: string;
  description: string;
  eyebrow: string;
  publishedAt: string;
  readMinutes: number;
  sections: Array<{
    heading: string;
    paragraphs: string[];
    bullets?: string[];
  }>;
};

export const learnArticles: LearnArticle[] = [
  {
    slug: "what-are-fan-out-queries",
    title: "What are fan-out queries?",
    description:
      "A practical explanation of the hidden sub-queries answer engines use to retrieve evidence before responding.",
    eyebrow: "Query fan-out",
    publishedAt: "2026-08-09",
    readMinutes: 5,
    sections: [
      {
        heading: "One prompt can become many searches",
        paragraphs: [
          "An answer engine rarely treats a broad question as one literal keyword. It can decompose the information need into narrower searches for definitions, comparisons, constraints, current facts and primary sources. Those narrower searches are commonly called fan-out queries.",
          "The process improves retrieval coverage, but it also creates a blind spot: publishers can see the final citation or referral while the searches that led to it often remain invisible.",
        ],
      },
      {
        heading: "Observed and estimated are not the same",
        paragraphs: [
          "Some assistants expose their web-search tool activity in the interface. Those strings can be recorded as observed queries. When a system does not expose them, another model can estimate plausible alternatives—but those estimates are hypotheses, not evidence of what happened.",
          "Open Queries keeps those two evidence classes separate everywhere: in the extension, API contracts, database and future public datasets.",
        ],
      },
      {
        heading: "Why the distinction matters",
        paragraphs: [
          "AEO and GEO work needs a vocabulary for retrieval demand that does not overstate model behavior.",
        ],
        bullets: [
          "Observed queries describe a surfaced tool action.",
          "Estimated fan-outs help explore adjacent retrieval paths.",
          "Neither score nor repetition is equivalent to traditional search volume.",
        ],
      },
    ],
  },
  {
    slug: "aeo-geo-query-data",
    title: "Why AEO and GEO need query data",
    description:
      "Traditional keyword tools describe human search demand, not the retrieval steps AI answer engines perform for users.",
    eyebrow: "AEO / GEO",
    publishedAt: "2026-08-09",
    readMinutes: 6,
    sections: [
      {
        heading: "The missing demand layer",
        paragraphs: [
          "Keyword histories were built around humans typing into search boxes. AI assistants add another layer: models can reformulate a user need, issue multiple searches and select evidence before producing an answer.",
          "That retrieval layer is useful for understanding which concepts, qualifiers and source types make content discoverable to answer engines. It is not yet represented well in conventional keyword databases.",
        ],
      },
      {
        heading: "Useful data must preserve provenance",
        paragraphs: [
          "A query dataset becomes misleading when model-generated suggestions are counted as real activity. Useful AEO evidence records where a query came from, whether it was observed or estimated, which surface exposed it and when it was collected.",
          "Open Queries is designed around that provenance contract before it is designed around dashboards.",
        ],
      },
      {
        heading: "What the data can and cannot show",
        paragraphs: [
          "Observed query patterns can reveal recurring retrieval language. They cannot prove ranking factors, market size or the full hidden reasoning of a model.",
        ],
        bullets: [
          "Use recurring patterns to improve topic coverage and source clarity.",
          "Validate content decisions against citations, referrals and independent demand signals.",
          "Do not call synthetic estimates search volume.",
        ],
      },
    ],
  },
  {
    slug: "observed-vs-estimated-ai-queries",
    title: "Observed vs. estimated AI search queries",
    description:
      "How Open Queries labels direct UI evidence and probabilistic reconstructions without mixing the two.",
    eyebrow: "Evidence method",
    publishedAt: "2026-08-09",
    readMinutes: 4,
    sections: [
      {
        heading: "Observed queries",
        paragraphs: [
          "An observed query is a search string explicitly surfaced by an assistant's web-search interface, or the disclosed Google Search seed exception. The browser adapter must find it inside a search-specific UI container. Generic conversation text is never eligible.",
          "If a provider changes its interface and the adapter loses that explicit boundary, collection fails closed.",
        ],
      },
      {
        heading: "Estimated queries",
        paragraphs: [
          "An estimated query is generated only after a user asks for fan-out ideas. Open Queries uses a low-cost model from the corresponding provider to propose candidates and a shared log-probability scorer to rank that single candidate set.",
          "The score is useful for ordering candidates within a run. It is not a claim that the original assistant issued the query.",
        ],
      },
      {
        heading: "A hard storage boundary",
        paragraphs: [
          "Estimated candidates are not inserted into observed-query donation events or demand aggregates. This keeps exploration useful without manufacturing market evidence.",
        ],
      },
    ],
  },
];

export function getLearnArticle(slug: string): LearnArticle | undefined {
  return learnArticles.find((article) => article.slug === slug);
}
