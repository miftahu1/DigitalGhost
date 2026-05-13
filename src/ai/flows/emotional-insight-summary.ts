'use server';
/**
 * @fileOverview This file contains a Genkit flow for analyzing user journal entries and voice notes
 * to summarize their emotional landscape, identify shifts, and pinpoint persistent feelings.
 *
 * - emotionalInsightSummary - A function that triggers the emotional insight summary process.
 * - EmotionalInsightSummaryInput - The input type for the emotionalInsightSummary function.
 * - EmotionalInsightSummaryOutput - The return type for the emotionalInsightSummary function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const EmotionalInsightEntrySchema = z.object({
  timestamp: z.string().datetime().describe('Timestamp of the entry in ISO 8601 format.'),
  content: z.string().describe('The journal entry or voice note transcription content.'),
  type: z.enum(['journal', 'voice_note']).describe('Type of the entry (journal or voice_note).'),
});

const EmotionalInsightSummaryInputSchema = z.object({
  entries: z.array(EmotionalInsightEntrySchema)
    .describe('A chronological list of journal entries and voice note transcriptions.'),
});
export type EmotionalInsightSummaryInput = z.infer<typeof EmotionalInsightSummaryInputSchema>;

const EmotionalInsightSummaryOutputSchema = z.object({
  emotionalSummary: z.string().describe('A concise summary of the overall emotional landscape.'),
  significantShifts: z.array(z.object({
    period: z.string().describe('The time period during which the shift occurred (e.g., "early January", "March-April").'),
    description: z.string().describe('Description of the emotional shift, including its potential causes and impact.'),
    previousDominantEmotion: z.string().optional().describe('The dominant emotion or emotional state observed before the shift.'),
    currentDominantEmotion: z.string().optional().describe('The dominant emotion or emotional state observed after the shift.'),
  })).describe('An array highlighting significant emotional shifts identified over time.'),
  persistentFeelings: z.array(z.string()).describe('An array of feelings that have been consistently present or recurring.'),
  overallEmotionalState: z.string().describe('A high-level categorization of the user\'s current or most recent dominant emotional state (e.g., "optimistic", "anxious", "content", "stressed").'),
});
export type EmotionalInsightSummaryOutput = z.infer<typeof EmotionalInsightSummaryOutputSchema>;

export async function emotionalInsightSummary(input: EmotionalInsightSummaryInput): Promise<EmotionalInsightSummaryOutput> {
  return emotionalInsightSummaryFlow(input);
}

const emotionalInsightSummaryPrompt = ai.definePrompt({
  name: 'emotionalInsightSummaryPrompt',
  input: { schema: EmotionalInsightSummaryInputSchema },
  output: { schema: EmotionalInsightSummaryOutputSchema },
  prompt: `You are an expert AI therapist and emotional intelligence specialist. Your task is to analyze a user's chronological journal entries and voice note transcriptions to provide a comprehensive summary of their emotional landscape.

Focus on:
1. Identifying the overall emotional tone and recurring themes.
2. Highlighting any significant shifts in emotional state over time, explaining potential reasons.
3. Pinpointing persistent feelings or moods that frequently appear.
4. Categorizing the user's overall current or most recent dominant emotional state.

Analyze the following entries:

{{#each entries}}
---
Timestamp: {{{timestamp}}}
Type: {{{type}}}
Content: {{{content}}}
---
{{/each}}

Based on the entries, provide a structured summary in JSON format as described by the output schema.`,
});

const emotionalInsightSummaryFlow = ai.defineFlow(
  {
    name: 'emotionalInsightSummaryFlow',
    inputSchema: EmotionalInsightSummaryInputSchema,
    outputSchema: EmotionalInsightSummaryOutputSchema,
  },
  async (input) => {
    const { output } = await emotionalInsightSummaryPrompt(input);
    return output!;
  }
);
