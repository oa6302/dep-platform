
import { 
  Target, GraduationCap, BookOpen, Globe, Languages, 
  Brain, Scale, Library, Building, UserCheck, 
  Pencil, PlusCircle, BookMarked, School, ScrollText,
  Search, MessageSquare, LineChart, ClipboardCheck,
  Calendar, Award, Library as LibraryIcon, Cpu,
  Bookmark, Mic, Headphones, PenTool, BookOpenCheck,
  TrendingUp, RefreshCw
} from 'lucide-react';

export type ExamModule = {
  title: string;
  icon: any;
  color: string;
  desc: string;
};

export type ExamType = {
  id: string;
  category: 'ORTAOKUL' | 'ÜNİVERSİTE' | 'KAMU' | 'DİL' | 'DİNÎ' | 'AKADEMİK' | 'ÖZEL';
  title: string;
  icon: any;
  description: string;
  targetGroup: string;
  lessons: string[];
  modules: ExamModule[];
  aiFocus: string;
};

export const EXAM_CONFIGS: Record<string, ExamType> = {
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
  DIL: {
    id: 'DIL',
    category: 'DİL',
    title: 'Dil Eğitimi',
    icon: Globe,
    description: 'İngilizce, Almanca ve YDT Hazırlık',
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
  AKADEMIK: {
    id: 'AKADEMIK',
    category: 'AKADEMİK',
    title: 'Akademik Destek',
    icon: Brain,
    description: 'Okul Dersleri ve Genel Akademik Gelişim',
    targetGroup: 'Ara Sınıf Öğrencileri',
    lessons: ['Matematik', 'Türkçe', 'Fen', 'Sosyal Bilgiler'],
    modules: [
      { title: "Dersler", icon: BookOpen, color: "bg-blue-500", desc: "Okul müfredatı takibi" },
      { title: "Ödevler", icon: ClipboardCheck, color: "bg-emerald-500", desc: "Günlük ödev yönetimi" },
      { title: "Konu Takibi", icon: LineChart, color: "bg-orange-500", desc: "Zayıf konuların analizi" },
      { title: "AI Destek", icon: Cpu, color: "bg-indigo-500", desc: "Akademik gelişim planı" },
    ],
    aiFocus: 'Okul başarısını artırmak için konu temelli eksikleri tamamla.'
  },
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
