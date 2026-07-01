# Indi — `indi-web` Build Plan (Dashboard + Claude Agent)

> Handoff from the SDK side. This is the plan for the **`indi-web` repo** (Next.js on Vercel,
> Supabase, Claude API). The SDK (`indi-runtime`) is done and already writing to Supabase.
> Copy this file into the `indi-web` repo and execute from there.

## The contract you're building against (already live)

The SDK writes three tables in the **existing** Supabase project `odgbuevicaklqygbykos`
(migration `006_create_analytics_tables.sql`). You consume them; you don't change the SDK.

| Table | Grain | Key columns |
|---|---|---|
| `violations` | one row per contract violation | `endpoint` (templated), `method`, `type`, `path`, `message`, `expected`, `actual`, `response_time`, `status_code`, `created_at` |
| `endpoint_stats` | one row per endpoint per flush window | `endpoint` (templated, e.g. `/api/users/:id`), `method`, `window_start`/`window_end` (**BIGINT epoch-ms**), `call_count`, `status_2xx..5xx`, `status_other`, `latency_buckets` (jsonb int[]), `latency_sum`, `latency_max`, `duplicate_count`, `field_presence` (jsonb) |
| `session_traces` | one row per session-trace flush | `session_id`, `started_at`/`ended_at` (**BIGINT epoch-ms**), `events` (jsonb: `[{step, method, status, tOffsetMs, durMs}]`), `flow_tags` (jsonb: `[{name, matched, converted}]`), `status_summary` (jsonb) |

**Five things that will bite you if you forget them:**
1. **Timestamps are BIGINT epoch-ms**, not `timestamptz`. Convert: `to_timestamp(window_start / 1000.0)`.
2. **Reads are RLS-gated to the team's authenticated user** (`team_id IN (SELECT id FROM teams WHERE user_id = auth.uid())`). Read with the **user's Supabase session**, never the anon key. The anon key can only INSERT.
3. **Latency is a fixed histogram**, bucket upper bounds `[10,25,50,100,250,500,1000,2500,5000, ∞]` ms. Compute percentiles server-side from `latency_buckets` — mirror `estimatePercentile` in the SDK's `src/analytics/aggregator.ts`.
4. **`endpoint` is already templated** (`/api/users/:id`) — group directly, no cleanup needed.
5. **`session_traces` rows are per-flush**; one session can span several rows. **Merge by `session_id`** (ordering events by `tOffsetMs`) before mining journeys.

## Decisions carried over from the SDK plan
- **Money = measured waste × customer-supplied infra cost.** No invented "47% / $0.01 per 1K." Waste signals you actually have: `duplicate_count`, error rates (status classes), slow-endpoint volume (percentiles × call_count).
- **Journeys are core.** Flow mining is server-side (cross-session view lives here). Named funnels arrive pre-tagged in `flow_tags`; auto-mine the rest.
- **Claude is a single structured call**, not an agent — it reads computed insights JSON and returns schema-validated recommendations. Start simple.

---

# Milestones

## M1 — Data access + insights computation  *(server-side, no UI yet)*

### Step 1.1 — Supabase server client (RLS, user-scoped)
- **Files:** `lib/supabase/server.ts`.
- Use `@supabase/ssr` to create a **server** client bound to the logged-in user's cookies, so RLS
  returns only that team's rows. Do **not** use the service-role key for dashboard reads.
- **Tests:** a seeded user sees only their team's rows; a different user sees none.

### Step 1.2 — Insights computation module
- **Files:** `lib/insights/compute.ts`.
- Read `endpoint_stats` + `violations` for a team over a time range; produce:
  - **KPIs:** total calls/day, error rate, health score, waste ratio.
  - **Per-endpoint:** call_count, error%, p50/p95/p99 (from `latency_buckets`), duplicate_count.
  - **Waste signals:** duplicate calls, error-and-retry volume, slow-endpoint volume.
  - **Money:** `savings = wasteRatio × customerInfraCost` (customer-supplied; see Step 3.4).
- Port `estimatePercentile(buckets, latencyMax, p)` from the SDK verbatim (same bucket bounds).
- **Tests** — `lib/insights/compute.test.ts`: percentile parity with the SDK on a known histogram;
  waste ratio math; empty-data returns zeros, not NaN.

