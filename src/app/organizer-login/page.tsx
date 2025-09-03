'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { LogIn } from 'lucide-react';
import { getAllStartups } from '@/lib/startupDb';
import { Startup } from '@/lib/types/startup';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const ORGANIZER_PASSWORD = process.env.NEXT_PUBLIC_ORGANIZER_PASSWORD || 'FoundersHub';

export default function OrganizerLoginPage() {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [startups, setStartups] = useState<Startup[]>([]);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const loggedIn = sessionStorage.getItem('organizer_logged_in') === 'true';
    if (loggedIn) {
      setIsLoggedIn(true);
      fetchStartups();
    }
  }, []);

  const fetchStartups = async () => {
    try {
      const data = await getAllStartups();
      setStartups(data);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to fetch startup data',
      });
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (password === ORGANIZER_PASSWORD) {
      try {
        await fetchStartups();
        toast({
          title: 'Login Successful',
          description: 'Welcome to the dashboard!',
        });
        sessionStorage.setItem('organizer_logged_in', 'true');
        setIsLoggedIn(true);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to fetch startup data',
        });
      }
    } else {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: 'Incorrect password. Please try again.',
      });
    }
    setIsLoading(false);
  };

  return (
    <div className="container mx-auto py-8">
      {!isLoggedIn ? (
        <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center">
          <Card className="w-full max-w-md shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-headline">
                Organizer Login
              </CardTitle>
              <CardDescription>
                Enter the password to access the event dashboard.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleLogin}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    'Logging in...'
                  ) : (
                    <>
                      <LogIn className="mr-2 h-4 w-4" />
                      Access Dashboard
                    </>
                  )}
                </Button>
              </CardContent>
            </form>
          </Card>
        </div>
      ) : (
        <div className="space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-headline">Startup Evaluations Dashboard</CardTitle>
              <CardDescription>
                Overview of all evaluated startups and their scores
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Startup Name</TableHead>
                      <TableHead>Founder Name</TableHead>
                      <TableHead className="text-right">Total Score</TableHead>
                      <TableHead className="text-right">Innovation</TableHead>
                      <TableHead className="text-right">Feasibility</TableHead>
                      <TableHead className="text-right">Market Potential</TableHead>
                      <TableHead className="text-right">Pitch Clarity</TableHead>
                      <TableHead className="text-right">Problem-Solution Fit</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {startups.map((startup) => (
                      <TableRow key={startup.id}>
                        <TableCell className="font-medium">{startup.startup_name}</TableCell>
                        <TableCell>{startup.founder_name}</TableCell>
                        <TableCell className="text-right">{startup.total_score?.toFixed(1)}</TableCell>
                        <TableCell className="text-right">{startup.innovation_score?.toFixed(1)}</TableCell>
                        <TableCell className="text-right">{startup.feasibility_score?.toFixed(1)}</TableCell>
                        <TableCell className="text-right">{startup.market_potential_score?.toFixed(1)}</TableCell>
                        <TableCell className="text-right">{startup.pitch_clarity_score?.toFixed(1)}</TableCell>
                        <TableCell className="text-right">{startup.problem_solution_fit_score?.toFixed(1)}</TableCell>
                      </TableRow>
                    ))}
                    {startups.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          No startups have been evaluated yet
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
          <Button 
            onClick={() => {
              sessionStorage.removeItem('organizer_logged_in');
              setIsLoggedIn(false);
              setStartups([]);
            }}
            variant="outline"
          >
            Logout
          </Button>
        </div>
      )}
    </div>
  );
}
