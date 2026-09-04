
'use client';

import { useDoc, useFirestore } from '@/firebase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, Brain, CheckCircle2, Loader2, 
  Youtube, FileText, Edit3, BookOpen, 
  Zap, Clock, CalendarDays, ArrowRight,
  Link as LinkIcon, Target, Calendar
} from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

export function StudentView({ user, userData }: { user: any, userData: any }) {
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  
  const [today, setToday] = useState('');
  useEffect(() => { setToday(format(new Date(), 'yyyy-MM-dd')); }, []);

  const { data: studyPlan, loading: planLoading } = useDoc<any>(user?.uid ? `studyPlans/${user.uid}` : null);
  
  const currentDayPlan = useMemo(() => {
    if (!studyPlan?.masterPlan || !today) return null;
    return studyPlan.masterPlan.find((d: any) => d.date === today);
  }, [studyPlan, today]);

  const handleTaskAction = async (blockId: string) => {
    if (!db || !user || !studyPlan || !today) return;
    const newPlan = studyPlan.masterPlan.map((day: any) => {
      if (day.date === today) {
        return { 
          ...day, 
          blocks: day.blocks.map((b: any) => b.id === blockId ? { ...b, status: b.status === 'done' ? 'planned' : 'done' } : b) 
        };
      }
      return day;
    });
    await updateDoc(doc(db, 'studyPlans', user.uid), { masterPlan: newPlan, updatedAt: serverTimestamp() });
    toast({ title: 'Terminal Güncellendi', className: "bg-primary text-white rounded-2xl shadow-2xl" });
  };

  if (planLoading) return (
    <div className="p-20 flex flex-col items-center justify-center gap-6 min-h-[60vh]">
      <Loader2 className="h-10 w-10 animate-spin text-accent" />
      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/40 italic">Akademik Motor Senkronize Ediliyor...</p>
    </div>
  );

  return (
    <div className="p-4 md:p-14 space-y-16 max-w-[1800px] mx-auto w-full animate-in fade-in duration-1000 bg-[#F8FAFC]">
      <section className="space-y-14">
        <div className="flex flex-col md:flex-row items-center justify-between gap-10 px-2">
           <div className="space-y-2 text-center md:text-left">
              <h2 className="text-5xl md:text-[9rem] font-black italic leading-[0.8] tracking-tighter text-primary uppercase text-shadow-premium">
                 BUGÜNKÜ<br />BLOKLARIN
              </h2>
           </div>
           <Card className="bg-white rounded-[2.5rem] px-12 py-8 flex items-center gap-6 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] border-none shrink-0 w-full md:w-auto">
              <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center">
                 <Calendar className="h-7 w-7 text-primary opacity-20" />
              </div>
              <div className="text-right flex-1 md:flex-none">
                 <p className="text-3xl font-black italic tracking-tighter text-primary leading-none">{format(new Date(), 'd MMMM', { locale: tr }).toUpperCase()}</p>
                 <p className="text-[12px] font-black text-primary/20 uppercase tracking-[0.4em] mt-1.5">{format(new Date(), 'yyyy')}</p>
              </div>
           </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
             {currentDayPlan?.blocks?.map((block: any) => (
                <Card 
                  key={block.id} 
                  className={cn(
                    "p-10 md:p-12 rounded-[5.5rem] border-none transition-all hover:scale-[1.03] shadow-[0_50px_100px_-25px_rgba(0,0,0,0.12)] group relative overflow-hidden bg-white h-full flex flex-col",
                    block.status === 'done' && "opacity-60"
                  )}
                >
                   <div className="space-y-12 relative z-10 flex-1 flex flex-col">
                        <div className="flex justify-between items-center">
                           <div className="flex items-center gap-4">
                              <div className="px-6 py-2.5 rounded-2xl bg-[#FFF8E7] text-[#B45309] flex items-center gap-2 border border-[#FEF3C7] shadow-sm">
                                <Clock className="h-4 w-4" />
                                <span className="text-[14px] font-black">{block.phase1?.time || '10:00'}</span>
                              </div>
                              <span className="text-[11px] font-black text-primary/20 uppercase tracking-[0.3em] italic">#{String(block.lesson).includes('AYT') ? 'AYT' : 'TYT'}</span>
                           </div>
                           <Badge 
                             onClick={() => handleTaskAction(block.id)}
                             className={cn(
                               "px-8 py-3 rounded-2xl text-[11px] font-black shrink-0 shadow-xl border-none cursor-pointer active:scale-95 transition-all", 
                               block.status === 'done' ? "bg-emerald-500 text-white" : "bg-[#FF4D6D] text-white hover:bg-[#FF4D6D]/90"
                             )}
                           >
                              {block.status === 'done' ? 'TAMAM' : 'BEK'}
                           </Badge>
                        </div>

                        <div className="space-y-1">
                           <h4 className="text-4xl md:text-[4rem] font-black italic leading-[0.85] tracking-tighter uppercase text-primary text-shadow-premium">
                              {block.topic}
                           </h4>
                        </div>

                        <div className="bg-[#F8FAFC]/50 rounded-[4rem] p-10 space-y-10 border border-slate-50 shadow-inner flex-1 flex flex-col justify-center">
                           <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                 <span className="text-[11px] font-bold text-primary/30 uppercase tracking-[0.2em] italic">KONU ÇALIŞMA</span>
                                 <div className="flex gap-4 items-center">
                                    {block.youtubeUrl && <Youtube className="h-5 w-5 text-rose-500 opacity-60" />}
                                    {block.mebiUrl && <BookOpen className="h-5 w-5 text-emerald-500 opacity-60" />}
                                    {block.pdfUrl && <FileText className="h-5 w-5 text-blue-500 opacity-60" />}
                                 </div>
                              </div>
                           </div>
                           
                           <div className="h-px w-full bg-slate-200/40" />

                           <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                 <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-accent shadow-[0_0_15px_rgba(245,158,11,0.6)]" />
                                    <span className="text-[12px] font-black text-accent uppercase tracking-[0.2em] italic">TEST ÇÖZME</span>
                                 </div>
                                 <div className="flex gap-4 items-center">
                                    {block.testYoutubeUrl && <Youtube className="h-5 w-5 text-rose-500 opacity-80" />}
                                    {block.testUrl && <BookOpen className="h-5 w-5 text-emerald-500 opacity-80" />}
                                    {block.testPdfUrl && <FileText className="h-5 w-5 text-blue-500 opacity-80" />}
                                 </div>
                              </div>
                           </div>
                        </div>
                   </div>
                </Card>
             ))}
             
             {(!currentDayPlan || currentDayPlan?.blocks?.length === 0) && (
                <Card onClick={() => router.push('/dashboard/planning')} className="lg:col-span-4 h-[500px] text-center bg-white rounded-[5rem] border-4 border-dashed border-slate-100 flex flex-col items-center justify-center gap-10 cursor-pointer hover:border-accent/30 transition-all group w-full">
                   <Zap className="h-24 w-24 text-accent opacity-20 group-hover:scale-110 transition-transform" />
                   <div className="space-y-4">
                      <p className="text-4xl font-black uppercase tracking-[0.4em] text-primary/20 italic">BUGÜN BOŞ</p>
                      <p className="text-sm font-bold text-primary/10 uppercase tracking-widest italic">AKADEMİK TERMİNALİ ÇALIŞTIRIN</p>
                   </div>
                </Card>
             )}
        </div>
      </section>
    </div>
  );
}
