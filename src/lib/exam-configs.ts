
import { 
  GraduationCap
} from 'lucide-react';

/**
 * @fileOverview Sadece YKS Eşit Ağırlık (TM) konfigürasyonu.
 * Akademik Yıl: 1 Eylül 2026 - 15 Haziran 2027
 */
export const EXAM_CONFIGS: Record<string, any> = {
  'YKS_EA': {
    id: 'YKS_EA',
    title: 'YKS EŞİT AĞIRLIK (TM)',
    category: 'ÜNİVERSİTE',
    description: 'Hukuk, İşletme ve Psikoloji hedefleri için saniyeler içinde TM odaklı otonom terminal.',
    targetGroup: '12. Sınıf & Mezun',
    icon: GraduationCap,
    academicYearStart: '2026-09-01',
    aytStartDate: '2026-12-01',
    examDate: '2027-06-15',
    tytLessons: ['TYT Türkçe', 'TYT Matematik', 'TYT Tarih', 'TYT Coğrafya', 'TYT Felsefe', 'TYT Din'],
    aytLessons: ['AYT Matematik', 'Edebiyat', 'AYT Tarih', 'AYT Coğrafya'],
    lessons: ['TYT Türkçe', 'TYT Matematik', 'AYT Matematik', 'Edebiyat', 'Tarih', 'Coğrafya', 'Felsefe']
  }
};
