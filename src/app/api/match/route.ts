'use server';

import { NextResponse } from 'next/server';
import { findMatches, type MatchInput } from '@/ai/flows/match-profiles';
import { mentors } from '@/data/mentors';
import { jobs } from '@/data/jobs';

export async function POST(request: Request) {
  try {
    const { resume, education, workHistory, skills, careerGoals } = await request.json();

    if (!resume && !education && !workHistory && !skills && !careerGoals) {
      return NextResponse.json({ error: 'A resume file or background information is required.' }, { status: 400 });
    }

    const input: MatchInput = {
      newcomer: { resume, education, workHistory, skills, careerGoals },
      mentors,
      jobs,
    }

    const results = await findMatches(input)
    if (!results) {
      return NextResponse.json({ error: 'The AI failed to generate a valid response.' }, { status: 500 });
    }
    
    return NextResponse.json(results);

  } catch (error) {
    console.error('Error getting matches:', error)
    if (error instanceof SyntaxError) { // JSON parsing error
        return NextResponse.json({ error: 'Invalid JSON in request body.' }, { status: 400 });
    }
     // Propagate the original, more detailed error message in the response.
    const errorMessage = (error as Error).message || 'An unknown error occurred while getting matches.';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
