
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

  const stats = useMemo(() => {
    if (!studyPlan?.masterPlan) return { percent: 0, completed: 0, total: 0 };
    let total = 0;
    let done = 0;
    studyPlan.masterPlan.forEach((d: any) => {
      d.blocks?.forEach((b: any) => {
        total++;
        if (b.status === 'done') done++;
      });
    });
    return { percent: total > 0 ? Math.round((done / total) * 100) : 0, completed: done, total };
  }, [studyPlan]);

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
    <div className="p-6 md:p-14 space-y-16 max-w-[1800px] mx-auto w-full animate-in fade-in duration-1000 bg-[#F8FAFC]">
      {/* İlerleme Paneli */}
      <header className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 bg-primary text-white rounded-[4rem] p-10 md:p-14 relative overflow-hidden group shadow-[0_60px_120px_-20px_rgba(15,23,42,0.4)]">
          <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 blur-[150px] rounded-full" />
          <div className="relative z-10 space-y-8">
            <div className="inline-flex items-center gap-4 text-accent font-black text-[10px] uppercase tracking-[0.3em] italic bg-white/5 px-6 py-2 rounded-full border border-white/10">
              <Brain className="h-5 w-5 animate-pulse" /> 2026-2027 ADAPTIVE PLAN
            </div>
            <h1 className="text-4xl md:text-6xl font-black italic leading-[0.95] tracking-tighter uppercase text-white">
               Genel İlerleme: %{stats.percent}
            </h1>
            <div className="h-4 w-full bg-white/10 rounded-full overflow-hidden shadow-inner">
               <div className="h-full bg-accent transition-all duration-[2000ms]" style={{ width: `${stats.percent}%` }} />
            </div>
            <div className="grid grid-cols-3 gap-6 pt-4">
              <div><p className="text-2xl font-black text-accent italic">+{stats.completed}</p><p className="text-[8px] font-bold opacity-40 uppercase tracking-widest">TAMAMLANAN</p></div>
              <div><p className="text-2xl font-black text-white italic">%{100-stats.percent}</p><p className="text-[8px] font-bold opacity-40 uppercase tracking-widest">KALAN YOL</p></div>
              <div><p className="text-2xl font-black text-white italic">288</p><p className="text-[8px] font-bold opacity-40 uppercase tracking-widest">KALAN GÜN</p></div>
            </div>
          </div>
        </Card>

        <Card className="rounded-[4rem] border-none bg-white p-10 space-y-8 shadow-xl flex flex-col justify-between">
           <div className="space-y-4">
              <h3 className="text-2xl font-black italic tracking-tighter uppercase text-primary">AKADEMİK HEDEF</h3>
              <div className="space-y-6">
                 <div className="flex items-center justify-between"><span className="text-[10px] font-black uppercase text-muted-foreground italic">AYT START</span><Badge className="bg-accent text-primary">01 ARALIK</Badge></div>
                 <div className="flex items-center justify-between"><span className="text-[10px] font-black uppercase text-muted-foreground italic">SINAV TARİHİ</span><Badge className="bg-primary text-white">15 HAZİRAN 2027</Badge></div>
                 <div className="flex items-center justify-between"><span className="text-[10px] font-black uppercase text-muted-foreground italic">DURUM</span><Badge variant="outline" className="text-emerald-500 border-emerald-100 font-black">OTONOM AKTİF</Badge></div>
              </div>
           </div>
           <Button onClick={() => router.push('/dashboard/planning')} className="h-16 w-full rounded-2xl bg-[#0F172A] hover:bg-accent text-white font-black text-[10px] uppercase tracking-widest gap-3 shadow-2xl transition-all">TAKVİMİ YÖNET <ArrowRight className="h-4 w-4" /></Button>
        </Card>
      </header>

      {/* Görseldeki "BUGÜNKÜ BLOKLARIN" Bölümü */}
      <section className="space-y-14">
        <div className="flex items-start justify-between px-2">
           <div className="space-y-2">
              <h2 className="text-6xl md:text-8xl font-black italic leading-[0.8] tracking-tighter text-primary uppercase text-shadow-deep">
                 BUGÜNKÜ<br />BLOKLARIN
              </h2>
           </div>
           <Card className="bg-white rounded-[2.5rem] px-10 py-6 flex items-center gap-6 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] border-none">
              <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center">
                 <Calendar className="h-6 w-6 text-accent" />
              </div>
              <div className="text-right">
                 <p className="text-2xl font-black italic tracking-tighter text-primary leading-none">{format(new Date(), 'd MMMM', { locale: tr }).toUpperCase()}</p>
                 <p className="text-[12px] font-black text-primary/30 uppercase tracking-widest mt-1">{format(new Date(), 'yyyy')}</p>
              </div>
           </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
             {currentDayPlan?.blocks?.map((block: any) => (
                <Card 
                  key={block.id} 
                  className={cn(
                    "p-10 rounded-[5rem] border-none transition-all hover:scale-[1.03] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.12)] group relative overflow-hidden bg-white h-full flex flex-col",
                    block.status === 'done' && "opacity-60"
                  )}
                >
                   <div className="space-y-10 relative z-10 flex-1 flex flex-col">
                        <div className="flex justify-between items-center">
                           <div className="flex items-center gap-4">
                              <div className="px-5 py-2 rounded-2xl bg-accent/10 text-accent flex items-center gap-2 border border-accent/20">
                                <Clock className="h-4 w-4" />
                                <span className="text-[12px] font-black">{block.phase1?.time || '10:00'}</span>
                              </div>
                              <span className="text-[10px] font-black text-primary/20 uppercase tracking-widest italic font-bold">#TYT</span>
                           </div>
                           <Badge className={cn("px-6 py-2 rounded-2xl text-[10px] font-black shrink-0 shadow-lg border-none", block.status === 'done' ? "bg-emerald-500 text-white" : "bg-[#FF4D6D] text-white")}>
                              {block.status === 'done' ? 'TAMAM' : 'BEK'}
                           </Badge>
                        </div>

                        <div className="space-y-2">
                           <h4 className="text-4xl md:text-5xl font-black italic leading-[0.85] tracking-tighter uppercase text-primary text-shadow-deep line-clamp-3">
                              {block.topic}
                           </h4>
                        </div>

                        <div className="bg-[#F8FAFC] rounded-[3.5rem] p-10 space-y-8 shadow-inner flex-1 flex flex-col justify-center">
                           {/* KONU ÇALIŞMA */}
                           <div className="space-y-4">
                              <div className="flex justify-between items-center border-b border-slate-200/60 pb-5">
                                 <span className="text-[10px] font-black text-primary/30 uppercase tracking-[0.2em] italic">KONU ÇALIŞMA</span>
                                 <div className="flex gap-4">
                                    <Youtube className={cn("h-6 w-6 transition-all", block.youtubeUrl ? "text-rose-500 hover:scale-125" : "text-slate-200")} />
                                    <BookOpen className={cn("h-6 w-6 transition-all", block.mebiUrl ? "text-emerald-500 hover:scale-125" : "text-slate-200")} />
                                    <FileText className={cn("h-6 w-6 transition-all", block.pdfUrl ? "text-blue-500 hover:scale-125" : "text-slate-200")} />
                                 </div>
                              </div>
                           </div>
                           
                           {/* TEST ÇÖZME */}
                           <div className="space-y-4">
                              <div className="flex justify-between items-center">
                                 <div className="flex items-center gap-3">
                                    <div className="h-2 w-2 rounded-full bg-accent animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                                    <span className="text-[11px] font-black text-accent uppercase tracking-[0.2em] italic">TEST ÇÖZME</span>
                                 </div>
                                 <div className="flex gap-4">
                                    <Youtube className={cn("h-6 w-6 transition-all", block.testYoutubeUrl ? "text-rose-500 hover:scale-125" : "text-slate-200")} />
                                    <BookOpen className={cn("h-6 w-6 transition-all", block.testUrl ? "text-emerald-500 hover:scale-125" : "text-slate-200")} />
                                    <FileText className={cn("h-6 w-6 transition-all", block.testPdfUrl ? "text-blue-500 hover:scale-125" : "text-slate-200")} />
                                 </div>
                              </div>
                           </div>
                        </div>

                        <div className="flex justify-between gap-4 pt-4 mt-auto">
                           <Button 
                             onClick={() => handleTaskAction(block.id)} 
                             className={cn(
                               "flex-1 h-16 rounded-3xl text-[11px] font-black uppercase tracking-widest transition-all shadow-2xl", 
                               block.status === 'done' ? "bg-slate-100 text-slate-400" : "bg-emerald-500 text-white shadow-emerald-500/20"
                             )}
                           >
                              <CheckCircle2 className="h-5 w-5 mr-3" /> {block.status === 'done' ? 'GERİ AL' : 'TAMAMLA'}
                           </Button>
                           <Button 
                             onClick={() => router.push('/dashboard/planning')} 
                             variant="outline" 
                             size="icon" 
                             className="h-16 w-16 rounded-3xl bg-white border-slate-100 hover:border-primary text-slate-900 shadow-xl"
                           >
                             <Edit3 className="h-6 w-6" />
                           </Button>
                        </div>
                   </div>
                </Card>
             ))}
             
             {(!currentDayPlan || currentDayPlan?.blocks?.length === 0) && (
                <Card onClick={() => router.push('/dashboard/planning')} className="lg:col-span-4 h-[450px] text-center bg-white rounded-[5rem] border-4 border-dashed border-slate-200 flex flex-col items-center justify-center gap-8 cursor-pointer hover:border-accent/30 transition-all group w-full">
                   <Zap className="h-20 w-20 text-accent opacity-20 group-hover:scale-110 transition-transform" />
                   <div className="space-y-2">
                      <p className="text-3xl font-black uppercase tracking-[0.4em] text-primary/20 italic">GÜNLÜK PLAN BOŞ</p>
                      <p className="text-sm font-bold text-primary/10 uppercase tracking-widest italic">AKADEMİK TERMİNALİ ÇALIŞTIRIN</p>
                   </div>
                </Card>
             )}
        </div>
      </section>
    </div>
  );
}

