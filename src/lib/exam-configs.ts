
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
      { title: "Dersler", icon: BookOpen, color: "bg-blue-500", desc: "LGS müfredatı takibi" },
      { title: "Denemeler", icon: ClipboardCheck, color: "bg-orange-500", desc: "LGS deneme sonuçları" },
      { title: "Konu Analizi", icon: LineChart, color: "bg-purple-500", desc: "Kazanım başarı haritası" },
      { title: "AI Koç", icon: Brain, color: "bg-indigo-500", desc: "Kazanım odaklı analiz" },
      { title: "Hedefler", icon: Target, color: "bg-red-500", desc: "Lise hedef yönetimi" },
      { title: "Kütüphane", icon: LibraryIcon, color: "bg-cyan-500", desc: "LGS soru bankaları" },
    ],
    aiFocus: 'Kazanım eksikliklerini tespit et ve temel akademik yetkinliği artır.'
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
    ],
    aiFocus: 'Net artış trendlerini izle, sıralama tahmini yap ve üniversite hedeflerine göre yönlendir.'
  },

  // --- MEB SINAVLARI ---
  AGS: {
    id: 'AGS',
    category: 'MEB SINAVLARI',
    title: 'AGS',
    icon: ShieldCheck,
    description: 'Milli Eğitim Bakanlığı Akademik Gelişim Sınavı',
    targetGroup: 'MEB Personeli',
    lessons: ['Eğitim Bilimleri', 'Genel Kültür'],
    modules: [
      { title: "Akademik Panel", icon: Presentation, color: "bg-blue-700", desc: "Kariyer basamakları" },
      { title: "AI Mentor", icon: Brain, color: "bg-indigo-500", desc: "Mesleki gelişim analizi" },
    ],
    aiFocus: 'Mesleki yeterlilik ve sınav performans korelasyonunu analiz et.'
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
    ],
    aiFocus: 'Puan türlerine göre atama olasılığını hesapla ve alan eksikliklerine odaklan.'
  },
  HAKIMLIK: {
    id: 'HAKIMLIK',
    category: 'KAMU SINAVLARI',
    title: 'Adli/İdari Hakimlik',
    icon: Gavel,
    description: 'Adalet Bakanlığı Sınavları',
    targetGroup: 'Hukuk Mezunları',
    lessons: ['Anayasa', 'Medeni Hukuk', 'Ceza Hukuku', 'İdare Hukuku'],
    modules: [
      { title: "Mevzuat", icon: ScrollText, color: "bg-slate-800", desc: "Güncel kanunlar" },
      { title: "Vaka Analizi", icon: Search, color: "bg-amber-600", desc: "Örnek olay çözümleri" },
      { title: "AI Mentor", icon: Brain, color: "bg-indigo-500", desc: "Hukuki yorum gücü" },
    ],
    aiFocus: 'Hukuki muhakeme yeteneğini ve mevzuat bilgi derinliğini analiz et.'
  },

  // --- AKADEMİK ---
  ALES: {
    id: 'ALES',
    category: 'AKADEMİK',
    title: 'ALES',
    icon: FileText,
    description: 'Akademik Personel Giriş Sınavı',
    targetGroup: 'Akademisyen Adayları',
    lessons: ['Sayısal', 'Sözel'],
    modules: [
      { title: "Mantık", icon: Brain, color: "bg-slate-500", desc: "Mantıksal muhakeme" },
      { title: "Puan Analizi", icon: TrendingUp, color: "bg-orange-500", desc: "Standart sapma takibi" },
    ],
    aiFocus: 'Hız ve mantıksal doğruluk oranını analiz et.'
  },
  TUS: {
    id: 'TUS',
    category: 'AKADEMİK',
    title: 'TUS',
    icon: Stethoscope,
    description: 'Tıpta Uzmanlık Eğitimi Giriş Sınavı',
    targetGroup: 'Tıp Mezunları',
    lessons: ['Temel Tıp', 'Klinik Tıp'],
    modules: [
      { title: "Branş Başarısı", icon: HeartPulse, color: "bg-red-600", desc: "Uzmanlık tercihi uyumu" },
      { title: "AI Analiz", icon: Microscope, color: "bg-blue-600", desc: "Bilgi derinliği ölçümü" },
    ],
    aiFocus: 'Branş bazlı başarı skorlarını ve uzmanlık eğilimini analiz et.'
  },

  // --- YABANCI DİL ---
  IELTS: {
    id: 'IELTS',
    category: 'YABANCI DİL',
    title: 'IELTS',
    icon: Headphones,
    description: 'Global İngilizce Yeterlilik',
    targetGroup: 'Global Kariyer',
    lessons: ['Listening', 'Reading', 'Writing', 'Speaking'],
    modules: [
      { title: "Band Score", icon: Target, color: "bg-emerald-600", desc: "Tahmini skor hesaplama" },
      { title: "AI Practice", icon: MessageSquare, color: "bg-blue-500", desc: "Speaking pratiği" },
      { title: "Writing Pro", icon: PenTool, color: "bg-purple-500", desc: "Essay değerlendirme" },
    ],
    aiFocus: 'CEFR standartlarında band score tahmini yap ve eksik becerileri raporla.'
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
      { title: "AI Hafız Koçu", icon: Brain, color: "bg-indigo-500", desc: "Ezber performansı analizi" },
    ],
    aiFocus: 'Ezber hızını ve unutma riskini analiz ederek tekrar periyotları öner.'
  },

  // --- AKADEMİK DESTEK ---
  YAZ_OKULU: {
    id: 'YAZ_OKULU',
    category: 'AKADEMİK DESTEK',
    title: 'Yaz Okulu',
    icon: Sun,
    description: 'Yaz Dönemi Telafi Programı',
    targetGroup: 'Tüm Öğrenciler',
    lessons: ['Eksik Telafisi', 'Yeni Sezon'],
    modules: [
      { title: "Kamp Modu", icon: RefreshCw, color: "bg-orange-400", desc: "Yaz kampı takibi" },
      { title: "Eksik Tamamlama", icon: CheckCircle2, color: "bg-emerald-500", desc: "Geçen yılın telafisi" },
    ],
    aiFocus: 'Yaz dönemindeki akademik toparlanma seviyesini analiz et.'
  },

  // --- ÖZEL PROGRAMLAR ---
  KURUMSAL: {
    id: 'KURUMSAL',
    category: 'ÖZEL PROGRAMLAR',
    title: 'Kurum Programı',
    icon: School,
    description: 'Okulunuza Özel Müfredat',
    targetGroup: 'Kurumsal Üyeler',
    lessons: ['Özel Müfredat'],
    modules: [
      { title: "Kurum Paneli", icon: LayoutDashboard, color: "bg-blue-500", desc: "İç duyuru ve dersler" },
      { title: "AI Destek", icon: Cpu, color: "bg-indigo-500", desc: "Kurumsal başarı analizi" },
    ],
    aiFocus: 'Kurumun belirlediği özel başarı kriterlerine göre raporlar üret.'
  }
};
