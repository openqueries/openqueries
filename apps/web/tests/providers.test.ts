import assert from "node:assert/strict";
import test from "node:test";

import {
  parseAnthropicPlanner,
  parseGeminiPlanner,
  parseOpenAIPlanner,
  parseOpenAIScorer,
} from "../worker/providers";

test("parses OpenAI provider-matched query candidates", () => {
  assert.deepEqual(
    parseOpenAIPlanner({
      output: [
        {
          type: "function_call",
          name: "propose_search_queries",
          arguments: JSON.stringify({
            queries: ["first query", "second query"],
          }),
        },
      ],
    }),
    ["first query", "second query"],
  );
});

test("parses Anthropic tool-use candidates", () => {
  assert.deepEqual(
    parseAnthropicPlanner({
      content: [
        {
          type: "tool_use",
          name: "propose_search_queries",
          input: { queries: ["one", "two"] },
        },
      ],
    }),
    ["one", "two"],
  );
});

test("parses Gemini structured candidates", () => {
  assert.deepEqual(
    parseGeminiPlanner({
      candidates: [
        {
          content: {
            parts: [
              {
                text: JSON.stringify({
                  queries: [{ query: "alpha" }, { query: "beta" }],
                }),
              },
            ],
          },
        },
      ],
    }),
    ["alpha", "beta"],
  );
});

test("parses OpenAI structured scorer output", () => {
  assert.deepEqual(
    parseOpenAIScorer({
      output: [
        {
          content: [
            {
              type: "output_text",
              text: JSON.stringify({ queries: ["ranked one", "ranked two"] }),
              logprobs: [],
            },
          ],
        },
      ],
    }),
    ["ranked one", "ranked two"],
  );
});
