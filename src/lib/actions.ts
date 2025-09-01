
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
import { appendToSheet } from '@/services/google-drive';

const dataFilePath = path.join(process.cwd(), 'data', 'evaluations.json');

async function readData(): Promise<TeamResult[]> {
  try {
    await fs.mkdir(path.dirname(dataFilePath), { recursive: true });
    await fs.access(dataFilePath);
    const fileContent = await fs.readFile(dataFilePath, 'utf-8');
    if (fileContent.trim() === '') {
        return [];
    }
    return JSON.parse(fileContent);
  } catch (error) {
    return [];
  }
}

async function writeData(data: TeamResult[]): Promise<void> {
  try {
      await fs.mkdir(path.dirname(dataFilePath), { recursive: true });
      await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
      console.error("Failed to write to evaluations.json:", error);
      throw new Error("Could not save evaluation data.");
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

    allData.push(newResult);
    await writeData(allData);

    try {
        const sheetRow = [
          newResult.timestamp,
          newResult.startupName,
          newResult.founderName,
          newResult.totalScore,
          newResult.innovation,
          newResult.feasibility,
          newResult.marketPotential,
          newResult.pitchClarity,
          newResult.problemSolutionFit,
          newResult.feedbackSummary,
        ];
        await appendToSheet(sheetRow);
    } catch (e) {
        console.error("Failed to write to Google Sheet:", e);
        // We don't want to fail the whole operation if the sheet write fails
    }

    return output;
  } catch (error) {
    console.error('Error in scoreAndFeedbackAction:', error);
    throw new Error('Failed to calculate and save the final score.');
  }
}

export async function getDashboardData(): Promise<TeamResult[]> {
    return await readData();
}
