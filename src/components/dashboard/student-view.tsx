'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useDoc } from '@/firebase';
import { 
  CheckCircle, 
  Clock, 
  Calendar, 
  Brain, 
  Target, 
  TrendingUp, 
  Zap, 
  Timer, 
  Play, 
  BookOpen,
  PencilLine,
  Flame,
  Book,
  Youtube,
  Award,
  Sparkles,
  PlaySquare,
  ChevronRight,
  Map
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, RadarChart, PolarGrid, 
  PolarAngleAxis, Radar, AreaChart, 
  Area, XAxis, YAxis, Tooltip
} from 'recharts';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { EXAM_CONFIGS } from '@/lib/exam-configs';

interface StudentViewProps {
  user: any;
  userData: any;
  isReadOnly?: boolean;
}

const radarData = [
  { subject: 'Edebiyat', A: 85, B: 110, fullMark: 150 },
  { subject: 'Tarih', A: 70, B: 130, fullMark: 150 },
  { subject: 'Coğrafya', A: 90, B: 130, fullMark: 150 },
  { subject: 'Felsefe', A: 65, B: 100, fullMark: 150 },
  { subject: 'Türkçe', A: 95, B: 90, fullMark: 150 },
  { subject: 'Din Kültürü', A: 80, B: 85, fullMark: 150 },
];

