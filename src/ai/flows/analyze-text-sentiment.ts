'use server';

/**
 * @fileOverview This file defines a Genkit flow for analyzing the sentiment of text using the Google Cloud Natural Language API.
 *
 * - analyzeTextSentiment - A function that accepts text as input and returns a sentiment analysis score.
 * - AnalyzeTextSentimentInput - The input type for the analyzeTextSentiment function.
 * - AnalyzeTextSentimentOutput - The return type for the analyzeTextSentiment function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeTextSentimentInputSchema = z.object({
  text: z.string().describe('The text to analyze for sentiment.'),
});

export type AnalyzeTextSentimentInput = z.infer<typeof AnalyzeTextSentimentInputSchema>;

const AnalyzeTextSentimentOutputSchema = z.object({
  score: z.number().describe('The sentiment score of the text. Range: [-1, 1].'),
  magnitude: z
    .number()
    .describe('The strength of the sentiment in the text. Range: [0, +inf].'),
});

export type AnalyzeTextSentimentOutput = z.infer<typeof AnalyzeTextSentimentOutputSchema>;

export async function analyzeTextSentiment(input: AnalyzeTextSentimentInput): Promise<AnalyzeTextSentimentOutput> {
  return analyzeTextSentimentFlow(input);
}

const analyzeTextSentimentPrompt = ai.definePrompt({
  name: 'analyzeTextSentimentPrompt',
  input: {schema: AnalyzeTextSentimentInputSchema},
  output: {schema: AnalyzeTextSentimentOutputSchema},
  prompt: `Analyze the sentiment of the following text and provide a sentiment score between -1 and 1, and a magnitude score.

Text: {{{text}}}`,
});

const analyzeTextSentimentFlow = ai.defineFlow(
  {
    name: 'analyzeTextSentimentFlow',
    inputSchema: AnalyzeTextSentimentInputSchema,
    outputSchema: AnalyzeTextSentimentOutputSchema,
  },
  async input => {
    const {output} = await analyzeTextSentimentPrompt(input);
    return output!;
  }
);
