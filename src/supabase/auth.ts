import { supabase, generateApiKey, type Team } from './config';
import type { User, Session, AuthError } from '@supabase/supabase-js';

export interface AuthState {
  user: User | null;
  session: Session | null;
  team: Team | null;
  loading: boolean;
}

// Sign up with email/password and create team
export async function signUpWithEmail(email: string, password: string): Promise<{ user: User | null; error: AuthError | null }> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return { user: null, error };
  }

  // Create team for new user
  if (data.user) {
    await createTeamForUser(data.user);
  }

  return { user: data.user, error: null };
}

// Sign in with email/password
export async function signInWithEmail(email: string, password: string): Promise<{ user: User | null; error: AuthError | null }> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  return { user: data.user, error };
}

// Sign in with GitHub
export async function signInWithGitHub(): Promise<{ error: AuthError | null }> {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: `${window.location.origin}/dashboard`,
    },
  });

  return { error };
}

// Sign in with Google
export async function signInWithGoogle(): Promise<{ error: AuthError | null }> {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/dashboard`,
    },
  });

  return { error };
}

// Sign out
export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}

// Get current session
export async function getSession(): Promise<Session | null> {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

// Get current user
export async function getUser(): Promise<User | null> {
  const { data } = await supabase.auth.getUser();
  return data.user;
}

// Create team for user (called on first sign-up or OAuth callback)
export async function createTeamForUser(user: User): Promise<Team | null> {
  // Check if user already has a team
  const existingTeam = await getTeamForUser(user.id);
  if (existingTeam) {
    return existingTeam;
  }

  // Create new team
  const teamName = user.email?.split('@')[0] || 'My Team';
  const apiKey = generateApiKey();

  const { data, error } = await supabase
    .from('teams')
    .insert({
      name: `${teamName}'s Team`,
      api_key: apiKey,
      user_id: user.id, // We'll need to add this column
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating team:', error);
    return null;
  }

  return data;
}

// Get team for user
export async function getTeamForUser(userId: string): Promise<Team | null> {
  const { data, error } = await supabase
    .from('teams')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    // No team found is not an error for our purposes
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Error fetching team:', error);
    return null;
  }

  return data;
}

// Listen for auth state changes
export function onAuthStateChange(callback: (user: User | null) => void) {
  return supabase.auth.onAuthStateChange(async (event, session) => {
    const user = session?.user ?? null;

    // Handle OAuth callback - create team if needed
    if (event === 'SIGNED_IN' && user) {
      await createTeamForUser(user);
    }

    callback(user);
  });
}
