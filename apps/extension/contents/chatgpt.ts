import type { PlasmoCSConfig } from "plasmo";

import { runAdapter } from "../lib/adapter-runtime";
import { extractAssistantQueries } from "../lib/extractors";

export const config: PlasmoCSConfig = {
  matches: ["https://chatgpt.com/*"],
  run_at: "document_idle",
};

runAdapter("chatgpt", () => extractAssistantQueries(document, "chatgpt"));

export {};
