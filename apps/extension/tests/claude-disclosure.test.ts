import assert from "node:assert/strict";
import test from "node:test";
import { JSDOM } from "jsdom";

import { revealClaudeSearchDetails } from "../lib/claude-disclosure";
import { extractAssistantQueries } from "../lib/extractors";

test("reveals current Claude search details, extracts the query, then restores the disclosure", async () => {
  const dom = new JSDOM(
    `<main><button aria-expanded="false">Searched the web</button><section id="details"></section></main>`,
    { url: "https://claude.ai/chat/test" },
  );
  const button = dom.window.document.querySelector("button")!;
  const details = dom.window.document.querySelector("#details")!;
  button.addEventListener("click", () => {
    const open = button.getAttribute("aria-expanded") === "true";
    button.setAttribute("aria-expanded", String(!open));
    details.innerHTML = open
      ? ""
      : `<button disabled aria-disabled="true"><div class="truncate">Chrome sidePanel API documentation</div><p>7 results</p></button>`;
  });

  revealClaudeSearchDetails(dom.window.document);
  assert.equal(button.getAttribute("aria-expanded"), "true");
  assert.deepEqual(
    extractAssistantQueries(dom.window.document, "claude").map(
      (item) => item.query,
    ),
    ["Chrome sidePanel API documentation"],
  );
  await new Promise((resolve) => dom.window.setTimeout(resolve, 400));
  assert.equal(button.getAttribute("aria-expanded"), "false");
});
