import type {
  FanOutRequestV2,
  QueryObservationV1,
} from "@openqueries/contracts";
import { normalizeQuery, querySafety } from "@openqueries/query-core";

import { deleteDonations, donateEvents, estimateFanOuts } from "./lib/api";
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

async function flushDonations(state: ExtensionState): Promise<ExtensionState> {
  if (!state.donationEnabled || !state.onboardingAcknowledged) return state;
  let next = state;
  while (true) {
    const pending = next.events
      .filter((event) => !event.uploadedAt && !event.donationBlockedReason)
      .slice(0, 50);
    if (!pending.length) return next;
    const payload = pending.map(
      ({
        tabId: _tabId,
        uploadedAt: _uploadedAt,
        donationBlockedReason: _reason,
        fanOuts: _fanOuts,
        fanOutGeneratedAt: _generatedAt,
        ...event
      }) => event,
    );
    await donateEvents(next.donorTag, payload);
    const uploaded = new Set(pending.map((event) => event.eventId));
    const uploadedAt = new Date().toISOString();
    next = {
      ...next,
      events: next.events.map((event) =>
        uploaded.has(event.eventId) ? { ...event, uploadedAt } : event,
      ),
    };
    await writeState(next);
  }
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
    donationBlockedReason: safety.safe ? undefined : safety.reason,
  };
  state = { ...state, events: [event, ...state.events] };
  await writeState(state);
  try {
    state = await flushDonations(state);
    await writeState(state);
  } catch {
    // Keep the event locally. A later event or explicit retry flushes the queue.
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
    if (request.type === "openqueries:set-donation") {
      state = {
        ...state,
        donationEnabled: request.enabled,
        // Changing the setting is itself an explicit acknowledgement.
        onboardingAcknowledged: true,
      };
    } else if (request.type === "openqueries:acknowledge-onboarding") {
      state = {
        ...state,
        donationEnabled: request.donationEnabled,
        onboardingAcknowledged: true,
      };
    } else if (request.type === "openqueries:clear-local-history") {
      state = { ...state, events: [] };
    } else if (request.type === "openqueries:delete-donations") {
      await deleteDonations(state.deletionSecret);
      state = await rotateDonor(state);
    } else if (request.type === "openqueries:estimate-fan-outs") {
      if (!state.donationEnabled || !state.onboardingAcknowledged)
        throw new Error(
          "Enable query contribution in Settings to use fan-out estimates.",
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
                fanOutGeneratedAt: result.generatedAt,
              }
            : item,
        ),
      };
    } else if (request.type === "openqueries:flush-donations") {
      state = await flushDonations(state);
    }
    await writeState(state);
    if (state.donationEnabled && state.onboardingAcknowledged) {
      try {
        state = await flushDonations(state);
        await writeState(state);
      } catch {
        // Local history remains the durable retry source.
      }
    }
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
