import {
  DeleteDonationsV1Schema,
  DonationEventV1Schema,
  FanOutRequestV2Schema,
  type FanOutResponseV2,
} from "@openqueries/contracts";
import { querySafety, sha256Hex } from "@openqueries/query-core";

import type { AppEnv } from "./env";
import { generateFanOuts } from "./providers";

const RAW_RETENTION_MONTHS = 13;
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

async function ingestEvents(request: Request, env: AppEnv): Promise<Response> {
  const parsed = DonationEventV1Schema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success)
    return errorResponse(request, env, 400, "Invalid donation payload");
  const event = parsed.data.event;
  const safety = querySafety(event.query);
  if (!safety.safe)
    return errorResponse(
      request,
      env,
      422,
      "Query is not eligible for donation",
    );
  const receivedAt = new Date().toISOString();
  const result = await env.DB.prepare(
    `
      INSERT OR IGNORE INTO query_events (
        event_id, donor_tag, platform, source_kind, query_text, language, locale,
        captured_at, received_at, extension_version, adapter_version, expires_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
  )
    .bind(
      event.eventId,
      parsed.data.donorTag,
      event.platform,
      event.sourceKind,
      event.query,
      event.language ?? null,
      event.locale ?? null,
      event.capturedAt,
      receivedAt,
      event.extensionVersion,
      event.adapterVersion,
      addMonths(receivedAt, RAW_RETENTION_MONTHS),
    )
    .run();
  console.log(
    JSON.stringify({
      event: "donation_stored",
      eventId: event.eventId,
      inserted: (result.meta.changes ?? 0) > 0,
    }),
  );
  return json(request, env, { accepted: true }, 201, {
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

async function fanOuts(request: Request, env: AppEnv): Promise<Response> {
  const parsed = FanOutRequestV2Schema.safeParse(
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
    const response: FanOutResponseV2 = {
      schemaVersion: 2,
      requestId: parsed.data.requestId,
      sourceQuery: parsed.data.seed.query,
      platform: parsed.data.platform,
      fanOuts: generated.candidates,
      method: generated.method,
      model: generated.model,
      promptVersion: generated.promptVersion,
      generatedAt,
    };
    console.log(
      JSON.stringify({
        event: "fanout_generated",
        platform: parsed.data.platform,
        requestId: parsed.data.requestId,
        count: generated.candidates.length,
        method: generated.method,
        model: generated.model,
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
  const events = await env.DB.prepare(
    "DELETE FROM query_events WHERE donor_tag = ?",
  )
    .bind(donorTag)
    .run();
  const quota = await env.DB.prepare(
    "DELETE FROM fanout_daily_usage WHERE donor_tag = ?",
  )
    .bind(donorTag)
    .run();
  const deleted = (events.meta.changes ?? 0) + (quota.meta.changes ?? 0);
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
): Promise<Response | null> {
  const url = new URL(request.url);
  if (!/^\/api\/v[12]\//u.test(url.pathname)) return null;
  if (request.headers.has("origin") && !corsOrigin(request, env))
    return errorResponse(request, env, 403, "Origin not allowed");
  if (request.method === "OPTIONS")
    return new Response(null, {
      status: 204,
      headers: corsHeaders(request, env),
    });
  if (url.pathname === "/api/v1/events" && request.method === "POST")
    return ingestEvents(request, env);
  if (url.pathname === "/api/v2/fan-outs" && request.method === "POST")
    return fanOuts(request, env);
  if (url.pathname === "/api/v1/donations" && request.method === "DELETE")
    return deleteDonationEvents(request, env);
  return errorResponse(request, env, 404, "API route not found");
}

export async function runRetentionMaintenance(
  env: AppEnv,
  scheduledTime: number,
): Promise<void> {
  const runAt = new Date(scheduledTime).toISOString();
  const usageCutoff = new Date(scheduledTime - 14 * 24 * 60 * 60 * 1_000)
    .toISOString()
    .slice(0, 10);
  await env.DB.prepare("DELETE FROM query_events WHERE expires_at < ?")
    .bind(runAt)
    .run();
  await env.DB.prepare("DELETE FROM fanout_daily_usage WHERE usage_date < ?")
    .bind(usageCutoff)
    .run();
  console.log(JSON.stringify({ event: "retention_cleanup_complete" }));
}
