'use client';

import { useDoc, useFirestore } from '@/firebase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import {
   Loader2,
   Youtube,
   FileText,
   BookOpen,
   Zap,
   Clock,
   Calendar,
   Edit3,
   Trash2,
} from 'lucide-react';

import { useMemo, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useRouter } from 'next/navigation';

import {
   doc,
   updateDoc,
   serverTimestamp,
} from 'firebase/firestore';

import { useToast } from '@/hooks/use-toast';

interface StudentViewProps {
   user: any;
   userData: any;
}

interface StudyBlock {
   id: string;
   lesson: string;
   topic: string;
   status: 'planned' | 'done' | 'skipped';

   phase1?: {
      type?: string;
      time?: string;
   };

   youtubeUrl?: string;
   mebiUrl?: string;
   pdfUrl?: string;

   testYoutubeUrl?: string;
   testUrl?: string;
   testPdfUrl?: string;
}

interface StudyDay {
   date: string;
   day: string;
   blocks: StudyBlock[];
}

interface StudyPlan {
   masterPlan?: StudyDay[];
}

export function StudentView({
   user,
   userData,
}: StudentViewProps) {
   const db = useFirestore();
   const router = useRouter();
   const { toast } = useToast();

   const [today, setToday] = useState('');

   /* =========================================================
      BUGÜN
   ========================================================= */

   useEffect(() => {
      setToday(format(new Date(), 'yyyy-MM-dd'));
   }, []);

   /* =========================================================
      ÖĞRENCİ ÇALIŞMA PLANI
   ========================================================= */

   const {
      data: studyPlan,
      loading: planLoading,
   } = useDoc<StudyPlan>(
      user?.uid ? `studyPlans/${user.uid}` : null
   );

   /* =========================================================
      BUGÜNÜN PLANI
   ========================================================= */

   const currentDayPlan = useMemo(() => {
      if (!studyPlan?.masterPlan || !today) {
         return null;
      }

      return studyPlan.masterPlan.find(
         (day) => day.date === today
      ) || null;
   }, [studyPlan, today]);

   /* =========================================================
      GÖREV İŞLEMİ
   ========================================================= */

   const handleTaskAction = async (
      blockId: string,
      action: 'done' | 'delete'
   ) => {
      if (
         !db ||
         !user?.uid ||
         !studyPlan?.masterPlan ||
         !today
      ) {
         return;
      }

      try {
         const newPlan = studyPlan.masterPlan.map((day) => {
            if (day.date !== today) {
               return day;
            }

            const newBlocks = day.blocks
               .map((block) => {
                  if (block.id !== blockId) {
                     return block;
                  }

                  if (action === 'done') {
                     return {
                        ...block,
                        status:
                           block.status === 'done'
                              ? 'planned'
                              : 'done',
                     } as StudyBlock;
                  }

                  return null;
               })
               .filter(
                  (block): block is StudyBlock =>
                     block !== null
               );

            return {
               ...day,
               blocks: newBlocks,
            };
         });

         await updateDoc(
            doc(db, 'studyPlans', user.uid),
            {
               masterPlan: newPlan,
               updatedAt: serverTimestamp(),
            }
         );

         toast({
            title:
               action === 'done'
                  ? 'Terminal Güncellendi'
                  : 'Görev İptal Edildi',
            description:
               action === 'done'
                  ? 'Görevin durumu başarıyla güncellendi.'
                  : 'Görev bugünkü plandan kaldırıldı.',
            className:
               'bg-primary text-white rounded-2xl shadow-2xl',
         });
      } catch (error) {
         console.error(
            'Görev güncelleme hatası:',
            error
         );

         toast({
            title: 'İşlem gerçekleştirilemedi',
            description:
               'Lütfen tekrar deneyin.',
            variant: 'destructive',
         });
      }
   };

   /* =========================================================
      YÜKLENİYOR
   ========================================================= */

   if (planLoading) {
      return (
         <div className="p-20 flex flex-col items-center justify-center gap-6 min-h-[60vh]">
            <Loader2 className="h-10 w-10 animate-spin text-accent" />

            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/40 italic">
               Terminal Senkronize Ediliyor...
            </p>
         </div>
      );
   }

   /* =========================================================
      ANA EKRAN
   ========================================================= */

   return (
      <div className="p-4 md:p-8 space-y-10 max-w-[1600px] mx-auto w-full animate-in fade-in duration-1000 bg-[#F8FAFC]">

         {/* =====================================================
          BAŞLIK
      ===================================================== */}

         <section className="space-y-8">

            <div className="flex flex-col md:flex-row items-center justify-between gap-8 px-2">

               <div className="space-y-2 text-center md:text-left overflow-hidden">

                  <h2 className="text-4xl md:text-6xl lg:text-[8rem] font-black italic leading-[0.85] tracking-tighter text-primary text-shadow-premium break-words">
                     BUGÜNKÜ
                     <br />
                     BLOKLARIN
                  </h2>

                  {userData?.displayName && (
                     <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-primary/30">
                        {userData.displayName}
                     </p>
                  )}

               </div>

               {/* TARİH */}

               <Card className="bg-white rounded-[2rem] px-8 py-5 flex items-center gap-4 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.08)] border-none shrink-0 w-full md:w-auto">

                  <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center">
                     <Calendar className="h-5 w-5 text-primary opacity-20" />
                  </div>

                  <div className="text-right flex-1 md:flex-none">

                     <p className="text-xl font-black italic tracking-tighter text-primary leading-none">
                        {format(
                           new Date(),
                           'd MMMM',
                           { locale: tr }
                        ).toUpperCase()}
                     </p>

                     <p className="text-[9px] font-black text-primary/20 uppercase tracking-[0.3em] mt-1">
                        {format(
                           new Date(),
                           'yyyy'
                        )}
                     </p>

                  </div>

               </Card>

            </div>

            {/* ===================================================
            BLOKLAR
        =================================================== */}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

               {currentDayPlan?.blocks?.map(
                  (block) => (

                     <Card
                        key={block.id}
                        className={cn(
                           'aspect-square p-5 md:p-6 rounded-[3rem] border-none transition-all hover:scale-[1.03] shadow-[0_30px_60px_-15px_rgba(15,23,42,0.12)] group relative overflow-hidden bg-white h-full flex flex-col',
                           block.status === 'done' &&
                           'opacity-60'
                        )}
                     >

                        <div className="space-y-4 relative z-10 flex-1 flex flex-col h-full overflow-hidden">

                           {/* ÜST BİLGİ */}

                           <div className="flex justify-between items-center">

                              <div className="flex items-center gap-2">

                                 <div className="px-2 py-1 rounded-lg bg-[#FFF8E7] text-[#0F172A] flex items-center gap-1.5 border border-[#FEF3C7] shadow-sm">

                                    <Clock className="h-2.5 w-2.5 text-accent" />

                                    <span className="text-[9px] font-black">
                                       {block.phase1?.time || '10:00'}
                                    </span>

                                 </div>

                                 <span className="text-[8px] font-black text-primary/10 uppercase tracking-[0.1em] italic">
                                    #
                                    {String(block.lesson).includes(
                                       'AYT'
                                    )
                                       ? 'AYT'
                                       : 'TYT'}
                                 </span>

                              </div>

                              {/* TAMAMLA */}

                              <Badge
                                 onClick={() =>
                                    handleTaskAction(
                                       block.id,
                                       'done'
                                    )
                                 }
                                 className={cn(
                                    'px-3 py-1 rounded-lg text-[7px] font-black shrink-0 shadow-md border-none cursor-pointer active:scale-95 transition-all',
                                    block.status === 'done'
                                       ? 'bg-emerald-500 text-white'
                                       : 'bg-[#FF4D6D] text-white hover:bg-[#FF4D6D]/90'
                                 )}
                              >
                                 {block.status === 'done'
                                    ? 'TAMAM'
                                    : 'BEK'}
                              </Badge>

                           </div>

                           {/* KONU */}

                           <div className="flex-1 flex items-center justify-center py-2 overflow-hidden px-1">

                              <h4 className="text-xl md:text-2xl lg:text-3xl font-black italic leading-tight tracking-tighter uppercase text-primary text-shadow-premium text-center break-words line-clamp-3">

                                 {block.topic}

                              </h4>

                           </div>

                           {/* KAYNAKLAR */}

                           <div className="bg-[#F8FAFC]/60 rounded-[1.5rem] p-4 space-y-3 border border-slate-50 shadow-inner mt-auto">

                              {/* KONU ÇALIŞMA */}

                              <div className="space-y-1.5">

                                 <div className="flex items-center justify-between">

                                    <span className="text-[7px] font-black text-primary/20 uppercase tracking-[0.2em] italic">
                                       KONU ÇALIŞMA
                                    </span>

                                    <div className="flex gap-2 items-center">

                                       {block.youtubeUrl && (
                                          <a
                                             href={block.youtubeUrl}
                                             target="_blank"
                                             rel="noopener noreferrer"
                                             className="hover:scale-110 transition-all text-rose-500 opacity-60"
                                          >
                                             <Youtube className="h-3.5 w-3.5" />
                                          </a>
                                       )}

                                       {block.pdfUrl && (
                                          <a
                                             href={block.pdfUrl}
                                             target="_blank"
                                             rel="noopener noreferrer"
                                             className="hover:scale-110 transition-all text-blue-500 opacity-60"
                                          >
                                             <FileText className="h-3.5 w-3.5" />
                                          </a>
                                       )}

                                       {block.mebiUrl && (
                                          <a
                                             href={block.mebiUrl}
                                             target="_blank"
                                             rel="noopener noreferrer"
                                             className="hover:scale-110 transition-all text-emerald-500 opacity-60"
                                          >
                                             <BookOpen className="h-3.5 w-3.5" />
                                          </a>
                                       )}

                                    </div>

                                 </div>

                              </div>

                              <div className="h-px w-full bg-slate-200/40" />

                              {/* TEST */}

                              <div className="space-y-1.5">

                                 <div className="flex items-center justify-between">

                                    <div className="flex items-center gap-1">

                                       <div className="h-1 w-1 rounded-full bg-accent shadow-[0_0_5px_rgba(245,158,11,0.6)]" />

                                       <span className="text-[7px] font-black text-accent uppercase tracking-[0.2em] italic">
                                          TEST ÇÖZME
                                       </span>

                                    </div>

                                    <div className="flex gap-2 items-center">

                                       {block.testYoutubeUrl && (
                                          <a
                                             href={block.testYoutubeUrl}
                                             target="_blank"
                                             rel="noopener noreferrer"
                                             className="hover:scale-110 transition-all text-rose-500 opacity-80"
                                          >
                                             <Youtube className="h-3.5 w-3.5" />
                                          </a>
                                       )}

                                       {block.testUrl && (
                                          <a
                                             href={block.testUrl}
                                             target="_blank"
                                             rel="noopener noreferrer"
                                             className="hover:scale-110 transition-all text-emerald-500 opacity-80"
                                          >
                                             <BookOpen className="h-3.5 w-3.5" />
                                          </a>
                                       )}

                                       {block.testPdfUrl && (
                                          <a
                                             href={block.testPdfUrl}
                                             target="_blank"
                                             rel="noopener noreferrer"
                                             className="hover:scale-110 transition-all text-blue-500 opacity-80"
                                          >
                                             <FileText className="h-3.5 w-3.5" />
                                          </a>
                                       )}

                                    </div>

                                 </div>

                              </div>

                           </div>

                           {/* BUTONLAR */}

                           <div className="flex gap-2 mt-2">

                              <Button
                                 onClick={() =>
                                    router.push(
                                       '/dashboard/planning'
                                    )
                                 }
                                 className="flex-1 h-9 rounded-xl bg-primary text-white font-black uppercase text-[8px] gap-2 shadow-lg"
                              >
                                 <Edit3 className="h-3 w-3 text-accent" />
                                 DÜZENLE
                              </Button>

                              <Button
                                 onClick={() =>
                                    handleTaskAction(
                                       block.id,
                                       'delete'
                                    )
                                 }
                                 variant="ghost"
                                 size="icon"
                                 className="h-9 w-9 rounded-xl bg-slate-50 text-destructive hover:bg-destructive hover:text-white transition-all shadow-md"
                              >
                                 <Trash2 className="h-4 w-4" />
                              </Button>

                           </div>

                        </div>

                     </Card>

                  )
               )}

               {/* =================================================
              BUGÜN BOŞSA
          ================================================= */}

               {(!currentDayPlan ||
                  !currentDayPlan.blocks ||
                  currentDayPlan.blocks.length === 0) && (

                     <Card
                        onClick={() =>
                           router.push(
                              '/dashboard/planning'
                           )
                        }
                        className="lg:col-span-4 h-[300px] text-center bg-white rounded-[3rem] border-4 border-dashed border-slate-100 flex flex-col items-center justify-center gap-6 cursor-pointer hover:border-accent/30 transition-all group w-full"
                     >

                        <Zap className="h-12 w-12 text-accent opacity-20 group-hover:scale-110 transition-transform" />

                        <div className="space-y-2">

                           <p className="text-2xl font-black uppercase tracking-[0.3em] text-primary/10 italic">
                              BUGÜN BOŞ
                           </p>

                           <p className="text-[9px] font-bold text-primary/5 uppercase tracking-widest italic">
                              AKADEMİK TERMİNALİ ÇALIŞTIRIN
                           </p>

                        </div>

                     </Card>

                  )}

            </div>

         </section>

      </div>
   );
}aaa1'use client';

