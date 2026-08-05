
import { 
  Target, GraduationCap, BookOpen, Globe, Languages, 
  Brain, Scale, Library, Building, UserCheck, 
  Pencil, PlusCircle, BookMarked, School, ScrollText,
  Search, MessageSquare, LineChart, ClipboardCheck,
  Calendar, Award, Library as LibraryIcon, Cpu,
  Bookmark, Mic, Headphones, PenTool, BookOpenCheck,
  TrendingUp, RefreshCw, Sun, FileText, PencilLine
} from 'lucide-react';

export type ExamModule = {
  title: string;
  icon: any;
  color: string;
  desc: string;
};

export type ExamType = {
  id: string;
  category: 'ORTAOKUL' | 'ÜNİVERSİTE' | 'KAMU' | 'ÜNİVERSİTE GEÇİŞ' | 'DİL' | 'DİNÎ' | 'AKADEMİK' | 'ÖZEL';
  title: string;
  icon: any;
  description: string;
  targetGroup: string;
  lessons: string[];
  modules: ExamModule[];
  aiFocus: string;
};

export const EXAM_CONFIGS: Record<string, ExamType> = {
  // ORTAOKUL
  LGS: {
    id: 'LGS',
    category: 'ORTAOKUL',
    title: 'LGS',
    icon: Target,
    description: 'Liselere Geçiş Sistemi Hazırlığı',
    targetGroup: '8. Sınıf Öğrencileri',
    lessons: ['Türkçe', 'Matematik', 'Fen Bilimleri', 'İnkılap Tarihi', 'Din Kültürü', 'İngilizce'],
    modules: [
      { title: "Dersler", icon: BookOpen, color: "bg-blue-500", desc: "LGS müfredatı takibi" },
      { title: "Denemeler", icon: ClipboardCheck, color: "bg-orange-500", desc: "LGS deneme sonuçları" },
      { title: "Konu Analizi", icon: LineChart, color: "bg-purple-500", desc: "Kazanım başarı haritası" },
      { title: "AI Koç", icon: Brain, color: "bg-indigo-500", desc: "Kazanım odaklı analiz" },
      { title: "Hedefler", icon: Target, color: "bg-red-500", desc: "Lise hedef yönetimi" },
      { title: "Kütüphane", icon: LibraryIcon, color: "bg-cyan-500", desc: "LGS soru bankaları" },
    ],
    aiFocus: 'Kazanım eksikliklerini tespit et ve temel akademik yetkinliği artır.'
  },

  // ÜNİVERSİTE
  TYT: {
    id: 'TYT',
    category: 'ÜNİVERSİTE',
    title: 'TYT',
    icon: PencilLine,
    description: 'Temel Yeterlilik Testi',
    targetGroup: '12. Sınıf ve Mezunlar',
    lessons: ['Türkçe', 'Sosyal Bilimler', 'Temel Matematik', 'Fen Bilimleri'],
    modules: [
      { title: "Ders Takibi", icon: BookOpen, color: "bg-blue-500", desc: "TYT konuları" },
      { title: "Net Analizi", icon: TrendingUp, color: "bg-orange-500", desc: "Gelişim grafiği" },
      { title: "AI Koç", icon: Brain, color: "bg-indigo-500", desc: "Hız ve doğruluk analizi" },
    ],
    aiFocus: 'Temel derslerdeki hızını ve soru çözme pratiğini artırmaya odaklan.'
  },
  AYT: {
    id: 'AYT',
    category: 'ÜNİVERSİTE',
    title: 'AYT',
    icon: BookOpenCheck,
    description: 'Alan Yeterlilik Testleri',
    targetGroup: '12. Sınıf ve Mezunlar',
    lessons: ['Edebiyat', 'Matematik-2', 'Fizik', 'Kimya', 'Biyoloji', 'Tarih-Coğrafya'],
    modules: [
      { title: "Alan Paneli", icon: GraduationCap, color: "bg-emerald-500", desc: "Alan dersleri" },
      { title: "Derin Analiz", icon: LineChart, color: "bg-purple-500", desc: "Konu uzmanlığı" },
      { title: "AI Koç", icon: Brain, color: "bg-indigo-500", desc: "Akademik derinlik analizi" },
    ],
    aiFocus: 'Seçtiğin alandaki konu derinliğini ve başarı oranını yükselt.'
  },
  YKS: {
    id: 'YKS',
    category: 'ÜNİVERSİTE',
    title: 'YKS (TYT + AYT)',
    icon: GraduationCap,
    description: 'Yükseköğretim Kurumları Sınavı',
    targetGroup: '12. Sınıf ve Mezunlar',
    lessons: ['TYT Türkçe', 'TYT Matematik', 'AYT Matematik', 'AYT Edebiyat', 'AYT Fen'],
    modules: [
      { title: "TYT Paneli", icon: BookOpen, color: "bg-blue-500", desc: "TYT dersleri ve netler" },
      { title: "AYT Paneli", icon: BookOpenCheck, color: "bg-emerald-500", desc: "AYT alan takibi" },
      { title: "Net Analizi", icon: TrendingUp, color: "bg-orange-500", desc: "Sıralama ve net artışı" },
      { title: "Tercih Robotu", icon: Search, color: "bg-purple-500", desc: "Hedef üniversite uyumu" },
      { title: "AI Koç", icon: Brain, color: "bg-indigo-500", desc: "Başarı ve sıralama tahmini" },
    ],
    aiFocus: 'Net artış trendlerini izle, sıralama tahmini yap ve üniversite hedeflerine göre yönlendir.'
  },
  YDT: {
    id: 'YDT',
    category: 'ÜNİVERSİTE',
    title: 'YDT',
    icon: Globe,
    description: 'Yabancı Dil Testi',
    targetGroup: 'Dil Alanı Öğrencileri',
    lessons: ['Kelime', 'Gramer', 'Okuma', 'Çeviri'],
    modules: [
      { title: "Dil Paneli", icon: Languages, color: "bg-blue-500", desc: "Yabancı dil gelişimi" },
      { title: "Denemeler", icon: ClipboardCheck, color: "bg-orange-500", desc: "YDT denemeleri" },
    ],
    aiFocus: 'Yabancı dil yeterliliğini ve test tekniğini geliştir.'
  },

  // KAMU
  KPSS: {
    id: 'KPSS',
    category: 'KAMU',
    title: 'KPSS',
    icon: UserCheck,
    description: 'Kamu Personeli Seçme Sınavı',
    targetGroup: 'Memur Adayları',
    lessons: ['Genel Yetenek', 'Genel Kültür', 'Eğitim Bilimleri', 'ÖABT'],
    modules: [
      { title: "Genel Yetenek", icon: Brain, color: "bg-blue-500", desc: "Türkçe ve Matematik takibi" },
      { title: "Genel Kültür", icon: Globe, color: "bg-emerald-500", desc: "Tarih, Coğrafya ve Güncel" },
      { title: "Alan Bilgisi", icon: BookMarked, color: "bg-orange-500", desc: "ÖABT ve Eğitim Bilimleri" },
      { title: "Atama Tahmini", icon: Target, color: "bg-purple-500", desc: "Puan türü bazlı analiz" },
      { title: "AI Koç", icon: Brain, color: "bg-indigo-500", desc: "Atama olasılığı raporu" },
    ],
    aiFocus: 'Puan türlerine göre atama olasılığını hesapla ve alan eksikliklerine odaklan.'
  },
  AGS: {
    id: 'AGS',
    category: 'KAMU',
    title: 'AGS',
    icon: Scale,
    description: 'Adli Yargı Sınavları',
    targetGroup: 'Hukuk Mezunları',
    lessons: ['Anayasa', 'Medeni Hukuk', 'Ceza Hukuku', 'İdare Hukuku'],
    modules: [
      { title: "Hukuk Paneli", icon: BookOpen, color: "bg-blue-800", desc: "Mevzuat takibi" },
      { title: "AI Mentor", icon: Brain, color: "bg-indigo-500", desc: "Vaka analizleri" },
    ],
    aiFocus: 'Hukuki mevzuat hakimiyetini ve soru analiz yeteneğini ölç.'
  },
  ALES: {
    id: 'ALES',
    category: 'KAMU',
    title: 'ALES',
    icon: FileText,
    description: 'Akademik Personel ve Lisansüstü Eğitimi Giriş Sınavı',
    targetGroup: 'Akademisyen Adayları',
    lessons: ['Sayısal', 'Sözel'],
    modules: [
      { title: "Mantık Paneli", icon: Brain, color: "bg-slate-500", desc: "Sözel ve Sayısal Mantık" },
      { title: "Puan Analizi", icon: TrendingUp, color: "bg-orange-500", desc: "Standart sapma takibi" },
    ],
    aiFocus: 'Mantıksal muhakeme ve problem çözme hızını analiz et.'
  },

  // ÜNİVERSİTE GEÇİŞ
  DGS: {
    id: 'DGS',
    category: 'ÜNİVERSİTE GEÇİŞ',
    title: 'DGS',
    icon: TrendingUp,
    description: 'Dikey Geçiş Sınavı',
    targetGroup: 'Önlisans Mezunları',
    lessons: ['Sayısal', 'Sözel'],
    modules: [
      { title: "Geçiş Paneli", icon: GraduationCap, color: "bg-blue-600", desc: "Lisans geçiş takibi" },
      { title: "AI Koç", icon: Brain, color: "bg-indigo-500", desc: "Yerleşme tahmini" },
    ],
    aiFocus: 'Önlisans puanı ile DGS performansını birleştirerek analiz yap.'
  },
  YOS: {
    id: 'YOS',
    category: 'ÜNİVERSİTE GEÇİŞ',
    title: 'YÖS',
    icon: Globe,
    description: 'Yabancı Uyruklu Öğrenci Sınavı',
    targetGroup: 'Uluslararası Öğrenciler',
    lessons: ['IQ', 'Matematik', 'Geometri'],
    modules: [
      { title: "Global Panel", icon: Globe, color: "bg-emerald-600", desc: "Üniversite kabul takip" },
      { title: "IQ Analizi", icon: Brain, color: "bg-purple-500", desc: "Zeka soruları takibi" },
    ],
    aiFocus: 'IQ ve matematik sorularındaki başarı oranını global ölçekte değerlendir.'
  },

  // DİL
  DIL: {
    id: 'DIL',
    category: 'DİL',
    title: 'Dil Eğitimi',
    icon: Globe,
    description: 'Genel Dil Eğitimi ve Gelişimi',
    targetGroup: 'Dil Öğrencileri',
    lessons: ['Grammar', 'Vocabulary', 'Reading', 'Listening', 'Speaking'],
    modules: [
      { title: "Vocabulary", icon: Bookmark, color: "bg-blue-500", desc: "Kelime dağarcığı geliştirme" },
      { title: "Grammar", icon: PenTool, color: "bg-emerald-500", desc: "Dil bilgisi kuralları" },
      { title: "Listening", icon: Headphones, color: "bg-orange-500", desc: "Dinleme ve anlama" },
      { title: "Speaking", icon: Mic, color: "bg-purple-500", desc: "Konuşma ve telaffuz" },
      { title: "AI Mentor", icon: Cpu, color: "bg-indigo-500", desc: "CEFR seviye analizi" },
    ],
    aiFocus: 'Konuşma ve anlama yetkinliğini CEFR standartlarına göre değerlendir.'
  },
  YDS: {
    id: 'YDS',
    category: 'DİL',
    title: 'YDS / e-YDS',
    icon: Languages,
    description: 'Yabancı Dil Bilgisi Seviye Tespit Sınavı',
    targetGroup: 'Kamu ve Akademik Adaylar',
    lessons: ['Reading', 'Vocabulary', 'Grammar', 'Cloze Test'],
    modules: [
      { title: "Sınav Paneli", icon: ScrollText, color: "bg-blue-700", desc: "Test teknikleri" },
      { title: "Puan Analizi", icon: Target, color: "bg-red-500", desc: "Hedef puan takibi" },
    ],
    aiFocus: 'Akademik kelime bilgisi ve okuma-anlama hızını analiz et.'
  },
  TOEFL: {
    id: 'TOEFL',
    category: 'DİL',
    title: 'TOEFL',
    icon: Mic,
    description: 'Test of English as a Foreign Language',
    targetGroup: 'Yurtdışı Eğitim Adayları',
    lessons: ['Reading', 'Listening', 'Speaking', 'Writing'],
    modules: [
      { title: "IBT Panel", icon: Cpu, color: "bg-indigo-600", desc: "Dört beceri takibi" },
      { title: "AI Feedback", icon: Brain, color: "bg-accent", desc: "Writing ve Speaking analizi" },
    ],
    aiFocus: 'Konuşma ve yazma becerilerini TOEFL skorlama kriterlerine göre analiz et.'
  },
  IELTS: {
    id: 'IELTS',
    category: 'DİL',
    title: 'IELTS',
    icon: Headphones,
    description: 'International English Language Testing System',
    targetGroup: 'Global Kariyer ve Eğitim',
    lessons: ['Listening', 'Reading', 'Writing', 'Speaking'],
    modules: [
      { title: "Band Score", icon: Target, color: "bg-emerald-600", desc: "Bölüm bazlı skorlar" },
      { title: "AI Practice", icon: MessageSquare, color: "bg-blue-500", desc: "Speaking pratiği" },
    ],
    aiFocus: 'Genel band skorunu artırmak için eksik becerilere odaklan.'
  },

  // DİNÎ
  HAFIZLIK: {
    id: 'HAFIZLIK',
    category: 'DİNÎ',
    title: 'Hafızlık',
    icon: Library,
    description: 'Kur\'an-ı Kerim Hafızlık Eğitimi Takibi',
    targetGroup: 'Hafız Adayları',
    lessons: ['Ezber (Has)', 'Tekrar (Pişirme)', 'Tecvid'],
    modules: [
      { title: "Ezber Planı", icon: Calendar, color: "bg-blue-500", desc: "Günlük sayfa hedefleri" },
      { title: "Sayfa Takibi", icon: ScrollText, color: "bg-emerald-500", desc: "Tamamlanan cüz ve sayfalar" },
      { title: "Tekrar Sistemi", icon: RefreshCw, color: "bg-orange-500", desc: "Unutma karşıtı periyotlar" },
      { title: "AI Hafız Koçu", icon: Brain, color: "bg-indigo-500", desc: "Ezber performansı analizi" },
    ],
    aiFocus: 'Ezber performansını ölç ve unutma riskine karşı tekrar periyotları planla.'
  },
  IHL: {
    id: 'IHL',
    category: 'DİNÎ',
    title: 'İHL Meslek Dersleri',
    icon: ScrollText,
    description: 'İmam Hatip Liseleri Meslek Dersleri Takibi',
    targetGroup: 'İHL Öğrencileri',
    lessons: ['Fıkıh', 'Tefsir', 'Hadis', 'Siyer', 'Akait'],
    modules: [
      { title: "Müfredat Takibi", icon: BookOpen, color: "bg-emerald-700", desc: "Meslek dersleri konuları" },
      { title: "Sınav Merkezi", icon: ClipboardCheck, color: "bg-orange-500", desc: "Yazılı ve test takibi" },
    ],
    aiFocus: 'Meslek derslerindeki konu hakimiyetini ve akademik başarıyı analiz et.'
  },
  ARAPCA: {
    id: 'ARAPCA',
    category: 'DİNÎ',
    title: 'Arapça',
    icon: Languages,
    description: 'Arapça Dil Eğitimi ve Gramer',
    targetGroup: 'Arapça Öğrenenler',
    lessons: ['Sarf', 'Nahiv', 'Muhadese', 'Kıraat'],
    modules: [
      { title: "Gramer Paneli", icon: PenTool, color: "bg-blue-800", desc: "Arapça kurallar" },
      { title: "Kelime Hazinesi", icon: Bookmark, color: "bg-emerald-600", desc: "Arapça kelimeler" },
    ],
    aiFocus: 'Gramer yapısı ve okuma becerilerindeki gelişimi takip et.'
  },

  // AKADEMİK
  OKUL_DERSLERI: {
    id: 'OKUL_DERSLERI',
    category: 'AKADEMİK',
    title: 'Okul Dersleri',
    icon: BookOpen,
    description: 'Müfredat Bazlı Okul Başarısı Takibi',
    targetGroup: 'Ara Sınıf Öğrencileri',
    lessons: ['Matematik', 'Türkçe', 'Fen', 'Sosyal Bilgiler'],
    modules: [
      { title: "Yazılı Hazırlık", icon: FileText, color: "bg-blue-500", desc: "Sınav dönemleri takibi" },
      { title: "Ödevler", icon: ClipboardCheck, color: "bg-emerald-500", desc: "Okul ödev yönetimi" },
    ],
    aiFocus: 'Okul yazılılarındaki başarıyı ve müfredat uyumunu izle.'
  },
  AKADEMIK: {
    id: 'AKADEMIK',
    category: 'AKADEMİK',
    title: 'Akademik Destek',
    icon: Brain,
    description: 'Genel Akademik Gelişim ve Kişisel Koçluk',
    targetGroup: 'Gelişim Odaklı Öğrenciler',
    lessons: ['Kritik Düşünme', 'Problem Çözme', 'Okuma Becerileri'],
    modules: [
      { title: "Gelişim Planı", icon: TrendingUp, color: "bg-indigo-500", desc: "Kişisel büyüme" },
      { title: "AI Destek", icon: Cpu, color: "bg-accent", desc: "Beceri analizi" },
    ],
    aiFocus: 'Öğrencinin genel öğrenme becerilerini ve bilişsel gelişimini analiz et.'
  },
  YAZ_OKULU: {
    id: 'YAZ_OKULU',
    category: 'AKADEMİK',
    title: 'Yaz Okulu',
    icon: Sun,
    description: 'Yaz Dönemi Telafi ve Gelişim Programları',
    targetGroup: 'Tatil Dönemi Öğrencileri',
    lessons: ['Tekrar 1', 'Tekrar 2', 'Yeni Sezon Hazırlık'],
    modules: [
      { title: "Kamp Modu", icon: RefreshCw, color: "bg-orange-400", desc: "Yaz kampı programı" },
      { title: "Eksik Tamamlama", icon: CheckCircle2, color: "bg-emerald-500", desc: "Geçen yılın tekrarı" },
    ],
    aiFocus: 'Yaz dönemindeki verimliliği ve yeni yıla hazırlık seviyesini ölç.'
  },

  // ÖZEL
  MANUEL: {
    id: 'MANUEL',
    category: 'ÖZEL',
    title: 'Manuel Mod',
    icon: Pencil,
    description: 'Kendi Derslerini ve Hedeflerini Kendin Belirle',
    targetGroup: 'Özel Çalışma Yapanlar',
    lessons: ['Özel Ders 1', 'Özel Ders 2'],
    modules: [
      { title: "Yeni Ders", icon: PlusCircle, color: "bg-blue-500", desc: "Kendi dersini tanımla" },
      { title: "Yeni Hedef", icon: Target, color: "bg-emerald-500", desc: "Kişisel hedeflerini kur" },
      { title: "Yeni Modül", icon: Building, color: "bg-orange-500", desc: "Sistemi özelleştir" },
    ],
    aiFocus: 'Kullanıcının tanımladığı özel hedeflere göre esnek analizler üret.'
  },
  KURUMSAL: {
    id: 'KURUMSAL',
    category: 'ÖZEL',
    title: 'Kurum Programı',
    icon: School,
    description: 'Okulunuza Özel Tanımlanmış Program',
    targetGroup: 'Kurumsal Öğrenciler',
    lessons: ['Kurum Dersi 1', 'Kurum Dersi 2'],
    modules: [
      { title: "Kurum Paneli", icon: School, color: "bg-blue-500", desc: "Kurum içi duyuru ve dersler" },
      { title: "Başarı Karnesi", icon: Award, color: "bg-emerald-500", desc: "Kurum içi sıralama" },
      { title: "AI Destek", icon: Brain, color: "bg-indigo-500", desc: "Kurumsal başarı analizi" },
    ],
    aiFocus: 'Kurumun belirlediği özel başarı kriterlerine göre raporlar üret.'
  }
};
