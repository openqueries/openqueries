CREATE TABLE `query_events_simplified` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `event_id` text NOT NULL,
  `donor_tag` text NOT NULL,
  `platform` text NOT NULL,
  `source_kind` text NOT NULL,
  `query_text` text NOT NULL,
  `language` text,
  `locale` text,
  `captured_at` text NOT NULL,
  `received_at` text NOT NULL,
  `extension_version` text NOT NULL,
  `adapter_version` text NOT NULL,
  `expires_at` text NOT NULL
);
--> statement-breakpoint
INSERT INTO `query_events_simplified` (
  `id`, `event_id`, `donor_tag`, `platform`, `source_kind`, `query_text`,
  `language`, `locale`, `captured_at`, `received_at`, `extension_version`,
  `adapter_version`, `expires_at`
)
SELECT
  `id`, `event_id`, `donor_tag`, `platform`, `source_kind`, `query_text`,
  `language`, `locale`, `captured_at`, `received_at`, `extension_version`,
  `adapter_version`, `expires_at`
FROM `query_events`;
--> statement-breakpoint
DROP TABLE `query_events`;
--> statement-breakpoint
ALTER TABLE `query_events_simplified` RENAME TO `query_events`;
--> statement-breakpoint
CREATE UNIQUE INDEX `query_events_event_id_unique` ON `query_events` (`event_id`);
CREATE INDEX `query_events_time_idx` ON `query_events` (`captured_at`);
CREATE INDEX `query_events_platform_time_idx` ON `query_events` (`platform`,`captured_at`);
CREATE INDEX `query_events_donor_idx` ON `query_events` (`donor_tag`);
CREATE INDEX `query_events_expiry_idx` ON `query_events` (`expires_at`);
--> statement-breakpoint
DROP TABLE IF EXISTS `deleted_donors`;
DROP TABLE IF EXISTS `fanout_runs_v2`;
DROP TABLE IF EXISTS `query_daily_aggregates`;
PRAGMA optimize;
