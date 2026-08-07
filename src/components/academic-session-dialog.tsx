'use client';

import { useState, useMemo, useEffect } from 'react';
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
} from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  CheckCircle, Clock, Book, PlaySquare, Zap, Target, 
  Layers, Brain, Sparkles, AlertTriangle, ShieldCheck, 
  ArrowRight, Timer, Bookmark, FileText, RefreshCcw, 
  Settings2, Hash
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AcademicSessionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (task: any) => void;
  selectedDay?: string;
  initialData?: any;
}

const MASTER_CURRICULUM: Record<string, Record<string, string[]>> = {
  'ÜNİVERSİTE (YKS)': {
    'TYT Matematik': ['Temel Kavramlar', 'Sayı Basamakları', 'Bölme Bölünebilme', 'OBEB OKEK', 'Rasyonel Sayılar', 'Basit Eşitsizlikler', 'Mutlak Değer', 'Üslü Sayılar', 'Köklü Sayılar', 'Çarpanlara Ayırma', 'Oran Orantı', 'Denklem Çözme', 'Problemler', 'Yaş Problemleri', 'Hareket Problemleri', 'İşçi Havuz Problemleri', 'Karışım Problemleri', 'Kümeler', 'Fonksiyonlar', 'Permütasyon', 'Kombinasyon', 'Olasılık', 'Veri', 'İstatistik'],
    'AYT Matematik': ['Fonksiyonlar', 'Polinomlar', 'İkinci Dereceden Denklemler', 'Parabol', 'Trigonometri', 'Logaritma', 'Diziler', 'Limit', 'Süreklilik', 'Türev', 'İntegral', 'Karmaşık Sayılar', 'Binom', 'Analitik Geometri'],
    'Geometri': ['Doğruda Açılar', 'Üçgenler', 'Dörtgenler', 'Çokgenler', 'Çember', 'Daire', 'Katı Cisimler', 'Analitik Geometri'],
    'Türkçe': ['Sözcükte Anlam', 'Cümlede Anlam', 'Paragraf', 'Ses Bilgisi', 'Yazım Kuralları', 'Noktalama', 'Fiiller', 'Zamir', 'Sıfat', 'Zarf', 'Edat', 'Bağlaç', 'Cümle Türleri', 'Anlatım Bozukluğu'],
    'Edebiyat': ['Şiir Bilgisi', 'İslamiyet Öncesi', 'Halk Edebiyatı', 'Divan Edebiyatı', 'Tanzimat', 'Servetifünun', 'Fecri Ati', 'Milli Edebiyat', 'Cumhuriyet Dönemi', 'Edebi Akımlar'],
    'Fizik': ['Fizik Bilimine Giriş', 'Hareket', 'Kuvvet', 'Enerji', 'Elektrik', 'Manyetizma', 'Basınç', 'Isı Sıcaklık', 'Dalgalar', 'Optik'],
    'Kimya': ['Kimya Bilimi', 'Atom', 'Periyodik Sistem', 'Kimyasal Türler', 'Mol', 'Gazlar', 'Çözeltiler', 'Kimyasal Tepkimeler', 'Organik Kimya'],
    'Biyoloji': ['Hücre', 'Canlıların Ortak Özellikleri', 'Kalıtım', 'Ekoloji', 'Sistemler', 'DNA RNA', 'Fotosentez', 'Solunum', 'Bitki Biyolojisi'],
  },
  'KAMU (KPSS)': {
    'Genel Yetenek': ['Sözel Mantık', 'Sayısal Mantık', 'Matematik', 'Türkçe'],
    'Genel Kültür': ['Tarih', 'Coğrafya', 'Vatandaşlık', 'Güncel Bilgiler'],
  }
};

const STUDY_TYPES = [
  { id: 'new', label: 'Yeni Konu', color: 'bg-blue-500' },
  { id: 'review', label: 'Konu Tekrarı', color: 'bg-amber-500' },
  { id: 'questions', label: 'Soru Çözümü', color: 'bg-emerald-500' },
  { id: 'exam', label: 'Deneme', color: 'bg-rose-500' },
  { id: 'analysis', label: 'Deneme Analizi', color: 'bg-indigo-500' },
  { id: 'camp', label: 'Kamp', color: 'bg-purple-500' },
];

