# indi-web

Dashboard + marketing site for **Indi** — measures real API waste (duplicates, errors, slow
endpoints, redundant journey re-fetches) and shows customers what it's costing them in dollars,
tied to their own reported infra spend. Full history of what's been built: `SESSION_HANDOFF.md`
(read it before starting nontrivial work — it explains *why* things are shaped the way they are).

Stack: Vite + React + React Router SPA (not Next.js, deliberately), Supabase (Postgres + Auth +
RLS), deployed on Vercel at indimapper.com. Test/demo team:
`017d549d-0278-4227-a91d-a74fbf6bb15d` (90+ days of realistic synthetic HR-SaaS traffic, refreshed
automatically every day via a Vercel Cron — never needs manual re-seeding).

## Non-negotiable conventions

- **Always typecheck with `npx tsc --noEmit -p tsconfig.app.json`** (src/) and
  `-p tsconfig.node.json` (vite.config.ts + `api/**/*.ts`). The root `tsconfig.json` is an empty
  solution file — `npx tsc --noEmit -p .` silently checks nothing.
- **Every file in `api/*.ts` must be fully self-contained** — no imports from `src/`, even
  type-only ones. `package.json`'s `"type": "module"` forces Vercel's build into strict ESM
  resolution for functions, and cross-boundary imports crash at runtime
  (`ERR_MODULE_NOT_FOUND`) even after fixing `.js` extensions. Inline whatever's needed (Supabase
  client setup, loosened request types).
- **Never use a service-role key.** All Supabase access goes through the caller's own JWT + RLS,
  or a `SECURITY DEFINER` Postgres function scoped to one hardcoded team (see
  `seed_one_day_of_meridian_data` for the pattern) — not an admin key in Vercel env vars.
- **Never prune historical data.** `endpoint_daily_rollups`/`session_traces` are kept forever on
  purpose — cheap to keep, and directly enables baseline/drift-style features. Don't add a cleanup
  job without discussing it first.
- **PostgREST caps any response at ~1000 rows on this project, regardless of `.limit()`.** Any
  query that can exceed that must page through with `.range()` (see `fetchAllPages` in
  `src/insights/fetchLive.ts`), ordered newest-first so truncation never drops recent data.
- **Favor simple, explainable math over sophisticated-sounding but opaque methods.** Ratios and
  sums a customer could verify by hand, not statistical significance tests or ML — this is a
  deliberate positioning choice, not a shortcut. When adding a new metric, ask "could I explain
  this in one sentence to someone who doesn't trust vendor dashboards" before shipping it.
- **When building or changing an analytical feature (money math, drop-off, anomalies, etc.),
  verify it against the real live dataset before calling it done, not just unit tests with
  synthetic fixtures.** Pull real rows via `supabase db query "..." --linked` (bypasses RLS,
  unlike the anon `supabase-js` client without a login) into a scratch JSON file, then run the
  actual `src/` function against it with `npx vite-node scratch-check.ts`. Delete scratch files
  afterward — never commit them. This caught two real bugs in the drop-off signal that passed
  every unit test.

## Data model

- `session_traces` — real per-session event sequences (`step`, `method`, `status`, `durMs`,
  `tOffsetMs`, optional `page`). Powers Journeys.
- `endpoint_stats` — per-endpoint counts, one row per ~1-minute flush window. Powers the 24h view.
- `endpoint_daily_rollups` — `endpoint_stats` squashed to one row per endpoint per day, kept
  forever. Powers 7d/30d/90d views, Trends, Unusual Activity.
- `violations` — contract/behavior violations. Only `slow_response`/`unexpected_status` count
  toward dollar cost (see `TIME_COST_VIOLATION_TYPES`); a correctness issue like `type_mismatch`
  doesn't cost extra processing time even though it's still worth flagging.

## Where things live

- `src/insights/` — pure, tested compute logic for KPIs/money/trends/anomalies (`npx vitest run`).
- `src/journeys/` — pure, tested journey mining (funnels, drop-off, repeated steps).
- `src/Dashboard.tsx`, `src/Settings.tsx`, `src/RuntimeSDK.tsx` — the UI.
- `api/recommendations.ts`, `api/seed-daily-meridian-data.ts` — the two serverless functions.
- `supabase/seed/` — the synthetic dataset's seed scripts and design notes (`README.md`).
