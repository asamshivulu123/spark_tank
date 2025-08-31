import { z } from 'zod';

export const TeamResultSchema = z.object({
  id: z.string(),
  timestamp: z.string(),
  startupName: z.string(),
  founderName: z.string(),
  totalScore: z.number(),
  innovation: z.number(),
  feasibility: z.number(),
  marketPotential: z.number(),
  pitchClarity: z.number(),
  problemSolutionFit: z.number(),
  feedbackSummary: z.string(),
});

export type TeamResult = z.infer<typeof TeamResultSchema>;


export const AnalyzePitchDeckAndGenerateQuestionsInputSchema = z.object({
  pitchDeckDataUri: z
    .string()
    .describe(
      "A pitch deck in PDF or PPTX format, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzePitchDeckAndGenerateQuestionsInput = z.infer<
  typeof AnalyzePitchDeckAndGenerateQuestionsInputSchema
>;

export const AnalyzePitchDeckAndGenerateQuestionsOutputSchema = z.object({
  problem: z.string().describe('The problem the startup is trying to solve.'),
  solution: z.string().describe('The solution the startup is providing.'),
  marketSize: z.string().describe('The size of the target market.'),
  businessModel: z.string().describe('The business model of the startup.'),
  competition: z.string().describe('The competitive landscape.'),
  risks: z.string().describe('The potential risks the startup faces.'),
  investorQuestions: z
    .array(z.string())
    .describe('A list of investor-style questions generated from the pitch deck.'),
});
export type AnalyzePitchDeckAndGenerateQuestionsOutput = z.infer<
  typeof AnalyzePitchDeckAndGenerateQuestionsOutputSchema
>;


export const AutomatedVoiceQAInputSchema = z.object({
  pitchDeckAnalysis: z
    .string()
    .describe('The analysis of the pitch deck, including generated questions.'),
  userResponse: z
    .string()
    .describe('The user responses from voice converted to text.'),
});
export type AutomatedVoiceQAInput = z.infer<typeof AutomatedVoiceQAInputSchema>;

export const AutomatedVoiceQAOutputSchema = z.object({
  score: z.number().describe('The score for the answer.'),
  feedback: z.string().describe('The feedback for the answer.'),
});
export type AutomatedVoiceQAOutput = z.infer<typeof AutomatedVoiceQAOutputSchema>;


export const SaveToSheetInputSchema = z.object({
  startupName: z.string().describe("The name of the startup."),
  founderName: z.string().describe("The name of the founder."),
  innovationScore: z.number().describe('The score for innovation (0-10).'),
  feasibilityScore: z.number().describe('The score for feasibility (0-10).'),
  marketPotentialScore: z.number().describe('The score for market potential (0-10).'),
  pitchClarityScore: z.number().describe('The score for pitch clarity (0-10).'),
  problemSolutionFitScore: z.number().describe('The score for problem-solution fit (0-10).'),
  feedbackSummary: z.string().describe('A summary of the feedback (3-5 sentences).'),
});
export type SaveToSheetInput = z.infer<typeof SaveToSheetInputSchema>;


export const ScoreAndFeedbackInputSchema = z.object({
  pitchDeckAnalysis: z
    .string()
    .describe('The analysis of the pitch deck, including problem, solution, market size, business model, competition, and risks.'),
  voiceQAResponse: z
    .string()
    .describe('The response from the participant in the voice Q&A interaction.'),
});
export type ScoreAndFeedbackInput = z.infer<typeof ScoreAndFeedbackInputSchema>;

export const ScoreAndFeedbackOutputSchema = z.object({
  innovationScore: z
    .number()
    .describe('The score for innovation (0-10).'),
  feasibilityScore: z
    .number()
    .describe('The score for feasibility (0-10).'),
  marketPotentialScore: z
    .number()
    .describe('The score for market potential (0-10).'),
  pitchClarityScore: z
    .number()
    .describe('The score for pitch clarity (0-10).'),
  problemSolutionFitScore: z
    .number()
    .describe('The score for problem-solution fit (0-10).'),
  feedbackSummary: z
    .string()
    .describe('A summary of the feedback (3-5 sentences).'),
});
export type ScoreAndFeedbackOutput = z.infer<typeof ScoreAndFeedbackOutputSchema>;
