import {
  DeleteDonationsV1Schema,
  DonationBatchV1Schema,
  FanOutRequestV1Schema,
  type FanOutResponseV1,
  type PublicConfigV1,
} from "@openqueries/contracts";
import {
  normalizedQueryKey,
  querySafety,
  sha256Hex,
} from "@openqueries/query-core";

import type { AppEnv, DonationQueueMessage } from "./env";
import { generateFanOuts } from "./providers";

const RAW_RETENTION_MONTHS = 13;
const AGGREGATE_DONOR_THRESHOLD = 5;
const DAILY_FANOUT_LIMIT = 10;

function corsOrigin(request: Request, env: AppEnv): string | null {
  const origin = request.headers.get("origin");
  if (!origin) return null;
  if (/^https?:\/\/localhost(?::\d+)?$/u.test(origin)) return origin;
  if (origin === env.SITE_ORIGIN) return origin;
  if (!origin.startsWith("chrome-extension://")) return null;
  const id = origin.slice("chrome-extension://".length);
  const allowed = env.ALLOWED_EXTENSION_IDS.split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  return allowed.length === 0 || allowed.includes(id) ? origin : null;
}

function corsHeaders(request: Request, env: AppEnv): HeadersInit {
  const origin = corsOrigin(request, env);
  return {
    ...(origin ? { "access-control-allow-origin": origin } : {}),
    "access-control-allow-methods": "GET,POST,DELETE,OPTIONS",
    "access-control-allow-headers": "content-type",
    "access-control-max-age": "86400",
    vary: "origin",
  };
}

function json(
  request: Request,
  env: AppEnv,
  value: unknown,
  status = 200,
  additional: HeadersInit = {},
): Response {
  return Response.json(value, {
    status,
    headers: { ...corsHeaders(request, env), ...additional },
  });
}

function errorResponse(
  request: Request,
  env: AppEnv,
  status: number,
  error: string,
): Response {
  return json(request, env, { error }, status, { "cache-control": "no-store" });
}

function addMonths(iso: string, months: number): string {
  const date = new Date(iso);
  date.setUTCMonth(date.getUTCMonth() + months);
  return date.toISOString();
}

async function publicConfig(request: Request, env: AppEnv): Promise<Response> {
  const payload: PublicConfigV1 = {
    schemaVersion: 1,
    supportedPlatforms: ["chatgpt", "claude", "google"],
    dailyFanOutLimit: DAILY_FANOUT_LIMIT,
    rawRetentionDays: 395,
    aggregateDonorThreshold: AGGREGATE_DONOR_THRESHOLD,
    minimumAdapterVersions: {
      chatgpt: "1.0.0",
      claude: "1.0.0",
      google: "1.0.0",
    },
  };
  return json(request, env, payload, 200, {
    "cache-control": "public, max-age=300",
  });
}

async function ingestEvents(request: Request, env: AppEnv): Promise<Response> {
  const parsed = DonationBatchV1Schema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success)
    return errorResponse(request, env, 400, "Invalid donation payload");
  const receivedAt = new Date().toISOString();
  const messages: DonationQueueMessage[] = [];
  let rejected = 0;
  for (const event of parsed.data.events) {
    const safety = querySafety(event.query);
    if (!safety.safe) {
      rejected += 1;
      continue;
    }
    const normalizedQuery = normalizedQueryKey(
      event.query,
      event.locale ?? "en",
    );
    messages.push({
      schemaVersion: 1,
      donorTag: parsed.data.donorTag,
      event,
      normalizedQuery,
      queryHash: await sha256Hex(normalizedQuery),
      receivedAt,
      expiresAt: addMonths(receivedAt, RAW_RETENTION_MONTHS),
    });
  }
  if (messages.length) {
    await env.DONATION_QUEUE.sendBatch(
      messages.map((body) => ({ body, contentType: "json" })),
    );
  }
  console.log(
    JSON.stringify({
      event: "donation_batch_queued",
      accepted: messages.length,
      rejected,
    }),
  );
  return json(request, env, { accepted: messages.length, rejected }, 202, {
    "cache-control": "no-store",
  });
}

async function incrementDailyUsage(
  env: AppEnv,
  donorTag: string,
  now: string,
): Promise<boolean> {
  const date = now.slice(0, 10);
  const row = await env.DB.prepare(
    `
    INSERT INTO fanout_daily_usage (donor_tag, usage_date, request_count, updated_at)
    VALUES (?, ?, 1, ?)
    ON CONFLICT(donor_tag, usage_date) DO UPDATE SET
      request_count = request_count + 1,
      updated_at = excluded.updated_at
    WHERE request_count < ?
    RETURNING request_count
  `,
  )
    .bind(donorTag, date, now, DAILY_FANOUT_LIMIT)
    .first<{ request_count: number }>();
  return Boolean(row && row.request_count <= DAILY_FANOUT_LIMIT);
}

function clientRateKey(request: Request): string {
  return request.headers.get("cf-connecting-ip") || "local-development";
}

