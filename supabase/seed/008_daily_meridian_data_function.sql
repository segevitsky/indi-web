-- Permanent fix for the Meridian test data going stale: a reusable function that generates one
-- fresh, realistic day of Meridian traffic for any given date. Adapts the same logic as
-- 003/004/005/006 (endpoint_stats, session_traces, rollups, violations), but keyed off a real
-- calendar date instead of a fixed 90-day offset, so it can be called forever by a daily cron
-- job (see api/seed-daily-meridian-data.ts) without needing to know "day N of a 90-day window."
--
-- Calendar events are computed from the real month/day of target_date, so they recur every year:
--   - in_review_cycle: quarterly performance review (Feb/May/Aug/Nov, first 2 weeks) — the
--     existing planted goals-endpoint spike, now recurring instead of a one-time thing.
--   - in_open_enrollment: benefits open enrollment, first half of November — scales up
--     payroll/salary-history traffic.
--   - in_holiday_lull: Dec 20 - Jan 2 — reduced traffic, the opposite of a spike.
--   - in_new_hire_wave: January and September — boosted onboarding-chain frequency.
--
-- No pruning — every table just keeps growing (deliberate choice, see plan/discussion). Uses
-- ON CONFLICT DO UPDATE throughout so re-running for the same date is always safe.
--
-- Relies on _fake_latency_buckets and _fake_session_events, already created by 003/004.

CREATE OR REPLACE FUNCTION seed_one_day_of_meridian_data(target_date date)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  team uuid := '017d549d-0278-4227-a91d-a74fbf6bb15d';
  day_start_ms bigint;
  window_end_ms bigint;
  is_weekend boolean;
  in_review_cycle boolean;
  in_open_enrollment boolean;
  in_holiday_lull boolean;
  in_new_hire_wave boolean;
  weekday_mult numeric;
  review_mult numeric;
  review_error_bump numeric;
  enrollment_mult numeric;
  ep RECORD;
  call_count bigint;
  err4 bigint;
  err5 bigint;
  dup bigint;
  latency_center int;
  latency_max numeric;
  endpoints jsonb := '[
    ["/api/people/:id", "GET", 1800, 3, 180, 0.01, 0.01, 0.002, false],
    ["/api/people/:id", "PATCH", 40, 4, 300, 0.0, 0.01, 0.01, false],
    ["/api/org-chart", "GET", 1400, 3, 200, 0.01, 0.005, 0.002, false],
    ["/api/time-off/requests", "POST", 25, 4, 350, 0.0, 0.02, 0.01, false],
    ["/api/time-off/requests/:id/approve", "POST", 15, 4, 300, 0.0, 0.01, 0.01, false],
    ["/api/time-off/balance/:id", "GET", 900, 7, 4200, 0.005, 0.01, 0.005, false],
    ["/api/attendance/clock", "POST", 620, 2, 90, 0.08, 0.01, 0.002, false],
    ["/api/goals/:id", "GET", 500, 4, 400, 0.01, 0.02, 0.01, true],
    ["/api/goals/:id", "PATCH", 300, 4, 450, 0.01, 0.02, 0.01, true],
    ["/api/reports/:id/status", "GET", 640, 2, 80, 0.02, 0.005, 0.002, false],
    ["/api/reports/:id", "GET", 35, 5, 500, 0.0, 0.01, 0.005, false],
    ["/api/onboarding/wizard/:id", "POST", 18, 5, 550, 0.0, 0.02, 0.01, false],
    ["/api/documents/:id/sign", "POST", 22, 6, 900, 0.0, 0.02, 0.01, false],
    ["/api/candidates", "GET", 60, 4, 350, 0.0, 0.01, 0.005, false],
    ["/api/payroll/salary-history/:id", "GET", 90, 4, 400, 0.0, 0.01, 0.005, false]
  ]'::jsonb;
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
  onboarding_chance numeric;
  day_tag text;
  i int;
  j int;
