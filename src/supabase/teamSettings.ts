import { supabase } from './config';

export async function getInfraCostPerMonth(teamId: string): Promise<number | null> {
  const { data, error } = await supabase
    .from('teams')
    .select('infra_cost_per_month')
    .eq('id', teamId)
    .single();

  if (error) {
    console.error('Error fetching infra cost:', error);
    return null;
  }

  return data?.infra_cost_per_month ?? null;
}

export async function upsertInfraCostPerMonth(teamId: string, amount: number): Promise<boolean> {
  const { error } = await supabase.from('teams').update({ infra_cost_per_month: amount }).eq('id', teamId);

  if (error) {
    console.error('Error saving infra cost:', error);
    return false;
  }

  return true;
}
