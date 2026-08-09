import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import vm from "node:vm";

async function main() {
  const buildDirectory = resolve(process.cwd(), "build/chrome-mv3-prod");
  const manifest = JSON.parse(
    await readFile(join(buildDirectory, "manifest.json"), "utf8"),
  ) as {
    name?: string;
    description?: string;
    version?: string;
    host_permissions?: string[];
    background?: { service_worker?: string };
    side_panel?: { default_path?: string };
  };

  assert.equal(manifest.name, "Open Queries – AI Search Query Inspector");
  assert.equal(manifest.version, "1.0.0");
  assert.equal(
    manifest.description,
    "See ChatGPT, Claude and Google AI search queries in a local side panel, then inspect likely fan-out queries on demand.",
  );
  assert.deepEqual(manifest.host_permissions, ["https://openqueries.org/*"]);

  assert.equal(
    manifest.side_panel?.default_path,
    "sidepanel.html",
    "production manifest must register the Open Queries side panel",
  );
  assert.ok(
    manifest.background?.service_worker,
    "production manifest must register a service worker",
  );

  const serviceWorker = await readFile(
    join(buildDirectory, manifest.background.service_worker),
    "utf8",
  );

  const panelBehaviorCalls: unknown[] = [];
  const installedListeners: Array<(details: { reason: string }) => void> = [];
  const messageListeners: unknown[] = [];

  const chromeMock = {
    runtime: {
      getManifest: () => ({ version: "1.0.0" }),
      onInstalled: {
        addListener: (listener: (details: { reason: string }) => void) =>
          installedListeners.push(listener),
      },
      onMessage: {
        addListener: (listener: unknown) => messageListeners.push(listener),
      },
      openOptionsPage: async () => undefined,
    },
    sidePanel: {
      setPanelBehavior: async (options: unknown) => {
        panelBehaviorCalls.push(options);
      },
    },
    tabs: {
      query: async () => [],
    },
    storage: {
      local: {
        get: async () => ({}),
        set: async () => undefined,
      },
    },
  };

  vm.runInNewContext(serviceWorker, {
    chrome: chromeMock,
    console,
    crypto: globalThis.crypto,
    fetch: globalThis.fetch,
    TextDecoder,
    TextEncoder,
    URL,
    setTimeout,
    clearTimeout,
  });

  await new Promise((settled) => setTimeout(settled, 0));

  assert.equal(installedListeners.length, 1);
  assert.equal(messageListeners.length, 1);
  assert.equal(
    JSON.stringify(panelBehaviorCalls),
    JSON.stringify([{ openPanelOnActionClick: true }]),
  );

  console.log(
    "Production MV3 service worker booted and registered the side panel.",
  );
}

void main();
