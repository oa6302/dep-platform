
'use client';

import { useDoc, useFirestore } from '@/firebase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, Brain, CheckCircle2, Loader2, Clock, 
  Zap, Plus, Award, RotateCcw, FastForward, Gauge, Edit3, Trash2,
  Youtube, Globe, BellRing, FileText, BookOpen, Target
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
    <div className="p-4 md:p-8 lg:p-14 space-y-12 max-w-[1800px] mx-auto w-full animate-in fade-in duration-1000 bg-[#F8FAFC] overflow-x-hidden">
      <section className="bg-primary text-white rounded-[2.5rem] md:rounded-[4.5rem] p-8 md:p-16 relative overflow-hidden group shadow-[0_60px_120px_-20px_rgba(15,23,42,0.4)]">
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 blur-[150px] rounded-full" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="space-y-6 flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-4 text-accent font-black text-[10px] md:text-[12px] uppercase tracking-[0.3em] italic bg-white/5 px-6 py-2 rounded-full border border-white/10">
              <Brain className="h-5 w-5 animate-pulse" /> AOS YAPAY ZEKA MENTORU
            </div>
            <p className="text-3xl md:text-4xl lg:text-5xl font-black italic leading-[0.9] text-shadow-premium uppercase tracking-tighter">
               "Bugün {currentDayPlan?.blocks?.length || 4} devasa akademik blok seni bekliyor. Hedefimiz %100 başarı."
            </p>
          </div>
          <Button onClick={() => router.push('/dashboard/planning')} className="w-full md:w-auto bg-accent hover:bg-white hover:text-primary transition-all duration-500 rounded-[1.5rem] md:rounded-[2.5rem] h-16 md:h-24 px-8 md:px-16 font-black uppercase text-[11px] md:text-[14px] tracking-[0.3em] shadow-3xl text-primary scale-100 md:scale-105 hover:scale-110 active:scale-95">AKADEMİK TAKVİM</Button>
        </div>
      </section>

      <div className="space-y-12 md:space-y-16">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 px-4 md:px-8">
             <h2 className="text-3xl md:text-5xl font-black italic tracking-tighter text-primary uppercase leading-none text-shadow-deep text-center md:text-left">GÜNLÜK AKADEMİK BLOKLARIN</h2>
             <Badge className="bg-white text-primary border-2 border-slate-100 rounded-3xl px-8 py-3.5 font-black uppercase text-[11px] md:text-[12px] tracking-[0.2em] shadow-lg whitespace-nowrap">{format(new Date(), 'd MMMM yyyy', { locale: tr })}</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 lg:gap-10">
             {currentDayPlan?.blocks?.map((block: any) => (
                <Card 
                  key={block.id} 
                  className={cn(
                    "p-6 md:p-10 rounded-[2.5rem] md:rounded-[4.5rem] border-none transition-all hover:scale-[1.01] md:hover:scale-[1.02] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] group relative overflow-hidden bg-white flex flex-col h-full",
                    block.status === 'done' && "opacity-90"
                  )}
                >
                   <div className="space-y-8 md:space-y-10 relative z-10 flex-1 flex flex-col">
                        <div className="flex justify-between items-start gap-4">
                           <div className="space-y-1 flex-1 min-w-0">
                              <h4 className="text-xl md:text-2xl lg:text-[2.5rem] font-black italic leading-[0.85] tracking-tighter uppercase text-primary text-shadow-deep break-words line-clamp-3">
                                {block.topic}
                              </h4>
                              <div className="flex items-center gap-3 mt-4">
                                 <div className="h-1 w-8 bg-accent/20 rounded-full" />
                                 <span className="text-[8px] font-black uppercase tracking-[0.2em] text-accent italic">
                                    HEDEF: {block.targetQuestions || 40} SORU
                                 </span>
                              </div>
                           </div>
                           <Badge className={cn("px-4 py-2 rounded-full text-[9px] font-black", block.status === 'done' ? "bg-emerald-500 text-white" : "bg-[#FF4D6D] text-white shadow-lg")}>
                              {block.status === 'done' ? 'OK' : 'BEK'}
                           </Badge>
                        </div>

                        <div className="grid grid-cols-1 gap-4 flex-1">
                           <div className="p-5 md:p-6 rounded-[2rem] bg-slate-50/50 border border-slate-100 space-y-4 hover:bg-white transition-all">
                              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                                 <span className="text-[8px] font-black text-primary/30 uppercase tracking-[0.2em]">KAYNAKLAR</span>
                                 <div className="flex gap-4">
                                    {block.youtubeUrl && <a href={block.youtubeUrl} target="_blank" className="hover:scale-125 transition-all text-rose-500"><Youtube className="h-6 w-6" /></a>}
                                    {block.pdfUrl && <a href={block.pdfUrl} target="_blank" className="hover:scale-125 transition-all text-blue-500"><FileText className="h-6 w-6" /></a>}
                                    {block.mebiUrl && <a href={block.mebiUrl} target="_blank" className="hover:scale-125 transition-all text-emerald-500"><BookOpen className="h-6 w-6" /></a>}
                                 </div>
                              </div>
                              <p className="text-[10px] font-black text-primary opacity-60 uppercase italic">{block.phase1?.type || 'AKADEMİK ÇALIŞMA'}</p>
                           </div>

                           <div className="p-5 md:p-6 rounded-[2rem] bg-slate-50/50 border border-slate-100 space-y-4 hover:bg-white transition-all">
                              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                                 <span className="text-[8px] font-black text-primary/30 uppercase tracking-[0.2em]">DURUM</span>
                                 <div className="flex items-center gap-2">
                                    <span className="text-base font-black text-primary italic">{block.phase1?.time || '10:00'}</span>
                                 </div>
                              </div>
                              <p className="text-[10px] font-black text-primary opacity-60 uppercase italic">{block.phase2?.type || 'TEST ÇALIŞMASI'}</p>
                           </div>
                        </div>

                        {block.reminder && (
                          <div className="p-4 bg-accent/5 border border-accent/10 rounded-[1.5rem] flex items-center gap-3">
                             <BellRing className="h-4 w-4 text-accent shrink-0" />
                             <p className="text-[9px] font-black text-primary italic leading-tight">{block.reminder}</p>
                          </div>
                        )}

                        <div className="flex justify-between gap-2 pt-6 border-t border-slate-50 mt-auto">
                           <Button onClick={() => handleTaskAction(block.id, 'done')} size="icon" className={cn("h-12 w-12 rounded-full shadow-xl transition-all", block.status === 'done' ? "bg-slate-100 text-slate-400" : "bg-emerald-500 text-white")}><CheckCircle2 className="h-6 w-6" /></Button>
                           <div className="flex gap-2">
                             <Button onClick={() => router.push('/dashboard/planning')} size="icon" variant="outline" className="h-12 w-12 rounded-full bg-white border-2 border-slate-100 hover:border-primary text-slate-900 shadow-md"><Edit3 className="h-5 w-5" /></Button>
                           </div>
                        </div>
                   </div>
                </Card>
             ))}
             {(!currentDayPlan || currentDayPlan?.blocks?.length === 0) && (
                <Card onClick={() => router.push('/dashboard/planning')} className="lg:col-span-4 h-[400px] text-center bg-white rounded-[2.5rem] md:rounded-[5.5rem] border-4 border-dashed border-slate-200 flex flex-col items-center justify-center gap-6 cursor-pointer hover:border-accent/20 transition-all group px-6">
                   <Zap className="h-12 w-12 text-accent opacity-20 group-hover:scale-110 transition-transform" />
                   <p className="text-xl md:text-2xl font-black uppercase tracking-[0.3em] text-primary/20 italic">AKADEMİK BLOKLAR BEKLENİYOR</p>
                </Card>
             )}
        </div>
      </div>
    </div>
  );
}
