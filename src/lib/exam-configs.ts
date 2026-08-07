
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
  IOKBS_ORTA: {
    id: 'IOKBS_ORTA',
    category: 'ORTAOKUL',
    title: 'Bursluluk (İOKBS)',
    icon: Award,
    description: 'İlköğretim ve Ortaöğretim Kurumları Bursluluk Sınavı',
    targetGroup: '5, 6, 7 ve 8. Sınıflar',
    lessons: ['Türkçe', 'Matematik', 'Fen Bilimleri', 'Sosyal Bilgiler'],
    modules: [
      { title: "Konu Takibi", icon: BookOpenCheck, color: "bg-emerald-500", desc: "Bursluluk müfredatı" },
      { title: "Çıkmış Sorular", icon: FileText, color: "bg-blue-500", desc: "Geçmiş yıllar analizi" },
    ],
    aiFocus: 'Bursluluk sınavı için hızını artırmalı ve temel kavram tekrarlarına odaklanmalısın.'
  },

  // --- ÜNİVERSİTE ---
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
      { title: "Fen Kampı", icon: Atom, color: "bg-blue-500", desc: "AYT Fen uzmanlığı" },
    ],
    aiFocus: 'AYT Matematik netlerin hedefindeki mühendislik fakültesi için %88 uyumlu görünüyor.'
  },
  YKS_EA: {
    id: 'YKS_EA',
    category: 'ÜNİVERSİTE',
    title: 'YKS Eşit Ağırlık',
    icon: Scale,
    description: 'TYT + AYT Eşit Ağırlık Puan Türü Odaklı',
    targetGroup: '12. Sınıf ve Mezunlar',
    lessons: ['TYT Matematik', 'AYT Matematik', 'TYT Sosyal', 'AYT Edebiyat', 'AYT Tarih', 'AYT Coğrafya'],
    modules: [
      { title: "Edebiyat Takibi", icon: LibraryIcon, color: "bg-red-500", desc: "Yazar-Eser analizi" },
      { title: "Matematik Gelişim", icon: Calculator, color: "bg-blue-500", desc: "EA Matematik odağı" },
    ],
    aiFocus: 'Edebiyat ezberlerin gayet iyi gidiyor, Matematik netlerini 5 puan artırmak sıralamanı 20 bin öne çekecek.'
  },
  YKS_SOZ: {
    id: 'YKS_SOZ',
    category: 'ÜNİVERSİTE',
    title: 'YKS Sözel',
    icon: HistoryIcon,
    description: 'TYT + AYT Sözel Puan Türü Odaklı',
    targetGroup: '12. Sınıf ve Mezunlar',
    lessons: ['TYT Türkçe', 'AYT Edebiyat', 'AYT Tarih-1', 'AYT Coğrafya-1', 'AYT Tarih-2', 'AYT Coğrafya-2', 'Felsefe Grubu'],
    modules: [
      { title: "Sözel Analiz", icon: ScrollText, color: "bg-amber-600", desc: "Konu derinliği" },
      { title: "Deneme Takibi", icon: ClipboardCheck, color: "bg-emerald-500", desc: "Sözel denemeler" },
    ],
    aiFocus: 'Tarih ve Coğrafya-2 derslerinde detay konulara odaklanman fark yaratmanı sağlayacak.'
  },

  // --- KAMU SINAVLARI ---
  KPSS_LISANS: {
    id: 'KPSS_LISANS',
    category: 'KAMU SINAVLARI',
    title: 'KPSS Lisans',
    icon: Landmark,
    description: 'Genel Yetenek - Genel Kültür Hazırlığı',
    targetGroup: 'Lisans Mezunları',
    lessons: ['Türkçe', 'Matematik', 'Tarih', 'Coğrafya', 'Vatandaşlık', 'Güncel Bilgiler'],
    modules: [
      { title: "GY-GK Analiz", icon: Brain, color: "bg-blue-500", desc: "Puan hesaplama" },
      { title: "Güncel Bilgiler", icon: Globe2, color: "bg-emerald-500", desc: "Anlık güncel veri" },
      { title: "Atama Botu", icon: Target, color: "bg-purple-500", desc: "Kadrolar ve puanlar" },
    ],
    aiFocus: 'Vatandaşlık ve Güncel Bilgiler konularındaki tekrar periyodunu sıkılaştırmalıyız.'
  },
  KPSS_ONLISANS: {
    id: 'KPSS_ONLISANS',
    category: 'KAMU SINAVLARI',
    title: 'KPSS Önlisans',
    icon: Building,
    description: 'Genel Yetenek - Genel Kültür (B Grubu)',
    targetGroup: 'Önlisans Mezunları',
    lessons: ['Türkçe', 'Matematik', 'Tarih', 'Coğrafya', 'Vatandaşlık'],
    modules: [
      { title: "Konu Takibi", icon: BookOpen, color: "bg-blue-600", desc: "Müfredat uyumu" },
      { title: "Deneme Merkezi", icon: ClipboardCheck, color: "bg-orange-500", desc: "Simülasyonlar" },
    ],
    aiFocus: 'Matematik temelini güçlendirmek için problem çözme kampına başlıyoruz.'
  },

  // --- AKADEMİK & ÜNİVERSİTE GEÇİŞ ---
  DGS: {
    id: 'DGS',
    category: 'AKADEMİK',
    title: 'DGS',
    icon: RefreshCw,
    description: 'Dikey Geçiş Sınavı Hazırlığı',
    targetGroup: 'Önlisans Öğrencileri',
    lessons: ['Sayısal Yetenek', 'Sözel Yetenek'],
    modules: [
      { title: "Hız Analizi", icon: Timer, color: "bg-blue-500", desc: "Soru başına düşen süre" },
      { title: "Mantık Kampı", icon: Brain, color: "bg-purple-500", desc: "Sayısal/Sözel Mantık" },
    ],
    aiFocus: 'Sayısal mantık sorularında hızlanman gerekiyor, süreni %15 daha verimli kullanmalısın.'
  },
  ALES: {
    id: 'ALES',
    category: 'AKADEMİK',
    title: 'ALES',
    icon: GraduationCap,
    description: 'Akademik Personel ve Lisansüstü Eğitimi Giriş Sınavı',
    targetGroup: 'Akademik Kariyer Adayları',
    lessons: ['Sayısal', 'Sözel'],
    modules: [
      { title: "Akademik Skor", icon: TrendingUp, color: "bg-indigo-600", desc: "Puan projeksiyonu" },
      { title: "Sözel Mantık", icon: Search, color: "bg-orange-500", desc: "Muhakeme yeteneği" },
    ],
    aiFocus: 'Akademik kariyer hedefin için Sözel Mantık bölümündeki 50 soruluk performansı artırmalıyız.'
  },

  // --- YABANCI DİL ---
  YDT: {
    id: 'YDT',
    category: 'YABANCI DİL',
    title: 'YKS Dil (YDT)',
    icon: LangIcon,
    description: 'Yükseköğretim Kurumları Dil Sınavı',
    targetGroup: 'Dil Bölümü Öğrencileri',
    lessons: ['Grammar', 'Vocabulary', 'Reading', 'Translation', 'Cloze Test'],
    modules: [
      { title: "Kelime Haznesi", icon: Bookmark, color: "bg-blue-500", desc: "Daily Vocabulary" },
      { title: "Okuma Kampı", icon: BookOpen, color: "bg-emerald-500", desc: "Daily Articles" },
    ],
    aiFocus: 'Kelime bilgin gayet iyi, ancak Reading bölümlerinde ana fikir bulma hızın artmalı.'
  },
  IELTS: {
    id: 'IELTS',
    category: 'YABANCI DİL',
    title: 'IELTS',
    icon: Headphones,
    description: 'International English Language Testing System',
    targetGroup: 'Global Kariyer ve Eğitim',
    lessons: ['Listening', 'Reading', 'Writing', 'Speaking'],
    modules: [
      { title: "Band Score", icon: Target, color: "bg-indigo-600", desc: "Tahmini skor takibi" },
      { title: "Speaking AI", icon: Mic, color: "bg-red-500", desc: "Konuşma pratiği" },
    ],
    aiFocus: 'Writing Task 2 için argüman geliştirme kapasiteni %20 artırmamız gerekiyor.'
  },
  YDS_YOKDIL: {
    id: 'YDS_YOKDIL',
    category: 'YABANCI DİL',
    title: 'YDS / YÖKDİL',
    icon: Globe,
    description: 'Yabancı Dil Bilgisi Seviye Tespit Sınavı',
    targetGroup: 'Kamu ve Akademik Kariyer',
    lessons: ['Grammar', 'Reading', 'Vocabulary', 'Test Techniques'],
    modules: [
      { title: "Teknikler", icon: Zap, color: "bg-amber-500", desc: "Sınav stratejileri" },
      { title: "Arşiv", icon: FileText, color: "bg-slate-600", desc: "Çıkmış paragraf soruları" },
    ],
    aiFocus: 'Bağlaç sorularındaki hata payını düşürmek için bu hafta özel bir kamp hazırladık.'
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
    ],
    aiFocus: 'Ezberleme hızın geçen haftaya göre %12 arttı, ancak unutma riskini azaltmak için 14. cüz tekrarını artırmalısın.'
  },

  // --- AKADEMİK DESTEK & ÖZEL ---
  YAZILI_HAZIRLIK: {
    id: 'YAZILI_HAZIRLIK',
    category: 'AKADEMİK DESTEK',
    title: 'Yazılı Hazırlık',
    icon: PenTool,
    description: 'Okul Yazılı Sınavlarına Hazırlık Sistemi',
    targetGroup: '9, 10, 11 ve 12. Sınıflar',
    lessons: ['Tüm Okul Dersleri'],
    modules: [
      { title: "Soru Tahmini", icon: Search, color: "bg-blue-500", desc: "Yazılıda çıkabilir" },
      { title: "Özet Notlar", icon: BookMarked, color: "bg-emerald-500", desc: "Kritik bilgiler" },
    ],
    aiFocus: 'Milli Eğitim müfredatındaki kritik kazanımlara göre yazılı hazırlık planın güncellendi.'
  }
};
