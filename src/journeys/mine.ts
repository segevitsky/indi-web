import { SLOW_P95_THRESHOLD_MS } from '../insights/compute';
import type { Violation } from '../supabase/config';
import type {
  DropOffSignal,
  Funnel,
  FlowConversion,
  FlowCostAndPerf,
  JourneyFlow,
  JourneysResult,
  MergedSession,
  MinedFlow,
  RepeatedStep,
  SequenceEvent,
  SessionTraceRow,
} from './types';

/** Only violation types that genuinely represent wasted processing time count toward the dollar
 * estimate — slow_response (the call itself takes longer) and unexpected_status (an error still
 * costs compute and typically triggers a client retry, the same reasoning insights/compute.ts
 * uses for error calls). A type_mismatch or schema_drift is a real, worth-flagging correctness
 * problem, but it doesn't cost extra processing time on its own, so it shouldn't inflate the
 * "wasted time" figure — it still counts in violationCount (the display total) either way. */
const TIME_COST_VIOLATION_TYPES = new Set(['slow_response', 'unexpected_status']);

/** Pages a step fired from among these events, most common first. */
function rankPagesForStep(events: SequenceEvent[], step: string): string[] {
  const pageCounts = new Map<string, number>();
  for (const e of events) {
    if (e.step === step && e.page) {
      pageCounts.set(e.page, (pageCounts.get(e.page) ?? 0) + 1);
    }
  }
  return Array.from(pageCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([page]) => page);
}

/** Only sequences of these lengths are mined. Tunable. */
const MIN_SEQUENCE_LENGTH = 2;
const MAX_SEQUENCE_LENGTH = 4;
/** A sequence must appear in at least this fraction of sessions to be surfaced. Tunable. */
const MIN_FREQUENCY = 0.1;
/** At most this many mined flows are returned, sorted by frequency. Tunable. */
const MAX_MINED_FLOWS = 20;
/** Steps beyond this many (per session) are ignored for mining — bounds the combinatorics. */
const MAX_STEPS_FOR_MINING = 20;
/** A single-step retention drop at/above this fraction is reported as the funnel's drop-off point. */
const DROP_OFF_THRESHOLD = 0.2;

/** session_traces has one row per flush window — merge rows sharing a session_id. */
export function mergeSessionsById(rows: SessionTraceRow[]): MergedSession[] {
  const byId = new Map<string, SessionTraceRow[]>();
  for (const row of rows) {
    const existing = byId.get(row.session_id);
    if (existing) existing.push(row);
    else byId.set(row.session_id, [row]);
  }

  return Array.from(byId.entries()).map(([sessionId, sessionRows]) => {
    const events = sessionRows.flatMap((r) => r.events).sort((a, b) => a.tOffsetMs - b.tOffsetMs);
    const flowTagsByName = new Map<string, boolean>();
    for (const row of sessionRows) {
      for (const tag of row.flow_tags ?? []) {
        flowTagsByName.set(tag.name, flowTagsByName.get(tag.name) || tag.converted);
      }
    }
    const flowTags = Array.from(flowTagsByName.entries()).map(([name, converted]) => ({
      name,
      matched: true,
      converted,
    }));

    return { sessionId, steps: events.map((e) => e.step), events, flowTags };
  });
}

/** True if `sub` appears in `full` in order, not necessarily contiguously. */
function isOrderedSubsequence(sub: string[], full: string[]): boolean {
  let i = 0;
  for (const step of full) {
    if (step === sub[i]) i++;
    if (i === sub.length) return true;
  }
  return sub.length === 0;
}

function distinctOrderedSubsequences(steps: string[], minLen: number, maxLen: number): string[][] {
  const capped = steps.slice(0, MAX_STEPS_FOR_MINING);
  const results: string[][] = [];
  const seen = new Set<string>();

  function backtrack(start: number, current: string[]) {
    if (current.length >= minLen) {
      const key = current.join('→');
      if (!seen.has(key)) {
        seen.add(key);
        results.push([...current]);
      }
    }
    if (current.length === maxLen) return;
    for (let i = start; i < capped.length; i++) {
      current.push(capped[i]);
      backtrack(i + 1, current);
      current.pop();
    }
  }

  backtrack(0, []);
  return results;
}

