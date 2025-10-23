'use server';

/**
 * @fileOverview A TÜBİTAK 4006 project content generation AI agent.
 *
 * - generateTubitakContent - A function that generates content for TÜBİTAK 4006 project sections.
 * - GenerateTubitakContentInput - The input type for the generateTubitakContent function.
 * - GenerateTubitakContentOutput - The return type for the generateTubitakContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateTubitakContentInputSchema = z.object({
  draftText: z
    .string()
    .describe('The project draft text to be transformed into TÜBİTAK 4006 format.'),
});
export type GenerateTubitakContentInput = z.infer<
  typeof GenerateTubitakContentInputSchema
>;

const GenerateTubitakContentOutputSchema = z.object({
  amac: z.string().describe('The generated content for the Amaç (Purpose) section.'),
  yontem: z.string().describe('The generated content for the Yöntem (Method) section.'),
  beklenenSonuc: z
    .string()
    .describe('The generated content for the Beklenen Sonuç (Expected Result) section.'),
  progress: z.string().describe('Progress summary of content generation.'),
});
export type GenerateTubitakContentOutput = z.infer<
  typeof GenerateTubitakContentOutputSchema
>;

export async function generateTubitakContent(
  input: GenerateTubitakContentInput
): Promise<GenerateTubitakContentOutput> {
  return generateTubitakContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateTubitakContentPrompt',
  input: {schema: GenerateTubitakContentInputSchema},
  output: {schema: GenerateTubitakContentOutputSchema},
  prompt: `You are an AI assistant helping students transform their project drafts into the TÜBİTAK 4006 project format.

  Here is the project draft text:
  {{draftText}}

  Generate content for the following sections, optimizing for originality, feasibility, and word count limits (Amaç: 100 words, Yöntem: 150 words, Beklenen Sonuç: 100 words). Be as original as possible. Make sure the content is feasible to implement.

  Return the output as a JSON object with the following keys: amac, yontem, beklenenSonuc.
  Also add a field called \"progress\" to indicate which section it is working on.`,
});

const generateTubitakContentFlow = ai.defineFlow(
  {
    name: 'generateTubitakContentFlow',
    inputSchema: GenerateTubitakContentInputSchema,
    outputSchema: GenerateTubitakContentOutputSchema,
  },
  async input => {
    let output = {} as GenerateTubitakContentOutput;

    // Generate content for Amaç section
    const amacResult = await prompt({
      ...input,
      draftText: input.draftText,
    });

    output = {
      amac: amacResult.output!.amac,
      yontem: amacResult.output!.yontem,
      beklenenSonuc: amacResult.output!.beklenenSonuc,
      progress: 'Generated content for Amaç, Yöntem, and Beklenen Sonuç sections.',
    };

    return output;
  }
);
