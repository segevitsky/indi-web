/**
 * Percentile estimation from a fixed-bucket latency histogram, ported verbatim
 * from indi-runtime's src/analytics/aggregator.ts (estimatePercentile) so the
 * dashboard's percentiles match what the SDK itself would compute in-process.
 */

/** Upper bounds (ms) for the latency histogram. A trailing overflow bucket catches the rest. */
export const LATENCY_BUCKET_BOUNDS = [10, 25, 50, 100, 250, 500, 1000, 2500, 5000] as const;

/**
 * Estimate a percentile latency (ms) from a histogram. Returns the upper edge of
 * the bucket where the cumulative count crosses the target; the overflow bucket
 * resolves to the observed max rather than Infinity.
 */
export function estimatePercentile(
  latencyBuckets: number[],
  latencyMax: number,
  callCount: number,
  p: number
): number {
  if (callCount === 0) return 0;
  const target = Math.ceil(p * callCount);
  let cumulative = 0;
  for (let i = 0; i < latencyBuckets.length; i++) {
    cumulative += latencyBuckets[i];
    if (cumulative >= target) {
      return i < LATENCY_BUCKET_BOUNDS.length ? LATENCY_BUCKET_BOUNDS[i] : latencyMax;
    }
  }
  return latencyMax;
}
