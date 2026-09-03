
'use client';

import { useDoc, useFirestore } from '@/firebase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Play, Sparkles, ChevronRight, Target, Activity, 
  Brain, CheckCircle2, Calendar, Loader2, Clock, 
  Zap, Plus, TrendingUp, BookOpen, BarChart3, Star,
  Award, RefreshCcw, FastForward, Gauge, Edit3, Trash2
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
import { AcademicSessionDialog } from '@/components/academic-session-dialog';
import { doc, updateDoc } from 'firebase/firestore';

export function StudentView({ user, userData }: { user: any, userData: any }) {
  const db = useFirestore();
  const router = useRouter();
  
  const today = format(new Date(), 'yyyy-MM-dd');
  const dayName = format(new Date(), 'EEEE', { locale: tr });
  const { data: studyPlan, loading: planLoading } = useDoc<any>(user?.uid ? `studyPlans/${user.uid}` : null);
  
  const [isAddingTask, setIsAddingTask] = useState(false);

  const dayColors: Record<string, string> = {
    'Pazartesi': 'border-t-[6px] border-t-rose-500',
    'Salı': 'border-t-[6px] border-t-orange-500',
    'Çarşamba': 'border-t-[6px] border-t-emerald-500',
    'Perşembe': 'border-t-[6px] border-t-blue-500',
    'Cuma': 'border-t-[6px] border-t-purple-500',
    'Cumartesi': 'border-t-[6px] border-t-teal-500',
    'Pazar': 'border-t-[6px] border-t-pink-500',
  };

  const currentDayPlan = useMemo(() => {
    if (!studyPlan?.masterPlan) return null;
    return studyPlan.masterPlan.find((p: any) => p.date === today);
  }, [studyPlan, today]);

  const completeTask = async (taskId: string) => {
    if (!db || !user || !studyPlan) return;
    const newPlan = studyPlan.masterPlan.map((day: any) => {
      if (day.date === today) {
        return {
          ...day,
          tasks: day.tasks.map((t: any) => t.id === taskId ? { ...t, status: t.status === 'done' ? 'planned' : 'done' } : t)
        };
      }
      return day;
    });
    await updateDoc(doc(db, 'studyPlans', user.uid), { masterPlan: newPlan });
  };

  if (planLoading) return (
    <div className="p-20 flex flex-col items-center justify-center gap-6 min-h-[60vh]">
      <Loader2 className="h-12 w-12 animate-spin text-accent" />
      <p className="text-xs font-black uppercase tracking-[0.4em] text-primary/40 italic">Terminal Senkronize Ediliyor...</p>
    </div>
  );

  return (
    <div className="p-8 lg:p-14 space-y-12 max-w-[1800px] mx-auto w-full animate-in fade-in duration-1000 bg-[#F8FAFC]">
      <section className="bg-primary text-white rounded-[3rem] p-10 relative overflow-hidden group shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 blur-[100px] rounded-full" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="space-y-4 flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 text-accent font-black text-[11px] uppercase tracking-widest">
              <Brain className="h-4 w-4 animate-pulse" /> AOS YAPAY ZEKA ASİSTANI
            </div>
            <p className="text-2xl font-bold italic leading-relaxed">
               "Bugün {currentDayPlan?.tasks?.length || 0} kritik fasikül görevin var. 3 saatlik döngü ile verimini %40 artırabilirsin."
            </p>
          </div>
          <Button onClick={() => router.push('/dashboard/planning')} className="bg-accent hover:bg-white hover:text-primary transition-all rounded-[1.5rem] h-16 px-10 font-black uppercase text-[12px] tracking-widest shadow-2xl">HAFTALIK PLANI GÖR</Button>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-9 space-y-10">
          <div className="flex items-center justify-between">
             <h2 className="text-4xl font-black italic tracking-tighter text-primary uppercase">BUGÜNKÜ FASİKÜLÜN</h2>
             <Badge className="bg-white text-primary border-2 border-slate-100 rounded-xl px-4 py-2 font-black uppercase text-[10px] tracking-widest shadow-sm">{format(new Date(), 'd MMMM yyyy', { locale: tr })}</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
             {currentDayPlan?.tasks?.map((t: any) => (
                <Card key={t.id} className={cn(
                  "aspect-square p-10 rounded-[3.5rem] border-2 bg-white flex flex-col justify-between transition-all hover:shadow-[0_40px_80px_-20px_rgba(15,23,42,0.15)] hover:-translate-y-4 group",
                  dayColors[dayName],
                  t.status === 'done' && "opacity-50 grayscale"
                )}>
                   <div className="space-y-6">
                      <div className="flex justify-between items-start">
                         <span className="text-[11px] font-black uppercase bg-primary/5 text-primary px-3 py-1 rounded-full">{t.type}</span>
                         <span className="text-[12px] font-black text-accent tracking-tighter italic">{t.time}</span>
                      </div>
                      <div className="space-y-2">
                         <h4 className="text-2xl font-black text-primary leading-[1.1] uppercase tracking-tighter italic">📋 {t.lesson}</h4>
                         <p className="text-[11px] font-bold text-muted-foreground italic opacity-60 leading-relaxed">{t.topic}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                         <span className="badge bg-slate-50 text-[10px] font-black px-3 py-1.5 rounded-xl">🟡 {t.difficulty}</span>
                         <span className="badge bg-slate-50 text-[10px] font-black px-3 py-1.5 rounded-xl">⏱️ {t.duration}dk</span>
                         {t.questionTarget > 0 && <span className="badge bg-slate-50 text-[10px] font-black px-3 py-1.5 rounded-xl">📝 {t.questionTarget} soru</span>}
                      </div>
                   </div>
                   <div className="grid grid-cols-3 gap-3 pt-6 border-t border-slate-50">
                      <Button size="icon" onClick={() => completeTask(t.id)} className={cn("h-12 w-12 rounded-2xl shadow-xl", t.status === 'done' ? "bg-emerald-500" : "bg-primary")}>
                         <CheckCircle2 className="h-5 w-5" />
                      </Button>
                      <Button size="icon" variant="outline" className="h-12 w-12 rounded-2xl hover:bg-slate-50 border-2"><RefreshCcw className="h-5 w-5" /></Button>
                      <Button size="icon" variant="outline" className="h-12 w-12 rounded-2xl hover:bg-slate-50 border-2"><FastForward className="h-5 w-5" /></Button>
                      <Button size="icon" variant="outline" className="h-12 w-12 rounded-2xl hover:bg-slate-50 border-2"><Gauge className="h-5 w-5" /></Button>
                      <Button size="icon" variant="outline" className="h-12 w-12 rounded-2xl hover:bg-slate-50 border-2"><Edit3 className="h-5 w-5" /></Button>
                      <Button size="icon" variant="outline" className="h-12 w-12 rounded-2xl text-destructive border-2 hover:bg-destructive/5"><Trash2 className="h-5 w-5" /></Button>
                   </div>
                </Card>
             ))}
             {!currentDayPlan && (
                <Card onClick={() => router.push('/dashboard/planning')} className="aspect-square p-12 text-center bg-white/50 rounded-[4rem] border-4 border-dashed border-slate-200 flex flex-col items-center justify-center gap-6 cursor-pointer hover:bg-white hover:border-accent/20 transition-all group">
                   <Zap className="h-16 w-16 text-accent opacity-20 group-hover:scale-110 transition-transform animate-pulse" />
                   <p className="text-xl font-black uppercase tracking-[0.3em] text-primary/20 italic">FASİKÜL PLANI BEKLENİYOR</p>
                   <Button className="h-14 px-10 rounded-2xl bg-primary font-black text-[10px] uppercase tracking-widest gap-4 shadow-2xl">PLANI OLUŞTUR VE BAŞLA</Button>
                </Card>
             )}
          </div>
        </div>

        <div className="lg:col-span-3 space-y-10">
           <Card className="rounded-[3rem] p-10 bg-[#1a3a5f] text-white space-y-10 shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-48 h-48 bg-accent/10 blur-[60px] rounded-full" />
             <div className="flex items-center justify-between relative z-10">
                <h4 className="text-xl font-black italic tracking-tighter uppercase">ODAKLANMA</h4>
                <Clock className="h-6 w-6 text-accent animate-pulse" />
             </div>
             <div className="text-center py-6 relative z-10">
                <p className="text-[5.5rem] font-black text-white tracking-tighter leading-none italic tabular-nums text-shadow-deep">25:00</p>
             </div>
             <div className="flex gap-4 relative z-10">
                <Button className="flex-1 h-16 rounded-2xl bg-accent hover:bg-accent/90 text-primary font-black text-[10px] uppercase tracking-widest gap-3 shadow-xl">
                   BAŞLAT
                </Button>
                <Button variant="ghost" size="icon" className="h-16 w-16 rounded-2xl border-2 border-white/10 hover:bg-white/5">
                   <Plus className="h-6 w-6" />
                </Button>
             </div>
           </Card>

           <Card className="rounded-[3rem] p-10 bg-white border border-slate-100 shadow-xl space-y-8">
             <div className="flex items-center justify-between">
                <h4 className="text-xl font-black italic tracking-tighter uppercase text-primary">ROZETLERİM</h4>
                <Award className="h-6 w-6 text-accent opacity-20" />
             </div>
             <div className="flex flex-wrap gap-4 justify-center">
                {['📝', '🏆', '⏱️', '📚'].map((icon, i) => (
                   <div key={i} className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center text-2xl shadow-inner border border-slate-100 hover:scale-110 transition-all cursor-pointer grayscale hover:grayscale-0">
                      {icon}
                   </div>
                ))}
             </div>
             <div className="pt-4 space-y-2">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground italic">
                   <span>SEVİYE 4</span>
                   <span className="text-accent">740 / 1000 XP</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                   <div className="h-full bg-gradient-to-r from-primary to-accent transition-all" style={{ width: '74%' }} />
                </div>
             </div>
          </Card>
        </div>
      </div>

      <AcademicSessionDialog 
        isOpen={isAddingTask}
        onOpenChange={setIsAddingTask}
        onSave={(data) => console.log('Saving task:', data)}
        selectedDay={dayName}
      />
    </div>
  );
}