export function mineFrequentSequences(sessions: MergedSession[]): MinedFlow[] {
  const totalSessions = sessions.length;
  if (totalSessions === 0) return [];

  const sessionsBySequence = new Map<string, { steps: string[]; sessionIds: Set<string> }>();

  for (const session of sessions) {
    const candidates = distinctOrderedSubsequences(session.steps, MIN_SEQUENCE_LENGTH, MAX_SEQUENCE_LENGTH);
    for (const steps of candidates) {
      const key = steps.join('→');
      let entry = sessionsBySequence.get(key);
      if (!entry) {
        entry = { steps, sessionIds: new Set() };
        sessionsBySequence.set(key, entry);
      }
      entry.sessionIds.add(session.sessionId);
    }
  }

  const frequent = Array.from(sessionsBySequence.values()).filter(
    (entry) => entry.sessionIds.size / totalSessions >= MIN_FREQUENCY
  );

  // Drop a sequence that's a strict prefix of a longer kept one with the identical session set —
  // reporting both is redundant when they always co-occur.
  const kept = frequent.filter((entry) => {
    const isRedundantPrefix = frequent.some(
      (other) =>
        other.steps.length > entry.steps.length &&
        other.sessionIds.size === entry.sessionIds.size &&
        isOrderedSubsequence(entry.steps, other.steps) &&
        [...entry.sessionIds].every((id) => other.sessionIds.has(id))
    );
    return !isRedundantPrefix;
  });

  return kept
    .map(
      (entry): MinedFlow => ({
        steps: entry.steps,
        name: null,
        source: 'mined',
        sessionCount: entry.sessionIds.size,
        frequency: entry.sessionIds.size / totalSessions,
      })
    )
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, MAX_MINED_FLOWS);
}

/**
 * Folds flow_tags into the mined flows. When a tagged session's own steps match an existing
 * mined flow's steps, that entry is relabeled as named (never duplicated). A tag name never
 * attributable to a mined flow's steps still gets its own entry, with steps left empty since we
 * have no way to recover the customer's defineFlow() step list from flow_tags alone.
 */
export function mergeNamedFlows(sessions: MergedSession[], mined: MinedFlow[]): MinedFlow[] {
  const totalSessions = sessions.length || 1;
  const result = mined.map((flow) => ({ ...flow }));
  const namedByTag = new Map<string, Set<string>>();

  for (const session of sessions) {
    for (const tag of session.flowTags) {
      let ids = namedByTag.get(tag.name);
      if (!ids) {
        ids = new Set();
        namedByTag.set(tag.name, ids);
      }
      ids.add(session.sessionId);
    }
  }

  for (const [name, sessionIds] of namedByTag) {
    const taggedSessions = [...sessionIds]
      .map((id) => sessions.find((s) => s.sessionId === id))
      .filter((s): s is MergedSession => s !== undefined);

    // Prefer the mined flow that explains every tagged session and has the most steps (the
    // closest approximation to the customer's actual defineFlow() step list, since we can't
    // recover it exactly from flow_tags alone). Fall back to any candidate matching at least one.
    const candidates = result.filter((flow) => flow.source === 'mined' && flow.steps.length > 0);
    const explainsAll = candidates.filter((flow) =>
      taggedSessions.every((s) => isOrderedSubsequence(flow.steps, s.steps))
    );
    const pool = explainsAll.length > 0 ? explainsAll : candidates.filter((flow) =>
      taggedSessions.some((s) => isOrderedSubsequence(flow.steps, s.steps))
    );
    const attributedTo = pool.sort((a, b) => b.steps.length - a.steps.length)[0];

    if (attributedTo) {
      attributedTo.source = 'named';
      attributedTo.name = name;
    } else {
      result.push({
        steps: [],
        name,
        source: 'named',
        sessionCount: sessionIds.size,
        frequency: sessionIds.size / totalSessions,
      });
    }
  }

  return result;
}

