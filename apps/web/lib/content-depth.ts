import type { ContentSection } from "./content";

export type ContentDepth = {
  keyTakeaways: string[];
  readMinutes: number;
  paragraphAdditions: Record<string, string[]>;
  extraSections: ContentSection[];
};

export function deepenSections(
  sections: ContentSection[],
  depth: ContentDepth,
): ContentSection[] {
  return [
    ...sections.map((section) => ({
      ...section,
      paragraphs: [
        ...section.paragraphs,
        ...(depth.paragraphAdditions[section.id] ?? []),
      ],
    })),
    ...depth.extraSections,
  ];
}

export const topicDepthBySlug: Record<string, ContentDepth> = {
  "ai-search-optimization": {
    readMinutes: 13,
    keyTakeaways: [
      "A six-layer operating model that separates discovery, retrieval coverage, evidence, answer design, distribution and measurement.",
      "A retrieval brief template that turns one information need into entities, constraints, evidence tasks and claim boundaries.",
      "A worked extension-page example with a before/after content specification rather than generic optimization advice.",
      "A measurement plan that keeps Google demand, provider-query evidence, citations, referrals and conversions separate.",
    ],
    paragraphAdditions: {
      foundation: [
        "Treat technical eligibility as a gate, not as the strategy. A page that cannot be crawled, rendered, canonicalized and discovered through ordinary links has no reliable path into search systems. Once that gate is open, however, another sitemap submission or schema property will not repair an answer that lacks scope, evidence or decision value.",
        "The practical foundation is a one-intent, one-canonical model. The canonical should own a stable job—not every wording variation around it—and should give both a reader and a retrieval system enough context to recognize the job. Supporting articles can explore narrower mechanisms, examples or research questions, but they should route authority back to the durable guide instead of competing with it.",
        "This is also where most AI-search programs go wrong: they start with imagined model preferences while crawl paths, page purpose and source quality remain unresolved. Google explicitly says its existing Search requirements and helpful-content guidance still apply to AI features. That makes ordinary SEO the first layer of AI search optimization, not a separate legacy workstream.",
      ],
      "retrieval-brief": [
        "A useful retrieval brief is more specific than a keyword list and less prescriptive than an article outline. It records what a good answer must establish, which claims require current evidence, what could be answered from stable knowledge and which ambiguities should be resolved before drafting.",
        "Start with the decision the reader is trying to make. Then enumerate the entities, comparisons, constraints, time horizon and jurisdiction that can change the answer. A query such as “best expense platform” is not yet a usable brief; “compare expense platforms for a 300-person, multi-entity European company that needs local VAT controls” contains an audience, task, scale, geography and operational constraint.",
        "Provider-query traces can sharpen this brief by exposing retrieval language that was actually surfaced. They should not dictate the page or be repeated verbatim. Their value is diagnostic: they reveal missing qualifiers, source types or subquestions that the canonical may need to answer naturally.",
      ],
      workflow: [
        "Each step must produce an inspectable artifact. The output of demand review is a canonical decision; the output of query analysis is an evidence map; the output of drafting is a claim ledger; and the output of measurement is a dated decision to hold, improve or reject the intervention. If a step ends only with “add more content,” it is not operational enough.",
        "Run the workflow on one canonical at a time. Site-wide AI rewrites make causality impossible to interpret and encourage repeated boilerplate. A narrow release lets the team compare the page before and after, verify that it remained technically eligible and wait for the appropriate crawl, impression, citation or referral signal.",
      ],
      example: [
        "The weak version of an extension page lists features and repeats “AI search extension.” The useful version first explains the user job: inspect search-tool queries without collecting conversation text. It then shows supported providers, the exact observation boundary, a screenshot or trace, the distinction between observed and estimated queries, setup steps, compatibility limits and a link to the public methodology.",
        "The improvement is not semantic decoration. It changes the evidence available to a person comparing tools and to a system retrieving a passage about privacy, provider support or query provenance. The page can now satisfy several concrete subquestions while remaining one coherent install canonical.",
      ],
      measurement: [
        "Use a measurement chain rather than one invented visibility score. Search Console reports Google Web impressions, clicks, CTR and position, including traffic from Google's AI features inside the Web search type. Referral analytics can show visits from assistants when a referrer is available. Citation checks can record whether a named page appeared in a bounded test. Product analytics can measure activation only when the event is actually available.",
        "None of those measures is interchangeable. A crawler request proves discovery activity, not a recommendation. A citation observation proves appearance in one answer, not stable ranking. A Google Ads volume estimate describes human Google demand, not how often a provider generated a retrieval query. Keep the rows separate until a human decision explains how they jointly support—or fail to support—the hypothesis.",
        "Define the falsification condition before publication. For a new high-demand canonical, one reasonable early test is discovery and crawling within 10–14 days; for an indexed page, the next test is relevant query exposure rather than raw traffic. A page that remains undiscovered needs a technical and link diagnosis. A discovered page with irrelevant impressions needs a scope diagnosis. A relevant page with impressions but no selection needs a title, answer or trust diagnosis.",
      ],
      limitations: [
        "No team can guarantee inclusion in an AI answer, a citation or a fixed position because the systems, models, prompts, sources and interfaces change. Optimization can improve eligibility, clarity and evidence coverage; it cannot turn an opaque selection process into a deterministic rank tracker.",
        "Avoid claims that depend on invisible internals. Describe query fan-out when a provider documents it, label a query observed only when the interface exposes it and label reconstructed candidates as estimates. This conservative vocabulary is not a marketing handicap—it is what makes the resulting analysis reusable and credible.",
      ],
    },
    extraSections: [
      {
        id: "six-layer-model",
        heading: "Use a six-layer AI search optimization model",
        paragraphs: [
          "A complete program has six layers. They are ordered because a failure near the top invalidates conclusions drawn further down. Teams can use the model as a pre-publication review and as a diagnostic when a page does not earn discovery or selection.",
        ],
        table: {
          headers: ["Layer", "Question", "Required output"],
          rows: [
            [
              "1. Eligibility",
              "Can systems fetch, render and index the canonical?",
              "200 response, indexable canonical, SSR text, ordinary links",
            ],
            [
              "2. Intent",
              "Does one page clearly own the reader's stable job?",
              "Canonical decision and explicit non-goals",
            ],
            [
              "3. Retrieval coverage",
              "Does the page answer the likely subquestions and qualifiers?",
              "Entity, constraint and evidence map",
            ],
            [
              "4. Evidence",
              "Can important claims be checked against appropriate sources?",
              "Dated claim ledger with source and limitation",
            ],
            [
              "5. Answer design",
              "Can a person extract the definition, decision and next action quickly?",
              "Direct answer, comparison, example and workflow",
            ],
            [
              "6. Measurement",
              "Which observable signal would confirm the intervention?",
              "Baseline, metric, date and falsification condition",
            ],
          ],
        },
        callout:
          "Do not compensate for a failed eligibility or intent layer by publishing more adjacent pages. Fix the earliest broken layer first.",
      },
      {
        id: "operating-cadence",
        heading: "Run the work as an evidence loop, not a publishing calendar",
        paragraphs: [
          "A sensible cadence separates routine health checks from editorial decisions. Daily checks can catch broken routes, lost canonicals, sitemap errors and install-funnel failures. Weekly review can interpret new query evidence and improve an existing canonical. New URLs and major rewrites need a slower review because they change the information architecture and create cannibalization risk.",
          "The team should leave every review with one of four decisions: hold, improve, consolidate or create. “Publish something” is not a valid default. A no-change decision is useful when the evidence is fresh, the page is technically sound and the next signal has not had time to arrive.",
        ],
        steps: [
          {
            title: "Daily",
            text: "Check availability, canonical output, sitemap state, crawl errors, contextual links and the install path.",
          },
          {
            title: "Weekly",
            text: "Review new query/page pairs, provider-query observations, citations and referrals against the existing canonical map.",
          },
          {
            title: "After material releases",
            text: "Record the exact change, baseline, expected signal and the first date on which evaluation is meaningful.",
          },
          {
            title: "After 10–14 days",
            text: "Diagnose pages that are indexed without relevant exposure or still undiscovered; do not rewrite them blindly.",
          },
        ],
      },
    ],
  },
  "generative-engine-optimization": {
    readMinutes: 12,
    keyTakeaways: [
      "A precise distinction between GEO as a research field, a production workflow and a marketing label.",
      "A source-to-claim method for building passages that can be retrieved, checked and cited without keyword stuffing.",
      "A GEO brief and QA checklist that teams can apply to an existing canonical before creating more pages.",
      "A measurement framework that avoids treating one generated answer as a stable visibility score.",
    ],
    paragraphAdditions: {
      "what-geo-optimizes": [
        "The original GEO paper treated visibility inside generated responses as an optimization problem and tested content interventions in a benchmark. That work is useful because it made the object of study explicit. It is not a universal production recipe: the authors also found that effects varied by domain, and today's answer systems, retrieval stacks and reporting surfaces differ from the benchmark environment.",
        "For a working team, GEO should therefore mean improving the quality and retrievability of evidence while measuring observable outcomes conservatively. The unit of work is not “the model” in the abstract. It is a canonical page, a defined information need, a set of checkable claims and a date-bounded observation across search, citations, referrals and business outcomes.",
        "This definition keeps GEO connected to editorial quality. A page should become more useful even if no generative engine ever cites it. If the only value of a change is a supposed model preference—extra repetition, decorative schema or unsupported “AI-friendly” phrasing—the change has failed the people-first test before measurement begins.",
      ],
      "answerable-needs": [
        "An answerable need contains a question, context and decision boundary. “GEO tools” is a query string; “how should an enterprise SEO team audit source coverage for AI answers without buying a rank tracker?” is an information need. The second formulation identifies the audience, task, constraint and expected output.",
        "Translate the need into a coverage map: definitions that must be stable, current facts that require dates, comparisons that require common criteria, recommendations that require conditions and limitations that prevent overgeneralization. This map is more durable than an outline produced from competing headings because it starts with what must be proven.",
        "Observed and adjacent queries can reveal vocabulary, but they remain evidence inputs. Editorial judgment decides which subquestions belong on the canonical and which would distract from it. The goal is complete intent coverage, not maximum lexical coverage.",
      ],
      workflow: [
        "The workflow should produce a claim ledger before prose. For every material claim, record the exact statement, source class, publication or access date, owner, limitation and whether the page quotes, paraphrases or infers. Claims without an adequate source can be removed, narrowed or explicitly labeled as the publisher's method.",
        "Then design the answer in layers: a direct answer for orientation, an explanation of the mechanism, a worked example, a repeatable workflow, evidence that can be checked and limits that tell the reader when not to apply the guidance. This structure serves skimming readers without reducing the article to fragments.",
      ],
      example: [
        "Suppose a finance team asks whether an expense platform supports multi-entity VAT workflows in Europe. A shallow page repeats the feature name. A GEO-ready evidence page defines the supported entities, lists applicable jurisdictions, shows the configuration path, dates the product behavior, links the official documentation and states which edge cases require manual handling.",
        "A retrieval query such as “multi entity expense management VAT Europe” can expose the missing qualifiers. The editorial intervention is to add verified coverage for those qualifiers—not to insert the query repeatedly. The measurement hypothesis is that the canonical will earn more relevant discovery or citation opportunities for that job while continuing to convert qualified readers.",
      ],
      "source-quality": [
        "Match source strength to claim risk. Product behavior should point to current product documentation or reproducible interface evidence. Legal or regulatory claims should use the responsible authority. A market statistic should identify the original dataset and methodology. A definition may cite the originating paper while explaining how the current article operationalizes it.",
        "Secondary sources remain useful for context, dissent and examples, but they should not silently support claims they did not establish. When sources disagree, preserve the disagreement or narrow the claim. A page becomes more trustworthy when it exposes uncertainty instead of smoothing every source into one confident paragraph.",
        "Dates matter because retrieval systems can combine passages from different periods. Put the relevant date near changing claims, not only in a footer. Update the claim when the source changes and keep the article-level modified date accurate.",
      ],
      limitations: [
        "A citation is not a durable ranking. Generated answers vary by prompt, location, model, product mode, available sources and time. Repeating a test can be useful for diagnosis, but it cannot establish a population probability unless the sampling design and uncertainty are explicit.",
        "GEO also cannot rescue a weak offer. If a page accurately explains that a product lacks the capability a reader needs, optimization should not disguise the gap. Preserve the market signal, route the reader honestly and use it as product input rather than manufacturing a claim.",
      ],
    },
    extraSections: [
      {
        id: "citation-ready-passage",
        heading: "Build citation-ready passages from claim units",
        paragraphs: [
          "A citation-ready passage is not a paragraph written for robots. It is a compact unit in which the subject, claim, scope, evidence and date can be understood without relying on a vague antecedent several screens earlier. The surrounding article still supplies nuance and narrative; the passage supplies a clean evidence boundary.",
        ],
        table: {
          headers: ["Component", "Weak version", "Useful version"],
          rows: [
            [
              "Subject",
              "It supports this",
              "Open Queries supports explicit search-tool query capture on ChatGPT, Claude and Google AI Overviews",
            ],
            [
              "Scope",
              "Works for AI search",
              "The claim applies to the supported Chrome interfaces and adapter versions named on the page",
            ],
            [
              "Evidence",
              "According to experts",
              "The public adapter contract and provider documentation establish the observation boundary",
            ],
            ["Date", "Currently", "As verified on 10 August 2026"],
            [
              "Limit",
              "Results may vary",
              "The interface may not expose every provider search, so a missing query is not evidence that no search occurred",
            ],
          ],
        },
      },
      {
        id: "geo-quality-gate",
        heading: "Use this GEO quality gate before publication",
        paragraphs: [
          "The gate is intentionally stricter than “contains sources.” It asks whether the page gives a reader a defensible answer and whether a third party can reproduce the reasoning from the visible evidence.",
        ],
        bullets: [
          "The direct answer names the subject, action and scope without promotional filler.",
          "Every changing factual claim has an appropriate source and visible date.",
          "The page contains at least one worked example with realistic inputs and outputs.",
          "The workflow ends in an artifact a team can inspect, not a vague instruction to optimize more.",
          "Observed provider evidence and model-generated estimates are labeled separately.",
          "Limitations explain missing coverage, uncertainty and the conditions under which the advice fails.",
          "Contextual links connect the canonical to deeper mechanisms and the product only where the product genuinely helps.",
          "The page would still be worth publishing if generative-answer traffic never arrived.",
        ],
      },
    ],
  },
  "answer-engine-optimization": {
    readMinutes: 11,
    keyTakeaways: [
      "AEO is an answer-design discipline built on eligibility, evidence and clear question scope—not a collection of FAQ headings.",
      "A reusable answer-unit anatomy for definitions, comparisons, procedures and recommendations.",
      "A brief template that connects the user question to evidence, exceptions and a measurable next action.",
      "Guardrails for schema, featured answers and generative citations without promises of selection.",
    ],
    paragraphAdditions: {
      "question-behind-query": [
        "Queries are compressed. They often omit the audience, decision, timeframe and constraints that determine a useful answer. “AEO strategy” might mean a definition for a beginner, a content program for an enterprise team or a way to measure answer-engine referrals. A first-grade article identifies the dominant job and makes its boundaries visible instead of trying to satisfy every interpretation with generic copy.",
        "Write the question in full before writing the answer. Add the conditions that could change it, the evidence needed to resolve those conditions and the action a reader should be able to take afterward. This creates an editorial contract: material that does not help fulfill that contract should be removed or moved to a supporting article.",
        "The same discipline prevents cannibalization. One canonical can own the stable “answer engine optimization” job, while a narrower article explains query provenance or fan-out estimation. The article links back to the pillar; it does not compete by restating the same definition with a different title.",
      ],
      "answer-anatomy": [
        "The direct answer should be short because it orients the reader, not because the article is short. It states the conclusion and scope, then the body earns that conclusion through mechanism, evidence, example, workflow and limits. Treating the direct answer as the entire page produces exactly the kind of thin, instantly forgettable result AEO is supposed to prevent.",
        "Different questions require different answer shapes. Definitions need boundaries and contrasts. Procedures need prerequisites, ordered steps and failure handling. Comparisons need common criteria and explicit trade-offs. Recommendations need a named audience, conditions and reasons. A single templated block cannot serve all four.",
      ],
      workflow: [
        "During drafting, test each section against a real reader action. Can the reader identify the correct evidence? Choose between options? Run the process? Diagnose a failure? If a section only repeats the topic at a higher level of abstraction, it does not earn its place.",
        "After drafting, run passage-level QA. Pronouns should have clear antecedents; tables should use comparable rows; dates should sit beside volatile facts; and a quoted or paraphrased source should support the exact claim being made. This improves human comprehension and makes isolated retrieval less likely to distort the article.",
      ],
      example: [
        "For “What is ChatGPT search history?”, a weak answer conflates the user's conversation archive with web searches created during retrieval. A useful answer begins with the distinction, lists included and excluded fields, explains how a trace can be collected, shows one example entry and states that missing interface evidence does not prove no search occurred.",
        "That answer is compact at the top but deep underneath. A reader who only needs the distinction can leave immediately; a privacy reviewer can inspect the field contract; and an SEO practitioner can understand how the evidence should and should not enter a content brief.",
      ],
      provenance: [
        "Make provenance visible at the level where a claim is interpreted. A source list at the bottom is necessary but insufficient if readers cannot tell which source establishes provider behavior and which supports the editorial method. Use source descriptions, dates and bounded language throughout the article.",
        "Keep data families distinct in reporting. Google Ads volume estimates human Google demand. Search Console records Google Web exposure. A provider trace records an interface observation. An estimated fan-out records a controlled model output. Collapsing them into an “AEO score” removes the very context needed to act responsibly.",
      ],
      limitations: [
        "A well-formed answer can improve clarity and eligibility, but no publisher controls whether a search feature extracts, cites or ranks it. Schema must match visible content and does not create a guarantee. FAQ markup is inappropriate when the page does not visibly contain genuine questions and answers.",
        "AEO should also resist false precision. If the evidence is incomplete, say what is unknown and what observation would resolve it. A qualified answer is more useful than a categorical statement built on an interface screenshot or one model run.",
      ],
    },
    extraSections: [
      {
        id: "answer-unit-patterns",
        heading: "Choose the right answer unit for the job",
        paragraphs: [
          "The following patterns are editorial structures, not schema recipes. They help the writer expose the reasoning a reader needs while keeping the answer extractable and self-contained.",
        ],
        table: {
          headers: ["Question type", "Required elements", "Common failure"],
          rows: [
            [
              "Definition",
              "Plain definition, boundary, contrast, example",
              "Circular wording that repeats the term",
            ],
            [
              "How-to",
              "Prerequisites, ordered steps, output, failure handling",
              "A list of verbs with no usable artifact",
            ],
            [
              "Comparison",
              "Shared criteria, evidence, trade-offs, audience fit",
              "Separate feature lists that never compare",
            ],
            [
              "Recommendation",
              "Audience, conditions, reasons, avoid-if cases",
              "Universal “best” claims without context",
            ],
            [
              "Current fact",
              "Named entity, value, date, primary source, update rule",
              "An undated number detached from its source",
            ],
          ],
        },
      },
      {
        id: "aeo-brief-template",
        heading: "Use an AEO brief that forces editorial decisions",
        paragraphs: [
          "A useful brief should fit on one page before research expands it. Its purpose is to prevent the draft from becoming a collection of adjacent keywords.",
        ],
        bullets: [
          "Primary question: the full natural-language question the canonical must answer.",
          "Reader and decision: who is asking and what they should be able to decide or do.",
          "Scope: geography, timeframe, product version and other boundaries that can alter the answer.",
          "Answer shape: definition, procedure, comparison, recommendation or current fact.",
          "Claim ledger: each material claim, its strongest available source, date and limitation.",
          "Required artifacts: table, worked example, checklist, calculation or step-by-step output.",
          "Non-goals: attractive adjacent questions that belong to another canonical.",
          "Measurement: baseline, expected observable signal, evaluation date and falsification condition.",
        ],
      },
    ],
  },
  "chatgpt-search-queries": {
    readMinutes: 12,
    keyTakeaways: [
      "A precise distinction between the user's prompt, ChatGPT's surfaced search queries, returned sources and the final cited answer.",
      "A field-level observation contract that prevents an interface trace from being mistaken for complete hidden reasoning.",
      "A practical workflow for turning real query evidence into a better content brief without copying search strings into prose.",
      "A worked B2B software example showing how qualifiers, comparison criteria and source needs change the page specification.",
    ],
    paragraphAdditions: {
      "what-chatgpt-search-does": [
        "OpenAI documents that ChatGPT can rewrite a user's prompt into one or more targeted search queries and can issue additional, more specific searches as the task develops. The answer may then present inline citations and a Sources panel. Those are separate stages: the prompt expresses the user's task, a search query asks a retrieval system for evidence, a result identifies a candidate source and a citation connects the answer to a selected source.",
        "That separation matters because the literal prompt is often too broad for research. A request to “choose an expense platform for our European subsidiaries” may produce searches about multi-entity controls, VAT treatment, supported countries, approval workflows and current product documentation. The expanded language reveals the conditions the answer system considered useful, even though it does not reveal every internal step.",
        "Do not generalize one trace into a permanent ranking factor. Query rewriting varies with the prompt, conversation context, product mode, location, available sources and provider changes. The defensible unit is a dated observation tied to a supported interface event—not a claim about how ChatGPT always searches.",
      ],
      "what-open-queries-observes": [
        "A useful record must keep the provider, normalized query text, capture timestamp and observation method together. If the interface provides a stable event identifier or adapter metadata, retain it for deduplication and troubleshooting. If a field is absent, leave it absent; do not reconstruct it from the answer and silently label the reconstruction observed.",
        "Open Queries deliberately excludes conversation text. This is both a privacy boundary and an analytical constraint: the trace can show that a query surfaced, but it cannot explain every prior turn that caused the provider to formulate it. Teams should interpret the record as retrieval evidence, not as a replay of the user's private reasoning or the model's hidden chain of thought.",
        "Interface adapters fail closed. When an interface changes and the explicit query event can no longer be identified under the adapter contract, collection should stop instead of scraping nearby text that merely resembles a query. Reliable missing data is better than contaminated evidence.",
      ],
      "observed-versus-estimated": [
        "Observed and estimated queries answer different questions. An observed query establishes that a supported interface exposed a particular search string in one event. An estimate explores plausible retrieval language under a stated model and sampling method. The estimate may be useful before enough live evidence exists, but it cannot confirm provider behavior.",
        "Keep separate columns, filters and exports for the two evidence classes. The provenance label should survive screenshots, CSV exports and content briefs. Combining both into a colorful “query cloud” destroys the boundary exactly when the data is copied into editorial work.",
        "Absence is not proof of non-search. A provider may search without exposing a compatible event, may use another retrieval method or may answer from available context. Report “no supported query observation captured” rather than “ChatGPT did not search.”",
      ],
      workflow: [
        "Start with a defined page and decision, not an unbounded export. Select traces that match the canonical's intended audience and job, normalize obvious duplicates and then classify each query by function: definition, entity lookup, comparison, evidence verification, freshness, geography or constraint. The classes reveal content gaps more reliably than raw frequency alone.",
        "Next, compare the classes with the page's visible answer. A missing term is not automatically a gap; the page may answer the concept in better language. A genuine gap exists when an important subquestion or decision criterion is absent, weakly sourced, out of date or placed on a competing canonical.",
        "Finish with an editorial decision and a falsification condition. Improve the existing canonical when the query supports the same stable job. Create a supporting article only when it has a distinct durable intent. Reject a query when it is irrelevant, unsafe, too ambiguous or based on a capability the product does not have.",
      ],
      limitations: [
        "Search traces are sampled interface evidence, not a complete transcript of retrieval. Product updates can change event shapes, supported modes and query behavior without preserving historical comparability. Every analysis should therefore record adapter version and capture window.",
        "Query frequency in a local trace is not market demand. Use verified Google Ads exports for Google demand and Search Console for observed Google exposure. Use ChatGPT search-query records to understand retrieval language and evidence needs. Joining those families can support a decision, but neither should be relabeled as the other.",
      ],
    },
    extraSections: [
      {
        id: "query-ledger",
        heading: "Build a ChatGPT search-query ledger",
        paragraphs: [
          "The ledger is the smallest reviewable artifact that preserves provenance while still helping an editor. One row represents one normalized observation or one explicitly labeled estimate; aggregation happens only after the raw boundary is safe.",
        ],
        table: {
          headers: ["Field", "Example", "Why it matters"],
          rows: [
            [
              "Evidence class",
              "Observed interface query",
              "Prevents estimates from becoming claimed provider behavior",
            ],
            [
              "Query",
              "expense management multi entity VAT Europe",
              "Preserves the surfaced retrieval language",
            ],
            [
              "Provider and mode",
              "ChatGPT Search",
              "Keeps unlike product surfaces out of one series",
            ],
            [
              "Captured at",
              "2026-08-10T09:14Z",
              "Makes volatile behavior auditable",
            ],
            [
              "Function",
              "Comparison + regional constraint",
              "Turns strings into an editorial coverage decision",
            ],
            [
              "Target canonical",
              "/expense-platform-comparison",
              "Connects evidence to one stable page job",
            ],
            [
              "Decision",
              "Improve VAT evidence section",
              "Records what changed—and what did not",
            ],
          ],
        },
      },
      {
        id: "worked-content-brief",
        heading: "Worked example: from query trace to a better B2B brief",
        paragraphs: [
          "Assume an existing comparison page says that a product is “built for global teams.” The observed trace contains searches for supported European entities, VAT evidence requirements, approval controls and accounting integrations. Repeating those strings would add noise; converting them into testable decision criteria changes the page.",
          "The revised brief asks for a country coverage table dated to the current product version, a multi-entity workflow with roles and outputs, links to official tax and product documentation, an integration comparison using one shared set of criteria and an explicit section for unsupported jurisdictions. The generic global claim is narrowed to what the sources can establish.",
          "After publication, the team records the exact changed sections and watches for relevant Google query/page exposure, new provider-query classes, bounded citation observations and qualified product actions. It does not claim that the trace caused a citation or that a single citation caused an install.",
        ],
        callout:
          "The query is a research clue. The publishable asset is the verified answer, comparison or workflow produced from that clue.",
      },
    ],
  },
  "chatgpt-search-history": {
    readMinutes: 11,
    keyTakeaways: [
      "A clean distinction between conversation history, browser history and a purpose-built log of surfaced web-search queries.",
      "A privacy-aware field contract listing what a useful query record includes, excludes, retains and deletes.",
      "A workflow for auditing retrieval language without collecting prompts, responses or general browsing activity.",
      "Clear limits: a local trace is incomplete interface evidence, not a complete account of ChatGPT's internal search process.",
    ],
    paragraphAdditions: {
      "two-histories": [
        "The word history is overloaded. ChatGPT conversation history is the user's archive of conversations and account activity. Browser history is the browser's record of visited pages. A web-search query history is narrower: it records explicit search strings surfaced while a supported AI interface uses web search. Treating those three stores as interchangeable creates both privacy risk and analytical confusion.",
        "A query-history tool should make its narrow object visible in the product name, settings and exports. Someone reviewing a record should be able to tell that it came from a provider search event, not from the person's prompt or from every URL they visited. The distinction should survive even when a CSV leaves the extension.",
        "This also limits the SEO claim. Query history can reveal retrieval vocabulary and recurring constraints in the captured sample. It cannot describe everything users asked, every source the provider considered or every search the provider executed.",
      ],
      "stored-fields": [
        "Minimize fields before optimizing analytics. The default record needs the provider, query text, timestamp, evidence class and enough adapter context to explain how the event was identified. A stable event identifier may support deduplication, but a full prompt is not required to analyze the search string.",
        "Retention should match the job. A short local window helps a practitioner review recent sessions without creating a permanent behavioral archive. A longer accepted telemetry window may support aggregate product health only when the fields, purpose and deletion path are explicit. Local and accepted remote storage should never be described as the same thing.",
        "Exports need the same provenance labels as the interface. Removing the evidence class or provider during export makes downstream misuse predictable: estimated queries get counted as observed and records from different interfaces are compared without qualification.",
      ],
      "excluded-fields": [
        "The strongest privacy statement is a verifiable negative contract. Conversation prompts, response bodies, page content and unrelated browsing activity are unnecessary for the query-history job and should remain outside collection. Passwords, form values and cookies are also outside scope and should not become accidental debugging payloads.",
        "Avoid deriving sensitive categories from query strings. A surfaced query can contain personal or confidential terms because it reflects the task at hand. Search, filtering and deletion can operate on the literal record without adding inferred health, political, employment or identity labels.",
        "Debugging should preserve the contract. When an adapter breaks, collect version and failure state rather than nearby DOM text. A temporary diagnostic that captures more content can become a permanent undeclared data path unless the boundary is enforced in code and tests.",
      ],
      workflow: [
        "Begin with a bounded review window and one question, such as “Which comparison criteria appeared while researching our enterprise plan page?” Filter to the relevant provider and canonical, deduplicate exact repeats and classify the remaining queries by function. Do not browse an employee's entire trace looking for an interesting story.",
        "Create a short evidence memo with counts, representative rows, missing coverage and rejected rows. Rejections matter: branded navigational searches, unrelated tasks and ambiguous strings should not enter the page brief merely because they occurred.",
        "Translate accepted evidence into research tasks rather than phrases to insert. A query about data residency becomes a request to verify hosting regions, subprocessors, contractual coverage and limitations from primary documentation. The final article cites those sources, not the private query trace.",
      ],
      limitations: [
        "An interface event can be absent because the provider did not search, because the mode was unsupported or because the adapter could not safely identify the event. These cases are observationally different but may look identical in the history. The product must report the boundary instead of claiming completeness.",
        "A history record can contain confidential language even when conversation text is excluded. Teams should apply access control, retention, deletion and export handling appropriate to the query data itself. Data minimization reduces risk; it does not make every captured query harmless.",
      ],
    },
    extraSections: [
      {
        id: "history-field-contract",
        heading: "Use a field contract that a privacy reviewer can audit",
        paragraphs: [
          "The contract should be understandable without reading implementation code. It names the field, its purpose, storage boundary and deletion behavior, then links to the public architecture for verification.",
        ],
        table: {
          headers: ["Data", "Include?", "Purpose and boundary"],
          rows: [
            [
              "Surfaced search query",
              "Yes",
              "Core evidence; stored with provider, timestamp and provenance",
            ],
            [
              "Conversation prompt",
              "No",
              "Not needed to inspect provider search strings",
            ],
            [
              "Assistant response",
              "No",
              "Not needed for the query-history function",
            ],
            [
              "General browser history",
              "No",
              "Outside the supported provider-event boundary",
            ],
            [
              "Adapter/version metadata",
              "Yes",
              "Explains compatibility and supports fail-closed diagnosis",
            ],
            [
              "Estimated query",
              "Only on request",
              "Stored separately and visibly labeled estimated",
            ],
            [
              "Deletion control",
              "Required",
              "Removes the selected local record or clears local history",
            ],
          ],
        },
      },
      {
        id: "history-audit-example",
        heading:
          "Worked example: audit a comparison session without reading the chat",
        paragraphs: [
          "A practitioner researches AI visibility tools. The narrow history shows surfaced searches for citation monitoring, referral attribution, prompt tracking and query inspection. It does not store the user's prompt, the assistant's recommendation or unrelated tabs.",
          "The practitioner maps the four query classes to the comparison page. Query inspection is supported and documented; continuous citation monitoring and rank tracking are not. The editorial result is not to imply broader coverage. The page instead adds a boundary table that explains which evidence Open Queries provides and which instruments a team needs for the remaining jobs.",
          "That outcome is strategically useful because it improves qualification. Readers looking for a full monitoring suite can self-select out, while teams needing provider-query evidence can understand the exact fit and install with accurate expectations.",
        ],
      },
    ],
  },
  "claude-web-search": {
    readMinutes: 12,
    keyTakeaways: [
      "A source-backed explanation of Claude's documented web-search loop, explicit query inputs, result metadata and citations.",
      "A strict boundary between Anthropic's platform documentation and what a supported consumer interface actually exposes.",
      "A fail-closed observation method plus provider-native estimation when no explicit query event is available.",
      "A worked research workflow that converts repeated searches into evidence tasks without claiming access to hidden reasoning.",
    ],
    paragraphAdditions: {
      "claude-web-search": [
        "Anthropic's platform documentation describes web search as a server tool: Claude decides when to search, supplies a query and may repeat the process before composing a response with cited sources. Documented result fields include a URL, title and page age. That architecture makes a search query an explicit tool input in the platform surface, but it does not mean every consumer interface exposes the same fields in the same way.",
        "Repeated searches are expected for research tasks. A comparison can require entity discovery, official product documentation, current constraints and verification of a conflicting claim. The sequence is analytically useful because later queries may reveal what the first results failed to resolve.",
        "Citations support source inspection, not automatic truth. A cited page can be outdated, weak or misread; an answer can omit important evidence; and a query can retrieve sources that never appear in the final response. Content teams should inspect the underlying source and claim fit before changing a canonical.",
      ],
      "fail-closed-adapter": [
        "Observation begins with an explicit contract for the supported interface event. The adapter should identify a provider-native query field or stable structured event—not infer a query from prose, a citation title or a nearby label. When that contract no longer matches, the correct output is unsupported or unknown.",
        "Fail-closed behavior protects historical data. If a UI redesign caused source titles to be captured as search queries, the resulting trend could look like a dramatic change in Claude's behavior. Stopping collection turns the redesign into a visible compatibility incident instead of an invisible analytical error.",
        "Store adapter version with the evidence window. Comparisons across versions should be treated as a potential series break until a fixture or live check confirms equivalent semantics.",
      ],
      "provider-native-estimates": [
        "Estimation is useful when a practitioner wants candidate research language before explicit observations are available. The estimate should use the named provider model, fixed prompt template, declared sample count and visible uncertainty. It explores plausible queries; it does not recover a private production trace.",
        "Diversity and plausibility need separate checks. Ten paraphrases of the same phrase do not create useful coverage. A good candidate set spans different retrieval functions—definition, comparison, current fact, source seeking and constraint—while remaining relevant to the original task.",
        "Provider-native does not mean provider-observed. The label describes which model generated the candidate under the documented method. Preserve “estimated” in the interface, history and export.",
      ],
      workflow: [
        "Review a complete bounded trace when available, not only the most surprising query. Order can reveal a progression from discovery to verification: an initial broad comparison, a vendor-specific capability lookup, a primary-source request and a search for limitations. Convert that progression into an evidence map.",
        "For each accepted query, write the question the page must resolve and the source class able to resolve it. A search for product limits should lead to current vendor documentation or reproducible behavior; a regulatory question should lead to the responsible authority; a methodological claim should lead to the original research.",
        "Then decide whether the evidence belongs on the canonical, a supporting article or nowhere. Do not create a Claude-specific doorway page for every query. Provider pages should explain provider behavior; durable topic guides should own provider-neutral decisions.",
      ],
      limitations: [
        "Platform documentation can establish the documented tool behavior, but it should not be used to overclaim undocumented consumer-interface internals. Interface observations should name the tested surface and date. Where the two differ, present both boundaries rather than forcing a single story.",
        "The captured sequence may be incomplete, and a final citation does not prove which query retrieved it. Preserve events as observations unless the interface explicitly connects them. Avoid causal diagrams that the available evidence cannot support.",
      ],
    },
    extraSections: [
      {
        id: "claude-trace-anatomy",
        heading: "Read a Claude web-search trace as a research process",
        paragraphs: [
          "A useful trace review asks what each search is trying to resolve. This prevents a list of strings from being mistaken for a content strategy.",
        ],
        table: {
          headers: [
            "Search stage",
            "Illustrative query",
            "Editorial implication",
          ],
          rows: [
            [
              "Orient",
              "AI search query inspection tools",
              "Define the category and explicit non-goals",
            ],
            [
              "Compare",
              "AI search query inspector privacy local storage",
              "Use shared privacy criteria rather than separate feature claims",
            ],
            [
              "Verify",
              "Open Queries architecture query capture GitHub",
              "Link the public implementation evidence for product claims",
            ],
            [
              "Test limits",
              "can query inspector track citations rankings",
              "State that query inspection is not continuous citation or rank monitoring",
            ],
            [
              "Act",
              "install Chrome AI search query extension",
              "Provide a clear, accurately labeled installation path",
            ],
          ],
        },
      },
      {
        id: "claude-evidence-brief",
        heading: "Create an evidence brief before editing the page",
        paragraphs: [
          "The brief records the observed or estimated query, the unresolved reader question, the required source class, the target canonical and the acceptance test. It should also record rejected evidence so another editor does not revive it without context.",
        ],
        bullets: [
          "Observation: exact surfaced event, provider, interface, timestamp and adapter version—or an explicit estimated label.",
          "Question: the natural-language uncertainty the query appears designed to resolve.",
          "Evidence requirement: primary documentation, authority, original research or reproducible product evidence.",
          "Page decision: improve, hold, consolidate, create a distinct support article or reject.",
          "Claim boundary: what the evidence supports and what remains unknown.",
          "Measurement: the first observable signal and the date on which review becomes meaningful.",
        ],
      },
    ],
  },
  "google-ai-overviews": {
    readMinutes: 13,
    keyTakeaways: [
      "Google's own guidance: ordinary Search eligibility and helpful content remain foundational; no special AI schema or text file guarantees inclusion.",
      "A clear model of seed demand, documented query fan-out, source selection and the limits of interface observations.",
      "A content workflow that maps subquestions to primary evidence instead of manufacturing near-duplicate pages.",
      "A measurement plan using Search Console Web data without pretending it offers a separate universal AI Overview ranking report.",
    ],
    paragraphAdditions: {
      "how-ai-overviews-work": [
        "Google says AI Overviews and AI Mode can use query fan-out: the system issues multiple related searches across subtopics and data sources, then uses the responses to develop an answer. This can surface a broader and more diverse set of supporting links than one literal keyword lookup. The documented mechanism explains why a page may need to answer qualifying subquestions, but it does not reveal a fixed list of expansions for every user query.",
        "Eligibility is intentionally ordinary. A page must be indexed and eligible to appear with a snippet, and Google's existing Search requirements apply. Google also says there is no special schema.org markup, AI text file or additional technical requirement that guarantees appearance. Structured data should match the visible page; it is not a shortcut around weak content.",
        "That puts site architecture back at the center. A useful canonical needs crawlable server-rendered text, accurate metadata and contextual internal links from pages that explain why it matters. A URL present only in a sitemap has a weaker discovery and meaning signal than one integrated into a coherent topic graph.",
      ],
      "two-evidence-classes": [
        "The seed query and an expanded query belong to different analytical layers. Google Ads historical volume estimates demand for the submitted Google keyword scope. Search Console records actual Google query/page exposure after publication. A query surfaced by a supported AI Overview interface is a retrieval observation. A model-generated candidate is an estimate. Keep all four provenance types distinct.",
        "Expanded queries are most useful when classified by the job they perform. Some decompose the topic into features; some add entities or locations; some ask for current evidence; and some verify a risky claim. The class points to the missing answer artifact: definition, comparison table, dated fact, source link or limitation.",
        "Do not publish one page for every expansion. If several queries support the same decision, improve the existing canonical. A new URL is justified only when the information need is independently useful, stable and internally linkable without repeating the parent page.",
      ],
      "query-fan-out": [
        "Fan-out changes content research more than it changes prose. The page should not read like a list of awkward expansions. It should anticipate the reader's decision path: establish the subject, compare alternatives on shared criteria, resolve current constraints, show evidence and state where the answer stops.",
        "A compact evidence matrix is often the best bridge. Put subquestions in rows and record the reader decision, source class, current evidence, missing evidence and owning canonical. This exposes gaps and duplication before drafting begins.",
        "Freshness should be claim-specific. A product launch date, supported country or policy can change and needs an adjacent date and update rule. A stable conceptual definition does not need artificial “2026” wording unless the year changes the answer.",
      ],
      workflow: [
        "Begin with verified human demand and actual Search Console exposure when available. Choose one canonical whose job is already clear, then review observed or estimated fan-out only to identify subquestions and source needs. Competitor headings may reveal category conventions, but they do not establish what is true or useful.",
        "Build the claim ledger before the final outline. Important facts need a source, date, scope and limit. Comparisons need a common rubric. Advice needs conditions and an avoid-if case. The resulting article can use a direct answer, narrative explanation, table, workflow and worked example without becoming a collection of fragments.",
        "After publication, check crawl and indexing first, then relevant query/page exposure. Google reports AI-feature traffic inside the Web search type in Search Console rather than promising a separate breakdown for every answer experience. Keep manual AI Overview observations in a different dataset with the tested query, location, date and surface.",
      ],
      limitations: [
        "Google does not guarantee that an eligible page will appear in an AI Overview or AI Mode response. Answers and links can vary with the query, user context, location, time and underlying systems. One screenshot is a bounded observation, not a durable rank.",
        "Search Console's Web data is authoritative for the recorded Google exposure it reports, but it cannot answer every AI-feature question. Do not infer a universal AI Overview position from aggregate clicks or impressions. Use the metric for what it measures and document the missing dimension.",
      ],
    },
    extraSections: [
      {
        id: "overview-evidence-matrix",
        heading: "Map fan-out to evidence, not keyword repetition",
        paragraphs: [
          "Consider a seed question about choosing an AI search extension. The likely branches are not synonyms; they are decision criteria that require different evidence.",
        ],
        table: {
          headers: ["Branch", "Reader needs", "Best page artifact"],
          rows: [
            [
              "Provider support",
              "Which interfaces and modes are covered now?",
              "Dated compatibility table with adapter version",
            ],
            [
              "Privacy",
              "Does the extension read prompts or conversations?",
              "Field-level inclusion/exclusion contract",
            ],
            [
              "Observed vs estimated",
              "Which queries were actually surfaced?",
              "Provenance table and export labels",
            ],
            [
              "Installation",
              "Can I safely install and remove it?",
              "Verified steps, permissions and uninstall path",
            ],
            [
              "Use in SEO",
              "How does a trace improve a page?",
              "Worked query-to-content-brief example",
            ],
            [
              "Limitations",
              "Is this a rank tracker or citation monitor?",
              "Explicit capability boundary and alternatives",
            ],
          ],
        },
      },
      {
        id: "google-measurement-plan",
        heading: "Measure Google exposure without inventing an AI rank",
        paragraphs: [
          "Use Search Console query/page data to establish whether the canonical is discovered for relevant Google searches and whether selection changes after a documented intervention. Segment brand and non-brand demand, record the comparison window and account for low-volume privacy thresholds or incomplete fresh data.",
          "Manual AI Overview observations can answer narrower questions: did this page appear for this query, in this location, on this date and surface? Keep the prompt set versioned and preserve screenshots or citation URLs. The observation is useful for diagnosis but should not be merged into Search Console metrics or described as total share of voice.",
          "The business layer remains separate. A verified store install, extension activation or qualified product event is a downstream outcome. GitHub asset downloads and install-page visits are distribution signals, not installations unless the store or product telemetry establishes that event.",
        ],
      },
    ],
  },
  "fan-out-queries": {
    readMinutes: 12,
    keyTakeaways: [
      "A practical taxonomy of decomposition, entity, comparison, verification, freshness and constraint queries.",
      "A strict provenance model for observed provider events, model estimates, Google demand and Search Console exposure.",
      "A worked content matrix that turns a broad prompt into evidence-backed coverage on one canonical.",
      "Rules for when a branch deserves a supporting article—and when creating another URL would be doorway content.",
    ],
    paragraphAdditions: {
      "why-fan-out-exists": [
        "Complex questions rarely map cleanly to one document or one literal query. A system may need to identify the relevant entities, break the task into subproblems, find current facts, compare competing claims and retrieve primary sources. Fan-out is the family of related searches used to gather that evidence.",
        "Google publicly describes query fan-out for its AI features, and OpenAI documents that ChatGPT Search can rewrite a prompt into one or more targeted queries and issue additional searches. Anthropic's web-search documentation likewise shows a tool loop that can search repeatedly. The implementations differ, so the shared concept should not be turned into a claim that every provider uses an identical hidden pipeline.",
        "The editorial opportunity lies in the unresolved questions. A branch about pricing requires dated product evidence; a branch about compliance requires jurisdiction and authority; a branch comparing products requires one rubric. Each branch suggests an evidence job, not a phrase-density target.",
      ],
      "observed-and-estimated": [
        "An observed fan-out query is tied to an explicit supported provider event. The record should include provider, interface or mode, timestamp, adapter version and literal query text. It supports the claim that this query surfaced in that event; it does not establish that the query caused a particular source or answer.",
        "An estimated fan-out is a controlled model output generated from the seed under a declared provider, template and sample count. Its use is exploratory: form a research plan, find missing qualifiers or prepare a test panel. It must remain labeled estimated in every view and export.",
        "Google Ads keyword volume and Search Console queries are neither of those. They are valuable adjacent evidence for human demand and actual Google exposure. Joining the four families in one analysis can reveal a gap between demand, retrieval language and current visibility, but the original source and unit must remain visible.",
      ],
      example: [
        "Take the seed task “choose an AI search extension for our SEO team.” A realistic fan-out can branch into supported providers, privacy, observed versus estimated evidence, citation monitoring, history retention, installation safety and team workflow. These branches are not equal keywords; they are criteria a buyer needs to resolve.",
        "The canonical install or comparison page should answer the high-intent criteria with a compatibility table, privacy contract, evidence boundary and setup workflow. A methodological question such as how log-probability sampling works can live in a supporting article because it has an independently useful technical intent. A page called “best query expansion Chrome plugin” that repeats the install page would not.",
        "The finished content should read as one decision journey. A reader starts with product fit, verifies the evidence and limitations, then acts. The fan-out map remains behind the structure as research provenance rather than appearing as a mechanical keyword list.",
      ],
      workflow: [
        "Normalize exact duplicates but keep meaningful differences in entities, timeframe and constraints. Classify each branch by function and mark whether it was observed, estimated, demand-derived or seen in Search Console. Then map it to a reader decision and source requirement.",
        "Score gaps by decision importance, evidence availability and canonical fit—not only frequency. A low-frequency regulatory constraint can determine whether an enterprise reader can use the product. A high-frequency broad definition may already be adequately answered on the pillar.",
        "Publish the smallest coherent change that resolves the important gap. Record the baseline and expected observable signal. If no new evidence appears after the relevant crawl and measurement window, diagnose eligibility, intent or source quality before adding another cluster of text.",
      ],
      limitations: [
        "A fan-out map is conditional on the seed, context, provider, interface, date and estimation method. It is not a timeless ontology of the topic. Preserve versions and revisit the map when the product or information need changes.",
        "Do not infer hidden causality. A query and citation in the same session do not prove that one retrieved the other unless the interface explicitly links them. Likewise, a page revision followed by traffic does not establish attribution without a suitable design.",
      ],
    },
    extraSections: [
      {
        id: "fan-out-taxonomy",
        heading: "Classify fan-out by retrieval job",
        paragraphs: [
          "A functional taxonomy is more useful than clustering by lexical similarity because it tells the editor which answer artifact is missing.",
        ],
        table: {
          headers: ["Query job", "Example", "Content requirement"],
          rows: [
            [
              "Decompose",
              "AI search visibility eligibility citations referrals",
              "Explain the component model and dependencies",
            ],
            [
              "Identify entity",
              "Open Queries supported providers",
              "Dated named-entity and compatibility evidence",
            ],
            [
              "Compare",
              "query inspector vs AI rank tracker",
              "Shared criteria and explicit product boundary",
            ],
            [
              "Verify",
              "Open Queries conversation data GitHub",
              "Primary implementation or policy evidence",
            ],
            [
              "Refresh",
              "ChatGPT Search crawler documentation 2026",
              "Current source, access date and update rule",
            ],
            [
              "Constrain",
              "AI search extension privacy Chrome enterprise",
              "Audience-specific controls and limitations",
            ],
            [
              "Act",
              "install AI search query inspector",
              "Accurate setup, permissions and next step",
            ],
          ],
        },
      },
      {
        id: "fan-out-content-matrix",
        heading: "Turn branches into a content decision matrix",
        paragraphs: [
          "For each branch, record its provenance, the decision it changes, the strongest available source, current page coverage and the owning canonical. This exposes two expensive mistakes early: unsupported claims and multiple pages competing for one job.",
        ],
        steps: [
          {
            title: "Accept",
            text: "The branch changes the reader's decision, has appropriate evidence and fits the existing canonical.",
          },
          {
            title: "Research",
            text: "The branch matters but the current evidence is weak, stale or secondary; assign a source task before drafting.",
          },
          {
            title: "Create support",
            text: "The branch has a distinct durable intent and can provide standalone value while linking back to the pillar.",
          },
          {
            title: "Reject",
            text: "The branch is irrelevant, unsafe, duplicative or implies a capability the product does not provide.",
          },
        ],
        callout:
          "A fan-out is an evidence map. It becomes SEO content only after editorial judgment decides what deserves a verified answer.",
      },
    ],
  },
  "ai-search-visibility": {
    readMinutes: 12,
    keyTakeaways: [
      "A visibility model that separates eligibility, retrieval, citation, referral and business outcome instead of hiding them in one score.",
      "A practical dashboard specification with source, unit, time window and claim boundary for every metric.",
      "A diagnostic workflow for distinguishing crawl problems, intent mismatch, weak evidence and selection problems.",
      "A precise explanation of what Open Queries contributes—and why it is not a complete AI visibility or rank-tracking suite.",
    ],
    paragraphAdditions: {
      "visibility-stack": [
        "The layers form a dependency chain, not a funnel with guaranteed conversion. A page can be crawlable but never retrieved; retrieved but not cited; cited without a referral; or visited without producing a business outcome. Measuring each layer separately tells the team where the uncertainty begins.",
        "Record the observation unit and denominator. “Three citations” is meaningless without the tested prompts, provider, mode, location, date and repeat design. “Twenty crawler hits” is not twenty users. “AI traffic” can mix assistant referrals, bots and ordinary campaigns unless the referrer and user-agent rules are explicit.",
        "This layered model also prevents vanity wins. A visibility increase is useful only when the surfaced page and query match the intended job. Exposure for an ambiguous or irrelevant query should remain visible in the raw evidence but should not inflate the target canonical's success claim.",
      ],
      "tool-boundary": [
        "Open Queries contributes one narrow but valuable input: the search strings explicitly exposed by supported provider interfaces and separately labeled model estimates requested by the user. That evidence can reveal how a broad task was narrowed into entities, qualifiers or source-seeking language.",
        "It does not continuously run a prompt panel, calculate share of voice, identify every citation across providers or infer unseen retrieval. A team that needs those capabilities should combine purpose-built monitoring with Search Console, referral analytics, product analytics and manual source review. Calling a query inspector a complete AI visibility tool would make the measurement architecture less honest, not more complete.",
        "The distinction matters operationally. Query evidence helps improve a content brief; citation evidence tests whether a source appeared; referral evidence shows a visit; and conversion evidence shows a defined product action. Each instrument should be chosen for the question it can actually answer.",
      ],
      "monitoring-workflow": [
        "Define a versioned prompt or task set only when repeated answer testing is justified. Keep brand, generic category, comparison and problem-solving prompts in separate panels so a movement in branded recall does not masquerade as non-brand discovery. Record provider mode and location when they can affect results.",
        "For every content intervention, attach one primary success signal and one guardrail. An internal-link fix may target discovery while guarding against accidental canonical changes. A source-quality rewrite may target relevant impressions or bounded citation appearance while guarding against lower install-page engagement. More metrics do not create more certainty if the hypothesis is vague.",
      ],
      example: [
        "Imagine that a GEO guide is fetched by search crawlers, appears in one manually tested answer and receives no identifiable referral traffic. The correct report is three separate facts: discoverability is active, one bounded citation observation occurred and referral selection is not observed. It is not “AI visibility increased 100%.”",
        "The next action depends on the objective. If the page is new, wait for indexing and relevant query exposure. If it already earns impressions but is not selected, inspect the direct answer, source specificity and title. If referrals arrive but readers bounce, the problem is likely page value or intent alignment rather than retrieval visibility.",
      ],
      limitations: [
        "Provider interfaces and reporting surfaces change. Referrer headers can be absent, citations can vary between runs and Search Console does not break out every Google AI feature as a separate performance dimension. Missing evidence must remain unknown rather than being converted into zero.",
        "A panel can support comparison only within its documented design. Changing prompts, providers, modes or locations resets comparability. Even a stable panel samples possible answers; it does not measure every answer shown to every user.",
      ],
    },
    extraSections: [
      {
        id: "visibility-dashboard",
        heading: "Build a dashboard that preserves evidence boundaries",
        paragraphs: [
          "Every row should identify its source, unit, window and interpretation limit. This makes the dashboard slower to fake and faster to diagnose.",
        ],
        table: {
          headers: [
            "Signal",
            "Source and unit",
            "Supports",
            "Does not support",
          ],
          rows: [
            [
              "Eligibility",
              "Live crawl, HTTP status, canonical and robots checks",
              "The page can be fetched and is intended for indexing",
              "That any answer system selected it",
            ],
            [
              "Google exposure",
              "GSC Web impressions/clicks by query and page",
              "Observed Google Search exposure and selection",
              "A separate AI Overview rank",
            ],
            [
              "Provider retrieval query",
              "Explicit supported interface event",
              "One surfaced retrieval action",
              "The complete hidden retrieval plan",
            ],
            [
              "Citation panel",
              "Versioned prompt/provider/date observation",
              "Appearance in the bounded panel",
              "Population share of voice",
            ],
            [
              "Assistant referral",
              "Validated referrer and human-traffic rules",
              "A visit attributed to the available referrer",
              "A citation or recommendation",
            ],
            [
              "Business outcome",
              "Defined first-party product event",
              "The measured downstream action",
              "The channel's causal contribution without attribution design",
            ],
          ],
        },
      },
      {
        id: "diagnostic-tree",
        heading: "Diagnose the first missing signal",
        paragraphs: [
          "Start at the earliest layer with missing or contradictory evidence. This avoids rewriting content when the route is broken and avoids technical busywork when the answer is simply weak.",
        ],
        steps: [
          {
            title: "Not fetchable",
            text: "Fix status codes, robots, CDN rules, rendering and canonical output. Do not interpret downstream metrics.",
          },
          {
            title: "Fetchable but undiscovered",
            text: "Check sitemap processing and contextual inbound links; confirm that the canonical owns a visible site purpose.",
          },
          {
            title: "Indexed but irrelevant exposure",
            text: "Narrow the title, direct answer and entity context so the page's job is unambiguous.",
          },
          {
            title: "Relevant exposure without selection",
            text: "Inspect answer usefulness, trust evidence, comparison criteria and snippet-level clarity.",
          },
          {
            title: "Citation without referral",
            text: "Treat the citation as bounded appearance; review whether the answer resolves the task without a click and whether the source offers unique follow-on value.",
          },
          {
            title: "Referral with poor engagement",
            text: "Audit the landing promise, first-screen information scent, speed and match between cited passage and page experience.",
          },
        ],
      },
    ],
  },
};

