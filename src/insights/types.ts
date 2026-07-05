/**
 * Flat, values-free row read from Supabase per endpoint per flush window.
 * Mirrors indi-runtime's EndpointStatsRow (src/analytics/types.ts) plus the
 * columns Postgres adds (id, created_at).
 */
export interface EndpointStatsRow {
  id: string;
  team_id: string | null;
  endpoint: string;
  method: string;
  window_start: number;
  window_end: number;
  call_count: number;
  status_2xx: number;
  status_3xx: number;
  status_4xx: number;
  status_5xx: number;
  status_other: number;
  latency_buckets: number[];
  latency_sum: number;
  latency_max: number;
  duplicate_count: number;
  field_presence: Record<string, unknown> | null;
  created_at: string;
}

export interface SequenceEvent {
  step: string;
  method: string;
  status: number;
  tOffsetMs: number;
  durMs: number;
  /** Templated frontend route the call fired from (e.g. "/org-chart"). Optional — older rows
   * recorded before the SDK captured this won't have it. */
  page?: string;
}

export interface FlowTag {
  name: string;
  matched: boolean;
  converted: boolean;
}

/** Row read from `session_traces`. Not consumed yet — added for M2's journey mining. */
export interface SessionTraceRow {
  id: string;
  team_id: string | null;
  session_id: string;
  started_at: number;
  ended_at: number;
  events: SequenceEvent[];
  flow_tags: FlowTag[] | null;
  status_summary: Record<string, number> | null;
  created_at: string;
}

export interface Kpis {
  totalCallsPerDay: number;
  errorRate: number;
  healthScore: number;
  wasteRatio: number;
}

export interface EndpointInsight {
  endpoint: string;
  method: string;
  callCount: number;
  errorRate: number;
  p50: number;
  p95: number;
  p99: number;
  duplicateCount: number;
}

export interface WasteSignals {
  duplicateCalls: number;
  errorRetryVolume: number;
  slowEndpointVolume: number;
}

export interface MoneyMethodology {
  totalWastedLatencyMs: number;
  totalLatencyMs: number;
  infraCostPerMonth: number | null;
}

export interface MoneyInsights {
  wasteRatio: number;
  monthlySavings: number;
  methodology: MoneyMethodology;
}

export interface Insights {
  kpis: Kpis;
  endpoints: EndpointInsight[];
  waste: WasteSignals;
  money: MoneyInsights;
  violationCount: number;
}

/** Row read from `endpoint_daily_rollups` — one row per endpoint/method/day. */
export interface EndpointDailyRollupRow {
  id: string;
  team_id: string | null;
  endpoint: string;
  method: string;
  day: string;
  call_count: number;
  status_2xx: number;
  status_3xx: number;
  status_4xx: number;
  status_5xx: number;
  status_other: number;
  duplicate_count: number;
  latency_sum: number;
  latency_max: number;
  p50: number | null;
  p95: number | null;
  p99: number | null;
  created_at: string;
}

export interface WeeklyTrendPoint {
  weekStart: string;
  totalCalls: number;
  errorRate: number;
}
