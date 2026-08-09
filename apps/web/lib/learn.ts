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
    equations?: string[];
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
          "An estimated query is generated only while query contribution is enabled and after a user asks for fan-out ideas. Open Queries uses the corresponding provider model and evaluates evidence from that same provider. OpenAI exposes native token log probabilities; the current Gemini and Claude endpoints are estimated through repeated native samples because they do not expose usable output logprobs.",
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
  {
    slug: "estimating-fan-out-queries-with-log-probabilities",
    title: "Estimating fan-out queries with log probabilities",
    description:
      "A mathematical account of provider-native inverse perplexity, token alignment, repeated native sampling and the limits of closed-model reconstruction.",
    eyebrow: "Technical methodology",
    publishedAt: "2026-08-09",
    readMinutes: 14,
    sections: [
      {
        heading: "The estimand",
        paragraphs: [
          "Suppose a closed retrieval system has emitted one observed web-search query x as part of a latent query fan-out. Its full internal query distribution is not observable through the public product API. The defensible target is therefore narrower: the most likely other queries from that same fan-out under a fixed, minimal generation experiment with the named provider model.",
          "Open Queries records the provider model m, prompt p and prompt version v. The structured output Y contains exactly 12 strings. The prompt specifies no domain, search operator, language, query category or ranking rule. This does not identify the production assistant’s hidden policy; it defines a repeatable proxy whose assumptions can be inspected.",
        ],
        equations: ["Y = (q₁, …, q₁₂) ~ Pₘ(· | x, p, v)"],
      },
      {
        heading: "Why the generator and evidence source must match",
        paragraphs: [
          "A score from a second model estimates compatibility under the second model, not under the generator. Even a capable shared ranker changes the target distribution and adds prompt-sensitive judgment. Provider-native evidence removes that avoidable cross-model mismatch.",
          "For OpenAI—and for any explicitly enabled provider endpoint that returns logprobs—the candidate strings and token evidence come from the same completion. There is no second ranking prompt, candidate rewriting step or ordinal fallback.",
        ],
      },
      {
        heading: "Token-level inverse perplexity",
        paragraphs: [
          "Let T(q) contain every output token whose UTF-8 byte interval overlaps the JSON string content of candidate q. A token is counted once even if it contains several characters. This matters because character weighting would make the statistic depend twice on token length and would no longer be the standard token-average log likelihood.",
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
        heading: "UTF-8 alignment and failure conditions",
        paragraphs: [
          "JSON escaping and multi-byte characters make JavaScript character offsets insufficient. Open Queries locates each serialized query, converts its boundaries to UTF-8 byte offsets and intersects those boundaries with cumulative provider-token byte spans. OpenAI byte arrays are used when supplied; otherwise the token text is UTF-8 encoded. The same mapping is available for Gemini chosen-candidate tokens whenever a Google endpoint enables them.",
          "A candidate without finite overlapping token evidence is omitted. If fewer than six valid native candidates remain, the request fails closed. The service does not invent scores from output order and does not call a different provider.",
        ],
      },
      {
        heading: "Gemini and Claude as binomial inclusion experiments",
        paragraphs: [
          "Anthropic does not return output token log probabilities for Claude through its public Messages API. Google documents the responseLogprobs field, but the configured Gemini 3.1 Flash-Lite Developer API endpoint currently rejects it. The closest working provider-native proxy is repeated sampling from each model itself under the same prompt. Open Queries makes 16 independent structured calls and requires at least 12 valid samples. Streaming and parallel transport reduce wall-clock latency without combining or replacing samples.",
          "For a normalized query q, K(q) is the number of samples containing q and n is the valid sample count. Inclusion frequency estimates the probability that q appears somewhere in the bounded output under this experiment. A Wilson interval is reported because the naive normal interval performs poorly for small n and proportions near zero or one.",
        ],
        equations: [
          "K(q) = Σᵢ₌₁ⁿ 𝟙[q ∈ Yᵢ]",
          "p̂(q) = K(q) / n",
          "CI₉₅ = (p̂ + z²/2n ± z√(p̂(1−p̂)/n + z²/4n²)) / (1 + z²/n)",
        ],
      },
      {
        heading: "What the proxy can support",
        paragraphs: [
          "The output is useful for discovering plausible retrieval vocabulary and comparing candidates generated under one controlled provider context. It cannot reveal chain of thought, prove which search a production system issued or substitute for population demand measurement.",
          "Observed UI queries remain the stronger evidence class. Estimated candidates stay in a separate contract and never enter observed-query aggregates. Model, method, prompt version, token counts or sample counts travel with every response so future model drift is auditable.",
        ],
      },
    ],
  },
];

export function getLearnArticle(slug: string): LearnArticle | undefined {
  return learnArticles.find((article) => article.slug === slug);
}
