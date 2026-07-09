import { describe, expect, it } from 'vitest';
import {
  buildFunnel,
  computeCostAndPerf,
  computeDropOffSignals,
  computeRepeatedSteps,
  mergeNamedFlows,
  mergeSessionsById,
  mineFrequentSequences,
} from './mine';
import { sessionTracesFixture } from './fixtures/sessionTraces.fixture';
import type { MinedFlow, SequenceEvent, SessionTraceRow } from './types';
import type { Violation } from '../supabase/config';

describe('mergeSessionsById', () => {
  it('merges rows sharing a session_id and orders events by tOffsetMs regardless of row order', () => {
    const sessions = mergeSessionsById(sessionTracesFixture);
    const s1 = sessions.find((s) => s.sessionId === 's1');

    expect(s1).toBeDefined();
    // st-1b (checkout, tOffsetMs 5000) is listed before st-1a (search/product) in the fixture,
    // but the merged, sorted result must have search and product first.
    expect(s1!.steps).toEqual(['/api/search', '/api/product/:id', '/api/checkout']);
  });
});

describe('mineFrequentSequences', () => {
  it('surfaces the planted 70%-frequency sequence', () => {
    const sessions = mergeSessionsById(sessionTracesFixture);
    const mined = mineFrequentSequences(sessions);

    const searchToProduct = mined.find(
      (f) => f.steps.length === 2 && f.steps[0] === '/api/search' && f.steps[1] === '/api/product/:id'
    );

    expect(searchToProduct).toBeDefined();
    expect(searchToProduct!.sessionCount).toBe(7);
    expect(searchToProduct!.frequency).toBeCloseTo(0.7, 5);
  });
});

describe('buildFunnel', () => {
  it('identifies the drop-off point where sessions exit the funnel', () => {
    const sessions = mergeSessionsById(sessionTracesFixture);
    const mined = mineFrequentSequences(sessions);
    const checkoutFlow = mined.find(
      (f) => f.steps.length === 3 && f.steps.join('→') === '/api/search→/api/product/:id→/api/checkout'
    );

    expect(checkoutFlow).toBeDefined();
    expect(checkoutFlow!.sessionCount).toBe(4); // only s1-s4 reach checkout

    const funnel = buildFunnel(checkoutFlow!, sessions);
    expect(funnel.dropOffAt).toBe('/api/checkout');
  });

  it('attaches which page each step fired from, for the whole flow not just repeated steps', () => {
    const pagedFixture: SessionTraceRow[] = [
      {
        id: 'pf-1',
        team_id: 'team-1',
        session_id: 'p1',
        started_at: 0,
        ended_at: 2000,
        events: [
          { step: '/api/search', method: 'GET', status: 200, tOffsetMs: 0, durMs: 80, page: '/search' },
          { step: '/api/checkout', method: 'POST', status: 201, tOffsetMs: 1000, durMs: 200, page: '/checkout' },
        ],
        flow_tags: [],
        status_summary: {},
        created_at: '2026-07-01T00:00:00.000Z',
      },
    ];
    const flow: MinedFlow = {
      steps: ['/api/search', '/api/checkout'],
      name: null,
      source: 'mined',
      sessionCount: 1,
      frequency: 1,
    };

    const sessions = mergeSessionsById(pagedFixture);
    const funnel = buildFunnel(flow, sessions);

    expect(funnel.steps.map((s) => s.page)).toEqual(['/search', '/checkout']);
  });

  it('leaves page null for events recorded before page capture existed', () => {
    const sessions = mergeSessionsById(sessionTracesFixture);
    const mined = mineFrequentSequences(sessions);
    const checkoutFlow = mined.find(
      (f) => f.steps.length === 3 && f.steps.join('→') === '/api/search→/api/product/:id→/api/checkout'
    );
    const funnel = buildFunnel(checkoutFlow!, sessions);

    expect(funnel.steps.every((s) => s.page === null)).toBe(true);
  });
});

