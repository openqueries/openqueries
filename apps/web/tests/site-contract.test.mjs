import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const root = new URL("..", import.meta.url).pathname;
const read = (path) => readFileSync(join(root, path), "utf8");

test("publishes the mission, privacy boundary and open-source posture", () => {
  const home = read("app/page.tsx");
  assert.match(home, /See the queries behind AI search/u);
  assert.match(home, /Open AI search field guide/u);
  assert.match(home, /Intent pillars/u);
  assert.match(home, /href: "\/ai-search-optimization"/u);
  assert.match(home, /href: "\/ai-search-visibility"/u);
  assert.match(home, /href: "\/generative-engine-optimization"/u);
  assert.match(home, /href: "\/answer-engine-optimization"/u);
  assert.match(home, /href: "\/fan-out-queries"/u);
  assert.match(home, /Queries, not conversations/u);
  assert.match(home, /AGPL-3\.0/u);
  assert.match(home, /Estimated stays|Observed stays observed/u);
  assert.match(home, /ProviderLogo provider="chatgpt"/u);
  assert.match(home, /ProviderLogo provider="claude"/u);
  assert.match(home, /ProviderLogo provider="google"/u);
  assert.doesNotMatch(home, /No universal GPT ranker/u);
  assert.doesNotMatch(home, /className="method-preview"/u);
});

test("links every authority article and provider pillar from homepage SSR", () => {
  const home = read("app/page.tsx");
  const learn = read("lib/learn.ts");

  for (const slug of [
    "what-are-fan-out-queries",
    "aeo-geo-query-data",
    "observed-vs-estimated-ai-queries",
    "estimating-fan-out-queries-with-log-probabilities",
  ]) {
    assert.match(learn, new RegExp(`slug: "${slug}"`, "u"));
  }
  assert.match(home, /learnArticles\.map/u);
  assert.doesNotMatch(home, /learnArticles\.slice/u);
  assert.match(home, /href="\/chatgpt-search-queries"/u);
  assert.match(home, /href="\/claude-web-search"/u);
  assert.match(home, /href="\/google-ai-overviews"/u);
});

test("connects demand-led topic pages to the install funnel", () => {
  assert.match(read("app/components.tsx"), /href="\/ai-search-visibility"/u);
  assert.match(read("app/components.tsx"), /href="\/ai-search-optimization"/u);
  assert.match(read("lib/topics.ts"), /label: "Install Open Queries"/u);
  assert.match(read("lib/topics.ts"), /label: "Inspect queries in Chrome"/u);
});

test("publishes complete content layouts and structured data", () => {
  const topic = read("app/[topic]/page.tsx");
  const article = read("app/learn/[slug]/page.tsx");
  const components = read("app/content-components.tsx");

  for (const source of [topic, article]) {
    assert.match(source, /BreadcrumbList/u);
    assert.match(source, /datePublished/u);
    assert.match(source, /dateModified/u);
    assert.match(source, /mainEntityOfPage/u);
    assert.match(source, /isPartOf/u);
    assert.match(source, /DirectAnswer/u);
    assert.match(source, /ArticleToc/u);
    assert.match(source, /SourceList/u);
    assert.match(source, /RelatedLinks/u);
  }

  assert.match(components, /className="evidence-table"/u);
  assert.match(components, /className="content-callout"/u);
  assert.match(read("app/install/page.tsx"), /AI search extension/u);
});

test("ships stable SEO, methodology and legal surfaces", () => {
  for (const path of [
    "app/sitemap.ts",
    "app/robots.ts",
    "app/methodology/page.tsx",
    "app/privacy/page.tsx",
    "app/security/page.tsx",
    "app/support/page.tsx",
    "app/terms/page.tsx",
    "app/open-source/page.tsx",
    "app/learn/page.tsx",
    "app/install/page.tsx",
  ]) {
    assert.ok(read(path).length > 100, path);
  }
  assert.match(read("app/math.tsx"), /renderToString/u);
  assert.match(read("app/math.tsx"), /htmlAndMathml/u);
  assert.match(read("worker/index.ts"), /font-src 'self' data:/u);
  assert.match(
    read("public/.well-known/security.txt"),
    /Contact: mailto:security@openqueries\.org/u,
  );
  assert.match(
    read("app/learn/[slug]/page.tsx"),
    /application\/ld\+json|StructuredData/u,
  );
  assert.match(read("app/layout.tsx"), /metadataBase/u);
  assert.match(
    read("lib/site.ts"),
    /chromewebstore\.google\.com\/detail\/ieglcpgkjnieapajeldfhkjpllkcamkl/u,
  );
  assert.match(read("wrangler.jsonc"), /ieglcpgkjnieapajeldfhkjpllkcamkl/u);
});

test("methodology never treats estimated fan-outs as observed demand", () => {
  const method = read("app/methodology/page.tsx");
  assert.match(
    method,
    /Estimated fan-outs are\s+returned to the\s+extension and never stored as observed queries/u,
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
