import type { PlasmoCSConfig } from "plasmo";

import { installProviderTransportObserver } from "../lib/main-world-transport";

export const config: PlasmoCSConfig = {
  matches: ["https://claude.ai/*"],
  run_at: "document_start",
  world: "MAIN",
};

installProviderTransportObserver("claude");

export {};
