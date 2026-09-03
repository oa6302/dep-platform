'use client';

import { useDoc, useFirestore } from '@/firebase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, Brain, CheckCircle2, Loader2, Clock, 
  Zap, Plus, Award, RefreshCcw, FastForward, Gauge, Edit3, Trash2, RotateCcw,
  Youtube, FileText, Globe
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';

const LESSON_THEMES: Record<string, string> = {
  'TYT Matematik': 'bg-[#1e293b] text-white',
  'AYT Matematik': 'bg-[#0f172a] text-white',
  'Geometri': 'bg-[#064e3b] text-white',
  'TYT Türkçe': 'bg-[#1a3a5f] text-white',
  'Edebiyat': 'bg-[#881337] text-white',
  'Tarih': 'bg-[#7c2d12] text-white',
  'Coğrafya': 'bg-[#14532d] text-white',
  'Felsefe': 'bg-[#4c1d95] text-white',
  'Din Kültürü': 'bg-[#312e81] text-white',
  'Genel': 'bg-slate-700 text-white',
};

export function StudentView({ user, userData }: { user: any, userData: any }) {
  const db = useFirestore();
  const router = useRouter();
  
  const today = format(new Date(), 'yyyy-MM-dd');
  const { data: studyPlan, loading: planLoading } = useDoc<any>(user?.uid ? `studyPlans/${user.uid}` : null);
  
  const currentDayPlan = useMemo(() => {
    if (!studyPlan?.masterPlan) return null;
    return studyPlan.masterPlan.find((p: any) => p.date === today);
  }, [studyPlan, today]);

  const handleTaskAction = async (taskId: string, action: string) => {
    if (!db || !user || !studyPlan) return;
    const newPlan = studyPlan.masterPlan.map((day: any) => {
      if (day.date === today) {
        return {
          ...day,
          tasks: day.tasks.map((t: any) => {
            if (t.id === taskId) {
              if (action === 'done') return { ...t, status: t.status === 'done' ? 'planned' : 'done' };
              if (action === 'repeat') return { ...t, status: 'repeat' };
              return t;
            }
            return t;
          })
        };
      }
      return day;
    });
    await updateDoc(doc(db, 'studyPlans', user.uid), { 
      masterPlan: newPlan,
      updatedAt: serverTimestamp()
    });
  };

  if (planLoading) return (
    <div className="p-20 flex flex-col items-center justify-center gap-6 min-h-[60vh]">
      <Loader2 className="h-12 w-12 animate-spin text-accent" />
      <p className="text-xs font-black uppercase tracking-[0.4em] text-primary/40 italic">Senkronizasyon Başlatılıyor...</p>
    </div>
  );

  return (
    <div className="p-8 lg:p-14 space-y-12 max-w-[1800px] mx-auto w-full animate-in fade-in duration-1000 bg-[#F8FAFC]">
      <section className="bg-primary text-white rounded-[3.5rem] p-12 relative overflow-hidden group shadow-[0_50px_100px_-20px_rgba(15,23,42,0.4)] transition-all">
        <div className="absolute top-0 right-0 w-80 h-80 bg-accent/10 blur-[120px] rounded-full" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="space-y-4 flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-3 text-accent font-black text-[11px] uppercase tracking-widest italic">
              <Brain className="h-5 w-5 animate-pulse" /> AOS YAPAY ZEKA MENTORU
            </div>
            <p className="text-3xl font-black italic leading-tight text-shadow-premium uppercase">
               "Bugün 15 Haziran 2027 hedefine giden yolda saniyeler içinde {currentDayPlan?.tasks?.length || 0} kritik görev planlandı."
            </p>
          </div>
          <Button onClick={() => router.push('/dashboard/planning')} className="bg-accent hover:bg-white hover:text-primary transition-all rounded-[2rem] h-20 px-12 font-black uppercase text-[12px] tracking-[0.2em] shadow-2xl">AKADEMİK TAKVİM</Button>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-9 space-y-10">
          <div className="flex items-center justify-between px-4">
             <h2 className="text-4xl font-black italic tracking-tighter text-primary uppercase leading-none">BUGÜNKÜ FASİKÜL AKIŞIN</h2>
             <Badge className="bg-white text-primary border-2 border-slate-100 rounded-2xl px-6 py-2.5 font-black uppercase text-[11px] tracking-widest shadow-sm">{format(new Date(), 'd MMMM yyyy', { locale: tr })}</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
             {currentDayPlan?.tasks?.map((t: any) => (
                <Card key={t.id} className={cn(
                  "aspect-square p-7 rounded-[4rem] border-none flex flex-col justify-between transition-all hover:scale-[1.03] shadow-[0_45px_100px_-25px_rgba(15,23,42,0.4)] group relative overflow-hidden",
                  LESSON_THEMES[t.lesson] || "bg-slate-700 text-white",
                  t.status === 'done' && "opacity-40 grayscale scale-95"
                )}>
                   <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-3xl rounded-full" />
                   
                   <div className="space-y-4 relative z-10">
                      <div className="flex justify-between items-start">
                         <span className="text-[9px] font-black uppercase px-4 py-1.5 rounded-full shadow-lg bg-white/10 backdrop-blur-xl border border-white/10 flex items-center gap-2 text-white">
                           📋 {t.lesson.toUpperCase()}
                         </span>
                         <span className="text-base font-black text-white/40 italic">{t.time || '10:00'}</span>
                      </div>

                      <div className="space-y-1">
                         <h4 className="text-[1.75rem] font-black italic leading-[0.95] tracking-tighter uppercase text-white text-shadow-premium">
                            {t.type}
                         </h4>
                         <p className="text-xs font-bold text-white/50 italic leading-tight">
                            {t.topic}
                         </p>
                      </div>

                      <div className="space-y-3">
                        <div className="flex flex-wrap gap-2">
                           <span className="text-[8px] font-black uppercase bg-white/10 px-3 py-1.5 rounded-xl text-accent flex items-center gap-1.5 shadow-inner">🟡 {t.difficulty || 'ORTA'}</span>
                           <span className="text-[8px] font-black uppercase bg-white/10 px-3 py-1.5 rounded-xl text-white flex items-center gap-1.5 shadow-inner">⏱️ {t.duration || '60'}DK</span>
                           <span className="text-[8px] font-black uppercase bg-white/10 px-3 py-1.5 rounded-xl text-white flex items-center gap-1.5 shadow-inner">📝 {t.questionTarget || '20'} SORU</span>
                        </div>
                        <div className="flex items-center gap-4 pt-1">
                           {t.resources ? (
                             <div className="flex gap-4">
                                <a href={t.resources.youtube} target="_blank" className="hover:scale-125 transition-transform text-white/60 hover:text-white"><Youtube className="h-5 w-5" /></a>
                                <a href={t.resources.ogm} target="_blank" className="hover:scale-125 transition-transform text-white/60 hover:text-white"><Globe className="h-5 w-5" /></a>
                                <a href={t.resources.pdf} target="_blank" className="hover:scale-125 transition-transform text-white/60 hover:text-white"><FileText className="h-5 w-5" /></a>
                             </div>
                           ) : (
                             <span className="text-[8px] font-bold text-white/30 italic uppercase tracking-widest">Kaynak eklenmedi</span>
                           )}
                        </div>
                      </div>
                   </div>

                   <div className="grid grid-cols-3 gap-2 pt-4 border-t border-white/5 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
                      <Button 
                        size="icon" 
                        onClick={() => handleTaskAction(t.id, 'done')} 
                        className={cn(
                          "h-11 w-11 rounded-2xl transition-all shadow-2xl", 
                          t.status === 'done' ? "bg-white/20" : "bg-emerald-500 hover:bg-emerald-400"
                        )}
                      >
                         <CheckCircle2 className="h-5 w-5 text-white" />
                      </Button>
                      <Button 
                        size="icon" 
                        onClick={() => handleTaskAction(t.id, 'repeat')} 
                        variant="ghost" 
                        className="h-11 w-11 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-accent"
                      >
                        <RotateCcw className="h-5 w-5" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-11 w-11 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/60"><FastForward className="h-5 w-5" /></Button>
                      <Button size="icon" variant="ghost" className="h-11 w-11 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-blue-400"><Gauge className="h-5 w-5" /></Button>
                      <Button size="icon" variant="ghost" className="h-11 w-11 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white"><Edit3 className="h-5 w-5" /></Button>
                      <Button size="icon" variant="ghost" className="h-11 w-11 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-rose-500"><Trash2 className="h-5 w-5" /></Button>
                   </div>
                </Card>
             ))}
             {!currentDayPlan && (
                <Card onClick={() => router.push('/dashboard/planning')} className="aspect-square p-14 text-center bg-white rounded-[4rem] border-4 border-dashed border-slate-200 flex flex-col items-center justify-center gap-8 cursor-pointer hover:bg-white hover:border-accent/20 transition-all group shadow-inner">
                   <Zap className="h-20 w-20 text-accent opacity-20 group-hover:scale-110 transition-transform animate-pulse" />
                   <p className="text-2xl font-black uppercase tracking-[0.3em] text-primary/20 italic">FASİKÜL PLANI BEKLENİYOR</p>
                   <Button className="h-16 px-12 rounded-[1.75rem] bg-primary font-black text-[11px] uppercase tracking-widest gap-4 shadow-[0_30px_60px_-10px_rgba(15,23,42,0.3)]">PLANI OLUŞTUR VE BAŞLA</Button>
                </Card>
             )}
          </div>
        </div>

        <div className="lg:col-span-3 space-y-12">
           <Card className="rounded-[4rem] p-12 bg-[#1a3a5f] text-white space-y-10 shadow-[0_50px_100px_-25px_rgba(26,58,95,0.4)] relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 blur-[80px] rounded-full" />
             <div className="flex items-center justify-between relative z-10">
                <h4 className="text-2xl font-black italic tracking-tighter uppercase">ODAKLANMA</h4>
                <Clock className="h-8 w-8 text-accent animate-pulse" />
             </div>
             <div className="text-center py-8 relative z-10">
                <p className="text-[6.5rem] font-black text-white tracking-tighter leading-none italic tabular-nums text-shadow-premium">25:00</p>
             </div>
             <div className="flex gap-4 relative z-10">
                <Button className="flex-1 h-20 rounded-[2rem] bg-accent hover:bg-accent/90 text-primary font-black text-[12px] uppercase tracking-[0.2em] shadow-2xl">
                   BAŞLAT
                </Button>
                <Button variant="ghost" size="icon" className="h-20 w-20 rounded-[2rem] border-2 border-white/10 hover:bg-white/5">
                   <Plus className="h-8 w-8" />
                </Button>
             </div>
           </Card>

           <Card className="rounded-[4rem] p-12 bg-white border border-slate-100 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] space-y-10">
             <div className="flex items-center justify-between">
                <h4 className="text-2xl font-black italic tracking-tighter uppercase text-primary">ROZETLERİM</h4>
                <Award className="h-8 w-8 text-accent opacity-20" />
             </div>
             <div className="flex flex-wrap gap-5 justify-center">
                {['📝', '🏆', '⏱️', '📚'].map((icon, i) => (
                   <div key={i} className="h-16 w-16 rounded-[1.75rem] bg-slate-50 flex items-center justify-center text-3xl shadow-inner border border-slate-100 hover:scale-110 transition-all cursor-pointer grayscale hover:grayscale-0">
                      {icon}
                   </div>
                ))}
             </div>
             <div className="pt-6 space-y-3">
                <div className="flex justify-between text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground italic">
                   <span>SEVİYE 4</span>
                   <span className="text-accent">740 / 1000 XP</span>
                </div>
                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                   <div className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-1000" style={{ width: '74%' }} />
                </div>
             </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
