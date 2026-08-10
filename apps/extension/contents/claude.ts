import type { PlasmoCSConfig } from "plasmo";

import { emitExternalQuery, runAdapter } from "../lib/adapter-runtime";
import { revealClaudeSearchDetails } from "../lib/claude-disclosure";
import { extractAssistantQueries } from "../lib/extractors";

export const config: PlasmoCSConfig = {
  matches: ["https://claude.ai/*"],
  run_at: "document_idle",
};

runAdapter("claude", () => {
  revealClaudeSearchDetails(document);
  return extractAssistantQueries(document, "claude");
});

window.addEventListener("message", (event: MessageEvent<unknown>) => {
  if (event.source !== window || event.origin !== window.location.origin)
    return;
  const data = event.data;
  if (!data || typeof data !== "object") return;
  const record = data as Record<string, unknown>;
  if (
    record.channel !== "openqueries:provider-query:v1" ||
    record.platform !== "claude" ||
    typeof record.query !== "string"
  )
    return;
  void emitExternalQuery("claude", record.query);
});

export {};
