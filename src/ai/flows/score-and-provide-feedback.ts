'use server';
/**
 * @fileOverview Provides a score and feedback on a pitch deck based on several categories.
 *
 * - provideScoreAndFeedback - A function that handles the scoring and feedback process.
 * - ScoreAndFeedbackInput - The input type for the provideScoreAndFeedback function.
 * - ScoreAndFeedbackOutput - The return type for the provideScoreAndFeedback function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ScoreAndFeedbackInputSchema = z.object({
  pitchDeckAnalysis: z
    .string()
    .describe('The analysis of the pitch deck, including problem, solution, market size, business model, competition, and risks.'),
  voiceQAResponse: z
    .string()
    .describe('The response from the participant in the voice Q&A interaction.'),
});
export type ScoreAndFeedbackInput = z.infer<typeof ScoreAndFeedbackInputSchema>;

const ScoreAndFeedbackOutputSchema = z.object({
  innovationScore: z
    .number()
    .describe('The score for innovation (0-10).'),
  feasibilityScore: z
    .number()
    .describe('The score for feasibility (0-10).'),
  marketPotentialScore: z
    .number()
    .describe('The score for market potential (0-10).'),
  pitchClarityScore: z
    .number()
    .describe('The score for pitch clarity (0-10).'),
  problemSolutionFitScore: z
    .number()
    .describe('The score for problem-solution fit (0-10).'),
  feedbackSummary: z
    .string()
    .describe('A summary of the feedback (3-5 sentences).'),
});
export type ScoreAndFeedbackOutput = z.infer<typeof ScoreAndFeedbackOutputSchema>;

export async function provideScoreAndFeedback(input: ScoreAndFeedbackInput): Promise<ScoreAndFeedbackOutput> {
  return scoreAndProvideFeedbackFlow(input);
}

const prompt = ai.definePrompt({
  name: 'scoreAndProvideFeedbackPrompt',
  input: {schema: ScoreAndFeedbackInputSchema},
  output: {schema: ScoreAndFeedbackOutputSchema},
  prompt: `You are an expert evaluator for a startup pitch competition.

You will use the pitch deck analysis and voice Q&A response to provide a score and feedback on the pitch.

Evaluation Criteria:
- Innovation (0-10)
- Feasibility (0-10)
- Market Potential (0-10)
- Pitch Clarity (0-10)
- Problem-Solution Fit (0-10)

Provide a score for each category and a feedback summary (3-5 sentences).

Pitch Deck Analysis: {{{pitchDeckAnalysis}}}
Voice Q&A Response: {{{voiceQAResponse}}}

Output should be in JSON format. Make sure scores are numbers.

Here is the JSON schema:
${JSON.stringify(ScoreAndFeedbackOutputSchema.description)}
`,
});

const scoreAndProvideFeedbackFlow = ai.defineFlow(
  {
    name: 'scoreAndProvideFeedbackFlow',
    inputSchema: ScoreAndFeedbackInputSchema,
    outputSchema: ScoreAndFeedbackOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
