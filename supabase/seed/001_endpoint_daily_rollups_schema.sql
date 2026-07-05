-- Rollup table: one row per team/endpoint/method/day. Safe to re-run (IF NOT EXISTS).
CREATE TABLE IF NOT EXISTS endpoint_daily_rollups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  day DATE NOT NULL,
  call_count BIGINT NOT NULL DEFAULT 0,
  status_2xx BIGINT NOT NULL DEFAULT 0,
  status_3xx BIGINT NOT NULL DEFAULT 0,
  status_4xx BIGINT NOT NULL DEFAULT 0,
  status_5xx BIGINT NOT NULL DEFAULT 0,
  status_other BIGINT NOT NULL DEFAULT 0,
  duplicate_count BIGINT NOT NULL DEFAULT 0,
  latency_sum DOUBLE PRECISION NOT NULL DEFAULT 0,
  latency_max DOUBLE PRECISION NOT NULL DEFAULT 0,
  p50 NUMERIC,
  p95 NUMERIC,
  p99 NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (team_id, endpoint, method, day)
);

ALTER TABLE endpoint_daily_rollups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own team rollups" ON endpoint_daily_rollups;
CREATE POLICY "Users can view their own team rollups" ON endpoint_daily_rollups
  FOR SELECT USING (team_id IN (SELECT id FROM teams WHERE user_id = auth.uid()));
