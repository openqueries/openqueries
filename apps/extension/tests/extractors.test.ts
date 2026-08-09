import assert from "node:assert/strict";
import test from "node:test";
import { JSDOM } from "jsdom";

import {
  extractAssistantQueries,
  extractGoogleQueries,
} from "../lib/extractors";

test("extracts only explicitly scoped ChatGPT search queries", () => {
  const dom = new JSDOM(
    `
    <main>
      <article data-message-author-role="user">private acquisition target question</article>
      <section data-testid="web-search-tool">
        <span data-search-query="European acquisition filings 2026"></span>
        <a href="https://www.google.com/search?q=official+company+filings">result search</a>
      </section>
      <p data-query="must not escape">ordinary page content</p>
    </main>
  `,
    { url: "https://chatgpt.com/c/secret-id" },
  );
  const queries = extractAssistantQueries(dom.window.document, "chatgpt");
  assert.deepEqual(
    queries.map((item) => item.query),
    ["European acquisition filings 2026", "official company filings"],
  );
  assert.doesNotMatch(
    JSON.stringify(queries.map((item) => item.query)),
    /private acquisition target question/u,
  );
});

test("extracts Claude aria-labelled search tools without generic assistant text", () => {
  const dom = new JSDOM(
    `
    <article>
      <p>I searched for something, but this prose is not a tool.</p>
      <details data-testid="search-results"><span aria-label="Searched for: D1 prepared statements"></span></details>
    </article>
  `,
    { url: "https://claude.ai/chat/secret-id" },
  );
  assert.deepEqual(
    extractAssistantQueries(dom.window.document, "claude").map(
      (item) => item.query,
    ),
    ["D1 prepared statements"],
  );
});

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
