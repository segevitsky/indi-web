import type { EndpointDailyRollupRow, TrafficAnomaly } from './types';

/** An endpoint needs at least this many days of history before its own baseline is trusted —
 * same sample-size-gating philosophy as MIN_GROUP_SIZE in journeys/mine.ts: no verdict from too
 * little history. */
const MIN_BASELINE_DAYS = 7;
/** Below this average daily call count, an endpoint's traffic/error swings are too small-sample
 * to mean anything — a barely-used endpoint going from 2 calls to 5 calls is a "150% spike" in
 * ratio terms but not a real signal. */
const MIN_BASELINE_CALLS_PER_DAY = 20;
/** Today's value must be at least this many times the baseline average (a high anomaly) or at
 * most its reciprocal (a low anomaly) to be flagged — a simple ratio, not a statistical
 * significance test, consistent with how this codebase favors explainable math over
 * sophisticated-sounding but opaque methods. */
const RATIO_THRESHOLD = 2;

interface EndpointDay {
  day: string;
  callCount: number;
  errorRate: number;
  avgLatencyMs: number;
}

function toEndpointDay(row: EndpointDailyRollupRow): EndpointDay {
  return {
    day: row.day,
    callCount: row.call_count,
    errorRate: row.call_count > 0 ? (row.status_4xx + row.status_5xx) / row.call_count : 0,
    avgLatencyMs: row.call_count > 0 ? row.latency_sum / row.call_count : 0,
  };
}

function average(values: number[]): number {
  return values.length > 0 ? values.reduce((sum, v) => sum + v, 0) / values.length : 0;
}

/** Compares each endpoint's most recent day against its own history — not against other
 * endpoints — to flag traffic, error-rate, or speed that's meaningfully higher or lower than
 * normal for that specific endpoint. Requires MIN_BASELINE_DAYS of prior history and (for traffic/
 * errors) MIN_BASELINE_CALLS_PER_DAY of typical volume before checking anything, so a new or
 * barely-used endpoint doesn't produce noisy, meaningless-looking swings. */
export function detectTrafficAnomalies(rollups: EndpointDailyRollupRow[]): TrafficAnomaly[] {
  const byEndpoint = new Map<string, { endpoint: string; method: string; days: EndpointDay[] }>();

  for (const row of rollups) {
    const key = `${row.method} ${row.endpoint}`;
    let entry = byEndpoint.get(key);
    if (!entry) {
      entry = { endpoint: row.endpoint, method: row.method, days: [] };
      byEndpoint.set(key, entry);
    }
    entry.days.push(toEndpointDay(row));
  }

  const anomalies: TrafficAnomaly[] = [];

  for (const { endpoint, method, days } of byEndpoint.values()) {
    const sorted = [...days].sort((a, b) => a.day.localeCompare(b.day));
    const today = sorted[sorted.length - 1];
    const baseline = sorted.slice(0, -1);
    if (!today || baseline.length < MIN_BASELINE_DAYS) continue;

    const baselineCallAvg = average(baseline.map((d) => d.callCount));
    const baselineErrorAvg = average(baseline.map((d) => d.errorRate));
    const baselineLatencyAvg = average(baseline.map((d) => d.avgLatencyMs));

    const pushIfAnomalous = (
      metric: TrafficAnomaly['metric'],
      todayValue: number,
      baselineAverage: number
    ) => {
      if (baselineAverage <= 0) return;
      const direction: TrafficAnomaly['direction'] | null =
        todayValue >= baselineAverage * RATIO_THRESHOLD
          ? 'high'
          : todayValue <= baselineAverage / RATIO_THRESHOLD
            ? 'low'
            : null;
      if (!direction) return;
      anomalies.push({
        endpoint,
        method,
        metric,
        direction,
        day: today.day,
        todayValue,
        baselineAverage,
        baselineDays: baseline.length,
      });
    };

    // All three metrics are gated on baseline call volume, not just traffic/errors — an average
    // computed from a handful of calls a day swings around by pure chance, so a low-traffic
    // endpoint's "speed" would otherwise look noisily anomalous for no real reason.
    if (baselineCallAvg >= MIN_BASELINE_CALLS_PER_DAY) {
      pushIfAnomalous('traffic', today.callCount, baselineCallAvg);
      pushIfAnomalous('errors', today.errorRate, baselineErrorAvg);
      pushIfAnomalous('speed', today.avgLatencyMs, baselineLatencyAvg);
    }
  }

  return anomalies;
}
