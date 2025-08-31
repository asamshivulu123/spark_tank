'use server';
/**
 * @fileOverview Analyzes a pitch deck and generates investor-style questions.
 *
 * - analyzePitchDeckAndGenerateQuestions - A function that analyzes the pitch deck and generates questions.
 * - AnalyzePitchDeckAndGenerateQuestionsInput - The input type for the analyzePitchDeckAndGenerateQuestions function.
 * - AnalyzePitchDeckAndGenerateQuestionsOutput - The return type for the analyzePitchDeckAndGenerateQuestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzePitchDeckAndGenerateQuestionsInputSchema = z.object({
  pitchDeckDataUri: z
    .string()
    .describe(
      "A pitch deck in PDF or PPTX format, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzePitchDeckAndGenerateQuestionsInput = z.infer<
  typeof AnalyzePitchDeckAndGenerateQuestionsInputSchema
>;

const AnalyzePitchDeckAndGenerateQuestionsOutputSchema = z.object({
  problem: z.string().describe('The problem the startup is trying to solve.'),
  solution: z.string().describe('The solution the startup is providing.'),
  marketSize: z.string().describe('The size of the target market.'),
  businessModel: z.string().describe('The business model of the startup.'),
  competition: z.string().describe('The competitive landscape.'),
  risks: z.string().describe('The potential risks the startup faces.'),
  investorQuestions: z
    .array(z.string())
    .describe('A list of investor-style questions generated from the pitch deck.'),
});
export type AnalyzePitchDeckAndGenerateQuestionsOutput = z.infer<
  typeof AnalyzePitchDeckAndGenerateQuestionsOutputSchema
>;

export async function analyzePitchDeckAndGenerateQuestions(
  input: AnalyzePitchDeckAndGenerateQuestionsInput
): Promise<AnalyzePitchDeckAndGenerateQuestionsOutput> {
  return analyzePitchDeckAndGenerateQuestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzePitchDeckAndGenerateQuestionsPrompt',
  input: {schema: AnalyzePitchDeckAndGenerateQuestionsInputSchema},
  output: {schema: AnalyzePitchDeckAndGenerateQuestionsOutputSchema},
  prompt: `You are an AI Jury member evaluating startup pitch decks. Analyze the pitch deck provided and extract key information such as the problem the startup is trying to solve, their proposed solution, the market size, the business model, the competitive landscape, and any potential risks.

Based on your analysis, generate 5-7 investor-style questions that would help assess the startup's potential. These questions should be insightful and challenging, covering various aspects of the business.

Here is the pitch deck data:
{{media url=pitchDeckDataUri}}

Ensure the investorQuestions array contains a diverse range of questions, addressing areas such as innovation, feasibility, market potential, pitch clarity, and problem-solution fit.
`, config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_LOW_AND_ABOVE',
      },
    ],
  },
});

const analyzePitchDeckAndGenerateQuestionsFlow = ai.defineFlow(
  {
    name: 'analyzePitchDeckAndGenerateQuestionsFlow',
    inputSchema: AnalyzePitchDeckAndGenerateQuestionsInputSchema,
    outputSchema: AnalyzePitchDeckAndGenerateQuestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
