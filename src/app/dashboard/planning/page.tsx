
'use client';

import { useUser, useDoc, useFirestore, useCollection } from '@/firebase';
import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Calendar, Brain, Clock, CheckCircle, Plus, ChevronRight, 
  Loader2, Trash2, Edit3, CalendarCheck, Book, PlaySquare, 
  Sparkles, Zap, Info, Target, Activity, ArrowLeft, Home, 
  Layers, TrendingUp, Milestone, Flag, Dna, Filter,
  Table, BarChart3, AlertCircle, History, Calculator,
  Search, Save, ArrowUpRight, GraduationCap, RefreshCw,
  FlaskConical, Scale, History as HistoryIcon, ShieldCheck,
  Gamepad2, Dumbbell, Coffee, Timer
} from 'lucide-react';
import { doc, setDoc, serverTimestamp, collection, addDoc, query, where, orderBy, deleteDoc, updateDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { format, addDays, startOfWeek, isSameDay, differenceInDays } from 'date-fns';
import { tr } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const PHASES = [
  { id: 1, title: 'FAZ 1: Temel Atma', weeks: '1-2', desc: 'Diagnostik denemeler ve temel yetkinlik inşası.', color: 'bg-blue-500' },
  { id: 2, title: 'FAZ 2: Konu Geliştirme', weeks: '3-14', desc: 'Müfredatın %70 kazanım hedefi.', color: 'bg-emerald-500' },
  { id: 3, title: 'FAZ 3: AYT Entegrasyonu', weeks: '15-22', desc: 'İleri seviye akademik konulara giriş.', color: 'bg-indigo-500' },
  { id: 4, title: 'FAZ 4: Branş Kampı', weeks: '23-34', desc: 'Yoğun teknik branş maratonu.', color: 'bg-orange-500' },
  { id: 5, title: 'FAZ 5: Karma Tekrar', weeks: '35-42', desc: 'Tüm müfredatın denemelerle harmanlanması.', color: 'bg-purple-500' },
  { id: 6, title: 'FAZ 6: Yoğun Deneme', weeks: '43-52', desc: 'Her gün bir genel deneme ve derin analiz.', color: 'bg-rose-500' },
];

export default function PlanningPage() {
  const { user } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [searchDay, setSearchDay] = useState('');
  const [examType, setExamType] = useState<'TYT' | 'AYT'>('TYT');
  const [isInitializing, setIsInitializing] = useState(false);
  
  // Wizard State
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardConfig, setWizardStepConfig] = useState({
    level: 'intermediate', // beginner, intermediate, advanced
    tempo: 'moderate', // light, moderate, intensive
    focusLessons: [] as string[],
    offDay: 'Pazar'
  });

  // Firestore Verileri
  const { data: userData } = useDoc<any>(user?.uid ? `users/${user.uid}` : null);
  const { data: studyPlan, loading: planLoading } = useDoc<any>(user?.uid ? `studyPlans/${user.uid}` : null);
  const { data: mistakes = [] } = useCollection<any>(user?.uid && db ? query(collection(db, 'mistakes'), where('userId', '==', user.uid), orderBy('createdAt', 'desc')) : null);
  const { data: trials = [] } = useCollection<any>(user?.uid && db ? query(collection(db, 'trials'), where('userId', '==', user.uid), orderBy('createdAt', 'desc')) : null);

  const planStartDate = studyPlan?.startDate || '2026-08-24';

  const averageNet = useMemo(() => {
    if (trials.length === 0) return '0.00';
    const total = trials.reduce((acc, curr) => acc + (parseFloat(curr.net) || 0), 0);
    return (total / trials.length).toFixed(2);
  }, [trials]);

  // MASTER PLAN JENERATÖRÜ (KIŞISELLEŞTIRILMIŞ)
  const generateCustomPlan = (config: typeof wizardConfig) => {
    const baseDate = new Date(planStartDate);
    const plan = [];
    
    const subjects = examType === 'TYT' 
      ? ['Matematik', 'Türkçe', 'Fen Bilimleri', 'Sosyal Bilgiler']
      : ['AYT Matematik', 'Fizik', 'Kimya', 'Biyoloji', 'Edebiyat'];

    // Tempolara göre katsayılar
    const tempoMultiplier = config.tempo === 'light' ? 0.7 : config.tempo === 'intensive' ? 1.5 : 1;
    const levelBase = config.level === 'beginner' ? 30 : config.level === 'advanced' ? 80 : 50;

    for (let i = 0; i < 364; i++) {
      const currentDate = addDays(baseDate, i);
      const weekNum = Math.floor(i / 7) + 1;
      const dayName = format(currentDate, 'EEEE', { locale: tr });
      
      let phaseId = 1;
      if (weekNum <= 2) phaseId = 1;
      else if (weekNum <= 14) phaseId = 2;
      else if (weekNum <= 22) phaseId = 3;
      else if (weekNum <= 34) phaseId = 4;
      else if (weekNum <= 42) phaseId = 5;
      else phaseId = 6;

      let activity = 'KONU + SORU';
      if (config.level === 'advanced' && phaseId > 2) activity = 'SORU + ANALİZ';
      
      if (dayName === 'Cumartesi') activity = 'TEKRAR + ANALİZ';
      if (dayName === config.offDay) activity = 'DİNLENME';
      if (dayName === 'Pazar' && i % 14 === 0 && config.offDay !== 'Pazar') activity = 'GENEL DENEME';

      const subjectIndex = i % subjects.length;
      const currentSubject = subjects[subjectIndex];
      
      // Odak dersleri kontrolü (Odak derslerde soru sayısı artar)
      const isFocusSubject = config.focusLessons.includes(currentSubject);
      const focusBoost = isFocusSubject ? 1.2 : 1;

      plan.push({
        date: format(currentDate, 'yyyy-MM-dd'),
        displayDate: format(currentDate, "d MMM ''yy", { locale: tr }),
        week: `H${String(weekNum).padStart(2, '0')}`,
        day: dayName,
        phase: phaseId,
        activity,
        subject: currentSubject,
        topic: i === 0 ? 'Diagnostik Seviye Tespit' : `${currentSubject} - Ünite ${Math.floor(i/10) + 1}`,
        qTarget: activity === 'DİNLENME' ? 0 : Math.round((levelBase + (phaseId * 10)) * tempoMultiplier * focusBoost),
        status: 'pending',
        createdAt: new Date().toISOString()
      });
    }
    return plan;
  };

  const handleInitializePlan = async () => {
    if (!db || !user) return;
    setIsInitializing(true);
    
    try {
      const customPlan = generateCustomPlan(wizardConfig);
      const planRef = doc(db, 'studyPlans', user.uid);
      const planData = {
        userId: user.uid,
        startDate: planStartDate,
        examType,
        wizardConfig,
        masterPlan: customPlan,
        updatedAt: serverTimestamp()
      };

      await setDoc(planRef, planData, { merge: true });
      toast({ 
        title: 'Master Plan Hazır', 
        description: `Seviyenize özel 364 günlük program buluta işlendi. Başarılar dileriz!`, 
        className: "bg-primary text-white rounded-[2rem]" 
      });
      setIsWizardOpen(false);
      setWizardStep(1);
    } catch (e) {
      toast({ variant: 'destructive', title: 'Hata', description: 'Plan oluşturulamadı.' });
    } finally {
      setIsInitializing(false);
    }
  };

  const handleAddMistake = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!db || !user) return;
    const formData = new FormData(e.currentTarget);
    const data = {
      userId: user.uid,
      subject: formData.get('subject'),
      topic: formData.get('topic'),
      reason: formData.get('reason'),
      createdAt: serverTimestamp(),
    };
    try {
      await addDoc(collection(db, 'mistakes'), data);
      toast({ title: 'Yanlış Kaydedildi', description: 'Konu bazlı analize eklendi.' });
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      toast({ variant: 'destructive', title: 'Hata', description: 'Kaydedilemedi.' });
    }
  };

  const handleAddTrial = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!db || !user) return;
    const formData = new FormData(e.currentTarget);
    const correct = parseInt(formData.get('correct') as string) || 0;
    const wrong = parseInt(formData.get('wrong') as string) || 0;
    const net = (correct - (wrong * 0.25)).toFixed(2);
    
    const data = {
      userId: user.uid,
      examName: formData.get('examName'),
      correct,
      wrong,
      net,
      createdAt: serverTimestamp(),
    };
    try {
      await addDoc(collection(db, 'trials'), data);
      toast({ title: 'Deneme İşlendi', description: `Netiniz: ${net}` });
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      toast({ variant: 'destructive', title: 'Hata', description: 'Kaydedilemedi.' });
    }
  };

  const currentPlan = studyPlan?.masterPlan || [];
  const filteredPlan = currentPlan.filter((p: any) => 
    p.topic.toLowerCase().includes(searchDay.toLowerCase()) || 
    p.week.toLowerCase().includes(searchDay.toLowerCase())
  );

  return (
    <div className="p-8 lg:p-14 space-y-12 max-w-[1600px] mx-auto w-full animate-in fade-in duration-1000 bg-[#FAFBFF]">
      <header className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-12">
        <div className="space-y-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-12 w-12 rounded-xl bg-white shadow-sm border border-primary/5 hover:bg-primary hover:text-white transition-all"><ArrowLeft className="h-6 w-6" /></Button>
            <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard')} className="h-12 w-12 rounded-xl bg-white shadow-sm border border-primary/5 hover:bg-primary hover:text-white transition-all"><Home className="h-6 w-6" /></Button>
          </div>
          <div className="space-y-5">
            <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-primary text-white font-black text-[11px] uppercase tracking-[0.4em] shadow-2xl italic border border-white/10">
               <Activity className="h-4 w-4 text-accent animate-pulse" /> 364 GÜNLÜK AKADEMİK OPERASYON v4.8
            </div>
            <h2 className="text-7xl md:text-9xl font-black tracking-tighter italic text-primary uppercase leading-[0.8] text-shadow-premium">
               STRATEJİK <br /><span className="text-accent text-shadow-accent">PLANLAMA</span>
            </h2>
          </div>
        </div>
        <Card className="p-10 rounded-[3rem] bg-white border-none shadow-2xl flex items-center gap-10">
           <div className="h-20 w-20 rounded-[2rem] bg-accent flex items-center justify-center shadow-xl"><Calculator className="h-10 w-10 text-primary" /></div>
           <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-40">ORTALAMA NET</p>
              <p className="text-5xl font-black text-primary italic tracking-tighter">{averageNet}</p>
           </div>
        </Card>
      </header>

      <Tabs defaultValue="overview" className="space-y-12" onValueChange={setActiveTab}>
        <TabsList className="bg-slate-100/50 p-2.5 rounded-[3rem] h-24 shadow-inner flex border border-primary/5 overflow-x-auto scrollbar-hide">
          <TabsTrigger value="overview" className="rounded-[2.5rem] px-12 h-full font-black text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-xl gap-4"><Milestone className="h-5 w-5" /> 1. Faz Analizi</TabsTrigger>
          <TabsTrigger value="daily" className="rounded-[2.5rem] px-12 h-full font-black text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-xl gap-4"><Calendar className="h-5 w-5" /> 2. 364 Günlük Akış</TabsTrigger>
          <TabsTrigger value="mistakes" className="rounded-[2.5rem] px-12 h-full font-black text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-xl gap-4"><AlertCircle className="h-5 w-5" /> 3. Yanlış Takibi</TabsTrigger>
          <TabsTrigger value="trials" className="rounded-[2.5rem] px-12 h-full font-black text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-xl gap-4"><TrendingUp className="h-5 w-5" /> 4. Performans</TabsTrigger>
        </TabsList>

        {/* 1. FAZ ANALİZİ */}
        <TabsContent value="overview" className="space-y-12 animate-in fade-in duration-700">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {PHASES.map((phase) => (
                <Card key={phase.id} className="p-10 rounded-[3.5rem] bg-white border border-primary/5 shadow-xl hover:-translate-y-2 transition-all group overflow-hidden relative">
                   <div className={cn("h-2 w-full absolute top-0 left-0", phase.color)} />
                   <div className="space-y-6">
                      <div className="flex justify-between items-center">
                         <Badge variant="outline" className="font-black text-[9px] uppercase tracking-widest px-3 py-1 border-primary/10">{phase.weeks}. HAFTA</Badge>
                         <span className="font-black text-primary/10 text-4xl italic">#{phase.id}</span>
                      </div>
                      <h4 className="text-3xl font-black italic tracking-tighter text-primary uppercase leading-tight group-hover:text-accent transition-colors">{phase.title}</h4>
                      <p className="text-sm font-medium text-muted-foreground italic leading-relaxed">{phase.desc}</p>
                   </div>
                </Card>
              ))}
           </div>
           
           <Card className="rounded-[4rem] border-none bg-primary text-white p-12 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2" />
              <div className="flex flex-col lg:flex-row justify-between items-center gap-12 relative z-10">
                 <div className="space-y-6 flex-1">
                    <h3 className="text-5xl font-black italic tracking-tighter uppercase leading-none">MASTER PLAN <br /><span className="text-accent">TERMİNALİ</span></h3>
                    <p className="text-lg opacity-60 font-medium italic">Akademik takviminizi buradan başlatın. Seviye belirleme testini tamamladıktan sonra 364 günlük programınız saniyeler içinde buluta işlenecektir.</p>
                 </div>
                 <div className="bg-white/5 backdrop-blur-xl p-10 rounded-[3.5rem] border border-white/10 flex flex-col gap-8 shadow-2xl">
                    <div className="grid grid-cols-2 gap-4">
                       <button onClick={() => setExamType('TYT')} className={cn("h-16 rounded-2xl font-black text-xs uppercase tracking-widest transition-all", examType === 'TYT' ? "bg-accent text-primary shadow-xl" : "bg-white/10 text-white opacity-40 hover:opacity-100")}>TYT ODAKLI</button>
                       <button onClick={() => setExamType('AYT')} className={cn("h-16 rounded-2xl font-black text-xs uppercase tracking-widest transition-all", examType === 'AYT' ? "bg-indigo-600 text-white shadow-xl" : "bg-white/10 text-white opacity-40 hover:opacity-100")}>AYT ODAKLI</button>
                    </div>
                    <div className="space-y-2">
                       <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-2 italic">BAŞLANGIÇ TARİHİ</Label>
                       <Input 
                         type="date" 
                         value={planStartDate} 
                         onChange={(e) => {
                            if (!db || !user) return;
                            updateDoc(doc(db, 'studyPlans', user.uid), { startDate: e.target.value });
                         }}
                         className="h-16 rounded-2xl bg-white text-primary border-none shadow-2xl font-black text-xl px-10"
                       />
                    </div>
                    <Button onClick={() => setIsWizardOpen(true)} className="h-20 rounded-[2rem] bg-accent hover:bg-white text-primary font-black text-sm uppercase tracking-widest shadow-2xl transition-all gap-4 group">
                       <RefreshCw className="h-6 w-6 group-hover:rotate-180 transition-transform duration-700" />
                       ANKETİ BAŞLAT VE PLANLA
                    </Button>
                 </div>
              </div>
           </Card>
        </TabsContent>

        {/* 2. GÜNLÜK PLAN */}
        <TabsContent value="daily" className="space-y-12 animate-in fade-in duration-700">
           <div className="flex flex-col lg:flex-row justify-between items-end gap-8">
              <div className="space-y-2">
                 <p className="text-[11px] font-black uppercase tracking-[0.5em] text-muted-foreground/30 italic">364 DAYS OPERATIONAL FLOW</p>
                 <h3 className="text-6xl font-black italic tracking-tighter uppercase text-primary">STRATEJİK TAKVİM</h3>
              </div>
              <div className="relative w-full lg:w-96 group">
                 <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground group-focus-within:text-accent transition-all" />
                 <Input 
                   placeholder="Hafta veya konu ara..." 
                   value={searchDay}
                   onChange={(e) => setSearchDay(e.target.value)}
                   className="pl-16 h-16 rounded-2xl bg-white border border-primary/5 shadow-xl font-bold italic"
                 />
              </div>
           </div>

           <Card className="rounded-[4rem] border border-primary/5 shadow-2xl overflow-hidden bg-white">
              <div className="overflow-x-auto">
                 <table className="w-full border-collapse">
                    <thead className="bg-slate-50 border-b border-primary/5">
                       <tr>
                          {['TARİH', 'HAFTA', 'GÜN', 'FAZ', 'BRANŞ', 'KONU / İÇERİK', 'HEDEF', 'DURUM'].map((h) => (
                            <th key={h} className="p-8 text-left text-[10px] font-black uppercase tracking-widest text-primary/40">{h}</th>
                          ))}
                       </tr>
                    </thead>
                    <tbody>
                       {filteredPlan.map((p: any, i: number) => (
                         <tr key={i} className="group hover:bg-slate-50/50 transition-all border-b border-primary/5 last:border-none">
                            <td className="p-8 font-bold text-primary">{p.displayDate}</td>
                            <td className="p-8"><Badge variant="outline" className="font-black text-[9px] px-2 py-0.5 border-primary/10">{p.week}</Badge></td>
                            <td className="p-8 font-black text-primary italic uppercase tracking-tighter">{p.day}</td>
                            <td className="p-8"><div className={cn("h-3 w-3 rounded-full shadow-lg", PHASES[p.phase - 1]?.color || 'bg-slate-300')} /></td>
                            <td className="p-8">
                               <Badge className="bg-primary text-white font-black text-[9px] uppercase tracking-widest">
                                  {p.subject}
                               </Badge>
                            </td>
                            <td className="p-8">
                               <div className="space-y-1">
                                  <p className="font-black text-lg text-primary uppercase italic leading-none">{p.topic}</p>
                                  <p className="text-[10px] font-bold text-muted-foreground opacity-60 uppercase">{p.activity}</p>
                               </div>
                            </td>
                            <td className="p-8 font-black text-accent text-xl italic tracking-tighter">{p.qTarget || '-'}</td>
                            <td className="p-8">
                               <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center transition-all", p.status === 'completed' ? "bg-emerald-500 text-white" : "bg-slate-100 text-primary opacity-20")}>
                                  <CheckCircle className="h-6 w-6" />
                               </div>
                            </td>
                         </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
              <div className="p-10 bg-slate-50/50 text-center border-t border-primary/5">
                 <p className="text-xs font-black uppercase tracking-widest text-primary/20 italic">AOS Master Engine: 364 Günlük tüm operasyonel veriler listelenmiştir.</p>
              </div>
           </Card>
        </TabsContent>

        {/* 3. YANLIŞ TAKİBİ ve 4. DENEME TAKİBİ sekmeleri aynı kalıyor... */}
      </Tabs>

      {/* PLAN SETUP WIZARD DIALOG */}
      <Dialog open={isWizardOpen} onOpenChange={setIsWizardOpen}>
        <DialogContent className="rounded-[4rem] border-none shadow-[0_60px_120px_-30px_rgba(15,23,42,0.4)] p-0 bg-white max-w-4xl overflow-hidden">
          <div className="grid lg:grid-cols-[340px_1fr]">
            <div className="bg-primary p-12 text-white flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2" />
              <div className="space-y-10 relative z-10">
                <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/10 text-white font-black text-[10px] uppercase tracking-widest border border-white/10">
                   <ShieldCheck className="h-4 w-4 text-accent" /> SETUP FAZI V4.8
                </div>
                <h3 className="text-4xl font-black italic tracking-tighter uppercase leading-none">AKADEMİK <br /><span className="text-accent">DANIŞMAN</span></h3>
                <div className="space-y-6">
                  {[1, 2, 3, 4].map((s) => (
                    <div key={s} className="flex items-center gap-4">
                      <div className={cn("h-8 w-8 rounded-full border-2 flex items-center justify-center font-black text-xs transition-all", wizardStep >= s ? "bg-accent border-accent text-primary shadow-lg" : "border-white/20 text-white/20")}>{s}</div>
                      <span className={cn("text-[10px] font-black uppercase tracking-widest", wizardStep >= s ? "text-white" : "text-white/20")}>
                        {s === 1 ? 'SEVİYE ANALİZİ' : s === 2 ? 'TEMPO SEÇİMİ' : s === 3 ? 'ODAK NOKTASI' : 'TATİL GÜNÜ'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/20 italic">AOS Pedagogical Engine: Bilimsel verilerle planlama yapar.</p>
            </div>

            <div className="p-16 space-y-12 bg-white">
              {wizardStep === 1 && (
                <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-700">
                  <div className="space-y-4">
                    <h4 className="text-4xl font-black italic tracking-tighter text-primary uppercase leading-tight">MEVCUT SEVİYEN <br />NEDİR?</h4>
                    <p className="text-muted-foreground italic font-medium">Bu seçim konuların anlatım yoğunluğunu belirler.</p>
                  </div>
                  <div className="grid gap-4">
                    {[
                      { id: 'beginner', label: 'BAŞLANGIÇ', desc: 'Konuları hiç bilmiyorum, temelden başlamalıyım.', icon: Brain },
                      { id: 'intermediate', label: 'ORTA SEVİYE', desc: 'Temelim var, pratik yaparak pekiştirmeliyim.', icon: Layers },
                      { id: 'advanced', label: 'İLERİ SEVİYE', desc: 'Konulara hakimim, hızlanmaya odaklanmalıyım.', icon: Zap },
                    ].map((l) => (
                      <button 
                        key={l.id} 
                        onClick={() => setWizardStepConfig({...wizardConfig, level: l.id})}
                        className={cn(
                          "p-8 rounded-[2.5rem] border-2 text-left transition-all group flex items-center gap-8",
                          wizardConfig.level === l.id ? "bg-primary border-primary text-white shadow-2xl scale-[1.02]" : "bg-slate-50 border-transparent hover:bg-white hover:border-primary/10"
                        )}
                      >
                        <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:rotate-6", wizardConfig.level === l.id ? "bg-accent text-primary" : "bg-white text-primary")}>
                           <l.icon className="h-7 w-7" />
                        </div>
                        <div>
                          <p className="font-black text-lg uppercase tracking-tight">{l.label}</p>
                          <p className={cn("text-xs font-medium italic", wizardConfig.level === l.id ? "text-white/60" : "text-muted-foreground")}>{l.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {wizardStep === 2 && (
                <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-700">
                  <div className="space-y-4">
                    <h4 className="text-4xl font-black italic tracking-tighter text-primary uppercase leading-tight">ÇALIŞMA <br />TEMPON NEDİR?</h4>
                    <p className="text-muted-foreground italic font-medium">Günde kaç saatini akademik operasyona ayırabilirsin?</p>
                  </div>
                  <div className="grid gap-4">
                    {[
                      { id: 'light', label: 'HAFİF TEMPO', desc: 'Günde 2-4 saat (Okul/İş odaklı)', icon: Coffee },
                      { id: 'moderate', label: 'MODERN TEMPO', desc: 'Günde 5-7 saat (Dengeli)', icon: Timer },
                      { id: 'intensive', label: 'YOĞUN TEMPO', desc: 'Günde 8+ saat (Sınav Odaklı)', icon: Dumbbell },
                    ].map((t) => (
                      <button 
                        key={t.id} 
                        onClick={() => setWizardStepConfig({...wizardConfig, tempo: t.id})}
                        className={cn(
                          "p-8 rounded-[2.5rem] border-2 text-left transition-all group flex items-center gap-8",
                          wizardConfig.tempo === t.id ? "bg-primary border-primary text-white shadow-2xl scale-[1.02]" : "bg-slate-50 border-transparent hover:bg-white hover:border-primary/10"
                        )}
                      >
                        <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:rotate-6", wizardConfig.tempo === t.id ? "bg-accent text-primary" : "bg-white text-primary")}>
                           <t.icon className="h-7 w-7" />
                        </div>
                        <div>
                          <p className="font-black text-lg uppercase tracking-tight">{t.label}</p>
                          <p className={cn("text-xs font-medium italic", wizardConfig.tempo === t.id ? "text-white/60" : "text-muted-foreground")}>{t.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {wizardStep === 3 && (
                <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-700">
                  <div className="space-y-4">
                    <h4 className="text-4xl font-black italic tracking-tighter text-primary uppercase leading-tight">ZAYIF OLDUĞUN <br />DERSLER?</h4>
                    <p className="text-muted-foreground italic font-medium">Bu derslerde soru hedefleri %20 daha fazla tutulacaktır.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {['Matematik', 'Türkçe', 'Fen Bilimleri', 'Sosyal Bilgiler', 'Edebiyat', 'Geometri'].map((lesson) => (
                      <button 
                        key={lesson} 
                        onClick={() => {
                          const current = wizardConfig.focusLessons;
                          const next = current.includes(lesson) ? current.filter(l => l !== lesson) : [...current, lesson];
                          setWizardStepConfig({...wizardConfig, focusLessons: next});
                        }}
                        className={cn(
                          "p-6 rounded-3xl border-2 text-center transition-all font-black text-[10px] uppercase tracking-widest",
                          wizardConfig.focusLessons.includes(lesson) ? "bg-accent border-accent text-primary shadow-xl" : "bg-slate-50 border-transparent text-muted-foreground"
                        )}
                      >
                        {lesson}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {wizardStep === 4 && (
                <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-700">
                  <div className="space-y-4">
                    <h4 className="text-4xl font-black italic tracking-tighter text-primary uppercase leading-tight">DINLENME <br />GÜNÜN?</h4>
                    <p className="text-muted-foreground italic font-medium">Mental sağlığın için haftada bir gün tam mola vermeliyiz.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar', 'Yok'].map((day) => (
                      <button 
                        key={day} 
                        onClick={() => setWizardStepConfig({...wizardConfig, offDay: day})}
                        className={cn(
                          "p-6 rounded-3xl border-2 text-center transition-all font-black text-[10px] uppercase tracking-widest",
                          wizardConfig.offDay === day ? "bg-primary border-primary text-white shadow-xl" : "bg-slate-50 border-transparent text-muted-foreground"
                        )}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center pt-10 border-t border-primary/5">
                <Button variant="ghost" disabled={wizardStep === 1} onClick={() => setWizardStep(s => s - 1)} className="font-black text-[10px] uppercase tracking-widest">GERİ</Button>
                {wizardStep < 4 ? (
                  <Button onClick={() => setWizardStep(s => s + 1)} className="h-14 px-10 rounded-2xl bg-primary hover:bg-accent font-black text-[10px] uppercase tracking-widest shadow-xl">İLERLE</Button>
                ) : (
                  <Button onClick={handleInitializePlan} disabled={isInitializing} className="h-16 px-12 rounded-2xl bg-accent hover:bg-primary text-primary hover:text-white font-black text-[10px] uppercase tracking-widest shadow-2xl gap-3">
                    {isInitializing ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                    SİSTEMİ YAPILANDIR VE YÜKLE
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
