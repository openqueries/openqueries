import {
  CONTENT_PUBLISHED_AT,
  CONTENT_UPDATED_AT,
  PRIMARY_SOURCES,
  type ContentSection,
  type ContentSource,
  type RelatedLink,
} from "./content";

export type LearnArticle = {
  slug: string;
  title: string;
  description: string;
  eyebrow: string;
  directAnswer: string;
  publishedAt: string;
  updatedAt: string;
  readMinutes: number;
  about: string[];
  sections: ContentSection[];
  sources: ContentSource[];
  related: RelatedLink[];
};

export const learnArticles: LearnArticle[] = [
  {
    slug: "what-are-fan-out-queries",
    title: "What are fan-out queries?",
    description:
      "A practical explanation of the narrower searches answer engines can use to retrieve evidence before responding.",
    eyebrow: "Query fan-out",
    directAnswer:
      "Fan-out queries are narrower searches derived from one broader information need. An AI search system can search several subtopics and sources, then combine the retrieved evidence into an answer. A fan-out may be observed when an interface exposes it or estimated through a documented model experiment.",
    publishedAt: CONTENT_PUBLISHED_AT,
    updatedAt: CONTENT_UPDATED_AT,
    readMinutes: 8,
    about: ["fan-out queries", "query fan-out", "AI retrieval"],
    sections: [
      {
        id: "one-prompt-many-searches",
        heading: "One prompt can become many searches",
        paragraphs: [
          "A broad question can contain several retrieval tasks: define a term, compare alternatives, check a current fact, identify a constraint and find a primary source. Searching each task separately can cover more of the evidence space than one literal query.",
          "Google publicly describes this as query fan-out for AI Overviews and AI Mode. OpenAI likewise explains that ChatGPT search may rewrite a request into targeted queries and issue additional searches after reviewing initial results.",
        ],
      },
      {
        id: "observed-estimated",
        heading: "Observed and estimated are not the same",
        paragraphs: [
          "Some interfaces expose explicit search activity or expanded queries. Those strings can be recorded as observations. When the production interface is silent, a provider model can generate plausible alternatives, but the output is evidence from the experiment rather than evidence of a production search.",
        ],
        table: {
          headers: ["Evidence class", "Origin", "Safe interpretation"],
          rows: [
            [
              "Observed query",
              "Recognized search UI or transport metadata",
              "The provider surfaced this search string",
            ],
            [
              "Observed expansion",
              "Recognized Google AI Overview expansion",
              "The interface exposed this narrower query",
            ],
            [
              "Estimated fan-out",
              "Named model and versioned experiment",
              "The query is plausible under that experiment",
            ],
          ],
        },
      },
      {
        id: "example",
        heading: "A fan-out example",
        paragraphs: [
          "Imagine a buyer asking which AI search extension is suitable for an SEO team. A complete answer needs more than a list of products: it needs supported surfaces, privacy boundaries, query evidence classes, installation options and measurement limits.",
        ],
        example: {
          title: "Broad question and evidence paths",
          input: "Which AI search extension should an SEO team use?",
          output:
            "Supported providers; observed queries; estimated fan-outs; local retention; Store status; open-source methodology",
          note: "These are illustrative subtopics. They become observations only when a supported interface exposes the corresponding searches.",
        },
      },
      {
        id: "editorial-workflow",
        heading: "Use fan-out as an editorial coverage map",
        paragraphs: [
          "The purpose is to identify missing evidence on one correct canonical, not to publish a separate page for every query variant.",
        ],
        steps: [
          {
            title: "Collect",
            text: "Retain source, provider, time and evidence class with each query.",
          },
          {
            title: "Group",
            text: "Separate definitions, comparisons, constraints, current facts and source needs.",
          },
          {
            title: "Map",
            text: "Assign each distinct intent to one canonical page.",
          },
          {
            title: "Improve",
            text: "Add the missing answer, workflow, evidence or limitation to that page.",
          },
          {
            title: "Validate",
            text: "Use search exposure, citations, referrals and outcomes as separate confirming signals.",
          },
        ],
      },
      {
        id: "measurement-limits",
        heading: "Why the distinction matters for AEO and GEO",
        paragraphs: [
          "AEO and GEO work needs retrieval vocabulary without false demand claims. Observed queries describe surfaced actions; estimated queries support exploration; Google Ads describes human Google demand; GSC describes site exposure.",
          "Mixing those sources can produce an impressive number that answers no defensible question.",
        ],
        callout:
          "Neither model frequency nor inverse perplexity is traditional search volume. Estimated fan-outs must never enter an observed-query count.",
      },
    ],
    sources: [
      PRIMARY_SOURCES.googleAiFeatures,
      PRIMARY_SOURCES.openAiChatGptSearch,
    ],
    related: [
      { href: "/fan-out-queries", label: "Fan-out query pillar" },
      { href: "/ai-search-optimization", label: "AI search optimization" },
      { href: "/ai-search-visibility", label: "AI search visibility" },
      { href: "/install", label: "Inspect queries in Chrome" },
    ],
  },
  {
    slug: "aeo-geo-query-data",
    title: "Why AEO and GEO need query data",
    description:
      "How human demand, observed retrieval queries and estimated fan-outs support different AEO and GEO decisions.",
    eyebrow: "AEO / GEO",
    directAnswer:
      "AEO and GEO need query data because a final citation or referral does not show the retrieval paths that preceded it. Useful evidence keeps human search demand, observed provider queries, estimated fan-outs and site performance separate, then uses each source for the decision it can actually support.",
    publishedAt: CONTENT_PUBLISHED_AT,
    updatedAt: CONTENT_UPDATED_AT,
    readMinutes: 9,
    about: ["AEO", "GEO", "AI search query data", "evidence provenance"],
    sections: [
      {
        id: "missing-demand-layer",
        heading: "The missing retrieval layer",
        paragraphs: [
          "Traditional keyword tools describe people typing into search engines. AI assistants add another layer: a model can reformulate a need, issue several searches and select evidence before presenting an answer.",
          "That layer can reveal useful concepts and qualifiers, but it is not represented by human keyword volume and should not be merged into it.",
        ],
      },
      {
        id: "four-evidence-families",
        heading: "Four evidence families, four different questions",
        paragraphs: [
          "A disciplined program names the source before interpreting the metric.",
        ],
        table: {
          headers: ["Evidence", "Question answered", "Common misuse"],
          rows: [
            [
              "Google Ads volume",
              "How much human Google demand is estimated?",
              "Calling it AI-assistant demand",
            ],
            [
              "Observed AI query",
              "What search string did the interface expose?",
              "Calling it the complete hidden process",
            ],
            [
              "Estimated fan-out",
              "What adjacent search is plausible under the experiment?",
              "Counting it as observed demand",
            ],
            [
              "GSC performance",
              "How did the site appear in Google Search?",
              "Attributing every row to an AI feature",
            ],
          ],
        },
      },
      {
        id: "provenance-contract",
        heading: "Useful data preserves provenance",
        paragraphs: [
          "Every query should carry its provider, source surface, evidence class, capture time and method version. That metadata allows a later analyst to compare like with like and identify interface or model drift.",
          "Open Queries is designed around this provenance contract before it is designed around dashboards or aggregate scores.",
        ],
        bullets: [
          "Observed remains observed.",
          "Estimated remains estimated.",
          "Missing remains unknown rather than zero.",
          "Human demand and AI retrieval remain separate until interpretation.",
        ],
      },
      {
        id: "decision-workflow",
        heading: "From query evidence to a content decision",
        paragraphs: [
          "The useful output is a falsifiable improvement to one canonical page.",
        ],
        steps: [
          {
            title: "Review the query",
            text: "Identify the task, entities, qualifiers and freshness requirements.",
          },
          {
            title: "Find the owner",
            text: "Map the intent to one existing canonical or document why it is distinct.",
          },
          {
            title: "Name the gap",
            text: "Specify the missing direct answer, workflow, input, output, source or limitation.",
          },
          {
            title: "Publish one intervention",
            text: "Change the smallest page surface that fully resolves the gap.",
          },
          {
            title: "Wait for evidence",
            text: "Use a defined observation window before making the next material rewrite.",
          },
        ],
      },
      {
        id: "limits",
        heading: "What query data can and cannot show",
        paragraphs: [
          "Recurring observed queries can strengthen confidence that a retrieval concept matters. They cannot prove a ranking factor, market size or the provider's complete reasoning. Estimated candidates can reveal adjacent language but cannot prove a production search.",
          "The defensible outcome is better content coverage and clearer measurement, not synthetic certainty.",
        ],
        callout:
          "The evidence families become useful when they converge on the same content gap while retaining their separate provenance.",
      },
    ],
    sources: [
      PRIMARY_SOURCES.googleAiFeatures,
      PRIMARY_SOURCES.googleHelpfulContent,
      PRIMARY_SOURCES.geoPaper,
    ],
    related: [
      { href: "/generative-engine-optimization", label: "GEO practical guide" },
      { href: "/answer-engine-optimization", label: "AEO practical guide" },
      { href: "/ai-search-visibility", label: "AI search visibility" },
      { href: "/methodology", label: "Open methodology" },
    ],
  },
  {
    slug: "observed-vs-estimated-ai-queries",
    title: "Observed vs. estimated AI search queries",
    description:
      "How Open Queries labels direct interface evidence and controlled model reconstructions without mixing them.",
    eyebrow: "Evidence method",
    directAnswer:
      "An observed AI search query is a string explicitly surfaced by a recognized provider search interface. An estimated query is generated by a documented model experiment after a user requests fan-out ideas. Both can be useful, but only the first is evidence that the interface exposed the search.",
    publishedAt: CONTENT_PUBLISHED_AT,
    updatedAt: CONTENT_UPDATED_AT,
    readMinutes: 8,
    about: ["observed AI queries", "estimated AI queries", "evidence classes"],
    sections: [
      {
        id: "observed-queries",
        heading: "Observed queries",
        paragraphs: [
          "An observed query must appear inside a supported search-specific UI or transport boundary. Generic conversation text and arbitrary fields named query are not eligible.",
          "If the provider changes its interface and that boundary becomes uncertain, the adapter fails closed rather than broadening collection.",
        ],
      },
      {
        id: "estimated-queries",
        heading: "Estimated queries",
        paragraphs: [
          "An estimated query is created only after privacy is accepted and a user asks for adjacent fan-out ideas. The named provider model generates the candidates, and provider-native evidence ranks or summarizes them.",
          "The score supports ordering within one bounded experiment. It is not a claim that the production assistant issued the query.",
        ],
      },
      {
        id: "evidence-table",
        heading: "The evidence contract",
        paragraphs: [
          "The label should answer where the string came from and what claim is safe.",
        ],
        table: {
          headers: ["Label", "Minimum provenance", "Permitted claim"],
          rows: [
            [
              "Observed",
              "Provider, adapter, source surface, time",
              "The supported interface surfaced this query",
            ],
            [
              "Estimated",
              "Provider model, method, prompt version, sample or token evidence",
              "The query is plausible under this experiment",
            ],
            [
              "Demand",
              "Market, language, network, period, export",
              "Google Ads estimates human Google demand",
            ],
          ],
        },
      },
      {
        id: "example",
        heading: "One string can support different claims",
        paragraphs: [
          "The words alone do not determine the evidence class. The same query text could be observed in a provider interface, generated in an experiment or measured in Google Ads.",
        ],
        example: {
          title: "Same string, different provenance",
          input: "ai search optimization workflow",
          output:
            "Observed when surfaced by a supported provider; estimated when generated as a fan-out; demand only when measured in Google Ads",
          note: "Deduplication may join identical strings for review, but it must not erase their evidence provenance.",
        },
      },
      {
        id: "storage-boundary",
        heading: "A hard storage and reporting boundary",
        paragraphs: [
          "Estimated candidates are never inserted into observed-query events. Reports must also keep Store installations, GitHub downloads, D1 product events and Search Console traffic separate.",
          "This discipline makes the data less dramatic and far more useful: every metric keeps a defensible meaning.",
        ],
        callout:
          "Observed and estimated queries may inform the same editorial decision, but they must never become the same measurement row.",
      },
    ],
    sources: [
      PRIMARY_SOURCES.openAiChatGptSearch,
      PRIMARY_SOURCES.anthropicWebSearch,
      PRIMARY_SOURCES.googleAiFeatures,
    ],
    related: [
      { href: "/chatgpt-search-queries", label: "ChatGPT search queries" },
      { href: "/claude-web-search", label: "Claude web search" },
      { href: "/google-ai-overviews", label: "Google AI Overviews" },
      { href: "/methodology", label: "Evidence methodology" },
    ],
  },
  {
    slug: "estimating-fan-out-queries-with-log-probabilities",
    title: "Estimating fan-out queries with log probabilities",
    description:
      "A mathematical account of provider-native inverse perplexity, token alignment, repeated sampling and the limits of closed-model reconstruction.",
    eyebrow: "Technical methodology",
    directAnswer:
      "Open Queries estimates plausible fan-out queries with evidence from the same provider that generates them. When native output-token log probabilities are available, it ranks candidates by token-average likelihood; otherwise it uses repeated provider-native samples and reports inclusion frequency with a Wilson interval.",
    publishedAt: CONTENT_PUBLISHED_AT,
    updatedAt: CONTENT_UPDATED_AT,
    readMinutes: 15,
    about: [
      "fan-out estimation",
      "log probabilities",
      "inverse perplexity",
      "Wilson interval",
    ],
    sections: [
      {
        id: "estimand",
        heading: "The estimand",
        paragraphs: [
          "Suppose a closed retrieval system has emitted one observed web-search query x as part of a latent query fan-out. Its full internal query distribution is not observable through the public product API. The defensible target is therefore narrower: the most likely other queries from that same fan-out under a fixed, minimal generation experiment with the named provider model.",
          "Open Queries records the provider model m, prompt p and prompt version v. The structured output Y contains exactly 12 strings. The prompt specifies no domain, search operator, language, query category or ranking rule. This does not identify the production assistant's hidden policy; it defines a repeatable proxy whose assumptions can be inspected.",
        ],
        equations: ["Y = (q₁, …, q₁₂) ~ Pₘ(· | x, p, v)"],
      },
      {
        id: "provider-match",
        heading: "Why the generator and evidence source must match",
        paragraphs: [
          "A score from a second model estimates compatibility under the second model, not under the generator. Even a capable shared ranker changes the target distribution and adds prompt-sensitive judgment. Provider-native evidence removes that avoidable cross-model mismatch.",
          "For OpenAI—and for any explicitly enabled provider endpoint that returns logprobs—the candidate strings and token evidence come from the same completion. There is no second ranking prompt, candidate rewriting step or ordinal fallback.",
        ],
      },
      {
        id: "inverse-perplexity",
        heading: "Token-level inverse perplexity",
        paragraphs: [
          "Let T(q) contain every output token whose UTF-8 byte interval overlaps the JSON string content of candidate q. A token is counted once even if it contains several characters. Character weighting would make the statistic depend twice on token length and would no longer be the standard token-average log likelihood.",
          "The arithmetic mean of conditional token log probabilities is converted into perplexity and inverse perplexity. Since log probabilities are non-positive, inverse perplexity lies in (0, 1]. Higher values mean the realized query required less surprisal per token under this particular model and context.",
        ],
        equations: [
          "ℓ̄(q) = (1 / |T(q)|) Σₜ∈T(q) log Pₘ(t | t&lt;t, x, p, v)",
          "PP(q) = exp(−ℓ̄(q))",
          "s(q) = PP(q)⁻¹ = exp(ℓ̄(q))",
        ],
        bullets: [
          "Scores are ordinal evidence inside one provider run.",
          "They are not calibrated probabilities of a hidden production search.",
          "Cross-model comparisons inherit different tokenizers and probability calibration.",
        ],
      },
      {
        id: "utf8-alignment",
        heading: "UTF-8 alignment and failure conditions",
        paragraphs: [
          "JSON escaping and multi-byte characters make JavaScript character offsets insufficient. Open Queries locates each serialized query, converts its boundaries to UTF-8 byte offsets and intersects those boundaries with cumulative provider-token byte spans. OpenAI byte arrays are used when supplied; otherwise the token text is UTF-8 encoded.",
          "A candidate without finite overlapping token evidence is omitted. If fewer than six valid native candidates remain, the request fails closed. The service does not invent scores from output order and does not call a different provider.",
        ],
      },
      {
        id: "sampling",
        heading: "Gemini and Claude as binomial inclusion experiments",
        paragraphs: [
          "When a configured provider endpoint does not return usable output-token log probabilities, the closest working provider-native proxy is repeated sampling from that model under the same prompt. Open Queries makes 16 independent structured calls and requires at least 12 valid samples.",
          "For a normalized query q, K(q) is the number of samples containing q and n is the valid sample count. Inclusion frequency estimates the probability that q appears somewhere in the bounded output under this experiment. A Wilson interval is reported because the naive normal interval performs poorly for small n and proportions near zero or one.",
        ],
        equations: [
          "K(q) = Σᵢ₌₁ⁿ 𝟙[q ∈ Yᵢ]",
          "p̂(q) = K(q) / n",
          "CI₉₅ = (p̂ + z²/2n ± z√(p̂(1−p̂)/n + z²/4n²)) / (1 + z²/n)",
        ],
      },
      {
        id: "proxy-limits",
        heading: "What the proxy can support",
        paragraphs: [
          "The output is useful for discovering plausible retrieval vocabulary and comparing candidates generated under one controlled provider context. It cannot reveal chain of thought, prove which search a production system issued or substitute for population demand measurement.",
          "Observed UI queries remain the stronger evidence class. Estimated candidates stay in a separate contract and never enter observed-query aggregates. Model, method, prompt version, token counts or sample counts travel with every response so future drift is auditable.",
        ],
        callout:
          "The estimator ranks hypotheses within a provider experiment. It does not recreate a hidden production trace.",
      },
    ],
    sources: [
      PRIMARY_SOURCES.openAiChatGptSearch,
      PRIMARY_SOURCES.anthropicWebSearch,
      PRIMARY_SOURCES.googleAiFeatures,
    ],
    related: [
      { href: "/methodology", label: "Open mathematical methodology" },
      { href: "/fan-out-queries", label: "Fan-out query pillar" },
      { href: "/ai-search-optimization", label: "AI search optimization" },
      { href: "/install", label: "Inspect queries in Chrome" },
    ],
  },
];

export function getLearnArticle(slug: string): LearnArticle | undefined {
  return learnArticles.find((article) => article.slug === slug);
}
