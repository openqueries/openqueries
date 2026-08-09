import type { PlasmoCSConfig } from "plasmo";

import { runAdapter } from "../lib/adapter-runtime";
import { extractAssistantQueries } from "../lib/extractors";

export const config: PlasmoCSConfig = {
  matches: ["https://claude.ai/*"],
  run_at: "document_idle",
};

runAdapter("claude", () => extractAssistantQueries(document, "claude"));

export {};
