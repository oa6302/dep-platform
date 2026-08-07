'use client';

import { useUser, useDoc, useFirestore } from '@/firebase';
import { useState, useMemo, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Calendar, 
  Sparkles, 
  Brain, 
  Clock, 
  CheckCircle2, 
  Plus, 
  ChevronRight, 
  Loader2,
  Save,
  Trash2,
  Zap,
  Edit3,
  CalendarCheck,
  Book,
  Youtube,
  Link as LinkIcon,
  PlaySquare
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
  
  const [localSchedule, setLocalSchedule] = useState<any[]>([]);
  const [editingTask, setEditingTask] = useState<{ day: string, index: number, data: any } | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const days = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];

  useEffect(() => {
    if (studyPlan?.schedule) {
      setLocalSchedule(studyPlan.schedule);
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
    
    try {
      const result = await handleGenerateAiStudyPlan({
        targetExam: userData.targetExam || 'YKS_SOZ',
        userName: userData.displayName || 'Öğrenci',
        lessons: examConfig.lessons
      });

      if (result.success && result.data) {
        setLocalSchedule(result.data);
        toast({
          title: 'Akademik Plan Hazır',
          description: 'AI, 2025 müfredatına özel 7 günlük playlist destekli programınızı oluşturdu.',
          className: "bg-accent text-primary rounded-[2rem]"
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Hata',
        description: error.message || 'AI planı oluşturulurken bir sorun oluştu.'
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
        updatedAt: serverTimestamp()
      });
      toast({
        title: 'Sistem Senkronize Edildi',
        description: 'Haftalık programınız başarıyla güncellendi.',
        className: "bg-primary text-white rounded-[2rem]"
      });
    } catch (e) {
      toast({ variant: 'destructive', title: 'Hata', description: 'Plan kaydedilemedi.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTask = (index: number) => {
    const newSchedule = [...localSchedule];
    const dayIndex = newSchedule.findIndex(s => s.day === selectedDay);
    if (dayIndex > -1) {
      newSchedule[dayIndex].tasks = newSchedule[dayIndex].tasks.filter((_: any, i: number) => i !== index);
      setLocalSchedule(newSchedule);
    }
  };

  const handleOpenEdit = (task: any, index: number) => {
    setEditingTask({ day: selectedDay, index, data: { ...task } });
    setIsDialogOpen(true);
  };

  const handleOpenAdd = () => {
    setEditingTask({ 
      day: selectedDay, 
      index: -1, 
      data: { time: '09:00', subject: '', topic: '', duration: '45 dk', status: 'pending', bookUrl: '', youtubeUrl: '' } 
    });
    setIsDialogOpen(true);
  };

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

  const lessons = useMemo(() => {
    const config = EXAM_CONFIGS[userData?.targetExam || 'YKS_SOZ'] || EXAM_CONFIGS['YKS_SOZ'];
    return config.lessons;
  }, [userData]);

  return (
    <div className="p-8 lg:p-16 space-y-12 max-w-7xl mx-auto w-full animate-in fade-in duration-1000">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-accent text-white font-black text-[10px] uppercase tracking-widest shadow-xl">
             AKILLI PROGRAM MOTORU
          </div>
          <h2 className="text-7xl font-black tracking-tighter italic text-primary uppercase leading-none">
             AKADEMİK <br /><span className="text-accent text-shadow-accent">PLANLAMA</span>
          </h2>
        </div>
        <div className="flex gap-6">
          <Button 
            onClick={handleGeneratePlan}
            disabled={isGenerating}
            className="h-16 px-10 rounded-2xl bg-white border-none text-primary hover:bg-slate-50 transition-all font-black text-xs uppercase tracking-widest gap-4 shadow-xl shadow-black/5"
          >
            {isGenerating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Brain className="h-5 w-5 text-accent" />}
            AI ÖNERİSİ AL
          </Button>
          <Button 
            onClick={handleOpenAdd}
            className="h-16 px-10 rounded-2xl bg-[#0F172A] hover:bg-black transition-all font-black text-xs uppercase tracking-widest gap-4 shadow-2xl text-white"
          >
            <Plus className="h-5 w-5 text-accent" /> YENİ SEANS EKLE
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        <aside className="xl:col-span-3 space-y-8">
          <div className="bg-white rounded-[3rem] p-10 space-y-8 shadow-xl shadow-black/5">
            <h3 className="text-2xl font-black italic tracking-tighter text-primary uppercase">HAFTALIK AKIŞ</h3>
            <div className="grid gap-3">
              {days.map((day) => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={cn(
                    "flex items-center justify-between p-6 rounded-2xl transition-all group",
                    selectedDay === day 
                      ? "bg-[#0F172A] text-white shadow-2xl scale-[1.02]" 
                      : "bg-[#F8FAFC] text-muted-foreground hover:bg-white hover:shadow-lg border border-transparent hover:border-primary/5"
                  )}
                >
                  <span className="font-black text-lg uppercase italic tracking-tight">{day}</span>
                  <ChevronRight className={cn("h-5 w-5 transition-transform group-hover:translate-x-1", selectedDay === day ? "text-accent" : "opacity-10")} />
                </button>
              ))}
            </div>
          </div>
        </aside>

        <main className="xl:col-span-9">
          <Card className="rounded-[4rem] border-none shadow-2xl bg-white p-14 space-y-12 border border-primary/5 relative overflow-hidden min-h-[700px] flex flex-col">
            <div className="flex justify-between items-start relative z-10">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-30 italic">DETAYLI PROGRAM</p>
                <h3 className="text-5xl font-black italic tracking-tighter text-primary uppercase">{selectedDay.toUpperCase()} PLANI</h3>
              </div>
              <div className="flex items-center gap-4 bg-[#F8FAFC] px-6 py-3 rounded-2xl border border-primary/5">
                <Clock className="h-5 w-5 text-accent" />
                <span className="font-black text-xs text-primary">{currentDayTasks.length} Seans Planlandı</span>
              </div>
            </div>

            <div className="flex-1 flex flex-col justify-center items-center">
              {currentDayTasks.length > 0 ? (
                <div className="grid gap-6 w-full">
                  {currentDayTasks.map((task: any, i: number) => (
                    <div key={i} className="flex items-center gap-10 p-10 bg-[#F8FAFC] rounded-[3rem] border border-primary/5 hover:bg-white hover:shadow-2xl transition-all group">
                      <div className="text-center w-24 shrink-0">
                        <p className="text-2xl font-black text-primary tracking-tighter leading-none">{task.time}</p>
                        <p className="text-[10px] font-bold text-muted-foreground opacity-30 uppercase mt-2 italic">BAŞLAT</p>
                      </div>
                      <div className="h-16 w-px bg-primary/10"></div>
                      <div className="flex-1 space-y-3">
                        <div>
                          <h4 className="text-3xl font-black italic tracking-tight text-primary uppercase leading-none">{task.subject}</h4>
                          <p className="text-lg font-medium text-muted-foreground italic opacity-70">{task.topic} • {task.duration}</p>
                        </div>
                        <div className="flex gap-4">
                           {task.bookUrl && (
                             <a href={task.bookUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-primary/5 text-primary font-black text-[10px] uppercase hover:bg-primary hover:text-white transition-all shadow-sm">
                               <Book className="h-4 w-4 text-accent" /> Kitap/PDF
                             </a>
                           )}
                           {task.youtubeUrl && (
                             <a href={task.youtubeUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-primary/5 text-primary font-black text-[10px] uppercase hover:bg-rose-500 hover:text-white transition-all shadow-sm">
                               <PlaySquare className="h-4 w-4 text-rose-500" /> Oynatma Listesi
                             </a>
                           )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(task, i)} className="h-14 w-14 rounded-2xl text-muted-foreground opacity-20 hover:opacity-100 hover:text-primary transition-all">
                          <Edit3 className="h-6 w-6" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteTask(i)} className="h-14 w-14 rounded-2xl text-muted-foreground opacity-20 hover:opacity-100 hover:text-rose-500 transition-all">
                          <Trash2 className="h-6 w-6" />
                        </Button>
                        <div className="h-16 w-16 rounded-3xl bg-white border border-primary/5 flex items-center justify-center text-primary shadow-sm group-hover:bg-accent group-hover:text-white transition-all">
                          <CheckCircle2 className="h-8 w-8" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center space-y-10 py-20 opacity-30 animate-in zoom-in-95 duration-700">
                  <CalendarCheck className="h-40 w-40 mx-auto text-primary" />
                  <div className="space-y-4">
                    <p className="text-3xl font-black uppercase tracking-[0.2em] italic text-primary">BU GÜN İÇİN HENÜZ BİR PLAN OLUŞTURULMAMIŞ.</p>
                    <button 
                      onClick={handleGeneratePlan} 
                      disabled={isGenerating}
                      className="text-xl font-black text-accent uppercase tracking-[0.3em] underline underline-offset-[12px] hover:text-primary transition-colors disabled:opacity-50"
                    >
                      {isGenerating ? "AI 2025 MÜFREDATINI ANALİZ EDİYOR..." : "AI İLE HEMEN OLUŞTUR"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <footer className="pt-12 border-t border-primary/5 flex flex-col sm:flex-row justify-between items-center gap-8 relative z-10">
              <p className="text-xs font-bold text-muted-foreground italic opacity-50 text-center sm:text-left">
                * Planlanan her seans için AI Koçunuz 15dk önce bildirim gönderir.
              </p>
              <Button 
                onClick={handleSaveToFirestore}
                disabled={isSaving}
                className="h-20 px-12 rounded-[2rem] bg-[#0F172A] hover:bg-black transition-all font-black text-sm uppercase tracking-widest gap-4 shadow-2xl text-white"
              >
                {isSaving ? <Loader2 className="h-6 w-6 animate-spin" /> : <Save className="h-6 w-6 text-accent" />}
                DEĞİŞİKLİKLERİ KAYDET
              </Button>
            </footer>
          </Card>
        </main>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="rounded-[3rem] border-none shadow-[0_60px_120px_-30px_rgba(15,23,42,0.4)] p-12 bg-white max-w-xl">
          <DialogHeader className="space-y-4">
            <DialogTitle className="text-4xl font-black italic tracking-tighter text-primary uppercase">
              {editingTask?.index === -1 ? 'YENİ SEANS' : 'SEANSI DÜZENLE'}
            </DialogTitle>
            <DialogDescription className="font-medium italic text-lg">
              {selectedDay} günü akademik program detayları.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveTask} className="space-y-8 pt-8">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2 italic">BAŞLANGIÇ SAATİ</Label>
                <Input name="time" type="time" required defaultValue={editingTask?.data?.time} className="h-16 rounded-2xl bg-slate-50 border-none shadow-inner font-black text-2xl" />
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2 italic">SÜRE</Label>
                <Input name="duration" required placeholder="Örn: 45 dk" defaultValue={editingTask?.data?.duration} className="h-16 rounded-2xl bg-slate-50 border-none shadow-inner font-bold text-lg" />
              </div>
            </div>
            
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2 italic">DERS SEÇİMİ</Label>
              <Select name="subject" required defaultValue={editingTask?.data?.subject}>
                <SelectTrigger className="h-16 rounded-2xl bg-slate-50 border-none shadow-inner font-bold text-lg">
                  <SelectValue placeholder="Ders Seçiniz" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-none shadow-2xl">
                  {lessons.map(l => <SelectItem key={l} value={l} className="font-bold">{l}</SelectItem>)}
                  <SelectItem value="Paragraf" className="font-bold">Paragraf Hızı</SelectItem>
                  <SelectItem value="Deneme" className="font-bold">Deneme Sınavı</SelectItem>
                  <SelectItem value="Tekrar" className="font-bold">Genel Tekrar</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2 italic">KONU BAŞLIĞI</Label>
              <Input name="topic" required placeholder="Örn: Cumhuriyet Dönemi Şairleri..." defaultValue={editingTask?.data?.topic} className="h-16 rounded-2xl bg-slate-50 border-none shadow-inner font-bold" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-accent ml-2 italic flex items-center gap-2">
                  <Book className="h-3 w-3" /> DERS KİTABI / PDF LİNKİ
                </Label>
                <Input name="bookUrl" placeholder="https://..." defaultValue={editingTask?.data?.bookUrl} className="h-14 rounded-xl bg-slate-50 border-none shadow-inner font-medium text-sm" />
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-rose-500 ml-2 italic flex items-center gap-2">
                  <PlaySquare className="h-3 w-3" /> OYNATMA LİSTESİ LİNKİ
                </Label>
                <Input name="youtubeUrl" placeholder="https://youtube.com/playlist?list=..." defaultValue={editingTask?.data?.youtubeUrl} className="h-14 rounded-xl bg-slate-50 border-none shadow-inner font-medium text-sm" />
              </div>
            </div>

            <Button type="submit" className="w-full h-20 rounded-[2rem] bg-[#0F172A] hover:bg-black transition-all font-black text-sm uppercase tracking-widest gap-4 shadow-2xl text-white">
              <CheckCircle2 className="h-6 w-6 text-accent" />
              PROGRAMA EKLE
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
