import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Self-contained per the same api/*.ts gotcha as api/recommendations.ts — no imports from src/.
const supabaseUrl = 'https://odgbuevicaklqygbykos.supabase.co';
const supabaseAnonKey = 'sb_publishable_iBPK_t8lnmU4bFbwMxUQZw_6dhM6N21';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const config = { maxDuration: 30 };

/** Vercel Cron calls this once a day with Authorization: Bearer <CRON_SECRET> automatically,
 * matching CRON_SECRET set in the project's environment variables. The Postgres function this
 * calls is SECURITY DEFINER and scoped to the one hardcoded Meridian team_id, so no service-role
 * key is needed here — the anon client is sufficient. */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const authHeader = req.headers.authorization;
  const expected = `Bearer ${process.env.CRON_SECRET ?? ''}`;
  if (!process.env.CRON_SECRET || authHeader !== expected) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const targetDate = new Date().toISOString().slice(0, 10);

  const { error } = await supabase.rpc('seed_one_day_of_meridian_data', { target_date: targetDate });

  if (error) {
    console.error('Error seeding daily Meridian data:', error);
    res.status(500).json({ ok: false, targetDate, error: error.message });
    return;
  }

  res.status(200).json({ ok: true, targetDate });
}