describe('mergeNamedFlows', () => {
  it('merges a named flow_tags entry into the matching mined flow instead of duplicating it', () => {
    const sessions = mergeSessionsById(sessionTracesFixture);
    const mined = mineFrequentSequences(sessions);
    const merged = mergeNamedFlows(sessions, mined);

    const checkoutFlows = merged.filter(
      (f) => f.steps.join('→') === '/api/search→/api/product/:id→/api/checkout'
    );

    expect(checkoutFlows).toHaveLength(1);
    expect(checkoutFlows[0].source).toBe('named');
    expect(checkoutFlows[0].name).toBe('checkout_flow');
  });
});

describe('computeRepeatedSteps', () => {
  // Local fixture, not the shared sessionTracesFixture — isolates this from the exact
  // session-count assertions the other tests above depend on.
  const repeatFixture: SessionTraceRow[] = [
    {
      id: 'rst-1',
      team_id: 'team-1',
      session_id: 'r1',
      started_at: 0,
      ended_at: 4000,
      events: [
        { step: '/api/search', method: 'GET', status: 200, tOffsetMs: 0, durMs: 80, page: '/search' },
        { step: '/api/product/:id', method: 'GET', status: 200, tOffsetMs: 1000, durMs: 60, page: '/catalog' },
        { step: '/api/product/:id', method: 'GET', status: 200, tOffsetMs: 2000, durMs: 60, page: '/catalog' },
        { step: '/api/checkout', method: 'POST', status: 201, tOffsetMs: 3000, durMs: 200, page: '/checkout' },
      ],
      flow_tags: [],
      status_summary: {},
      created_at: '2026-07-01T00:00:00.000Z',
    },
    {
      id: 'rst-2',
      team_id: 'team-1',
      session_id: 'r2',
      started_at: 0,
      ended_at: 3000,
      events: [
        { step: '/api/search', method: 'GET', status: 200, tOffsetMs: 0, durMs: 80, page: '/search' },
        { step: '/api/product/:id', method: 'GET', status: 200, tOffsetMs: 1000, durMs: 60, page: '/wishlist' },
        { step: '/api/checkout', method: 'POST', status: 201, tOffsetMs: 2000, durMs: 200, page: '/checkout' },
      ],
      flow_tags: [],
      status_summary: {},
      created_at: '2026-07-01T00:00:00.000Z',
    },
  ];

  const flow: MinedFlow = {
    steps: ['/api/search', '/api/product/:id', '/api/checkout'],
    name: null,
    source: 'mined',
    sessionCount: 2,
    frequency: 1,
  };

  it('flags a step called more than once per session on average within a flow', () => {
    const sessions = mergeSessionsById(repeatFixture);
    const repeated = computeRepeatedSteps(flow, sessions);

    const product = repeated.find((r) => r.step === '/api/product/:id');
    expect(product).toBeDefined();
    expect(product!.totalCalls).toBe(3); // 2 in r1, 1 in r2
    expect(product!.avgCallsPerSession).toBeCloseTo(1.5, 5);
  });

  it('surfaces the pages a repeated step fires from, most common first', () => {
    const sessions = mergeSessionsById(repeatFixture);
    const repeated = computeRepeatedSteps(flow, sessions);

    const product = repeated.find((r) => r.step === '/api/product/:id');
    // /catalog appears twice (both r1 calls), /wishlist once (r2) -> /catalog sorts first.
    expect(product!.pages).toEqual(['/catalog', '/wishlist']);
  });

  it('does not flag a step called at most once per session', () => {
    const sessions = mergeSessionsById(repeatFixture);
    const repeated = computeRepeatedSteps(flow, sessions);

    expect(repeated.find((r) => r.step === '/api/search')).toBeUndefined();
    expect(repeated.find((r) => r.step === '/api/checkout')).toBeUndefined();
  });

  describe('computeCostAndPerf', () => {
    const TOTAL_SYSTEM_LATENCY_MS = 10_000;
    const INFRA_COST_PER_MONTH = 1000;

    it('estimates cost from repeated-step waste, weighted by the flow\'s own avg duration', () => {
      const sessions = mergeSessionsById(repeatFixture);
      const repeatedSteps = computeRepeatedSteps(flow, sessions);
      const result = computeCostAndPerf(flow, sessions, [], INFRA_COST_PER_MONTH, TOTAL_SYSTEM_LATENCY_MS, repeatedSteps);

      // /api/product/:id: 3 total calls across 2 sessions, avgCallsPerSession 1.5 -> 1 excess call.
      // avgDurationMs across all 7 matching events (search+product+product+checkout, search+product+checkout)
      // = 740/7ms. wastedLatencyMs = 1 * 740/7.
      const expectedWastedLatencyMs = 740 / 7;
      expect(result.methodology.wastedCalls).toBeCloseTo(1, 5);
      expect(result.methodology.wastedLatencyMs).toBeCloseTo(expectedWastedLatencyMs, 5);
      expect(result.estimatedMonthlyCost).toBeCloseTo(
        (expectedWastedLatencyMs / TOTAL_SYSTEM_LATENCY_MS) * INFRA_COST_PER_MONTH,
        5
      );
    });

    it('gives a perfectly healthy flow (no repeated steps, no violations) zero cost, not a traffic-share guess', () => {
      const healthyFixture: SessionTraceRow[] = [
        {
          id: 'h-1',
          team_id: 'team-1',
          session_id: 'h1',
          started_at: 0,
          ended_at: 2000,
          events: [
            { step: '/api/search', method: 'GET', status: 200, tOffsetMs: 0, durMs: 80 },
            { step: '/api/checkout', method: 'POST', status: 201, tOffsetMs: 1000, durMs: 200 },
          ],
          flow_tags: [],
          status_summary: {},
          created_at: '2026-07-01T00:00:00.000Z',
        },
      ];
      const healthyFlow: MinedFlow = {
        steps: ['/api/search', '/api/checkout'],
        name: null,
        source: 'mined',
        sessionCount: 1,
        frequency: 1,
      };
      const sessions = mergeSessionsById(healthyFixture);
      const repeatedSteps = computeRepeatedSteps(healthyFlow, sessions);

      expect(repeatedSteps).toEqual([]);
      const result = computeCostAndPerf(healthyFlow, sessions, [], INFRA_COST_PER_MONTH, TOTAL_SYSTEM_LATENCY_MS, repeatedSteps);
      expect(result.estimatedMonthlyCost).toBe(0);
      expect(result.methodology.wastedCalls).toBe(0);
    });

    it('counts a violation-flagged step\'s real observed latency as waste, even with no repeated steps', () => {
      const sessions = mergeSessionsById(repeatFixture);
      const repeatedSteps = computeRepeatedSteps(flow, sessions);
      const violations: Violation[] = [
        {
          id: 'v-1',
          team_id: 'team-1',
          endpoint: '/api/checkout',
          method: 'POST',
          type: 'slow_response',
          path: null,
          message: 'slow',
          expected: null,
          actual: null,
          response_time: 200,
          status_code: 201,
          created_at: '2026-07-01T00:00:00.000Z',
        },
      ];

      const result = computeCostAndPerf(flow, sessions, violations, INFRA_COST_PER_MONTH, TOTAL_SYSTEM_LATENCY_MS, repeatedSteps);

      // /api/checkout appears once per session (r1 + r2), durMs 200 each -> 2 flagged events, 400ms wasted,
      // on top of the 1 excess /api/product/:id call already covered by the repeated-step test above.
      expect(result.methodology.wastedCalls).toBeCloseTo(1 + 2, 5);
      expect(result.methodology.wastedLatencyMs).toBeCloseTo(740 / 7 + 400, 5);
    });

    it('counts a correctness violation (type_mismatch) toward violationCount but not toward cost', () => {
      const sessions = mergeSessionsById(repeatFixture);
      const repeatedSteps = computeRepeatedSteps(flow, sessions);
      const withoutViolation = computeCostAndPerf(flow, sessions, [], INFRA_COST_PER_MONTH, TOTAL_SYSTEM_LATENCY_MS, repeatedSteps);

      const typeMismatchOnly: Violation[] = [
        {
          id: 'v-2',
          team_id: 'team-1',
          endpoint: '/api/checkout',
          method: 'POST',
          type: 'type_mismatch',
          path: 'total',
          message: 'expected number, got string',
          expected: 'number',
          actual: 'string',
          response_time: null,
          status_code: 201,
          created_at: '2026-07-01T00:00:00.000Z',
        },
      ];
      const withTypeMismatch = computeCostAndPerf(
        flow,
        sessions,
        typeMismatchOnly,
        INFRA_COST_PER_MONTH,
        TOTAL_SYSTEM_LATENCY_MS,
        repeatedSteps
      );

      expect(withTypeMismatch.violationCount).toBe(1);
      // A type_mismatch is a correctness problem, not a time-wasted one — it shouldn't change the
      // wasted-time figure at all versus having no violations logged.
      expect(withTypeMismatch.methodology.wastedLatencyMs).toBeCloseTo(withoutViolation.methodology.wastedLatencyMs, 5);
      expect(withTypeMismatch.estimatedMonthlyCost).toBeCloseTo(withoutViolation.estimatedMonthlyCost, 5);
    });
  });
});

