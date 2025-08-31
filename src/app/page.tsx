'use client';

import { useState } from 'react';
import type { AnalyzePitchDeckAndGenerateQuestionsOutput } from '@/ai/flows/analyze-pitch-deck-and-generate-questions';
import type { ScoreAndFeedbackOutput } from '@/ai/flows/score-and-provide-feedback';
import UploadStep from '@/components/upload-step';
import QAStep from '@/components/qa-step';
import ResultsStep from '@/components/results-step';

type Step = 'upload' | 'qa' | 'results';

export default function Home() {
  const [step, setStep] = useState<Step>('upload');
  const [analysisResult, setAnalysisResult] = useState<AnalyzePitchDeckAndGenerateQuestionsOutput | null>(null);
  const [finalScores, setFinalScores] = useState<ScoreAndFeedbackOutput | null>(null);

  const handleAnalysisComplete = (result: AnalyzePitchDeckAndGenerateQuestionsOutput) => {
    setAnalysisResult(result);
    setStep('qa');
  };
  
  const handleQaComplete = (scores: ScoreAndFeedbackOutput) => {
    setFinalScores(scores);
    setStep('results');
  };

  const handleRestart = () => {
    setStep('upload');
    setAnalysisResult(null);
    setFinalScores(null);
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      {step === 'upload' && <UploadStep onAnalysisComplete={handleAnalysisComplete} />}
      {step === 'qa' && analysisResult && (
        <QAStep analysisResult={analysisResult} onQaComplete={handleQaComplete} />
      )}
      {step === 'results' && finalScores && (
        <ResultsStep finalScores={finalScores} onRestart={handleRestart} />
      )}
    </div>
  );
}
