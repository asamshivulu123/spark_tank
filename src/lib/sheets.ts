import { google } from 'googleapis';
import type { TeamResult } from './types';

async function getGoogleSheetsClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
  const client = await auth.getClient();
  return google.sheets({ version: 'v4', auth: client as any });
}

export async function getSheetData(): Promise<TeamResult[]> {
  const sheets = await getGoogleSheetsClient();
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;
  const range = 'Sheet1!A2:J'; // Start from A2 to skip header

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
  });

  const rows = response.data.values;
  if (rows && rows.length) {
    return rows.map((row, index) => {
      return {
        id: `team-${index}`,
        timestamp: row[0] || '',
        startupName: row[1] || 'N/A',
        founderName: row[2] || 'N/A',
        totalScore: parseFloat(row[3]) || 0,
        innovation: parseFloat(row[4]) || 0,
        feasibility: parseFloat(row[5]) || 0,
        marketPotential: parseFloat(row[6]) || 0,
        pitchClarity: parseFloat(row[7]) || 0,
        problemSolutionFit: parseFloat(row[8]) || 0,
        feedbackSummary: row[9] || '',
      };
    });
  }
  return [];
}
