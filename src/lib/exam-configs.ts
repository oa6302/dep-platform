import { 
  Target, GraduationCap, BookOpen, Globe, Languages, 
  Brain, Scale, Library, Building, UserCheck, 
  Pencil, PlusCircle, BookMarked, School, ScrollText,
  Search, MessageSquare, LineChart, ClipboardCheck,
  Calendar, Award, Library as LibraryIcon, Cpu,
  Bookmark, Mic, Headphones, PenTool, BookOpenCheck,
  TrendingUp, RefreshCw, Sun, FileText, PencilLine,
  CheckCircle2, ShieldCheck, Landmark, Gavel, 
  Stethoscope, Microscope, Music, HeartPulse, Timer,
  Presentation, FileSpreadsheet, LayoutDashboard,
  Compass, Briefcase, Atom, FlaskConical, Calculator,
  Globe2, History as HistoryIcon, Languages as LangIcon,
  Zap, Flame, FileCode, Users
} from 'lucide-react';

export type ExamModule = {
  title: string;
  icon: any;
  color: string;
  desc: string;
};

export type ExamType = {
  id: string;
  category: 'ORTAOKUL' | 'ÜNİVERSİTE' | 'MEB SINAVLARI' | 'KAMU SINAVLARI' | 'AKADEMİK' | 'YABANCI DİL' | 'ÜNİVERSİTE GEÇİŞ' | 'DİNÎ EĞİTİM' | 'AKADEMİK DESTEK' | 'ÖZEL PROGRAMLAR';
  title: string;
  icon: any;
  description: string;
  targetGroup: string;
  lessons: string[];
  modules: ExamModule[];
  aiFocus: string;
};

