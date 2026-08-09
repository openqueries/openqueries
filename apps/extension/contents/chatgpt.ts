import type { PlasmoCSConfig } from "plasmo";

import { emitExternalQuery, runAdapter } from "../lib/adapter-runtime";
import { extractAssistantQueries } from "../lib/extractors";

export const config: PlasmoCSConfig = {
  matches: ["https://chatgpt.com/*"],
  run_at: "document_idle",
};

runAdapter("chatgpt", () => extractAssistantQueries(document, "chatgpt"));

window.addEventListener("message", (event: MessageEvent<unknown>) => {
  if (event.source !== window || event.origin !== window.location.origin)
    return;
  const data = event.data;
  if (!data || typeof data !== "object") return;
  const record = data as Record<string, unknown>;
  if (
    record.channel !== "openqueries:provider-query:v1" ||
    record.platform !== "chatgpt" ||
    typeof record.query !== "string"
  )
    return;
  void emitExternalQuery("chatgpt", record.query);
});

export {};
