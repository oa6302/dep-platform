
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
  Timer,
  Zap,
  Edit3,
  X
} from 'lucide-react';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { EXAM_CONFIGS } from '@/lib/exam-configs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  
  // Yerel düzenleme state'i
  const [localSchedule, setLocalSchedule] = useState<any[]>([]);
  const [editingTask, setEditingTask] = useState<{ day: string, index: number, data: any } | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const days = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];

  // Veri yüklendiğinde yerel state'i güncelle
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
    
    // Prototip: AI Simülasyonu ile Plan Oluşturma
    setTimeout(() => {
      const examConfig = EXAM_CONFIGS[userData.targetExam || 'LGS'] || EXAM_CONFIGS['LGS'];
      const lessons = examConfig.lessons;

      const newSchedule = days.map(day => {
        const isSozel = userData.targetExam?.includes('SOZ');
        const tasks = isSozel ? [
          { time: '09:00', subject: lessons[0], topic: 'Eser-Yazar Analizi', duration: '60 dk', status: 'pending' },
          { time: '11:30', subject: lessons[1] || lessons[0], topic: 'Tarih Özet Tekrar', duration: '45 dk', status: 'pending' },
          { time: '14:00', subject: 'Paragraf', topic: '40 Soru Hız Testi', duration: '30 dk', status: 'pending' },
          { time: '16:00', subject: lessons[2] || lessons[0], topic: 'Coğrafya Harita Çalışması', duration: '45 dk', status: 'pending' },
        ] : [
          { time: '09:00', subject: lessons[0], topic: 'Temel Kavramlar', duration: '45 dk', status: 'pending' },
          { time: '11:30', subject: lessons[1] || lessons[0], topic: 'Konu Analizi', duration: '60 dk', status: 'pending' },
          { time: '14:00', subject: 'Paragraf', topic: 'Hız Çalışması', duration: '30 dk', status: 'pending' },
          { time: '16:00', subject: lessons[2] || lessons[0], topic: 'Soru Çözümü', duration: '45 dk', status: 'pending' },
        ];

        return { day, tasks };
      });

      setLocalSchedule(newSchedule);
      setIsGenerating(false);
      toast({
        title: 'Taslak Hazır',
        description: 'AI planı oluşturuldu. Kaydet butonuna basarak onaylayabilirsiniz.',
        className: "bg-accent text-primary rounded-[2rem]"
      });
    }, 1500);
  };

  const handleSaveToFirestore = async () => {
    if (!db || !user || !userData) return;
    setIsSaving(true);
    try {
      await setDoc(doc(db, 'studyPlans', user.uid), {
        userId: user.uid,
        examId: userData.targetExam || 'LGS',
        schedule: localSchedule,
        updatedAt: serverTimestamp()
      });
      toast({
        title: 'Değişiklikler Kaydedildi',
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
      data: { time: '09:00', subject: '', topic: '', duration: '45 dk', status: 'pending' } 
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
    };

    const newSchedule = [...localSchedule];
    const dayIndex = newSchedule.findIndex(s => s.day === selectedDay);
    
    if (dayIndex > -1) {
      if (editingTask.index === -1) {
        // Yeni ekle
        newSchedule[dayIndex].tasks = [...newSchedule[dayIndex].tasks, updatedTask];
      } else {
        // Düzenle
        newSchedule[dayIndex].tasks[editingTask.index] = updatedTask;
      }
      setLocalSchedule(newSchedule);
    }

    setIsDialogOpen(false);
    setEditingTask(null);
  };

  const lessons = useMemo(() => {
    const config = EXAM_CONFIGS[userData?.targetExam || 'LGS'] || EXAM_CONFIGS['LGS'];
    return config.lessons;
  }, [userData]);

  return (
    <div className="p-8 lg:p-12 space-y-12 max-w-7xl mx-auto w-full animate-in fade-in duration-1000">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-accent text-white font-black text-[10px] uppercase tracking-widest shadow-xl shadow-accent/20">
            <Sparkles className="h-3.5 w-3.5" /> Akıllı Program Motoru
          </div>
          <h2 className="text-6xl font-black tracking-tighter italic text-primary uppercase leading-none text-shadow-premium">
            Akademik <br /><span className="text-accent text-shadow-accent">Planlama</span>
          </h2>
        </div>
        <div className="flex gap-4">
          <Button 
            onClick={handleGeneratePlan}
            disabled={isGenerating}
            variant="outline"
            className="h-20 px-10 rounded-[2rem] border-2 border-primary/5 bg-white hover:bg-slate-50 transition-all font-black text-sm uppercase tracking-widest gap-4 shadow-xl"
          >
            {isGenerating ? <Loader2 className="h-7 w-7 animate-spin" /> : <Brain className="h-7 w-7 text-accent" />}
            AI Önerisi Al
          </Button>
          <Button 
            onClick={handleOpenAdd}
            className="h-20 px-10 rounded-[2rem] bg-primary hover:bg-accent transition-all duration-500 font-black text-sm uppercase tracking-widest gap-4 shadow-2xl shadow-primary/20 text-white"
          >
            <Plus className="h-7 w-7 text-accent" /> Yeni Seans Ekle
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
        {/* Sol: Gün Seçimi */}
        <aside className="xl:col-span-4 space-y-8">
          <Card className="rounded-[4rem] border-none shadow-xl bg-white p-10 space-y-8 border border-primary/5">
            <h3 className="text-2xl font-black italic tracking-tighter text-primary uppercase">Haftalık Akış</h3>
            <div className="grid gap-3">
              {days.map((day) => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={cn(
                    "flex items-center justify-between p-6 rounded-[2rem] transition-all group",
                    selectedDay === day 
                      ? "bg-primary text-white shadow-2xl scale-[1.02]" 
                      : "bg-slate-50 text-muted-foreground hover:bg-white hover:shadow-xl"
                  )}
                >
                  <span className="font-black text-lg uppercase italic tracking-tight">{day}</span>
                  <ChevronRight className={cn("h-5 w-5 transition-transform group-hover:translate-x-1", selectedDay === day ? "text-accent" : "opacity-20")} />
                </button>
              ))}
            </div>
          </Card>
        </aside>

        {/* Sağ: Günlük Plan Detayı */}
        <main className="xl:col-span-8 space-y-8">
          <Card className="rounded-[4rem] border-none shadow-2xl bg-white p-12 space-y-10 border border-primary/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
            
            <div className="flex justify-between items-end relative z-10">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60 italic">DETAYLI PROGRAM</p>
                <h3 className="text-4xl font-black italic tracking-tighter text-primary uppercase">{selectedDay} Planı</h3>
              </div>
              <div className="flex items-center gap-4 bg-slate-50 px-6 py-3 rounded-2xl border border-primary/5">
                <Clock className="h-5 w-5 text-accent" />
                <span className="font-black text-xs text-primary">{currentDayTasks.length} Seans Planlandı</span>
              </div>
            </div>

            <div className="grid gap-6 relative z-10">
              {currentDayTasks.length > 0 ? currentDayTasks.map((task: any, i: number) => (
                <div key={i} className="flex items-center gap-8 p-8 bg-[#F8FAFC] rounded-[2.5rem] border border-primary/5 hover:bg-white hover:shadow-2xl transition-all group">
                  <div className="text-center w-20 shrink-0">
                    <p className="text-xl font-black text-primary tracking-tighter leading-none">{task.time}</p>
                    <p className="text-[9px] font-bold text-muted-foreground opacity-40 uppercase mt-1 italic">BAŞLAT</p>
                  </div>
                  <div className="h-12 w-px bg-primary/5"></div>
                  <div className="flex-1 space-y-1">
                    <h4 className="text-2xl font-black italic tracking-tight text-primary uppercase leading-none">{task.subject}</h4>
                    <p className="text-sm font-medium text-muted-foreground italic">{task.topic} • {task.duration}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleOpenEdit(task, i)}
                      className="h-12 w-12 rounded-xl text-muted-foreground opacity-20 hover:opacity-100 hover:text-primary"
                    >
                      <Edit3 className="h-5 w-5" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleDeleteTask(i)}
                      className="h-12 w-12 rounded-xl text-muted-foreground opacity-20 hover:opacity-100 hover:text-rose-500"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                    <div className="h-14 w-14 rounded-2xl bg-white border border-primary/5 flex items-center justify-center text-primary shadow-sm group-hover:bg-accent group-hover:text-white transition-all group-hover:rotate-3">
                      <CheckCircle2 className="h-6 w-6" />
                    </div>
                  </div>
                </div>
              )) : (
                <div className="py-40 text-center space-y-8 opacity-20 italic">
                  <Calendar className="h-24 w-24 mx-auto" />
                  <p className="text-xl font-black uppercase tracking-widest">Bu gün için henüz bir plan oluşturulmamış.</p>
                  <Button variant="link" onClick={handleGeneratePlan} className="font-black text-accent uppercase tracking-widest underline underline-offset-4">AI İle Hemen Oluştur</Button>
                </div>
              )}
            </div>

            <div className="pt-8 border-t border-primary/5 flex justify-between items-center relative z-10">
              <p className="text-xs font-bold text-muted-foreground italic">* Planlanan her seans için AI Koçunuz 15dk önce bildirim gönderir.</p>
              <Button 
                onClick={handleSaveToFirestore}
                disabled={isSaving}
                className="h-14 px-8 rounded-2xl bg-primary hover:bg-accent transition-all font-black text-xs uppercase tracking-widest gap-3 shadow-xl text-white"
              >
                {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                Değişiklikleri Kaydet
              </Button>
            </div>
          </Card>
        </main>
      </div>

      {/* Edit/Add Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="rounded-[3rem] border-none shadow-2xl p-12 bg-white max-w-lg">
          <DialogHeader className="space-y-4">
            <DialogTitle className="text-4xl font-black italic tracking-tighter text-primary uppercase">
              {editingTask?.index === -1 ? 'Yeni Seans' : 'Seansı Düzenle'}
            </DialogTitle>
            <DialogDescription className="font-medium italic">
              {selectedDay} günü için çalışma detaylarını belirleyin.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveTask} className="space-y-8 pt-8">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-xs font-black uppercase tracking-widest opacity-40 ml-2 italic">Başlangıç Saati</Label>
                <Input name="time" type="time" required defaultValue={editingTask?.data?.time} className="h-16 rounded-2xl bg-slate-50 border-none shadow-inner font-black text-xl" />
              </div>
              <div className="space-y-3">
                <Label className="text-xs font-black uppercase tracking-widest opacity-40 ml-2 italic">Süre</Label>
                <Input name="duration" required placeholder="Örn: 45 dk" defaultValue={editingTask?.data?.duration} className="h-16 rounded-2xl bg-slate-50 border-none shadow-inner font-bold text-lg" />
              </div>
            </div>
            
            <div className="space-y-3">
              <Label className="text-xs font-black uppercase tracking-widest opacity-40 ml-2 italic">Ders Seçimi</Label>
              <Select name="subject" required defaultValue={editingTask?.data?.subject}>
                <SelectTrigger className="h-16 rounded-2xl bg-slate-50 border-none shadow-inner font-bold text-lg">
                  <SelectValue placeholder="Ders Seçiniz" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  {lessons.map(l => <SelectItem key={l} value={l} className="font-bold">{l}</SelectItem>)}
                  <SelectItem value="Paragraf" className="font-bold">Paragraf</SelectItem>
                  <SelectItem value="Deneme" className="font-bold">Deneme Sınavı</SelectItem>
                  <SelectItem value="Tekrar" className="font-bold">Genel Tekrar</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label className="text-xs font-black uppercase tracking-widest opacity-40 ml-2 italic">Konu Başlığı</Label>
              <Input name="topic" required placeholder="Örn: Cumhuriyet Dönemi Şairleri..." defaultValue={editingTask?.data?.topic} className="h-16 rounded-2xl bg-slate-50 border-none shadow-inner font-bold" />
            </div>

            <Button type="submit" className="w-full h-20 rounded-[2rem] bg-primary hover:bg-accent transition-all font-black text-sm uppercase tracking-widest gap-3 shadow-2xl text-white">
              <CheckCircle2 className="h-6 w-6" />
              Programa Ekle
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