import { useDoc, useFirestore } from '@/firebase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import {
   Loader2,
   Youtube,
   FileText,
   BookOpen,
   Zap,
   Clock,
   Calendar,
   Edit3,
   Trash2,
   CheckCircle2,
} from 'lucide-react';

import { useMemo, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useRouter } from 'next/navigation';

import {
   doc,
   updateDoc,
   serverTimestamp,
} from 'firebase/firestore';

import { useToast } from '@/hooks/use-toast';

interface StudentViewProps {
   user: any;
   userData: any;
}

interface StudyBlock {
   id: string;
   lesson: string;
   topic: string;
   status: 'planned' | 'done' | 'skipped';

   phase1?: {
      type?: string;
      time?: string;
   };

   youtubeUrl?: string;
   mebiUrl?: string;
   pdfUrl?: string;

   testYoutubeUrl?: string;
   testUrl?: string;
   testPdfUrl?: string;
}

interface StudyDay {
   date: string;
   day: string;
   blocks: StudyBlock[];
}

interface StudyPlan {
   masterPlan?: StudyDay[];
}

export function StudentView({
   user,
   userData,
}: StudentViewProps) {
   const db = useFirestore();
   const router = useRouter();
   const { toast } = useToast();

   const [today, setToday] = useState('');

   /* =========================================================
      BUGÜN
   ========================================================= */

   useEffect(() => {
      setToday(format(new Date(), 'yyyy-MM-dd'));
   }, []);

   /* =========================================================
      ÖĞRENCİ ÇALIŞMA PLANI
   ========================================================= */

   const {
      data: studyPlan,
      loading: planLoading,
   } = useDoc<StudyPlan>(
      user?.uid ? `studyPlans/${user.uid}` : null
   );

   /* =========================================================
      BUGÜNÜN PLANI
   ========================================================= */

   const currentDayPlan = useMemo(() => {
      if (!studyPlan?.masterPlan || !today) {
         return null;
      }

      return (
         studyPlan.masterPlan.find(
            (day) => day.date === today
         ) || null
      );
   }, [studyPlan, today]);

   /* =========================================================
      GÖREV İŞLEMİ
   ========================================================= */

   const handleTaskAction = async (
      blockId: string,
      action: 'done' | 'delete'
   ) => {
      if (
         !db ||
         !user?.uid ||
         !studyPlan?.masterPlan ||
         !today
      ) {
         return;
      }

      try {
         const newPlan = studyPlan.masterPlan
            .map((day) => {
               if (day.date !== today) {
                  return day;
               }

               const newBlocks = day.blocks
                  .map((block) => {
                     if (block.id !== blockId) {
                        return block;
                     }

                     /* TAMAMLA / GERİ AL */

                     if (action === 'done') {
                        return {
                           ...block,
                           status:
                              block.status === 'done'
                                 ? 'planned'
                                 : 'done',
                        } as StudyBlock;
                     }

                     /* SİL */

                     return null;
                  })
                  .filter(
                     (block): block is StudyBlock =>
                        block !== null
                  );

               return {
                  ...day,
                  blocks: newBlocks,
               };
            });

         await updateDoc(
            doc(db, 'studyPlans', user.uid),
            {
               masterPlan: newPlan,
               updatedAt: serverTimestamp(),
            }
         );

         toast({
            title:
               action === 'done'
                  ? 'Plan Güncellendi'
                  : 'Görev Silindi',

            description:
               action === 'done'
                  ? 'Çalışma durumu başarıyla güncellendi.'
                  : 'Görev bugünkü plandan kaldırıldı.',

            className:
               'bg-primary text-white rounded-2xl shadow-2xl',
         });
      } catch (error) {
         console.error(
            'Görev güncelleme hatası:',
            error
         );

         toast({
            title: 'İşlem gerçekleştirilemedi',
            description:
               'Lütfen tekrar deneyin.',
            variant: 'destructive',
         });
      }
   };

   /* =========================================================
      YÜKLENİYOR
   ========================================================= */

   if (planLoading) {
      return (
         <div className="min-h-[60vh] flex flex-col items-center justify-center gap-5 p-10">
            <Loader2 className="h-10 w-10 animate-spin text-accent" />

            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-primary/40">
               Plan Yükleniyor...
            </p>
         </div>
      );
   }

   /* =========================================================
      ANA EKRAN
   ========================================================= */

   return (
      <div className="min-h-screen w-full bg-[#F8FAFC]">

         <div className="mx-auto w-full max-w-[1700px] px-4 py-6 md:px-8 md:py-8">

            {/* =====================================================
            BAŞLIK
        ===================================================== */}

            <section className="mb-10">

               <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">

                  {/* BAŞLIK */}

                  <div className="min-w-0">

                     <h2 className="text-4xl font-black leading-[0.95] tracking-[-0.04em] text-primary md:text-6xl lg:text-7xl">
                        BUGÜNKÜ
                        <br />
                        <span className="text-primary/90">
                           ÇALIŞMA PLANIN
                        </span>
                     </h2>

                     {userData?.displayName && (
                        <p className="mt-4 text-[10px] font-black uppercase tracking-[0.28em] text-primary/35">
                           {userData.displayName}
                        </p>
                     )}

                  </div>

                  {/* TARİH */}

                  <Card className="flex w-full shrink-0 items-center gap-4 rounded-[1.5rem] border-0 bg-white px-6 py-4 shadow-[0_15px_40px_-20px_rgba(15,23,42,0.25)] md:w-auto">

                     <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FFF8E7]">

                        <Calendar className="h-5 w-5 text-accent" />

                     </div>

                     <div className="text-left md:text-right">

                        <p className="text-lg font-black tracking-tight text-primary">
                           {format(
                              new Date(),
                              'd MMMM',
                              { locale: tr }
                           ).toUpperCase()}
                        </p>

                        <p className="mt-1 text-[9px] font-black uppercase tracking-[0.3em] text-primary/30">
                           {format(new Date(), 'yyyy')}
                        </p>

                     </div>

                  </Card>

               </div>

            </section>

            {/* =====================================================
            KARTLAR
        ===================================================== */}

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">

               {currentDayPlan?.blocks?.map(
                  (block) => {

                     const isDone =
                        block.status === 'done';

                     const isAYT =
                        String(block.lesson)
                           .toUpperCase()
                           .includes('AYT');

                     return (

                        <Card
                           key={block.id}
                           className={cn(
                              `
                    group relative
                    flex h-[430px] flex-col
                    overflow-hidden
                    rounded-[2rem]
                    border border-slate-100
                    bg-white
                    p-5
                    shadow-[0_20px_50px_-25px_rgba(15,23,42,0.25)]
                    transition-all duration-300
                    hover:-translate-y-1
                    hover:shadow-[0_25px_60px_-20px_rgba(15,23,42,0.3)]
                    `,
                              isDone &&
                              'border-emerald-100 bg-emerald-50/30'
                           )}
                        >

                           {/* =================================================
                      ÜST BİLGİ
                  ================================================= */}

                           <div className="flex shrink-0 items-center justify-between">

                              {/* SAAT */}

                              <div className="flex items-center gap-2">

                                 <div className="flex items-center gap-1.5 rounded-lg border border-amber-100 bg-[#FFF8E7] px-2.5 py-1.5">

                                    <Clock className="h-3 w-3 text-accent" />

                                    <span className="text-[9px] font-black text-primary">
                                       {block.phase1?.time || '10:00'}
                                    </span>

                                 </div>

                                 <span className="text-[8px] font-bold uppercase tracking-widest text-primary/25">
                                    {isAYT ? 'AYT' : 'TYT'}
                                 </span>

                              </div>

                              {/* DURUM */}

                              <Badge
                                 onClick={() =>
                                    handleTaskAction(
                                       block.id,
                                       'done'
                                    )
                                 }
                                 className={cn(
                                    `
                        cursor-pointer
                        rounded-lg
                        border-0
                        px-2.5
                        py-1.5
                        text-[8px]
                        font-black
                        shadow-sm
                        transition-all
                        active:scale-95
                        `,
                                    isDone
                                       ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                                       : 'bg-[#FF4D6D] text-white hover:bg-[#e94361]'
                                 )}
                              >

                                 {isDone ? (
                                    <span className="flex items-center gap-1">
                                       <CheckCircle2 className="h-3 w-3" />
                                       TAMAMLANDI
                                    </span>
                                 ) : (
                                    'BEKLİYOR'
                                 )}

                              </Badge>

                           </div>

                           {/* =================================================
                      KONU ALANI
                  ================================================= */}

                           <div className="flex min-h-0 flex-1 items-center justify-center px-2 py-5">

                              <h4
                                 className={cn(
                                    `
                        w-full
                        text-center
                        text-xl
                        font-black
                        uppercase
                        leading-[1.15]
                        tracking-[-0.02em]
                        text-primary
                        line-clamp-3
                        break-words
                        md:text-2xl
                        `,
                                    isDone &&
                                    'text-primary/50 line-through decoration-2'
                                 )}
                              >
                                 {block.topic}
                              </h4>

                           </div>

                           {/* =================================================
                      KAYNAKLAR
                  ================================================= */}

                           <div className="shrink-0 rounded-[1.25rem] border border-slate-100 bg-[#F8FAFC] p-3.5">

                              {/* KONU ÇALIŞMA */}

                              <div className="flex items-center justify-between">

                                 <div className="flex items-center gap-1.5">

                                    <div className="h-1.5 w-1.5 rounded-full bg-primary/30" />

                                    <span className="text-[8px] font-black uppercase tracking-[0.14em] text-primary/40">
                                       KONU ÇALIŞMA
                                    </span>

                                 </div>

                                 <div className="flex items-center gap-2">

                                    {/* YOUTUBE */}

                                    {block.youtubeUrl && (
                                       <a
                                          href={block.youtubeUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          title="YouTube konu anlatımı"
                                          onClick={(e) =>
                                             e.stopPropagation()
                                          }
                                          className="
                              flex h-7 w-7
                              items-center justify-center
                              rounded-lg
                              bg-white
                              text-red-500
                              shadow-sm
                              transition-all
                              hover:scale-110
                              hover:shadow-md
                            "
                                       >
                                          <Youtube className="h-4 w-4" />
                                       </a>
                                    )}

                                    {/* PDF */}

                                    {block.pdfUrl && (
                                       <a
                                          href={block.pdfUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          title="PDF kaynak"
                                          onClick={(e) =>
                                             e.stopPropagation()
                                          }
                                          className="
                              flex h-7 w-7
                              items-center justify-center
                              rounded-lg
                              bg-white
                              text-blue-500
                              shadow-sm
                              transition-all
                              hover:scale-110
                              hover:shadow-md
                            "
                                       >
                                          <FileText className="h-4 w-4" />
                                       </a>
                                    )}

                                    {/* MEBİ */}

                                    {block.mebiUrl && (
                                       <a
                                          href={block.mebiUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          title="MEBİ kaynağı"
                                          onClick={(e) =>
                                             e.stopPropagation()
                                          }
                                          className="
                              flex h-7 w-7
                              items-center justify-center
                              rounded-lg
                              bg-white
                              text-emerald-500
                              shadow-sm
                              transition-all
                              hover:scale-110
                              hover:shadow-md
                            "
                                       >
                                          <BookOpen className="h-4 w-4" />
                                       </a>
                                    )}

                                 </div>

                              </div>

                              {/* AYIRICI */}

                              <div className="my-3 h-px bg-slate-200/70" />

                              {/* TEST ÇÖZME */}

                              <div className="flex items-center justify-between">

                                 <div className="flex items-center gap-1.5">

                                    <div className="h-1.5 w-1.5 rounded-full bg-accent" />

                                    <span className="text-[8px] font-black uppercase tracking-[0.14em] text-accent">
                                       TEST ÇÖZME
                                    </span>

                                 </div>

                                 <div className="flex items-center gap-2">

                                    {/* TEST YOUTUBE */}

                                    {block.testYoutubeUrl && (
                                       <a
                                          href={block.testYoutubeUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          title="Test videosu"
                                          onClick={(e) =>
                                             e.stopPropagation()
                                          }
                                          className="
                              flex h-7 w-7
                              items-center justify-center
                              rounded-lg
                              bg-white
                              text-red-500
                              shadow-sm
                              transition-all
                              hover:scale-110
                              hover:shadow-md
                            "
                                       >
                                          <Youtube className="h-4 w-4" />
                                       </a>
                                    )}

                                    {/* TEST */}

                                    {block.testUrl && (
                                       <a
                                          href={block.testUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          title="Online test"
                                          onClick={(e) =>
                                             e.stopPropagation()
                                          }
                                          className="
                              flex h-7 w-7
                              items-center justify-center
                              rounded-lg
                              bg-white
                              text-emerald-500
                              shadow-sm
                              transition-all
                              hover:scale-110
                              hover:shadow-md
                            "
                                       >
                                          <BookOpen className="h-4 w-4" />
                                       </a>
                                    )}

                                    {/* TEST PDF */}

                                    {block.testPdfUrl && (
                                       <a
                                          href={block.testPdfUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          title="Test PDF"
                                          onClick={(e) =>
                                             e.stopPropagation()
                                          }
                                          className="
                              flex h-7 w-7
                              items-center justify-center
                              rounded-lg
                              bg-white
                              text-blue-500
                              shadow-sm
                              transition-all
                              hover:scale-110
                              hover:shadow-md
                            "
                                       >
                                          <FileText className="h-4 w-4" />
                                       </a>
                                    )}

                                 </div>

                              </div>

                           </div>

                           {/* =================================================
                      ALT BUTONLAR
                  ================================================= */}

                           <div className="mt-3 flex shrink-0 gap-2">

                              {/* DÜZENLE */}

                              <Button
                                 onClick={() =>
                                    router.push(
                                       '/dashboard/planning'
                                    )
                                 }
                                 className="
                        h-10
                        flex-1
                        rounded-xl
                        bg-primary
                        text-[9px]
                        font-black
                        uppercase
                        tracking-wider
                        text-white
                        shadow-md
                        transition-all
                        hover:bg-primary/90
                        hover:shadow-lg
                      "
                              >

                                 <Edit3 className="mr-2 h-3.5 w-3.5 text-accent" />

                                 DÜZENLE

                              </Button>

                              {/* SİL */}

                              <Button
                                 onClick={() =>
                                    handleTaskAction(
                                       block.id,
                                       'delete'
                                    )
                                 }
                                 variant="ghost"
                                 size="icon"
                                 title="Görevi sil"
                                 className="
                        h-10
                        w-10
                        shrink-0
                        rounded-xl
                        bg-slate-100
                        text-slate-400
                        shadow-sm
                        transition-all
                        hover:bg-red-500
                        hover:text-white
                      "
                              >

                                 <Trash2 className="h-4 w-4" />

                              </Button>

                           </div>

                        </Card>
                     );
                  }
               )}

               {/* =================================================
              BUGÜN BOŞSA
          ================================================= */}

               {(
                  !currentDayPlan ||
                  !currentDayPlan.blocks ||
                  currentDayPlan.blocks.length === 0
               ) && (

                     <Card
                        onClick={() =>
                           router.push(
                              '/dashboard/planning'
                           )
                        }
                        className="
                col-span-1
                flex
                min-h-[360px]
                cursor-pointer
                flex-col
                items-center
                justify-center
                gap-5
                rounded-[2rem]
                border-2
                border-dashed
                border-slate-200
                bg-white
                text-center
                transition-all
                hover:border-accent/40
                hover:bg-[#FFFDF7]
                sm:col-span-2
                xl:col-span-4
              "
                     >

                        <div className="
                flex
                h-16
                w-16
                items-center
                justify-center
                rounded-2xl
                bg-[#FFF8E7]
              ">

                           <Zap className="h-7 w-7 text-accent" />

                        </div>

                        <div className="space-y-2">

                           <p className="
                  text-xl
                  font-black
                  uppercase
                  tracking-[0.18em]
                  text-primary/30
                ">
                              BUGÜN BOŞ
                           </p>

                           <p className="
                  text-[9px]
                  font-bold
                  uppercase
                  tracking-[0.2em]
                  text-primary/20
                ">
                              ÇALIŞMA PLANI OLUŞTURMAK İÇİN TIKLAYIN
                           </p>

                        </div>

                     </Card>

                  )}

            </div>

         </div>

      </div>
   );
}