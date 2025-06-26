'use server'

import { findMatches, MatchInput, MatchOutput } from '@/ai/flows/match-profiles'
import { jobs } from '@/data/jobs'
import { mentors } from '@/data/mentors'

export async function getMatches(
  { resume, education, workHistory, skills, careerGoals }:
  { resume?: string; education?: string; workHistory?: string; skills?: string; careerGoals?: string; }
): Promise<MatchOutput> {
  if (!resume && !education && !workHistory && !skills && !careerGoals) {
    throw new Error('A resume file or background information is required.')
  }

  const input: MatchInput = {
    newcomer: { resume, education, workHistory, skills, careerGoals },
    mentors,
    jobs,
  }

  try {
    const results = await findMatches(input)
    return results
  } catch (error) {
    console.error('Error getting matches:', error)
    // Propagate the original, more detailed error message to the client.
    throw new Error((error as Error).message || 'An unknown error occurred while getting matches.')
  }
}
