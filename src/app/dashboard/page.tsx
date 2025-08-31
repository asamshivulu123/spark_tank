import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function DashboardPage() {
    return (
        <div className="container mx-auto py-10">
            <div className="flex justify-center">
                <Card className="w-full max-w-2xl text-center">
                    <CardHeader>
                        <CardTitle>Dashboard Offline</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="mb-4">The database has been disconnected. This dashboard is no longer functional.</p>
                        <Button asChild>
                            <Link 
                                href="/"
                            >
                                Back to Home
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
