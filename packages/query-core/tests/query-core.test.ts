import assert from "node:assert/strict";
import test from "node:test";

import {
  inversePerplexity,
  nativeInversePerplexityScore,
  normalizeQuery,
  rankNativeFanOuts,
  uniqueQueries,
  wilsonInterval95,
} from "../src/index";

test("normalizes query typography without rewriting meaning", () => {
  assert.equal(
    normalizeQuery("  What   is “fan-out” search?  "),
    'What is "fan-out" search?',
  );
});

test("deduplicates and ranks inverse-perplexity candidates", () => {
  assert.deepEqual(uniqueQueries(["Query A", " query a ", "Query B"]), [
    "Query A",
    "Query B",
  ]);
  assert.equal(Number(inversePerplexity(-0.2).toFixed(4)), 0.8187);
  const ranked = rankNativeFanOuts([
    { query: "second", meanTokenLogProbability: -1, tokenCount: 2 },
    { query: "first", meanTokenLogProbability: -0.1, tokenCount: 3 },
  ]);
  assert.equal(ranked[0]?.query, "first");
  assert.equal(ranked[0]?.rank, 1);
  assert.equal(ranked[0]?.score.kind, "native_inverse_perplexity");
});

test("does not rewrite or heuristically block valid query syntax", () => {
  assert.deepEqual(
    uniqueQueries([
      "Chrome side panel API manifest v3 2026",
      "site:developer.chrome.com sidePanel API",
    ]),
    [
      "Chrome side panel API manifest v3 2026",
      "site:developer.chrome.com sidePanel API",
    ],
  );
});

test("computes token-normalized perplexity and a Wilson interval", () => {
  const score = nativeInversePerplexityScore(-0.5, 4);
  assert.equal(Number(score.value.toFixed(4)), 0.6065);
  assert.equal(Number(score.perplexity.toFixed(4)), 1.6487);
  assert.equal(score.tokenCount, 4);
  const interval = wilsonInterval95(8, 16);
  assert.equal(Number(interval.lower.toFixed(4)), 0.28);
  assert.equal(Number(interval.upper.toFixed(4)), 0.72);
});
