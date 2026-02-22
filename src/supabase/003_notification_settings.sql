CREATE TABLE notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE UNIQUE,
  email TEXT NOT NULL,
  frequency TEXT NOT NULL DEFAULT '1hr',  -- '30min', '1hr', 'daily'
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE notification_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  violations_count INTEGER NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own notification settings" ON notification_settings
  FOR ALL USING (team_id IN (SELECT id FROM teams WHERE user_id = auth.uid()));

CREATE POLICY "Users can view own notification log" ON notification_log
  FOR SELECT USING (team_id IN (SELECT id FROM teams WHERE user_id = auth.uid()));
