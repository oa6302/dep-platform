
'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Clock, Play, Pause, RotateCcw, Coffee, 
  Zap, Brain, Target, ArrowLeft, Home, Sparkles
} from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export default function PomodoroPage() {
  const router = useRouter();
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'work' | 'break'>('work');

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = useCallback(() => {
    setIsActive(false);
    setMinutes(mode === 'work' ? 25 : 5);
    setSeconds(0);
  }, [mode]);

  useEffect(() => {
    let interval: any = null;
    if (isActive) {
      interval = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            clearInterval(interval);
            setIsActive(false);
            alert(mode === 'work' ? 'Çalışma bitti, mola vakti!' : 'Mola bitti, çalışmaya dön!');
          } else {
            setMinutes(minutes - 1);
            setSeconds(59);
          }
        } else {
          setSeconds(seconds - 1);
        }
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, minutes, seconds, mode]);

  return (
    <div className="p-8 lg:p-14 space-y-12 max-w-7xl mx-auto w-full animate-in fade-in duration-700 bg-[#F8FAFC]">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
             <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-12 w-12 rounded-xl bg-white shadow-sm border border-slate-100 hover:bg-primary hover:text-white transition-all"><ArrowLeft className="h-5 w-5" /></Button>
             <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard')} className="h-12 w-12 rounded-xl bg-white shadow-sm border border-slate-100 hover:bg-primary hover:text-white transition-all"><Home className="h-5 w-5" /></Button>
          </div>
          <div className="space-y-2">
             <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-accent text-primary font-black text-[10px] uppercase tracking-widest shadow-xl shadow-accent/20 italic">
                <Clock className="h-3.5 w-3.5" /> FOCUS ENGINE v4.8
             </div>
             <h2 className="text-6xl font-black tracking-tighter italic text-primary uppercase leading-none text-shadow-deep">
                Pomodoro <br /><span className="text-accent text-shadow-accent">Terminali</span>
             </h2>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        <Card className="xl:col-span-7 p-16 rounded-[5rem] border-none shadow-[0_60px_120px_-30px_rgba(15,23,42,0.15)] bg-white text-center space-y-16 relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 blur-[80px] rounded-full translate-x-1/2 -translate-y-1/2 group-hover:bg-accent/10 transition-all" />
           
           <div className="flex justify-center gap-4">
              <button 
                onClick={() => {setMode('work'); resetTimer();}}
                className={cn("px-10 py-4 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] transition-all", mode === 'work' ? 'bg-primary text-white shadow-2xl scale-105' : 'bg-slate-50 text-muted-foreground opacity-40 hover:opacity-100')}
              >ÇALIŞMA</button>
              <button 
                onClick={() => {setMode('break'); resetTimer();}}
                className={cn("px-10 py-4 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] transition-all", mode === 'break' ? 'bg-accent text-primary shadow-2xl scale-105' : 'bg-slate-50 text-muted-foreground opacity-40 hover:opacity-100')}
              >KISA MOLA</button>
           </div>

           <div className="relative">
              <p className="text-[12rem] md:text-[16rem] font-black italic tracking-tighter text-primary leading-none text-shadow-premium">
                 {String(minutes).padStart(2, '0')}<span className={cn("text-accent animate-pulse", !isActive && "animate-none")}>:</span>{String(seconds).padStart(2, '0')}
              </p>
              <p className="text-[11px] font-black uppercase tracking-[1em] text-muted-foreground/30 mt-4 italic">DERİN ODAKLANMA AKTİF</p>
           </div>

           <div className="flex justify-center gap-8">
              <Button 
                onClick={toggleTimer}
                className={cn("h-28 w-28 rounded-full shadow-2xl transition-all hover:scale-110", isActive ? 'bg-slate-100 text-primary' : 'bg-primary text-white shadow-primary/30')}
              >
                 {isActive ? <Pause className="h-10 w-10" /> : <Play className="h-10 w-10 ml-2" />}
              </Button>
              <Button 
                onClick={resetTimer}
                variant="outline"
                className="h-28 w-28 rounded-full border-2 border-slate-100 bg-white text-muted-foreground hover:text-accent hover:border-accent transition-all hover:scale-110 shadow-xl"
              >
                 <RotateCcw className="h-10 w-10" />
              </Button>
           </div>
        </Card>

        <div className="xl:col-span-5 space-y-10">
           <Card className="p-12 rounded-[4rem] border-none shadow-xl bg-primary text-white space-y-10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/20 blur-[60px] rounded-full translate-x-1/2 -translate-y-1/2" />
              <div className="flex items-center gap-4 relative z-10">
                 <Brain className="h-8 w-8 text-accent animate-pulse" />
                 <h4 className="text-2xl font-black italic tracking-tighter uppercase">AI ANALİZ</h4>
              </div>
              <p className="text-lg font-medium opacity-60 italic relative z-10 leading-relaxed">
                 "Öğleden önceki saatlerde odaklanma kapasiten saniyeler içinde %24 daha yüksek. Bugün en zorlu matematik konularını bu saatlerde bitirelim."
              </p>
              <div className="grid grid-cols-2 gap-4 relative z-10">
                 <div className="bg-white/5 rounded-3xl p-6 border border-white/10 text-center">
                    <p className="text-[9px] font-black uppercase tracking-widest opacity-40">BUGÜNKÜ SEANS</p>
                    <p className="text-3xl font-black italic">6</p>
                 </div>
                 <div className="bg-white/5 rounded-3xl p-6 border border-white/10 text-center">
                    <p className="text-[9px] font-black uppercase tracking-widest opacity-40">KAZANILAN XP</p>
                    <p className="text-3xl font-black italic text-accent">+150</p>
                 </div>
              </div>
           </Card>

           <Card className="p-12 rounded-[4rem] border-none shadow-xl bg-white space-y-8">
              <h4 className="text-xl font-black italic tracking-tighter uppercase text-primary">STRATEJİK İPUCU</h4>
              <div className="space-y-6">
                 <div className="flex items-center gap-5 group cursor-pointer">
                    <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center shadow-inner group-hover:bg-accent transition-all"><Zap className="h-6 w-6 text-primary group-hover:text-white" /></div>
                    <p className="text-[11px] font-bold uppercase tracking-tight leading-relaxed opacity-60">Pomodoro seansları arasında saniyeler içinde su içmek bilişsel hızı %15 artırır.</p>
                 </div>
                 <div className="flex items-center gap-5 group cursor-pointer">
                    <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center shadow-inner group-hover:bg-primary transition-all"><Target className="h-6 w-6 text-primary group-hover:text-white" /></div>
                    <p className="text-[11px] font-bold uppercase tracking-tight leading-relaxed opacity-60">Her 4 seansta bir saniyeler içinde 20 dakikalık uzun mola vererek enerjini koru.</p>
                 </div>
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
}
