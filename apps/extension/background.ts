import type {
  FanOutRequestV2,
  QueryObservationV1,
} from "@openqueries/contracts";
import { normalizeQuery } from "@openqueries/query-core";
import chatgptMainUrl from "url:./contents/chatgpt-main";
import claudeMainUrl from "url:./contents/claude-main";

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
const chatgptMainFile = chatgptMainUrl.split("/").pop()!.split("?")[0]!;
const claudeMainFile = claudeMainUrl.split("/").pop()!.split("?")[0]!;

const mainWorldScripts: chrome.scripting.RegisteredContentScript[] = [
  {
    id: "contentsChatgptMain",
    js: [chatgptMainFile],
    matches: ["https://chatgpt.com/*"],
    runAt: "document_start",
    world: "MAIN",
    persistAcrossSessions: true,
  },
  {
    id: "contentsClaudeMain",
    js: [claudeMainFile],
    matches: ["https://claude.ai/*"],
    runAt: "document_start",
    world: "MAIN",
    persistAcrossSessions: true,
  },
];

type ExistingTabTarget = {
  platform: LocalQueryEvent["platform"];
  matches: string[];
  mainFile?: string;
};

const existingTabTargets: ExistingTabTarget[] = [
  {
    platform: "chatgpt",
    matches: ["https://chatgpt.com/*"],
    mainFile: chatgptMainFile,
  },
  {
    platform: "claude",
    matches: ["https://claude.ai/*"],
    mainFile: claudeMainFile,
  },
  {
    platform: "google",
    matches: [
      "https://www.google.com/search*",
      "https://www.google.de/search*",
      "https://www.google.co.uk/search*",
      "https://www.google.fr/search*",
      "https://www.google.es/search*",
      "https://www.google.it/search*",
      "https://www.google.nl/search*",
      "https://www.google.pl/search*",
      "https://www.google.at/search*",
      "https://www.google.ch/search*",
      "https://www.google.ca/search*",
      "https://www.google.com.au/search*",
      "https://www.google.co.in/search*",
      "https://www.google.co.jp/search*",
    ],
  },
];

async function syncMainWorldScripts(): Promise<void> {
  const registered = await chrome.scripting.getRegisteredContentScripts({
    ids: mainWorldScripts.map(({ id }) => id),
  });
  const existingIds = new Set(registered.map(({ id }) => id));
  const existing = mainWorldScripts.filter(({ id }) => existingIds.has(id));
  const missing = mainWorldScripts.filter(({ id }) => !existingIds.has(id));
  if (existing.length) await chrome.scripting.updateContentScripts(existing);
  for (const script of missing) {
    try {
      await chrome.scripting.registerContentScripts([script]);
    } catch {
      // Plasmo may have registered the same script during worker startup.
      await chrome.scripting.updateContentScripts([script]);
    }
  }
}

function isolatedBridgeFiles(platform: LocalQueryEvent["platform"]): string[] {
  const manifest = chrome.runtime.getManifest() as chrome.runtime.Manifest & {
    content_scripts?: Array<{ matches?: string[]; js?: string[] }>;
  };
  const domain =
    platform === "chatgpt"
      ? "chatgpt.com"
      : platform === "claude"
        ? "claude.ai"
        : "google.";
  return (
    manifest.content_scripts?.find((script) =>
      script.matches?.some((match) => match.includes(domain)),
    )?.js ?? []
  );
}

async function injectExistingSupportedTabs(): Promise<void> {
  for (const target of existingTabTargets) {
    const tabs = await chrome.tabs.query({ url: target.matches });
    const bridgeFiles = isolatedBridgeFiles(target.platform);
    for (const tab of tabs) {
      if (tab.id == null) continue;
      try {
        if (target.mainFile) {
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: [target.mainFile],
            world: "MAIN",
            injectImmediately: true,
          });
        }
        if (bridgeFiles.length) {
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: bridgeFiles,
            world: "ISOLATED",
            injectImmediately: true,
          });
        }
      } catch {
        // A tab can navigate or close between discovery and injection.
      }
    }
  }
}

async function bootstrapProviderScripts(): Promise<void> {
  await syncMainWorldScripts();
  await injectExistingSupportedTabs();
}

setTimeout(() => void bootstrapProviderScripts().catch(() => undefined), 50);

chrome.runtime.onInstalled.addListener((details) => {
  void chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
  if (details.reason === "install") {
    void chrome.runtime.openOptionsPage();
  }
});

void chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch(() => undefined);

async function activeTabContext(): Promise<{
  id: number | null;
  platform: LocalQueryEvent["platform"] | null;
}> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const url = tab?.url ?? "";
  const platform = url.startsWith("https://chatgpt.com/")
    ? "chatgpt"
    : url.startsWith("https://claude.ai/")
      ? "claude"
      : /^https:\/\/(?:www\.)?google\.[^/]+\/search(?:[?#]|$)/u.test(url)
        ? "google"
        : null;
  return { id: tab?.id ?? null, platform };
}

async function publicState(state: ExtensionState) {
  const activeTab = await activeTabContext();
  return toPublicState(state, activeTab.id, activeTab.platform);
}

async function transferObservation(
  state: ExtensionState,
  event: LocalQueryEvent,
): Promise<ExtensionState> {
  if (!state.privacyAccepted) return state;
  const { tabId: _tabId, fanOuts: _fanOuts, ...observation } = event;
  await sendEvent(state.donorTag, observation);
  return state;
}

async function transferHistoricalEvents(
  events: LocalQueryEvent[],
): Promise<void> {
  for (const event of events) {
    const current = await readState();
    if (!current.privacyAccepted) return;
    try {
      await transferObservation(current, event);
    } catch {
      // Historical transfer is best-effort and never blocks the privacy control.
    }
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
  const event: LocalQueryEvent = {
    schemaVersion: 1,
    ...request.observation,
    query,
    extensionVersion: manifestVersion,
    adapterVersion: "1.0.4",
    tabId,
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
      return { ok: true, state: await publicState(state) };
    }
    if (request.type === "openqueries:set-privacy") {
      const newlyAccepted = request.accepted && !state.privacyAccepted;
      state = {
        ...state,
        privacyAccepted: request.accepted,
      };
      if (newlyAccepted) {
        await writeState(state);
        void transferHistoricalEvents(state.events);
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
    return { ok: true, state: await publicState(state) };
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
