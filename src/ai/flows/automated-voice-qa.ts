'use server';

/**
 * @fileOverview An automated voice Q&A flow for pitch evaluation.
 *
 * - automatedVoiceQA - A function that initiates the voice-based Q&A process.
 * - AutomatedVoiceQAInput - The input type for the automatedVoiceQA function.
 * - AutomatedVoiceQAOutput - The return type for the automatedVoiceQA function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AutomatedVoiceQAInputSchema = z.object({
  pitchDeckAnalysis: z
    .string()
    .describe('The analysis of the pitch deck, including generated questions.'),
  userResponse: z
    .string()
    .describe('The user responses from voice converted to text.'),
});
export type AutomatedVoiceQAInput = z.infer<typeof AutomatedVoiceQAInputSchema>;

const AutomatedVoiceQAOutputSchema = z.object({
  score: z.number().describe('The score for the answer.'),
  feedback: z.string().describe('The feedback for the answer.'),
});
export type AutomatedVoiceQAOutput = z.infer<typeof AutomatedVoiceQAOutputSchema>;

export async function automatedVoiceQA(input: AutomatedVoiceQAInput): Promise<AutomatedVoiceQAOutput> {
  return automatedVoiceQAFlow(input);
}

const prompt = ai.definePrompt({
  name: 'automatedVoiceQAPrompt',
  input: {schema: AutomatedVoiceQAInputSchema},
  output: {schema: AutomatedVoiceQAOutputSchema},
  prompt: `You are an AI Jury member evaluating startup pitches.

  You have analyzed the pitch deck and generated questions. Now, you are conducting a voice-based Q&A with the participant.

  Based on the participant's response, provide a score and feedback.

  Pitch Deck Analysis and Generated Questions: {{{pitchDeckAnalysis}}}
  Participant Response: {{{userResponse}}}

  Provide a score (0-10) and feedback (3-5 sentences) based on the following criteria:
  - Innovation
  - Feasibility
  - Market Potential
  - Pitch Clarity
  - Problem-Solution Fit`,
});

const automatedVoiceQAFlow = ai.defineFlow(
  {
    name: 'automatedVoiceQAFlow',
    inputSchema: AutomatedVoiceQAInputSchema,
    outputSchema: AutomatedVoiceQAOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
