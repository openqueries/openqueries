import assert from "node:assert/strict";
import test from "node:test";

import {
  inversePerplexity,
  nativeInversePerplexityScore,
  normalizeQuery,
  querySafety,
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

test("blocks common secrets and direct identifiers before transfer", () => {
  assert.equal(querySafety("find jane@example.com").reason, "email");
  assert.equal(
    querySafety(`use token sk-${"abcdefghijklmnopqrstuvwxyz123456"}`).reason,
    "secret",
  );
  assert.equal(querySafety("call +49 151 23456789").reason, "phone");
  assert.equal(querySafety("cloudflare d1 aggregate query").safe, true);
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

test("computes token-normalized perplexity and a Wilson interval", () => {
  const score = nativeInversePerplexityScore(-0.5, 4);
  assert.equal(Number(score.value.toFixed(4)), 0.6065);
  assert.equal(Number(score.perplexity.toFixed(4)), 1.6487);
  assert.equal(score.tokenCount, 4);
  const interval = wilsonInterval95(8, 16);
  assert.equal(Number(interval.lower.toFixed(4)), 0.28);
  assert.equal(Number(interval.upper.toFixed(4)), 0.72);
});
