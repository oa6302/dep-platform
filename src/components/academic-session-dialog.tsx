'use client';

import { useState, useMemo } from 'react';
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
import {
  Card,
} from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  CheckCircle, Zap, Target, 
  Layers, Brain, Sparkles, ShieldCheck, 
  Bookmark, RefreshCcw, 
  Settings2, Calendar as CalendarIcon,
  Loader2,
  Hash,
  PlaySquare,
  Book
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';

interface AcademicSessionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (task: any) => void;
  selectedDay?: string;
  initialData?: any;
}

const MASTER_CURRICULUM: Record<string, Record<string, string[]>> = {
  'KPSS ORTAÖĞRETİM 2026': {
    'Matematik': [
      'Temel Kavramlar', 
      'Rakam ve Sayı Kümeleri',
      'Tek ve Çift Sayılar',
      'Pozitif ve Negatif Sayılar',
      'Ardışık Sayılar',
      'Faktöriyel',
      'Sayı Basamakları',
      'Bölme ve Bölünebilme Kuralları',
      'Asal Sayılar',
      'EBOB - EKOK',
      'Rasyonel Sayılar',
      'Ondalık Sayılar',
      'Basit Eşitsizlikler',
      'Mutlak Değer',
      'Üslü Sayılar',
      'Köklü Sayılar',
      'Çarpanlara Ayırma',
      'Oran - Orantı',
      'Denklem Çözme',
      'Sayı Problemleri',
      'Kesir Problemleri',
      'Yaş Problemleri',
      'İşçi Problemleri',
      'Hız ve Hareket Problemleri',
      'Yüzde, Kar ve Zarar Problemleri',
      'Karışım Problemleri',
      'Grafik Problemleri',
      'Kümeler',
      'Fonksiyonlar',
      'Permütasyon - Kombinasyon',
      'Olasılık',
      'Sayısal Mantık'
    ],
    'Geometri': [
      'Doğruda ve Üçgende Açılar',
      'Özel Üçgenler',
      'Üçgende Alan',
      'Üçgende Benzerlik',
      'Çokgenler ve Dörtgenler',
      'Çember ve Daire',
      'Analitik Geometri',
      'Katı Cisimler'
    ],
    'Türkçe': ['Sözcükte Anlam', 'Cümlede Anlam', 'Paragraf', 'Dil Bilgisi', 'Yazım ve Noktalama', 'Sözel Mantık'],
    'Tarih': ['İslamiyet Öncesi Türk Tarihi', 'Türk-İslam Tarihi', 'Osmanlı Siyasi Tarihi', 'Osmanlı Kültür ve Medeniyet', 'Kurtuluş Savaşı', 'Atatürk İlkeleri', 'Atatürk İnkılapları', 'Çağdaş Türk ve Dünya Tarihi'],
    'Coğrafya': ['Türkiye’nin Yerşekilleri', 'Türkiye’nin İklimi', 'Türkiye’de Nüfus', 'Türkiye’de Tarım ve Hayvancılık', 'Türkiye’de Madenler', 'Türkiye’de Sanayi ve Ulaşım'],
    'Vatandaşlık': ['Hukukun Temel Kavramları', 'Devlet ve Hükümet Sistemleri', 'Anayasa Tarihi', '1982 Anayasası', 'İdare Hukuku', 'Güncel Bilgiler']
  },
  'YKS SAYISAL 2026': {
    'TYT Matematik': ['Temel Kavramlar', 'Sayılar', 'Bölünebilme', 'Rasyonel Sayılar', 'Eşitsizlikler', 'Mutlak Değer', 'Üslü Sayılar', 'Köklü Sayılar', 'Çarpanlara Ayırma', 'Oran-Orantı', 'Problemler', 'Kümeler', 'Fonksiyonlar', 'Permütasyon-Kombinasyon', 'Olasılık', 'İstatistik'],
    'AYT Matematik': ['Trigonometri', 'Logaritma', 'Diziler', 'Limit', 'Türev', 'İntegral'],
    'Fizik': ['Vektörler', 'Kuvvet ve Hareket', 'Enerji', 'Elektrik ve Manyetizma', 'Dalgalar', 'Optik', 'Modern Fizik'],
    'Kimya': ['Atom ve Periyodik Sistem', 'Kimyasal Türler', 'Sıvı Çözeltiler', 'Enerji', 'Hız', 'Denge', 'Organik Kimya'],
    'Biyoloji': ['Hücre', 'Kalıtım', 'Ekoloji', 'Sistemler', 'Bitki Biyolojisi']
  },
  'YKS EŞİT AĞIRLIK 2026': {
    'TYT Matematik': ['Temel Kavramlar', 'Sayılar', 'Bölünebilme', 'Rasyonel Sayılar', 'Eşitsizlikler', 'Mutlak Değer', 'Üslü Sayılar', 'Köklü Sayılar', 'Çarpanlara Ayırma', 'Oran-Orantı', 'Problemler'],
    'AYT Matematik': ['Trigonometri', 'Logaritma', 'Diziler', 'Limit', 'Türev', 'İntegral'],
    'Edebiyat': ['Şiir Bilgisi', 'Edebi Sanatlar', 'İslamiyet Öncesi', 'Halk Edebiyatı', 'Divan Edebiyatı', 'Tanzimat', 'Servet-i Fünun', 'Cumhuriyet Dönemi'],
    'Tarih': ['İslam Tarihi', 'Osmanlı Tarihi', 'İnkılap Tarihi'],
    'Coğrafya': ['Ekosistem', 'Beşeri Sistemler', 'Küresel Ortam'],
    'Türkçe': ['Paragraf', 'Cümlede Anlam', 'Yazım Kuralları']
  }
};