export function StudentView({ user, userData, isReadOnly = false }: StudentViewProps) {
  const [activeTimer, setActiveTimer] = useState(false);
  const [timeLeft, setTimerLeft] = useState(25 * 60);

  const { data: studyPlan } = useDoc<any>(user?.uid ? `studyPlans/${user.uid}` : null);
  const examConfig = EXAM_CONFIGS[userData?.targetExam || 'YKS_SOZ'] || EXAM_CONFIGS['YKS_SOZ'];

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
    if (!studyPlan?.schedule) return [];
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
  }, [studyPlan, today]);

  return (
    <div className="p-6 lg:p-12 space-y-12 max-w-[1700px] mx-auto w-full animate-in fade-in duration-1000 bg-[#FAFBFF]">
      
      {/* Top Section: Welcome & Level */}
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <Card className="xl:col-span-8 rounded-[4rem] border-none shadow-[0_50px_100px_-20px_rgba(15,23,42,0.12)] bg-white p-14 relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
           <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-12 relative z-10">
              <div className="space-y-8">
                 <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-primary text-white font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl shadow-primary/20">
                    <Sparkles className="h-4 w-4 text-accent" /> COMMAND CENTER V4.8
                 </div>
                 <div className="space-y-4">
                    <h1 className="text-6xl md:text-8xl font-black text-primary leading-[0.8] tracking-tighter italic uppercase text-shadow-premium">
                       HOŞ GELDİN, <br /><span className="text-accent text-shadow-accent">{userData?.displayName?.split(' ')[0] || 'DEK'} 👋</span>
                    </h1>
                    <p className="text-2xl text-muted-foreground font-medium italic opacity-60 max-w-xl">
                       Akademik zekanız bugün %14 daha verimli çalışıyor. Hedefinize {userData?.targetExam} planıyla bir adım daha yaklaştınız.
                    </p>
                 </div>
              </div>
              <div className="bg-[#0F172A] p-10 rounded-[4rem] text-white shadow-[0_40px_80px_-20px_rgba(15,23,42,0.4)] shrink-0 transition-transform duration-700 hover:scale-105 border border-white/5">
                 <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 italic">AI ACADEMIC SCORE</p>
                    <div className="flex items-baseline gap-2">
                       <p className="text-7xl font-black italic tracking-tighter text-accent">82</p>
                       <span className="text-2xl font-black opacity-20">/100</span>
                    </div>
                 </div>
                 <div className="mt-8 pt-8 border-t border-white/10 flex items-center gap-6">
                    <div className="h-12 w-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
                       <TrendingUp className="h-6 w-6 text-emerald-400" />
                    </div>
                    <p className="text-xs font-bold italic opacity-60">Geçen haftaya göre <br /><span className="text-emerald-400">+12% yükseliş</span></p>
                 </div>
              </div>
           </div>
        </Card>

        <Card className="xl:col-span-4 rounded-[4rem] border-none shadow-[0_60px_120px_-30px_rgba(15,23,42,0.15)] bg-white p-14 flex flex-col items-center justify-center space-y-12 relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 blur-[100px] rounded-full"></div>
           
           <div className="relative">
              <div className="h-32 w-32 rounded-full bg-accent flex items-center justify-center text-white shadow-[0_25px_50px_-12px_rgba(245,158,11,0.5)] transition-all duration-700 group-hover:scale-110">
                 <Flame className="h-16 w-14 fill-white animate-pulse" />
              </div>
              <div className="absolute -top-4 -right-4 h-14 w-14 bg-primary rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-2xl border-4 border-white rotate-12">18</div>
           </div>

           <div className="text-center space-y-4">
              <p className="text-[12px] font-black uppercase tracking-[0.5em] text-muted-foreground/30 italic">CURRENT ACADEMIC LEVEL</p>
              <h2 className="text-8xl font-black italic tracking-tighter text-primary uppercase">LVL {level}</h2>
              <Badge variant="outline" className="px-6 py-2 rounded-xl border-primary/5 bg-slate-50 text-accent font-black text-[10px] uppercase tracking-widest">
                 <Award className="h-3.5 w-3.5 mr-2" /> EDEBİYAT USTASI ROZETİ
              </Badge>
           </div>

           <div className="w-full space-y-5 pt-4 border-t border-primary/5">
              <div className="h-5 w-full bg-slate-100 rounded-full overflow-hidden p-1 shadow-inner">
                 <div className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-1000" style={{ width: `${progressToNextLevel}%` }}></div>
              </div>
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                 <span className="text-muted-foreground">XP {progressToNextLevel * 10} / 1000</span>
                 <span className="text-primary italic">%{progressToNextLevel} COMPLETION</span>
              </div>
           </div>
        </Card>
      </section>

      {/* Middle Section: Stats & Radar */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <Card className="rounded-[3.5rem] border-none shadow-xl bg-white p-12 space-y-10 border border-primary/5 col-span-1">
            <h3 className="text-2xl font-black italic tracking-tighter uppercase text-primary flex items-center gap-3">
               <Target className="h-6 w-6 text-accent" /> ACADEMIC BALANCE
            </h3>
            <div className="h-[300px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                     <PolarGrid stroke="#E2E8F0" />
                     <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fontWeight: 900, fill: '#64748B' }} />
                     <Radar name="Success" dataKey="A" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.4} />
                  </RadarChart>
               </ResponsiveContainer>
            </div>
            <p className="text-xs font-medium text-muted-foreground text-center italic">Sözel dersler arasındaki denge oranınız <span className="text-primary font-black">%94 uyumlu.</span></p>
         </Card>

         <Card className="lg:col-span-2 rounded-[3.5rem] border-none shadow-xl bg-primary text-white p-14 relative overflow-hidden group border border-white/5">
            <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-accent/20 blur-[150px] rounded-full"></div>
            <div className="flex justify-between items-start mb-12">
               <div className="space-y-2">
                  <h3 className="text-4xl font-black italic tracking-tighter uppercase text-shadow-deep">52 HAFTALIK YOL HARİTASI</h3>
                  <p className="text-sm font-bold opacity-40 uppercase tracking-[0.2em] italic">Akademik İlerleme İzleyici</p>
               </div>
               <div className="h-16 w-16 rounded-3xl bg-white/10 flex items-center justify-center border border-white/10 shadow-2xl">
                  <Map className="h-8 w-8 text-accent" />
               </div>
            </div>
            <div className="h-[200px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={[
                    { week: 1, val: 20 }, { week: 10, val: 45 }, { week: 20, val: 35 }, 
                    { week: 30, val: 75 }, { week: 40, val: 65 }, { week: 52, val: 95 }
                  ]}>
                     <defs>
                        <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8}/>
                           <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                        </linearGradient>
                     </defs>
                     <Area type="monotone" dataKey="val" stroke="#F59E0B" strokeWidth={4} fillOpacity={1} fill="url(#colorVal)" />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-4 gap-4 mt-12 pt-8 border-t border-white/10">
               {[
                 { label: 'FAZ 1', val: 'Tamamlandı', color: 'text-emerald-400' },
                 { label: 'FAZ 2', val: 'Aktif Mod', color: 'text-accent' },
                 { label: 'FAZ 3', val: '12 Hafta Sonra', color: 'opacity-40' },
                 { label: 'FAZ 4', val: '28 Hafta Sonra', color: 'opacity-40' },
               ].map((f, i) => (
                 <div key={i} className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40">{f.label}</p>
                    <p className={cn("text-xs font-black uppercase italic", f.color)}>{f.val}</p>
                 </div>
               ))}
            </div>
         </Card>
      </section>

      {/* Tasks & Agenda */}
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-10">
         <div className="xl:col-span-8 space-y-10">
            <div className="flex justify-between items-end px-4">
               <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground opacity-30 italic">DAILY OPERATIONS</p>
                  <h3 className="text-5xl font-black italic tracking-tighter uppercase text-primary">BUGÜNKÜ GÖREVLER</h3>
               </div>
               <Button variant="outline" className="h-12 px-8 rounded-2xl border-2 border-primary/5 font-black text-[10px] uppercase tracking-widest hover:bg-primary hover:text-white transition-all shadow-sm" asChild>
                  <Link href="/dashboard/planning">Haftalık Planı Aç <ChevronRight className="ml-2 h-4 w-4" /></Link>
               </Button>
            </div>
            <div className="grid gap-6">
               {todayTasks.length > 0 ? todayTasks.map((task: any, i: number) => (
                 <Card key={i} className={cn(
                   "p-10 rounded-[3.5rem] border-none shadow-xl flex items-center justify-between group transition-all hover:scale-[1.02] border border-primary/5",
                   task.status === 'completed' ? "bg-emerald-50/50" : 
                   task.status === 'delayed' ? "bg-rose-50/50" : "bg-white"
                 )}>
                    <div className="flex items-center gap-10">
                       <div className="text-center shrink-0 w-24">
                          <p className="text-2xl font-black text-primary leading-none tracking-tighter">{task.time}</p>
                          <Badge variant="ghost" className="text-[10px] font-black text-muted-foreground/30 uppercase mt-2">START</Badge>
                       </div>
                       <div className="h-14 w-px bg-primary/10"></div>
                       <div className="space-y-3">
                          <div className="flex items-center gap-4">
                             <h4 className="text-3xl font-black italic tracking-tight text-primary leading-none uppercase">{task.title}</h4>
                             <Badge className={cn(
                               "text-[10px] font-black uppercase px-4 py-1.5 rounded-full border-none",
                               task.status === 'completed' ? "bg-emerald-500 text-white" :
                               task.status === 'delayed' ? "bg-rose-500 text-white" : "bg-blue-50 text-blue-600 shadow-inner"
                             )}>
                                {task.status === 'completed' ? 'COMPLETED' : task.status === 'delayed' ? 'DELAYED' : 'UPCOMING'}
                             </Badge>
                          </div>
                          <div className="flex flex-wrap gap-6 items-center">
                            <p className="text-lg font-medium text-muted-foreground italic opacity-70">{task.sub} • {task.dur}</p>
                            <div className="flex gap-3">
                               {task.bookUrl && (
                                 <a href={task.bookUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-slate-50 border border-primary/5 hover:bg-primary hover:text-white transition-all shadow-sm">
                                   <Book className="h-4 w-4 text-accent" />
                                   <span className="text-[10px] font-black uppercase">SOURCE</span>
                                 </a>
                               )}
                               {task.youtubeUrl && (
                                 <a href={task.youtubeUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-slate-50 border border-primary/5 hover:bg-rose-500 hover:text-white transition-all shadow-sm">
                                   <PlaySquare className="h-4 w-4 text-rose-500" />
                                   <span className="text-[10px] font-black uppercase">PLAYLIST</span>
                                 </a>
                               )}
                            </div>
                          </div>
                       </div>
                    </div>
                    <Button size="icon" className={cn(
                      "h-16 w-16 rounded-[2rem] shadow-2xl transition-all group-hover:rotate-6",
                      task.status === 'completed' ? "bg-emerald-500 text-white" :
                      task.status === 'delayed' ? "bg-rose-500 text-white" : "bg-[#0F172A] text-white hover:bg-accent"
                    )}>
                       {task.status === 'completed' ? <CheckCircle className="h-8 w-8" /> : <Play className="h-8 w-8 fill-current" />}
                    </Button>
                 </Card>
               )) : (
                  <Card className="p-20 text-center bg-white rounded-[4rem] border border-dashed border-primary/10 shadow-inner">
                     <Calendar className="h-20 w-20 mx-auto text-primary/10 mb-6" />
                     <p className="font-black text-primary/20 uppercase tracking-[0.4em] text-sm italic">BUGÜN İÇİN PLANLANMIŞ BİR GÖREV BULUNMUYOR.</p>
                     <Button variant="link" className="mt-4 text-accent font-black uppercase text-[10px] tracking-widest" asChild>
                        <Link href="/dashboard/planning">Hemen Bir Plan Oluştur</Link>
                     </Button>
                  </Card>
               )}
            </div>
         </div>

         <aside className="xl:col-span-4 space-y-10">
            <Card className="rounded-[4rem] border-none shadow-2xl bg-white p-12 flex flex-col space-y-10 border border-primary/5 h-full min-h-[600px]">
               <h4 className="text-3xl font-black italic tracking-tighter uppercase flex items-center gap-4 text-primary">
                  <Calendar className="h-8 w-8 text-accent" /> AJANDA
               </h4>
               <div className="grid grid-cols-4 gap-2 bg-slate-50 p-1.5 rounded-[2rem] shadow-inner">
                  {['BUGÜN', 'YARIN', 'HAFTA', 'AY'].map((t, i) => (
                    <button key={i} className={cn(
                      "py-3 rounded-[1.75rem] font-black text-[10px] uppercase tracking-widest transition-all",
                      i === 0 ? "bg-primary text-white shadow-xl" : "text-muted-foreground hover:bg-slate-200/50"
                    )}>{t}</button>
                  ))}
               </div>
               <div className="space-y-8 flex-1 overflow-y-auto pr-4 scrollbar-hide">
                  {[
                    { title: 'Deneme Sınavı (TYT)', time: '10:00', cat: 'EXAM', color: 'bg-orange-500' },
                    { title: 'Bireysel Koçluk', time: '17:00', cat: 'COACH', color: 'bg-indigo-500' },
                    { title: 'Akademik Tekrar', time: '20:00', cat: 'STUDY', color: 'bg-emerald-500' },
                    { title: 'Deneme Analizi', time: 'Yarın', cat: 'ANALYSIS', color: 'bg-blue-500' },
                    { title: 'Sözel Mantık Kampı', time: 'Cmt', cat: 'CAMP', color: 'bg-rose-500' },
                  ].map((ev, i) => (
                    <div key={i} className="flex gap-6 group cursor-pointer">
                       <div className={cn("w-2 h-14 rounded-full shrink-0 group-hover:scale-y-110 transition-all", ev.color)}></div>
                       <div className="space-y-1">
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-30 leading-none">{ev.cat} • {ev.time}</p>
                          <p className="text-xl font-black text-primary italic leading-none group-hover:text-accent transition-colors">{ev.title}</p>
                       </div>
                    </div>
                  ))}
               </div>
               <div className="p-10 bg-[#0F172A] rounded-[3.5rem] border border-white/5 space-y-6 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 blur-3xl rounded-full"></div>
                  <div className="flex items-center justify-between relative z-10">
                     <span className="text-[11px] font-black uppercase tracking-[0.3em] text-white/40 italic">FOCUS TIMER</span>
                     <Timer className="h-5 w-5 text-accent animate-pulse" />
                  </div>
                  <p className="text-6xl font-black text-white tracking-tighter leading-none text-shadow-deep relative z-10">{formatTime(timeLeft)}</p>
                  <Button onClick={() => setActiveTimer(!activeTimer)} className="w-full h-14 rounded-2xl bg-white text-primary hover:bg-accent hover:text-white transition-all font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl relative z-10">
                     {activeTimer ? 'STOP FOCUS' : 'START SESSION'}
                  </Button>
               </div>
            </Card>
         </aside>
      </section>

      {/* Floating Action Button */}
      <div className="fixed bottom-12 right-12 z-[100]">
         <Button className="h-28 w-28 rounded-[3.5rem] bg-[#0F172A] hover:bg-accent text-white shadow-[0_40px_80px_-20px_rgba(15,23,42,0.6)] group transition-all duration-700 hover:scale-110 flex flex-col items-center justify-center gap-2 border-[8px] border-white">
            <Brain className="h-12 w-12 text-accent group-hover:text-white transition-colors" />
            <span className="text-[9px] font-black tracking-[0.3em] uppercase">AI COACH</span>
         </Button>
      </div>

    </div>
  );
}