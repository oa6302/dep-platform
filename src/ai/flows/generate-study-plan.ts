'use server';

/**
 * @fileOverview Kullanıcının hedef sınavına göre kişiselleştirilmiş 7 günlük çalışma planı üreten AI akışı.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const TaskSchema = z.object({
  time: z.string().describe('Seansın başlangıç saati (Örn: 09:00)'),
  subject: z.string().describe('Ders adı'),
  topic: z.string().describe('Çalışılacak güncel konu başlığı'),
  duration: z.string().describe('Seans süresi (Örn: 45 dk)'),
  bookUrl: z.string().optional().describe('İlgili ders için önerilen kaynak linki (boş bırakılabilir)'),
  youtubeUrl: z.string().optional().describe('İlgili konu için önerilen video linki (boş bırakılabilir)'),
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
});

export type GenerateStudyPlanInput = z.infer<typeof GenerateStudyPlanInputSchema>;

const GenerateStudyPlanOutputSchema = z.array(DayPlanSchema);
export type GenerateStudyPlanOutput = z.infer<typeof GenerateStudyPlanOutputSchema>;

const prompt = ai.definePrompt({
  name: 'generateStudyPlanPrompt',
  input: { schema: GenerateStudyPlanInputSchema },
  output: { schema: GenerateStudyPlanOutputSchema },
  prompt: `Sen "Dijital Eğitim Koçu" platformunun uzman yapay zeka asistanısın. 
  Kullanıcı adı: {{{userName}}}
  Hedef Sınav: {{{targetExam}}}
  Sorumlu Olduğu Dersler: {{{lessons}}}

  Görevin: Kullanıcı için 7 günlük, dolu dolu ve akademik olarak verimli bir ders çalışma programı oluşturmaktır.
  
  **YKS Sözel (YKS_SOZ) özel talimatları:**
  - Edebiyat (Eser-Yazar-Dönem), Tarih ve Coğrafya-2 derslerine ağırlık ver.
  - Her gün mutlaka "Paragraf Hız Çalışması" veya "Sözel Mantık" seansı ekle.
  - Akşamları gün sonu tekrarı ekle.
  - Konular güncel YKS müfredatına (2025-2026) uygun olmalıdır.
  
  **Format:** Her gün için en az 4 seans (task) planla. Zamanlar mantıklı bir akışta (sabah, öğle, öğleden sonra, akşam) olmalıdır.`,
});

export const generateStudyPlanFlow = ai.defineFlow(
  {
    name: 'generateStudyPlanFlow',
    inputSchema: GenerateStudyPlanInputSchema,
    outputSchema: GenerateStudyPlanOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
