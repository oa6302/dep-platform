
'use client';

import { useUser, useDoc, useFirestore } from '@/firebase';
import { useState, useMemo, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  Brain, 
  Clock, 
  CheckCircle, 
  Plus, 
  ChevronRight, 
  Loader2,
  Save,
  Trash2,
  Edit3,
  CalendarCheck,
  Book,
  PlaySquare,
  Sparkles,
  Zap,
  Info
} from 'lucide-react';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { EXAM_CONFIGS } from '@/lib/exam-configs';
import { handleGenerateAiStudyPlan } from '@/app/actions';
import { AcademicSessionDialog } from '@/components/academic-session-dialog';

export default function PlanningPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const { data: userData } = useDoc<any>(user?.uid ? `users/${user.uid}` : null);
  const { data: studyPlan, loading: planLoading } = useDoc<any>(user?.uid ? `studyPlans/${user.uid}` : null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedDay, setSelectedDay] = useState('Pazartesi');
  const [weeklyFocus, setWeeklyFocus] = useState('');
  
  const [localSchedule, setLocalSchedule] = useState<any[]>([]);
  const [editingTask, setEditingTask] = useState<{ index: number, data: any } | null>(null);

  const days = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];

  useEffect(() => {
    if (studyPlan?.schedule) {
      setLocalSchedule(studyPlan.schedule);
      setWeeklyFocus(studyPlan.weeklyFocus || '');
    } else {
      setLocalSchedule(days.map(day => ({ day, tasks: [] })));
    }
  }, [studyPlan]);

  const currentDayTasks = useMemo(() => {
    return localSchedule.find((s: any) => s.day === selectedDay)?.tasks || [];
  }, [localSchedule, selectedDay]);

  const handleGeneratePlan = async () => {
    if (!userData) return;
    setIsGenerating(true);
    
    const currentWeek = Math.min(Math.floor((Date.now() - new Date(2025, 8, 1).getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1, 52);
    const examConfig = EXAM_CONFIGS[userData.targetExam || 'YKS_SOZ'] || EXAM_CONFIGS['YKS_SOZ'];

    try {
      const result = await handleGenerateAiStudyPlan({
        targetExam: userData.targetExam || 'YKS_SOZ',
        userName: userData.displayName || 'Öğrenci',
        lessons: examConfig.lessons,
        currentWeek: currentWeek > 0 ? currentWeek : 1
      });

      if (result.success && result.data) {
        setLocalSchedule(result.data.schedule);
        setWeeklyFocus(result.data.weeklyFocus);
        toast({
          title: 'Akademik Plan Hazır',
          description: `AI, 2025-2026 akademik yılının ${currentWeek > 0 ? currentWeek : 1}. haftasına özel planınızı hazırladı.`,
          className: "bg-primary text-white rounded-[2rem]"
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'AI Motoru Hatası',
        description: error.message || 'Plan üretilirken bir sorun oluştu.'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveToFirestore = async () => {
    if (!db || !user || !userData) return;
    setIsSaving(true);
    try {
      await setDoc(doc(db, 'studyPlans', user.uid), {
        userId: user.uid,
        examId: userData.targetExam || 'YKS_SOZ',
        schedule: localSchedule,
        weeklyFocus,
        updatedAt: serverTimestamp()
      });
      toast({
        title: 'Sistem Senkronize Edildi',
        description: 'Planınız bulut veritabanına kaydedildi.',
        className: "bg-primary text-white rounded-[2rem]"
      });
    } catch (e) {
      toast({ variant: 'destructive', title: 'Hata', description: 'Kaydedilemedi.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveTask = (taskData: any) => {
    const newSchedule = [...localSchedule];
    const dayIndex = newSchedule.findIndex(s => s.day === selectedDay);
    
    if (dayIndex > -1) {
      if (editingTask?.index === -1) {
        newSchedule[dayIndex].tasks = [...newSchedule[dayIndex].tasks, taskData];
      } else if (editingTask) {
        newSchedule[dayIndex].tasks[editingTask.index] = taskData;
      }
      setLocalSchedule(newSchedule);
    }
    setEditingTask(null);
  };

  return (
    <div className="p-8 lg:p-14 space-y-12 max-w-[1600px] mx-auto w-full animate-in fade-in duration-1000 bg-[#FAFBFF]">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-primary text-white font-black text-[11px] uppercase tracking-[0.3em] shadow-2xl shadow-primary/20">
             <Zap className="h-4 w-4 text-accent animate-pulse" /> AOS PLANLAMA MOTORU V4.8
          </div>
          <h2 className="text-7xl md:text-8xl font-black tracking-tighter italic text-primary uppercase leading-[0.8] text-shadow-premium">
             AKADEMİK <br /><span className="text-accent text-shadow-accent">STRATEJİ</span>
          </h2>
        </div>
        <div className="flex flex-wrap gap-6">
          <Button 
            onClick={handleGeneratePlan}
            disabled={isGenerating}
            className="h-20 px-12 rounded-[2rem] bg-white border-none text-primary hover:bg-slate-50 transition-all font-black text-sm uppercase tracking-[0.2em] gap-6 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)]"
          >
            {isGenerating ? <Loader2 className="h-7 w-7 animate-spin" /> : <Brain className="h-7 w-7 text-accent" />}
            AI İLE HEMEN OLUŞTUR
          </Button>
          <Button 
            onClick={() => setEditingTask({ index: -1, data: null })}
            className="h-20 px-12 rounded-[2rem] bg-primary hover:bg-accent transition-all font-black text-sm uppercase tracking-[0.2em] gap-6 shadow-[0_30px_60px_-15px_rgba(15,23,42,0.4)] text-white"
          >
            <Plus className="h-7 w-7 text-accent" /> MANUEL EKLE
          </Button>
        </div>
      </header>

      {weeklyFocus && (
        <Card className="rounded-[3rem] border-none bg-accent text-primary p-8 flex items-center gap-8 shadow-2xl animate-in slide-in-from-top duration-700">
           <div className="h-16 w-16 rounded-[1.5rem] bg-white/20 flex items-center justify-center shrink-0">
              <Sparkles className="h-8 w-8" />
           </div>
           <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">AI ACADEMIC FOCUS</p>
              <p className="text-2xl font-black italic tracking-tight uppercase">{weeklyFocus}</p>
           </div>
        </Card>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
        <aside className="xl:col-span-3 space-y-10">
          <Card className="rounded-[4rem] p-8 space-y-10 shadow-xl bg-white border border-primary/5">
            <h3 className="text-2xl font-black italic tracking-tighter text-primary uppercase flex items-center gap-3">
               <Calendar className="h-6 w-6 text-accent" /> HAFTALIK AKIŞ
            </h3>
            <div className="grid gap-3">
              {days.map((day) => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={cn(
                    "flex items-center justify-between p-7 rounded-[2rem] transition-all group",
                    selectedDay === day 
                      ? "bg-primary text-white shadow-[0_20px_40px_-10px_rgba(15,23,42,0.4)] scale-[1.05]" 
                      : "bg-[#F8FAFC] text-muted-foreground hover:bg-white hover:shadow-xl border border-transparent"
                  )}
                >
                  <span className="font-black text-xl uppercase italic tracking-tighter">{day}</span>
                  <ChevronRight className={cn("h-6 w-6 transition-transform group-hover:translate-x-2", selectedDay === day ? "text-accent" : "opacity-10")} />
                </button>
              ))}
            </div>
          </Card>
        </aside>

        <main className="xl:col-span-9">
          <Card className="rounded-[5rem] border-none shadow-[0_60px_120px_-30px_rgba(15,23,42,0.15)] bg-white p-14 space-y-14 border border-primary/5 relative overflow-hidden min-h-[800px] flex flex-col">
            <div className="flex justify-between items-start relative z-10">
              <div className="space-y-2">
                <p className="text-[11px] font-black uppercase tracking-[0.4em] text-muted-foreground opacity-30 italic">OPERATIONAL SCHEDULE</p>
                <h3 className="text-6xl font-black italic tracking-tighter text-primary uppercase">{selectedDay.toUpperCase()} PLANI</h3>
              </div>
              <div className="bg-[#F8FAFC] px-8 py-4 rounded-[2rem] border border-primary/5 flex items-center gap-4 shadow-inner">
                <Clock className="h-6 w-6 text-accent" />
                <span className="font-black text-sm text-primary uppercase tracking-widest">{currentDayTasks.length} SEANS AKTİF</span>
              </div>
            </div>

            <div className="flex-1 flex flex-col">
              {currentDayTasks.length > 0 ? (
                <div className="grid gap-8 w-full">
                  {currentDayTasks.map((task: any, i: number) => (
                    <div key={i} className="flex items-center gap-12 p-10 bg-[#F8FAFC] rounded-[3.5rem] border border-primary/5 hover:bg-white hover:shadow-2xl transition-all group">
                      <div className="text-center w-28 shrink-0">
                        <p className="text-3xl font-black text-primary tracking-tighter leading-none">{task.time}</p>
                        <p className="text-[10px] font-black text-muted-foreground opacity-30 uppercase mt-2 tracking-widest">START</p>
                      </div>
                      <div className="h-20 w-px bg-primary/10"></div>
                      <div className="flex-1 space-y-4">
                        <div className="space-y-1">
                          <h4 className="text-4xl font-black italic tracking-tight text-primary uppercase leading-none group-hover:text-accent transition-colors">{task.subject}</h4>
                          <p className="text-xl font-medium text-muted-foreground italic opacity-60">{task.topic} • {task.duration}</p>
                        </div>
                        <div className="flex gap-4">
                           {task.bookUrl && (
                             <a href={task.bookUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white border border-primary/5 text-primary font-black text-[10px] uppercase hover:bg-primary hover:text-white transition-all shadow-sm">
                               <Book className="h-4 w-4 text-accent" /> PDF / KAYNAK
                             </a>
                           )}
                           {task.youtubeUrl && (
                             <a href={task.youtubeUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white border border-primary/5 text-primary font-black text-[10px] uppercase hover:bg-rose-500 hover:text-white transition-all shadow-sm">
                               <PlaySquare className="h-4 w-4 text-rose-500" /> OYNATMA LİSTESİ
                             </a>
                           )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => setEditingTask({ index: i, data: task })} className="h-14 w-14 rounded-2xl text-muted-foreground opacity-20 hover:opacity-100 hover:text-primary transition-all">
                          <Edit3 className="h-7 w-7" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => {
                          const ns = [...localSchedule];
                          const di = ns.findIndex(s => s.day === selectedDay);
                          ns[di].tasks = ns[di].tasks.filter((_: any, idx: number) => idx !== i);
                          setLocalSchedule(ns);
                        }} className="h-14 w-14 rounded-2xl text-muted-foreground opacity-20 hover:opacity-100 hover:text-rose-500 transition-all">
                          <Trash2 className="h-7 w-7" />
                        </Button>
                        <div className="h-16 w-16 rounded-[1.75rem] bg-white border border-primary/5 flex items-center justify-center text-primary shadow-xl group-hover:bg-accent group-hover:text-white transition-all">
                          <CheckCircle className="h-8 w-8" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center space-y-12 py-32 opacity-20 animate-in zoom-in-95 duration-1000">
                  <CalendarCheck className="h-40 w-40 mx-auto text-primary" />
                  <div className="space-y-6">
                    <p className="text-3xl font-black uppercase tracking-[0.3em] italic text-primary">STRATEJİK VERİ GİRİŞİ BEKLENİYOR.</p>
                    <button 
                      onClick={handleGeneratePlan} 
                      disabled={isGenerating}
                      className="text-2xl font-black text-accent uppercase tracking-[0.4em] underline underline-offset-[16px] hover:text-primary transition-colors disabled:opacity-50"
                    >
                      {isGenerating ? "AI ANALYZING DATA..." : "AI İLE SİSTEMİ KUR"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <footer className="pt-16 border-t border-primary/5 flex flex-col sm:flex-row justify-between items-center gap-10">
              <div className="flex items-center gap-4 text-muted-foreground italic opacity-40">
                 <Info className="h-5 w-5" />
                 <p className="text-xs font-bold uppercase tracking-widest">* Verileriniz AOS Terminali üzerinden tüm cihazlarınızla senkronize edilir.</p>
              </div>
              <Button 
                onClick={handleSaveToFirestore}
                disabled={isSaving}
                className="h-20 px-16 rounded-[2.5rem] bg-primary hover:bg-black transition-all font-black text-sm uppercase tracking-[0.3em] gap-6 shadow-[0_30px_60px_-15px_rgba(15,23,42,0.4)] text-white"
              >
                {isSaving ? <Loader2 className="h-7 w-7 animate-spin" /> : <Save className="h-7 w-7 text-accent" />}
                SİSTEMİ SENKRONİZE ET
              </Button>
            </footer>
          </Card>
        </main>
      </div>

      <AcademicSessionDialog 
        isOpen={!!editingTask} 
        onOpenChange={(open) => !open && setEditingTask(null)} 
        onSave={handleSaveTask}
        selectedDay={selectedDay}
        initialData={editingTask?.data}
      />
    </div>
  );
}
