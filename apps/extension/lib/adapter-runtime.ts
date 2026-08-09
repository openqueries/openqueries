import type { Platform } from "@openqueries/contracts";
import type { PlasmoCSConfig } from "plasmo";

import type { ExtractedQuery } from "./extractors";

const observedElements = new WeakMap<Element, string>();
const observedGoogleSeeds = new Set<string>();

function locale(): string | undefined {
  return document.documentElement.lang || navigator.language || undefined;
}

async function emit(extracted: ExtractedQuery): Promise<void> {
  let eventId = observedElements.get(extracted.element);
  if (extracted.sourceKind === "google_user_search") {
    const key = `${location.href}|${extracted.query}`;
    if (observedGoogleSeeds.has(key)) return;
    observedGoogleSeeds.add(key);
  } else if (eventId) {
    return;
  }
  eventId ??= crypto.randomUUID();
  observedElements.set(extracted.element, eventId);
  await chrome.runtime
    .sendMessage({
      type: "openqueries:observation",
      observation: {
        eventId,
        platform: extracted.platform,
        sourceKind: extracted.sourceKind,
        query: extracted.query,
        capturedAt: new Date().toISOString(),
        language: locale(),
        locale: locale(),
      },
    })
    .catch(() => undefined);
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
  });
  window.setInterval(() => {
    if (location.href !== previousHref) {
      previousHref = location.href;
      schedule();
    }
  }, 800);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) schedule();
  });
  schedule();
  void platform;
}

export type { PlasmoCSConfig };
