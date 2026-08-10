import assert from "node:assert/strict";
import test from "node:test";

import { handleApi } from "../worker/api";
import type { AppEnv } from "../worker/env";

test("stores one observed query event directly in D1", async () => {
  let sql = "";
  let values: unknown[] = [];
  const statement = {
    bind(...bound: unknown[]) {
      values = bound;
      return this;
    },
    async run() {
      return { meta: { changes: 1 } };
    },
  };
  const env = {
    SITE_ORIGIN: "https://openqueries.org",
    ALLOWED_EXTENSION_IDS: "",
    DB: {
      prepare(query: string) {
        sql = query;
        return statement;
      },
    },
  } as unknown as AppEnv;
  const response = await handleApi(
    new Request("https://openqueries.org/api/v1/events", {
      method: "POST",
      body: JSON.stringify({
        schemaVersion: 1,
        donorTag: "a".repeat(64),
        event: {
          schemaVersion: 1,
          eventId: "event-12345678",
          platform: "chatgpt",
          sourceKind: "observed_model_search",
          query: "site:example.org primary evidence",
          capturedAt: "2026-08-09T08:00:00.000Z",
          extensionVersion: "1.0.1",
          adapterVersion: "1.0.1",
        },
      }),
    }),
    env,
  );

  assert.equal(response?.status, 201);
  assert.match(sql, /INSERT OR IGNORE INTO query_events/u);
  assert.equal(values[0], "event-12345678");
  assert.equal(values[1], "a".repeat(64));
  assert.equal(values.length, 12);
  assert.deepEqual(await response?.json(), { accepted: true });
});
