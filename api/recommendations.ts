import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';
import { supabase, supabaseUrl, supabaseAnonKey } from '../src/supabase/config';
import type { Insights } from '../src/insights/types';
import type { JourneysResult } from '../src/journeys/types';

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
    insights?: Insights;
    journeys?: JourneysResult;
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
      max_tokens: 16000,
      thinking: { type: 'adaptive' },
      system: [{ type: 'text', text: SYSTEM, cache_control: { type: 'ephemeral' } }],
      messages: [{ role: 'user', content: JSON.stringify({ insights, journeys }) }],
      output_config: { format: zodOutputFormat(RecSchema) },
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
