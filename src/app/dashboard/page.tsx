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
  let error: string | null = null;

  try {
    data = await getEvaluationData();
  } catch (e) {
    console.error(e);
    error = 'Failed to fetch data from Firebase. Please check your Firebase project setup and security rules.';
  }

  return (
    <div className="container mx-auto py-10">
      {error ? (
        <div className="flex justify-center">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle>Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{error}</p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <DashboardClient data={data} />
      )}
    </div>
  );
}
