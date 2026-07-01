-- Cache for the last Claude-generated recommendations per team. Also doubles as the rate
-- limit for the /api/recommendations route (at most one real Claude call per cache window).
CREATE TABLE IF NOT EXISTS team_recommendations (
  team_id UUID PRIMARY KEY REFERENCES teams(id) ON DELETE CASCADE,
  recommendations JSONB NOT NULL,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE team_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own team recommendations" ON team_recommendations
  FOR ALL USING (team_id IN (SELECT id FROM teams WHERE user_id = auth.uid()))
  WITH CHECK (team_id IN (SELECT id FROM teams WHERE user_id = auth.uid()));
