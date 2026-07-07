import { supabase } from '../supabase/config';
import type { Violation } from '../supabase/config';
import type { EndpointDailyRollupRow, EndpointStatsRow, SessionTraceRow } from './types';

/** Safety cap on rows pulled per query, mirroring the same bounding philosophy as src/journeys/mine.ts. */
const MAX_ROWS = 2000;
/** Rollups cover a much longer window (e.g. 90 days) across every endpoint, so a higher cap. */
const MAX_ROLLUP_ROWS = 5000;
/** Sessions accumulate faster than rollup rows (dozens/day vs. one/day/endpoint), so a longer
 * window (Journeys following the timeframe picker) needs a higher cap than the 24h-only default. */
const MAX_SESSION_ROWS = 8000;
/** Violations are comparatively rare, but fetched over the same long window for consistency. */
const MAX_VIOLATION_ROWS = 2000;

export async function fetchEndpointStats(teamId: string, sinceMs: number): Promise<EndpointStatsRow[]> {
  const { data, error } = await supabase
    .from('endpoint_stats')
    .select('*')
    .eq('team_id', teamId)
    .gte('window_start', sinceMs)
    .order('window_start', { ascending: false })
    .limit(MAX_ROWS);

  if (error) {
    console.error('Error fetching endpoint stats:', error);
    return [];
  }

  return data || [];
}

export async function fetchSessionTraces(teamId: string, sinceMs: number): Promise<SessionTraceRow[]> {
  const { data, error } = await supabase
    .from('session_traces')
    .select('*')
    .eq('team_id', teamId)
    .gte('started_at', sinceMs)
    // Newest first — same reasoning as fetchDailyRollups: if the row cap is ever hit, it should
    // drop old history, not the recent sessions the dashboard actually cares about.
    .order('started_at', { ascending: false })
    .limit(MAX_SESSION_ROWS);

  if (error) {
    console.error('Error fetching session traces:', error);
    return [];
  }

  return data || [];
}

export async function fetchViolations(teamId: string, sinceMs: number): Promise<Violation[]> {
  const { data, error } = await supabase
    .from('violations')
    .select('*')
    .eq('team_id', teamId)
    .gte('created_at', new Date(sinceMs).toISOString())
    .order('created_at', { ascending: false })
    .limit(MAX_VIOLATION_ROWS);

  if (error) {
    console.error('Error fetching violations:', error);
    return [];
  }

  return data || [];
}

export async function fetchDailyRollups(teamId: string, sinceMs: number): Promise<EndpointDailyRollupRow[]> {
  const sinceDate = new Date(sinceMs).toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from('endpoint_daily_rollups')
    .select('*')
    .eq('team_id', teamId)
    .gte('day', sinceDate)
    // Newest first: Supabase/PostgREST silently caps responses at a server-side max-rows
    // setting (commonly 1000) regardless of the .limit() requested here — ordering ascending
    // meant a truncated response kept the *oldest* rows and dropped the most recent ones,
    // which is exactly backwards for a dashboard that cares most about recent data.
    .order('day', { ascending: false })
    .limit(MAX_ROLLUP_ROWS);

  if (error) {
    console.error('Error fetching daily rollups:', error);
    return [];
  }

  return data || [];
}
