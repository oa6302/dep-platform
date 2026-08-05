'use server';

/**
 * @fileOverview Rol bazlı AI analiz ve öneri üretim akışı.
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
  contextData: z.any().optional(),
});
export type GenerateAiInsightsInput = z.infer<typeof GenerateAiInsightsInputSchema>;

const GenerateAiInsightsOutputSchema = z.object({
  summary: z.string().describe('Genel durum özeti.'),
  insights: z.array(InsightSchema).describe('Rol spesifik analiz ve aksiyon önerileri.'),
  nextSteps: z.array(z.string()).describe('Kullanıcının atması gereken somut adımlar.'),
});
export type GenerateAiInsightsOutput = z.infer<typeof GenerateAiInsightsOutputSchema>;

export async function generateAiInsights(input: GenerateAiInsightsInput): Promise<GenerateAiInsightsOutput> {
  return generateAiInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateAiInsightsPrompt',
  input: { schema: GenerateAiInsightsInputSchema },
  output: { schema: GenerateAiInsightsOutputSchema },
  prompt: `Sen "Dijital Eğitim Koçu" platformunun uzman yapay zeka asistanısın. 
  Kullanıcı adı: {{{userName}}}
  Rol: {{{role}}}
  Ek Veri: {{{contextData}}}

  Görevin: Kullanıcının rolüne göre derinlemesine analizler, gelecek tahminleri ve somut aksiyon planları oluşturmaktır.

  **Rol bazlı odak noktaların:**
  - **student (Öğrenci):** Günlük çalışma planı, eksik konu analizi, YKS/LGS başarı ve net tahmini, motivasyon desteği, çalışma süresi analizi.
  - **teacher (Öğretmen):** Öğrenci bazlı risk analizi (net düşüşü vb.), başarı tahminleri, kazanım eksikleri haritası, ders ve otomatik ödev önerileri.
  - **school_admin (Okul Yönetimi):** Şube bazlı başarı analizi, öğretmen performans metrikleri, kurumsal risk raporu ve stratejik gelişim önerileri.
  - **admin (Sistem Yöneticisi):** Sistem kullanım trendleri, sunucu yük tahminleri, kullanıcı davranış analizi ve performans optimizasyon raporları.

  Lütfen çıktıları profesyonel, yapıcı ve aksiyon odaklı bir dille oluştur. "action_plan" tipli insight'larda mutlaka somut bir adım belirt.`,
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
