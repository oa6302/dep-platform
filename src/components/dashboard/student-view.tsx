
'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useDoc, useFirestore, useUser } from '@/firebase';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Pause,
  Archive,
  BarChart3,
  History,
  FileText,
  Edit3,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { useState, useMemo, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { AcademicSessionDialog } from '@/components/academic-session-dialog';
import { doc, setDoc, serverTimestamp, collection, addDoc, updateDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';
import { format, differenceInDays, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';

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
  const [editingTask, setEditingTask] = useState<{ index: number, data: any } | null>(null);
  const [isRecLoading, setIsRecLoading] = useState(false);
  const [ambientSound, setAmbientSound] = useState<'none' | 'lofi' | 'rain' | 'forest'>('none');
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // VERİ KAYNAĞI: studyPlans/{userId}
  const { data: studyPlan, loading: planLoading } = useDoc<any>(user?.uid ? `studyPlans/${user.uid}` : null);
  
  const today = format(new Date(), 'yyyy-MM-dd');
  const todayName = format(new Date(), 'EEEE', { locale: tr });

  // MASTER PLAN'DAN BUGÜNKÜ GÖREVLERİ ÇEK
  const todayTasks = useMemo(() => {
    if (!studyPlan?.masterPlan) return [];
    
    // Tarih bazlı eşleşme ara
    const tasks = studyPlan.masterPlan.filter((p: any) => p.date === today);
    if (tasks.length > 0) return tasks;

    // Eğer tarih bazlı yoksa (plan henüz başlamadıysa veya bittiyse), 
    // bugünün ismine göre master plandan örnek getir
    return studyPlan.masterPlan.filter((p: any) => p.day === todayName).slice(0, 3);
  }, [studyPlan, today, todayName]);

  const completedTasks = useMemo(() => {
    if (!studyPlan?.masterPlan) return [];
    return studyPlan.masterPlan.filter((p: any) => p.status === 'completed');
  }, [studyPlan]);

  const totalQuestions = useMemo(() => {
    return completedTasks.reduce((acc: number, task: any) => acc + (task.qTarget || 0), 0);
  }, [completedTasks]);

  const remainingStudyTime = useMemo(() => {
    const pending = todayTasks.filter((t: any) => t.status === 'pending');
    return pending.length * 45; // Varsayılan 45 dk her görev için
  }, [todayTasks]);

  const progressToNextLevel = useMemo(() => {
    const xp = (completedTasks.length * 100) + (totalQuestions * 2);
    return Math.min(((xp % 1000) / 1000) * 100, 100);
  }, [completedTasks, totalQuestions]);

  const academicBalance = useMemo(() => {
    const subjects = ['Matematik', 'Türkçe', 'Fen Bilimleri', 'Sosyal Bilgiler', 'Edebiyat'];
    return subjects.map(s => {
      const count = completedTasks.filter((t: any) => t.subject === s).length;
      return { subject: s, val: Math.min(count * 10, 100), color: '#F59E0B' };
    });
  }, [completedTasks]);

  const toggleTaskStatus = (taskDate: string, index: number) => {
    if (!db || !user || !studyPlan?.masterPlan || isReadOnly) return;
    
    const newMasterPlan = [...studyPlan.masterPlan];
    const taskIndex = newMasterPlan.findIndex((p: any) => p.date === taskDate);
    
    if (taskIndex > -1) {
      const task = newMasterPlan[taskIndex];
      const newStatus = task.status === 'completed' ? 'pending' : 'completed';
      task.status = newStatus;
      
      const planRef = doc(db, 'studyPlans', user.uid);
      updateDoc(planRef, { masterPlan: newMasterPlan, updatedAt: serverTimestamp() })
        .catch(async () => {
          const error = new FirestorePermissionError({
            path: planRef.path,
            operation: 'update',
            requestResourceData: { masterPlan: newMasterPlan },
          });
          errorEmitter.emit('permission-error', error);
        });

      if (newStatus === 'completed') {
        const studyData = {
          userId: user.uid,
          subject: task.subject,
          topic: task.topic,
          xp: 100,
          questionCount: task.qTarget || 0,
          completedAt: serverTimestamp()
        };
        addDoc(collection(db, 'studies'), studyData);
        toast({ title: 'Görev Tamamlandı', description: `${task.topic} arşive işlendi.`, className: "bg-emerald-500 text-white rounded-[2rem]" });
      }
    }
  };

  useEffect(() => {
    let interval: any;
    if (activeTimer && timeLeft > 0) {
      interval = setInterval(() => setTimerLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0) {
      setActiveTimer(false);
      toast({ title: timerMode === 'focus' ? 'Focus Tamamlandı!' : 'Mola Bitti!' });
    }
    return () => clearInterval(interval);
  }, [activeTimer, timeLeft, timerMode, toast]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec < 10 ? '0' : ''}${sec}`;
  };

  return (
    <div className="p-8 lg:p-12 space-y-12 max-w-[1800px] mx-auto w-full animate-in fade-in duration-1000">
      <Tabs defaultValue="live" className="space-y-12">
        <TabsList className="bg-slate-100/50 p-2.5 rounded-[3rem] h-20 shadow-inner flex border border-primary/5">
          <TabsTrigger value="live" className="rounded-2xl px-10 h-full font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-lg gap-3">
            <Activity className="h-4 w-4" /> Canlı Panel
          </TabsTrigger>
          <TabsTrigger value="archive" className="rounded-2xl px-10 h-full font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-lg gap-3">
            <Archive className="h-4 w-4" /> Akademik Arşiv
          </TabsTrigger>
        </TabsList>

        <TabsContent value="live" className="space-y-12 animate-in fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { label: 'TOPLAM XP', val: ((completedTasks.length * 100) + (totalQuestions * 2)).toLocaleString(), icon: Zap, color: 'text-amber-500', bg: 'bg-amber-50' },
              { label: 'TAMAMLANAN', val: `${completedTasks.length} GÖREV`, icon: CheckCircle, color: 'text-blue-500', bg: 'bg-blue-50' },
              { label: 'KALAN SÜRE', val: `${remainingStudyTime} DK`, icon: Timer, color: 'text-rose-500', bg: 'bg-rose-50' },
              { label: 'HEDEF UYUMU', val: '%88', icon: Target, color: 'text-emerald-500', bg: 'bg-emerald-50' },
            ].map((s, i) => (
              <Card key={i} className="p-8 rounded-[2.5rem] border-none shadow-sm bg-white flex items-center gap-6 group hover:shadow-xl transition-all hover:-translate-y-1 border border-primary/5">
                <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:rotate-6 shadow-sm", s.bg)}>
                  <s.icon className={cn("h-7 w-7", s.color)} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 mb-1">{s.label}</p>
                  <p className="text-3xl font-black text-primary tracking-tighter italic">{s.val}</p>
                </div>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
            <div className="xl:col-span-8 space-y-12">
              <Card className="rounded-[4rem] border-none shadow-[0_60px_100px_-20px_rgba(15,23,42,0.12)] bg-white p-14 relative overflow-hidden group border border-primary/5">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-accent/10 transition-all duration-1000"></div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-12">
                  <div className="space-y-8 flex-1">
                      <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-slate-50 border border-primary/5 text-primary/40 font-black text-[10px] uppercase tracking-widest italic shadow-sm">
                        <Activity className="h-3.5 w-3.5 text-accent animate-pulse" /> AUTOMATIC SCHEDULE ACTIVE
                      </div>
                      <div className="space-y-3">
                        <h1 className="text-6xl font-black text-primary tracking-tighter italic uppercase leading-none text-shadow-deep">
                          HOŞ GELDİN, <br /><span className="text-accent text-shadow-accent">{userData?.displayName?.split(' ')[0] || 'ÖĞRENCİ'}</span> 👋
                        </h1>
                        <p className="text-xl font-medium text-muted-foreground italic leading-relaxed max-w-lg">
                          Bugün Master Plan'da senin için <span className="text-primary font-bold">{todayTasks.length} kritik görev</span> hazırlandı.
                        </p>
                      </div>
                      <div className="flex gap-6">
                        <Button onClick={() => router.push('/dashboard/planning')} className="h-16 px-10 rounded-[1.75rem] bg-primary text-white hover:bg-accent font-black text-xs uppercase tracking-widest shadow-2xl gap-4 transition-all group/plan">
                          364 GÜNLÜK PLANI GÖR <ChevronRight className="h-5 w-5 text-accent group-hover/plan:translate-x-1 transition-transform" />
                        </Button>
                      </div>
                  </div>
                  <div className="relative shrink-0">
                    <div className="h-52 w-52 rounded-[4rem] bg-[#0F172A] flex items-center justify-center shadow-[0_40px_80px_-15px_rgba(0,0,0,0.4)] transform rotate-3 hover:rotate-0 transition-all duration-700 border-[12px] border-white relative z-10">
                      <div className="text-center">
                        <p className="text-7xl font-black text-accent italic tracking-tighter text-shadow-accent">%{progressToNextLevel.toFixed(0)}</p>
                        <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mt-2">GELİŞİM</p>
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
                </div>
                <div className="grid gap-6">
                    {planLoading ? (
                      <div className="py-20 text-center opacity-30 animate-pulse font-black uppercase">Veriler Yükleniyor...</div>
                    ) : todayTasks.length > 0 ? todayTasks.map((t: any, i: number) => (
                      <Card key={i} className={cn(
                        "group p-10 rounded-[3rem] border-none shadow-sm hover:shadow-xl transition-all hover:scale-[1.01] bg-white flex items-center justify-between border border-primary/5 border-l-[12px]", 
                        t.status === 'completed' ? "border-l-emerald-500 opacity-60" : "border-l-primary"
                      )}>
                        <div className="flex items-center gap-10">
                          <div className="text-center w-24 shrink-0">
                            <p className="text-2xl font-black text-primary tracking-tighter leading-none">{t.week}</p>
                            <p className="text-[10px] font-black text-muted-foreground/40 uppercase mt-2 tracking-widest">{t.day}</p>
                          </div>
                          <div className="h-16 w-px bg-primary/10"></div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-3">
                              <h4 className="text-3xl font-black italic tracking-tight text-primary uppercase leading-none group-hover:text-accent transition-colors">{t.subject}</h4>
                              <Badge variant="outline" className={cn("text-[8px] font-black uppercase px-2 py-0 h-4 border-primary/10", t.status === 'completed' ? "bg-emerald-50 text-emerald-600" : "opacity-40")}>
                                {t.status === 'completed' ? 'TAMAMLANDI' : 'BEKLEMEDE'}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4">
                              <p className="text-lg font-medium text-muted-foreground italic opacity-60">{t.topic} • {t.qTarget} Soru Hedefi</p>
                              <div className="flex gap-2">
                                <PlaySquare className="h-4 w-4 text-rose-500 opacity-40" />
                                <Book className="h-4 w-4 text-blue-500 opacity-40" />
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Button size="icon" disabled={isReadOnly} onClick={() => toggleTaskStatus(t.date, i)} className={cn("h-16 w-16 rounded-[1.75rem] shadow-2xl transition-all", t.status === 'completed' ? "bg-emerald-500 text-white shadow-emerald-500/20" : "bg-[#0F172A] text-white hover:bg-accent")}>
                            {t.status === 'completed' ? <CheckCircle className="h-8 w-8" /> : <Play className="h-8 w-8 fill-current" />}
                          </Button>
                        </div>
                      </Card>
                    )) : (
                      <Card className="p-24 text-center bg-white/50 rounded-[4rem] border border-dashed border-primary/10 flex flex-col items-center gap-6">
                        <Calendar className="h-12 w-12 text-primary/10" />
                        <p className="font-black text-primary/20 uppercase tracking-[0.5em] text-xs italic">GÖREV BULUNMUYOR.</p>
                        <Button onClick={() => router.push('/dashboard/planning')} className="h-12 rounded-xl bg-primary text-white font-black text-[10px] uppercase px-8">PLAN OLUŞTUR</Button>
                      </Card>
                    )}
                </div>
              </div>
            </div>

            <div className="xl:col-span-4 space-y-10">
              <Card className="p-12 rounded-[4rem] border-none shadow-[0_40px_80px_-20px_rgba(15,23,42,0.15)] bg-white overflow-hidden border border-primary/5">
                <div className="bg-[#1E293B] p-10 text-white flex justify-between items-center relative">
                  <h4 className="text-3xl font-black italic tracking-tighter uppercase relative z-10">FOCUS TERMINAL</h4>
                  <Target className="h-8 w-8 text-accent relative z-10" />
                </div>
                <div className="p-12 space-y-12">
                   <div className="text-center space-y-4">
                      <p className="text-[11px] font-black uppercase tracking-[0.4em] text-muted-foreground/30 italic">OPERATIONAL TIMER</p>
                      <p className="text-[10rem] font-black text-[#0F172A] italic tracking-tighter leading-none tabular-nums select-none">{formatTime(timeLeft)}</p>
                   </div>
                   <div className="flex justify-center">
                      <div className="bg-[#F8FAFC] p-2 rounded-[2.5rem] flex gap-2 shadow-inner border border-slate-100">
                        <button onClick={() => { setTimerMode('focus'); setTimerLeft(25*60); }} className={cn("px-10 py-4 rounded-[2rem] text-[11px] font-black uppercase tracking-widest transition-all", timerMode === 'focus' ? "bg-[#0F172A] text-white shadow-xl scale-105" : "text-slate-400")}>FOCUS</button>
                        <button onClick={() => { setTimerMode('break'); setTimerLeft(5*60); }} className={cn("px-10 py-4 rounded-[2rem] text-[11px] font-black uppercase tracking-widest transition-all", timerMode === 'break' ? "bg-accent text-primary shadow-xl scale-105" : "text-slate-400")}>BREAK</button>
                      </div>
                   </div>
                   <Button onClick={() => setActiveTimer(!activeTimer)} className="w-full h-28 rounded-[3rem] bg-[#0F172A] hover:bg-black text-white transition-all duration-500 font-black text-xl uppercase tracking-[0.4em] shadow-[0_40px_80px_-20px_rgba(15,23,42,0.4)] group/start">
                    {activeTimer ? <>DURAKLAT <Pause className="ml-6 h-8 w-8 fill-current" /></> : <>BAŞLAT <Play className="ml-6 h-8 w-8 fill-current group-hover/start:scale-110 transition-transform" /></>}
                   </Button>
                </div>
              </Card>
              
              <Card className="p-10 rounded-[4rem] border-none shadow-xl bg-white border border-primary/5 space-y-8">
                <h4 className="text-2xl font-black italic tracking-tighter uppercase text-primary">AKADEMİK DENGE</h4>
                <div className="space-y-6">
                  {academicBalance.map((item, i) => (
                    <div key={i} className="space-y-3">
                      <div className="flex justify-between items-end">
                        <span className="text-[11px] font-black uppercase tracking-widest text-primary/60">{item.subject}</span>
                        <span className="text-xl font-black text-primary italic">%{item.val}</span>
                      </div>
                      <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden shadow-inner border border-primary/5">
                        <div className="h-full transition-all duration-1000" style={{ width: `${item.val}%`, backgroundColor: '#F59E0B' }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="archive" className="space-y-12 animate-in fade-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-10 rounded-[3rem] bg-white border border-primary/5 shadow-xl space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-primary/5 flex items-center justify-center"><History className="h-6 w-6 text-primary" /></div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">TAMAMLANAN GÖREV</p>
              <p className="text-5xl font-black text-primary italic">{completedTasks.length}</p>
            </Card>
            <Card className="p-10 rounded-[3rem] bg-white border border-primary/5 shadow-xl space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-accent/5 flex items-center justify-center"><BarChart3 className="h-6 w-6 text-accent" /></div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">TOPLAM SORU</p>
              <p className="text-5xl font-black text-primary italic">{totalQuestions.toLocaleString()}</p>
            </Card>
            <Card className="p-10 rounded-[3rem] bg-white border border-primary/5 shadow-xl space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-rose-50 flex items-center justify-center"><FileText className="h-6 w-6 text-rose-500" /></div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">MASTER PROGRESS</p>
              <p className="text-5xl font-black text-primary italic">%{((completedTasks.length / 364) * 100).toFixed(1)}</p>
            </Card>
          </div>
          
          <Card className="rounded-[4rem] border-none shadow-xl bg-white overflow-hidden border border-primary/5">
            <div className="p-12 border-b border-primary/5 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-3xl font-black italic tracking-tighter uppercase text-primary">AKADEMİK GEÇMİŞ</h3>
              <Badge className="bg-primary text-white font-black text-[10px] px-4 py-1.5 rounded-full">MASTER LOG</Badge>
            </div>
            <div className="p-12 space-y-8">
              {completedTasks.length > 0 ? completedTasks.slice(0, 50).map((t: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-8 bg-slate-50 rounded-[2.5rem] border border-primary/5 group hover:bg-white hover:shadow-xl transition-all">
                  <div className="flex items-center gap-8">
                    <div className="h-14 w-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg">
                      <CheckCircle className="h-8 w-8" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-2xl font-black text-primary italic uppercase tracking-tighter">{t.subject} - {t.topic}</h4>
                      <p className="text-xs font-bold text-muted-foreground italic uppercase tracking-widest">{t.day} • {t.qTarget} Soru • +100 XP</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest border-emerald-500/20 text-emerald-600 bg-emerald-50">TAMAMLANDI</Badge>
                </div>
              )) : (
                <div className="py-20 text-center opacity-20 italic font-black uppercase text-xs tracking-widest">Henüz bir veri bulunmuyor.</div>
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
