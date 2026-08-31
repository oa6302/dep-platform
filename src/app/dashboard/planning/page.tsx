
'use client';

import { useUser, useDoc, useFirestore } from '@/firebase';
import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, Clock, Sparkles, Plus, Zap, Target, 
  ChevronRight, ArrowLeft, Home, BookOpen, RotateCcw,
  Loader2, Trash2, Edit3, CheckCircle2, History,
  Calculator, Ruler, Atom, FlaskConical, Microscope,
  Search, Filter, Wand2
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { format, addDays } from 'date-fns';
import { tr } from 'date-fns/locale';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { YKS_TM_TOPICS } from '@/lib/curriculum-data';

export default function PlanningPage() {
  const { user } = useUser();
  const db = useFirestore();
  const router = useRouter();
  
  const [isGenerating, setIsGenerating] = useState(false);
  const { data: studyPlan, loading: planLoading } = useDoc<any>(user?.uid ? `studyPlans/${user.uid}` : null);
  const { data: userData } = useDoc<any>(user?.uid ? `users/${user.uid}` : null);

  const [activeTab, setActiveTab] = useState('weekly');

  const generateSmartYearlyPlan = async () => {
    if (!db || !user) return;
    setIsGenerating(true);
    
    const plan = [];
    const startDate = new Date();
    
    // TM Dersleri ve Konuları
    const lessons = Object.keys(YKS_TM_TOPICS);
    let topicIdx = 0;
    const allTopics = lessons.flatMap(l => YKS_TM_TOPICS[l].map(t => ({ lesson: l, topic: t })));
    
    // 364 günlük adaptif yapı (AOS v4.8 Algoritması)
    for (let i = 0; i < 364; i++) {
      const current = addDays(startDate, i);
      const ds = format(current, 'yyyy-MM-dd');
      const dayName = format(current, 'EEEE', { locale: tr });
      
      const dailyTasks = [];
      if (dayName !== 'Pazar' && topicIdx < allTopics.length) {
        // Günde 2 ana konu planla
        for (let j = 0; j < 2; j++) {
          if (topicIdx < allTopics.length) {
            dailyTasks.push({
              id: `task_${Date.now()}_${i}_${j}`,
              subject: allTopics[topicIdx].lesson,
              topic: allTopics[topicIdx].topic,
              time: j === 0 ? '09:00' : '11:00',
              duration: '60 dk',
              status: 'pending',
              type: 'new',
              priority: 'orta'
            });
            topicIdx++;
          }
        }
        // Akşam tekrarı (Spaced Repetition Mantığı)
        if (i > 7 && topicIdx > 5) {
          const pastTask = allTopics[Math.floor(Math.random() * (topicIdx - 5))];
          dailyTasks.push({
            id: `repeat_${Date.now()}_${i}`,
            subject: pastTask.lesson,
            topic: pastTask.topic,
            time: '20:00',
            duration: '30 dk',
            status: 'pending',
            type: 'repeat',
            priority: 'yuksek'
          });
        }
      }

      plan.push({
        date: ds,
        day: dayName,
        isRestDay: dayName === 'Pazar',
        tasks: dailyTasks,
        status: 'planned'
      });
    }

    const planRef = doc(db, 'studyPlans', user.uid);
    await updateDoc(planRef, { 
      masterPlan: plan, 
      updatedAt: serverTimestamp(),
      smartPlannerEnabled: true 
    });
    
    setIsGenerating(false);
  };

  const todayStr = format(new Date(), 'yyyy-MM-dd');

  const lessonCards = [
    { id: 'TYT_TURKCE', name: 'Türkçe', icon: BookOpen },
    { id: 'TYT_MATEMATIK', name: 'Matematik', icon: Calculator },
    { id: 'TYT_GEOMETRI', name: 'Geometri', icon: Ruler },
    { id: 'TYT_FIZIK', name: 'Fizik', icon: Atom },
    { id: 'TYT_KIMYA', name: 'Kimya', icon: FlaskConical },
    { id: 'TYT_BIYOLOJI', name: 'Biyoloji', icon: Microscope },
    { id: 'TYT_TARIH', name: 'Tarih', icon: History },
    { id: 'TYT_COGRAFYA', name: 'Coğrafya', icon: Globe2 },
    { id: 'TYT_FELSEFE', name: 'Felsefe', icon: Sun },
    { id: 'TYT_DIN', name: 'Din Kültürü', icon: ShieldCheck }
  ];

  return (
    <div className="p-8 lg:p-14 space-y-12 max-w-[1800px] mx-auto w-full bg-[#FAFBFF] min-h-screen animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-12 w-12 rounded-xl bg-white shadow-sm border border-slate-200 hover:bg-primary hover:text-white transition-all"><ArrowLeft className="h-6 w-6" /></Button>
            <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard')} className="h-12 w-12 rounded-xl bg-white shadow-sm border border-slate-200 hover:bg-primary hover:text-white transition-all"><Home className="h-6 w-6" /></Button>
          </div>
          <div className="space-y-2">
             <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-primary text-white font-black text-[10px] uppercase tracking-widest shadow-xl">
                <Sparkles className="h-3.5 w-3.5 text-secondary" /> AOS CONTENT CENTER v4.8
             </div>
             <h2 className="text-6xl font-black tracking-tighter italic text-primary uppercase leading-none">
                DERS VE <br />
                <span className="text-secondary">İÇERİK MERKEZİ</span>
             </h2>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="relative hidden md:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Konu, test veya video ara..." className="w-80 h-14 pl-12 rounded-2xl bg-white border-none shadow-sm font-medium" />
           </div>
           <Button 
             onClick={generateSmartYearlyPlan}
             disabled={isGenerating}
             className="h-16 px-10 rounded-2xl bg-secondary hover:bg-primary text-white transition-all font-black text-xs uppercase tracking-widest gap-4 shadow-2xl shadow-secondary/20 group"
           >
             {isGenerating ? <Loader2 className="h-6 w-6 animate-spin" /> : <Zap className="h-6 w-6 text-white group-hover:animate-pulse" />}
             AI PLANI SENKRONİZE ET
           </Button>
        </div>
      </header>

      <Tabs defaultValue="curriculum" className="space-y-10">
        <TabsList className="bg-white p-2 rounded-[2.5rem] h-20 shadow-xl border border-slate-100 flex gap-4 w-full md:w-auto">
          <TabsTrigger value="curriculum" className="rounded-2xl px-10 h-full font-black text-[11px] uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white">TYT DERSLERİ</TabsTrigger>
          <TabsTrigger value="weekly" className="rounded-2xl px-10 h-full font-black text-[11px] uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white">HAFTALIK PLAN</TabsTrigger>
          <TabsTrigger value="yearly" className="rounded-2xl px-10 h-full font-black text-[11px] uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white">YILLIK (SMART) PLAN</TabsTrigger>
        </TabsList>

        <TabsContent value="curriculum" className="animate-in fade-in slide-in-from-bottom-4">
           <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {lessonCards.map((lesson) => (
                <Card key={lesson.id} className="p-8 rounded-[2.5rem] border border-slate-100 bg-white shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all cursor-pointer group">
                   <div className="space-y-8">
                      <div className="flex justify-between items-start">
                         <div className="h-16 w-16 rounded-2xl bg-slate-50 flex items-center justify-center text-primary shadow-inner group-hover:bg-secondary group-hover:text-white transition-all">
                            <lesson.icon className="h-8 w-8" />
                         </div>
                         <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[9px] uppercase">%0 BAŞARI</Badge>
                      </div>
                      <div className="space-y-1">
                         <h4 className="text-2xl font-black italic text-primary uppercase tracking-tighter">{lesson.name}</h4>
                         <div className="flex gap-4 text-[10px] font-black uppercase text-muted-foreground opacity-40">
                            <span>{YKS_TM_TOPICS[lesson.name]?.length || 0} KONU</span>
                            <span>0 TEST</span>
                         </div>
                      </div>
                      <div className="space-y-2">
                         <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                            <div className="h-full bg-secondary w-0 transition-all duration-1000" />
                         </div>
                         <Button variant="ghost" className="w-full justify-between p-0 h-auto font-black text-[10px] uppercase tracking-widest text-secondary group-hover:text-primary transition-colors">
                            KONULARI GÖR <ChevronRight className="h-4 w-4" />
                         </Button>
                      </div>
                   </div>
                </Card>
              ))}
           </div>
        </TabsContent>

        <TabsContent value="weekly" className="animate-in fade-in">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {studyPlan?.masterPlan?.slice(0, 7).map((day: any, idx: number) => (
                <Card key={idx} className={cn(
                  "p-8 rounded-[2.5rem] border border-slate-100 shadow-lg relative overflow-hidden",
                  day.date === todayStr ? "bg-white ring-4 ring-secondary/20" : "bg-white/50"
                )}>
                   <div className="space-y-6">
                      <div className="flex justify-between items-center">
                         <span className="font-black text-xl text-primary italic">{day.day}</span>
                         {day.date === todayStr && <Badge className="bg-secondary text-white border-none uppercase text-[8px] font-black px-3 py-1">BUGÜN</Badge>}
                      </div>
                      <div className="space-y-4">
                         {day.tasks?.map((t: any, tidx: number) => (
                           <div key={tidx} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4">
                              <div className={cn("h-2 w-2 rounded-full", t.type === 'repeat' ? 'bg-orange-500' : 'bg-primary')} />
                              <div className="flex-1 min-w-0">
                                 <p className="text-[10px] font-black text-primary truncate uppercase">{t.subject}</p>
                                 <p className="text-[9px] text-muted-foreground truncate italic">{t.topic}</p>
                              </div>
                              <span className="text-[9px] font-bold text-slate-400">{t.time}</span>
                           </div>
                         ))}
                         {day.isRestDay && <div className="py-10 text-center opacity-30 italic font-bold uppercase text-xs">DİNLENME GÜNÜ</div>}
                      </div>
                   </div>
                </Card>
              ))}
           </div>
        </TabsContent>

        <TabsContent value="yearly" className="animate-in fade-in">
           <Card className="p-12 rounded-[3.5rem] bg-white border border-slate-100 shadow-xl space-y-10">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b pb-10">
                 <div className="space-y-2">
                    <h3 className="text-3xl font-black text-primary italic uppercase">SMART AI TAKVİM</h3>
                    <p className="text-muted-foreground font-medium italic">1 Ocak hedefine göre optimize edilmiş TM müfredat planı.</p>
                 </div>
                 <div className="flex gap-4">
                    <div className="bg-slate-50 px-6 py-3 rounded-2xl border border-slate-100 text-center">
                       <p className="text-2xl font-black text-secondary leading-none">{studyPlan?.masterPlan?.filter((p: any) => p.status === 'done').length || 0}</p>
                       <p className="text-[9px] font-bold text-muted-foreground uppercase mt-1">TAMAMLANDI</p>
                    </div>
                    <div className="bg-slate-50 px-6 py-3 rounded-2xl border border-slate-100 text-center">
                       <p className="text-2xl font-black text-primary leading-none">{studyPlan?.masterPlan?.length || 0}</p>
                       <p className="text-[9px] font-bold text-muted-foreground uppercase mt-1">TOPLAM GÜN</p>
                    </div>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[600px] overflow-y-auto pr-4 scrollbar-hide">
                 {studyPlan?.masterPlan?.map((day: any, idx: number) => (
                   <div key={idx} className={cn(
                     "p-6 rounded-2xl border transition-all hover:border-secondary flex items-center justify-between group",
                     day.status === 'done' ? "bg-emerald-50 border-emerald-100" : "bg-white border-slate-100"
                   )}>
                      <div className="flex items-center gap-6">
                         <span className="text-2xl font-black text-slate-200 group-hover:text-secondary transition-colors italic">{(idx+1).toString().padStart(3, '0')}</span>
                         <div className="space-y-0.5">
                            <p className="text-sm font-black text-primary uppercase">{day.date}</p>
                            <p className="text-[10px] text-muted-foreground font-bold italic">{day.tasks?.length || 0} Görev • {day.day}</p>
                         </div>
                      </div>
                      <Button variant="ghost" size="icon" className="group-hover:text-secondary"><ChevronRight className="h-5 w-5" /></Button>
                   </div>
                 ))}
              </div>
           </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

const Globe2 = (props: any) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
    <path d="M12 22s-8-4-8-10V5l8-3 8 3v7c0 6-8 10-8 10" />
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
    <path d="M2 12h20" />
  </svg>
);
