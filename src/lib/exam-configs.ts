
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
  Zap
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
    lessons: ['Edebiyat', 'Tarih', 'Coğrafya', 'Felsefe Grubu', 'Din Kültürü', 'Türkçe'],
    modules: [
      { title: "Sözel Analiz", icon: ScrollText, color: "bg-amber-600", desc: "Konu derinliği" },
      { title: "Deneme Takibi", icon: ClipboardCheck, color: "bg-emerald-500", desc: "Sözel denemeler" },
      { title: "Eser-Yazar", icon: LibraryIcon, color: "bg-rose-500", desc: "Ezber kartları" },
    ],
    aiFocus: 'Bu hafta Cumhuriyet Dönemi Şiir ve İnkılap Tarihi konularındaki %15 net artışı hedefine odaklanacağız.',
    roadmap: [
      {
        phase: "Temel İnşa Fazı",
        weeks: "1-12",
        topics: ["Sözcük ve Cümlede Anlam", "İslamiyet Öncesi Edebiyat", "Tarih Bilimine Giriş", "Coğrafi Konum", "Felsefeye Giriş"]
      },
      {
        phase: "Gelişim & Detay Fazı",
        weeks: "13-24",
        topics: ["Halk ve Divan Edebiyatı", "Selçuklu ve Osmanlı Tarihi", "İklim ve Yerleşme", "Psikoloji ve Sosyoloji Temelleri"]
      },
      {
        phase: "İleri Kazanım Fazı",
        weeks: "25-36",
        topics: ["Tanzimat'tan Cumhuriyet'e Edebiyat", "20. Yüzyıl Dünya Tarihi", "Türkiye Ekonomisi", "Mantık ve Sembolik Mantık"]
      },
      {
        phase: "Final Revizyon & Deneme Kampı",
        weeks: "37-52",
        topics: ["Tüm Müfredat Tekrarı", "Haftalık 3 Genel Deneme", "Sözel Mantık Full Kamp", "Güncel Bilgiler Analizi"]
      }
    ]
  },
  LGS: {
    id: 'LGS',
    category: 'ORTAOKUL',
    title: 'LGS',
    icon: Target,
    description: 'Liselere Geçiş Sistemi Hazırlığı',
    targetGroup: '8. Sınıf Öğrencileri',
    lessons: ['Türkçe', 'Matematik', 'Fen Bilimleri', 'İnkılap Tarihi', 'Din Kültürü', 'İngilizce'],
    modules: [
      { title: "Dersler", icon: BookOpen, color: "bg-blue-600", desc: "LGS müfredatı takibi" },
      { title: "Denemeler", icon: ClipboardCheck, color: "bg-orange-500", desc: "LGS deneme sonuçları" },
      { title: "Konu Analizi", icon: LineChart, color: "bg-purple-600", desc: "Kazanım başarı haritası" },
    ],
    aiFocus: 'Matematik ve Fen Bilimleri kazanımlarındaki eksiklerini tamamlaman bu hafta en büyük önceliğimiz olmalı.'
  },
  YKS_SAY: {
    id: 'YKS_SAY',
    category: 'ÜNİVERSİTE',
    title: 'YKS Sayısal',
    icon: FlaskConical,
    description: 'TYT + AYT Sayısal Puan Türü Odaklı',
    targetGroup: '12. Sınıf ve Mezunlar',
    lessons: ['TYT Matematik', 'AYT Matematik', 'TYT Fen', 'AYT Fizik', 'AYT Kimya', 'AYT Biyoloji'],
    modules: [
      { title: "Net Analizi", icon: TrendingUp, color: "bg-orange-500", desc: "Sayısal net artışı" },
      { title: "AI Koç", icon: Brain, color: "bg-indigo-500", desc: "Sıralama tahmini" },
    ],
    aiFocus: 'AYT Matematik netlerin hedefindeki mühendislik fakültesi için %88 uyumlu görünüyor.'
  }
};
