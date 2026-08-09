import assert from "node:assert/strict";
import test from "node:test";

import {
  createInitialState,
  pruneEvents,
  reconcileContributionState,
  rotateDonor,
} from "../lib/storage";
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

test("deduplicates the same rendered provider query after a page reload", () => {
  const now = Date.parse("2026-08-09T17:30:00.000Z");
  const base = {
    schemaVersion: 1 as const,
    platform: "chatgpt" as const,
    sourceKind: "observed_model_search" as const,
    query: "site:developer.chrome.com side panel API",
    extensionVersion: "1.0.1",
    adapterVersion: "1.0.1",
    tabId: 42,
  };
  const pruned = pruneEvents(
    [
      {
        ...base,
        eventId: "newer",
        capturedAt: "2026-08-09T17:29:00.000Z",
      },
      {
        ...base,
        eventId: "older",
        capturedAt: "2026-08-09T17:28:00.000Z",
      },
    ],
    now,
  );
  assert.deepEqual(
    pruned.map((event) => event.eventId),
    ["newer"],
  );
});

test("starts query contribution off until the user chooses it", async () => {
  const state = await createInitialState();
  assert.equal(state.donationEnabled, false);
  assert.equal(state.onboardingAcknowledged, false);
});

test("repairs the legacy enabled-but-unacknowledged contribution state", () => {
  const state: ExtensionState = {
    schemaVersion: 1,
    donationEnabled: true,
    onboardingAcknowledged: false,
    deletionSecret: "a".repeat(64),
    donorTag: "b".repeat(64),
    events: [],
  };
  const reconciled = reconcileContributionState(state);
  assert.equal(reconciled.donationEnabled, true);
  assert.equal(reconciled.onboardingAcknowledged, true);
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
