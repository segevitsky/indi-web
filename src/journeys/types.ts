import type { FlowTag, SequenceEvent, SessionTraceRow } from '../insights/types';

export type { FlowTag, SequenceEvent, SessionTraceRow };

/** All `session_traces` rows for one session_id, merged and ordered by tOffsetMs. */
export interface MergedSession {
  sessionId: string;
  steps: string[];
  events: SequenceEvent[];
  flowTags: FlowTag[];
}

export interface MinedFlow {
  steps: string[];
  name: string | null;
  source: 'mined' | 'named';
  sessionCount: number;
  frequency: number;
}

export interface FunnelStep {
  step: string;
  sessionsReached: number;
  retention: number;
  /** Most common frontend page this step fired from, across the matching sessions — null if
   * the underlying events predate page capture. */
  page: string | null;
}

export interface Funnel {
  steps: FunnelStep[];
  dropOffAt: string | null;
}

export interface FlowConversion {
  convertedSessions: number;
  conversionRate: number;
}

export interface FlowCostMethodology {
  wastedCalls: number;
  wastedLatencyMs: number;
  totalSystemLatencyMs: number;
}

export interface FlowCostAndPerf {
  estimatedMonthlyCost: number;
  violationCount: number;
  avgDurationMs: number;
  methodology: FlowCostMethodology;
}

/** A step called more than once, on average, within a single session along a flow —
 * distinct from insights' endpoint-level duplicate count, which is a same-second re-request. */
export interface RepeatedStep {
  step: string;
  avgCallsPerSession: number;
  totalCalls: number;
  /** Frontend pages this step fired from within these sessions, most common first — empty if
   * the underlying events predate page capture. */
  pages: string[];
}

export type SeverityTier = 'healthy' | 'moderate' | 'severe';

/** Evidence that a slow/errored occurrence of `step` correlates with sessions not continuing —
 * a checkable pattern, not proof of cause and effect. Raw counts, not pre-computed rates, so the
 * underlying sample sizes are always visible alongside the claim.
 *
 * `lowerTier`/`higherTier` name which two severity tiers were actually compared — not always
 * healthy vs. severe. Some endpoints have a genuinely extreme slow/error tail (severe has enough
 * sessions to check); others are just consistently moderately slow and never that extreme, so the
 * comparison falls back to healthy vs. moderate instead of going silent. `thirdTier` is included
 * only when the remaining tier also had enough sessions, and the full three-tier ordering
 * (healthy, then moderate, then severe) declines step by step — a gradient across all three
 * severity levels is stronger evidence than a single two-tier comparison.
 *
 * `isEndOfFlow` distinguishes what "continued" means: for a step with a next step in the mined
 * flow, it means reaching that specific next step; for the flow's last step, there is no next
 * mined step to check, so it means the session did anything at all afterward — otherwise a flow
 * that *ends* at a slow endpoint (a common, real shape) would be invisible to this check entirely. */
export interface DropOffSignal {
  step: string;
  isEndOfFlow: boolean;
  lowerTier: SeverityTier;
  lowerSessionCount: number;
  lowerContinuedCount: number;
  higherTier: SeverityTier;
  higherSessionCount: number;
  higherContinuedCount: number;
  thirdTier: { tier: SeverityTier; sessionCount: number; continuedCount: number } | null;
}

export interface JourneyFlow {
  flow: MinedFlow;
  funnel: Funnel;
  conversion: FlowConversion;
  costAndPerf: FlowCostAndPerf;
  repeatedSteps: RepeatedStep[];
  dropOffSignals: DropOffSignal[];
}

export interface JourneysResult {
  flows: JourneyFlow[];
}
