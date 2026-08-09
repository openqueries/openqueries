import {
  index,
  integer,
  real,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

export const queryEvents = sqliteTable(
  "query_events",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    eventId: text("event_id").notNull(),
    donorTag: text("donor_tag").notNull(),
    platform: text("platform").notNull(),
    sourceKind: text("source_kind").notNull(),
    queryText: text("query_text").notNull(),
    normalizedQuery: text("normalized_query").notNull(),
    queryHash: text("query_hash").notNull(),
    language: text("language"),
    locale: text("locale"),
    capturedAt: text("captured_at").notNull(),
    receivedAt: text("received_at").notNull(),
    extensionVersion: text("extension_version").notNull(),
    adapterVersion: text("adapter_version").notNull(),
    parentEventId: text("parent_event_id"),
    expiresAt: text("expires_at").notNull(),
  },
  (table) => [
    uniqueIndex("query_events_event_id_unique").on(table.eventId),
    index("query_events_time_idx").on(table.capturedAt),
    index("query_events_platform_time_idx").on(
      table.platform,
      table.capturedAt,
    ),
    index("query_events_query_hash_idx").on(table.queryHash),
    index("query_events_donor_idx").on(table.donorTag),
    index("query_events_expiry_idx").on(table.expiresAt),
  ],
);

export const deletedDonors = sqliteTable("deleted_donors", {
  donorTag: text("donor_tag").primaryKey(),
  deletedAt: text("deleted_at").notNull(),
  expiresAt: text("expires_at").notNull(),
});

export const fanOutDailyUsage = sqliteTable(
  "fanout_daily_usage",
  {
    donorTag: text("donor_tag").notNull(),
    usageDate: text("usage_date").notNull(),
    requestCount: integer("request_count").notNull().default(0),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [
    uniqueIndex("fanout_daily_usage_donor_date_unique").on(
      table.donorTag,
      table.usageDate,
    ),
  ],
);

export const fanOutRunsV2 = sqliteTable(
  "fanout_runs_v2",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    requestId: text("request_id").notNull(),
    donorTag: text("donor_tag").notNull(),
    platform: text("platform").notNull(),
    seedHash: text("seed_hash").notNull(),
    method: text("method").notNull(),
    model: text("model").notNull(),
    promptVersion: text("prompt_version").notNull(),
    sampleCount: integer("sample_count"),
    candidateCount: integer("candidate_count").notNull(),
    durationMs: integer("duration_ms").notNull(),
    inputTokens: integer("input_tokens"),
    outputTokens: integer("output_tokens"),
    createdAt: text("created_at").notNull(),
  },
  (table) => [
    uniqueIndex("fanout_runs_v2_request_unique").on(table.requestId),
    index("fanout_runs_v2_time_idx").on(table.createdAt),
    index("fanout_runs_v2_donor_idx").on(table.donorTag),
  ],
);

export const queryDailyAggregates = sqliteTable(
  "query_daily_aggregates",
  {
    aggregateDate: text("aggregate_date").notNull(),
    platform: text("platform").notNull(),
    sourceKind: text("source_kind").notNull(),
    normalizedQuery: text("normalized_query").notNull(),
    displayQuery: text("display_query").notNull(),
    queryHash: text("query_hash").notNull(),
    eventCount: integer("event_count").notNull(),
    distinctDonorCount: integer("distinct_donor_count").notNull(),
    createdAt: text("created_at").notNull(),
  },
  (table) => [
    uniqueIndex("query_daily_aggregates_key_unique").on(
      table.aggregateDate,
      table.platform,
      table.sourceKind,
      table.queryHash,
    ),
    index("query_daily_aggregates_query_idx").on(
      table.queryHash,
      table.aggregateDate,
    ),
  ],
);
