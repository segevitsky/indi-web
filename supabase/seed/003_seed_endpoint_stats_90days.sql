-- Generates 90 days of endpoint_stats for the Meridian HR story (see README.md).
-- One row per endpoint per day (treat each day as a single flush window — the schema doesn't
-- care about window granularity, it's just counts within a window).

-- Small helper: build a latency_buckets histogram (10 buckets: [10,25,50,100,250,500,1000,2500,5000,overflow])
-- concentrated around center_idx (1-10), given a total call count. Synthetic/approximate on purpose.
CREATE OR REPLACE FUNCTION _fake_latency_buckets(total bigint, center_idx int) RETURNS jsonb AS $$
DECLARE
  buckets bigint[] := array_fill(0::bigint, ARRAY[10]);
  c int := GREATEST(1, LEAST(10, center_idx));
BEGIN
  IF total <= 0 THEN RETURN to_jsonb(buckets); END IF;
  buckets[c] := (total * 0.55)::bigint;
  buckets[LEAST(c + 1, 10)] := buckets[LEAST(c + 1, 10)] + (total * 0.25)::bigint;
  buckets[GREATEST(c - 1, 1)] := buckets[GREATEST(c - 1, 1)] + (total * 0.12)::bigint;
  buckets[LEAST(c + 2, 10)] := buckets[LEAST(c + 2, 10)]
    + (total - buckets[c] - buckets[LEAST(c+1,10)] - buckets[GREATEST(c-1,1)]);
  RETURN to_jsonb(buckets);
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
  team uuid := '017d549d-0278-4227-a91d-a74fbf6bb15d';
  day_offset int;
  d date;
  window_start_ms bigint;
  window_end_ms bigint;
  is_weekend boolean;
  in_review_cycle boolean;
  weekday_mult numeric;
  review_mult numeric;
  review_error_bump numeric;
  ep RECORD;
  call_count bigint;
  err4 bigint;
  err5 bigint;
  dup bigint;
  latency_center int;
  latency_max numeric;
  -- Endpoint definitions: (endpoint, method, base_weekday_count, latency_center_bucket,
  --                        latency_max_ms, dup_rate, err4_rate, err5_rate, is_goals_endpoint)
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
BEGIN
  FOR day_offset IN 0..89 LOOP
    d := CURRENT_DATE - (89 - day_offset);
    window_start_ms := (EXTRACT(EPOCH FROM d::timestamp) * 1000)::bigint;
    window_end_ms := window_start_ms + 86400000;
    is_weekend := EXTRACT(DOW FROM d) IN (0, 6);
    in_review_cycle := day_offset BETWEEN 40 AND 53; -- ~2-week quarterly review window

    weekday_mult := CASE WHEN is_weekend THEN 0.12 ELSE 1.0 + (random() * 0.2 - 0.1) END;
    review_mult := CASE WHEN in_review_cycle THEN 3.2 ELSE 1.0 END;
    review_error_bump := CASE WHEN in_review_cycle THEN 0.08 ELSE 0 END;

    FOR ep IN SELECT * FROM jsonb_array_elements(endpoints) AS e(e) LOOP
      call_count := GREATEST(0, (
        (ep.e->>2)::bigint * weekday_mult *
        (CASE WHEN (ep.e->>8)::boolean THEN review_mult ELSE 1.0 END)
      )::bigint);

      CONTINUE WHEN call_count = 0; -- skip this endpoint for this day (mostly weekends for niche endpoints)

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
        team, ep.e->>0, ep.e->>1, window_start_ms, window_end_ms, call_count,
        GREATEST(0, call_count - err4 - err5), 0, err4, err5, 0,
        _fake_latency_buckets(call_count, latency_center),
        call_count * latency_max * 0.6, latency_max, dup, NULL
      );
    END LOOP;
  END LOOP;
END $$;
