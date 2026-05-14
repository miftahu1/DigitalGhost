
'use server';
/**
 * @fileOverview A Genkit flow that converts a synthesis of memories into a spoken audio broadcast.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import wav from 'wav';

const NeuralRadioInputSchema = z.object({
  text: z.string().describe('The synthesis or recap text to convert to speech.'),
});

export async function broadcastNeuralRadio(input: { text: string }) {
  return neuralRadioFlow(input);
}

const neuralRadioFlow = ai.defineFlow(
  {
    name: 'neuralRadioFlow',
    inputSchema: NeuralRadioInputSchema,
    outputSchema: z.object({
      audioDataUri: z.string(),
    }),
  },
  async (input) => {
    // 1. Refine the text for a better radio script
    const { text: script } = await ai.generate({
      prompt: `Rewrite this reflection summary into a warm, atmospheric podcast-style script. The narrator should sound like a gentle digital companion. Keep it under 200 words. Text: ${input.text}`,
    });

    // 2. Generate Audio
    const { media } = await ai.generate({
      model: googleAI.model('gemini-2.5-flash-preview-tts'),
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Algenib' },
          },
        },
      },
      prompt: script,
    });

    if (!media?.url) {
      throw new Error('Failed to generate neural audio.');
    }

    const audioBuffer = Buffer.from(
      media.url.substring(media.url.indexOf(',') + 1),
      'base64'
    );

    const wavBase64 = await toWav(audioBuffer);

    return {
      audioDataUri: 'data:audio/wav;base64,' + wavBase64,
    };
  }
);

async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    let bufs: any[] = [];
    writer.on('error', reject);
    writer.on('data', function (d) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}
