
'use server';
/**
 * @fileOverview A Genkit flow for interpreting user dream entries, identifying recurring themes and subconscious patterns.
 *
 * - interpretDream - A function that handles the dream interpretation process.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DreamInterpreterInputSchema = z.object({
  dreamEntry: z.string().describe('The user\'s dream entry to be interpreted.'),
});
export type DreamInterpreterInput = z.infer<typeof DreamInterpreterInputSchema>;

const DreamInterpreterOutputSchema = z.object({
  interpretation: z
    .string()
    .describe(
      'A detailed interpretation of the dream, explaining its potential meanings and symbolism.'
    ),
  themes: z
    .array(z.string())
    .describe(
      'An array of recurring themes identified in the dream (e.g., loss, pursuit, transformation).'
    ),
  subconsciousPatterns: z
    .array(z.string())
    .describe(
      'An array of potential subconscious patterns or psychological insights derived from the dream.'
    ),
});
export type DreamInterpreterOutput = z.infer<
  typeof DreamInterpreterOutputSchema
>;

export async function interpretDream(
  input: DreamInterpreterInput
): Promise<DreamInterpreterOutput> {
  try {
    return await dreamInterpreterFlow(input);
  } catch (error: any) {
    console.error("Dream Flow Error:", error);
    if (error.message?.includes("API key")) {
      throw new Error("AI engine failed: Valid GOOGLE_GENAI_API_KEY required in environment variables.");
    }
    throw error;
  }
}

const dreamInterpreterPrompt = ai.definePrompt({
  name: 'dreamInterpreterPrompt',
  input: {schema: DreamInterpreterInputSchema},
  output: {schema: DreamInterpreterOutputSchema},
  prompt: `You are an expert dream analyst. Your task is to analyze the provided dream entry, identify recurring themes, and uncover potential subconscious patterns. Provide a detailed interpretation.

Dream Entry:
{{{dreamEntry}}}

Based on the dream entry, please provide:
1.  A comprehensive interpretation.
2.  Any recurring themes you can identify.
3.  Any subconscious patterns or psychological insights.
`,
});

const dreamInterpreterFlow = ai.defineFlow(
  {
    name: 'dreamInterpreterFlow',
    inputSchema: DreamInterpreterInputSchema,
    outputSchema: DreamInterpreterOutputSchema,
  },
  async (input) => {
    const {output} = await dreamInterpreterPrompt(input);
    if (!output) throw new Error("AI interpretation returned no result.");
    return output;
  }
);
