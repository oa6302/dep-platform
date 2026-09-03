'use client';

import { useState, useMemo } from 'react';
import { useUser, useDoc, useFirestore } from '@/firebase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Calendar, Clock, Target, Plus, Zap, Loader2, Sparkles, 
  ChevronRight, Brain, CheckCircle2, History, Trash2, ArrowLeft, 
  Home, RefreshCcw, RotateCcw, FastForward, Gauge, Edit3, ClipboardList, BookOpen,
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
  const [endDate, setEndDate] = useState('2027-06-15');
  const [dailyHours, setDailyHours] = useState('3');
  const [startHour, setStartHour] = useState('10:00');

  const dayStyles: Record<string, string> = {
    'Pazartesi': 'bg-rose-50/50 border-rose-200 text-rose-900',
    'Salı': 'bg-orange-50/50 border-orange-200 text-orange-900',
    'Çarşamba': 'bg-emerald-50/50 border-emerald-200 text-emerald-900',
    'Perşembe': 'bg-blue-50/50 border-blue-200 text-blue-900',
    'Cuma': 'bg-purple-50/50 border-purple-200 text-purple-900',
    'Cumartesi': 'bg-teal-50/50 border-teal-200 text-teal-900',
    'Pazar': 'bg-pink-50/50 border-pink-200 text-pink-900',
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

        const dailyTasks = [];
        
        // 1. SAAT: Yeni Konu (Her dersten birer parça - Fasikül Akışı)
        lessons.forEach((lesson) => {
          const topics = YKS_TM_TOPICS[lesson];
          const topic = topics[lessonPointers[lesson] % topics.length];
          
          dailyTasks.push({
            id: `task_${dateStr}_${lesson}_new_${Math.random().toString(36).substr(2, 5)}`,
            lesson,
            topic,
            type: 'Yeni Konu Çalışması',
            time: '10:00',
            duration: 60,
            difficulty: 'Orta',
            questionTarget: 10,
            status: 'planned'
          });
        });

        // 2. SAAT: Yeni Ayrıntılar ve Testler
        lessons.forEach((lesson) => {
          const topics = YKS_TM_TOPICS[lesson];
          const topic = topics[lessonPointers[lesson] % topics.length];
          
          dailyTasks.push({
            id: `task_${dateStr}_${lesson}_test_${Math.random().toString(36).substr(2, 5)}`,
            lesson,
            topic,
            type: 'Test ve Ayrıntı',
            time: '11:00',
            duration: 60,
            difficulty: 'Orta',
            questionTarget: 20,
            status: 'planned'
          });
          
          lessonPointers[lesson]++;
        });

        // 3. SAAT: Önceki Günün Kısa Tekrarı
        if (i > 0) {
          dailyTasks.push({
            id: `task_${dateStr}_review_${Math.random().toString(36).substr(2, 5)}`,
            lesson: 'Genel',
            topic: 'Dünün Kazanım Tekrarı',
            type: 'Kısa Tekrar',
            time: '12:00',
            duration: 60,
            difficulty: 'Orta',
            questionTarget: 15,
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
        targetExamDate: endDate,
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

  const handleTaskAction = async (date: string, taskId: string, action: string) => {
    if (!db || !user || !studyPlan) return;
    const newPlan = studyPlan.masterPlan.map((day: any) => {
      if (day.date === date) {
        return {
          ...day,
          tasks: day.tasks.map((t: any) => {
            if (t.id === taskId) {
              if (action === 'done') return { ...t, status: 'done' };
              if (action === 'repeat') return { ...t, status: 'repeat' };
              if (action === 'delete') return null;
              return t;
            }
            return t;
          }).filter(Boolean)
        };
      }
      return day;
    });

    await updateDoc(doc(db, 'studyPlans', user.uid), {
      masterPlan: newPlan,
      updatedAt: serverTimestamp()
    });
  };

  return (
    <div className="p-8 lg:p-14 space-y-12 max-w-[1800px] mx-auto w-full animate-in fade-in duration-1000 bg-[#F8FAFC]">
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
              <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4 italic">Sınav Tarihi</Label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="h-16 rounded-2xl bg-slate-50 border-none shadow-inner font-black text-xl" />
           </div>
           <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4 italic">Başlangıç Saati</Label>
              <Input type="time" value={startHour} onChange={(e) => setStartHour(e.target.value)} className="h-16 rounded-2xl bg-slate-50 border-none shadow-inner font-black text-xl" />
           </div>
           <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4 italic">Günlük Hedef</Label>
              <select value={dailyHours} onChange={(e) => setDailyHours(e.target.value)} className="w-full h-16 rounded-2xl bg-slate-50 border-none shadow-inner font-black text-xl px-6 outline-none appearance-none">
                 <option value="3">3 Saat (Fasikül Döngüsü)</option>
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
          YENİ FASİKÜL PLANINI KUR
        </Button>
      </Card>

      <div className="space-y-12">
        {(studyPlan?.masterPlan || []).map((day: any) => (
          <div key={day.date} className="space-y-6">
             <div className="flex items-center gap-4 px-4">
                <h3 className="text-2xl font-black italic text-primary uppercase">{day.date} — {day.day}</h3>
                <div className="h-px flex-1 bg-slate-200" />
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                {day.tasks.map((t: any) => (
                  <Card key={t.id} className={cn(
                    "aspect-square p-8 rounded-[3.5rem] border-2 flex flex-col justify-between transition-all hover:scale-105 hover:shadow-2xl group",
                    dayStyles[day.day] || "bg-white",
                    t.status === 'done' && "opacity-40 grayscale"
                  )}>
                     <div className="space-y-4">
                        <div className="flex justify-between items-start">
                           <span className="text-[10px] font-black uppercase bg-primary text-white px-3 py-1 rounded-full">📋 {t.lesson}</span>
                           <span className="text-[11px] font-black text-primary/60">{t.time}</span>
                        </div>
                        <h5 className="text-xl font-black text-primary uppercase leading-tight italic">
                           {t.type}
                        </h5>
                        <p className="text-[10px] font-bold text-muted-foreground italic leading-relaxed line-clamp-2">
                           {t.topic}
                        </p>
                        <div className="space-y-1.5">
                           <div className="flex flex-wrap gap-2">
                              <span className="text-[9px] font-black text-primary/40 uppercase">🟡 {t.difficulty}</span>
                              <span className="text-[9px] font-black text-primary/40 uppercase">⏱️ {t.duration}DK</span>
                              <span className="text-[9px] font-black text-primary/40 uppercase">📝 {t.questionTarget} SORU</span>
                           </div>
                           <p className="text-[9px] font-bold text-primary/30 uppercase italic">Kaynak eklenmedi</p>
                        </div>
                     </div>
                     
                     <div className="grid grid-cols-3 gap-2 pt-6 border-t border-primary/5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          onClick={() => handleTaskAction(day.date, t.id, 'done')}
                          size="icon" 
                          className="h-10 w-10 rounded-2xl bg-emerald-500 hover:bg-emerald-600 shadow-lg"
                        >
                          <CheckCircle2 className="h-4 w-4 text-white" />
                        </Button>
                        <Button 
                          onClick={() => handleTaskAction(day.date, t.id, 'repeat')}
                          size="icon" 
                          variant="outline" 
                          className="h-10 w-10 rounded-2xl bg-white border-2 hover:bg-slate-50"
                        >
                          <RotateCcw className="h-4 w-4 text-accent" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="outline" 
                          className="h-10 w-10 rounded-2xl bg-white border-2 hover:bg-slate-50"
                        >
                          <FastForward className="h-4 w-4 text-muted-foreground" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="outline" 
                          className="h-10 w-10 rounded-2xl bg-white border-2 hover:bg-slate-50"
                        >
                          <Gauge className="h-4 w-4 text-primary" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="outline" 
                          className="h-10 w-10 rounded-2xl bg-white border-2 hover:bg-slate-50"
                        >
                          <Edit3 className="h-4 w-4 text-primary" />
                        </Button>
                        <Button 
                          onClick={() => handleTaskAction(day.date, t.id, 'delete')}
                          size="icon" 
                          variant="outline" 
                          className="h-10 w-10 rounded-2xl bg-white border-2 text-destructive hover:bg-destructive/5"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                     </div>
                  </Card>
                ))}
             </div>
          </div>
        ))}
        {(!studyPlan?.masterPlan || studyPlan.masterPlan.length === 0) && (
          <div className="py-40 text-center space-y-6">
            <Zap className="h-20 w-20 text-accent opacity-20 mx-auto animate-pulse" />
            <p className="text-xl font-black uppercase tracking-[0.4em] text-primary/20 italic">Henüz Bir Plan Oluşturulmadı</p>
          </div>
        )}
      </div>
    </div>
  );
}
