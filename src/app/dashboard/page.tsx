import { getSheetData } from '@/lib/sheets';
import { DashboardClient } from '@/components/dashboard-client';
import type { TeamResult } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { FileWarning } from 'lucide-react';

export default async function DashboardPage() {
  let data: TeamResult[] = [];
  let error: string | null = null;

  if (
    !process.env.GOOGLE_SHEET_ID ||
    !process.env.GOOGLE_SHEETS_CLIENT_EMAIL ||
    !process.env.GOOGLE_SHEETS_PRIVATE_KEY
  ) {
    error =
      'Google Sheets credentials are not configured. Please set up the environment variables to view the dashboard.';
  } else {
    try {
      data = await getSheetData();
    } catch (e) {
      console.error(e);
      error =
        'Failed to fetch data from Google Sheets. Please check your sheet ID, sharing permissions, and service account credentials.';
    }
  }

  return (
    <div className="container mx-auto py-10">
      {error ? (
        <div className="flex justify-center">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle>Configuration Error</CardTitle>
              <CardDescription>
                The dashboard cannot be displayed because it is not configured correctly.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert variant="destructive">
                <FileWarning className="h-4 w-4" />
                <AlertTitle>Missing Credentials</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
               <div className="mt-4 rounded-md bg-muted p-4 text-sm">
                 <h4 className="font-semibold mb-2">How to fix this:</h4>
                 <ol className="list-decimal list-inside space-y-2">
                   <li>Make sure you have a Google Sheet created.</li>
                   <li>
                     Create a Google Cloud Service Account and download its JSON key.
                   </li>
                   <li>
                     Share your Google Sheet with the service account's email address (`client_email` from the JSON key).
                   </li>
                   <li>
                     Add the following environment variables to your `.env` file:
                     <pre className="mt-2 p-2 bg-background rounded-md text-xs">
                      {`GOOGLE_SHEET_ID="<your_sheet_id>"\nGOOGLE_SHEETS_CLIENT_EMAIL="<your_client_email>"\nGOOGLE_SHEETS_PRIVATE_KEY="<your_private_key>"`}
                     </pre>
                   </li>
                 </ol>
               </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <DashboardClient data={data} />
      )}
    </div>
  );
}
