import { supabase } from '../supabase/config';
import type { EndpointStatsRow, SessionTraceRow } from './types';

/** Safety cap on rows pulled per query, mirroring the same bounding philosophy as src/journeys/mine.ts. */
const MAX_ROWS = 2000;

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
    .order('started_at', { ascending: false })
    .limit(MAX_ROWS);

  if (error) {
    console.error('Error fetching session traces:', error);
    return [];
  }

  return data || [];
}
