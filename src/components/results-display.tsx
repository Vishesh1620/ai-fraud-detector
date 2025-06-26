import type { MatchOutput } from '@/ai/flows/match-profiles'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Briefcase, User, Star } from 'lucide-react'

interface MatchResultsProps {
  results: MatchOutput
}

export function ResultsDisplay({ results }: MatchResultsProps) {
  const { newcomerSummary, matches } = results

  return (
    <div className="mt-6 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="text-yellow-500" /> Your AI-Generated Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{newcomerSummary}</p>
        </CardContent>
      </Card>

      <div>
        <h3 className="text-2xl font-headline text-center mb-4">Your Top Matches</h3>
        <div className="grid gap-6 md:grid-cols-2">
          {matches.map((match, index) => (
            <Card key={index} className="flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-3">
                      {match.type === 'mentor' ? (
                        <User className="text-primary" />
                      ) : (
                        <Briefcase className="text-primary" />
                      )}
                      {match.name}
                    </CardTitle>
                    <CardDescription>{match.role}</CardDescription>
                  </div>
                  <Badge variant="secondary" className="text-lg">
                    {match.matchScore}%
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="space-y-2">
                  <Progress value={match.matchScore} className="h-2" />
                  <p className="text-sm text-muted-foreground pt-2">{match.summary}</p>
                </div>
              </CardContent>
              <CardFooter>
                 <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => window.open('#', '_blank')}
                    >
                    {match.type === 'mentor' ? 'Connect with Mentor' : 'View Job'}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
