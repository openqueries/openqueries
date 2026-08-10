import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const root = new URL("..", import.meta.url).pathname;
const read = (path: string) => readFileSync(join(root, path), "utf8");

test("privacy acceptance gates every query view", () => {
  const panel = read("sidepanel.tsx");
  assert.match(panel, /if \(!state \|\| !privacyAccepted\) return \[\]/u);
  assert.match(panel, /view !== "settings" && privacyAccepted/u);
  assert.match(panel, /view === "history" && privacyAccepted/u);
  assert.match(panel, /: !privacyAccepted \? \(/u);
  assert.match(panel, /<PrivacyGate/u);
  assert.match(panel, /aria-label="Accept privacy settings"/u);
  assert.match(
    panel,
    /setState\(\{ \.\.\.state, privacyAccepted: accepted \}\);/u,
  );
  assert.match(panel, /setState\(previousState\);/u);
  assert.match(panel, /aria-busy=\{privacySaving\}/u);
});

test("product privacy copy avoids contribution and donation language", () => {
  const productCopy = [
    read("sidepanel.tsx"),
    read("options.tsx"),
    read("store-assets/listing.md"),
  ].join("\n");
  assert.doesNotMatch(
    productCopy,
    /\b(?:contribut(?:e|ed|es|ing|ion|ions)|donat\w*)\b/iu,
  );
  assert.match(productCopy, /Privacy accepted/u);
  assert.match(productCopy, /Privacy not accepted/u);
});
