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

const dataFilePath = path.join(process.cwd(), 'data', 'evaluations.json');

async function readData(): Promise<TeamResult[]> {
  try {
    await fs.access(dataFilePath);
    const fileContent = await fs.readFile(dataFilePath, 'utf-8');
    if (fileContent.trim() === '') {
        return [];
    }
    return JSON.parse(fileContent);
  } catch (error) {
    // If the file does not exist or is empty, return an empty array
    return [];
  }
}

async function writeData(data: TeamResult[]): Promise<void> {
  await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2), 'utf-8');
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
    return output;
  } catch (error)
 {
    console.error('Error in getAudioFeedbackAction:', error);
    throw new Error('Failed to get audio feedback.');
  }
}

export async function scoreAndFeedbackAction(
  input: ScoreAndFeedbackInput
): Promise<ScoreAndFeedbackOutput> {
  try {
    const output = await provideScoreAndFeedback(input);
    
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

    allData.push(newResult);
    await writeData(allData);

    return output;
  } catch (error) {
    console.error('Error in scoreAndFeedbackAction:', error);
    throw new Error('Failed to score and provide feedback.');
  }
}

export async function getDashboardData(): Promise<TeamResult[]> {
    return await readData();
}
