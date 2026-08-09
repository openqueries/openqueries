import {
  FanOutResponseV2Schema,
  type DonationBatchV1,
  type FanOutRequestV2,
  type QueryObservationV1,
} from "@openqueries/contracts";

const API_URL = (
  process.env.PLASMO_PUBLIC_API_URL || "https://openqueries.org"
).replace(/\/$/u, "");

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

export async function donateEvents(
  donorTag: string,
  events: QueryObservationV1[],
): Promise<void> {
  const body: DonationBatchV1 = { schemaVersion: 1, donorTag, events };
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
  return FanOutResponseV2Schema.parse(await response.json());
}

export async function deleteDonations(deletionSecret: string): Promise<void> {
  await apiFetch("/api/v1/donations", {
    method: "DELETE",
    body: JSON.stringify({ schemaVersion: 1, deletionSecret }),
  });
}
