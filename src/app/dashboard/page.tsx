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

// This function now returns a more structured result
async function getEvaluationData(): Promise<{ data: TeamResult[] | null; error: string | null; isApiError: boolean; isPermissionError: boolean; }> {
    try {
        const evaluationsCol = collection(db, 'evaluations');
        // The 'createdAt' field is added by serverTimestamp, so we query by it.
        const q = query(evaluationsCol, orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
    
        if (snapshot.empty) {
            return { data: [], error: null, isApiError: false, isPermissionError: false };
        }
  
        const data = snapshot.docs.map(doc => {
            const docData = doc.data();
            const timestamp = docData.createdAt as Timestamp; // Firestore Timestamp
            return {
                id: doc.id,
                ...docData,
                // Safely convert timestamp to ISO string
                timestamp: timestamp?.toDate().toISOString() || new Date().toISOString(),
            } as TeamResult;
        });

        return { data, error: null, isApiError: false, isPermissionError: false };

    } catch (e: any) {
        console.error(e); // Log the full error for debugging
        const errorMessage = e.message || 'An unknown error occurred.';
        const isApiError = errorMessage.includes('Cloud Firestore API has not been used');
        // A broader check for permission issues
        const isPermissionError = errorMessage.includes('permission-denied') || errorMessage.includes('PERMISSION_DENIED');
        
        let displayError = 'Failed to fetch data from Firebase. Please check your Firebase project setup.';
        if (isApiError) {
            displayError = 'The Cloud Firestore API is not enabled for your project. Please enable it to continue.';
        } else if (isPermissionError) {
            displayError = "You don't have permission to access Firestore data. Please check your project's security rules in the Firebase console.";
        }
        
        return { data: null, error: displayError, isApiError, isPermissionError };
    }
}


export default async function DashboardPage() {
    // Destructure the detailed error info from the function call
    const { data, error, isApiError, isPermissionError } = await getEvaluationData();

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
                            {/* Display the button if it's a known, actionable error */}
                            {isApiError && (
                                <Button asChild>
                                    <Link 
                                        href="https://console.developers.google.com/apis/api/firestore.googleapis.com/overview?project=pitch-perfect-ai-qpv8g"
                                        target="_blank"
                                    >
                                        Enable Firestore API
                                    </Link>
                                </Button>
                            )}
                            {isPermissionError && !isApiError && (
                                <Button asChild>
                                    <Link
                                        href="https://console.firebase.google.com/project/pitch-perfect-ai-qpv8g/firestore/rules"
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
  
    // If there's no error, render the dashboard client with the data
    return (
        <div className="container mx-auto py-10">
            <DashboardClient data={data || []} />
        </div>
    );
}
