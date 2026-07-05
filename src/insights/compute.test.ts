import { describe, expect, it } from 'vitest';
import { computeInsights } from './compute';
import { endpointStatsFixture } from './fixtures/endpointStats.fixture';
import { violationsFixture } from './fixtures/violations.fixture';
import type { EndpointStatsRow } from './types';

describe('computeInsights', () => {
  it('merges endpoint_stats rows across flush windows before computing percentiles', () => {
    const insights = computeInsights(endpointStatsFixture, violationsFixture, null);

    const users = insights.endpoints.find((e) => e.endpoint === '/api/users/:id');
    expect(users).toBeDefined();
    expect(users!.callCount).toBe(180); // 100 + 80 across the two flush-window rows
    expect(users!.duplicateCount).toBe(20); // 12 + 8
    expect(users!.p50).toBe(10);
    expect(users!.p95).toBe(50);
    expect(users!.p99).toBe(50);

    const reports = insights.endpoints.find((e) => e.endpoint === '/api/reports/export');
    expect(reports).toBeDefined();
    expect(reports!.p95).toBe(2500);
  });

  it('computes waste ratio and KPIs from the fixtures', () => {
    const insights = computeInsights(endpointStatsFixture, violationsFixture, null);

    // total calls: 100 + 80 + 40 = 220; errors: (5+3) + (1+1) + 5 = 15; duplicates: 12+8 = 20
    // slow endpoint volume: only /api/reports/export has p95 > 1000ms -> its 40 calls
    expect(insights.kpis.totalCallsPerDay).toBe(220);
    expect(insights.waste.duplicateCalls).toBe(20);
    expect(insights.waste.errorRetryVolume).toBe(15);
    expect(insights.waste.slowEndpointVolume).toBe(40);
    expect(insights.kpis.wasteRatio).toBeCloseTo(75 / 220, 5);
    expect(insights.kpis.errorRate).toBeCloseTo(15 / 220, 5);
    expect(insights.violationCount).toBe(violationsFixture.length);
  });

  it('derives monthly savings from a latency-weighted waste ratio, with a visible breakdown', () => {
    const withCost = computeInsights(endpointStatsFixture, violationsFixture, 1000);
    // users/:id: 30 wasted calls x 23.33ms avg = 700ms wasted. reports/export is flagged slow
    // (p95 2500 > 1000), so its whole 40-call volume counts as wasted: 45 wasted calls x 1200ms = 54000ms.
    // total wasted 54700ms / total latency 52200ms > 1, so the ratio (and therefore the dollar
    // figure) is capped at 100% of the reported infra cost, not an arbitrary multiple of it.
    expect(withCost.money.methodology.totalWastedLatencyMs).toBeCloseTo(54700, 5);
    expect(withCost.money.methodology.totalLatencyMs).toBeCloseTo(52200, 5);
    expect(withCost.money.monthlySavings).toBeCloseTo(1000, 5);

    const withoutCost = computeInsights(endpointStatsFixture, violationsFixture, null);
    expect(withoutCost.money.monthlySavings).toBe(0);
    expect(withoutCost.money.methodology.infraCostPerMonth).toBeNull();
  });

  it('weighs waste by latency, not raw call count — a high-volume-but-cheap endpoint should not dominate the dollar estimate', () => {
    const now = 1735689600000;
    const rows: EndpointStatsRow[] = [
      {
        id: 'fast-heavy-duplicates',
        team_id: 'team-1',
        endpoint: '/api/cheap',
        method: 'GET',
        window_start: now,
        window_end: now + 60000,
        call_count: 900,
        status_2xx: 900,
        status_3xx: 0,
        status_4xx: 0,
        status_5xx: 0,
        status_other: 0,
        latency_buckets: [900, 0, 0, 0, 0, 0, 0, 0, 0, 0], // all in the 10ms bucket -> p95 ~10ms
        latency_sum: 9000, // avg 10ms/call
        latency_max: 15,
        duplicate_count: 900, // every single call is a same-second duplicate
        field_presence: null,
        created_at: '2026-07-01T00:00:00.000Z',
      },
      {
        id: 'slow-but-healthy',
        team_id: 'team-1',
        endpoint: '/api/expensive',
        method: 'GET',
        window_start: now,
        window_end: now + 60000,
        call_count: 100,
        status_2xx: 100,
        status_3xx: 0,
        status_4xx: 0,
        status_5xx: 0,
        status_other: 0,
        latency_buckets: [0, 0, 0, 0, 0, 100, 0, 0, 0, 0], // all in the 500ms bucket -> p95 500ms, under the slow threshold
        latency_sum: 80000, // avg 800ms/call
        latency_max: 900,
        duplicate_count: 0, // zero waste on this one
        field_presence: null,
        created_at: '2026-07-01T00:00:00.000Z',
      },
    ];

    const insights = computeInsights(rows, [], 1000);

    // Call-count-based waste ratio would say 90% (900 duplicate calls out of 1000 total) —
    // dramatically overstating cost, since those 900 calls are cheap (10ms each).
    expect(insights.kpis.wasteRatio).toBeCloseTo(0.9, 5);

    // Latency-weighted: the cheap endpoint's waste is only 9000ms out of 89000ms total latency.
    expect(insights.money.methodology.totalWastedLatencyMs).toBeCloseTo(9000, 5);
    expect(insights.money.methodology.totalLatencyMs).toBeCloseTo(89000, 5);
    expect(insights.money.monthlySavings).toBeCloseTo((9000 / 89000) * 1000, 5);
    expect(insights.money.monthlySavings).toBeLessThan(insights.kpis.wasteRatio * 1000);
  });

  it('returns an all-zero Insights object for empty input, never NaN', () => {
    const insights = computeInsights([], [], null);

    expect(insights.endpoints).toEqual([]);
    expect(insights.kpis).toEqual({
      totalCallsPerDay: 0,
      errorRate: 0,
      healthScore: 100,
      wasteRatio: 0,
    });
    expect(insights.waste).toEqual({ duplicateCalls: 0, errorRetryVolume: 0, slowEndpointVolume: 0 });
    expect(insights.money).toEqual({
      wasteRatio: 0,
      monthlySavings: 0,
      methodology: { totalWastedLatencyMs: 0, totalLatencyMs: 0, infraCostPerMonth: null },
    });
    expect(insights.violationCount).toBe(0);

    for (const value of [
      insights.kpis.errorRate,
      insights.kpis.healthScore,
      insights.kpis.wasteRatio,
      insights.money.monthlySavings,
    ]) {
      expect(Number.isNaN(value)).toBe(false);
    }
  });
});
