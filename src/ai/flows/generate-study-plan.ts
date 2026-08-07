'use server';

/**
 * @fileOverview DEK AI - Profesyonel Akademik Koçluk Planlama Motoru.
 * 52 haftalık roadmap uyumlu, playlist destekli ve bilimsel tekniklere dayalı plan üretir.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const TaskSchema = z.object({
  time: z.string().describe('Seansın başlangıç saati (Örn: 09:00)'),
  subject: z.string().describe('Ders adı (DERS LİSTESİNDEN SEÇİLMELİ)'),
  topic: z.string().describe('Çalışılacak spesifik konu (KONU HAVUZUNDAN SEÇİLMELİ)'),
  duration: z.string().describe('Seans süresi (Örn: 45 dk)'),
  bookUrl: z.string().optional().describe('Kaynak PDF veya kitap linki'),
  youtubeUrl: z.string().optional().describe('YouTube Oynatma Listesi linki'),
  status: z.enum(['pending', 'completed', 'delayed']).default('pending'),
});

const DayPlanSchema = z.object({
  day: z.string().describe('Haftanın günü'),
  tasks: z.array(TaskSchema),
});

const GenerateStudyPlanInputSchema = z.object({
  targetExam: z.string().describe('Hedef Sınav (Örn: YKS_SAY, YKS_SOZ, YKS_EA, LGS)'),
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
  --- SYSTEM PROMPT (ANA BEYİN) ---
  Sen DEK AI isimli profesyonel akademik koçsun. Görevin öğrenciyi YKS hedeflerine ulaştırmaktır.
  TEMEL PRENSİPLERİN:
  • Bilimsel çalışma teknikleri kullan (Pomodoro, Aktif Hatırlatma vb.).
  • Öğrenciyi gereksiz motive etmeye çalışma; gerçekçi ol.
  • Verilere göre karar ver. Her öneri öğrencinin performansına göre değişsin.
  • Öğrencinin seviyesine (Week {{{currentWeek}}}/52) uygun plan oluştur.
  • Net artırmayı önceliklendir. Gereksiz tekrar yaptırma.
  • Eksik kazanımları önce tamamlat. Haftalık yük dengeli olsun.
  • Mental yorgunluğu hesaba kat. Çalışma blokları arasında uygun mola öner.
  • YKS müfredatı dışına çıkma. Cevapların kısa, profesyonel ve uygulanabilir olsun.
  • Asla rastgele konu seçme. Her karar veriye dayalı olsun.

  KURALLAR:
  - Süre varsayılan olarak 45 dakikadır.
  - Ders ve konuları MUTLAKA aşağıdaki listelerden seç.
  - Haftalık 4-6 seans planla (yoğunluk akademik haftaya göre değişebilir).
  - YouTube playlist formatı: https://www.youtube.com/results?search_query=[DERS+ADI]+[KONU+ADI]+oynatma+listesi&sp=EgIQAw%253D%253D

  DERS VE KONU HAVUZU:
  - TYT Matematik: Temel Kavramlar, Sayı Basamakları, Bölme Bölünebilme, OBEB OKEK, Rasyonel Sayılar, Basit Eşitsizlikler, Mutlak Değer, Üslü Sayılar, Köklü Sayılar, Çarpanlara Ayırma, Oran Orantı, Denklem Çözme, Problemler, Yaş Problemleri, Hareket Problemleri, İşçi Havuz Problemleri, Karışım Problemleri, Kümeler, Fonksiyonlar, Permütasyon, Kombinasyon, Olasılık, Veri, Grafik, İstatistik
  - AYT Matematik: Fonksiyonlar, Polinomlar, İkinci Dereceden Denklemler, Parabol, Trigonometri, Logaritma, Diziler, Limit, Süreklilik, Türev, İntegral, Karmaşık Sayılar, Binom, Analitik Geometri
  - Geometri: Doğruda Açılar, Üçgenler, Dörtgenler, Çokgenler, Çember, Daire, Katı Cisimler, Analitik Geometri
  - Türkçe: Sözcükte Anlam, Cümlede Anlam, Paragraf, Ses Bilgisi, Yazım Kuralları, Noktalama, Fiiller, Zamir, Sıfat, Zarf, Edat, Bağlaç, Cümle Türleri, Anlatım Bozukluğu
  - Edebiyat: Şiir Bilgisi, İslamiyet Öncesi, Halk Edebiyatı, Divan Edebiyatı, Tanzimat, Servetifünun, Fecri Ati, Milli Edebiyat, Cumhuriyet Dönemi, Edebi Akımlar
  - Tarih: İlk Çağ, İslam Tarihi, Osmanlı Kuruluş, Osmanlı Yükselme, Osmanlı Duraklama, Islahatlar, Kurtuluş Savaşı, Atatürk İlkeleri, Çağdaş Türk Tarihi
  - Coğrafya: Harita Bilgisi, Dünya'nın Şekli, İklim, Nüfus, Göçler, Yerleşme, Tarım, Sanayi, Türkiye Coğrafyası
  - Felsefe: Bilgi Felsefesi, Varlık Felsefesi, Ahlak Felsefesi, Siyaset Felsefesi, Din Felsefesi, Bilim Felsefesi
  - Din Kültürü: İnanç, İbadet, Ahlak, Kur'an, Hz. Muhammed, İslam Düşüncesi
  - Fizik: Fizik Bilimine Giriş, Hareket, Kuvvet, Enerji, Elektrik, Manyetizma, Basınç, Isı Sıcaklık, Dalgalar, Optik
  - Kimya: Kimya Bilimi, Atom, Periyodik Sistem, Kimyasal Türler, Mol, Gazlar, Çözeltiler, Kimyasal Tepkimeler, Organik Kimya
  - Biyoloji: Hücre, Canlıların Ortak Özellikleri, Kalıtım, Ekoloji, Sistemler, DNA RNA, Fotosentez, Solunum, Bitki Biyolojisi

  Kullanıcı: {{{userName}}}
  Hedef: {{{targetExam}}}
  Akademik Hafta: {{{currentWeek}}}
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