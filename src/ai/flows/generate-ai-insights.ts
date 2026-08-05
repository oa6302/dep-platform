
'use server';

/**
 * @fileOverview Rol ve Sınav bazlı AI analiz ve öneri üretim akışı.
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
  targetExam: z.string().optional().describe('Kullanıcının hazırlandığı sınav (LGS, YKS, KPSS, Dil vb.)'),
  contextData: z.any().optional(),
});
export type GenerateAiInsightsInput = z.infer<typeof GenerateAiInsightsInputSchema>;

const GenerateAiInsightsOutputSchema = z.object({
  summary: z.string().describe('Genel durum özeti.'),
  insights: z.array(InsightSchema).describe('Rol ve sınava spesifik analiz ve aksiyon önerileri.'),
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
  Hedef Sınav: {{{targetExam}}}
  Ek Veri: {{{contextData}}}

  Görevin: Kullanıcının rolüne VE hazırlandığı sınava göre derinlemesine analizler, gelecek tahminleri ve somut aksiyon planları oluşturmaktır.

  **Sınav Bazlı Odak Noktaların:**
  - **LGS:** Kazanım odaklı analiz, temel derslerin (Matematik, Fen) güçlendirilmesi, okul başarı puanı etkisi.
  - **YKS:** Net artışı, TYT/AYT dengesi, sıralama tahmini, tercih robotu uyumluluğu, zaman yönetimi.
  - **KPSS:** Atama tahminleri, genel kültür-genel yetenek dengesi, alan bilgisi (ÖABT) eksikleri.
  - **DİL:** CEFR seviye tahmini, kelime dağarcığı, okuma ve dinleme yetkinliği gelişimi.
  - **HAFIZLIK:** Unutma riski analizi, tekrar periyotları, günlük sayfa ezber performansı.

  **Rol bazlı odak noktaların:**
  - **student (Öğrenci):** Günlük çalışma planı, eksik konu analizi, başarı tahmini, motivasyon.
  - **teacher (Öğretmen):** Öğrenci bazlı risk analizi, başarı tahminleri, kazanım eksikleri haritası.
  - **school_admin (Okul Yönetimi):** Şube bazlı başarı analizi, öğretmen performans metrikleri.
  - **admin (Sistem Yöneticisi):** Sistem kullanım trendleri, performans optimizasyon raporları.

  Lütfen çıktıları profesyonel, yapıcı ve aksiyon odaklı bir dille oluştur.`,
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
