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
  prompt: `You are **AI Jury**, an intelligent investor-style evaluation system for startup pitch competitions. You are in an interactive Q&A session. You have already analyzed the pitch deck and asked a question. Now you need to evaluate the user's answer.

## CONTEXT
**Pitch Deck Analysis Summary**:
{{{pitchDeckAnalysis}}}

**The Question You Asked**:
"{{question}}"

**The User's Answer**:
"{{userResponse}}"

---
## YOUR TASK

Evaluate the user's answer and provide feedback.

- **Evaluation Criteria**: 
  - **Clarity**: Is the answer well-structured and easy to understand?  
  - **Feasibility**: Is the proposed plan realistic and achievable?
  - **Scalability**: Can the idea grow with demand?
  - **Innovation**: Does it show unique thinking?  
  - **Risk Awareness**: Does the founder acknowledge and address challenges?  

- **Your Response**:
  1.  Assign a **score from 1 to 10** for the answer based on the criteria above.
  2.  Provide **constructive, investor-style feedback** (2-3 sentences). Be professional, tough, and analytical, but also constructive.
      Example Feedback: "Your answer highlights strong awareness of your competitors, but it lacks clarity on how your pricing model sustains long-term profitability. Consider adding margin analysis."

Return your response in the specified JSON format.
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
