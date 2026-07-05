-- Generates realistic per-persona sessions for 90 days (see README.md).
-- A representative sample of sessions per day, not literally all 300 employees — the mining
-- engine cares about relative patterns/frequency, not absolute headcount.
-- Each event carries a `page` (templated frontend route the call fired from) alongside
-- step/method/status/timing — matches the `page` field the SDK now captures on real traffic.

CREATE OR REPLACE FUNCTION _fake_session_events(steps text[], methods text[], base_durs int[], pages text[])
RETURNS jsonb AS $$
DECLARE
  events jsonb := '[]'::jsonb;
  t bigint := 0;
  i int;
  dur int;
BEGIN
  FOR i IN 1..array_length(steps, 1) LOOP
    dur := GREATEST(20, (base_durs[i] * (0.8 + random() * 0.4))::int);
    events := events || jsonb_build_object(
      'step', steps[i], 'method', methods[i], 'status', 200, 'tOffsetMs', t, 'durMs', dur, 'page', pages[i]
    );
    t := t + dur + (300 + (random() * 2200)::int);
  END LOOP;
  RETURN events;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
  team uuid := '017d549d-0278-4227-a91d-a74fbf6bb15d';
  day_offset int;
  d date;
  day_start_ms bigint;
  is_weekend boolean;
  i int;
  n_employees int;
  n_managers int;
  n_hr int;
  session_start bigint;
  events jsonb;
  total_dur bigint;
  r numeric;
  poll_count int;
  poll_steps text[];
  poll_methods text[];
  poll_durs int[];
  poll_pages text[];
  j int;
