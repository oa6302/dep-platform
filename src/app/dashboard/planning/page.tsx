
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
  FlaskConical, Scale, History as HistoryIcon, ShieldCheck
} from 'lucide-react';
import { doc, setDoc, serverTimestamp, collection, addDoc, query, where, orderBy, deleteDoc, updateDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { format, addDays, startOfWeek, isSameDay, differenceInDays } from 'date-fns';
import { tr } from 'date-fns/locale';

const PHASES = [
  { id: 1, title: 'FAZ 1: Temel Atma', weeks: '1-2', desc: 'Diagnostik denemeler ve temel yetkinlik inşası.', color: 'bg-blue-500' },
  { id: 2, title: 'FAZ 2: Konu Geliştirme', weeks: '3-14', desc: 'TYT tüm branşlarda %70 kazanım hedefi.', color: 'bg-emerald-500' },
  { id: 3, title: 'FAZ 3: AYT Entegrasyonu', weeks: '15-22', desc: 'İleri seviye AYT konularına giriş.', color: 'bg-indigo-500' },
  { id: 4, title: 'FAZ 4: Geometri & Fen Kampı', weeks: '23-34', desc: 'Yoğun sayısal ve teknik branş maratonu.', color: 'bg-orange-500' },
  { id: 5, title: 'FAZ 5: Karma Tekrar', weeks: '35-42', desc: 'Tüm müfredatın branş denemeleriyle harmanlanması.', color: 'bg-purple-500' },
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

  // MASTER PLAN JENERATÖRÜ (364 GÜN)
  const fullYearPlan = useMemo(() => {
    const baseDate = new Date(planStartDate);
    const plan = [];
    
    const subjects = examType === 'TYT' 
      ? ['Matematik', 'Türkçe', 'Fen Bilimleri', 'Sosyal Bilgiler']
      : ['AYT Matematik', 'Fizik', 'Kimya', 'Biyoloji', 'Edebiyat'];

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
      if (dayName === 'Cumartesi') activity = 'TEKRAR + ANALİZ';
      if (dayName === 'Pazar') activity = i % 14 === 0 ? 'GENEL DENEME' : 'DİNLENME';

      const subjectIndex = i % subjects.length;
      const currentSubject = subjects[subjectIndex];

      plan.push({
        date: format(currentDate, 'yyyy-MM-dd'),
        displayDate: format(currentDate, "d MMM ''yy", { locale: tr }),
        week: `H${String(weekNum).padStart(2, '0')}`,
        day: dayName,
        phase: phaseId,
        activity,
        subject: currentSubject,
        topic: i === 0 ? 'Diagnostik Seviye Tespit' : `${currentSubject} - Ünite ${Math.floor(i/10) + 1}`,
        qTarget: activity === 'DİNLENME' ? 0 : 50 + (phaseId * 10),
        status: 'pending',
        createdAt: new Date().toISOString()
      });
    }
    return plan;
  }, [planStartDate, examType]);

  const handleInitializePlan = async () => {
    if (!db || !user) return;
    setIsInitializing(true);
    
    try {
      const planRef = doc(db, 'studyPlans', user.uid);
      const planData = {
        userId: user.uid,
        startDate: planStartDate,
        examType,
        masterPlan: fullYearPlan, // 364 günlük veriyi tek seferde yükler
        updatedAt: serverTimestamp()
      };

      await setDoc(planRef, planData, { merge: true });
      toast({ title: 'Master Plan Hazır', description: `364 günlük ${examType} programınız saniyeler içinde oluşturuldu.`, className: "bg-primary text-white rounded-[2rem]" });
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

  const currentPlan = studyPlan?.masterPlan || fullYearPlan;
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
                    <h3 className="text-5xl font-black italic tracking-tighter uppercase">MASTER PLAN TERMİNALİ</h3>
                    <p className="text-lg opacity-60 font-medium italic">Akademik takviminizi buradan başlatın. Seçtiğiniz sınav türüne göre 364 günlük program saniyeler içinde buluta işlenecektir.</p>
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
                    <Button onClick={handleInitializePlan} disabled={isInitializing} className="h-20 rounded-[2rem] bg-accent hover:bg-white text-primary font-black text-sm uppercase tracking-widest shadow-2xl transition-all gap-4 group">
                       {isInitializing ? <Loader2 className="h-6 w-6 animate-spin" /> : <RefreshCw className="h-6 w-6 group-hover:rotate-180 transition-transform duration-700" />}
                       SİSTEMİ SIFIRLA VE YÜKLE
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

        {/* 3. YANLIŞ TAKİBİ */}
        <TabsContent value="mistakes" className="space-y-12 animate-in fade-in duration-700">
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              <div className="lg:col-span-4">
                 <Card className="p-10 rounded-[3.5rem] bg-white border border-primary/5 shadow-2xl sticky top-32">
                    <h3 className="text-3xl font-black italic tracking-tighter uppercase text-primary mb-8 flex items-center gap-4">
                       <Zap className="h-8 w-8 text-accent" /> YANLIŞ KAYDI
                    </h3>
                    <form onSubmit={handleAddMistake} className="space-y-6">
                       <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">BRANŞ / DERS</Label>
                          <Input name="subject" required placeholder="Örn: TYT Matematik" className="h-14 rounded-xl bg-slate-50 border-none shadow-inner font-bold" />
                       </div>
                       <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">KONU</Label>
                          <Input name="topic" required placeholder="Örn: Üslü Sayılar" className="h-14 rounded-xl bg-slate-50 border-none shadow-inner font-bold" />
                       </div>
                       <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">YANLIŞ NEDENİ</Label>
                          <Input name="reason" required placeholder="İşlem hatası, Formül unutma..." className="h-14 rounded-xl bg-slate-50 border-none shadow-inner font-bold" />
                       </div>
                       <Button type="submit" className="w-full h-18 rounded-[1.75rem] bg-primary hover:bg-accent font-black text-xs uppercase tracking-widest gap-3 shadow-2xl shadow-primary/20 transition-all">
                          <Plus className="h-5 w-5" /> SİSTEME İŞLE
                       </Button>
                    </form>
                 </Card>
              </div>

              <div className="lg:col-span-8 space-y-8">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="p-10 rounded-[3rem] bg-white border border-primary/5 shadow-xl flex items-center gap-8">
                       <div className="h-16 w-16 rounded-[1.25rem] bg-rose-50 text-rose-500 flex items-center justify-center shadow-inner"><AlertCircle className="h-8 w-8" /></div>
                       <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-40">TOPLAM YANLIŞ</p>
                          <p className="text-4xl font-black text-primary italic">{mistakes.length}</p>
                       </div>
                    </Card>
                    <Card className="p-10 rounded-[3rem] bg-white border border-primary/5 shadow-xl flex items-center gap-8">
                       <div className="h-16 w-16 rounded-[1.25rem] bg-blue-50 text-blue-500 flex items-center justify-center shadow-inner"><History className="h-8 w-8" /></div>
                       <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-40">KRİTİK KONU</p>
                          <p className="text-2xl font-black text-primary italic uppercase tracking-tighter truncate max-w-[200px]">{mistakes[0]?.topic || 'Veri Yok'}</p>
                       </div>
                    </Card>
                 </div>

                 <div className="bg-white rounded-[4rem] border border-primary/5 shadow-2xl overflow-hidden p-10 space-y-8">
                    <h4 className="text-2xl font-black italic tracking-tighter uppercase text-primary border-b border-primary/5 pb-6">YANLIŞ ANALİZ GÜNLÜĞÜ</h4>
                    <div className="space-y-4">
                       {mistakes.map((m: any, i: number) => (
                         <div key={m.id || i} className="flex items-center justify-between p-8 bg-slate-50 rounded-[2.5rem] border border-primary/5 group hover:bg-white hover:shadow-xl transition-all">
                            <div className="flex items-center gap-8">
                               <div className="h-12 w-12 rounded-xl bg-rose-500 text-white flex items-center justify-center shadow-lg"><Zap className="h-6 w-6" /></div>
                               <div>
                                  <p className="font-black text-xl text-primary uppercase italic leading-none">{m.topic}</p>
                                  <p className="text-[10px] font-bold text-muted-foreground opacity-60 uppercase mt-1">{m.subject} • {m.reason}</p>
                               </div>
                            </div>
                            <Button onClick={() => { if (!db) return; deleteDoc(doc(db, 'mistakes', m.id)); }} variant="ghost" size="icon" className="h-10 w-10 opacity-20 group-hover:opacity-100 text-destructive hover:bg-destructive/5"><Trash2 className="h-5 w-5" /></Button>
                         </div>
                       ))}
                       {mistakes.length === 0 && <div className="py-20 text-center opacity-20 italic font-black uppercase tracking-widest">Henüz bir kayıt bulunmuyor.</div>}
                    </div>
                 </div>
              </div>
           </div>
        </TabsContent>

        {/* 4. DENEME TAKİBİ */}
        <TabsContent value="trials" className="space-y-12 animate-in fade-in duration-700">
           <Card className="rounded-[4rem] border-none bg-primary text-white p-12 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/5 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2" />
              <div className="flex flex-col lg:flex-row justify-between items-center gap-12 relative z-10">
                 <div className="space-y-6">
                    <h3 className="text-6xl font-black italic tracking-tighter uppercase leading-none">DENEME <br /><span className="text-accent">ANALİZİ</span></h3>
                    <div className="grid grid-cols-2 gap-8">
                       <div><p className="text-5xl font-black text-accent">{trials.length}</p><p className="text-[9px] font-black uppercase tracking-widest opacity-40">DENEME SAYISI</p></div>
                       <div><p className="text-5xl font-black text-white">{averageNet}</p><p className="text-[9px] font-black uppercase tracking-widest opacity-40">ORTALAMA NET</p></div>
                    </div>
                 </div>
                 <form onSubmit={handleAddTrial} className="bg-white/5 backdrop-blur-xl p-10 rounded-[3.5rem] border border-white/10 grid md:grid-cols-2 gap-8 w-full max-w-2xl shadow-2xl">
                    <div className="space-y-2 md:col-span-2">
                       <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-2">DENEME ADI</Label>
                       <Input name="examName" required placeholder="3D TYT Simülasyon-1" className="h-16 rounded-2xl bg-white text-primary border-none shadow-inner font-bold" />
                    </div>
                    <div className="space-y-2">
                       <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-2">DOĞRU</Label>
                       <Input name="correct" type="number" required placeholder="32" className="h-16 rounded-2xl bg-white text-primary border-none shadow-inner font-black text-xl text-center" />
                    </div>
                    <div className="space-y-2">
                       <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-2">YANLIŞ</Label>
                       <Input name="wrong" type="number" required placeholder="4" className="h-16 rounded-2xl bg-white text-primary border-none shadow-inner font-black text-xl text-center" />
                    </div>
                    <Button type="submit" className="md:col-span-2 h-20 rounded-[2rem] bg-accent hover:bg-white text-primary font-black text-sm uppercase tracking-widest shadow-2xl transition-all gap-4">
                       <ArrowUpRight className="h-6 w-6" /> SONUCU ANALİZ ET
                    </Button>
                 </form>
              </div>
           </Card>

           <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
              <Card className="xl:col-span-2 p-12 rounded-[4rem] bg-white border border-primary/5 shadow-2xl space-y-10">
                 <h4 className="text-3xl font-black italic tracking-tighter uppercase text-primary flex items-center gap-5">
                    <TrendingUp className="h-10 w-10 text-accent" /> PERFORMANS ANALİZİ
                 </h4>
                 <div className="h-[400px] flex items-end gap-10 pb-4">
                    {trials.slice(-7).reverse().map((t: any, i: number) => (
                      <div key={i} className="flex-1 space-y-4 group/bar cursor-default">
                         <div className="text-center opacity-0 group-hover/bar:opacity-100 transition-all"><Badge className="bg-accent text-primary font-black text-[10px]">{t.net} Net</Badge></div>
                         <div className="relative h-[300px] w-full bg-slate-50 rounded-[2.5rem] overflow-hidden border border-primary/5">
                            <div className="absolute bottom-0 w-full bg-primary group-hover/bar:bg-accent transition-all duration-1000" style={{ height: `${(parseFloat(t.net) / 40) * 100}%` }} />
                         </div>
                         <p className="text-[10px] font-black text-muted-foreground uppercase text-center truncate px-2">{t.examName}</p>
                      </div>
                    ))}
                    {trials.length < 3 && <div className="flex-1 h-full flex items-center justify-center opacity-10 font-black italic uppercase text-sm">DAHA FAZLA VERİ GEREKLİ</div>}
                 </div>
              </Card>

              <Card className="p-12 rounded-[4rem] bg-white border border-primary/5 shadow-2xl space-y-10">
                 <h4 className="text-2xl font-black italic tracking-tighter uppercase text-primary">SON KAYITLAR</h4>
                 <div className="space-y-6">
                    {trials.slice(0, 5).map((t: any, i: number) => (
                      <div key={t.id || i} className="flex items-center justify-between p-6 bg-slate-50 rounded-[2rem] border border-primary/5 group">
                         <div className="space-y-1">
                            <p className="font-black text-lg text-primary uppercase italic truncate max-w-[120px]">{t.examName}</p>
                            <p className="text-[9px] font-bold text-muted-foreground opacity-60 uppercase">{t.correct}D {t.wrong}Y</p>
                         </div>
                         <div className="flex items-center gap-4">
                            <div className="text-right">
                               <p className="text-2xl font-black text-accent italic tracking-tighter">{t.net}</p>
                               <p className="text-[8px] font-black text-muted-foreground uppercase opacity-40">NET</p>
                            </div>
                            <Button onClick={() => { if (!db) return; deleteDoc(doc(db, 'trials', t.id)); }} variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 text-destructive"><Trash2 className="h-4 w-4" /></Button>
                         </div>
                      </div>
                    ))}
                    {trials.length === 0 && <div className="py-20 text-center opacity-10 italic font-black uppercase tracking-widest text-xs">Henüz deneme kaydı yok.</div>}
                 </div>
                 <Button variant="outline" className="w-full h-14 rounded-xl border-2 border-primary/5 font-black text-[10px] uppercase tracking-widest hover:bg-primary hover:text-white transition-all">TÜM ARŞİVİ GÖR</Button>
              </Card>
           </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
