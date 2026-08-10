import assert from "node:assert/strict";
import test from "node:test";
import { JSDOM } from "jsdom";

import { extractGoogleQueries } from "../lib/extractors";

test("keeps the Google seed distinct from AI Overview fan-outs", () => {
  const dom = new JSDOM(
    `
    <main>
      <section data-ai-overview>
        <h2>AI Overview</h2>
        <a href="/search?q=best+expense+tools+for+startups">expanded</a>
      </section>
      <aside><a href="/search?q=unrelated+normal+result">not AI</a></aside>
    </main>
  `,
    { url: "https://www.google.com/search?q=expense+management+software" },
  );
  const queries = extractGoogleQueries(
    dom.window.document,
    dom.window.location,
  );
  assert.deepEqual(
    queries.map(({ query, sourceKind }) => [query, sourceKind]),
    [
      ["expense management software", "google_user_search"],
      ["best expense tools for startups", "observed_expanded_query"],
    ],
  );
});
