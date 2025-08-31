'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getDashboardData } from '@/lib/actions';
import type { TeamResult } from '@/lib/types';
import { DashboardClient } from '@/components/dashboard-client';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function DashboardPage() {
  const [data, setData] = useState<TeamResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check for login status
    const loggedIn = sessionStorage.getItem('organizer_logged_in') === 'true';
    if (!loggedIn) {
      router.replace('/organizer-login');
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);
  
  useEffect(() => {
    async function fetchData() {
       if (isAuthenticated) {
        try {
            const result = await getDashboardData();
            setData(result);
        } catch (e) {
            console.error(e);
            setError('Failed to load dashboard data. The data file might be missing or corrupted.');
        }
       }
    }
    fetchData();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    // Show a loader while redirecting
    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
    );
  }

  if (error) {
    return (
        <div className="container mx-auto py-10">
            <Alert variant="destructive">
                <AlertTitle>Error Loading Dashboard</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        </div>
    );
  }

  if (!data) {
    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <DashboardClient data={data} />
    </div>
  );
}
