-- Populates endpoint_daily_rollups from the endpoint_stats just seeded — the same operation
-- the real daily cron job (api/rollup.ts, planned but not yet built) would do, run once over
-- history instead of going forward one real day at a time.
--
-- NOTE: script 003 inserts exactly one endpoint_stats row per (endpoint, method, day), so this
-- is a direct per-row copy + percentile calculation, not a multi-row merge. In real production,
-- a day can have many flush-window rows per endpoint, and api/rollup.ts will need to merge them
-- (summing counters, merging latency_buckets element-wise) before computing percentiles — same
-- logic as src/insights/compute.ts's mergeEndpointStats, just grouped by day instead of by
-- endpoint across a 24h window.

CREATE OR REPLACE FUNCTION _estimate_percentile(buckets jsonb, latency_max numeric, call_count bigint, p numeric)
RETURNS numeric AS $$
DECLARE
  bounds numeric[] := ARRAY[10,25,50,100,250,500,1000,2500,5000];
  target numeric;
  cumulative numeric := 0;
  i int;
BEGIN
  IF call_count = 0 THEN RETURN 0; END IF;
  target := CEIL(p * call_count);
  FOR i IN 0..9 LOOP
    cumulative := cumulative + (buckets->>i)::numeric;
    IF cumulative >= target THEN
      IF i < 9 THEN RETURN bounds[i + 1]; ELSE RETURN latency_max; END IF;
    END IF;
  END LOOP;
  RETURN latency_max;
END;
$$ LANGUAGE plpgsql;

INSERT INTO endpoint_daily_rollups (
  team_id, endpoint, method, day, call_count, status_2xx, status_3xx, status_4xx, status_5xx,
  status_other, duplicate_count, latency_sum, latency_max, p50, p95, p99
)
SELECT
  team_id, endpoint, method,
  to_timestamp(window_start / 1000.0)::date,
  call_count, status_2xx, status_3xx, status_4xx, status_5xx, status_other, duplicate_count,
  latency_sum, latency_max,
  _estimate_percentile(latency_buckets, latency_max::numeric, call_count, 0.5),
  _estimate_percentile(latency_buckets, latency_max::numeric, call_count, 0.95),
  _estimate_percentile(latency_buckets, latency_max::numeric, call_count, 0.99)
FROM endpoint_stats
WHERE team_id = '017d549d-0278-4227-a91d-a74fbf6bb15d'
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
  p50 = EXCLUDED.p50,
  p95 = EXCLUDED.p95,
  p99 = EXCLUDED.p99;
