export type AppEnv = Omit<Env, "GEMINI_SCORING_METHOD"> & {
  GEMINI_SCORING_METHOD: "sampling" | "logprobs";
  OPENAI_API_KEY?: string;
  ANTHROPIC_API_KEY?: string;
  GEMINI_API_KEY?: string;
};

export type DonationQueueMessage = {
  schemaVersion: 1;
  donorTag: string;
  event: {
    schemaVersion: 1;
    eventId: string;
    platform: "chatgpt" | "claude" | "google";
    sourceKind:
      | "observed_model_search"
      | "observed_expanded_query"
      | "google_user_search";
    query: string;
    capturedAt: string;
    language?: string;
    locale?: string;
    extensionVersion: string;
    adapterVersion: string;
    parentEventId?: string;
  };
  normalizedQuery: string;
  queryHash: string;
  receivedAt: string;
  expiresAt: string;
};
