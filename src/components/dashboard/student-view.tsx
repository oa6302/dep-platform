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

const LESSON_COLORS: Record<string, string> = {
  'TYT Matematik': '#0f172a',
  'AYT Matematik': '#1e293b',
  'Felsefe': '#4c1d95',
  'TYT Türkçe': '#1e40af',
  'Edebiyat': '#881337',
  'Tarih': '#7c2d12',
  'Coğrafya': '#14532d',
  'Din Kültürü': '#312e81',
  'Genel': '#334155',
};

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
              if (action === 'repeat') return { ...b, status: 'repeat' };
              if (action === 'skip') return { ...b, status: 'skipped' };
              if (action === 'level') {
                const levels = ['KOLAY', 'ORTA', 'ZOR'];
                const nextIdx = (levels.indexOf(b.difficulty || 'ORTA') + 1) % levels.length;
                return { ...b, difficulty: levels[nextIdx] };
              }
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
      description: action === 'done' ? 'Başarı saniyeler içinde işlendi.' : 'Durum güncellendi.',
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
    <div className="p-8 lg:p-14 space-y-12 max-w-[1800px] mx-auto w-full animate-in fade-in duration-1000 bg-[#F8FAFC]">
      <section className="bg-primary text-white rounded-[4.5rem] p-16 relative overflow-hidden group shadow-[0_60px_120px_-20px_rgba(15,23,42,0.4)] transition-all">
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 blur-[150px] rounded-full" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="space-y-6 flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-4 text-accent font-black text-[12px] uppercase tracking-[0.3em] italic bg-white/5 px-6 py-2 rounded-full border border-white/10">
              <Brain className="h-5 w-5 animate-pulse" /> AOS YAPAY ZEKA MENTORU
            </div>
            <p className="text-4xl md:text-5xl font-black italic leading-[0.9] text-shadow-premium uppercase tracking-tighter">
               "Bugün 15 Haziran 2027 hedefine giden yolda {currentDayPlan?.blocks?.length || 0} devasa fasikül bloğu seni bekliyor."
            </p>
          </div>
          <Button onClick={() => router.push('/dashboard/planning')} className="bg-accent hover:bg-white hover:text-primary transition-all duration-500 rounded-[2.5rem] h-24 px-16 font-black uppercase text-[14px] tracking-[0.3em] shadow-3xl text-primary scale-105 hover:scale-110 active:scale-95">AKADEMİK TAKVİM</Button>
        </div>
      </section>

      <div className="space-y-16">
        <div className="flex items-center justify-between px-8">
             <h2 className="text-5xl font-black italic tracking-tighter text-primary uppercase leading-none text-shadow-deep">BUGÜNKÜ FASİKÜL BLOKLARIN</h2>
             <Badge className="bg-white text-primary border-2 border-slate-100 rounded-3xl px-8 py-3.5 font-black uppercase text-[12px] tracking-[0.2em] shadow-lg">{format(new Date(), 'd MMMM yyyy', { locale: tr })}</Badge>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-16">
             {currentDayPlan?.blocks?.map((block: any) => (
                <Card 
                  key={block.id} 
                  className={cn(
                    "p-12 rounded-[5.5rem] border-none transition-all hover:scale-[1.02] shadow-[0_70px_130px_-30px_rgba(0,0,0,0.18)] group relative overflow-hidden bg-white border-t-[14px]",
                    block.status === 'done' && "opacity-90"
                  )}
                  style={{ borderTopColor: LESSON_COLORS[block.lesson] || '#334155' }}
                >
                   <div className="space-y-12 relative z-10">
                        <div className="flex justify-between items-start">
                           <div className="space-y-2">
                              <h4 className="text-[3.5rem] font-black italic leading-[0.8] tracking-tighter uppercase text-primary text-shadow-deep line-clamp-1 max-w-[70%]">
                                {block.topic}
                              </h4>
                              <p className="text-[12px] font-bold text-muted-foreground/30 uppercase tracking-[0.4em] italic">
                                GÜNLÜK FASİKÜL MODÜLÜ
                              </p>
                           </div>
                           <div className="flex items-center gap-6">
                             {block.status === 'done' ? (
                               <div className="bg-emerald-500 text-white px-8 py-3 rounded-full text-[12px] font-black flex items-center gap-4 shadow-2xl animate-in zoom-in-75">
                                 <CheckCircle2 className="h-6 w-6" /> TAMAMLANDI
                               </div>
                             ) : (
                               <div className="bg-rose-500 text-white px-8 py-3 rounded-full text-[12px] font-black flex items-center gap-4 shadow-2xl">
                                 <Clock className="h-6 w-6" /> BEKLİYOR
                               </div>
                             )}
                           </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                           {/* Phase 1 */}
                           <div className="p-10 rounded-[4rem] bg-slate-50/50 border border-slate-100 space-y-8 relative overflow-hidden group/p1 transition-all hover:bg-white hover:shadow-2xl">
                              <div className="flex justify-between items-center border-b border-slate-200 pb-6">
                                 <span className="text-[11px] font-black text-primary/30 uppercase tracking-[0.3em]">1. AŞAMA: KONU</span>
                                 <span className="text-xl font-black text-primary italic">{block.phase1?.time || '10:00'}</span>
                              </div>
                              <h5 className="font-black text-[1.8rem] italic text-primary leading-tight uppercase group-hover/p1:text-accent transition-all">{block.phase1?.type || 'KONU ÇALIŞMASI'}</h5>
                              <div className="flex gap-8 pt-4">
                                 {block.phase1?.resources?.youtube && <a href={block.phase1.resources.youtube} target="_blank" className="hover:scale-125 transition-all text-rose-500 opacity-40 hover:opacity-100"><Youtube className="h-8 w-8" /></a>}
                                 {block.phase1?.resources?.pdf && <a href={block.phase1.resources.pdf} target="_blank" className="hover:scale-125 transition-all text-blue-500 opacity-40 hover:opacity-100"><FileText className="h-8 w-8" /></a>}
                                 {block.phase1?.resources?.kamp && <a href={block.phase1.resources.kamp} target="_blank" className="hover:scale-125 transition-all text-orange-500 opacity-40 hover:opacity-100"><Zap className="h-8 w-8" /></a>}
                                 {block.phase1?.resources?.ogm && <a href={block.phase1.resources.ogm} target="_blank" className="hover:scale-125 transition-all text-emerald-500 opacity-40 hover:opacity-100"><Globe className="h-8 w-8" /></a>}
                              </div>
                           </div>

                           {/* Phase 2 */}
                           <div className="p-10 rounded-[4rem] bg-orange-50/50 border border-orange-100 space-y-8 relative overflow-hidden group/p2 transition-all hover:bg-white hover:shadow-2xl">
                              <div className="flex justify-between items-center border-b border-orange-200 pb-6">
                                 <span className="text-[11px] font-black text-accent uppercase tracking-[0.3em]">2. AŞAMA: TEST</span>
                                 <span className="text-xl font-black text-primary italic">{block.phase2?.time || '11:00'}</span>
                              </div>
                              <h5 className="font-black text-[1.8rem] italic text-primary leading-tight uppercase group-hover/p2:text-accent transition-all">{block.phase2?.type || 'TEST ÇALIŞMASI'}</h5>
                              <div className="flex gap-8 pt-4">
                                 {block.phase2?.resources?.youtube && <a href={block.phase2.resources.youtube} target="_blank" className="hover:scale-125 transition-all text-rose-500 opacity-40 hover:opacity-100"><Youtube className="h-8 w-8" /></a>}
                                 {block.phase2?.resources?.pdf && <a href={block.phase2.resources.pdf} target="_blank" className="hover:scale-125 transition-all text-blue-500 opacity-40 hover:opacity-100"><FileText className="h-8 w-8" /></a>}
                                 {block.phase2?.resources?.kamp && <a href={block.phase2.resources.kamp} target="_blank" className="hover:scale-125 transition-all text-orange-500 opacity-40 hover:opacity-100"><Zap className="h-8 w-8" /></a>}
                                 {block.phase2?.resources?.ogm && <a href={block.phase2.resources.ogm} target="_blank" className="hover:scale-125 transition-all text-emerald-500 opacity-40 hover:opacity-100"><Globe className="h-8 w-8" /></a>}
                              </div>
                           </div>
                        </div>

                        {block.reminder && (
                          <div className="mt-8 p-8 bg-accent/5 border border-accent/10 rounded-[3rem] flex items-center gap-6 animate-in slide-in-from-top-4 duration-500 group/rem">
                             <div className="h-12 w-12 rounded-2xl bg-accent flex items-center justify-center text-primary shadow-xl group-hover/rem:scale-110 transition-transform">
                                <BellRing className="h-6 w-6" />
                             </div>
                             <p className="text-lg font-black text-primary italic leading-tight">{block.reminder}</p>
                          </div>
                        )}

                        <div className="flex justify-center gap-8 pt-12 border-t border-slate-50 opacity-0 group-hover:opacity-100 transition-all duration-700 translate-y-4 group-hover:translate-y-0">
                           <Button 
                             onClick={() => handleTaskAction(block.id, 'done')}
                             size="icon"
                             className={cn(
                               "h-20 w-20 rounded-full transition-all duration-500 shadow-[0_20px_40px_rgba(0,0,0,0.15)] hover:scale-110", 
                               block.status === 'done' ? "bg-slate-100 text-slate-400" : "bg-emerald-500 text-white shadow-emerald-500/30"
                             )}
                           ><CheckCircle2 className="h-9 w-9" /></Button>
                           
                           <Button 
                             onClick={() => handleTaskAction(block.id, 'repeat')}
                             size="icon" variant="outline" 
                             className="h-20 w-20 rounded-full bg-white border-2 border-slate-100 hover:border-orange-500 text-orange-500 hover:bg-orange-50 transition-all duration-500 hover:scale-110 shadow-xl"
                           ><RotateCcw className="h-9 w-9" /></Button>
                           
                           <Button 
                             onClick={() => handleTaskAction(block.id, 'skip')}
                             size="icon" variant="outline" 
                             className="h-20 w-20 rounded-full bg-white border-2 border-slate-100 hover:border-slate-400 text-slate-400 hover:bg-slate-50 transition-all duration-500 hover:scale-110 shadow-xl"
                           ><FastForward className="h-9 w-9" /></Button>
                           
                           <Button 
                             onClick={() => handleTaskAction(block.id, 'level')}
                             size="icon" variant="outline" 
                             className="h-20 w-20 rounded-full bg-white border-2 border-slate-100 hover:border-blue-500 text-blue-500 hover:bg-blue-50 transition-all duration-500 hover:scale-110 shadow-xl"
                           ><Gauge className="h-9 w-9" /></Button>
                           
                           <Button 
                             onClick={() => router.push('/dashboard/planning')}
                             size="icon" variant="outline" 
                             className="h-20 w-20 rounded-full bg-white border-2 border-slate-100 hover:border-primary text-slate-900 hover:bg-slate-50 transition-all duration-500 hover:scale-110 shadow-xl"
                           ><Edit3 className="h-9 w-9" /></Button>
                           
                           <Button 
                             onClick={() => handleTaskAction(block.id, 'delete')}
                             size="icon" variant="outline" 
                             className="h-20 w-20 rounded-full bg-white border-2 border-slate-100 hover:border-rose-500 text-rose-500 hover:bg-rose-50 transition-all duration-500 hover:scale-110 shadow-xl"
                           ><Trash2 className="h-9 w-9" /></Button>
                        </div>
                   </div>
                </Card>
             ))}
             {(!currentDayPlan || currentDayPlan?.blocks?.length === 0) && (
                <Card onClick={() => router.push('/dashboard/planning')} className="xl:col-span-2 h-[600px] text-center bg-white rounded-[5.5rem] border-4 border-dashed border-slate-200 flex flex-col items-center justify-center gap-10 cursor-pointer hover:border-accent/20 transition-all group shadow-inner">
                   <div className="h-32 w-32 bg-accent/5 rounded-full flex items-center justify-center animate-pulse group-hover:scale-110 transition-transform">
                      <Zap className="h-16 w-16 text-accent opacity-40" />
                   </div>
                   <div className="space-y-4">
                      <p className="text-3xl font-black uppercase tracking-[0.4em] text-primary/20 italic">FASİKÜL BLOKLARI BEKLENİYOR</p>
                      <p className="text-sm font-medium text-muted-foreground italic">Bugünkü programınızı saniyeler içinde oluşturun ve başarı yolculuğuna başlayın.</p>
                   </div>
                   <Button className="h-24 px-16 rounded-[2.5rem] bg-primary font-black uppercase text-[14px] tracking-[0.4em] text-white shadow-3xl hover:bg-accent transition-all">PLANI OLUŞTUR VE BAŞLA</Button>
                </Card>
             )}
        </div>
      </div>
    </div>
  );
}
