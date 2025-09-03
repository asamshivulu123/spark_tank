import { supabase } from '@/lib/supabase';
import { User, Team } from '@/lib/types/database';

// User operations
export async function getUser(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
    
  if (error) throw error;
  return data as User;
}

export async function createUser(userData: Omit<User, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('users')
    .insert([userData])
    .select()
    .single();
    
  if (error) throw error;
  return data as User;
}

// Team operations
export async function getTeam(teamId: string) {
  const { data, error } = await supabase
    .from('teams')
    .select('*')
    .eq('id', teamId)
    .single();
    
  if (error) throw error;
  return data as Team;
}

export async function createTeam(teamData: Omit<Team, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('teams')
    .insert([teamData])
    .select()
    .single();
    
  if (error) throw error;
  return data as Team;
}

// Add more database operations as needed
