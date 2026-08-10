import { normalizeQuery } from "@openqueries/query-core";

const SEARCH_DESCRIPTOR =
  /(?:^|[._:/ -])(?:web[_ -]?search|search[_ -]?(?:tool|query|queries)|browser\.search)(?:$|[._:/ -])/iu;

function candidate(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const query = normalizeQuery(value);
  if (
    query.length < 2 ||
    query.length > 500 ||
    /^(?:https?:\/\/|www\.)/iu.test(query) ||
    /^(?:searching|searched the web|web search|\d+\s+(?:results?|websites?))$/iu.test(
      query,
    )
  )
    return null;
  return query;
}

function descriptor(value: Record<string, unknown>, path: string): string {
  const direct = [
    value.type,
    value.kind,
    value.name,
    value.tool_name,
    value.recipient,
    value.operation,
  ];
  const author = value.author;
  if (author && typeof author === "object") {
    const record = author as Record<string, unknown>;
    direct.push(record.name, record.role);
  }
  return `${path} ${direct.filter((item) => typeof item === "string").join(" ")}`;
}

export function extractSearchQueriesFromPayload(payload: unknown): string[] {
  const output: string[] = [];
  const seenQueries = new Set<string>();
  const seenObjects = new WeakSet<object>();

  const add = (value: unknown) => {
    const query = candidate(value);
    if (!query) return;
    const key = query.toLocaleLowerCase();
    if (seenQueries.has(key)) return;
    seenQueries.add(key);
    output.push(query);
  };

  const addExplicitSearchValue = (value: unknown) => {
    if (typeof value === "string") {
      add(value);
      return;
    }
    if (Array.isArray(value)) {
      for (const item of value) addExplicitSearchValue(item);
      return;
    }
    if (!value || typeof value !== "object") return;
    const record = value as Record<string, unknown>;
    for (const key of ["query", "q", "text", "value"])
      addExplicitSearchValue(record[key]);
  };

  const walk = (value: unknown, path: string, depth: number) => {
    if (depth > 24 || value == null) return;
    if (typeof value === "string") {
      if (
        depth < 8 &&
        value.length <= 1_000_000 &&
        /(?:search_queries|search_query|web_search)/iu.test(value) &&
        /^[\s[{\"]/.test(value)
      ) {
        try {
          walk(JSON.parse(value), `${path}.$json`, depth + 1);
        } catch {
          // Ordinary prose and partial stream frames are intentionally ignored.
        }
      }
      return;
    }
    if (typeof value !== "object") return;
    if (seenObjects.has(value)) return;
    seenObjects.add(value);

    if (Array.isArray(value)) {
      for (let index = 0; index < value.length; index += 1)
        walk(value[index], `${path}[${index}]`, depth + 1);
      return;
    }

    const record = value as Record<string, unknown>;
    for (const key of ["search_queries", "searchQueries"]) {
      addExplicitSearchValue(record[key]);
    }
    for (const key of ["search_query", "searchQuery"])
      addExplicitSearchValue(record[key]);

    const searchScoped = SEARCH_DESCRIPTOR.test(descriptor(record, path));
    if (searchScoped) {
      add(record.query);
      const queries = record.queries;
      if (Array.isArray(queries)) {
        for (const query of queries) {
          if (typeof query === "string") add(query);
          else if (query && typeof query === "object")
            add((query as Record<string, unknown>).query);
        }
      }
      const input = record.input;
      if (input && typeof input === "object")
        add((input as Record<string, unknown>).query);
      const args = record.arguments ?? record.args;
      if (args && typeof args === "object")
        add((args as Record<string, unknown>).query);
    }

    for (const [key, child] of Object.entries(record))
      walk(child, `${path}.${key}`, depth + 1);
  };

  walk(payload, "$", 0);
  return output;
}

export function extractSearchQueriesFromTransport(text: string): string[] {
  const output: string[] = [];
  const seen = new Set<string>();
  const parsedFrames: unknown[] = [];
  const addPayload = (value: unknown) => {
    for (const query of extractSearchQueriesFromPayload(value)) {
      const key = query.toLocaleLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      output.push(query);
    }
  };

  const trimmed = text.trim();
  if (!trimmed) return output;
  try {
    const payload = JSON.parse(trimmed);
    parsedFrames.push(payload);
    addPayload(payload);
  } catch {
    for (const frame of text.split(/\r?\n\r?\n/gu)) {
      const data = frame
        .split(/\r?\n/gu)
        .filter((line) => line.startsWith("data:"))
        .map((line) => line.slice(5).trimStart())
        .join("\n")
        .trim();
      if (!data || data === "[DONE]") continue;
      try {
        const payload = JSON.parse(data);
        parsedFrames.push(payload);
        addPayload(payload);
      } catch {
        // Incomplete SSE frames are retained by the caller until complete.
      }
    }
  }

  // Anthropic streams tool input as JSON fragments between a search-scoped
  // content_block_start and content_block_stop. Reassemble only those tool
  // blocks; ordinary message deltas are never considered query candidates.
  const anthropicBlocks = new Map<
    string,
    { partialJson: string; searchScoped: boolean }
  >();
  for (const payload of parsedFrames) {
    if (!payload || typeof payload !== "object" || Array.isArray(payload))
      continue;
    const event = payload as Record<string, unknown>;
    const index = String(event.index ?? "0");
    if (event.type === "content_block_start") {
      const block = event.content_block;
      if (!block || typeof block !== "object" || Array.isArray(block)) continue;
      anthropicBlocks.set(index, {
        partialJson: "",
        searchScoped: SEARCH_DESCRIPTOR.test(
          descriptor(block as Record<string, unknown>, "$.content_block"),
        ),
      });
      continue;
    }
    const tracked = anthropicBlocks.get(index);
    if (!tracked) continue;
    if (event.type === "content_block_delta") {
      const delta = event.delta;
      if (delta && typeof delta === "object" && !Array.isArray(delta)) {
        const partial = (delta as Record<string, unknown>).partial_json;
        if (typeof partial === "string") tracked.partialJson += partial;
      }
      continue;
    }
    if (event.type !== "content_block_stop") continue;
    anthropicBlocks.delete(index);
    if (!tracked.searchScoped || !tracked.partialJson) continue;
    try {
      const input = JSON.parse(tracked.partialJson) as Record<string, unknown>;
      addPayload({ type: "web_search", input });
    } catch {
      // A malformed or incomplete tool input is ignored.
    }
  }
  return output;
}

export function takeCompleteSseFrames(buffer: string): {
  frames: string[];
  remainder: string;
} {
  const frames: string[] = [];
  let remainder = buffer;
  let boundary = remainder.search(/\r?\n\r?\n/u);
  while (boundary >= 0) {
    const separator = remainder.slice(boundary).match(/^\r?\n\r?\n/u)?.[0];
    if (!separator) break;
    frames.push(remainder.slice(0, boundary));
    remainder = remainder.slice(boundary + separator.length);
    boundary = remainder.search(/\r?\n\r?\n/u);
  }
  return { frames, remainder };
}