### Step 1.3 — Fixtures
- **Files:** `lib/insights/__fixtures__/`.
- Realistic `endpoint_stats` / `session_traces` / `violations` rows (the SDK's
  `scripts/demo-insights.ts` output is a good reference) so UI + Claude prompt work offline.

## M2 — Flow mining + API routes

### Step 2.1 — Flow mining engine  *(the algorithmic core — schedule real time)*
- **Files:** `lib/journeys/mine.ts`.
- Input: `session_traces` for a team. Steps:
  1. **Merge** rows by `session_id`; concatenate `events`, sort by `tOffsetMs`.
  2. **Mine frequent sequences** — prefix-tree / PrefixSpan-lite over the ordered `step` lists;
     surface flows like `search → product → checkout (70% of sessions)`.
  3. **Funnels:** per-step retention for each mined + named (`flow_tags`) flow.
  4. **Drop-off points:** where sessions exit the funnel prefix.
  5. **Conversion:** `flow_tags[].converted` for named flows; goal-step reached for mined ones.
  6. **Per-flow cost / violations / performance:** join flow steps back to `endpoint_stats`
     (cost = Σ call cost across steps) and `violations` (per endpoint in the flow).
- **Tests** — `lib/journeys/mine.test.ts`: merge-by-session ordering; a planted 70%-frequency
  sequence is surfaced; drop-off point identified; named `flow_tags` merged with mined flows.

### Step 2.2 — API routes (App Router, server)
- `app/api/insights/route.ts` → endpoint metrics + KPIs (computes via M1).
- `app/api/journeys/route.ts` → flows, funnels, drop-offs, cost/violations/perf per flow (via M2.1).
- `app/api/violations/route.ts` → contract violations (direct read).
- **Tests:** each route returns the computed shape for a seeded team; unauthorized request → 401/empty.

## M3 — Dashboard UI  *(the approved dark design)*

### Step 3.1 — Layout + top KPIs
- Money metrics (biggest/brightest): monthly savings, calls/day, speed improvement, health score.
### Step 3.2 — Content sections
- Contract Violations · Where Money Is Leaking · #1 Priority Fix · Slow Endpoints · Recommendations.
### Step 3.3 — Journeys section
- Funnel / sankey / drop-off viz; **cost per flow, violations per flow, performance per flow**.
### Step 3.4 — Customer infra-cost input
- A settings field where the customer enters their monthly infra cost; persisted per team.
  All dollar figures derive from it × measured waste. **Never hardcode a savings number.**
- **Tests:** components render from fixtures; money figures are `input × wasteRatio`, not constants.

## M4 — Claude Agent (recommendations)  *(build last; easiest to bolt on)*

### Step 4.1 — Recommendation route
- **Files:** `app/api/recommendations/route.ts` (server only — the API key never reaches the client).
- **Surface: a single structured Claude call** (not an agent). This is a
  read-insights → return-JSON task; keep it at the simplest tier.
- **SDK:** `@anthropic-ai/sdk`. **Model:** `claude-opus-4-8` (swap to `claude-sonnet-4-6` if you want
  a cheaper/faster tier — that's a cost decision, make it explicitly). **Adaptive thinking** on.
- **Structured output:** use `messages.parse()` + `zodOutputFormat(schema)` so the response is
  schema-valid JSON — no brittle parsing.
- **Prompt caching:** put the **stable instructions in `system`** with `cache_control`; put the
  **volatile insights JSON in the user message**. Do not interpolate timestamps/team-ids into `system`.

```ts
// app/api/recommendations/route.ts  (Next.js App Router, server)
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";

const RecSchema = z.object({
  priorityFix: z.object({ title: z.string(), rationale: z.string() }),
  recommendations: z.array(
    z.object({
      title: z.string(),
      endpoint: z.string(),
      problem: z.string(),
      fix: z.string(),
      severity: z.enum(["high", "medium", "low"]),
      estimatedMonthlySavingsUsd: z.number(),
    })
  ),
});

const client = new Anthropic(); // reads ANTHROPIC_API_KEY from server env — never expose to client

const SYSTEM = `You are Indi's API optimization analyst. You receive measured, privacy-safe
analytics for a company's production APIs (traffic, latency percentiles, error rates, duplicate
calls, contract violations, and user journeys). Recommend concrete, high-impact fixes.
Rules: only reason from the numbers provided; never invent traffic or costs. Dollar estimates must
derive from the supplied wasteRatio and infraCost — if those are absent, set savings to 0. Rank by
measured impact.`;

export async function POST(req: Request) {
  const { insights } = await req.json(); // computed by lib/insights + lib/journeys

  const response = await client.messages.parse({
    model: "claude-opus-4-8",
    max_tokens: 16000,
    thinking: { type: "adaptive" },
    system: [{ type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } }],
    messages: [{ role: "user", content: JSON.stringify(insights) }],
    output_config: { format: zodOutputFormat(RecSchema) },
  });

  return Response.json(response.parsed_output);
}
```