export const learnDepthBySlug: Record<string, ContentDepth> = {
  "what-are-fan-out-queries": {
    readMinutes: 11,
    keyTakeaways: [
      "Fan-out is a retrieval process: one information need can produce several narrower searches for entities, comparisons, facts and sources.",
      "Google, OpenAI and Anthropic document related multi-search behavior, but their implementations should not be treated as one identical pipeline.",
      "Observed, estimated, demand and Search Console queries remain different evidence classes even when the literal string matches.",
      "The editorial use is to build a coverage-and-evidence map for one canonical—not a doorway page for every branch.",
    ],
    paragraphAdditions: {
      "one-prompt-many-searches": [
        "Consider the question “Which analytics platform should a European healthcare company buy?” Before a defensible answer is possible, a system may need to identify the relevant vendors, verify current data-hosting regions, compare security controls, check contractual terms, distinguish product tiers and find authoritative documentation. No single short search reliably carries all of those constraints.",
        "A fan-out can therefore include several retrieval jobs. Decomposition breaks the decision into parts. Entity searches resolve names and relationships. Comparison searches establish common criteria. Verification searches look for primary evidence. Freshness searches update volatile facts. Constraint searches add geography, audience or regulation.",
        "This does not imply that every system exposes a neat tree. Google names query fan-out in its documentation for AI features. OpenAI says ChatGPT Search may rewrite a prompt into targeted queries and perform additional searches. Anthropic documents a repeated web-search tool loop. Those sources support the general multi-search pattern while leaving many production details undisclosed.",
      ],
      "observed-estimated": [
        "The evidence label is determined by origin, not wording. If “European analytics data residency” appears in a recognized provider search event, it is an observation of that event. If the same string is generated in a controlled model experiment, it is an estimate. If it appears in a Google Ads export, it is a human-demand keyword estimate. If it appears in Search Console, it is an observed Google query associated with site exposure.",
        "A robust data model can normalize the string for review while preserving every provenance row. That allows an editor to see convergence without claiming equivalence. Convergence is useful: human demand, provider retrieval and current site exposure may all point to the same unanswered question. It still does not turn an estimated fan-out into observed volume.",
        "Missing observations should stay unknown. A provider may not expose a query, an adapter may be unsupported or the answer may not require web search. Zero is a numerical claim; unknown is an honest evidence state.",
      ],
      example: [
        "The broad extension question can be organized as a decision journey. Provider support establishes technical fit. The privacy boundary establishes whether the tool can be approved. Evidence classes establish what the data means. Installation status establishes the available distribution path. Measurement limits establish what the tool cannot replace.",
        "Each branch suggests a different artifact: a compatibility table, a field-level privacy contract, a provenance matrix, verified installation steps and a capability boundary. The article becomes stronger because it resolves real decisions, not because it contains more variants of “AI search extension.”",
      ],
      "editorial-workflow": [
        "After collecting branches, write the full natural-language question behind each one. “query inspector privacy” becomes “Does the extension read conversation text, and which fields are stored locally?” That formulation tells the researcher what must be proven and prevents a vague feature paragraph.",
        "Map each question to the strongest source class and one owning canonical. Current product behavior belongs to versioned documentation or reproducible implementation evidence. Provider behavior belongs to provider documentation plus a dated interface observation. Statistical methods belong to the published methodology and formulas.",
        "The final review asks whether the canonical is complete without becoming diffuse. A branch belongs when it changes the target reader's decision. A distinct support article is justified when the mechanism is independently useful and too deep for the decision page. Everything else is held or rejected.",
      ],
      "measurement-limits": [
        "Fan-out evidence can improve a hypothesis, not guarantee an outcome. A newly covered branch may help Google understand the page, may make a passage more useful for retrieval or may simply help a human reader. Those mechanisms are difficult to isolate in production and should not be collapsed into one causal claim.",
        "Measure the chain in order: technical discovery, relevant Google exposure, bounded citation observations, validated assistant referrals and actual product outcomes. Record the release and wait long enough for the next layer to become observable before rewriting again.",
      ],
    },
    extraSections: [
      {
        id: "fan-out-lifecycle",
        heading: "The lifecycle of a fan-out query",
        paragraphs: [
          "A branch passes through several states before it becomes useful editorial evidence. Confusing those states is how plausible ideas become false performance claims.",
        ],
        steps: [
          {
            title: "Need",
            text: "A user expresses a broad task with explicit and implicit constraints.",
          },
          {
            title: "Branch",
            text: "The system or experiment formulates a narrower retrieval query.",
          },
          {
            title: "Retrieve",
            text: "Search returns candidate sources; the complete candidate set may not be visible.",
          },
          {
            title: "Select",
            text: "The answer process uses, ignores or cites some evidence; query-to-source causality may remain unknown.",
          },
          {
            title: "Observe",
            text: "A supported interface exposes a query, result or citation with a bounded provenance label.",
          },
          {
            title: "Decide",
            text: "An editor maps the evidence to a source task, page improvement, support article or rejection.",
          },
        ],
      },
      {
        id: "fan-out-misconceptions",
        heading: "Five misconceptions that create bad content",
        paragraphs: [
          "Fan-out is often marketed as a license to publish more URLs. The opposite discipline is usually more valuable: use the branches to make one authoritative canonical complete, then create support only where the reader has a genuinely distinct job.",
        ],
        bullets: [
          "“Every branch needs a page.” Most branches are sections, evidence tasks or rejected noise.",
          "“A frequent model estimate is search volume.” It is frequency inside the declared experiment, not market demand.",
          "“A citation proves the observed query caused selection.” The interface may not expose that causal link.",
          "“Fan-out replaces keyword research.” Human demand and actual site exposure remain separate essential inputs.",
          "“More subtopics always improve the page.” Coverage without a coherent reader decision creates drift and cannibalization.",
        ],
      },
    ],
  },
  "aeo-geo-query-data": {
    readMinutes: 12,
    keyTakeaways: [
      "Keyword demand, provider-query observations, model estimates and site exposure answer four different questions.",
      "Query data is most useful before drafting, where it exposes hidden constraints, source requirements and canonical conflicts.",
      "A provenance contract must travel from raw record to dashboard, export, brief and published claim.",
      "The output of analysis is a falsifiable content decision—not an opaque visibility score or an obligation to publish.",
    ],
    paragraphAdditions: {
      "missing-demand-layer": [
        "Traditional keyword research starts with people expressing demand in a search engine. An answer system can add its own retrieval language after that expression: it may resolve entities, seek a current source, disambiguate a product or test a constraint. The intermediate search is neither the original human demand nor the final answer.",
        "That layer is valuable because it can expose why a page fails to satisfy a complex task. A canonical may rank for the broad topic while omitting the current fact, comparison criterion or source type that an answer process needs. Query evidence gives the researcher a concrete place to investigate.",
        "The layer is also easy to abuse. A provider observation is a single event, and an estimated branch is an experimental output. Neither supports a market-size claim. Good AEO and GEO work becomes more rigorous when it accepts smaller, correctly named evidence instead of manufacturing a universal metric.",
      ],
      "four-evidence-families": [
        "Google Ads volume is useful for prioritizing the relative scale of human Google demand within the export's market, language, network and period. Search Console then shows whether the site actually earned impressions and clicks for query/page pairs. Together they support conventional demand and performance decisions.",
        "Provider-query observations answer a different question: which search string did a supported AI interface expose during this event? Model estimates explore which adjacent strings are plausible under a named generation method. They can enrich a research brief before enough production evidence exists, but they need stronger caveats.",
        "A mature report can show all four families side by side while preserving the unit. The reader should never have to inspect a footnote to discover that a bar combines monthly Google searches, local interface events and model samples.",
      ],
      "provenance-contract": [
        "Provenance needs more than a source label. Record the market and export for demand, the property and date window for Search Console, the provider/interface/adapter for observations and the model/template/sample design for estimates. Add the target canonical and editorial decision so the evidence remains connected to its use.",
        "The contract should survive transformations. Deduplication can group literal strings, but each underlying record keeps its class. A chart can aggregate observed events, but its tooltip or table exposes the provider and window. An exported content brief identifies whether a phrase came from demand, performance, observation or estimation.",
        "Unknown values remain unknown. If a provider does not expose a query or Search Console suppresses a low-volume row, filling zero creates a false comparison. The dashboard should make incomplete coverage visible rather than cosmetically complete.",
      ],
      "decision-workflow": [
        "A decision begins with a canonical and reader job. Review the verified demand cluster and Search Console query/page pairs first, then add provider evidence to identify retrieval functions or qualifiers. This order prevents a handful of interesting model outputs from overriding actual market and site evidence.",
        "Write the gap as a falsifiable statement: “The GEO canonical does not show how a team maps a volatile claim to a dated primary source.” The intervention follows naturally: add a claim-ledger workflow and worked example. “Add more GEO keywords” is neither falsifiable nor editorially useful.",
        "Choose one intervention and one primary signal. Internal-link work should be evaluated first through discovery and relevant exposure. Evidence and answer improvements may be evaluated through query fit, bounded citation observations and engagement. Product CTAs require actual downstream events before they are called installations or activations.",
      ],
      limits: [
        "Convergence raises confidence without proving causality. If demand, Search Console exposure and provider observations all reveal the same missing constraint, the case to improve the canonical is strong. A later traffic movement can still have multiple causes, including broader demand, crawling, competition and product changes.",
        "The data also cannot decide truth. A frequent query may rest on a false premise, and a cited source may be weak. Editorial research must verify claims against the strongest appropriate source and preserve disagreements or uncertainty.",
      ],
    },
    extraSections: [
      {
        id: "evidence-to-decision-matrix",
        heading: "Match each evidence family to a decision",
        paragraphs: [
          "The right metric is the one whose collection process matches the question. This matrix prevents a convenient dataset from becoming the answer to every problem.",
        ],
        table: {
          headers: [
            "Decision",
            "Primary evidence",
            "Useful secondary evidence",
            "Do not substitute",
          ],
          rows: [
            [
              "Choose a canonical",
              "Verified demand + intent analysis",
              "Current query/page exposure",
              "Model-estimated fan-out alone",
            ],
            [
              "Find retrieval gaps",
              "Observed provider queries",
              "Controlled estimates and source review",
              "Google volume as provider frequency",
            ],
            [
              "Diagnose Google discovery",
              "GSC page/query and index evidence",
              "Crawl and internal-link checks",
              "Manual assistant citation",
            ],
            [
              "Evaluate citation tests",
              "Versioned prompt/provider observations",
              "Source and passage inspection",
              "One screenshot as share of voice",
            ],
            [
              "Report installations",
              "Verified store or product event",
              "Install-page visits and downloads",
              "GitHub download as an install",
            ],
          ],
        },
      },
      {
        id: "research-memo",
        heading: "Write a one-page evidence memo before publishing",
        paragraphs: [
          "The memo is a compact audit trail. It makes the reasoning reviewable and stops a later editor from turning a cautious observation into an unsupported marketing claim.",
        ],
        bullets: [
          "Decision: improve, hold, consolidate, create or reject.",
          "Canonical and reader job: the one page and stable intent in scope.",
          "Evidence: source, unit, market or interface, date window and collection version.",
          "Gap: the missing question, comparison, source, workflow or limitation.",
          "Intervention: exact sections and claims to change.",
          "Primary signal and guardrail: what would support the hypothesis and what must not degrade.",
          "Earliest review date: enough time for crawling, exposure or product data to arrive.",
        ],
      },
    ],
  },
  "observed-vs-estimated-ai-queries": {
    readMinutes: 11,
    keyTakeaways: [
      "Evidence class comes from how the string was obtained, not from the words in the string.",
      "Observed means an explicit supported interface event; estimated means a documented model experiment requested by the user.",
      "Unknown is a valid state when an interface is silent or an adapter fails closed; it must not be converted into zero.",
      "Provenance labels must survive deduplication, aggregation, export and use in an editorial brief.",
    ],
    paragraphAdditions: {
      "observed-queries": [
        "The observation contract should name what makes an event eligible. A search-specific UI component or structured transport event can provide an explicit query field. Generic text inside the conversation, source titles and arbitrary fields named query do not qualify merely because they contain search-like words.",
        "An observed label supports a narrow claim: this provider surface exposed this string at this time under this adapter contract. It does not prove the complete retrieval plan, the user's original wording, the source selected because of the query or a stable provider preference.",
        "Versioning turns failure into evidence. When the interface changes, fixture and live checks determine whether the semantic boundary still holds. If not, the adapter stops collecting and marks the period unsupported instead of broadening its selector until data reappears.",
      ],
      "estimated-queries": [
        "A useful estimator declares the target and method. Open Queries asks the named provider model for a bounded set of plausible adjacent searches under a versioned minimal prompt. When native token log probabilities are available, they provide within-run likelihood evidence. Otherwise repeated provider-native samples provide inclusion frequency and uncertainty.",
        "Neither method recreates a hidden production trace. The prompt is an experimental condition, model versions drift and product retrieval can use undisclosed context or systems. Estimates are best used to plan research, diversify a test set and identify candidate qualifiers.",
        "The estimate should be generated only on explicit request and kept in a separate storage and reporting contract. A user can compare it with observations, but aggregation must not silently count it as provider activity.",
      ],
      "evidence-table": [
        "Provenance also defines the denominator. An observed count is the number of eligible captured events in a window. An estimated frequency is the number of model samples containing a candidate. Google Ads volume is a monthly market estimate. Search Console impressions are recorded site appearances. Identical numerals do not make those units comparable.",
        "Safe dashboards keep class, provider, method version and time window visible. If a summary number cannot be explained from those fields, it is too compressed to drive an editorial decision.",
      ],
      example: [
        "Suppose the string “AI search optimization workflow” appears three times: once in ChatGPT Search, in nine of sixteen Claude estimation samples and with monthly Google Ads volume in a verified export. The correct record has three provenance rows. It does not have a synthetic score that adds 1 + 9 + volume.",
        "An editor can still use the convergence. The human-demand estimate supports prioritization, the observation supports retrieval relevance and the estimate suggests that the phrasing is plausible under another bounded context. Research then verifies what a genuinely useful workflow must contain before the canonical is changed.",
      ],
      "storage-boundary": [
        "Data boundaries should be enforceable in code. Event schemas use different discriminants for observed and estimated rows; queries cannot be reclassified by a reporting view; and migrations preserve old provenance. Tests should reject estimated rows inserted into the observed-event path.",
        "The same discipline applies to growth reporting. Store installations require a verified install event. GitHub downloads, D1 activity, Search Console clicks and assistant referrals remain separately named signals. Precision at the query layer is undermined if the business layer uses convenient euphemisms.",
      ],
    },
    extraSections: [
      {
        id: "provenance-ledger-example",
        heading: "Use a provenance ledger that survives aggregation",
        paragraphs: [
          "The ledger records enough context for a future reviewer to reproduce the interpretation. A normalized-query column can group matching strings without deleting their original evidence rows.",
        ],
        table: {
          headers: ["Record", "Minimum context", "Safe downstream use"],
          rows: [
            [
              "Observed event",
              "Provider, surface, query, time, adapter version",
              "Retrieval-language review for the captured sample",
            ],
            [
              "Estimated candidate",
              "Provider model, method, template version, samples or token evidence",
              "Research ideation and bounded candidate ranking",
            ],
            [
              "Demand export",
              "Market, language, network, period, export ID",
              "Human Google-demand prioritization",
            ],
            [
              "GSC row",
              "Property, query, page, date window, search type",
              "Actual recorded Google site exposure",
            ],
          ],
        },
      },
      {
        id: "evidence-review-rules",
        heading: "Apply five rules when evidence moves into content",
        paragraphs: [
          "A provenance-safe database is not enough if an editorial brief strips all of the qualifiers. These rules keep the published claim no stronger than the underlying record.",
          "The reviewer should be able to walk backward from a sentence on the public page to the primary source that establishes the fact and separately to the query evidence that motivated the research. The source supports truth; the query record explains prioritization. Combining those roles makes a private trace appear authoritative and hides whether the factual claim was ever verified.",
          "The forward path matters too. When a paragraph changes, the decision log records the owning canonical, changed claim, release date, expected observable signal and earliest review date. A later movement can then be evaluated against the exact intervention without pretending that production search offers controlled experimental conditions.",
        ],
        bullets: [
          "Quote or paraphrase a provider behavior only as broadly as its official documentation or dated interface evidence permits.",
          "Use an observed query as a clue to investigate, not as the public authority for a factual claim.",
          "Use estimates to diversify research and tests, never to claim production demand or provider frequency.",
          "Keep missing evidence unknown; explain coverage gaps instead of backfilling them with assumptions.",
          "Attach the final claim to the strongest primary source, while retaining the query evidence in the private decision log.",
        ],
      },
    ],
  },
  "estimating-fan-out-queries-with-log-probabilities": {
    readMinutes: 18,
    keyTakeaways: [
      "The estimator targets plausible adjacent queries under a fixed provider experiment—not a reconstruction of hidden production retrieval.",
      "When native output-token log probabilities exist, token-average log likelihood yields within-run inverse-perplexity evidence.",
      "When they do not, repeated provider-native samples estimate inclusion frequency with a Wilson interval.",
      "UTF-8 byte alignment, failure thresholds, method versioning and strict separation from observations make the proxy auditable.",
    ],
    paragraphAdditions: {
      estimand: [
        "Narrowing the estimand is the most important methodological choice. “What did the production assistant secretly search?” is not identifiable from a public closed-model endpoint. “Which other queries are plausible under this documented generation experiment?” is answerable and useful, provided the output remains labeled as a proxy.",
        "The fixed output size makes candidates comparable within the experiment, while the minimal prompt reduces researcher-imposed categories. It does not remove prompt dependence. Provider, model, temperature or sampling controls, prompt version and output schema therefore travel with every result.",
      ],
      "provider-match": [
        "Cross-model judging introduces an extra latent variable. If Model A generates a query and Model B scores it, the score describes Model B's conditional preferences. A provider-native method keeps generation and evidence under the same model family and removes that particular mismatch, though it does not eliminate model drift or calibration differences.",
        "A provider-native score is still not comparable across providers by magnitude. Tokenizers split strings differently, endpoint implementations expose different probability information and probability calibration varies. Use the scores to order candidates inside the declared run, not to claim that 0.82 from one model is stronger than 0.74 from another.",
      ],
      "inverse-perplexity": [
        "Token averaging controls for the simple fact that longer strings contain more token log probabilities. Summing would systematically penalize length. Character averaging would impose a second weighting unrelated to the model's tokenization. The chosen statistic is therefore the arithmetic mean over eligible output tokens that overlap the serialized query content.",
        "Inverse perplexity is a monotonic transformation of the mean log likelihood. It is easier to read because larger is better and the result lies at or below one, but the interpretation remains conditional: lower surprisal for this realized candidate under this provider response and prompt context.",
        "Do not present it as a calibrated probability that the production system would issue the exact query. The candidate appeared in a structured multi-item output whose items interact through decoding; the endpoint may not mirror the search product; and only one bounded response is being scored.",
      ],
      "utf8-alignment": [
        "The serialized JSON matters because providers return token evidence for output bytes, not for semantic string objects. Escaped quotes, backslashes, emoji and non-Latin scripts can make JavaScript code-unit offsets diverge from UTF-8 byte offsets. Alignment must therefore happen against the exact serialized response.",
        "Property names, commas and quotation marks are excluded from candidate scoring. Tokens whose byte spans overlap the string content are included once. The implementation should retain enough diagnostic metadata to reproduce why a token was included without storing unrelated prompt or response content.",
        "Failure is preferable to a hidden fallback. If alignment cannot produce finite native evidence for enough candidates, the method returns an explicit error. Output order, a second model judge or hand-written weights would change the estimand and must not be substituted silently.",
      ],
      sampling: [
        "Repeated sampling turns candidate inclusion into a Bernoulli event per valid structured output. Normalization should merge trivial case or whitespace differences while avoiding semantic stemming that could combine distinct queries. A candidate counts at most once per sample even if the model repeats it inside that output.",
        "Sixteen requested samples balance latency and an initial uncertainty estimate, while the minimum-valid threshold exposes provider or parsing failures. With a small n, intervals remain wide; that is information, not a defect to hide. A candidate seen in 8 of 16 runs is less certain than a large-scale estimate, and the Wilson interval makes that limitation visible.",
        "Sampling outputs can be ranked by inclusion count, with deterministic tie-breaking defined in the method. They remain provider-experiment frequencies. Increasing n narrows sampling uncertainty but does not solve prompt dependence or production mismatch.",
      ],
      "proxy-limits": [
        "A useful application is research triage. Candidates with strong within-run evidence can seed primary-source searches, reveal a missing comparison axis or diversify a manual prompt panel. The editor then validates the underlying question and publishes only sourced answers.",
        "A dangerous application is synthetic market sizing. Model likelihood and inclusion frequency are not monthly searches, user frequency or expected traffic. They should never be multiplied by conversion rates or blended with Google Ads volume as if the units matched.",
        "Reproducibility is bounded by provider access and model versions. Store the response method, model identifier, prompt hash or version, timestamp, valid-candidate count and token/sample diagnostics. A rerun after a model update is a new experiment, not a continuation that can be compared without qualification.",
      ],
    },
    extraSections: [
      {
        id: "worked-logprob-example",
        heading: "Worked example: score one candidate without overstating it",
        paragraphs: [
          "Suppose the serialized candidate “AI search visibility workflow” overlaps four output tokens with log probabilities −0.20, −0.45, −0.35 and −0.60. The mean log likelihood is −0.40, so inverse perplexity is exp(−0.40), approximately 0.6703.",
          "The correct interpretation is that this realized candidate had an average per-token likelihood corresponding to 0.6703 under the model, prompt and surrounding output in that run. A second candidate with 0.74 ranks higher within the same run. Neither value is a 67% or 74% probability of a production search.",
        ],
        equations: [
          "ℓ̄(q) = (−0.20 − 0.45 − 0.35 − 0.60) / 4 = −0.40",
          "s(q) = exp(−0.40) ≈ 0.6703",
        ],
      },
      {
        id: "reproducibility-checklist",
        heading: "Publish enough metadata to reproduce the proxy",
        paragraphs: [
          "A mathematical formula without an execution contract is not reproducible. The implementation and response should expose the choices that can change candidate generation, alignment or ranking.",
        ],
        bullets: [
          "Provider and exact model identifier returned or configured for the run.",
          "Prompt/template version and structured output schema version.",
          "Sampling controls, requested candidate count and normalization rules.",
          "Native log-probability availability and the byte-alignment method used.",
          "Valid and omitted candidate counts with explicit failure thresholds.",
          "For repeated sampling: requested calls, valid calls, inclusion count and Wilson interval.",
          "Timestamp and a warning that cross-model and cross-version score magnitudes are not calibrated.",
        ],
      },
    ],
  },
};
