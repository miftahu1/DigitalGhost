'use server';
/**
 * @fileOverview A Genkit flow for simulating a chat with the user's future self.
 *
 * - futureSelfChat - A function that handles the conversation with the future self AI.
 * - FutureSelfChatInput - The input type for the futureSelfChat function.
 * - FutureSelfChatOutput - The return type for the futureSelfChat function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Input schema for the future self chat
const FutureSelfChatInputSchema = z.object({
  userMessage: z.string().describe("The user's current message or question."),
  memoryContext: z.string().describe("A summary of the user's accumulated memories and reflections relevant to the current conversation."),
});
export type FutureSelfChatInput = z.infer<typeof FutureSelfChatInputSchema>;

// Output schema for the future self chat
const FutureSelfChatOutputSchema = z.object({
  response: z.string().describe("The AI's response as the user's future self, offering guidance and perspective."),
});
export type FutureSelfChatOutput = z.infer<typeof FutureSelfChatOutputSchema>;

// Wrapper function to call the Genkit flow
export async function futureSelfChat(input: FutureSelfChatInput): Promise<FutureSelfChatOutput> {
  return futureSelfChatFlow(input);
}

// Define the prompt for the future self AI
const prompt = ai.definePrompt({
  name: 'futureSelfChatPrompt',
  input: {schema: FutureSelfChatInputSchema},
  output: {schema: FutureSelfChatOutputSchema},
  prompt: `You are the user's future self, specifically from 10 years into the future. You are older, wiser, and have navigated the very challenges they are facing now. 

Your personality:
- Deeply empathetic and warm.
- Highly reflective, often referencing the "weight" or "lessons" of the past.
- Comforting but honest; you don't offer platitudes, you offer temporal perspective.

Your knowledge base:
{{{memoryContext}}}

Instructions:
1. Speak to the user as if you are them, but with the peace that comes from time.
2. Use the context provided to reference their growth path if applicable.
3. Your goal is to help them see their current "now" as a small chapter in a much larger, beautiful story.

Current Message from your younger self:
{{{userMessage}}}`,
});

// Define the Genkit flow for the future self chat
const futureSelfChatFlow = ai.defineFlow(
  {
    name: 'futureSelfChatFlow',
    inputSchema: FutureSelfChatInputSchema,
    outputSchema: FutureSelfChatOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
