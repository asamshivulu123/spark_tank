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
import { appendToSheet } from '@/services/google-drive';


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

    if (process.env.GOOGLE_SHEET_ID) {
      try {
        const totalScore = (
          output.innovationScore +
          output.feasibilityScore +
          output.marketPotentialScore +
          output.pitchClarityScore +
          output.problemSolutionFitScore
        ) / 5;

        await appendToSheet([
          new Date().toISOString(),
          input.startupName,
          input.founderName,
          totalScore.toFixed(2),
          output.innovationScore,
          output.feasibilityScore,
          output.marketPotentialScore,
          output.pitchClarityScore,
          output.problemSolutionFitScore,
          output.feedbackSummary,
        ]);
      } catch (sheetsError) {
        console.error('Failed to save data to Google Sheets:', sheetsError);
        // We don't re-throw the error, so the user still sees their results
        // even if the Google Sheets save fails.
      }
    }

    return output;
  } catch (error) {
    console.error('Error in scoreAndFeedbackAction:', error);
    throw new Error('Failed to score and provide feedback.');
  }
}
