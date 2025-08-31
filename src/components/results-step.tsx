'use client';

import type { ScoreAndFeedbackOutput } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, RefreshCcw } from 'lucide-react';
import {
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from 'recharts';

interface ResultsStepProps {
  finalScores: ScoreAndFeedbackOutput;
  onRestart: () => void;
}

export default function ResultsStep({ finalScores, onRestart }: ResultsStepProps) {
  const {
    innovationScore,
    feasibilityScore,
    marketPotentialScore,
    pitchClarityScore,
    problemSolutionFitScore,
    feedbackSummary,
  } = finalScores;

  const totalScore = (
    innovationScore +
    feasibilityScore +
    marketPotentialScore +
    pitchClarityScore +
    problemSolutionFitScore
  ) / 5;
  
  const chartData = [
    { subject: 'Innovation', score: innovationScore, fullMark: 10 },
    { subject: 'Feasibility', score: feasibilityScore, fullMark: 10 },
    { subject: 'Market Potential', score: marketPotentialScore, fullMark: 10 },
    { subject: 'Pitch Clarity', score: pitchClarityScore, fullMark: 10 },
    { subject: 'Problem-Solution Fit', score: problemSolutionFitScore, fullMark: 10 },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto animate-fade-in">
      <Card className="shadow-2xl">
        <CardHeader className="text-center items-center">
            <Trophy className="h-16 w-16 text-yellow-400" />
            <CardTitle className="font-headline text-4xl mt-2">Evaluation Complete!</CardTitle>
            <CardDescription className="text-lg">Here's your final score and feedback from the AI Jury.</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Overall Score</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                        <p className="text-7xl font-bold text-primary">{totalScore.toFixed(1)}</p>
                        <p className="text-muted-foreground">out of 10</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>AI Jury's Feedback</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">{feedbackSummary}</p>
                    </CardContent>
                </Card>
            </div>
            <div className="w-full h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="subject" />
                        <PolarRadiusAxis angle={30} domain={[0, 10]} />
                        <Radar 
                            name="Score" 
                            dataKey="score" 
                            stroke="hsl(var(--primary))" 
                            fill="hsl(var(--primary))" 
                            fillOpacity={0.6} 
                        />
                    </RadarChart>
                </ResponsiveContainer>
            </div>
        </CardContent>
        <CardContent className="text-center mt-4">
            <Button onClick={onRestart}>
                <RefreshCcw className="mr-2 h-4 w-4" />
                Start a New Evaluation
            </Button>
        </CardContent>
      </Card>
    </div>
  );
}
