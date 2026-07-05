import { describe, expect, it } from 'vitest';
import { computeWeeklyTrend } from './trends';
import type { EndpointDailyRollupRow } from './types';

function row(day: string, callCount: number, errorCalls: number): EndpointDailyRollupRow {
  return {
    id: `r-${day}`,
    team_id: 'team-1',
    endpoint: '/api/goals/:id',
    method: 'GET',
    day,
    call_count: callCount,
    status_2xx: callCount - errorCalls,
    status_3xx: 0,
    status_4xx: errorCalls,
    status_5xx: 0,
    status_other: 0,
    duplicate_count: 0,
    latency_sum: 0,
    latency_max: 0,
    p50: null,
    p95: null,
    p99: null,
    created_at: `${day}T00:00:00.000Z`,
  };
}

describe('computeWeeklyTrend', () => {
  it('aggregates daily rollups into one point per week', () => {
    const rollups = [
      row('2026-05-04', 100, 2), // Monday
      row('2026-05-05', 100, 2), // Tuesday, same week
      row('2026-05-11', 300, 30), // next Monday — the planted spike week
    ];

    const trend = computeWeeklyTrend(rollups);

    expect(trend).toHaveLength(2);
    expect(trend[0].weekStart).toBe('2026-05-04');
    expect(trend[0].totalCalls).toBe(200);
    expect(trend[0].errorRate).toBeCloseTo(4 / 200, 5);

    expect(trend[1].weekStart).toBe('2026-05-11');
    expect(trend[1].totalCalls).toBe(300);
    expect(trend[1].errorRate).toBeCloseTo(30 / 300, 5);
  });

  it('surfaces a planted spike week as a visibly higher point', () => {
    const rollups = [
      row('2026-04-06', 500, 5),
      row('2026-04-13', 500, 5),
      row('2026-04-20', 1600, 130), // spike: much higher volume and error rate
      row('2026-04-27', 500, 5),
    ];

    const trend = computeWeeklyTrend(rollups);
    const spikeWeek = trend.find((w) => w.weekStart === '2026-04-20');

    expect(spikeWeek).toBeDefined();
    expect(spikeWeek!.totalCalls).toBeGreaterThan(trend[0].totalCalls * 2);
    expect(spikeWeek!.errorRate).toBeGreaterThan(trend[0].errorRate * 2);
  });

  it('returns an empty array for no data', () => {
    expect(computeWeeklyTrend([])).toEqual([]);
  });
});
