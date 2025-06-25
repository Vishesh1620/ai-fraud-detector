import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { AlertCircle, Frown, Meh, Smile, FileJson, BookText, BrainCircuit } from 'lucide-react'
import type { AnalysisResult } from '../app/actions'

interface ResultsDisplayProps {
  results: AnalysisResult
}

const ErrorDisplay = ({ error }: { error: string }) => (
  <div className="flex items-center gap-2 text-destructive">
    <AlertCircle className="h-5 w-5" />
    <p>
      <strong>Error:</strong> {error}
    </p>
  </div>
)

const SentimentDisplay = ({
  sentiment,
}: {
  sentiment: NonNullable<AnalysisResult['sentiment']>
}) => {
  if ('error' in sentiment) {
    return <ErrorDisplay error={sentiment.error} />
  }

  const getSentimentIcon = (score: number) => {
    if (score > 0.25) return <Smile className="text-green-500" />
    if (score < -0.25) return <Frown className="text-red-500" />
    return <Meh className="text-yellow-500" />
  }
  
  const getSentimentLabel = (score: number) => {
    if (score > 0.25) return 'Positive'
    if (score < -0.25) return 'Negative'
    return 'Neutral'
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
      <div className="flex items-center gap-2">
        {getSentimentIcon(sentiment.score)}
        <span className="font-semibold text-lg">{getSentimentLabel(sentiment.score)}</span>
      </div>
      <div className="flex gap-4 text-sm text-muted-foreground">
        <span>Score: <Badge variant="secondary">{sentiment.score.toFixed(2)}</Badge></span>
        <span>Magnitude: <Badge variant="secondary">{sentiment.magnitude.toFixed(2)}</Badge></span>
      </div>
    </div>
  )
}

export function ResultsDisplay({ results }: ResultsDisplayProps) {
  const hasEntities = 'entities' in results.entities && results.entities.entities.length > 0;

  return (
    <div className="mt-6">
      <h3 className="text-2xl font-headline text-center mb-4">Analysis Results</h3>
      <Accordion type="multiple" defaultValue={['summary', 'sentiment', 'entities']} className="w-full">
        <AccordionItem value="summary">
          <AccordionTrigger className="text-lg font-semibold">
            <BookText className="mr-2 h-5 w-5 text-primary"/>
            Summary
          </AccordionTrigger>
          <AccordionContent className="text-base leading-relaxed p-2">
            {'error' in results.summary ? (
              <ErrorDisplay error={results.summary.error} />
            ) : (
              results.summary.summary
            )}
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="sentiment">
          <AccordionTrigger className="text-lg font-semibold">
             <Smile className="mr-2 h-5 w-5 text-primary"/>
            Sentiment Analysis
          </AccordionTrigger>
          <AccordionContent className="p-2">
            <SentimentDisplay sentiment={results.sentiment} />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="entities">
          <AccordionTrigger className="text-lg font-semibold">
            <BrainCircuit className="mr-2 h-5 w-5 text-primary"/>
            Extracted Entities
          </AccordionTrigger>
          <AccordionContent className="p-2">
            {'error' in results.entities ? (
              <ErrorDisplay error={results.entities.error} />
            ) : !hasEntities ? (
              <p className="text-muted-foreground">No entities were extracted from the text.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Entity Name</TableHead>
                    <TableHead>Type</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.entities.entities.map((entity, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{entity.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{entity.type}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </AccordionContent>
        </AccordionItem>
         <AccordionItem value="raw-json">
          <AccordionTrigger className="text-lg font-semibold">
            <FileJson className="mr-2 h-5 w-5 text-primary"/>
            Raw JSON Output
          </AccordionTrigger>
          <AccordionContent>
            <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
              <code>{JSON.stringify(results, null, 2)}</code>
            </pre>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
