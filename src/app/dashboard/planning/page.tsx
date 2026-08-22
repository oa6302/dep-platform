'use client';

import { useUser, useDoc, useFirestore } from '@/firebase';
import { useState, useMemo, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, Calendar, Zap, Loader2, ShieldCheck, 
  ArrowLeft, Home, Milestone, CheckCircle2, 
  Activity, Sparkles, Coffee, Timer, Dumbbell, 
  ChevronRight, RefreshCw, Target, Layers,
  Info
} from 'lucide-react';
import { doc, setDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { format, addDays } from 'date-fns';
import { tr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';
import { EXAM_CONFIGS } from '@/lib/exam-configs';

const DEFAULT_LESSONS = ['Matematik', 'Türkçe', 'Geometri', 'Fizik', 'Kimya', 'Biyoloji', 'Tarih', 'Coğrafya', 'Felsefe', 'Din Kültürü'];

export default function PlanningPage() {
  const { user } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  
  const { data: userData } = useDoc<any>(user?.uid ? `users/${user.uid}` : null);
  const { data: studyPlan } = useDoc<any>(user?.uid ? `studyPlans/${user.uid}` : null);

  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [isInitializing, setIsInitializing] = useState(false);
  const [wizardConfig, setWizardConfig] = useState({
    levels: {} as Record<string, string>,
    dailyHours: 4,
    questionCapacity: 150,
    weakSubjects: [] as string[],
    restDay: 'Pazar'
  });

  // Kullanıcının alanına (TM, SAY vb.) göre dersleri belirle
  const currentLessons = useMemo(() => {
    if (userData?.targetExam && EXAM_CONFIGS[userData.targetExam]) {
      return EXAM_CONFIGS[userData.targetExam].lessons;
    }
    return DEFAULT_LESSONS;
  }, [userData]);

  const planStartDate = studyPlan?.startDate || format(new Date(), 'yyyy-MM-dd');

  const generateAdaptivePlan = () => {
    const plan = [];
    const baseDate = new Date(planStartDate);
    
    // Ders bazlı temel konu havuzu (MVP için basitleştirilmiş)
    const curriculumMap: Record<string, string[]> = {
      'Matematik': ['Temel Kavramlar', 'Sayılar', 'Problemler', 'Fonksiyonlar'],
      'TYT Matematik': ['Temel Kavramlar', 'Sayılar', 'Problemler'],
      'AYT Matematik': ['Trigonometri', 'Logaritma', 'Limit', 'Türev', 'İntegral'],
      'Türkçe': ['Paragraf', 'Cümlede Anlam', 'Yazım Kuralları'],
      'Edebiyat': ['Şiir Bilgisi', 'Cumhuriyet Dönemi', 'Divan Edebiyatı'],
      'Geometri': ['Açılar', 'Üçgenler', 'Çember'],
      'Tarih': ['İslamiyet Öncesi', 'Osmanlı Tarihi', 'İnkılap Tarihi'],
      'Coğrafya': ['Nüfus', 'İklim', 'Harita Bilgisi'],
      'Fizik': ['Madde ve Özellikleri', 'Kuvvet ve Hareket'],
      'Kimya': ['Atom', 'Kimyasal Türler'],
      'Biyoloji': ['Hücre', 'Kalıtım'],
    };

    for (let i = 0; i < 364; i++) {
      const currentDate = addDays(baseDate, i);
      const dayName = format(currentDate, 'EEEE', { locale: tr });
      const weekNum = Math.floor(i / 7) + 1;
      
      if (dayName === wizardConfig.restDay) {
        plan.push({
          date: format(currentDate, 'yyyy-MM-dd'),
          day: dayName,
          isRestDay: true,
          tasks: []
        });
        continue;
      }

      const dailyTasks = [];
      // Sadece kullanıcının alanındaki dersleri döngüye sok
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

  const handleSavePlan = () => {
    if (!db || !user) return;
    setIsInitializing(true);

    const adaptivePlan = generateAdaptivePlan();
    const planRef = doc(db, 'studyPlans', user.uid);
    const userRef = doc(db, 'users', user.uid);

    const planData = {
      userId: user.uid,
      startDate: planStartDate,
      masterPlan: adaptivePlan,
      wizardConfig,
      updatedAt: serverTimestamp()
    };

    const studentProfileData = {
      studentProfile: wizardConfig,
      updatedAt: serverTimestamp()
    };

    // Non-blocking writes - Firebase Studio environment optimized
    setDoc(planRef, planData, { merge: true })
      .catch(async (err) => {
        const permissionError = new FirestorePermissionError({
          path: planRef.path,
          operation: 'write',
          requestResourceData: planData,
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      });

    updateDoc(userRef, studentProfileData)
      .catch(async (err) => {
        const permissionError = new FirestorePermissionError({
          path: userRef.path,
          operation: 'update',
          requestResourceData: studentProfileData,
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      });

    toast({ 
      title: 'Strateji Aktif Edildi', 
      description: '364 günlük adaptif planınız alanınıza göre yapılandırıldı.', 
      className: "bg-primary text-white rounded-[2rem]" 
    });
    
    setIsWizardOpen(false);
    setIsInitializing(false);
  };

  return (
    <div className="p-8 lg:p-14 space-y-12 max-w-7xl mx-auto w-full animate-in fade-in duration-1000 bg-[#FAFBFF]">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-12 w-12 rounded-xl bg-white shadow-sm border border-primary/5 hover:bg-primary hover:text-white transition-all"><ArrowLeft className="h-6 w-6" /></Button>
            <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard')} className="h-12 w-12 rounded-xl bg-white shadow-sm border border-primary/5 hover:bg-primary hover:text-white transition-all"><Home className="h-6 w-6" /></Button>
          </div>
          <div className="space-y-2">
             <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-primary text-white font-black text-[10px] uppercase tracking-widest shadow-xl">
                <Sparkles className="h-3.5 w-3.5 text-accent animate-pulse" /> AOS ADAPTIVE ENGINE v4.8
             </div>
             <h2 className="text-6xl font-black tracking-tighter italic text-primary uppercase leading-none text-shadow-premium">
                AKADEMİK <br /><span className="text-accent text-shadow-accent">STRATEJİ</span>
             </h2>
          </div>
        </div>
        <Button onClick={() => setIsWizardOpen(true)} className="h-24 px-12 rounded-[2.5rem] bg-primary hover:bg-accent text-white transition-all duration-700 font-black text-sm uppercase tracking-[0.3em] gap-6 shadow-[0_40px_80px_-20px_rgba(15,23,42,0.4)] group">
           <Zap className="h-8 w-8 text-accent group-hover:animate-pulse" /> ANKETİ BAŞLAT VE PLANLA
        </Button>
      </header>

      <Tabs defaultValue="overview" className="space-y-12">
        <TabsList className="bg-slate-100/50 p-2 rounded-[3rem] h-20 flex gap-2 border border-primary/5">
          <TabsTrigger value="overview" className="rounded-2xl px-10 h-full font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-lg gap-3"><Milestone className="h-4 w-4" /> FAZ ANALİZİ</TabsTrigger>
          <TabsTrigger value="daily" className="rounded-2xl px-10 h-full font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-lg gap-3"><Calendar className="h-4 w-4" /> 364 GÜNLÜK AKIŞ</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-12 animate-in fade-in">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { title: 'TEMEL ATMA', week: '1-4', icon: Layers, color: 'bg-blue-500' },
                { title: 'GELİŞTİRME', week: '5-16', icon: Activity, color: 'bg-emerald-500' },
                { title: 'DENEME KAMPI', week: '17-40', icon: Target, color: 'bg-orange-500' },
                { title: 'ROOT ANALİZ', week: '41-52', icon: Brain, color: 'bg-primary' },
              ].map((f, i) => (
                <Card key={i} className="p-10 rounded-[3.5rem] bg-white border border-primary/5 shadow-xl hover:-translate-y-2 transition-all group overflow-hidden relative">
                   <div className={cn("h-1.5 w-full absolute top-0 left-0", f.color)} />
                   <div className="space-y-6">
                      <div className="flex justify-between items-center">
                         <Badge variant="outline" className="font-black text-[9px] uppercase tracking-widest px-3 py-1 border-primary/10">{f.week}. HAFTA</Badge>
                         <f.icon className="h-6 w-6 text-primary opacity-20" />
                      </div>
                      <h4 className="text-2xl font-black italic tracking-tighter text-primary uppercase leading-tight">{f.title}</h4>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-40">Stratejik Hedefleme Aktif</p>
                   </div>
                </Card>
              ))}
           </div>

           <Card className="rounded-[4rem] border-none bg-primary text-white p-16 relative overflow-hidden group shadow-2xl">
              <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent/5 blur-[150px] rounded-full translate-x-1/2 -translate-y-1/2" />
              <div className="flex flex-col lg:flex-row justify-between items-center gap-16 relative z-10">
                 <div className="space-y-8 flex-1">
                    <h3 className="text-7xl font-black italic tracking-tighter uppercase leading-none">PEDAGOGICAL <br /><span className="text-accent">ENGINE</span></h3>
                    <p className="text-2xl opacity-60 font-medium italic leading-relaxed max-w-xl">364 günlük programınız; {userData?.targetExam || 'TYT'} müfredatına ve kapasitenize göre saniyeler içinde yeniden optimize edilir.</p>
                    <div className="flex gap-8">
                       <div><p className="text-5xl font-black text-accent italic">52</p><p className="text-[10px] font-black uppercase tracking-widest opacity-40">HAFTA</p></div>
                       <div className="w-px h-12 bg-white/10" />
                       <div><p className="text-5xl font-black text-white italic">364</p><p className="text-[10px] font-black uppercase tracking-widest opacity-40">GÜN</p></div>
                       <div className="w-px h-12 bg-white/10" />
                       <div><p className="text-5xl font-black text-white italic">{currentLessons.length}</p><p className="text-[10px] font-black uppercase tracking-widest opacity-40">AKTİF DERS</p></div>
                    </div>
                 </div>
                 <div className="bg-white/5 backdrop-blur-3xl p-12 rounded-[4rem] border border-white/10 shadow-2xl space-y-10 w-full max-w-md">
                    <div className="space-y-4">
                       <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-4 italic">ALAN ODAKLI MÜFREDAT</Label>
                       <div className="p-6 bg-white/10 rounded-2xl border border-white/10">
                          <p className="text-xl font-black text-accent uppercase italic">{userData?.targetExam?.replace('_', ' ') || 'TYT GENEL'}</p>
                          <p className="text-[9px] font-bold text-white/40 mt-1 uppercase">SİSTEM TARAFINDAN OTOMATİK ALGILANDI</p>
                       </div>
                    </div>
                    <Button onClick={() => setIsWizardOpen(true)} className="w-full h-24 rounded-[2.5rem] bg-accent hover:bg-white text-primary font-black text-sm uppercase tracking-[0.2em] shadow-2xl transition-all gap-4">
                       ANKETİ BAŞLAT
                    </Button>
                 </div>
              </div>
           </Card>
        </TabsContent>

        <TabsContent value="daily" className="animate-in fade-in">
           <Card className="rounded-[4rem] border border-primary/5 shadow-2xl overflow-hidden bg-white">
              <div className="overflow-x-auto">
                 <table className="w-full">
                    <thead className="bg-slate-50 border-b border-primary/5">
                       <tr>
                          {['TARİH', 'HAFTA', 'GÜN', 'DURUM', 'İÇERİK ÖZETİ', 'HEDEF'].map(h => <th key={h} className="p-10 text-left text-[10px] font-black uppercase tracking-widest text-primary/40">{h}</th>)}
                       </tr>
                    </thead>
                    <tbody>
                       {studyPlan?.masterPlan?.slice(0, 30).map((p: any, i: number) => (
                         <tr key={i} className="border-b border-primary/5 hover:bg-slate-50/50 transition-all">
                            <td className="p-10 font-bold text-primary">{p.displayDate}</td>
                            <td className="p-10"><Badge variant="outline" className="font-black text-[9px] border-primary/10">{p.week}</Badge></td>
                            <td className="p-10 font-black italic uppercase tracking-widest text-primary">{p.day}</td>
                            <td className="p-10">{p.isRestDay ? <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[9px]">MOLA</Badge> : <div className="h-3 w-3 rounded-full bg-slate-200" />}</td>
                            <td className="p-10">
                               <div className="space-y-1">
                                  {p.tasks?.slice(0,1).map((t: any) => <p key={t.id} className="font-black text-lg text-primary uppercase italic">{t.subject} - {t.topic}</p>)}
                                  <p className="text-[10px] font-bold text-muted-foreground opacity-40 uppercase">{p.tasks?.length || 0} OPERASYONEL GÖREV</p>
                               </div>
                            </td>
                            <td className="p-10 font-black text-accent text-2xl italic tracking-tighter">+{p.tasks?.reduce((acc: number, t: any) => acc + (t.qTarget || 0), 0) || '-'}</td>
                         </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </Card>
        </TabsContent>
      </Tabs>

      {/* SETUP WIZARD */}
      <Dialog open={isWizardOpen} onOpenChange={setIsWizardOpen}>
         <DialogContent className="rounded-[4rem] border-none shadow-2xl p-0 bg-white max-w-5xl overflow-hidden">
            <DialogHeader className="sr-only">
               <DialogTitle>Akademik Planlama Sihirbazı</DialogTitle>
               <DialogDescription>TYT kişiselleştirilmiş akademik plan oluşturma süreci.</DialogDescription>
            </DialogHeader>
            <div className="grid lg:grid-cols-[380px_1fr] h-[800px]">
               <div className="bg-primary p-16 text-white flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-80 h-80 bg-accent/10 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2" />
                  <div className="space-y-12 relative z-10">
                     <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-white/10 text-white font-black text-[10px] uppercase tracking-[0.4em] border border-white/10 shadow-2xl italic">
                        <ShieldCheck className="h-4 w-4 text-accent" /> AOS SETUP FAZI V4.8
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
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 italic">AOS Pedagogical Engine: Bilimsel verilerle planlama yapar.</p>
               </div>

               <div className="p-20 space-y-14 overflow-y-auto bg-white">
                  {wizardStep === 1 && (
                    <div className="space-y-12 animate-in fade-in slide-in-from-right-8 duration-700">
                       <div className="space-y-4">
                          <h4 className="text-5xl font-black italic tracking-tighter text-primary uppercase leading-tight">DERS BAZLI <br />SEVİYEN NEDİR?</h4>
                          <p className="text-xl text-muted-foreground italic font-medium">Bu analiz alanın olan ({userData?.targetExam?.replace('_', ' ')}) derslerine göre yapılır.</p>
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
                          <p className="text-xl text-muted-foreground italic font-medium">Mental yorgunluğu önlemek için haftada bir günü tamamen boş bırakmalıyız.</p>
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
                       <Button onClick={handleSavePlan} disabled={isInitializing} className="h-20 px-14 rounded-[2rem] bg-accent hover:bg-primary text-primary hover:text-white font-black text-sm uppercase tracking-widest shadow-2xl transition-all gap-4">
                          {isInitializing ? <Loader2 className="h-6 w-6 animate-spin" /> : <ShieldCheck className="h-6 w-6" />}
                          STRATEJİYİ AKTİF ET
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
