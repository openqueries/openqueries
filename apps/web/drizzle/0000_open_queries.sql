CREATE TABLE `query_events` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `event_id` text NOT NULL,
  `donor_tag` text NOT NULL,
  `platform` text NOT NULL,
  `source_kind` text NOT NULL,
  `query_text` text NOT NULL,
  `normalized_query` text NOT NULL,
  `query_hash` text NOT NULL,
  `language` text,
  `locale` text,
  `captured_at` text NOT NULL,
  `received_at` text NOT NULL,
  `extension_version` text NOT NULL,
  `adapter_version` text NOT NULL,
  `parent_event_id` text,
  `expires_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `query_events_event_id_unique` ON `query_events` (`event_id`);
CREATE INDEX `query_events_time_idx` ON `query_events` (`captured_at`);
CREATE INDEX `query_events_platform_time_idx` ON `query_events` (`platform`,`captured_at`);
CREATE INDEX `query_events_query_hash_idx` ON `query_events` (`query_hash`);
CREATE INDEX `query_events_donor_idx` ON `query_events` (`donor_tag`);
CREATE INDEX `query_events_expiry_idx` ON `query_events` (`expires_at`);
--> statement-breakpoint
CREATE TABLE `deleted_donors` (
  `donor_tag` text PRIMARY KEY NOT NULL,
  `deleted_at` text NOT NULL,
  `expires_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `fanout_daily_usage` (
  `donor_tag` text NOT NULL,
  `usage_date` text NOT NULL,
  `request_count` integer DEFAULT 0 NOT NULL,
  `updated_at` text NOT NULL
);
CREATE UNIQUE INDEX `fanout_daily_usage_donor_date_unique` ON `fanout_daily_usage` (`donor_tag`,`usage_date`);
--> statement-breakpoint
CREATE TABLE `fanout_runs` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `request_id` text NOT NULL,
  `donor_tag` text NOT NULL,
  `platform` text NOT NULL,
  `seed_hash` text NOT NULL,
  `generator_model` text NOT NULL,
  `scorer_model` text NOT NULL,
  `candidate_count` integer NOT NULL,
  `duration_ms` integer NOT NULL,
  `generator_input_tokens` integer,
  `generator_output_tokens` integer,
  `scorer_input_tokens` integer,
  `scorer_output_tokens` integer,
  `created_at` text NOT NULL
);
CREATE UNIQUE INDEX `fanout_runs_request_unique` ON `fanout_runs` (`request_id`);
CREATE INDEX `fanout_runs_time_idx` ON `fanout_runs` (`created_at`);
--> statement-breakpoint
CREATE TABLE `query_daily_aggregates` (
  `aggregate_date` text NOT NULL,
  `platform` text NOT NULL,
  `source_kind` text NOT NULL,
  `normalized_query` text NOT NULL,
  `display_query` text NOT NULL,
  `query_hash` text NOT NULL,
  `event_count` integer NOT NULL,
  `distinct_donor_count` integer NOT NULL,
  `created_at` text NOT NULL
);
CREATE UNIQUE INDEX `query_daily_aggregates_key_unique` ON `query_daily_aggregates` (`aggregate_date`,`platform`,`source_kind`,`query_hash`);
CREATE INDEX `query_daily_aggregates_query_idx` ON `query_daily_aggregates` (`query_hash`,`aggregate_date`);
PRAGMA optimize;
