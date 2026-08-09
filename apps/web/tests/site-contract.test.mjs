import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const root = new URL("..", import.meta.url).pathname;
const read = (path) => readFileSync(join(root, path), "utf8");

test("publishes the mission, privacy boundary and open-source posture", () => {
  const home = read("app/page.tsx");
  assert.match(home, /See what AI/u);
  assert.match(home, /Queries, not conversations/u);
  assert.match(home, /AGPL-3\.0/u);
  assert.match(home, /Estimated stays|Observed stays observed/u);
});

test("ships stable SEO, methodology and legal surfaces", () => {
  for (const path of [
    "app/sitemap.ts",
    "app/robots.ts",
    "app/methodology/page.tsx",
    "app/privacy/page.tsx",
    "app/terms/page.tsx",
    "app/open-source/page.tsx",
    "app/learn/page.tsx",
  ]) {
    assert.ok(read(path).length > 100, path);
  }
  assert.match(
    read("app/learn/[slug]/page.tsx"),
    /application\/ld\+json|StructuredData/u,
  );
  assert.match(read("app/layout.tsx"), /metadataBase/u);
});

test("methodology never treats estimated fan-outs as observed demand", () => {
  const method = read("app/methodology/page.tsx");
  assert.match(
    method,
    /Estimated fan-outs never enter\s+observed-query aggregates/u,
  );
  assert.match(method, /not search\s+volume/u);
});
