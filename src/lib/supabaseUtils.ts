import { supabase } from './supabase';

export async function saveStartupEvaluation(data: {
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
    console.log('Attempting to save startup evaluation:', data);
    const { error } = await supabase
      .from('startups')
      .insert([{
        ...data,
        created_at: new Date().toISOString()
      }]);

    if (error) {
      console.error('Error saving to Supabase:', error);
      throw error;
    }
    console.log('Successfully saved startup evaluation');
  } catch (error) {
    console.error('Failed to save startup evaluation:', error);
    throw new Error('Failed to save startup data to database');
  }
}
