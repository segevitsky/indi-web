import type { EndpointDailyRollupRow, WeeklyTrendPoint } from './types';

/** Monday (UTC) of the week containing this YYYY-MM-DD date string. */
function weekStartOf(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00Z');
  const diffToMonday = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - diffToMonday);
  return d.toISOString().slice(0, 10);
}

/** Aggregates daily rollups (across all endpoints) into one point per week — enough to see
 * a multi-week trend without 90 cramped daily bars. */
export function computeWeeklyTrend(rollups: EndpointDailyRollupRow[]): WeeklyTrendPoint[] {
  const byWeek = new Map<string, { totalCalls: number; errorCalls: number }>();

  for (const row of rollups) {
    const week = weekStartOf(row.day);
    const entry = byWeek.get(week) ?? { totalCalls: 0, errorCalls: 0 };
    entry.totalCalls += row.call_count;
    entry.errorCalls += row.status_4xx + row.status_5xx;
    byWeek.set(week, entry);
  }

  return Array.from(byWeek.entries())
    .map(([weekStart, v]) => ({
      weekStart,
      totalCalls: v.totalCalls,
      errorRate: v.totalCalls > 0 ? v.errorCalls / v.totalCalls : 0,
    }))
    .sort((a, b) => a.weekStart.localeCompare(b.weekStart));
}
