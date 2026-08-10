import type { PlasmoCSConfig } from "plasmo";

import { installExternalQueryBridge } from "../lib/adapter-runtime";

export const config: PlasmoCSConfig = {
  matches: ["https://chatgpt.com/*"],
  run_at: "document_idle",
};

installExternalQueryBridge("chatgpt");

export {};
