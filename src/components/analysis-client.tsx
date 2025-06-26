'use client'

import { getMatches } from '@/app/actions'
import type { MatchOutput } from '@/ai/flows/match-profiles'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'
import { useState, useTransition } from 'react'
import { ResultsDisplay } from './results-display'

export function AnalysisClient() {
  const [file, setFile] = useState<File | null>(null)
  const [text, setText] = useState<string>('')
  const [activeTab, setActiveTab] = useState('upload')
  const [results, setResults] = useState<MatchOutput | null>(null)
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0])
    } else {
      setFile(null)
    }
  }

  const handleSubmit = () => {
    if (activeTab === 'upload' && !file) {
      toast({
        title: 'No Resume File Selected',
        description: 'Please upload your resume to find matches.',
        variant: 'destructive',
      })
      return
    }
    if (activeTab === 'text' && !text.trim()) {
      toast({
        title: 'No Background Text Provided',
        description: 'Please enter your background information to find matches.',
        variant: 'destructive',
      })
      return
    }

    startTransition(async () => {
      setResults(null)
      try {
        let payload: { resume?: string; backgroundText?: string } = {}

        if (activeTab === 'upload' && file) {
          payload.resume = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => resolve(reader.result as string)
            reader.onerror = (error) => reject(error)
            reader.readAsDataURL(file)
          })
        } else if (activeTab === 'text' && text) {
          payload.backgroundText = text
        }

        const matchResults = await getMatches(payload)
        setResults(matchResults)
      } catch (error) {
        toast({
          title: 'Matching Failed',
          description:
            (error as Error).message ||
            'An unexpected error occurred. Please try again.',
          variant: 'destructive',
        })
      }
    })
  }

  const LoadingSkeletons = () => (
    <div className="space-y-8 mt-6">
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Skeleton className="h-48 w-full rounded-lg" />
        <Skeleton className="h-48 w-full rounded-lg" />
        <Skeleton className="h-48 w-full rounded-lg" />
        <Skeleton className="h-48 w-full rounded-lg" />
      </div>
    </div>
  )

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-4xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-headline text-center">
            Your Personal Career Navigator
          </CardTitle>
          <CardDescription className="text-center">
            Upload your resume or paste your background, and our AI will connect you with the right
            mentors and opportunities.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            defaultValue="upload"
            className="w-full"
            onValueChange={setActiveTab}
          >
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="upload">Upload Resume</TabsTrigger>
              <TabsTrigger value="text">Paste Background</TabsTrigger>
            </TabsList>
            <TabsContent value="upload">
              <Card className="p-6">
                <p className="text-sm text-muted-foreground mb-2">
                  Provide your resume (PDF or TXT). Your file will not be stored.
                </p>
                <Input
                  id="resume"
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.txt,.doc,.docx"
                  className="text-base"
                />
              </Card>
            </TabsContent>
            <TabsContent value="text">
              <Card className="p-6">
                <p className="text-sm text-muted-foreground mb-2">
                  Paste your background, skills, work history, and career goals below.
                </p>
                <Textarea
                  placeholder="Tell us about your work history, education, skills, and what you're looking for..."
                  className="min-h-[150px] text-base"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
              </Card>
            </TabsContent>
          </Tabs>

          <div className="mt-8 flex justify-center">
            <Button
              size="lg"
              onClick={handleSubmit}
              disabled={isPending}
              className="w-full sm:w-auto"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Finding Your Matches...
                </>
              ) : (
                'Find My Matches'
              )}
            </Button>
          </div>

          {isPending && <LoadingSkeletons />}

          {!isPending && results && <ResultsDisplay results={results} />}
        </CardContent>
      </Card>
    </div>
  )
}
