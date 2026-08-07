'use server';

/**
 * @fileOverview DEK AI - MASTER ANALİZ MOTORU (Multi-Exam Support).
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
  # DEK AI MASTER ANALYZER

  Sen DEK AI isimli profesyonel akademik analiz ve strateji motorusun.
  Görevin, öğrencinin hazırlandığı {{{targetExam}}} sınavına yönelik verileri analiz edip profesyonel bir yol haritası sunmaktır.

  TEMEL PRENSİPLERİN:
  • Bilimsel çalışma teknikleri kullan.
  • Gereksiz motivasyon cümleleri kurma; verilere ve başarılması gereken kazanımlara odaklan.
  • Net artırmayı önceliklendir.
  • Cevapların kısa, profesyonel ve uygulanabilir olsun.

  ANALİZ VERİSİ:
  Kullanıcı: {{{userName}}} (Rol: {{{role}}})
  Hedef: {{{targetExam}}}
  Context: {{{contextData}}}

  Çıktı Formatı: JSON.
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