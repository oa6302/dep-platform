
'use client';

import { useFirestore } from '@/firebase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Play, RefreshCw, ClipboardCheck, Brain, Timer, 
  Search, Target, ChevronRight, TrendingUp, 
  LineChart, Star, Clock, MessageSquare, 
  History, Bookmark
} from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { EXAM_CONFIGS } from '@/lib/exam-configs';
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
    { label: 'AI Plan', icon: Brain, color: 'text-accent' },
    { label: 'Pomodoro', icon: Timer, color: 'text-red-500' },
  ];

  return (
    <div className="p-6 lg:p-12 space-y-16 max-w-screen-2xl mx-auto w-full animate-in fade-in duration-1000 bg-[#FAFBFF]">
      
      {/* 1. AKILLI ARAMA & HIZLI BAŞLAT */}
      <section className="space-y-10">
        <div className="relative group max-w-2xl mx-auto">
          <Search className="absolute left-7 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-accent transition-all" />
          <Input 
            placeholder="Ders, konu, PDF veya deneme ara..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-16 pl-16 pr-8 rounded-full bg-white border-none shadow-[0_10px_40px_-10px_rgba(15,23,42,0.05)] font-bold text-lg focus-visible:ring-2 focus-visible:ring-accent transition-all placeholder:text-muted-foreground/40"
          />
          <div className="absolute right-7 top-1/2 -translate-y-1/2 text-[10px] font-black opacity-20 hidden sm:block">CTRL K</div>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
           {quickActions.map((action, i) => (
             <Button key={i} variant="ghost" className="h-12 px-6 rounded-2xl bg-white border border-primary/5 shadow-sm hover:shadow-xl transition-all duration-300 gap-3 group">
                <action.icon className={cn("h-4 w-4 transition-transform group-hover:scale-110", action.color)} />
                <span className="font-black text-[9px] uppercase tracking-widest text-primary/60">{action.label}</span>
             </Button>
           ))}
        </div>
      </section>

      {/* 2. SAYFA BAŞLIĞI */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
        <div className="space-y-4">
          <h2 className="text-6xl md:text-[6.5rem] font-black italic tracking-tighter text-primary uppercase leading-[0.8] text-shadow-premium">
            EĞİTİM <span className="text-accent text-shadow-accent">KÜTÜPHANEM</span>
          </h2>
          <p className="text-lg text-muted-foreground font-medium italic max-w-2xl opacity-60">
            Seçtiğiniz programa ait tüm eğitim modüllerine buradan hızlıca erişebilir, çalışma sürecinizi tek merkezden yönetebilirsiniz.
          </p>
        </div>
        <div className="bg-white/50 backdrop-blur-md px-6 py-3 rounded-2xl border border-primary/5 shadow-sm flex items-center gap-4">
           <div className="h-2 w-2 rounded-full bg-accent animate-pulse"></div>
           <span className="text-[10px] font-black uppercase tracking-widest text-primary/40">{userData?.targetExam || 'LGS'} AKTİF MODÜLLERİ</span>
        </div>
      </header>

      {/* 3. MODÜL KARTLARI (4 Per Row) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        {examConfig.modules.map((mod, i) => (
          <Card key={i} className="group relative overflow-hidden rounded-[3.5rem] border-none shadow-[0_40px_100px_-20px_rgba(15,23,42,0.08)] bg-white p-12 transition-all duration-500 hover:-translate-y-3 hover:shadow-[0_60px_120px_-30px_rgba(15,23,42,0.12)] cursor-pointer border border-transparent hover:border-accent/10">
            {/* Notification Badge */}
            {(i === 0 || i === 3) && (
              <div className="absolute top-10 right-10 flex h-9 w-9 bg-destructive text-white rounded-full items-center justify-center font-black text-xs shadow-xl z-20 border-4 border-white animate-bounce">
                {i === 0 ? '3' : '2'}
              </div>
            )}
            
            <div className="space-y-12 relative z-10">
              <div className={cn("h-16 w-16 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500", mod.color)}>
                 <mod.icon className="h-7 w-7" />
              </div>

              <div className="space-y-2">
                <h4 className="text-3xl font-black italic tracking-tighter text-primary uppercase leading-none group-hover:text-accent transition-colors">{mod.title}</h4>
                <p className="text-[10px] text-muted-foreground font-black italic opacity-40 uppercase tracking-widest leading-none">{mod.desc}</p>
              </div>

              <div className="space-y-6 pt-6 border-t border-primary/5">
                 <div className="flex justify-between items-end">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary/30 italic">TAMAMLANMA</span>
                    <span className="text-xl font-black text-primary tracking-tighter leading-none">%{20 + (i * 15)}</span>
                 </div>
                 <div className="h-2 w-full bg-[#F1F5F9] rounded-full overflow-hidden shadow-inner">
                    <div className={cn("h-full transition-all duration-1000 rounded-full", mod.color)} style={{ width: `${20 + (i * 15)}%` }}></div>
                 </div>
                 <div className="flex items-center gap-2 opacity-20 group-hover:opacity-40 transition-opacity">
                    <History className="h-3 w-3" />
                    <span className="text-[8px] font-black uppercase tracking-widest">ANA EKRAN</span>
                 </div>
              </div>
            </div>
            
            <div className={cn("absolute -bottom-16 -right-16 w-40 h-40 opacity-0 group-hover:opacity-5 blur-[60px] rounded-full transition-all duration-700", mod.color)}></div>
          </Card>
        ))}
      </div>

      {/* 4. AI KOÇ & POMODORO */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        {/* AI COACH BANNER */}
        <Card className="xl:col-span-2 bg-[#0F172A] rounded-[4rem] p-16 text-white shadow-[0_80px_160px_-40px_rgba(15,23,42,0.4)] relative overflow-hidden group border-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent/10 blur-[150px] rounded-full group-hover:bg-accent/20 transition-all duration-1000"></div>
          
          <div className="flex flex-col lg:flex-row gap-16 items-center relative z-10">
             <div className="relative shrink-0">
                <div className="h-36 w-32 rounded-[3rem] bg-white/5 backdrop-blur-3xl border border-white/10 flex items-center justify-center shadow-3xl group-hover:rotate-6 transition-all duration-700">
                   <Brain className="h-16 w-16 text-accent" />
                </div>
                <div className="absolute -bottom-3 -right-3 h-10 w-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-2xl border-4 border-[#0F172A] animate-pulse">
                   <Star className="h-4 w-4 text-white fill-current" />
                </div>
             </div>
             
             <div className="space-y-10 flex-1 text-center lg:text-left">
                <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-accent/20 text-accent font-black text-[9px] uppercase tracking-widest border border-accent/20">
                   AI SİSTEMİ KOÇ TAVSİYESİ
                </div>
                <h3 className="text-3xl lg:text-5xl font-black italic tracking-tight leading-[1.2] text-shadow-premium uppercase">
                   {examConfig.aiFocus}
                </h3>
                <div className="flex flex-wrap gap-4 justify-center lg:justify-start pt-4">
                   <Button className="h-14 px-10 rounded-full bg-white text-primary hover:bg-accent hover:text-white transition-all duration-500 font-black text-xs uppercase tracking-widest gap-4 shadow-xl group/btn">
                     DETAYLI ANALİZ AL <ChevronRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                   </Button>
                   <Button variant="ghost" className="h-14 px-8 rounded-full border-2 border-white/10 text-white hover:bg-white/10 font-black text-xs uppercase tracking-widest gap-3 transition-all">
                     <MessageSquare className="h-5 w-5 text-accent" /> KOÇLA SOHBET
                   </Button>
                </div>
             </div>
          </div>
        </Card>

        {/* POMODORO WIDGET */}
        <Card className="rounded-[4rem] border-none shadow-[0_60px_120px_-30px_rgba(15,23,42,0.1)] bg-white overflow-hidden p-14 border border-primary/5 flex flex-col items-center justify-center space-y-10 group transition-all hover:border-accent/10">
           <div className="text-center space-y-2">
              <p className="text-[11px] font-black uppercase tracking-[0.4em] text-muted-foreground italic">ODAKLANMA MODU</p>
              <p className="text-[9px] font-bold text-primary/30 uppercase tracking-widest">POMODORO SEANSI: 02</p>
           </div>
           
           <div className="relative inline-flex items-center justify-center">
              <div className="absolute inset-0 bg-accent/5 blur-3xl rounded-full scale-125"></div>
              <svg className="h-[18rem] w-[18rem] -rotate-90 relative z-10">
                <circle cx="144" cy="144" r="130" fill="none" stroke="#F1F5F9" strokeWidth="16" />
                <circle cx="144" cy="144" r="130" fill="none" stroke="#F59E0B" strokeWidth="16" strokeDasharray="816" strokeDashoffset={816 - (816 * timer / (25 * 60))} strokeLinecap="round" className="transition-all duration-1000 drop-shadow-[0_0_20px_rgba(245,158,11,0.4)]" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                 <span className="text-[5.5rem] font-black text-primary tracking-tighter tabular-nums leading-none">{formatTime(timer)}</span>
                 <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-30 mt-2 italic">DAKİKA</span>
              </div>
           </div>

           <div className="w-full space-y-4 relative z-10">
              <Button 
                onClick={() => setIsActive(!isActive)}
                className={cn(
                  "w-full h-20 rounded-[2.5rem] font-black uppercase tracking-widest text-lg transition-all duration-500 shadow-2xl",
                  isActive ? "bg-destructive text-white shadow-destructive/20" : "bg-[#0F172A] text-white shadow-primary/20 hover:bg-accent"
                )}
              >
                {isActive ? 'DURDUR' : 'BAŞLAT'} <Play className="ml-3 h-5 w-5 fill-current" />
              </Button>
              <Button variant="ghost" className="w-full text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground italic hover:text-primary transition-colors">SEANSI SIFIRLA</Button>
           </div>
        </Card>
      </div>

      {/* 5. BOTTOM STATS */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-10">
         {[
           { label: 'GÜNLÜK SORU HEDEFİ', val: '240/300', percent: 80, icon: Star, color: 'bg-amber-500' },
           { label: 'HAFTALIK ÇALIŞMA', val: '32sa 14dk', percent: 65, icon: Clock, color: 'bg-blue-600' },
           { label: 'KONU HAKİMİYETİ', val: '%72', percent: 72, icon: LineChart, color: 'bg-purple-600' },
         ].map((target, i) => (
           <Card key={i} className="p-10 rounded-[3rem] bg-white shadow-[0_20px_60px_-15px_rgba(15,23,42,0.05)] border border-primary/5 group hover:shadow-2xl transition-all duration-500">
              <div className="flex items-center gap-6 mb-8">
                 <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-all", target.color)}>
                    <target.icon className="h-6 w-6" />
                 </div>
                 <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-40 italic">{target.label}</p>
                    <p className="text-3xl font-black text-primary italic tracking-tighter leading-none">{target.val}</p>
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
