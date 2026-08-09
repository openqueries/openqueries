import type { PlasmoCSConfig } from "plasmo";

import { runAdapter } from "../lib/adapter-runtime";
import { extractGoogleQueries } from "../lib/extractors";

export const config: PlasmoCSConfig = {
  matches: [
    "https://www.google.com/search*",
    "https://www.google.de/search*",
    "https://www.google.co.uk/search*",
    "https://www.google.fr/search*",
    "https://www.google.es/search*",
    "https://www.google.it/search*",
    "https://www.google.nl/search*",
    "https://www.google.pl/search*",
    "https://www.google.at/search*",
    "https://www.google.ch/search*",
    "https://www.google.ca/search*",
    "https://www.google.com.au/search*",
    "https://www.google.co.in/search*",
    "https://www.google.co.jp/search*",
  ],
  run_at: "document_idle",
};

runAdapter("google", () => extractGoogleQueries(document, location));

export {};
