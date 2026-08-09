import { querySafety, sha256Hex } from "@openqueries/query-core";

import type { ExtensionState, LocalQueryEvent, PublicState } from "./types";

const STATE_KEY = "openqueries:state:v1";
const RETENTION_MS = 30 * 24 * 60 * 60 * 1_000;
const MAX_EVENTS = 2_000;

function randomHex(bytes = 32): string {
  const value = new Uint8Array(bytes);
  crypto.getRandomValues(value);
  return [...value].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function createInitialState(): Promise<ExtensionState> {
  const deletionSecret = randomHex();
  return {
    schemaVersion: 1,
    donationEnabled: true,
    onboardingAcknowledged: false,
    deletionSecret,
    donorTag: await sha256Hex(deletionSecret),
    events: [],
  };
}

export function pruneEvents(
  events: LocalQueryEvent[],
  now = Date.now(),
): LocalQueryEvent[] {
  const cutoff = now - RETENTION_MS;
  return events
    .filter((event) => Date.parse(event.capturedAt) >= cutoff)
    .sort(
      (left, right) =>
        Date.parse(right.capturedAt) - Date.parse(left.capturedAt),
    )
    .slice(0, MAX_EVENTS);
}

export async function readState(): Promise<ExtensionState> {
  const stored = await chrome.storage.local.get(STATE_KEY);
  const state = stored[STATE_KEY] as ExtensionState | undefined;
  if (
    !state ||
    state.schemaVersion !== 1 ||
    !state.deletionSecret ||
    !state.donorTag
  ) {
    const initial = await createInitialState();
    await writeState(initial);
    return initial;
  }
  const pruned = pruneEvents(state.events ?? []);
  let migrated = false;
  const events = pruned.map((event) => {
    if (
      !event.fanOuts?.length ||
      event.fanOuts.every(
        (candidate) =>
          candidate &&
          typeof candidate === "object" &&
          "score" in candidate &&
          candidate.score,
      )
    )
      return event;
    migrated = true;
    return { ...event, fanOuts: undefined, fanOutGeneratedAt: undefined };
  });
  const next = { ...state, events };
  if (migrated || next.events.length !== (state.events ?? []).length)
    await writeState(next);
  return next;
}

export async function writeState(state: ExtensionState): Promise<void> {
  await chrome.storage.local.set({
    [STATE_KEY]: { ...state, events: pruneEvents(state.events) },
  });
}

export async function rotateDonor(
  state: ExtensionState,
): Promise<ExtensionState> {
  const deletionSecret = randomHex();
  const handledAt = new Date().toISOString();
  return {
    ...state,
    deletionSecret,
    donorTag: await sha256Hex(deletionSecret),
    // Existing local history must not be re-donated under the rotated ID.
    // New observations remain eligible after the deletion completes.
    events: state.events.map((event) => {
      const safety = querySafety(event.query);
      return {
        ...event,
        uploadedAt: event.uploadedAt ?? handledAt,
        donationBlockedReason:
          event.donationBlockedReason ??
          (safety.safe ? undefined : safety.reason),
      };
    }),
  };
}

export function toPublicState(
  state: ExtensionState,
  activeTabId: number | null,
): PublicState {
  const { deletionSecret: _deletionSecret, ...safe } = state;
  return { ...safe, activeTabId };
}

export { STATE_KEY };
