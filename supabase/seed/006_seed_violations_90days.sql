-- Meridian HR violations for the 90-day window (see README.md).
-- Deliberately focused on the TWO real problems only — every other endpoint is a healthy
-- "control group" that a correct analysis should NOT flag as a contract/latency problem.
--   1. /api/time-off/balance/:id — persistent latency (recomputes historical accrual on every
--      call) -> recurring slow_response, steady across the whole 90 days.
--   2. /api/goals/:id (GET + PATCH) — the ~2-week quarterly review-cycle incident (days 40-53,
--      roughly the third week of the window): a 500 error spike, plus a bad deploy that changed
--      the `progress` field from number to string -> type_mismatch.
--
-- created_at is set explicitly (not NOW()) so violations land across the 90-day history.
-- Re-running appends; clear violations for the team first if you want a clean slate.

DO $$
DECLARE team uuid := '017d549d-0278-4227-a91d-a74fbf6bb15d';
BEGIN
  -- 1. Recurring slow endpoint — one roughly every 4 days across the 90-day window.
  INSERT INTO violations (team_id, endpoint, method, type, path, message,
                          expected, actual, response_time, status_code, created_at)
  SELECT team, '/api/time-off/balance/:id', 'GET', 'slow_response', NULL,
         'Response time ' || rt::text || 'ms exceeded maximum 1000ms',
         to_jsonb(1000), to_jsonb(rt), rt, 200,
         (CURRENT_DATE - g * 4)::timestamptz + (9 + random() * 8) * interval '1 hour'
  FROM generate_series(0, 21) AS g,
       LATERAL (SELECT (2800 + random() * 1400)::int AS rt) r;

  -- 2a. Review-cycle 500 spike on goals reads (clustered ~days 36-49 back).
  INSERT INTO violations (team_id, endpoint, method, type, path, message,
                          expected, actual, response_time, status_code, created_at)
  SELECT team, '/api/goals/:id', 'GET', 'unexpected_status', NULL,
         'Status 500 not in expected statuses [200]',
         to_jsonb(ARRAY[200]), to_jsonb(500), (80 + random() * 300)::int, 500,
         (CURRENT_DATE - (36 + (random() * 13)::int))::timestamptz + (9 + random() * 8) * interval '1 hour'
  FROM generate_series(1, 12) AS g;

  -- 2b. Review-cycle 500 spike on goals updates.
  INSERT INTO violations (team_id, endpoint, method, type, path, message,
                          expected, actual, response_time, status_code, created_at)
  SELECT team, '/api/goals/:id', 'PATCH', 'unexpected_status', NULL,
         'Status 500 not in expected statuses [200, 201]',
         to_jsonb(ARRAY[200, 201]), to_jsonb(500), (100 + random() * 400)::int, 500,
         (CURRENT_DATE - (36 + (random() * 13)::int))::timestamptz + (9 + random() * 8) * interval '1 hour'
  FROM generate_series(1, 8) AS g;

  -- 2c. Bad deploy during the review cycle: goals.progress changed number -> string.
  INSERT INTO violations (team_id, endpoint, method, type, path, message,
                          expected, actual, response_time, status_code, created_at)
  SELECT team, '/api/goals/:id', 'GET', 'type_mismatch', 'progress',
         'Type mismatch at ''progress'': expected number, got string',
         to_jsonb(ARRAY['number']::text[]), to_jsonb('string'::text), (60 + random() * 200)::int, 200,
         (CURRENT_DATE - (36 + (random() * 13)::int))::timestamptz + (9 + random() * 8) * interval '1 hour'
  FROM generate_series(1, 6) AS g;
END $$;
