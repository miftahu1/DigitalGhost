'use server';
/**
 * @fileOverview A Genkit flow for visualizing memories into cinematic clips using Veo.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

const VisualizerInputSchema = z.object({
  memoryText: z.string().describe('The memory or dream text to visualize.'),
});
export type VisualizerInput = z.infer<typeof VisualizerInputSchema>;

const VisualizerOutputSchema = z.object({
  videoUrl: z.string().describe('The generated video as a data URI or URL.'),
  status: z.string(),
});
export type VisualizerOutput = z.infer<typeof VisualizerOutputSchema>;

export async function visualizeMemory(input: VisualizerInput): Promise<VisualizerOutput> {
  return memoryVisualizerFlow(input);
}

const memoryVisualizerFlow = ai.defineFlow(
  {
    name: 'memoryVisualizerFlow',
    inputSchema: VisualizerInputSchema,
    outputSchema: VisualizerOutputSchema,
  },
  async (input) => {
    // 1. Create a visual prompt from the memory
    const { text: visualPrompt } = await ai.generate({
      prompt: `Translate this memory into a cinematic, atmospheric visual description for a 5-second video. Focus on lighting, mood, and texture. Avoid text. Memory: ${input.memoryText}`,
    });

    // 2. Generate video using Veo
    let { operation } = await ai.generate({
      model: googleAI.model('veo-3.0-generate-preview'),
      prompt: visualPrompt,
    });

    if (!operation) throw new Error('Video generation failed to start.');

    // 3. Wait for completion (Timeout handling)
    let attempts = 0;
    while (!operation.done && attempts < 20) {
      await new Promise(r => setTimeout(r, 5000));
      operation = await ai.checkOperation(operation);
      attempts++;
    }

    if (operation.error) throw new Error(operation.error.message);

    const videoPart = operation.output?.message?.content.find((p) => !!p.media);
    if (!videoPart?.media?.url) throw new Error('No video output generated.');

    // Note: In production, we'd proxy this to avoid API key exposure or use signed URLs.
    // For this prototype, we'll append the key for the direct fetch on client or return as is.
    const finalUrl = `${videoPart.media.url}&key=${process.env.GEMINI_API_KEY}`;

    return {
      videoUrl: finalUrl,
      status: 'completed'
    };
  }
);
