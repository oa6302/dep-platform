'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useDoc } from '@/firebase';
import { 
  CheckCircle2, 
  Clock, 
  Calendar, 
  Brain, 
  Target, 
  TrendingUp, 
  Zap, 
  Timer, 
  Play, 
  BookOpenCheck,
  PencilLine,
  Flame,
  Book,
  Youtube,
  Award,
  Sparkles,
  PlaySquare
} from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { 
  XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, RadarChart, PolarGrid, 
  PolarAngleAxis, Radar, AreaChart, 
  Area
} from 'recharts';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { EXAM_CONFIGS } from '@/lib/exam-configs';

interface StudentViewProps {
  user: any;
  userData: any;
  isReadOnly?: boolean;
}

export function StudentView({ user, userData, isReadOnly = false }: StudentViewProps) {
  const [activeTimer, setActiveTimer] = useState(false);
  const [timeLeft, setTimerLeft] = useState(25 * 60);

  const { data: studyPlan } = useDoc<any>(user?.uid ? `studyPlans/${user.uid}` : null);
  const examConfig = EXAM_CONFIGS[userData?.targetExam || 'YKS_SOZ'] || EXAM_CONFIGS['YKS_SOZ'];

  // XP & Leveling Logic
  const totalTasks = useMemo(() => {
    if (!studyPlan?.schedule) return 0;
    return studyPlan.schedule.reduce((acc: number, day: any) => acc + (day.tasks?.length || 0), 0);
  }, [studyPlan]);

  const level = Math.floor(totalTasks / 5) + 18; 
  const progressToNextLevel = (totalTasks % 5) * 20 || 84;

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec < 10 ? '0' : ''}${sec}`;
  };

  const today = new Intl.DateTimeFormat('tr-TR', { weekday: 'long' }).format(new Date());
  
  const todayTasks = useMemo(() => {
    if (!studyPlan?.schedule) {
      return [
        { time: '09:00', title: 'Edebiyat', sub: 'Cumhuriyet Dönemi', dur: '60 dk', status: 'pending' },
        { time: '11:30', title: 'Tarih', sub: 'Kurtuluş Savaşı', dur: '45 dk', status: 'pending' },
      ];
    }
    const dayData = studyPlan.schedule.find((s: any) => s.day === today) || studyPlan.schedule[0];
    return (dayData?.tasks || []).map((t: any) => ({
       time: t.time,
       title: t.subject,
       sub: t.topic,
       dur: t.duration,
       status: t.status,
       bookUrl: t.bookUrl,
       youtubeUrl: t.youtubeUrl
    }));
  }, [studyPlan, today, userData]);

  return (
    <div className="p-6 lg:p-10 space-y-10 max-w-[1600px] mx-auto w-full animate-in fade-in duration-1000 bg-[#FAFBFF]">
      
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <Card className="lg:col-span-8 rounded-[3.5rem] border-none shadow-[0_40px_100px_-20px_rgba(15,23,42,0.1)] bg-white p-12 relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
           <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10 relative z-10">
              <div className="space-y-6">
                 <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-slate-50 border border-primary/5 text-primary font-black text-[10px] uppercase tracking-widest italic shadow-sm">
                    ✨ AKADEMİK KOMUTA MERKEZİ • {userData?.targetExam}
                 </div>
                 <h1 className="text-5xl md:text-7xl font-black text-primary tracking-tighter italic uppercase leading-none">
                    GÜNAYDIN <br /><span className="text-accent text-shadow-accent">{userData?.displayName?.split(' ')[0] || 'ÖĞRENCİ'} 👋</span>
                 </h1>
                 <p className="text-xl text-muted-foreground font-medium italic opacity-70">Bugünkü {userData?.targetExam} planın hazır. Senin için {todayTasks.length} kritik görev belirlendi.</p>
              </div>
              <div className="flex items-center gap-8 bg-[#0F172A] p-8 rounded-[3rem] text-white shadow-2xl shrink-0 group-hover:scale-105 transition-transform duration-500">
                 <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40 italic">AI AKADEMİK SKOR</p>
                    <p className="text-6xl font-black italic tracking-tighter text-accent">82<span className="text-2xl text-white/20">/100</span></p>
                 </div>
                 <div className="h-16 w-px bg-white/10"></div>
                 <TrendingUp className="h-12 w-12 text-emerald-400 animate-pulse" />
              </div>
           </div>
           
           <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-12 mt-12 border-t border-primary/5">
              {[
                { label: 'Görev', val: todayTasks.length.toString(), sub: 'Günlük Hedef', icon: CheckCircle2, color: 'text-emerald-500' },
                { label: 'Plan', val: today, sub: 'Aktif Program', icon: BookOpenCheck, color: 'text-blue-500' },
                { label: 'Soru', val: '120', sub: 'Tahmini Hedef', icon: PencilLine, color: 'text-orange-500' },
                { label: 'Çalışma', val: '4s', sub: 'Planlanan Süre', icon: Clock, color: 'text-accent' },
              ].map((item, i) => (
                <div key={i} className="space-y-1">
                   <div className="flex items-center gap-2 mb-1">
                      <item.icon className={cn("h-4 w-4", item.color)} />
                      <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-60">{item.label}</span>
                   </div>
                   <p className="text-3xl font-black text-primary leading-none">{item.val}</p>
                   <p className="text-[10px] font-bold text-muted-foreground/40 italic">{item.sub}</p>
                </div>
              ))}
           </div>
        </Card>

        <Card className="lg:col-span-4 rounded-[3.5rem] border-none shadow-[0_60px_120px_-30px_rgba(15,23,42,0.15)] bg-white p-12 flex flex-col items-center justify-center space-y-10 relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-48 h-48 bg-accent/5 blur-[100px] rounded-full"></div>
           
           <div className="relative">
              <div className="h-28 w-28 rounded-full bg-accent flex items-center justify-center text-white shadow-[0_20px_40px_-10px_rgba(245,158,11,0.4)] transition-all duration-700 group-hover:scale-110">
                 <Flame className="h-14 w-12 fill-white animate-pulse" />
              </div>
           </div>

           <div className="text-center space-y-4">
              <p className="text-[11px] font-black uppercase tracking-[0.4em] text-muted-foreground/40 italic">AKADEMİK SEVİYE</p>
              <h2 className="text-7xl font-black italic tracking-tighter text-primary uppercase">LEVEL {level}</h2>
              <p className="text-sm font-black text-accent italic uppercase tracking-widest">Edebiyat Ustası Rozeti • 3 Gün Kaldı</p>
           </div>

           <div className="w-full space-y-4 pt-4 border-t border-primary/5">
              <div className="h-4 w-full bg-[#F1F5F9] rounded-full overflow-hidden shadow-inner p-0.5">
                 <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${progressToNextLevel}%` }}></div>
              </div>
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                 <span>XP {progressToNextLevel * 10} / 1000</span>
                 <span className="text-primary italic">%{progressToNextLevel} TAMAMLANDI</span>
              </div>
           </div>
        </Card>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-12 gap-10">
         <div className="xl:col-span-8 space-y-8">
            <div className="flex justify-between items-end px-4">
               <h3 className="text-3xl font-black italic tracking-tighter uppercase text-primary">BUGÜNKÜ GÖREVLER</h3>
               <Button variant="link" className="text-accent font-black uppercase text-[10px] tracking-widest hover:underline" asChild>
                  <Link href="/dashboard/planning">Tümünü Gör</Link>
               </Button>
            </div>
            <div className="grid gap-6">
               {todayTasks.map((task: any, i: number) => (
                 <Card key={i} className={cn(
                   "p-8 rounded-[2.5rem] border-none shadow-lg flex items-center justify-between group transition-all hover:scale-[1.02]",
                   task.status === 'completed' ? "bg-emerald-50/50" : 
                   task.status === 'delayed' ? "bg-rose-50/50" : "bg-white"
                 )}>
                    <div className="flex items-center gap-8">
                       <div className="text-center shrink-0 w-20">
                          <p className="text-lg font-black text-primary leading-none">{task.time}</p>
                          <p className="text-[10px] font-bold text-muted-foreground opacity-40 uppercase tracking-widest mt-1 italic">BAŞLANGIÇ</p>
                       </div>
                       <div className="h-10 w-px bg-primary/5"></div>
                       <div>
                          <div className="flex items-center gap-3 mb-1">
                             <h4 className="text-2xl font-black italic tracking-tight text-primary leading-none uppercase">{task.title}</h4>
                             <Badge variant="outline" className={cn(
                               "text-[9px] font-black uppercase px-2 py-0.5",
                               task.status === 'completed' ? "bg-emerald-500 text-white border-none" :
                               task.status === 'delayed' ? "bg-rose-500 text-white border-none" : "bg-blue-50 text-blue-600"
                             )}>
                                {task.status === 'completed' ? 'TAMAMLANDI' : task.status === 'delayed' ? 'GECİKTİ' : 'SIRADA'}
                             </Badge>
                          </div>
                          <div className="flex flex-wrap gap-4 items-center">
                            <p className="text-sm font-medium text-muted-foreground italic">{task.sub} • {task.dur}</p>
                            {(task.bookUrl || task.youtubeUrl) && <div className="w-px h-4 bg-primary/10"></div>}
                            <div className="flex gap-2">
                               {task.bookUrl && (
                                 <a href={task.bookUrl} target="_blank" rel="noopener noreferrer" title="Ders Kitabı" className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-primary/5 hover:bg-primary hover:text-white transition-all">
                                   <Book className="h-3.5 w-3.5 text-[#F59E0B]" />
                                   <span className="text-[8px] font-black uppercase ml-1.5">KAYNAK</span>
                                 </a>
                               )}
                               {task.youtubeUrl && (
                                 <a href={task.youtubeUrl} target="_blank" rel="noopener noreferrer" title="YouTube Oynatma Listesi" className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-primary/5 hover:bg-rose-500 hover:text-white transition-all">
                                   <PlaySquare className="h-3.5 w-3.5 text-rose-500" />
                                   <span className="text-[8px] font-black uppercase ml-1.5">PLAYLIST</span>
                                 </a>
                               )}
                            </div>
                          </div>
                       </div>
                    </div>
                    <Button size="icon" className={cn(
                      "h-14 w-14 rounded-2xl shadow-xl transition-all group-hover:rotate-6",
                      task.status === 'completed' ? "bg-emerald-500 text-white" :
                      task.status === 'delayed' ? "bg-rose-500 text-white" : "bg-[#0F172A] text-white hover:bg-accent"
                    )}>
                       {task.status === 'completed' ? <CheckCircle2 className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                    </Button>
                 </Card>
               ))}
               {todayTasks.length === 0 && (
                  <div className="py-20 text-center bg-white rounded-[3rem] border border-dashed border-primary/10">
                     <p className="font-black text-primary/30 uppercase tracking-widest text-xs italic">Bugün için planlanmış bir görev bulunmuyor.</p>
                  </div>
               )}
            </div>
         </div>

         <Card className="xl:col-span-4 rounded-[3.5rem] border-none shadow-[0_40px_80px_-20px_rgba(15,23,42,0.08)] bg-white p-10 flex flex-col space-y-8 border border-primary/5">
            <h4 className="text-2xl font-black italic tracking-tighter uppercase flex items-center gap-3">
               <Calendar className="h-6 w-6 text-accent" /> AJANDA
            </h4>
            <div className="grid grid-cols-2 gap-4">
               {['BUGÜN', 'YARIN', 'HAFTA', 'AY'].map((t, i) => (
                 <Button key={i} variant={i === 0 ? 'default' : 'ghost'} className={cn(
                   "h-12 rounded-2xl font-black text-[10px] uppercase tracking-widest",
                   i === 0 ? "bg-primary text-white" : "bg-slate-50 text-muted-foreground hover:bg-primary/5"
                 )}>{t}</Button>
               ))}
            </div>
            <div className="space-y-6 flex-1 overflow-y-auto pr-2 scrollbar-hide">
               {[
                 { title: 'Deneme Sınavı', time: '10:00', cat: 'Sınav', color: 'bg-orange-500' },
                 { title: 'Koçluk Seansı', time: '17:00', cat: 'Koçluk', color: 'bg-indigo-500' },
                 { title: 'Genel Tekrar', time: '20:00', cat: 'Tekrar', color: 'bg-emerald-500' },
                 { title: 'Matematik Etüt', time: 'Yarın', cat: 'Etüt', color: 'bg-blue-500' },
               ].map((ev, i) => (
                 <div key={i} className="flex gap-5 group cursor-pointer">
                    <div className={cn("w-1.5 h-12 rounded-full shrink-0 group-hover:scale-y-125 transition-all", ev.color)}></div>
                    <div className="space-y-1">
                       <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-40 leading-none">{ev.cat} • {ev.time}</p>
                       <p className="text-lg font-black text-primary italic leading-none">{ev.title}</p>
                    </div>
                 </div>
               ))}
            </div>
            <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-primary/5 space-y-4">
               <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">ODAKLANMA</span>
                  <Timer className="h-4 w-4 text-accent" />
               </div>
               <p className="text-4xl font-black text-primary tracking-tighter leading-none">{formatTime(timeLeft)}</p>
               <Button onClick={() => setActiveTimer(!activeTimer)} className="w-full h-12 rounded-xl bg-primary text-white font-black text-[10px] uppercase tracking-widest shadow-xl">
                  {activeTimer ? 'DURDUR' : 'SEANSI BAŞLAT'}
               </Button>
            </div>
         </Card>
      </section>

      <div className="fixed bottom-10 right-10 z-[100]">
         <Button className="h-24 w-24 rounded-[2.5rem] bg-[#0F172A] hover:bg-accent text-white shadow-[0_30px_60px_-10px_rgba(15,23,42,0.5)] group transition-all duration-500 hover:scale-110 flex flex-col items-center justify-center gap-1 border-[6px] border-white">
            <Brain className="h-10 w-10 text-accent group-hover:text-white transition-colors" />
            <span className="text-[8px] font-black tracking-widest uppercase">AI KOÇ</span>
         </Button>
      </div>

    </div>
  );
}