BEGIN
  day_start_ms := (EXTRACT(EPOCH FROM target_date::timestamp) * 1000)::bigint;
  window_end_ms := day_start_ms + 86400000;
  is_weekend := EXTRACT(DOW FROM target_date) IN (0, 6);
  day_tag := to_char(target_date, 'YYYYMMDD');

  in_review_cycle := EXTRACT(MONTH FROM target_date) IN (2, 5, 8, 11) AND EXTRACT(DAY FROM target_date) BETWEEN 1 AND 14;
  in_open_enrollment := EXTRACT(MONTH FROM target_date) = 11 AND EXTRACT(DAY FROM target_date) BETWEEN 1 AND 15;
  in_holiday_lull := (EXTRACT(MONTH FROM target_date) = 12 AND EXTRACT(DAY FROM target_date) >= 20)
                   OR (EXTRACT(MONTH FROM target_date) = 1 AND EXTRACT(DAY FROM target_date) <= 2);
  in_new_hire_wave := EXTRACT(MONTH FROM target_date) IN (1, 9);

  weekday_mult := CASE
    WHEN is_weekend THEN 0.12
    WHEN in_holiday_lull THEN 0.3
    ELSE 1.0 + (random() * 0.2 - 0.1)
  END;
  review_mult := CASE WHEN in_review_cycle THEN 3.2 ELSE 1.0 END;
  review_error_bump := CASE WHEN in_review_cycle THEN 0.08 ELSE 0 END;
  enrollment_mult := CASE WHEN in_open_enrollment THEN 2.8 ELSE 1.0 END;
  onboarding_chance := CASE WHEN in_new_hire_wave THEN 0.5 ELSE 0.28 END;

  -- Clear out anything already generated for this exact date, so re-running is always safe
  -- (endpoint_stats/session_traces have no unique constraint to ON CONFLICT against).
  DELETE FROM endpoint_stats WHERE team_id = team AND window_start = day_start_ms;
  DELETE FROM session_traces WHERE team_id = team AND session_id LIKE '%-' || day_tag || '-%';

  -- === endpoint_stats ===
  FOR ep IN SELECT * FROM jsonb_array_elements(endpoints) AS e(e) LOOP
    call_count := GREATEST(0, (
      (ep.e->>2)::bigint * weekday_mult *
      (CASE WHEN (ep.e->>8)::boolean THEN review_mult ELSE 1.0 END) *
      (CASE WHEN (ep.e->>0) = '/api/payroll/salary-history/:id' THEN enrollment_mult ELSE 1.0 END)
    )::bigint);

    CONTINUE WHEN call_count = 0;

    err4 := (call_count * (ep.e->>6)::numeric)::bigint;
    err5 := (call_count * ((ep.e->>7)::numeric + (CASE WHEN (ep.e->>8)::boolean THEN review_error_bump ELSE 0 END)))::bigint;
    dup := (call_count * (ep.e->>5)::numeric)::bigint;
    latency_center := (ep.e->>3)::int;
    latency_max := (ep.e->>4)::numeric * (0.9 + random() * 0.3);

    INSERT INTO endpoint_stats (
      team_id, endpoint, method, window_start, window_end, call_count,
      status_2xx, status_3xx, status_4xx, status_5xx, status_other,
      latency_buckets, latency_sum, latency_max, duplicate_count, field_presence
    ) VALUES (
      team, ep.e->>0, ep.e->>1, day_start_ms, window_end_ms, call_count,
      GREATEST(0, call_count - err4 - err5), 0, err4, err5, 0,
      _fake_latency_buckets(call_count, latency_center),
      call_count * latency_max * 0.6, latency_max, dup, NULL
    );
  END LOOP;

  -- === session_traces (employee / manager / HR / onboarding personas) ===
  n_employees := CASE WHEN is_weekend THEN 3 WHEN in_holiday_lull THEN 5 ELSE 25 + (random() * 10)::int END;
  n_managers := CASE WHEN is_weekend THEN 1 ELSE 8 + (random() * 4)::int END;
  n_hr := CASE WHEN is_weekend THEN 0 ELSE 5 + (random() * 3)::int END;

  FOR i IN 1..n_employees LOOP
    session_start := day_start_ms + (8 + random() * 11)::bigint * 3600000;
    r := random();
    IF r < 0.5 THEN
      events := _fake_session_events(
        ARRAY['/api/people/:id', '/api/time-off/balance/:id'],
        ARRAY['GET', 'GET'], ARRAY[80, 1200], ARRAY['/dashboard', '/time-off']);
    ELSIF r < 0.7 THEN
      events := _fake_session_events(
        ARRAY['/api/people/:id', '/api/attendance/clock'],
        ARRAY['GET', 'POST'], ARRAY[80, 60], ARRAY['/dashboard', '/attendance']);
    ELSIF r < 0.85 THEN
      events := _fake_session_events(
        ARRAY['/api/people/:id', '/api/time-off/balance/:id', '/api/time-off/requests'],
        ARRAY['GET', 'GET', 'POST'], ARRAY[80, 1200, 200], ARRAY['/dashboard', '/time-off', '/time-off/new']);
    ELSE
      events := _fake_session_events(
        ARRAY['/api/people/:id', '/api/payroll/salary-history/:id'],
        ARRAY['GET', 'GET'], ARRAY[80, 220], ARRAY['/dashboard', '/payroll/:id/history']);
    END IF;
    total_dur := (SELECT MAX((e->>'tOffsetMs')::bigint + (e->>'durMs')::bigint) FROM jsonb_array_elements(events) e);

    INSERT INTO session_traces (team_id, session_id, started_at, ended_at, events, flow_tags, status_summary)
    VALUES (team, 'emp-' || day_tag || '-' || i, session_start, session_start + total_dur, events, '[]'::jsonb, '{}'::jsonb);
  END LOOP;

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
    VALUES (team, 'mgr-' || day_tag || '-' || i, session_start, session_start + total_dur, events, '[]'::jsonb, '{}'::jsonb);
  END LOOP;

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
    VALUES (team, 'hr-' || day_tag || '-' || i, session_start, session_start + total_dur, events, '[]'::jsonb, '{}'::jsonb);
  END LOOP;

  IF NOT is_weekend AND random() < onboarding_chance THEN
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
      team, 'onboarding-' || day_tag, session_start, session_start + total_dur, events,
      '[{"name": "new_hire_onboarding", "matched": true, "converted": true}]'::jsonb, '{}'::jsonb
    );
  END IF;

  -- === rollup for this date ===
  INSERT INTO endpoint_daily_rollups (
    team_id, endpoint, method, day, call_count, status_2xx, status_3xx, status_4xx, status_5xx,
    status_other, duplicate_count, latency_sum, latency_max, latency_buckets, p50, p95, p99
  )
  SELECT
    team_id, endpoint, method, target_date,
    call_count, status_2xx, status_3xx, status_4xx, status_5xx, status_other, duplicate_count,
    latency_sum, latency_max, latency_buckets,
    _estimate_percentile(latency_buckets, latency_max::numeric, call_count, 0.5),
    _estimate_percentile(latency_buckets, latency_max::numeric, call_count, 0.95),
    _estimate_percentile(latency_buckets, latency_max::numeric, call_count, 0.99)
  FROM endpoint_stats
  WHERE team_id = team AND window_start = day_start_ms
  ON CONFLICT (team_id, endpoint, method, day) DO UPDATE SET
    call_count = EXCLUDED.call_count,
    status_2xx = EXCLUDED.status_2xx,
    status_3xx = EXCLUDED.status_3xx,
    status_4xx = EXCLUDED.status_4xx,
    status_5xx = EXCLUDED.status_5xx,
    status_other = EXCLUDED.status_other,
    duplicate_count = EXCLUDED.duplicate_count,
    latency_sum = EXCLUDED.latency_sum,
    latency_max = EXCLUDED.latency_max,
    latency_buckets = EXCLUDED.latency_buckets,
    p50 = EXCLUDED.p50,
    p95 = EXCLUDED.p95,
    p99 = EXCLUDED.p99;

  -- === violations for this date ===
  DELETE FROM violations WHERE team_id = team
    AND created_at >= target_date::timestamptz AND created_at < (target_date + 1)::timestamptz;

  -- Steady slow-endpoint violation, roughly one every 4 days.
  IF (target_date - DATE '2020-01-01') % 4 = 0 THEN
    INSERT INTO violations (team_id, endpoint, method, type, path, message,
                            expected, actual, response_time, status_code, created_at)
    SELECT team, '/api/time-off/balance/:id', 'GET', 'slow_response', NULL,
           'Response time ' || rt::text || 'ms exceeded maximum 1000ms',
           to_jsonb(1000), to_jsonb(rt), rt, 200,
           target_date::timestamptz + (9 + random() * 8) * interval '1 hour'
    FROM LATERAL (SELECT (2800 + random() * 1400)::int AS rt) r;
  END IF;

  IF in_review_cycle THEN
    IF random() < 0.4 THEN
      INSERT INTO violations (team_id, endpoint, method, type, path, message,
                              expected, actual, response_time, status_code, created_at)
      VALUES (team, '/api/goals/:id', 'GET', 'unexpected_status', NULL,
              'Status 500 not in expected statuses [200]',
              to_jsonb(ARRAY[200]), to_jsonb(500), (80 + random() * 300)::int, 500,
              target_date::timestamptz + (9 + random() * 8) * interval '1 hour');
    END IF;
    IF random() < 0.3 THEN
      INSERT INTO violations (team_id, endpoint, method, type, path, message,
                              expected, actual, response_time, status_code, created_at)
      VALUES (team, '/api/goals/:id', 'PATCH', 'unexpected_status', NULL,
              'Status 500 not in expected statuses [200, 201]',
              to_jsonb(ARRAY[200, 201]), to_jsonb(500), (100 + random() * 400)::int, 500,
              target_date::timestamptz + (9 + random() * 8) * interval '1 hour');
    END IF;
    IF random() < 0.25 THEN
      INSERT INTO violations (team_id, endpoint, method, type, path, message,
                              expected, actual, response_time, status_code, created_at)
      VALUES (team, '/api/goals/:id', 'GET', 'type_mismatch', 'progress',
              'Type mismatch at ''progress'': expected number, got string',
              to_jsonb(ARRAY['number']::text[]), to_jsonb('string'::text), (60 + random() * 200)::int, 200,
              target_date::timestamptz + (9 + random() * 8) * interval '1 hour');
    END IF;
  END IF;
END;
$$;
