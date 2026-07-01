import { describe, expect, it } from 'vitest';
import { computeInsights } from './compute';
import { endpointStatsFixture } from './fixtures/endpointStats.fixture';
import { violationsFixture } from './fixtures/violations.fixture';

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

  it('derives monthly savings only from wasteRatio x infraCostPerMonth, never a constant', () => {
    const withCost = computeInsights(endpointStatsFixture, violationsFixture, 1000);
    expect(withCost.money.monthlySavings).toBeCloseTo(withCost.money.wasteRatio * 1000, 5);

    const withoutCost = computeInsights(endpointStatsFixture, violationsFixture, null);
    expect(withoutCost.money.monthlySavings).toBe(0);
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
    expect(insights.money).toEqual({ wasteRatio: 0, monthlySavings: 0 });
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
