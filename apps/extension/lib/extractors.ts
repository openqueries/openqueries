import type { Platform, SourceKind } from "@openqueries/contracts";
import { normalizeQuery } from "@openqueries/query-core";

export type ExtractedQuery = {
  element: Element;
  platform: Platform;
  query: string;
  sourceKind: SourceKind;
};

const EXPLICIT_CONTAINER_SELECTOR = [
  "[data-testid*='web-search' i]",
  "[data-testid*='search-query' i]",
  "[data-tool-name*='search' i]",
  "[data-tool*='search' i]",
  "[aria-label*='web search' i]",
  "[aria-label*='searched for' i]",
  "details[data-testid*='search' i]",
].join(",");

const QUERY_NODE_SELECTOR = [
  "[data-search-query]",
  "[data-query]",
  "[aria-label*='search query' i]",
  "[aria-label*='searched for' i]",
  "a[href*='google.com/search?']",
  "a[href*='/search?q=']",
].join(",");

function queryFromUrl(value: string, base: string): string {
  try {
    return new URL(value, base).searchParams.get("q") ?? "";
  } catch {
    return "";
  }
}

function queryFromElement(element: Element, base: string): string {
  const attributes = ["data-search-query", "data-query"];
  for (const name of attributes) {
    const value = element.getAttribute(name);
    if (value) return normalizeQuery(value);
  }
  if (element instanceof element.ownerDocument.defaultView!.HTMLAnchorElement) {
    const query = queryFromUrl(element.getAttribute("href") ?? "", base);
    if (query) return normalizeQuery(query);
  }
  const label = element.getAttribute("aria-label") ?? "";
  const labelMatch = label.match(
    /(?:search query|searched for|searching for)\s*[:–-]?\s*[“"]?(.+?)[”"]?$/iu,
  );
  if (labelMatch?.[1]) return normalizeQuery(labelMatch[1]);
  if (element.childElementCount === 0) {
    const text = normalizeQuery(element.textContent ?? "");
    if (
      text.length >= 2 &&
      text.length <= 500 &&
      !/^(?:web search|searched the web|searching)$/iu.test(text)
    )
      return text;
  }
  return "";
}

function isExplicitlySearchScoped(element: Element): boolean {
  return Boolean(element.closest(EXPLICIT_CONTAINER_SELECTOR));
}

function addQuery(
  output: ExtractedQuery[],
  seen: Set<string>,
  element: Element,
  platform: "chatgpt" | "claude",
  value: string,
): void {
  const query = normalizeQuery(value);
  const key = query.toLocaleLowerCase();
  if (!query || query.length > 500 || seen.has(key)) return;
  seen.add(key);
  output.push({
    element,
    platform,
    query,
    sourceKind: "observed_model_search",
  });
}

function textLines(element: Element): string[] {
  const rendered =
    element instanceof element.ownerDocument.defaultView!.HTMLElement &&
    typeof element.innerText === "string"
      ? element.innerText
      : (element.textContent ?? "");
  return rendered.split(/\r?\n/gu).map(normalizeQuery).filter(Boolean);
}

function hasSearchMarker(element: Element, pattern: RegExp): boolean {
  let current: Element | null = element;
  for (let depth = 0; current && depth < 10; depth += 1) {
    if (pattern.test(normalizeQuery(current.textContent ?? ""))) return true;
    current = current.parentElement;
  }
  return false;
}

function extractCurrentChatGptQueries(
  document: Document,
  output: ExtractedQuery[],
  seen: Set<string>,
): void {
  const marker =
    /(?:(?:searching|searched)\s+\d+\s+websites?|searched the web)/iu;
  for (const element of document.querySelectorAll(
    "svg[width='12'][height='12'] + span",
  )) {
    if (!hasSearchMarker(element, marker)) continue;
    addQuery(output, seen, element, "chatgpt", element.textContent ?? "");
  }
}

function extractCurrentClaudeQueries(
  document: Document,
  output: ExtractedQuery[],
  seen: Set<string>,
): void {
  for (const button of document.querySelectorAll(
    "button[disabled][aria-disabled='true']",
  )) {
    const resultNode = button.querySelector("p");
    const resultLabel = normalizeQuery(resultNode?.textContent ?? "");
    if (!/^\d{1,4}\s+[\p{L}][\p{L} .-]{1,40}$/iu.test(resultLabel)) continue;
    const explicitQuery = button.querySelector(".truncate");
    if (!explicitQuery || explicitQuery.childElementCount > 0) continue;
    const lines = textLines(button);
    const query = normalizeQuery(
      explicitQuery?.textContent ?? lines.slice(0, -1).join(" "),
    );
    addQuery(output, seen, button, "claude", query);
  }
}

export function extractAssistantQueries(
  document: Document,
  platform: "chatgpt" | "claude",
): ExtractedQuery[] {
  const output: ExtractedQuery[] = [];
  const seen = new Set<string>();
  if (platform === "chatgpt")
    extractCurrentChatGptQueries(document, output, seen);
  else extractCurrentClaudeQueries(document, output, seen);

  for (const element of document.querySelectorAll(QUERY_NODE_SELECTOR)) {
    if (
      !isExplicitlySearchScoped(element) &&
      !element.hasAttribute("data-search-query")
    )
      continue;
    const query = queryFromElement(
      element,
      document.location?.href ?? "https://example.invalid/",
    );
    addQuery(output, seen, element, platform, query);
  }
  return output;
}

const AI_CONTAINER_SELECTOR = [
  "[data-ai-overview]",
  "[data-ai-mode]",
  "[data-testid*='ai-overview' i]",
  "[data-attrid*='ai_overview' i]",
].join(",");

function googleAiContainers(document: Document): Element[] {
  const direct = [...document.querySelectorAll(AI_CONTAINER_SELECTOR)];
  if (direct.length) return direct;
  const markers =
    /^(?:ai overview|ai mode|ki-überblick|vue d’ensemble ia|resumen creado con ia)$/iu;
  const containers: Element[] = [];
  for (const element of document.querySelectorAll(
    "h1,h2,h3,[role='heading']",
  )) {
    if (!markers.test(normalizeQuery(element.textContent ?? ""))) continue;
    const container = element.closest("section") ?? element.parentElement;
    if (container) containers.push(container);
  }
  return containers;
}

export function extractGoogleQueries(
  document: Document,
  location: Location,
): ExtractedQuery[] {
  const output: ExtractedQuery[] = [];
  const seed = normalizeQuery(
    new URLSearchParams(location.search).get("q") ?? "",
  );
  if (seed) {
    output.push({
      element: document.documentElement,
      platform: "google",
      query: seed,
      sourceKind: "google_user_search",
    });
  }
  const seen = new Set(seed ? [seed.toLocaleLowerCase()] : []);
  for (const container of googleAiContainers(document)) {
    for (const element of container.querySelectorAll(QUERY_NODE_SELECTOR)) {
      const query = queryFromElement(element, location.href);
      const key = query.toLocaleLowerCase();
      if (!query || seen.has(key)) continue;
      seen.add(key);
      output.push({
        element,
        platform: "google",
        query,
        sourceKind: "observed_expanded_query",
      });
    }
  }
  return output;
}
