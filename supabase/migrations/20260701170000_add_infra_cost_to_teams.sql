-- Customer-supplied monthly infra cost, used to derive dollar savings from measured waste.
-- Nullable: computeInsights()/mineJourneys() treat null as "$0 savings", never inventing a number.
ALTER TABLE teams ADD COLUMN IF NOT EXISTS infra_cost_per_month NUMERIC;
