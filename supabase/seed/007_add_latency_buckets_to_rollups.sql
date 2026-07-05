-- Adds the raw latency histogram to the daily rollup table, alongside the already-stored
-- p50/p95/p99. Percentiles can't be correctly combined across multiple days from already-computed
-- percentiles alone (that's not valid math — see README) — but bucket counts can be summed safely,
-- so a multi-day view can add up each day's buckets and compute one correct percentile from the
-- combined total. Safe to re-run.
ALTER TABLE endpoint_daily_rollups ADD COLUMN IF NOT EXISTS latency_buckets JSONB;
