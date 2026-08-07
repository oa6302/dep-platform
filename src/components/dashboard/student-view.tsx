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
  Book,
  MoreVertical
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
  const xpToNextLevel = 1000;
  const currentXpInLevel = xp % 1000;
  const progressToNextLevel = Math.min((currentXpInLevel / xpToNextLevel) * 100, 100);

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
      toast({ title: 'Görev Eklendi', description: 'Planınıza yeni seans eklendi.', className: "bg-primary text-white rounded-[2rem]" });
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
    <div className="p-8 lg:p-12 space-y-12 max-w-[1800px] mx-auto w-full animate-in fade-in duration-1000">
      
      {/* 4-COLUMN TOP STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {stats.map((stat, i) => (
          <Card key={i} className="p-8 rounded-[2.5rem] border-none shadow-[0_20px_40px_-10px_rgba(0,0,0,0.05)] bg-white flex items-center gap-6 group hover:shadow-xl transition-all hover:-translate-y-1 border border-primary/5">
            <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:rotate-6 shadow-sm", stat.bg)}>
              <stat.icon className={cn("h-7 w-7", stat.color)} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 mb-1">{stat.label}</p>
              <p className="text-3xl font-black text-primary tracking-tighter italic">{stat.val}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
        
        {/* OPERATIONAL AREA (8 COLUMNS) */}
        <div className="xl:col-span-8 space-y-12">
          
          {/* PERSONAL COMMAND PANEL (HERO) */}
          <Card className="rounded-[4rem] border-none shadow-[0_60px_100px_-20px_rgba(15,23,42,0.12)] bg-white p-14 relative overflow-hidden group border border-primary/5">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-accent/10 transition-all duration-1000"></div>
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-12">
               <div className="space-y-8 flex-1">
                  <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-slate-50 border border-primary/5 text-primary/40 font-black text-[10px] uppercase tracking-widest italic shadow-sm">
                    <Activity className="h-3.5 w-3.5 text-accent animate-pulse" /> ACADEMIC NODE ACTIVE
                  </div>
                  <div className="space-y-3">
                    <h1 className="text-6xl font-black text-primary tracking-tighter italic uppercase leading-none text-shadow-deep">GÜNAYDIN, <br /><span className="text-accent text-shadow-accent">{userData?.displayName?.split(' ')[0]}</span> 👋</h1>
                    <p className="text-xl font-medium text-muted-foreground italic leading-relaxed max-w-lg">Bugün seni bekleyen <span className="text-primary font-bold">{todayTasks.length} kritik görev</span> ve yaklaşık <span className="text-primary font-bold">3 saatlik</span> bir akademik maraton var.</p>
                  </div>
                  <div className="flex gap-6">
                    <div className="px-6 py-4 rounded-[1.75rem] bg-primary text-white flex items-center gap-4 shadow-2xl shadow-primary/30 group/xp cursor-default">
                      <Zap className="h-5 w-5 text-accent group-hover/xp:animate-pulse" />
                      <div className="text-left">
                         <p className="text-[9px] font-black uppercase tracking-widest opacity-40">GÜNLÜK HEDEF</p>
                         <p className="text-lg font-black italic tracking-tighter">+350 XP</p>
                      </div>
                    </div>
                    <Button onClick={() => setIsAddDialogOpen(true)} className="h-16 px-10 rounded-[1.75rem] bg-white border-2 border-primary/5 text-primary hover:bg-slate-50 font-black text-xs uppercase tracking-widest shadow-sm gap-4 transition-all">
                      PROGRAMI YÖNET <ArrowUpRight className="h-5 w-5 text-accent" />
                    </Button>
                  </div>
               </div>
               <div className="relative shrink-0">
                  <div className="absolute inset-0 bg-accent/20 blur-[60px] rounded-full"></div>
                  <div className="h-52 w-52 rounded-[4rem] bg-[#0F172A] flex items-center justify-center shadow-[0_40px_80px_-15px_rgba(0,0,0,0.4)] transform rotate-3 hover:rotate-0 transition-all duration-700 border-[12px] border-white relative z-10">
                    <div className="text-center">
                      <p className="text-7xl font-black text-accent italic tracking-tighter text-shadow-accent">%{progressToNextLevel.toFixed(0)}</p>
                      <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mt-2">PROGRESS</p>
                    </div>
                  </div>
               </div>
            </div>
          </Card>

          {/* TODAY'S OPERATIONAL SCHEDULE */}
          <div className="space-y-8">
             <div className="flex justify-between items-end px-6">
                <div className="space-y-2">
                   <p className="text-[11px] font-black uppercase tracking-[0.5em] text-muted-foreground/30 italic">OPERATIONAL SCHEDULE</p>
                   <h3 className="text-5xl font-black italic tracking-tighter uppercase text-primary flex items-center gap-5">
                    <Calendar className="h-10 w-10 text-accent" /> BUGÜNKÜ PLAN
                   </h3>
                </div>
                <Button onClick={() => setIsAddDialogOpen(true)} variant="ghost" className="h-12 px-6 rounded-xl text-accent font-black text-xs uppercase tracking-widest hover:bg-accent/5 gap-3">
                  <Plus className="h-4 w-4" /> SEANS EKLE
                </Button>
             </div>
             
             <div className="grid gap-6">
                {todayTasks.length > 0 ? todayTasks.map((task: any, i: number) => (
                  <Card key={i} className="group p-10 rounded-[3rem] border-none shadow-[0_20px_50px_-10px_rgba(0,0,0,0.04)] hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] transition-all hover:scale-[1.01] bg-white flex items-center justify-between border border-primary/5 border-l-[12px] border-l-primary">
                    <div className="flex items-center gap-10">
                       <div className="text-center w-24 shrink-0">
                          <p className="text-2xl font-black text-primary tracking-tighter leading-none">{task.time}</p>
                          <p className="text-[10px] font-black text-muted-foreground/40 uppercase mt-2 tracking-widest">START</p>
                       </div>
                       <div className="h-16 w-px bg-primary/10"></div>
                       <div className="space-y-2">
                          <div className="flex items-center gap-3">
                             <h4 className="text-3xl font-black italic tracking-tight text-primary uppercase leading-none group-hover:text-accent transition-colors">{task.subject}</h4>
                             <Badge variant="outline" className="text-[8px] font-black uppercase px-2 py-0 h-4 border-primary/10 opacity-40">{task.difficulty || 'Medium'}</Badge>
                          </div>
                          <p className="text-lg font-medium text-muted-foreground italic opacity-60">{task.topic} {task.subtopic ? `• ${task.subtopic}` : ''} • {task.duration}</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-6">
                       <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                          {task.bookUrl && <Button size="icon" variant="ghost" className="h-12 w-12 rounded-[1.25rem] bg-slate-50 hover:bg-primary hover:text-white transition-all"><Book className="h-5 w-5" /></Button>}
                          {task.youtubeUrl && <Button size="icon" variant="ghost" className="h-12 w-12 rounded-[1.25rem] bg-rose-50 hover:bg-rose-500 hover:text-white transition-all text-rose-500"><PlaySquare className="h-5 w-5" /></Button>}
                       </div>
                       <Button size="icon" className={cn(
                        "h-16 w-16 rounded-[1.75rem] shadow-2xl transition-all group-hover:rotate-6 group-active:scale-90",
                        task.status === 'completed' ? "bg-emerald-500 text-white shadow-emerald-500/20" : "bg-[#0F172A] text-white hover:bg-accent shadow-primary/20"
                       )}>
                         {task.status === 'completed' ? <CheckCircle2 className="h-8 w-8" /> : <Play className="h-8 w-8 fill-current" />}
                       </Button>
                    </div>
                  </Card>
                )) : (
                  <Card className="p-24 text-center bg-white/50 rounded-[4rem] border border-dashed border-primary/10 flex flex-col items-center gap-6">
                    <Calendar className="h-12 w-12 text-primary/10" />
                    <p className="font-black text-primary/20 uppercase tracking-[0.5em] text-xs italic">BUGÜN İÇİN PLANLANMIŞ GÖREV BULUNMUYOR.</p>
                  </Card>
                )}
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* WEEKLY ACADEMIC TREND */}
            <Card className="p-12 rounded-[3.5rem] border-none shadow-[0_40px_80px_-20px_rgba(0,0,0,0.06)] bg-white space-y-10 border border-primary/5">
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                   <h4 className="text-2xl font-black italic tracking-tighter uppercase text-primary">Akademik Trend</h4>
                   <p className="text-[10px] font-bold text-muted-foreground italic uppercase tracking-widest">Haftalık XP Dağılımı</p>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center">
                   <TrendingUp className="h-6 w-6 text-emerald-500" />
                </div>
              </div>
              <div className="h-[220px] w-full">
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
                      <Area type="monotone" dataKey="val" stroke="#F59E0B" strokeWidth={4} fillOpacity={1} fill="url(#colorVal)" />
                   </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-between items-end border-t border-primary/5 pt-8">
                <div className="space-y-1">
                   <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-40">HAFTALIK ORAN</p>
                   <p className="text-4xl font-black text-primary italic tracking-tighter">%82</p>
                </div>
                <div className="text-right">
                   <p className="text-sm font-black text-emerald-500 uppercase tracking-widest">↑ %14 ARTIŞ</p>
                   <p className="text-[10px] font-bold text-muted-foreground italic uppercase opacity-40">vs GEÇEN HAFTA</p>
                </div>
              </div>
            </Card>

            {/* ACADEMIC BALANCE (BARS) */}
            <Card className="p-12 rounded-[3.5rem] border-none shadow-[0_40px_80px_-20px_rgba(0,0,0,0.06)] bg-white space-y-10 border border-primary/5">
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                   <h4 className="text-2xl font-black italic tracking-tighter uppercase text-primary">Akademik Denge</h4>
                   <p className="text-[10px] font-bold text-muted-foreground italic uppercase tracking-widest">Ders Yetkinlik Skorları</p>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-primary/5 flex items-center justify-center">
                   <Target className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div className="space-y-6">
                {academicBalance.map((item, i) => (
                  <div key={i} className="space-y-3 group cursor-default">
                    <div className="flex justify-between items-center">
                       <span className="text-[11px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors">{item.subject}</span>
                       <span className="text-sm font-black text-primary italic tracking-tighter">%{item.val}</span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-50 rounded-full overflow-hidden shadow-inner p-0.5">
                       <div className="h-full rounded-full transition-all duration-1000 group-hover:brightness-110 shadow-sm" style={{ width: `${item.val}%`, backgroundColor: item.color }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* ANALYTICS & METRICS PANEL (4 COLUMNS) */}
        <div className="xl:col-span-4 space-y-10">
          
          <Card className="rounded-[4rem] border-none shadow-[0_60px_120px_-30px_rgba(15,23,42,0.15)] bg-white overflow-hidden border border-primary/5">
            <div className="bg-primary p-10 text-white flex justify-between items-center relative overflow-hidden">
               <div className="absolute top-0 right-0 w-48 h-48 bg-accent/10 blur-[80px] rounded-full"></div>
               <div className="space-y-2 relative z-10">
                  <p className="text-[11px] font-black text-white/30 uppercase tracking-[0.4em] italic">OPERATIONAL NODE</p>
                  <h4 className="text-3xl font-black italic tracking-tighter uppercase leading-none">KİŞİSEL <br />METRİKLER</h4>
               </div>
               <Trophy className="h-10 w-10 text-accent relative z-10 animate-bounce" style={{ animationDuration: '3s' }} />
            </div>
            
            <div className="p-12 space-y-12">
               {/* STREAK */}
               <div className="flex items-center justify-between group cursor-pointer">
                  <div className="flex items-center gap-6">
                    <div className="h-16 w-16 rounded-[1.5rem] bg-rose-50 flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-sm">
                      <Flame className="h-8 w-8 text-rose-500 fill-current" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest mb-0.5">GÜNLÜK SERİ</p>
                      <p className="text-2xl font-black text-primary italic tracking-tighter">16 GÜN</p>
                    </div>
                  </div>
                  <ChevronRight className="h-6 w-6 text-muted-foreground opacity-20 group-hover:opacity-100 group-hover:translate-x-2 transition-all" />
               </div>

               {/* LEVEL CARD */}
               <div className="space-y-6">
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-6">
                        <div className="h-16 w-16 rounded-[1.5rem] bg-amber-50 flex items-center justify-center shadow-sm">
                          <Award className="h-8 w-8 text-amber-500" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest mb-0.5">AKADEMİK RÜTBE</p>
                          <p className="text-2xl font-black text-primary italic tracking-tighter">LEVEL {level}</p>
                        </div>
                     </div>
                     <span className="text-[11px] font-black text-muted-foreground tracking-tighter">{currentXpInLevel} / {xpToNextLevel} XP</span>
                  </div>
                  <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden p-1 shadow-inner">
                     <div className="h-full bg-accent rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(245,158,11,0.5)]" style={{ width: `${progressToNextLevel}%` }}></div>
                  </div>
               </div>

               <div className="h-px w-full bg-primary/5"></div>

               {/* XP ENGINE SUMMARY */}
               <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">BUGÜNKÜ XP</p>
                    <p className="text-6xl font-black text-primary tracking-tighter text-shadow-deep">+{currentXpInLevel}</p>
                  </div>
                  <div className="h-16 w-16 rounded-[2rem] bg-emerald-50 flex items-center justify-center shadow-inner group cursor-pointer hover:bg-emerald-500 hover:text-white transition-all">
                    <TrendingUp className="h-8 w-8 text-emerald-500 group-hover:text-white transition-colors" />
                  </div>
               </div>

               <div className="h-px w-full bg-primary/5"></div>

               {/* FOCUS TERMINAL (POMODORO) */}
               <div className="p-10 bg-[#F8FAFC] rounded-[3.5rem] border border-primary/5 space-y-8 shadow-inner relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-40 h-48 bg-accent/5 blur-[60px] rounded-full"></div>
                  <div className="flex items-center justify-between relative z-10">
                     <span className="text-[11px] font-black uppercase tracking-[0.4em] text-primary/30 italic">FOCUS TERMINAL</span>
                     <Timer className="h-6 w-6 text-accent animate-pulse" />
                  </div>
                  <p className="text-7xl font-black text-primary tracking-tighter leading-none text-shadow-deep relative z-10 text-center tabular-nums">{formatTime(timeLeft)}</p>
                  <Button onClick={() => setActiveTimer(!activeTimer)} className="w-full h-16 rounded-2xl bg-primary text-white hover:bg-accent transition-all font-black text-xs uppercase tracking-[0.3em] shadow-2xl relative z-10 group/btn">
                     {activeTimer ? 'SESSION AKTİF' : 'ODAKLANMAYI BAŞLAT'}
                     <Play className="ml-3 h-5 w-5 group-hover/btn:scale-110 transition-transform" />
                  </Button>
               </div>
            </div>
          </Card>

          {/* AI STRATEGIC RECOMMENDATION */}
          <Card className="p-12 rounded-[4rem] border-none shadow-[0_60px_100px_-20px_rgba(245,158,11,0.2)] bg-accent text-primary space-y-8 relative overflow-hidden group border border-white/20">
            <Sparkles className="absolute top-8 right-8 h-12 w-12 opacity-20 group-hover:scale-125 group-hover:rotate-12 transition-transform duration-700" />
            <div className="space-y-2 relative z-10">
               <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-[9px] font-black uppercase tracking-widest">Akademik Analiz Motoru</div>
               <h4 className="text-3xl font-black italic tracking-tighter uppercase leading-none">AI BUGÜN <br />NE DİYOR?</h4>
            </div>
            <div className="space-y-6 relative z-10">
              <p className="text-xl leading-relaxed font-bold italic text-shadow-deep">
                "Bugün <span className="underline decoration-4 decoration-white/40 underline-offset-8">AYT Edebiyat - Cumhuriyet Dönemi</span> çalışırsan hedef netine <span className="text-white">+0.8 katkı</span> sağlayabilir ve %94 uyuma ulaşabilirsin."
              </p>
              <Button className="w-full h-14 rounded-2xl bg-white/20 hover:bg-white/40 text-primary font-black text-[11px] uppercase tracking-widest border border-white/20 shadow-sm transition-all active:scale-95">Görevi Hemen Oluştur</Button>
            </div>
          </Card>

          {/* ACADEMIC MILESTONES (ACHIEVEMENTS) */}
          <Card className="p-12 rounded-[4rem] border-none shadow-[0_40px_80px_-20px_rgba(0,0,0,0.06)] bg-white space-y-10 border border-primary/5">
            <div className="flex justify-between items-center">
               <h4 className="text-2xl font-black italic tracking-tighter uppercase text-primary">Son Başarılar</h4>
               <Award className="h-7 w-7 text-accent" />
            </div>
            <div className="space-y-8">
               {[
                 { icon: Trophy, label: '1000 XP Barajı', desc: 'Akademik rütbe atlandı', color: 'text-amber-500', bg: 'bg-amber-50' },
                 { icon: Flame, label: '7 Gün Seri', desc: 'Disiplin madalyası', color: 'text-rose-500', bg: 'bg-rose-50' },
                 { icon: BookOpen, label: '100 Saat Çalışma', desc: 'Bilgi avcısı ünvanı', color: 'text-blue-500', bg: 'bg-blue-50' },
               ].map((ach, i) => (
                 <div key={i} className="flex gap-6 items-center group cursor-pointer">
                    <div className={cn("h-14 w-14 rounded-[1.25rem] flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-inner", ach.bg)}>
                       <ach.icon className={cn("h-7 w-7", ach.color)} />
                    </div>
                    <div className="space-y-1">
                       <p className="text-base font-black text-primary uppercase italic leading-none">{ach.label}</p>
                       <p className="text-[10px] font-bold text-muted-foreground opacity-60 uppercase tracking-widest">{ach.desc}</p>
                    </div>
                    <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                       <MoreVertical className="h-5 w-5 text-muted-foreground/30" />
                    </div>
                 </div>
               ))}
            </div>
            <Button variant="link" className="w-full text-[10px] font-black text-primary/40 uppercase tracking-[0.4em] hover:text-accent">Tüm Başarıları Gör →</Button>
          </Card>

        </div>
      </div>

      <AcademicSessionDialog 
        isOpen={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSave={handleQuickAddSession}
        selectedDay={today}
      />

      {/* FLOATING ACTION TERMINAL (FAB) */}
      <div className="fixed bottom-12 right-12 z-[100] group">
         <div className="absolute -inset-6 bg-accent/20 blur-[40px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
         <Button onClick={() => setIsAddDialogOpen(true)} className="h-28 w-28 rounded-[3.5rem] bg-[#0F172A] hover:bg-accent text-white shadow-[0_40px_80px_-20px_rgba(15,23,42,0.6)] transition-all duration-700 hover:scale-110 flex flex-col items-center justify-center gap-2 border-[10px] border-white relative z-10">
            <Plus className="h-12 w-12 text-accent group-hover:rotate-90 transition-transform duration-500" />
            <span className="text-[9px] font-black tracking-[0.3em] uppercase opacity-40">NEW SESSION</span>
         </Button>
      </div>

    </div>
  );
}