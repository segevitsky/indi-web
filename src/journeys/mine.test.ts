import { describe, expect, it } from 'vitest';
import { buildFunnel, computeRepeatedSteps, mergeNamedFlows, mergeSessionsById, mineFrequentSequences } from './mine';
import { sessionTracesFixture } from './fixtures/sessionTraces.fixture';
import type { MinedFlow, SessionTraceRow } from './types';

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
        { step: '/api/search', method: 'GET', status: 200, tOffsetMs: 0, durMs: 80 },
        { step: '/api/product/:id', method: 'GET', status: 200, tOffsetMs: 1000, durMs: 60 },
        { step: '/api/product/:id', method: 'GET', status: 200, tOffsetMs: 2000, durMs: 60 },
        { step: '/api/checkout', method: 'POST', status: 201, tOffsetMs: 3000, durMs: 200 },
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
        { step: '/api/search', method: 'GET', status: 200, tOffsetMs: 0, durMs: 80 },
        { step: '/api/product/:id', method: 'GET', status: 200, tOffsetMs: 1000, durMs: 60 },
        { step: '/api/checkout', method: 'POST', status: 201, tOffsetMs: 2000, durMs: 200 },
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

  it('does not flag a step called at most once per session', () => {
    const sessions = mergeSessionsById(repeatFixture);
    const repeated = computeRepeatedSteps(flow, sessions);

    expect(repeated.find((r) => r.step === '/api/search')).toBeUndefined();
    expect(repeated.find((r) => r.step === '/api/checkout')).toBeUndefined();
  });
});
