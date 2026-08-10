import type { PlasmoCSConfig } from "plasmo";

import {
  extractSearchQueriesFromTransport,
  takeCompleteSseFrames,
} from "../lib/provider-stream";

export const config: PlasmoCSConfig = {
  matches: ["https://claude.ai/*"],
  run_at: "document_start",
  world: "MAIN",
};

const CHANNEL = "openqueries:provider-query:v1";
const CLAUDE_TRANSPORT =
  /\/api\/.*(?:completion|conversation|message|response)/iu;

function publish(query: string): void {
  window.postMessage(
    { channel: CHANNEL, platform: "claude", query },
    window.location.origin,
  );
}

function inspect(text: string): void {
  for (const query of extractSearchQueriesFromTransport(text)) publish(query);
}

async function inspectEventStream(response: Response): Promise<void> {
  const reader = response.body?.getReader();
  if (!reader) return;
  const decoder = new TextDecoder();
  let buffer = "";
  let transcript = "";

  while (true) {
    const { done, value } = await reader.read();
    buffer += decoder.decode(value, { stream: !done });
    const complete = takeCompleteSseFrames(buffer);
    buffer = complete.remainder;
    if (complete.frames.length) {
      transcript += `${complete.frames.join("\n\n")}\n\n`;
      inspect(transcript);
      if (transcript.length > 2_000_000)
        transcript = transcript.slice(-1_000_000);
    }
    if (done) break;
    if (buffer.length > 2_000_000) buffer = buffer.slice(-1_000_000);
  }

  if (buffer.trim()) inspect(`${transcript}${buffer}`);
}

async function inspectResponse(response: Response): Promise<void> {
  if (!CLAUDE_TRANSPORT.test(response.url)) return;
  const contentType = response.headers.get("content-type") ?? "";
  if (!/(?:json|text|event-stream)/iu.test(contentType)) return;
  try {
    if (/event-stream/iu.test(contentType)) {
      await inspectEventStream(response);
      return;
    }
    inspect(await response.text());
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

export {};
