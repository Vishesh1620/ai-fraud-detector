import { config } from 'dotenv';
config();

import '@/ai/flows/summarize-document.ts';
import '@/ai/flows/analyze-text-sentiment.ts';
import '@/ai/flows/extract-entities.ts';