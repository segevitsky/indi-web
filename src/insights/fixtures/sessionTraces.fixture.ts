import type { SessionTraceRow } from '../types';

/**
 * Forward-looking fixture for M2's journey mining — not consumed by any M1 code yet.
 * Two flush rows for the same session_id, to exercise the "merge by session_id" step.
 */
export const sessionTracesFixture: SessionTraceRow[] = [
  {
    id: 'st-1',
    team_id: 'team-1',
    session_id: 'sess-abc123',
    started_at: 1735689600000,
    ended_at: 1735689605000,
    events: [
      { step: '/api/search', method: 'GET', status: 200, tOffsetMs: 0, durMs: 80 },
      { step: '/api/product/:id', method: 'GET', status: 200, tOffsetMs: 1200, durMs: 45 },
    ],
    flow_tags: [{ name: 'search_to_checkout', matched: true, converted: false }],
    status_summary: { '2xx': 2 },
    created_at: '2026-07-01T00:00:05.000Z',
  },
  {
    id: 'st-2',
    team_id: 'team-1',
    session_id: 'sess-abc123',
    started_at: 1735689605000,
    ended_at: 1735689612000,
    events: [{ step: '/api/checkout', method: 'POST', status: 201, tOffsetMs: 3400, durMs: 210 }],
    flow_tags: [{ name: 'search_to_checkout', matched: true, converted: true }],
    status_summary: { '2xx': 1 },
    created_at: '2026-07-01T00:00:12.000Z',
  },
];
