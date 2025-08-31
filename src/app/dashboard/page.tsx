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
        timestamp: timestamp.toDate().toISOString(),
      } as TeamResult;
    });
}


export default async function DashboardPage() {
  let data: TeamResult[] = [];
  let error: { message: string, isApiError: boolean } | null = null;

  try {
    data = await getEvaluationData();
  } catch (e: any) {
    console.error(e);
    const isApiError = e.message.includes('Cloud Firestore API has not been used');
    error = {
      message: isApiError
        ? 'The Cloud Firestore API is not enabled for your project. Please enable it to continue.'
        : 'Failed to fetch data from Firebase. Please check your Firebase project setup and security rules.',
      isApiError,
    };
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
                    href="https://console.developers.google.com/apis/api/firestore.googleapis.com/overview?project=pitch-perfect-ai-qpv8g" 
                    target="_blank"
                  >
                    Enable Firestore API
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
