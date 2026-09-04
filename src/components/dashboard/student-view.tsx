
'use client';

import { useDoc, useFirestore } from '@/firebase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, Brain, CheckCircle2, Loader2, 
  Youtube, FileText, Edit3, BookOpen, 
  Zap, Clock, CalendarDays, ArrowRight,
  Link as LinkIcon, Target, TrendingUp
} from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { format, parseISO, isBefore, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
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
  
  const currentPlan = useMemo(() => {
    if (!studyPlan?.masterPlan || !today) return null;
    return studyPlan.masterPlan.find((d: any) => d.date === today) || studyPlan.masterPlan[0];
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

  const handleTaskAction = async (blockId: string, action: string) => {
    if (!db || !user || !studyPlan || !today) return;
    const newPlan = studyPlan.masterPlan.map((day: any) => {
      if (day.date === currentPlan?.date) {
        return { ...day, blocks: day.blocks.map((b: any) => b.id === blockId ? { ...b, status: b.status === 'done' ? 'planned' : 'done' } : b) };
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
    <div className="p-4 md:p-14 space-y-14 max-w-[1800px] mx-auto w-full animate-in fade-in duration-1000 bg-[#F8FAFC]">
      <header className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 bg-primary text-white rounded-[4rem] p-10 md:p-14 relative overflow-hidden group shadow-[0_60px_120px_-20px_rgba(15,23,42,0.4)]">
          <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 blur-[150px] rounded-full" />
          <div className="relative z-10 space-y-8">
            <div className="inline-flex items-center gap-4 text-accent font-black text-[10px] uppercase tracking-[0.3em] italic bg-white/5 px-6 py-2 rounded-full border border-white/10">
              <Brain className="h-5 w-5 animate-pulse" /> 2026-2027 AKADEMİK PLAN
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
              <h3 className="text-2xl font-black italic tracking-tighter uppercase text-primary">AKADEMİK DURUM</h3>
              <div className="space-y-6">
                 <div className="flex items-center justify-between"><span className="text-[10px] font-black uppercase text-muted-foreground italic">AYT BAŞLANGICI</span><Badge className="bg-accent text-primary">01 ARALIK</Badge></div>
                 <div className="flex items-center justify-between"><span className="text-[10px] font-black uppercase text-muted-foreground italic">HEDEF SINAV</span><Badge className="bg-primary text-white">15 HAZİRAN</Badge></div>
                 <div className="flex items-center justify-between"><span className="text-[10px] font-black uppercase text-muted-foreground italic">MOD</span><Badge variant="outline" className="text-emerald-500 border-emerald-100">TYT MASTER</Badge></div>
              </div>
           </div>
           <Button onClick={() => router.push('/dashboard/planning')} className="h-16 w-full rounded-2xl bg-[#0F172A] hover:bg-accent text-white font-black text-[10px] uppercase tracking-widest gap-3 shadow-2xl transition-all">AKADEMİK TAKVİMİ AÇ <ArrowRight className="h-4 w-4" /></Button>
        </Card>
      </header>

      <section className="space-y-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 px-4">
             <h2 className="text-3xl md:text-4xl font-black italic tracking-tighter text-primary uppercase text-shadow-deep">BUGÜNKÜ AKADEMİK BLOKLARIN</h2>
             <Badge className="bg-white text-primary border-2 border-slate-100 rounded-3xl px-8 py-3.5 font-black uppercase text-[10px] tracking-[0.2em] shadow-lg">
                <CalendarDays className="h-4 w-4 mr-2" /> {currentPlan?.date ? format(parseISO(currentPlan.date), 'd MMMM yyyy', { locale: tr }) : 'Bugün'}
             </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
             {currentPlan?.blocks?.map((block: any) => (
                <Card key={block.id} className={cn("p-10 rounded-[4rem] border-none transition-all hover:scale-[1.02] shadow-xl group relative overflow-hidden bg-white h-full flex flex-col", block.status === 'done' && "opacity-60")}>
                   <div className="space-y-8 relative z-10 flex-1 flex flex-col">
                        <div className="flex justify-between items-start gap-2">
                           <div className="space-y-1 flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="px-3 py-1 rounded-lg bg-accent/10 text-accent flex items-center gap-1.5 border border-accent/20">
                                  <Clock className="h-3.5 w-3.5" />
                                  <span className="text-[10px] font-black">{block.phase1?.time || '10:00'}</span>
                                </div>
                                <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest italic">#{String(block.lesson || 'DERS').substring(0, 4).toUpperCase()}</p>
                              </div>
                              <h4 className="text-2xl font-black italic leading-tight tracking-tighter uppercase text-primary line-clamp-2">{block.topic}</h4>
                           </div>
                           <Badge className={cn("px-4 py-1.5 rounded-full text-[8px] font-black shrink-0", block.status === 'done' ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "bg-rose-500 text-white shadow-lg")}>
                              {block.status === 'done' ? 'TAMAM' : 'BEK'}
                           </Badge>
                        </div>

                        <div className="p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100 space-y-6 shadow-inner flex-1">
                           <div className="space-y-3">
                              <div className="flex justify-between items-center border-b border-slate-200 pb-2.5">
                                 <span className="text-[9px] font-black text-primary/40 uppercase tracking-[0.2em] italic">KONU ÇALIŞMA</span>
                                 <div className="flex gap-2">
                                    {block.youtubeUrl && <a href={block.youtubeUrl} target="_blank" className="text-rose-500 hover:scale-125 transition-all"><Youtube className="h-4 w-4" /></a>}
                                    {block.pdfUrl && <a href={block.pdfUrl} target="_blank" className="text-blue-500 hover:scale-125 transition-all"><FileText className="h-4 w-4" /></a>}
                                    {block.mebiUrl && <a href={block.mebiUrl} target="_blank" className="text-emerald-500 hover:scale-125 transition-all"><BookOpen className="h-4 w-4" /></a>}
                                 </div>
                              </div>
                           </div>
                           <div className="space-y-3">
                              <div className="flex justify-between items-center">
                                 <p className="text-[10px] font-black text-accent uppercase tracking-[0.2em] italic flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" /> TEST ÇÖZME</p>
                                 <div className="flex gap-2">
                                    {block.testYoutubeUrl && <a href={block.testYoutubeUrl} target="_blank" className="text-rose-500 hover:scale-125 transition-all"><Youtube className="h-4 w-4" /></a>}
                                    {block.testPdfUrl && <a href={block.testPdfUrl} target="_blank" className="text-blue-500 hover:scale-125 transition-all"><FileText className="h-4 w-4" /></a>}
                                    {block.testUrl && <a href={block.testUrl} target="_blank" className="text-emerald-500 hover:scale-125 transition-all"><BookOpen className="h-4 w-4" /></a>}
                                    {block.extraUrl && <a href={block.extraUrl} target="_blank" className="text-amber-500 hover:scale-125 transition-all"><LinkIcon className="h-4 w-4" /></a>}
                                 </div>
                              </div>
                           </div>
                        </div>

                        <div className="flex justify-between gap-2 pt-6 border-t border-slate-50 mt-auto">
                           <Button onClick={() => handleTaskAction(block.id, 'done')} className={cn("flex-1 h-12 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all", block.status === 'done' ? "bg-slate-100 text-slate-400 shadow-inner" : "bg-emerald-500 text-white shadow-xl shadow-emerald-500/20")}>
                              <CheckCircle2 className="h-4 w-4 mr-2" /> {block.status === 'done' ? 'GERİ AL' : 'TAMAMLA'}
                           </Button>
                           <Button onClick={() => router.push('/dashboard/planning')} variant="outline" size="icon" className="h-12 w-12 rounded-xl border-slate-100 hover:border-primary text-primary transition-all shadow-md"><Edit3 className="h-4 w-4" /></Button>
                        </div>
                   </div>
                </Card>
             ))}
        </div>
      </section>
    </div>
  );
}
