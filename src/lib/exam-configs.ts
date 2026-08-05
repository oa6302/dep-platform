
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
  Compass, Briefcase
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
  // --- ORTAOKUL ---
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
      { title: "AI Koç", icon: Brain, color: "bg-indigo-600", desc: "Kazanım odaklı analiz" },
      { title: "Hedefler", icon: Target, color: "bg-red-500", desc: "Lise hedef yönetimi" },
      { title: "Kütüphane", icon: LibraryIcon, color: "bg-cyan-500", desc: "LGS soru bankaları" },
    ],
    aiFocus: 'Matematik ve Fen Bilimleri kazanımlarındaki eksiklerini tamamlaman bu hafta en büyük önceliğimiz olmalı.'
  },

  // --- ÜNİVERSİTE ---
  YKS: {
    id: 'YKS',
    category: 'ÜNİVERSİTE',
    title: 'YKS (TYT + AYT)',
    icon: GraduationCap,
    description: 'Yükseköğretim Kurumları Sınavı',
    targetGroup: '12. Sınıf ve Mezunlar',
    lessons: ['TYT Türkçe', 'TYT Matematik', 'AYT Matematik', 'AYT Edebiyat', 'AYT Fen'],
    modules: [
      { title: "Net Analizi", icon: TrendingUp, color: "bg-orange-500", desc: "Sıralama ve net artışı" },
      { title: "Tercih Robotu", icon: Search, color: "bg-purple-500", desc: "Hedef üniversite uyumu" },
      { title: "AI Koç", icon: Brain, color: "bg-indigo-500", desc: "Başarı ve sıralama tahmini" },
      { title: "Ders Takibi", icon: BookOpen, color: "bg-blue-500", desc: "YKS konuları" },
      { title: "Denemeler", icon: ClipboardCheck, color: "bg-emerald-500", desc: "Sınav simülasyonları" },
      { title: "Hedefler", icon: Target, color: "bg-red-500", desc: "Üniversite vizyonu" },
    ],
    aiFocus: 'Mevcut net artış trendin seni hedefindeki Boğaziçi Üniversitesi Bilgisayar Mühendisliği için %84 uyumlu gösteriyor.'
  },

  // --- KAMU SINAVLARI ---
  KPSS: {
    id: 'KPSS',
    category: 'KAMU SINAVLARI',
    title: 'KPSS',
    icon: UserCheck,
    description: 'Kamu Personeli Seçme Sınavı',
    targetGroup: 'Memur Adayları',
    lessons: ['Genel Yetenek', 'Genel Kültür', 'Eğitim Bilimleri', 'ÖABT'],
    modules: [
      { title: "Genel Yetenek", icon: Brain, color: "bg-blue-500", desc: "Mantıksal muhakeme" },
      { title: "Genel Kültür", icon: Globe, color: "bg-emerald-500", desc: "Tarih ve Güncel" },
      { title: "Atama Tahmini", icon: Target, color: "bg-purple-500", desc: "Puan türü bazlı analiz" },
      { title: "AI Koç", icon: Brain, color: "bg-indigo-500", desc: "Atama olasılığı raporu" },
      { title: "Denemeler", icon: ClipboardCheck, color: "bg-orange-500", desc: "KPSS simülasyonu" },
      { title: "Kütüphane", icon: LibraryIcon, color: "bg-cyan-500", desc: "Çıkmış sorular" },
    ],
    aiFocus: 'Genel Kültür netlerin oldukça stabil, bu hafta Eğitim Bilimleri modülündeki gelişimine odaklanmalısın.'
  },

  // --- DİNÎ EĞİTİM ---
  HAFIZLIK: {
    id: 'HAFIZLIK',
    category: 'DİNÎ EĞİTİM',
    title: 'Hafızlık',
    icon: Library,
    description: 'Kur\'an-ı Kerim Hafızlık Eğitimi',
    targetGroup: 'Hafız Adayları',
    lessons: ['Ezber (Has)', 'Tekrar (Pişirme)', 'Tecvid'],
    modules: [
      { title: "Sayfa Takibi", icon: ScrollText, color: "bg-emerald-500", desc: "Tamamlanan cüzler" },
      { title: "Tekrar Sistemi", icon: RefreshCw, color: "bg-orange-500", desc: "Unutma periyotları" },
      { title: "AI Koç", icon: Brain, color: "bg-indigo-500", desc: "Ezber performansı analizi" },
      { title: "Dinleme", icon: Headphones, color: "bg-blue-500", desc: "Talim ve telaffuz" },
      { title: "Hedefler", icon: Target, color: "bg-red-500", desc: "İcazet yolculuğu" },
      { title: "Raporlar", icon: LineChart, color: "bg-purple-500", desc: "Haftalık gelişim" },
    ],
    aiFocus: 'Ezberleme hızın geçen haftaya göre %12 arttı, ancak unutma riskini azaltmak için 14. cüz tekrarını artırmalısın.'
  }
};
