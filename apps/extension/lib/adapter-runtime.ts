import type { Platform } from "@openqueries/contracts";
import type { PlasmoCSConfig } from "plasmo";

import type { ExtractedQuery } from "./extractors";

const observedElements = new WeakMap<
  Element,
  { eventId: string; signature: string }
>();
const observedGoogleSeeds = new Set<string>();
const observedExternalQueries = new Set<string>();

function locale(): string | undefined {
  return document.documentElement.lang || navigator.language || undefined;
}

async function emit(extracted: ExtractedQuery): Promise<void> {
  const signature = `${extracted.platform}|${extracted.sourceKind}|${extracted.query}`;
  const previous = observedElements.get(extracted.element);
  let eventId =
    previous?.signature === signature ? previous.eventId : undefined;
  if (extracted.sourceKind === "google_user_search") {
    const key = `${location.href}|${extracted.query}`;
    if (observedGoogleSeeds.has(key)) return;
    observedGoogleSeeds.add(key);
  } else if (eventId) {
    return;
  }
  eventId ??= crypto.randomUUID();
  observedElements.set(extracted.element, { eventId, signature });
  await sendObservation({
    eventId,
    platform: extracted.platform,
    sourceKind: extracted.sourceKind,
    query: extracted.query,
  });
}

async function sendObservation(observation: {
  eventId: string;
  platform: Platform;
  sourceKind: ExtractedQuery["sourceKind"];
  query: string;
}): Promise<void> {
  await chrome.runtime
    .sendMessage({
      type: "openqueries:observation",
      observation: {
        ...observation,
        capturedAt: new Date().toISOString(),
        language: locale(),
        locale: locale(),
      },
    })
    .catch(() => undefined);
}

export async function emitExternalQuery(
  platform: Platform,
  query: string,
  sourceKind: ExtractedQuery["sourceKind"] = "observed_model_search",
): Promise<void> {
  const normalized = query.trim().replace(/\s+/gu, " ");
  if (!normalized) return;
  const key = `${location.href}|${platform}|${sourceKind}|${normalized.toLocaleLowerCase()}`;
  if (observedExternalQueries.has(key)) return;
  observedExternalQueries.add(key);
  await sendObservation({
    eventId: crypto.randomUUID(),
    platform,
    sourceKind,
    query: normalized,
  });
}

export function runAdapter(
  platform: Platform,
  extract: () => ExtractedQuery[],
): void {
  let queued = false;
  let previousHref = location.href;
  const scan = () => {
    queued = false;
    for (const query of extract()) void emit(query);
  };
  const schedule = () => {
    if (queued) return;
    queued = true;
    window.setTimeout(scan, 120);
  };
  const observer = new MutationObserver(schedule);
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    characterData: true,
  });
  window.setInterval(() => {
    if (location.href !== previousHref) {
      previousHref = location.href;
      schedule();
    } else if (!document.hidden) {
      schedule();
    }
  }, 1_200);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) schedule();
  });
  schedule();
  void platform;
}

export type { PlasmoCSConfig };
