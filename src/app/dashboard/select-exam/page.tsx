
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
  Zap, Brain, Activity, Layers, Target, Coffee, Timer, Dumbbell,
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { format, addDays } from 'date-fns';
import { tr } from 'date-fns/locale';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

export default function SelectExamPage() {
  const { user } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const { data: userData } = useDoc<any>(user?.uid ? `users/${user.uid}` : null);

  const [loading, setLoading] = useState<string | null>(null);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
  const [wizardStep, setWizardStep] = useState(1);
  const [isInitializing, setIsInitializing] = useState(false);

  const [wizardConfig, setWizardConfig] = useState({
    levels: {} as Record<string, string>,
    dailyHours: 4,
    questionCapacity: 150,
    weakSubjects: [] as string[],
    restDay: 'Pazar'
  });

  const categories = [
    { id: 'ÜNİVERSİTE', label: 'ÜNİVERSİTEYE GEÇİŞ', icon: GraduationCap },
    { id: 'KAMU SINAVLARI', label: 'KAMU PERSONELİ (KPSS)', icon: Landmark },
    { id: 'AKADEMİK', label: 'AKADEMİK KARİYER (ALES)', icon: Trophy },
    { id: 'YABANCI DİL', label: 'YABANCI DİL (YDS/YÖKDİL)', icon: Globe },
    { id: 'ORTAOKUL', label: 'ORTAOKUL (LGS)', icon: Sparkles },
  ];

  const currentLessons = useMemo(() => {
    if (selectedExamId && EXAM_CONFIGS[selectedExamId]) {
      return EXAM_CONFIGS[selectedExamId].lessons;
    }
    return ['Matematik', 'Türkçe', 'Fen Bilimleri', 'Sosyal Bilgiler'];
  }, [selectedExamId]);

  const handleSelectExam = (examId: string) => {
    setSelectedExamId(examId);
    setIsWizardOpen(true);
    setWizardStep(1);
  };

  const generateAdaptivePlan = () => {
    const plan = [];
    const baseDate = new Date();
    
    const curriculumMap: Record<string, string[]> = {
      'Matematik': ['Temel Kavramlar', 'Sayılar', 'Problemler', 'Fonksiyonlar'],
      'Türkçe': ['Paragraf', 'Cümlede Anlam', 'Yazım Kuralları'],
      'Geometri': ['Açılar', 'Üçgenler', 'Çember'],
    };

    for (let i = 0; i < 364; i++) {
      const currentDate = addDays(baseDate, i);
      const dayName = format(currentDate, 'EEEE', { locale: tr });
      const weekNum = Math.floor(i / 7) + 1;
      
      if (dayName === wizardConfig.restDay) {
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
      const subIndex = i % currentLessons.length;
      const lessonName = currentLessons[subIndex];
      const lessonTopics = curriculumMap[lessonName] || ['Genel Konu Çalışması'];
      const topicIndex = Math.floor(i / 7) % lessonTopics.length;
      const currentTopic = lessonTopics[topicIndex];

      const isWeak = wizardConfig.weakSubjects.includes(lessonName);
      const baseQ = Math.round(wizardConfig.questionCapacity / 3);
      const qTarget = isWeak ? Math.round(baseQ * 1.2) : baseQ;

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
        qTarget: qTarget,
        desc: `${qTarget} soru çözümü (Karma)`
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

  const handleCompleteSetup = () => {
    if (!db || !user || !selectedExamId) return;
    setIsInitializing(true);

    const adaptivePlan = generateAdaptivePlan();
    const planRef = doc(db, 'studyPlans', user.uid);
    const userRef = doc(db, 'users', user.uid);

    const planData = {
      userId: user.uid,
      targetExam: selectedExamId,
      startDate: format(new Date(), 'yyyy-MM-dd'),
      masterPlan: adaptivePlan,
      wizardConfig,
      updatedAt: serverTimestamp()
    };

    const studentProfileData = {
      targetExam: selectedExamId,
      studentProfile: wizardConfig,
      updatedAt: serverTimestamp()
    };

    setDoc(planRef, planData, { merge: true })
      .catch(async (err) => {
        const permissionError = new FirestorePermissionError({
          path: planRef.path,
          operation: 'write',
          requestResourceData: { plan: 'setup_after_exam_select' },
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      });

    updateDoc(userRef, studentProfileData)
      .then(() => {
        toast({ 
          title: 'SİSTEM YAPILANDIRILDI', 
          description: `${selectedExamId} için 364 günlük adaptif planınız oluşturuldu.`, 
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
        setIsWizardOpen(false);
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
            Hazırlandığınız programa göre DEK AI tüm müfredatını, analizlerini ve çalışma temposunu tamamen size özel yapılandıracaktır.
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
                      className="group relative overflow-hidden rounded-[3.5rem] border-none shadow-[0_40px_80px_-20px_rgba(15,23,42,0.08)] bg-white p-10 transition-all hover:-translate-y-4 hover:shadow-[0_60px_120px_-30px_rgba(15,23,42,0.15)] cursor-pointer border border-primary/5"
                      onClick={() => handleSelectExam(exam.id)}
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-accent/15 transition-all"></div>
                      <div className="space-y-10">
                        <div className="h-20 w-20 rounded-[2rem] bg-primary/5 flex items-center justify-center text-primary group-hover:bg-accent group-hover:text-white transition-all shadow-inner group-hover:rotate-6">
                          <exam.icon className="h-10 w-10" />
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

      {/* AKADEMİK TEŞHİS SİHİRBAZI */}
      <Dialog open={isWizardOpen} onOpenChange={setIsWizardOpen}>
         <DialogContent className="rounded-[4rem] border-none shadow-2xl p-0 bg-white max-w-5xl overflow-hidden">
            <DialogHeader className="sr-only">
               <DialogTitle>Akademik Teşhis Anketi</DialogTitle>
               <DialogDescription>Seviye ve kapasite belirleme süreci.</DialogDescription>
            </DialogHeader>
            <div className="grid lg:grid-cols-[380px_1fr] h-[800px]">
               <div className="bg-primary p-16 text-white flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-80 h-80 bg-accent/10 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2" />
                  <div className="space-y-12 relative z-10">
                     <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-white/10 text-white font-black text-[10px] uppercase tracking-[0.4em] border border-white/10 shadow-2xl italic">
                        <ShieldCheck className="h-4 w-4 text-accent" /> SETUP FAZI V4.8
                     </div>
                     <h3 className="text-5xl font-black italic tracking-tighter uppercase leading-none">AKADEMİK <br /><span className="text-accent text-shadow-accent">TEŞHİS</span></h3>
                     <div className="space-y-8">
                        {[1, 2, 3, 4].map(s => (
                           <div key={s} className="flex items-center gap-6">
                              <div className={cn("h-10 w-10 rounded-full border-2 flex items-center justify-center font-black text-xs transition-all duration-500", wizardStep >= s ? "bg-accent border-accent text-primary shadow-xl scale-110" : "border-white/10 text-white/20")}>{s}</div>
                              <span className={cn("text-[11px] font-black uppercase tracking-[0.2em] transition-all", wizardStep >= s ? "text-white" : "text-white/20")}>
                                 {s === 1 ? 'SEVİYE ANALİZİ' : s === 2 ? 'ÇALIŞMA TEMPON' : s === 3 ? 'ZAYIF DERSLER' : 'DİNLENME STRATEJİSİ'}
                              </span>
                           </div>
                        ))}
                     </div>
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 italic">Seçilen Sınav: {selectedExamId}</p>
               </div>

               <div className="p-20 space-y-14 overflow-y-auto bg-white">
                  {wizardStep === 1 && (
                    <div className="space-y-12 animate-in fade-in slide-in-from-right-8 duration-700">
                       <div className="space-y-4">
                          <h4 className="text-5xl font-black italic tracking-tighter text-primary uppercase leading-tight">DERS BAZLI <br />SEVİYEN NEDİR?</h4>
                          <p className="text-xl text-muted-foreground italic font-medium">Bu analiz ({selectedExamId}) müfredatına göre planlanacaktır.</p>
                       </div>
                       <div className="grid gap-4 max-h-[400px] pr-4 overflow-y-auto scrollbar-hide">
                          {currentLessons.map(lesson => (
                            <div key={lesson} className="flex items-center justify-between p-8 rounded-[2.5rem] bg-slate-50 border border-primary/5">
                               <span className="font-black text-sm uppercase tracking-widest text-primary">{lesson}</span>
                               <div className="flex gap-2">
                                  {['Başlangıç', 'Orta', 'İleri'].map(lvl => (
                                    <button 
                                      key={lvl} 
                                      onClick={() => setWizardConfig({...wizardConfig, levels: {...wizardConfig.levels, [lesson]: lvl}})}
                                      className={cn("px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all", wizardConfig.levels[lesson] === lvl ? "bg-primary text-white shadow-lg" : "bg-white text-muted-foreground hover:bg-slate-200")}
                                    >
                                      {lvl}
                                    </button>
                                  ))}
                               </div>
                            </div>
                          ))}
                       </div>
                    </div>
                  )}

                  {wizardStep === 2 && (
                    <div className="space-y-12 animate-in fade-in slide-in-from-right-8 duration-700">
                       <div className="space-y-4">
                          <h4 className="text-5xl font-black italic tracking-tighter text-primary uppercase leading-tight">ÇALIŞMA <br />TEMPON NEDİR?</h4>
                          <p className="text-xl text-muted-foreground italic font-medium">Günlük ne kadarlık bir akademik yükü kaldırabilirsin?</p>
                       </div>
                       <div className="grid gap-6">
                          {[
                            { id: 'light', label: 'DÜŞÜK TEMPO', desc: '1-2 saat / 40-80 soru', icon: Coffee, val: 80, hrs: 2 },
                            { id: 'moderate', label: 'ORTA TEMPO', desc: '2-4 saat / 80-150 soru', icon: Timer, val: 150, hrs: 4 },
                            { id: 'high', label: 'YÜKSEK TEMPO', desc: '4-6+ saat / 150-250+ soru', icon: Dumbbell, val: 250, hrs: 6 },
                          ].map(t => (
                            <button key={t.id} onClick={() => setWizardConfig({...wizardConfig, questionCapacity: t.val, dailyHours: t.hrs})} className={cn("p-10 rounded-[3rem] border-2 text-left transition-all flex items-center gap-10 group", wizardConfig.questionCapacity === t.val ? "bg-primary border-primary text-white shadow-3xl scale-[1.03]" : "bg-slate-50 border-transparent hover:bg-white hover:border-primary/10")}>
                               <div className={cn("h-16 w-16 rounded-2xl flex items-center justify-center shadow-lg group-hover:rotate-6 transition-all", wizardConfig.questionCapacity === t.val ? "bg-accent text-primary" : "bg-white text-primary")}><t.icon className="h-8 w-8" /></div>
                               <div><p className="font-black text-xl uppercase tracking-tight leading-none mb-2">{t.label}</p><p className={cn("text-xs font-medium italic", wizardConfig.questionCapacity === t.val ? "text-white/60" : "text-muted-foreground")}>{t.desc}</p></div>
                            </button>
                          ))}
                       </div>
                    </div>
                  )}

                  {wizardStep === 3 && (
                    <div className="space-y-12 animate-in fade-in slide-in-from-right-8 duration-700">
                       <div className="space-y-4">
                          <h4 className="text-5xl font-black italic tracking-tighter text-primary uppercase leading-tight">ZAYIF OLDUĞUN <br />DERSLER?</h4>
                          <p className="text-xl text-muted-foreground italic font-medium">Bu derslerde soru hedefleri saniyeler içinde %20 artırılacaktır.</p>
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                          {currentLessons.map(lesson => (
                            <button 
                              key={lesson} 
                              onClick={() => {
                                const current = wizardConfig.weakSubjects;
                                const next = current.includes(lesson) ? current.filter(l => l !== lesson) : [...current, lesson];
                                setWizardConfig({...wizardConfig, weakSubjects: next});
                              }}
                              className={cn("p-8 rounded-[2rem] border-2 text-center transition-all font-black text-[11px] uppercase tracking-widest shadow-sm", wizardConfig.weakSubjects.includes(lesson) ? "bg-accent border-accent text-primary shadow-xl scale-[1.05]" : "bg-slate-50 border-transparent text-muted-foreground")}
                            >
                               {lesson}
                            </button>
                          ))}
                       </div>
                    </div>
                  )}

                  {wizardStep === 4 && (
                    <div className="space-y-12 animate-in fade-in slide-in-from-right-8 duration-700">
                       <div className="space-y-4">
                          <h4 className="text-5xl font-black italic tracking-tighter text-primary uppercase leading-tight">DİNLENME <br />STRATEJİSİ?</h4>
                          <p className="text-xl text-muted-foreground italic font-medium">Haftada bir günü tamamen boş bırakmalıyız.</p>
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                          {['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'].map(day => (
                            <button key={day} onClick={() => setWizardConfig({...wizardConfig, restDay: day})} className={cn("p-8 rounded-[2rem] border-2 text-center transition-all font-black text-[11px] uppercase tracking-widest", wizardConfig.restDay === day ? "bg-primary border-primary text-white shadow-xl scale-[1.05]" : "bg-slate-50 border-transparent text-muted-foreground")}>
                               {day}
                            </button>
                          ))}
                       </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-10 border-t border-primary/5">
                     <Button variant="ghost" disabled={wizardStep === 1} onClick={() => setWizardStep(s => s - 1)} className="font-black text-[11px] uppercase tracking-widest italic opacity-40 hover:opacity-100 transition-all">GERİ DÖN</Button>
                     {wizardStep < 4 ? (
                       <Button onClick={() => setWizardStep(s => s + 1)} className="h-16 px-12 rounded-2xl bg-primary hover:bg-accent text-white font-black text-[11px] uppercase tracking-widest shadow-2xl transition-all">SONRAKİ ADIM</Button>
                     ) : (
                       <Button onClick={handleCompleteSetup} disabled={isInitializing} className="h-20 px-14 rounded-[2rem] bg-accent hover:bg-primary text-primary hover:text-white font-black text-sm uppercase tracking-widest shadow-2xl transition-all gap-4">
                          {isInitializing ? <Loader2 className="h-6 w-6 animate-spin" /> : <ShieldCheck className="h-6 w-6" />}
                          SİSTEMİ YAPILANDIR
                       </Button>
                     )}
                  </div>
               </div>
            </div>
         </DialogContent>
      </Dialog>
    </div>
  );
}
