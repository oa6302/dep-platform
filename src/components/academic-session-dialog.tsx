
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle, Clock, Book, PlaySquare, Zap, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AcademicSessionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (task: any) => void;
  selectedDay?: string;
  initialData?: any;
}

const YKS_CURRICULUM: Record<string, string[]> = {
  'TYT Matematik': ['Temel Kavramlar', 'Sayı Basamakları', 'Bölme Bölünebilme', 'OBEB OKEK', 'Rasyonel Sayılar', 'Basit Eşitsizlikler', 'Mutlak Değer', 'Üslü Sayılar', 'Köklü Sayılar', 'Çarpanlara Ayırma', 'Oran Orantı', 'Denklem Çözme', 'Problemler', 'Kümeler', 'Fonksiyonlar', 'Permütasyon', 'Kombinasyon', 'Olasılık', 'Veri/İstatistik'],
  'AYT Matematik': ['Fonksiyonlar', 'Polinomlar', 'İkinci Dereceden Denklemler', 'Parabol', 'Trigonometri', 'Logaritma', 'Diziler', 'Limit', 'Süreklilik', 'Türev', 'İntegral', 'Karmaşık Sayılar', 'Binom'],
  'Geometri': ['Doğruda Açılar', 'Üçgenler', 'Dörtgenler', 'Çokgenler', 'Çember', 'Daire', 'Katı Cisimler', 'Analitik Geometri'],
  'Türkçe': ['Sözcükte Anlam', 'Cümlede Anlam', 'Paragraf', 'Ses Bilgisi', 'Yazım Kuralları', 'Noktalama', 'Fiiller', 'Sözcük Türleri', 'Cümle Türleri', 'Anlatım Bozukluğu'],
  'Edebiyat': ['Şiir Bilgisi', 'İslamiyet Öncesi', 'Halk Edebiyatı', 'Divan Edebiyatı', 'Tanzimat', 'Servetifünun', 'Fecri Ati', 'Milli Edebiyat', 'Cumhuriyet Dönemi', 'Edebi Akımlar'],
  'Tarih': ['İlk Çağ', 'İslam Tarihi', 'Osmanlı Kuruluş', 'Osmanlı Yükselme', 'Osmanlı Duraklama', 'Islahatlar', 'Kurtuluş Savaşı', 'Atatürk İlkeleri', 'Çağdaş Türk Tarihi'],
  'Coğrafya': ['Harita Bilgisi', 'Dünyanın Şekli', 'İklim', 'Nüfus', 'Göçler', 'Yerleşme', 'Tarım', 'Sanayi', 'Türkiye Coğrafyası'],
  'Felsefe': ['Bilgi Felsefesi', 'Varlık Felsefesi', 'Ahlak Felsefesi', 'Siyaset Felsefesi', 'Din Felsefesi', 'Bilim Felsefesi'],
  'Din Kültürü': ['İnanç', 'İbadet', 'Ahlak', 'Kur\'an', 'Hz. Muhammed', 'İslam Düşüncesi'],
  'Fizik': ['Hareket', 'Kuvvet', 'Enerji', 'Elektrik', 'Manyetizma', 'Basınç', 'Isı Sıcaklık', 'Dalgalar', 'Optik'],
  'Kimya': ['Kimya Bilimi', 'Atom', 'Periyodik Sistem', 'Kimyasal Türler', 'Mol', 'Gazlar', 'Çözeltiler', 'Kimyasal Tepkimeler', 'Organik Kimya'],
  'Biyoloji': ['Hücre', 'Canlıların Ortak Özellikleri', 'Kalıtım', 'Ekoloji', 'Sistemler', 'DNA RNA', 'Fotosentez', 'Solunum', 'Bitki Biyolojisi'],
};

