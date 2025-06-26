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
  resume: z.string().optional().describe("The user's resume, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
  education: z.string().optional().describe("The user's educational background."),
  workHistory: z.string().optional().describe("The user's work history."),
  skills: z.string().optional().describe("The user's skills."),
  careerGoals: z.string().optional().describe("The user's career goals."),
}).refine(data => data.resume || data.education || data.workHistory || data.skills || data.careerGoals, {
  message: "Either a resume or at least one text field must be provided.",
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

const MatchInputSchema = z.object({
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

const MatchOutputSchema = z.object({
    matches: z.array(MatchSchema),
    newcomerSummary: z.string().describe("A succinct profile of the newcomer's strengths and the kind of role they seek."),
});
export type MatchOutput = z.infer<typeof MatchOutputSchema>;


// The exported function simply calls the flow and returns its result.
// The flow itself will throw an error if the AI response is invalid.
export async function findMatches(input: MatchInput): Promise<MatchOutput> {
  return matchProfilesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'matchProfilePrompt',
  input: {schema: MatchInputSchema},
  output: {schema: MatchOutputSchema},
  prompt: `You are an AI career-matching expert for newcomers. Your goal is to provide encouraging and helpful guidance.

First, analyze the newcomer's information to understand their strengths and career aspirations. Generate a succinct, 2-3 sentence profile summary of their strengths and the kind of role they would excel in.

{{#if newcomer.resume}}
Newcomer's Resume:
{{media url=newcomer.resume}}
{{/if}}
{{#if newcomer.education}}
Newcomer's Education:
{{newcomer.education}}
{{/if}}
{{#if newcomer.workHistory}}
Newcomer's Work History:
{{newcomer.workHistory}}
{{/if}}
{{#if newcomer.skills}}
Newcomer's Skills:
{{newcomer.skills}}
{{/if}}
{{#if newcomer.careerGoals}}
Newcomer's Career Goals:
{{newcomer.careerGoals}}
{{/if}}

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

Your final output must be a single, valid JSON object that strictly adheres to the requested output schema. Do not include markdown formatting like \`\`\`json or any text outside of the JSON object itself. Return a list of all mentors and jobs, each with a match score and summary. The score should reflect a realistic potential for a good connection or job fit.
`,
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_NONE',
      },
    ],
  },
});

const matchProfilesFlow = ai.defineFlow(
  {
    name: 'matchProfilesFlow',
    inputSchema: MatchInputSchema,
    outputSchema: MatchOutputSchema,
  },
  async (input) => {
    const response = await prompt(input);
    const output = response.output;

    if (!output) {
      console.error(
        'AI failed to produce valid JSON output. Raw text response:',
        response.text
      );
      throw new Error('AI failed to produce a structured response.');
    }
    return output;
  }
);
