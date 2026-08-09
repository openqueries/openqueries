import assert from "node:assert/strict";
import test from "node:test";

import {
  DonationBatchV1Schema,
  FanOutRequestV2Schema,
  FanOutResponseV2Schema,
  QueryObservationV1Schema,
} from "../src/index";

const observation = {
  schemaVersion: 1,
  eventId: "event-12345678",
  platform: "chatgpt",
  sourceKind: "observed_model_search",
  query: "current cloudflare d1 documentation",
  capturedAt: "2026-08-09T08:00:00.000Z",
  extensionVersion: "0.1.0",
  adapterVersion: "1.0.0",
} as const;

test("accepts the narrow query observation contract", () => {
  assert.equal(
    QueryObservationV1Schema.parse(observation).query,
    observation.query,
  );
  assert.equal(
    DonationBatchV1Schema.parse({
      schemaVersion: 1,
      donorTag: "a".repeat(64),
      events: [observation],
    }).events.length,
    1,
  );
});

test("rejects conversation metadata and unsupported source kinds", () => {
  assert.throws(() =>
    QueryObservationV1Schema.parse({
      ...observation,
      conversationTitle: "Private chat",
    }),
  );
  assert.throws(() =>
    QueryObservationV1Schema.parse({
      ...observation,
      sourceKind: "chat_message",
    }),
  );
});

test("fan-out requests accept one explicit seed only", () => {
  const parsed = FanOutRequestV2Schema.parse({
    schemaVersion: 2,
    requestId: "f814c9fd-a0d9-4f7d-9ba9-b3915ec15523",
    donorTag: "b".repeat(64),
    platform: "google",
    seed: {
      query: "best accounting software",
      sourceKind: "google_user_search",
    },
  });
  assert.equal(parsed.platform, "google");
});

test("fan-out responses expose native evidence without a shared scorer", () => {
  const parsed = FanOutResponseV2Schema.parse({
    schemaVersion: 2,
    requestId: "f814c9fd-a0d9-4f7d-9ba9-b3915ec15523",
    sourceQuery: "best accounting software",
    platform: "chatgpt",
    method: "provider_native_logprobs",
    model: "gpt-5.6-luna",
    promptVersion: "fanout-v2.0.0",
    generatedAt: "2026-08-09T08:00:00.000Z",
    fanOuts: [
      {
        query: "accounting software comparison",
        rank: 1,
        provenance: "estimated",
        score: {
          kind: "native_inverse_perplexity",
          value: 0.8,
          meanTokenLogProbability: -0.223143551,
          perplexity: 1.25,
          tokenCount: 3,
        },
      },
    ],
  });
  assert.equal(parsed.model, "gpt-5.6-luna");
  assert.equal("scorerModel" in parsed, false);
});
