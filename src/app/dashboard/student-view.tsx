
'use client';

import { useDoc, useFirestore } from '@/firebase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, Brain, CheckCircle2, Loader2, 
  Youtube, FileText, BellRing, Calendar, Edit3, Trash2
} from 'lucide-react';
import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export function StudentView({ user, userData }: { user: any, userData: any }) {
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  
  const today = format(new Date(), 'yyyy-MM-dd');
  const { data: studyPlan, loading: planLoading } = useDoc<any>(user?.uid ? `studyPlans/${user.uid}` : null);
  
  const currentDayPlan = useMemo(() => {
    if (!studyPlan?.masterPlan) return null;
    return studyPlan.masterPlan.find((p: any) => p.date === today);
  }, [studyPlan, today]);

  const handleTaskAction = (blockId: string, action: string) => {
    if (!db || !user || !studyPlan) return;
    
    const newPlan = studyPlan.masterPlan.map((day: any) => {
      if (day.date === today) {
        return {
          ...day,
          blocks: day.blocks.map((b: any) => {
            if (b.id === blockId) {
              if (action === 'done') return { ...b, status: b.status === 'done' ? 'planned' : 'done' };
              if (action === 'delete') return null;
              return b;
            }
            return b;
          }).filter(Boolean)
        };
      }
      return day;
    });

    const planRef = doc(db, 'studyPlans', user.uid);
    updateDoc(planRef, { 
      masterPlan: newPlan,
      updatedAt: serverTimestamp()
    }).catch(async (err) => {
      const permissionError = new FirestorePermissionError({
        path: planRef.path,
        operation: 'update',
        requestResourceData: { masterPlan: 'student_action_update' },
      });
      errorEmitter.emit('permission-error', permissionError);
    });
    
    toast({ 
      title: 'Terminal Güncellendi', 
      className: "bg-primary text-white rounded-2xl shadow-2xl"
    });
  };

  if (planLoading) return (
    <div className="p-20 flex flex-col items-center justify-center gap-6 min-h-[60vh]">
      <Loader2 className="h-10 w-10 animate-spin text-accent" />
      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/40 italic">Terminal Senkronize Ediliyor...</p>
    </div>
  );

  return (
    <div className="p-4 md:p-14 space-y-12 max-w-[1800px] mx-auto w-full animate-in fade-in duration-1000 bg-[#F8FAFC]">
      <section className="bg-primary text-white rounded-[3.5rem] p-8 md:p-14 relative overflow-hidden group shadow-[0_60px_120px_-20px_rgba(15,23,42,0.4)]">
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 blur-[150px] rounded-full" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="space-y-6 flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-4 text-accent font-black text-[10px] uppercase tracking-[0.3em] italic bg-white/5 px-6 py-2 rounded-full border border-white/10">
              <Brain className="h-5 w-5 animate-pulse" /> AOS YAPAY ZEKA MENTORU
            </div>
            <p className="text-3xl md:text-5xl font-black italic leading-[0.95] text-shadow-premium uppercase tracking-tighter">
               "Bugün {currentDayPlan?.blocks?.length || 0} devasa akademik blok saniyeler içinde seni bekliyor."
            </p>
          </div>
          <Button onClick={() => router.push('/dashboard/planning')} className="w-full md:w-auto bg-accent hover:bg-white hover:text-primary transition-all duration-500 rounded-[2rem] h-20 px-12 font-black uppercase text-[12px] tracking-[0.3em] shadow-3xl text-primary">AKADEMİK TAKVİM</Button>
        </div>
      </section>

      <div className="space-y-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 px-4">
             <h2 className="text-3xl md:text-4xl font-black italic tracking-tighter text-primary uppercase text-shadow-deep">GÜNLÜK AKADEMİK BLOKLARIN</h2>
             <Badge className="bg-white text-primary border-2 border-slate-100 rounded-3xl px-8 py-3.5 font-black uppercase text-[10px] tracking-[0.2em] shadow-lg">{format(new Date(), 'd MMMM yyyy', { locale: tr })}</Badge>
        </div>

        {/* QUAD GRID - 4 per row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
             {currentDayPlan?.blocks?.map((block: any) => (
                <Card 
                  key={block.id} 
                  className={cn(
                    "p-8 rounded-[3.5rem] border-none transition-all hover:scale-[1.02] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.08)] group relative overflow-hidden bg-white h-full flex flex-col",
                    block.status === 'done' && "opacity-60"
                  )}
                >
                   <div className="space-y-6 relative z-10 flex-1 flex flex-col">
                        <div className="flex justify-between items-start">
                           <div className="space-y-1">
                              <h4 className="text-2xl font-black italic leading-tight tracking-tighter uppercase text-primary text-shadow-deep line-clamp-2">{block.topic}</h4>
                              <p className="text-[8px] font-bold text-muted-foreground/40 uppercase tracking-widest italic">#{block.lesson.substring(0, 3)}</p>
                           </div>
                           <Badge className={cn("px-4 py-1.5 rounded-full text-[8px] font-black", block.status === 'done' ? "bg-emerald-500 text-white" : "bg-[#FF4D6D] text-white")}>
                              {block.status === 'done' ? 'TAMAM' : 'BEK'}
                           </Badge>
                        </div>

                        <div className="grid grid-cols-1 gap-4 flex-1">
                           <div className="p-4 rounded-3xl bg-slate-50 border border-slate-100 space-y-2 hover:bg-white transition-all">
                              <div className="flex justify-between items-center border-b border-slate-200 pb-1.5">
                                 <span className="text-[8px] font-black text-primary/30 uppercase tracking-[0.2em]">10:00 - KONU</span>
                                 <div className="flex gap-2">
                                    <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(block.lesson + ' ' + block.topic + ' konu anlatımı')}`} target="_blank" className="text-rose-500 hover:scale-110 transition-all"><Youtube className="h-4 w-4" /></a>
                                    <a href={`https://ogmmateryal.eba.gov.tr/panel/FasikulGoster.aspx?alan=${block.lesson}`} target="_blank" className="text-blue-500 hover:scale-110 transition-all"><FileText className="h-4 w-4" /></a>
                                 </div>
                              </div>
                              <p className="text-[10px] font-bold text-primary opacity-60">Akademik video ve not tescili.</p>
                           </div>

                           <div className="p-4 rounded-3xl bg-slate-50 border border-slate-100 space-y-2 hover:bg-white transition-all">
                              <div className="flex justify-between items-center border-b border-slate-200 pb-1.5">
                                 <span className="text-[8px] font-black text-primary/30 uppercase tracking-[0.2em]">11:00 - TEST</span>
                                 <div className="flex gap-2">
                                    <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(block.lesson + ' ' + block.topic + ' soru çözümü')}`} target="_blank" className="text-rose-500 hover:scale-110 transition-all"><Youtube className="h-4 w-4" /></a>
                                    <a href={`https://ogmmateryal.eba.gov.tr/soru-bankasi/${block.lesson}`} target="_blank" className="text-blue-500 hover:scale-110 transition-all"><FileText className="h-4 w-4" /></a>
                                 </div>
                              </div>
                              <p className="text-[10px] font-bold text-primary opacity-60">Fasikül pekiştirme ve analiz.</p>
                           </div>
                        </div>

                        {block.reminder && (
                          <div className="p-3 bg-accent/5 border border-accent/10 rounded-2xl flex items-center gap-3">
                             <BellRing className="h-3 w-3 text-accent shrink-0" />
                             <p className="text-[9px] font-black text-primary italic leading-tight truncate">{block.reminder}</p>
                          </div>
                        )}

                        <div className="flex justify-between gap-2 pt-6 border-t border-slate-50">
                           <Button onClick={() => handleTaskAction(block.id, 'done')} size="icon" className={cn("h-12 w-12 rounded-full shadow-xl transition-all", block.status === 'done' ? "bg-slate-100 text-slate-400" : "bg-emerald-500 text-white")}><CheckCircle2 className="h-5 w-5" /></Button>
                           <div className="flex gap-2">
                             <Button onClick={() => router.push('/dashboard/planning')} size="icon" variant="outline" className="h-12 w-12 rounded-full bg-white border border-slate-100 hover:border-primary text-slate-900 shadow-md"><Edit3 className="h-4 w-4" /></Button>
                           </div>
                        </div>
                   </div>
                </Card>
             ))}
             {(!currentDayPlan || currentDayPlan?.blocks?.length === 0) && (
                <Card onClick={() => router.push('/dashboard/planning')} className="lg:col-span-4 h-[300px] text-center bg-white rounded-[4rem] border-4 border-dashed border-slate-200 flex flex-col items-center justify-center gap-6 cursor-pointer hover:border-accent/20 transition-all group">
                   <Zap className="h-10 w-10 text-accent opacity-20 group-hover:scale-110 transition-transform" />
                   <p className="text-xl font-black uppercase tracking-[0.4em] text-primary/20 italic">AKADEMİK TAKVİM BEKLENİYOR</p>
                </Card>
             )}
        </div>
      </div>
    </div>
  );
}
