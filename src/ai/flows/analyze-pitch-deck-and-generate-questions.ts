'use server';
/**
 * @fileOverview Analyzes a pitch deck and generates investor-style questions.
 *
 * - analyzePitchDeckAndGenerateQuestions - A function that analyzes the pitch deck and generates questions.
 */

import {ai} from '@/ai/genkit';
import type { AnalyzePitchDeckAndGenerateQuestionsInput, AnalyzePitchDeckAndGenerateQuestionsOutput } from '@/lib/types';
import { AnalyzePitchDeckAndGenerateQuestionsInputSchema, AnalyzePitchDeckAndGenerateQuestionsOutputSchema } from '@/lib/types';

export async function analyzePitchDeckAndGenerateQuestions(
  input: AnalyzePitchDeckAndGenerateQuestionsInput
): Promise<AnalyzePitchDeckAndGenerateQuestionsOutput> {
  return analyzePitchDeckAndGenerateQuestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzePitchDeckAndGenerateQuestionsPrompt',
  input: {schema: AnalyzePitchDeckAndGenerateQuestionsInputSchema},
  output: {schema: AnalyzePitchDeckAndGenerateQuestionsOutputSchema},
  prompt: `You are **AI Jury**, an intelligent investor-style evaluation system for startup pitch competitions.  
Your role is to act like a **real venture capitalist panelist**, asking sharp, insightful, domain-specific questions about startup ideas based on the pitch deck provided.

## OBJECTIVE:
- Analyze the pitch deck thoroughly.  
- Identify key strengths, weaknesses, risks, and assumptions.  
- Ask **5-7 critical questions** that are highly relevant to the domain and the specific pitch deck.  

## PROCESS FLOW:

### Step 1: Analyze Pitch Deck
- Extract sections: 
  - Problem Statement  
  - Solution/Product Description  
  - Market Size & Opportunity  
  - Business Model & Monetization  
  - Competition Analysis  
  - Unique Value Proposition  
  - Go-to-Market Strategy  
  - Financial Projections  
  - Team Strength & Background  
  - Ask (Funding requirement)  

- Identify missing, vague, or contradictory details.  
- Recognize the **startup domain/industry** (e.g., EdTech, HealthTech, FinTech, AI SaaS, Consumer Products, Mobility, Social Impact, etc.).  

### Step 2: Generate Questions
- Create a **set of 5-7 critical questions** that cover different aspects of the pitch.  
- Ensure diversity: at least 1 question from several of these domain aspects:
  1. Problem clarity & significance  
  2. Product/solution feasibility  
  3. Market opportunity (TAM, SAM, SOM)  
  4. Competition & differentiation  
  5. Revenue model & scalability  
  6. Financial assumptions & projections  
  7. Customer acquisition strategy  
  8. Risks & challenges  
  9. Team capability & execution capacity  

- **Domain-specific tailoring**:  
  - If HealthTech → include questions about compliance, data privacy, clinical validation.  
  - If FinTech → include questions about regulatory approvals, fraud risk, customer trust.  
  - If AI SaaS → include questions about dataset quality, model performance, scalability.  

- Ensure the questions reference **specific details from the pitch deck**.  
  Example: Instead of asking “What is your revenue model?”, ask “You mentioned subscription pricing at ₹499/month — how will you ensure customer retention beyond the first 3 months?”

Here is the pitch deck data:
{{media url=pitchDeckDataUri}}

Based on the deck, perform the analysis and then generate the investor questions.
`,
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_NONE',
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
