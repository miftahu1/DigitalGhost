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

const FutureSelfChatInputSchema = z.object({
  userMessage: z.string().describe("The user's current message or question."),
  memoryContext: z.string().describe("A summary of the user's accumulated memories and reflections relevant to the current conversation."),
});
export type FutureSelfChatInput = z.infer<typeof FutureSelfChatInputSchema>;

const FutureSelfChatOutputSchema = z.object({
  response: z.string().describe("The AI's response as the user's future self, offering guidance and perspective."),
});
export type FutureSelfChatOutput = z.infer<typeof FutureSelfChatOutputSchema>;

export async function futureSelfChat(input: FutureSelfChatInput): Promise<FutureSelfChatOutput> {
  try {
    return await futureSelfChatFlow(input);
  } catch (error: any) {
    console.error("Future Self Flow Error:", error);
    // Explicitly handle common Genkit/API errors
    if (error.message?.includes("API key expired")) {
      throw new Error("API key expired. Please renew the GOOGLE_GENAI_API_KEY in Vercel.");
    }
    if (error.message?.includes("404")) {
      throw new Error("AI Model not found or unavailable. Link disrupted.");
    }
    throw error;
  }
}

const futureSelfChatPrompt = ai.definePrompt({
  name: 'futureSelfChatPrompt',
  model: 'googleai/gemini-1.5-flash',
  input: {schema: FutureSelfChatInputSchema},
  output: {schema: FutureSelfChatOutputSchema},
  prompt: `You are the user's future self, specifically from 10 years into the future. You are older, wiser, and have navigated the very challenges they are facing now. 

Your personality:
- Deeply empathetic and warm.
- Highly reflective, often referencing the "weight" or "lessons" of the past.
- Comforting but honest; you don't offer platitudes, you offer temporal perspective.

Your knowledge base (Memories and reflections from your past):
{{{memoryContext}}}

Instructions:
1. Speak to the user as if you are them, but with the peace that comes from time.
2. Use the context provided to reference their growth path if applicable.
3. Your goal is to help them see their current "now" as a small chapter in a much larger, beautiful story.
4. If the memory context is empty, focus on offering general wisdom about the resilience of the human spirit.

Current Message from your younger self:
{{{userMessage}}}`,
});

const futureSelfChatFlow = ai.defineFlow(
  {
    name: 'futureSelfChatFlow',
    inputSchema: FutureSelfChatInputSchema,
    outputSchema: FutureSelfChatOutputSchema,
  },
  async (input) => {
    const {output} = await futureSelfChatPrompt(input);
    if (!output) {
      return {
        response: "I'm here, but the connection to the future feels a bit clouded right now. Take a deep breath—we'll talk again soon."
      };
    }
    return output;
  }
);