export function buildFunnel(flow: MinedFlow, sessions: MergedSession[]): Funnel {
  if (flow.steps.length === 0) return { steps: [], dropOffAt: null };

  const matchingEvents = sessions
    .filter((s) => isOrderedSubsequence(flow.steps, s.steps))
    .flatMap((s) => s.events);

  const reachCounts = flow.steps.map((_, i) => {
    const prefix = flow.steps.slice(0, i + 1);
    return sessions.filter((s) => isOrderedSubsequence(prefix, s.steps)).length;
  });

  const firstReach = reachCounts[0] || 1;
  const steps = flow.steps.map((step, i) => ({
    step,
    sessionsReached: reachCounts[i],
    retention: reachCounts[i] / firstReach,
    page: rankPagesForStep(matchingEvents, step)[0] ?? null,
  }));

  let dropOffAt: string | null = null;
  let biggestDrop = DROP_OFF_THRESHOLD;
  for (let i = 1; i < steps.length; i++) {
    const drop = steps[i - 1].retention - steps[i].retention;
    if (drop >= biggestDrop) {
      biggestDrop = drop;
      dropOffAt = steps[i].step;
    }
  }

  return { steps, dropOffAt };
}

export function computeConversion(flow: MinedFlow, sessions: MergedSession[]): FlowConversion {
  const totalSessions = sessions.length || 1;
  let convertedSessions: number;

  if (flow.source === 'named' && flow.name) {
    convertedSessions = sessions.filter((s) =>
      s.flowTags.some((tag) => tag.name === flow.name && tag.converted)
    ).length;
  } else if (flow.steps.length > 0) {
    // For auto-mined flows there's no separate goal step — reaching the full sequence
    // (its last step, in order) IS the goal, mirroring the SDK's own default-goal semantics.
    convertedSessions = sessions.filter((s) => isOrderedSubsequence(flow.steps, s.steps)).length;
  } else {
    convertedSessions = 0;
  }

  return { convertedSessions, conversionRate: convertedSessions / totalSessions };
}

/**
 * Cost is derived only from actual waste in this flow — not from how much traffic the flow
 * represents — so a perfectly healthy, high-traffic flow doesn't get an inflated dollar figure.
 * Two waste sources, both converted to "wasted milliseconds" so they're comparable and can be
 * weighed against the system's total observed processing time:
 *  - repeated steps: the "excess" calls beyond one-per-session (already computed by
 *    computeRepeatedSteps), costed at this flow's own average event duration.
 *  - violations: any step in this flow with a logged violation has its actual observed calls
 *    (real durMs, not an average) counted as wasted — a violation is confirmed waste, not inferred.
 */
