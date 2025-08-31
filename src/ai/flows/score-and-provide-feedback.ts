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
