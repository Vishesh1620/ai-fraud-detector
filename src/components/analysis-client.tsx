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
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'
import { useState, useTransition } from 'react'
import { ResultsDisplay } from './results-display'

export function AnalysisClient() {
  const [background, setBackground] = useState('')
  const [skills, setSkills] = useState('')
  const [goals, setGoals] = useState('')

  const [results, setResults] = useState<MatchOutput | null>(null)
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  const handleSubmit = () => {
    if (!background.trim() || !skills.trim() || !goals.trim()) {
      toast({
        title: 'All Fields Required',
        description: 'Please tell us about your background, skills, and goals.',
        variant: 'destructive',
      })
      return
    }

    startTransition(async () => {
      setResults(null)
      try {
        const matchResults = await getMatches({ background, skills, goals })
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
            Describe your background, skills, and ambitions. Our AI will connect
            you with the right mentors and opportunities.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <Label htmlFor="background" className="text-lg font-medium">
                Your Background
              </Label>
              <p className="text-sm text-muted-foreground mb-2">
                Tell us about your education and work history.
              </p>
              <Textarea
                id="background"
                placeholder="e.g., Bachelor's in Computer Science from University of Toronto, 2 years as a junior developer at a startup..."
                className="min-h-[150px] text-base"
                value={background}
                onChange={(e) => setBackground(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="skills" className="text-lg font-medium">
                Your Skills
              </Label>
              <p className="text-sm text-muted-foreground mb-2">
                List the skills you're proficient in.
              </p>
              <Textarea
                id="skills"
                placeholder="e.g., React, Node.js, Python, Figma, Public Speaking, Project Management..."
                className="min-h-[100px] text-base"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="goals" className="text-lg font-medium">
                Your Career Goals
              </Label>
              <p className="text-sm text-muted-foreground mb-2">
                What are you looking for in your next role or mentor?
              </p>
              <Textarea
                id="goals"
                placeholder="e.g., I want to transition into a product management role in the tech industry. I'm looking for a mentor who can guide me through this process."
                className="min-h-[100px] text-base"
                value={goals}
                onChange={(e) => setGoals(e.target.value)}
              />
            </div>
          </div>

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
