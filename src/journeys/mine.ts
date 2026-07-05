import type { Violation } from '../supabase/config';
import type {
  Funnel,
  FlowConversion,
  FlowCostAndPerf,
  JourneyFlow,
  JourneysResult,
  MergedSession,
  MinedFlow,
  RepeatedStep,
  SessionTraceRow,
} from './types';

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

  const reachCounts = flow.steps.map((_, i) => {
    const prefix = flow.steps.slice(0, i + 1);
    return sessions.filter((s) => isOrderedSubsequence(prefix, s.steps)).length;
  });

  const firstReach = reachCounts[0] || 1;
  const steps = flow.steps.map((step, i) => ({
    step,
    sessionsReached: reachCounts[i],
    retention: reachCounts[i] / firstReach,
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
  const stepsWithViolations = new Set(violations.filter((v) => stepSet.has(v.endpoint)).map((v) => v.endpoint));
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

      const pageCounts = new Map<string, number>();
      for (const e of matchingEvents) {
        if (e.page) pageCounts.set(e.page, (pageCounts.get(e.page) ?? 0) + 1);
      }
      const pages = Array.from(pageCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([page]) => page);

      return { step, totalCalls, avgCallsPerSession: totalCalls / matchingSessions.length, pages };
    })
    .filter((s) => s.avgCallsPerSession > 1)
    .sort((a, b) => b.avgCallsPerSession - a.avgCallsPerSession);
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
    };
  });

  return { flows: journeyFlows };
}
