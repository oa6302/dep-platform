'use client';

import { useDoc, useFirestore } from '@/firebase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, Brain, CheckCircle2, Loader2, Clock, 
  Zap, Plus, Award, RotateCcw, FastForward, Gauge, Edit3, Trash2,
  Youtube, Globe
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

const LESSON_COLORS: Record<string, string> = {
  'TYT Matematik': '#0f172a',
  'AYT Matematik': '#1e293b',
  'Geometri': '#064e3b',
  'TYT Türkçe': '#1e40af',
  'Edebiyat': '#881337',
  'Tarih': '#7c2d12',
  'Coğrafya': '#14532d',
  'Felsefe': '#4c1d95',
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

  const handleTaskAction = async (blockId: string, action: string) => {
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
                const nextDiff = b.difficulty === 'KOLAY' ? 'ORTA' : b.difficulty === 'ORTA' ? 'ZOR' : 'KOLAY';
                return { ...b, difficulty: nextDiff };
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
    await updateDoc(doc(db, 'studyPlans', user.uid), { 
      masterPlan: newPlan,
      updatedAt: serverTimestamp()
    });
    
    if (action === 'done') toast({ title: 'İlerleme Kaydedildi', description: 'Fasikül bloğu saniyeler içinde güncellendi.' });
  };

  if (planLoading) return (
    <div className="p-20 flex flex-col items-center justify-center gap-6 min-h-[60vh]">
      <Loader2 className="h-12 w-12 animate-spin text-accent" />
      <p className="text-xs font-black uppercase tracking-[0.4em] text-primary/40 italic">Terminal Senkronize Ediliyor...</p>
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
               "Bugün 15 Haziran 2027 hedefine giden yolda {currentDayPlan?.blocks?.length || 0} devasa fasikül bloğu seni bekliyor."
            </p>
          </div>
          <Button onClick={() => router.push('/dashboard/planning')} className="bg-accent hover:bg-white hover:text-primary transition-all rounded-[2rem] h-20 px-12 font-black uppercase text-[12px] tracking-[0.2em] shadow-2xl text-primary">AKADEMİK TAKVİM</Button>
        </div>
      </section>

      <div className="space-y-12">
        <div className="flex items-center justify-between px-4">
             <h2 className="text-4xl font-black italic tracking-tighter text-primary uppercase leading-none">BUGÜNKÜ FASİKÜL BLOKLARIN</h2>
             <Badge className="bg-white text-primary border-2 border-slate-100 rounded-2xl px-6 py-2.5 font-black uppercase text-[11px] tracking-widest shadow-sm">{format(new Date(), 'd MMMM yyyy', { locale: tr })}</Badge>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
             {currentDayPlan?.blocks?.map((block: any) => (
                <Card 
                  key={block.id} 
                  className={cn(
                    "p-10 rounded-[5rem] border-none transition-all hover:scale-[1.02] shadow-[0_60px_120px_-30px_rgba(0,0,0,0.15)] group relative overflow-hidden bg-white border-t-[12px]",
                    block.status === 'done' && "opacity-70"
                  )}
                  style={{ borderTopColor: LESSON_COLORS[block.lesson] || '#334155' }}
                >
                   <div className="space-y-10 relative z-10">
                        <div className="flex justify-between items-start">
                           <span className="text-[10px] font-black uppercase px-6 py-2 rounded-full shadow-sm bg-slate-50 border border-slate-100 flex items-center gap-3 text-primary">
                             📋 {block.lesson.toUpperCase()}
                           </span>
                           <div className="flex items-center gap-4">
                             {block.status === 'done' ? (
                               <div className="bg-emerald-500 text-white px-5 py-2 rounded-full text-[10px] font-black flex items-center gap-2 shadow-lg">
                                 <CheckCircle2 className="h-4 w-4" /> TAMAMLANDI
                               </div>
                             ) : (
                               <div className="bg-rose-500 text-white px-5 py-2 rounded-full text-[10px] font-black flex items-center gap-2 shadow-lg">
                                 <Clock className="h-4 w-4" /> BEKLİYOR
                               </div>
                             )}
                           </div>
                        </div>

                        <div className="space-y-2">
                           <h4 className="text-[2.5rem] font-black italic leading-[0.9] tracking-tighter uppercase text-primary">
                              {block.topic}
                           </h4>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                           <div className="p-8 rounded-[3rem] bg-slate-50 border border-slate-100 space-y-4">
                              <div className="flex justify-between items-center border-b border-slate-200 pb-3 mb-2">
                                 <span className="text-[9px] font-black text-primary opacity-40 uppercase tracking-widest">AŞAMA 1: KONU</span>
                                 <span className="text-sm font-black text-primary italic">{block.phase1.time}</span>
                              </div>
                              <h5 className="font-black text-xl italic text-primary leading-none uppercase">{block.phase1.type}</h5>
                              <div className="flex flex-wrap gap-2">
                                 <span className="text-[9px] font-black uppercase bg-white px-3 py-1 rounded-xl text-primary border border-slate-200">⏱️ {block.phase1.duration}DK</span>
                                 <span className="text-[9px] font-black uppercase bg-white px-3 py-1 rounded-xl text-primary border border-slate-200">📝 {block.phase1.questionTarget} HEDEF</span>
                              </div>
                           </div>

                           {block.phase2 && (
                              <div className="p-8 rounded-[3rem] bg-accent/5 border border-accent/10 space-y-4">
                                 <div className="flex justify-between items-center border-b border-accent/20 pb-3 mb-2">
                                    <span className="text-[9px] font-black text-accent uppercase tracking-widest">AŞAMA 2: TEST</span>
                                    <span className="text-sm font-black text-primary italic">{block.phase2.time}</span>
                                 </div>
                                 <h5 className="font-black text-xl italic text-primary leading-none uppercase">{block.phase2.type}</h5>
                                 <div className="flex flex-wrap gap-2">
                                    <span className="text-[9px] font-black uppercase bg-white px-3 py-1 rounded-xl text-accent border border-accent/20">⏱️ {block.phase2.duration}DK</span>
                                    <span className="text-[9px] font-black uppercase bg-white px-3 py-1 rounded-xl text-accent border border-accent/20">📝 {block.phase2.questionTarget} SORU</span>
                                 </div>
                              </div>
                           )}
                        </div>

                        <div className="grid grid-cols-3 md:grid-cols-6 gap-4 pt-6 border-t border-slate-50 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
                           <Button onClick={() => handleTaskAction(block.id, 'done')} size="icon" variant="ghost" className={cn("h-14 w-14 rounded-3xl transition-all shadow-xl", block.status === 'done' ? "bg-slate-100 text-slate-400" : "bg-emerald-500 text-white")}><CheckCircle2 className="h-6 w-6" /></Button>
                           <Button onClick={() => handleTaskAction(block.id, 'repeat')} size="icon" variant="outline" className="h-14 w-14 rounded-3xl bg-white hover:bg-orange-50 text-orange-500"><RotateCcw className="h-6 w-6" /></Button>
                           <Button onClick={() => handleTaskAction(block.id, 'skip')} size="icon" variant="outline" className="h-14 w-14 rounded-3xl bg-white hover:bg-slate-50 text-slate-400"><FastForward className="h-6 w-6" /></Button>
                           <Button onClick={() => handleTaskAction(block.id, 'level')} size="icon" variant="outline" className="h-14 w-14 rounded-3xl bg-white hover:bg-blue-50 text-blue-500"><Gauge className="h-6 w-6" /></Button>
                           <Button size="icon" variant="outline" className="h-14 w-14 rounded-3xl bg-white text-slate-900"><Edit3 className="h-6 w-6" /></Button>
                           <Button onClick={() => handleTaskAction(block.id, 'delete')} size="icon" variant="outline" className="h-14 w-14 rounded-3xl bg-white hover:bg-rose-50 text-rose-500"><Trash2 className="h-6 w-6" /></Button>
                        </div>
                   </div>
                </Card>
             ))}
             {!currentDayPlan && (
                <Card onClick={() => router.push('/dashboard/planning')} className="h-[500px] text-center bg-white rounded-[5rem] border-4 border-dashed border-slate-200 flex flex-col items-center justify-center gap-8 cursor-pointer hover:border-accent/20 transition-all group shadow-inner">
                   <Zap className="h-20 w-20 text-accent opacity-20 animate-pulse" />
                   <p className="text-2xl font-black uppercase tracking-[0.3em] text-primary/20 italic">FASİKÜL BLOKLARI BEKLENİYOR</p>
                   <Button className="h-20 px-12 rounded-[2rem] bg-primary font-black uppercase text-[11px] tracking-widest text-white">PLANI OLUŞTUR VE BAŞLA</Button>
                </Card>
             )}
        </div>
      </div>
    </div>
  );
}
