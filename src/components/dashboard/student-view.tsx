
'use client';

import { useCollection, useFirestore } from '@/firebase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Calendar, CheckCircle2, Clock, TrendingUp, Target, Brain, 
  Award, Play, BookOpen, Zap, Star, MapPin, LineChart, 
  ClipboardCheck, Library, ArrowRight, Sparkles, Search,
  Bell, MoreVertical, Bookmark, History, LayoutDashboard,
  Timer, MessageSquare, RefreshCw
} from 'lucide-react';
import { collection, query, where } from 'firebase/firestore';
import { useState, useEffect, useMemo } from 'react';
import { EXAM_CONFIGS } from '@/lib/exam-configs';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StudentViewProps {
  user: any;
  userData: any;
  isReadOnly?: boolean;
}

export function StudentView({ user, userData, isReadOnly = false }: StudentViewProps) {
  const db = useFirestore();
  const [timer, setTimer] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Mevcut sınav konfigürasyonunu al
  const examConfig = useMemo(() => {
    return EXAM_CONFIGS[userData?.targetExam || 'LGS'] || EXAM_CONFIGS['LGS'];
  }, [userData?.targetExam]);

  // Firestore'dan bu sınava özel dersleri çek
  const subjectsQuery = useMemo(() => {
    if (!db || !userData?.targetExam) return null;
    return query(collection(db, 'subjects'), where('programId', '==', userData.targetExam));
  }, [db, userData?.targetExam]);

  const { data: dbSubjects } = useCollection<any>(subjectsQuery);

  useEffect(() => {
    let interval: any;
    if (isActive && timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    } else if (timer === 0) {
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, timer]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const quickActions = [
    { label: 'Programa Başla', icon: Play, color: 'text-emerald-500' },
    { label: 'Son Derse Dön', icon: RefreshCw, color: 'text-blue-500' },
    { label: 'Yeni Deneme', icon: ClipboardCheck, color: 'text-orange-500' },
    { label: 'AI Planı', icon: Brain, color: 'text-accent' },
    { label: 'Pomodoro', icon: Timer, color: 'text-red-500' },
  ];

  return (
    <div className="p-6 lg:p-12 space-y-16 max-w-screen-2xl mx-auto w-full animate-in fade-in duration-1000 bg-[#FAFBFF]">
      
      {/* 1. HIZLI İŞLEMLER & ARAMA */}
      <section className="space-y-10">
        <div className="relative group max-w-2xl mx-auto">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-accent transition-colors" />
          <Input 
            placeholder="Ders, konu, PDF veya deneme ara..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-16 pl-14 pr-8 rounded-full bg-white border-none shadow-[0_15px_40px_-5px_rgba(15,23,42,0.05)] font-medium text-lg focus-visible:ring-2 focus-visible:ring-accent transition-all"
          />
          <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-2">
             <kbd className="px-2 py-1 bg-slate-100 rounded text-[9px] font-black opacity-30 shadow-inner">CTRL K</kbd>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-6">
           {quickActions.map((action, i) => (
             <Button key={i} variant="ghost" className="h-12 px-6 rounded-2xl bg-white border border-primary/5 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all gap-3 group">
                <action.icon className={cn("h-4 w-4 transition-transform group-hover:scale-110", action.color)} />
                <span className="font-black text-[9px] uppercase tracking-widest text-primary/60">{action.label}</span>
             </Button>
           ))}
        </div>
      </section>

      {/* 2. SAYFA BAŞLIĞI */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-primary/5 pb-12">
        <div className="space-y-4">
          <h2 className="text-6xl md:text-8xl font-black italic tracking-tighter text-primary uppercase leading-[0.8] text-shadow-deep">
            EĞİTİM <span className="text-accent text-shadow-accent">KÜTÜPHANEM</span>
          </h2>
          <p className="text-xl text-muted-foreground font-medium italic max-w-2xl opacity-70">
            Seçtiğiniz programa ait tüm eğitim modüllerine buradan hızlıca erişebilir, çalışma sürecinizi tek merkezden yönetebilirsiniz.
          </p>
        </div>
        <div className="flex items-center">
           <Badge variant="outline" className="h-10 px-6 rounded-xl border-2 border-primary/5 bg-white shadow-sm font-black text-[10px] uppercase tracking-widest gap-3">
             <div className="h-2 w-2 rounded-full bg-accent animate-pulse"></div>
             {examConfig.title} AKTİF MODÜLLERİ
           </Badge>
        </div>
      </header>

      {/* 3. MODÜL KARTLARI */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
        {examConfig.modules.map((mod, i) => (
          <Card key={i} className="group relative overflow-hidden rounded-[3.5rem] border-none shadow-[0_30px_70px_-15px_rgba(15,23,42,0.08)] bg-white p-12 transition-all duration-500 hover:-translate-y-4 hover:shadow-[0_60px_100px_-20px_rgba(15,23,42,0.12)] cursor-pointer border border-primary/5">
            {/* Bildirim Rozeti */}
            {(i === 0 || i === 3) && (
              <div className="absolute top-10 right-10 flex h-10 w-10 bg-destructive text-white rounded-full items-center justify-center font-black text-sm shadow-xl z-20 border-4 border-white animate-in zoom-in duration-500">3</div>
            )}
            
            <div className="space-y-12 relative z-10">
              <div className="flex justify-between items-start">
                 <div className={cn("h-20 w-20 rounded-[2.25rem] flex items-center justify-center text-white shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-700", mod.color)}>
                    <mod.icon className="h-9 w-9" />
                 </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-4xl font-black italic tracking-tighter text-primary uppercase leading-none group-hover:text-accent transition-colors">{mod.title}</h4>
                <p className="text-xs text-muted-foreground font-bold italic opacity-60 leading-relaxed uppercase">{mod.desc}</p>
              </div>

              {/* Progress */}
              <div className="space-y-6 pt-6 border-t border-primary/5">
                 <div className="flex justify-between items-end">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/30 italic">TAMAMLANMA</span>
                    <span className="text-xl font-black text-primary leading-none">%{20 + (i * 15)}</span>
                 </div>
                 <div className="h-3 w-full bg-[#F1F5F9] rounded-full overflow-hidden shadow-inner">
                    <div className={cn("h-full transition-all duration-1000 rounded-full", mod.color)} style={{ width: `${20 + (i * 15)}%` }}></div>
                 </div>
                 <div className="flex items-center gap-2 opacity-30 group-hover:opacity-100 transition-opacity">
                    <History className="h-3.5 w-3.5" />
                    <span className="text-[9px] font-black uppercase tracking-widest italic">ANA EKRAN</span>
                 </div>
              </div>
            </div>
            
            <div className={cn("absolute -bottom-20 -right-20 w-48 h-48 opacity-0 group-hover:opacity-10 blur-[80px] rounded-full transition-all duration-700", mod.color)}></div>
          </Card>
        ))}
      </div>

      {/* 4. AI ANALİZ & POMODORO */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-12 pt-8">
        {/* AI COACH BANNER */}
        <Card className="xl:col-span-2 bg-[#121212] rounded-[4rem] p-16 text-white shadow-[0_80px_160px_-40px_rgba(15,23,42,0.6)] relative overflow-hidden group border-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent/10 blur-[150px] rounded-full"></div>
          <div className="flex flex-col md:flex-row gap-16 items-center relative z-10 h-full">
             <div className="relative shrink-0">
                <div className="h-36 w-32 rounded-[3.5rem] bg-white/5 backdrop-blur-3xl border border-white/10 flex items-center justify-center shadow-3xl group-hover:rotate-12 transition-transform duration-700">
                   <Brain className="h-16 w-16 text-accent" />
                </div>
                <div className="absolute -bottom-4 -right-4 h-12 w-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-xl border-4 border-[#121212]">
                   <Zap className="h-6 w-6 text-white" />
                </div>
             </div>
             <div className="space-y-10 flex-1 text-center md:text-left">
                <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-accent text-primary font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-accent/20">AI SİSTEMİ KOÇ TAVSİYESİ</div>
                <h3 className="text-4xl md:text-5xl font-black italic tracking-tight leading-[1.15] text-shadow-premium">
                   {examConfig.aiFocus}
                </h3>
                <div className="flex flex-wrap gap-6 justify-center md:justify-start">
                   <Button className="h-18 px-12 rounded-full bg-white text-primary hover:bg-accent hover:text-white transition-all font-black text-sm uppercase tracking-widest gap-4 shadow-2xl">
                     DETAYLI ANALİZ AL <ArrowRight className="h-6 w-6" />
                   </Button>
                   <Button variant="ghost" className="h-18 px-8 rounded-full border-2 border-white/10 text-white hover:bg-white/10 font-black text-sm uppercase tracking-widest gap-4">
                     <MessageSquare className="h-6 w-6 text-accent" /> KOÇLA SOHBET
                   </Button>
                </div>
             </div>
          </div>
        </Card>

        {/* POMODORO WIDGET */}
        <Card className="rounded-[4rem] border-none shadow-[0_40px_100px_-20px_rgba(15,23,42,0.1)] bg-white overflow-hidden p-16 border border-primary/5 flex flex-col items-center justify-center space-y-12 group">
           <div className="text-center space-y-2">
              <p className="text-[12px] font-black uppercase tracking-[0.4em] text-muted-foreground italic">ODAKLANMA MODU</p>
              <h5 className="text-xs font-bold text-primary/30 italic uppercase">Pomodoro Seansı: 02</h5>
           </div>
           
           <div className="relative inline-flex items-center justify-center">
              <svg className="h-72 w-72 -rotate-90">
                <circle cx="144" cy="144" r="130" fill="none" stroke="#F1F5F9" strokeWidth="16" />
                <circle cx="144" cy="144" r="130" fill="none" stroke="#F59E0B" strokeWidth="16" strokeDasharray="816" strokeDashoffset={816 - (816 * timer / (25 * 60))} strokeLinecap="round" className="transition-all duration-1000 drop-shadow-[0_0_25px_rgba(245,158,11,0.5)]" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                 <span className="text-8xl font-black text-primary tracking-tighter tabular-nums text-shadow-deep leading-none">{formatTime(timer)}</span>
                 <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] opacity-30 mt-2">DAKİKA</span>
              </div>
           </div>

           <div className="w-full space-y-4">
              <Button 
                onClick={() => setIsActive(!isActive)}
                className={cn(
                  "w-full h-20 rounded-[2.5rem] font-black uppercase tracking-widest text-sm transition-all duration-500 shadow-2xl",
                  isActive ? "bg-destructive text-white shadow-destructive/20" : "bg-[#0F172A] text-white shadow-primary/30 hover:bg-accent hover:scale-105"
                )}
              >
                {isActive ? 'DURDUR' : 'BAŞLAT'} <Play className={cn("ml-3 h-5 w-5", isActive ? "fill-current" : "")} />
              </Button>
              <Button variant="ghost" className="w-full text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground italic hover:text-primary transition-colors">SEANSI SIFIRLA</Button>
           </div>
        </Card>
      </div>

      {/* 5. BOTTOM STATS */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-10">
         {[
           { label: 'GÜNLÜK SORU HEDEFİ', val: '240/300', percent: 80, icon: Star, color: 'bg-amber-500' },
           { label: 'HAFTALIK ÇALIŞMA', val: '32sa 14dk', percent: 65, icon: Clock, color: 'bg-blue-500' },
           { label: 'KONU HAKİMİYETİ', val: '%72', percent: 72, icon: LineChart, color: 'bg-purple-500' },
         ].map((target, i) => (
           <Card key={i} className="p-10 rounded-[3rem] bg-white shadow-[0_20px_50px_-10px_rgba(15,23,42,0.05)] border border-primary/5 group hover:shadow-2xl transition-all">
              <div className="flex items-center gap-8 mb-8">
                 <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center text-white shadow-lg", target.color)}>
                    <target.icon className="h-6 w-6" />
                 </div>
                 <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-50">{target.label}</p>
                    <p className="text-3xl font-black text-primary italic tracking-tighter">{target.val}</p>
                 </div>
              </div>
              <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden shadow-inner">
                 <div className={cn("h-full transition-all duration-1000 rounded-full", target.color)} style={{ width: `${target.percent}%` }}></div>
              </div>
           </Card>
         ))}
      </section>

    </div>
  );
}
