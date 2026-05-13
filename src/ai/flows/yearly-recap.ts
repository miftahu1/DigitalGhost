'use server';
/**
 * @fileOverview This file implements a Genkit flow for generating a personalized yearly recap based on user entries.
 *
 * - yearlyRecap - A function that generates a yearly recap.
 * - YearlyRecapInput - The input type for the yearlyRecap function.
 * - YearlyRecapOutput - The return type for the yearlyRecap function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const YearlyRecapInputSchema = z.object({
  year: z.number().describe('The year for which the recap should be generated (e.g., 2023).'),
  entries: z.string().describe('A concatenated string of all relevant journal entries, voice note transcriptions, dreams, and reflections for the specified year.'),
});
export type YearlyRecapInput = z.infer<typeof YearlyRecapInputSchema>;

const YearlyRecapOutputSchema = z.object({
  recap: z.string().describe('A personalized, reflective, and emotionally resonant yearly recap of significant memories, reflections, and emotional milestones.'),
});
export type YearlyRecapOutput = z.infer<typeof YearlyRecapOutputSchema>;

const yearlyRecapPrompt = ai.definePrompt({
  name: 'yearlyRecapPrompt',
  input: {schema: YearlyRecapInputSchema},
  output: {schema: YearlyRecapOutputSchema},
  prompt: `You are an AI companion for the "Digital Ghost" app, designed to help users reflect on their past.\nYour task is to create a personalized, emotionally resonant, and insightful yearly recap for the user based on their entries.\nFocus on identifying significant memories, key reflections, and emotional milestones from the provided text.\nThe tone should be reflective, empathetic, and encouraging of personal growth, aligning with the app's deeply personal and emotional feel.\n\nGenerate a comprehensive yearly recap for the year {{{year}}} using the following entries:\n\nUser Entries:\n{{{entries}}}\n\nPlease structure the recap in a narrative format, highlighting key themes, transformations, and moments of significance.\n`,
});

const yearlyRecapFlow = ai.defineFlow(
  {
    name: 'yearlyRecapFlow',
    inputSchema: YearlyRecapInputSchema,
    outputSchema: YearlyRecapOutputSchema,
  },
  async (input) => {
    const {output} = await yearlyRecapPrompt(input);
    return output!;
  }
);

export async function yearlyRecap(input: YearlyRecapInput): Promise<YearlyRecapOutput> {
  return yearlyRecapFlow(input);
}
