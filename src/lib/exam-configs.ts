
import { 
  GraduationCap
} from 'lucide-react';

/**
 * @fileOverview Sadece YKS Eşit Ağırlık (TM) konfigürasyonu ve 2027 sınav tarihi.
 */
export const EXAM_CONFIGS: Record<string, any> = {
  'YKS_EA': {
    id: 'YKS_EA',
    title: 'YKS EŞİT AĞIRLIK (TM)',
    category: 'ÜNİVERSİTE',
    description: 'Hukuk, İşletme ve Psikoloji hedefleri için saniyeler içinde TM odaklı otonom terminal.',
    targetGroup: '12. Sınıf & Mezun',
    icon: GraduationCap,
    examDate: '2027-06-15',
    lessons: ['TYT Türkçe', 'TYT Matematik', 'AYT Matematik', 'Edebiyat', 'Tarih', 'Coğrafya', 'Felsefe']
  }
};
