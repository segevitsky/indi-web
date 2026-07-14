import { describe, expect, it } from 'vitest';
import { detectTrafficAnomalies } from './anomalies';
import type { EndpointDailyRollupRow } from './types';

function makeDay(
  day: string,
  callCount: number,
  opts: { errors?: number; latencySum?: number } = {}
): EndpointDailyRollupRow {
  const errors = opts.errors ?? 0;
  return {
    id: `row-${day}`,
    team_id: 'team-1',
    endpoint: '/api/widgets',
    method: 'GET',
    day,
    call_count: callCount,
    status_2xx: callCount - errors,
    status_3xx: 0,
    status_4xx: errors,
    status_5xx: 0,
    status_other: 0,
    latency_buckets: new Array(10).fill(0),
    latency_sum: opts.latencySum ?? callCount * 100,
    latency_max: 200,
    duplicate_count: 0,
    p50: 100,
    p95: 150,
    p99: 180,
    created_at: `${day}T00:00:00.000Z`,
  };
}

/** 10 days of a steady baseline (2026-07-01 .. 2026-07-10), then a "today" row for 2026-07-11. */
function baselinePlusToday(
  baselineCallCount: number,
  todayCallCount: number,
  opts: { baselineErrors?: number; todayErrors?: number; baselineLatencySum?: number; todayLatencySum?: number } = {}
): EndpointDailyRollupRow[] {
  const days: EndpointDailyRollupRow[] = [];
  for (let i = 1; i <= 10; i++) {
    const day = `2026-07-${i.toString().padStart(2, '0')}`;
    days.push(makeDay(day, baselineCallCount, { errors: opts.baselineErrors, latencySum: opts.baselineLatencySum }));
  }
  days.push(makeDay('2026-07-11', todayCallCount, { errors: opts.todayErrors, latencySum: opts.todayLatencySum }));
  return days;
}

describe('detectTrafficAnomalies', () => {
  it('flags a clear traffic spike — today at 4x the baseline average', () => {
    const rows = baselinePlusToday(100, 400);
    const anomalies = detectTrafficAnomalies(rows);

    const trafficAnomaly = anomalies.find((a) => a.metric === 'traffic');
    expect(trafficAnomaly).toEqual({
      endpoint: '/api/widgets',
      method: 'GET',
      metric: 'traffic',
      direction: 'high',
      day: '2026-07-11',
      todayValue: 400,
      baselineAverage: 100,
      baselineDays: 10,
    });
  });

  it('flags a clear traffic drop — today at a quarter of the baseline average', () => {
    const rows = baselinePlusToday(100, 25);
    const anomalies = detectTrafficAnomalies(rows);

    const trafficAnomaly = anomalies.find((a) => a.metric === 'traffic');
    expect(trafficAnomaly?.direction).toBe('low');
    expect(trafficAnomaly?.todayValue).toBe(25);
    expect(trafficAnomaly?.baselineAverage).toBe(100);
  });

  it('does not flag anything with fewer than the minimum baseline days of history', () => {
    const rows = [
      makeDay('2026-07-08', 100),
      makeDay('2026-07-09', 100),
      makeDay('2026-07-10', 100),
      makeDay('2026-07-11', 500), // dramatic-looking, but only 3 days of baseline history
    ];
    expect(detectTrafficAnomalies(rows)).toEqual([]);
  });

  it('does not flag traffic/error swings on a barely-used endpoint, even with a dramatic ratio', () => {
    const rows = baselinePlusToday(5, 20); // 4x ratio, but baseline avg (5) is under the volume floor
    const anomalies = detectTrafficAnomalies(rows);
    expect(anomalies.find((a) => a.metric === 'traffic')).toBeUndefined();
    expect(anomalies.find((a) => a.metric === 'errors')).toBeUndefined();
  });

  it('does not flag a normal day that stays within the ordinary range', () => {
    const rows = baselinePlusToday(100, 120); // 1.2x — well under the 2x threshold
    expect(detectTrafficAnomalies(rows)).toEqual([]);
  });

  it('flags an error-rate spike independently of traffic', () => {
    // Same call volume both days, but today's error rate is 5x the baseline's.
    const rows = baselinePlusToday(100, 100, { baselineErrors: 2, todayErrors: 10 });
    const anomalies = detectTrafficAnomalies(rows);

    const errorAnomaly = anomalies.find((a) => a.metric === 'errors');
    expect(errorAnomaly?.direction).toBe('high');
    expect(errorAnomaly?.todayValue).toBeCloseTo(0.1, 5);
    expect(errorAnomaly?.baselineAverage).toBeCloseTo(0.02, 5);
    expect(anomalies.find((a) => a.metric === 'traffic')).toBeUndefined();
  });

  it('flags a speed spike independently of traffic and errors', () => {
    // Same call volume both days, but today's avg latency is 3x the baseline's.
    const rows = baselinePlusToday(100, 100, { baselineLatencySum: 100 * 50, todayLatencySum: 100 * 150 });
    const anomalies = detectTrafficAnomalies(rows);

    const speedAnomaly = anomalies.find((a) => a.metric === 'speed');
    expect(speedAnomaly?.direction).toBe('high');
    expect(speedAnomaly?.todayValue).toBe(150);
    expect(speedAnomaly?.baselineAverage).toBe(50);
    expect(anomalies.find((a) => a.metric === 'traffic')).toBeUndefined();
  });
});
