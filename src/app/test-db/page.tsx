'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function TestDatabase() {
  const [status, setStatus] = useState<'loading' | 'connected' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    testConnection();
  }, []);

  async function testConnection() {
    try {
      // Test the connection by getting the current user
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) throw error;
      
      setStatus('connected');
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'An unknown error occurred');
    }
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Database Connection Test</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              Status: {' '}
              <span className={
                status === 'connected' ? 'text-green-500' :
                status === 'error' ? 'text-red-500' :
                'text-yellow-500'
              }>
                {status}
              </span>
            </div>
            {errorMessage && (
              <div className="text-red-500">
                Error: {errorMessage}
              </div>
            )}
            <Button onClick={testConnection}>
              Test Connection Again
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