BEGIN
  FOR day_offset IN 0..89 LOOP
    d := CURRENT_DATE - (89 - day_offset);
    day_start_ms := (EXTRACT(EPOCH FROM d::timestamp) * 1000)::bigint;
    is_weekend := EXTRACT(DOW FROM d) IN (0, 6);

    n_employees := CASE WHEN is_weekend THEN 3 ELSE 25 + (random() * 10)::int END;
    n_managers := CASE WHEN is_weekend THEN 1 ELSE 8 + (random() * 4)::int END;
    n_hr := CASE WHEN is_weekend THEN 0 ELSE 5 + (random() * 3)::int END;

    -- Employee day-to-day sessions (a few realistic variants). Employees hit /api/people/:id
    -- from their own /dashboard.
    FOR i IN 1..n_employees LOOP
      session_start := day_start_ms + (8 + random() * 11)::bigint * 3600000; -- ~8am-7pm
      r := random();
      IF r < 0.5 THEN
        events := _fake_session_events(
          ARRAY['/api/people/:id', '/api/time-off/balance/:id'],
          ARRAY['GET', 'GET'], ARRAY[80, 1200],
          ARRAY['/dashboard', '/time-off']);
      ELSIF r < 0.7 THEN
        events := _fake_session_events(
          ARRAY['/api/people/:id', '/api/attendance/clock'],
          ARRAY['GET', 'POST'], ARRAY[80, 60],
          ARRAY['/dashboard', '/attendance']);
      ELSIF r < 0.85 THEN
        events := _fake_session_events(
          ARRAY['/api/people/:id', '/api/time-off/balance/:id', '/api/time-off/requests'],
          ARRAY['GET', 'GET', 'POST'], ARRAY[80, 1200, 200],
          ARRAY['/dashboard', '/time-off', '/time-off/new']);
      ELSE
        events := _fake_session_events(
          ARRAY['/api/people/:id', '/api/payroll/salary-history/:id'],
          ARRAY['GET', 'GET'], ARRAY[80, 220],
          ARRAY['/dashboard', '/payroll/:id/history']);
      END IF;
      total_dur := (SELECT MAX((e->>'tOffsetMs')::bigint + (e->>'durMs')::bigint) FROM jsonb_array_elements(events) e);

      INSERT INTO session_traces (team_id, session_id, started_at, ended_at, events, flow_tags, status_summary)
      VALUES (team, 'emp-' || day_offset || '-' || i, session_start, session_start + total_dur, events, '[]'::jsonb, '{}'::jsonb);
    END LOOP;

    -- Manager sessions — clicking through several direct reports from the org chart. Here the
    -- SAME /api/people/:id endpoint fires from /org-chart (not /dashboard) — the context that
    -- distinguishes the planted universal-repeat pattern.
    FOR i IN 1..n_managers LOOP
      session_start := day_start_ms + (8 + random() * 10)::bigint * 3600000;
      events := _fake_session_events(
        ARRAY['/api/people/:id', '/api/org-chart', '/api/people/:id', '/api/people/:id',
              '/api/time-off/requests/:id/approve', '/api/goals/:id'],
        ARRAY['GET', 'GET', 'GET', 'GET', 'POST', 'GET'],
        ARRAY[80, 200, 80, 80, 300, 350],
        ARRAY['/org-chart', '/org-chart', '/org-chart', '/org-chart', '/time-off/approvals', '/goals']);
      total_dur := (SELECT MAX((e->>'tOffsetMs')::bigint + (e->>'durMs')::bigint) FROM jsonb_array_elements(events) e);

      INSERT INTO session_traces (team_id, session_id, started_at, ended_at, events, flow_tags, status_summary)
      VALUES (team, 'mgr-' || day_offset || '-' || i, session_start, session_start + total_dur, events, '[]'::jsonb, '{}'::jsonb);
    END LOOP;

    -- HR admin sessions — report-status polling (the HR-only planted waste), all from /reports.
    FOR i IN 1..n_hr LOOP
      session_start := day_start_ms + (8 + random() * 9)::bigint * 3600000;
      poll_count := 5 + (random() * 8)::int;
      poll_steps := ARRAY['/api/people/:id'];
      poll_methods := ARRAY['GET'];
      poll_durs := ARRAY[80];
      poll_pages := ARRAY['/dashboard'];
      FOR j IN 1..poll_count LOOP
        poll_steps := poll_steps || '/api/reports/:id/status'::text;
        poll_methods := poll_methods || 'GET'::text;
        poll_durs := poll_durs || 60;
        poll_pages := poll_pages || '/reports'::text;
      END LOOP;
      poll_steps := poll_steps || '/api/reports/:id'::text;
      poll_methods := poll_methods || 'GET'::text;
      poll_durs := poll_durs || 400;
      poll_pages := poll_pages || '/reports'::text;

      events := _fake_session_events(poll_steps, poll_methods, poll_durs, poll_pages);
      total_dur := (SELECT MAX((e->>'tOffsetMs')::bigint + (e->>'durMs')::bigint) FROM jsonb_array_elements(events) e);

      INSERT INTO session_traces (team_id, session_id, started_at, ended_at, events, flow_tags, status_summary)
      VALUES (team, 'hr-' || day_offset || '-' || i, session_start, session_start + total_dur, events, '[]'::jsonb, '{}'::jsonb);
    END LOOP;

    -- Onboarding chain — roughly twice a week, not every day (new hires aren't a daily event)
    IF NOT is_weekend AND random() < 0.28 THEN
      session_start := day_start_ms + (9 + random() * 6)::bigint * 3600000;
      events := _fake_session_events(
        ARRAY['/api/people/:id', '/api/org-chart', '/api/onboarding/wizard/:id',
              '/api/onboarding/wizard/:id', '/api/documents/:id/sign', '/api/goals/:id'],
        ARRAY['PATCH', 'GET', 'POST', 'POST', 'POST', 'PATCH'],
        ARRAY[300, 200, 550, 550, 900, 350],
        ARRAY['/employee/:id/edit', '/org-chart', '/onboarding/:id', '/onboarding/:id', '/documents/:id/sign', '/goals']);
      total_dur := (SELECT MAX((e->>'tOffsetMs')::bigint + (e->>'durMs')::bigint) FROM jsonb_array_elements(events) e);

      INSERT INTO session_traces (team_id, session_id, started_at, ended_at, events, flow_tags, status_summary)
      VALUES (
        team, 'onboarding-' || day_offset, session_start, session_start + total_dur, events,
        '[{"name": "new_hire_onboarding", "matched": true, "converted": true}]'::jsonb, '{}'::jsonb
      );
    END IF;
  END LOOP;
END $$;