const STUDY_TYPES = [
  { id: 'new', label: 'Yeni Konu', color: 'bg-blue-500' },
  { id: 'review', label: 'Konu Tekrarı', color: 'bg-amber-500' },
  { id: 'questions', label: 'Soru Çözümü', color: 'bg-emerald-500' },
  { id: 'exam', label: 'Deneme', color: 'bg-rose-500' },
  { id: 'analysis', label: 'Deneme Analizi', color: 'bg-indigo-500' },
];

export function AcademicSessionDialog({ isOpen, onOpenChange, onSave, selectedDay = 'Pazartesi', initialData }: AcademicSessionDialogProps) {
  const [mode, setMode] = useState<'manual' | 'ai'>('manual');
  const [exam, setExam] = useState<string>(initialData?.exam || 'YKS EŞİT AĞIRLIK 2026');
  const [subject, setSubject] = useState(initialData?.subject || '');
  const [topic, setTopic] = useState(initialData?.topic || '');
  const [difficulty, setDifficulty] = useState(initialData?.difficulty || 'medium');
  const [priority, setPriority] = useState(initialData?.priority || 'normal');
  const [studyType, setStudyType] = useState(initialData?.studyType || 'new');
  const [startTime, setStartTime] = useState(initialData?.time || '09:00');
  const [questionCount, setQuestionCount] = useState(initialData?.questionCount?.toString() || '0');
  const [isAiLoading, setIsAiLoading] = useState(false);

  const subjects = useMemo(() => MASTER_CURRICULUM[exam] || {}, [exam]);
  const topics = useMemo(() => subjects[subject] || [], [subject, subjects]);

  const xpValue = useMemo(() => {
    const map = { easy: 25, medium: 50, hard: 75 };
    let val = map[difficulty as keyof typeof map] || 50;
    if (studyType === 'exam') val = 150;
    if (studyType === 'questions') val += Math.floor(parseInt(questionCount || '0') / 2);
    return val;
  }, [difficulty, studyType, questionCount]);

  const handleApplyAiRecommendation = () => {
    setIsAiLoading(true);
    setTimeout(() => {
      setMode('ai');
      setSubject(Object.keys(subjects)[0]);
      setTopic(topics[0] || 'Genel Tekrar');
      setDifficulty('medium');
      setStudyType('questions');
      setQuestionCount('40');
      setStartTime('10:00');
      setIsAiLoading(false);
    }, 800);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const data = {
      time: startTime,
      duration: formData.get('duration'),
      exam,
      subject,
      topic,
      difficulty,
      priority,
      studyType,
      questionCount: parseInt(questionCount || '0'),
      xp: xpValue,
      youtubeUrl: formData.get('youtubeUrl'),
      bookUrl: formData.get('bookUrl'),
      status: initialData?.status || 'pending',
      createdAt: new Date().toISOString(),
    };
    onSave(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-[4rem] border-none shadow-2xl p-0 bg-white max-w-5xl overflow-hidden">
        <div className="grid lg:grid-cols-[1fr_340px]">
          <div className="p-12 space-y-10">
            <DialogHeader className="space-y-4">
              <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-primary text-white font-black text-[10px] uppercase tracking-widest shadow-xl italic">
                <ShieldCheck className="h-3.5 w-3.5 text-accent" /> AOS Terminal v4.8
              </div>
              <DialogTitle className="text-6xl font-black italic tracking-tighter text-primary uppercase leading-none">
                YENİ <span className="text-accent">SEANS</span>
              </DialogTitle>
              <DialogDescription className="font-medium italic text-lg opacity-40">
                {selectedDay} günü çalışma oturumunu alanınıza göre oluşturun.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} id="session-form" className="space-y-12">
               <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="space-y-2">
                     <Label className="text-[10px] font-black uppercase tracking-widest opacity-40">Başlangıç</Label>
                     <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="h-16 rounded-2xl bg-slate-50 border-none shadow-inner font-black text-xl text-center" />
                  </div>
                  <div className="space-y-2">
                     <Label className="text-[10px] font-black uppercase tracking-widest opacity-40">Süre</Label>
                     <Input name="duration" placeholder="45 dk" defaultValue={initialData?.duration || '45 dk'} className="h-16 rounded-2xl bg-slate-50 border-none shadow-inner font-bold text-center" />
                  </div>
                  <div className="space-y-2">
                     <Label className="text-[10px] font-black uppercase tracking-widest opacity-40">Öncelik</Label>
                     <Select value={priority} onValueChange={setPriority}>
                        <SelectTrigger className="h-16 rounded-2xl bg-slate-50 border-none shadow-inner font-bold"><SelectValue /></SelectTrigger>
                        <SelectContent className="rounded-2xl"><SelectItem value="low">Düşük</SelectItem><SelectItem value="normal">Normal</SelectItem><SelectItem value="high">Yüksek</SelectItem></SelectContent>
                     </Select>
                  </div>
                  <div className="space-y-2">
                     <Label className="text-[10px] font-black uppercase tracking-widest opacity-40">Tür</Label>
                     <Select value={studyType} onValueChange={setStudyType}>
                        <SelectTrigger className="h-16 rounded-2xl bg-slate-50 border-none shadow-inner font-bold"><SelectValue /></SelectTrigger>
                        <SelectContent className="rounded-2xl">{STUDY_TYPES.map(t => <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>)}</SelectContent>
                     </Select>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                     <Label className="text-[10px] font-black uppercase tracking-widest opacity-40">Program</Label>
                     <Select value={exam} onValueChange={setExam}>
                        <SelectTrigger className="h-16 rounded-2xl bg-white border-2 border-slate-100 font-black text-[10px] uppercase"><SelectValue /></SelectTrigger>
                        <SelectContent className="rounded-2xl border-none shadow-2xl">{Object.keys(MASTER_CURRICULUM).map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent>
                     </Select>
                  </div>
                  <div className="space-y-2">
                     <Label className="text-[10px] font-black uppercase tracking-widest opacity-40">Branş</Label>
                     <Select value={subject} onValueChange={setSubject}>
                        <SelectTrigger className="h-16 rounded-2xl bg-white border-2 border-slate-100 font-black text-[10px] uppercase"><SelectValue placeholder="Ders Seç" /></SelectTrigger>
                        <SelectContent className="rounded-2xl border-none shadow-2xl">{Object.keys(subjects).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                     </Select>
                  </div>
                  <div className="space-y-2">
                     <Label className="text-[10px] font-black uppercase tracking-widest opacity-40">Konu</Label>
                     <Select value={topic} onValueChange={setTopic} disabled={!subject}>
                        <SelectTrigger className="h-16 rounded-2xl bg-white border-2 border-slate-100 font-bold text-sm"><SelectValue placeholder="Konu Seç" /></SelectTrigger>
                        <SelectContent className="rounded-2xl border-none shadow-2xl max-h-[300px]">{topics.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                     </Select>
                  </div>
               </div>

               <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                     <Label className="text-[10px] font-black uppercase tracking-widest opacity-40">Kaynaklar</Label>
                     <div className="flex gap-4">
                        <div className="flex-1 relative group"><PlaySquare className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-rose-500 opacity-40" /><Input name="youtubeUrl" placeholder="Youtube Link" className="h-14 rounded-xl bg-slate-50 border-none pl-12 text-xs" /></div>
                        <div className="flex-1 relative group"><Book className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-500 opacity-40" /><Input name="bookUrl" placeholder="PDF Link" className="h-14 rounded-xl bg-slate-50 border-none pl-12 text-xs" /></div>
                     </div>
                  </div>
                  <div className="space-y-4">
                     <Label className="text-[10px] font-black uppercase tracking-widest opacity-40">Zorluk Seviyesi</Label>
                     <div className="flex gap-3">
                        {['easy', 'medium', 'hard'].map((d) => (
                           <button key={d} type="button" onClick={() => setDifficulty(d)} className={cn("flex-1 py-4 rounded-2xl border-2 transition-all font-black text-[10px] uppercase", difficulty === d ? "bg-primary text-white border-primary shadow-lg" : "bg-slate-50 text-muted-foreground border-transparent hover:bg-slate-100")}>
                              {d === 'easy' ? 'Kolay' : d === 'medium' ? 'Orta' : 'Zor'}
                           </button>
                        ))}
                     </div>
                  </div>
               </div>
            </form>
          </div>

          <div className="bg-slate-50 p-10 border-l border-primary/5 space-y-10 flex flex-col justify-between">
             <div className="space-y-10">
                <Card className="rounded-[2.5rem] border-none bg-primary text-white p-8 space-y-6 relative overflow-hidden group shadow-2xl">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-accent/20 blur-[60px] rounded-full translate-x-1/2 -translate-y-1/2" />
                   <div className="flex items-center gap-3 relative z-10"><Sparkles className="h-5 w-5 text-accent animate-pulse" /><span className="text-[9px] font-black uppercase tracking-[0.3em] opacity-40">AI ÖNERİSİ</span></div>
                   <p className="text-sm font-bold italic leading-relaxed relative z-10">"Son verilere göre alanında başarılı olmak için bugün bu dersi çalışman kritiktir."</p>
                   <button type="button" onClick={handleApplyAiRecommendation} disabled={isAiLoading} className="w-full h-11 rounded-xl bg-white/10 hover:bg-white/20 text-white font-black text-[9px] uppercase tracking-widest border border-white/10 transition-all">
                     {isAiLoading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : 'AI İLE DOLDUR'}
                   </button>
                </Card>

                <div className="space-y-6">
                   <span className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/40 ml-4 italic">TAHMİNİ KAZANIM</span>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white p-6 rounded-[2rem] border border-primary/5 text-center shadow-sm">
                         <p className="text-[9px] font-black text-muted-foreground uppercase mb-1">XP</p>
                         <p className="text-3xl font-black text-primary italic tracking-tighter">+{xpValue}</p>
                      </div>
                      <div className="bg-white p-6 rounded-[2rem] border border-primary/5 text-center shadow-sm">
                         <p className="text-[9px] font-black text-muted-foreground uppercase mb-1">DURUM</p>
                         <p className="text-xl font-black text-accent italic tracking-tighter uppercase">STABİL</p>
                      </div>
                   </div>
                </div>
             </div>

             <div className="space-y-4">
                <Button type="submit" form="session-form" className="w-full h-24 rounded-[2.5rem] bg-primary hover:bg-accent transition-all duration-700 font-black text-sm uppercase tracking-[0.4em] gap-6 shadow-2xl text-white group/btn">
                   <Zap className="h-6 w-6 text-accent group-hover/btn:animate-pulse" /> TERMİNALE İŞLE
                </Button>
             </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
