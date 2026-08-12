import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";

type ContentScript = {
  matches: string[];
  js: string[];
  run_at?: "document_start" | "document_end" | "document_idle";
  world?: "ISOLATED" | "MAIN";
};

type Manifest = {
  content_scripts?: ContentScript[];
  permissions?: string[];
};

async function main(): Promise<void> {
  const buildDirectory = resolve(process.cwd(), "build/chrome-mv3-prod");
  const manifestPath = join(buildDirectory, "manifest.json");
  const manifest = JSON.parse(await readFile(manifestPath, "utf8")) as Manifest;
  const generated = manifest.content_scripts ?? [];
  for (const platform of ["chatgpt", "claude"] as const) {
    const prefix = `${platform}-transport.`;
    const matches = generated.filter((script) =>
      script.js.some((file) => file.startsWith(prefix) && file.endsWith(".js")),
    );
    assert.equal(
      matches.length,
      1,
      `Expected one generated ${platform} transport content script`,
    );
    matches[0]!.world = "MAIN";
    matches[0]!.run_at = "document_start";
  }

  manifest.permissions = (manifest.permissions ?? []).filter(
    (permission) => permission !== "scripting",
  );

  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
}

void main();
