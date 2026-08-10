import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  anthropicStreamOutput,
  collectEmpiricalSamples,
  generationPrompt,
  parseServerSentEventData,
  rankEmpiricalSamples,
  scoreQueriesFromTokenLogProbabilities,
} from "../worker/providers";

test("uses a minimal fan-out reconstruction prompt without syntax heuristics", () => {
  const prompt = generationPrompt(
    "site:bfmed.org antenatal colostrum expression protocol pregnancy",
  );
  assert.match(prompt, /most likely other web-search queries/u);
  assert.match(prompt, /same query fan-out/u);
  assert.match(prompt, /<observed_query>/u);
  assert.doesNotMatch(
    prompt.slice(0, prompt.indexOf("<observed_query>")),
    /site:|domain|operator|ChatGPT|Claude|Google|seed's language/iu,
  );
});

test("reassembles Anthropic structured output from SSE", () => {
  const stream = [
    'event: message_start\ndata: {"type":"message_start","message":{"usage":{"input_tokens":21,"output_tokens":1}}}',
    'event: content_block_start\ndata: {"type":"content_block_start","content_block":{"type":"text","text":""}}',
    'event: content_block_delta\ndata: {"type":"content_block_delta","delta":{"type":"text_delta","text":"{\\"queries\\":[\\"alpha"}}',
    'event: content_block_delta\ndata: {"type":"content_block_delta","delta":{"type":"text_delta","text":" beta\\"]}"}}',
    'event: message_delta\ndata: {"type":"message_delta","usage":{"output_tokens":17}}',
    'event: message_stop\ndata: {"type":"message_stop"}',
  ].join("\n\n");
  const output = anthropicStreamOutput(parseServerSentEventData(stream));
  assert.equal(output.text, '{"queries":["alpha beta"]}');
});

test("can collect all 16 independent samples concurrently", async () => {
  let active = 0;
  let maximumActive = 0;
  const result = await collectEmpiricalSamples(async () => {
    active += 1;
    maximumActive = Math.max(maximumActive, active);
    await new Promise((resolve) => setTimeout(resolve, 5));
    active -= 1;
    return ["candidate"];
  });
  assert.equal(result.samples.length, 16);
  assert.equal(maximumActive, 16);
});

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
