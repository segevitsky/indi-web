import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://odgbuevicaklqygbykos.supabase.co';
const supabaseAnonKey = 'sb_publishable_iBPK_t8lnmU4bFbwMxUQZw_6dhM6N21';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for our database tables
export interface Team {
  id: string;
  name: string;
  api_key: string;
  created_at: string;
}

export interface Indicator {
  id: string;
  team_id: string;
  endpoint: string;
  method: string;
  schema: Record<string, unknown> | null;
  thresholds: Record<string, unknown> | null;
  created_at: string;
}

export interface Violation {
  id: string;
  team_id: string | null;
  endpoint: string;
  method: string;
  type: string;
  path: string | null;
  message: string;
  expected: unknown;
  actual: unknown;
  response_time: number | null;
  status_code: number | null;
  created_at: string;
}

export interface NotificationSettings {
  id: string;
  team_id: string;
  email: string;
  frequency: string;
  enabled: boolean;
  created_at: string;
  updated_at: string;
  last_notified_at: string | null;
}

// Generate a random API key
export function generateApiKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const segments = [8, 4, 4, 4, 12];
  return 'indi_' + segments
    .map(len => Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join(''))
    .join('-');
}
