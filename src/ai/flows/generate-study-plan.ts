'use server';

/**
 * @fileOverview Kullanıcının hedef sınavına ve akademik haftasına göre 
 * 52 haftalık roadmap uyumlu, playlist destekli kişiselleştirilmiş plan üretir.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const TaskSchema = z.object({
  time: z.string().describe('Seansın başlangıç saati (Örn: 09:00)'),
  subject: z.string().describe('Ders adı'),
  topic: z.string().describe('Çalışılacak güncel müfredat konusu'),
  duration: z.string().describe('Seans süresi (Örn: 45 dk)'),
  bookUrl: z.string().optional().describe('Kaynak PDF veya kitap linki'),
  youtubeUrl: z.string().optional().describe('YouTube Oynatma Listesi (Playlist) linki'),
  status: z.enum(['pending', 'completed', 'delayed']).default('pending'),
});

const DayPlanSchema = z.object({
  day: z.string().describe('Haftanın günü'),
  tasks: z.array(TaskSchema),
});

const GenerateStudyPlanInputSchema = z.object({
  targetExam: z.string().describe('Hedef Sınav (Örn: YKS_SOZ, LGS)'),
  userName: z.string(),
  lessons: z.array(z.string()),
  currentWeek: z.number().optional().default(1).describe('Akademik yılın kaçıncı haftası (1-52)'),
});

export type GenerateStudyPlanInput = z.infer<typeof GenerateStudyPlanInputSchema>;

const GenerateStudyPlanOutputSchema = z.object({
  schedule: z.array(DayPlanSchema),
  weeklyFocus: z.string().describe('Bu haftanın akademik odak noktası ve tavsiyesi'),
});
export type GenerateStudyPlanOutput = z.infer<typeof GenerateStudyPlanOutputSchema>;

const prompt = ai.definePrompt({
  name: 'generateStudyPlanPrompt',
  input: { schema: GenerateStudyPlanInputSchema },
  output: { schema: GenerateStudyPlanOutputSchema },
  config: {
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
    ]
  },
  prompt: `Sen "Dijital Eğitim Koçu" (DEK) platformunun baş akademik planlama motorusun.
  Kullanıcı: {{{userName}}}
  Hedef Sınav: {{{targetExam}}}
  Sorumlu Dersler: {{{lessons}}}
  Mevcut Hafta: {{{currentWeek}}} / 52

  Görevin: Kullanıcı için 7 günlük, 52 HAFTALIK AKADEMİK YOL HARİTASINA tam uyumlu bir program oluşturmak.
  
  **Haftalık Strateji (YKS Sözel Örneği):**
  - Hafta 1-15 (Foundation): Temel dil bilgisi, Tarih başlangıç, Paragraf hızı.
  - Hafta 16-30 (Deep Dive): Divan Edebiyatı, Osmanlı Detay, Türkiye Ekonomisi.
  - Hafta 31-45 (Advanced): Cumhuriyet Edebiyatı, Çağdaş Dünya, Sözel Mantık.
  - Hafta 46-52 (Elite): Seri deneme sınavları, Genel tekrar kampları.

  Şu an {{{currentWeek}}}. haftadayız. Lütfen bu haftanın ağırlığına ve zorluk seviyesine uygun konuları 2025 müfredatına göre seç.

  **YouTube Link Kuralı:**
  Her görev için youtubeUrl alanına, o konuyu en iyi anlatan eğitim kanalının (Benim Hocam, Rüştü Hoca, Kampüs vb.) OYNATMA LİSTESİ (Playlist) linkini ekle. Eğer spesifik playlist bilinmiyorsa şu formatta arama linki üret:
  https://www.youtube.com/results?search_query=[DERS+ADI]+[KONU+ADI]+oynatma+listesi&sp=EgIQAw%253D%253D

  **Format Kuralları:**
  - Günlük 4-6 verimli seans planla.
  - Her sabah "Paragraf / Sözel Mantık" seansı ekle.
  - Pazar gününe "Haftalık Analiz & Dinlenme" veya "Deneme" yerleştir.
  - weeklyFocus alanında bu haftanın en kritik konusunu ve stratejisini belirt.`,
});

export const generateStudyPlanFlow = ai.defineFlow(
  {
    name: 'generateStudyPlanFlow',
    inputSchema: GenerateStudyPlanInputSchema,
    outputSchema: GenerateStudyPlanOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    if (!output) throw new Error('AI plan üretemedi.');
    return output;
  }
);