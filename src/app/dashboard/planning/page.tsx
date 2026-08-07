
'use client';

import { useUser, useDoc, useFirestore } from '@/firebase';
import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  Sparkles, 
  Brain, 
  Clock, 
  Zap, 
  CheckCircle2, 
  Plus, 
  ChevronRight, 
  ChevronLeft,
  Loader2,
  Save,
  Trash2,
  Timer
} from 'lucide-react';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { EXAM_CONFIGS } from '@/lib/exam-configs';

export default function PlanningPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const { data: userData } = useDoc<any>(user?.uid ? `users/${user.uid}` : null);
  const { data: studyPlan, loading: planLoading } = useDoc<any>(user?.uid ? `studyPlans/${user.uid}` : null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedDay, setSelectedDay] = useState('Pazartesi');

  const days = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];

  const currentDayTasks = useMemo(() => {
    return studyPlan?.schedule?.find((s: any) => s.day === selectedDay)?.tasks || [];
  }, [studyPlan, selectedDay]);

  const handleGeneratePlan = async () => {
    if (!db || !user || !userData) return;
    setIsGenerating(true);
    
    // Prototip: AI Simülasyonu ile Plan Oluşturma
    setTimeout(async () => {
      const examConfig = EXAM_CONFIGS[userData.targetExam || 'LGS'] || EXAM_CONFIGS['LGS'];
      const lessons = examConfig.lessons;

      const newSchedule = days.map(day => ({
        day,
        tasks: [
          { time: '09:00', subject: lessons[0], topic: 'Temel Kavramlar', duration: '45 dk', status: 'pending' },
          { time: '11:30', subject: lessons[1] || lessons[0], topic: 'Konu Analizi', duration: '60 dk', status: 'pending' },
          { time: '14:00', subject: 'Paragraf', topic: 'Hız Çalışması', duration: '30 dk', status: 'pending' },
          { time: '16:00', subject: lessons[2] || lessons[0], topic: 'Soru Çözümü', duration: '45 dk', status: 'pending' },
        ]
      }));

      try {
        await setDoc(doc(db, 'studyPlans', user.uid), {
          userId: user.uid,
          examId: userData.targetExam || 'LGS',
          schedule: newSchedule,
          updatedAt: serverTimestamp()
        });
        toast({
          title: 'Plan Oluşturuldu',
          description: 'Haftalık programınız AI tarafından optimize edildi.',
          className: "bg-primary text-white rounded-[2rem]"
        });
      } catch (e) {
        toast({ variant: 'destructive', title: 'Hata', description: 'Plan kaydedilemedi.' });
      } finally {
        setIsGenerating(false);
      }
    }, 2000);
  };

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
        <Button 
          onClick={handleGeneratePlan}
          disabled={isGenerating}
          className="h-20 px-10 rounded-[2rem] bg-primary hover:bg-accent transition-all duration-500 font-black text-sm uppercase tracking-widest gap-4 shadow-2xl shadow-primary/20"
        >
          {isGenerating ? <Loader2 className="h-7 w-7 animate-spin" /> : <Brain className="h-7 w-7 text-accent" />}
          AI İle Planı Optimize Et
        </Button>
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
                    <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl text-muted-foreground opacity-20 hover:opacity-100 hover:text-rose-500"><Trash2 className="h-5 w-5" /></Button>
                    <Button className="h-14 w-14 rounded-2xl bg-primary text-white shadow-xl group-hover:bg-accent transition-all group-hover:rotate-3">
                      <CheckCircle2 className="h-6 w-6" />
                    </Button>
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

            {currentDayTasks.length > 0 && (
              <div className="pt-8 border-t border-primary/5 flex justify-between items-center relative z-10">
                <p className="text-xs font-bold text-muted-foreground italic">* Planlanan her seans için AI Koçunuz 15dk önce bildirim gönderir.</p>
                <Button className="h-14 px-8 rounded-2xl bg-primary hover:bg-accent transition-all font-black text-xs uppercase tracking-widest gap-3 shadow-xl">
                  <Save className="h-5 w-5" /> Değişiklikleri Kaydet
                </Button>
              </div>
            )}
          </Card>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <Card className="rounded-[3rem] border-none shadow-xl bg-[#0F172A] p-10 text-white space-y-6 relative overflow-hidden">
                <Zap className="h-12 w-12 text-accent absolute top-8 right-8 opacity-20" />
                <h4 className="text-xl font-black italic uppercase tracking-widest">Haftalık Verimlilik</h4>
                <div className="space-y-4">
                   <div className="flex justify-between items-end">
                      <span className="text-4xl font-black italic">84%</span>
                      <span className="text-[10px] font-bold opacity-40 uppercase">Plan Uyumu</span>
                   </div>
                   <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-accent transition-all duration-1000" style={{ width: '84%' }}></div>
                   </div>
                </div>
             </Card>
             <Card className="rounded-[3rem] border-none shadow-xl bg-accent p-10 text-primary space-y-6 relative overflow-hidden">
                <Timer className="h-12 w-12 text-white absolute top-8 right-8 opacity-20" />
                <h4 className="text-xl font-black italic uppercase tracking-widest">Odaklanma Süresi</h4>
                <div className="space-y-4">
                   <div className="flex justify-between items-end">
                      <span className="text-4xl font-black italic">14.5s</span>
                      <span className="text-[10px] font-bold opacity-40 uppercase">Bu Hafta Toplam</span>
                   </div>
                   <div className="h-2 w-full bg-primary/10 rounded-full overflow-hidden">
                      <div className="h-full bg-primary transition-all duration-1000" style={{ width: '65%' }}></div>
                   </div>
                </div>
             </Card>
          </section>
        </main>
      </div>
    </div>
  );
}
