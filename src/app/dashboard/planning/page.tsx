
'use client';

import { useState, useMemo } from 'react';
import { useUser, useDoc, useFirestore } from '@/firebase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, Clock, Target, Plus, Zap, Loader2, Sparkles, 
  ChevronRight, Brain, CheckCircle2, History, Trash2, ArrowLeft, Home
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { YKS_TM_TOPICS } from '@/lib/curriculum-data';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { format, addDays } from 'date-fns';
import { tr } from 'date-fns/locale';

export default function PlanningPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  const { data: studyPlan } = useDoc<any>(user?.uid ? `studyPlans/${user.uid}` : null);
  const { data: userData } = useDoc<any>(user?.uid ? `users/${user.uid}` : null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState('');
  const [dailyHours, setDailyHours] = useState('3');

  const generateFasikulPlan = async () => {
    if (!db || !user || !endDate) return;
    setIsGenerating(true);

    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      const lessons = Object.keys(YKS_TM_TOPICS);
      const lessonPointers: Record<string, number> = {};
      lessons.forEach(l => { lessonPointers[l] = 0; });

      const fullPlan = [];
      const durationPerLesson = Math.round((parseInt(dailyHours) * 60) / lessons.length);

      for (let i = 0; i <= diffDays; i++) {
        const currentDt = addDays(start, i);
        const dayName = format(currentDt, 'EEEE', { locale: tr });
        const dateStr = format(currentDt, 'yyyy-MM-dd');

        if (dayName === 'Pazar') {
          fullPlan.push({ date: dateStr, day: dayName, isRest: true, tasks: [] });
          continue;
        }

        const dailyTasks = lessons.map(lesson => {
          const topics = YKS_TM_TOPICS[lesson];
          const topic = topics[lessonPointers[lesson] % topics.length];
          lessonPointers[lesson]++;
          return {
            id: `task_${dateStr}_${lesson}`,
            lesson,
            topic,
            duration: durationPerLesson,
            status: 'planned'
          };
        });

        fullPlan.push({
          date: dateStr,
          day: dayName,
          isRest: false,
          tasks: dailyTasks
        });
      }

      await setDoc(doc(db, 'studyPlans', user.uid), {
        userId: user.uid,
        masterPlan: fullPlan,
        updatedAt: serverTimestamp()
      }, { merge: true });

      toast({
        title: 'Fasikül Planı Hazır',
        description: 'Tüm derslerin her gün yer aldığı programın saniyeler içinde oluşturuldu.',
        className: "bg-primary text-white rounded-[2rem]"
      });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Hata', description: 'Plan oluşturulamadı.' });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-8 lg:p-14 space-y-12 max-w-7xl mx-auto w-full animate-in fade-in duration-1000">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
             <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-12 w-12 rounded-xl bg-white shadow-sm border border-slate-100 hover:bg-primary hover:text-white transition-all"><ArrowLeft className="h-5 w-5" /></Button>
             <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard')} className="h-12 w-12 rounded-xl bg-white shadow-sm border border-slate-100 hover:bg-primary hover:text-white transition-all"><Home className="h-5 w-5" /></Button>
          </div>
          <div className="space-y-2">
             <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent text-primary font-black text-[10px] uppercase tracking-widest shadow-xl shadow-accent/20">
                <Calendar className="h-3 w-3" /> Smart Planner v4.8
             </div>
             <h2 className="text-6xl font-black tracking-tighter italic text-primary uppercase leading-none text-shadow-deep">
                Akademik <br /><span className="text-accent text-shadow-accent">Planlama</span>
             </h2>
          </div>
        </div>
      </header>

      <Tabs defaultValue="yearly" className="space-y-10">
        <TabsList className="bg-slate-100 p-1.5 rounded-[2.5rem] h-20 shadow-inner w-full sm:w-auto">
          <TabsTrigger value="today" className="rounded-2xl px-12 h-full font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-xl">📌 Bugün</TabsTrigger>
          <TabsTrigger value="yearly" className="rounded-2xl px-12 h-full font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-xl">🗓️ Smart Planner</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-8">
           <Card className="rounded-[3rem] border-none shadow-xl bg-white p-12 space-y-10">
              <div className="flex justify-between items-center">
                 <h3 className="text-3xl font-black italic tracking-tighter uppercase">Bugünün Fasikülü</h3>
                 <span className="font-black text-xs text-accent uppercase tracking-widest">{format(new Date(), 'EEEE, d MMMM', { locale: tr })}</span>
              </div>
              <div className="grid gap-4">
                 {(studyPlan?.masterPlan || []).find((p: any) => p.date === format(new Date(), 'yyyy-MM-dd'))?.tasks.map((t: any, i: number) => (
                   <div key={i} className="flex items-center gap-8 p-8 bg-slate-50 rounded-[2.5rem] border border-transparent hover:border-accent/20 hover:bg-white hover:shadow-2xl transition-all group">
                      <div className="h-12 w-12 rounded-2xl bg-primary text-white flex items-center justify-center font-black italic">{i+1}</div>
                      <div className="flex-1">
                         <h4 className="font-black text-xl italic text-primary uppercase leading-none mb-1">{t.lesson}</h4>
                         <p className="text-xs font-bold text-muted-foreground italic uppercase tracking-widest opacity-60">{t.topic}</p>
                      </div>
                      <Button className="bg-primary text-white rounded-xl h-12 px-6 font-black text-[9px] uppercase tracking-widest shadow-xl">Bitir</Button>
                   </div>
                 )) || <div className="py-20 text-center opacity-20 font-black uppercase tracking-[0.3em]">Planlanmış görev yok</div>}
              </div>
           </Card>
        </TabsContent>

        <TabsContent value="yearly" className="space-y-10">
           <div className="bg-gradient-to-br from-primary/5 to-accent/5 border border-accent/20 rounded-[3rem] p-10 relative overflow-hidden group shadow-xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 blur-[100px] rounded-full" />
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                 <div className="h-24 w-24 rounded-[2rem] bg-white border border-accent/20 flex items-center justify-center shadow-2xl shrink-0 group-hover:rotate-6 transition-all">
                    <Brain className="h-12 w-12 text-accent" />
                 </div>
                 <div className="space-y-4 flex-1 text-center md:text-left">
                    <h4 className="text-2xl font-black text-primary italic uppercase tracking-tighter">Smart Fasikül Planlayıcı</h4>
                    <p className="text-lg font-bold text-muted-foreground italic leading-relaxed">Seçeceğin tarihler arasında her güne tüm derslerden birer konu atayan akademik fasikül programın saniyeler içinde oluşturulur.</p>
                 </div>
              </div>
           </div>

           <Card className="rounded-[4rem] border-none shadow-2xl bg-white p-12 space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                 <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4 italic">Başlangıç Tarihi</Label>
                    <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="h-16 rounded-2xl bg-slate-50 border-none shadow-inner font-black text-xl" />
                 </div>
                 <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4 italic">Bitiş Tarihi (Hedef)</Label>
                    <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="h-16 rounded-2xl bg-slate-50 border-none shadow-inner font-black text-xl" />
                 </div>
                 <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4 italic">Günlük Çalışma Süresi</Label>
                    <select value={dailyHours} onChange={(e) => setDailyHours(e.target.value)} className="w-full h-16 rounded-2xl bg-slate-50 border-none shadow-inner font-black text-xl px-6 outline-none">
                       <option value="2">2 Saat</option>
                       <option value="3">3 Saat (Standart)</option>
                       <option value="4">4 Saat (İleri)</option>
                       <option value="5">5+ Saat (Pro)</option>
                    </select>
                 </div>
              </div>

              <Button 
                onClick={generateFasikulPlan}
                disabled={isGenerating || !endDate}
                className="w-full h-24 rounded-[2.5rem] bg-primary hover:bg-accent transition-all duration-700 font-black text-xl uppercase tracking-[0.4em] gap-6 shadow-[0_50px_100px_-20px_rgba(15,23,42,0.4)] group text-white"
              >
                {isGenerating ? <Loader2 className="h-10 w-10 animate-spin" /> : <Zap className="h-10 w-10 text-accent group-hover:animate-pulse" />}
                FASİKÜL PLANINI OLUŞTUR
              </Button>
           </Card>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {(studyPlan?.masterPlan || []).slice(0, 9).map((day: any, i: number) => (
                <Card key={i} className={cn(
                  "p-8 rounded-[3rem] border-none shadow-xl bg-white space-y-6 relative overflow-hidden group hover:-translate-y-2 transition-all",
                  day.isRest ? "opacity-40" : ""
                )}>
                   <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                      <span className="font-black text-[10px] uppercase tracking-widest text-muted-foreground italic">{day.date}</span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-accent italic">{day.day}</span>
                   </div>
                   <div className="space-y-4">
                      {day.isRest ? (
                        <p className="py-10 text-center font-black text-xl italic text-primary/20 uppercase tracking-widest">Mola Günü 🧘</p>
                      ) : day.tasks.slice(0, 3).map((t: any, j: number) => (
                        <div key={j} className="flex flex-col">
                           <span className="text-[9px] font-black uppercase text-primary/40 leading-none mb-1">{t.lesson}</span>
                           <span className="font-bold text-sm text-primary uppercase leading-tight truncate">{t.topic}</span>
                        </div>
                      ))}
                      {!day.isRest && day.tasks.length > 3 && <p className="text-[9px] font-black uppercase text-accent italic">+{day.tasks.length - 3} Ders Daha...</p>}
                   </div>
                </Card>
              ))}
           </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
