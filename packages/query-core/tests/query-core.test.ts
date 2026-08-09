import assert from "node:assert/strict";
import test from "node:test";

import {
  inversePerplexity,
  normalizeQuery,
  querySafety,
  rankFanOuts,
  uniqueQueries,
} from "../src/index";

test("normalizes query typography without rewriting meaning", () => {
  assert.equal(
    normalizeQuery("  What   is “fan-out” search?  "),
    'What is "fan-out" search?',
  );
});

test("blocks common secrets and direct identifiers before donation", () => {
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
  const ranked = rankFanOuts([
    { query: "second", meanLogProbability: -1 },
    { query: "first", meanLogProbability: -0.1 },
  ]);
  assert.equal(ranked[0]?.query, "first");
  assert.equal(ranked[0]?.rank, 1);
});
