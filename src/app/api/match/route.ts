'use server';

import { NextResponse } from 'next/server';
import { findMatches, type MatchInput } from '@/ai/flows/match-profiles';

// Mock data for mentors and jobs
const mentors = [
  {
    name: 'Alice',
    role: 'Marketing Manager',
    field: 'Tech Marketing',
    backgroundSummary: 'Immigrated from Asia and has been a mentor for 5 years.',
  },
  {
    name: 'David',
    role: 'Senior Software Engineer',
    field: 'Fintech',
    backgroundSummary: 'Passionate about open-source and helping new developers.',
  },
  {
    name: 'Maria',
    role: 'UX Designer',
    field: 'Healthcare Tech',
    backgroundSummary: 'Changed careers from nursing to UX design.',
  },
]

const jobs = [
  {
    companyName: 'Innovate Inc.',
    role: 'Junior Product Manager',
    description: 'Looking for a passionate individual to help shape our new line of products. Great for someone with strong communication skills and a knack for organization.',
    requiredSkills: 'Project management, communication, market research',
  },
  {
    companyName: 'DataDriven Co.',
    role: 'Data Analyst Intern',
    description: 'An opportunity to work with our data science team on real-world problems. Perfect for recent graduates with a strong analytical mindset.',
    requiredSkills: 'SQL, Python (Pandas), Statistics, Data Visualization',
  },
]

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
    // Sort matches by score in descending order
    results.matches.sort((a, b) => b.matchScore - a.matchScore)
    return NextResponse.json(results);

  } catch (error) {
    console.error('Error getting matches:', error)
    if (error instanceof SyntaxError) { // JSON parsing error
        return NextResponse.json({ error: 'Invalid JSON in request body.' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to get matches from AI. Please try again.' }, { status: 500 });
  }
}
