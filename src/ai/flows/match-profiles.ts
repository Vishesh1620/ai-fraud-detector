'use server';
/**
 * @fileOverview A career matching AI agent.
 *
 * - findMatches - A function that handles the matching process.
 * - MatchInput - The input type for the findMatches function.
 * - MatchOutput - The return type for the findMatches function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const NewcomerProfileSchema = z.object({
  background: z.string().describe('The user\'s background, including education and work history.'),
  skills: z.string().describe('A list of the user\'s skills.'),
  goals: z.string().describe('The user\'s career goals.'),
});

const MentorProfileSchema = z.object({
  name: z.string(),
  role: z.string(),
  field: z.string(),
  backgroundSummary: z.string(),
});

const JobProfileSchema = z.object({
  companyName: z.string(),
  role: z.string(),
  description: z.string(),
  requiredSkills: z.string(),
});

export const MatchInputSchema = z.object({
  newcomer: NewcomerProfileSchema,
  mentors: z.array(MentorProfileSchema),
  jobs: z.array(JobProfileSchema),
});
export type MatchInput = z.infer<typeof MatchInputSchema>;


const MatchSchema = z.object({
    type: z.enum(['mentor', 'job']),
    name: z.string().describe('Name of the mentor or company.'),
    role: z.string().describe('Role of the mentor or job title.'),
    matchScore: z.number().min(0).max(100).describe('A percentage score of the match quality.'),
    summary: z.string().describe('A brief, encouraging summary explaining why this is a good match.'),
});

export const MatchOutputSchema = z.object({
    matches: z.array(MatchSchema),
    newcomerSummary: z.string().describe("A succinct profile of the newcomer's strengths and the kind of role they seek."),
});
export type MatchOutput = z.infer<typeof MatchOutputSchema>;


export async function findMatches(input: MatchInput): Promise<MatchOutput> {
  return matchProfilesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'matchProfilePrompt',
  input: {schema: MatchInputSchema},
  output: {schema: MatchOutputSchema},
  prompt: `You are an AI career-matching expert for newcomers. Your goal is to provide encouraging and helpful guidance.

First, analyze the newcomer's profile to understand their strengths and career aspirations. Generate a succinct, 2-3 sentence profile summary of their strengths and the kind of role they would excel in.

Newcomer Profile:
- Background: {{{newcomer.background}}}
- Skills: {{{newcomer.skills}}}
- Goals: {{{newcomer.goals}}}

Then, for each provided mentor and job opening, evaluate how good of a match they are for the newcomer. Provide a match score from 0 to 100 and a brief, one-sentence summary explaining why they are a good match. The summary should be encouraging and highlight the potential connection.

Available Mentors:
{{#each mentors}}
- Name: {{name}}
- Role: {{role}} in {{field}}
- Background: {{backgroundSummary}}
{{/each}}

Available Jobs:
{{#each jobs}}
- Company: {{companyName}}
- Role: {{role}}
- Description: {{description}}
- Required Skills: {{requiredSkills}}
{{/each}}

Return a list of all mentors and jobs, each with a match score and summary. The score should reflect a realistic potential for a good connection or job fit.
`,
});

const matchProfilesFlow = ai.defineFlow(
  {
    name: 'matchProfilesFlow',
    inputSchema: MatchInputSchema,
    outputSchema: MatchOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
