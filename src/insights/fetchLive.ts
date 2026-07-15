import { supabase } from '../supabase/config';
import type { Violation } from '../supabase/config';
import type { EndpointDailyRollupRow, EndpointStatsRow, SessionTraceRow } from './types';

/** endpoint_stats flushes roughly once a minute per endpoint under real production traffic — a
 * customer with a modest 15-20 endpoints and a real business-hours traffic pattern can plausibly
 * generate several thousand rows within a single 24h window. Sized with real headroom for that,
 * not the much lighter volume our own daily-granularity test data happens to have. */
const MAX_ROWS = 10000;
/** Rollups cover a much longer window (e.g. 90 days) across every endpoint, so a higher cap. */
const MAX_ROLLUP_ROWS = 5000;
/** Sessions accumulate faster than rollup rows (dozens/day vs. one/day/endpoint), so a longer
 * window (Journeys following the timeframe picker) needs a higher cap than the 24h-only default. */
const MAX_SESSION_ROWS = 8000;
/** Violations are comparatively rare in steady state, but a burst (e.g. a bad deploy) can spike
 * fast — paged the same as everything else here rather than trusting a single .limit(). */
const MAX_VIOLATION_ROWS = 5000;
/** Supabase/PostgREST caps a single response at a server-side max-rows setting (this project's
 * is 1000, confirmed empirically) regardless of .limit() — so any table that can realistically
 * exceed that (rollups now, at 1380+ rows and growing forever since we deliberately don't prune;
 * sessions, at 3000+) needs to page through in batches, not just ask for a bigger single .limit(). */
const PAGE_SIZE = 900;

/** Pages through a query in PAGE_SIZE batches (ordered newest-first by the caller) until either
 * a batch comes back short (no more rows) or `maxRows` is reached. */
async function fetchAllPages<T>(
  buildQuery: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: { message: string } | null }>,
  maxRows: number
): Promise<T[]> {
  const results: T[] = [];
  let offset = 0;

  while (offset < maxRows) {
    const to = Math.min(offset + PAGE_SIZE, maxRows) - 1;
    const { data, error } = await buildQuery(offset, to);
    if (error) {
      console.error('Error paging through query:', error);
      break;
    }
    if (!data || data.length === 0) break;
    results.push(...data);
    if (data.length < PAGE_SIZE) break;
    offset += PAGE_SIZE;
  }

  return results;
}

export async function fetchEndpointStats(teamId: string, sinceMs: number): Promise<EndpointStatsRow[]> {
  // Newest first, paged: our own test data undersells this table's real volume (it was seeded at
  // roughly daily granularity), but real production traffic flushes roughly once a minute per
  // endpoint — a customer with even a modest number of endpoints under real traffic can exceed
  // the ~1000-row server-side cap within a single 24h window. A bigger .limit() alone can't get
  // past that, only paging can — same bug class already fixed for session_traces/rollups.
  return fetchAllPages<EndpointStatsRow>(
    (from, to) =>
      supabase
        .from('endpoint_stats')
        .select('*')
        .eq('team_id', teamId)
        .gte('window_start', sinceMs)
        .order('window_start', { ascending: false })
        .range(from, to),
    MAX_ROWS
  );
}

export async function fetchSessionTraces(teamId: string, sinceMs: number): Promise<SessionTraceRow[]> {
  // Newest first, paged: a 90-day pull can exceed this project's ~1000-row server-side cap, and
  // paging (rather than a bigger .limit()) is the only way to actually get past it.
  return fetchAllPages<SessionTraceRow>(
    (from, to) =>
      supabase
        .from('session_traces')
        .select('*')
        .eq('team_id', teamId)
        .gte('started_at', sinceMs)
        .order('started_at', { ascending: false })
        .range(from, to),
    MAX_SESSION_ROWS
  );
}

export async function fetchViolations(teamId: string, sinceMs: number): Promise<Violation[]> {
  return fetchAllPages<Violation>(
    (from, to) =>
      supabase
        .from('violations')
        .select('*')
        .eq('team_id', teamId)
        .gte('created_at', new Date(sinceMs).toISOString())
        .order('created_at', { ascending: false })
        .range(from, to),
    MAX_VIOLATION_ROWS
  );
}

export async function fetchDailyRollups(teamId: string, sinceMs: number): Promise<EndpointDailyRollupRow[]> {
  const sinceDate = new Date(sinceMs).toISOString().slice(0, 10);
  // Newest first, paged: with no pruning (deliberate — see the daily-refresh work), this table
  // only grows, and already exceeds the ~1000-row server-side cap — a bigger .limit() alone
  // can't get past that, only paging can.
  return fetchAllPages<EndpointDailyRollupRow>(
    (from, to) =>
      supabase
        .from('endpoint_daily_rollups')
        .select('*')
        .eq('team_id', teamId)
        .gte('day', sinceDate)
        .order('day', { ascending: false })
        .range(from, to),
    MAX_ROLLUP_ROWS
  );
}
