import type {
  FanOutCandidateV2,
  Platform,
  QueryObservationV1,
  SourceKind,
} from "@openqueries/contracts";

export type LocalQueryEvent = QueryObservationV1 & {
  tabId: number | null;
  donationBlockedReason?: string;
  fanOuts?: FanOutCandidateV2[];
};

export type ExtensionState = {
  schemaVersion: 1;
  donationEnabled: boolean;
  onboardingAcknowledged: boolean;
  deletionSecret: string;
  donorTag: string;
  events: LocalQueryEvent[];
};

export type PublicState = Omit<ExtensionState, "deletionSecret"> & {
  activeTabId: number | null;
};

export type ObservationInput = {
  eventId: string;
  platform: Platform;
  sourceKind: SourceKind;
  query: string;
  capturedAt: string;
  language?: string;
  locale?: string;
};

export type RuntimeRequest =
  | { type: "openqueries:observation"; observation: ObservationInput }
  | { type: "openqueries:get-state" }
  | { type: "openqueries:set-donation"; enabled: boolean }
  | { type: "openqueries:acknowledge-onboarding"; donationEnabled: boolean }
  | { type: "openqueries:clear-local-history" }
  | { type: "openqueries:delete-donations" }
  | { type: "openqueries:estimate-fan-outs"; eventId: string };

export type RuntimeResponse =
  { ok: true; state?: PublicState } | { ok: false; error: string };