export function AcademicSessionDialog({ isOpen, onOpenChange, onSave, selectedDay = 'Pazartesi', initialData }: AcademicSessionDialogProps) {
  const [subject, setSubject] = useState(initialData?.subject || '');
  const [topic, setTopic] = useState(initialData?.topic || '');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      time: formData.get('time'),
      duration: formData.get('duration'),
      subject: subject,
      topic: topic || formData.get('manualTopic'),
      bookUrl: formData.get('bookUrl'),
      youtubeUrl: formData.get('youtubeUrl'),
      status: initialData?.status || 'pending',
    };
    onSave(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-[4rem] border-none shadow-[0_80px_160px_-40px_rgba(15,23,42,0.4)] p-12 bg-white max-w-2xl animate-in zoom-in-95 duration-500">
        <DialogHeader className="space-y-4 text-center">
          <DialogTitle className="text-5xl font-black italic tracking-tighter text-primary uppercase leading-none">
            {initialData ? 'SEANSI DÜZENLE' : 'YENİ SEANS'}
          </DialogTitle>
          <DialogDescription className="font-medium italic text-lg opacity-40">
            {selectedDay} Günü Akademik Veri Girişi
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-10 pt-10">
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-3">
              <Label className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 ml-4 italic">BAŞLANGIÇ SAATİ</Label>
              <div className="relative group">
                <Clock className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-accent transition-colors" />
                <Input name="time" type="time" required defaultValue={initialData?.time || '09:00'} className="h-20 rounded-[2rem] bg-slate-50 border-none shadow-inner font-black text-2xl text-center pl-10 focus-visible:bg-white transition-all" />
              </div>
            </div>
            <div className="space-y-3">
              <Label className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 ml-4 italic">SÜRE</Label>
              <Input name="duration" required placeholder="45 dk" defaultValue={initialData?.duration || '45 dk'} className="h-20 rounded-[2rem] bg-slate-50 border-none shadow-inner font-bold text-xl text-center focus-visible:bg-white transition-all" />
            </div>
          </div>
          
          <div className="space-y-3">
            <Label className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 ml-4 italic">AKADEMİK BRANŞ</Label>
            <Select value={subject} onValueChange={(val) => { setSubject(val); setTopic(''); }}>
              <SelectTrigger className="h-20 rounded-[2rem] bg-slate-50 border-none shadow-inner font-black text-xl px-8 focus:ring-accent">
                <SelectValue placeholder="Ders Seçiniz" />
              </SelectTrigger>
              <SelectContent className="rounded-[2.5rem] border-none shadow-2xl p-4 max-h-[400px]">
                {Object.keys(YKS_CURRICULUM).map(s => (
                  <SelectItem key={s} value={s} className="font-bold py-4 rounded-xl">{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 ml-4 italic">KONU BAŞLIĞI</Label>
            {subject && YKS_CURRICULUM[subject] ? (
              <Select value={topic} onValueChange={setTopic}>
                <SelectTrigger className="h-20 rounded-[2rem] bg-slate-50 border-none shadow-inner font-bold text-lg px-8">
                  <SelectValue placeholder="Konu Seçiniz" />
                </SelectTrigger>
                <SelectContent className="rounded-[2.5rem] border-none shadow-2xl p-4 max-h-[400px]">
                  {YKS_CURRICULUM[subject].map(t => (
                    <SelectItem key={t} value={t} className="font-medium py-3 rounded-xl">{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input name="manualTopic" required placeholder="Çalışılacak spesifik konu..." defaultValue={initialData?.topic} className="h-20 rounded-[2rem] bg-slate-50 border-none shadow-inner font-bold text-lg px-8 focus-visible:bg-white transition-all" />
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-accent ml-4 italic">KAYNAK / PDF LİNKİ</Label>
              <div className="relative group">
                <Book className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-accent/40" />
                <Input name="bookUrl" placeholder="https://..." defaultValue={initialData?.bookUrl} className="h-16 rounded-2xl bg-slate-50 border-none shadow-inner font-medium text-sm pl-12 focus-visible:bg-white transition-all" />
              </div>
            </div>
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-500 ml-4 italic">OYNATMA LİSTESİ LİNKİ</Label>
              <div className="relative group">
                <PlaySquare className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-rose-500/40" />
                <Input name="youtubeUrl" placeholder="https://..." defaultValue={initialData?.youtubeUrl} className="h-16 rounded-2xl bg-slate-50 border-none shadow-inner font-medium text-sm pl-12 focus-visible:bg-white transition-all" />
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full h-28 rounded-[3.5rem] bg-primary hover:bg-accent transition-all duration-500 font-black text-2xl uppercase tracking-[0.3em] gap-8 shadow-[0_40px_80px_-20px_rgba(15,23,42,0.4)] group/btn">
            <Zap className="h-10 w-10 text-accent group-hover/btn:animate-pulse" />
            GÖREVİ ONAYLA
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
