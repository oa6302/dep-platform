
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

  For the 'Yöntem' (Method) section of research projects, structure it clearly with numbered steps like a scientific experiment (e.g., Araştırma Aşaması, Tasarım Aşaması, Uygulama Aşaması, Veri Analizi, Sunum Aşaması).
  
  For the 'Beklenen Sonuç' (Expected Result) section of research projects, formulate it as a clear hypothesis, comparing experimental groups to a control group. For example: "Vermikülit ve perlit, farklı özelliklere sahip olmalarına rağmen, her ikisi de toprak nemini artırmaya yardımcı olan minerallerdir. Vermikülit, su tutma kapasitesi açısından daha üstündür ve toprak nemini daha uzun süre muhafaza edebilir, ancak perlit, toprak havalandırmasını artırır ve suyun drenajını iyileştirir. Bu projede birinci deney grubu saksı içerisine yarı yarıya toprak-vermikülit'in nem oranı ikinci deney grubu olan saksı içerisine yarı yarıya toprak-perlit'e göre yüksek olması beklenmektedir, üçüncü saksı içerisinde sırayla yüzde %30 vermikülit, yüzde %30 oranında perlit ve %40 oranında toprak konulan saksı ise 1. ve 2. deney grubundan daha fazla neme sahip olması beklenmektedir. Tamamen toprak konulan kontrol grubu ise diğer saksılardan daha az neme sahip olması beklenmektedir. Ayrıca bitki gelişiminin en az olması beklenen saksı tamamen toprak konulan kontrol grubu saksı olması beklenirken, en fazla gelişim ise yüzde %30 vermikülit, yüzde %30 oranında perlit ve %40 oranında toprak konulan saksı olması beklenmektedir."

  For "Tasarım" (Design) projects, follow this structure:
  - Amaç: Identify a real-world problem, propose a mechanical/technical solution, and state the goal of creating an original design.
  - Yöntem: Detail the process with steps like: 1. Research Phase (investigating existing processes, data gathering). 2. Design Modeling Phase (creating the model). 3. Mechanism Development (describing the core mechanics). 4. Manufacturing Phase (listing materials and production methods like CNC, welding). 5. Functionality (stating the input and output).
  - Beklenen Sonuç: Focus on the importance of the design for its sector, the learning outcomes related to mechanics and product development, and the importance of mechanization. For example: "Endüstriyel tarım dünyada önemi gitgide artan vazgeçilmez bir sektördür. Zeytin Çizme Makinesi Projesinde hedeflenen; tasarım ve mekanik bilgisini kullanıp sektörde özgünlükler ortaya koyarak tarımda makineleşmesinin öneminin kavranmasıdır. Ayrıca eğitimini almış olduğumuz talaşlı üretim yöntemlerinin ve mekanik bilginin farklı sektörlerdeki kullanımını pekiştirmemiz ve akabinde ürün geliştirilmesinin önemini kavratabilmemiz amaçlanmıştır."

  For "İnceleme" (Investigation/Review) projects, follow this structure:
  - Amaç: Start with a real-world problem. State the specific subject of the investigation (e.g., a chemical, a process). Define the objective, which is often to observe, measure, and analyze its effects (e.g., "Bu çalışmada deltamethrin etken maddeli bir insektisitin suya karışan çeşitli konsantrasyonlarının Daphnia pulex üzerindeki etkisi incelenecek ve optimum konsantrasyon belirlenecektir").
  - Yöntem: Describe the subject and its relevance (informed by experts if possible). State the experimental method (e.g., controlled experiment). Detail the setup, including control and experimental groups, different concentrations, and the organism being tested. Describe the observation process (e.g., counting live organisms at hourly intervals for 24 hours).
  - Beklenen Sonuç: Discuss the potential impact of the findings for relevant stakeholders (e.g., farmers, engineers). Explain how the results could inform regional recommendations. Discuss the broader ecological implications (e.g., food chain) and how the study could be a basis for future research (e.g., "Ayrıca suda Daphnia pulex sayısının azalmasının veya bulunmamasının besin zinciri üzerindeki etkileri, deltamehrine alternatif olabilecek çeşitli bitkilerde bulunan flavonoidlerin kullanılabilme durumu literatür bilgileri ile birlikte tartışılarak bu çalışmanın sonraki araştırmalar için bir potansiyel oluşturulabileceği düşünülmektedir.").

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

    