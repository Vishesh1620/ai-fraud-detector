import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [
    googleAI({
      apiVersion: 'v1beta',
      models: ['models/gemini-1.5-pro-latest'], // 👈 fixed here
    }),
  ],
});
