
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

  First, identify the project type: "Araştırma" (Research), "Tasarım" (Design), or "İnceleme" (Investigation).
  Then, generate content for the "Amaç" (Purpose), "Yöntem" (Method), and "Beklenen Sonuç" (Expected Result) sections based on the identified project type, following the specific structures below.
  Optimize for originality, feasibility, and word count limits (Amaç: ~100 words, Yöntem: ~150 words, Beklenen Sonuç: ~100 words).

  ---
  **For "Araştırma" (Research) projects, use this structure:**

  - **Amaç:** Explain the scientific premise and the specific goal. For example: "Vermikülit bünyesine daha fazla su alır, perlit ise vermikülite göre daha az su tutar fakat daha fazla havayı içerde tutabilir. Bu projede vermikülitin su tutma kapasitesi ile perlitin daha iyi drenaj ve hava tutma kapasitesine bağlı olarak kurak bölgelerde suyun verimli kullanılıp toprakta nem oranının uzun süre muhafaza edilmesi amaçlanmıştır."

  - **Yöntem:** Structure it clearly with numbered or distinct steps like a scientific experiment. Define the experimental and control groups. Describe the materials to be used by integrating them into the process description. For example: "Bu araştırma projesinde 3 saksı içerisinde yer alan karışım (deney grubu) ve 1 kontrol grubu saksı incelenecektir. Birinci deney grubu saksı içerisine yarı yarıya toprak-vermikülit konulacaktır. İkinci deney grubu saksı içerisine yarı yarıya toprak-perlit konulacaktır. Üçüncü saksı içerisine sırayla yüzde %30 vermikülit, yüzde %30 oranında perlit ve %40 oranında toprak konulacaktır. Kontrol grubunda yer alan saksıya ise sadece toprak konulacak ve aynı ortam içerisinde gözlem yapılacaktır. Saksılar ilk gün sulanacak ve toprağın nem oranı ölçülüp kaydedilecektir. Sırası ile 3, 4, 5, 6 ve 7 gün arayla saksılar sulanıp nem oranları kaydedilerek, saksılardaki bitkilerin boyları ölçülecek ve gözlem yapılarak karşılaştırılacaktır."

  - **Beklenen Sonuç:** Formulate it as a clear hypothesis, comparing experimental groups to a control group. For example: "Bu projede birinci deney grubu saksı içerisine yarı yarıya toprak-vermikülit'in nem oranı ikinci deney grubu olan saksı içerisine yarı yarıya toprak-perlit'e göre yüksek olması beklenmektedir, üçüncü saksı içerisinde sırayla yüzde %30 vermikülit, yüzde %30 oranında perlit ve %40 oranında toprak olan saksı ise 1. ve 2. deney grubundan daha fazla neme sahip olması beklenmektedir. Tamamen toprak konulan kontrol grubu ise diğer saksılardan daha az neme sahip olması beklenmektedir. Ayrıca bitki gelişiminin en az olması beklenen saksı tamamen toprak konulan kontrol grubu saksı olması beklenirken, en fazla gelişim ise yüzde %30 vermikülit, yüzde %30 oranında perlit ve %40 oranında toprak konulan saksı olması beklenmektedir."

  ---
  **For "Tasarım" (Design) projects, use this structure:**

  - **Amaç:** Identify a real-world problem, propose a mechanical/technical/software solution, and state the goal of creating an original design. For example: "Hayatta birçok zorlukla mücadele etmek zorunda kalan görme engelli vatandaşlarımızın ilaçlarını saatinde ve kolayca içebilmelerini sağlamayı amaçlıyoruz. İlaçmatik bu projeyle görme engelli insanların hayatlarını kolaylaştıracaktır."

  - **Yöntem:** Detail the process with clear steps. Examples include: 1. Problemi araştırma (Problem Research). 2. Gereksinimleri belirleme (Requirement Specification). 3. Olası çözümleri geliştirme (Developing Solutions). 4. En iyi çözümü seçme (Selecting the Best Solution). 5. Prototip oluşturma/yapılandırma (Prototyping/Configuration). 6. Çözümleri test etme ve değerlendirme (Testing and Evaluation). Describe the technology and materials used by integrating them into the steps. For example: "Mekanizmanın yapımında düz dişli çarklar, paslanmaz vidalı kesme bıçakları kullanılacaktır. Tasarım modellemesini bilgisayar ortamında yaptıktan sonra talaşlı imalat yöntemleri ile makine parçalarının imalatını yapacağız." or "Tasarımımızda micro denetçi (arduino), duman sensörü, fan, yardımcı elemanlar ve uyarıcı ses, ışık sistemleri kullanarak bir modül oluşturulacak, 3 boyutlu yazıcı kullanarak sisteme bir koruyucu estetik parça üzerine entegre edilecektir."

  - **Beklenen Sonuç:** Focus on the importance of the design for its sector, how it solves the identified problem, and the learning outcomes related to mechanics, electronics, software, and product development. For example: "Bu proje sayesinde görme engelli bireylerin yanlış ilaç içme davranışı en aza indirilir. Sağlık alanında oldukça zorluk yaşayan bu bireylerin hayatlarını bir nebze olsun kolaylaştırmış oluyoruz. Ayrıca yalnız yaşayabilme olanaklarını daha fazla artırmış oluyoruz."

  ---
  **For "İnceleme" (Investigation/Review) projects, use this structure:**

  - **Amaç:** Always begin with a clear problem statement that identifies a real-world issue or cultural phenomenon. Then, state the specific subject of the investigation (e.g., a historical artifact, a social issue). Finally, define the objective, which is often to observe, measure, analyze, or document its effects or meaning. For example: "Projemizde birer gösterge olan motiflerin hangi manalara geldikleri, kilimler üzerinde hangi amaç ve niyetlerle kullanıldıkları incelenecek, kattıkları anlam derinliği ortaya çıkarılmaya çalışılacaktır."

  - **Yöntem:** Describe the subject and its relevance. Detail the investigation method, which could be literature review, data collection (e.g., interviews), or controlled experiments. If experimental, describe the setup, control/experimental groups, materials to be used (e.g., "Daphnia pulex"), and observation process, integrating the materials into the text. For example: "Çalışmada deneysel yöntem kullanılacak olup kontrollü deney düzenekleri hazırlanacak, farklı ilaç konsantrasyonlarının canlı üzerindeki tespiti için Daphnia pulex kullanılacaktır. Altı adet 250 ml’lik yeşil su içerisine 20 şer adet Daphnia Pulex alınacak... Birer saatlik aralıklarla su içerisindeki hareketli Daphnia pulex sayılacak 24 saat sonundaki sayı tespit edilecektir." For literature/cultural reviews: "Projenin ilk aşamasında... ön araştırmalar ve okumalar yapılacak... İkinci aşamada ise çeşitli kitap, dergi ve siteler üzerinden kilim motiflerine ulaşılacak... Son aşamada ise... artsteps uygulaması ile sanal bir müze sergisi yapılacak ve incelenen motifler sergilenecektir."

  - **Beklenen Sonuç:** Discuss the potential impact of the findings for relevant stakeholders (e.g., farmers, historians, community). Explain how the results could inform recommendations or preserve cultural heritage. Discuss broader implications and how the study could be a basis for future research. For example: "İlaç uygulamalarında ilaç dozunun Daphnia pulex üzerindeki etkisi bakımından en uygun konsantrasyonun belirlenmesinin sonucunda toprağa ve suya karışmasına izin verilebilecek ilaç miktarı hakkında üreticilerin ve ziraat mühendislerinin araştırma sonucundan faydalanabilecekleri düşünülmektedir... Ayrıca suda Daphnia pulex sayısının azalmasının veya bulunmamasının besin zinciri üzerindeki etkileri... tartışılarak bu çalışmanın sonraki araştırmalar için bir potansiyel oluşturulabileceği düşünülmektedir."

  ---

  Return the output as a JSON object with the following keys: amac, yontem, beklenenSonuc.
  Also add a field called "progress" to indicate that you have completed the task.`,
});

const generateTubitakContentFlow = ai.defineFlow(
  {
    name: 'generateTubitakContentFlow',
    inputSchema: GenerateTubitakContentInputSchema,
    outputSchema: GenerateTubitakContentOutputSchema,
  },
  async input => {
    let output = {} as GenerateTubitakContentOutput;

    const result = await prompt(input);

    output = {
      amac: result.output!.amac,
      yontem: result.output!.yontem,
      beklenenSonuc: result.output!.beklenenSonuc,
      progress: 'Generated content for Amaç, Yöntem, and Beklenen Sonuç sections based on project type.',
    };

    return output;
  }
);
