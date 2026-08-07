'use client';

import { useUser, useDoc, useFirestore } from '@/firebase';
import { useState, useMemo, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const [editingTask, setEditingTask] = useState<{ day: string, index: number, data: any } | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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
    
    const examConfig = EXAM_CONFIGS[userData.targetExam || 'YKS_SOZ'] || EXAM_CONFIGS['YKS_SOZ'];
    const currentWeek = Math.min(Math.floor((Date.now() - new Date(2025, 8, 1).getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1, 52);

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
          description: `AI, akademik yılın ${currentWeek}. haftasına özel programınızı oluşturdu.`,
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
        description: 'Haftalık programınız buluta işlendi.',
        className: "bg-primary text-white rounded-[2rem]"
      });
    } catch (e) {
      toast({ variant: 'destructive', title: 'Hata', description: 'Plan kaydedilemedi.' });
    } finally {
      setIsSaving(false);
    }
  };

  const lessons = useMemo(() => {
    const config = EXAM_CONFIGS[userData?.targetExam || 'YKS_SOZ'] || EXAM_CONFIGS['YKS_SOZ'];
    return config.lessons;
  }, [userData]);

  const handleSaveTask = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingTask) return;

    const formData = new FormData(e.currentTarget);
    const updatedTask = {
      ...editingTask.data,
      time: formData.get('time'),
      subject: formData.get('subject'),
      topic: formData.get('topic'),
      duration: formData.get('duration'),
      bookUrl: formData.get('bookUrl'),
      youtubeUrl: formData.get('youtubeUrl'),
    };

    const newSchedule = [...localSchedule];
    const dayIndex = newSchedule.findIndex(s => s.day === selectedDay);
    
    if (dayIndex > -1) {
      if (editingTask.index === -1) {
        newSchedule[dayIndex].tasks = [...newSchedule[dayIndex].tasks, updatedTask];
      } else {
        newSchedule[dayIndex].tasks[editingTask.index] = updatedTask;
      }
      setLocalSchedule(newSchedule);
    }

    setIsDialogOpen(false);
    setEditingTask(null);
  };

  return (
    <div className="p-10 lg:p-16 space-y-12 max-w-[1600px] mx-auto w-full animate-in fade-in duration-1000">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-primary text-white font-black text-[11px] uppercase tracking-[0.3em] shadow-2xl shadow-primary/20">
             <Zap className="h-4 w-4 text-accent animate-pulse" /> AKILLI PROGRAM MOTORU V4.0
          </div>
          <h2 className="text-7xl md:text-9xl font-black tracking-tighter italic text-primary uppercase leading-[0.8] text-shadow-premium">
             AKADEMİK <br /><span className="text-accent text-shadow-accent">PLANLAMA</span>
          </h2>
        </div>
        <div className="flex flex-wrap gap-6">
          <Button 
            onClick={handleGeneratePlan}
            disabled={isGenerating}
            className="h-24 px-12 rounded-[2.5rem] bg-white border-none text-primary hover:bg-slate-50 transition-all font-black text-sm uppercase tracking-[0.2em] gap-6 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)]"
          >
            {isGenerating ? <Loader2 className="h-8 w-8 animate-spin" /> : <Brain className="h-8 w-8 text-accent" />}
            AI İLE HEMEN OLUŞTUR
          </Button>
          <Button 
            onClick={() => setEditingTask({ day: selectedDay, index: -1, data: { time: '09:00', duration: '45 dk' } })}
            className="h-24 px-12 rounded-[2.5rem] bg-primary hover:bg-accent transition-all font-black text-sm uppercase tracking-[0.2em] gap-6 shadow-[0_40px_80px_-20px_rgba(15,23,42,0.4)] text-white"
          >
            <Plus className="h-8 w-8 text-accent" /> MANUEL EKLE
          </Button>
        </div>
      </header>

      {weeklyFocus && (
        <Card className="rounded-[3rem] border-none bg-accent text-primary p-10 flex items-center gap-8 shadow-2xl animate-in slide-in-from-top duration-700">
           <div className="h-16 w-16 rounded-[1.5rem] bg-white/20 flex items-center justify-center shrink-0">
              <Sparkles className="h-8 w-8" />
           </div>
           <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">AI WEEKLY FOCUS</p>
              <p className="text-xl font-black italic tracking-tight">{weeklyFocus}</p>
           </div>
        </Card>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
        <aside className="xl:col-span-3 space-y-10">
          <Card className="rounded-[4rem] p-10 space-y-10 shadow-xl bg-white border border-primary/5">
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
                      ? "bg-primary text-white shadow-[0_25px_50px_-12px_rgba(15,23,42,0.4)] scale-[1.05]" 
                      : "bg-[#F8FAFC] text-muted-foreground hover:bg-white hover:shadow-2xl border border-transparent hover:border-primary/5"
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
          <Card className="rounded-[5rem] border-none shadow-[0_60px_120px_-30px_rgba(15,23,42,0.15)] bg-white p-16 space-y-14 border border-primary/5 relative overflow-hidden min-h-[800px] flex flex-col">
            <div className="flex justify-between items-start relative z-10">
              <div className="space-y-2">
                <p className="text-[11px] font-black uppercase tracking-[0.4em] text-muted-foreground opacity-30 italic">OPERATIONAL PLAN</p>
                <h3 className="text-6xl font-black italic tracking-tighter text-primary uppercase">{selectedDay.toUpperCase()} PLANI</h3>
              </div>
              <div className="bg-[#F8FAFC] px-8 py-4 rounded-[2rem] border border-primary/5 flex items-center gap-4 shadow-inner">
                <Clock className="h-6 w-6 text-accent" />
                <span className="font-black text-sm text-primary uppercase tracking-widest">{currentDayTasks.length} SEANS AKTİF</span>
              </div>
            </div>

            <div className="flex-1 flex flex-col justify-center">
              {currentDayTasks.length > 0 ? (
                <div className="grid gap-8 w-full">
                  {currentDayTasks.map((task: any, i: number) => (
                    <div key={i} className="flex items-center gap-12 p-12 bg-[#F8FAFC] rounded-[4rem] border border-primary/5 hover:bg-white hover:shadow-2xl transition-all group">
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
                        <div className="flex gap-5">
                           {task.bookUrl && (
                             <a href={task.bookUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-white border border-primary/5 text-primary font-black text-[10px] uppercase hover:bg-primary hover:text-white transition-all shadow-sm">
                               <Book className="h-4 w-4 text-accent" /> PDF / KAYNAK
                             </a>
                           )}
                           {task.youtubeUrl && (
                             <a href={task.youtubeUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-white border border-primary/5 text-primary font-black text-[10px] uppercase hover:bg-rose-500 hover:text-white transition-all shadow-sm">
                               <PlaySquare className="h-4 w-4 text-rose-500" /> PLAYLIST
                             </a>
                           )}
                        </div>
                      </div>
                      <div className="flex items-center gap-5">
                        <Button variant="ghost" size="icon" onClick={() => setEditingTask({ day: selectedDay, index: i, data: task })} className="h-16 w-16 rounded-[1.75rem] text-muted-foreground opacity-20 hover:opacity-100 hover:text-primary transition-all">
                          <Edit3 className="h-8 w-8" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => {
                          const ns = [...localSchedule];
                          const di = ns.findIndex(s => s.day === selectedDay);
                          ns[di].tasks = ns[di].tasks.filter((_: any, idx: number) => idx !== i);
                          setLocalSchedule(ns);
                        }} className="h-16 w-16 rounded-[1.75rem] text-muted-foreground opacity-20 hover:opacity-100 hover:text-rose-500 transition-all">
                          <Trash2 className="h-8 w-8" />
                        </Button>
                        <div className="h-20 w-20 rounded-[2.5rem] bg-white border border-primary/5 flex items-center justify-center text-primary shadow-xl group-hover:bg-accent group-hover:text-white transition-all">
                          <CheckCircle className="h-10 w-10" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center space-y-12 py-20 opacity-20 animate-in zoom-in-95 duration-1000">
                  <CalendarCheck className="h-48 w-48 mx-auto text-primary" />
                  <div className="space-y-6">
                    <p className="text-4xl font-black uppercase tracking-[0.3em] italic text-primary">PLANLANMIŞ VERİ BULUNAMADI.</p>
                    <button 
                      onClick={handleGeneratePlan} 
                      disabled={isGenerating}
                      className="text-2xl font-black text-accent uppercase tracking-[0.4em] underline underline-offset-[16px] hover:text-primary transition-colors disabled:opacity-50 decoration-4"
                    >
                      {isGenerating ? "AI ANALYZING ROADMAP..." : "AI İLE SİSTEMİ KUR"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <footer className="pt-16 border-t border-primary/5 flex flex-col sm:flex-row justify-between items-center gap-10 relative z-10">
              <div className="flex items-center gap-4 text-muted-foreground italic opacity-40">
                 <Info className="h-5 w-5" />
                 <p className="text-xs font-bold uppercase tracking-widest">* Planlanan her seans bulut üzerinde güvenli bir şekilde saklanır.</p>
              </div>
              <Button 
                onClick={handleSaveToFirestore}
                disabled={isSaving}
                className="h-24 px-16 rounded-[3rem] bg-primary hover:bg-black transition-all font-black text-sm uppercase tracking-[0.3em] gap-6 shadow-[0_40px_80px_-20px_rgba(15,23,42,0.4)] text-white"
              >
                {isSaving ? <Loader2 className="h-8 w-8 animate-spin" /> : <Save className="h-8 w-8 text-accent" />}
                SİSTEMİ SENKRONİZE ET
              </Button>
            </footer>
          </Card>
        </main>
      </div>

      <Dialog open={!!editingTask} onOpenChange={(o) => !o && setEditingTask(null)}>
        <DialogContent className="rounded-[4rem] border-none shadow-[0_80px_160px_-40px_rgba(15,23,42,0.4)] p-16 bg-white max-w-2xl">
          <DialogHeader className="space-y-4 text-center">
            <DialogTitle className="text-5xl font-black italic tracking-tighter text-primary uppercase">
              {editingTask?.index === -1 ? 'YENİ SEANS' : 'SEANS DÜZENLE'}
            </DialogTitle>
            <DialogDescription className="font-medium italic text-xl opacity-60">
              {selectedDay} Günü Akademik Veri Girişi
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveTask} className="space-y-10 pt-10">
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 ml-3 italic">START TIME</Label>
                <Input name="time" type="time" required defaultValue={editingTask?.data?.time} className="h-20 rounded-[2rem] bg-slate-50 border-none shadow-inner font-black text-3xl text-center" />
              </div>
              <div className="space-y-3">
                <Label className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 ml-3 italic">DURATION</Label>
                <Input name="duration" required placeholder="45 dk" defaultValue={editingTask?.data?.duration} className="h-20 rounded-[2rem] bg-slate-50 border-none shadow-inner font-bold text-xl text-center" />
              </div>
            </div>
            
            <div className="space-y-3">
              <Label className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 ml-3 italic">SUBJECT SELECTION</Label>
              <Select name="subject" required defaultValue={editingTask?.data?.subject}>
                <SelectTrigger className="h-20 rounded-[2rem] bg-slate-50 border-none shadow-inner font-black text-xl">
                  <SelectValue placeholder="Ders Seçiniz" />
                </SelectTrigger>
                <SelectContent className="rounded-[2rem] border-none shadow-2xl">
                  {lessons.map(l => <SelectItem key={l} value={l} className="font-bold py-4">{l}</SelectItem>)}
                  <SelectItem value="Deneme" className="font-bold py-4">Deneme Sınavı</SelectItem>
                  <SelectItem value="Tekrar" className="font-bold py-4">Genel Tekrar</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 ml-3 italic">TOPIC HEADLINE</Label>
              <Input name="topic" required placeholder="Çalışılacak spesifik konu..." defaultValue={editingTask?.data?.topic} className="h-20 rounded-[2rem] bg-slate-50 border-none shadow-inner font-bold text-xl" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-accent ml-3 italic flex items-center gap-2">
                  <Book className="h-3 w-3" /> SOURCE / PDF LINK
                </Label>
                <Input name="bookUrl" placeholder="https://..." defaultValue={editingTask?.data?.bookUrl} className="h-16 rounded-2xl bg-slate-50 border-none shadow-inner font-medium text-sm" />
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-500 ml-3 italic flex items-center gap-2">
                  <PlaySquare className="h-3 w-3" /> PLAYLIST LINK
                </Label>
                <Input name="youtubeUrl" placeholder="https://..." defaultValue={editingTask?.data?.youtubeUrl} className="h-16 rounded-2xl bg-slate-50 border-none shadow-inner font-medium text-sm" />
              </div>
            </div>

            <Button type="submit" className="w-full h-24 rounded-[2.5rem] bg-primary hover:bg-accent transition-all font-black text-lg uppercase tracking-[0.3em] gap-6 shadow-[0_30px_60px_-15px_rgba(15,23,42,0.3)]">
              <CheckCircle className="h-8 w-8 text-accent" />
              GÖREVİ ONAYLA
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}