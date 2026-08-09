import type { Metadata } from "next";
import Link from "next/link";

import { EditorialPage } from "../components";
import { DisplayMath, InlineMath } from "../math";
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
      eyebrow="Methodology · fanout-v2.1.0"
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
          For a seed query <InlineMath>x</InlineMath>, provider model{" "}
          <InlineMath>m</InlineMath> and minimal versioned prompt{" "}
          <InlineMath>p_v</InlineMath>, the model produces one structured vector
          of exactly 12 candidate queries:
        </p>
        <div className="formula">
          <DisplayMath>{String.raw`Y=(q_1,\ldots,q_{12})\sim P_m(\,\cdot\mid x,p_v\,)`}</DisplayMath>
          <span>
            The prompt asks only for the most likely other web-search queries
            from the same fan-out as the observed query. It contains no domain,
            operator, language, category, rationale, scoring or ranking rules.
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
          output that contains the candidates. For a query{" "}
          <InlineMath>q</InlineMath>, let <InlineMath>T(q)</InlineMath> be the
          set of output tokens whose UTF-8 byte interval overlaps that query’s
          JSON string content. Every token is included once; token length does
          not create extra weight.
        </p>
        <div className="formula stack">
          <DisplayMath>{String.raw`\bar{\ell}(q)=\frac{1}{|T(q)|}\sum_{t_k\in T(q)}\log P_m(t_k\mid t_{<k},x,p_v)`}</DisplayMath>
          <DisplayMath>{String.raw`\operatorname{PP}(q)=\exp\!\left(-\bar{\ell}(q)\right)`}</DisplayMath>
          <DisplayMath>{String.raw`s(q)=\operatorname{PP}(q)^{-1}=\exp\!\left(\bar{\ell}(q)\right)`}</DisplayMath>
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
          The current Anthropic endpoint does not return output token logprobs
          for Claude. The configured Gemini 3.1 Flash-Lite Developer API
          endpoint rejects <code>responseLogprobs</code>. These are measured
          endpoint capabilities, not assumptions about every historic model or
          SDK. Open Queries therefore reports a different provider-native
          estimator instead of silently using GPT. Each provider model receives
          the same versioned prompt in 16 independent structured-output calls.
          At least 12 must succeed. Parallel transport changes wall-clock time,
          not the number or statistical independence of those model calls.
        </p>
        <div className="formula stack">
          <DisplayMath>{String.raw`K(q)=\sum_{i=1}^{n}\mathbf{1}\!\left[q\in Y_i\right]`}</DisplayMath>
          <DisplayMath>{String.raw`\hat p(q)=\frac{K(q)}{n}`}</DisplayMath>
          <DisplayMath>{String.raw`\operatorname{CI}_{95}(q)=\frac{\hat p+\frac{z^2}{2n}\;\pm\;z\sqrt{\frac{\hat p(1-\hat p)}{n}+\frac{z^2}{4n^2}}}{1+\frac{z^2}{n}},\qquad z=1.95996`}</DisplayMath>
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
        <h2>5. Provenance and retention</h2>
        <p>
          Every estimate carries its provider model, method and prompt version.
          The side panel leads with ordinal rank and keeps the mathematical
          evidence behind an expandable detail control. It never formats these
          values as demand percentages.
        </p>
        <p>
          Query contribution starts off and is controllable during onboarding
          and in Settings. While enabled, every eligible observed query is
          automatically contributed, whether or not its fan-outs are requested.
          Fan-out estimation is available only while that contribution is
          enabled. Raw events expire after 13 months. Estimated fan-outs are
          returned to the extension and never stored as observed queries.
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
