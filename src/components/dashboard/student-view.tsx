'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useDoc, useFirestore } from '@/firebase';
import { 
  CheckCircle, 
  Clock, 
  Calendar, 
  Zap, 
  Timer, 
  Play, 
  Flame,
  Award,
  Sparkles,
  ChevronRight,
  Plus,
  TrendingUp,
  ArrowUpRight,
  Trophy,
  Activity,
  PlaySquare,
  Book,
  Loader2,
  Target,
  Coffee,
  Music,
  CloudRain,
  Trees,
  Volume2,
  Pause
} from 'lucide-react';
import { useState, useMemo, useEffect, useRef } from 'react';
import { 
  ResponsiveContainer, AreaChart, 
  Area
} from 'recharts';
import { cn } from '@/lib/utils';
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
  const [timerMode, setTimerMode] = useState<'focus' | 'break'>('focus');
  const [pomodoroMinutes, setPomodoroMinutes] = useState(25);
  const [timeLeft, setTimerLeft] = useState(25 * 60);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isRecLoading, setIsRecLoading] = useState(false);
  const [ambientSound, setAmbientAmbient] = useState<'none' | 'lofi' | 'rain' | 'forest'>('none');
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

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
  const progressToNextLevel = Math.min(((xp % 1000) / 1000) * 100, 100);

  const today = new Intl.DateTimeFormat('tr-TR', { weekday: 'long' }).format(new Date());
  
  const todayTasks = useMemo(() => {
    if (!studyPlan?.schedule) return [];
    const dayData = studyPlan.schedule.find((s: any) => s.day === today);
    return (dayData?.tasks || []);
  }, [studyPlan, today]);

  const academicBalance = useMemo(() => {
    const baseSubjects = [
      { name: 'Matematik', color: '#F59E0B' },
      { name: 'Türkçe', color: '#0F172A' },
      { name: 'Edebiyat', color: '#F59E0B' },
      { name: 'Tarih', color: '#0F172A' },
      { name: 'Coğrafya', color: '#F59E0B' },
    ];

    return baseSubjects.map(s => {
      let completedCount = 0;
      studyPlan?.schedule?.forEach((day: any) => {
        day.tasks?.forEach((task: any) => {
          if ((task.subject?.includes(s.name) || task.subject === s.name) && task.status === 'completed') {
            completedCount++;
          }
        });
      });
      const calculatedVal = Math.min(completedCount * 20, 100);
      return { subject: s.name, val: calculatedVal, color: s.color };
    });
  }, [studyPlan]);

  useEffect(() => {
    let interval: any;
    if (activeTimer && timeLeft > 0) {
      interval = setInterval(() => {
        setTimerLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setActiveTimer(false);
      toast({ 
        title: timerMode === 'focus' ? 'Focus Tamamlandı!' : 'Mola Bitti!', 
        description: timerMode === 'focus' ? 'Harika bir seanstı. Biraz dinlenmeye ne dersin?' : 'Mola sona erdi, yeni bir odaklanma seansına hazır mısın?',
        className: "bg-primary text-white"
      });
    }
    return () => clearInterval(interval);
  }, [activeTimer, timeLeft, toast, timerMode]);

  useEffect(() => {
    if (ambientSound !== 'none' && activeTimer) {
      // Audio element creation or update
      if (!audioRef.current) {
        audioRef.current = new Audio();
        audioRef.current.loop = true;
      }
      
      const soundUrls = {
        lofi: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        rain: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
        forest: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'
      };
      
      if (ambientSound !== 'none') {
        audioRef.current.src = soundUrls[ambientSound as keyof typeof soundUrls];
        audioRef.current.play().catch(e => console.log("Audio play blocked", e));
      }
    } else {
      audioRef.current?.pause();
    }
  }, [ambientSound, activeTimer]);

  const changePomodoroTime = (mins: number) => {
    setPomodoroMinutes(mins);
    setTimerLeft(mins * 60);
    setActiveTimer(false);
  };

  const switchMode = (mode: 'focus' | 'break') => {
    setTimerMode(mode);
    const defaultMins = mode === 'focus' ? 25 : 5;
    setPomodoroMinutes(defaultMins);
    setTimerLeft(defaultMins * 60);
    setActiveTimer(false);
  };

  const stats = [
    { label: 'TOPLAM XP', val: xp.toLocaleString(), icon: Zap, color: 'text-amber-500', bg: 'bg-amber-50' },
    { label: 'ÇALIŞMA', val: `${Math.floor(totalTasksCompleted * 0.75)} SAAT`, icon: Clock, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'NET ORT.', val: '84.5', icon: Target, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  ];

  const handleQuickAddSession = async (taskData: any) => {
    if (!db || !user || isReadOnly) return;
    const newSchedule = studyPlan?.schedule ? [...studyPlan.schedule] : [];
    let dayIndex = newSchedule.findIndex((s: any) => s.day === today);
    
    const newTask = {
        ...taskData,
        status: 'pending',
        createdAt: new Date().toISOString()
    };

    if (dayIndex === -1) {
      newSchedule.push({ day: today, tasks: [newTask] });
    } else {
      newSchedule[dayIndex].tasks = [...newSchedule[dayIndex].tasks, newTask];
    }
    
    try {
      await setDoc(doc(db, 'studyPlans', user.uid), {
        userId: user.uid,
        examId: userData?.targetExam || 'YKS_SOZ',
        schedule: newSchedule,
        updatedAt: serverTimestamp()
      }, { merge: true });
      
      toast({ 
        title: 'Görev Senkronize Edildi', 
        description: `${taskData.subject} seansı bugünlük planınıza eklendi.`, 
        className: "bg-primary text-white rounded-[2rem]" 
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateRecommendedTask = async () => {
    if (isReadOnly) return;
    setIsRecLoading(true);
    const exam = userData?.targetExam || 'YKS_SOZ';
    
    const recommendedTask = {
      subject: exam.includes('KPSS') ? 'Tarih' : 'Edebiyat',
      topic: exam.includes('KPSS') ? 'Osmanlı Kültür ve Medeniyet' : 'Cumhuriyet Dönemi Şiir',
      time: '14:00',
      duration: '45 dk',
      difficulty: 'hard',
      xp: 75,
      studyType: 'questions',
      exam: exam
    };

    await handleQuickAddSession(recommendedTask);
    setIsRecLoading(false);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec < 10 ? '0' : ''}${sec}`;
  };

  return (
    <div className="p-8 lg:p-12 space-y-12 max-w-[1800px] mx-auto w-full animate-in fade-in duration-1000">
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
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

        <Card className="p-8 rounded-[2.5rem] border-none shadow-[0_20px_40px_-10px_rgba(0,0,0,0.05)] bg-white flex items-center justify-between group hover:shadow-xl transition-all hover:-translate-y-1 border border-primary/5 cursor-pointer">
          <div className="flex items-center gap-6">
            <div className="h-16 w-16 rounded-[1.5rem] bg-[#FFF1F2] flex items-center justify-center shrink-0 transition-transform group-hover:scale-110">
              <Flame className="h-8 w-8 text-[#FF4D4D] fill-current" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#94A3B8] mb-0.5">GÜNLÜK SERİ</p>
              <p className="text-4xl font-black text-[#0F172A] tracking-tighter italic">16 GÜN</p>
            </div>
          </div>
          <ChevronRight className="h-6 w-6 text-[#E2E8F0] group-hover:text-primary transition-colors" />
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
        
        <div className="xl:col-span-8 space-y-12">
          
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

          <div className="space-y-8">
             <div className="flex justify-between items-end px-6">
                <div className="space-y-2">
                   <p className="text-[11px] font-black uppercase tracking-[0.5em] text-muted-foreground/30 italic">OPERATIONAL SCHEDULE</p>
                   <h3 className="text-5xl font-black italic tracking-tighter uppercase text-primary flex items-center gap-5">
                    <Calendar className="h-10 w-10 text-accent" /> BUGÜNKÜ PLAN
                   </h3>
                </div>
                {!isReadOnly && (
                  <Button onClick={() => setIsAddDialogOpen(true)} variant="ghost" className="h-12 px-6 rounded-xl text-accent font-black text-xs uppercase tracking-widest hover:bg-accent/5 gap-3">
                    <Plus className="h-4 w-4" /> SEANS EKLE
                  </Button>
                )}
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
                       <Button 
                        size="icon" 
                        disabled={isReadOnly}
                        onClick={() => {
                          const ns = [...studyPlan.schedule];
                          const di = ns.findIndex((s: any) => s.day === today);
                          ns[di].tasks[i].status = task.status === 'completed' ? 'pending' : 'completed';
                          setDoc(doc(db!, 'studyPlans', user.uid), { schedule: ns }, { merge: true });
                        }}
                        className={cn(
                          "h-16 w-16 rounded-[1.75rem] shadow-2xl transition-all group-hover:rotate-6 group-active:scale-90",
                          task.status === 'completed' ? "bg-emerald-500 text-white shadow-emerald-500/20" : "bg-[#0F172A] text-white hover:bg-accent shadow-primary/20"
                       )}>
                         {task.status === 'completed' ? <CheckCircle className="h-8 w-8" /> : <Play className="h-8 w-8 fill-current" />}
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
            </Card>

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
               <div className="space-y-6">
                  <div className="flex items-center gap-6">
                    <div className="h-16 w-16 rounded-[1.5rem] bg-amber-50 flex items-center justify-center shadow-sm">
                      <Award className="h-8 w-8 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest mb-0.5">AKADEMİK RÜTBE</p>
                      <p className="text-2xl font-black text-primary italic tracking-tighter">LEVEL {level}</p>
                    </div>
                  </div>
                  <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden p-1 shadow-inner">
                     <div className="h-full bg-accent rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(245,158,11,0.5)]" style={{ width: `${progressToNextLevel}%` }}></div>
                  </div>
               </div>

               <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">BUGÜNKÜ XP</p>
                    <p className="text-6xl font-black text-primary tracking-tighter text-shadow-deep">+{xp % 1000}</p>
                  </div>
                  <div className="h-16 w-16 rounded-[2rem] bg-emerald-50 flex items-center justify-center shadow-inner group cursor-pointer hover:bg-emerald-500 hover:text-white transition-all">
                    <TrendingUp className="h-8 w-8 text-emerald-500 group-hover:text-white transition-colors" />
                  </div>
               </div>

               <div className="p-10 bg-[#F8FAFC] rounded-[3.5rem] border border-primary/5 space-y-8 shadow-inner relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-40 h-48 bg-accent/5 blur-[60px] rounded-full"></div>
                  <div className="flex flex-col gap-6 relative z-10">
                     <div className="flex items-center justify-between">
                        <div className="flex bg-white/50 p-1 rounded-xl backdrop-blur-sm border border-primary/5">
                           <button onClick={() => switchMode('focus')} className={cn("px-4 py-1.5 rounded-lg text-[9px] font-black transition-all", timerMode === 'focus' ? "bg-primary text-white shadow-lg" : "text-primary/40")}>FOCUS</button>
                           <button onClick={() => switchMode('break')} className={cn("px-4 py-1.5 rounded-lg text-[9px] font-black transition-all", timerMode === 'break' ? "bg-accent text-white shadow-lg" : "text-primary/40")}>BREAK</button>
                        </div>
                        <Timer className="h-5 w-5 text-accent animate-pulse" />
                     </div>
                     
                     <div className="flex flex-col items-center gap-4">
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/30 italic">{timerMode === 'focus' ? 'FOCUS TERMINAL' : 'COFFEE BREAK'}</p>
                        <p className="text-7xl font-black text-primary tracking-tighter leading-none text-shadow-deep tabular-nums">{formatTime(timeLeft)}</p>
                     </div>

                     <div className="space-y-4">
                        <div className="flex justify-center gap-2 bg-white/50 p-1.5 rounded-2xl backdrop-blur-sm border border-primary/5">
                           {(timerMode === 'focus' ? [25, 45, 60] : [5, 10, 15]).map((mins) => (
                              <button 
                                 key={mins}
                                 onClick={() => changePomodoroTime(mins)}
                                 className={cn(
                                    "px-4 py-1.5 rounded-xl text-[10px] font-black transition-all",
                                    pomodoroMinutes === mins ? "bg-[#0F172A] text-white shadow-lg" : "text-primary/40 hover:bg-white"
                                 )}
                              >
                                 {mins} DK
                              </button>
                           ))}
                        </div>

                        <div className="flex justify-between items-center px-2">
                           <div className="flex gap-3">
                              {[
                                 { id: 'lofi', icon: Music, color: 'text-blue-500' },
                                 { id: 'rain', icon: CloudRain, color: 'text-indigo-500' },
                                 { id: 'forest', icon: Trees, color: 'text-emerald-500' }
                              ].map((s) => (
                                 <button 
                                    key={s.id}
                                    onClick={() => setAmbientAmbient(ambientSound === s.id ? 'none' : s.id as any)}
                                    className={cn(
                                       "h-10 w-10 rounded-xl flex items-center justify-center transition-all",
                                       ambientSound === s.id ? "bg-white shadow-lg scale-110 border border-primary/5" : "bg-white/30 hover:bg-white/50 opacity-40"
                                    )}
                                 >
                                    <s.icon className={cn("h-4 w-4", ambientSound === s.id ? s.color : "text-primary")} />
                                 </button>
                              ))}
                           </div>
                           {ambientSound !== 'none' && <Volume2 className="h-4 w-4 text-accent animate-bounce" />}
                        </div>
                     </div>
                  </div>

                  <Button onClick={() => setActiveTimer(!activeTimer)} className="w-full h-18 rounded-[2rem] bg-primary text-white hover:bg-accent transition-all font-black text-xs uppercase tracking-[0.3em] shadow-2xl relative z-10 group/btn mt-4">
                     {activeTimer ? (
                        <>SESİON AKTİF <Pause className="ml-3 h-5 w-5" /></>
                     ) : (
                        <>{timerMode === 'focus' ? 'ODAKLANMAYI BAŞLAT' : 'MOLAYI BAŞLAT'} <Play className="ml-3 h-5 w-5 group-hover/btn:scale-110 transition-transform" /></>
                     )}
                  </Button>
               </div>
            </div>
          </Card>

          <Card className="p-12 rounded-[4rem] border-none shadow-[0_60px_100px_-20px_rgba(245,158,11,0.2)] bg-accent text-primary space-y-8 relative overflow-hidden group border border-white/20">
            <Sparkles className="absolute top-8 right-8 h-12 w-12 opacity-20 group-hover:scale-125 group-hover:rotate-12 transition-transform duration-700" />
            <div className="space-y-2 relative z-10">
               <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-[9px] font-black uppercase tracking-widest">Akademik Analiz Motoru</div>
               <h4 className="text-3xl font-black italic tracking-tighter uppercase leading-none">AI BUGÜN <br />NE DİYOR?</h4>
            </div>
            <div className="space-y-6 relative z-10">
              <p className="text-xl leading-relaxed font-bold italic text-shadow-deep">
                "Bugün <span className="underline decoration-4 decoration-white/40 underline-offset-8">{userData?.targetExam?.includes('KPSS') ? 'Tarih' : 'Edebiyat'} - {userData?.targetExam?.includes('KPSS') ? 'Osmanlı Kültür' : 'Cumhuriyet Şiiri'}</span> çalışırsan hedef netine <span className="text-white">+0.2 katkı</span> sağlayabilirsin."
              </p>
              <Button 
                onClick={handleCreateRecommendedTask}
                disabled={isRecLoading || isReadOnly}
                className="w-full h-14 rounded-2xl bg-white/20 hover:bg-white/40 text-primary font-black text-[11px] uppercase tracking-widest border border-white/20 shadow-sm transition-all active:scale-95 gap-3"
              >
                {isRecLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                Görevi Hemen Oluştur
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {!isReadOnly && (
        <AcademicSessionDialog 
          isOpen={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          onSave={handleQuickAddSession}
          selectedDay={today}
        />
      )}

      {!isReadOnly && (
        <div className="fixed bottom-12 right-12 z-[100] group">
          <div className="absolute -inset-6 bg-accent/20 blur-[40px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
          <Button onClick={() => setIsAddDialogOpen(true)} className="h-28 w-28 rounded-[3.5rem] bg-[#0F172A] hover:bg-accent text-white shadow-[0_40px_80px_-20px_rgba(15,23,42,0.6)] transition-all duration-700 hover:scale-110 flex flex-col items-center justify-center gap-2 border-[10px] border-white relative z-10">
              <Plus className="h-12 w-12 text-accent group-hover:rotate-90 transition-transform duration-500" />
              <span className="text-[9px] font-black tracking-[0.3em] uppercase opacity-40">NEW SESSION</span>
          </Button>
        </div>
      )}

    </div>
  );
}
