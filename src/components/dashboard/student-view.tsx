
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
  Timer, MessageSquare, RefreshCw, ChevronRight
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
      
      {/* 1. AKILLI ARAMA & HIZLI BAŞLAT (Linear Style) */}
      <section className="space-y-10">
        <div className="relative group max-w-3xl mx-auto">
          <div className="absolute inset-0 bg-accent/5 blur-3xl rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
          <Search className="absolute left-7 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground group-focus-within:text-accent transition-all" />
          <Input 
            placeholder="Ders, konu, PDF, deneme veya AI sohbetlerini ara..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-20 pl-16 pr-8 rounded-[2rem] bg-white border-none shadow-[0_20px_50px_-10px_rgba(15,23,42,0.08)] font-bold text-xl focus-visible:ring-2 focus-visible:ring-accent transition-all placeholder:text-muted-foreground/40"
          />
          <div className="absolute right-7 top-1/2 -translate-y-1/2 flex items-center gap-3">
             <kbd className="px-3 py-1.5 bg-slate-100 rounded-lg text-[10px] font-black opacity-30 shadow-inner border border-primary/5">CTRL K</kbd>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-4">
           {quickActions.map((action, i) => (
             <Button key={i} variant="ghost" className="h-14 px-8 rounded-2xl bg-white border border-primary/5 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 gap-4 group">
                <action.icon className={cn("h-5 w-5 transition-transform group-hover:scale-125", action.color)} />
                <span className="font-black text-[11px] uppercase tracking-widest text-primary/60">{action.label}</span>
             </Button>
           ))}
        </div>
      </section>

      {/* 2. SAYFA BAŞLIĞI (Senkronize) */}
      <header className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-10 border-b border-primary/5 pb-16">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
             <div className="h-1 w-12 bg-accent rounded-full"></div>
             <span className="text-[11px] font-black uppercase tracking-[0.4em] text-accent italic">AKADEMİK KONTROL MERKEZİ</span>
          </div>
          <h2 className="text-6xl md:text-[7rem] font-black italic tracking-tighter text-primary uppercase leading-[0.75] text-shadow-premium">
            EĞİTİM <br /><span className="text-accent text-shadow-accent">KÜTÜPHANEM</span>
          </h2>
          <p className="text-2xl text-muted-foreground font-medium italic max-w-2xl opacity-70 leading-relaxed">
            Seçtiğiniz programa ait tüm eğitim modüllerine buradan hızlıca erişebilir, çalışma sürecinizi tek merkezden yönetebilirsiniz.
          </p>
        </div>
        <div className="flex flex-col items-end gap-4">
           <div className="bg-white px-8 py-5 rounded-[2rem] border-2 border-primary/5 shadow-2xl flex items-center gap-6 group hover:border-accent transition-all duration-500">
              <div className="h-12 w-12 rounded-2xl bg-accent/10 flex items-center justify-center">
                 <Target className="h-6 w-6 text-accent animate-pulse" />
              </div>
              <div className="text-right">
                 <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-40">AKTİF PROGRAM</p>
                 <p className="text-xl font-black text-primary tracking-tight italic uppercase">{examConfig.title}</p>
              </div>
           </div>
        </div>
      </header>

      {/* 3. MODÜL KARTLARI (Büyük & Dinamik) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12">
        {examConfig.modules.map((mod, i) => (
          <Card key={i} className="group relative overflow-hidden rounded-[3.5rem] border-none shadow-[0_40px_100px_-20px_rgba(15,23,42,0.1)] bg-white p-14 transition-all duration-700 hover:-translate-y-4 hover:shadow-[0_80px_160px_-30px_rgba(15,23,42,0.15)] cursor-pointer border-2 border-transparent hover:border-accent/10">
            {/* Bildirim Rozeti (Simülasyon) */}
            {(i === 0 || i === 3) && (
              <div className="absolute top-12 right-12 flex h-11 w-11 bg-destructive text-white rounded-full items-center justify-center font-black text-sm shadow-[0_10px_30px_rgba(239,68,68,0.4)] z-20 border-4 border-white animate-bounce">
                {i === 0 ? '3' : '1'}
              </div>
            )}
            
            <div className="space-y-14 relative z-10">
              <div className="flex justify-between items-start">
                 <div className={cn("h-24 w-24 rounded-[2.5rem] flex items-center justify-center text-white shadow-2xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-700", mod.color)}>
                    <mod.icon className="h-11 w-11" />
                 </div>
                 <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-inner">
                    <ChevronRight className="h-6 w-6 text-primary" />
                 </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-4xl font-black italic tracking-tighter text-primary uppercase leading-none group-hover:text-accent transition-colors">{mod.title}</h4>
                <p className="text-[11px] text-muted-foreground font-black italic opacity-60 leading-relaxed uppercase tracking-widest">{mod.desc}</p>
              </div>

              {/* Progress & Stats */}
              <div className="space-y-8 pt-8 border-t border-primary/5">
                 <div className="flex justify-between items-end">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/30 italic">İLERLEME</span>
                    <span className="text-2xl font-black text-primary tracking-tighter leading-none">%{20 + (i * 12)}</span>
                 </div>
                 <div className="h-2.5 w-full bg-[#F1F5F9] rounded-full overflow-hidden shadow-inner">
                    <div className={cn("h-full transition-all duration-1000 rounded-full", mod.color)} style={{ width: `${20 + (i * 12)}%` }}></div>
                 </div>
                 <div className="flex items-center justify-between opacity-30 group-hover:opacity-100 transition-opacity">
                    <div className="flex items-center gap-2">
                       <History className="h-4 w-4" />
                       <span className="text-[10px] font-black uppercase tracking-widest italic">DÜN 14:20</span>
                    </div>
                    <Bookmark className="h-4 w-4 hover:text-accent transition-colors" />
                 </div>
              </div>
            </div>
            
            <div className={cn("absolute -bottom-24 -right-24 w-60 h-60 opacity-0 group-hover:opacity-10 blur-[100px] rounded-full transition-all duration-1000", mod.color)}></div>
          </Card>
        ))}
      </div>

      {/* 4. AI KOÇ & POMODORO (Premium Banner) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-12 pt-8">
        {/* AI COACH BANNER (Dark Premium) */}
        <Card className="xl:col-span-2 bg-[#0F172A] rounded-[4rem] p-16 text-white shadow-[0_100px_200px_-40px_rgba(15,23,42,0.6)] relative overflow-hidden group border-none">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-accent/15 blur-[180px] rounded-full"></div>
          <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] bg-blue-500/10 blur-[150px] rounded-full"></div>
          
          <div className="flex flex-col md:flex-row gap-20 items-center relative z-10 h-full">
             <div className="relative shrink-0">
                <div className="h-44 w-36 rounded-[4rem] bg-white/5 backdrop-blur-3xl border border-white/10 flex items-center justify-center shadow-3xl group-hover:rotate-12 group-hover:scale-110 transition-all duration-1000">
                   <Brain className="h-20 w-20 text-accent" />
                </div>
                <div className="absolute -bottom-6 -right-6 h-14 w-14 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-2xl border-[6px] border-[#0F172A] animate-pulse">
                   <Zap className="h-7 w-7 text-white" />
                </div>
             </div>
             
             <div className="space-y-12 flex-1 text-center md:text-left">
                <div className="inline-flex items-center gap-4 px-8 py-3 rounded-full bg-accent text-primary font-black text-xs uppercase tracking-widest shadow-2xl shadow-accent/20">
                   <Sparkles className="h-4 w-4" /> AI KOÇ TAVSİYESİ
                </div>
                <h3 className="text-4xl md:text-6xl font-black italic tracking-tight leading-[1.1] text-shadow-premium uppercase">
                   {examConfig.aiFocus}
                </h3>
                <div className="flex flex-wrap gap-6 justify-center md:justify-start pt-4">
                   <Button className="h-20 px-14 rounded-full bg-white text-primary hover:bg-accent hover:text-white transition-all duration-500 font-black text-lg uppercase tracking-widest gap-6 shadow-[0_20px_50px_rgba(255,255,255,0.15)] group/btn">
                     ANALİZİ BAŞLAT <ArrowRight className="h-7 w-7 transition-transform group-hover/btn:translate-x-2" />
                   </Button>
                   <Button variant="ghost" className="h-20 px-10 rounded-full border-2 border-white/10 text-white hover:bg-white/10 font-black text-lg uppercase tracking-widest gap-4 transition-all">
                     <MessageSquare className="h-7 w-7 text-accent" /> ASİSTANLA SOHBET
                   </Button>
                </div>
             </div>
          </div>
        </Card>

        {/* POMODORO WIDGET (Circle Style) */}
        <Card className="rounded-[4rem] border-none shadow-[0_60px_120px_-30px_rgba(15,23,42,0.15)] bg-white overflow-hidden p-16 border-2 border-primary/5 flex flex-col items-center justify-center space-y-14 group transition-all hover:border-accent/20">
           <div className="text-center space-y-3">
              <p className="text-[14px] font-black uppercase tracking-[0.5em] text-muted-foreground italic">ODAKLANMA MODU</p>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-50 text-[10px] font-bold text-primary/30 italic uppercase border border-primary/5">
                 Seans #02
              </div>
           </div>
           
           <div className="relative inline-flex items-center justify-center">
              <div className="absolute inset-0 bg-accent/5 blur-3xl rounded-full scale-150"></div>
              <svg className="h-[22rem] w-[22rem] -rotate-90 relative z-10">
                <circle cx="176" cy="176" r="160" fill="none" stroke="#F1F5F9" strokeWidth="20" />
                <circle cx="176" cy="176" r="160" fill="none" stroke="#F59E0B" strokeWidth="20" strokeDasharray="1005" strokeDashoffset={1005 - (1005 * timer / (25 * 60))} strokeLinecap="round" className="transition-all duration-1000 drop-shadow-[0_0_30px_rgba(245,158,11,0.6)]" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                 <span className="text-[7rem] font-black text-primary tracking-tighter tabular-nums text-shadow-deep leading-none">{formatTime(timer)}</span>
                 <span className="text-xs font-black text-muted-foreground uppercase tracking-[0.5em] opacity-40 mt-4 italic">KALAN SÜRE</span>
              </div>
           </div>

           <div className="w-full space-y-6 relative z-10">
              <Button 
                onClick={() => setIsActive(!isActive)}
                className={cn(
                  "w-full h-24 rounded-[3rem] font-black uppercase tracking-[0.2em] text-xl transition-all duration-700 shadow-3xl",
                  isActive ? "bg-destructive text-white shadow-destructive/30 hover:scale-95" : "bg-[#0F172A] text-white shadow-primary/40 hover:bg-accent hover:scale-105"
                )}
              >
                {isActive ? 'DURDUR' : 'BAŞLAT'} <Play className={cn("ml-5 h-8 w-8 transition-all", isActive ? "fill-current scale-110" : "scale-100")} />
              </Button>
              <Button variant="ghost" className="w-full text-xs font-black uppercase tracking-[0.4em] text-muted-foreground italic hover:text-primary transition-colors">SEANSI SIFIRLA</Button>
           </div>
        </Card>
      </div>

      {/* 5. BOTTOM ACADEMIC STATS */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-12">
         {[
           { label: 'GÜNLÜK SORU HEDEFİ', val: '240/300', percent: 80, icon: Star, color: 'bg-amber-500', trend: '+12%' },
           { label: 'HAFTALIK ÇALIŞMA', val: '32sa 14dk', percent: 65, icon: Clock, color: 'bg-blue-600', trend: '+4%' },
           { label: 'KONU HAKİMİYETİ', val: '%72', percent: 72, icon: LineChart, color: 'bg-purple-600', trend: '+8%' },
         ].map((target, i) => (
           <Card key={i} className="p-12 rounded-[4rem] bg-white shadow-[0_30px_70px_-10px_rgba(15,23,42,0.06)] border border-primary/5 group hover:shadow-2xl hover:border-accent/10 transition-all duration-700">
              <div className="flex items-center justify-between mb-12">
                 <div className="flex items-center gap-8">
                    <div className={cn("h-18 w-18 rounded-[1.75rem] flex items-center justify-center text-white shadow-2xl group-hover:rotate-12 transition-all duration-500", target.color)}>
                       <target.icon className="h-8 w-8" />
                    </div>
                    <div className="space-y-1">
                       <p className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-40 italic">{target.label}</p>
                       <p className="text-4xl font-black text-primary italic tracking-tighter text-shadow-deep">{target.val}</p>
                    </div>
                 </div>
                 <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black">{target.trend}</div>
              </div>
              <div className="space-y-4">
                 <div className="h-3 w-full bg-slate-50 rounded-full overflow-hidden shadow-inner">
                    <div className={cn("h-full transition-all duration-1500 rounded-full shadow-lg", target.color)} style={{ width: `${target.percent}%` }}></div>
                 </div>
                 <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-primary/30 italic">
                    <span>SEVİYE: {target.percent > 75 ? 'İLERİ' : 'ORTA'}</span>
                    <span>%100 HEDEF</span>
                 </div>
              </div>
           </Card>
         ))}
      </section>

    </div>
  );
}
