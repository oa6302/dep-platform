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
  ArrowRight, Youtube, FileText, Globe
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { YKS_TM_TOPICS } from '@/lib/curriculum-data';
import { doc, setDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { format, addDays, subDays } from 'date-fns';
import { tr } from 'date-fns/locale';

const LESSON_COLORS: Record<string, string> = {
  'TYT Matematik': 'bg-slate-900 border-slate-200 text-slate-50',
  'AYT Matematik': 'bg-slate-800 border-slate-200 text-slate-50',
  'Geometri': 'bg-emerald-900 border-emerald-200 text-emerald-50',
  'Edebiyat': 'bg-rose-900 border-rose-200 text-rose-50',
  'Tarih': 'bg-orange-900 border-orange-200 text-orange-50',
  'Coğrafya': 'bg-green-900 border-green-200 text-green-50',
  'Felsefe': 'bg-purple-900 border-purple-200 text-purple-50',
  'Din Kültürü': 'bg-indigo-900 border-indigo-200 text-indigo-50',
  'Genel': 'bg-slate-100 border-slate-200 text-slate-900',
};

export default function PlanningPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  const { data: studyPlan } = useDoc<any>(user?.uid ? `studyPlans/${user.uid}` : null);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState('2027-06-15');

  const generateFasikulPlan = async () => {
    if (!db || !user || !endDate) return;
    setIsGenerating(true);

    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffDays = Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

      const lessons = Object.keys(YKS_TM_TOPICS);
      const lessonPointers: Record<string, number> = {};
      lessons.forEach(l => { lessonPointers[l] = 0; });

      const fullPlan = [];

      for (let i = 0; i <= diffDays; i++) {
        const currentDt = addDays(start, i);
        const dateStr = format(currentDt, 'yyyy-MM-dd');
        const dayName = format(currentDt, 'EEEE', { locale: tr });

        const dailyTasks = [];
        
        // 1. SAAT: Yeni Konu (Hiyerarşik)
        lessons.forEach((lesson, lIdx) => {
          const topics = YKS_TM_TOPICS[lesson];
          const topic = topics[lessonPointers[lesson] % topics.length];
          
          dailyTasks.push({
            id: `task_${dateStr}_${lesson}_new_${lIdx}`,
            lesson,
            topic,
            type: 'YENİ KONU ÇALIŞMASI',
            time: '10:00',
            duration: 60,
            difficulty: 'ORTA',
            questionTarget: 10,
            status: 'planned',
            resources: {
              youtube: `https://www.youtube.com/results?search_query=${encodeURIComponent(lesson + ' ' + topic)}`,
              ogm: `https://ogmmateryal.eba.gov.tr/konu-ozeti/${encodeURIComponent(topic)}`,
              pdf: '#'
            }
          });
        });

        // 2. SAAT: Test ve Ayrıntı
        lessons.forEach((lesson, lIdx) => {
          const topics = YKS_TM_TOPICS[lesson];
          const topic = topics[lessonPointers[lesson] % topics.length];
          
          dailyTasks.push({
            id: `task_${dateStr}_${lesson}_test_${lIdx}`,
            lesson,
            topic,
            type: 'TEST VE AYRINTI ANALİZİ',
            time: '11:00',
            duration: 60,
            difficulty: 'ORTA',
            questionTarget: 20,
            status: 'planned'
          });
          
          lessonPointers[lesson]++;
        });

        // 3. SAAT: Kısa Tekrar
        if (i > 0) {
          dailyTasks.push({
            id: `task_${dateStr}_review_${i}`,
            lesson: 'Genel',
            topic: 'Dünün Kritik Kazanımları',
            type: 'GÜNLÜK TEKRAR DÖNGÜSÜ',
            time: '12:00',
            duration: 60,
            difficulty: 'ORTA',
            questionTarget: 15,
            status: 'planned'
          });
        }

        fullPlan.push({ date: dateStr, day: dayName, tasks: dailyTasks });
      }

      await setDoc(doc(db, 'studyPlans', user.uid), {
        userId: user.uid,
        masterPlan: fullPlan,
        targetExamDate: endDate,
        updatedAt: serverTimestamp()
      }, { merge: true });

      toast({ title: 'Plan Güncellendi', description: '3 saatlik profesyonel döngünüz saniyeler içinde hazırlandı.' });
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
              if (action === 'done') return { ...t, status: t.status === 'done' ? 'planned' : 'done' };
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

    await updateDoc(doc(db, 'studyPlans', user.uid), { masterPlan: newPlan, updatedAt: serverTimestamp() });
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
           <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4 italic">Sınav Tarihi</Label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="h-16 rounded-2xl bg-slate-50 border-none shadow-inner font-black text-xl" />
           </div>
           <div className="space-y-3 flex items-end">
              <Button 
                onClick={generateFasikulPlan}
                disabled={isGenerating || !endDate}
                className="w-full h-16 rounded-2xl bg-primary hover:bg-accent transition-all font-black text-xs uppercase tracking-widest gap-4 shadow-2xl"
              >
                {isGenerating ? <Loader2 className="h-6 w-6 animate-spin" /> : <Zap className="h-6 w-6 text-accent" />}
                FASİKÜL PLANINI OLUŞTUR VE SENKRONİZE ET
              </Button>
           </div>
        </div>
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
                    "aspect-square p-8 rounded-[3.5rem] border-2 flex flex-col justify-between transition-all hover:scale-[1.03] hover:shadow-2xl group relative overflow-hidden",
                    LESSON_COLORS[t.lesson] || "bg-white border-slate-200",
                    t.status === 'done' && "opacity-40 grayscale"
                  )}>
                     <div className="space-y-6 relative z-10">
                        <div className="flex justify-between items-start">
                           <span className={cn(
                             "text-[10px] font-black uppercase px-4 py-1.5 rounded-full shadow-lg flex items-center gap-2",
                             t.lesson === 'Genel' ? "bg-primary text-white" : "bg-white text-slate-900"
                           )}>
                             📋 {t.lesson.toUpperCase()}
                           </span>
                           <span className="text-[12px] font-black opacity-60">{t.time}</span>
                        </div>

                        <div className="space-y-2">
                           <h4 className="text-3xl font-black italic leading-[1] tracking-tighter uppercase">
                              {t.type}
                           </h4>
                           <p className="text-sm font-bold opacity-60 italic leading-tight">
                              {t.topic}
                           </p>
                        </div>

                        <div className="space-y-4">
                           <div className="flex flex-wrap gap-2">
                              <span className="text-[10px] font-black uppercase bg-black/10 px-2 py-1 rounded-lg">🟡 {t.difficulty}</span>
                              <span className="text-[10px] font-black uppercase bg-black/10 px-2 py-1 rounded-lg">⏱️ {t.duration}DK</span>
                              <span className="text-[10px] font-black uppercase bg-black/10 px-2 py-1 rounded-lg">📝 {t.questionTarget} SORU</span>
                           </div>
                           <div className="flex items-center gap-3">
                              {t.resources ? (
                                <div className="flex gap-2">
                                   <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-white/10 hover:bg-rose-500" asChild><a href={t.resources.youtube} target="_blank"><Youtube className="h-4 w-4" /></a></Button>
                                   <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-white/10 hover:bg-emerald-500" asChild><a href={t.resources.ogm} target="_blank"><Globe className="h-4 w-4" /></a></Button>
                                   <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-white/10 hover:bg-blue-500" asChild><a href={t.resources.pdf} target="_blank"><FileText className="h-4 w-4" /></a></Button>
                                </div>
                              ) : (
                                <span className="text-[9px] font-black uppercase opacity-40 tracking-widest italic">KAYNAK EKLENMEDİ</span>
                              )}
                           </div>
                        </div>
                     </div>
                     
                     <div className="grid grid-cols-3 gap-2 pt-6 border-t border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <Button 
                          onClick={() => handleTaskAction(day.date, t.id, 'done')}
                          size="icon" 
                          className={cn(
                            "h-12 w-12 rounded-2xl transition-all shadow-xl",
                            t.status === 'done' ? "bg-slate-400" : "bg-emerald-500 hover:bg-emerald-600"
                          )}
                        >
                          <CheckCircle2 className="h-5 w-5 text-white" />
                        </Button>
                        <Button 
                          onClick={() => handleTaskAction(day.date, t.id, 'repeat')}
                          size="icon" 
                          variant="ghost" 
                          className="h-12 w-12 rounded-2xl bg-white/10 hover:bg-white/20 border-2 border-orange-500/50"
                        >
                          <RotateCcw className="h-5 w-5 text-orange-400" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-12 w-12 rounded-2xl bg-white/10 hover:bg-white/20 border-2 border-white/20"
                        >
                          <FastForward className="h-5 w-5 text-white/60" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-12 w-12 rounded-2xl bg-white/10 hover:bg-white/20 border-2 border-blue-400/50"
                        >
                          <Gauge className="h-5 w-5 text-blue-300" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-12 w-12 rounded-2xl bg-white/10 hover:bg-white/20 border-2 border-white/20"
                        >
                          <Edit3 className="h-5 w-5 text-white" />
                        </Button>
                        <Button 
                          onClick={() => handleTaskAction(day.date, t.id, 'delete')}
                          size="icon" 
                          variant="ghost" 
                          className="h-12 w-12 rounded-2xl bg-white/10 hover:bg-rose-500/30 border-2 border-rose-500/50 text-rose-500"
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
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
