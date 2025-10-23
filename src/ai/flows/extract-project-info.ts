'use server';
/**
 * @fileOverview This file defines a Genkit flow for extracting structured project information
 * from a given text.
 *
 * - extractProjectInfo - An async function that accepts a block of text and returns structured project data.
 * - ExtractProjectInfoInput - The input type for the extractProjectInfo function.
 * - ExtractProjectInfoOutput - The output type for the extractProjectInfo function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractProjectInfoInputSchema = z.object({
  projectText: z.string().describe('The text containing the project details.'),
});
export type ExtractProjectInfoInput = z.infer<typeof ExtractProjectInfoInputSchema>;

const ExtractProjectInfoOutputSchema = z.object({
  projectName: z.string().describe('The name of the project.'),
  projectType: z.string().describe('The sub-project type (e.g., Araştırma, Tasarım, İnceleme).'),
  mainArea: z.string().describe('The main research area (e.g., Bilişim ve Yazılım, Biyoloji).'),
  thematicSubject: z.string().describe('The thematic subject (e.g., Yapay Zeka, Siber Güvenlik).'),
  advisor: z.string().describe('The name of the advisor teacher.'),
  students: z.array(z.string()).describe('A list of student names involved in the project.'),
});
export type ExtractProjectInfoOutput = z.infer<typeof ExtractProjectInfoOutputSchema>;

export async function extractProjectInfo(input: ExtractProjectInfoInput): Promise<ExtractProjectInfoOutput> {
  return extractProjectInfoFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractProjectInfoPrompt',
  input: {schema: ExtractProjectInfoInputSchema},
  output: {schema: ExtractProjectInfoOutputSchema},
  prompt: `You are an AI assistant that extracts structured information from a TÜBİTAK 4006 project proposal text.
  Analyze the following text and extract the required fields.

  Text to analyze:
  {{{projectText}}}

  Extract the following information:
  - Proje Adı (Project Name)
  - Alt Proje Türü (Sub Project Type) - Should be one of: 'Araştırma', 'Tasarım', 'İnceleme'
  - Araştırma Ana Alanı (Main Research Area)
  - Tematik Konu (Thematic Subject)
  - Danışman Öğretmen (Advisor Teacher)
  - Öğrenciler (Students) - Should be an array of student names.

  Return the extracted information in the specified JSON format. If a field is not found, return an empty string or an empty array for students.
  `,
});

const extractProjectInfoFlow = ai.defineFlow(
  {
    name: 'extractProjectInfoFlow',
    inputSchema: ExtractProjectInfoInputSchema,
    outputSchema: ExtractProjectInfoOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