- **Auth/env:** set `ANTHROPIC_API_KEY` in Vercel project env (server scope). It must never be in a
  `NEXT_PUBLIC_*` var or reach the browser bundle.
- **Errors:** wrap in typed handling — `Anthropic.RateLimitError` (back off), `Anthropic.APIError`
  (surface a soft failure; the dashboard should still render the computed metrics without Claude).
- **Cost control:** recommendations are not per-page-load — generate on demand or cache per team for
  N minutes. Opus 4.8 is $5/$25 per M tok; the insights JSON is small, so cost is dominated by
  output. `claude-sonnet-4-6` ($3/$15) is the cost lever if needed.
- **Tests:** feed a fixture insights blob → assert `parsed_output` matches `RecSchema`, savings are 0
  when `infraCost`/`wasteRatio` absent, and the route degrades gracefully when the API errors.

### Step 4.2 — Render recommendations + #1 priority fix
- Wire `priorityFix` and `recommendations` into the M3 sections.

## M5 — Integration, security, launch
- **End-to-end:** point a staging app at the live SDK → confirm rows land → dashboard shows real
  numbers → Claude produces recommendations.
- **Security pass:** confirm dashboard reads use the **user session** (RLS), the **anon key is never
  used for reads**, and `ANTHROPIC_API_KEY` is server-only. Rate-limit the recommendations route.
- **Perf:** the insights/journeys computation over large windows — paginate or pre-aggregate if slow.
- **Launch checklist** below.

---

# Architecture at a glance

```
Browser (dashboard, user session)
   │  authenticated reads (RLS-scoped)
   ▼
Next.js API routes on Vercel ── lib/insights (compute) ── Supabase (endpoint_stats, violations)
   │                         └─ lib/journeys (mine) ───── Supabase (session_traces)
   │  server-only
   ▼
Claude API (claude-opus-4-8, structured output)  ← ANTHROPIC_API_KEY (server env)
```

# Timeline (aligns with the 6–8 week SDK plan)
| Week | indi-web |
|---|---|
| 1 | M1 data access + insights compute + fixtures |
| 2 | M2 flow mining + API routes |
| 3 | M3 dashboard UI (KPIs, sections) |
| 4 | M3 journeys viz + infra-cost input; M4 Claude route |
| 5–6 | M4 render recs; M5 integration, security, perf, launch |

# Risks
- **Flow mining is the hard part** — validate on fixtures before wiring the UI.
- **Percentile parity** — a wrong port of the histogram math makes the whole "3.2x faster" claim wrong; unit-test against the SDK's values.
- **RLS misconfig** — the easiest security mistake is reading with the service-role/anon key and leaking cross-team data. Read with the user session.
- **Claude cost/latency** — cache recommendations; don't regenerate on every render.

# Definition of done
- [ ] Dashboard shows real per-endpoint metrics, contract violations, and waste signals from the live tables.
- [ ] Journeys section shows mined flows, funnels, drop-offs, and cost/violations/performance per flow.
- [ ] Claude returns schema-valid, flow-aware recommendations; the dashboard still works if Claude is down.
- [ ] Every dollar figure = customer infra cost × measured waste ratio (no constants).
- [ ] All reads are RLS-scoped to the logged-in team; `ANTHROPIC_API_KEY` is server-only; recs route is rate-limited.
- [ ] Staging end-to-end run passed against the live SDK.
```
