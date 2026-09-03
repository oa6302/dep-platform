'use client';

import { useState, useMemo } from 'react';
import { useUser, useDoc, useFirestore } from '@/firebase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Calendar, Clock, Zap, Loader2, Sparkles, 
  CheckCircle2, Trash2, ArrowLeft, 
  Home, RotateCcw, FastForward, Gauge, Edit3,
  Youtube, FileText, Globe
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { YKS_TM_TOPICS } from '@/lib/curriculum-data';
import { doc, setDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { format, addDays } from 'date-fns';
import { tr } from 'date-fns/locale';

const LESSON_COLORS: Record<string, string> = {
  'TYT Matematik': '#1e293b',
  'AYT Matematik': '#0f172a',
  'Geometri': '#064e3b',
  'TYT Türkçe': '#1a3a5f',
  'Edebiyat': '#881337',
  'Tarih': '#7c2d12',
  'Coğrafya': '#14532d',
  'Felsefe': '#4c1d95',
  'Din Kültürü': '#312e81',
  'Genel': '#334155',
};

export default function PlanningPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  const { data: studyPlan, loading: planLoading } = useDoc<any>(user?.uid ? `studyPlans/${user.uid}` : null);
  
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
        
        // 1. SAAT: YENİ KONU
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

          // 2. SAAT: TEST VE AYRINTI
          dailyTasks.push({
            id: `task_${dateStr}_${lesson}_test_${lIdx}`,
            lesson,
            topic,
            type: 'TEST VE AYRINTI ANALİZİ',
            time: '11:00',
            duration: 60,
            difficulty: 'ORTA',
            questionTarget: 20,
            status: 'planned',
            resources: {
              youtube: `https://www.youtube.com/results?search_query=${encodeURIComponent(lesson + ' ' + topic + ' soru çözümü')}`,
              ogm: `https://ogmmateryal.eba.gov.tr/soru-bankasi/${encodeURIComponent(lesson)}`,
              pdf: '#'
            }
          });

          lessonPointers[lesson]++;
        });

        // 3. SAAT: DÜNÜN TEKRARI
        if (i > 0) {
          const yesterdayDt = addDays(start, i - 1);
          const yesterdayStr = format(yesterdayDt, 'yyyy-MM-dd');
          dailyTasks.push({
            id: `task_${dateStr}_review_${i}`,
            lesson: 'Genel',
            topic: `${yesterdayStr} Tarihli Kritik Kazanımlar`,
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

      toast({ title: 'Plan Senkronize Edildi', description: 'Fasikül hiyerarşisi (Konu-Test-Tekrar) takvime işlendi.' });
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
             <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-accent text-primary font-black text-[10px] uppercase tracking-widest shadow-xl shadow-accent/20 italic">
                <Calendar className="h-3.5 w-3.5" /> AOS DİNAMİK PLANLAYICI v4.8
             </div>
             <h2 className="text-6xl font-black tracking-tighter italic text-primary uppercase leading-none text-shadow-premium">
                Akademik <br /><span className="text-accent text-shadow-accent">Terminal</span>
             </h2>
          </div>
        </div>
      </header>

      <Card className="rounded-[4rem] border-none shadow-[0_50px_100px_-20px_rgba(15,23,42,0.1)] bg-white p-12 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
           <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-6 italic">HEDEF SINAV TARİHİ</Label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="h-20 rounded-[2rem] bg-slate-50 border-none shadow-inner font-black text-2xl px-8" />
           </div>
           <div className="space-y-3 flex items-end">
              <Button 
                onClick={generateFasikulPlan}
                disabled={isGenerating || !endDate}
                className="w-full h-20 rounded-[2rem] bg-primary hover:bg-accent transition-all duration-500 font-black text-xs uppercase tracking-[0.2em] gap-5 shadow-2xl shadow-primary/30"
              >
                {isGenerating ? <Loader2 className="h-7 w-7 animate-spin" /> : <Zap className="h-7 w-7 text-accent" />}
                FASİKÜL MOTORUNU ÇALIŞTIR
              </Button>
           </div>
        </div>
      </Card>

      <div className="space-y-16">
        {(studyPlan?.masterPlan || []).slice(0, 14).map((day: any) => (
          <div key={day.date} className="space-y-10">
             <div className="flex items-center gap-6 px-6">
                <h3 className="text-3xl font-black italic text-primary uppercase tracking-tighter">{day.date} — {day.day.toUpperCase()}</h3>
                <div className="h-px flex-1 bg-slate-200" />
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-10">
                {day.tasks.map((t: any) => (
                  <Card 
                    key={t.id} 
                    className={cn(
                      "aspect-square p-5 rounded-[4rem] border-none flex flex-col justify-between transition-all hover:scale-[1.05] shadow-[0_45px_100px_-25px_rgba(15,23,42,0.12)] group relative overflow-hidden bg-white border-t-[8px]",
                      t.status === 'done' && "opacity-60 grayscale scale-95"
                    )}
                    style={{ borderTopColor: LESSON_COLORS[t.lesson] || '#334155' }}
                  >
                     <div className="space-y-2.5 relative z-10">
                        <div className="flex justify-between items-start">
                           <span className="text-[9px] font-black uppercase px-4 py-1.5 rounded-full shadow-sm bg-slate-50 border border-slate-100 flex items-center gap-2 text-primary">
                             📋 {t.lesson.toUpperCase()}
                           </span>
                           <div className="flex items-center gap-2">
                             {t.status === 'done' ? (
                               <div className="bg-emerald-500 text-white px-2 py-0.5 rounded-full text-[8px] font-black flex items-center gap-1 shadow-lg">
                                 <CheckCircle2 className="h-2.5 w-2.5" /> TAMAMLANDI
                               </div>
                             ) : (
                               <div className="bg-rose-500 text-white px-2 py-0.5 rounded-full text-[8px] font-black flex items-center gap-1 shadow-lg">
                                 <Clock className="h-2.5 w-2.5" /> BEKLİYOR
                               </div>
                             )}
                             <span className="text-base font-black text-slate-300 italic">{t.time || '10:00'}</span>
                           </div>
                        </div>

                        <div className="space-y-1">
                           <h4 className="text-[1.5rem] font-black italic leading-[0.95] tracking-tighter uppercase text-primary">
                              {t.type}
                           </h4>
                           <p className="text-[10px] font-bold text-muted-foreground italic leading-tight truncate">
                              {t.topic}
                           </p>
                        </div>

                        <div className="space-y-2">
                           <div className="flex flex-wrap gap-1.5">
                              <span className="text-[8px] font-black uppercase bg-slate-50 px-2.5 py-1.5 rounded-xl text-accent flex items-center gap-1 shadow-inner border border-slate-100">🟡 {t.difficulty}</span>
                              <span className="text-[8px] font-black uppercase bg-slate-50 px-2.5 py-1.5 rounded-xl text-primary flex items-center gap-1 shadow-inner border border-slate-100">⏱️ {t.duration}DK</span>
                              <span className="text-[8px] font-black uppercase bg-slate-50 px-2.5 py-1.5 rounded-xl text-primary flex items-center gap-1 shadow-inner border border-slate-100">📝 {t.questionTarget} SORU</span>
                           </div>
                           <div className="flex items-center gap-4 pt-0.5">
                              {t.resources ? (
                                <div className="flex gap-4">
                                   <a href={t.resources.youtube} target="_blank" className="hover:scale-125 transition-transform text-slate-400 hover:text-rose-500"><Youtube className="h-4 w-4" /></a>
                                   <a href={t.resources.ogm} target="_blank" className="hover:scale-125 transition-transform text-slate-400 hover:text-blue-500"><Globe className="h-4 w-4" /></a>
                                   <a href={t.resources.pdf} target="_blank" className="hover:scale-125 transition-transform text-slate-400 hover:text-primary"><FileText className="h-4 w-4" /></a>
                                </div>
                              ) : (
                                <span className="text-[8px] font-bold text-slate-300 italic uppercase tracking-widest">Kaynak eklenmedi</span>
                              )}
                           </div>
                        </div>
                     </div>
                     
                     <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-50 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-1 group-hover:translate-y-0">
                        <Button 
                          onClick={() => handleTaskAction(day.date, t.id, 'done')}
                          size="icon" 
                          className={cn(
                            "h-10 w-10 rounded-2xl transition-all shadow-xl",
                            t.status === 'done' ? "bg-slate-100 text-slate-400" : "bg-emerald-500 hover:bg-emerald-400 text-white"
                          )}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                        <Button 
                          onClick={() => handleTaskAction(day.date, t.id, 'repeat')}
                          size="icon" 
                          variant="outline" 
                          className="h-10 w-10 rounded-2xl bg-white hover:bg-orange-50 border-slate-100 text-orange-500"
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="outline" 
                          className="h-10 w-10 rounded-2xl bg-white hover:bg-slate-50 border-slate-100 text-slate-400"
                        >
                          <FastForward className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="outline" 
                          className="h-10 w-10 rounded-2xl bg-white hover:bg-blue-50 border-slate-100 text-blue-500"
                        >
                          <Gauge className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="outline" 
                          className="h-10 w-10 rounded-2xl bg-white hover:bg-slate-50 border-slate-100 text-slate-900"
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button 
                          onClick={() => handleTaskAction(day.date, t.id, 'delete')}
                          size="icon" 
                          variant="outline" 
                          className="h-10 w-10 rounded-2xl bg-white hover:bg-rose-50 border-slate-100 text-rose-500"
                        >
                          <Trash2 className="h-4 w-4" />
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
