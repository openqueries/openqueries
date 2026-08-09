import { z } from "zod";

export const PLATFORM_VALUES = ["chatgpt", "claude", "google"] as const;
export const SOURCE_KIND_VALUES = [
  "observed_model_search",
  "observed_expanded_query",
  "google_user_search",
] as const;

export const PlatformSchema = z.enum(PLATFORM_VALUES);
export const SourceKindSchema = z.enum(SOURCE_KIND_VALUES);

export const QueryObservationV1Schema = z
  .object({
    schemaVersion: z.literal(1),
    eventId: z.string().min(8).max(128),
    platform: PlatformSchema,
    sourceKind: SourceKindSchema,
    query: z.string().trim().min(1).max(500),
    capturedAt: z.string().datetime(),
    language: z.string().trim().min(2).max(35).optional(),
    locale: z.string().trim().min(2).max(35).optional(),
    extensionVersion: z.string().trim().min(1).max(32),
    adapterVersion: z.string().trim().min(1).max(32),
    parentEventId: z.string().min(8).max(128).optional(),
  })
  .strict();

export const DonationBatchV1Schema = z
  .object({
    schemaVersion: z.literal(1),
    donorTag: z.string().regex(/^[a-f0-9]{64}$/),
    events: z.array(QueryObservationV1Schema).min(1).max(50),
  })
  .strict();

export const FanOutRequestV2Schema = z
  .object({
    schemaVersion: z.literal(2),
    requestId: z.string().uuid(),
    donorTag: z.string().regex(/^[a-f0-9]{64}$/),
    platform: PlatformSchema,
    seed: z
      .object({
        query: z.string().trim().min(1).max(500),
        sourceKind: SourceKindSchema,
        language: z.string().trim().min(2).max(35).optional(),
      })
      .strict(),
  })
  .strict();

export const NativeInversePerplexityScoreSchema = z
  .object({
    kind: z.literal("native_inverse_perplexity"),
    value: z.number().min(0).max(1),
    meanTokenLogProbability: z.number().finite(),
    perplexity: z.number().positive().finite(),
    tokenCount: z.number().int().positive(),
  })
  .strict();

export const EmpiricalInclusionFrequencyScoreSchema = z
  .object({
    kind: z.literal("empirical_inclusion_frequency"),
    value: z.number().min(0).max(1),
    occurrences: z.number().int().nonnegative(),
    sampleCount: z.number().int().positive(),
    confidence95: z
      .object({
        lower: z.number().min(0).max(1),
        upper: z.number().min(0).max(1),
      })
      .strict(),
  })
  .strict();

export const FanOutCandidateV2Schema = z
  .object({
    query: z.string().min(1).max(500),
    rank: z.number().int().min(1).max(10),
    provenance: z.literal("estimated"),
    score: z.discriminatedUnion("kind", [
      NativeInversePerplexityScoreSchema,
      EmpiricalInclusionFrequencyScoreSchema,
    ]),
  })
  .strict();

export const FanOutResponseV2Schema = z
  .object({
    schemaVersion: z.literal(2),
    requestId: z.string().uuid(),
    sourceQuery: z.string(),
    platform: PlatformSchema,
    fanOuts: z.array(FanOutCandidateV2Schema).max(10),
    method: z.enum(["provider_native_logprobs", "provider_native_sampling"]),
    model: z.string(),
    promptVersion: z.string(),
    generatedAt: z.string().datetime(),
  })
  .strict();

export const DeleteDonationsV1Schema = z
  .object({
    schemaVersion: z.literal(1),
    deletionSecret: z.string().regex(/^[a-f0-9]{64}$/),
  })
  .strict();

export const PublicConfigV1Schema = z
  .object({
    schemaVersion: z.literal(1),
    supportedPlatforms: z.array(PlatformSchema),
    dailyFanOutLimit: z.number().int().positive(),
    rawRetentionDays: z.number().int().positive(),
    aggregateDonorThreshold: z.number().int().positive(),
    minimumAdapterVersions: z.record(PlatformSchema, z.string()),
  })
  .strict();

export type Platform = z.infer<typeof PlatformSchema>;
export type SourceKind = z.infer<typeof SourceKindSchema>;
export type QueryObservationV1 = z.infer<typeof QueryObservationV1Schema>;
export type DonationBatchV1 = z.infer<typeof DonationBatchV1Schema>;
export type FanOutRequestV2 = z.infer<typeof FanOutRequestV2Schema>;
export type NativeInversePerplexityScore = z.infer<
  typeof NativeInversePerplexityScoreSchema
>;
export type EmpiricalInclusionFrequencyScore = z.infer<
  typeof EmpiricalInclusionFrequencyScoreSchema
>;
export type FanOutCandidateV2 = z.infer<typeof FanOutCandidateV2Schema>;
export type FanOutResponseV2 = z.infer<typeof FanOutResponseV2Schema>;
export type DeleteDonationsV1 = z.infer<typeof DeleteDonationsV1Schema>;
export type PublicConfigV1 = z.infer<typeof PublicConfigV1Schema>;
