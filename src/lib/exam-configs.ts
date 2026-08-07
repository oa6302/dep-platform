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
  Zap, Flame
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
  roadmap?: {
    phase: string;
    weeks: string;
    topics: string[];
  }[];
};

export const EXAM_CONFIGS: Record<string, ExamType> = {
  YKS_SOZ: {
    id: 'YKS_SOZ',
    category: 'ÜNİVERSİTE',
    title: 'YKS Sözel 2026',
    icon: HistoryIcon,
    description: 'TYT + AYT Sözel Puan Türü Tam Paket',
    targetGroup: '12. Sınıf ve Mezunlar',
    lessons: ['Türkçe', 'Edebiyat', 'Tarih', 'Coğrafya', 'Felsefe', 'Din Kültürü'],
    modules: [
      { title: "Sözel Analiz", icon: ScrollText, color: "bg-amber-600", desc: "Konu derinliği" },
      { title: "Deneme Takibi", icon: ClipboardCheck, color: "bg-emerald-500", desc: "Sözel denemeler" },
      { title: "Eser-Yazar", icon: LibraryIcon, color: "bg-rose-500", desc: "Ezber kartları" },
    ],
    aiFocus: 'Bu hafta Cumhuriyet Dönemi Şiir ve İnkılap Tarihi konularındaki %15 net artışı hedefine odaklanacağız.',
    roadmap: [
      { phase: "Temel İnşa", weeks: "1-12", topics: ["Sözcük ve Cümlede Anlam", "İslamiyet Öncesi", "İlk Çağ", "Harita Bilgisi"] },
      { phase: "Gelişim", weeks: "13-24", topics: ["Divan Edebiyatı", "Osmanlı Tarihi", "İklim", "Psikoloji/Sosyoloji"] },
      { phase: "İleri Kazanım", weeks: "25-36", topics: ["Cumhuriyet Dönemi", "20. YY Dünya Tarihi", "Türkiye Coğrafyası"] },
      { phase: "Final Revizyon", weeks: "37-52", topics: ["Genel Tekrar", "Deneme Kampı", "Sözel Mantık"] }
    ]
  },
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
      { title: "AI Koç", icon: Brain, color: "bg-indigo-500", desc: "Sıralama tahmini" },
    ],
    aiFocus: 'AYT Matematik netlerin hedefindeki mühendislik fakültesi için %88 uyumlu görünüyor.'
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
      { title: "Yol Haritası", icon: Map, color: "bg-emerald-600", desc: "Haftalık gelişim" },
    ],
    aiFocus: 'Edebiyat ve AYT Matematik netlerin arasındaki dengeyi koruman sıralamanı %12 yukarı çekecektir.'
  },
  LGS: {
    id: 'LGS',
    category: 'ORTAOKUL',
    title: 'LGS 2026',
    icon: Target,
    description: 'Liselere Geçiş Sistemi Hazırlığı',
    targetGroup: '8. Sınıf Öğrencileri',
    lessons: ['Türkçe', 'Matematik', 'Fen Bilimleri', 'İnkılap Tarihi', 'Din Kültürü', 'İngilizce'],
    modules: [
      { title: "Dersler", icon: BookOpen, color: "bg-blue-600", desc: "LGS müfredatı" },
      { title: "Denemeler", icon: ClipboardCheck, color: "bg-orange-500", desc: "Sonuç analizi" },
    ],
    aiFocus: 'Matematik ve Fen Bilimleri kazanımlarındaki eksiklerini tamamlaman bu hafta en büyük önceliğimiz olmalı.'
  }
};