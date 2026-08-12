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
    permissions?: string[];
    background?: { service_worker?: string };
    side_panel?: { default_path?: string };
    content_scripts?: Array<{
      matches?: string[];
      js?: string[];
      run_at?: string;
      world?: string;
    }>;
  };

  assert.equal(manifest.name, "Open Queries – AI Search Query Inspector");
  assert.equal(manifest.version, "1.0.6");
  assert.equal(
    manifest.description,
    "See ChatGPT, Claude and Google AI search queries in a local side panel, then inspect likely fan-out queries on demand.",
  );
  assert.deepEqual(manifest.host_permissions, [
    "https://chatgpt.com/*",
    "https://claude.ai/*",
    "https://openqueries.org/*",
    "https://www.google.com/*",
    "https://www.google.de/*",
    "https://www.google.co.uk/*",
    "https://www.google.fr/*",
    "https://www.google.es/*",
    "https://www.google.it/*",
    "https://www.google.nl/*",
    "https://www.google.pl/*",
    "https://www.google.at/*",
    "https://www.google.ch/*",
    "https://www.google.ca/*",
    "https://www.google.com.au/*",
    "https://www.google.co.in/*",
    "https://www.google.co.jp/*",
  ]);
  assert.deepEqual(manifest.permissions, ["sidePanel", "storage"]);

  for (const platform of ["chatgpt", "claude"] as const) {
    const origin = platform === "chatgpt" ? "chatgpt.com" : "claude.ai";
    const scripts = manifest.content_scripts?.filter((script) =>
      script.matches?.some((match) => match.includes(origin)),
    );
    assert.equal(
      scripts?.length,
      2,
      `${platform} must ship one isolated bridge and one MAIN-world observer`,
    );
    const main = scripts?.find((script) => script.world === "MAIN");
    assert.equal(main?.run_at, "document_start");
    assert.match(
      main?.js?.[0] ?? "",
      new RegExp(`^${platform}-transport\\..+\\.js$`, "u"),
    );
    const isolated = scripts?.find((script) => script.world !== "MAIN");
    assert.ok(isolated?.js?.length);
  }

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
  assert.doesNotMatch(
    serviceWorker,
    /registerContentScripts|chrome\.scripting/u,
    "provider observers must be statically declared so a fresh install cannot miss registration",
  );

  const panelBehaviorCalls: unknown[] = [];
  const installedListeners: Array<(details: { reason: string }) => void> = [];
  const messageListeners: unknown[] = [];
  const eventId = "estimate-before-privacy-acceptance";
  const selectedEventId = "selected-for-expansion";
  const unselectedEventId = "unselected-observation";
  const formerlyBlockedEventId = "observation-containing-email";
  const stateKey = "openqueries:state:v1";
  const stored: Record<string, unknown> = {
    [stateKey]: {
      schemaVersion: 1,
      privacyAccepted: false,
      deletionSecret: "a".repeat(64),
      donorTag: "b".repeat(64),
      events: [
        {
          schemaVersion: 1,
          eventId,
          platform: "chatgpt",
          sourceKind: "observed_model_search",
          query: "site:example.org evidence",
          capturedAt: "2026-08-09T12:00:00.000Z",
          extensionVersion: "1.0.1",
          adapterVersion: "1.0.1",
          tabId: 1,
        },
      ],
    },
  };
  const fetchCalls: Array<{ url: string; body?: string }> = [];
  let blockHistoricalTransfer = true;
  let releaseHistoricalTransfer: (() => void) | undefined;
  const fetchMock = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    fetchCalls.push({
      url,
      body: typeof init?.body === "string" ? init.body : undefined,
    });
    if (url.endsWith("/api/v1/events")) {
      if (blockHistoricalTransfer) {
        blockHistoricalTransfer = false;
        await new Promise<void>((resolve) => {
          releaseHistoricalTransfer = resolve;
        });
      }
      return new Response(null, { status: 201 });
    }
    return new Response(
      JSON.stringify({
        schemaVersion: 2,
        requestId: crypto.randomUUID(),
        sourceQuery: "site:example.org evidence",
        platform: "chatgpt",
        fanOuts: [
          {
            query: "site:example.org supporting evidence",
            rank: 1,
            provenance: "estimated",
            score: {
              kind: "native_inverse_perplexity",
              value: 0.8,
              meanTokenLogProbability: -0.2,
              perplexity: 1.25,
              tokenCount: 4,
            },
          },
        ],
        method: "provider_native_logprobs",
        model: "gpt-5.6-luna",
        promptVersion: "fanout-v2.1.0",
        generatedAt: "2026-08-09T12:00:01.000Z",
      }),
      { status: 200, headers: { "content-type": "application/json" } },
    );
  };

  const chromeMock = {
    runtime: {
      getManifest: () => ({
        version: "1.0.6",
        content_scripts: [
          { matches: ["https://chatgpt.com/*"], js: ["chatgpt.js"] },
          { matches: ["https://claude.ai/*"], js: ["claude.js"] },
          {
            matches: ["https://www.google.com/search*"],
            js: ["google.js"],
          },
        ],
      }),
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
      query: async (queryInfo: { url?: string[] }) => {
        if (!queryInfo.url) return [];
        if (queryInfo.url.some((url) => url.includes("chatgpt.com")))
          return [{ id: 41, url: "https://chatgpt.com/" }];
        if (queryInfo.url.some((url) => url.includes("claude.ai")))
          return [{ id: 42, url: "https://claude.ai/" }];
        if (queryInfo.url.some((url) => url.includes("google.")))
          return [{ id: 43, url: "https://www.google.com/search?q=test" }];
        return [];
      },
    },
    storage: {
      local: {
        get: async () => ({ ...stored }),
        set: async (value: Record<string, unknown>) => {
          Object.assign(stored, value);
        },
      },
    },
  };

  vm.runInNewContext(serviceWorker, {
    chrome: chromeMock,
    console,
    crypto: globalThis.crypto,
    fetch: fetchMock,
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
  const listener = messageListeners[0] as (
    request: unknown,
    sender: unknown,
    sendResponse: (response: unknown) => void,
  ) => boolean;
  const send = (request: unknown, sender: unknown = {}) =>
    new Promise<Record<string, unknown>>((resolve) => {
      assert.equal(
        listener(request, sender, (response) =>
          resolve(response as Record<string, unknown>),
        ),
        true,
      );
    });

  const blockedEstimateResponse = await send({
    type: "openqueries:estimate-fan-outs",
    eventId,
  });
  assert.equal(blockedEstimateResponse.ok, false);
  assert.match(
    String(blockedEstimateResponse.error),
    /Accept the privacy setting/u,
  );
  assert.equal(fetchCalls.length, 0);

  const privacyResponse = await Promise.race([
    send({
      type: "openqueries:set-privacy",
      accepted: true,
    }),
    new Promise<never>((_resolve, reject) =>
      setTimeout(
        () =>
          reject(new Error("Privacy control waited for historical transfer")),
        100,
      ),
    ),
  ]);
  assert.equal(privacyResponse.ok, true);
  const publicState = privacyResponse.state as {
    privacyAccepted?: boolean;
  };
  assert.equal(publicState.privacyAccepted, true);
  releaseHistoricalTransfer?.();
  await new Promise((settled) => setTimeout(settled, 0));
  assert.equal(
    fetchCalls.filter(({ url }) => url.endsWith("/api/v1/events")).length,
    1,
    "accepting privacy transfers existing observed history",
  );

  for (const observation of [
    {
      eventId: unselectedEventId,
      platform: "claude",
      sourceKind: "observed_model_search",
      query: "unselected observed query",
      capturedAt: "2026-08-09T12:01:00.000Z",
    },
    {
      eventId: selectedEventId,
      platform: "chatgpt",
      sourceKind: "observed_model_search",
      query: "site:example.org selected evidence",
      capturedAt: "2026-08-09T12:02:00.000Z",
    },
    {
      eventId: formerlyBlockedEventId,
      platform: "chatgpt",
      sourceKind: "observed_model_search",
      query: "site:example.org contact jane@example.com",
      capturedAt: "2026-08-09T12:03:00.000Z",
    },
  ]) {
    const observationResponse = await send(
      { type: "openqueries:observation", observation },
      { tab: { id: 2 } },
    );
    assert.equal(observationResponse.ok, true);
  }
  const eventCalls = fetchCalls.filter(({ url }) =>
    url.endsWith("/api/v1/events"),
  );
  assert.equal(eventCalls.length, 4);
  const transferredEvents = eventCalls.flatMap(({ body }) => {
    assert.ok(body);
    return [
      (
        JSON.parse(body) as {
          event: {
            eventId: string;
            extensionVersion?: string;
            adapterVersion?: string;
          };
        }
      ).event,
    ];
  });
  assert.ok(
    eventCalls.every(
      ({ body }) => body && !Array.isArray(JSON.parse(body).event),
    ),
  );
  assert.deepEqual(
    new Set(
      transferredEvents.map(
        ({ eventId: transferredEventId }) => transferredEventId,
      ),
    ),
    new Set([
      eventId,
      unselectedEventId,
      selectedEventId,
      formerlyBlockedEventId,
    ]),
  );
  assert.ok(
    transferredEvents
      .filter(
        ({ eventId: transferredEventId }) => transferredEventId !== eventId,
      )
      .every(
        ({ extensionVersion, adapterVersion }) =>
          extensionVersion === "1.0.6" && adapterVersion === "1.0.5",
      ),
  );

  const estimateResponse = await send({
    type: "openqueries:estimate-fan-outs",
    eventId: selectedEventId,
  });
  assert.equal(estimateResponse.ok, true);
  const fanOutCalls = fetchCalls.filter(({ url }) =>
    url.endsWith("/api/v2/fan-outs"),
  );
  assert.equal(fanOutCalls.length, 1);
  assert.equal(
    (JSON.parse(fanOutCalls[0]?.body ?? "{}") as { seed?: { query?: string } })
      .seed?.query,
    "site:example.org selected evidence",
  );

  console.log(
    "Production MV3 worker transfers every observed query and gates the query UI and estimates on privacy acceptance.",
  );
}

void main();
