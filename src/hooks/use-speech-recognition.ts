'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

type SpeechRecognitionHook = {
  isListening: boolean;
  transcript: string;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
  hasRecognitionSupport: boolean;
  error: string | null;
};

const useSpeechRecognition = (): SpeechRecognitionHook => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const manualStopRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Speech recognition not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.lang = 'en-US';
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
      manualStopRef.current = false;
    };

    recognition.onend = () => {
      setIsListening(false);
      // Automatically restart listening unless it was manually stopped
      if (!manualStopRef.current) {
        recognition.start();
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
       if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setError("Microphone access denied. Please enable it in your browser settings.");
        manualStopRef.current = true;
      } else if (event.error !== 'aborted' && event.error !== 'no-speech') {
         setError('An error occurred during speech recognition.');
         manualStopRef.current = true;
      }
      setIsListening(false);
    };

    recognition.onresult = (event) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if(finalTranscript) {
        setTranscript(prev => prev + finalTranscript + ' ');
      }
    };

    recognitionRef.current = recognition;

    return () => {
      manualStopRef.current = true;
      recognition.abort();
    };
  }, []);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      setTranscript('');
      recognitionRef.current.start();
    }
  },[isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      manualStopRef.current = true;
      recognitionRef.current.stop();
    }
  }, [isListening]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
  }, []);

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    resetTranscript,
    hasRecognitionSupport: !!recognitionRef.current,
    error,
  };
};

export default useSpeechRecognition;
