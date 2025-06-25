'use client'

import { AnalysisResult, analyzeText } from '@/app/actions'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { FileUp, Loader2, Type } from 'lucide-react'
import { useState, useTransition } from 'react'
import { ResultsDisplay } from './results-display'

export function AnalysisClient() {
  const [text, setText] = useState('')
  const [fileName, setFileName] = useState('')
  const [results, setResults] = useState<AnalysisResult | null>(null)
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.type !== 'text/plain') {
        toast({
          title: 'Invalid File Type',
          description: 'Please upload a .txt file.',
          variant: 'destructive',
        })
        return
      }
      setFileName(file.name)
      const reader = new FileReader()
      reader.onload = (e) => {
        const fileContent = e.target?.result as string
        setText(fileContent)
      }
      reader.onerror = () => {
        toast({
          title: 'Error Reading File',
          description: 'There was an issue reading the uploaded file.',
          variant: 'destructive',
        })
      }
      reader.readAsText(file)
    }
  }

  const handleSubmit = () => {
    if (!text.trim()) {
      toast({
        title: 'Input Required',
        description: 'Please enter text or upload a file to analyze.',
        variant: 'destructive',
      })
      return
    }

    startTransition(async () => {
      setResults(null)
      try {
        const analysisResults = await analyzeText(text)
        setResults(analysisResults)
      } catch (error) {
        toast({
          title: 'Analysis Failed',
          description:
            (error as Error).message ||
            'An unexpected error occurred. Please try again.',
          variant: 'destructive',
        })
      }
    })
  }
  
  const LoadingSkeletons = () => (
    <div className="space-y-4 mt-6">
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
    </div>
  )

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="text-3xl font-headline text-center">
          AI-Powered Text Analysis
        </CardTitle>
        <CardDescription className="text-center">
          Enter text directly or upload a text file to extract summaries,
          analyze sentiment, and identify key entities.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="text" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="text">
              <Type className="mr-2" /> Text Input
            </TabsTrigger>
            <TabsTrigger value="file">
              <FileUp className="mr-2" /> File Upload
            </TabsTrigger>
          </TabsList>
          <TabsContent value="text" className="mt-4">
            <Textarea
              placeholder="Paste your text here for analysis..."
              className="min-h-[200px] text-base"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </TabsContent>
          <TabsContent value="file" className="mt-4">
            <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg">
              <Label htmlFor="file-upload" className="cursor-pointer">
                <FileUp className="mx-auto h-12 w-12 text-muted-foreground" />
                <span className="mt-2 block text-sm font-medium text-muted-foreground">
                  Click to upload a .txt file
                </span>
              </Label>
              <Input
                id="file-upload"
                type="file"
                className="sr-only"
                accept=".txt"
                onChange={handleFileChange}
              />
              {fileName && (
                <p className="mt-4 text-sm text-foreground">
                  Selected file: <strong>{fileName}</strong>
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-6 flex justify-center">
          <Button
            size="lg"
            onClick={handleSubmit}
            disabled={isPending}
            className="w-full sm:w-auto"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              'Analyze Text'
            )}
          </Button>
        </div>

        {(isPending || results) && <Separator className="my-6" />}
        
        {isPending && <LoadingSkeletons />}

        {!isPending && results && <ResultsDisplay results={results} />}

      </CardContent>
    </Card>
  )
}
