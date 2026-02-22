import { supabase, type NotificationSettings } from './config';

export async function getNotificationSettings(teamId: string): Promise<NotificationSettings | null> {
  const { data, error } = await supabase
    .from('notification_settings')
    .select('*')
    .eq('team_id', teamId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Error fetching notification settings:', error);
    return null;
  }

  return data;
}

export async function upsertNotificationSettings(
  teamId: string,
  email: string,
  frequency: string,
  enabled: boolean
): Promise<NotificationSettings | null> {
  const { data, error } = await supabase
    .from('notification_settings')
    .upsert(
      {
        team_id: teamId,
        email,
        frequency,
        enabled,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'team_id' }
    )
    .select()
    .single();

  if (error) {
    console.error('Error upserting notification settings:', error);
    return null;
  }

  return data;
}

export interface NotificationLogEntry {
  id: string;
  team_id: string;
  violations_count: number;
  sent_at: string;
}

export async function getNotificationLog(teamId: string): Promise<NotificationLogEntry[]> {
  const { data, error } = await supabase
    .from('notification_log')
    .select('*')
    .eq('team_id', teamId)
    .order('sent_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Error fetching notification log:', error);
    return [];
  }

  return data || [];
}
