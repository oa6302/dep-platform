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
  ChevronRight, Brain, CheckCircle2, History, Trash2, ArrowLeft, 
  Home, RefreshCcw, FastForward, Gauge, Edit3, ClipboardList, BookOpen,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { YKS_TM_TOPICS } from '@/lib/curriculum-data';
import { doc, setDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { format, addDays, subDays } from 'date-fns';
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
  const [startHour, setStartHour] = useState('10:00');

  const dayColors: Record<string, string> = {
    'Pazartesi': 'border-t-[6px] border-t-rose-500',
    'Salı': 'border-t-[6px] border-t-orange-500',
    'Çarşamba': 'border-t-[6px] border-t-emerald-500',
    'Perşembe': 'border-t-[6px] border-t-blue-500',
    'Cuma': 'border-t-[6px] border-t-purple-500',
    'Cumartesi': 'border-t-[6px] border-t-teal-500',
    'Pazar': 'border-t-[6px] border-t-pink-500',
  };

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

      for (let i = 0; i <= diffDays; i++) {
        const currentDt = addDays(start, i);
        const dayName = format(currentDt, 'EEEE', { locale: tr });
        const dateStr = format(currentDt, 'yyyy-MM-dd');

        // Cumartesi: Haftalık Tekrar Günü
        if (dayName === 'Cumartesi') {
          fullPlan.push({
            date: dateStr,
            day: dayName,
            tasks: [{
              id: `task_${dateStr}_weekly_review`,
              lesson: 'Genel',
              topic: 'Haftalık Master Tekrar',
              type: 'Haftalık Tekrar',
              time: startHour,
              duration: 180,
              status: 'planned'
            }]
          });
          continue;
        }

        const dailyTasks = [];
        // Her gün her dersten bir parça döngüsü
        lessons.forEach((lesson, lIdx) => {
          const topics = YKS_TM_TOPICS[lesson];
          const topic = topics[lessonPointers[lesson] % topics.length];
          
          // 1. SAAT: Yeni Konu
          dailyTasks.push({
            id: `task_${dateStr}_${lesson}_new`,
            lesson,
            topic,
            type: 'Konu Çalışması',
            time: '10:00',
            duration: 60,
            status: 'planned'
          });

          // 2. SAAT: Test & Ayrıntı
          dailyTasks.push({
            id: `task_${dateStr}_${lesson}_test`,
            lesson,
            topic,
            type: 'Test Çözümü',
            time: '11:00',
            duration: 60,
            status: 'planned'
          });

          lessonPointers[lesson]++;
        });

        // 3. SAAT: Dünün Tekrarı
        if (i > 0) {
          dailyTasks.push({
            id: `task_${dateStr}_prev_review`,
            lesson: 'Genel',
            topic: 'Dünün Kazanım Tekrarı',
            type: 'Hızlı Tekrar',
            time: '12:00',
            duration: 60,
            status: 'planned'
          });
        }

        fullPlan.push({
          date: dateStr,
          day: dayName,
          tasks: dailyTasks
        });
      }

      await setDoc(doc(db, 'studyPlans', user.uid), {
        userId: user.uid,
        masterPlan: fullPlan,
        stats: { totalHours: 0, totalQuestions: 0, totalTests: 0 },
        updatedAt: serverTimestamp()
      }, { merge: true });

      toast({
        title: 'Plan Güncellendi',
        description: '3 saatlik hiyerarşik fasikül planın başarıyla oluşturuldu.',
        className: "bg-primary text-white rounded-[2rem]"
      });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Hata', description: 'Plan oluşturulamadı.' });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-8 lg:p-14 space-y-12 max-w-[1600px] mx-auto w-full animate-in fade-in duration-1000 bg-[#F8FAFC]">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
             <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-12 w-12 rounded-xl bg-white shadow-sm border border-slate-100 hover:bg-primary hover:text-white transition-all"><ArrowLeft className="h-5 w-5" /></Button>
             <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard')} className="h-12 w-12 rounded-xl bg-white shadow-sm border border-slate-100 hover:bg-primary hover:text-white transition-all"><Home className="h-5 w-5" /></Button>
          </div>
          <div className="space-y-2">
             <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent text-primary font-black text-[10px] uppercase tracking-widest shadow-xl shadow-accent/20">
                <Calendar className="h-3 w-3" /> Dinamik Planlama v4.8
             </div>
             <h2 className="text-6xl font-black tracking-tighter italic text-primary uppercase leading-none text-shadow-deep">
                Akademik <br /><span className="text-accent text-shadow-accent">Planlayıcı</span>
             </h2>
          </div>
        </div>
      </header>

      <Card className="rounded-[4rem] border-none shadow-2xl bg-white p-12 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
           <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4 italic">Plan Başlangıç</Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="h-16 rounded-2xl bg-slate-50 border-none shadow-inner font-black text-xl" />
           </div>
           <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4 italic">Hedef / Sınav Tarihi</Label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="h-16 rounded-2xl bg-slate-50 border-none shadow-inner font-black text-xl" />
           </div>
           <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4 italic">Başlangıç Saati</Label>
              <Input type="time" value={startHour} onChange={(e) => setStartHour(e.target.value)} className="h-16 rounded-2xl bg-slate-50 border-none shadow-inner font-black text-xl" />
           </div>
           <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4 italic">Günlük Hedef</Label>
              <select value={dailyHours} onChange={(e) => setDailyHours(e.target.value)} className="w-full h-16 rounded-2xl bg-slate-50 border-none shadow-inner font-black text-xl px-6 outline-none appearance-none">
                 <option value="3">3 Saat (Dinamik)</option>
                 <option value="5">5 Saat (Yoğun)</option>
                 <option value="8">8 Saat (Full Focus)</option>
              </select>
           </div>
        </div>

        <Button 
          onClick={generateFasikulPlan}
          disabled={isGenerating || !endDate}
          className="w-full h-24 rounded-[2.5rem] bg-primary hover:bg-accent transition-all duration-700 font-black text-xl uppercase tracking-[0.4em] gap-6 shadow-[0_50px_100px_-20px_rgba(15,23,42,0.4)] group text-white"
        >
          {isGenerating ? <Loader2 className="h-10 w-10 animate-spin" /> : <Zap className="h-10 w-10 text-accent group-hover:animate-pulse" />}
          YENİ PLANI HESAPLA VE KUR
        </Button>
      </Card>

      <div className="space-y-12">
        {(studyPlan?.masterPlan || []).map((day: any) => (
          <div key={day.date} className="space-y-6">
             <div className="flex items-center gap-4 px-4">
                <h3 className="text-2xl font-black italic text-primary uppercase">{day.date} — {day.day}</h3>
                <div className="h-px flex-1 bg-slate-200" />
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                {day.tasks.map((t: any) => (
                  <Card key={t.id} className={cn(
                    "aspect-square p-8 rounded-[3.5rem] border-2 bg-white flex flex-col justify-between transition-all hover:scale-105 hover:shadow-2xl group",
                    dayColors[day.day],
                    t.status === 'done' && "opacity-40 grayscale"
                  )}>
                     <div className="space-y-4">
                        <div className="flex justify-between items-start">
                           <span className="text-[10px] font-black uppercase bg-primary text-white px-3 py-1 rounded-full">{t.type}</span>
                           <span className="text-[11px] font-black text-accent">{t.time}</span>
                        </div>
                        <h5 className="text-xl font-black text-primary uppercase leading-tight italic">📋 {t.lesson}</h5>
                        <p className="text-[10px] font-bold text-muted-foreground italic leading-relaxed line-clamp-2">{t.topic}</p>
                        <div className="flex flex-wrap gap-2 pt-2">
                           <span className="text-[9px] font-black text-primary/40 uppercase">🟡 ORTA</span>
                           <span className="text-[9px] font-black text-primary/40 uppercase">⏱️ {t.duration}DK</span>
                        </div>
                     </div>
                     <div className="grid grid-cols-3 gap-2 pt-6 border-t border-slate-50 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="icon" className="h-10 w-10 rounded-2xl bg-emerald-500 shadow-lg"><CheckCircle2 className="h-4 w-4" /></Button>
                        <Button size="icon" variant="outline" className="h-10 w-10 rounded-2xl"><RotateCcw className="h-4 w-4 text-accent" /></Button>
                        <Button size="icon" variant="outline" className="h-10 w-10 rounded-2xl"><FastForward className="h-4 w-4 text-muted-foreground" /></Button>
                        <Button size="icon" variant="outline" className="h-10 w-10 rounded-2xl"><Gauge className="h-4 w-4" /></Button>
                        <Button size="icon" variant="outline" className="h-10 w-10 rounded-2xl"><Edit3 className="h-4 w-4" /></Button>
                        <Button size="icon" variant="outline" className="h-10 w-10 rounded-2xl text-destructive hover:bg-destructive/5 border-none"><Trash2 className="h-4 w-4" /></Button>
                     </div>
                  </Card>
                ))}
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}
