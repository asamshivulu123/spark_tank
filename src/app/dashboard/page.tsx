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

async function getEvaluationData(): Promise<{ data: TeamResult[] | null; error: string | null; isApiError: boolean; isPermissionError: boolean; }> {
    try {
        const evaluationsCol = collection(db, 'evaluations');
        const q = query(evaluationsCol, orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
    
        if (snapshot.empty) {
            return { data: [], error: null, isApiError: false, isPermissionError: false };
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

        return { data, error: null, isApiError: false, isPermissionError: false };

    } catch (e: any) {
        console.error("Firestore fetch error:", e); 
        const errorMessage = e.message || 'An unknown error occurred.';
        
        const isApiError = errorMessage.includes('firestore.googleapis.com') && (errorMessage.includes('not used') || errorMessage.includes('disabled'));
        const isPermissionError = errorMessage.includes('permission-denied') || errorMessage.includes('PERMISSION_DENIED');
        
        let displayError = 'Failed to fetch data from Firebase. Please check your project setup and internet connection.';
        if (isApiError) {
            displayError = 'The Cloud Firestore API is not enabled for your project. Please enable it to continue.';
        } else if (isPermissionError) {
            displayError = "You don't have permission to access Firestore data. Please check your project's security rules in the Firebase console.";
        }
        
        return { data: null, error: displayError, isApiError, isPermissionError };
    }
}


export default async function DashboardPage() {
    const { data, error, isApiError, isPermissionError } = await getEvaluationData();
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'pitch-perfect-ai-qpv8g';

    if (error) {
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
                                        href={`https://console.developers.google.com/apis/api/firestore.googleapis.com/overview?project=${projectId}`}
                                        target="_blank"
                                    >
                                        Enable Firestore API
                                    </Link>
                                </Button>
                            )}
                            {isPermissionError && !isApiError && (
                                <Button asChild>
                                    <Link
                                        href={`https://console.firebase.google.com/project/${projectId}/firestore/rules`}
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
