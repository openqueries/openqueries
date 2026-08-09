import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  rankEmpiricalSamples,
  scoreQueriesFromTokenLogProbabilities,
} from "../worker/providers";

test("maps UTF-8 token log-probabilities to each query exactly once", () => {
  const raw = JSON.stringify({ queries: ["café tools", "other query"] });
  const tokens = [...raw].map((token, index) => ({
    token,
    logprob: index === raw.indexOf("c") ? -0.1 : -0.5,
  }));
  const scores = scoreQueriesFromTokenLogProbabilities(
    raw,
    ["café tools", "other query"],
    tokens,
  );
  assert.equal(scores.length, 2);
  assert.equal(scores[0]?.tokenCount, 10);
  assert.ok(Number.isFinite(scores[0]?.meanTokenLogProbability));
});

test("uses provider token bytes without character weighting", () => {
  const raw = '{"queries":["alpha beta"]}';
  const tokens = [
    { token: '{"queries":["', logprob: -1 },
    { token: "alpha", logprob: -0.1 },
    { token: " beta", logprob: -0.3 },
    { token: '"]}', logprob: -2 },
  ];
  const [score] = scoreQueriesFromTokenLogProbabilities(
    raw,
    ["alpha beta"],
    tokens,
  );
  assert.equal(score?.tokenCount, 2);
  assert.equal(Number(score?.meanTokenLogProbability.toFixed(4)), -0.2);
});

test("ranks Claude by empirical inclusion frequency with Wilson evidence", () => {
  const samples = Array.from({ length: 16 }, (_, index) =>
    index < 12 ? ["common", `tail ${index}`] : ["rare", `tail ${index}`],
  );
  const ranked = rankEmpiricalSamples(samples);
  assert.equal(ranked[0]?.query, "common");
  assert.deepEqual(ranked[0]?.score.kind, "empirical_inclusion_frequency");
  if (ranked[0]?.score.kind === "empirical_inclusion_frequency") {
    assert.equal(ranked[0].score.occurrences, 12);
    assert.equal(ranked[0].score.sampleCount, 16);
    assert.ok(ranked[0].score.confidence95.lower < 0.75);
    assert.ok(ranked[0].score.confidence95.upper > 0.75);
  }
});

test("Claude ties use mean first position then lexical order", () => {
  const ranked = rankEmpiricalSamples([
    ["zeta", "alpha"],
    ["zeta", "alpha"],
    ["beta"],
  ]);
  assert.deepEqual(
    ranked.slice(0, 3).map((item) => item.query),
    ["zeta", "alpha", "beta"],
  );
});

test("contains no cross-provider scorer or ordinal fallback", () => {
  const source = readFileSync(
    new URL("../worker/providers.ts", import.meta.url),
    "utf8",
  );
  assert.doesNotMatch(source, /scoreWithOpenAI|openai-scorer/u);
  assert.match(source, /provider_native_sampling/u);
  assert.match(source, /provider_native_logprobs/u);
});
