
import { 
  Target, GraduationCap, BookOpen, Globe, Languages, 
  Brain, Scale, Library, Building, UserCheck, 
  Pencil, PlusCircle, BookMarked, School, ScrollText
} from 'lucide-react';

export type ExamType = {
  id: string;
  title: string;
  icon: any;
  description: string;
  targetGroup: string;
  lessons: string[];
  features: string[];
  aiFocus: string;
};

export const EXAM_CONFIGS: Record<string, ExamType> = {
  LGS: {
    id: 'LGS',
    title: 'LGS',
    icon: Target,
    description: 'Liselere Geçiş Sistemi Hazırlığı',
    targetGroup: '8. Sınıf Öğrencileri',
    lessons: ['Türkçe', 'Matematik', 'Fen Bilimleri', 'İnkılap Tarihi', 'Din Kültürü', 'İngilizce'],
    features: ['Kazanım Analizi', 'LGS Denemeleri', 'Haftalık Program'],
    aiFocus: 'Kazanım eksikliklerini tespit et ve temel akademik yetkinliği artır.'
  },
  YKS: {
    id: 'YKS',
    title: 'YKS (TYT + AYT)',
    icon: GraduationCap,
    description: 'Yükseköğretim Kurumları Sınavı',
    targetGroup: '12. Sınıf ve Mezunlar',
    lessons: ['TYT Türkçe', 'TYT Matematik', 'AYT Matematik', 'AYT Edebiyat', 'AYT Fen'],
    features: ['Net Takibi', 'Sıralama Tahmini', 'Tercih Robotu'],
    aiFocus: 'Net artış trendlerini izle, sıralama tahmini yap ve üniversite hedeflerine göre yönlendir.'
  },
  KPSS: {
    id: 'KPSS',
    title: 'KPSS',
    icon: UserCheck,
    description: 'Kamu Personeli Seçme Sınavı',
    targetGroup: 'Memur Adayları',
    lessons: ['Genel Yetenek', 'Genel Kültür', 'Eğitim Bilimleri', 'ÖABT'],
    features: ['Atama Tahmini', 'Alan Analizi', 'Güncel Bilgiler'],
    aiFocus: 'Puan türlerine göre atama olasılığını hesapla ve alan eksikliklerine odaklan.'
  },
  DGS: {
    id: 'DGS',
    title: 'DGS',
    icon: BookOpen,
    description: 'Dikey Geçiş Sınavı',
    targetGroup: 'Önlisans Mezunları',
    lessons: ['Sayısal', 'Sözel'],
    features: ['Hız Analizi', 'Mantıksal Akıl Yürütme'],
    aiFocus: 'Soru çözüm hızını artırmaya ve mantıksal muhakeme yeteneğini geliştirmeye odaklan.'
  },
  ALES: {
    id: 'ALES',
    title: 'ALES',
    icon: Scale,
    description: 'Akademik Personel ve Lisansüstü Eğitimi Giriş Sınavı',
    targetGroup: 'Lisans Mezunları',
    lessons: ['Sayısal', 'Sözel'],
    features: ['Hız Analizi', 'Mantıksal Akıl Yürütme'],
    aiFocus: 'Soru çözme hızını analiz et ve mantıksal hataları minimize et.'
  },
  DIL: {
    id: 'DIL',
    title: 'Dil Eğitimi',
    icon: Globe,
    description: 'İngilizce, Almanca ve YDT Hazırlık',
    targetGroup: 'Dil Öğrencileri',
    lessons: ['Grammar', 'Vocabulary', 'Reading', 'Listening', 'Speaking'],
    features: ['CEFR Seviye Takibi', 'Kelime Ezber Kartları'],
    aiFocus: 'Konuşma ve anlama yetkinliğini CEFR standartlarına göre değerlendir.'
  },
  HAFIZLIK: {
    id: 'HAFIZLIK',
    title: 'Hafızlık',
    icon: Library,
    description: 'Kur\'an-ı Kerim Hafızlık Eğitimi Takibi',
    targetGroup: 'Hafız Adayları',
    lessons: ['Ezber (Has)', 'Tekrar (Pişirme)', 'Tecvid'],
    features: ['Sayfa Takibi', 'Hata Analizi'],
    aiFocus: 'Ezber performansını ölç ve unutma riskine karşı tekrar periyotları planla.'
  },
  AKADEMIK: {
    id: 'AKADEMIK',
    title: 'Akademik Destek',
    icon: Brain,
    description: 'Okul Dersleri ve Genel Akademik Gelişim',
    targetGroup: 'Ara Sınıf Öğrencileri',
    lessons: ['Matematik', 'Türkçe', 'Fen', 'Sosyal Bilgiler'],
    features: ['Okul Notu Takibi', 'Yazılı Hazırlık', 'Konu Eksikleri'],
    aiFocus: 'Okul başarısını artırmak için konu temelli eksikleri tamamla.'
  },
  MANUEL: {
    id: 'MANUEL',
    title: 'Manuel Mod',
    icon: Pencil,
    description: 'Kendi Derslerini ve Hedeflerini Kendin Belirle',
    targetGroup: 'Özel Çalışma Yapanlar',
    lessons: ['Özel Ders 1', 'Özel Ders 2'],
    features: ['Serbest Planlama', 'Kişisel Hedefler'],
    aiFocus: 'Kullanıcının tanımladığı özel hedeflere göre esnek analizler üret.'
  },
  DIGER: {
    id: 'DIGER',
    title: 'Diğer Sınavlar',
    icon: PlusCircle,
    description: 'MSÜ, TUS, DUS, YÖS, SAT, IB, TOEFL, IELTS vb.',
    targetGroup: 'Farklı Hedefleri Olanlar',
    lessons: ['Alan Bilgisi 1', 'Alan Bilgisi 2'],
    features: ['Geniş Yelpazeli Takip', 'Özel Analizler'],
    aiFocus: 'Seçilen özel sınav türüne göre genel başarı metriklerini uyarla.'
  }
};
