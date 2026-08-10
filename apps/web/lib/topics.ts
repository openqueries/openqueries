import type { Provider } from "@openqueries/provider-icons";

import {
  CONTENT_PUBLISHED_AT,
  CONTENT_UPDATED_AT,
  PRIMARY_SOURCES,
  type ContentSection,
  type ContentSource,
  type RelatedLink,
} from "./content";

export type TopicPage = {
  slug: string;
  title: string;
  description: string;
  eyebrow: string;
  directAnswer: string;
  publishedAt: string;
  updatedAt: string;
  schemaType: "Article" | "TechArticle";
  about: string[];
  provider?: Provider;
  providerLabel?: string;
  sections: ContentSection[];
  sources: ContentSource[];
  related: RelatedLink[];
};

export const topicPages: TopicPage[] = [
  {
    slug: "chatgpt-search-queries",
    title: "ChatGPT search queries",
    description:
      "See the web-search queries ChatGPT surfaces, separate observed searches from estimates and turn retrieval evidence into useful content decisions.",
    eyebrow: "Supported surface · ChatGPT search",
    directAnswer:
      "ChatGPT search queries are targeted web searches created when ChatGPT uses search to answer a request. Open Queries records only explicit search-tool query metadata exposed by the supported interface, never the prompt or conversation text, and labels any later fan-out reconstruction as an estimate.",
    publishedAt: CONTENT_PUBLISHED_AT,
    updatedAt: CONTENT_UPDATED_AT,
    schemaType: "TechArticle",
    about: ["ChatGPT search", "AI search queries", "query fan-out"],
    provider: "chatgpt",
    providerLabel: "ChatGPT",
    sections: [
      {
        id: "what-chatgpt-search-does",
        heading: "What ChatGPT search does",
        paragraphs: [
          "OpenAI explains that ChatGPT may rewrite a request into one or more targeted searches and may issue additional searches after reviewing initial results. Those retrieval queries can be more specific than the wording a user typed.",
          "That distinction matters for SEO and AEO teams: a user question is the information need, while the surfaced search query is one observable retrieval action used to find evidence for the answer.",
        ],
      },
      {
        id: "what-open-queries-observes",
        heading: "What Open Queries observes",
        paragraphs: [
          "The Chrome extension accepts a string only when the supported ChatGPT adapter finds it inside explicit search-tool transport metadata. Generic assistant text, prompts, message bodies and conversation identifiers are outside the event contract.",
        ],
        bullets: [
          "Query text, provider, evidence class and capture time.",
          "Adapter and schema versions needed to audit the observation.",
          "A fail-closed boundary when the provider interface changes.",
        ],
      },
      {
        id: "observed-versus-estimated",
        heading: "Observed search and estimated fan-out are different evidence",
        paragraphs: [
          "An observed query is a search string explicitly surfaced by the provider. An estimated fan-out is generated only after the user selects a query and requests related searches from the side panel.",
        ],
        table: {
          headers: ["Evidence", "What it supports", "What it does not prove"],
          rows: [
            [
              "Observed ChatGPT query",
              "A surfaced search-tool action",
              "The complete hidden retrieval process",
            ],
            [
              "Estimated fan-out",
              "Plausible adjacent retrieval language",
              "A search that definitely occurred",
            ],
            [
              "Google Ads volume",
              "Human Google search demand",
              "ChatGPT query frequency",
            ],
          ],
        },
      },
      {
        id: "workflow",
        heading: "A practical workflow for a search team",
        paragraphs: [
          "Treat the query trace as an editorial input, then validate the resulting content decision with independent evidence.",
        ],
        steps: [
          {
            title: "Capture",
            text: "Open the side panel on a supported ChatGPT search and record the surfaced query.",
          },
          {
            title: "Classify",
            text: "Separate the core question, qualifiers, entities and freshness requirements.",
          },
          {
            title: "Compare",
            text: "Check whether one existing canonical answers the retrieval need with primary evidence.",
          },
          {
            title: "Validate",
            text: "Use Search Console, citations and referral data to test whether the change earns discovery.",
          },
        ],
        example: {
          title: "Example query trace",
          input:
            "User need: compare expense platforms for a multi-entity European company",
          output:
            "Observed query: multi entity expense management software Europe",
          note: "The observed query reveals qualifiers worth answering; it is not population search volume or hidden reasoning.",
        },
      },
      {
        id: "limitations",
        heading: "Limits and safe interpretation",
        paragraphs: [
          "Open Queries cannot reveal every search ChatGPT may perform, guarantee that the interface exposes every action or infer why a source was selected. Provider behavior can change, so adapter evidence and dates remain part of the claim.",
          "Use the trace to form a content hypothesis. Use search performance, citations, referrals and business outcomes to decide whether the hypothesis was useful.",
        ],
        callout:
          "A surfaced query is direct interface evidence. It is not chain of thought, a ranking factor or a complete map of the provider's retrieval system.",
      },
    ],
    sources: [PRIMARY_SOURCES.openAiChatGptSearch],
    related: [
      {
        href: "/learn/observed-vs-estimated-ai-queries",
        label: "Observed vs. estimated queries",
      },
      { href: "/learn/what-are-fan-out-queries", label: "Fan-out query guide" },
      { href: "/chatgpt-search-history", label: "ChatGPT search history" },
      { href: "/fan-out-queries", label: "Fan-out queries" },
      { href: "/methodology", label: "Mathematical methodology" },
      { href: "/install", label: "Install Open Queries" },
    ],
  },
  {
    slug: "chatgpt-search-history",
    title: "ChatGPT search history is not chat history",
    description:
      "Understand the difference between ChatGPT chat history and a local, privacy-bounded trace of web-search queries surfaced during retrieval.",
    eyebrow: "Clear terminology",
    directAnswer:
      "A ChatGPT search history is a record of web-search queries surfaced while ChatGPT retrieves sources. It is not a copy of chat history: Open Queries does not read prompts, responses, titles, account identity or conversation URLs.",
    publishedAt: CONTENT_PUBLISHED_AT,
    updatedAt: CONTENT_UPDATED_AT,
    schemaType: "TechArticle",
    about: ["ChatGPT search history", "browser privacy", "AI search queries"],
    provider: "chatgpt",
    providerLabel: "ChatGPT",
    sections: [
      {
        id: "two-histories",
        heading: "Two very different kinds of history",
        paragraphs: [
          "Chat history preserves a conversation. Search history, in the narrow Open Queries sense, preserves only eligible web-search strings that the provider exposes during retrieval.",
          "The distinction is structural rather than cosmetic: the event schema has no fields for message text, conversation titles, account identity or conversation URLs.",
        ],
      },
      {
        id: "stored-fields",
        heading: "What appears in the local trace",
        paragraphs: [
          "Each eligible entry contains the minimum information needed to understand and audit the query observation.",
        ],
        bullets: [
          "The surfaced search query.",
          "Provider and evidence class.",
          "Capture time and adapter version.",
          "A 30-day local retention boundary with a 2,000-entry limit.",
        ],
      },
      {
        id: "excluded-fields",
        heading: "What stays outside",
        paragraphs: [
          "The extension does not build a conversation archive. It does not require the user's prompt to understand whether a provider emitted an explicit search-tool query.",
        ],
        table: {
          headers: ["Included", "Excluded"],
          rows: [
            ["Explicit web-search query", "Prompt or response text"],
            ["Provider and evidence class", "Conversation title or URL"],
            [
              "Technical capture metadata",
              "Account identity, cookies or unrelated history",
            ],
          ],
        },
      },
      {
        id: "workflow",
        heading: "How to use the trace responsibly",
        paragraphs: [
          "A local trace is useful when the goal is to compare retrieval language across supported searches without turning the browser into a surveillance tool.",
        ],
        steps: [
          {
            title: "Review privacy",
            text: "Accept the explicit privacy boundary before query views and estimates unlock.",
          },
          {
            title: "Inspect locally",
            text: "Use Current and History views to compare eligible surfaced searches.",
          },
          {
            title: "Export the insight, not the chat",
            text: "Carry concepts and qualifiers into an editorial brief without copying conversations.",
          },
          {
            title: "Clear when needed",
            text: "Delete the local trace or rotate the anonymous server identifier from Settings.",
          },
        ],
        example: {
          title: "Example history entry",
          input:
            "A supported ChatGPT search surfaces: best payroll software Germany 2026",
          output:
            "The local trace stores that query with provider, evidence class and capture time.",
          note: "It does not store the prompt that led to the search or any surrounding response text.",
        },
      },
      {
        id: "limitations",
        heading: "Limits and terminology guardrails",
        paragraphs: [
          "A missing query does not prove that ChatGPT did not search; the interface may not expose every action, and an adapter may fail closed after a provider change. A retained query also does not identify a person or reveal the surrounding conversation.",
        ],
        callout:
          "Open Queries uses “ChatGPT search history” only for the local web-search trace. It never uses the phrase to imply access to chat history.",
      },
    ],
    sources: [PRIMARY_SOURCES.openAiChatGptSearch],
    related: [
      {
        href: "/learn/observed-vs-estimated-ai-queries",
        label: "Observed vs. estimated queries",
      },
      {
        href: "/learn/aeo-geo-query-data",
        label: "Why query provenance matters",
      },
      { href: "/chatgpt-search-queries", label: "ChatGPT search queries" },
      { href: "/ai-search-visibility", label: "AI search visibility" },
      { href: "/privacy", label: "Privacy contract" },
      { href: "/install", label: "Install Open Queries" },
    ],
  },
  {
    slug: "claude-web-search",
    title: "Claude web search queries",
    description:
      "Inspect web-search queries surfaced by Claude, understand provider-native estimates and apply the evidence without collecting conversations.",
    eyebrow: "Supported surface · Claude web search",
    directAnswer:
      "Claude web search queries are search strings issued when Claude uses its web-search capability. Open Queries records only explicit search-scoped tool metadata exposed by the supported interface and keeps model-generated fan-out candidates in a separate estimated evidence class.",
    publishedAt: CONTENT_PUBLISHED_AT,
    updatedAt: CONTENT_UPDATED_AT,
    schemaType: "TechArticle",
    about: ["Claude web search", "AI search queries", "query evidence"],
    provider: "claude",
    providerLabel: "Claude",
    sections: [
      {
        id: "claude-web-search",
        heading: "How Claude web search fits the retrieval layer",
        paragraphs: [
          "Anthropic documents web search as a tool that gives Claude access to current web content and returns citations from the retrieved sources. A search-tool action is therefore distinct from ordinary generated conversation text.",
          "Open Queries focuses on that narrow boundary: explicit search-scoped fields are eligible; generic messages are not.",
        ],
      },
      {
        id: "fail-closed-adapter",
        heading: "A fail-closed Claude adapter",
        paragraphs: [
          "The adapter inspects cloned provider transport responses and accepts only recognized search-tool structures. It does not click disclosure controls, scrape rendered messages or widen collection when a field is ambiguous.",
        ],
        bullets: [
          "Recognized search query: eligible observation.",
          "Generic query-like field: ignored.",
          "Changed or unknown protocol: capture stops until the adapter is updated.",
        ],
      },
      {
        id: "provider-native-estimates",
        heading: "Provider-native fan-out estimates",
        paragraphs: [
          "The configured Anthropic endpoint does not expose usable output-token log probabilities. Open Queries therefore runs repeated structured samples with the named Claude model and reports candidate inclusion frequency with a Wilson 95% interval.",
          "Claude candidates are never transferred to another model for ranking. The provider, model, sample count and estimator remain attached to the result.",
        ],
      },
      {
        id: "workflow",
        heading: "From a Claude query to a content decision",
        paragraphs: [
          "The useful unit is not a single keyword to repeat; it is the evidence need expressed by the query and its qualifiers.",
        ],
        steps: [
          {
            title: "Observe",
            text: "Capture the explicit Claude web-search query and its timestamp.",
          },
          {
            title: "Explore",
            text: "Generate provider-native adjacent queries only when broader coverage is useful.",
          },
          {
            title: "Map",
            text: "Assign the intent to one existing canonical or document a truly distinct gap.",
          },
          {
            title: "Verify",
            text: "Measure independent demand, citations, referrals and search exposure separately.",
          },
        ],
        example: {
          title: "Evidence example",
          input: "Observed: open source AI search visibility tools",
          output:
            "Estimated candidate: inspect queries used by AI answer engines",
          note: "The first string is interface evidence; the second is a controlled Claude reconstruction.",
        },
      },
      {
        id: "limitations",
        heading: "What the trace cannot establish",
        paragraphs: [
          "A surfaced query does not expose Claude's full retrieval process, guarantee that every search action is visible or prove why a source was cited. Inclusion frequency estimates behavior inside one bounded experiment, not market demand.",
        ],
        callout:
          "Keep Claude observations, Claude estimates, Google search demand and downstream traffic as separate evidence families.",
      },
    ],
    sources: [PRIMARY_SOURCES.anthropicWebSearch],
    related: [
      {
        href: "/learn/observed-vs-estimated-ai-queries",
        label: "Observed vs. estimated queries",
      },
      {
        href: "/learn/estimating-fan-out-queries-with-log-probabilities",
        label: "Provider-native estimation",
      },
      { href: "/fan-out-queries", label: "Fan-out queries" },
      { href: "/ai-search-visibility", label: "AI search visibility" },
      { href: "/methodology", label: "Provider-native methodology" },
      { href: "/install", label: "Install Open Queries" },
    ],
  },
  {
    slug: "google-ai-overviews",
    title: "Google AI Overviews: queries, fan-out and evidence",
    description:
      "Understand Google AI Overviews, the search seed and expanded queries exposed around them, and how to use that evidence for SEO and GEO.",
    eyebrow: "Supported surface · Google AI Overviews",
    directAnswer:
      "Google AI Overviews are AI-generated summaries in Google Search that include supporting web links when Google determines the feature adds value. Google says AI Overviews and AI Mode may use query fan-out—multiple related searches across subtopics and sources—to develop a response.",
    publishedAt: CONTENT_PUBLISHED_AT,
    updatedAt: CONTENT_UPDATED_AT,
    schemaType: "TechArticle",
    about: ["Google AI Overviews", "Google AI search", "query fan-out"],
    provider: "google",
    providerLabel: "Google",
    sections: [
      {
        id: "how-ai-overviews-work",
        heading: "How AI Overviews use the web",
        paragraphs: [
          "Google describes AI Overviews as a way to get the gist of complex questions and explore supporting links. They do not appear for every query, and meeting technical requirements does not guarantee inclusion.",
          "For site owners, the important practical point is that the normal search foundation still applies: indexable pages, crawlable internal links, useful textual content and structured data that matches what readers can see.",
        ],
      },
      {
        id: "two-evidence-classes",
        heading: "The seed query and expanded queries are different",
        paragraphs: [
          "Google Search is the disclosed seed exception in Open Queries. The typed search string is labeled as a user search, while recognized query expansions exposed inside an AI Overview receive a separate observed-expanded-query label.",
        ],
        table: {
          headers: ["Evidence", "Meaning", "Boundary"],
          rows: [
            [
              "Google search seed",
              "The query typed into Google Search",
              "Not an AI-generated fan-out",
            ],
            [
              "Observed expanded query",
              "A query exposed inside a recognized AI Overview surface",
              "Only when the UI boundary is explicit",
            ],
            [
              "Estimated fan-out",
              "A provider-native reconstruction requested by the user",
              "Never counted as observed",
            ],
          ],
        },
      },
      {
        id: "query-fan-out",
        heading: "Why query fan-out changes the content brief",
        paragraphs: [
          "One broad question may require definitions, comparisons, constraints, dates and primary-source checks. Query fan-out exposes those subproblems more clearly than repeating the original keyword across a page.",
          "The editorial response is a complete evidence package: direct answer, named entities, current facts, comparison criteria, source links and explicit limitations.",
        ],
        example: {
          title: "From seed to evidence map",
          input: "Seed: best AI search tools for SEO teams",
          output:
            "Subtopics: query inspection, citation monitoring, provider coverage, data provenance, privacy and pricing",
          note: "These subtopics are an editorial coverage map. They are not guaranteed Google fan-out queries unless the interface exposes them.",
        },
      },
      {
        id: "workflow",
        heading: "A workflow for Google AI search optimization",
        paragraphs: [
          "Google explicitly says there are no special technical requirements for AI Overviews beyond being eligible for normal Search. Build on that foundation rather than inventing AI-only markup.",
        ],
        steps: [
          {
            title: "Make the page eligible",
            text: "Confirm indexing, snippet eligibility, canonical correctness and crawlable links.",
          },
          {
            title: "Answer the complete task",
            text: "Cover the main question and the evidence-bearing subquestions readers need.",
          },
          {
            title: "Keep claims auditable",
            text: "Use primary sources, dates, authorship, methodology and visible limitations.",
          },
          {
            title: "Measure in context",
            text: "Use Search Console Web data, referrals and conversions without claiming AI Overview attribution that the data does not expose.",
          },
        ],
      },
      {
        id: "limitations",
        heading: "Limits, measurement and reporting",
        paragraphs: [
          "Google states that AI-feature traffic is included in Search Console's Web search reporting. That means a normal Web impression or click is not automatically proof that an AI Overview displayed the page.",
          "Open Queries can expose supported query evidence, but it cannot guarantee an AI Overview, a citation or a stable position. Use the evidence to improve the page, then let independent performance decide whether the intervention worked.",
        ],
        callout:
          "There is no special GEO schema that guarantees Google AI visibility. Crawlability, indexability, helpful content and truthful structured data remain the foundation.",
      },
    ],
    sources: [
      PRIMARY_SOURCES.googleAiFeatures,
      PRIMARY_SOURCES.googleHelpfulContent,
    ],
    related: [
      {
        href: "/learn/what-are-fan-out-queries",
        label: "What are fan-out queries?",
      },
      {
        href: "/learn/aeo-geo-query-data",
        label: "Why AEO and GEO need query data",
      },
      { href: "/fan-out-queries", label: "Fan-out query pillar" },
      { href: "/generative-engine-optimization", label: "GEO guide" },
      { href: "/methodology", label: "Mathematical methodology" },
      { href: "/install", label: "Install Open Queries" },
    ],
  },
  {
    slug: "fan-out-queries",
    title: "What are fan-out queries in AI search?",
    description:
      "A rigorous guide to query fan-out, the difference between observed and estimated searches, and how teams can turn retrieval paths into better content.",
    eyebrow: "AI retrieval vocabulary",
    directAnswer:
      "Fan-out queries are narrower searches created from one broader information need. An AI search system can issue multiple related queries across subtopics and sources, then use the retrieved evidence to assemble an answer. Google publicly describes query fan-out for AI Overviews and AI Mode.",
    publishedAt: CONTENT_PUBLISHED_AT,
    updatedAt: CONTENT_UPDATED_AT,
    schemaType: "TechArticle",
    about: ["query fan-out", "fan-out queries", "AI retrieval"],
    sections: [
      {
        id: "why-fan-out-exists",
        heading: "Why one question becomes several searches",
        paragraphs: [
          "Broad questions often contain several evidence needs. A useful answer may require a definition, a current fact, a comparison, a constraint and a primary source. One literal search is not always enough to retrieve that full evidence set.",
          "Fan-out is therefore best understood as task decomposition for retrieval, not as a list of keyword variants to paste into a page.",
        ],
      },
      {
        id: "observed-and-estimated",
        heading: "Observed and estimated fan-outs",
        paragraphs: [
          "Some interfaces expose search actions or expanded queries. Those strings can be labeled as observations. When the production interface is silent, a controlled provider-native experiment can generate plausible adjacent searches, but the output remains estimated.",
        ],
        table: {
          headers: ["Class", "Origin", "Safe claim"],
          rows: [
            [
              "Observed query",
              "Recognized provider search surface",
              "This string was visibly surfaced",
            ],
            [
              "Observed expanded query",
              "Recognized Google AI Overview expansion",
              "This expansion was visibly exposed",
            ],
            [
              "Estimated fan-out",
              "Named provider model and documented method",
              "This is a plausible candidate under the experiment",
            ],
          ],
        },
      },
      {
        id: "example",
        heading: "A concrete fan-out example",
        paragraphs: [
          "A team researching an AI search extension might need to understand supported providers, privacy, observed-query capture, fan-out methodology and installation. Those are distinct evidence-bearing subtopics inside one commercial task.",
        ],
        example: {
          title: "Broad need and narrower paths",
          input: "Broad need: choose an AI search extension for an SEO team",
          output:
            "Paths: supported AI surfaces; observed vs estimated queries; local retention; install method; evidence export",
          note: "A real provider may formulate different searches. The example demonstrates decomposition, not hidden telemetry.",
        },
      },
      {
        id: "workflow",
        heading: "How to use fan-out evidence",
        paragraphs: [
          "The goal is to identify missing evidence and improve one correct canonical, not create a separate page for every wording variation.",
        ],
        steps: [
          {
            title: "Collect",
            text: "Keep observed provider queries separate from estimated candidates.",
          },
          {
            title: "Group",
            text: "Map queries to definitions, comparisons, constraints, freshness and source needs.",
          },
          {
            title: "Assign",
            text: "Choose one canonical for each distinct intent and merge near-duplicates.",
          },
          {
            title: "Test",
            text: "Measure Google exposure, citations, referrals and task completion after the change.",
          },
        ],
      },
      {
        id: "limitations",
        heading: "What fan-out scores do not mean",
        paragraphs: [
          "A model score ranks evidence within one provider experiment. It is not traditional search volume, a universal relevance score or proof that a production assistant issued the query.",
          "Open Queries publishes the provider, method and uncertainty so teams can use estimates for exploration without turning them into false observations.",
        ],
        callout:
          "Never add estimated fan-outs to an observed-query count. Exploration and measurement answer different questions.",
      },
    ],
    sources: [
      PRIMARY_SOURCES.googleAiFeatures,
      PRIMARY_SOURCES.openAiChatGptSearch,
    ],
    related: [
      {
        href: "/learn/what-are-fan-out-queries",
        label: "Fan-out authority article",
      },
      {
        href: "/learn/estimating-fan-out-queries-with-log-probabilities",
        label: "Estimation methodology",
      },
      { href: "/ai-search-optimization", label: "AI search optimization" },
      { href: "/ai-search-visibility", label: "AI search visibility" },
      { href: "/methodology", label: "Read the equations" },
      { href: "/install", label: "Inspect queries in Chrome" },
    ],
  },
  {
    slug: "ai-search-visibility",
    title: "AI search visibility starts with retrieval evidence",
    description:
      "Measure AI and LLM visibility with a defensible evidence stack: observed queries, estimates, citations, referrals and independent search demand.",
    eyebrow: "AI visibility · Measurement",
    directAnswer:
      "AI search visibility is the measurable presence of a source across retrieval, citations, referrals and outcomes in AI-assisted search. Open Queries contributes one narrow layer—query evidence. It is not a complete AI visibility tool, rank tracker or brand-monitoring suite.",
    publishedAt: CONTENT_PUBLISHED_AT,
    updatedAt: CONTENT_UPDATED_AT,
    schemaType: "Article",
    about: [
      "AI search visibility",
      "AI visibility tool",
      "LLM visibility",
      "AI search monitoring",
    ],
    sections: [
      {
        id: "visibility-stack",
        heading: "A defensible AI visibility stack",
        paragraphs: [
          "No single number captures the whole path from an information need to a business outcome. Retrieval queries, final citations, referrals and conversions describe different stages and should remain separate.",
        ],
        table: {
          headers: ["Layer", "Question", "Example evidence"],
          rows: [
            [
              "Retrieval",
              "What did the surface search for?",
              "Observed provider query",
            ],
            [
              "Exploration",
              "What adjacent paths are plausible?",
              "Provider-native fan-out estimate",
            ],
            [
              "Selection",
              "Was the source shown or cited?",
              "Citation or search impression",
            ],
            [
              "Outcome",
              "Did qualified attention arrive?",
              "Referral, task completion or conversion",
            ],
          ],
        },
      },
      {
        id: "tool-boundary",
        heading: "What an AI visibility tool should make explicit",
        paragraphs: [
          "An AI visibility tool is useful only when it names the surfaces, prompts, locations, time window and evidence class behind its result. A score without provenance can hide model drift, sampling choices and missing coverage.",
          "Open Queries does not claim full prompt monitoring, market share or a universal LLM rank. It exposes observed retrieval strings and clearly labeled estimates that can feed a broader visibility workflow.",
        ],
      },
      {
        id: "monitoring-workflow",
        heading: "A practical AI search monitoring workflow",
        paragraphs: [
          "Monitoring should start with a stable set of questions and evidence definitions, then compare like-for-like observations over time.",
        ],
        steps: [
          {
            title: "Define",
            text: "Choose the providers, tasks, markets and evidence classes being monitored.",
          },
          {
            title: "Observe",
            text: "Collect explicit query traces, citations and referrals without merging them.",
          },
          {
            title: "Diagnose",
            text: "Map retrieval gaps to one canonical page and a falsifiable content change.",
          },
          {
            title: "Evaluate",
            text: "Compare GSC, referral and business signals after a defined observation window.",
          },
        ],
      },
      {
        id: "example",
        heading: "From LLM visibility signal to action",
        paragraphs: [
          "Suppose a surfaced query repeatedly asks for privacy-preserving AI search tooling, while the relevant page discusses only query inspection. The missing answer is not another keyword page; it is a clear privacy boundary, data flow and deletion workflow on the existing canonical.",
        ],
        example: {
          title: "Evidence-led intervention",
          input:
            "Observed language: privacy preserving AI search query tracker",
          output:
            "Page change: add explicit inputs, excluded data, retention and deletion steps",
          note: "The query suggests a coverage hypothesis. Only later exposure and qualified attention can validate it.",
        },
      },
      {
        id: "limitations",
        heading: "Limits of AI and LLM visibility measurement",
        paragraphs: [
          "Assistant outputs vary by model, time, user context and available tools. Search Console Web data does not isolate every AI feature, and a citation does not prove a recommendation or conversion.",
          "Keep missing data as unknown rather than zero. Report store installations only from the Store surface, GitHub downloads as downloads and D1 activity as product activity.",
        ],
        callout:
          "Open Queries is an open input into AI visibility work. It does not replace citation monitoring, analytics or business measurement.",
      },
    ],
    sources: [
      PRIMARY_SOURCES.googleAiFeatures,
      PRIMARY_SOURCES.googleHelpfulContent,
    ],
    related: [
      {
        href: "/learn/aeo-geo-query-data",
        label: "Why AEO and GEO need query data",
      },
      {
        href: "/learn/observed-vs-estimated-ai-queries",
        label: "Evidence classes",
      },
      { href: "/ai-search-optimization", label: "AI search optimization" },
      {
        href: "/generative-engine-optimization",
        label: "Generative engine optimization",
      },
      {
        href: "/answer-engine-optimization",
        label: "Answer engine optimization",
      },
      { href: "/install", label: "Inspect queries in Chrome" },
    ],
  },
  {
    slug: "ai-search-optimization",
    title: "AI search optimization: an evidence-led workflow",
    description:
      "A practical AI search optimization workflow for improving retrieval coverage, source clarity and measurable visibility across answer engines.",
    eyebrow: "AI search optimization · Practical guide",
    directAnswer:
      "AI search optimization is the practice of making useful information easy for search and answer systems to retrieve, understand and support with evidence. It combines ordinary technical SEO, answer structure, source quality and measurement; it does not require special AI-only markup or keyword repetition.",
    publishedAt: CONTENT_UPDATED_AT,
    updatedAt: CONTENT_UPDATED_AT,
    schemaType: "Article",
    about: ["AI search optimization", "optimizing for AI search", "AEO", "GEO"],
    sections: [
      {
        id: "foundation",
        heading: "Start with the search foundation",
        paragraphs: [
          "Google says the same foundational SEO practices apply to AI Overviews and AI Mode: pages must be crawlable, indexable, eligible for snippets and easy to discover through internal links. There is no special schema or machine-readable AI file that guarantees inclusion.",
          "AI search optimization begins by fixing discovery and page quality before adding provider-specific experiments.",
        ],
        bullets: [
          "One canonical URL for one distinct intent.",
          "Server-rendered answers and crawlable contextual links.",
          "Accurate metadata and structured data that matches visible content.",
          "Primary sources, dates, authorship and explicit limitations.",
        ],
      },
      {
        id: "retrieval-brief",
        heading: "Turn the information need into a retrieval brief",
        paragraphs: [
          "A useful brief goes beyond the head term. It identifies the decision a reader needs to make, the entities involved, the evidence required and the conditions that change the answer.",
        ],
        table: {
          headers: ["Brief element", "Question to answer"],
          rows: [
            ["Intent", "What task should the reader complete?"],
            [
              "Entities",
              "Which products, providers, standards or markets matter?",
            ],
            [
              "Evidence",
              "Which primary sources or first-party observations support the answer?",
            ],
            ["Constraints", "What is unavailable, variable or not proven?"],
          ],
        },
      },
      {
        id: "workflow",
        heading: "The AI search optimization workflow",
        paragraphs: [
          "The workflow connects demand, retrieval evidence, editorial work and measurement without treating any one source as complete.",
        ],
        steps: [
          {
            title: "Observe demand",
            text: "Use verified Google Ads data and GSC queries as separate evidence of human demand and site exposure.",
          },
          {
            title: "Inspect retrieval",
            text: "Use explicit provider query traces and keep estimated fan-outs clearly labeled.",
          },
          {
            title: "Map canonicals",
            text: "Assign each distinct intent to one page and strengthen that page rather than creating variants.",
          },
          {
            title: "Publish evidence",
            text: "Lead with the answer, show the workflow, cite primary sources and state limitations.",
          },
          {
            title: "Measure and learn",
            text: "Compare indexing, impressions, citations, referrals and outcomes over a defined window.",
          },
        ],
      },
      {
        id: "example",
        heading: "Example: optimizing an AI search extension page",
        paragraphs: [
          "A thin install page that says only “Add to Chrome” does not answer the evaluation task. A complete page should explain supported surfaces, observed data, excluded data, retention, the difference between observed and estimated queries, and the current Store state.",
        ],
        example: {
          title: "Canonical expansion",
          input:
            "Demand: AI search extension; retrieval language: inspect ChatGPT and Claude search queries",
          output:
            "One install canonical with provider coverage, privacy boundary, setup steps and evidence definitions",
          note: "Do not create separate install pages for every provider or close keyword variant.",
        },
      },
      {
        id: "measurement",
        heading: "Measure the whole chain without inventing attribution",
        paragraphs: [
          "Indexing proves eligibility, not ranking. An impression proves exposure, not a click. A citation proves retrieval or selection in one response, not stable recommendation. An extension download is not necessarily an installation.",
          "Keep each stage separate, record evidence freshness and define what result would confirm or falsify the page change.",
        ],
      },
      {
        id: "limitations",
        heading: "What AI search optimization cannot guarantee",
        paragraphs: [
          "No workflow can guarantee crawling, indexing, an AI citation or a fixed rank. Provider behavior changes, and many internal retrieval actions remain unobservable.",
        ],
        callout:
          "The defensible objective is better eligibility, clearer evidence and measurable qualified discovery—not control over a model's answer.",
      },
    ],
    sources: [
      PRIMARY_SOURCES.googleAiFeatures,
      PRIMARY_SOURCES.googleHelpfulContent,
      PRIMARY_SOURCES.geoPaper,
    ],
    related: [
      {
        href: "/learn/aeo-geo-query-data",
        label: "Query data for AEO and GEO",
      },
      { href: "/learn/what-are-fan-out-queries", label: "Fan-out query guide" },
      { href: "/ai-search-visibility", label: "AI search visibility" },
      { href: "/generative-engine-optimization", label: "GEO guide" },
      { href: "/answer-engine-optimization", label: "AEO guide" },
      { href: "/install", label: "Install the AI search extension" },
    ],
  },
  {
    slug: "generative-engine-optimization",
    title: "Generative engine optimization (GEO): a practical guide",
    description:
      "A practical GEO workflow using retrieval queries, primary-source evidence, explicit limitations and measurable visibility outcomes.",
    eyebrow: "Generative engine optimization · GEO",
    directAnswer:
      "Generative engine optimization is the practice of improving how accurately useful information can be retrieved, understood and cited in generative answers. Good GEO combines people-first content, technical search eligibility, source quality and honest measurement rather than relying on keyword repetition or guaranteed-citation claims.",
    publishedAt: CONTENT_PUBLISHED_AT,
    updatedAt: CONTENT_UPDATED_AT,
    schemaType: "Article",
    about: ["generative engine optimization", "GEO", "retrieval optimization"],
    sections: [
      {
        id: "what-geo-optimizes",
        heading: "What GEO actually optimizes",
        paragraphs: [
          "The original GEO research formalized visibility in generative-engine responses as an optimization problem. Production systems and metrics have evolved, so the useful operational target is broader: publish evidence that can be retrieved, attributed and evaluated without misrepresenting what the model did.",
          "For Google AI features, Google says ordinary Search eligibility and helpful content remain the foundation. GEO is therefore an evidence discipline layered on top of SEO, not a replacement for it.",
        ],
      },
      {
        id: "answerable-needs",
        heading: "Start with answerable information needs",
        paragraphs: [
          "Map the definitions, comparisons, constraints, current facts and primary sources required to complete the reader's task. Observed retrieval queries can reveal useful qualifiers; estimated fan-outs can explore adjacent paths; neither removes the need for editorial judgment.",
        ],
        bullets: [
          "State the answer and scope before background detail.",
          "Name entities consistently and explain comparison criteria.",
          "Date claims that can change and link to the primary evidence.",
          "Keep unsupported or unavailable information explicit.",
        ],
      },
      {
        id: "workflow",
        heading: "A repeatable GEO workflow",
        paragraphs: [
          "A useful workflow joins query evidence to one canonical page and defines the observation that should change after publication.",
        ],
        steps: [
          {
            title: "Collect",
            text: "Separate human search demand, observed AI queries and estimated retrieval paths.",
          },
          {
            title: "Model the task",
            text: "List the answer, entities, claims, sources, constraints and freshness requirements.",
          },
          {
            title: "Build the evidence page",
            text: "Use direct answers, structured sections, primary citations and visible limitations.",
          },
          {
            title: "Connect authority",
            text: "Link relevant articles and adjacent capabilities to the canonical.",
          },
          {
            title: "Evaluate",
            text: "Track indexing, query exposure, citations, referrals and outcomes as separate stages.",
          },
        ],
      },
      {
        id: "example",
        heading: "Example: from retrieval query to GEO brief",
        paragraphs: [
          "A surfaced query for “how to monitor AI search visibility without tracking prompts” contains a use case, a privacy constraint and a measurement requirement. The correct response is a page that explains the evidence stack and data boundary, not a paragraph repeating “AI visibility.”",
        ],
        example: {
          title: "GEO brief",
          input: "Query: monitor AI search visibility without tracking prompts",
          output:
            "Sections: observable queries; excluded data; citations and referrals; measurement limits; deletion workflow",
          note: "The page should remain useful even if it receives no search traffic.",
        },
      },
      {
        id: "source-quality",
        heading: "Build source quality, not keyword density",
        paragraphs: [
          "Retrieval systems need claims they can connect to evidence. Clear authorship, first-party observations, primary-source links, dates and methodology make a page easier to audit than generic summaries assembled around a phrase.",
          "Structured data should match visible content. It can describe the article and breadcrumbs, but it cannot manufacture authority or guarantee inclusion.",
        ],
      },
      {
        id: "limitations",
        heading: "Limits and measurement",
        paragraphs: [
          "A generated answer is a sample, not a durable rank. Citation presence can vary by model, prompt, location and time. Search Console reports Google AI-feature traffic inside Web data rather than proving a specific feature for every row.",
        ],
        callout:
          "GEO can improve evidence quality and retrieval eligibility. It cannot guarantee a citation, recommendation or conversion.",
      },
    ],
    sources: [
      PRIMARY_SOURCES.geoPaper,
      PRIMARY_SOURCES.googleAiFeatures,
      PRIMARY_SOURCES.googleHelpfulContent,
    ],
    related: [
      { href: "/learn/aeo-geo-query-data", label: "Why GEO needs query data" },
      { href: "/learn/what-are-fan-out-queries", label: "Fan-out query guide" },
      { href: "/ai-search-optimization", label: "AI search optimization" },
      { href: "/ai-search-visibility", label: "AI search visibility" },
      { href: "/google-ai-overviews", label: "Google AI Overviews" },
      { href: "/install", label: "Inspect retrieval queries" },
    ],
  },
  {
    slug: "answer-engine-optimization",
    title: "Answer engine optimization (AEO): a practical guide",
    description:
      "A practical AEO workflow for turning questions, retrieval evidence, source quality and visible limitations into useful answers.",
    eyebrow: "Answer engine optimization · AEO",
    directAnswer:
      "Answer engine optimization is the practice of structuring accurate, well-sourced information so people and answer systems can identify the answer, its scope and its evidence quickly. AEO improves answer clarity and retrievability; it does not guarantee a featured result or assistant citation.",
    publishedAt: CONTENT_PUBLISHED_AT,
    updatedAt: CONTENT_UPDATED_AT,
    schemaType: "Article",
    about: ["answer engine optimization", "AEO", "answer structure"],
    sections: [
      {
        id: "question-behind-query",
        heading: "Design for the question behind the query",
        paragraphs: [
          "The same wording can hide different tasks: learn a definition, compare options, diagnose a problem or complete a setup. A good AEO brief identifies the task and the evidence needed to finish it.",
          "Retrieval queries can reveal qualifiers and subquestions, but the page should answer the information need rather than mechanically reproduce query strings.",
        ],
      },
      {
        id: "answer-anatomy",
        heading: "The anatomy of a useful answer",
        paragraphs: [
          "Lead with a concise answer, then provide the context required to trust and apply it.",
        ],
        table: {
          headers: ["Element", "Purpose"],
          rows: [
            [
              "Direct answer",
              "Resolve the primary question without a long preamble",
            ],
            ["Scope and assumptions", "Show when the answer applies"],
            ["Evidence", "Connect claims to primary or first-party sources"],
            ["Workflow or example", "Help the reader complete the task"],
            [
              "Limitations",
              "Prevent a qualified answer from becoming an absolute claim",
            ],
          ],
        },
      },
      {
        id: "workflow",
        heading: "An AEO workflow for content teams",
        paragraphs: [
          "Treat each intervention as a testable improvement to one canonical page.",
        ],
        steps: [
          {
            title: "Select the question",
            text: "Use demand and retrieval evidence to choose one concrete user task.",
          },
          {
            title: "Write the direct answer",
            text: "State the answer, scope and key constraint in plain language.",
          },
          {
            title: "Build support",
            text: "Add definitions, steps, tables, examples and primary sources in a logical order.",
          },
          {
            title: "Connect the graph",
            text: "Link authority articles, adjacent intents and the relevant product workflow.",
          },
          {
            title: "Validate",
            text: "Check indexing, impressions, citations, referrals and task completion separately.",
          },
        ],
      },
      {
        id: "example",
        heading: "Example: answer-first content without overclaiming",
        paragraphs: [
          "For “what are fan-out queries,” the direct answer should define the term. The next sections should explain why multiple searches exist, distinguish observed from estimated queries, show an example and state that estimates are not search volume.",
        ],
        example: {
          title: "AEO content brief",
          input: "Question: What are fan-out queries in AI search?",
          output:
            "Definition → retrieval rationale → evidence classes → example → workflow → limits",
          note: "The structure serves the reader and gives retrieval systems a clear evidence hierarchy.",
        },
      },
      {
        id: "provenance",
        heading: "Keep provenance visible",
        paragraphs: [
          "Observed provider queries, model-generated candidates, Google search volume and site performance answer different questions. Combining them into one unlabeled score creates false certainty.",
          "Visible source links, dates and methodology make it possible for readers and systems to check the answer rather than trust a marketing claim.",
        ],
      },
      {
        id: "limitations",
        heading: "What AEO cannot guarantee",
        paragraphs: [
          "Answer systems choose sources through processes that are only partly observable and change over time. A well-structured page can improve clarity and eligibility without controlling selection.",
        ],
        callout:
          "AEO is successful when the page becomes more complete, usable and measurable—not when it merely contains more question-shaped headings.",
      },
    ],
    sources: [
      PRIMARY_SOURCES.googleHelpfulContent,
      PRIMARY_SOURCES.googleAiFeatures,
    ],
    related: [
      { href: "/learn/aeo-geo-query-data", label: "Why AEO needs query data" },
      {
        href: "/learn/observed-vs-estimated-ai-queries",
        label: "Evidence provenance",
      },
      { href: "/ai-search-optimization", label: "AI search optimization" },
      { href: "/ai-search-visibility", label: "AI search visibility" },
      { href: "/fan-out-queries", label: "Fan-out queries" },
      { href: "/install", label: "Inspect queries in Chrome" },
    ],
  },
];

export const topicPageBySlug = new Map(
  topicPages.map((topic) => [topic.slug, topic]),
);
