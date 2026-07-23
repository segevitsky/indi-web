# Meridian HR — 90-day synthetic dataset

Story: **Meridian**, a fictional HR SaaS modeled on HiBob's real public API shape
(apidocs.hibob.com), monitoring its own APIs with Indi. The data represents one 300-person client
company using Meridian's product — 300 employees, ~30 managers, ~10 HR admins, ~3 payroll admins.

Team used: `017d549d-0278-4227-a91d-a74fbf6bb15d` (the existing test team already logged into).

## Run these in order

1. `001_endpoint_daily_rollups_schema.sql` — creates the new rollup table (safe to re-run).
2. `002_cleanup_old_mock_data.sql` — **optional and destructive**. Clears the old e-commerce mock
   data for this team so it doesn't mix with the new story. The DELETE statements are commented
   out by default — only uncomment and run this if you actually want the old mock data gone.
3. `003_seed_endpoint_stats_90days.sql` — generates 90 days of `endpoint_stats`, one row per
   endpoint per day, with realistic weekday/weekend patterns, a 2-week review-cycle spike, and
   three intentionally "planted" problems (see comments in the file).
4. `004_seed_session_traces_90days.sql` — generates realistic per-persona sessions each day
   (day-to-day flows + a long onboarding chain), so the Journeys section has real patterns to mine.
5. `005_populate_daily_rollups_from_stats.sql` — aggregates the `endpoint_stats` just seeded into
   `endpoint_daily_rollups`, one row per endpoint per day. This is the same operation the real
   daily cron job (`api/rollup.ts`, planned but not yet built) would do — just run once over
   history instead of going forward one real day at a time.
6. `006_seed_violations_90days.sql` — seeds contract/latency violations for the **two real
   problems only** (`/api/time-off/balance/:id` latency; `/api/goals/:id` review-cycle 500 spike +
   a `progress` number→string `type_mismatch`). Healthy endpoints get **no** violations by design.
