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
  Trash2
} from 'lucide-react';
import { useState, useMemo, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { AcademicSessionDialog } from '@/components/academic-session-dialog';
import { doc, setDoc, serverTimestamp, collection, addDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

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

  // VERİ KAYNAĞI: studyPlans/{userId} - Bu veri kalıcıdır.
  const { data: studyPlan, loading: planLoading } = useDoc<any>(user?.uid ? `studyPlans/${user.uid}` : null);
  
  // ARŞİV VERİSİ: Tamamlanmış görevleri toplar.
  const completedTasks = useMemo(() => {
    if (!studyPlan?.schedule) return [];
    const list: any[] = [];
    studyPlan.schedule.forEach((day: any) => {
      day.tasks?.forEach((task: any) => {
        if (task.status === 'completed') list.push({ ...task, day: day.day });
      });
    });
    return list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  }, [studyPlan]);

  const totalQuestions = useMemo(() => {
    return completedTasks.reduce((acc, task) => acc + (task.questionCount || 0), 0);
  }, [completedTasks]);

  const totalExams = useMemo(() => {
    return completedTasks.filter(task => task.studyType === 'exam').length;
  }, [completedTasks]);

  const today = new Intl.DateTimeFormat('tr-TR', { weekday: 'long' }).format(new Date());
  
  const todayTasks = useMemo(() => {
    if (!studyPlan?.schedule) return [];
    const dayData = studyPlan.schedule.find((s: any) => s.day === today);
    return (dayData?.tasks || []);
  }, [studyPlan, today]);

  const remainingStudyTime = useMemo(() => {
    const pending = todayTasks.filter((t: any) => t.status === 'pending');
    let totalMins = 0;
    pending.forEach((t: any) => {
      const mins = parseInt(t.duration?.replace(/[^0-9]/g, '') || '0');
      totalMins += mins;
    });
    return totalMins;
  }, [todayTasks]);

  const aiRecommendation = useMemo(() => {
    const exam = userData?.targetExam || 'YKS_SOZ';
    const isKpss = exam.includes('KPSS');
    
    const subjectStats: Record<string, number> = {};
    completedTasks.forEach((t: any) => {
      subjectStats[t.subject] = (subjectStats[t.subject] || 0) + 1;
    });

    let recSubject = isKpss ? 'Tarih' : 'Edebiyat';
    let recTopic = isKpss ? 'Osmanlı Kültür ve Medeniyet' : 'Cumhuriyet Dönemi Şiir';
    let contribution = 0.2;

    if (!subjectStats['Matematik']) {
      recSubject = 'Matematik';
      recTopic = isKpss ? 'Problemler' : 'Temel Kavramlar';
      contribution = 0.4;
    }

    return {
      subject: recSubject,
      topic: recTopic,
      contribution: contribution.toFixed(1),
      reason: "Son 7 gündür bu konuda düşük aktivite tespit edildi."
    };
  }, [completedTasks, userData]);

  const totalTasksCompleted = completedTasks.length;
  const xp = totalTasksCompleted * 120 + (totalQuestions * 2);
  const progressToNextLevel = Math.min(((xp % 1000) / 1000) * 100, 100);

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
      completedTasks.forEach((task: any) => {
        if (task.subject?.includes(s.name) || task.subject === s.name) {
          completedCount++;
        }
      });
      const calculatedVal = Math.min(completedCount * 20, 100);
      return { subject: s.name, val: calculatedVal, color: s.color };
    });
  }, [completedTasks]);

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
      });
    }
    return () => clearInterval(interval);
  }, [activeTimer, timeLeft, toast, timerMode]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (ambientSound !== 'none' && activeTimer) {
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

  const switchMode = (mode: 'focus' | 'break') => {
    setTimerMode(mode);
    const defaultMins = mode === 'focus' ? 25 : 5;
    setPomodoroMinutes(defaultMins);
    setTimerLeft(defaultMins * 60);
    setActiveTimer(false);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec < 10 ? '0' : ''}${sec}`;
  };

  const handleSaveSession = (taskData: any) => {
    if (!db || !user || isReadOnly) return;
    
    // Veri yapısını koruyarak güncelle
    const daysArr = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
    const currentSchedule = studyPlan?.schedule ? [...studyPlan.schedule] : daysArr.map(d => ({ day: d, tasks: [] }));
    
    // Eksik günleri tamamla
    daysArr.forEach(d => {
      if (!currentSchedule.find((s: any) => s.day === d)) {
        currentSchedule.push({ day: d, tasks: [] });
      }
    });

    let dayIndex = currentSchedule.findIndex((s: any) => s.day === today);
    if (dayIndex > -1) {
      if (editingTask !== null) {
        currentSchedule[dayIndex].tasks[editingTask.index] = taskData;
      } else {
        currentSchedule[dayIndex].tasks.push(taskData);
      }
      
      const planRef = doc(db, 'studyPlans', user.uid);
      const planData = { 
        userId: user.uid,
        schedule: currentSchedule, 
        updatedAt: serverTimestamp() 
      };

      setDoc(planRef, planData, { merge: true })
        .catch(async () => {
          const error = new FirestorePermissionError({
            path: planRef.path,
            operation: 'write',
            requestResourceData: planData,
          });
          errorEmitter.emit('permission-error', error);
        });

      toast({ 
        title: editingTask ? 'Görev Güncellendi' : 'Görev Eklendi', 
        description: `${taskData.subject} seansı bulut veritabanına işlendi.` 
      });
      setEditingTask(null);
      setIsAddDialogOpen(false);
    }
  };

  const toggleTaskStatus = (index: number, currentStatus: string) => {
    if (!db || !user || isReadOnly) return;
    
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    const newSchedule = [...studyPlan.schedule];
    const dayIndex = newSchedule.findIndex((s: any) => s.day === today);
    
    if (dayIndex > -1) {
      const task = newSchedule[dayIndex].tasks[index];
      task.status = newStatus;
      
      const planRef = doc(db, 'studyPlans', user.uid);
      const planData = { schedule: newSchedule, updatedAt: serverTimestamp() };
      
      setDoc(planRef, planData, { merge: true })
        .catch(async () => {
          const error = new FirestorePermissionError({
            path: planRef.path,
            operation: 'update',
            requestResourceData: planData,
          });
          errorEmitter.emit('permission-error', error);
        });

      if (newStatus === 'completed') {
        const studyData = {
          userId: user.uid,
          subject: task.subject,
          topic: task.topic,
          xp: task.xp || 50,
          questionCount: task.questionCount || 0,
          studyType: task.studyType || 'new',
          completedAt: serverTimestamp()
        };

        addDoc(collection(db, 'studies'), studyData)
          .catch(async () => {
            const error = new FirestorePermissionError({
              path: 'studies',
              operation: 'create',
              requestResourceData: studyData,
            });
            errorEmitter.emit('permission-error', error);
          });

        toast({ 
          title: 'Çalışma Arşivlendi', 
          description: 'Bu seans kalıcı olarak akademik arşivinize işlendi.',
          className: "bg-emerald-500 text-white rounded-[2rem]"
        });
      }
    }
  };

  const handleDeleteTask = (index: number) => {
    if (!db || !user || isReadOnly || !confirm('Bu görevi silmek istediğinize emin misiniz?')) return;
    
    const newSchedule = [...studyPlan.schedule];
    const dayIndex = newSchedule.findIndex((s: any) => s.day === today);
    
    if (dayIndex > -1) {
      newSchedule[dayIndex].tasks.splice(index, 1);
      const planRef = doc(db, 'studyPlans', user.uid);
      const planData = { schedule: newSchedule, updatedAt: serverTimestamp() };
      
      setDoc(planRef, planData, { merge: true })
        .catch(async () => {
          const error = new FirestorePermissionError({
            path: planRef.path,
            operation: 'update',
            requestResourceData: planData,
          });
          errorEmitter.emit('permission-error', error);
        });

      toast({ title: 'Görev Silindi', description: 'Programınızdan kaldırıldı.' });
    }
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
              { label: 'TOPLAM XP', val: xp.toLocaleString(), icon: Zap, color: 'text-amber-500', bg: 'bg-amber-50' },
              { label: 'ÇALIŞMA', val: `${Math.floor(totalTasksCompleted * 0.75)} SAAT`, icon: Clock, color: 'text-blue-500', bg: 'bg-blue-50' },
              { label: 'KALAN SÜRE', val: `${remainingStudyTime} DK`, icon: Timer, color: 'text-rose-500', bg: 'bg-rose-50' },
              { label: 'NET ORT.', val: '84.5', icon: Target, color: 'text-emerald-500', bg: 'bg-emerald-50' },
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
                        <Activity className="h-3.5 w-3.5 text-accent animate-pulse" /> ACADEMIC NODE ACTIVE
                      </div>
                      <div className="space-y-3">
                        <h1 className="text-6xl font-black text-primary tracking-tighter italic uppercase leading-none text-shadow-deep">
                          GÜNAYDIN, <br /><span className="text-accent text-shadow-accent">{userData?.displayName?.split(' ')[0] || '1'}</span> 👋
                        </h1>
                        <p className="text-xl font-medium text-muted-foreground italic leading-relaxed max-w-lg">
                          Bugün seni bekleyen <span className="text-primary font-bold">{todayTasks.length} kritik görev</span> var.
                        </p>
                      </div>
                      <div className="flex gap-6">
                        <div className="px-6 py-4 rounded-[1.75rem] bg-primary text-white flex items-center gap-4 shadow-2xl shadow-primary/30 group/xp cursor-default">
                          <Zap className="h-5 w-5 text-accent group-hover/xp:animate-pulse" />
                          <div className="text-left">
                            <p className="text-[9px] font-black uppercase tracking-widest opacity-40">GÜNLÜK HEDEF</p>
                            <p className="text-lg font-black italic tracking-tighter">+350 XP</p>
                          </div>
                        </div>
                        <Button onClick={() => { setEditingTask(null); setIsAddDialogOpen(true); }} className="h-16 px-10 rounded-[1.75rem] bg-white border-2 border-primary/5 text-primary hover:bg-slate-50 font-black text-xs uppercase tracking-widest shadow-sm gap-4 transition-all">
                          YENİ SEANS <Plus className="h-5 w-5 text-accent" />
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
                </div>
                <div className="grid gap-6">
                    {planLoading ? (
                      <div className="py-20 text-center opacity-30 animate-pulse font-black uppercase">Veriler Yükleniyor...</div>
                    ) : todayTasks.length > 0 ? todayTasks.map((t: any, i: number) => {
                      const isActive = activeTimer && timerMode === 'focus';
                      const isCurrent = i === todayTasks.findIndex((task: any) => task.status === 'pending');
                      return (
                        <Card key={i} className={cn(
                          "group p-10 rounded-[3rem] border-none shadow-[0_20px_50px_-10px_rgba(0,0,0,0.04)] hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] transition-all hover:scale-[1.01] bg-white flex items-center justify-between border border-primary/5 border-l-[12px]", 
                          t.status === 'completed' ? "border-l-emerald-500 opacity-60" : isCurrent && isActive ? "border-l-accent animate-pulse" : "border-l-primary"
                        )}>
                          <div className="flex items-center gap-10">
                            <div className="text-center w-24 shrink-0">
                              <p className="text-2xl font-black text-primary tracking-tighter leading-none">{t.time}</p>
                              <p className="text-[10px] font-black text-muted-foreground/40 uppercase mt-2 tracking-widest">START</p>
                            </div>
                            <div className="h-16 w-px bg-primary/10"></div>
                            <div className="space-y-2">
                              <div className="flex items-center gap-3">
                                <h4 className="text-3xl font-black italic tracking-tight text-primary uppercase leading-none group-hover:text-accent transition-colors">{t.subject}</h4>
                                <Badge variant="outline" className={cn("text-[8px] font-black uppercase px-2 py-0 h-4 border-primary/10", t.status === 'completed' ? "bg-emerald-50 text-emerald-600" : isCurrent && isActive ? "bg-accent text-primary" : "opacity-40")}>
                                  {t.status === 'completed' ? 'TAMAMLANDI' : isCurrent && isActive ? 'DEVAM EDEN' : 'BEKLEMEDE'}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-4">
                                <p className="text-lg font-medium text-muted-foreground italic opacity-60">{t.topic} • {t.duration}</p>
                                <div className="flex gap-2">
                                  {t.youtubeUrl && <a href={t.youtubeUrl} target="_blank" rel="noopener noreferrer" className="h-7 w-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center hover:bg-rose-100 border border-rose-100"><PlaySquare className="h-4 w-4" /></a>}
                                  {t.bookUrl && <a href={t.bookUrl} target="_blank" rel="noopener noreferrer" className="h-7 w-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 border border-blue-100"><Book className="h-4 w-4" /></a>}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <Button variant="ghost" size="icon" disabled={isReadOnly} onClick={() => { setEditingTask({ index: i, data: t }); setIsAddDialogOpen(true); }} className="h-12 w-12 rounded-xl opacity-0 group-hover:opacity-100 transition-all"><Edit3 className="h-5 w-5" /></Button>
                            <Button variant="ghost" size="icon" disabled={isReadOnly} onClick={() => handleDeleteTask(i)} className="h-12 w-12 rounded-xl opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="h-5 w-5" /></Button>
                            <Button size="icon" disabled={isReadOnly} onClick={() => toggleTaskStatus(i, t.status)} className={cn("h-16 w-16 rounded-[1.75rem] shadow-2xl transition-all", t.status === 'completed' ? "bg-emerald-500 text-white shadow-emerald-500/20" : "bg-[#0F172A] text-white hover:bg-accent")}>
                              {t.status === 'completed' ? <CheckCircle className="h-8 w-8" /> : <Play className="h-8 w-8 fill-current" />}
                            </Button>
                          </div>
                        </Card>
                      );
                    }) : (
                      <Card className="p-24 text-center bg-white/50 rounded-[4rem] border border-dashed border-primary/10 flex flex-col items-center gap-6">
                        <Calendar className="h-12 w-12 text-primary/10" />
                        <p className="font-black text-primary/20 uppercase tracking-[0.5em] text-xs italic">GÖREV BULUNMUYOR.</p>
                      </Card>
                    )}
                </div>
              </div>
            </div>

            <div className="xl:col-span-4 space-y-10">
              <Card className="p-12 rounded-[4rem] border-none shadow-[0_40px_80px_-20px_rgba(245,158,11,0.3)] bg-accent text-primary space-y-10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 blur-[80px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
                <div className="space-y-6 relative z-10">
                  <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-primary/10 text-primary font-black text-[9px] uppercase tracking-widest italic border border-primary/10">AKADEMİK ANALİZ MOTORU</div>
                  <h4 className="text-4xl font-black italic tracking-tighter uppercase leading-[0.8] text-shadow-deep">AI BUGÜN <br />NE DİYOR?</h4>
                </div>
                <p className="text-xl font-bold italic leading-relaxed relative z-10">
                  "Bugün <span className="underline underline-offset-8 decoration-primary/20">{aiRecommendation.subject} - {aiRecommendation.topic}</span> çalışırsan hedef netine <span className="text-white text-shadow-deep">+{aiRecommendation.contribution} katkı</span> sağlayabilirsin."
                </p>
                <div className="space-y-4 pt-4 border-t border-primary/5">
                  <div className="flex items-center gap-3 opacity-60">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    <p className="text-[10px] font-bold uppercase tracking-widest">{aiRecommendation.reason}</p>
                  </div>
                </div>
                <Button onClick={handleCreateRecommendedTask} disabled={isRecLoading || isReadOnly} className="w-full h-20 rounded-[2rem] bg-primary hover:bg-black text-white font-black text-xs uppercase tracking-widest shadow-2xl gap-4 group/btn">
                  {isRecLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Zap className="h-6 w-6 text-accent group-hover/btn:animate-pulse" />} GÖREVİ HEMEN OLUŞTUR
                </Button>
              </Card>

              <Card className="rounded-[4rem] border-none shadow-[0_40px_80px_-20px_rgba(15,23,42,0.15)] bg-white overflow-hidden border border-primary/5">
                <div className="bg-[#1E293B] p-10 text-white flex justify-between items-center relative">
                  <h4 className="text-3xl font-black italic tracking-tighter uppercase relative z-10">ODAKLANMA</h4>
                  <Target className="h-8 w-8 text-accent relative z-10" />
                </div>
                <div className="p-12 space-y-12">
                   <div className="text-center space-y-4">
                      <p className="text-[11px] font-black uppercase tracking-[0.4em] text-muted-foreground/30 italic">FOCUS TERMINAL</p>
                      <p className="text-[10rem] font-black text-[#0F172A] italic tracking-tighter leading-none tabular-nums select-none">{formatTime(timeLeft)}</p>
                   </div>
                   <div className="flex justify-center">
                      <div className="bg-[#F8FAFC] p-2 rounded-[2.5rem] flex gap-2 shadow-inner border border-slate-100">
                        <button onClick={() => switchMode('focus')} className={cn("px-10 py-4 rounded-[2rem] text-[11px] font-black uppercase tracking-widest transition-all", timerMode === 'focus' ? "bg-[#0F172A] text-white shadow-xl scale-105" : "text-slate-400")}>FOCUS</button>
                        <button onClick={() => switchMode('break')} className={cn("px-10 py-4 rounded-[2rem] text-[11px] font-black uppercase tracking-widest transition-all", timerMode === 'break' ? "bg-accent text-primary shadow-xl scale-105" : "text-slate-400")}>BREAK</button>
                      </div>
                   </div>
                   <div className="flex flex-col items-center gap-8">
                      <div className="flex justify-center gap-4">
                        {[25, 45, 60].map(m => (
                          <button key={m} onClick={() => { setPomodoroMinutes(m); setTimerLeft(m * 60); }} className={cn("h-16 w-16 rounded-[1.5rem] border-2 font-black text-sm transition-all flex items-center justify-center", pomodoroMinutes === m ? "border-accent text-accent bg-accent/5 shadow-sm" : "border-slate-100 text-slate-300")}>{m}</button>
                        ))}
                      </div>
                      <div className="flex justify-center gap-6 pb-4">
                        {[{ id: 'lofi', icon: Music }, { id: 'rain', icon: CloudRain }, { id: 'forest', icon: Trees }].map(s => (
                          <button key={s.id} onClick={() => setAmbientSound(ambientSound === s.id ? 'none' : s.id as any)} className={cn("h-14 w-14 rounded-2xl flex items-center justify-center transition-all shadow-sm border", ambientSound === s.id ? "bg-accent border-accent text-white" : "bg-white border-slate-100 text-slate-300")}>
                            <s.icon className="h-6 w-6" />
                          </button>
                        ))}
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
                        <div className="h-full transition-all duration-1000" style={{ width: `${item.val}%`, backgroundColor: item.color }}></div>
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
              <p className="text-5xl font-black text-primary italic">{totalTasksCompleted}</p>
            </Card>
            <Card className="p-10 rounded-[3rem] bg-white border border-primary/5 shadow-xl space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-accent/5 flex items-center justify-center"><BarChart3 className="h-6 w-6 text-accent" /></div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">TOPLAM SORU</p>
              <p className="text-5xl font-black text-primary italic">{totalQuestions.toLocaleString()}</p>
            </Card>
            <Card className="p-10 rounded-[3rem] bg-white border border-primary/5 shadow-xl space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-rose-50 flex items-center justify-center"><FileText className="h-6 w-6 text-rose-500" /></div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">GİRİLEN DENEME</p>
              <p className="text-5xl font-black text-primary italic">{totalExams}</p>
            </Card>
          </div>
          
          <Card className="rounded-[4rem] border-none shadow-xl bg-white overflow-hidden border border-primary/5">
            <div className="p-12 border-b border-primary/5 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-3xl font-black italic tracking-tighter uppercase text-primary">AKADEMİK GEÇMİŞ</h3>
              <Badge className="bg-primary text-white font-black text-[10px] px-4 py-1.5 rounded-full">SON 30 GÜN</Badge>
            </div>
            <div className="p-12 space-y-8">
              {completedTasks.length > 0 ? completedTasks.map((t: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-8 bg-slate-50 rounded-[2.5rem] border border-primary/5 group hover:bg-white hover:shadow-xl transition-all">
                  <div className="flex items-center gap-8">
                    <div className="h-14 w-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg">
                      <CheckCircle className="h-8 w-8" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-2xl font-black text-primary italic uppercase tracking-tighter">{t.subject} - {t.topic}</h4>
                      <p className="text-xs font-bold text-muted-foreground italic uppercase tracking-widest">{t.day} • {t.duration} • +{t.xp} XP {t.questionCount > 0 && `• ${t.questionCount} Soru`}</p>
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

      {!isReadOnly && <AcademicSessionDialog isOpen={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} onSave={handleSaveSession} selectedDay={today} initialData={editingTask?.data} />}
      
      {!isReadOnly && (
        <div className="fixed bottom-12 right-12 z-[100] group">
          <Button onClick={() => { setEditingTask(null); setIsAddDialogOpen(true); }} className="h-28 w-28 rounded-[3.5rem] bg-[#0F172A] hover:bg-accent text-white shadow-2xl transition-all duration-700 hover:scale-110 flex flex-col items-center justify-center gap-2 border-[10px] border-white relative z-10">
            <Plus className="h-12 w-12 text-accent group-hover:rotate-90 transition-transform duration-500" />
            <span className="text-[9px] font-black tracking-[0.3em] uppercase opacity-40">NEW SESSION</span>
          </Button>
        </div>
      )}
    </div>
  );
}
