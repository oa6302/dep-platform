
'use client';

import { useDoc, useFirestore, useUser } from '@/firebase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, Zap, Timer, Play, Sparkles, ChevronRight, 
  Target, Activity, Brain, Flame, ArrowUpRight, BarChart3,
  Coffee, ShieldCheck, AlertCircle, RefreshCw, Layers,
  PlaySquare, Book, FileText, CheckCircle2, Info, Calendar,
  Loader2
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { doc, updateDoc, serverTimestamp, addDoc, collection } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export function StudentView({ user, userData, isReadOnly = false }: { user: any, userData: any, isReadOnly?: boolean }) {
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  
  const today = format(new Date(), 'yyyy-MM-dd');
  const { data: studyPlan, loading: planLoading } = useDoc<any>(user?.uid ? `studyPlans/${user.uid}` : null);
  const [isRecLoading, setIsRecLoading] = useState(false);

  const currentDayPlan = useMemo(() => {
    if (!studyPlan?.masterPlan) return null;
    return studyPlan.masterPlan.find((p: any) => p.date === today);
  }, [studyPlan, today]);

  const stats = useMemo(() => {
    if (!studyPlan?.masterPlan) return { xp: 0, completed: 0, target: 0, accuracy: 88, streak: 12, openMistakes: 18 };
    const completed = studyPlan.masterPlan.filter((p: any) => p.status === 'completed').length;
    return {
      xp: (completed * 100).toLocaleString(),
      completed: completed,
      target: studyPlan.wizardConfig?.questionCapacity || 150,
      accuracy: 82,
      streak: 12,
      openMistakes: 18
    };
  }, [studyPlan]);

  const handleToggleTask = (taskId: string) => {
    if (!db || !user || !studyPlan || isReadOnly) return;
    const newMasterPlan = studyPlan.masterPlan.map((p: any) => {
      if (p.date === today) {
        return {
          ...p,
          status: p.status === 'completed' ? 'pending' : 'completed'
        };
      }
      return p;
    });

    const planRef = doc(db, 'studyPlans', user.uid);
    updateDoc(planRef, { masterPlan: newMasterPlan, updatedAt: serverTimestamp() });
    
    if (currentDayPlan?.status !== 'completed') {
      toast({ title: 'Görev Tamamlandı!', description: 'Akademik arşivinize işlendi.', className: "bg-emerald-500 text-white rounded-[2rem]" });
      addDoc(collection(db, 'studies'), {
        userId: user.uid,
        completedAt: serverTimestamp(),
        xp: 100,
        status: 'completed'
      });
    }
  };

  const handleCreateRecommendedTask = () => {
    if (!db || !user || !studyPlan || isReadOnly) return;
    setIsRecLoading(true);
    
    setTimeout(() => {
      const newTask = {
        id: `rec_${Date.now()}`,
        type: 'practice',
        subject: 'Matematik',
        topic: 'Problemler',
        qTarget: 25,
        duration: '30 dk',
        desc: 'AI tarafından önerilen ek problem çözümü'
      };

      const newMasterPlan = studyPlan.masterPlan.map((p: any) => {
        if (p.date === today) {
          return {
            ...p,
            tasks: [...(p.tasks || []), newTask]
          };
        }
        return p;
      });

      const planRef = doc(db, 'studyPlans', user.uid);
      updateDoc(planRef, { masterPlan: newMasterPlan, updatedAt: serverTimestamp() });
      
      toast({ title: 'Görev Eklendi', description: 'Yapay zeka önerisi programa işlendi.' });
      setIsRecLoading(false);
    }, 800);
  };

  if (planLoading) return <div className="p-20 text-center opacity-30 animate-pulse font-black uppercase italic">Senkronizasyon Başlatılıyor...</div>;

  return (
    <div className="p-8 lg:p-14 space-y-12 max-w-[1800px] mx-auto w-full animate-in fade-in duration-1000 bg-[#FAFBFF]">
      {/* HEADER SECTION */}
      <section className="flex flex-col lg:flex-row justify-between items-end gap-10">
         <div className="space-y-6 flex-1">
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-slate-50 border border-primary/5 text-primary/40 font-black text-[10px] uppercase tracking-widest italic shadow-sm">
               <Activity className="h-3.5 w-3.5 text-accent animate-pulse" /> ADAPTIVE MONITORING ACTIVE
            </div>
            <div className="space-y-3">
               <h1 className="text-6xl md:text-8xl font-black text-primary tracking-tighter italic uppercase leading-[0.8] text-shadow-deep">
                  GÜNAYDIN, <br /><span className="text-accent text-shadow-accent">{userData?.displayName?.split(' ')[0] || 'ÖĞRENCİ'}</span> 👋
               </h1>
               <p className="text-2xl font-medium text-muted-foreground italic leading-relaxed max-w-2xl">
                  Bugünkü akademik durumun: <span className="text-primary font-bold">%{stats.accuracy} Başarı</span>. Hedef performansın saniyeler içinde güncellendi.
               </p>
            </div>
            <div className="w-full max-w-xl space-y-3">
               <div className="flex justify-between items-end"><span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/40">GÜNLÜK HEDEF TAMAMLANMA</span><span className="text-xl font-black text-primary italic">%{stats.accuracy}</span></div>
               <div className="h-4 bg-slate-100 rounded-full overflow-hidden shadow-inner border border-primary/5"><div className="h-full bg-primary transition-all duration-1000" style={{ width: `${stats.accuracy}%` }} /></div>
            </div>
         </div>
         <Card className="p-10 rounded-[3.5rem] bg-white border border-primary/5 shadow-2xl flex items-center gap-10">
            <div className="relative">
               <svg className="h-32 w-32 -rotate-90" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="none" stroke="#F1F5F9" strokeWidth="8" /><circle cx="50" cy="50" r="45" fill="none" stroke="#F59E0B" strokeWidth="8" strokeDasharray="283" strokeDashoffset={283 - (283 * stats.accuracy) / 100} strokeLinecap="round" className="drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]" /></svg>
               <div className="absolute inset-0 flex flex-col items-center justify-center"><p className="text-3xl font-black text-primary italic">%{stats.accuracy}</p><p className="text-[8px] font-black uppercase opacity-40">PERFORMANS</p></div>
            </div>
            <div className="space-y-4">
               <h4 className="text-2xl font-black italic tracking-tighter uppercase text-primary leading-none">AKADEMİK <br />RİSK SKORU</h4>
               <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[10px] uppercase tracking-widest gap-2"><CheckCircle2 className="h-3.5 w-3.5" /> DÜŞÜK RİSK (%18)</Badge>
            </div>
         </Card>
      </section>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-8">
         {[
           { label: 'BUGÜNKÜ GÖREV', val: currentDayPlan?.tasks?.length || 0, icon: Layers, color: 'text-blue-500', bg: 'bg-blue-50' },
           { label: 'SORU HEDEFİ', val: stats.target, icon: Target, color: 'text-rose-500', bg: 'bg-rose-50' },
           { label: 'ÇALIŞMA SÜRESİ', val: '2s 45dk', icon: Timer, color: 'text-indigo-500', bg: 'bg-indigo-50' },
           { label: 'AKADEMİK XP', val: stats.xp, icon: Zap, color: 'text-amber-500', bg: 'bg-amber-50' },
           { label: 'SERİ GÜNÜ', val: stats.streak, icon: Flame, color: 'text-orange-500', bg: 'bg-orange-50' },
           { label: 'AÇIK YANLIŞ', val: stats.openMistakes, icon: AlertCircle, color: 'text-destructive', bg: 'bg-destructive/5' },
         ].map((s, i) => (
           <Card key={i} className="p-8 rounded-[2.5rem] border-none shadow-sm bg-white flex flex-col justify-between group hover:shadow-2xl transition-all hover:-translate-y-1 border border-primary/5">
              <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 shadow-inner group-hover:rotate-6 transition-all", s.bg)}>
                 <s.icon className={cn("h-6 w-6", s.color)} />
              </div>
              <div className="mt-6">
                 <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 mb-1 italic">{s.label}</p>
                 <p className="text-3xl font-black text-primary tracking-tighter italic leading-none">{s.val}</p>
              </div>
           </Card>
         ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
         {/* TODAY'S PLAN SECTION */}
         <div className="xl:col-span-8 space-y-10">
            <div className="flex justify-between items-end px-6">
               <div className="space-y-2">
                  <p className="text-[11px] font-black uppercase tracking-[0.5em] text-muted-foreground/30 italic">OPERATIONAL TERMINAL</p>
                  <h3 className="text-5xl font-black italic tracking-tighter uppercase text-primary flex items-center gap-5">
                     <Calendar className="h-10 w-10 text-accent" /> BUGÜNKÜ PLAN
                  </h3>
               </div>
               <Button variant="ghost" onClick={() => router.push('/dashboard/planning')} className="font-black text-[10px] uppercase tracking-widest text-accent hover:bg-accent/5">TÜM PROGRAMI GÖR <ChevronRight className="ml-2 h-4 w-4" /></Button>
            </div>

            {currentDayPlan?.isRestDay ? (
               <Card className="p-24 text-center bg-emerald-50/30 rounded-[5rem] border-4 border-dashed border-emerald-100 flex flex-col items-center gap-8 group animate-in zoom-in-95 duration-700">
                  <div className="h-32 w-32 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-[0_0_80px_rgba(16,185,129,0.3)] group-hover:scale-110 transition-all">
                     <Coffee className="h-16 w-16" />
                  </div>
                  <div className="space-y-4">
                     <h4 className="text-5xl font-black italic tracking-tighter uppercase text-emerald-600">🌿 BUGÜN MOLA GÜNÜ</h4>
                     <p className="text-xl font-medium text-emerald-800/60 italic max-w-md mx-auto">Mental sağlığın başarının anahtarıdır. Bugün sadece hafif tekrarlar veya kitap okuma yapabilirsin.</p>
                  </div>
               </Card>
            ) : (
               <div className="grid gap-6">
                  {currentDayPlan?.tasks?.map((t: any, i: number) => {
                     const Icon = t.type === 'content' ? Book : t.type === 'practice' ? PlaySquare : RefreshCw;
                     const color = t.type === 'content' ? 'border-l-blue-500' : t.type === 'practice' ? 'border-l-rose-500' : 'border-l-amber-500';
                     return (
                        <Card key={i} className={cn(
                           "group p-10 rounded-[3rem] border-none shadow-xl hover:shadow-2xl transition-all hover:scale-[1.01] bg-white flex items-center justify-between border-l-[16px]", 
                           color, currentDayPlan.status === 'completed' && "opacity-50"
                        )}>
                           <div className="flex items-center gap-10">
                              <div className="h-16 w-16 rounded-2xl bg-slate-50 flex items-center justify-center shadow-inner group-hover:scale-110 transition-all">
                                 <Icon className="h-8 w-8 text-primary/40" />
                              </div>
                              <div className="space-y-2">
                                 <div className="flex items-center gap-4">
                                    <h4 className="text-3xl font-black italic tracking-tight text-primary uppercase leading-none">{t.subject}</h4>
                                    <Badge variant="outline" className="text-[9px] font-black uppercase border-primary/10 bg-slate-50">{t.type === 'content' ? 'KONU ÇALIŞMASI' : t.type === 'practice' ? 'SORU ÇÖZÜMÜ' : 'ARALIKLI TEKRAR'}</Badge>
                                 </div>
                                 <p className="text-lg font-medium text-muted-foreground italic opacity-80">{t.topic} • {t.duration || t.qTarget + ' Soru'}</p>
                              </div>
                           </div>
                           <Button size="icon" onClick={() => handleToggleTask(t.id)} className={cn("h-16 w-16 rounded-[2rem] shadow-2xl transition-all", currentDayPlan.status === 'completed' ? "bg-emerald-500 text-white" : "bg-[#0F172A] text-white hover:bg-accent")}>
                              {currentDayPlan.status === 'completed' ? <CheckCircle2 className="h-8 w-8" /> : <Play className="h-8 w-8 fill-current" />}
                           </Button>
                        </Card>
                     );
                  })}
                  {!currentDayPlan && (
                    <Card onClick={() => router.push('/dashboard/planning')} className="p-32 text-center bg-white/50 rounded-[5rem] border-4 border-dashed border-primary/10 flex flex-col items-center gap-8 cursor-pointer hover:bg-white hover:border-primary/20 transition-all">
                       <Sparkles className="h-16 w-16 text-accent opacity-20" />
                       <p className="text-xl font-black uppercase tracking-[0.4em] text-primary/20 italic">HENÜZ PLAN OLUŞTURULMADI</p>
                       <Button className="h-16 px-12 rounded-2xl bg-primary font-black text-xs uppercase tracking-widest gap-4 shadow-2xl shadow-primary/20">ANKETİ BAŞLAT <ChevronRight className="h-5 w-5" /></Button>
                    </Card>
                  )}
               </div>
            )}
         </div>

         {/* SIDEBAR: AI COACH & RISK */}
         <div className="xl:col-span-4 space-y-12">
            <Card className="rounded-[4rem] border-none shadow-[0_60px_120px_-30px_rgba(15,23,42,0.15)] bg-primary text-white p-14 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-80 h-80 bg-accent/20 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2" />
               <div className="relative z-10 space-y-10">
                  <div className="flex items-center gap-4">
                     <div className="h-14 w-14 rounded-2xl bg-white/10 flex items-center justify-center shadow-inner group-hover:rotate-6 transition-all">
                        <Brain className="h-8 w-8 text-accent animate-pulse" />
                     </div>
                     <h4 className="text-2xl font-black italic tracking-tighter uppercase">AKADEMİK KOÇ</h4>
                  </div>
                  <p className="text-xl font-medium italic leading-relaxed text-white/80">
                     "Son 3 denemede Matematik Problemler bölümünde performansın düşüyor. Bu nedenle önümüzdeki hafta problem çalışmalarını %25 artırdım ve Çarşamba gününe ek tekrar koydum."
                  </p>
                  <Button onClick={handleCreateRecommendedTask} disabled={isRecLoading || isReadOnly} className="w-full h-20 rounded-[2rem] bg-accent hover:bg-white text-primary font-black text-xs uppercase tracking-widest gap-4 shadow-2xl shadow-accent/20 group/btn">
                    {isRecLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Zap className="h-6 w-6 text-primary group-hover/btn:animate-pulse" />} GÖREVİ HEMEN OLUŞTUR
                  </Button>
               </div>
            </Card>

            <Card className="p-12 rounded-[4rem] border-none shadow-xl bg-white border border-primary/5 space-y-10">
               <div className="flex items-center justify-between">
                  <h4 className="text-2xl font-black italic tracking-tighter uppercase text-primary">AKADEMİK DENGE</h4>
                  <BarChart3 className="h-6 w-6 text-accent opacity-20" />
               </div>
               <div className="space-y-8">
                  {[
                    { s: 'Matematik', v: 48, c: 'bg-rose-500' },
                    { s: 'Türkçe', v: 72, c: 'bg-emerald-500' },
                    { s: 'Geometri', v: 35, c: 'bg-orange-500' },
                    { s: 'Fen Bilimleri', v: 61, c: 'bg-indigo-500' },
                  ].map((item, i) => (
                    <div key={i} className="space-y-3">
                       <div className="flex justify-between items-end">
                          <span className="text-[11px] font-black uppercase tracking-widest text-primary/60">{item.s}</span>
                          <span className="text-lg font-black text-primary italic">%{item.v}</span>
                       </div>
                       <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden shadow-inner">
                          <div className={cn("h-full transition-all duration-1000", item.c)} style={{ width: `${item.v}%` }} />
                       </div>
                    </div>
                  ))}
               </div>
               <div className="p-6 bg-slate-50 rounded-3xl border border-primary/5 flex items-start gap-4">
                  <Info className="h-5 w-5 text-primary opacity-20 mt-0.5" />
                  <p className="text-[11px] font-medium text-muted-foreground italic leading-relaxed">Düşük başarı gösterdiğiniz derslerde (Geometri) sistem saniyeler içinde ek tekrar seansları planlamıştır.</p>
               </div>
            </Card>

            <Card className="p-10 rounded-[4rem] border-none shadow-2xl bg-[#0F172A] text-white relative overflow-hidden group">
               <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-accent/5 blur-[80px] rounded-full" />
               <div className="relative z-10 flex items-center justify-between">
                  <div className="space-y-2">
                     <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 italic">AOS OPERATIONAL STATUS</p>
                     <h4 className="text-2xl font-black italic tracking-tighter uppercase text-white">SİSTEM STABİL</h4>
                  </div>
                  <ShieldCheck className="h-8 w-8 text-emerald-500" />
               </div>
            </Card>
         </div>
      </div>
    </div>
  );
}
