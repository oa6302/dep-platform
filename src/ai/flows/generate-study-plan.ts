'use server';

/**
 * @fileOverview Kullanıcının hedef sınavına ve yılın hangi haftasında olduğuna göre 
 * kişiselleştirilmiş 7 günlük çalışma planı üreten AI akışı.
 * YouTube linklerini artık ilgili konunun oynatma listesi (playlist) olarak üretir.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const TaskSchema = z.object({
  time: z.string().describe('Seansın başlangıç saati (Örn: 09:00)'),
  subject: z.string().describe('Ders adı'),
  topic: z.string().describe('Çalışılacak güncel konu başlığı'),
  duration: z.string().describe('Seans süresi (Örn: 45 dk)'),
  bookUrl: z.string().optional().describe('İlgili ders için önerilen kaynak linki (boş bırakılabilir)'),
  youtubeUrl: z.string().optional().describe('İlgili konu için en uygun YouTube OYNATMA LİSTESİ (Playlist) linki veya arama linki'),
  status: z.enum(['pending', 'completed', 'delayed']).default('pending'),
});

const DayPlanSchema = z.object({
  day: z.string().describe('Haftanın günü'),
  tasks: z.array(TaskSchema),
});

const GenerateStudyPlanInputSchema = z.object({
  targetExam: z.string().describe('Hedef Sınav (Örn: YKS_SOZ, LGS, YKS_SAY)'),
  userName: z.string(),
  lessons: z.array(z.string()).describe('Kullanıcının sorumlu olduğu dersler'),
  currentWeek: z.number().optional().default(1).describe('Akademik takvimin kaçıncı haftasında olduğu (1-52)'),
});

export type GenerateStudyPlanInput = z.infer<typeof GenerateStudyPlanInputSchema>;

const GenerateStudyPlanOutputSchema = z.object({
  schedule: z.array(DayPlanSchema)
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
  prompt: `Sen "Dijital Eğitim Koçu" platformunun uzman yapay zeka asistanısın. 
  Kullanıcı adı: {{{userName}}}
  Hedef Sınav: {{{targetExam}}}
  Sorumlu Olduğu Dersler: {{{lessons}}}
  Mevcut Hafta: {{{currentWeek}}} / 52

  Görevin: Kullanıcı için 7 günlük (Pazartesi'den Pazar'a), 52 HAFTALIK YOL HARİTASINA uygun, akademik olarak en verimli ve GÜNCEL MÜFREDAT odaklı bir ders çalışma programı oluşturmaktır.
  
  **ÖNEMLİ: YouTube Linkleri Hakkında:**
  Her görev için youtubeUrl alanına, o konuyu anlatan popüler eğitim kanallarının (Örn: Benim Hocam, Rüştü Hoca, Hocalara Geldik) ilgili konu OYNATMA LİSTESİ (Playlist) linkini ekle. Eğer spesifik playlist linkini bilmiyorsan, şu formatta bir YouTube arama linki oluştur: 
  https://www.youtube.com/results?search_query=[DERS+ADI]+[KONU+ADI]+oynatma+listesi&sp=EgIQAw%253D%253D (sp parametresi oynatma listesi filtresidir).

  **YKS Sözel 1 Yıllık Planlama Stratejisi:**
  - **Hafta 1-12 (Temel):** Temel kavramlar, Paragraf hızı ve Tarih başlangıç konuları.
  - **Hafta 13-24 (Detay):** Divan Edebiyatı, Osmanlı Tarihi, İklim ve Yerleşme detayları.
  - **Hafta 25-36 (İleri):** Cumhuriyet Edebiyatı, Çağdaş Dünya Tarihi, Mantık konuları.
  - **Hafta 37-52 (Final):** Sürekli deneme, karma testler ve yoğun tekrar.

  Şu an {{{currentWeek}}}. haftadayız. Lütfen bu haftanın ağırlığına uygun konular seç.
  
  **Özel Seanslar:**
  - Her sabah mutlaka "Paragraf Hız ve Anlam" seansı ekle.
  - Hafta sonuna (Pazar) mutlaka "Genel Deneme" seansı yerleştir.
  
  **Format Kuralları:** 
  - Günlük en az 4, en fazla 6 seans planla.
  - Konular spesifik, güncel ve YKS 2025 müfredatına uygun olmalıdır.
  - Sadece geçerli bir JSON objesi döndür.`,
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
