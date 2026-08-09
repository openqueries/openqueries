import type { Metadata } from "next";
import Link from "next/link";

import { EditorialPage } from "../components";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  path: "/methodology",
  title: "Methodology",
  description:
    "The provider-native statistical method Open Queries uses to observe and estimate AI search fan-out queries.",
});

export default function MethodologyPage() {
  return (
    <EditorialPage
      eyebrow="Methodology · fanout-v2.0.0"
      title="Measure what the provider actually exposes."
      intro="Open Queries separates direct UI observations from probabilistic reconstructions. It never routes every provider through one GPT ranker. A score is not search volume."
    >
      <section>
        <h2>1. Observation boundary</h2>
        <p>
          An observed query enters the local trace only when a provider adapter
          finds it inside an explicitly search-scoped interface element. Generic
          message containers are ineligible. Chat messages, titles, account
          identity, conversation URLs and conversation IDs do not exist in the
          event schema.
        </p>
        <div className="method-table">
          <div>
            <strong>observed_model_search</strong>
            <span>A search string surfaced by ChatGPT or Claude tool UI.</span>
          </div>
          <div>
            <strong>observed_expanded_query</strong>
            <span>A query expansion explicitly exposed by the provider.</span>
          </div>
          <div>
            <strong>google_user_search</strong>
            <span>The disclosed Google Search seed-query exception.</span>
          </div>
        </div>
        <p>
          If an adapter can no longer recognize that boundary, it fails closed.
          Estimation is a separate user-triggered action and never mutates an
          observed event into an estimate.
        </p>
      </section>

      <section>
        <h2>2. Controlled generation experiment</h2>
        <p>
          For a seed query <i>x</i>, provider model <i>m</i>, prompt <i>p</i>{" "}
          and prompt version <i>v</i>, the model produces one structured vector
          of exactly 12 candidate queries:
        </p>
        <div className="formula">
          <code>Y = (q₁, …, q₁₂) ~ Pₘ(· | x, p, v)</code>
          <span>
            The prompt asks only for distinct web-search queries in the seed
            language. It contains no categories, rationales, scoring rubric or
            rank instructions.
          </span>
        </div>
        <p>
          Candidates are normalized with NFKC, whitespace normalization and
          exact case-folded deduplication. Unsafe strings are removed. No model
          is allowed to score another provider’s candidate set.
        </p>
      </section>

      <section>
        <h2>3. Native token log probabilities where exposed</h2>
        <p>
          GPT-5.6 Luna returns token log probabilities for the same structured
          output that contains the candidates. For a query <i>q</i>, let
          <i>T(q)</i> be the set of output tokens whose UTF-8 byte interval
          overlaps that query’s JSON string content. Every token is included
          once; token length does not create extra weight.
        </p>
        <div className="formula stack">
          <code>ℓ̄(q) = (1 / |T(q)|) Σₜ∈T(q) log Pₘ(t | t&lt;t, x, p, v)</code>
          <code>PP(q) = exp(−ℓ̄(q))</code>
          <code>s(q) = PP(q)⁻¹ = exp(ℓ̄(q))</code>
          <span>
            Lower perplexity implies greater compatibility with that provider’s
            own decoding distribution in this run. The API exposes the mean log
            probability, perplexity, inverse perplexity and token count.
          </span>
        </div>
        <p>
          The system fails closed if fewer than six candidates can be mapped to
          finite native token logprobs. It does not substitute another provider
          or an ordinal fallback. The inverse-perplexity score is a ranking
          statistic for one conditional generation—not an independent
          probability that the original assistant searched that query.
        </p>
      </section>

      <section>
        <h2>4. Google and Anthropic: empirical native sampling</h2>
        <p>
          Anthropic’s public API does not expose output token logprobs for
          Claude. Google’s current Gemini 3.1 Flash-Lite Developer API endpoint
          rejects <code>responseLogprobs</code> even though the field exists in
          the API schema. Open Queries therefore reports a different estimator
          instead of silently using GPT. Each provider model receives the same
          versioned prompt in 16 independent structured-output calls. At least
          12 must succeed.
        </p>
        <div className="formula stack">
          <code>K(q) = Σᵢ₌₁ⁿ 𝟙[q ∈ Yᵢ]</code>
          <code>p̂(q) = K(q) / n</code>
          <code>CI₉₅ = (p̂ + z²/2n ± z√(p̂(1−p̂)/n + z²/4n²)) / (1 + z²/n)</code>
          <span>
            Here z = 1.95996 and n is the number of valid samples from the named
            provider. Queries rank by inclusion frequency, then mean first
            position, then lexical order.
          </span>
        </div>
        <p>
          Exact normalized matches are counted once per sample. The score object
          exposes K, n and its Wilson 95% confidence interval, making the wider
          uncertainty at n ≤ 16 explicit.
        </p>
      </section>

      <section>
        <h2>5. Provenance and aggregation</h2>
        <p>
          Every estimate carries its provider model, method and prompt version.
          The side panel leads with ordinal rank and keeps the mathematical
          evidence behind an expandable detail control. It never formats these
          values as demand percentages.
        </p>
        <p>
          Donation is controllable during onboarding and in Settings. Raw events
          expire after 13 months. Durable daily aggregates require at least five
          distinct anonymous donor tags. Estimated fan-outs never enter
          observed-query aggregates.
        </p>
      </section>

      <section>
        <h2>6. Limits and interpretation</h2>
        <ul>
          <li>Visible tool activity can be incomplete.</li>
          <li>Provider UI changes can temporarily disable an adapter.</li>
          <li>
            Generation and sampling are stochastic and model-version specific.
          </li>
          <li>
            Tokenization makes scores comparable mainly within a provider run.
          </li>
          <li>
            Empirical Gemini and Claude intervals are deliberately wide at 12–16
            samples.
          </li>
          <li>Observed query frequency is not population search volume.</li>
        </ul>
        <p>
          For assumptions, derivations and alternatives, read the technical
          note:{" "}
          <Link href="/learn/estimating-fan-out-queries-with-log-probabilities">
            Estimating fan-out queries with log probabilities
          </Link>
          .
        </p>
      </section>
    </EditorialPage>
  );
}
