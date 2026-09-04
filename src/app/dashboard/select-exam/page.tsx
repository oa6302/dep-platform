
'use client';

import { useUser, useFirestore } from '@/firebase';
import { useRouter } from 'next/navigation';
import { EXAM_CONFIGS } from '@/lib/exam-configs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { doc, updateDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { Loader2, ArrowLeft, Home, ChevronRight, Sparkles, GraduationCap } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { tr } from 'date-fns/locale';

export default function SelectExamPage() {
  const { user } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const [isInitializing, setIsInitializing] = useState(false);

  const generateAdaptivePlan = (examId: string) => {
    const plan = [];
    const baseDate = new Date();
    const config = EXAM_CONFIGS[examId] || EXAM_CONFIGS['YKS_EA'];
    const lessons = config.lessons;
    
    for (let i = 0; i < 90; i++) {
      const currentDate = addDays(baseDate, i);
      const dateStr = format(currentDate, 'yyyy-MM-dd');
      
      const dailyBlocks = [];
      for (let j = 0; j < 2; j++) {
        dailyBlocks.push({
          id: `block_${dateStr}_${j}`,
          lesson: lessons[(i * 2 + j) % lessons.length],
          topic: 'Konu Belirleniyor...',
          status: 'planned',
          phase1: { type: 'KONU ÇALIŞMA', time: j === 0 ? '10:00' : '12:00' }
        });
      }

      plan.push({
        date: dateStr,
        day: format(currentDate, 'EEEE', { locale: tr }),
        blocks: dailyBlocks
      });
    }
    return plan;
  };

  const handleSelectExam = async (examId: string) => {
    if (!db || !user) return;
    setIsInitializing(true);

    try {
      const adaptivePlan = generateAdaptivePlan(examId);
      
      // Firestore User Update
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        displayName: 'Misafir Öğrenci',
        role: 'student',
        targetExam: examId,
        updatedAt: serverTimestamp()
      }, { merge: true });

      // Study Plan Update
      await setDoc(doc(db, 'studyPlans', user.uid), {
        userId: user.uid,
        targetExam: examId,
        masterPlan: adaptivePlan,
        updatedAt: serverTimestamp()
      }, { merge: true });

      toast({ 
        title: 'BAŞARIYLA KURULDU', 
        description: 'YKS TM çalışma terminaliniz saniyeler içinde yapılandırıldı.', 
        className: "bg-primary text-white rounded-[2rem]" 
      });
      
      router.push('/dashboard');
    } catch (err) {
      toast({ variant: 'destructive', title: 'Hata', description: 'Kurulum sırasında bir sorun oluştu.' });
    } finally {
      setIsInitializing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-6 flex items-center justify-center">
      <div className="max-w-xl w-full space-y-12 text-center animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <header className="space-y-6">
           <div className="h-20 w-20 rounded-[2rem] bg-primary text-white flex items-center justify-center shadow-2xl mx-auto">
              <Sparkles className="h-10 w-10 text-accent animate-pulse" />
           </div>
           <h2 className="text-5xl font-black tracking-tighter italic text-primary uppercase leading-none">
              AKADEMİK <br /><span className="text-accent text-shadow-accent">KURULUM</span>
           </h2>
           <p className="text-lg font-medium text-muted-foreground italic">Tek tıkla saniyeler içinde YKS Eşit Ağırlık terminalini otonom olarak hazırla.</p>
        </header>

        <Card 
          className="group relative overflow-hidden rounded-[4rem] border-none shadow-[0_40px_80px_-20px_rgba(15,23,42,0.15)] bg-white p-12 transition-all duration-500 hover:-translate-y-2 cursor-pointer border-2 border-transparent hover:border-accent/20"
          onClick={() => !isInitializing && handleSelectExam('YKS_EA')}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-accent/15 transition-all"></div>
          <div className="space-y-8">
            <div className="h-24 w-24 rounded-[2.5rem] bg-slate-50 flex items-center justify-center text-primary group-hover:bg-accent group-hover:text-white transition-all shadow-inner group-hover:rotate-6 mx-auto">
              {isInitializing ? <Loader2 className="h-12 w-12 animate-spin" /> : <GraduationCap className="h-12 w-12" />}
            </div>
            <div className="space-y-2">
              <h3 className="text-3xl font-black italic tracking-tighter text-primary uppercase group-hover:text-accent transition-colors">YKS EŞİT AĞIRLIK</h3>
              <p className="text-[11px] text-muted-foreground font-bold italic uppercase tracking-widest opacity-60">Hukuk, İşletme ve Psikoloji Hedefleri İçin</p>
            </div>
            <Button className="w-full h-16 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest shadow-2xl gap-3">
               TERMİNALİ AKTİF ET <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