export function computeCostAndPerf(
  flow: MinedFlow,
  sessions: MergedSession[],
  violations: Violation[],
  infraCostPerMonth: number | null,
  totalSystemLatencyMs: number,
  repeatedSteps: RepeatedStep[]
): FlowCostAndPerf {
  if (flow.steps.length === 0) {
    return {
      estimatedMonthlyCost: 0,
      violationCount: 0,
      avgDurationMs: 0,
      methodology: { wastedCalls: 0, wastedLatencyMs: 0, totalSystemLatencyMs },
    };
  }

  const stepSet = new Set(flow.steps);
  const matchingSessions = sessions.filter((s) => isOrderedSubsequence(flow.steps, s.steps));

  const flowEvents = matchingSessions.flatMap((s) => s.events.filter((e) => stepSet.has(e.step)));
  const avgDurationMs =
    flowEvents.length > 0 ? flowEvents.reduce((sum, e) => sum + e.durMs, 0) / flowEvents.length : 0;

  const violationCount = violations.filter((v) => stepSet.has(v.endpoint)).length;
  const stepsWithViolations = new Set(
    violations
      .filter((v) => stepSet.has(v.endpoint) && TIME_COST_VIOLATION_TYPES.has(v.type))
      .map((v) => v.endpoint)
  );
  const violationFlaggedEvents = flowEvents.filter((e) => stepsWithViolations.has(e.step));
  const violationWastedCalls = violationFlaggedEvents.length;
  const violationWastedLatencyMs = violationFlaggedEvents.reduce((sum, e) => sum + e.durMs, 0);

  const repeatWastedCalls = repeatedSteps.reduce(
    (sum, r) => sum + r.totalCalls * (1 - 1 / r.avgCallsPerSession),
    0
  );
  const repeatWastedLatencyMs = repeatWastedCalls * avgDurationMs;

  const wastedCalls = repeatWastedCalls + violationWastedCalls;
  const wastedLatencyMs = repeatWastedLatencyMs + violationWastedLatencyMs;

  const estimatedMonthlyCost =
    totalSystemLatencyMs > 0 && infraCostPerMonth != null
      ? Math.min(1, wastedLatencyMs / totalSystemLatencyMs) * infraCostPerMonth
      : 0;

  return {
    estimatedMonthlyCost,
    violationCount,
    avgDurationMs,
    methodology: { wastedCalls, wastedLatencyMs, totalSystemLatencyMs },
  };
}

/** Steps a session calls more than once, on average, while walking this flow — the
 * within-session redundancy signal, distinct from insights' same-second duplicate count. */
export function computeRepeatedSteps(flow: MinedFlow, sessions: MergedSession[]): RepeatedStep[] {
  if (flow.steps.length === 0) return [];
  const matchingSessions = sessions.filter((s) => isOrderedSubsequence(flow.steps, s.steps));
  if (matchingSessions.length === 0) return [];

  return Array.from(new Set(flow.steps))
    .map((step) => {
      const matchingEvents = matchingSessions.flatMap((s) => s.events.filter((e) => e.step === step));
      const totalCalls = matchingEvents.length;
      const pages = rankPagesForStep(matchingEvents, step);

      return { step, totalCalls, avgCallsPerSession: totalCalls / matchingSessions.length, pages };
    })
    .filter((s) => s.avgCallsPerSession > 1)
    .sort((a, b) => b.avgCallsPerSession - a.avgCallsPerSession);
}

/** Neither group in a drop-off comparison is trusted with fewer than this many sessions — a
 * dramatic-looking percentage gap from a handful of sessions isn't a real finding. */
const MIN_GROUP_SIZE = 5;
/** The healthy group's continuation rate must exceed the severe group's by at least this many
 * percentage points before it's worth surfacing — a small gap is more likely noise than signal. */
const MEANINGFUL_GAP = 0.15;

/** severe: this specific call errored, or took more than 2x the slow threshold — the worst
 * experience. moderate: slow but under that 2x line, and it succeeded. healthy: everything else. */
function severityTier(event: SequenceEvent): 'healthy' | 'moderate' | 'severe' {
  if (event.status >= 400 || event.durMs > SLOW_P95_THRESHOLD_MS * 2) return 'severe';
  if (event.durMs > SLOW_P95_THRESHOLD_MS) return 'moderate';
  return 'healthy';
}

/**
 * For each step in the flow, checks whether sessions that experienced a slow/errored call at that
 * specific step were less likely to continue than sessions where it was fine — a correlation
 * between a technical problem and people actually giving up, not just a cost estimate. This is
 * deliberately conservative: both the healthy and severe groups must clear MIN_GROUP_SIZE, and
 * the gap must clear MEANINGFUL_GAP, before anything is reported. When the moderate (mildly slow)
 * tier also has enough sessions and its continuation rate falls between the other two, that's
 * included too — a three-tier gradient is stronger evidence than a single two-group comparison.
 *
 * "Continued" means two different things depending on the step: for any step before the last,
 * it's reaching the specific next step in this mined flow (same as before). For the *last* step,
 * there is no next mined step to check — so it means the session did anything at all afterward.
 * Without that distinction, a flow that ends at a slow endpoint (a very common, real shape — see
 * e.g. a flow ending at a chronically slow balance-lookup call) would be structurally invisible
 * to this check, since the drop-off there happens before a next mined step could ever be reached.
 */
