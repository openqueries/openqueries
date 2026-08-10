import type { PlasmoCSConfig } from "plasmo";

import { installExternalQueryBridge } from "../lib/adapter-runtime";

export const config: PlasmoCSConfig = {
  matches: ["https://claude.ai/*"],
  run_at: "document_idle",
};

installExternalQueryBridge("claude");

export {};
