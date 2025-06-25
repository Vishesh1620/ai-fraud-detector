'use server';
/**
 * @fileOverview Extracts key entities from text using GenAI.
 *
 * - extractEntities - A function that handles the entity extraction process.
 * - ExtractEntitiesInput - The input type for the extractEntities function.
 * - ExtractEntitiesOutput - The return type for the extractEntities function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractEntitiesInputSchema = z.object({
  text: z.string().describe('The text to extract entities from.'),
});
export type ExtractEntitiesInput = z.infer<typeof ExtractEntitiesInputSchema>;

const ExtractEntitiesOutputSchema = z.object({
  entities: z.array(
    z.object({
      name: z.string().describe('The name of the entity.'),
      type: z.string().describe('The type of the entity (e.g., PERSON, ORGANIZATION, LOCATION).'),
      // metadata: z.record(z.string()).optional().describe('Additional metadata about the entity.'),
      // confidence: z.number().optional().describe('Confidence score for the entity extraction.'),
    })
  ).describe('The extracted entities.'),
});
export type ExtractEntitiesOutput = z.infer<typeof ExtractEntitiesOutputSchema>;

export async function extractEntities(input: ExtractEntitiesInput): Promise<ExtractEntitiesOutput> {
  return extractEntitiesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractEntitiesPrompt',
  input: {schema: ExtractEntitiesInputSchema},
  output: {schema: ExtractEntitiesOutputSchema},
  prompt: `You are an expert natural language processor.

  Your task is to extract key entities from the given text. Identify entities such as people, organizations, and locations.

  Text: {{{text}}}

  Return the extracted entities in JSON format.
  `,
});

const extractEntitiesFlow = ai.defineFlow(
  {
    name: 'extractEntitiesFlow',
    inputSchema: ExtractEntitiesInputSchema,
    outputSchema: ExtractEntitiesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
