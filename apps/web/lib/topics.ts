import type { Provider } from "@openqueries/provider-icons";

export type TopicPage = {
  slug: string;
  title: string;
  description: string;
  eyebrow: string;
  intro: string;
  provider?: Provider;
  providerLabel?: string;
  sections: Array<{
    heading: string;
    paragraphs: string[];
    bullets?: string[];
  }>;
  related: Array<{ href: string; label: string }>;
};

export const topicPages: TopicPage[] = [
  {
    slug: "chatgpt-search-queries",
    title: "ChatGPT search queries",
    description:
      "See the web-search queries ChatGPT surfaces, distinguish observed searches from estimates and inspect likely query fan-outs.",
    eyebrow: "Supported surface · ChatGPT search",
    intro:
      "Open Queries adds a local side-panel trace to ChatGPT search. It reads only explicit web-search tool UI—not prompts or conversation text.",
    provider: "chatgpt",
    providerLabel: "ChatGPT",
    sections: [
      {
        heading: "What the extension observes",
        paragraphs: [
          "When ChatGPT exposes a web-search action in a recognized search-specific container, Open Queries records the surfaced query as an observation. Generic assistant text and user messages are never eligible.",
          "Every item carries its platform, evidence class, capture time and adapter version. If the interface changes and the boundary becomes uncertain, the adapter fails closed.",
        ],
      },
      {
        heading: "Observed search versus likely fan-out",
        paragraphs: [
          "A visible ChatGPT search is evidence of a surfaced tool action. A fan-out estimate is a separate experiment initiated from the side panel.",
          "For the configured OpenAI endpoint, candidates are generated as structured output and ranked using GPT-5.6 Luna's native token log probabilities from that same output. No other model scores the result.",
        ],
      },
      {
        heading: "Why this helps AI search work",
        paragraphs: [
          "Search-query traces expose the vocabulary and qualifiers used during retrieval. They can inform content coverage and source selection, but they are not traditional keyword volume or proof of hidden reasoning.",
        ],
        bullets: [
          "Inspect individual surfaced queries locally.",
          "Keep observed and estimated evidence visually separate.",
          "Contribute privacy-checked observations only if you opt in.",
        ],
      },
    ],
    related: [
      { href: "/chatgpt-search-history", label: "ChatGPT search history" },
      { href: "/fan-out-queries", label: "Fan-out queries" },
      { href: "/methodology", label: "Mathematical methodology" },
    ],
  },
  {
    slug: "chatgpt-search-history",
    title: "ChatGPT search history is not chat history",
    description:
      "Understand the difference between ChatGPT chat history and a local trace of web-search queries surfaced during retrieval.",
    eyebrow: "Clear terminology",
    intro:
      "Open Queries keeps a local history of surfaced ChatGPT web searches. It does not read or recreate your ChatGPT conversations.",
    provider: "chatgpt",
    providerLabel: "ChatGPT",
    sections: [
      {
        heading: "What appears in the local history",
        paragraphs: [
          "Eligible entries are strings displayed by supported web-search tool UI. The local record includes only the query, provider, evidence class, time and technical adapter metadata.",
          "The history is limited to 30 days and 2,000 entries and can be cleared from Settings.",
        ],
      },
      {
        heading: "What stays outside",
        paragraphs: [
          "Prompts, responses, conversation titles, conversation URLs, account identity and unrelated browser history have no fields in the event schema.",
        ],
        bullets: [
          "No chat-message collection.",
          "No conversation identifiers.",
          "No account or cookie access.",
        ],
      },
      {
        heading: "Local history and open aggregation",
        paragraphs: [
          "Local capture is the installed product. Contributing safe observed queries to the open history is a separate option that starts off. Estimated fan-outs are never counted as observed demand.",
        ],
      },
    ],
    related: [
      { href: "/chatgpt-search-queries", label: "ChatGPT search queries" },
      { href: "/privacy", label: "Privacy contract" },
      { href: "/install", label: "Install Open Queries" },
    ],
  },
  {
    slug: "claude-web-search",
    title: "Claude web search queries",
    description:
      "Inspect web-search queries visibly surfaced by Claude and explore provider-native fan-out estimates without collecting chats.",
    eyebrow: "Supported surface · Claude web search",
    intro:
      "Open Queries recognizes explicit Claude web-search UI, records the surfaced query locally and leaves conversation content alone.",
    provider: "claude",
    providerLabel: "Claude",
    sections: [
      {
        heading: "A fail-closed Claude adapter",
        paragraphs: [
          "The adapter uses search-specific interface markers rather than scanning generic message containers. A provider UI change can temporarily stop capture, but it must not widen collection into the conversation.",
        ],
      },
      {
        heading: "Provider-native estimates",
        paragraphs: [
          "The current Anthropic endpoint does not return usable output token log probabilities. Open Queries therefore makes repeated structured-output calls to the named Claude model and reports candidate inclusion frequency with a Wilson 95% interval.",
          "Claude candidates are never handed to GPT for ranking. The model, prompt version, sample count and estimator travel with the result.",
        ],
      },
      {
        heading: "Interpret the trace carefully",
        paragraphs: [
          "A surfaced query is direct interface evidence. An estimated fan-out is a model-specific reconstruction. Neither proves the provider's full internal retrieval process or population demand.",
        ],
      },
    ],
    related: [
      { href: "/fan-out-queries", label: "Fan-out queries" },
      { href: "/methodology", label: "Provider-native methodology" },
      { href: "/privacy", label: "Privacy contract" },
    ],
  },
  {
    slug: "google-ai-overviews",
    title: "Google AI Overviews and query fan-out",
    description:
      "See Google Search seed queries and expanded queries exposed around AI Overviews, with evidence classes kept separate.",
    eyebrow: "Supported surface · Google AI Overviews",
    intro:
      "Google Search is the disclosed exception: Open Queries can record the typed search seed and separately label query expansions exposed by an AI Overview.",
    provider: "google",
    providerLabel: "Google",
    sections: [
      {
        heading: "Two distinct Google evidence classes",
        paragraphs: [
          "The original Google Search string is labeled google_user_search. Expanded searches found inside a recognized AI Overview container are labeled observed_expanded_query.",
          "Normal result links and unrelated page text do not become observations.",
        ],
      },
      {
        heading: "Reconstructing missing expansions",
        paragraphs: [
          "When Google does not visibly expose the full fan-out, the user can request an estimate. The configured Gemini endpoint is tested for native logprob support; if it does not return aligned token probabilities, Open Queries uses repeated Gemini samples and reports the uncertainty explicitly.",
        ],
      },
      {
        heading: "Useful for GEO, without invented certainty",
        paragraphs: [
          "The trace can reveal alternative formulations and evidence needs around Google AI search. Open Queries does not describe estimated candidates as searches that definitely occurred.",
        ],
      },
    ],
    related: [
      { href: "/fan-out-queries", label: "What are fan-out queries?" },
      { href: "/generative-engine-optimization", label: "GEO guide" },
      { href: "/methodology", label: "Mathematical methodology" },
    ],
  },
  {
    slug: "fan-out-queries",
    title: "What are fan-out queries?",
    description:
      "A rigorous explanation of query fan-out in AI search, direct observations and statistically ranked reconstructions.",
    eyebrow: "AI retrieval vocabulary",
    intro:
      "A broad request can become multiple narrower web searches for definitions, constraints, comparisons, current facts and primary sources.",
    sections: [
      {
        heading: "One information need, several retrieval paths",
        paragraphs: [
          "Fan-out helps an answer system cover more of the evidence space than one literal keyword can. The resulting searches may vary with the model, prompt, user context, available tools and time.",
        ],
      },
      {
        heading: "Directly observed and statistically estimated",
        paragraphs: [
          "Some product interfaces expose search activity or expanded queries. Those strings can be recorded as observations. If the interface is silent, a provider model can generate plausible alternatives, but those remain estimates.",
        ],
        bullets: [
          "Observed means surfaced in recognized search UI.",
          "Estimated means generated by the documented experiment.",
          "Rank is evidence within one provider run—not search volume.",
        ],
      },
      {
        heading: "Why fan-out matters for AI visibility",
        paragraphs: [
          "Adjacent retrieval queries expose concepts and qualifiers that a publisher may need to answer clearly. They are most useful when combined with citations, referrals and independent human-search demand data.",
        ],
      },
    ],
    related: [
      { href: "/methodology", label: "Read the equations" },
      { href: "/ai-search-visibility", label: "AI search visibility" },
      { href: "/install", label: "Inspect queries in Chrome" },
    ],
  },
  {
    slug: "ai-search-visibility",
    title: "AI search visibility starts with retrieval evidence",
    description:
      "Use observed AI search queries and clearly labeled fan-out estimates as an open input into AI and LLM visibility work.",
    eyebrow: "AI visibility",
    intro:
      "Open Queries is not a closed rank tracker. It exposes a narrower foundation: the retrieval queries that supported AI surfaces make visible.",
    sections: [
      {
        heading: "What query evidence adds",
        paragraphs: [
          "Traditional analytics starts at impressions, citations and referrals. Query observations add the language used immediately before evidence is selected, where the interface exposes it.",
        ],
      },
      {
        heading: "What Open Queries does not claim",
        paragraphs: [
          "It does not measure every hidden search, guarantee a citation, infer a universal ranking factor or convert generated candidates into population demand.",
        ],
      },
      {
        heading: "A practical evidence stack",
        paragraphs: [
          "Use observed retrieval patterns to form hypotheses, estimated fan-outs to explore adjacent paths, and independent analytics to validate business impact.",
        ],
        bullets: [
          "Observed provider queries.",
          "Provider-native estimate provenance.",
          "Citations, referrals and conversion outcomes.",
          "Human-search keyword demand where relevant.",
        ],
      },
    ],
    related: [
      { href: "/generative-engine-optimization", label: "GEO" },
      { href: "/answer-engine-optimization", label: "AEO" },
      { href: "/fan-out-queries", label: "Fan-out queries" },
    ],
  },
  {
    slug: "generative-engine-optimization",
    title: "Generative engine optimization with query evidence",
    description:
      "A practical GEO framework using observed retrieval queries, source evidence and cautiously interpreted fan-out estimates.",
    eyebrow: "Generative engine optimization · GEO",
    intro:
      "GEO aims to make useful, trustworthy information easier for generative answer systems to retrieve, understand and cite.",
    sections: [
      {
        heading: "Start with answerable information needs",
        paragraphs: [
          "Observed and adjacent queries help map the definitions, comparisons, constraints and current facts a source must answer. They do not replace editorial judgment or authoritative evidence.",
        ],
      },
      {
        heading: "Build source quality, not keyword repetition",
        paragraphs: [
          "Clear entities, dated claims, primary sources, explicit methodology and accessible page structure give retrieval systems better evidence than repetitive phrasing.",
        ],
      },
      {
        heading: "Measure the entire chain",
        paragraphs: [
          "Query evidence belongs beside citation monitoring, referral analytics, branded demand and conversion. A single generated answer is not a durable visibility metric.",
        ],
      },
    ],
    related: [
      { href: "/ai-search-visibility", label: "AI search visibility" },
      { href: "/google-ai-overviews", label: "Google AI Overviews" },
      { href: "/methodology", label: "Open methodology" },
    ],
  },
  {
    slug: "answer-engine-optimization",
    title: "Answer engine optimization and retrieval queries",
    description:
      "An AEO framework for connecting answerable questions, retrieval queries, structured evidence and measurable outcomes.",
    eyebrow: "Answer engine optimization · AEO",
    intro:
      "AEO improves the clarity and retrievability of answers across search and assistant interfaces without pretending their ranking systems are fully observable.",
    sections: [
      {
        heading: "Design for the question behind the query",
        paragraphs: [
          "A useful answer states scope, definitions, assumptions and evidence directly. Retrieval-query traces can reveal which qualifiers and subquestions matter in practice.",
        ],
      },
      {
        heading: "Keep evidence provenance visible",
        paragraphs: [
          "Distinguish what a provider surfaced from what a model generated as a plausible alternative. Mixing those classes creates false confidence and weak optimization decisions.",
        ],
      },
      {
        heading: "Validate outside the model",
        paragraphs: [
          "Measure citations, referrals, task completion and business outcomes. Use query estimates as exploration—not as synthetic search volume.",
        ],
      },
    ],
    related: [
      { href: "/ai-search-visibility", label: "AI search visibility" },
      { href: "/fan-out-queries", label: "Fan-out queries" },
      { href: "/install", label: "Open the side panel" },
    ],
  },
];

export const topicPageBySlug = new Map(
  topicPages.map((topic) => [topic.slug, topic]),
);
