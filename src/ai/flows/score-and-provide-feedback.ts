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
  prompt: `You are **AI Jury**, an intelligent investor-style evaluation system. The Q&A session is complete. Your final task is to provide a comprehensive evaluation based on the startup's pitch deck and their performance during the Q&A.

## CONTEXT

**1. Pitch Deck Analysis Summary:**
{{{pitchDeckAnalysis}}}

**2. Full Q&A Transcript (Questions, User Answers, and your real-time scores/feedback):**
{{{voiceQAResponse}}}

---
## YOUR TASK: FINAL EVALUATION

Based on all the information, provide the final scores and a summary. Your final scores must be derived from the user's performance in the Q&A session.

**1. Final Scores (0-10 for each category):**
   - **Innovation**: How original and inventive is the idea, as justified in their answers?
   - **Feasibility**: Based on their answers, can the team realistically build and execute this?
   - **Market Potential**: How large is the opportunity and can the startup capture a significant share, according to their Q&A responses?
   - **Pitch Clarity**: Was the core message clear and compelling in the deck and, most importantly, during the Q&A?
   - **Problem-Solution Fit**: Does the solution genuinely solve a significant problem, as defended in their answers?

**2. Feedback Summary (3-5 sentences):**
   - Summarize the key strengths of the startup, referencing their answers.
   - Summarize the primary weaknesses, risks, and areas for improvement based on their Q&A performance.
   - Be professional, analytical, and constructive. Your feedback is critical for the founder.

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
