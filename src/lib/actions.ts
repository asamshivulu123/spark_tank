'use server';

import {
  analyzePitchDeckAndGenerateQuestions,
  type AnalyzePitchDeckAndGenerateQuestionsInput,
  type AnalyzePitchDeckAndGenerateQuestionsOutput,
} from '@/ai/flows/analyze-pitch-deck-and-generate-questions';
import {
  automatedVoiceQA,
  type AutomatedVoiceQAInput,
  type AutomatedVoiceQAOutput,
} from '@/ai/flows/automated-voice-qa';
import {
  provideScoreAndFeedback,
  type ScoreAndFeedbackInput,
  type ScoreAndFeedbackOutput,
} from '@/ai/flows/score-and-provide-feedback';

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
    return output;
  } catch (error) {
    console.error('Error in scoreAndFeedbackAction:', error);
    throw new Error('Failed to score and provide feedback.');
  }
}