async function fanOuts(
  request: Request,
  env: AppEnv,
  ctx: ExecutionContext,
): Promise<Response> {
  const parsed = FanOutRequestV1Schema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success)
    return errorResponse(request, env, 400, "Invalid fan-out request");
  const safety = querySafety(parsed.data.seed.query);
  if (!safety.safe)
    return errorResponse(
      request,
      env,
      422,
      "This query may contain sensitive data and cannot be sent to a model",
    );

  try {
    const rate = await env.FANOUT_RATE_LIMITER.limit({
      key: clientRateKey(request),
    });
    if (!rate.success)
      return errorResponse(
        request,
        env,
        429,
        "Too many fan-out requests; try again shortly",
      );
  } catch (rateLimitError) {
    console.warn(
      JSON.stringify({
        event: "rate_limit_binding_unavailable",
        error:
          rateLimitError instanceof Error ? rateLimitError.name : "unknown",
      }),
    );
  }

  const now = new Date().toISOString();
  if (!(await incrementDailyUsage(env, parsed.data.donorTag, now))) {
    return errorResponse(
      request,
      env,
      429,
      `Daily limit of ${DAILY_FANOUT_LIMIT} fan-out requests reached`,
    );
  }

  const started = Date.now();
  try {
    const generated = await generateFanOuts(
      env,
      parsed.data.platform,
      parsed.data.seed.query,
      parsed.data.seed.language,
    );
    const generatedAt = new Date().toISOString();
    const response: FanOutResponseV1 = {
      schemaVersion: 1,
      requestId: parsed.data.requestId,
      sourceQuery: parsed.data.seed.query,
      platform: parsed.data.platform,
      fanOuts: generated.candidates,
      method: "provider_matched_generation_with_logprob_scoring",
      generatorModel: generated.generatorModel,
      scorerModel: generated.scorerModel,
      generatedAt,
    };
    const seedHashPromise = sha256Hex(
      normalizedQueryKey(parsed.data.seed.query),
    );
    ctx.waitUntil(
      seedHashPromise
        .then((seedHash) =>
          env.DB.prepare(
            `
      INSERT OR IGNORE INTO fanout_runs (
        request_id, donor_tag, platform, seed_hash, generator_model, scorer_model,
        candidate_count, duration_ms, generator_input_tokens, generator_output_tokens,
        scorer_input_tokens, scorer_output_tokens, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
          )
            .bind(
              parsed.data.requestId,
              parsed.data.donorTag,
              parsed.data.platform,
              seedHash,
              generated.generatorModel,
              generated.scorerModel,
              generated.candidates.length,
              Date.now() - started,
              generated.generatorUsage.input,
              generated.generatorUsage.output,
              generated.scorerUsage.input,
              generated.scorerUsage.output,
              generatedAt,
            )
            .run(),
        )
        .catch((metadataError) => {
          console.error(
            JSON.stringify({
              event: "fanout_metadata_write_failed",
              requestId: parsed.data.requestId,
              error:
                metadataError instanceof Error ? metadataError.name : "unknown",
            }),
          );
        }),
    );
    console.log(
      JSON.stringify({
        event: "fanout_generated",
        platform: parsed.data.platform,
        requestId: parsed.data.requestId,
        count: generated.candidates.length,
        durationMs: Date.now() - started,
      }),
    );
    return json(request, env, response, 200, { "cache-control": "no-store" });
  } catch (generationError) {
    console.error(
      JSON.stringify({
        event: "fanout_generation_failed",
        platform: parsed.data.platform,
        requestId: parsed.data.requestId,
        error:
          generationError instanceof Error
            ? generationError.message.slice(0, 160)
            : "unknown",
      }),
    );
    return errorResponse(
      request,
      env,
      502,
      "Fan-out generation is temporarily unavailable",
    );
  }
}

async function deleteDonationEvents(
  request: Request,
  env: AppEnv,
): Promise<Response> {
  const parsed = DeleteDonationsV1Schema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success)
    return errorResponse(request, env, 400, "Invalid deletion request");
  const donorTag = await sha256Hex(parsed.data.deletionSecret);
  const now = new Date().toISOString();
  const expiresAt = addMonths(now, RAW_RETENTION_MONTHS);
  const results = await env.DB.batch([
    env.DB.prepare(
      `
      INSERT INTO deleted_donors (donor_tag, deleted_at, expires_at)
      VALUES (?, ?, ?)
      ON CONFLICT(donor_tag) DO UPDATE SET deleted_at = excluded.deleted_at, expires_at = excluded.expires_at
    `,
    ).bind(donorTag, now, expiresAt),
    env.DB.prepare("DELETE FROM query_events WHERE donor_tag = ?").bind(
      donorTag,
    ),
    env.DB.prepare("DELETE FROM fanout_runs WHERE donor_tag = ?").bind(
      donorTag,
    ),
    env.DB.prepare("DELETE FROM fanout_daily_usage WHERE donor_tag = ?").bind(
      donorTag,
    ),
  ]);
  const deleted = results
    .slice(1)
    .reduce((sum, result) => sum + (result.meta.changes ?? 0), 0);
  console.log(
    JSON.stringify({ event: "donor_data_deleted", deletedRows: deleted }),
  );
  return json(request, env, { deleted: true }, 200, {
    "cache-control": "no-store",
  });
}

export async function handleApi(
  request: Request,
  env: AppEnv,
  ctx: ExecutionContext,
): Promise<Response | null> {
  const url = new URL(request.url);
  if (!url.pathname.startsWith("/api/v1/")) return null;
  if (request.headers.has("origin") && !corsOrigin(request, env))
    return errorResponse(request, env, 403, "Origin not allowed");
  if (request.method === "OPTIONS")
    return new Response(null, {
      status: 204,
      headers: corsHeaders(request, env),
    });
  if (url.pathname === "/api/v1/config" && request.method === "GET")
    return publicConfig(request, env);
  if (url.pathname === "/api/v1/events" && request.method === "POST")
    return ingestEvents(request, env);
  if (url.pathname === "/api/v1/fan-outs" && request.method === "POST")
    return fanOuts(request, env, ctx);
  if (url.pathname === "/api/v1/donations" && request.method === "DELETE")
    return deleteDonationEvents(request, env);
  return errorResponse(request, env, 404, "API route not found");
}

export async function consumeDonationBatch(
  batch: MessageBatch<DonationQueueMessage>,
  env: AppEnv,
): Promise<void> {
  const donorTags = [
    ...new Set(batch.messages.map((message) => message.body.donorTag)),
  ];
  const placeholders = donorTags.map(() => "?").join(",");
  const deleted = donorTags.length
    ? await env.DB.prepare(
        `SELECT donor_tag FROM deleted_donors WHERE donor_tag IN (${placeholders})`,
      )
        .bind(...donorTags)
        .all<{ donor_tag: string }>()
    : { results: [] };
  const tombstones = new Set(
    (deleted.results ?? []).map((row) => row.donor_tag),
  );
  const statements = batch.messages
    .filter((message) => !tombstones.has(message.body.donorTag))
    .map((message) => {
      const value = message.body;
      return env.DB.prepare(
        `
        INSERT OR IGNORE INTO query_events (
          event_id, donor_tag, platform, source_kind, query_text, normalized_query,
          query_hash, language, locale, captured_at, received_at, extension_version,
          adapter_version, parent_event_id, expires_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      ).bind(
        value.event.eventId,
        value.donorTag,
        value.event.platform,
        value.event.sourceKind,
        value.event.query,
        value.normalizedQuery,
        value.queryHash,
        value.event.language ?? null,
        value.event.locale ?? null,
        value.event.capturedAt,
        value.receivedAt,
        value.event.extensionVersion,
        value.event.adapterVersion,
        value.event.parentEventId ?? null,
        value.expiresAt,
      );
    });
  if (statements.length) await env.DB.batch(statements);
  console.log(
    JSON.stringify({
      event: "donation_batch_consumed",
      received: batch.messages.length,
      insertedCandidates: statements.length,
      tombstoned: batch.messages.length - statements.length,
    }),
  );
}

export async function runDailyMaintenance(
  env: AppEnv,
  scheduledTime: number,
): Promise<void> {
  const runAt = new Date(scheduledTime).toISOString();
  const aggregateDate = new Date(scheduledTime - 24 * 60 * 60 * 1_000)
    .toISOString()
    .slice(0, 10);
  const start = `${aggregateDate}T00:00:00.000Z`;
  const end = `${aggregateDate}T23:59:59.999Z`;
  await env.DB.prepare(
    `
    INSERT INTO query_daily_aggregates (
      aggregate_date, platform, source_kind, normalized_query, display_query,
      query_hash, event_count, distinct_donor_count, created_at
    )
    SELECT ?, platform, source_kind, normalized_query, MIN(query_text), query_hash,
      COUNT(*), COUNT(DISTINCT donor_tag), ?
    FROM query_events
    WHERE captured_at BETWEEN ? AND ?
    GROUP BY platform, source_kind, normalized_query, query_hash
    HAVING COUNT(DISTINCT donor_tag) >= ?
    ON CONFLICT(aggregate_date, platform, source_kind, query_hash) DO UPDATE SET
      event_count = excluded.event_count,
      distinct_donor_count = excluded.distinct_donor_count,
      display_query = excluded.display_query,
      created_at = excluded.created_at
  `,
  )
    .bind(aggregateDate, runAt, start, end, AGGREGATE_DONOR_THRESHOLD)
    .run();
  await env.DB.batch([
    env.DB.prepare("DELETE FROM query_events WHERE expires_at < ?").bind(runAt),
    env.DB.prepare("DELETE FROM deleted_donors WHERE expires_at < ?").bind(
      runAt,
    ),
    env.DB.prepare(
      "DELETE FROM fanout_daily_usage WHERE usage_date < date(?, '-14 days')",
    ).bind(aggregateDate),
    env.DB.prepare(
      "DELETE FROM fanout_runs WHERE created_at < datetime(?, '-13 months')",
    ).bind(runAt),
  ]);
  console.log(
    JSON.stringify({ event: "daily_maintenance_complete", aggregateDate }),
  );
}
