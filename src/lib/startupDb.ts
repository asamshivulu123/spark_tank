import { supabase } from './supabase';
import { Startup } from './types/startup';

export async function getAllStartups() {
  try {
    console.log('Fetching all startups from Supabase...');
    const { data, error } = await supabase
      .from('startups')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching startups:', error);
      throw error;
    }

    console.log('Successfully fetched startups:', data);
    return data as Startup[];
  } catch (error) {
    console.error('Error in getAllStartups:', error);
    throw error;
  }
}

export async function createStartup(startupData: {
  startup_name: string;
  founder_name: string;
  total_score: number;
  innovation_score: number;
  feasibility_score: number;
  market_potential_score: number;
  pitch_clarity_score: number;
  problem_solution_fit_score: number;
  feedback_summary: string;
}) {
  try {
    console.log('Creating new startup:', startupData);
    const { data, error } = await supabase
      .from('startups')
      .insert([startupData])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating startup:', error);
      throw error;
    }

    console.log('Successfully created startup:', data);
    return data as Startup;
  } catch (error) {
    console.error('Error in createStartup:', error);
    throw error;
  }
}
