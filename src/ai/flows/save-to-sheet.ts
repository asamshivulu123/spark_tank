'use server';
/**
 * @fileOverview Saves pitch evaluation data to a Google Sheet.
 * 
 * - saveToSheet - A function that saves the data to a Google Sheet.
 * - SaveToSheetInput - The input type for the saveToSheet function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { google } from 'googleapis';

export const SaveToSheetInputSchema = z.object({
  startupName: z.string().describe("The name of the startup."),
  founderName: z.string().describe("The name of the founder."),
  innovationScore: z.number().describe('The score for innovation (0-10).'),
  feasibilityScore: z.number().describe('The score for feasibility (0-10).'),
  marketPotentialScore: z.number().describe('The score for market potential (0-10).'),
  pitchClarityScore: z.number().describe('The score for pitch clarity (0-10).'),
  problemSolutionFitScore: z.number().describe('The score for problem-solution fit (0-10).'),
  feedbackSummary: z.string().describe('A summary of the feedback (3-5 sentences).'),
});
export type SaveToSheetInput = z.infer<typeof SaveToSheetInputSchema>;

async function getGoogleSheetsClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const client = await auth.getClient();
  return google.sheets({ version: 'v4', auth: client as any });
}

export const saveToSheetFlow = ai.defineFlow(
  {
    name: 'saveToSheetFlow',
    inputSchema: SaveToSheetInputSchema,
    outputSchema: z.void(),
  },
  async (input) => {
    try {
      const sheets = await getGoogleSheetsClient();
      const spreadsheetId = process.env.GOOGLE_SHEET_ID;
      const range = 'Sheet1!A1'; 

      const totalScore = (
        input.innovationScore +
        input.feasibilityScore +
        input.marketPotentialScore +
        input.pitchClarityScore +
        input.problemSolutionFitScore
      ) / 5;

      const values = [
        [
          new Date().toISOString(),
          input.startupName,
          input.founderName,
          totalScore.toFixed(1),
          input.innovationScore,
          input.feasibilityScore,
          input.marketPotentialScore,
          input.pitchClarityScore,
          input.problemSolutionFitScore,
          input.feedbackSummary,
        ],
      ];

       // Check for header row
       const headerResponse = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Sheet1!A1:J1',
      });

      if (!headerResponse.data.values || headerResponse.data.values.length === 0) {
        // Add header row if sheet is empty
        const headerValues = [
            ['Timestamp', 'Startup Name', 'Founder Name', 'Total Score', 'Innovation', 'Feasibility', 'Market Potential', 'Pitch Clarity', 'Problem-Solution Fit', 'Feedback Summary']
        ];
        await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: 'Sheet1!A1',
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: headerValues,
            },
        });
      }

      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values,
        },
      });
    } catch (error) {
      console.error('Error saving to Google Sheets:', error);
      // We don't want to block the user flow if saving to sheets fails
    }
  }
);

export async function saveToSheet(input: SaveToSheetInput): Promise<void> {
  await saveToSheetFlow(input);
}