export const EXAM_CONFIGS: Record<string, ExamType> = {
  // YKS GRUBU
  YKS_SAY: {
    id: 'YKS_SAY',
    category: 'ÜNİVERSİTE',
    title: 'YKS Sayısal 2026',
    icon: FlaskConical,
    description: 'TYT + AYT Sayısal Puan Türü Odaklı',
    targetGroup: '12. Sınıf ve Mezunlar',
    lessons: ['TYT Matematik', 'AYT Matematik', 'Geometri', 'Fizik', 'Kimya', 'Biyoloji', 'Türkçe'],
    modules: [
      { title: "Net Analizi", icon: TrendingUp, color: "bg-orange-500", desc: "Sayısal net artışı" },
      { title: "Sıralama Robotu", icon: Target, color: "bg-blue-600", desc: "Tahmin motoru" },
    ],
    aiFocus: 'AYT Matematik ve Fen branşlarındaki dengeyi korumak bu hafta ana stratejimiz.'
  },
  YKS_EA: {
    id: 'YKS_EA',
    category: 'ÜNİVERSİTE',
    title: 'YKS Eşit Ağırlık 2026',
    icon: Scale,
    description: 'Matematik ve Sözel Denge Paketi',
    targetGroup: '12. Sınıf ve Mezunlar',
    lessons: ['TYT Matematik', 'AYT Matematik', 'Edebiyat', 'Tarih', 'Coğrafya', 'Türkçe', 'Geometri'],
    modules: [
      { title: "EA Denge", icon: Target, color: "bg-blue-600", desc: "Mat-Sözel dengesi" },
      { title: "Konu Takibi", icon: BookOpenCheck, color: "bg-emerald-600", desc: "Haftalık gelişim" },
    ],
    aiFocus: 'Edebiyat ve AYT Matematik netleri arasındaki %15lik farkı kapatmaya odaklanacağız.'
  },
  YKS_SOZ: {
    id: 'YKS_SOZ',
    category: 'ÜNİVERSİTE',
    title: 'YKS Sözel 2026',
    icon: HistoryIcon,
    description: 'TYT + AYT Sözel Puan Türü Tam Paket',
    targetGroup: '12. Sınıf ve Mezunlar',
    lessons: ['Türkçe', 'Edebiyat', 'Tarih', 'Coğrafya', 'Felsefe', 'Psikoloji', 'Sosyoloji', 'Mantık', 'Din Kültürü'],
    modules: [
      { title: "Sözel Analiz", icon: ScrollText, color: "bg-amber-600", desc: "Konu derinliği" },
      { title: "Eser-Yazar", icon: LibraryIcon, color: "bg-rose-500", desc: "Hafıza teknikleri" },
    ],
    aiFocus: 'Cumhuriyet Dönemi Edebiyatı ve İnkılap Tarihi konularında %100 kazanım hedefliyoruz.'
  },

  // KPSS GRUBU
  KPSS_ORTA: {
    id: 'KPSS_ORTA',
    category: 'KAMU SINAVLARI',
    title: 'KPSS Ortaöğretim 2025',
    icon: Landmark,
    description: 'Lise Mezunları İçin Memurluk Hazırlığı',
    targetGroup: 'Lise Mezunları',
    lessons: ['Türkçe', 'Matematik', 'Tarih', 'Coğrafya', 'Vatandaşlık', 'Güncel Bilgiler'],
    modules: [
      { title: "Atama Puanı", icon: Users, color: "bg-indigo-600", desc: "Hedef puan hesabı" },
      { title: "Vatandaşlık", icon: Gavel, color: "bg-slate-700", desc: "Pratik notlar" },
    ],
    aiFocus: 'Genel Kültür testindeki Tarih ağırlıklı sorulara bu ay %40 daha fazla odaklanıyoruz.'
  },
  KPSS_LISANS: {
    id: 'KPSS_LISANS',
    category: 'KAMU SINAVLARI',
    title: 'KPSS Lisans 2026',
    icon: Landmark,
    description: 'Genel Yetenek & Genel Kültür Hazırlık',
    targetGroup: 'Lisans Mezunları',
    lessons: ['Türkçe', 'Matematik', 'Tarih', 'Coğrafya', 'Vatandaşlık', 'Güncel Bilgiler'],
    modules: [
      { title: "Atama Robotu", icon: Users, color: "bg-indigo-600", desc: "Puan hesaplama" },
      { title: "Vatandaşlık Notları", icon: Gavel, color: "bg-slate-700", desc: "Özet kartlar" },
    ],
    aiFocus: 'Tarih ve Coğrafya derslerindeki güncel müfredat değişimlerini planımıza dahil ettik.'
  },

  // AKADEMİK GRUP
  ALES: {
    id: 'ALES',
    category: 'AKADEMİK',
    title: 'ALES 2026',
    icon: Brain,
    description: 'Akademik Personel ve Lisansüstü Eğitimi',
    targetGroup: 'Lisans Mezunları ve Son Sınıflar',
    lessons: ['Sayısal Mantık', 'Sözel Mantık', 'Matematik', 'Türkçe'],
    modules: [
      { title: "Hız Analizi", icon: Timer, color: "bg-red-600", desc: "Süre yönetimi" },
      { title: "Mantık Kampı", icon: Zap, color: "bg-accent", desc: "Özel mantık soruları" },
    ],
    aiFocus: 'Sözel mantık çözüm hızını %20 artırmak için süre odaklı denemeler planlıyoruz.'
  },

  // DİL GRUBU
  YDS: {
    id: 'YDS',
    category: 'YABANCI DİL',
    title: 'YDS / YÖKDİL 2026',
    icon: Languages,
    description: 'Yabancı Dil Bilgisi Seviye Tespit Sınavı',
    targetGroup: 'Dil Puanı Hedefleyenler',
    lessons: ['Reading', 'Grammar', 'Vocabulary', 'Listening', 'Writing'],
    modules: [
      { title: "Kelime Deposu", icon: BookMarked, color: "bg-blue-500", desc: "Günlük kelime" },
      { title: "Okuma Kampı", icon: Mic, color: "bg-emerald-500", desc: "Paragraf teknikleri" },
    ],
    aiFocus: 'Akademik okuma becerilerini geliştirmek için her gün 2 makale analizi ekliyoruz.'
  },

  // MEB GRUBU
  LGS: {
    id: 'LGS',
    category: 'ORTAOKUL',
    title: 'LGS 2026',
    icon: Target,
    description: 'Liselere Geçiş Sistemi Hazırlığı',
    targetGroup: '8. Sınıf Öğrencileri',
    lessons: ['Türkçe', 'Matematik', 'Fen Bilimleri', 'İnkılap Tarihi', 'Din Kültürü', 'İngilizce'],
    modules: [
      { title: "Yeni Nesil", icon: Zap, color: "bg-orange-500", desc: "Beceri temelli sorular" },
      { title: "Deneme Takibi", icon: ClipboardCheck, color: "bg-blue-600", desc: "Sonuç analizi" },
    ],
    aiFocus: 'Matematik yeni nesil sorularındaki mantık yürütme becerilerini güçlendireceğiz.'
  }
};