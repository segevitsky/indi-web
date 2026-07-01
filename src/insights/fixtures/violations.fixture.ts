import type { Violation } from '../../supabase/config';

export const violationsFixture: Violation[] = [
  {
    id: 'v-1',
    team_id: 'team-1',
    endpoint: '/api/users/:id',
    method: 'GET',
    type: 'schema_drift',
    path: 'data.address',
    message: 'Field "address" is missing from the response.',
    expected: { address: 'string' },
    actual: null,
    response_time: 42,
    status_code: 200,
    created_at: '2026-07-01T00:01:30.000Z',
  },
  {
    id: 'v-2',
    team_id: 'team-1',
    endpoint: '/api/reports/export',
    method: 'POST',
    type: 'slow_response',
    path: null,
    message: 'Response time 4800ms exceeds the 500ms threshold.',
    expected: '<500ms',
    actual: '4800ms',
    response_time: 4800,
    status_code: 200,
    created_at: '2026-07-01T00:01:45.000Z',
  },
];