7. `007_add_latency_buckets_to_rollups.sql` — adds a `latency_buckets` column to the rollup
   table (needed so multi-day percentile views can merge histograms correctly, not just already-
   computed p95s — see the dashboard's timeframe-selector work). **After running this, re-run
   `005` once more** to backfill `latency_buckets` on the rows already seeded.
8. `008_daily_meridian_data_function.sql` — creates `seed_one_day_of_meridian_data(target_date)`,
   a reusable function called automatically once a day by `api/seed-daily-meridian-data.ts` via
   Vercel Cron (see `vercel.json`). **This is the permanent fix for the data going stale** — once
   this is deployed and `CRON_SECRET` is set in Vercel, manual re-seeding of 003/004/005/006
   should no longer be needed; the dataset keeps itself current forever, one fresh day at a time,
   with no pruning (history just keeps accumulating). It also adds recurring real-world calendar
   events beyond the original one-time review-cycle spike: quarterly reviews (recurring every
   year now, not just once), open enrollment (November), a holiday lull (late Dec/early Jan), and
   boosted new-hire onboarding waves (January/September).

Each file is self-contained SQL — run with `supabase db push` if these are added as real
migrations, or paste directly into the Supabase SQL editor / `psql` in order.

## What's "planted" (worth knowing before looking at the dashboard)

- **`/api/org-chart` and `/api/people/:id`** — called repeatedly within a single session (managers
  clicking through several direct reports' profiles) — a *universal* pattern, shows up for every
  persona. This drives the `repeatedSteps` journey signal.
- **`/api/reports/:id/status`** — HR admins polling for report completion instead of it being
  event-driven — an *HR-only* pattern, high call volume relative to how many reports are actually
  generated.
- **`/api/time-off/balance/:id`** — slow (not high-error, not duplicated) because it recomputes
  historical accrual on every call — a latency problem, not a volume/duplication one.
- **`/api/attendance/clock`** — some genuine same-second duplicates (double-taps on mobile).
- **`/api/goals/:id` and `/api/goals/:id` (update)** — a ~2-week spike in volume and error rate
  partway through the 90 days, representing a quarterly performance-review cycle.
- Everything else is deliberately "healthy" — a control group that a correct analysis should
  *not* flag as a problem.

## Execution log — run 2026-07-05 (against live project `odgbuevicaklqygbykos`)

All files were executed against the linked Supabase project via `supabase db query --linked`.
Files run in order: **001, 003, 004, 005, 006** (002 was **not** run — see below).

### Final state (team `017d549d-0278-4227-a91d-a74fbf6bb15d`)
| Table | Rows | Span |
|---|---|---|
| `endpoint_stats` | 1,350 | 90 days (2026-04-07 → 2026-07-05), 15 endpoints × 90 |
| `session_traces` | 3,126 | 90 days |
| `endpoint_daily_rollups` | 1,350 | 90 days (1:1 with stats) |
| `violations` | 48 | time-off/balance slow (22, steady) + goals review-cycle (26, ~May 17–30) |

### SQL fixes applied to the seed files (mechanical only — zero changes to data/patterns)
The scripts had never been executed; three Postgres syntax bugs were fixed in place so the files
are now correct and re-runnable:
1. **003** — `jsonb_array_elements(endpoints) AS e` → `AS e(e)` (alias the column so `ep.e` resolves;
   the loop record's field is otherwise `value`, not `e`).
2. **004** — 4 array-append lines got `::text` casts (`text[] || 'literal'` is ambiguous and
   Postgres tried to parse the string as an array literal).
3. **005** — the 3 `_estimate_percentile(...)` calls now pass `latency_max::numeric` (the helper
   declares `numeric`; the column is `double precision`, which doesn't implicitly cast).
4. **006** — the `type_mismatch` row casts its text literals (`ARRAY['number']::text[]`,
   `'string'::text`) so `to_jsonb()` can infer the type.

### Data cleanup (instead of running 002)
002 was skipped because its DELETEs are team-wide and we seeded **before** cleaning — running them
would have wiped the new Meridian data. Instead, a **surgical** cleanup removed only pre-existing
non-Meridian noise for this team:
- 8 old e-commerce/smoke `endpoint_stats` rows, 46 `mock-%` `session_traces`, 11 e-commerce/smoke
  `violations`.
- 30 leftover `violations` from someone running the **indi-runtime demo app** (`/api/orders`,
  `/api/users`, `/test`) — these were **replaced** by the Meridian violations in `006`.

Net result: the three data tables now contain **Meridian-only** data.

## `009_regenerate_employee_flows_with_dropoff_correlation.sql` — run 2026-07-24

Checked against 30 real days of data whether the dashboard's drop-off-correlation feature had ever
actually fired — it hadn't. Root cause: a session's flow (which endpoints, how many steps) was
decided before any call's latency existed, so `/api/time-off/balance/:id` sessions either always
stopped right after it or always continued to a third step, independent of how slow that call
turned out to be — nothing correlated for the feature to find, however well-calibrated its
thresholds were.

Fixed in `008` (`_maybe_continue_after_slow_call`, applied to the employee flow branch — now a
genuine, randomly-realized probability skew: 25% chance of continuing after a slow call, 80% after
a fast one, both against the same 1000ms threshold the real feature measures against). That only
fixes new days going forward, though — the ~90 days of `session_traces` already in the table were
from the old, uncorrelated logic. `009` wipes `session_traces` for this team and re-loops
`seed_one_day_of_meridian_data` (already fixed) over the past 90 real calendar days, regenerating
everything with the corrected logic. (`endpoint_stats`/`endpoint_daily_rollups`/`violations` don't
need an explicit wipe first — they're deleted/upserted by `window_start`/`day`/date-range, all
consistent regardless of which script produced them, so re-looping the function naturally
refreshes them too; harmless collateral churn, not a real change to any of their conclusions.)

Verified after running: the drop-off signal now fires for real —
`/api/people/:id → /api/time-off/balance/:id`, 43 "healthy" sessions continued 83.7% of the time,
394 "moderate" (slow) sessions only 25.9% — a genuine ~58-point gap.
