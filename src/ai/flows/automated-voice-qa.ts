'use server';

/**
 * @fileOverview An automated voice Q&A flow for pitch evaluation.
 *
 * - automatedVoiceQA - A function that initiates the voice-based Q&A process.
 */

import {ai} from '@/ai/genkit';
import type { AutomatedVoiceQAInput, AutomatedVoiceQAOutput } from '@/lib/types';
import { AutomatedVoiceQAInputSchema, AutomatedVoiceQAOutputSchema } from '@/lib/types';


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
