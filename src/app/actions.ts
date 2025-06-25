'use server'

import { findMatches, MatchInput, MatchOutput } from '@/ai/flows/match-profiles'

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

export async function getMatches({ resume }: { resume: string }): Promise<MatchOutput> {
  if (!resume) {
    throw new Error('A resume file is required.')
  }

  const input: MatchInput = {
    newcomer: { resume },
    mentors,
    jobs,
  }

  try {
    const results = await findMatches(input)
    // Sort matches by score in descending order
    results.matches.sort((a, b) => b.matchScore - a.matchScore)
    return results
  } catch (error) {
    console.error('Error getting matches:', error)
    throw new Error('Failed to get matches from AI. Please try again.')
  }
}
