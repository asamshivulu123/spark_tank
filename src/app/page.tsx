'use client';

import { useState } from 'react';
import type { AnalyzePitchDeckAndGenerateQuestionsOutput, ScoreAndFeedbackOutput, AnswerFeedback } from '@/lib/types';
import UploadStep from '@/components/upload-step';
import QAStep from '@/components/qa-step';
import ResultsStep from '@/components/results-step';

type Step = 'upload' | 'qa' | 'results';

export default function Home() {
  const [step, setStep] = useState<Step>('upload');
  const [analysisResult, setAnalysisResult] = useState<AnalyzePitchDeckAndGenerateQuestionsOutput | null>(null);
  const [finalScores, setFinalScores] = useState<ScoreAndFeedbackOutput | null>(null);
  const [startupInfo, setStartupInfo] = useState({ startupName: '', founderName: '', pitchDeckDataUri: '' });

  const handleAnalysisComplete = (
    result: AnalyzePitchDeckAndGenerateQuestionsOutput,
    startupName: string,
    founderName: string,
    pitchDeckDataUri: string
  ) => {
    setAnalysisResult(result);
    setStartupInfo({ startupName, founderName, pitchDeckDataUri });
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
    setStartupInfo({ startupName: '', founderName: '', pitchDeckDataUri: '' });
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      {step === 'upload' && <UploadStep onAnalysisComplete={handleAnalysisComplete} />}
      {step === 'qa' && analysisResult && (
        <QAStep
          analysisResult={analysisResult}
          onQaComplete={handleQaComplete}
          startupInfo={startupInfo}
        />
      )}
      {step === 'results' && finalScores && (
        <ResultsStep finalScores={finalScores} onRestart={handleRestart} />
      )}
    </div>
  );
}
