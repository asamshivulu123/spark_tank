'use server';
/**
 * @fileOverview Saves pitch evaluation data to Firebase.
 * 
 * - saveToFirebase - A function that saves the data to Firestore and the pitch deck to Storage.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { doc, setDoc, collection, serverTimestamp } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import type { SaveToFirebaseInput } from '@/lib/types';
import { SaveToFirebaseInputSchema } from '@/lib/types';


export const saveToFirebaseFlow = ai.defineFlow(
  {
    name: 'saveToFirebaseFlow',
    inputSchema: SaveToFirebaseInputSchema,
    outputSchema: z.void(),
  },
  async (input) => {
    try {
      // 1. Upload Pitch Deck to Firebase Storage
      const storageRef = ref(storage, `pitch-decks/${input.startupName}-${Date.now()}.pdf`);
      const uploadResult = await uploadString(storageRef, input.pitchDeckDataUri, 'data_url');
      const pitchDeckUrl = await getDownloadURL(uploadResult.ref);

      // 2. Prepare data for Firestore
      const totalScore = (
        input.innovationScore +
        input.feasibilityScore +
        input.marketPotentialScore +
        input.pitchClarityScore +
        input.problemSolutionFitScore
      ) / 5;
      
      const evaluationData = {
        startupName: input.startupName,
        founderName: input.founderName,
        totalScore: parseFloat(totalScore.toFixed(1)),
        innovation: input.innovationScore,
        feasibility: input.feasibilityScore,
        marketPotential: input.marketPotentialScore,
        pitchClarity: input.pitchClarityScore,
        problemSolutionFit: input.problemSolutionFitScore,
        feedbackSummary: input.feedbackSummary,
        pitchDeckUrl: pitchDeckUrl,
        createdAt: serverTimestamp(),
      };

      // 3. Save evaluation data to Firestore
      const docRef = doc(collection(db, 'evaluations'));
      await setDoc(docRef, evaluationData);

    } catch (error) {
      console.error('Error saving to Firebase:', error);
      // We don't want to block the user flow if saving fails
      // But we should throw an error to be handled by the action
      throw new Error('Failed to save data to Firebase.');
    }
  }
);

export async function saveToFirebase(input: SaveToFirebaseInput): Promise<void> {
  await saveToFirebaseFlow(input);
}
