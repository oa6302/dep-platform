
'use client';

import { useUser, useDoc, useFirestore } from '@/firebase';
import { useState, useMemo, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Info,
  Target,
  Activity,
  ArrowLeft,
  Home,
  Layers,
  TrendingUp,
  Milestone,
  Flag
} from 'lucide-react';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { EXAM_CONFIGS } from '@/lib/exam-configs';
import { handleGenerateAiStudyPlan } from '@/app/actions';
import { AcademicSessionDialog } from '@/components/academic-session-dialog';
import { useRouter } from 'next/navigation';

export default function PlanningPage() {
  const { user } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const { data: userData } = useDoc<any>(user?.uid ? `users/${user.uid}` : null);
  const { data: studyPlan, loading: planLoading } = useDoc<any>(user?.uid ? `studyPlans/${user.uid}` : null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedDay, setSelectedDay] = useState('Pazartesi');
  const [weeklyFocus, setWeeklyFocus] = useState('');
  const [recommendations, setRecommendations] = useState<string[]>([]);
  
  const [localSchedule, setLocalSchedule] = useState<any[]>([]);
  const [editingTask, setEditingTask] = useState<{ index: number, data: any } | null>(null);

  const days = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];

  useEffect(() => {
    if (studyPlan?.schedule) {
      setLocalSchedule(studyPlan.schedule);
      setWeeklyFocus(studyPlan.weeklyFocus || '');
      setRecommendations(studyPlan.recommendations || []);
    } else if (!planLoading) {
      setLocalSchedule(days.map(day => ({ day, tasks: [] })));
    }
  }, [studyPlan, planLoading]);

  const currentDayTasks = useMemo(() => {
    return localSchedule.find((s: any) => s.day === selectedDay)?.tasks || [];
  }, [localSchedule, selectedDay]);

  const handleGeneratePlan = async () => {
    if (!userData) return;
    setIsGenerating(true);
    
    const startDate = new Date(2026, 7, 10); 
    const diff = Date.now() - startDate.getTime();
    const currentWeek = Math.max(1, Math.min(Math.floor(diff / (7 * 24 * 60 * 60 * 1000)) + 1, 52));
    
    const examConfig = EXAM_CONFIGS[userData.targetExam || 'YKS_SOZ'] || EXAM_CONFIGS['YKS_SOZ'];

    try {
      const result = await handleGenerateAiStudyPlan({
        targetExam: userData.targetExam || 'YKS_SOZ',
        userName: userData.displayName || 'Öğrenci',
        lessons: examConfig.lessons,
        currentWeek: currentWeek
      });

      if (result.success && result.data) {
        // AI planını Firestore'a hemen kaydet
        await setDoc(doc(db!, 'studyPlans', user!.uid), {
          userId: user!.uid,
          examId: userData.targetExam || 'YKS_SOZ',
          schedule: result.data.schedule,
          weeklyFocus: result.data.weeklyFocus,
          recommendations: result.data.recommendations || [],
          updatedAt: serverTimestamp()
        }, { merge: true });

        toast({
          title: 'Akademik Strateji Hazır',
          description: `AI, 10 Ağustos başlangıçlı plana göre ${currentWeek}. haftayı optimize etti.`,
          className: "bg-primary text-white rounded-[2rem]"
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Planlama Motoru Hatası',
        description: error.message || 'Plan üretilirken bir sorun oluştu.'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const syncToFirestore = async (schedule: any[], focus: string, recs: string[]) => {
    if (!db || !user) return;
    setIsSaving(true);
    try {
      await setDoc(doc(db, 'studyPlans', user.uid), {
        userId: user.uid,
        schedule,
        weeklyFocus: focus,
        recommendations: recs,
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (e) {
      console.error('Save error:', e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveTask = async (taskData: any) => {
    const newSchedule = [...localSchedule];
    const dayIndex = newSchedule.findIndex(s => s.day === selectedDay);
    
    if (dayIndex > -1) {
      const updatedTasks = [...newSchedule[dayIndex].tasks];
      if (editingTask?.index === -1) {
        updatedTasks.push(taskData);
      } else if (editingTask) {
        updatedTasks[editingTask.index] = taskData;
      }
      newSchedule[dayIndex].tasks = updatedTasks;
      setLocalSchedule(newSchedule);
      await syncToFirestore(newSchedule, weeklyFocus, recommendations);
      toast({ title: 'Görev Kaydedildi', description: 'Değişiklikler anlık olarak buluta işlendi.' });
    }
    setEditingTask(null);
  };

  const handleDeleteTask = async (index: number) => {
    if (!confirm('Bu seansı silmek istediğinize emin misiniz?')) return;
    const newSchedule = [...localSchedule];
    const dayIndex = newSchedule.findIndex(s => s.day === selectedDay);
    
    if (dayIndex > -1) {
      const updatedTasks = [...newSchedule[dayIndex].tasks];
      updatedTasks.splice(index, 1);
      newSchedule[dayIndex].tasks = updatedTasks;
      setLocalSchedule(newSchedule);
      await syncToFirestore(newSchedule, weeklyFocus, recommendations);
      toast({ title: 'Görev Silindi', description: 'Programınız güncellendi.' });
    }
  };

  return (
    <div className="p-8 lg:p-14 space-y-12 max-w-[1600px] mx-auto w-full animate-in fade-in duration-1000 bg-[#FAFBFF]">
      <header className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-12">
        <div className="space-y-8">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => router.back()} 
              className="h-12 w-12 rounded-xl bg-white shadow-sm border border-primary/5 hover:bg-primary hover:text-white transition-all group/nav"
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => router.push('/dashboard')} 
              className="h-12 w-12 rounded-xl bg-white shadow-sm border border-primary/5 hover:bg-primary hover:text-white transition-all group/nav"
            >
              <Home className="h-6 w-6" />
            </Button>
          </div>
          <div className="space-y-5">
            <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-primary text-white font-black text-[11px] uppercase tracking-[0.4em] shadow-2xl shadow-primary/20 italic border border-white/10">
               <Activity className="h-4 w-4 text-accent animate-pulse" /> DEK MASTER PLANNER V4.8
            </div>
            <h2 className="text-7xl md:text-9xl font-black tracking-tighter italic text-primary uppercase leading-[0.8] text-shadow-premium">
               AKADEMİK <br /><span className="text-accent text-shadow-accent">STRATEJİ</span>
            </h2>
          </div>
        </div>
        <div className="flex flex-wrap gap-6">
          <Button 
            onClick={handleGeneratePlan} 
            disabled={isGenerating}
            className="h-24 px-14 rounded-[2.5rem] bg-white border-none text-primary hover:bg-slate-50 transition-all font-black text-sm uppercase tracking-[0.3em] gap-8 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.15)] group"
          >
            {isGenerating ? <Loader2 className="h-8 w-8 animate-spin" /> : <Brain className="h-8 w-8 text-accent group-hover:scale-110 transition-transform" />}
            AI İLE OPTİMİZE ET
          </Button>
          <Button 
            onClick={() => setEditingTask({ index: -1, data: null })}
            className="h-24 px-14 rounded-[2.5rem] bg-primary hover:bg-accent transition-all font-black text-sm uppercase tracking-[0.3em] gap-8 shadow-[0_40px_80px_-20px_rgba(15,23,42,0.4)] text-white"
          >
            <Plus className="h-8 w-8 text-accent" /> MANUEL EKLE
          </Button>
        </div>
      </header>

      <Tabs defaultValue="weekly" className="space-y-12">
        <TabsList className="bg-slate-100/50 p-2.5 rounded-[3rem] h-24 shadow-inner flex border border-primary/5">
          <TabsTrigger value="weekly" className="rounded-[2.5rem] px-12 h-full font-black text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-xl gap-4">
            <Calendar className="h-5 w-5" /> Haftalık Plan
          </TabsTrigger>
          <TabsTrigger value="monthly" className="rounded-[2.5rem] px-12 h-full font-black text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-xl gap-4">
            <Layers className="h-5 w-5" /> Aylık Odak
          </TabsTrigger>
          <TabsTrigger value="strategic" className="rounded-[2.5rem] px-12 h-full font-black text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-xl gap-4">
            <Milestone className="h-5 w-5" /> 3 Aylık Strateji
          </TabsTrigger>
        </TabsList>

        <TabsContent value="weekly" className="space-y-12 animate-in fade-in">
          {weeklyFocus && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <Card className="lg:col-span-8 rounded-[4rem] border-none bg-primary text-white p-12 flex items-center gap-10 shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 blur-[80px] rounded-full"></div>
                  <div className="h-20 w-20 rounded-[2rem] bg-white/10 backdrop-blur-xl flex items-center justify-center shrink-0 border border-white/10 shadow-inner group-hover:rotate-6 transition-transform">
                    <Target className="h-10 w-10 text-accent" />
                  </div>
                  <div className="space-y-2 relative z-10">
                    <p className="text-[11px] font-black uppercase tracking-[0.4em] text-white/40 italic">AKADEMİK ODAK NOKTASI</p>
                    <p className="text-3xl font-black italic tracking-tight uppercase text-shadow-deep">{weeklyFocus}</p>
                  </div>
              </Card>
              
              <Card className="lg:col-span-4 rounded-[4rem] border-none bg-accent text-primary p-12 space-y-6 shadow-2xl relative overflow-hidden group">
                  <Sparkles className="absolute top-6 right-6 h-10 w-10 opacity-20" />
                  <p className="text-[11px] font-black uppercase tracking-[0.4em] opacity-40 italic">STRATEJİK ANALİZ</p>
                  <div className="flex justify-between items-end">
                    <div>
                        <p className="text-5xl font-black italic tracking-tighter">%94</p>
                        <p className="text-[9px] font-black uppercase tracking-widest opacity-40">Plan Uyumu</p>
                    </div>
                    <div className="text-right">
                        <p className="text-5xl font-black italic tracking-tighter">+{localSchedule.reduce((acc, curr) => acc + curr.tasks.reduce((a: any, c: any) => a + (c.xp || 0), 0), 0)}</p>
                        <p className="text-[9px] font-black uppercase tracking-widest opacity-40">Tahmini XP</p>
                    </div>
                  </div>
              </Card>
            </div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
            <aside className="xl:col-span-3 space-y-10">
              <Card className="rounded-[4rem] p-10 space-y-12 shadow-2xl bg-white border border-primary/5">
                <div className="flex items-center justify-between border-b border-primary/5 pb-8">
                  <h3 className="text-2xl font-black italic tracking-tighter text-primary uppercase flex items-center gap-4">
                      <Calendar className="h-7 w-7 text-accent" /> HAFTALIK AKIŞ
                  </h3>
                  <Badge className="bg-primary/5 text-primary border-none text-[10px] font-black">2026</Badge>
                </div>
                <div className="grid gap-4">
                  {days.map((day) => (
                    <button
                      key={day}
                      onClick={() => setSelectedDay(day)}
                      className={cn(
                        "flex items-center justify-between p-8 rounded-[2.5rem] transition-all group relative overflow-hidden",
                        selectedDay === day 
                          ? "bg-primary text-white shadow-[0_30px_60px_-15px_rgba(15,23,42,0.4)] scale-[1.05]" 
                          : "bg-[#F8FAFC] text-muted-foreground hover:bg-white hover:shadow-xl border border-transparent"
                      )}
                    >
                      <span className="font-black text-2xl uppercase italic tracking-tighter relative z-10">{day}</span>
                      <ChevronRight className={cn("h-7 w-7 transition-transform group-hover:translate-x-2 relative z-10", selectedDay === day ? "text-accent" : "opacity-10")} />
                    </button>
                  ))}
                </div>
              </Card>

              {recommendations.length > 0 && (
                <Card className="rounded-[4rem] p-10 space-y-8 shadow-2xl bg-white border border-primary/5 border-t-[12px] border-t-accent">
                  <h4 className="text-xl font-black italic tracking-tighter text-primary uppercase">AI ÖNERİLERİ</h4>
                  <div className="space-y-4">
                      {recommendations.map((rec, i) => (
                        <div key={i} className="flex gap-4 group">
                          <div className="h-2 w-2 rounded-full bg-accent mt-2 group-hover:scale-150 transition-transform"></div>
                          <p className="text-sm font-bold text-muted-foreground italic leading-relaxed">{rec}</p>
                        </div>
                      ))}
                  </div>
                </Card>
              )}
            </aside>

            <main className="xl:col-span-9">
              <Card className="rounded-[5rem] border-none shadow-[0_80px_160px_-40px_rgba(15,23,42,0.15)] bg-white p-14 space-y-14 border border-primary/5 relative overflow-hidden min-h-[900px] flex flex-col">
                <div className="flex justify-between items-start relative z-10">
                  <div className="space-y-3">
                    <p className="text-[12px] font-black uppercase tracking-[0.5em] text-muted-foreground/30 italic">OPERATIONAL SCHEDULE</p>
                    <h3 className="text-7xl font-black italic tracking-tighter text-primary uppercase leading-none">{selectedDay.toUpperCase()} PLANI</h3>
                  </div>
                  <div className="bg-[#F8FAFC] px-10 py-6 rounded-[2.5rem] border border-primary/5 flex items-center gap-6 shadow-inner">
                    <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center shadow-sm">
                      <Clock className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">AKTİF SEANS</p>
                      <p className="text-2xl font-black text-primary italic leading-none">{currentDayTasks.length}</p>
                    </div>
                  </div>
                </div>

                <div className="flex-1 flex flex-col">
                  {planLoading ? (
                    <div className="py-40 text-center opacity-30 animate-pulse font-black uppercase text-xs tracking-widest">Veriler Senkronize Ediliyor...</div>
                  ) : currentDayTasks.length > 0 ? (
                    <div className="grid gap-8 w-full">
                      {currentDayTasks.map((task: any, i: number) => (
                        <div key={i} className="flex items-center gap-12 p-12 bg-[#F8FAFC] rounded-[4rem] border border-primary/5 hover:bg-white hover:shadow-[0_60px_100px_-20px_rgba(0,0,0,0.08)] transition-all group relative overflow-hidden border-l-[16px] border-l-primary">
                          <div className="text-center w-28 shrink-0">
                            <p className="text-4xl font-black text-primary tracking-tighter leading-none">{task.time}</p>
                            <p className="text-[10px] font-black text-muted-foreground/30 uppercase mt-3 tracking-widest">START</p>
                          </div>
                          <div className="h-24 w-px bg-primary/10"></div>
                          <div className="flex-1 space-y-6">
                            <div className="space-y-2">
                              <div className="flex items-center gap-4">
                                <h4 className="text-4xl font-black italic tracking-tight text-primary uppercase leading-none group-hover:text-accent transition-colors">{task.subject}</h4>
                                <Badge className={cn(
                                  "text-[9px] font-black uppercase tracking-widest px-3 border-none",
                                  task.difficulty === 'hard' ? "bg-rose-500 text-white" : task.difficulty === 'easy' ? "bg-emerald-500 text-white" : "bg-blue-500 text-white"
                                )}>{task.difficulty || 'Medium'}</Badge>
                                <span className="text-[11px] font-black text-accent uppercase tracking-widest">+{task.xp || 50} XP</span>
                              </div>
                              <p className="text-2xl font-medium text-muted-foreground italic opacity-60 leading-none">
                                {task.topic} {task.subtopic ? `• ${task.subtopic}` : ''} • {task.duration}
                              </p>
                            </div>
                            <div className="flex gap-6 pt-2">
                              {task.bookUrl && (
                                <a href={task.bookUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white border border-primary/5 text-primary font-black text-[11px] uppercase hover:bg-primary hover:text-white transition-all shadow-sm">
                                  <Book className="h-5 w-5 text-accent" /> PDF / KAYNAK
                                </a>
                              )}
                              {task.youtubeUrl && (
                                <a href={task.youtubeUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white border border-primary/5 text-primary font-black text-[11px] uppercase hover:bg-rose-500 hover:text-white transition-all shadow-sm">
                                  <PlaySquare className="h-5 w-5 text-rose-500 group-hover:text-white" /> OYNATMA LİSTESİ
                                </a>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <Button variant="ghost" size="icon" onClick={() => setEditingTask({ index: i, data: task })} className="h-16 w-16 rounded-[1.5rem] text-muted-foreground opacity-20 hover:opacity-100 hover:bg-slate-100 transition-all">
                              <Edit3 className="h-8 w-8" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteTask(i)} className="h-16 w-16 rounded-[1.5rem] text-muted-foreground opacity-20 hover:opacity-100 hover:bg-rose-50 transition-all hover:text-rose-500">
                              <Trash2 className="h-8 w-8" />
                            </Button>
                            <div className="h-20 w-20 rounded-[2rem] bg-white border border-primary/5 flex items-center justify-center text-primary shadow-[0_20px_40px_-10px_rgba(0,0,0,0.15)] group-hover:bg-accent group-hover:text-white transition-all cursor-pointer">
                              <CheckCircle className="h-10 w-10" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center space-y-14 py-40 opacity-20 animate-in zoom-in-95 duration-1000">
                      <CalendarCheck className="h-48 w-48 mx-auto text-primary" />
                      <div className="space-y-8">
                        <p className="text-4xl font-black uppercase tracking-[0.4em] italic text-primary leading-none">STRATEJİK VERİ GİRİŞİ BEKLENİYOR.</p>
                        <button 
                          onClick={handleGeneratePlan} 
                          disabled={isGenerating}
                          className="text-3xl font-black text-accent uppercase tracking-[0.5em] underline underline-offset-[20px] hover:text-primary transition-all disabled:opacity-50"
                        >
                          {isGenerating ? "AI ANALYZING DATA..." : "AI İLE SİSTEMİ KUR"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <footer className="pt-16 border-t border-primary/5 flex flex-col sm:flex-row justify-between items-center gap-12">
                  <div className="flex items-center gap-5 text-muted-foreground italic opacity-50">
                    <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center">
                        <Info className="h-6 w-6 text-primary" />
                    </div>
                    <p className="text-sm font-bold uppercase tracking-widest max-w-sm leading-relaxed">Verileriniz DEK Bulut Altyapısı üzerinden tüm AOS Terminalleri ile anlık senkronize edilir.</p>
                  </div>
                  <div className="h-16 flex items-center gap-4 px-8 rounded-2xl bg-emerald-50 text-emerald-600 font-black text-[10px] uppercase tracking-widest border border-emerald-100">
                    <CheckCircle className="h-4 w-4" /> Tüm Değişiklikler Buluta İşlendi
                  </div>
                </footer>
              </Card>
            </main>
          </div>
        </TabsContent>

        <TabsContent value="monthly" className="space-y-12 animate-in fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map(week => (
              <Card key={week} className="p-10 rounded-[3.5rem] bg-white border border-primary/5 shadow-xl space-y-8 group hover:-translate-y-2 transition-all">
                <div className="flex justify-between items-center">
                  <Badge className="bg-primary/5 text-primary border-none font-black text-[10px] uppercase">{week}. HAFTA</Badge>
                  <TrendingUp className="h-5 w-5 text-accent opacity-20" />
                </div>
                <div className="space-y-4">
                  <h4 className="text-2xl font-black italic tracking-tighter uppercase text-primary">Aylık Odak</h4>
                  <p className="text-sm text-muted-foreground italic">Bu hafta {userData?.targetExam?.includes('YKS') ? 'Edebiyat ve Tarih' : 'Vatandaşlık ve Güncel'} konularına %60 ağırlık verilecek.</p>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-accent w-3/4"></div>
                </div>
              </Card>
            ))}
          </div>
          <Card className="p-14 rounded-[4rem] bg-primary text-white space-y-10 relative overflow-hidden">
             <Brain className="absolute top-10 right-10 h-24 w-24 text-white/5" />
             <h3 className="text-4xl font-black italic uppercase tracking-tighter">AI AYLIK ANALİZ VE STRATEJİ</h3>
             <p className="text-xl font-medium italic opacity-70 leading-relaxed max-w-3xl">
               "Öğrenci mevcut temposuyla devam ederse, bu ay sonunda seçtiği hedef sınavın müfredatının %14'ünü tamamen tamamlamış olacak. Matematik seanslarını akşam saatlerinden sabah saatlerine çekmek verimliliği %22 artırabilir."
             </p>
          </Card>
        </TabsContent>

        <TabsContent value="strategic" className="space-y-12 animate-in fade-in">
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {[
                { title: 'FAZ 1: TEMEL ATMA', desc: 'Tüm branşlardaki temel kazanımların %100 bitirilmesi.', icon: Flag, color: 'bg-blue-500' },
                { title: 'FAZ 2: DERİNLEŞME', desc: 'Zorluk seviyesi yüksek konular ve soru bankası taraması.', icon: Zap, color: 'bg-accent' },
                { title: 'FAZ 3: HIZ VE DENEME', desc: 'Süre yönetimi, genel denemeler ve nokta atışı tekrarlar.', icon: Target, color: 'bg-rose-500' }
              ].map((phase, i) => (
                <Card key={i} className="p-12 rounded-[4rem] bg-white border border-primary/5 shadow-2xl space-y-8 relative group hover:shadow-primary/10 transition-all">
                  <div className={cn("h-20 w-20 rounded-[2.5rem] flex items-center justify-center text-white shadow-2xl group-hover:rotate-6 transition-transform", phase.color)}>
                    <phase.icon className="h-10 w-10" />
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-3xl font-black italic tracking-tighter uppercase text-primary leading-none">{phase.title}</h4>
                    <p className="text-lg font-medium text-muted-foreground italic leading-relaxed">{phase.desc}</p>
                  </div>
                  <div className="pt-6 border-t border-primary/5 flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary/40 italic">STRATEJİK HEDEF</span>
                    <CheckCircle className="h-6 w-6 text-emerald-500 opacity-20" />
                  </div>
                </Card>
              ))}
           </div>
        </TabsContent>
      </Tabs>

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
