'use server';

/**
 * @fileOverview DEK AI - MASTER ACADEMIC AI SYSTEM (Multi-Exam Support).
 * Tüm sınav türlerini (YKS, LGS, KPSS, ALES, DGS, YDS vb.) destekleyen evrensel planlama motoru.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const TaskSchema = z.object({
  time: z.string().describe('Seansın başlangıç saati (Örn: 09:00)'),
  subject: z.string().describe('Ders adı (İlgili sınavın ders listesinden seçilmeli)'),
  topic: z.string().describe('Çalışılacak spesifik konu'),
  duration: z.string().describe('Seans süresi (Örn: 45 dk)'),
  bookUrl: z.string().optional().describe('Kaynak PDF veya kitap linki'),
  youtubeUrl: z.string().optional().describe('YouTube Oynatma Listesi linki'),
  status: z.enum(['pending', 'completed', 'delayed']).default('pending'),
  xp: z.number().optional().describe('Tahmini XP kazancı (25-150)'),
});

const DayPlanSchema = z.object({
  day: z.string().describe('Haftanın günü'),
  tasks: z.array(TaskSchema),
});

const GenerateStudyPlanInputSchema = z.object({
  targetExam: z.string().describe('Hedef Sınav (Örn: YKS_SAY, KPSS_LISANS, ALES, YDS)'),
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
  prompt: `
  # DEK AI MASTER SYSTEM

  Sen DEK AI isimli profesyonel akademik planlama ve öğrenme asistanısın.
  Amacın, öğrencinin hazırlandığı sınava ({{{targetExam}}}) göre tamamen kişiselleştirilmiş çalışma sistemi oluşturmaktır.

  Kullanıcı: {{{userName}}}
  Hedef Sınav: {{{targetExam}}}
  Ders Listesi: {{{lessons}}}
  Akademik Hafta: {{{currentWeek}}}/52

  PLANLAMA PRENSİPLERİ:
  • Bilimsel öğrenme teknikleri kullan (Pomodoro, Aktif Hatırlatma).
  • Önce eksik kazanımları tamamlat.
  • Haftalık ders dağılımını dengeli oluştur.
  • Dersleri ve konuları MUTLAKA {{{lessons}}} listesine ve resmi müfredata uygun seç.
  • Youtube linki için playlist formatı kullan: https://www.youtube.com/results?search_query=[DERS]+[KONU]+oynatma+listesi&sp=EgIQAw%253D%253D

  XP SİSTEMİ:
  - Kolay: 25 XP, Orta: 50 XP, Zor: 75 XP, Deneme: 150 XP.

  YAPAY ZEKA KURALLARI:
  • Gereksiz motivasyon cümleleri kurma; profesyonel ve veri odaklı ol.
  • Haftalık yükü akademik takvime (Hafta {{{currentWeek}}}) göre ayarla.
  • Çıktı sadece JSON formatında olmalıdır.
  `,
});

export const generateStudyPlanFlow = ai.defineFlow(
  {
    name: 'generateStudyPlanFlow',
    inputSchema: GenerateStudyPlanInputSchema,
    outputSchema: GenerateStudyPlanOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    if (!output) throw new Error('DEK AI plan üretemedi.');
    return output;
  }
);