import assert from "node:assert/strict";
import test from "node:test";

import sitemap from "../app/sitemap";
import type { ContentSection } from "../lib/content";
import { learnArticles } from "../lib/learn";
import { topicPages } from "../lib/topics";

const staticRoutes = [
  "/",
  "/install",
  "/methodology",
  "/learn",
  "/open-source",
  "/privacy",
  "/terms",
  "/support",
  "/security",
];
const topicRoutes = topicPages.map((topic) => `/${topic.slug}`);
const articleRoutes = learnArticles.map((article) => `/learn/${article.slug}`);
const publicRoutes = new Set([
  ...staticRoutes,
  ...topicRoutes,
  ...articleRoutes,
]);

const approvedPrimaryTerms = new Map([
  ["chatgpt-search-queries", "chatgpt search"],
  ["chatgpt-search-history", "chatgpt search history"],
  ["claude-web-search", "claude web search"],
  ["google-ai-overviews", "google ai overviews"],
  ["fan-out-queries", "fan-out"],
  ["ai-search-visibility", "ai visibility tool"],
  ["ai-search-optimization", "ai search optimization"],
  ["generative-engine-optimization", "generative engine optimization"],
  ["answer-engine-optimization", "answer engine optimization"],
]);

function sectionText(sections: ContentSection[]) {
  return sections
    .flatMap((section) => [
      section.heading,
      ...(section.paragraphs ?? []),
      ...(section.bullets ?? []),
      ...(section.steps?.flatMap((step) => [step.title, step.text]) ?? []),
      ...(section.table?.headers ?? []),
      ...(section.table?.rows.flat() ?? []),
      ...(section.example
        ? [
            section.example.title,
            section.example.input,
            section.example.output,
            section.example.note,
          ]
        : []),
      section.callout ?? "",
    ])
    .join(" ");
}

function wordCount(text: string) {
  return text.split(/[^A-Za-z0-9]+/u).filter(Boolean).length;
}

function pageText(page: {
  directAnswer: string;
  keyTakeaways: string[];
  sections: ContentSection[];
}) {
  return [
    page.directAnswer,
    ...page.keyTakeaways,
    sectionText(page.sections),
  ].join(" ");
}

function richArtifactCount(sections: ContentSection[]) {
  return sections.filter(
    (section) =>
      section.steps?.length ||
      section.table?.rows.length ||
      section.example ||
      section.equations?.length ||
      section.bullets?.length,
  ).length;
}

test("keeps one unique canonical for every approved intent", () => {
  assert.equal(topicPages.length, 9);
  assert.equal(learnArticles.length, 4);

  for (const values of [
    topicPages.map((topic) => topic.slug),
    topicPages.map((topic) => topic.title),
    topicPages.map((topic) => topic.description),
    learnArticles.map((article) => article.slug),
    learnArticles.map((article) => article.title),
    learnArticles.map((article) => article.description),
  ]) {
    assert.equal(new Set(values).size, values.length);
  }

  assert.deepEqual(topicRoutes, [
    "/chatgpt-search-queries",
    "/chatgpt-search-history",
    "/claude-web-search",
    "/google-ai-overviews",
    "/fan-out-queries",
    "/ai-search-visibility",
    "/ai-search-optimization",
    "/generative-engine-optimization",
    "/answer-engine-optimization",
  ]);
});

test("every pillar meets the evidence and internal-link contract", () => {
  for (const topic of topicPages) {
    assert.ok(topic.directAnswer.length >= 100, topic.slug);
    assert.ok(topic.sections.length >= 7, `${topic.slug}: section depth`);
    assert.ok(topic.sources.length >= 3, `${topic.slug}: source breadth`);
    assert.ok(topic.about.length >= 2, topic.slug);
    assert.ok(topic.keyTakeaways.length >= 4, `${topic.slug}: takeaways`);
    assert.ok(topic.readMinutes >= 10, `${topic.slug}: read time`);
    assert.ok(
      wordCount(pageText(topic)) >= 1_200,
      `${topic.slug}: publishable word floor`,
    );
    assert.ok(
      richArtifactCount(topic.sections) >= 3,
      `${topic.slug}: tables, steps and examples`,
    );
    assert.match(
      `${topic.title} ${topic.description} ${pageText(topic)}`.toLowerCase(),
      new RegExp(approvedPrimaryTerms.get(topic.slug) ?? "(?!)", "u"),
      `${topic.slug}: approved canonical term`,
    );
    assert.match(topic.publishedAt, /^\d{4}-\d{2}-\d{2}$/u);
    assert.match(topic.updatedAt, /^\d{4}-\d{2}-\d{2}$/u);

    const sectionIds = topic.sections.map((section) => section.id);
    assert.equal(new Set(sectionIds).size, sectionIds.length, topic.slug);
    assert.ok(
      topic.sections.some((section) => section.steps?.length),
      `${topic.slug}: workflow`,
    );
    assert.ok(
      topic.sections.some((section) => section.example),
      `${topic.slug}: example`,
    );
    assert.ok(
      topic.sections.some(
        (section) =>
          section.id.includes("limit") ||
          section.heading.toLowerCase().includes("limit"),
      ),
      `${topic.slug}: limitations`,
    );

    const related = topic.related.map((link) => link.href);
    assert.ok(related.filter((href) => href.startsWith("/learn/")).length >= 2);
    assert.ok(related.filter((href) => topicRoutes.includes(href)).length >= 2);
    assert.ok(related.includes("/install") || related.includes("/methodology"));
  }
});

