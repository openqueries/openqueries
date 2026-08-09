import type { Metadata } from "next";

import { EditorialPage } from "../components";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  path: "/methodology",
  title: "Methodology",
  description:
    "How Open Queries extracts, labels, scores, stores and aggregates AI web-search queries.",
});

export default function MethodologyPage() {
  return (
    <EditorialPage
      eyebrow="Methodology · Version 1.0"
      title="Evidence before inference."
      intro="Open Queries is designed to show useful retrieval signals without implying access to hidden reasoning or collecting the conversations around them."
    >
      <section>
        <h2>1. Eligible observations</h2>
        <p>
          An observation is accepted only when a provider adapter finds a query
          inside an explicitly search-scoped interface element. Eligible source
          kinds are observed model searches, observed expanded queries and the
          disclosed Google Search seed exception.
        </p>
        <div className="method-table">
          <div>
            <strong>Observed model search</strong>
            <span>
              A search string surfaced by ChatGPT or Claude tool activity.
            </span>
          </div>
          <div>
            <strong>Observed expanded query</strong>
            <span>
              A fan-out or query expansion visibly exposed by the provider UI.
            </span>
          </div>
          <div>
            <strong>Google user search</strong>
            <span>
              The query in Google Search, treated as a narrow and explicit
              exception.
            </span>
          </div>
        </div>
      </section>
      <section>
        <h2>2. Excluded context</h2>
        <p>
          Adapters do not read generic message containers. Chat messages,
          conversation titles, account identity, chat URLs and conversation IDs
          are absent from the shared schema and rejected if added as extra
          fields.
        </p>
        <p>
          If a provider changes its DOM so the explicit search boundary is no
          longer recognizable, the adapter should stop collecting and report
          that it may be outdated.
        </p>
      </section>
      <section>
        <h2>3. Fan-out estimation</h2>
        <p>
          Estimation runs only after the user requests it. A low-cost model from
          the corresponding provider proposes a bounded candidate list. A shared
          low-cost scorer returns the same candidates in likelihood order with
          token log probabilities.
        </p>
        <div className="formula">
          <code>likelihood score = exp(mean token log probability)</code>
          <span>
            The value ranks candidates within one model run. It is not search
            volume and does not prove that the original assistant issued the
            query.
          </span>
        </div>
      </section>
      <section>
        <h2>4. Donation and aggregation</h2>
        <p>
          Donation is presented as a default-on choice during first-run
          onboarding and can be disabled before continuing or later in Settings.
          Sensitive-pattern filters run in the browser and again at the Worker
          boundary.
        </p>
        <p>
          Raw events expire after 13 months. Durable daily aggregates are
          created only when a normalized query is present across at least five
          distinct anonymous donor tags. Estimated fan-outs never enter
          observed-query aggregates.
        </p>
      </section>
      <section>
        <h2>5. Known limits</h2>
        <ul>
          <li>Visible tool activity may be incomplete.</li>
          <li>Provider UI changes can temporarily break an adapter.</li>
          <li>Likelihood scores are model-dependent and non-deterministic.</li>
          <li>
            Observed query frequency is not representative population search
            volume.
          </li>
          <li>The initial public website does not publish a query explorer.</li>
        </ul>
      </section>
    </EditorialPage>
  );
}
