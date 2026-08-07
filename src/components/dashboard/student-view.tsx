
'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useDoc, useFirestore } from '@/firebase';
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
  Flame,
  Award,
  Sparkles,
  ChevronRight,
  Plus,
  BarChart3,
  BookOpen,
  ArrowUpRight,
  History,
  Trophy,
  Activity,
  PlaySquare,
  Book
} from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { 
  ResponsiveContainer, AreaChart, 
  Area, XAxis, YAxis, Tooltip, BarChart, Bar, Cell
} from 'recharts';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { EXAM_CONFIGS } from '@/lib/exam-configs';
import { AcademicSessionDialog } from '@/components/academic-session-dialog';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

interface StudentViewProps {
  user: any;
  userData: any;
  isReadOnly?: boolean;
}

export function StudentView({ user, userData, isReadOnly = false }: StudentViewProps) {
  const db = useFirestore();
  const { toast } = useToast();
  const [activeTimer, setActiveTimer] = useState(false);
  const [timeLeft, setTimerLeft] = useState(25 * 60);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const { data: studyPlan } = useDoc<any>(user?.uid ? `studyPlans/${user.uid}` : null);
  
  const totalTasksCompleted = useMemo(() => {
    if (!studyPlan?.schedule) return 0;
    let count = 0;
    studyPlan.schedule.forEach((day: any) => {
      day.tasks?.forEach((task: any) => {
        if (task.status === 'completed') count++;
      });
    });
    return count;
  }, [studyPlan]);

  const level = Math.floor(totalTasksCompleted / 10) + 1;
  const xp = totalTasksCompleted * 120;
  const xpToNextLevel = level * 1000;
  const progressToNextLevel = Math.min(((xp % 1000) / 1000) * 100, 100);

  const today = new Intl.DateTimeFormat('tr-TR', { weekday: 'long' }).format(new Date());
  
  const todayTasks = useMemo(() => {
    if (!studyPlan?.schedule) return [];
    const dayData = studyPlan.schedule.find((s: any) => s.day === today);
    return (dayData?.tasks || []);
  }, [studyPlan, today]);

  const stats = [
    { label: 'TOPLAM XP', val: xp.toLocaleString(), icon: Zap, color: 'text-amber-500', bg: 'bg-amber-50' },
    { label: 'ÇALIŞMA', val: `${Math.floor(totalTasksCompleted * 0.75)} SAAT`, icon: Clock, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'NET ORT.', val: '84.5', icon: Target, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { label: 'GÜNLÜK SERİ', val: '16 GÜN', icon: Flame, color: 'text-rose-500', bg: 'bg-rose-50' },
  ];

  const academicBalance = [
    { subject: 'Edebiyat', val: 85, color: '#F59E0B' },
    { subject: 'Tarih', val: 72, color: '#0F172A' },
    { subject: 'Coğrafya', val: 90, color: '#F59E0B' },
    { subject: 'Felsefe', val: 64, color: '#0F172A' },
    { subject: 'Türkçe', val: 94, color: '#F59E0B' },
  ];

  const handleQuickAddSession = async (taskData: any) => {
    if (!db || !user || !studyPlan) return;
    const newSchedule = studyPlan.schedule ? [...studyPlan.schedule] : [];
    let dayIndex = newSchedule.findIndex(s => s.day === today);
    if (dayIndex === -1) {
      newSchedule.push({ day: today, tasks: [taskData] });
    } else {
      newSchedule[dayIndex].tasks = [...newSchedule[dayIndex].tasks, taskData];
    }
    try {
      await setDoc(doc(db, 'studyPlans', user.uid), {
        ...studyPlan,
        schedule: newSchedule,
        updatedAt: serverTimestamp()
      });
      toast({ title: 'Görev Eklendi', description: 'Planınıza yeni seans eklendi.' });
    } catch (e) {
      toast({ variant: 'destructive', title: 'Hata', description: 'Eklenemedi.' });
    }
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec < 10 ? '0' : ''}${sec}`;
  };

  return (
    <div className="p-8 lg:p-12 space-y-10 max-w-[1800px] mx-auto w-full animate-in fade-in duration-1000">
      
      {/* TOP STATS BAR */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="p-6 rounded-[2rem] border-none shadow-sm bg-white flex items-center gap-5 group hover:shadow-xl transition-all hover:-translate-y-1">
            <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110", stat.bg)}>
              <stat.icon className={cn("h-6 w-6", stat.color)} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">{stat.label}</p>
              <p className="text-2xl font-black text-primary tracking-tighter">{stat.val}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        
        {/* LEFT COLUMN (8 COLS) */}
        <div className="xl:col-span-8 space-y-10">
          
          {/* HERO GREETING */}
          <Card className="rounded-[3.5rem] border-none shadow-[0_40px_80px_-20px_rgba(15,23,42,0.1)] bg-white p-12 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-accent/10 transition-all duration-1000"></div>
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-10">
               <div className="space-y-6">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-50 border border-primary/5 text-primary/40 font-black text-[10px] uppercase tracking-widest italic">
                    <Activity className="h-3 w-3 text-accent" /> Academic Node Active
                  </div>
                  <div className="space-y-2">
                    <h1 className="text-5xl font-black text-primary tracking-tighter italic uppercase">Günaydın, <span className="text-accent">{userData?.displayName?.split(' ')[0]}</span> 👋</h1>
                    <p className="text-lg font-medium text-muted-foreground italic max-w-md">Bugün seni bekleyen <span className="text-primary font-bold">{todayTasks.length} görev</span> ve yaklaşık <span className="text-primary font-bold">3 saatlik</span> bir çalışma maratonu var.</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="px-5 py-3 rounded-2xl bg-primary text-white flex items-center gap-3 shadow-xl shadow-primary/20">
                      <Zap className="h-4 w-4 text-accent" />
                      <span className="text-xs font-black uppercase tracking-widest">+350 XP Hedef</span>
                    </div>
                    <Button onClick={() => setIsAddDialogOpen(true)} className="h-12 px-8 rounded-2xl bg-white border-2 border-primary/5 text-primary hover:bg-slate-50 font-black text-[10px] uppercase tracking-widest shadow-sm">
                      Programı Yönet →
                    </Button>
                  </div>
               </div>
               <div className="h-40 w-40 rounded-[3rem] bg-[#0F172A] flex items-center justify-center shadow-3xl transform rotate-3 hover:rotate-0 transition-transform duration-500 border-8 border-white">
                  <div className="text-center">
                    <p className="text-5xl font-black text-accent italic">%{progressToNextLevel.toFixed(0)}</p>
                    <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mt-1">Completion</p>
                  </div>
               </div>
            </div>
          </Card>

          {/* TODAY'S PLAN */}
          <div className="space-y-6">
             <div className="flex justify-between items-end px-4">
                <div className="space-y-1">
                   <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/30 italic">OPERATIONAL SCHEDULE</p>
                   <h3 className="text-4xl font-black italic tracking-tighter uppercase text-primary flex items-center gap-3">
                    <Calendar className="h-8 w-8 text-accent" /> Bugünkü Plan
                   </h3>
                </div>
                <Button onClick={() => setIsAddDialogOpen(true)} variant="ghost" className="text-accent font-black text-xs uppercase tracking-widest hover:bg-accent/5">
                  Yeni Seans Ekle +
                </Button>
             </div>
             <div className="grid gap-4">
                {todayTasks.length > 0 ? todayTasks.map((task: any, i: number) => (
                  <Card key={i} className="group p-8 rounded-[2.5rem] border-none shadow-sm hover:shadow-xl transition-all hover:scale-[1.01] bg-white flex items-center justify-between border border-primary/5">
                    <div className="flex items-center gap-8">
                       <div className="text-center w-20 shrink-0">
                          <p className="text-xl font-black text-primary leading-none">{task.time}</p>
                          <p className="text-[9px] font-black text-muted-foreground/30 uppercase mt-1">Start</p>
                       </div>
                       <div className="h-12 w-px bg-primary/5"></div>
                       <div className="space-y-1">
                          <h4 className="text-2xl font-black italic tracking-tight text-primary uppercase leading-none group-hover:text-accent transition-colors">{task.subject}</h4>
                          <p className="text-sm font-medium text-muted-foreground italic opacity-60">{task.topic} • {task.duration}</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-4">
                       <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                          {task.bookUrl && <Button size="icon" variant="ghost" className="h-10 w-10 rounded-xl bg-slate-50"><Book className="h-4 w-4 text-primary" /></Button>}
                          {task.youtubeUrl && <Button size="icon" variant="ghost" className="h-10 w-10 rounded-xl bg-rose-50"><PlaySquare className="h-4 w-4 text-rose-500" /></Button>}
                       </div>
                       <Button size="icon" className={cn(
                        "h-14 w-14 rounded-2xl shadow-xl transition-all group-hover:rotate-6",
                        task.status === 'completed' ? "bg-emerald-500 text-white" : "bg-[#0F172A] text-white hover:bg-accent"
                       )}>
                         {task.status === 'completed' ? <CheckCircle2 className="h-7 w-7" /> : <Play className="h-7 w-7 fill-current" />}
                       </Button>
                    </div>
                  </Card>
                )) : (
                  <Card className="p-20 text-center bg-white/50 rounded-[3rem] border border-dashed border-primary/5">
                    <p className="font-black text-primary/20 uppercase tracking-[0.4em] text-sm italic">Bugün İçin Planlanmış Görev Bulunmuyor.</p>
                  </Card>
                )}
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* WEEKLY PROGRESS */}
            <Card className="p-10 rounded-[3rem] border-none shadow-xl bg-white space-y-8">
              <div className="flex justify-between items-center">
                <h4 className="text-xl font-black italic tracking-tighter uppercase text-primary">Haftalık İlerleme</h4>
                <TrendingUp className="h-6 w-6 text-emerald-500" />
              </div>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={[
                    { day: 'Pzt', val: 400 }, { day: 'Sal', val: 750 }, { day: 'Çar', val: 500 }, 
                    { day: 'Per', val: 900 }, { day: 'Cum', val: 600 }, { day: 'Cmt', val: 800 }, { day: 'Paz', val: 700 }
                   ]}>
                      <defs>
                         <linearGradient id="colorVal" x1="0" x1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                         </linearGradient>
                      </defs>
                      <Area type="monotone" dataKey="val" stroke="#F59E0B" strokeWidth={3} fillOpacity={1} fill="url(#colorVal)" />
                   </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-between items-end border-t border-primary/5 pt-6">
                <div className="space-y-1">
                   <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-40">TAMAMLANAN</p>
                   <p className="text-2xl font-black text-primary italic tracking-tighter">%82</p>
                </div>
                <div className="text-right">
                   <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">↑ %14</p>
                   <p className="text-xs font-bold text-muted-foreground italic">vs Geçen Hafta</p>
                </div>
              </div>
            </Card>

            {/* ACADEMIC BALANCE */}
            <Card className="p-10 rounded-[3rem] border-none shadow-xl bg-white space-y-8">
              <div className="flex justify-between items-center">
                <h4 className="text-xl font-black italic tracking-tighter uppercase text-primary">Akademik Denge</h4>
                <Target className="h-6 w-6 text-accent" />
              </div>
              <div className="space-y-5">
                {academicBalance.map((item, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                       <span className="text-muted-foreground">{item.subject}</span>
                       <span className="text-primary italic">%{item.val}</span>
                    </div>
                    <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden shadow-inner">
                       <div className="h-full transition-all duration-1000" style={{ width: `${item.val}%`, backgroundColor: item.color }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* RIGHT COLUMN (4 COLS) - THE SIDE PANEL */}
        <div className="xl:col-span-4 space-y-8">
          
          <Card className="rounded-[3.5rem] border-none shadow-[0_40px_80px_-20px_rgba(15,23,42,0.1)] bg-white overflow-hidden">
            <div className="bg-primary p-8 text-white flex justify-between items-center relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 blur-3xl rounded-full"></div>
               <div className="space-y-1 relative z-10">
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] italic">OPERATIONAL NODE</p>
                  <h4 className="text-2xl font-black italic tracking-tighter uppercase">Kişisel Metrikler</h4>
               </div>
               <Trophy className="h-8 w-8 text-accent relative z-10" />
            </div>
            
            <div className="p-10 space-y-10">
               {/* STREAK */}
               <div className="flex items-center justify-between group cursor-pointer">
                  <div className="flex items-center gap-5">
                    <div className="h-12 w-12 rounded-2xl bg-rose-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Flame className="h-6 w-6 text-rose-500 fill-current" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">GÜNLÜK SERİ</p>
                      <p className="text-xl font-black text-primary italic">16 GÜN</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground opacity-20 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
               </div>

               {/* LEVEL */}
               <div className="space-y-4">
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-5">
                        <div className="h-12 w-12 rounded-2xl bg-amber-50 flex items-center justify-center">
                          <Award className="h-6 w-6 text-amber-500" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">AKADEMİK SEVİYE</p>
                          <p className="text-xl font-black text-primary italic tracking-tighter">LVL {level}</p>
                        </div>
                     </div>
                     <span className="text-[10px] font-black text-muted-foreground">{xp % 1000} / 1000 XP</span>
                  </div>
                  <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 shadow-inner">
                     <div className="h-full bg-accent rounded-full transition-all duration-1000" style={{ width: `${progressToNextLevel}%` }}></div>
                  </div>
               </div>

               <div className="h-px w-full bg-primary/5"></div>

               {/* XP SUMMARY */}
               <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">BUGÜNKÜ XP</p>
                    <p className="text-4xl font-black text-primary tracking-tighter text-shadow-deep">+{xp % 1000}</p>
                  </div>
                  <div className="h-14 w-14 rounded-3xl bg-emerald-50 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-emerald-500" />
                  </div>
               </div>

               <div className="h-px w-full bg-primary/5"></div>

               {/* FOCUS TIMER */}
               <div className="p-8 bg-[#F8FAFC] rounded-[2.5rem] border border-primary/5 space-y-6 shadow-inner relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 blur-3xl rounded-full"></div>
                  <div className="flex items-center justify-between relative z-10">
                     <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/30 italic">FOCUS TERMINAL</span>
                     <Timer className="h-5 w-5 text-accent animate-pulse" />
                  </div>
                  <p className="text-6xl font-black text-primary tracking-tighter leading-none text-shadow-deep relative z-10 text-center">{formatTime(timeLeft)}</p>
                  <Button onClick={() => setActiveTimer(!activeTimer)} className="w-full h-14 rounded-2xl bg-primary text-white hover:bg-accent transition-all font-black text-[11px] uppercase tracking-[0.2em] shadow-xl relative z-10">
                     {activeTimer ? 'SESSİON AKTİF' : 'ODAKLANMAYI BAŞLAT'}
                  </Button>
               </div>
            </div>
          </Card>

          {/* AI RECOMMENDATION ENGINE */}
          <Card className="p-10 rounded-[3.5rem] border-none shadow-xl bg-accent text-primary space-y-8 relative overflow-hidden group">
            <Sparkles className="absolute top-6 right-6 h-10 w-10 opacity-20 group-hover:scale-125 transition-transform" />
            <h4 className="text-2xl font-black italic tracking-tighter uppercase">AI Önerisi</h4>
            <div className="space-y-4 relative z-10">
              <p className="text-lg leading-relaxed font-bold italic">
                "Bugün <span className="underline decoration-4 decoration-white/30 underline-offset-4">AYT Edebiyat - Cumhuriyet Dönemi</span> çalışırsan hedef netine <span className="text-white">+0.8 katkı</span> sağlayabilir."
              </p>
              <Button className="w-full h-12 rounded-xl bg-white/20 hover:bg-white/40 text-primary font-black text-[10px] uppercase tracking-widest border border-white/20">Görevi Hemen Oluştur</Button>
            </div>
          </Card>

          {/* RECENT ACHIEVEMENTS */}
          <Card className="p-10 rounded-[3.5rem] border-none shadow-xl bg-white space-y-8 border border-primary/5">
            <h4 className="text-xl font-black italic tracking-tighter uppercase text-primary">Son Başarılar</h4>
            <div className="space-y-6">
               {[
                 { icon: Trophy, label: '1000 XP Barajı', desc: 'Akademik rütbe atlandı', color: 'text-amber-500' },
                 { icon: Flame, label: '7 Gün Seri', desc: 'Disiplin madalyası', color: 'text-rose-500' },
                 { icon: BookOpen, label: '100 Saat Çalışma', desc: 'Bilgi avcısı ünvanı', color: 'text-blue-500' },
               ].map((ach, i) => (
                 <div key={i} className="flex gap-5 items-center group cursor-pointer">
                    <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-inner">
                       <ach.icon className={cn("h-6 w-6", ach.color)} />
                    </div>
                    <div className="space-y-0.5">
                       <p className="text-sm font-black text-primary uppercase italic leading-none">{ach.label}</p>
                       <p className="text-[10px] font-bold text-muted-foreground opacity-60 uppercase">{ach.desc}</p>
                    </div>
                 </div>
               ))}
            </div>
          </Card>

        </div>
      </div>

      <AcademicSessionDialog 
        isOpen={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSave={handleQuickAddSession}
        selectedDay={today}
      />

      {/* GLOBAL FLOATING ACTION BUTTON */}
      <div className="fixed bottom-12 right-12 z-[100] group">
         <Button onClick={() => setIsAddDialogOpen(true)} className="h-24 w-24 rounded-[3rem] bg-[#0F172A] hover:bg-accent text-white shadow-[0_40px_80px_-20px_rgba(15,23,42,0.6)] transition-all duration-700 hover:scale-110 flex flex-col items-center justify-center gap-1.5 border-[8px] border-white">
            <Plus className="h-10 w-10 text-accent group-hover:rotate-90 transition-transform duration-500" />
            <span className="text-[8px] font-black tracking-[0.3em] uppercase opacity-40">ADD SESSION</span>
         </Button>
      </div>

    </div>
  );
}