test("every authority article meets the depth and link contract", () => {
  for (const article of learnArticles) {
    assert.ok(article.directAnswer.length >= 100, article.slug);
    assert.ok(article.sections.length >= 7, `${article.slug}: section depth`);
    assert.ok(article.sources.length >= 3, `${article.slug}: source breadth`);
    assert.ok(article.about.length >= 2, article.slug);
    assert.ok(article.keyTakeaways.length >= 4, `${article.slug}: takeaways`);
    assert.ok(article.readMinutes >= 10, `${article.slug}: read time`);
    assert.ok(
      wordCount(pageText(article)) >= 1_200,
      `${article.slug}: publishable word floor`,
    );
    assert.ok(
      richArtifactCount(article.sections) >= 3,
      `${article.slug}: tables, steps and examples`,
    );

    const related = article.related.map((link) => link.href);
    assert.ok(related.filter((href) => topicRoutes.includes(href)).length >= 2);
    assert.ok(related.includes("/install") || related.includes("/methodology"));
  }
});

test("all contextual links resolve and every content page has an inbound link", () => {
  const inbound = new Map(
    [...topicRoutes, ...articleRoutes].map((route) => [route, 0]),
  );

  for (const page of [...topicPages, ...learnArticles]) {
    for (const link of page.related) {
      assert.ok(publicRoutes.has(link.href), `${link.href} from ${page.slug}`);
      if (inbound.has(link.href)) {
        inbound.set(link.href, (inbound.get(link.href) ?? 0) + 1);
      }
    }
  }

  for (const route of articleRoutes) {
    inbound.set(route, (inbound.get(route) ?? 0) + 1);
  }
  for (const route of topicRoutes) {
    inbound.set(route, (inbound.get(route) ?? 0) + 1);
  }

  for (const [route, count] of inbound) {
    assert.ok(count > 0, route);
  }
});

test("source and claim guardrails remain explicit", () => {
  for (const page of [...topicPages, ...learnArticles]) {
    for (const source of page.sources) {
      assert.match(source.url, /^https:\/\//u, `${page.slug}: ${source.label}`);
      assert.ok(source.publisher.length > 1);
      assert.match(source.accessedAt, /^\d{4}-\d{2}-\d{2}$/u);
      assert.ok(source.supports.length >= 60, `${page.slug}: source scope`);
    }
  }

  const visibility = topicPages.find(
    (topic) => topic.slug === "ai-search-visibility",
  );
  assert.ok(visibility);
  const visibilityText = `${visibility.title} ${visibility.description} ${visibility.directAnswer} ${sectionText(visibility.sections)}`;
  assert.match(visibilityText, /AI visibility tool/u);
  assert.match(visibilityText, /LLM visibility/u);
  assert.match(visibilityText, /AI search monitoring/u);
  assert.match(visibilityText, /not a complete|does not become/u);

  const history = topicPages.find(
    (topic) => topic.slug === "chatgpt-search-history",
  );
  assert.ok(history);
  assert.match(
    `${history.directAnswer} ${sectionText(history.sections)}`,
    /not (?:a copy of )?chat history|never uses the phrase to imply access to chat history/iu,
  );

  const allText = [...topicPages, ...learnArticles]
    .map((page) => `${page.directAnswer} ${sectionText(page.sections)}`)
    .join(" ");
  assert.match(allText, /estimated fan-out|estimated queries/iu);
  assert.match(allText, /observed quer/iu);
});

test("authority pages do not reuse body paragraphs", () => {
  const owners = new Map<string, string>();

  for (const page of [...topicPages, ...learnArticles]) {
    for (const section of page.sections) {
      for (const paragraph of section.paragraphs) {
        const normalized = paragraph
          .toLowerCase()
          .replace(/[^a-z0-9]+/gu, " ")
          .trim();
        assert.ok(normalized.length >= 80, `${page.slug}: thin paragraph`);
        assert.equal(
          owners.get(normalized),
          undefined,
          `${page.slug}: duplicates ${owners.get(normalized)}`,
        );
        owners.set(normalized, page.slug);
      }
    }
  }
});

test("sitemap contains every public route exactly once", () => {
  const entries = sitemap();
  assert.equal(entries.length, 22);
  assert.equal(new Set(entries.map((entry) => entry.url)).size, entries.length);

  for (const route of publicRoutes) {
    const expected =
      route === "/"
        ? "https://openqueries.org/"
        : `https://openqueries.org${route}`;
    assert.equal(
      entries.filter((entry) => entry.url === expected).length,
      1,
      route,
    );
  }
});
