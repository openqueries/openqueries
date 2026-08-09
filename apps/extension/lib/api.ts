import type {
  DonationBatchV1,
  FanOutRequestV2,
  FanOutResponseV2,
  QueryObservationV1,
} from "@openqueries/contracts";

const API_URL = (
  process.env.PLASMO_PUBLIC_API_URL || "https://openqueries.org"
).replace(/\/$/u, "");

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function finiteNumber(value: unknown, label: string): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`Invalid fan-out response: ${label}`);
  }
  return value;
}

function boundedScore(value: unknown, label: string): number {
  const score = finiteNumber(value, label);
  if (score < 0 || score > 1) {
    throw new Error(`Invalid fan-out response: ${label}`);
  }
  return score;
}

export function parseFanOutResponseV2(payload: unknown): FanOutResponseV2 {
  if (!isRecord(payload) || payload.schemaVersion !== 2) {
    throw new Error("Invalid fan-out response: schemaVersion");
  }
  if (
    typeof payload.requestId !== "string" ||
    typeof payload.sourceQuery !== "string" ||
    !["chatgpt", "claude", "google"].includes(String(payload.platform)) ||
    !["provider_native_logprobs", "provider_native_sampling"].includes(
      String(payload.method),
    ) ||
    typeof payload.model !== "string" ||
    !payload.model ||
    typeof payload.promptVersion !== "string" ||
    !payload.promptVersion ||
    typeof payload.generatedAt !== "string" ||
    !Number.isFinite(Date.parse(payload.generatedAt)) ||
    !Array.isArray(payload.fanOuts) ||
    payload.fanOuts.length > 10
  ) {
    throw new Error("Invalid fan-out response: envelope");
  }

  for (const [index, fanOut] of payload.fanOuts.entries()) {
    if (
      !isRecord(fanOut) ||
      typeof fanOut.query !== "string" ||
      fanOut.query.length < 1 ||
      fanOut.query.length > 500 ||
      !Number.isInteger(fanOut.rank) ||
      Number(fanOut.rank) < 1 ||
      Number(fanOut.rank) > 10 ||
      fanOut.provenance !== "estimated" ||
      !isRecord(fanOut.score)
    ) {
      throw new Error(`Invalid fan-out response: fanOuts[${index}]`);
    }

    boundedScore(fanOut.score.value, `fanOuts[${index}].score.value`);
    if (fanOut.score.kind === "native_inverse_perplexity") {
      finiteNumber(
        fanOut.score.meanTokenLogProbability,
        `fanOuts[${index}].score.meanTokenLogProbability`,
      );
      if (
        finiteNumber(
          fanOut.score.perplexity,
          `fanOuts[${index}].score.perplexity`,
        ) <= 0 ||
        !Number.isInteger(fanOut.score.tokenCount) ||
        Number(fanOut.score.tokenCount) < 1
      ) {
        throw new Error(`Invalid fan-out response: fanOuts[${index}].score`);
      }
    } else if (fanOut.score.kind === "empirical_inclusion_frequency") {
      if (
        !Number.isInteger(fanOut.score.occurrences) ||
        Number(fanOut.score.occurrences) < 0 ||
        !Number.isInteger(fanOut.score.sampleCount) ||
        Number(fanOut.score.sampleCount) < 1 ||
        Number(fanOut.score.occurrences) > Number(fanOut.score.sampleCount) ||
        !isRecord(fanOut.score.confidence95)
      ) {
        throw new Error(`Invalid fan-out response: fanOuts[${index}].score`);
      }
      boundedScore(
        fanOut.score.confidence95.lower,
        `fanOuts[${index}].score.confidence95.lower`,
      );
      boundedScore(
        fanOut.score.confidence95.upper,
        `fanOuts[${index}].score.confidence95.upper`,
      );
    } else {
      throw new Error(`Invalid fan-out response: fanOuts[${index}].score.kind`);
    }
  }

  return payload as FanOutResponseV2;
}

async function apiFetch(path: string, init: RequestInit): Promise<Response> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { "content-type": "application/json", ...(init.headers ?? {}) },
  });
  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(
      payload?.error || `Open Queries API returned ${response.status}`,
    );
  }
  return response;
}

export async function donateEvent(
  donorTag: string,
  event: QueryObservationV1,
): Promise<void> {
  const body: DonationBatchV1 = { schemaVersion: 1, donorTag, events: [event] };
  await apiFetch("/api/v1/events", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function estimateFanOuts(request: FanOutRequestV2) {
  const response = await apiFetch("/api/v2/fan-outs", {
    method: "POST",
    body: JSON.stringify(request),
  });
  return parseFanOutResponseV2(await response.json());
}

export async function deleteDonations(deletionSecret: string): Promise<void> {
  await apiFetch("/api/v1/donations", {
    method: "DELETE",
    body: JSON.stringify({ schemaVersion: 1, deletionSecret }),
  });
}
