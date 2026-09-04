'use client';

import { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format, isBefore, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';
import { doc, serverTimestamp, updateDoc } from 'firebase/firestore';

import { useDoc, useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import {
  Brain,
  CheckCircle2,
  Loader2,
  Youtube,
  FileText,
  Edit3,
  BookOpen,
  Zap,
  CalendarDays,
  Clock3,
} from 'lucide-react';

export function StudentView({ user, userData }: { user: any, userData: any }) {
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  
  const [today, setToday] = useState<string>('');

  useEffect(() => {
    setToday(format(new Date(), 'yyyy-MM-dd'));
  }, []);

  const { data: studyPlan, loading: planLoading } = useDoc<any>(
    user?.uid ? `studyPlans/${user.uid}` : null
  );

  const activeBlocks = useMemo(() => {
    if (!studyPlan?.masterPlan?.length || !today) return [];
    
    // OTONOM GÖREV DEVRİ MANTIĞI: Geçmiş günlerde yapılmayanları bugüne ekle
    const todayPlan = studyPlan.masterPlan.find((day: any) => day.date === today);
    const pastUnfinished: any[] = [];
    
    studyPlan.masterPlan.forEach((day: any) => {
      if (isBefore(parseISO(day.date), parseISO(today))) {
        const unfinished = (day.blocks || []).filter((b: any) => b.status !== 'done');
        pastUnfinished.push(...unfinished.map((b: any) => ({
          ...b,
          isDelayed: true,
          originalDate: day.date
        })));
      }
    });

    const currentBlocks = [...(todayPlan?.blocks || [])];
    return [...pastUnfinished, ...currentBlocks];
  }, [studyPlan, today]);

  const completedCount = useMemo(() => activeBlocks.filter((block) => block.status === 'done').length, [activeBlocks]);

  const handleTaskAction = async (blockId: string) => {
    if (!db || !user?.uid || !studyPlan?.masterPlan) return;
    try {
      const newPlan = studyPlan.masterPlan.map((day: any) => ({
        ...day,
        blocks: (day.blocks ?? []).map((block: any) => {
          if (block.id !== blockId) return block;
          return { ...block, status: block.status === 'done' ? 'planned' : 'done' };
        }),
      }));

      await updateDoc(doc(db, 'studyPlans', user.uid), { 
        masterPlan: newPlan, 
        updatedAt: serverTimestamp() 
      });
      
      toast({ title: 'Terminal Güncellendi', className: 'bg-primary text-white rounded-2xl shadow-2xl' });
    } catch (error) {
      toast({ title: 'Hata', variant: 'destructive' });
    }
  };

  if (planLoading || !today) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 p-20">
        <Loader2 className="h-10 w-10 animate-spin text-accent" />
        <p className="text-[10px] font-black uppercase italic tracking-[0.4em] text-primary/40">Terminal Senkronize Ediliyor...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1800px] space-y-10 bg-[#F8FAFC] p-4 animate-in fade-in duration-700 md:p-10 lg:p-14">
      <section className="group relative overflow-hidden rounded-[3.5rem] bg-primary p-8 text-white shadow-[0_40px_100px_-30px_rgba(15,23,42,0.5)] md:p-12">
        <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-accent/10 blur-[130px]" />
        <div className="relative z-10 flex flex-col items-center justify-between gap-10 lg:flex-row">
          <div className="flex-1 space-y-5 text-center lg:text-left">
            <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-5 py-2 text-[10px] font-black uppercase tracking-[0.25em] text-accent">
              <Brain className="h-5 w-5 animate-pulse" /> DEK Yapay Zekâ Mentoru
            </div>
            <h1 className="max-w-4xl text-3xl font-black uppercase italic leading-[1] tracking-tight md:text-5xl">
              Bugün seni <span className="text-accent">{activeBlocks.length}</span> akademik çalışma bloğu bekliyor.
            </h1>
            <div className="flex flex-wrap justify-center gap-3 pt-2 lg:justify-start">
              <div className="flex items-center gap-2 rounded-2xl bg-white/5 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-white/70">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" /> {completedCount}/{activeBlocks.length} tamamlandı
              </div>
              <div className="flex items-center gap-2 rounded-2xl bg-white/5 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-white/70">
                <CalendarDays className="h-4 w-4 text-accent" /> {format(new Date(), 'd MMMM yyyy', { locale: tr })}
              </div>
            </div>
          </div>
          <Button onClick={() => router.push('/dashboard/planning')} className="h-16 w-full rounded-2xl border-none bg-accent px-10 text-[11px] font-black uppercase tracking-[0.22em] text-primary shadow-xl transition-all hover:bg-white lg:w-auto">
            <CalendarDays className="mr-2 h-4 w-4" /> Akademik Takvim
          </Button>
        </div>
      </section>

      <section className="space-y-7">
        <div className="flex flex-col justify-between gap-5 px-1 md:flex-row md:items-center">
          <div>
            <p className="mb-1 text-[9px] font-black uppercase tracking-[0.3em] text-accent italic">AKADEMİK AKIŞ</p>
            <h2 className="text-2xl font-black uppercase italic tracking-tight text-primary md:text-4xl">Günlük Terminal Blokların</h2>
          </div>
          <Badge variant="outline" className="w-fit rounded-2xl border-slate-200 bg-white px-5 py-3 text-[9px] font-black uppercase tracking-[0.18em] text-primary shadow-sm">
            <Clock3 className="mr-2 h-3.5 w-3.5" /> {format(new Date(), 'EEEE, d MMMM', { locale: tr })}
          </Badge>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {activeBlocks.map((block, index) => {
              const isDone = block.status === 'done';
              return (
                <Card key={block.id || `${today}-${index}`} className={cn('relative flex min-h-[380px] flex-col overflow-hidden rounded-[3rem] border border-slate-100 bg-white p-8 shadow-[0_20px_50px_-20px_rgba(15,23,42,0.18)] transition-all duration-300', isDone && 'opacity-60')}>
                  <div className={cn('absolute left-0 top-0 h-full w-2', isDone ? 'bg-emerald-500' : block.isDelayed ? 'bg-amber-500' : 'bg-accent')} />
                  <div className="flex flex-1 flex-col space-y-6">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="mb-2 text-[8px] font-black uppercase tracking-[0.25em] text-accent italic">#{String(block.lesson || 'GENEL').substring(0, 4).toUpperCase()}</p>
                        <h3 className="line-clamp-3 text-2xl font-black uppercase italic leading-[1] text-primary">{block.topic || 'Konu Belirleniyor'}</h3>
                      </div>
                      <Badge className={cn('shrink-0 rounded-full border-none px-4 py-1.5 text-[8px] font-black uppercase tracking-wider', isDone ? 'bg-emerald-500 text-white' : 'bg-[#FF4D6D] text-white shadow-lg')}>
                        {isDone ? 'Tamam' : block.isDelayed ? 'Gecikmiş' : 'Bekliyor'}
                      </Badge>
                    </div>

                    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 space-y-3 shadow-inner">
                      <p className="text-[7px] font-black uppercase tracking-[0.3em] text-slate-400">ÇALIŞMA STRATEJİSİ</p>
                      <p className="text-[11px] font-black uppercase italic text-primary/60">{block.phase1?.type || (block.isReview ? 'Stratejik Tekrar' : 'Ders Çalışması')}</p>
                    </div>

                    <div className="space-y-4">
                      <p className="text-[7px] font-black uppercase tracking-[0.3em] text-slate-400">TERMİNAL KAYNAKLARI</p>
                      <div className="flex gap-3">
                        {block.youtubeUrl && (
                          <a href={block.youtubeUrl} target="_blank" rel="noopener noreferrer" className="flex h-11 w-11 items-center justify-center rounded-full bg-rose-50 text-rose-500 border border-rose-100 hover:bg-rose-500 hover:text-white transition-all hover:scale-110 shadow-sm"><Youtube className="h-5 w-5" /></a>
                        )}
                        {block.pdfUrl && (
                          <a href={block.pdfUrl} target="_blank" rel="noopener noreferrer" className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-50 text-blue-500 border border-blue-100 hover:bg-blue-500 hover:text-white transition-all hover:scale-110 shadow-sm"><FileText className="h-5 w-5" /></a>
                        )}
                        {block.mebiUrl && (
                          <a href={block.mebiUrl} target="_blank" rel="noopener noreferrer" className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-500 hover:text-white transition-all hover:scale-110 shadow-sm"><BookOpen className="h-5 w-5" /></a>
                        )}
                      </div>
                    </div>

                    <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-6">
                      <button onClick={() => handleTaskAction(block.id)} className={cn('h-12 flex-1 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-2', isDone ? 'bg-slate-100 text-slate-500' : 'bg-emerald-500 text-white')}>
                        <CheckCircle2 className="h-4 w-4" /> {isDone ? 'Geri Al' : 'Tamamla'}
                      </button>
                      <button onClick={() => router.push('/dashboard/planning')} className="ml-3 h-12 w-12 shrink-0 rounded-xl border border-slate-200 bg-white text-primary shadow-sm hover:border-primary transition-all flex items-center justify-center">
                        <Edit3 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </Card>
              );
            }
          )}

          {activeBlocks.length === 0 && (
            <Card onClick={() => router.push('/dashboard/planning')} className="col-span-1 flex min-h-[320px] cursor-pointer flex-col items-center justify-center gap-6 rounded-[4rem] border-4 border-dashed border-slate-200 bg-white text-center transition-all hover:border-accent group w-full xl:col-span-4 md:col-span-2">
              <Zap className="h-10 w-10 text-accent animate-pulse" />
              <h3 className="text-xl font-black uppercase italic text-primary">AKADEMİK TAKVİM BEKLENİYOR</h3>
              <Button className="h-14 px-8 rounded-2xl bg-primary text-white font-black text-[10px] uppercase tracking-widest shadow-2xl">AKADEMİK PLANI OLUŞTUR</Button>
            </Card>
          )}
        </div>
      </section>
    </div>
  );
}
