import type { PlasmoCSConfig } from "plasmo";

import { extractSearchQueriesFromTransport } from "../lib/provider-stream";

export const config: PlasmoCSConfig = {
  matches: ["https://chatgpt.com/*"],
  run_at: "document_start",
  world: "MAIN",
};

const CHANNEL = "openqueries:provider-query:v1";
const CHATGPT_TRANSPORT = /\/(?:backend-api|api)\/.*conversation/iu;

function publish(query: string): void {
  window.postMessage(
    { channel: CHANNEL, platform: "chatgpt", query },
    window.location.origin,
  );
}

function inspect(text: string): number {
  const queries = extractSearchQueriesFromTransport(text);
  for (const query of queries) publish(query);
  return queries.length;
}

async function inspectResponse(response: Response): Promise<void> {
  if (!CHATGPT_TRANSPORT.test(response.url)) return;
  const contentType = response.headers.get("content-type") ?? "";
  if (!/(?:json|text|event-stream)/iu.test(contentType)) return;
  try {
    const text = await response.text();
    inspect(text);
  } catch {
    // The page's original response is never touched; inspection is best-effort.
  }
}

const nativeFetch = window.fetch.bind(window);
window.fetch = async (...input) => {
  const response = await nativeFetch(...input);
  try {
    void inspectResponse(response.clone());
  } catch {
    // Non-cloneable responses remain untouched.
  }
  return response;
};

const xhrUrls = new WeakMap<XMLHttpRequest, string>();
const nativeOpen = XMLHttpRequest.prototype.open;
const nativeSend = XMLHttpRequest.prototype.send;

XMLHttpRequest.prototype.open = function (
  method: string,
  url: string | URL,
  ...rest: unknown[]
): void {
  xhrUrls.set(this, String(url));
  return Reflect.apply(nativeOpen, this, [method, url, ...rest]);
};

XMLHttpRequest.prototype.send = function (...args: unknown[]): void {
  this.addEventListener(
    "load",
    () => {
      if (!CHATGPT_TRANSPORT.test(xhrUrls.get(this) ?? "")) return;
      if (this.responseType !== "" && this.responseType !== "text") return;
      try {
        inspect(this.responseText);
      } catch {
        // Ignore response modes that do not expose text.
      }
    },
    { once: true },
  );
  return Reflect.apply(nativeSend, this, args);
};

export {};
