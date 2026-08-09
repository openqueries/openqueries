CREATE TABLE `fanout_runs_v2` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `request_id` text NOT NULL,
  `donor_tag` text NOT NULL,
  `platform` text NOT NULL,
  `seed_hash` text NOT NULL,
  `method` text NOT NULL,
  `model` text NOT NULL,
  `prompt_version` text NOT NULL,
  `sample_count` integer,
  `candidate_count` integer NOT NULL,
  `duration_ms` integer NOT NULL,
  `input_tokens` integer,
  `output_tokens` integer,
  `created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `fanout_runs_v2_request_unique` ON `fanout_runs_v2` (`request_id`);
CREATE INDEX `fanout_runs_v2_time_idx` ON `fanout_runs_v2` (`created_at`);
CREATE INDEX `fanout_runs_v2_donor_idx` ON `fanout_runs_v2` (`donor_tag`);
--> statement-breakpoint
DROP TABLE `fanout_runs`;
PRAGMA optimize;
