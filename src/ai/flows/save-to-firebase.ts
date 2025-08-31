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
    let pitchDeckUrl = '';
    try {
      if (input.pitchDeckDataUri) {
          const storageRef = ref(storage, `pitch-decks/${input.startupName.replace(/\s+/g, '-')}-${Date.now()}.pdf`);
          const uploadResult = await uploadString(storageRef, input.pitchDeckDataUri, 'data_url');
          pitchDeckUrl = await getDownloadURL(uploadResult.ref);
      }
    } catch (error) {
        console.error('Error saving pitch deck to Firebase Storage:', error);
        throw new Error('Failed to save pitch deck to Firebase Storage. Please check your Storage security rules.');
    }

    try {
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

      const docRef = doc(collection(db, 'evaluations'));
      await setDoc(docRef, evaluationData);

    } catch (error) {
      console.error('Error saving evaluation data to Firestore:', error);
      throw new Error('Failed to save evaluation data to Firestore. This might be due to Firestore security rules or a disabled API.');
    }
  }
);

export async function saveToFirebase(input: SaveToFirebaseInput): Promise<void> {
  await saveToFirebaseFlow(input);
}
