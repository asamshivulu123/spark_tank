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
  prompt: `You are an AI Jury member evaluating a startup pitch. Your task is to score a participant's answer to a specific question and provide constructive feedback.

Here is the context based on the startup's pitch deck:
{{pitchDeckAnalysis}}

Here is the question you asked the participant:
"{{question}}"

Here is the participant's answer:
"{{userResponse}}"

Based on their answer, please provide:
1.  A score from 0 to 10 for their response.
2.  A concise feedback (2-3 sentences) explaining the reasoning for your score.

Focus your evaluation on the clarity, relevance, and persuasiveness of the answer in the context of the pitch deck analysis.

Return your response in the specified JSON format. The 'score' should be a number and 'feedback' should be a string.
`,
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
