# Session Handoff — Indi Dashboard

Last rewritten 2026-07-14. Read this first for orientation, then `CLAUDE.md` for always-relevant
conventions/gotchas (that file is auto-loaded into every session in this repo, this one isn't).

## What this project is

`indi-web` is the dashboard + marketing site for **Indi** — a product that measures real API
waste (duplicate calls, errors, slow endpoints, redundant journey re-fetches) via a separate SDK
repo (`indi-runtime`, not touched in this project, lives at
`/Users/segevshoval/Desktop/workspace/indi-runtime`) and shows customers exactly what it's
costing them — in dollars, tied to their own reported infra spend, not an invented cloud-pricing
formula — with AI-generated fix recommendations grounded in real observed behavior.

Stack: **Vite + React + React Router SPA** (not Next.js, deliberately), Supabase (Postgres + Auth
+ RLS), deployed on **Vercel** (Hobby plan) at indimapper.com.

Test/demo team used throughout: `017d549d-0278-4227-a91d-a74fbf6bb15d` — a fictional HR SaaS
("Meridian," modeled on HiBob's public API) with 90+ days of realistic synthetic traffic,
refreshed automatically every day (see below).

## The data model, three tiers of granularity

- **`session_traces`** — real, ordered, per-session event sequences (each event has `step`,
  `method`, `status`, `durMs`, `tOffsetMs`, optional `page`). Powers Journeys — funnel mining,
  drop-off detection, repeated-step redundancy.
- **`endpoint_stats`** — per-endpoint call/status/latency counts, one row per flush window
  (~1 minute in real production). Powers the 24h dashboard view.
- **`endpoint_daily_rollups`** — `endpoint_stats` squashed to one row per endpoint per day,
  **kept forever, never pruned** (a deliberate choice — cheap to keep, and more history only helps
  future baseline/drift work). Powers 7d/30d/90d views, Trends, and Unusual Activity.

`violations` records contract/behavior violations (`slow_response`, `unexpected_status`,
`type_mismatch`, etc.) — only `slow_response`/`unexpected_status` count toward dollar cost
(`TIME_COST_VIOLATION_TYPES` in both `insights/compute.ts` and `journeys/mine.ts`), since a
correctness problem like a type mismatch doesn't cost extra processing time.

## Everything built, in order

**M1–M4 (original rebuild, July 2)**: `src/insights/` (`computeInsights` — pure function turning
raw rows into KPIs/waste/money), `src/journeys/` (`mineJourneys` — a frequent-sequence miner over
sessions: funnels, drop-off, repeated steps), `src/Dashboard.tsx` + `src/Settings.tsx` (the actual
UI), `api/recommendations.ts` (the one serverless function — hides the Anthropic key, calls
`claude-opus-4-8` with structured output for a priority fix + recommendations, 30-min cache per
team doubling as a rate limit, falls back to the last known-good cached answer if a fresh call
fails rather than showing nothing).

**Meridian synthetic dataset + automated daily refresh**: `supabase/seed/003`–`008` seed 90 days of
realistic traffic with real-calendar-driven patterns (quarterly review cycles, open enrollment,
holiday lulls, new-hire waves, weekday/weekend shape). `008_daily_meridian_data_function.sql`
defines `seed_one_day_of_meridian_data(target_date)`, a `SECURITY DEFINER` Postgres function
letting the cron write to this team's data without a service-role key in Vercel.
`api/seed-daily-meridian-data.ts` is a Vercel Cron target (`vercel.json`'s `crons` array, `0 6 * * *`,
`CRON_SECRET` bearer-auth) that calls it every day — check **Vercel → Settings → Cron Jobs** to see
it, or **Deployments → Functions → Logs** filtered to that path for run history.

**Money methodology — latency-weighted, and later corrected**: `insights/compute.ts`'s
`computeInsights` weighs waste by processing time, not raw call count (`wastedLatencyMs` per
endpoint, summed to `totalWastedLatencyMs`), so a slow endpoint's waste isn't diluted by a
high-volume-but-cheap endpoint's duplicates. `monthlySavings = min(1, totalWastedLatencyMs /
totalLatencyMs) * infraCostPerMonth` — always a share of the customer's *own reported* number,
never an invented per-call cloud rate. Per-endpoint `estimatedMonthlyCost` is a proportional slice
of that total, provably summing back to it exactly.

Later corrected: originally, an endpoint whose p95 crossed the slow threshold had its *entire*
call volume counted as wasted — but p95 only describes the worst 5%, so this overcounted badly.
`countSlowCalls` now uses the actual latency histogram to count only calls that genuinely landed
past the threshold.

**Timeframe picker (24h/7d/30d/90d)**: `TimeRange` type in `Dashboard.tsx`; KPIs/Slow
Endpoints/Money Leaking/Priority Fix read `endpoint_stats` (24h) or filtered
`endpoint_daily_rollups` (longer) via the shared `WasteRow` interface so `computeInsights` doesn't
need an adapter. Journeys follows the same picker by filtering the already-fetched 90-day session
pool and re-mining. AI Recommendations deliberately stays pinned to a fixed 24h view (cost/latency
of live Claude calls).

**The PostgREST 1000-row cap**: this Supabase project's PostgREST layer silently caps any response
at ~1000 rows regardless of `.limit()`. `fetchAllPages` in `insights/fetchLive.ts` pages through in
900-row batches via `.range()`, applied to `fetchSessionTraces`/`fetchDailyRollups` (both now
exceed 1000 rows given the never-prune policy). Always fetch newest-first, so any residual
truncation drops old data, never recent.

**Plain-English layer**: `GlossaryModal`, `TermTooltip`, dynamic "what's happening" bullets on
Money Leaking cards (`buildWhatsHappening`) — only shows signals actually present on that
endpoint, never a fixed template.

**Journey violations connected to real records**: journey cards show a hoverable "N violations"
with real matching examples, clicking scrolls to and filters the Contract Violations section.

**Marketing page (`RuntimeSDK.tsx`) rewritten**: to describe the real, current product — journey/
behavior-based detection alongside raw API waste, a "See a real journey" showcase section, honest
calculator disclaimer (its simple per-call model is explicitly framed as a rough pre-install
estimate, not how the real installed product's math works).

**Tooltip clipping fixed**: a shared `Tooltip` component (in `Dashboard.tsx`) renders via a React
portal into `document.body` instead of being positioned relative to its trigger — a plain
`absolute`-positioned tooltip inside an `overflow-y-auto` container gets clipped at that
container's edge, which is what was happening to several tooltips. Position is computed from
`getBoundingClientRect()` on hover, clamped to the viewport, flips below when there's no room
above. Every tooltip on the page uses this now.

**Drop-off correlation (`journeys/mine.ts`'s `computeDropOffSignals`)**: does a slow/errored call
at a specific step actually correlate with sessions not continuing — not just cost, but real
evidence of lost engagement. Deliberately conservative: both compared groups need ≥5 sessions, and
the gap needs to be ≥15 points, before anything is reported. Went through two real fixes after
checking it against live data:
1. Originally only checked steps *before* the last one ("continued" meant "reached the next mined
   step") — invisible to a flow that *ends* at a slow endpoint, since there's no next step to
   reach. Now the last step is checked too, using "did the session do anything at all afterward"
   as the continuation criterion instead.
2. Originally only compared healthy vs. severe (>2x the slow threshold) tiers — but a real
   endpoint can be consistently *moderately* slow without ever crossing that severe line, leaving
   the severe group permanently empty. Now tries healthy-vs-severe, then falls back to
   healthy-vs-moderate, then moderate-vs-severe, using whichever pair the real data actually
   supports (`TIER_COMPARISONS` in `mine.ts`).

**Unusual Activity (`insights/anomalies.ts`)**: flags when an endpoint's traffic, error rate, or
speed *today* is at least 2x higher or lower than that endpoint's own trailing average — not
compared to other endpoints, a simple ratio not a significance test. Requires ≥7 days of baseline
history and a meaningful typical traffic volume before checking anything. Reads
`endpoint_daily_rollups` (already fetched for Trends), no new data collection. Deliberately
ignores the timeframe picker — the whole point is comparing today to history, so it always uses
the full rollup window.

## Key architectural decisions (with reasoning)

- **No Next.js migration** — RLS-scoped Supabase reads are equally secure client-side as
  server-side (Postgres enforces RLS off the JWT regardless of where the query runs); the only
  real need for a server is hiding the Anthropic key, which is one Vercel function, not a
  framework change.
- **`api/*.ts` must be fully self-contained** — cannot import from `src/` at runtime (see gotchas).
- **No service-role key anywhere** — every Supabase access, including the daily cron write, goes
  through either the caller's own JWT + RLS, or a `SECURITY DEFINER` Postgres function scoped to
  one hardcoded team, never an admin/service-role key in Vercel env vars.
- **Never prune historical data** — raw rollups persist forever on purpose; cheap to keep, and
  directly enables the drop-off/anomaly-detection work built this session. Don't reintroduce a
  cleanup job without discussing it first.
- **Simple, explainable math over sophisticated-sounding but opaque methods** — ratios and sums a
  customer can verify by hand, not statistical significance tests, z-scores, or ML models. This
  shows up everywhere: the money calc, the drop-off signal's tier gates, Unusual Activity's 2x
  ratio threshold.

## Known gotchas

1. **`npx tsc --noEmit -p .` does NOT typecheck `src/`.** Always use `-p tsconfig.app.json`
   (src/) and `-p tsconfig.node.json` (vite.config.ts + `api/**/*.ts`) explicitly, or `npx tsc -b`.
2. **`api/*.ts` importing from `../src/*` breaks in production**, even for type-only imports —
   `package.json`'s `"type": "module"` forces `node16`/`nodenext` resolution, and even after fixing
   import extensions, cross-boundary runtime imports crash with `ERR_MODULE_NOT_FOUND` on Vercel.
   Keep every `api/*.ts` file fully self-contained (own inline Supabase client, loosened request
   types instead of importing `src/` types).
3. **Vercel's default function timeout is 10s** — a Claude call needs
   `export const config = { maxDuration: 60 }`.
4. **Vercel env var changes need a fresh deployment to take effect** — setting/changing an env var
   in the dashboard alone doesn't propagate to already-deployed functions.
5. **PostgREST caps responses at ~1000 rows regardless of `.limit()`** on this project — use
   `fetchAllPages` (pages via `.range()`) for any table that can exceed that, always ordered
   newest-first.
6. **Raw `ALTER TABLE` via the Supabase SQL editor can leave PostgREST's schema cache stale** —
   symptom: "Could not find the 'x' column... in the schema cache" even though it exists. Fix:
   `NOTIFY pgrst, 'reload schema';`.
7. **Testing `/api/*` routes on `localhost:5173` will never work** — Vite's dev server has no
   concept of Vercel serverless functions. Test against the real deployed domain.
8. **PL/pgSQL local variable names colliding with actual column names** inside a query in the same
   function causes "column reference is ambiguous" — prefix local variables (`v_call_count`, not
   `call_count`) when the function also queries a table with that column name.
9. **A tooltip positioned `absolute` relative to its trigger gets clipped by any ancestor's
   `overflow-y-auto`.** Use the shared `Tooltip` component (portal-based) for any new tooltip,
   don't reintroduce the ad-hoc pattern.

## Verifying against real data, not just unit tests

Several features this session were built, unit-tested, then re-verified against the actual live
99-day dataset before being considered done — worth repeating for future analytical features,
since synthetic-fixture tests can pass while a real-data edge case (like the two drop-off fixes
above) goes undetected. Pattern used:

```bash
# Pull real rows via the CLI (bypasses RLS, unlike the anon supabase-js client without a login)
supabase db query "SELECT json_agg(row_to_json(t)) FROM (SELECT * FROM <table> WHERE team_id = '017d549d-0278-4227-a91d-a74fbf6bb15d' ...) t;" --linked > scratch-data.json

# Then run the actual compute function against it directly
npx vite-node scratch-check.ts   # imports the real src/ function, reads the JSON, prints results
```

Always delete the `scratch-*` files afterward — they're temporary, never committed.

## Not yet built — open directions

- **Baseline/drift beyond today-vs-history** — Unusual Activity only compares the single most
  recent day to a blended average of all prior days (weekdays and weekends mixed together). A
  day-of-week-adjusted baseline (compare a Tuesday to previous Tuesdays) would be more sensitive,
  discussed but not built.
- **Security-relevant anomaly framing** — traffic-anomaly detection is real and honest for
  "this endpoint's behavior looks statistically abnormal," but there's no IP tracking, no
  auth-identity tracking, no payload inspection — so this should not be marketed as attack
  detection without a real scoping conversation first.
- **Gradient + "likely server-side" framing for drop-off** — discussed as ways to make the
  drop-off correlation more convincing (a smooth decline across severity levels, and the argument
  that server-side-caused slowness is closer to a natural experiment than typical correlations).
  The three-tier gradient check *is* built (`thirdTier` in `DropOffSignal`); the narrative framing
  point was discussed but never turned into UI copy.

## Quick orientation for a new session

- `src/insights/`, `src/journeys/` — pure, tested compute logic (`npm run test` / `npx vitest run`).
- `src/Dashboard.tsx`, `src/Settings.tsx`, `src/RuntimeSDK.tsx` — the actual UI (dashboard,
  settings, marketing page).
- `api/recommendations.ts`, `api/seed-daily-meridian-data.ts` — the two serverless functions,
  both self-contained by necessity.
- `supabase/seed/README.md` — the Meridian dataset's design and how to re-seed if ever needed
  (shouldn't be, now that the daily cron keeps it fresh automatically).
- `.env` has a real `ANTHROPIC_API_KEY` locally (not committed); same key is set in Vercel's env
  vars for production.
