
'use server';

import {
  analyzePitchDeckAndGenerateQuestions,
} from '@/ai/flows/analyze-pitch-deck-and-generate-questions';
import {
  automatedVoiceQA,
} from '@/ai/flows/automated-voice-qa';
import {
  provideScoreAndFeedback,
} from '@/ai/flows/score-and-provide-feedback';

import type { 
    AnalyzePitchDeckAndGenerateQuestionsInput, 
    AnalyzePitchDeckAndGenerateQuestionsOutput,
    AutomatedVoiceQAInput,
    AutomatedVoiceQAOutput,
    ScoreAndFeedbackInput,
    ScoreAndFeedbackOutput,
    TeamResult
} from './types';
import fs from 'fs/promises';
import path from 'path';
import { supabase } from '@/lib/supabase';

async function readData(): Promise<TeamResult[]> {
  try {
    const { data, error } = await supabase
      .from('startups')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Failed to read from Supabase:", error);
    return [];
  }
}

async function writeData(startup: TeamResult): Promise<void> {
  try {
    const { error } = await supabase
      .from('startups')
      .insert([{
        startup_name: startup.startupName,
        founder_name: startup.founderName,
        total_score: startup.totalScore,
        innovation_score: startup.innovation,
        feasibility_score: startup.feasibility,
        market_potential_score: startup.marketPotential,
        pitch_clarity_score: startup.pitchClarity,
        problem_solution_fit_score: startup.problemSolutionFit,
        feedback_summary: startup.feedbackSummary,
        created_at: new Date().toISOString()
      }]);

    if (error) throw error;
  } catch (error) {
    console.error("Failed to write to Supabase:", error);
    throw new Error("Could not save startup data.");
  }
}


export async function analyzeAndGenerateQuestionsAction(
  input: AnalyzePitchDeckAndGenerateQuestionsInput
): Promise<AnalyzePitchDeckAndGenerateQuestionsOutput> {
  try {
    const output = await analyzePitchDeckAndGenerateQuestions(input);
    return output;
  } catch (error) {
    console.error('Error in analyzeAndGenerateQuestionsAction:', error);
    throw new Error('Failed to analyze pitch deck.');
  }
}

export async function getAudioFeedbackAction(
  input: AutomatedVoiceQAInput
): Promise<AutomatedVoiceQAOutput> {
  try {
    const output = await automatedVoiceQA(input);
    const score = typeof output.score === 'number' && !isNaN(output.score) ? output.score : 0;
    return { ...output, score };
  } catch (error)
 {
    console.error('Error in getAudioFeedbackAction:', error);
    throw new Error('Failed to get audio feedback from the AI. It might have returned an unexpected format.');
  }
}

export async function scoreAndFeedbackAction(
  input: ScoreAndFeedbackInput
): Promise<ScoreAndFeedbackOutput> {
  try {
    const feedbackOutput = await provideScoreAndFeedback(input);
    
    const output: ScoreAndFeedbackOutput = {
      ...feedbackOutput
    };
    
    const allData = await readData();
    const totalScore = (
        output.innovationScore +
        output.feasibilityScore +
        output.marketPotentialScore +
        output.pitchClarityScore +
        output.problemSolutionFitScore
    ) / 5;

    const newResult: TeamResult = {
        id: new Date().toISOString(),
        timestamp: new Date().toISOString(),
        startupName: input.startupName,
        founderName: input.founderName,
        totalScore: totalScore,
        innovation: output.innovationScore,
        feasibility: output.feasibilityScore,
        marketPotential: output.marketPotentialScore,
        pitchClarity: output.pitchClarityScore,
        problemSolutionFit: output.problemSolutionFitScore,
        feedbackSummary: output.feedbackSummary,
    };

    await writeData(newResult);

    return output;
  } catch (error) {
    console.error('Error in scoreAndFeedbackAction:', error);
    throw new Error('Failed to calculate and save the final score.');
  }
}

export async function getDashboardData(): Promise<TeamResult[]> {
    return await readData();
}
