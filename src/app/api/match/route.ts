import { findMatches } from '@/ai/flows/match-profiles';
import { mentors } from '@/data/mentors';
import { jobs } from '@/data/jobs';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { education, workHistory, skills, careerGoals } = body;

    const input = {
      newcomer: { education, workHistory, skills, careerGoals },
      mentors,
      jobs
    };

    const result = await findMatches(input);
    return Response.json(result);
  } catch (error) {
    console.error('❌ Backend Error:', error);
    return new Response(JSON.stringify({ error: 'Failed to process input.' }), { status: 500 });
  }
}