const BOOKS = ['3D', '345', 'Orijinal', 'Bilgi Sarmal', 'Limit', 'Apotemi', 'Benim Hocam', 'Hız ve Renk', 'Karekök'];

export function AcademicSessionDialog({ isOpen, onOpenChange, onSave, selectedDay = 'Pazartesi', initialData }: AcademicSessionDialogProps) {
  const [mode, setMode] = useState<'manual' | 'ai'>('manual');
  const [exam, setExam] = useState<string>('ÜNİVERSİTE (YKS)');
  const [subject, setSubject] = useState(initialData?.subject || '');
  const [topic, setTopic] = useState(initialData?.topic || '');
  const [difficulty, setDifficulty] = useState(initialData?.difficulty || 'medium');
  const [priority, setPriority] = useState(initialData?.priority || 'normal');
  const [studyType, setStudyType] = useState(initialData?.studyType || 'new');
  const [isSpacedRepetition, setIsSpacedRepetition] = useState(false);

  const subjects = useMemo(() => MASTER_CURRICULUM[exam] || {}, [exam]);
  const topics = useMemo(() => subjects[subject] || [], [subject, subjects]);

  const xpValue = useMemo(() => {
    const map = { easy: 25, medium: 50, hard: 75 };
    let val = map[difficulty as keyof typeof map] || 50;
    if (studyType === 'exam') val = 150;
    return val;
  }, [difficulty, studyType]);

  const estimatedNet = useMemo(() => (xpValue / 250).toFixed(2), [xpValue]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const data = {
      time: formData.get('time'),
      duration: formData.get('duration'),
      exam,
      subject,
      topic: topic || formData.get('manualTopic'),
      subtopic: formData.get('subtopic'),
      difficulty,
      priority,
      studyType,
      xp: xpValue,
      book: formData.get('book'),
      bookUrl: formData.get('bookUrl'),
      youtubeUrl: formData.get('youtubeUrl'),
      isSpacedRepetition,
      status: initialData?.status || 'pending',
      createdAt: new Date().toISOString(),
    };
    onSave(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-[4rem] border-none shadow-[0_80px_160px_-40px_rgba(15,23,42,0.4)] p-0 bg-white max-w-5xl overflow-hidden animate-in zoom-in-95 duration-500">
        <div className="grid lg:grid-cols-[1fr_340px]">
          
          {/* MAIN FORM AREA */}
          <div className="p-12 space-y-10">
            <DialogHeader className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-primary text-white font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 italic">
                  <ShieldCheck className="h-3.5 w-3.5 text-accent" /> AOS Terminal v4.8
                </div>
                <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-2">
                   <button onClick={() => setMode('ai')} className={cn("px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all", mode === 'ai' ? "bg-white text-primary shadow-sm scale-105" : "text-muted-foreground hover:bg-white/50")}>🤖 AI Planlasın</button>
                   <button onClick={() => setMode('manual')} className={cn("px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all", mode === 'manual' ? "bg-white text-primary shadow-sm scale-105" : "text-muted-foreground hover:bg-white/50")}>✍️ Manuel</button>
                </div>
              </div>
              <DialogTitle className="text-6xl font-black italic tracking-tighter text-primary uppercase leading-none">
                YENİ <span className="text-accent">SEANS</span>
              </DialogTitle>
              <DialogDescription className="font-medium italic text-lg opacity-40">
                {selectedDay} günü akademik çalışma oturumunu oluştur.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} id="session-form" className="space-y-12">
               {/* 1. PLANLAMA BİLGİLERİ */}
               <div className="space-y-6">
                  <div className="flex items-center gap-4 text-primary opacity-20">
                     <Settings2 className="h-5 w-5" />
                     <span className="text-[11px] font-black uppercase tracking-[0.4em]">Planlama Bilgileri</span>
                     <div className="h-px flex-1 bg-current opacity-10"></div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                     <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Başlangıç</Label>
                        <Input name="time" type="time" defaultValue={initialData?.time || '09:00'} className="h-16 rounded-2xl bg-slate-50 border-none shadow-inner font-black text-xl text-center" />
                     </div>
                     <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Süre</Label>
                        <Input name="duration" placeholder="45 dk" defaultValue={initialData?.duration || '45 dk'} className="h-16 rounded-2xl bg-slate-50 border-none shadow-inner font-bold text-center" />
                     </div>
                     <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Öncelik</Label>
                        <Select value={priority} onValueChange={setPriority}>
                           <SelectTrigger className="h-16 rounded-2xl bg-slate-50 border-none shadow-inner font-bold">
                              <SelectValue />
                           </SelectTrigger>
                           <SelectContent className="rounded-2xl">
                              <SelectItem value="low">Düşük</SelectItem>
                              <SelectItem value="normal">Normal</SelectItem>
                              <SelectItem value="high">Yüksek</SelectItem>
                           </SelectContent>
                        </Select>
                     </div>
                     <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Çalışma Türü</Label>
                        <Select value={studyType} onValueChange={setStudyType}>
                           <SelectTrigger className="h-16 rounded-2xl bg-slate-50 border-none shadow-inner font-bold">
                              <SelectValue />
                           </SelectTrigger>
                           <SelectContent className="rounded-2xl">
                              {STUDY_TYPES.map(t => <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>)}
                           </SelectContent>
                        </Select>
                     </div>
                  </div>
               </div>

               {/* 2. AKADEMİK BİLGİLER */}
               <div className="space-y-6">
                  <div className="flex items-center gap-4 text-primary opacity-20">
                     <Layers className="h-5 w-5" />
                     <span className="text-[11px] font-black uppercase tracking-[0.4em]">Akademik Bilgiler</span>
                     <div className="h-px flex-1 bg-current opacity-10"></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                     <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Sınav / Program</Label>
                        <Select value={exam} onValueChange={setExam}>
                           <SelectTrigger className="h-16 rounded-2xl bg-white border-2 border-slate-100 shadow-sm font-black text-[11px] uppercase tracking-widest">
                              <SelectValue />
                           </SelectTrigger>
                           <SelectContent className="rounded-2xl shadow-2xl border-none">
                              {Object.keys(MASTER_CURRICULUM).map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                           </SelectContent>
                        </Select>
                     </div>
                     <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Branş</Label>
                        <Select value={subject} onValueChange={setSubject}>
                           <SelectTrigger className="h-16 rounded-2xl bg-white border-2 border-slate-100 shadow-sm font-black text-[11px] uppercase tracking-widest">
                              <SelectValue placeholder="Ders Seç" />
                           </SelectTrigger>
                           <SelectContent className="rounded-2xl shadow-2xl border-none">
                              {Object.keys(subjects).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                           </SelectContent>
                        </Select>
                     </div>
                     <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Konu</Label>
                        <Select value={topic} onValueChange={setTopic} disabled={!subject}>
                           <SelectTrigger className="h-16 rounded-2xl bg-white border-2 border-slate-100 shadow-sm font-bold text-sm">
                              <SelectValue placeholder="Konu Seç" />
                           </SelectTrigger>
                           <SelectContent className="rounded-2xl shadow-2xl border-none max-h-[300px]">
                              {topics.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                           </SelectContent>
                        </Select>
                     </div>
                     <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Alt Konu</Label>
                        <Input name="subtopic" placeholder="Detay kazanım..." className="h-16 rounded-2xl bg-slate-50 border-none shadow-inner font-medium text-sm" />
                     </div>
                  </div>
               </div>

               {/* 3. KAYNAKLAR & HEDEFLER */}
               <div className="grid md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                     <div className="flex items-center gap-4 text-primary opacity-20">
                        <Bookmark className="h-5 w-5" />
                        <span className="text-[11px] font-black uppercase tracking-[0.4em]">Kaynak</span>
                        <div className="h-px flex-1 bg-current opacity-10"></div>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <Select name="book">
                           <SelectTrigger className="h-14 rounded-xl bg-slate-50 border-none shadow-inner font-bold">
                              <SelectValue placeholder="Kitap Seç" />
                           </SelectTrigger>
                           <SelectContent className="rounded-xl">
                              {BOOKS.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                           </SelectContent>
                        </Select>
                        <div className="flex gap-2">
                           <Input name="youtubeUrl" placeholder="Playlist Link..." className="h-14 rounded-xl bg-rose-50 border-none shadow-inner text-xs" />
                        </div>
                     </div>
                  </div>
                  <div className="space-y-6">
                     <div className="flex items-center gap-4 text-primary opacity-20">
                        <Target className="h-5 w-5" />
                        <span className="text-[11px] font-black uppercase tracking-[0.4em]">Zorluk</span>
                        <div className="h-px flex-1 bg-current opacity-10"></div>
                     </div>
                     <div className="flex gap-3">
                        {['easy', 'medium', 'hard'].map((d) => (
                           <button
                             key={d}
                             type="button"
                             onClick={() => setDifficulty(d)}
                             className={cn(
                               "flex-1 py-4 rounded-2xl border-2 transition-all font-black text-[10px] uppercase tracking-widest",
                               difficulty === d 
                                 ? "bg-primary text-white border-primary shadow-lg scale-105" 
                                 : "bg-slate-50 text-muted-foreground border-transparent hover:bg-white hover:border-slate-200"
                             )}
                           >
                              {d === 'easy' ? 'Kolay' : d === 'medium' ? 'Orta' : 'Zor'}
                           </button>
                        ))}
                     </div>
                  </div>
               </div>
            </form>
          </div>

          {/* SIDEBAR ANALYTICS AREA */}
          <div className="bg-slate-50 p-10 border-l border-primary/5 space-y-10 flex flex-col justify-between">
             <div className="space-y-10">
                {/* AI RECOMMENDATION CARD */}
                <Card className="rounded-[2.5rem] border-none bg-primary text-white p-8 space-y-6 relative overflow-hidden group shadow-2xl">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-accent/20 blur-[60px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
                   <div className="flex items-center gap-3 relative z-10">
                      <Sparkles className="h-5 w-5 text-accent animate-pulse" />
                      <span className="text-[9px] font-black uppercase tracking-[0.3em] opacity-40">AI ÖNERİSİ</span>
                   </div>
                   <p className="text-sm font-bold italic leading-relaxed relative z-10">
                      "Son denemende <span className="text-accent underline">Fonksiyonlar</span> başarısı %48'de kaldı. Bugün bu konuyu çalışmanı öneririm."
                   </p>
                   <Button size="sm" className="w-full h-11 rounded-xl bg-white/10 hover:bg-white/20 text-white font-black text-[9px] uppercase tracking-widest border border-white/10">AI İLE OLUŞTUR</Button>
                </Card>

                {/* SPACED REPETITION SWITCH */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-primary/5 space-y-6 shadow-sm">
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <RefreshCcw className="h-5 w-5 text-accent" />
                         <span className="font-black text-[11px] uppercase tracking-widest text-primary">OTOMATİK TEKRAR</span>
                      </div>
                      <Switch checked={isSpacedRepetition} onCheckedChange={setIsSpacedRepetition} />
                   </div>
                   {isSpacedRepetition && (
                      <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-top-2">
                         {[1, 3, 7, 14, 30].map(d => (
                            <Badge key={d} variant="outline" className="bg-slate-50 border-none font-black text-[9px] px-3 py-1 text-primary/40 italic">+{d} GÜN</Badge>
                         ))}
                      </div>
                   )}
                </div>

                {/* TAHMİNİ KAZANIM PANEL */}
                <div className="space-y-6">
                   <span className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/40 ml-4 italic">TAHMİNİ KAZANIM</span>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white p-6 rounded-[2rem] border border-primary/5 text-center shadow-sm">
                         <p className="text-[9px] font-black text-muted-foreground uppercase mb-1">XP</p>
                         <p className="text-3xl font-black text-primary italic tracking-tighter">+{xpValue}</p>
                      </div>
                      <div className="bg-white p-6 rounded-[2rem] border border-primary/5 text-center shadow-sm">
                         <p className="text-[9px] font-black text-muted-foreground uppercase mb-1">NET KATKISI</p>
                         <p className="text-3xl font-black text-accent italic tracking-tighter">+{estimatedNet}</p>
                      </div>
                   </div>
                </div>
             </div>

             <div className="space-y-4">
                <Button 
                  type="submit" 
                  form="session-form"
                  className="w-full h-24 rounded-[2.5rem] bg-primary hover:bg-accent transition-all duration-700 font-black text-sm uppercase tracking-[0.4em] gap-6 shadow-[0_40px_80px_-20px_rgba(15,23,42,0.45)] text-white group/btn"
                >
                   <Zap className="h-6 w-6 text-accent group-hover/btn:animate-pulse" />
                   TERMİNALE İŞLE
                </Button>
                <Button variant="ghost" onClick={() => onOpenChange(false)} className="w-full font-black text-[10px] uppercase tracking-widest text-muted-foreground">İptal Et</Button>
             </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
