import type {
  FanOutRequestV2,
  QueryObservationV1,
} from "@openqueries/contracts";
import { normalizeQuery, querySafety } from "@openqueries/query-core";

import { deleteServerData, estimateFanOuts, sendEvent } from "./lib/api";
import {
  readState,
  rotateDonor,
  toPublicState,
  writeState,
} from "./lib/storage";
import type {
  ExtensionState,
  LocalQueryEvent,
  RuntimeRequest,
  RuntimeResponse,
} from "./lib/types";

const manifestVersion = chrome.runtime.getManifest().version;

chrome.runtime.onInstalled.addListener((details) => {
  void chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
  if (details.reason === "install") {
    void chrome.runtime.openOptionsPage();
  }
});

void chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch(() => undefined);

async function activeTabId(): Promise<number | null> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab?.id ?? null;
}

async function transferObservation(
  state: ExtensionState,
  event: LocalQueryEvent,
): Promise<ExtensionState> {
  if (!state.privacyAccepted || event.privacyBlockedReason) return state;
  const {
    tabId: _tabId,
    privacyBlockedReason: _reason,
    fanOuts: _fanOuts,
    ...observation
  } = event;
  await sendEvent(state.donorTag, observation);
  return state;
}

async function addObservation(
  request: Extract<RuntimeRequest, { type: "openqueries:observation" }>,
  sender: chrome.runtime.MessageSender,
): Promise<void> {
  let state = await readState();
  const query = normalizeQuery(request.observation.query);
  if (!query) return;
  const tabId = sender.tab?.id ?? null;
  if (
    state.events.some(
      (event) =>
        event.eventId === request.observation.eventId ||
        (event.tabId === tabId &&
          event.platform === request.observation.platform &&
          event.sourceKind === request.observation.sourceKind &&
          event.query.toLocaleLowerCase() === query.toLocaleLowerCase()),
    )
  )
    return;
  const safety = querySafety(query);
  const event: LocalQueryEvent = {
    schemaVersion: 1,
    ...request.observation,
    query,
    extensionVersion: manifestVersion,
    adapterVersion: "1.0.1",
    tabId,
    privacyBlockedReason: safety.safe ? undefined : safety.reason,
  };
  state = { ...state, events: [event, ...state.events] };
  await writeState(state);
  try {
    state = await transferObservation(state, event);
    await writeState(state);
  } catch {
    // A failed transfer never removes the local observation.
  }
}

async function handleRequest(
  request: RuntimeRequest,
  sender: chrome.runtime.MessageSender,
): Promise<RuntimeResponse> {
  try {
    if (request.type === "openqueries:observation") {
      await addObservation(request, sender);
      return { ok: true };
    }

    let state = await readState();
    if (request.type === "openqueries:get-state") {
      return { ok: true, state: toPublicState(state, await activeTabId()) };
    }
    if (request.type === "openqueries:set-privacy") {
      const newlyAccepted = request.accepted && !state.privacyAccepted;
      state = {
        ...state,
        privacyAccepted: request.accepted,
      };
      if (newlyAccepted) {
        await writeState(state);
        for (const event of state.events) {
          try {
            await transferObservation(state, event);
          } catch {
            // Privacy acceptance is durable even if one historical transfer fails.
          }
        }
      }
    } else if (request.type === "openqueries:clear-local-history") {
      state = { ...state, events: [] };
    } else if (request.type === "openqueries:delete-server-data") {
      await deleteServerData(state.deletionSecret);
      state = await rotateDonor(state);
    } else if (request.type === "openqueries:estimate-fan-outs") {
      if (!state.privacyAccepted)
        throw new Error(
          "Accept the privacy setting to view queries and use fan-out estimates.",
        );
      const event = state.events.find(
        (item) => item.eventId === request.eventId,
      );
      if (!event) throw new Error("Query event not found");
      if (!querySafety(event.query).safe)
        throw new Error(
          "This query may contain sensitive data and cannot be sent to a model.",
        );
      const payload: FanOutRequestV2 = {
        schemaVersion: 2,
        requestId: crypto.randomUUID(),
        donorTag: state.donorTag,
        platform: event.platform,
        seed: {
          query: event.query,
          sourceKind: event.sourceKind,
          language: event.language,
        },
      };
      const result = await estimateFanOuts(payload);
      state = {
        ...state,
        events: state.events.map((item) =>
          item.eventId === event.eventId
            ? {
                ...item,
                fanOuts: result.fanOuts,
              }
            : item,
        ),
      };
    }
    await writeState(state);
    return { ok: true, state: toPublicState(state, await activeTabId()) };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error ? error.message : "Unexpected extension error",
    };
  }
}

chrome.runtime.onMessage.addListener(
  (request: RuntimeRequest, sender, sendResponse) => {
    void handleRequest(request, sender).then(sendResponse);
    return true;
  },
);
