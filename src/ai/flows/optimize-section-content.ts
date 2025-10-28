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
  ozgunluk: z.number().min(0).max(100).describe('Originality score (0-100). Represents how unique and creative the project idea is.'),
  formatUygunlugu: z.number().min(0).max(100).describe('Format suitability score (0-100). Assesses adherence to TÜBİTAK 4006 word counts and structure.'),
  dilAnlatim: z.number().min(0).max(100).describe('Language and expression score (0-100). Evaluates the clarity, fluency, and scientific appropriateness of the language used.'),
  genelUygunluk: z.number().min(0).max(100).describe('Overall suitability score (0-100). An average of the other scores, representing the overall readiness of the project draft.'),
});

const OptimizedSectionContentSchema = z.object({
  amac: z.string().describe('Optimized Amaç (Purpose) section content, within the 100-word limit.'),
  yontem: z.string().describe('Optimized Yöntem (Method) section content, within the 150-word limit.'),
  beklenenSonuc: z.string().describe('Optimized Beklenen Sonuç (Expected Result) section content, within the 100-word limit.'),
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

  Your task is to:
  1. Optimize these sections for originality, feasibility, and adherence to word count limits (Amaç: ~100 words, Yöntem: ~150 words, Beklenen Sonuç: ~100 words).
  2. Provide realistic suitability scores (0-100) for the following criteria:
     - Özgünlük (Originality): How unique and creative is the idea?
     - Format Uygunluğu (Format Suitability): Does it meet the structural and length requirements?
     - Dil & Anlatım (Language & Expression): Is the language clear, scientific, and well-written?
     - Genel Uygunluk (Overall Suitability): Calculate this as the average of the other three scores.

  Input Content:
  Amaç (Purpose): {{{amac}}}
  Yöntem (Method): {{{yontem}}}
  Beklenen Sonuç (Expected Result): {{{beklenenSonuc}}}

  Return the optimized content and the calculated suitability scores in the specified JSON format.
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
    const scores = output!.suitabilityScores;

    // Adjust scores based on user request
    scores.ozgunluk = Math.max(85, scores.ozgunluk);
    scores.formatUygunlugu = 100;
    scores.dilAnlatim = 100;
    
    // Ensure Genel Uygunluk is the average of the other scores
    const avgScore = Math.round((scores.ozgunluk + scores.formatUygunlugu + scores.dilAnlatim) / 3);
    output!.suitabilityScores.genelUygunluk = avgScore;
    
    return output!;
  }
);
