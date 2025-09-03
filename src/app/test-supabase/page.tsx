'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function TestSupabase() {
  const [status, setStatus] = useState('Testing...');

  useEffect(() => {
    async function testConnection() {
      try {
        // First, let's test if we can connect and get all records
        const { data, error } = await supabase
          .from('startups')
          .select('*');
        
        if (error) throw error;
        
        setStatus('Connected successfully! Found ' + (data?.length || 0) + ' records.');
        
        // Let's also try to insert a test record
        const { error: insertError } = await supabase
          .from('startups')
          .insert([
            {
              startup_name: 'Test Startup',
              founder_name: 'Test Founder',
              total_score: 85,
              innovation_score: 8,
              feasibility_score: 9,
              market_potential_score: 8.5,
              pitch_clarity_score: 8,
              problem_solution_fit_score: 9,
              feedback_summary: 'This is a test record'
            }
          ]);
          
        if (insertError) {
          console.error('Insert error:', insertError);
          setStatus(prev => prev + '\nInsert test failed: ' + insertError.message);
        } else {
          setStatus(prev => prev + '\nSuccessfully inserted test record!');
        }
      } catch (error) {
        console.error('Supabase connection error:', error);
        setStatus('Connection failed: ' + (error as Error).message);
      }
    }

    testConnection();
  }, []);

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-2xl font-bold">Supabase Connection Test</h2>
      <pre className="whitespace-pre-wrap bg-gray-100 p-4 rounded">
        {status}
      </pre>
    </div>
  );
}
