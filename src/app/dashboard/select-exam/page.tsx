'use client';

import { useUser, useFirestore, useDoc } from '@/firebase';
import { useRouter } from 'next/navigation';
import { EXAM_CONFIGS } from '@/lib/exam-configs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { doc, updateDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useState, useMemo } from 'react';
import { 
  Loader2, ArrowLeft, Home, ChevronRight, Sparkles, 
  Trophy, Globe, GraduationCap, Landmark, ShieldCheck,
  Zap, Brain
} from 'lucide-react';
import { format, addDays } from 'date-fns';
import { tr } from 'date-fns/locale';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';
import { cn } from '@/lib/utils';

export default function SelectExamPage() {
  const { user } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const { data: userData } = useDoc<any>(user?.uid ? `users/${user.uid}` : null);

  const [isInitializing, setIsInitializing] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const categories = [
    { id: 'ÜNİVERSİTE', label: 'ÜNİVERSİTEYE GEÇİŞ', icon: GraduationCap },
    { id: 'KAMU SINAVLARI', label: 'KAMU PERSONELİ (KPSS)', icon: Landmark },
    { id: 'AKADEMİK', label: 'AKADEMİK KARİYER (ALES)', icon: Trophy },
    { id: 'YABANCI DİL', label: 'YABANCI DİL (YDS/YÖKDİL)', icon: Globe },
    { id: 'ORTAOKUL', label: 'ORTAOKUL (LGS)', icon: Sparkles },
  ];

  const generateAdaptivePlan = (examId: string) => {
    const plan = [];
    const baseDate = new Date();
    const config = EXAM_CONFIGS[examId] || EXAM_CONFIGS['YKS_SAY'];
    const lessons = config.lessons;
    
    // Varsayılan Müfredat Haritası (Simüle edilmiş)
    const curriculumMap: Record<string, string[]> = {
      'Matematik': ['Temel Kavramlar', 'Sayılar', 'Problemler', 'Fonksiyonlar'],
      'Türkçe': ['Paragraf', 'Cümlede Anlam', 'Yazım Kuralları'],
      'Geometri': ['Açılar', 'Üçgenler', 'Çember'],
    };

    for (let i = 0; i < 364; i++) {
      const currentDate = addDays(baseDate, i);
      const dayName = format(currentDate, 'EEEE', { locale: tr });
      const weekNum = Math.floor(i / 7) + 1;
      
      // Pazar günleri mola
      if (dayName === 'Pazar') {
        plan.push({
          date: format(currentDate, 'yyyy-MM-dd'),
          displayDate: format(currentDate, "d MMM ''yy", { locale: tr }),
          day: dayName,
          isRestDay: true,
          tasks: [],
          status: 'pending'
        });
        continue;
      }

      const dailyTasks = [];
      const subIndex = i % lessons.length;
      const lessonName = lessons[subIndex];
      const lessonTopics = curriculumMap[lessonName] || ['Genel Konu Çalışması'];
      const topicIndex = Math.floor(i / 7) % lessonTopics.length;
      const currentTopic = lessonTopics[topicIndex];

      dailyTasks.push({
        id: `task_${i}_1`,
        type: 'content',
        subject: lessonName,
        topic: currentTopic,
        duration: '45 dk',
        desc: 'Konu anlatımı ve formül çıkarma'
      });

      dailyTasks.push({
        id: `task_${i}_2`,
        type: 'practice',
        subject: lessonName,
        topic: currentTopic,
        qTarget: 40,
        desc: `40 soru çözümü (Karma)`
      });

      plan.push({
        date: format(currentDate, 'yyyy-MM-dd'),
        displayDate: format(currentDate, "d MMM ''yy", { locale: tr }),
        week: `H${weekNum}`,
        day: dayName,
        isRestDay: false,
        tasks: dailyTasks,
        status: 'pending'
      });
    }
    return plan;
  };

  const handleSelectExam = (examId: string) => {
    if (!db || !user) return;
    setIsInitializing(true);
    setSelectedId(examId);

    const adaptivePlan = generateAdaptivePlan(examId);
    const planRef = doc(db, 'studyPlans', user.uid);
    const userRef = doc(db, 'users', user.uid);

    const planData = {
      userId: user.uid,
      targetExam: examId,
      startDate: format(new Date(), 'yyyy-MM-dd'),
      masterPlan: adaptivePlan,
      updatedAt: serverTimestamp()
    };

    const studentProfileData = {
      targetExam: examId,
      studentProfile: {
        dailyCapacity: 4,
        questionCapacity: 150,
        restDay: 'Pazar',
        levels: {}
      },
      updatedAt: serverTimestamp()
    };

    setDoc(planRef, planData, { merge: true })
      .catch(async (err) => {
        const permissionError = new FirestorePermissionError({
          path: planRef.path,
          operation: 'write',
          requestResourceData: { plan: 'setup_direct' },
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      });

    updateDoc(userRef, studentProfileData)
      .then(() => {
        toast({ 
          title: 'SİSTEM YAPILANDIRILDI', 
          description: `${examId} için 1 yıllık stratejiniz oluşturuldu.`, 
          className: "bg-primary text-white rounded-[2rem]" 
        });
        router.push('/dashboard');
      })
      .catch(async (err) => {
        const permissionError = new FirestorePermissionError({
          path: userRef.path,
          operation: 'update',
          requestResourceData: studentProfileData,
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      })
      .finally(() => {
        setIsInitializing(false);
      });
  };

  const categorizedExams = useMemo(() => {
    const grouped: Record<string, any[]> = {};
    Object.values(EXAM_CONFIGS).forEach(exam => {
      if (!grouped[exam.category]) grouped[exam.category] = [];
      grouped[exam.category].push(exam);
    });
    return grouped;
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-6">
      <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <header className="flex items-center justify-between">
           <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-14 w-14 rounded-2xl bg-white hover:bg-primary hover:text-white transition-all shadow-sm group/nav">
              <ArrowLeft className="h-6 w-6 group-hover/nav:scale-110" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => router.push('/')} className="h-14 w-14 rounded-2xl bg-white hover:bg-primary hover:text-white transition-all shadow-sm group/nav">
              <Home className="h-6 w-6 group-hover/nav:scale-110" />
            </Button>
          </div>
        </header>

        <div className="text-center space-y-6 max-w-3xl mx-auto pt-8">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary text-white font-black text-[10px] uppercase tracking-widest shadow-xl">
             <Trophy className="h-4 w-4 text-accent" /> Hedef Belirleme Terminali
          </div>
          <h1 className="text-6xl md:text-8xl font-black text-primary tracking-tighter italic uppercase text-shadow-premium leading-none">
            Yolunu <span className="text-accent text-shadow-accent">Seç</span>
          </h1>
          <p className="text-xl text-muted-foreground font-medium italic">
            Hazırlandığınız programa göre DEK AI tüm müfredatını, analizlerini ve çalışma temposunu saniyeler içinde yapılandıracaktır.
          </p>
        </div>

        <div className="space-y-24 pt-12">
          {categories.map((cat) => (
            categorizedExams[cat.id]?.length > 0 && (
              <div key={cat.id} className="space-y-10">
                <div className="flex items-center gap-6">
                  <div className="h-12 w-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg">
                     <cat.icon className="h-6 w-6" />
                  </div>
                  <h2 className="text-2xl font-black italic tracking-tighter text-primary uppercase text-shadow-deep">{cat.label}</h2>
                  <div className="h-px flex-1 bg-primary/5 shadow-inner"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {categorizedExams[cat.id]?.map((exam) => (
                    <Card 
                      key={exam.id} 
                      className={cn(
                        "group relative overflow-hidden rounded-[3.5rem] border-none shadow-[0_40px_80px_-20px_rgba(15,23,42,0.08)] bg-white p-10 transition-all hover:-translate-y-4 hover:shadow-[0_60px_120px_-30px_rgba(15,23,42,0.15)] cursor-pointer border border-primary/5",
                        isInitializing && selectedId === exam.id && "ring-4 ring-accent"
                      )}
                      onClick={() => !isInitializing && handleSelectExam(exam.id)}
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-accent/15 transition-all"></div>
                      <div className="space-y-10">
                        <div className="h-20 w-20 rounded-[2rem] bg-primary/5 flex items-center justify-center text-primary group-hover:bg-accent group-hover:text-white transition-all shadow-inner group-hover:rotate-6">
                          {isInitializing && selectedId === exam.id ? <Loader2 className="h-10 w-10 animate-spin" /> : <exam.icon className="h-10 w-10" />}
                        </div>
                        <div className="space-y-3">
                          <h3 className="text-3xl font-black italic tracking-tighter text-primary uppercase text-shadow-deep group-hover:text-accent transition-colors leading-none">{exam.title}</h3>
                          <p className="text-sm text-muted-foreground font-medium italic line-clamp-2">{exam.description}</p>
                        </div>
                        <div className="pt-6 border-t border-primary/5 flex items-center justify-between">
                           <span className="text-[10px] font-black uppercase tracking-widest text-primary/40">{exam.targetGroup}</span>
                           <ChevronRight className="h-5 w-5 opacity-20" />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )
          ))}
        </div>
      </div>
    </div>
  );
}