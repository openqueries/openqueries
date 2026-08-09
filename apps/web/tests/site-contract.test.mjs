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
  assert.match(home, /ProviderLogo provider="chatgpt"/u);
  assert.match(home, /ProviderLogo provider="claude"/u);
  assert.match(home, /ProviderLogo provider="google"/u);
  assert.doesNotMatch(home, /No universal GPT ranker/u);
  assert.doesNotMatch(home, /className="method-preview"/u);
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
    "app/install/page.tsx",
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
  assert.match(method, /GPT-5\.6 Luna/u);
  assert.match(method, /Wilson 95% confidence interval/u);
  assert.doesNotMatch(method, /shared\s+low-cost scorer/u);
});

test("publishes the full technical estimator article", () => {
  const learn = read("lib/learn.ts");
  assert.match(learn, /estimating-fan-out-queries-with-log-probabilities/u);
  assert.match(learn, /UTF-8 byte offsets/u);
  assert.match(learn, /CI₉₅/u);
});
