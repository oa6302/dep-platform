'use server';

/**
 * @fileOverview DEK AI - Veri Odaklı Analiz ve Strateji Motoru.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const InsightSchema = z.object({
  type: z.enum(['prediction', 'suggestion', 'analysis', 'action_plan', 'motivation', 'risk']),
  title: z.string(),
  description: z.string(),
  actionLabel: z.string().optional(),
  priority: z.enum(['high', 'medium', 'low']),
});

const GenerateAiInsightsInputSchema = z.object({
  role: z.enum(['student', 'teacher', 'school_admin', 'admin']),
  userName: z.string(),
  targetExam: z.string().optional(),
  contextData: z.any().optional(),
});
export type GenerateAiInsightsInput = z.infer<typeof GenerateAiInsightsInputSchema>;

const GenerateAiInsightsOutputSchema = z.object({
  summary: z.string().describe('Profesyonel durum özeti.'),
  insights: z.array(InsightSchema).describe('Veri odaklı analizler.'),
  nextSteps: z.array(z.string()).describe('Somut ve uygulanabilir adımlar.'),
});
export type GenerateAiInsightsOutput = z.infer<typeof GenerateAiInsightsOutputSchema>;

export async function generateAiInsights(input: GenerateAiInsightsInput): Promise<GenerateAiInsightsOutput> {
  return generateAiInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateAiInsightsPrompt',
  input: { schema: GenerateAiInsightsInputSchema },
  output: { schema: GenerateAiInsightsOutputSchema },
  prompt: `
  --- SYSTEM PROMPT (ANA BEYİN) ---
  Sen DEK AI isimli profesyonel akademik koçsun. Görevin öğrenciyi YKS hedeflerine ulaştırmaktır.
  TEMEL PRENSİPLERİN:
  • Bilimsel çalışma teknikleri kullan.
  • Öğrenciyi gereksiz motive etmeye çalışma; verilere odaklan.
  • Her öneri öğrencinin performansına göre değişsin.
  • Net artırmayı önceliklendir. Eksik kazanımları önce tamamlat.
  • YKS müfredatı dışına çıkma. Cevapların kısa, profesyonel ve uygulanabilir olsun.
  • Asla rastgele öneri yapma. Her karar veriye dayalı olsun.

  Görevin: {{{userName}}} için (Rol: {{{role}}}, Hedef: {{{targetExam}}}) mevcut verileri analiz ederek profesyonel bir strateji raporu oluşturmaktır.
  Veri: {{{contextData}}}

  Çıktı Formatı: JSON. Yapıcı ama doğrudan, profesyonel ve net odaklı bir dil kullan.
  `,
});

const generateAiInsightsFlow = ai.defineFlow(
  {
    name: 'generateAiInsightsFlow',
    inputSchema: GenerateAiInsightsInputSchema,
    outputSchema: GenerateAiInsightsOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);