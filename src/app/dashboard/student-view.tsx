
'use client';

import { useDoc, useFirestore } from '@/firebase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, Brain, CheckCircle2, Loader2, Clock, 
  Zap, Plus, Award, RotateCcw, FastForward, Gauge, Edit3, Trash2,
  Youtube, Globe, BellRing, FileText
} from 'lucide-react';
import { useState, useMemo } from 'react';
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
      <Loader2 className="h-12 w-12 animate-spin text-accent" />
      <p className="text-xs font-black uppercase tracking-[0.4em] text-primary/40 italic">Terminal Senkronize Ediliyor...</p>
    </div>
  );

  return (
    <div className="p-4 md:p-8 lg:p-14 space-y-12 max-w-[1800px] mx-auto w-full animate-in fade-in duration-1000 bg-[#F8FAFC]">
      <section className="bg-primary text-white rounded-[3rem] md:rounded-[4.5rem] p-8 md:p-16 relative overflow-hidden group shadow-[0_60px_120px_-20px_rgba(15,23,42,0.4)] transition-all">
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 blur-[150px] rounded-full" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="space-y-6 flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-4 text-accent font-black text-[10px] md:text-[12px] uppercase tracking-[0.3em] italic bg-white/5 px-6 py-2 rounded-full border border-white/10">
              <Brain className="h-5 w-5 animate-pulse" /> AOS YAPAY ZEKA MENTORU
            </div>
            <p className="text-3xl md:text-4xl lg:text-5xl font-black italic leading-[0.9] text-shadow-premium uppercase tracking-tighter">
               "Bugün {currentDayPlan?.blocks?.length || 0} devasa akademik blok seni bekliyor. Saat 13:00'te tüm hedefler tamamlanmış olacak."
            </p>
          </div>
          <Button onClick={() => router.push('/dashboard/planning')} className="w-full md:w-auto bg-accent hover:bg-white hover:text-primary transition-all duration-500 rounded-[2rem] md:rounded-[2.5rem] h-20 md:h-24 px-12 md:px-16 font-black uppercase text-[12px] md:text-[14px] tracking-[0.3em] shadow-3xl text-primary scale-100 md:scale-105 hover:scale-110 active:scale-95">AKADEMİK TAKVİM</Button>
        </div>
      </section>

      <div className="space-y-12 md:space-y-16">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 px-4 md:px-8">
             <h2 className="text-3xl md:text-5xl font-black italic tracking-tighter text-primary uppercase leading-none text-shadow-deep text-center md:text-left">BUGÜNKÜ FASİKÜL BLOKLARIN</h2>
             <Badge className="bg-white text-primary border-2 border-slate-100 rounded-3xl px-8 py-3.5 font-black uppercase text-[12px] tracking-[0.2em] shadow-lg whitespace-nowrap">{format(new Date(), 'd MMMM yyyy', { locale: tr })}</Badge>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 md:gap-16">
             {currentDayPlan?.blocks?.map((block: any) => (
                <Card 
                  key={block.id} 
                  className={cn(
                    "p-8 md:p-12 rounded-[3.5rem] md:rounded-[5.5rem] border-none transition-all hover:scale-[1.01] md:hover:scale-[1.02] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] md:shadow-[0_70px_130px_-30px_rgba(0,0,0,0.18)] group relative overflow-hidden bg-white",
                    block.status === 'done' && "opacity-90"
                  )}
                >
                   <div className="space-y-10 relative z-10">
                        <div className="flex justify-between items-start gap-4">
                           <div className="space-y-1">
                              <h4 className="text-3xl md:text-[3.5rem] font-black italic leading-[0.85] tracking-tighter uppercase text-primary text-shadow-deep break-words max-w-[280px] md:max-w-none">
                                {block.topic}
                              </h4>
                              <div className="h-1 w-16 bg-accent/20 rounded-full mt-2" />
                           </div>
                           <div className="flex flex-col items-end gap-3">
                             {block.status === 'done' ? (
                               <Badge className="bg-emerald-500 text-white px-6 md:px-8 py-2 md:py-3 rounded-full text-[10px] md:text-[12px] font-black flex items-center gap-3 shadow-xl animate-in zoom-in-75">
                                 <CheckCircle2 className="h-5 w-5" /> TAMAMLANDI
                               </Badge>
                             ) : (
                               <Badge className="bg-[#FF4D6D] text-white px-6 md:px-8 py-2 md:py-3 rounded-full text-[10px] md:text-[12px] font-black flex items-center gap-3 shadow-xl uppercase">
                                 <Clock className="h-5 w-5" /> BEKLİYOR
                               </Badge>
                             )}
                             <p className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.4em] italic text-right">#{block.lesson.substring(0, 3)} MODÜLÜ</p>
                           </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                           <div className="p-8 md:p-10 rounded-[2.5rem] md:rounded-[4rem] bg-slate-50/50 border border-slate-100 space-y-6 relative overflow-hidden group/p1 transition-all hover:bg-white hover:shadow-2xl">
                              <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                                 <span className="text-[10px] font-black text-primary/30 uppercase tracking-[0.3em]">1. AŞAMA</span>
                                 <span className="text-lg md:text-xl font-black text-primary italic">{block.phase1?.time || '10:00'}</span>
                              </div>
                              <h5 className="font-black text-xl md:text-[1.8rem] italic text-primary leading-tight uppercase group-hover/p1:text-accent transition-all">{block.phase1?.type || 'KONU ÇALIŞMASI'}</h5>
                              <div className="flex gap-6 pt-2">
                                 {block.phase1?.resources?.youtube && <a href={block.phase1.resources.youtube} target="_blank" className="hover:scale-125 transition-all text-rose-500 opacity-40 hover:opacity-100"><Youtube className="h-6 md:h-8 w-6 md:w-8" /></a>}
                                 {block.phase1?.resources?.pdf && <a href={block.phase1.resources.pdf} target="_blank" className="hover:scale-125 transition-all text-blue-500 opacity-40 hover:opacity-100"><FileText className="h-6 md:h-8 w-6 md:w-8" /></a>}
                              </div>
                           </div>

                           <div className="p-8 md:p-10 rounded-[2.5rem] md:rounded-[4rem] bg-slate-50/50 border border-slate-100 space-y-6 relative overflow-hidden group/p2 transition-all hover:bg-white hover:shadow-2xl">
                              <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                                 <span className="text-[10px] font-black text-primary/30 uppercase tracking-[0.3em]">2. AŞAMA</span>
                                 <span className="text-lg md:text-xl font-black text-primary italic">{block.phase2?.time || '11:00'}</span>
                              </div>
                              <h5 className="font-black text-xl md:text-[1.8rem] italic text-primary leading-tight uppercase group-hover/p2:text-accent transition-all">{block.phase2?.type || 'TEST ÇALIŞMASI'}</h5>
                              <div className="flex gap-6 pt-2">
                                 {block.phase2?.resources?.youtube && <a href={block.phase2.resources.youtube} target="_blank" className="hover:scale-125 transition-all text-rose-500 opacity-40 hover:opacity-100"><Youtube className="h-6 md:h-8 w-6 md:w-8" /></a>}
                                 {block.phase2?.resources?.ogm && <a href={block.phase2.resources.ogm} target="_blank" className="hover:scale-125 transition-all text-emerald-500 opacity-40 hover:opacity-100"><Globe className="h-6 md:h-8 w-6 md:w-8" /></a>}
                              </div>
                           </div>
                        </div>

                        {block.reminder && (
                          <div className="p-6 md:p-8 bg-accent/5 border border-accent/10 rounded-[2.5rem] md:rounded-[3rem] flex items-center gap-5 md:gap-6 group/rem">
                             <BellRing className="h-5 md:h-6 w-5 md:w-6 text-accent shrink-0" />
                             <p className="text-sm md:text-lg font-black text-primary italic leading-tight">{block.reminder}</p>
                          </div>
                        )}

                        <div className="flex flex-wrap justify-center md:justify-start gap-4 md:gap-8 pt-8 md:pt-12 border-t border-slate-50">
                           <Button onClick={() => handleTaskAction(block.id, 'done')} size="icon" className={cn("h-16 w-16 md:h-20 md:w-20 rounded-full transition-all duration-500 shadow-xl hover:scale-110", block.status === 'done' ? "bg-slate-100 text-slate-400" : "bg-emerald-500 text-white")}><CheckCircle2 className="h-7 md:h-9 w-7 md:w-9" /></Button>
                           <Button onClick={() => router.push('/dashboard/planning')} size="icon" variant="outline" className="h-16 w-16 md:h-20 md:w-20 rounded-full bg-white border-2 border-slate-100 hover:border-primary text-slate-900 hover:bg-slate-50 transition-all shadow-lg"><Edit3 className="h-7 md:h-9 w-7 md:w-9" /></Button>
                           <Button onClick={() => handleTaskAction(block.id, 'delete')} size="icon" variant="outline" className="h-16 w-16 md:h-20 md:w-20 rounded-full bg-white border-2 border-slate-100 hover:border-rose-500 text-rose-500 hover:bg-rose-50 transition-all shadow-lg"><Trash2 className="h-7 md:h-9 w-7 md:w-9" /></Button>
                        </div>
                   </div>
                </Card>
             ))}
             {(!currentDayPlan || currentDayPlan?.blocks?.length === 0) && (
                <Card onClick={() => router.push('/dashboard/planning')} className="xl:col-span-2 h-[400px] md:h-[600px] text-center bg-white rounded-[3rem] md:rounded-[5.5rem] border-4 border-dashed border-slate-200 flex flex-col items-center justify-center gap-8 cursor-pointer hover:border-accent/20 transition-all group px-6">
                   <div className="h-24 md:h-32 w-24 md:w-32 bg-accent/5 rounded-full flex items-center justify-center animate-pulse group-hover:scale-110 transition-transform">
                      <Zap className="h-12 md:h-16 w-12 md:w-16 text-accent opacity-40" />
                   </div>
                   <p className="text-xl md:text-3xl font-black uppercase tracking-[0.4em] text-primary/20 italic">AKADEMİK BLOKLAR BEKLENİYOR</p>
                   <Button className="h-16 md:h-24 px-10 md:px-16 rounded-[1.5rem] md:rounded-[2.5rem] bg-primary font-black uppercase text-[11px] md:text-[14px] tracking-[0.4em] text-white shadow-3xl hover:bg-accent transition-all">TAKVMİMİ OLUŞTUR</Button>
                </Card>
             )}
        </div>
      </div>
    </div>
  );
}
