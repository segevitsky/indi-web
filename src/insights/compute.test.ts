import { describe, expect, it } from 'vitest';
import { computeInsights } from './compute';
import { endpointStatsFixture } from './fixtures/endpointStats.fixture';
import { violationsFixture } from './fixtures/violations.fixture';
import type { EndpointDailyRollupRow, EndpointStatsRow } from './types';

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
    // slow endpoint volume: only calls that actually landed in a slow bucket (>1000ms) count —
    // /api/reports/export's histogram [0,0,0,0,5,10,15,8,2,0] has 8+2+0=10 calls past that line,
    // not its entire 40-call volume just because its p95 happens to cross the threshold.
    expect(insights.kpis.totalCallsPerDay).toBe(220);
    expect(insights.waste.duplicateCalls).toBe(20);
    expect(insights.waste.errorRetryVolume).toBe(15);
    expect(insights.waste.slowEndpointVolume).toBe(10);
    expect(insights.kpis.wasteRatio).toBeCloseTo(45 / 220, 5);
    expect(insights.kpis.errorRate).toBeCloseTo(15 / 220, 5);
    expect(insights.violationCount).toBe(violationsFixture.length);
  });

  it('derives monthly savings from a latency-weighted waste ratio, with a visible breakdown', () => {
    const withCost = computeInsights(endpointStatsFixture, violationsFixture, 1000);
    // users/:id: 30 wasted (non-slow) calls x 23.33ms avg = 700ms wasted.
    // reports/export: 5 wasted (non-slow) calls x 1200ms avg = 6000ms, plus its 10 genuinely-slow
    // calls (from the histogram, not the whole 40) x the 1000ms threshold floor = 10000ms.
    // Total: 700 + 6000 + 10000 = 16700ms, well under the 52200ms total — no cap needed here.
    expect(withCost.money.methodology.totalWastedLatencyMs).toBeCloseTo(16700, 5);
    expect(withCost.money.methodology.totalLatencyMs).toBeCloseTo(52200, 5);
    expect(withCost.money.monthlySavings).toBeCloseTo((16700 / 52200) * 1000, 5);

    const withoutCost = computeInsights(endpointStatsFixture, violationsFixture, null);
    expect(withoutCost.money.monthlySavings).toBe(0);
    expect(withoutCost.money.methodology.infraCostPerMonth).toBeNull();
  });

  it('gives each endpoint a proportional dollar share that sums back to monthlySavings exactly', () => {
    const insights = computeInsights(endpointStatsFixture, violationsFixture, 1000);

    const users = insights.endpoints.find((e) => e.endpoint === '/api/users/:id')!;
    const reports = insights.endpoints.find((e) => e.endpoint === '/api/reports/export')!;

    expect(users.wastedLatencyMs).toBeCloseTo(700, 5);
    expect(reports.wastedLatencyMs).toBeCloseTo(16000, 5);

    // reports/export is still the dominant contributor (its slow tail + errors), despite
    // users/:id having more raw wasted calls.
    expect(reports.estimatedMonthlyCost).toBeGreaterThan(users.estimatedMonthlyCost * 10);

    const totalAllocated = insights.endpoints.reduce((sum, e) => sum + e.estimatedMonthlyCost, 0);
    expect(totalAllocated).toBeCloseTo(insights.money.monthlySavings, 5);
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

  it('computes identical Insights whether the source is endpoint_stats or endpoint_daily_rollups', () => {
    // Same values as endpointStatsFixture, reshaped as daily-rollup rows (day instead of a
    // window_start/window_end pair, no field_presence) — proves computeInsights works the same
    // over either table without an adapter, since both satisfy WasteRow.
    const rollupFixture: EndpointDailyRollupRow[] = endpointStatsFixture.map((row, i) => ({
      id: `rollup-${i}`,
      team_id: row.team_id,
      endpoint: row.endpoint,
      method: row.method,
      day: '2026-07-01',
      call_count: row.call_count,
      status_2xx: row.status_2xx,
      status_3xx: row.status_3xx,
      status_4xx: row.status_4xx,
      status_5xx: row.status_5xx,
      status_other: row.status_other,
      latency_buckets: row.latency_buckets,
      latency_sum: row.latency_sum,
      latency_max: row.latency_max,
      duplicate_count: row.duplicate_count,
      p50: null,
      p95: null,
      p99: null,
      created_at: row.created_at,
    }));

    const fromStats = computeInsights(endpointStatsFixture, violationsFixture, 1000);
    const fromRollups = computeInsights(rollupFixture, violationsFixture, 1000);

    expect(fromRollups).toEqual(fromStats);
  });

  it('only counts the genuinely slow calls, not an endpoint\'s entire volume, when p95 crosses the threshold', () => {
    const now = 1735689600000;
    const rows: EndpointStatsRow[] = [
      {
        id: 'mostly-fast-with-a-slow-tail',
        team_id: 'team-1',
        endpoint: '/api/mixed',
        method: 'GET',
        window_start: now,
        window_end: now + 60000,
        call_count: 1000,
        status_2xx: 1000,
        status_3xx: 0,
        status_4xx: 0,
        status_5xx: 0,
        status_other: 0,
        // 940 calls fast (50ms bucket), 60 calls genuinely slow (2500ms bucket) — only 6% of
        // calls are actually slow, but that's just enough to push p95 (the 950th call) over the
        // 1000ms line, since cumulative count only reaches 950 within the slow bucket.
        latency_buckets: [0, 0, 940, 0, 0, 0, 0, 60, 0, 0],
        latency_sum: 940 * 50 + 60 * 2500, // 47000 + 150000 = 197000
        latency_max: 2600,
        duplicate_count: 0,
        field_presence: null,
        created_at: '2026-07-01T00:00:00.000Z',
      },
    ];

    const insights = computeInsights(rows, [], 1000);
    const endpoint = insights.endpoints[0];

    expect(endpoint.p95).toBeGreaterThan(1000); // confirms this endpoint is flagged "slow" at all
    // Only the 60 genuinely-slow calls count as wasted volume — not all 1000.
    expect(insights.waste.slowEndpointVolume).toBe(60);
    // Wasted latency: 60 slow calls x the 1000ms threshold floor (not the whole endpoint x its
    // average, and not the 0 non-slow wasted calls, since duplicates/errors are both 0 here).
    expect(endpoint.wastedLatencyMs).toBeCloseTo(60 * 1000, 5);
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
