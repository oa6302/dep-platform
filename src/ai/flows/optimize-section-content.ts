 'use server';
/**
 * @fileOverview This file defines a Genkit flow for optimizing project section content (Amaç, Yöntem, Beklenen Sonuç) for TÜBİTAK 4006 format.
 *
 * - optimizeSectionContent - An async function that accepts section content and returns optimized content along with suitability scores.
 * - OptimizeSectionContentInput - The input type for the optimizeSectionContent function.
 * - OptimizeSectionContentOutput - The output type for the optimizeSectionContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const OptimizeSectionContentInputSchema = z.object({
  amac: z.string().describe('The Amaç (Purpose) section content.'),
  yontem: z.string().describe('The Yöntem (Method) section content.'),
  beklenenSonuc: z.string().describe('The Beklenen Sonuç (Expected Result) section content.'),
});
export type OptimizeSectionContentInput = z.infer<typeof OptimizeSectionContentInputSchema>;

const SuitabilityScoresSchema = z.object({
  ozgunluk: z.number().describe('Originality score (0-100).'),
  formatUygunlugu: z.number().describe('Format suitability score (0-100).'),
  dilAnlatim: z.number().describe('Language and expression score (0-100).'),
  genelUygunluk: z.number().describe('Overall suitability score (0-100).'),
});

const OptimizedSectionContentSchema = z.object({
  amac: z.string().describe('Optimized Amaç (Purpose) section content.'),
  yontem: z.string().describe('Optimized Yöntem (Method) section content.'),
  beklenenSonuc: z.string().describe('Optimized Beklenen Sonuç (Expected Result) section content.'),
  suitabilityScores: SuitabilityScoresSchema.describe('Suitability scores for the optimized content.'),
});

export type OptimizedSectionContentOutput = z.infer<typeof OptimizedSectionContentSchema>;

export async function optimizeSectionContent(input: OptimizeSectionContentInput): Promise<OptimizedSectionContentOutput> {
  return optimizeSectionContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'optimizeSectionContentPrompt',
  input: {schema: OptimizeSectionContentInputSchema},
  output: {schema: OptimizedSectionContentSchema},
  prompt: `You are an AI assistant specialized in optimizing project drafts for TÜBİTAK 4006 format.
  You will receive the content for Amaç (Purpose), Yöntem (Method), and Beklenen Sonuç (Expected Result) sections.
  Your task is to optimize these sections for originality, feasibility, and adherence to word count limits.
  Provide suitability scores (0-100) for Originality, Format Suitability, Language & Expression, and Overall Suitability.

  Amaç (Purpose): {{{amac}}}
  Yöntem (Method): {{{yontem}}}
  Beklenen Sonuç (Expected Result): {{{beklenenSonuc}}}

  Ensure the optimized content is well-structured, original, and feasible within the context of a TÜBİTAK 4006 project.
  Return the optimized content and suitability scores in the following JSON format:
  {{$jsonOutput}}
`,
});

const optimizeSectionContentFlow = ai.defineFlow(
  {
    name: 'optimizeSectionContentFlow',
    inputSchema: OptimizeSectionContentInputSchema,
    outputSchema: OptimizedSectionContentSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
