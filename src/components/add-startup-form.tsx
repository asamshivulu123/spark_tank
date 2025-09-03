'use client';

import { useState } from 'react';
import { createStartup } from '@/lib/startupDb';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export default function AddStartupForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    startup_name: '',
    founder_name: '',
    pitch_score: 0,
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await createStartup(formData);
      toast({
        title: 'Success',
        description: 'Startup data has been saved',
      });
      // Reset form
      setFormData({
        startup_name: '',
        founder_name: '',
        pitch_score: 0,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save startup data',
      });
    }

    setIsLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Startup</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="startup_name">Startup Name</Label>
            <Input
              id="startup_name"
              value={formData.startup_name}
              onChange={(e) => setFormData(prev => ({ ...prev, startup_name: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="founder_name">Founder Name</Label>
            <Input
              id="founder_name"
              value={formData.founder_name}
              onChange={(e) => setFormData(prev => ({ ...prev, founder_name: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pitch_score">Pitch Score (0-100)</Label>
            <Input
              id="pitch_score"
              type="number"
              min="0"
              max="100"
              value={formData.pitch_score}
              onChange={(e) => setFormData(prev => ({ ...prev, pitch_score: Number(e.target.value) }))}
              required
            />
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Add Startup'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
