import assert from "node:assert/strict";
import test from "node:test";

import {
  extractSearchQueriesFromPayload,
  extractSearchQueriesFromTransport,
} from "../lib/provider-stream";

test("extracts ChatGPT search_queries metadata without reading message text", () => {
  const payload = {
    message: {
      author: { role: "assistant", name: "web.run" },
      content: {
        parts: [
          "Private chat text that must never enter the Open Queries contract",
        ],
      },
      metadata: {
        search_queries: [
          "sterile colostrum collection syringe guidance",
          "antenatal hand expression storage recommendations",
        ],
      },
    },
  };
  assert.deepEqual(extractSearchQueriesFromPayload(payload), [
    "sterile colostrum collection syringe guidance",
    "antenatal hand expression storage recommendations",
  ]);
  assert.doesNotMatch(
    JSON.stringify(extractSearchQueriesFromPayload(payload)),
    /Private chat text/u,
  );
});

test("extracts search-tool queries from SSE frames and deduplicates them", () => {
  const stream = [
    `data: ${JSON.stringify({ type: "web_search", queries: ["OpenAI logprobs API", "Claude web search query"] })}`,
    `data: ${JSON.stringify({ message: { metadata: { search_queries: ["OpenAI logprobs API"] } } })}`,
    "data: [DONE]",
    "",
  ].join("\n\n");
  assert.deepEqual(extractSearchQueriesFromTransport(stream), [
    "OpenAI logprobs API",
    "Claude web search query",
  ]);
});

test("extracts structured entries from an explicit search_queries array", () => {
  assert.deepEqual(
    extractSearchQueriesFromPayload({
      metadata: {
        search_queries: [
          {
            type: "computer_initialize_state",
            q: ["Chrome side panel API documentation"],
          },
        ],
      },
    }),
    ["Chrome side panel API documentation"],
  );
});

test("ignores generic query fields and ordinary chat content", () => {
  assert.deepEqual(
    extractSearchQueriesFromPayload({
      type: "message",
      query: "private user prompt",
      content: { parts: ["another private sentence"] },
    }),
    [],
  );
});
