
'use client';

import { useDoc, useFirestore } from '@/firebase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, Brain, CheckCircle2, Loader2, 
  Youtube, FileText, Edit3, BookOpen, 
  Zap, Clock3, CalendarDays
} from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

export function StudentView({ user, userData }: { user: any, userData: any }) {
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  
  const [today, setToday] = useState('');

  useEffect(() => {
    setToday(format(new Date(), 'yyyy-MM-dd'));
  }, []);

  const { data: studyPlan, loading: planLoading } = useDoc<any>(user?.uid ? `studyPlans/${user.uid}` : null);
  
  const currentDayPlan = useMemo(() => {
    if (!studyPlan?.masterPlan || !today) return null;
    return studyPlan.masterPlan.find((p: any) => p.date === today);
  }, [studyPlan, today]);

  const handleTaskAction = async (blockId: string, action: string) => {
    if (!db || !user || !studyPlan || !today) return;
    
    const newPlan = studyPlan.masterPlan.map((day: any) => {
      if (day.date === today) {
        return {
          ...day,
          blocks: day.blocks.map((b: any) => {
            if (b.id === blockId) {
              if (action === 'done') return { ...b, status: b.status === 'done' ? 'planned' : 'done' };
              return b;
            }
            return b;
          })
        };
      }
      return day;
    });

    await updateDoc(doc(db, 'studyPlans', user.uid), { 
      masterPlan: newPlan,
      updatedAt: serverTimestamp()
    });
    
    toast({ title: 'Terminal Güncellendi', className: "bg-primary text-white rounded-2xl" });
  };

  if (planLoading) return (
    <div className="p-20 flex flex-col items-center justify-center gap-6 min-h-[60vh]">
      <Loader2 className="h-10 w-10 animate-spin text-accent" />
      <p className="text-[10px] font-black uppercase italic tracking-[0.4em] text-primary/40 italic">Terminal Senkronize Ediliyor...</p>
    </div>
  );

  return (
    <div className="p-4 md:p-14 space-y-12 max-w-[1800px] mx-auto w-full animate-in fade-in duration-1000 bg-[#F8FAFC]">
      <section className="bg-primary text-white rounded-[3.5rem] p-8 md:p-14 relative overflow-hidden group shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 blur-[150px] rounded-full" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="space-y-6 flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-4 text-accent font-black text-[10px] uppercase tracking-[0.3em] italic bg-white/5 px-6 py-2 rounded-full border border-white/10">
              <Brain className="h-5 w-5 animate-pulse" /> YKS TM MENTORU
            </div>
            <h1 className="text-3xl md:text-5xl font-black italic leading-[0.95] tracking-tighter uppercase text-white">
               Hoş Geldin, bugün seni {currentDayPlan?.blocks?.length || 0} akademik blok bekliyor.
            </h1>
          </div>
          <Button onClick={() => router.push('/dashboard/planning')} className="w-full md:w-auto bg-accent hover:bg-white text-primary transition-all rounded-[2rem] h-20 px-12 font-black uppercase text-[12px] tracking-[0.3em] shadow-3xl border-none">AKADEMİK TAKVİM</Button>
        </div>
      </section>

      <div className="space-y-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 px-4">
             <h2 className="text-3xl md:text-4xl font-black italic tracking-tighter text-primary uppercase text-shadow-deep">GÜNLÜK AKADEMİK BLOKLARIN</h2>
             <Badge className="bg-white text-primary border-2 border-slate-100 rounded-3xl px-8 py-3.5 font-black uppercase text-[10px] tracking-[0.2em] shadow-lg">
                <Clock3 className="h-4 w-4 mr-2" /> {format(new Date(), 'd MMMM yyyy', { locale: tr })}
             </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
             {currentDayPlan?.blocks?.map((block: any) => (
                <Card key={block.id} className={cn("p-8 rounded-[3.5rem] border-none transition-all hover:scale-[1.02] shadow-xl bg-white h-full flex flex-col", block.status === 'done' && "opacity-60")}>
                   <div className="space-y-6 flex-1 flex flex-col relative z-10">
                        <div className="flex justify-between items-start">
                           <div className="space-y-1 flex-1">
                              <p className="text-[8px] font-black text-accent uppercase tracking-widest italic">#{String(block.lesson || 'DERS').substring(0, 4).toUpperCase()}</p>
                              <h4 className="text-2xl font-black italic leading-tight tracking-tighter uppercase text-primary line-clamp-2">{block.topic}</h4>
                           </div>
                           <Badge className={cn("px-4 py-1.5 rounded-full text-[8px] font-black shrink-0", block.status === 'done' ? "bg-emerald-500 text-white shadow-lg" : "bg-rose-500 text-white shadow-lg")}>
                              {block.status === 'done' ? 'TAMAM' : 'BEK'}
                           </Badge>
                        </div>

                        <div className="space-y-4 flex-1">
                           <div className="p-5 rounded-3xl bg-slate-50 border border-slate-100 space-y-4 shadow-inner">
                              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                                 <span className="text-[8px] font-black text-primary/30 uppercase tracking-[0.2em]">KAYNAKLAR</span>
                                 <div className="flex gap-2">
                                    {block.youtubeUrl && <a href={block.youtubeUrl} target="_blank" rel="noopener noreferrer" className="h-8 w-8 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all shadow-sm"><Youtube className="h-4 w-4" /></a>}
                                    {block.pdfUrl && <a href={block.pdfUrl} target="_blank" rel="noopener noreferrer" className="h-8 w-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center hover:bg-blue-500 hover:text-white transition-all shadow-sm"><FileText className="h-4 w-4" /></a>}
                                    {block.mebiUrl && <a href={block.mebiUrl} target="_blank" rel="noopener noreferrer" className="h-8 w-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all shadow-sm"><BookOpen className="h-4 w-4" /></a>}
                                 </div>
                              </div>
                              <p className="text-[10px] font-bold text-primary opacity-60 uppercase italic">{block.phase1?.type || 'DERS ÇALIŞMASI'}</p>
                           </div>
                        </div>

                        <div className="flex justify-between gap-2 pt-6 border-t border-slate-50 mt-auto">
                           <Button onClick={() => handleTaskAction(block.id, 'done')} className={cn("flex-1 h-12 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all", block.status === 'done' ? "bg-slate-100 text-slate-400 shadow-inner" : "bg-emerald-500 text-white shadow-xl")}>
                              <CheckCircle2 className="h-4 w-4 mr-2" /> {block.status === 'done' ? 'GERİ AL' : 'TAMAMLA'}
                           </Button>
                           <Button onClick={() => router.push('/dashboard/planning')} variant="outline" size="icon" className="h-12 w-12 rounded-xl border-slate-100 hover:border-primary text-primary transition-all shadow-md"><Edit3 className="h-4 w-4" /></Button>
                        </div>
                   </div>
                </Card>
             ))}
             {(!currentDayPlan || currentDayPlan?.blocks?.length === 0) && (
                <Card onClick={() => router.push('/dashboard/planning')} className="lg:col-span-4 h-[300px] text-center bg-white rounded-[4rem] border-4 border-dashed border-slate-200 flex flex-col items-center justify-center gap-6 cursor-pointer hover:border-accent/20 transition-all group w-full">
                   <Zap className="h-10 w-10 text-accent opacity-20 group-hover:scale-110 transition-transform" />
                   <p className="text-xl font-black uppercase tracking-[0.4em] text-primary/20 italic">AKADEMİK TAKVİM BEKLENİYOR</p>
                </Card>
             )}
        </div>
      </div>
    </div>
  );
}
