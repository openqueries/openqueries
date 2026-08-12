import assert from "node:assert/strict";
import test from "node:test";

import { canonicalRequestRedirect } from "../worker/canonical-request";

test("redirects the apex HTTP URL to the HTTPS canonical", () => {
  const response = canonicalRequestRedirect(
    new Request("http://openqueries.org/fan-out-queries?source=test"),
  );

  assert.equal(response?.status, 308);
  assert.equal(
    response?.headers.get("location"),
    "https://openqueries.org/fan-out-queries?source=test",
  );
});

test("redirects the www alias to the HTTPS apex canonical", () => {
  for (const protocol of ["http", "https"]) {
    const response = canonicalRequestRedirect(
      new Request(`${protocol}://www.openqueries.org/install`),
    );

    assert.equal(response?.status, 308);
    assert.equal(
      response?.headers.get("location"),
      "https://openqueries.org/install",
    );
  }
});

test("leaves canonical HTTPS and non-public preview hosts unchanged", () => {
  assert.equal(
    canonicalRequestRedirect(new Request("https://openqueries.org/learn")),
    null,
  );
  assert.equal(
    canonicalRequestRedirect(
      new Request("http://openqueries.example.workers.dev/learn"),
    ),
    null,
  );
});
