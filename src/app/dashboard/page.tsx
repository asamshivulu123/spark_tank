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

async function getEvaluationData(): Promise<{data: TeamResult[] | null, error: string | null}> {
    try {
        const evaluationsCol = collection(db, 'evaluations');
        const q = query(evaluationsCol, orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
    
        if (snapshot.empty) {
            return { data: [], error: null };
        }
  
        const data = snapshot.docs.map(doc => {
            const docData = doc.data();
            const timestamp = docData.createdAt as Timestamp;
            return {
                id: doc.id,
                ...docData,
                timestamp: timestamp?.toDate().toISOString() || new Date().toISOString(),
            } as TeamResult;
        });

        return { data, error: null };

    } catch (e: any) {
        console.error(e);
        const isApiError = e.message.includes('Cloud Firestore API has not been used');
        const isPermissionError = e.message.includes('permission-denied') || e.message.includes('PERMISSION_DENIED');
        
        if (isApiError) {
            return { data: null, error: 'The Cloud Firestore API is not enabled for your project. Please enable it to continue.' };
        } 
        if (isPermissionError) {
            return { data: null, error: "You don't have permission to access Firestore data. Please check your project's security rules in the Firebase console." };
        }
        
        return { data: null, error: 'Failed to fetch data from Firebase. Please check your Firebase project setup.' };
    }
}


export default async function DashboardPage() {
    const { data, error } = await getEvaluationData();

    if (error) {
        const isApiError = error.includes('Cloud Firestore API');
        const isPermissionError = error.includes('permission-denied');

        return (
            <div className="container mx-auto py-10">
                <div className="flex justify-center">
                    <Card className="w-full max-w-2xl text-center">
                        <CardHeader>
                            <CardTitle>Error Fetching Data</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="mb-4">{error}</p>
                            {isApiError && (
                                <Button asChild>
                                    <Link 
                                        href={`https://console.developers.google.com/apis/api/firestore.googleapis.com/overview?project=${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}`}
                                        target="_blank"
                                    >
                                        Enable Firestore API
                                    </Link>
                                </Button>
                            )}
                            {isPermissionError && (
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
            </div>
        );
    }
  
    return (
        <div className="container mx-auto py-10">
            <DashboardClient data={data || []} />
        </div>
    );
}