import { describe, expect, it } from 'vitest';
import { buildFunnel, mergeNamedFlows, mergeSessionsById, mineFrequentSequences } from './mine';
import { sessionTracesFixture } from './fixtures/sessionTraces.fixture';

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
