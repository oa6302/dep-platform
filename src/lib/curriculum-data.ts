/**
 * @fileOverview Omni-Curriculum Verisi (ÖSYM, MEB ve YÖK Standartları)
 */

export const YKS_TM_TOPICS: Record<string, string[]> = {
  // YKS - Ortak & TM
  'TYT Türkçe': [
    'Sözcükte Anlam (Gerçek-Mecaz-Yan Anlam)', 
    'Söz Öbeklerinde Anlam (Deyimler-Atasözleri)',
    'Cümlede Anlam (Neden-Sonuç, Amaç-Sonuç, Koşul)', 
    'Cümle Yorumu (Öznel-Nesnel, Eleştiri, Yakınma)',
    'Paragrafta Ana Düşünce', 
    'Paragrafta Yardımcı Düşünceler', 
    'Paragrafta Yapı (Giriş-Gelişme-Sonuç)', 
    'Paragraf Bölme ve Akışı Bozan Cümle', 
    'Paragraf Tamamlama (Boşluk Doldurma)', 
    'Düşünceyi Geliştirme Yolları (Tanımlama, Örneklendirme vb.)', 
    'Anlatım Teknikleri (Açıklama, Tartışma vb.)',
    'Paragrafta Başlık ve Soru-Cevap Uyumu',
    'Paragrafta Karakter ve Diyalog Analizi',
    'Metinler Arası Karşılaştırma ve Mantıksal Çıkarım'
  ],
  'TYT Matematik': [
    'Temel Kavramlar', 'Sayı Basamakları', 'Bölme ve Bölünebilme', 'EBOB-EKOK', 
    'Rasyonel Sayılar', 'Basit Eşitsizlikler', 'Mutlak Değer', 'Üslü Sayılar', 
    'Köklü Sayılar', 'Çarpanlara Ayırma', 'Oran-Orantı', 'Denklem Çözme', 
    'Sayı-Kesir Problemleri', 'Yaş Problemleri', 'Yüzde-Kar-Zarar Problemleri', 
    'Karışım Problemleri', 'Hareket Problemleri', 'İşçi-Havuz Problemleri',
    'Kümeler', 'Mantık', 'Fonksiyonlar', 'Veri ve İstatistik', 'Permütasyon-Kombinasyon', 
    'Olasılık'
  ],
  'AYT Matematik': [
    'Polinomlar', 'İkinci Dereceden Denklemler', 'Karmaşık Sayılar', 'Eşitsizlikler',
    'Parabol', 'Trigonometri', 'Logaritma', 'Diziler', 'Limit', 'Türev', 'İntegral'
  ],
  'Edebiyat': [
    'Söz Sanatları', 'Şiir Bilgisi', 'İslamiyet Öncesi Türk Edebiyatı', 'Halk Edebiyatı', 
    'Divan Edebiyatı', 'Tanzimat Edebiyatı', 'Servet-i Fünun', 'Milli Edebiyat', 
    'Cumhuriyet Dönemi Şiir', 'Cumhuriyet Dönemi Roman', 'Cumhuriyet Dönemi Tiyatro'
  ],
  'Tarih': [
    'Tarih ve Zaman', 'İlk Çağ Uygarlıkları', 'İslam Tarihi', 'Türk-İslam Devletleri', 
    'Osmanlı Kuruluş ve Yükselme', 'Osmanlı Duraklama ve Gerileme', 'Osmanlı Dağılma',
    'Milli Mücadele Hazırlık', 'Kurtuluş Savaşı', 'Atatürk İlkeleri ve İnkılapları'
  ],
  'Coğrafya': [
    'Doğa ve İnsan', 'Dünya\'nın Şekli ve Hareketleri', 'Harita Bilgisi', 'Atmosfer ve İklim', 
    'İç ve Dış Kuvvetler', 'Nüfus ve Yerleşme', 'Ekonomik Faaliyetler', 'Bölgeler',
    'Türkiye\'nin Yer Şekilleri', 'Doğal Afetler'
  ],
  'Felsefe': [
    'Felsefe ile Tanışma', 'Bilgi Felsefesi (Epistemoloji)', 'Varlık Felsefesi (Ontoloji)', 
    'Ahlak Felsefesi (Etik)', 'Din Felsefesi', 'Siyaset Felsefesi', 'Bilim Felsefesi'
  ],

  // YKS - Sayısal Ek
  'Fizik': ['Vektörler', 'Kuvvet ve Hareket', 'Enerji', 'Elektrik ve Manyetizma', 'Optik', 'Modern Fizik'],
  'Kimya': ['Atom ve Periyodik Sistem', 'Kimyasal Türler', 'Sıvı Çözeltiler', 'Enerji', 'Hız', 'Organik Kimya'],
  'Biyoloji': ['Hücre', 'Kalıtım', 'Ekoloji', 'Sistemler', 'Bitki Biyolojisi'],

  // LGS Ek
  'Fen Bilimleri': ['Mevsimler ve İklim', 'DNA ve Genetik Kod', 'Basınç', 'Madde ve Endüstri', 'Işığın Kırılması'],
  'İnkılap Tarihi': ['Bir Kahraman Doğuyor', 'Milli Uyanış', 'Ya İstiklal Ya Ölüm', 'Atatürkçülük'],
  'İngilizce': ['Friendship', 'Teen Life', 'In The Kitchen', 'On The Phone', 'The Internet'],

  // KPSS & ALES Ek
  'Vatandaşlık': ['Hukukun Temel Kavramları', 'Devlet ve Hükümet', '1982 Anayasası', 'İdare Hukuku'],
  'Güncel Bilgiler': ['Kültürel Gelişmeler', 'Uluslararası Örgütler', 'Ekonomik Veriler', 'Spor ve Sanat'],
  'Matematik': ['Sayılar', 'Problemler', 'Mantıksal Akıl Yürütme', 'Tablo ve Grafik Yorumlama'],
  'Türkçe': ['Sözcük ve Cümle Anlamı', 'Paragraf Analizi', 'Sözel Mantık'],
  'Sayısal Mantık': ['Diziler', 'Şekil Yeteneği', 'Veri Analizi', 'Karmaşık Mantık Problemleri'],
  'Sözel Mantık': ['Kesin Çıkarım', 'Yerleştirme Problemleri', 'Mantıksal Çerçeveleme'],

  // Yabancı Dil
  'Gramer': ['Tenses', 'Modals', 'Passive Voice', 'Conjunctions', 'Relative Clauses'],
  'Kelime Bilgisi': ['Phrasal Verbs', 'Academic Vocabulary', 'Synonyms & Antonyms'],
  'Okuma Anlama': ['Sentence Completion', 'Paragraph Completion', 'Restatement']
};