describe('computeDropOffSignals', () => {
  const FLOW: MinedFlow = {
    steps: ['/api/step-a', '/api/step-b'],
    name: null,
    source: 'mined',
    sessionCount: 0,
    frequency: 0,
  };

  function makeSession(id: string, stepADurMs: number, stepAStatus: number, continues: boolean): SessionTraceRow {
    const events: SequenceEvent[] = [
      { step: '/api/step-a', method: 'GET', status: stepAStatus, tOffsetMs: 0, durMs: stepADurMs },
    ];
    if (continues) events.push({ step: '/api/step-b', method: 'GET', status: 200, tOffsetMs: 1000, durMs: 100 });
    return {
      id: `t-${id}`,
      team_id: 'team-1',
      session_id: id,
      started_at: 0,
      ended_at: 2000,
      events,
      flow_tags: [],
      status_summary: {},
      created_at: '2026-07-01T00:00:00.000Z',
    };
  }

  it('reports a signal when severe sessions continue far less than healthy ones, given enough samples', () => {
    const rows: SessionTraceRow[] = [
      ...Array.from({ length: 10 }, (_, i) => makeSession(`healthy-${i}`, 200, 200, i < 9)), // 9/10 continue
      ...Array.from({ length: 10 }, (_, i) => makeSession(`severe-${i}`, 3000, 200, i < 3)), // 3/10 continue
    ];
    const signals = computeDropOffSignals(FLOW, mergeSessionsById(rows));

    expect(signals).toHaveLength(1);
    expect(signals[0]).toEqual({
      step: '/api/step-a',
      isEndOfFlow: false,
      healthySessionCount: 10,
      healthyContinuedCount: 9,
      severeSessionCount: 10,
      severeContinuedCount: 3,
      moderate: null,
    });
  });

  it('does not report a signal when group sizes are below the minimum, even with a dramatic-looking gap', () => {
    const rows: SessionTraceRow[] = [
      ...Array.from({ length: 3 }, (_, i) => makeSession(`healthy-${i}`, 200, 200, true)), // 3/3 continue
      ...Array.from({ length: 3 }, (_, i) => makeSession(`severe-${i}`, 3000, 200, false)), // 0/3 continue
    ];
    const signals = computeDropOffSignals(FLOW, mergeSessionsById(rows));
    expect(signals).toEqual([]);
  });

  it('does not report a signal when the continuation gap is too small to be meaningful', () => {
    const rows: SessionTraceRow[] = [
      ...Array.from({ length: 10 }, (_, i) => makeSession(`healthy-${i}`, 200, 200, i < 8)), // 80%
      ...Array.from({ length: 10 }, (_, i) => makeSession(`severe-${i}`, 3000, 200, i < 7)), // 70%, gap 10pts < 15pt
    ];
    const signals = computeDropOffSignals(FLOW, mergeSessionsById(rows));
    expect(signals).toEqual([]);
  });

  it('returns an empty array for an empty flow, and for too few sessions to check, without crashing', () => {
    const singleStepFlow: MinedFlow = { steps: ['/api/step-a'], name: null, source: 'mined', sessionCount: 1, frequency: 1 };
    const emptyFlow: MinedFlow = { steps: [], name: null, source: 'mined', sessionCount: 0, frequency: 0 };
    const sessions = mergeSessionsById([makeSession('s1', 200, 200, true)]);

    // Single-step is now a valid shape to check (see the end-of-flow test below) — this returns
    // empty here only because there's just 1 session, well under MIN_GROUP_SIZE, not because the
    // function refuses to look at a 1-step flow.
    expect(computeDropOffSignals(singleStepFlow, sessions)).toEqual([]);
    expect(computeDropOffSignals(emptyFlow, sessions)).toEqual([]);
  });

  function makeEndOfFlowSession(id: string, stepBDurMs: number, stepBStatus: number, continuesAfter: boolean): SessionTraceRow {
    const events: SequenceEvent[] = [
      { step: '/api/step-a', method: 'GET', status: 200, tOffsetMs: 0, durMs: 100 },
      { step: '/api/step-b', method: 'GET', status: stepBStatus, tOffsetMs: 1000, durMs: stepBDurMs },
    ];
    if (continuesAfter) events.push({ step: '/api/step-c', method: 'GET', status: 200, tOffsetMs: 2000, durMs: 50 });
    return {
      id: `t-${id}`,
      team_id: 'team-1',
      session_id: id,
      started_at: 0,
      ended_at: 3000,
      events,
      flow_tags: [],
      status_summary: {},
      created_at: '2026-07-01T00:00:00.000Z',
    };
  }

  it('reports a signal at the end of the flow when severe sessions end there far more than healthy ones do', () => {
    // Every session reaches both step-a and step-b here — the drop-off this test checks for is
    // whether the session does *anything else at all* after step-b, since step-b is the flow's
    // last step and there's no "next mined step" to check reaching instead.
    const rows: SessionTraceRow[] = [
      ...Array.from({ length: 10 }, (_, i) => makeEndOfFlowSession(`healthy-${i}`, 200, 200, i < 9)), // 9/10 do something after
      ...Array.from({ length: 10 }, (_, i) => makeEndOfFlowSession(`severe-${i}`, 3000, 200, i < 2)), // 2/10 do something after
    ];
    const signals = computeDropOffSignals(FLOW, mergeSessionsById(rows));

    expect(signals).toHaveLength(1);
    expect(signals[0]).toEqual({
      step: '/api/step-b',
      isEndOfFlow: true,
      healthySessionCount: 10,
      healthyContinuedCount: 9,
      severeSessionCount: 10,
      severeContinuedCount: 2,
      moderate: null,
    });
  });

  it('includes the moderate tier as corroborating evidence when its rate falls between healthy and severe', () => {
    const rows: SessionTraceRow[] = [
      ...Array.from({ length: 10 }, (_, i) => makeSession(`healthy-${i}`, 200, 200, i < 9)), // 90%
      ...Array.from({ length: 10 }, (_, i) => makeSession(`moderate-${i}`, 1500, 200, i < 6)), // 60%
      ...Array.from({ length: 10 }, (_, i) => makeSession(`severe-${i}`, 3000, 200, i < 2)), // 20%
    ];
    const signals = computeDropOffSignals(FLOW, mergeSessionsById(rows));

    expect(signals).toHaveLength(1);
    expect(signals[0].moderate).toEqual({ sessionCount: 10, continuedCount: 6 });
  });
});
