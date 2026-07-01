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
}

export interface Funnel {
  steps: FunnelStep[];
  dropOffAt: string | null;
}

export interface FlowConversion {
  convertedSessions: number;
  conversionRate: number;
}

export interface FlowCostAndPerf {
  estimatedMonthlyCost: number;
  violationCount: number;
  avgDurationMs: number;
}

export interface JourneyFlow {
  flow: MinedFlow;
  funnel: Funnel;
  conversion: FlowConversion;
  costAndPerf: FlowCostAndPerf;
}

export interface JourneysResult {
  flows: JourneyFlow[];
}
