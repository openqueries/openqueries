import assert from "node:assert/strict";
import test from "node:test";

import {
  extractSearchQueriesFromPayload,
  extractSearchQueriesFromTransport,
  takeCompleteSseFrames,
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

test("emits complete SSE frames without waiting for the stream to close", () => {
  const event = `data: ${JSON.stringify({ message: { metadata: { search_queries: ["site:developer.chrome.com sidePanel API"] } } })}`;
  const chunk = takeCompleteSseFrames(`${event}\r\n\r\ndata: {\"partial\"`);
  assert.deepEqual(chunk.frames, [event]);
  assert.equal(chunk.remainder, 'data: {"partial"');
  assert.deepEqual(extractSearchQueriesFromTransport(chunk.frames[0] ?? ""), [
    "site:developer.chrome.com sidePanel API",
  ]);
});

test("reassembles Anthropic web-search tool input without reading message deltas", () => {
  const stream = [
    `data: ${JSON.stringify({ type: "content_block_start", index: 1, content_block: { type: "server_tool_use", name: "web_search", input: {} } })}`,
    `data: ${JSON.stringify({ type: "content_block_delta", index: 1, delta: { type: "input_json_delta", partial_json: '{"query":"official Chrome ' } })}`,
    `data: ${JSON.stringify({ type: "content_block_delta", index: 1, delta: { type: "input_json_delta", partial_json: 'sidePanel API documentation"}' } })}`,
    `data: ${JSON.stringify({ type: "content_block_stop", index: 1 })}`,
    `data: ${JSON.stringify({ type: "content_block_delta", index: 2, delta: { type: "text_delta", text: "private assistant response" } })}`,
    "",
  ].join("\n\n");
  assert.deepEqual(extractSearchQueriesFromTransport(stream), [
    "official Chrome sidePanel API documentation",
  ]);
  assert.doesNotMatch(
    JSON.stringify(extractSearchQueriesFromTransport(stream)),
    /private assistant response/u,
  );
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
