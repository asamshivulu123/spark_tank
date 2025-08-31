
'use client';

import { useState, type FormEvent } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UploadCloud, Loader2, FileText, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { analyzeAndGenerateQuestionsAction } from '@/lib/actions';
import type { AnalyzePitchDeckAndGenerateQuestionsOutput } from '@/lib/types';

interface UploadStepProps {
  onAnalysisComplete: (result: AnalyzePitchDeckAndGenerateQuestionsOutput, startupName: string, founderName: string, pitchDeckDataUri: string) => void;
}

export default function UploadStep({ onAnalysisComplete }: UploadStepProps) {
  const [file, setFile] = useState<File | null>(null);
  const [startupName, setStartupName] = useState('');
  const [founderName, setFounderName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) { // 10 MB limit
        toast({
          variant: 'destructive',
          title: 'File too large',
          description: 'Please upload a file smaller than 10MB.',
        });
        setFile(null);
        event.target.value = '';
        return;
      }
      setFile(selectedFile);
    }
  };

  const fileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!file || !startupName || !founderName) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please fill out all fields and select your pitch deck.',
      });
      return;
    }

    setIsLoading(true);
    try {
      const dataUri = await fileToDataUri(file);
      const result = await analyzeAndGenerateQuestionsAction({ pitchDeckDataUri: dataUri });
      toast({
        title: 'Analysis Complete',
        description: 'Your pitch deck has been analyzed. The Q&A will begin shortly.',
      });
      onAnalysisComplete(result, startupName, founderName, dataUri);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Analysis Failed',
        description: 'There was an error analyzing your pitch deck. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center">
      <div className="flex flex-col items-center mb-6">
        <Image
          src="https://ik.imagekit.io/ma8j7tc4p/file_000000009e006230bb897df63b4ca344%20(2).png?updatedAt=1756676907921"
          alt="Founders Hub Logo"
          width={200}
          height={50}
          className="mb-2"
          priority
        />
        <p className="text-muted-foreground text-sm">
          From idea to Impact with Founders Hub
        </p>
      </div>
      <Card className="w-full max-w-lg shadow-lg">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle className="text-2xl font-headline text-center">AI Jury Evaluation</CardTitle>
            <CardDescription className="text-center">
              Enter your details and upload your pitch deck to begin.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="startup-name">Startup Name</Label>
              <Input
                id="startup-name"
                placeholder="e.g., InnovateX"
                value={startupName}
                onChange={(e) => setStartupName(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
             <div className="space-y-2">
              <Label htmlFor="founder-name">Founder's Name</Label>
              <Input
                id="founder-name"
                placeholder="e.g., Jane Doe"
                value={founderName}
                onChange={(e) => setFounderName(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pitch-deck">Pitch Deck (PDF or PPTX, max 10MB)</Label>
              <div
                className="relative flex justify-center items-center w-full h-48 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-colors bg-background"
                onClick={() => document.getElementById('pitch-deck-input')?.click()}
              >
                {!file && !isLoading && (
                  <div className="text-center">
                    <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      <span className="font-semibold text-primary">Click to upload</span> or drag and drop
                    </p>
                  </div>
                )}
                {file && !isLoading && (
                  <div className="flex flex-col items-center">
                    <FileText className="h-12 w-12 text-primary" />
                    <p className="mt-2 font-medium text-foreground">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                     <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={(e) => {
                            e.stopPropagation();
                            setFile(null);
                            const input = document.getElementById('pitch-deck-input') as HTMLInputElement;
                            if (input) input.value = '';
                        }}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                 {isLoading && (
                  <div className="flex flex-col items-center">
                     <Loader2 className="h-12 w-12 animate-spin text-primary" />
                     <p className="mt-4 text-sm font-medium">Analyzing your pitch deck...</p>
                  </div>
                )}
                <Input 
                  id="pitch-deck-input" 
                  type="file" 
                  className="hidden"
                  onChange={handleFileChange}
                  accept=".pdf,.pptx"
                  disabled={isLoading} 
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={!file || isLoading || !startupName || !founderName}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                'Start AI Evaluation'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
