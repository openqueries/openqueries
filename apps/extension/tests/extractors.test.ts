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

test("extracts the current Claude disabled result row from an assistant web-search block", () => {
  const dom = new JSDOM(
    `
    <main>
      <article>
        <h2>You said: private medical question</h2>
        <button disabled aria-disabled="true">
          <div>must not be captured</div><p>1 result</p>
        </button>
      </article>
      <article>
        <h2>Claude responded: researched answer</h2>
        <button>Searched the web</button>
      </article>
      <div class="transition-colors rounded-lg duration-150">
        <button disabled aria-disabled="true" tabindex="-1">
          <div><div class="text-body text-text-500 text-left truncate w-0 flex-grow">Kolostrum aufbewahren Kühlschrank Gefrierschrank Dauer</div></div>
          <div><p>8 results</p></div>
        </button>
      </div>
    </main>
  `,
    { url: "https://claude.ai/chat/secret-id" },
  );
  assert.deepEqual(
    extractAssistantQueries(dom.window.document, "claude").map(
      (item) => item.query,
    ),
    ["Kolostrum aufbewahren Kühlschrank Gefrierschrank Dauer"],
  );
});

test("extracts current ChatGPT query chips but never source domains or messages", () => {
  const dom = new JSDOM(
    `
    <main>
      <article data-message-author-role="user">private acquisition target question</article>
      <section>
        <div>Searching 22 websites</div>
        <div class="search-queries">
          <div><svg width="12" height="12"></svg><span>sterile colostrum collection syringe guidance</span></div>
          <div><svg width="12" height="12"></svg><span>antenatal hand expression storage recommendations</span></div>
        </div>
        <div><a href="https://www.nth.nhs.uk/">www.nth.nhs.uk</a></div>
      </section>
    </main>
  `,
    { url: "https://chatgpt.com/c/secret-id" },
  );
  assert.deepEqual(
    extractAssistantQueries(dom.window.document, "chatgpt").map(
      (item) => item.query,
    ),
    [
      "sterile colostrum collection syringe guidance",
      "antenatal hand expression storage recommendations",
    ],
  );
});

test("does not invent a ChatGPT query when the UI exposes only searched websites", () => {
  const dom = new JSDOM(
    `
    <main>
      <article data-message-author-role="user">private question</article>
      <section>
        <div>Searching 22 websites</div>
        <div class="search-queries"></div>
        <a href="https://www.nth.nhs.uk/">www.nth.nhs.uk</a>
      </section>
    </main>
  `,
    { url: "https://chatgpt.com/c/secret-id" },
  );
  assert.deepEqual(extractAssistantQueries(dom.window.document, "chatgpt"), []);
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
