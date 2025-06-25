
'use server'

import {
  analyzeTextSentiment,
  AnalyzeTextSentimentOutput,
} from '@/ai/flows/analyze-text-sentiment'
import { extractEntities, ExtractEntitiesOutput } from '@/ai/flows/extract-entities'
import {
  summarizeDocument,
  SummarizeDocumentOutput,
} from '@/ai/flows/summarize-document'

type SettledResult<T> =
  | { status: 'fulfilled'; value: T }
  | { status: 'rejected'; reason: any }

export interface AnalysisResult {
  summary: SummarizeDocumentOutput | { error: string }
  sentiment: AnalyzeTextSentimentOutput | { error: string }
  entities: ExtractEntitiesOutput | { error: string }
}

export async function analyzeText(text: string): Promise<AnalysisResult> {
  if (!text || text.trim().length === 0) {
    throw new Error('Input text cannot be empty.')
  }

  const [summaryResult, sentimentResult, entitiesResult] =
    await Promise.allSettled([
      summarizeDocument({ text }),
      analyzeTextSentiment({ text }),
      extractEntities({ text }),
    ])

  const getResult = <T>(settledResult: SettledResult<T>): T | { error: string } => {
    if (settledResult.status === 'fulfilled') {
      return settledResult.value
    }
    console.error('Analysis failed:', settledResult.reason)
    return { error: settledResult.reason?.message || 'An unknown error occurred' }
  }

  return {
    summary: getResult(summaryResult),
    sentiment: getResult(sentimentResult),
    entities: getResult(entitiesResult),
  }
}
