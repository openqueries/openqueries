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
  assert.equal(manifest.version, "1.0.1");
  assert.equal(
    manifest.description,
    "See ChatGPT, Claude and Google AI search queries in a local side panel, then inspect likely fan-out queries on demand.",
  );
  assert.deepEqual(manifest.host_permissions, [
    "https://chatgpt.com/*",
    "https://openqueries.org/*",
  ]);

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
  const eventId = "estimate-while-contribution-off";
  const selectedEventId = "selected-for-expansion";
  const unselectedEventId = "unselected-observation";
  const stateKey = "openqueries:state:v1";
  const stored: Record<string, unknown> = {
    [stateKey]: {
      schemaVersion: 1,
      donationEnabled: false,
      onboardingAcknowledged: false,
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
  const fetchMock = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    fetchCalls.push({
      url,
      body: typeof init?.body === "string" ? init.body : undefined,
    });
    if (url.endsWith("/api/v1/events"))
      return new Response(null, { status: 202 });
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
      getManifest: () => ({ version: "1.0.1" }),
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
        get: async () => ({ ...stored }),
        set: async (value: Record<string, unknown>) => {
          Object.assign(stored, value);
        },
      },
    },
    scripting: {
      registerContentScripts: async () => undefined,
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
    /Enable query contribution/u,
  );
  assert.equal(fetchCalls.length, 0);

  const donationResponse = await send({
    type: "openqueries:set-donation",
    enabled: true,
  });
  assert.equal(donationResponse.ok, true);
  const publicState = donationResponse.state as {
    donationEnabled?: boolean;
    onboardingAcknowledged?: boolean;
  };
  assert.equal(publicState.donationEnabled, true);
  assert.equal(publicState.onboardingAcknowledged, true);
  assert.equal(fetchCalls.length, 0, "pre-consent history stays local");

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
  ]) {
    const observationResponse = await send(
      { type: "openqueries:observation", observation },
      { tab: { id: 2 } },
    );
    assert.equal(observationResponse.ok, true);
  }
  const donationCalls = fetchCalls.filter(({ url }) =>
    url.endsWith("/api/v1/events"),
  );
  assert.equal(donationCalls.length, 2);
  const donatedEvents = donationCalls.flatMap(({ body }) => {
    assert.ok(body);
    return (JSON.parse(body) as { events: Array<{ eventId: string }> }).events;
  });
  assert.ok(
    donationCalls.every(
      ({ body }) => body && JSON.parse(body).events.length === 1,
    ),
  );
  assert.deepEqual(
    new Set(donatedEvents.map(({ eventId: donatedEventId }) => donatedEventId)),
    new Set([unselectedEventId, selectedEventId]),
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
    "Production MV3 worker immediately donates each eligible observation and gates estimates on accepted contribution.",
  );
}

void main();
