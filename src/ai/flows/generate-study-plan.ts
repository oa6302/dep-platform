'use server';

/**
 * @fileOverview DEK AI - MASTER ACADEMIC PLANNER (Multi-Exam Support).
 * Yıllık, aylık ve haftalık hiyerarşiyi yöneten, bilimsel tekniklerle çalışan planlama motoru.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const TaskSchema = z.object({
  time: z.string().describe('Seansın başlangıç saati (Örn: 09:00)'),
  subject: z.string().describe('Ders adı'),
  topic: z.string().describe('Ana konu'),
  subtopic: z.string().optional().describe('Alt konu başlığı'),
  duration: z.string().describe('Seans süresi (Örn: 45 dk)'),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
  xp: z.number().describe('Kazanılacak XP (25, 50, 75)'),
  bookUrl: z.string().optional().describe('Kaynak PDF linki'),
  youtubeUrl: z.string().optional().describe('YouTube Playlist linki'),
  status: z.enum(['pending', 'completed', 'delayed']).default('pending'),
});

const DayPlanSchema = z.object({
  day: z.string().describe('Haftanın günü'),
  tasks: z.array(TaskSchema),
});

const GenerateStudyPlanInputSchema = z.object({
  targetExam: z.string().describe('Hedef Sınav (YKS, LGS, KPSS, ALES vb.)'),
  userName: z.string(),
  lessons: z.array(z.string()),
  currentWeek: z.number().optional().default(1),
  performanceData: z.any().optional().describe('Öğrencinin geçmiş performans verileri'),
});

export type GenerateStudyPlanInput = z.infer<typeof GenerateStudyPlanInputSchema>;

const GenerateStudyPlanOutputSchema = z.object({
  weeklyFocus: z.string().describe('Bu haftanın akademik stratejisi'),
  schedule: z.array(DayPlanSchema),
  recommendations: z.array(z.string()).describe('AI stratejik önerileri'),
  analysis: z.object({
    difficultyDistribution: z.string(),
    estimatedTotalXp: z.number(),
  }),
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
  # DEK AI - PROFESSIONAL ACADEMIC PLANNER

  Sen DEK AI Academic Planner isimli profesyonel akademik planlama motorusun.
  Görevin öğrencinin {{{targetExam}}} sınavı hedefine göre hiyerarşik bir haftalık plan oluşturmaktır.

  STRATEJİ:
  • Akademik Yılın {{{currentWeek}}}. haftasındayız. Bu haftanın müfredat ağırlığını buna göre belirle.
  • Spaced Repetition (Aralıklı Tekrar) mantığını kullan.
  • Eksik kazanımları önce tamamlat.
  • Zor konulardan sonra (Hard) mutlaka daha hafif (Easy/Medium) görevler planla.
  • Youtube linkleri için MUTLAKA playlist formatı kullan: https://www.youtube.com/results?search_query=[DERS]+[KONU]+oynatma+listesi&sp=EgIQAw%253D%253D

  KURALLAR:
  • Gereksiz motivasyon cümleleri kurma.
  • Sadece {{{lessons}}} listesindeki dersleri kullan.
  • XP Sistemi: Easy=25, Medium=50, Hard=75.
  • Çıktı sadece JSON formatında olmalıdır.

  Kullanıcı: {{{userName}}}
  Hedef Sınav: {{{targetExam}}}
  Ders Listesi: {{{lessons}}}
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
    if (!output) throw new Error('DEK AI stratejik plan üretemedi.');
    return output;
  }
);