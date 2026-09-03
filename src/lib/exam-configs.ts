import { 
  GraduationCap, 
  Trophy, 
  Target, 
  Brain, 
  Sparkles, 
  Globe, 
  Landmark, 
  Star
} from 'lucide-react';

/**
 * @fileOverview Sınav konfigürasyonları ve ders eşleşmeleri.
 */
export const EXAM_CONFIGS: Record<string, any> = {
  'YKS_EA': {
    id: 'YKS_EA',
    title: 'YKS EŞİT AĞIRLIK (TM)',
    category: 'ÜNİVERSİTE',
    description: 'Hukuk, İşletme, Psikoloji hedefleri için saniyeler içinde TM odaklı terminal.',
    targetGroup: '12. Sınıf & Mezun',
    icon: GraduationCap,
    lessons: ['TYT Türkçe', 'TYT Matematik', 'AYT Matematik', 'Edebiyat', 'Tarih', 'Coğrafya', 'Felsefe']
  },
  'YKS_SAY': {
    id: 'YKS_SAY',
    title: 'YKS SAYISAL (MF)',
    category: 'ÜNİVERSİTE',
    description: 'Tıp ve Mühendislik hedefleri için saniyeler içinde analitik planlama terminali.',
    targetGroup: '12. Sınıf & Mezun',
    icon: Brain,
    lessons: ['TYT Türkçe', 'TYT Matematik', 'AYT Matematik', 'Fizik', 'Kimya', 'Biyoloji']
  },
  'YKS_SOZ': {
    id: 'YKS_SOZ',
    title: 'YKS SÖZEL (TS)',
    category: 'ÜNİVERSİTE',
    description: 'İletişim ve Sanat bölümleri için saniyeler içinde sözel odaklı terminal.',
    targetGroup: '12. Sınıf & Mezun',
    icon: Sparkles,
    lessons: ['TYT Türkçe', 'TYT Matematik', 'Edebiyat', 'Tarih', 'Coğrafya', 'Felsefe']
  },
  'KPSS_LISANS': {
    id: 'KPSS_LISANS',
    title: 'KPSS LİSANS 2026',
    category: 'KAMU SINAVLARI',
    description: 'Kamu personeli alımı için saniyeler içinde Genel Yetenek ve Genel Kültür kampı.',
    targetGroup: 'Lisans Mezunları',
    icon: Landmark,
    lessons: ['Matematik', 'Türkçe', 'Tarih', 'Coğrafya', 'Vatandaşlık', 'Güncel Bilgiler']
  },
  'ALES_2026': {
    id: 'ALES_2026',
    title: 'ALES 2026',
    category: 'AKADEMİK',
    description: 'Yüksek lisans ve doktora başvuruları için saniyeler içinde hız odaklı terminal.',
    targetGroup: 'Akademisyen Adayları',
    icon: Trophy,
    lessons: ['Sayısal Mantık', 'Sözel Mantık', 'Matematik', 'Türkçe']
  },
  'LGS_2026': {
    id: 'LGS_2026',
    title: 'LGS 2026',
    category: 'ORTAOKUL',
    description: 'Fen ve Anadolu Liseleri için saniyeler içinde 8. sınıf hazırlık terminali.',
    targetGroup: '8. Sınıf Öğrencileri',
    icon: Star,
    lessons: ['Matematik', 'Türkçe', 'Fen Bilimleri', 'İnkılap Tarihi', 'İngilizce']
  },
  'DGS_2026': {
    id: 'DGS_2026',
    title: 'DGS 2026',
    category: 'ÜNİVERSİTE',
    description: 'Önlisanstan lisansa dikey geçiş için saniyeler içinde sayısal ve sözel planlama.',
    targetGroup: 'Önlisans Mezunları',
    icon: Target,
    lessons: ['Matematik', 'Türkçe', 'Sayısal Mantık', 'Sözel Mantık']
  },
  'YDS_YOKDIL': {
    id: 'YDS_YOKDIL',
    title: 'YDS / YÖKDİL',
    category: 'YABANCI DİL',
    description: 'Akademik dil yeterliliği için saniyeler içinde gramer ve okuma terminali.',
    targetGroup: 'Tüm Adaylar',
    icon: Globe,
    lessons: ['Gramer', 'Kelime Bilgisi', 'Okuma Anlama']
  }
};
