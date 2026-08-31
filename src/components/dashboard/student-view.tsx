
'use client';

import { useDoc, useFirestore } from '@/firebase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Play, Sparkles, ChevronRight, Target, Activity, 
  Brain, CheckCircle2, Calendar, Loader2, Clock, 
  Zap, Plus, TrendingUp, BookOpen, BarChart3, Star,
  Award
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { AcademicSessionDialog } from '@/components/academic-session-dialog';

export function StudentView({ user, userData }: { user: any, userData: any }) {
  const db = useFirestore();
  const router = useRouter();
  
  const today = format(new Date(), 'yyyy-MM-dd');
  const { data: studyPlan, loading: planLoading } = useDoc<any>(user?.uid ? `studyPlans/${user.uid}` : null);
  
  const [isAddingTask, setIsAddingTask] = useState(false);

  const stats = useMemo(() => {
    if (!studyPlan) return { hours: 0, topics: 0, questions: 0, tests: 0 };
    return {
      hours: (studyPlan.totalMinutes || 0) / 60,
      topics: Object.values(userData?.completedTopics || {}).flat().length,
      questions: studyPlan.totalQuestions || 0,
      tests: studyPlan.totalTests || 0
    };
  }, [studyPlan, userData]);

  const currentDayPlan = useMemo(() => {
    if (!studyPlan?.masterPlan) return null;
    return studyPlan.masterPlan.find((p: any) => p.date === today);
  }, [studyPlan, today]);

  const progress = useMemo(() => {
    if (!currentDayPlan || !currentDayPlan.tasks?.length) return 0;
    const completed = currentDayPlan.tasks.filter((t: any) => t.status === 'completed').length;
    return Math.round((completed / currentDayPlan.tasks.length) * 100);
  }, [currentDayPlan]);

  if (planLoading) return (
    <div className="p-20 flex flex-col items-center justify-center gap-6 min-h-[60vh]">
      <Loader2 className="h-12 w-12 animate-spin text-accent" />
      <p className="text-xs font-black uppercase tracking-[0.4em] text-primary/40 italic">Veriler Senkronize Ediliyor...</p>
    </div>
  );

  return (
    <div className="p-8 lg:p-14 space-y-12 max-w-[1800px] mx-auto w-full animate-in fade-in duration-1000 bg-[#F8FAFC]">
      {/* AI Asistan Kutusu (TM PRO Stil) */}
      <section className="bg-gradient-to-br from-primary/5 to-secondary/5 border border-secondary/30 rounded-[2.5rem] p-10 relative overflow-hidden group shadow-sm">
        <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/5 blur-[100px] rounded-full" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="space-y-4 flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 text-primary font-black text-[11px] uppercase tracking-widest">
              <Brain className="h-4 w-4 text-secondary" /> YAPAY ZEKA ASİSTANI
            </div>
            <p className="text-xl font-bold text-slate-800 italic leading-relaxed">
              "{stats.topics < 10 ? '🌱 Konu tamamlama oranın henüz başlangıç aşamasında. Öncelikle temel matematik konularına odaklanalım.' : '🎯 Verilerin iyi görünüyor, Edebiyat netlerini artırmak için denemelere ağırlık verebiliriz.'}"
            </p>
            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
               <Button size="sm" className="bg-secondary hover:bg-secondary/90 rounded-xl px-6 font-bold uppercase text-[10px] tracking-widest shadow-lg shadow-secondary/20" onClick={() => router.push('/dashboard/planning?tab=yearly')}>📋 AI PLAN ÖNERİSİ</Button>
               <Button size="sm" variant="outline" className="rounded-xl px-6 font-bold uppercase text-[10px] tracking-widest bg-white" onClick={() => router.push('/dashboard/ai-analysis')}>🔍 AI ANALİZ RAPORU</Button>
            </div>
          </div>
          <div className="hidden xl:block h-32 w-px bg-secondary/20 mx-10" />
          <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
             <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center shadow-sm">
                <p className="text-2xl font-black text-secondary leading-none">{stats.hours.toFixed(1)}</p>
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1">TOPLAM ÇALIŞMA</p>
             </div>
             <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center shadow-sm">
                <p className="text-2xl font-black text-primary leading-none">{stats.topics}</p>
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1">KONU BİTTİ</p>
             </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        <div className="lg:col-span-8 space-y-12">
          {/* Hoşgeldin ve Progress */}
          <section className="bg-white rounded-[3.5rem] p-12 shadow-xl border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-10">
             <div className="space-y-6 flex-1 text-center md:text-left">
                <h1 className="text-6xl font-black text-primary tracking-tighter italic uppercase leading-[0.85] bg-gradient-to-br from-primary to-secondary bg-clip-text text-transparent">
                   GÜNAYDIN, <br />
                   {userData?.displayName?.split(' ')[0] || 'ÖĞRENCİ'} 👋
                </h1>
                <p className="text-lg font-bold text-muted-foreground italic">
                   Yıllık planına göre bugün tamamlaman gereken <span className="text-secondary">{currentDayPlan?.tasks?.length || 0} kritik görev</span> bulunuyor.
                </p>
                <div className="flex gap-4 pt-4 justify-center md:justify-start">
                   <Button onClick={() => router.push('/dashboard/planning')} className="h-14 px-8 rounded-2xl bg-primary text-white font-black text-[10px] uppercase tracking-widest shadow-2xl gap-3">
                      <Zap className="h-4 w-4 text-secondary" /> PLANI YÖNET
                   </Button>
                   <Button onClick={() => setIsAddingTask(true)} variant="outline" className="h-14 px-8 rounded-2xl border-2 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all">
                      <Plus className="h-4 w-4 mr-2" /> MANUEL EKLE
                   </Button>
                </div>
             </div>

             <div className="relative h-44 w-44 shrink-0 flex items-center justify-center">
                <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                   <circle cx="50" cy="50" r="42" fill="none" stroke="#F1F5F9" strokeWidth="12" />
                   <circle 
                     cx="50" cy="50" r="42" fill="none" 
                     stroke="url(#grad)" strokeWidth="12" 
                     strokeDasharray="264" 
                     strokeDashoffset={264 - (264 * progress) / 100} 
                     strokeLinecap="round" 
                     className="transition-all duration-1000" 
                   />
                   <defs>
                      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                         <stop offset="0%" stopColor="var(--primary)" />
                         <stop offset="100%" stopColor="var(--secondary)" />
                      </linearGradient>
                   </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                   <span className="text-4xl font-black text-primary italic">%{progress}</span>
                   <span className="text-[8px] font-black uppercase tracking-widest opacity-40">GÜNLÜK HEDEF</span>
                </div>
             </div>
          </section>

          {/* Bugünkü Plan */}
          <section className="space-y-8">
             <div className="flex items-center justify-between px-6">
                <h2 className="text-3xl font-black italic tracking-tighter text-primary uppercase">GÜNLÜK PROGRAM</h2>
                <Badge variant="outline" className="rounded-xl px-4 py-1.5 font-bold uppercase text-[9px] tracking-widest bg-white shadow-sm">{format(new Date(), 'd MMMM yyyy')}</Badge>
             </div>

             <div className="grid gap-4">
                {currentDayPlan?.tasks?.map((t: any, i: number) => (
                  <Card key={i} className={cn(
                    "group p-8 rounded-[2.5rem] border border-slate-100 shadow-lg hover:shadow-2xl hover:scale-[1.01] transition-all bg-white flex items-center justify-between",
                    t.status === 'completed' && "opacity-50"
                  )}>
                    <div className="flex items-center gap-8">
                       <span className="text-xl font-black text-slate-300 italic tracking-tighter font-mono">{t.time || '09:00'}</span>
                       <div className="h-10 w-px bg-slate-100" />
                       <div className="space-y-1">
                          <h4 className="text-2xl font-black italic tracking-tight text-primary uppercase leading-none">{t.subject}</h4>
                          <p className="text-xs font-bold text-muted-foreground italic opacity-60 uppercase tracking-widest">{t.topic}</p>
                       </div>
                    </div>
                    <Button size="icon" className={cn("h-14 w-14 rounded-2xl shadow-xl", t.status === 'completed' ? "bg-emerald-500 text-white" : "bg-secondary text-white hover:bg-primary")}>
                       {t.status === 'completed' ? <CheckCircle2 className="h-6 w-6" /> : <Play className="h-6 w-6 fill-current" />}
                    </Button>
                  </Card>
                ))}
                {!currentDayPlan && (
                  <Card onClick={() => router.push('/dashboard/select-exam')} className="p-24 text-center bg-white/50 rounded-[4rem] border-4 border-dashed border-slate-200 flex flex-col items-center gap-6 cursor-pointer hover:bg-white hover:border-secondary/20 transition-all group">
                     <Sparkles className="h-12 w-12 text-secondary opacity-20 group-hover:scale-110 transition-transform" />
                     <p className="text-xl font-black uppercase tracking-[0.3em] text-primary/20 italic">HENÜZ YILLIK PLAN OLUŞTURULMADI</p>
                     <Button className="h-14 px-10 rounded-2xl bg-primary font-black text-xs uppercase tracking-widest gap-4 shadow-2xl">HEDEF BELİRLE VE BAŞLA <ChevronRight className="h-4 w-4" /></Button>
                  </Card>
                )}
             </div>
          </section>
        </div>

        <div className="lg:col-span-4 space-y-12">
          {/* Grafik Alanı (Weekly Study) */}
          <Card className="rounded-[3rem] p-10 bg-white border border-slate-100 shadow-xl space-y-8">
             <div className="flex items-center justify-between">
                <h4 className="text-xl font-black italic tracking-tighter uppercase text-primary">ÇALIŞMA TRENDİ</h4>
                <BarChart3 className="h-6 w-6 text-secondary opacity-20" />
             </div>
             <div className="h-48 flex items-end gap-3 px-2">
                {[40, 70, 50, 90, 60, 80, 75].map((h, i) => (
                   <div key={i} className="flex-1 bg-slate-50 rounded-xl relative group/bar">
                      <div className="absolute bottom-0 w-full bg-secondary rounded-xl transition-all duration-1000 group-hover/bar:bg-primary" style={{ height: `${h}%` }} />
                   </div>
                ))}
             </div>
             <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="text-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                   <p className="text-[9px] font-black text-muted-foreground uppercase mb-1">HAFTALIK NET</p>
                   <p className="text-2xl font-black text-primary italic">+4.5</p>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                   <p className="text-[9px] font-black text-muted-foreground uppercase mb-1">STRATEJİ</p>
                   <p className="text-2xl font-black text-emerald-500 italic">İYİ</p>
                </div>
             </div>
          </Card>

          {/* Pomodoro & Odaklanma (TM PRO Stil) */}
          <Card className="rounded-[3rem] p-10 bg-[#1a3a5f] text-white space-y-10 shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-48 h-48 bg-secondary/10 blur-[60px] rounded-full" />
             <div className="flex items-center justify-between relative z-10">
                <h4 className="text-xl font-black italic tracking-tighter uppercase">ODAKLANMA</h4>
                <Clock className="h-6 w-6 text-secondary animate-pulse" />
             </div>
             <div className="text-center py-6 relative z-10">
                <p className="text-[6rem] font-black text-white tracking-tighter leading-none italic tabular-nums text-shadow-deep">25:00</p>
             </div>
             <div className="flex gap-4 relative z-10">
                <Button className="flex-1 h-16 rounded-2xl bg-secondary hover:bg-secondary/90 text-white font-black text-xs uppercase tracking-widest gap-3 shadow-xl">
                   <Play className="h-5 w-5 fill-current" /> BAŞLAT
                </Button>
                <Button variant="ghost" size="icon" className="h-16 w-16 rounded-2xl border-2 border-white/10 hover:bg-white/5">
                   <Plus className="h-6 w-6" />
                </Button>
             </div>
          </Card>

          {/* Ödüller & Rozetler */}
          <Card className="rounded-[3rem] p-10 bg-white border border-slate-100 shadow-xl space-y-8">
             <div className="flex items-center justify-between">
                <h4 className="text-xl font-black italic tracking-tighter uppercase text-primary">ROZETLERİM</h4>
                <Award className="h-6 w-6 text-secondary opacity-20" />
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
                   <span className="text-secondary">740 / 1000 XP</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                   <div className="h-full bg-gradient-to-r from-primary to-secondary transition-all" style={{ width: '74%' }} />
                </div>
             </div>
          </Card>
        </div>
      </div>

      <AcademicSessionDialog 
        isOpen={isAddingTask}
        onOpenChange={setIsAddingTask}
        onSave={(data) => console.log('Saving task:', data)}
        selectedDay={format(new Date(), 'EEEE')}
      />
    </div>
  );
}
