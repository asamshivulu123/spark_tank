'use server';
/**
 * @fileOverview Provides a score and feedback on a pitch deck based on several categories.
 *
 * - provideScoreAndFeedback - A function that handles the scoring and feedback process.
 */

import {ai} from '@/ai/genkit';
import type { ScoreAndFeedbackInput, ScoreAndFeedbackOutput } from '@/lib/types';
import { ScoreAndFeedbackInputSchema, ScoreAndFeedbackOutputSchema } from '@/lib/types';


export async function provideScoreAndFeedback(input: ScoreAndFeedbackInput): Promise<ScoreAndFeedbackOutput> {
  return scoreAndProvideFeedbackFlow(input);
}

const prompt = ai.definePrompt({
  name: 'scoreAndProvideFeedbackPrompt',
  input: {schema: ScoreAndFeedbackInputSchema},
  output: {schema: ScoreAndFeedbackOutputSchema},
  prompt: `You are an expert evaluator for a startup pitch competition. Your task is to provide a final evaluation based on a startup's pitch deck analysis and their performance in a voice Q&A session.

First, analyze the provided pitch deck information and the user's answers to the questions.
Then, provide a score from 0 to 10 for each of the following five categories:
- Innovation
- Feasibility
- Market Potential
- Pitch Clarity
- Problem-Solution Fit

Finally, generate a concise and constructive feedback summary (3-5 sentences). This summary should highlight the startup's strengths and, most importantly, identify specific, actionable areas for improvement based on their answers and the pitch deck.

**Pitch Deck Analysis:**
{{{pitchDeckAnalysis}}}

**Voice Q&A Transcript (Questions, Answers, and preliminary scores/feedback):**
{{{voiceQAResponse}}}

Please provide your final evaluation in the specified JSON format.
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
