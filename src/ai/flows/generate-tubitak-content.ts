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
  {{{draftText}}}

  Generate content for the following sections, optimizing for originality, feasibility, and word count limits (Amaç: 100 words, Yöntem: 150 words, Beklenen Sonuç: 100 words). Be as original as possible. Make sure the content is feasible to implement.
  
  For the 'Amaç' (Purpose) section of research projects, structure it to explain the scientific premise and the specific goal. For example: "Vermikülit bünyesine daha fazla su alır, perlit ise vermikülite göre daha az su tutar fakat daha fazla havayı içerde tutabilir. Bu projede vermikülitin su tutma kapasitesi ile perlitin daha iyi drenaj ve hava tutma kapasitesine bağlı olarak kurak bölgelerde suyun verimli kullanılıp toprakta nem oranının uzun süre muhafaza edilmesi amaçlanmıştır."

  For the 'Yöntem' (Method) section, structure it clearly with numbered steps like a scientific experiment (e.g., Araştırma Aşaması, Tasarım Aşaması, Uygulama Aşaması, Veri Analizi, Sunum Aşaması).
  
  For the 'Beklenen Sonuç' (Expected Result) section of research projects, formulate it as a clear hypothesis, comparing experimental groups to a control group. For example: "Vermikülit ve perlit, farklı özelliklere sahip olmalarına rağmen, her ikisi de toprak nemini artırmaya yardımcı olan minerallerdir. Vermikülit, su tutma kapasitesi açısından daha üstündür ve toprak nemini daha uzun süre muhafaza edebilir, ancak perlit, toprak havalandırmasını artırır ve suyun drenajını iyileştirir. Bu projede birinci deney grubu saksı içerisine yarı yarıya toprak-vermikülit'in nem oranı ikinci deney grubu olan saksı içerisine yarı yarıya toprak-perlit'e göre yüksek olması beklenmektedir, üçüncü saksı içerisinde sırayla yüzde %30 vermikülit, yüzde %30 oranında perlit ve %40 oranında toprak olan saksı ise 1. ve 2. deney grubundan daha fazla neme sahip olması beklenmektedir. Tamamen toprak konulan kontrol grubu ise diğer saksılardan daha az neme sahip olması beklenmektedir. Ayrıca bitki gelişiminin en az olması beklenen saksı tamamen toprak konulan kontrol grubu saksı olması beklenirken, en fazla gelişim ise yüzde %30 vermikülit, yüzde %30 oranında perlit ve %40 oranında toprak konulan saksı olması beklenmektedir."

  Return the output as a JSON object with the following keys: amac, yontem, beklenenSonuc.
  Also add a field called "progress" to indicate which section it is working on.`,
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
