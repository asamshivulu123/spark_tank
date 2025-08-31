'use server';

import { google } from 'googleapis';

const sheets = google.sheets('v4');

async function getAuth() {
  const credentials = {
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  };

  if (!credentials.client_email || !credentials.private_key) {
    throw new Error('Google service account credentials are not set in environment variables.');
  }

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  return auth;
}

export async function appendToSheet(rowData: (string | number)[]) {
  const auth = await getAuth();
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;
  const range = 'A1'; // Appends after the last row with data

  if (!spreadsheetId) {
    throw new Error('Google Sheet ID is not set in environment variables.');
  }

  await sheets.spreadsheets.values.append({
    auth,
    spreadsheetId,
    range,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [rowData],
    },
  });
}
