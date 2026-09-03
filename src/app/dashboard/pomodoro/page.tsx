
'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Clock, Play, Pause, RotateCcw, Coffee, 
  Brain, Target, ArrowLeft, Home, Sparkles,
  Music, Volume2, Settings2, SkipForward, Headphones,
  Radio, Youtube
} from 'lucide-react';
import { useState, useEffect, useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

const LOFI_STREAMS = [
  { id: 'tLqZk2mKz8U', title: 'RUHUN ŞİFASI - NEY SESİ', color: 'bg-emerald-600' },
  { id: 'WPni755-Krg', title: 'ALPHA WAVES - DEEP FOCUS', color: 'bg-indigo-600' },
  { id: 'mXndxY57wCI', title: 'PIANO STUDY - ZEN MODE', color: 'bg-amber-600' },
  { id: '5qap5aO4i9A', title: 'LOFI GIRL - MASTER STUDY', color: 'bg-rose-500' },
];

export default function PomodoroPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [workMins, setWorkMinutes] = useState(25);
  const [breakMins, setBreakMinutes] = useState(5);
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'work' | 'break'>('work');
  
  const [selectedStream, setSelectedStream] = useState(LOFI_STREAMS[0]);
  const [showMusic, setShowMusic] = useState(false);

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = useCallback(() => {
    setIsActive(false);
    setMinutes(mode === 'work' ? workMins : breakMins);
    setSeconds(0);
  }, [mode, workMins, breakMins]);

  useEffect(() => {
    if (!isActive) {
      setMinutes(mode === 'work' ? workMins : breakMins);
      setSeconds(0);
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
            
            if (mode === 'work') {
              toast({
                title: "SEANS TAMAMLANDI",
                description: "HARİKA İŞ! ŞİMDİ ARA VER.",
                className: "bg-accent text-primary rounded-[2rem] font-black border-none shadow-[0_40px_80px_-20px_rgba(245,158,11,0.4)]"
              });
              setMode('break');
            } else {
              toast({
                title: "MOLA BİTTİ",
                description: "ZİHİN TAZELEME TAMAMLANDI. DERSE BAŞLA!",
                className: "bg-primary text-white rounded-[2rem] font-black border-none shadow-[0_40px_80px_-20px_rgba(15,23,42,0.4)]"
              });
              setMode('work');
            }
          } else {
            setMinutes(prev => prev - 1);
            setSeconds(59);
          }
        } else {
          setSeconds(prev => prev - 1);
        }
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, minutes, seconds, mode, toast]);

  return (
    <div className="min-h-screen p-6 lg:p-14 space-y-12 max-w-[1600px] mx-auto w-full animate-in fade-in duration-1000 bg-[#F8FAFC]">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
             <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-10 w-10 rounded-xl bg-white shadow-sm border border-slate-100 hover:bg-primary hover:text-white transition-all"><ArrowLeft className="h-4 w-4" /></Button>
             <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard')} className="h-10 w-10 rounded-xl bg-white shadow-sm border border-slate-100 hover:bg-primary hover:text-white transition-all"><Home className="h-4 w-4" /></Button>
          </div>
          <div className="space-y-0.5">
             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent text-primary font-black text-[9px] uppercase tracking-[0.3em] shadow-lg shadow-accent/20 italic border border-accent/20">
                <Clock className="h-3 w-3" /> FOCUS ENGINE V4.8
             </div>
             <h2 className="text-4xl md:text-6xl font-black tracking-tighter italic text-primary uppercase leading-tight text-shadow-premium break-words max-w-full">
                POMODORO <br /><span className="text-accent text-shadow-accent">TERMİNALİ</span>
             </h2>
          </div>
        </div>

        <div className="flex gap-4">
           <Button 
             onClick={() => setShowMusic(!showMusic)}
             className={cn(
               "h-14 px-8 rounded-2xl transition-all font-black text-[10px] uppercase tracking-[0.3em] gap-3 shadow-2xl",
               showMusic ? "bg-accent text-primary shadow-accent/20" : "bg-white text-primary border-2 border-slate-100 hover:bg-slate-50"
             )}
           >
              <Music className={cn("h-4 w-4", showMusic && "animate-bounce")} /> {showMusic ? 'MÜZİĞİ GİZLE' : 'ODAKLANMA MÜZİĞİ'}
           </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-12 items-start">
        {/* Ana Timer Kartı */}
        <Card className="xl:col-span-7 p-10 md:p-16 rounded-[4rem] border-none shadow-[0_80px_160px_-40px_rgba(15,23,42,0.15)] bg-white text-center space-y-12 relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/5 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2 group-hover:bg-accent/10 transition-all duration-1000" />
           
           <div className="flex justify-center gap-4 relative z-10">
              <button 
                onClick={() => {setMode('work'); resetTimer();}}
                className={cn("px-8 md:px-12 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] transition-all duration-500", mode === 'work' ? 'bg-[#0F172A] text-white shadow-2xl scale-105' : 'bg-slate-50 text-muted-foreground opacity-30 hover:opacity-100')}
              >ÇALIŞMA</button>
              <button 
                onClick={() => {setMode('break'); resetTimer();}}
                className={cn("px-8 md:px-12 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] transition-all duration-500", mode === 'break' ? 'bg-accent text-primary shadow-2xl scale-105' : 'bg-slate-50 text-muted-foreground opacity-30 hover:opacity-100')}
              >KISA MOLA</button>
           </div>

           <div className="relative z-10 flex items-center justify-center gap-2 md:gap-4 overflow-hidden py-10">
              <p className="text-[10rem] sm:text-[12rem] md:text-[15rem] font-black italic tracking-tighter text-[#0F172A] leading-none text-shadow-premium">
                 {String(minutes).padStart(2, '0')}
              </p>
              <div className="flex flex-col gap-3 py-6 px-3 bg-accent rounded-full shadow-[0_20px_40px_-10px_rgba(245,158,11,0.5)] shrink-0">
                 <div className="h-4 w-4 rounded-full bg-[#0F172A]" />
                 <div className="h-4 w-4 rounded-full bg-[#0F172A]" />
              </div>
              <p className="text-[10rem] sm:text-[12rem] md:text-[15rem] font-black italic tracking-tighter text-[#0F172A] leading-none text-shadow-premium">
                 {String(seconds).padStart(2, '0')}
              </p>
           </div>

           <div className="flex items-center justify-center gap-6 relative z-10">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent to-slate-200" />
              <p className="text-[10px] font-black uppercase tracking-[0.6em] text-primary/10 italic whitespace-nowrap">DERİN ODAKLANMA MODU</p>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent to-slate-200" />
           </div>

           <div className="flex justify-center gap-8 relative z-10 pt-6">
              <Button 
                onClick={toggleTimer}
                className={cn(
                  "h-24 w-24 md:h-32 md:w-32 rounded-full shadow-[0_40px_80px_-20px_rgba(15,23,42,0.4)] transition-all duration-500 hover:scale-110 active:scale-95 group/play", 
                  isActive ? 'bg-slate-100 text-primary' : 'bg-[#0F172A] text-white'
                )}
              >
                 {isActive ? <Pause className="h-10 w-10 md:h-12 md:w-12" /> : <Play className="h-10 w-10 md:h-12 md:w-12 ml-2 fill-current group-hover/play:animate-pulse" />}
              </Button>
              <Button 
                onClick={resetTimer}
                variant="outline"
                className="h-24 w-24 md:h-32 md:w-32 rounded-full border-[6px] border-slate-50 bg-white text-muted-foreground hover:text-accent hover:border-accent transition-all duration-500 hover:scale-110 shadow-xl active:scale-95"
              >
                 <RotateCcw className="h-10 w-10 md:h-12 md:w-12" />
              </Button>
           </div>
        </Card>

        {/* Sağ Panel */}
        <div className="xl:col-span-5 space-y-10">
           {/* Ayarlar Terminali */}
           <Card className="p-8 md:p-10 rounded-[3.5rem] border-none shadow-lg bg-white space-y-10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-40 h-40 bg-slate-50 rounded-full translate-x-1/2 -translate-y-1/2" />
              <div className="flex items-center gap-5 relative z-10">
                 <div className="h-12 w-12 rounded-2xl bg-[#0F172A] flex items-center justify-center text-white shadow-xl"><Settings2 className="h-7 w-7 text-accent" /></div>
                 <h4 className="text-2xl font-black italic tracking-tighter uppercase text-primary">AYARLAR</h4>
              </div>
              
              <div className="grid grid-cols-2 gap-8 relative z-10">
                 <div className="space-y-3">
                    <Label className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/50 ml-4 italic">ÇALIŞMA (DK)</Label>
                    <div className="relative group">
                       <Clock className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/20 group-focus-within:text-accent transition-colors" />
                       <Input 
                         type="number" 
                         value={workMins} 
                         onChange={(e) => setWorkMinutes(Number(e.target.value))}
                         className="h-16 rounded-2xl bg-slate-50 border-none shadow-inner pl-14 font-black text-3xl text-primary focus-visible:ring-accent transition-all" 
                       />
                    </div>
                 </div>
                 <div className="space-y-3">
                    <Label className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/50 ml-4 italic">MOLA (DK)</Label>
                    <div className="relative group">
                       <Coffee className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/20 group-focus-within:text-accent transition-colors" />
                       <Input 
                         type="number" 
                         value={breakMins} 
                         onChange={(e) => setBreakMinutes(Number(e.target.value))}
                         className="h-16 rounded-2xl bg-slate-50 border-none shadow-inner pl-14 font-black text-3xl text-primary focus-visible:ring-accent transition-all" 
                       />
                    </div>
                 </div>
              </div>

              <div className="p-8 bg-slate-50/50 rounded-[2.5rem] border border-slate-100 flex items-center justify-between shadow-inner relative overflow-hidden group/target">
                 <div className="absolute inset-0 bg-white opacity-0 group-hover/target:opacity-100 transition-opacity" />
                 <div className="flex items-center gap-5 relative z-10">
                    <div className="h-12 w-12 rounded-xl bg-white flex items-center justify-center shadow-md border border-slate-50"><Target className="h-6 w-6 text-accent" /></div>
                    <div>
                       <p className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-0.5 italic">GÜNLÜK HEDEF</p>
                       <p className="text-xl font-black text-primary italic tracking-tighter uppercase leading-none">12 SEANS / 300 XP</p>
                    </div>
                 </div>
                 <div className="h-16 w-16 rounded-full bg-white flex items-center justify-center shadow-lg border-4 border-slate-50 font-black text-xs text-primary relative z-10">75%</div>
              </div>
           </Card>

           {/* AI Analiz Terminali */}
           <Card className="p-8 md:p-10 rounded-[3.5rem] border-none shadow-xl bg-[#0F172A] text-white space-y-6 relative overflow-hidden group border-t-8 border-accent/20">
              <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 blur-[100px] rounded-full translate-x-1/4 -translate-y-1/4" />
              <div className="flex items-center gap-4 relative z-10">
                 <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shadow-2xl"><Brain className="h-6 w-6 text-accent animate-pulse" /></div>
                 <h4 className="text-xl font-black italic tracking-[0.2em] uppercase">AI ANALİZ</h4>
              </div>
              <p className="text-2xl font-medium opacity-60 italic relative z-10 leading-tight tracking-tight">
                 "Şu anki müzik seçiminiz ve çalışma süreniz beta dalgalarınızı %18 oranında normalize ediyor. Bu kombinasyonu koruyalım."
              </p>
           </Card>

           {/* Müzik Terminali */}
           {showMusic && (
              <Card className="p-8 md:p-10 rounded-[4rem] border-none shadow-3xl bg-[#0F172A] text-white space-y-8 animate-in slide-in-from-right-8 duration-700 relative overflow-hidden">
                 <div className="absolute bottom-0 right-0 w-64 h-64 bg-accent/10 blur-[100px] rounded-full translate-x-1/2 translate-y-1/2" />
                 <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-4">
                       <Headphones className="h-7 w-7 text-accent animate-pulse" />
                       <h4 className="text-xl font-black italic tracking-[0.3em] uppercase">SONIC FOCUS</h4>
                    </div>
                 </div>
                 
                 <div className="aspect-video w-full rounded-[2.5rem] bg-black/60 overflow-hidden relative shadow-3xl border border-white/5 group/video">
                    <iframe 
                      width="100%" 
                      height="100%" 
                      src={`https://www.youtube.com/embed/${selectedStream.id}?autoplay=1&mute=0&controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3`}
                      title="Lofi Radio"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      className="pointer-events-none opacity-40 group-hover/video:opacity-60 transition-opacity"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent pointer-events-none" />
                    <div className="absolute bottom-6 left-8 space-y-1">
                       <p className="text-[9px] font-black uppercase tracking-widest text-accent italic">ŞU AN ÇALIYOR</p>
                       <p className="text-2xl font-black italic tracking-tighter uppercase line-clamp-1">{selectedStream.title}</p>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4 relative z-10">
                    {LOFI_STREAMS.map((stream) => (
                       <button 
                         key={stream.id}
                         onClick={() => setSelectedStream(stream)}
                         className={cn(
                           "flex items-center gap-3 p-4 rounded-2xl border transition-all text-left group h-full",
                           selectedStream.id === stream.id ? "bg-white text-primary border-white shadow-2xl scale-105" : "bg-white/5 border-white/5 hover:bg-white/10"
                         )}
                       >
                          <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center text-white shadow-xl group-hover:rotate-12 transition-transform shrink-0", stream.color)}>
                             <Youtube className="h-5 w-5" />
                          </div>
                          <span className="text-[9px] font-black uppercase tracking-widest line-clamp-2 italic">{stream.title}</span>
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
