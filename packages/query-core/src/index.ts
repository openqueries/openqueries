import type {
  EmpiricalInclusionFrequencyScore,
  FanOutCandidateV2,
  NativeInversePerplexityScore,
} from "@openqueries/contracts";

export function normalizeQuery(value: string): string {
  return value
    .normalize("NFKC")
    .replace(/[“”„]/gu, '"')
    .replace(/[’‘]/gu, "'")
    .replace(/\s+/gu, " ")
    .trim();
}

export function normalizedQueryKey(value: string, locale = "en"): string {
  return normalizeQuery(value).toLocaleLowerCase(locale);
}

export function uniqueQueries(values: string[], maximum = 10): string[] {
  const seen = new Set<string>();
  const output: string[] = [];
  for (const value of values) {
    const query = normalizeQuery(value);
    const key = normalizedQueryKey(query);
    if (!query || seen.has(key)) continue;
    seen.add(key);
    output.push(query);
    if (output.length >= maximum) break;
  }
  return output;
}

export function inversePerplexity(meanLogProbability: number): number {
  if (!Number.isFinite(meanLogProbability)) return 0;
  return Math.min(1, Math.max(0, Math.exp(meanLogProbability)));
}

export function nativeInversePerplexityScore(
  meanTokenLogProbability: number,
  tokenCount: number,
): NativeInversePerplexityScore {
  if (!Number.isFinite(meanTokenLogProbability) || tokenCount < 1)
    throw new Error("A native score requires finite token log-probabilities");
  const perplexity = Math.exp(-meanTokenLogProbability);
  return {
    kind: "native_inverse_perplexity",
    value: inversePerplexity(meanTokenLogProbability),
    meanTokenLogProbability,
    perplexity,
    tokenCount,
  };
}

export function wilsonInterval95(
  occurrences: number,
  sampleCount: number,
): { lower: number; upper: number } {
  if (
    !Number.isInteger(occurrences) ||
    !Number.isInteger(sampleCount) ||
    occurrences < 0 ||
    sampleCount < 1 ||
    occurrences > sampleCount
  )
    throw new Error("Wilson intervals require 0 <= occurrences <= samples");
  const z = 1.959963984540054;
  const proportion = occurrences / sampleCount;
  const denominator = 1 + (z * z) / sampleCount;
  const center = proportion + (z * z) / (2 * sampleCount);
  const margin =
    z *
    Math.sqrt(
      (proportion * (1 - proportion)) / sampleCount +
        (z * z) / (4 * sampleCount * sampleCount),
    );
  return {
    lower: Math.max(0, (center - margin) / denominator),
    upper: Math.min(1, (center + margin) / denominator),
  };
}

export function empiricalInclusionFrequencyScore(
  occurrences: number,
  sampleCount: number,
): EmpiricalInclusionFrequencyScore {
  return {
    kind: "empirical_inclusion_frequency",
    value: occurrences / sampleCount,
    occurrences,
    sampleCount,
    confidence95: wilsonInterval95(occurrences, sampleCount),
  };
}

export function rankNativeFanOuts(
  queries: Array<{
    query: string;
    meanTokenLogProbability: number;
    tokenCount: number;
  }>,
  maximum = 10,
): FanOutCandidateV2[] {
  const unique = new Map<
    string,
    { query: string; score: NativeInversePerplexityScore }
  >();
  queries.forEach((item) => {
    const query = normalizeQuery(item.query);
    const key = normalizedQueryKey(query);
    if (!query || unique.has(key)) return;
    const score = nativeInversePerplexityScore(
      item.meanTokenLogProbability,
      item.tokenCount,
    );
    unique.set(key, { query, score });
  });
  return [...unique.values()]
    .sort(
      (left, right) =>
        right.score.value - left.score.value ||
        left.query.localeCompare(right.query),
    )
    .slice(0, maximum)
    .map((item, index) => ({
      query: item.query,
      rank: index + 1,
      score: item.score,
      provenance: "estimated" as const,
    }));
}

export async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value),
  );
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}
