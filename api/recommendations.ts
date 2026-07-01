import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';

// This function is fully self-contained (no imports from src/): package.json's
// "type": "module" makes Vercel's build enforce node16/nodenext module resolution here,
// which requires explicit .js extensions on every relative import — including type-only
// ones. Simplest fix is no relative imports at all. insights/journeys pass through to
// Claude and Supabase's jsonb column untouched, so this function doesn't need their shape.
const supabaseUrl = 'https://odgbuevicaklqygbykos.supabase.co';
const supabaseAnonKey = 'sb_publishable_iBPK_t8lnmU4bFbwMxUQZw_6dhM6N21';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Ask Vercel for as much execution time as the plan allows — a Claude call with
// thinking enabled can run past the default 10s limit.
export const config = { maxDuration: 60 };

/** How long a cached recommendation set is served before calling Claude again.
 * This also doubles as the rate limit on real Claude calls per team. */
const CACHE_WINDOW_MINUTES = 30;

const RecSchema = z.object({
  priorityFix: z.object({ title: z.string(), rationale: z.string() }),
  recommendations: z.array(
    z.object({
      title: z.string(),
      endpoint: z.string(),
      problem: z.string(),
      fix: z.string(),
      severity: z.enum(['high', 'medium', 'low']),
      estimatedMonthlySavingsUsd: z.number(),
    })
  ),
});

const SYSTEM = `You are Indi's API optimization analyst. You receive measured, privacy-safe
analytics for a company's production APIs (traffic, latency percentiles, error rates, duplicate
calls, contract violations, and user journeys). Recommend concrete, high-impact fixes.

Each entry in journeys.flows[] has a repeatedSteps array: endpoints called more than once, on
average (avgCallsPerSession), by a single user session while walking that flow. This is a
same-session redundancy signal — distinct from insights' endpoint-level duplicate count, which is
a same-second re-request check. A step with avgCallsPerSession well above 1 means users are
re-fetching the same endpoint multiple times within one journey (e.g. re-viewing a product, or a
client re-fetching on every navigation instead of caching within the session) — prioritize
recommendations that address this when it appears, citing the specific flow (its step sequence)
and avgCallsPerSession number.

Rules: only reason from the numbers provided; never invent traffic or costs. Dollar estimates must
derive from the supplied wasteRatio and infraCost — if those are absent, set savings to 0. Rank by
measured impact.`;

const anthropic = new Anthropic();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) {
    res.status(401).json({ error: 'Missing bearer token' });
    return;
  }

  const { data: userData, error: userError } = await supabase.auth.getUser(token);
  if (userError || !userData.user) {
    res.status(401).json({ error: 'Invalid token' });
    return;
  }

  const { teamId, insights, journeys } = (req.body ?? {}) as {
    teamId?: string;
    insights?: Record<string, unknown>;
    journeys?: Record<string, unknown>;
  };

  if (!teamId || !insights || !journeys) {
    res.status(400).json({ error: 'Missing teamId, insights, or journeys' });
    return;
  }

  // Scoped to the caller's own JWT (not the shared anon client) so RLS enforces team ownership.
  const scopedClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const { data: team } = await scopedClient.from('teams').select('id').eq('id', teamId).single();
  if (!team) {
    res.status(403).json({ error: 'Team not found or not yours' });
    return;
  }

  const { data: cached } = await scopedClient
    .from('team_recommendations')
    .select('recommendations, generated_at')
    .eq('team_id', teamId)
    .single();

  if (cached) {
    const ageMinutes = (Date.now() - new Date(cached.generated_at).getTime()) / 60000;
    if (ageMinutes < CACHE_WINDOW_MINUTES) {
      res.status(200).json({ available: true, ...cached.recommendations });
      return;
    }
  }

  try {
    const response = await anthropic.messages.parse({
      model: 'claude-opus-4-8',
      max_tokens: 4096,
      thinking: { type: 'adaptive' },
      system: [{ type: 'text', text: SYSTEM, cache_control: { type: 'ephemeral' } }],
      messages: [{ role: 'user', content: JSON.stringify({ insights, journeys }) }],
      output_config: { effort: 'low', format: zodOutputFormat(RecSchema) },
    });

    const parsed = response.parsed_output;

    await scopedClient.from('team_recommendations').upsert(
      { team_id: teamId, recommendations: parsed, generated_at: new Date().toISOString() },
      { onConflict: 'team_id' }
    );

    res.status(200).json({ available: true, ...parsed });
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) {
      res.status(429).json({ available: false, error: 'rate_limited' });
      return;
    }
    if (error instanceof Anthropic.APIError) {
      console.error('Anthropic API error:', error);
      res.status(200).json({ available: false });
      return;
    }
    console.error('Unexpected error generating recommendations:', error);
    res.status(200).json({ available: false });
  }
}
