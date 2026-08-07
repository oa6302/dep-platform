'use server';

/**
 * @fileOverview Kullanıcının hedef sınavına göre kişiselleştirilmiş 7 günlük çalışma planı üreten AI akışı.
 * Güncel YKS 2025-2026 Sözel müfredatını (Edebiyat, Tarih, Coğrafya, Felsefe) temel alır.
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

  Görevin: Kullanıcı için 7 günlük, akademik olarak en verimli ve GÜNCEL MÜFREDAT odaklı bir ders çalışma programı oluşturmaktır.
  
  **YKS Sözel (YKS_SOZ) 2025-2026 Müfredat Talimatları:**
  - **Edebiyat:** Cumhuriyet Dönemi (Şiir, Roman, Tiyatro), Divan Edebiyatı (Sanatçılar ve Akımlar), Halk Edebiyatı, Batı Akımları ve Söz Sanatları konularına ağırlık ver.
  - **Tarih:** İnkılap Tarihi ve Atatürkçülük, Çağdaş Türk ve Dünya Tarihi, Osmanlı Dağılma Dönemi ve 20. Yüzyıl Başlarında Dünya konularını plana yay.
  - **Coğrafya-2:** Türkiye Ekonomisi, Küresel Ortam ve Ülkeler, Çevre ve Toplum, Ekosistem ve Madde Döngüsü konularına odaklan.
  - **Felsefe Grubu:** Psikoloji (Öğrenme, Bellek), Sosyoloji (Toplumsal Yapı), Mantık (Sembolik Mantık) ve Felsefe Tarihi seansları ekle.
  
  **Özel Seanslar:**
  - Her sabah mutlaka "Paragraf Hız ve Anlam" veya "Sözel Mantık Muhakeme" seansı ekle (30-45 dk).
  - Hafta sonuna (Pazar) mutlaka "Sözel Genel Deneme" ve "Deneme Analizi" seansı yerleştir.
  - Her akşam için 30 dakikalık "Günün Özeti ve Eser-Yazar Tekrarı" ekle.
  
  **Format:** 
  - Her gün için mantıklı bir akışta (sabah, öğle, öğleden sonra, akşam) en az 4, en fazla 6 seans (task) planla.
  - Konular güncel 2025 müfredatına uygun ve spesifik olmalıdır (Örn: "Cumhuriyet Dönemi Saf Şiir" yerine sadece "Edebiyat" yazma).`,
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
