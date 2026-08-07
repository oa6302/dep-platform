'use server';

/**
 * @fileOverview Kullanıcının hedef sınavına ve akademik haftasına göre 
 * 52 haftalık roadmap uyumlu, playlist destekli kişiselleştirilmiş plan üretir.
 * YKS Sayısal, Sözel ve Eşit Ağırlık müfredatını tam kapsar.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const TaskSchema = z.object({
  time: z.string().describe('Seansın başlangıç saati (Örn: 09:00)'),
  subject: z.string().describe('Ders adı (DERS LİSTESİNDEN SEÇİLMELİ)'),
  topic: z.string().describe('Çalışılacak spesifik konu (KONU HAVUZUNDAN SEÇİLMELİ)'),
  duration: z.string().describe('Seans süresi (Örn: 45 dk)'),
  bookUrl: z.string().optional().describe('Kaynak PDF veya kitap linki'),
  youtubeUrl: z.string().optional().describe('YouTube Oynatma Listesi (Playlist) linki'),
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
  prompt: `Sen profesyonel bir YKS akademik koçusun. 
  Görevin öğrenci için 7 günlük kişiselleştirilmiş bir çalışma planı oluşturmaktır.

  Kullanıcı: {{{userName}}}
  Hedef Sınav Modu: {{{targetExam}}}
  Sorumlu Dersler: {{{lessons}}}
  Mevcut Akademik Hafta: {{{currentWeek}}} / 52 (2025-2026 Eğitim Yılı)

  KURALLAR:
  - Süre varsayılan olarak 45 dakikadır.
  - Ders ve konuları MUTLAKA aşağıdaki listelerden seç.
  - Seansları günün verimli saatlerine (09:00 - 22:00) dağıt.
  - Her sabah "Paragraf / Sözel Mantık" veya "Problem" seansı ekle.
  - Haftalık 4-6 seans planla.

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

  YOUTUBE PLAYLIST KURALI:
  Her görev için youtubeUrl alanına, o konuyu anlatan popüler bir kanalın (Benim Hocam, Kampüs, Rüştü Hoca vb.) OYNATMA LİSTESİ arama linkini şu formatta ekle:
  https://www.youtube.com/results?search_query=[DERS+ADI]+[KONU+ADI]+oynatma+listesi&sp=EgIQAw%253D%253D

  JSON formatında çıktı ver.`,
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