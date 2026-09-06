'use client';

import { useDoc, useFirestore } from '@/firebase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import {
   CheckCircle2,
   Loader2,
   Youtube,
   FileText,
   BookOpen,
   Zap,
   Clock,
   Calendar,
   Edit3,
   Trash2,
   ArrowUpRight,
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

export function StudentView({
   user,
   userData,
}: {
   user: any;
   userData: any;
}) {
   const db = useFirestore();
   const router = useRouter();
   const { toast } = useToast();

   const [today, setToday] = useState('');

   useEffect(() => {
      setToday(format(new Date(), 'yyyy-MM-dd'));
   }, []);

   const {
      data: studyPlan,
      loading: planLoading,
   } = useDoc<any>(
      user?.uid ? `studyPlans/${user.uid}` : null
   );

   const currentDayPlan = useMemo(() => {
      if (!studyPlan?.masterPlan || !today) return null;

      return studyPlan.masterPlan.find(
         (d: any) => d.date === today
      );
   }, [studyPlan, today]);

   const handleTaskAction = async (
      blockId: string,
      action: 'done' | 'delete'
   ) => {
      if (!db || !user || !studyPlan || !today) return;

      const newPlan = studyPlan.masterPlan
         .map((day: any) => {
            if (day.date !== today) return day;

            return {
               ...day,
               blocks: day.blocks
                  .map((block: any) => {
                     if (block.id !== blockId) return block;

                     if (action === 'done') {
                        return {
                           ...block,
                           status:
                              block.status === 'done'
                                 ? 'planned'
                                 : 'done',
                        };
                     }

                     if (action === 'delete') {
                        return null;
                     }

                     return block;
                  })
                  .filter(Boolean),
            };
         });

      try {
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
            className:
               'bg-[#0F172A] text-white rounded-2xl shadow-2xl',
         });
      } catch (error) {
         console.error('Görev güncelleme hatası:', error);

         toast({
            title: 'İşlem gerçekleştirilemedi',
            variant: 'destructive',
         });
      }
   };

   if (planLoading) {
      return (
         <div className="min-h-[70vh] flex flex-col items-center justify-center gap-5">
            <div className="h-14 w-14 rounded-2xl bg-[#0F172A] flex items-center justify-center shadow-xl">
               <Loader2 className="h-7 w-7 animate-spin text-[#F59E0B]" />
            </div>

            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-primary/40 italic">
               Terminal Senkronize Ediliyor...
            </p>
         </div>
      );
   }

   const blocks = currentDayPlan?.blocks || [];

   return (
      <div className="min-h-screen bg-[#F8FAFC]">

         {/* =====================================================
          ANA İÇERİK
      ===================================================== */}

         <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">

            {/* =====================================================
            ÜST BAŞLIK
        ===================================================== */}

            <section className="mb-8 md:mb-10">

               <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">

                  <div className="space-y-3">

                     <div className="inline-flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-[#F59E0B] shadow-[0_0_12px_rgba(245,158,11,0.6)]" />

                        <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-primary/35 italic">
                           AKADEMİK GÜNLÜK TERMİNAL
                        </span>
                     </div>

                     <h1 className="
                text-[clamp(3rem,7vw,6.5rem)]
                font-black
                italic
                uppercase
                leading-[0.82]
                tracking-[-0.06em]
                text-[#0F172A]
              ">
                        BUGÜNKÜ
                        <br />
                        <span className="text-[#F59E0B]">
                           BLOKLAR
                        </span>
                     </h1>

                     <p className="
                max-w-xl
                text-sm
                md:text-base
                font-medium
                italic
                leading-relaxed
                text-primary/40
              ">
                        Bugünün akademik görevlerini takip et,
                        çalışmalarını tamamla ve hedeflerine
                        adım adım ilerle.
                     </p>

                  </div>

                  {/* TARİH KARTI */}

                  <Card className="
              border border-slate-100
              bg-white
              rounded-[1.5rem]
              px-5
              py-4
              shadow-[0_20px_50px_-25px_rgba(15,23,42,0.25)]
              flex
              items-center
              gap-4
              w-full
              lg:w-auto
              lg:min-w-[210px]
            ">

                     <div className="
                h-12
                w-12
                rounded-2xl
                bg-[#F8FAFC]
                flex
                items-center
                justify-center
                shrink-0
              ">
                        <Calendar className="h-5 w-5 text-[#0F172A]/40" />
                     </div>

                     <div>
                        <p className="
                  text-lg
                  md:text-xl
                  font-black
                  italic
                  tracking-tight
                  text-[#0F172A]
                  leading-none
                ">
                           {format(
                              new Date(),
                              'd MMMM',
                              { locale: tr }
                           ).toUpperCase()}
                        </p>

                        <p className="
                  mt-1
                  text-[8px]
                  font-black
                  uppercase
                  tracking-[0.3em]
                  text-primary/25
                ">
                           {format(new Date(), 'yyyy')}
                        </p>
                     </div>

                  </Card>

               </div>
            </section>

            {/* =====================================================
            BLOK SAYISI / DURUM
        ===================================================== */}

            {blocks.length > 0 && (
               <div className="
            flex
            items-center
            justify-between
            mb-5
            px-1
          ">

                  <div className="flex items-center gap-2">
                     <div className="
                h-7
                w-7
                rounded-lg
                bg-[#0F172A]
                flex
                items-center
                justify-center
              ">
                        <Zap className="h-3.5 w-3.5 text-[#F59E0B]" />
                     </div>

                     <span className="
                text-[9px]
                md:text-[10px]
                font-black
                uppercase
                tracking-[0.2em]
                text-primary/35
              ">
                        GÜNLÜK ÇALIŞMA BLOKLARI
                     </span>
                  </div>

                  <span className="
              text-[9px]
              font-black
              uppercase
              tracking-widest
              text-primary/25
            ">
                     {blocks.length} BLOK
                  </span>

               </div>
            )}

            {/* =====================================================
            KARTLAR
        ===================================================== */}

            <div className="
          grid
          grid-cols-1
          sm:grid-cols-2
          xl:grid-cols-4
          gap-5
          md:gap-6
          items-stretch
        ">

               {blocks.map((block: any, index: number) => {

                  const isDone = block.status === 'done';

                  const isReview =
                     String(block.lesson)
                        .toUpperCase()
                        .includes('STRATEJİK');

                  const isParagraf =
                     String(block.topic)
                        .toUpperCase()
                        .includes('PARAGRAF');

                  return (
                     <Card
                        key={block.id}
                        className={cn(
                           `
                  group
                  relative
                  overflow-hidden
                  min-h-[390px]
                  md:min-h-[410px]
                  rounded-[2rem]
                  border
                  border-slate-100
                  bg-white
                  p-5
                  md:p-6
                  flex
                  flex-col
                  shadow-[0_18px_45px_-25px_rgba(15,23,42,0.30)]
                  transition-all
                  duration-300
                  hover:-translate-y-1
                  hover:shadow-[0_30px_70px_-25px_rgba(15,23,42,0.30)]
                  `
                           ,
                           isDone && 'opacity-70'
                        )}
                     >

                        {/* ÜST DEKOR */}

                        <div className="
                  absolute
                  -right-12
                  -top-12
                  h-32
                  w-32
                  rounded-full
                  bg-[#F59E0B]/[0.06]
                  blur-2xl
                  transition-transform
                  duration-500
                  group-hover:scale-150
                " />

                        {/* =================================================
                    KART HEADER
                ================================================= */}

                        <div className="
                  relative
                  z-10
                  flex
                  items-center
                  justify-between
                  gap-3
                ">

                           <div className="flex items-center gap-2">

                              {/* SAAT */}

                              <div className="
                      inline-flex
                      items-center
                      gap-1.5
                      rounded-xl
                      bg-[#FFF8E7]
                      border
                      border-[#FEF3C7]
                      px-2.5
                      py-1.5
                    ">

                                 <Clock className="h-3 w-3 text-[#F59E0B]" />

                                 <span className="
                        text-[9px]
                        font-black
                        text-[#0F172A]
                      ">
                                    {block.phase1?.time || '10:00'}
                                 </span>

                              </div>

                              {/* NUMARA */}

                              <span className="
                      text-[8px]
                      font-black
                      uppercase
                      tracking-widest
                      text-primary/20
                    ">
                                 #{String(index + 1).padStart(2, '0')}
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
                      rounded-xl
                      px-3
                      py-1.5
                      text-[7px]
                      font-black
                      uppercase
                      tracking-wider
                      border-none
                      shadow-sm
                      transition-all
                      active:scale-95
                      `
                                 ,
                                 isDone
                                    ? 'bg-emerald-500 text-white'
                                    : 'bg-[#FF4D6D] text-white hover:bg-[#e94060]'
                              )}
                           >

                              {isDone ? (
                                 <span className="flex items-center gap-1">
                                    <CheckCircle2 className="h-3 w-3" />
                                    TAMAM
                                 </span>
                              ) : (
                                 'BEKLEMEDE'
                              )}

                           </Badge>

                        </div>

                        {/* =================================================
                    KONU ALANI
                ================================================= */}

                        <div className="
                  flex-1
                  flex
                  flex-col
                  items-center
                  justify-center
                  text-center
                  px-2
                  py-7
                ">

                           {/* DERS */}

                           <div className="
                    mb-3
                    inline-flex
                    items-center
                    rounded-full
                    bg-[#F8FAFC]
                    px-3
                    py-1
                  ">

                              <span className="
                      text-[7px]
                      font-black
                      uppercase
                      tracking-[0.2em]
                      text-primary/35
                    ">
                                 {block.lesson}
                              </span>

                           </div>

                           {/* KONU */}

                           <h3 className="
                    max-w-full
                    text-xl
                    sm:text-2xl
                    md:text-[1.65rem]
                    lg:text-2xl
                    font-black
                    italic
                    uppercase
                    leading-[0.95]
                    tracking-[-0.035em]
                    text-[#0F172A]
                    line-clamp-4
                    break-words
                  ">
                              {block.topic}
                           </h3>

                           {/* TİP */}

                           <p className="
                    mt-3
                    text-[8px]
                    font-black
                    uppercase
                    tracking-[0.25em]
                    text-[#F59E0B]
                  ">
                              {isReview
                                 ? 'TEKRAR'
                                 : isParagraf
                                    ? 'SORU ÇÖZÜMÜ'
                                    : block.phase1?.type || 'KONU ÇALIŞMA'}
                           </p>

                        </div>

                        {/* =================================================
                    KAYNAK ALANI
                ================================================= */}

                        <div className="
                  rounded-[1.35rem]
                  bg-[#F8FAFC]
                  border
                  border-slate-100
                  p-4
                ">

                           {/* KONU KAYNAKLARI */}

                           <div className="
                    flex
                    items-center
                    justify-between
                    gap-3
                  ">

                              <div>
                                 <p className="
                        text-[7px]
                        font-black
                        uppercase
                        tracking-[0.2em]
                        text-primary/25
                      ">
                                    KONU ÇALIŞMA
                                 </p>

                                 <p className="
                        mt-1
                        text-[8px]
                        font-bold
                        text-primary/35
                      ">
                                    Kaynaklara ulaş
                                 </p>
                              </div>

                              <div className="flex items-center gap-2">

                                 {block.youtubeUrl && (
                                    <a
                                       href={block.youtubeUrl}
                                       target="_blank"
                                       rel="noopener noreferrer"
                                       className="
                            h-8
                            w-8
                            rounded-lg
                            bg-white
                            flex
                            items-center
                            justify-center
                            text-rose-500
                            shadow-sm
                            transition-all
                            hover:scale-110
                          "
                                    >
                                       <Youtube className="h-3.5 w-3.5" />
                                    </a>
                                 )}

                                 {block.pdfUrl && (
                                    <a
                                       href={block.pdfUrl}
                                       target="_blank"
                                       rel="noopener noreferrer"
                                       className="
                            h-8
                            w-8
                            rounded-lg
                            bg-white
                            flex
                            items-center
                            justify-center
                            text-blue-500
                            shadow-sm
                            transition-all
                            hover:scale-110
                          "
                                    >
                                       <FileText className="h-3.5 w-3.5" />
                                    </a>
                                 )}

                                 {block.mebiUrl && (
                                    <a
                                       href={block.mebiUrl}
                                       target="_blank"
                                       rel="noopener noreferrer"
                                       className="
                            h-8
                            w-8
                            rounded-lg
                            bg-white
                            flex
                            items-center
                            justify-center
                            text-emerald-500
                            shadow-sm
                            transition-all
                            hover:scale-110
                          "
                                    >
                                       <BookOpen className="h-3.5 w-3.5" />
                                    </a>
                                 )}

                              </div>

                           </div>

                           {/* AYIRICI */}

                           <div className="
                    h-px
                    w-full
                    bg-slate-200/70
                    my-3
                  " />

                           {/* TEST */}

                           <div className="
                    flex
                    items-center
                    justify-between
                    gap-3
                  ">

                              <div>
                                 <div className="flex items-center gap-1.5">

                                    <span className="
                          h-1.5
                          w-1.5
                          rounded-full
                          bg-[#F59E0B]
                        />

                        <p className="
                                       text-[7px]
                                    font-black
                                    uppercase
                                    tracking-[0.2em]
                                    text-[#F59E0B]
                        ">
                                    TEST ÇÖZME
                                 </p>

                              </div>

                              <p className="
                        mt-1
                        text-[8px]
                        font-bold
                        text-primary/25
                      ">
                                 Soru kaynakları
                              </p>
                           </div>

                           <div className="flex items-center gap-2">

                              {block.testYoutubeUrl && (
                                 <a
                                    href={block.testYoutubeUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="
                            h-8
                            w-8
                            rounded-lg
                            bg-white
                            flex
                            items-center
                            justify-center
                            text-rose-500
                            shadow-sm
                            transition-all
                            hover:scale-110
                          "
                                 >
                                    <Youtube className="h-3.5 w-3.5" />
                                 </a>
                              )}

                              {block.testUrl && (
                                 <a
                                    href={block.testUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="
                            h-8
                            w-8
                            rounded-lg
                            bg-white
                            flex
                            items-center
                            justify-center
                            text-emerald-500
                            shadow-sm
                            transition-all
                            hover:scale-110
                          "
                                 >
                                    <BookOpen className="h-3.5 w-3.5" />
                                 </a>
                              )}

                              {block.testPdfUrl && (
                                 <a
                                    href={block.testPdfUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="
                            h-8
                            w-8
                            rounded-lg
                            bg-white
                            flex
                            items-center
                            justify-center
                            text-blue-500
                            shadow-sm
                            transition-all
                            hover:scale-110
                          "
                                 >
                                    <FileText className="h-3.5 w-3.5" />
                                 </a>
                              )}

                           </div>

                        </div>

                     </div>

                {/* =================================================
                    ALT BUTONLAR
                ================================================= */}

                  <div className="
                  flex
                  items-center
                  gap-2
                  mt-4
                ">

                     <Button
                        onClick={() =>
                           router.push(
                              '/dashboard/planning'
                           )
                        }
                        className="
                      flex-1
                      h-10
                      rounded-xl
                      bg-[#0F172A]
                      text-white
                      text-[8px]
                      font-black
                      uppercase
                      tracking-wider
                      shadow-lg
                      hover:bg-[#1e293b]
                      transition-all
                      group/button
                    "
                     >

                        <Edit3 className="
                      h-3
                      w-3
                      mr-2
                      text-[#F59E0B]
                    " />

                        DÜZENLE

                        <ArrowUpRight className="
                      h-3
                      w-3
                      ml-auto
                      opacity-40
                      group-hover/button:opacity-100
                      transition-opacity
                    " />

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
                        className="
                      h-10
                      w-10
                      rounded-xl
                      bg-slate-50
                      text-slate-400
                      hover:bg-red-500
                      hover:text-white
                      transition-all
                    "
                     >
                        <Trash2 className="h-3.5 w-3.5" />
                     </Button>

                  </div>

              </Card>
            );
          })}

            {/* =====================================================
              BOŞ DURUM
          ===================================================== */}

            {blocks.length === 0 && (
               <Card
                  onClick={() =>
                     router.push(
                        '/dashboard/planning'
                     )
                  }
                  className="
                sm:col-span-2
                xl:col-span-4
                min-h-[360px]
                rounded-[2rem]
                border-2
                border-dashed
                border-slate-200
                bg-white
                flex
                flex-col
                items-center
                justify-center
                gap-5
                cursor-pointer
                hover:border-[#F59E0B]/40
                transition-all
                group
              "
               >

                  <div className="
                h-16
                w-16
                rounded-2xl
                bg-[#FFF8E7]
                flex
                items-center
                justify-center
                group-hover:scale-110
                transition-transform
              ">
                     <Zap className="
                  h-7
                  w-7
                  text-[#F59E0B]
                " />
                  </div>

                  <div className="text-center">

                     <p className="
                  text-xl
                  md:text-2xl
                  font-black
                  uppercase
                  tracking-[0.15em]
                  text-primary/20
                  italic
                ">
                        BUGÜN BOŞ
                     </p>

                     <p className="
                  mt-2
                  text-[9px]
                  font-bold
                  uppercase
                  tracking-[0.2em]
                  text-primary/15
                ">
                        Akademik terminali çalıştırın
                     </p>

                  </div>

                  <Button
                     className="
                  h-10
                  rounded-xl
                  bg-[#0F172A]
                  text-white
                  text-[8px]
                  font-black
                  uppercase
                  tracking-widest
                  px-6
                "
                  >
                     PLANLAMAYA GİT
                  </Button>

               </Card>
            )}

         </div>

         {/* =====================================================
            ALT BİLGİ
        ===================================================== */}

         {blocks.length > 0 && (
            <div className="
            mt-8
            flex
            items-center
            justify-center
          ">

               <div className="
              inline-flex
              items-center
              gap-2
              rounded-full
              bg-white
              border
              border-slate-100
              px-4
              py-2
              shadow-sm
            ">

                  <div className="
                h-1.5
                w-1.5
                rounded-full
                bg-emerald-500
              />

              <span className="
                     text-[7px]
                  font-black
                  uppercase
                  tracking-[0.25em]
                  text-primary/25
              ">
                  AKADEMİK TERMİNAL AKTİF
               </span>

            </div>

          </div>
   )
}

      </div >
    </div >
  );
}