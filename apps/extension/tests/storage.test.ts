import assert from "node:assert/strict";
import test from "node:test";

import { pruneEvents, rotateDonor } from "../lib/storage";
import type { ExtensionState, LocalQueryEvent } from "../lib/types";

function event(eventId: string, capturedAt: string): LocalQueryEvent {
  return {
    schemaVersion: 1,
    eventId,
    platform: "claude",
    sourceKind: "observed_model_search",
    query: `safe query ${eventId}`,
    capturedAt,
    extensionVersion: "0.1.0",
    adapterVersion: "1.0.0",
    tabId: 1,
  };
}

test("prunes local history after 30 days", () => {
  const now = Date.parse("2026-08-09T12:00:00.000Z");
  const recent = event("recent-event", "2026-08-01T12:00:00.000Z");
  const expired = event("expired-event", "2026-06-01T12:00:00.000Z");
  assert.deepEqual(
    pruneEvents([expired, recent], now).map((item) => item.eventId),
    ["recent-event"],
  );
});

test("server deletion rotates the donor without re-donating existing local history", async () => {
  const state: ExtensionState = {
    schemaVersion: 1,
    donationEnabled: true,
    onboardingAcknowledged: true,
    deletionSecret: "a".repeat(64),
    donorTag: "b".repeat(64),
    events: [event("existing-event", new Date().toISOString())],
  };
  const rotated = await rotateDonor(state);
  assert.notEqual(rotated.donorTag, state.donorTag);
  assert.notEqual(rotated.deletionSecret, state.deletionSecret);
  assert.ok(
    rotated.events[0]?.uploadedAt,
    "existing events are marked handled after deletion",
  );
});
