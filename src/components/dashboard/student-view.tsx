'use client';

import { useDoc, useFirestore } from '@/firebase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Sparkles, 
  ChevronRight, 
  Target, 
  Activity, 
  Brain, 
  CheckCircle2, 
  Calendar,
  Loader2,
  Clock,
  PlayCircle,
  PauseCircle,
  RotateCcw,
  Zap
} from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

export function StudentView({ user, userData, isReadOnly = false }: { user: any, userData: any, isReadOnly?: boolean }) {
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  
  const today = format(new Date(), 'yyyy-MM-dd');
  const { data: studyPlan, loading: planLoading } = useDoc<any>(user?.uid ? `studyPlans/${user.uid}` : null);
  
  // Timer State (Focus Modülü için)
  const [timeLeft, setTimeLeft] = useState(45 * 60);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentDayPlan = useMemo(() => {
    if (!studyPlan?.masterPlan) return null;
    return studyPlan.masterPlan.find((p: any) => p.date === today);
  }, [studyPlan, today]);

  const progress = useMemo(() => {
    if (!currentDayPlan || !currentDayPlan.tasks?.length) return 0;
    const completed = currentDayPlan.tasks.filter((t: any) => t.status === 'completed').length;
    return Math.round((completed / currentDayPlan.tasks.length) * 100);
  }, [currentDayPlan]);

  const handleToggleTask = (taskId: string) => {
    if (!db || !user || !studyPlan || isReadOnly) return;
    
    const newMasterPlan = studyPlan.masterPlan.map((p: any) => {
      if (p.date === today) {
        return {
          ...p,
          tasks: p.tasks.map((t: any) => t.id === taskId ? { ...t, status: t.status === 'completed' ? 'pending' : 'completed' } : t)
        };
      }
      return p;
    });

    const planRef = doc(db, 'studyPlans', user.uid);
    updateDoc(planRef, { masterPlan: newMasterPlan, updatedAt: serverTimestamp() })
      .catch(async (err) => {
        const permissionError = new FirestorePermissionError({
          path: planRef.path,
          operation: 'update',
          requestResourceData: { masterPlan: 'task_toggle' },
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      });
  };

  if (planLoading) return (
    <div className="p-20 flex flex-col items-center justify-center gap-6 min-h-[60vh]">
      <Loader2 className="h-12 w-12 animate-spin text-accent" />
      <p className="text-xs font-black uppercase tracking-[0.4em] text-primary/40 italic">Terminal Hazırlanıyor...</p>
    </div>
  );

  return (
    <div className="p-8 lg:p-14 space-y-12 max-w-[1800px] mx-auto w-full animate-in fade-in duration-1000">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* LEFT COLUMN: Header & Plan */}
        <div className="lg:col-span-8 space-y-12">
          
          {/* HEADER SECTION (GÜNAYDIN & PROGRESS) */}
          <section className="flex flex-col md:flex-row gap-10 items-center justify-between bg-white rounded-[4rem] p-12 shadow-[0_40px_80px_-20px_rgba(15,23,42,0.08)] border border-primary/5 relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-accent/10 transition-all duration-1000" />
             <div className="space-y-6 relative z-10 flex-1">
                <div className="flex items-center gap-3">
                   <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                   <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/30 italic">AOS v4.8 Stable Engine</span>
                </div>
                <h1 className="text-7xl font-black text-primary tracking-tighter italic uppercase leading-[0.8] text-shadow-deep">
                   GÜNAYDIN, <br />
                   <span className="text-accent text-shadow-accent">{userData?.displayName?.split(' ')[0] || 'ÖĞRENCİ'} 👋</span>
                </h1>
                <p className="text-lg font-bold text-muted-foreground italic">
                   Bugün için bekleyen <span className="text-primary">{currentDayPlan?.tasks?.length || 0} kritik görev</span> var.
                </p>
                <div className="flex gap-4 pt-4">
                   <Button onClick={() => router.push('/dashboard/planning')} className="h-14 px-8 rounded-2xl bg-primary text-white font-black text-[10px] uppercase tracking-widest shadow-2xl gap-3">
                      <Calendar className="h-4 w-4" /> TAM AKIŞ
                   </Button>
                   <Button variant="outline" className="h-14 px-8 rounded-2xl border-2 font-black text-[10px] uppercase tracking-widest text-primary/40 hover:bg-slate-50 transition-all">
                      YENİ GÖREV +
                   </Button>
                </div>
             </div>

             <div className="relative h-48 w-48 shrink-0 flex items-center justify-center group/progress">
                <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                   <circle cx="50" cy="50" r="42" fill="none" stroke="#F1F5F9" strokeWidth="12" />
                   <circle 
                     cx="50" cy="50" r="42" fill="none" 
                     stroke="#F59E0B" strokeWidth="12" 
                     strokeDasharray="264" 
                     strokeDashoffset={264 - (264 * progress) / 100} 
                     strokeLinecap="round" 
                     className="drop-shadow-[0_0_15px_rgba(245,158,11,0.5)] transition-all duration-1000" 
                   />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                   <span className="text-5xl font-black text-primary italic tracking-tighter text-shadow-deep">%{progress}</span>
                   <span className="text-[8px] font-black uppercase tracking-widest opacity-40">TAMAMLANDI</span>
                </div>
             </div>
          </section>

          {/* TODAY'S PLAN SECTION */}
          <section className="space-y-10">
             <div className="flex items-center gap-6 px-4">
                <div className="h-10 w-10 rounded-2xl bg-accent/10 flex items-center justify-center">
                   <Calendar className="h-5 w-5 text-accent" />
                </div>
                <h2 className="text-4xl font-black italic tracking-tighter text-primary uppercase leading-none">BUGÜNKÜ PLAN</h2>
             </div>

             <div className="grid gap-6">
                {currentDayPlan?.tasks?.map((t: any, i: number) => (
                  <Card key={i} className={cn(
                    "group p-10 rounded-[3.5rem] border-none shadow-[0_20px_40px_-10px_rgba(15,23,42,0.06)] hover:shadow-[0_40px_80px_-20px_rgba(15,23,42,0.12)] transition-all hover:scale-[1.01] bg-white flex items-center justify-between",
                    t.status === 'completed' && "opacity-50"
                  )}>
                    <div className="flex items-center gap-10">
                       <span className="text-2xl font-black text-primary/20 italic tracking-tighter font-mono">{t.time || '09:00'}</span>
                       <div className="h-1.5 w-12 rounded-full bg-slate-100" />
                       <div className="space-y-1">
                          <h4 className="text-3xl font-black italic tracking-tight text-primary uppercase leading-none">{t.subject}</h4>
                          <p className="text-sm font-bold text-muted-foreground italic opacity-60 uppercase tracking-widest">{t.topic}</p>
                       </div>
                    </div>
                    <Button 
                      size="icon" 
                      onClick={() => handleToggleTask(t.id)} 
                      className={cn(
                        "h-16 w-16 rounded-[2.25rem] shadow-2xl transition-all",
                        t.status === 'completed' ? "bg-emerald-500 text-white" : "bg-primary text-white hover:bg-accent"
                      )}
                    >
                       {t.status === 'completed' ? <CheckCircle2 className="h-8 w-8" /> : <Play className="h-8 w-8 fill-current" />}
                    </Button>
                  </Card>
                ))}
                {!currentDayPlan && (
                  <Card onClick={() => router.push('/dashboard/planning')} className="p-32 text-center bg-white/50 rounded-[5rem] border-4 border-dashed border-primary/10 flex flex-col items-center gap-8 cursor-pointer hover:bg-white hover:border-primary/20 transition-all group">
                     <Sparkles className="h-16 w-16 text-accent opacity-20 group-hover:scale-110 transition-transform" />
                     <p className="text-xl font-black uppercase tracking-[0.4em] text-primary/20 italic">HENÜZ PLAN OLUŞTURULMADI</p>
                     <Button className="h-16 px-12 rounded-2xl bg-primary font-black text-xs uppercase tracking-widest gap-4 shadow-2xl">ANKETİ BAŞLAT <ChevronRight className="h-5 w-5" /></Button>
                  </Card>
                )}
             </div>
          </section>
        </div>

        {/* RIGHT COLUMN: AI & Focus */}
        <div className="lg:col-span-4 space-y-12">
          
          {/* ORANGE AI CARD */}
          <Card className="rounded-[4rem] border-none shadow-[0_60px_120px_-30px_rgba(245,158,11,0.2)] bg-accent text-primary p-14 relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2" />
             <div className="relative z-10 space-y-10">
                <div className="space-y-4">
                   <Badge className="bg-primary/10 text-primary border-none font-black text-[10px] uppercase tracking-widest">AKADEMİK TAVSİYE</Badge>
                   <h3 className="text-4xl font-black italic tracking-tighter uppercase leading-none">AI BUGÜN <br />NE DİYOR?</h3>
                </div>
                <p className="text-xl font-bold italic leading-relaxed text-primary/80">
                   "Bugün Matematik ve Türkçe arasındaki çalışma dengeni korumalısın. Akşam saatleri deneme analizi için en verimli dilim olarak saptandı."
                </p>
                <Button className="w-full h-20 rounded-[2rem] bg-primary hover:bg-black text-white font-black text-xs uppercase tracking-widest gap-4 shadow-2xl group/btn">
                   <Zap className="h-6 w-6 text-accent group-hover/btn:animate-pulse" /> ANALİZİ DERİNLEŞTİR
                </Button>
             </div>
          </Card>

          {/* FOCUS TERMINAL */}
          <Card className="p-12 rounded-[4rem] border-none shadow-[0_40px_80px_-20px_rgba(15,23,42,0.1)] bg-white space-y-10 relative overflow-hidden group">
             <div className="flex items-center justify-between">
                <h4 className="text-2xl font-black italic tracking-tighter uppercase text-primary">ODAKLANMA</h4>
                <Clock className="h-6 w-6 text-primary opacity-20" />
             </div>
             
             <div className="text-center py-10">
                <p className="text-[9rem] font-black text-primary tracking-tighter leading-none italic tabular-nums group-hover:scale-105 transition-transform duration-700">
                   {formatTime(timeLeft)}
                </p>
             </div>

             <div className="flex gap-4">
                <Button 
                  onClick={() => setIsActive(!isActive)}
                  className={cn(
                    "flex-1 h-20 rounded-3xl font-black text-xs uppercase tracking-widest gap-4 transition-all shadow-xl",
                    isActive ? "bg-destructive hover:bg-rose-700 text-white" : "bg-primary hover:bg-accent text-white"
                  )}
                >
                   {isActive ? <PauseCircle className="h-6 w-6" /> : <PlayCircle className="h-6 w-6" />}
                   {isActive ? 'DURDUR' : 'BAŞLAT'}
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => { setTimeLeft(45 * 60); setIsActive(false); }}
                  className="h-20 w-20 rounded-3xl border-2 hover:bg-slate-50 transition-all"
                >
                   <RotateCcw className="h-6 w-6 text-primary/40" />
                </Button>
             </div>

             <div className="p-8 bg-[#F8FAFC] rounded-[2.5rem] border border-primary/5 flex items-center gap-6">
                <div className="h-12 w-12 rounded-2xl bg-white shadow-sm flex items-center justify-center">
                   <Target className="h-6 w-6 text-accent" />
                </div>
                <div className="space-y-1">
                   <p className="text-[10px] font-black uppercase tracking-widest opacity-40 leading-none">Hedef Seans</p>
                   <p className="text-lg font-black text-primary italic leading-none">45 Dakika</p>
                </div>
             </div>
          </Card>

          {/* STATUS CARD */}
          <Card className="p-10 rounded-[3.5rem] border-none shadow-2xl bg-[#0F172A] text-white relative overflow-hidden">
             <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-accent/5 blur-[80px] rounded-full" />
             <div className="relative z-10 flex items-center justify-between">
                <div className="space-y-2">
                   <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 italic">AOS OPERATIONAL STATUS</p>
                   <h4 className="text-2xl font-black italic tracking-tighter uppercase text-white">SİSTEM STABİL</h4>
                </div>
                <Activity className="h-8 w-8 text-emerald-500 animate-pulse" />
             </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
