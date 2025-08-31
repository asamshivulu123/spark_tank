'use client';

import { useState, useEffect } from 'react';
import type { AnalyzePitchDeckAndGenerateQuestionsOutput, ScoreAndFeedbackOutput } from '@/lib/types';
import useSpeechRecognition from '@/hooks/use-speech-recognition';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, MicOff, Volume2, Loader2, Send } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { getAudioFeedbackAction, scoreAndFeedbackAction, saveToSheetAction } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface QAStepProps {
  analysisResult: AnalyzePitchDeckAndGenerateQuestionsOutput;
  onQaComplete: (scores: ScoreAndFeedbackOutput) => void;
  startupInfo: { startupName: string; founderName: string };
}

type AnswerFeedback = {
  question: string;
  answer: string;
  score: number;
  feedback: string;
};

export default function QAStep({ analysisResult, onQaComplete, startupInfo }: QAStepProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isAnswering, setIsAnswering] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [answers, setAnswers] = useState<AnswerFeedback[]>([]);
  const { toast } = useToast();

  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    resetTranscript,
    hasRecognitionSupport,
    error,
  } = useSpeechRecognition();
  
  const questions = analysisResult.investorQuestions;
  const currentQuestion = questions[currentQuestionIndex];

  const speak = (text: string) => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel(); // Cancel any previous speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    if (currentQuestion) {
      speak(`Question ${currentQuestionIndex + 1}: ${currentQuestion}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestionIndex]);

  useEffect(() => {
    if (error) {
      toast({
        variant: 'destructive',
        title: 'Speech Recognition Error',
        description: error,
      });
    }
  }, [error, toast]);

  const handleStartRecording = () => {
    setIsAnswering(true);
    resetTranscript();
    startListening();
  }
  
  const handleAnswerSubmission = async () => {
    stopListening();
    if (!transcript) {
        toast({
            variant: "destructive",
            title: "No answer recorded",
            description: "Please provide an answer to the question.",
        });
        // Allow user to try again without moving to next question
        setIsAnswering(true); 
        return;
    }

    setIsProcessing(true);
    setIsAnswering(false);

    try {
        const pitchDeckAnalysisString = JSON.stringify(analysisResult);
        const feedbackResult = await getAudioFeedbackAction({
            pitchDeckAnalysis: pitchDeckAnalysisString,
            userResponse: transcript,
        });

        const newAnswer: AnswerFeedback = {
            question: currentQuestion,
            answer: transcript,
            score: feedbackResult.score,
            feedback: feedbackResult.feedback,
        };
        setAnswers(prev => [...prev, newAnswer]);
        
        speak(feedbackResult.feedback);
        resetTranscript();

        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            finishSession();
        }
    } catch (e) {
        console.error(e);
        toast({
            variant: "destructive",
            title: "Error processing answer",
            description: "There was an issue with the AI feedback. Please try again.",
        });
    } finally {
        setIsProcessing(false);
    }
  };

  const handleCancelAndRestart = () => {
    stopListening();
    resetTranscript();
    startListening();
  };

  const finishSession = async () => {
    setIsFinishing(true);
    try {
      const pitchDeckAnalysisString = JSON.stringify(analysisResult);
      const voiceQAResponse = answers.map(a => `Q: ${a.question}\nA: ${a.answer}\nScore: ${a.score}\nFeedback: ${a.feedback}`).join('\n\n');
      
      const finalScores = await scoreAndFeedbackAction({
        pitchDeckAnalysis: pitchDeckAnalysisString,
        voiceQAResponse: voiceQAResponse
      });

      await saveToSheetAction({
        startupName: startupInfo.startupName,
        founderName: startupInfo.founderName,
        ...finalScores
      });
      
      onQaComplete(finalScores);

    } catch (e) {
      console.error(e);
      toast({
        variant: 'destructive',
        title: 'Error finalizing results',
        description: 'Could not calculate final scores or save data. Please try restarting.',
      });
    } finally {
        setIsFinishing(false);
    }
  };

  const progressValue = ((currentQuestionIndex) / questions.length) * 100;

  if (isFinishing) {
    return (
        <div className="flex flex-col items-center justify-center h-full min-h-[50vh] text-center">
            <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
            <h2 className="text-2xl font-headline mb-2">Calculating Final Scores & Saving...</h2>
            <p className="text-muted-foreground">The AI Jury is deliberating. Please wait a moment.</p>
        </div>
    )
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
        <Card className="shadow-2xl animate-fade-in">
            <CardHeader className="text-center">
                <CardTitle className="font-headline text-3xl">AI Jury Q&amp;A</CardTitle>
                <p className="text-muted-foreground">Question {currentQuestionIndex + 1} of {questions.length}</p>
                <Progress value={progressValue} className="w-full mt-2" />
            </CardHeader>
            <CardContent className="space-y-6 text-center">
                <div className="p-6 bg-secondary rounded-lg min-h-[100px] flex items-center justify-center">
                    <p className="text-xl font-medium text-secondary-foreground">{currentQuestion}</p>
                </div>

                {!hasRecognitionSupport && (
                    <Alert variant="destructive">
                        <AlertTitle>Browser Not Supported</AlertTitle>
                        <AlertDescription>
                            Your browser does not support speech recognition. Please use a recent version of Chrome or Firefox.
                        </AlertDescription>
                    </Alert>
                )}

                {isAnswering ? (
                    <div className="space-y-4">
                        <div className="flex justify-center items-center h-24">
                           {isListening ? (
                             <div className="flex flex-col items-center gap-2">
                                <Mic className="h-10 w-10 text-destructive animate-pulse" />
                                <p className="text-sm text-destructive">Listening...</p>
                             </div>
                           ) : (
                             <div className="flex flex-col items-center gap-2">
                                <MicOff className="h-10 w-10 text-muted-foreground" />
                                <p className="text-sm text-muted-foreground">Mic is off. An error might have occurred.</p>
                            </div>
                           )}
                        </div>
                        <div className="p-4 border rounded-md min-h-[6rem] bg-background text-left">
                            <p className="italic text-muted-foreground">{transcript || 'Your answer will appear here...'}</p>
                        </div>
                        <div className="flex justify-center gap-4">
                            <Button variant="outline" onClick={handleCancelAndRestart}>Cancel & Restart</Button>
                            <Button onClick={handleAnswerSubmission} disabled={!transcript || isProcessing}>
                                {isProcessing ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <Send className="mr-2 h-4 w-4" />
                                        Submit Answer
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="flex justify-center items-center flex-col gap-4">
                        <Button
                            onClick={handleStartRecording}
                            size="lg"
                            className="w-64"
                            disabled={isProcessing || !hasRecognitionSupport}
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <Mic className="mr-2 h-5 w-5" />
                                    Record Answer
                                </>
                            )}
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => speak(currentQuestion)}
                            disabled={isProcessing}
                        >
                            <Volume2 className="mr-2 h-4 w-4" />
                            Repeat Question
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
        
        {answers.length > 0 && (
            <div className="mt-8">
                <h3 className="text-2xl font-headline mb-4">Feedback Log</h3>
                <div className="space-y-4">
                    {answers.map((item, index) => (
                        <Card key={index} className="bg-card/50">
                            <CardHeader>
                                <p className="text-sm font-semibold text-muted-foreground">Q: {item.question}</p>
                                <p className="text-sm text-foreground">A: "{item.answer}"</p>
                            </CardHeader>
                            <CardContent>
                                <Alert>
                                    <AlertTitle className="flex justify-between items-center">
                                        <span>AI Feedback</span>
                                        <span className="font-bold text-primary">Score: {item.score}/10</span>
                                    </AlertTitle>
                                    <AlertDescription>{item.feedback}</AlertDescription>
                                </Alert>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        )}
    </div>
  );
}
