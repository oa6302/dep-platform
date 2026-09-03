'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Clock, Play, Pause, RotateCcw, Coffee, 
  Zap, Brain, Target, ArrowLeft, Home, Sparkles,
  Music, Volume2, Settings2, SkipForward, Headphones,
  Radio, Youtube
} from 'lucide-react';
import { useState, useEffect, useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

const LOFI_STREAMS = [
  { id: 'jfKfPfyJRdk', title: 'Lofi Girl - Study Beat', color: 'bg-rose-500' },
  { id: '4xDzrJKXOOY', title: 'Synthwave - Deep Focus', color: 'bg-indigo-500' },
  { id: 'lP26UCnoH9s', title: 'Coffee Shop Ambience', color: 'bg-amber-600' },
  { id: 'S_MOd40zlYU', title: 'Rainy Night - Relax', color: 'bg-blue-600' },
];

export default function PomodoroPage() {
  const router = useRouter();
  
  // Timer States
  const [workMins, setWorkMinutes] = useState(25);
  const [breakMins, setBreakMinutes] = useState(5);
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'work' | 'break'>('work');
  
  // Music States
  const [selectedStream, setSelectedStream] = useState(LOFI_STREAMS[0]);
  const [showMusic, setShowMusic] = useState(false);

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = useCallback(() => {
    setIsActive(false);
    setMinutes(mode === 'work' ? workMins : breakMins);
    setSeconds(0);
  }, [mode, workMins, breakMins]);

  // Sync current time when user changes settings
  useEffect(() => {
    if (!isActive) {
      setMinutes(mode === 'work' ? workMins : breakMins);
    }
  }, [workMins, breakMins, mode, isActive]);

  useEffect(() => {
    let interval: any = null;
    if (isActive) {
      interval = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            clearInterval(interval);
            setIsActive(false);
            const nextMode = mode === 'work' ? 'break' : 'work';
            setMode(nextMode);
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
    <div className="p-8 lg:p-14 space-y-12 max-w-[1600px] mx-auto w-full animate-in fade-in duration-1000 bg-[#F8FAFC]">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
             <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-10 w-10 rounded-xl bg-white shadow-sm border border-slate-100 hover:bg-primary hover:text-white transition-all"><ArrowLeft className="h-4 w-4" /></Button>
             <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard')} className="h-10 w-10 rounded-xl bg-white shadow-sm border border-slate-100 hover:bg-primary hover:text-white transition-all"><Home className="h-4 w-4" /></Button>
          </div>
          <div className="space-y-1">
             <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-accent text-primary font-black text-[10px] uppercase tracking-widest shadow-xl shadow-accent/20 italic">
                <Clock className="h-3 w-3" /> FOCUS ENGINE v4.8
             </div>
             <h2 className="text-[5.5rem] font-black tracking-tighter italic text-primary uppercase leading-[0.8] text-shadow-premium">
                POMODORO <br /><span className="text-accent text-shadow-accent">TERMİNALİ</span>
             </h2>
          </div>
        </div>

        <div className="flex gap-4">
           <Button 
             onClick={() => setShowMusic(!showMusic)}
             className={cn(
               "h-16 px-10 rounded-[1.5rem] transition-all font-black text-[11px] uppercase tracking-[0.2em] gap-4 shadow-2xl",
               showMusic ? "bg-accent text-primary shadow-accent/20" : "bg-white text-primary border-2 border-slate-100 hover:bg-slate-50"
             )}
           >
              <Music className={cn("h-5 w-5", showMusic && "animate-bounce")} /> {showMusic ? 'MÜZİĞİ GİZLE' : 'ODAKLANMA MÜZİĞİ'}
           </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-12 items-start">
        {/* Ana Timer Kartı */}
        <Card className="xl:col-span-7 p-16 rounded-[4.5rem] border-none shadow-[0_70px_140px_-30px_rgba(15,23,42,0.18)] bg-white text-center space-y-16 relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/5 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2 group-hover:bg-accent/10 transition-all duration-1000" />
           
           <div className="flex justify-center gap-6 relative z-10">
              <button 
                onClick={() => {setMode('work'); resetTimer();}}
                className={cn("px-14 py-4 rounded-[2rem] font-black text-[12px] uppercase tracking-[0.35em] transition-all duration-500", mode === 'work' ? 'bg-[#0F172A] text-white shadow-2xl scale-105' : 'bg-slate-50 text-muted-foreground opacity-30 hover:opacity-100')}
              >ÇALIŞMA</button>
              <button 
                onClick={() => {setMode('break'); resetTimer();}}
                className={cn("px-14 py-4 rounded-[2rem] font-black text-[12px] uppercase tracking-[0.35em] transition-all duration-500", mode === 'break' ? 'bg-accent text-primary shadow-2xl scale-105' : 'bg-slate-50 text-muted-foreground opacity-30 hover:opacity-100')}
              >KISA MOLA</button>
           </div>

           <div className="relative z-10 py-10">
              <p className="text-[14rem] md:text-[22rem] font-black italic tracking-tighter text-[#0F172A] leading-[0.7] text-shadow-premium">
                 {String(minutes).padStart(2, '0')}<span className={cn("text-accent animate-pulse", !isActive && "animate-none")}>:</span>{String(seconds).padStart(2, '0')}
              </p>
              <div className="flex items-center justify-center gap-6 mt-16">
                 <div className="h-px w-24 bg-slate-100" />
                 <p className="text-[14px] font-black uppercase tracking-[1em] text-primary/10 italic">DERİN ODAKLANMA MODU</p>
                 <div className="h-px w-24 bg-slate-100" />
              </div>
           </div>

           <div className="flex justify-center gap-12 relative z-10 pt-10">
              <Button 
                onClick={toggleTimer}
                className={cn(
                  "h-36 w-36 rounded-full shadow-[0_50px_100px_-20px_rgba(0,0,0,0.25)] transition-all duration-500 hover:scale-110 active:scale-95", 
                  isActive ? 'bg-slate-100 text-primary' : 'bg-[#0F172A] text-white'
                )}
              >
                 {isActive ? <Pause className="h-14 w-14" /> : <Play className="h-14 w-14 ml-2 fill-current" />}
              </Button>
              <Button 
                onClick={resetTimer}
                variant="outline"
                className="h-36 w-36 rounded-full border-4 border-slate-50 bg-white text-muted-foreground hover:text-accent hover:border-accent transition-all duration-500 hover:scale-110 shadow-2xl active:scale-95"
              >
                 <RotateCcw className="h-14 w-14" />
              </Button>
           </div>
        </Card>

        {/* Sağ Panel */}
        <div className="xl:col-span-5 space-y-12">
           {/* Ayarlar Terminali */}
           <Card className="p-14 rounded-[3.5rem] border-none shadow-[0_50px_100px_-20px_rgba(0,0,0,0.08)] bg-white space-y-12 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full translate-x-1/2 -translate-y-1/2" />
              <div className="flex items-center gap-4 relative z-10">
                 <Settings2 className="h-8 w-8 text-primary opacity-20" />
                 <h4 className="text-3xl font-black italic tracking-tighter uppercase text-primary">AYARLAR</h4>
              </div>
              
              <div className="grid grid-cols-2 gap-10 relative z-10">
                 <div className="space-y-4">
                    <Label className="text-[11px] font-black uppercase tracking-[0.4em] text-muted-foreground/60 ml-4 italic">ÇALIŞMA (DK)</Label>
                    <div className="relative group">
                       <Clock className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/20 group-focus-within:text-accent transition-colors" />
                       <Input 
                         type="number" 
                         value={workMins} 
                         onChange={(e) => setWorkMinutes(Number(e.target.value))}
                         className="h-20 rounded-[1.75rem] bg-slate-50 border-none shadow-inner pl-16 font-black text-3xl text-primary focus-visible:ring-accent" 
                       />
                    </div>
                 </div>
                 <div className="space-y-4">
                    <Label className="text-[11px] font-black uppercase tracking-[0.4em] text-muted-foreground/60 ml-4 italic">MOLA (DK)</Label>
                    <div className="relative group">
                       <Coffee className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/20 group-focus-within:text-accent transition-colors" />
                       <Input 
                         type="number" 
                         value={breakMins} 
                         onChange={(e) => setBreakMinutes(Number(e.target.value))}
                         className="h-20 rounded-[1.75rem] bg-slate-50 border-none shadow-inner pl-16 font-black text-3xl text-primary focus-visible:ring-accent" 
                       />
                    </div>
                 </div>
              </div>

              <div className="p-10 bg-slate-50 rounded-[3rem] border border-slate-100 flex items-center justify-between shadow-inner">
                 <div className="flex items-center gap-6">
                    <div className="h-16 w-16 rounded-[1.5rem] bg-white flex items-center justify-center shadow-xl"><Target className="h-8 w-8 text-accent" /></div>
                    <div>
                       <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-1 italic">GÜNLÜK HEDEF</p>
                       <p className="text-2xl font-black text-primary italic tracking-tight uppercase">12 SEANS / 300 XP</p>
                    </div>
                 </div>
                 <div className="h-16 w-16 rounded-full bg-white flex items-center justify-center shadow-lg font-black text-sm text-primary">75%</div>
              </div>
           </Card>

           {/* AI Analiz Terminali */}
           <Card className="p-14 rounded-[3.5rem] border-none shadow-2xl bg-[#0F172A] text-white space-y-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-48 h-48 bg-accent/20 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2" />
              <div className="flex items-center gap-4 relative z-10">
                 <Brain className="h-10 w-10 text-accent animate-pulse" />
                 <h4 className="text-3xl font-black italic tracking-tighter uppercase">AI ANALİZ</h4>
              </div>
              <p className="text-[1.6rem] font-medium opacity-60 italic relative z-10 leading-relaxed tracking-tight">
                 "Şu anki müzik seçiminiz ve çalışma süreniz beta dalgalarınızı %18 oranında normalize ediyor. Bu kombinasyonu koruyalım."
              </p>
           </Card>

           {/* Müzik Terminali (Sonic Node) */}
           {showMusic && (
              <Card className="p-12 rounded-[4rem] border-none shadow-2xl bg-primary text-white space-y-10 animate-in slide-in-from-right-8 duration-700 relative overflow-hidden">
                 <div className="absolute bottom-0 right-0 w-48 h-48 bg-accent/20 blur-[80px] rounded-full translate-x-1/2 translate-y-1/2" />
                 <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-4">
                       <Headphones className="h-8 w-8 text-accent animate-pulse" />
                       <h4 className="text-2xl font-black italic tracking-tighter uppercase">SONIC FOCUS</h4>
                    </div>
                    <Radio className="h-6 w-6 text-white/20" />
                 </div>
                 
                 <div className="aspect-video w-full rounded-[2.5rem] bg-black/40 overflow-hidden relative shadow-2xl border border-white/5">
                    <iframe 
                      width="100%" 
                      height="100%" 
                      src={`https://www.youtube.com/embed/${selectedStream.id}?autoplay=1&mute=0&controls=0&modestbranding=1&rel=0`}
                      title="Lofi Radio"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      className="pointer-events-none opacity-80"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
                    <div className="absolute bottom-6 left-8">
                       <p className="text-[10px] font-black uppercase tracking-widest text-accent mb-1">ŞU AN ÇALIYOR</p>
                       <p className="text-xl font-black italic tracking-tight">{selectedStream.title}</p>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4 relative z-10">
                    {LOFI_STREAMS.map((stream) => (
                       <button 
                         key={stream.id}
                         onClick={() => setSelectedStream(stream)}
                         className={cn(
                           "flex items-center gap-3 p-5 rounded-[1.5rem] border transition-all text-left group",
                           selectedStream.id === stream.id ? "bg-white text-primary border-white" : "bg-white/5 border-white/10 hover:bg-white/10"
                         )}
                       >
                          <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:rotate-12 transition-transform", stream.color)}>
                             <Youtube className="h-5 w-5" />
                          </div>
                          <span className="text-[11px] font-black uppercase tracking-tight line-clamp-1">{stream.title}</span>
                       </button>
                    ))}
                 </div>
              </Card>
           )}
        </div>
      </div>
    </div>
  );
}
