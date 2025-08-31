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
    ScoreAndFeedbackOutput
} from './types';


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
    return output;
  } catch (error) {
    console.error('Error in getAudioFeedbackAction:', error);
    throw new Error('Failed to get audio feedback.');
  }
}

export async function scoreAndFeedbackAction(
  input: ScoreAndFeedbackInput
): Promise<ScoreAndFeedbackOutput> {
  try {
    const output = await provideScoreAndFeedback(input);
    // Data is no longer saved to an external source.
    // Organizers can view results on the dashboard.
    return output;
  } catch (error) {
    console.error('Error in scoreAndFeedbackAction:', error);
    throw new Error('Failed to score and provide feedback.');
  }
}
