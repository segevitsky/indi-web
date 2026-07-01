import { describe, expect, it } from 'vitest';
import { estimatePercentile, LATENCY_BUCKET_BOUNDS } from './percentile';

// Mirrors indi-runtime's src/analytics/aggregator.test.ts vectors exactly, so the
// dashboard's percentiles stay in lockstep with what the SDK itself computes.
describe('estimatePercentile', () => {
  it('estimates p50/p95/p99 from the histogram', () => {
    const buckets = new Array(LATENCY_BUCKET_BOUNDS.length + 1).fill(0);
    buckets[0] = 50; // <=10, 50 calls @5ms
    buckets[2] = 45; // <=50, 45 calls @30ms
    buckets[buckets.length - 1] = 5; // overflow, 5 calls @9000ms
    const callCount = 100;
    const latencyMax = 9000;

    expect(estimatePercentile(buckets, latencyMax, callCount, 0.5)).toBe(10);
    expect(estimatePercentile(buckets, latencyMax, callCount, 0.95)).toBe(50);
    expect(estimatePercentile(buckets, latencyMax, callCount, 0.99)).toBe(9000);
  });

  it('returns 0 for no calls', () => {
    const buckets = new Array(LATENCY_BUCKET_BOUNDS.length + 1).fill(0);
    expect(estimatePercentile(buckets, 0, 0, 0.5)).toBe(0);
  });
});
