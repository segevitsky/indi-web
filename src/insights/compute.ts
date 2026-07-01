import type { Violation } from '../supabase/config';
import { estimatePercentile, LATENCY_BUCKET_BOUNDS } from './percentile';
import type { EndpointInsight, EndpointStatsRow, Insights, Kpis, MoneyInsights, WasteSignals } from './types';

/** p95 above this is considered a "slow" endpoint for waste-signal purposes. Tunable. */
const SLOW_P95_THRESHOLD_MS = 1000;

/** Weights for the health-score formula below. Not specified by the build plan — tune freely. */
const HEALTH_SCORE_ERROR_WEIGHT = 1;
const HEALTH_SCORE_WASTE_WEIGHT = 0.5;

interface MergedEndpoint {
  endpoint: string;
  method: string;
  callCount: number;
  status4xx: number;
  status5xx: number;
  latencyBuckets: number[];
  latencyMax: number;
  duplicateCount: number;
}

/** endpoint_stats has one row per flush window — merge rows for the same (endpoint, method). */
function mergeEndpointStats(rows: EndpointStatsRow[]): MergedEndpoint[] {
  const byKey = new Map<string, MergedEndpoint>();

  for (const row of rows) {
    const key = `${row.method} ${row.endpoint}`;
    let merged = byKey.get(key);
    if (!merged) {
      merged = {
        endpoint: row.endpoint,
        method: row.method,
        callCount: 0,
        status4xx: 0,
        status5xx: 0,
        latencyBuckets: new Array(LATENCY_BUCKET_BOUNDS.length + 1).fill(0),
        latencyMax: 0,
        duplicateCount: 0,
      };
      byKey.set(key, merged);
    }

    merged.callCount += row.call_count;
    merged.status4xx += row.status_4xx;
    merged.status5xx += row.status_5xx;
    merged.duplicateCount += row.duplicate_count;
    merged.latencyMax = Math.max(merged.latencyMax, row.latency_max);
    row.latency_buckets.forEach((count, i) => {
      merged.latencyBuckets[i] += count;
    });
  }

  return Array.from(byKey.values());
}

function toEndpointInsight(merged: MergedEndpoint): EndpointInsight {
  const errorCount = merged.status4xx + merged.status5xx;
  return {
    endpoint: merged.endpoint,
    method: merged.method,
    callCount: merged.callCount,
    errorRate: merged.callCount > 0 ? errorCount / merged.callCount : 0,
    p50: estimatePercentile(merged.latencyBuckets, merged.latencyMax, merged.callCount, 0.5),
    p95: estimatePercentile(merged.latencyBuckets, merged.latencyMax, merged.callCount, 0.95),
    p99: estimatePercentile(merged.latencyBuckets, merged.latencyMax, merged.callCount, 0.99),
    duplicateCount: merged.duplicateCount,
  };
}

export function computeInsights(
  endpointStats: EndpointStatsRow[],
  violations: Violation[],
  infraCostPerMonth: number | null
): Insights {
  const merged = mergeEndpointStats(endpointStats);
  const endpoints = merged.map(toEndpointInsight);

  const totalCalls = merged.reduce((sum, m) => sum + m.callCount, 0);
  const errorCalls = merged.reduce((sum, m) => sum + m.status4xx + m.status5xx, 0);
  const duplicateCalls = merged.reduce((sum, m) => sum + m.duplicateCount, 0);
  const slowEndpointVolume = endpoints
    .filter((e) => e.p95 > SLOW_P95_THRESHOLD_MS)
    .reduce((sum, e) => sum + e.callCount, 0);

  const waste: WasteSignals = {
    duplicateCalls,
    errorRetryVolume: errorCalls,
    slowEndpointVolume,
  };

  const wasteRatio =
    totalCalls > 0
      ? Math.min(1, (waste.duplicateCalls + waste.errorRetryVolume + waste.slowEndpointVolume) / totalCalls)
      : 0;

  const errorRate = totalCalls > 0 ? errorCalls / totalCalls : 0;
  const healthScore = Math.max(
    0,
    Math.min(100, 100 - errorRate * 100 * HEALTH_SCORE_ERROR_WEIGHT - wasteRatio * 100 * HEALTH_SCORE_WASTE_WEIGHT)
  );

  const kpis: Kpis = {
    totalCallsPerDay: totalCalls,
    errorRate,
    healthScore,
    wasteRatio,
  };

  const money: MoneyInsights = {
    wasteRatio,
    monthlySavings: infraCostPerMonth != null ? wasteRatio * infraCostPerMonth : 0,
  };

  return { kpis, endpoints, waste, money, violationCount: violations.length };
}
