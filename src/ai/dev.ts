import { config } from 'dotenv';
config();

import '@/ai/flows/analyze-pitch-deck-and-generate-questions.ts';
import '@/ai/flows/automated-voice-qa.ts';
import '@/ai/flows/score-and-provide-feedback.ts';
import '@/ai/flows/save-to-firebase.ts';
