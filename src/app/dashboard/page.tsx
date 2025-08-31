import { db } from '@/lib/firebase';
import { collection, getDocs, orderBy, query, Timestamp } from 'firebase/firestore';
import { DashboardClient } from '@/components/dashboard-client';
import type { TeamResult } from '@/lib/types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

async function getEvaluationData(): Promise<TeamResult[]> {
    const evaluationsCol = collection(db, 'evaluations');
    const q = query(evaluationsCol, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return [];
    }
  
    return snapshot.docs.map(doc => {
      const data = doc.data();
      // Firestore Timestamps need to be converted to strings to be serializable
      const timestamp = data.createdAt as Timestamp;
      return {
        id: doc.id,
        ...data,
        timestamp: timestamp?.toDate().toISOString() || new Date().toISOString(),
      } as TeamResult;
    });
}


export default async function DashboardPage() {
  let data: TeamResult[] = [];
  let error: { message: string; isApiError: boolean, isPermissionError: boolean } | null = null;

  try {
    data = await getEvaluationData();
  } catch (e: any) {
    console.error(e);
    const isApiError = e.message.includes('Cloud Firestore API has not been used');
    const isPermissionError = e.message.includes('permission-denied') || e.message.includes('PERMISSION_DENIED');
    let message = 'Failed to fetch data from Firebase. Please check your Firebase project setup.';
    
    if (isApiError) {
      message = 'The Cloud Firestore API is not enabled for your project. Please enable it to continue.';
    } else if (isPermissionError) {
      message = "You don't have permission to access Firestore data. Please check your project's security rules in the Firebase console.";
    }

    error = { message, isApiError, isPermissionError };
  }

  return (
    <div className="container mx-auto py-10">
      {error ? (
        <div className="flex justify-center">
          <Card className="w-full max-w-2xl text-center">
            <CardHeader>
              <CardTitle>Error Fetching Data</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">{error.message}</p>
              {error.isApiError && (
                <Button asChild>
                  <Link 
                    href={`https://console.developers.google.com/apis/api/firestore.googleapis.com/overview?project=${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}`}
                    target="_blank"
                  >
                    Enable Firestore API
                  </Button>
                </Button>
              )}
               {error.isPermissionError && (
                 <Button asChild>
                  <Link
                    href={`https://console.firebase.google.com/project/${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}/firestore/rules`}
                    target="_blank"
                  >
                    Check Security Rules
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <DashboardClient data={data} />
      )}
    </div>
  );
}