export function computeDropOffSignals(flow: MinedFlow, sessions: MergedSession[]): DropOffSignal[] {
  if (flow.steps.length === 0) return [];
  const signals: DropOffSignal[] = [];

  for (let i = 0; i < flow.steps.length; i++) {
    const step = flow.steps[i];
    const isEndOfFlow = i === flow.steps.length - 1;
    const prefix = flow.steps.slice(0, i + 1);
    const nextPrefix = isEndOfFlow ? null : flow.steps.slice(0, i + 2);
    // Sessions that reached this step at all — not sessions matching the *whole* flow, which
    // would wrongly exclude exactly the sessions that stopped partway (the drop-off cases this
    // function exists to find). Mirrors buildFunnel's own prefix-based reach counting.
    const reachedStep = sessions.filter((s) => isOrderedSubsequence(prefix, s.steps));

    const byTier: Record<'healthy' | 'moderate' | 'severe', { session: MergedSession; event: SequenceEvent }[]> = {
      healthy: [],
      moderate: [],
      severe: [],
    };
    for (const s of reachedStep) {
      const event = s.events.find((e) => e.step === step);
      if (!event) continue;
      byTier[severityTier(event)].push({ session: s, event });
    }

    const continuedCountOf = (group: { session: MergedSession; event: SequenceEvent }[]) =>
      group.filter(({ session, event }) =>
        isEndOfFlow
          ? session.events.indexOf(event) < session.events.length - 1
          : isOrderedSubsequence(nextPrefix!, session.steps)
      ).length;

    if (byTier.healthy.length < MIN_GROUP_SIZE || byTier.severe.length < MIN_GROUP_SIZE) continue;

    const healthyContinuedCount = continuedCountOf(byTier.healthy);
    const severeContinuedCount = continuedCountOf(byTier.severe);
    const healthyRate = healthyContinuedCount / byTier.healthy.length;
    const severeRate = severeContinuedCount / byTier.severe.length;

    if (healthyRate - severeRate < MEANINGFUL_GAP) continue;

    let moderate: DropOffSignal['moderate'] = null;
    if (byTier.moderate.length >= MIN_GROUP_SIZE) {
      const moderateContinuedCount = continuedCountOf(byTier.moderate);
      const moderateRate = moderateContinuedCount / byTier.moderate.length;
      if (moderateRate <= healthyRate && moderateRate >= severeRate) {
        moderate = { sessionCount: byTier.moderate.length, continuedCount: moderateContinuedCount };
      }
    }

    signals.push({
      step,
      isEndOfFlow,
      healthySessionCount: byTier.healthy.length,
      healthyContinuedCount,
      severeSessionCount: byTier.severe.length,
      severeContinuedCount,
      moderate,
    });
  }

  return signals;
}

export function mineJourneys(
  sessionTraces: SessionTraceRow[],
  violations: Violation[],
  infraCostPerMonth: number | null,
  totalSystemLatencyMs = 0
): JourneysResult {
  const sessions = mergeSessionsById(sessionTraces);
  const mined = mineFrequentSequences(sessions);
  const flows = mergeNamedFlows(sessions, mined);

  const journeyFlows: JourneyFlow[] = flows.map((flow) => {
    const repeatedSteps = computeRepeatedSteps(flow, sessions);
    return {
      flow,
      funnel: buildFunnel(flow, sessions),
      conversion: computeConversion(flow, sessions),
      costAndPerf: computeCostAndPerf(
        flow,
        sessions,
        violations,
        infraCostPerMonth,
        totalSystemLatencyMs,
        repeatedSteps
      ),
      repeatedSteps,
      dropOffSignals: computeDropOffSignals(flow, sessions),
    };
  });

  return { flows: journeyFlows };
}
