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
  'TYT Matematik': '#0f172a',
  'AYT Matematik': '#1e293b',
  'Geometri': '#064e3b',
  'TYT Türkçe': '#1e40af',
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

        const dailyBlocks = [];
        
        lessons.forEach((lesson, lIdx) => {
          const topics = YKS_TM_TOPICS[lesson];
          const topic = topics[lessonPointers[lesson] % topics.length];
          
          dailyBlocks.push({
            id: `block_${dateStr}_${lesson}`,
            lesson,
            topic,
            status: 'planned',
            difficulty: 'ORTA',
            phase1: {
              type: 'YENİ KONU ÇALIŞMASI',
              time: '10:00',
              duration: 60,
              questionTarget: 10,
              resources: {
                youtube: `https://www.youtube.com/results?search_query=${encodeURIComponent(lesson + ' ' + topic)}`,
                ogm: `https://ogmmateryal.eba.gov.tr/konu-ozeti/${encodeURIComponent(topic)}`,
                pdf: '#'
              }
            },
            phase2: {
              type: 'TEST VE AYRINTI ANALİZİ',
              time: '11:00',
              duration: 60,
              questionTarget: 20,
              resources: {
                youtube: `https://www.youtube.com/results?search_query=${encodeURIComponent(lesson + ' ' + topic + ' soru çözümü')}`,
                ogm: `https://ogmmateryal.eba.gov.tr/soru-bankasi/${encodeURIComponent(lesson)}`,
                pdf: '#'
              }
            }
          });

          lessonPointers[lesson]++;
        });

        // Review block
        dailyBlocks.push({
          id: `block_${dateStr}_review`,
          lesson: 'Genel',
          topic: 'Dünün Kazanımları',
          status: 'planned',
          difficulty: 'ORTA',
          isReview: true,
          phase1: {
            type: 'GÜNLÜK TEKRAR DÖNGÜSÜ',
            time: '12:00',
            duration: 40,
            questionTarget: 15,
          }
        });

        fullPlan.push({ date: dateStr, day: dayName, blocks: dailyBlocks });
      }

      await setDoc(doc(db, 'studyPlans', user.uid), {
        userId: user.uid,
        masterPlan: fullPlan,
        targetExamDate: endDate,
        updatedAt: serverTimestamp()
      }, { merge: true });

      toast({ title: 'Plan Senkronize Edildi', description: 'Fasikül blokları (Konu + Test) takvime işlendi.' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Hata', description: 'Plan oluşturulamadı.' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTaskAction = async (date: string, blockId: string, action: string) => {
    if (!db || !user || !studyPlan) return;
    const newPlan = studyPlan.masterPlan.map((day: any) => {
      if (day.date === date) {
        return {
          ...day,
          blocks: day.blocks.map((b: any) => {
            if (b.id === blockId) {
              if (action === 'done') return { ...b, status: b.status === 'done' ? 'planned' : 'done' };
              if (action === 'repeat') return { ...b, status: 'repeat' };
              if (action === 'skip') return { ...b, status: 'skipped' };
              if (action === 'level') {
                const nextDiff = b.difficulty === 'KOLAY' ? 'ORTA' : b.difficulty === 'ORTA' ? 'ZOR' : 'KOLAY';
                return { ...b, difficulty: nextDiff };
              }
              if (action === 'delete') return null;
              return b;
            }
            return b;
          }).filter(Boolean)
        };
      }
      return day;
    });

    await updateDoc(doc(db, 'studyPlans', user.uid), { masterPlan: newPlan, updatedAt: serverTimestamp() });
    
    if (action === 'done') toast({ title: 'Görev Güncellendi', description: 'İlerleme veritabanına işlendi.' });
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
                className="w-full h-20 rounded-[2rem] bg-primary hover:bg-accent transition-all duration-500 font-black text-xs uppercase tracking-[0.2em] gap-5 shadow-2xl shadow-primary/30 text-white"
              >
                {isGenerating ? <Loader2 className="h-7 w-7 animate-spin" /> : <Zap className="h-7 w-7 text-accent" />}
                FASİKÜL MOTORUNU ÇALIŞTIR
              </Button>
           </div>
        </div>
      </Card>

      <div className="space-y-24">
        {(studyPlan?.masterPlan || []).slice(0, 7).map((day: any) => (
          <div key={day.date} className="space-y-12">
             <div className="flex items-center gap-6 px-6">
                <h3 className="text-4xl font-black italic text-primary uppercase tracking-tighter">{day.date} — {day.day.toUpperCase()}</h3>
                <div className="h-px flex-1 bg-slate-200" />
             </div>
             <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
                {day.blocks?.map((block: any) => (
                  <Card 
                    key={block.id} 
                    className={cn(
                      "p-10 rounded-[5rem] border-none transition-all hover:scale-[1.02] shadow-[0_60px_120px_-30px_rgba(0,0,0,0.15)] group relative overflow-hidden bg-white border-t-[12px]",
                      block.status === 'done' && "opacity-70"
                    )}
                    style={{ borderTopColor: LESSON_COLORS[block.lesson] || '#334155' }}
                  >
                     <div className="space-y-10 relative z-10">
                        {/* Header */}
                        <div className="flex justify-between items-start">
                           <span className="text-[10px] font-black uppercase px-6 py-2 rounded-full shadow-sm bg-slate-50 border border-slate-100 flex items-center gap-3 text-primary">
                             📋 {block.lesson.toUpperCase()}
                           </span>
                           <div className="flex items-center gap-4">
                             {block.status === 'done' ? (
                               <div className="bg-emerald-500 text-white px-5 py-2 rounded-full text-[10px] font-black flex items-center gap-2 shadow-lg shadow-emerald-500/20">
                                 <CheckCircle2 className="h-4 w-4" /> TAMAMLANDI
                               </div>
                             ) : (
                               <div className="bg-rose-500 text-white px-5 py-2 rounded-full text-[10px] font-black flex items-center gap-2 shadow-lg shadow-rose-500/20">
                                 <Clock className="h-4 w-4" /> BEKLİYOR
                               </div>
                             )}
                           </div>
                        </div>

                        {/* Title & Topic */}
                        <div className="space-y-2">
                           <h4 className="text-[2.5rem] font-black italic leading-[0.9] tracking-tighter uppercase text-primary">
                              {block.topic}
                           </h4>
                           <p className="text-sm font-bold text-muted-foreground italic uppercase tracking-widest opacity-40">
                              Günlük Fasikül Modülü
                           </p>
                        </div>

                        {/* Phases */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                           {/* Phase 1: Konu */}
                           <div className="p-8 rounded-[3rem] bg-slate-50 border border-slate-100 space-y-4">
                              <div className="flex justify-between items-center border-b border-slate-200 pb-3 mb-2">
                                 <span className="text-[9px] font-black text-primary opacity-40 uppercase tracking-widest">1. AŞAMA: KONU</span>
                                 <span className="text-sm font-black text-primary italic">{block.phase1.time}</span>
                              </div>
                              <h5 className="font-black text-xl italic text-primary leading-none uppercase">{block.phase1.type}</h5>
                              <div className="flex flex-wrap gap-2">
                                 <span className="text-[9px] font-black uppercase bg-white px-3 py-1 rounded-xl text-primary border border-slate-200">⏱️ {block.phase1.duration}DK</span>
                                 <span className="text-[9px] font-black uppercase bg-white px-3 py-1 rounded-xl text-primary border border-slate-200">📝 {block.phase1.questionTarget} HEDEF</span>
                              </div>
                              {block.phase1.resources && (
                                 <div className="flex gap-4 pt-2">
                                    <a href={block.phase1.resources.youtube} target="_blank" className="hover:scale-125 transition-transform text-rose-500"><Youtube className="h-5 w-5" /></a>
                                    <a href={block.phase1.resources.ogm} target="_blank" className="hover:scale-125 transition-transform text-blue-500"><Globe className="h-5 w-5" /></a>
                                 </div>
                              )}
                           </div>

                           {/* Phase 2: Test */}
                           {block.phase2 && (
                              <div className="p-8 rounded-[3rem] bg-accent/5 border border-accent/10 space-y-4">
                                 <div className="flex justify-between items-center border-b border-accent/20 pb-3 mb-2">
                                    <span className="text-[9px] font-black text-accent uppercase tracking-widest">2. AŞAMA: TEST</span>
                                    <span className="text-sm font-black text-primary italic">{block.phase2.time}</span>
                                 </div>
                                 <h5 className="font-black text-xl italic text-primary leading-none uppercase">{block.phase2.type}</h5>
                                 <div className="flex flex-wrap gap-2">
                                    <span className="text-[9px] font-black uppercase bg-white px-3 py-1 rounded-xl text-accent border border-accent/20">⏱️ {block.phase2.duration}DK</span>
                                    <span className="text-[9px] font-black uppercase bg-white px-3 py-1 rounded-xl text-accent border border-accent/20">📝 {block.phase2.questionTarget} SORU</span>
                                 </div>
                                 {block.phase2.resources && (
                                    <div className="flex gap-4 pt-2">
                                       <a href={block.phase2.resources.youtube} target="_blank" className="hover:scale-125 transition-transform text-rose-500"><Youtube className="h-5 w-5" /></a>
                                       <a href={block.phase2.resources.ogm} target="_blank" className="hover:scale-125 transition-transform text-blue-500"><Globe className="h-5 w-5" /></a>
                                    </div>
                                 )}
                              </div>
                           )}
                        </div>

                        {/* Actions */}
                        <div className="grid grid-cols-3 md:grid-cols-6 gap-4 pt-6 border-t border-slate-50 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
                           <Button 
                             onClick={() => handleTaskAction(day.date, block.id, 'done')}
                             size="icon" variant="ghost"
                             className={cn("h-14 w-14 rounded-3xl transition-all shadow-xl", block.status === 'done' ? "bg-slate-100 text-slate-400" : "bg-emerald-500 text-white")}
                           ><CheckCircle2 className="h-6 w-6" /></Button>
                           <Button 
                             onClick={() => handleTaskAction(day.date, block.id, 'repeat')}
                             size="icon" variant="outline" className="h-14 w-14 rounded-3xl bg-white hover:bg-orange-50 text-orange-500"
                           ><RotateCcw className="h-6 w-6" /></Button>
                           <Button 
                             onClick={() => handleTaskAction(day.date, block.id, 'skip')}
                             size="icon" variant="outline" className="h-14 w-14 rounded-3xl bg-white hover:bg-slate-50 text-slate-400"
                           ><FastForward className="h-6 w-6" /></Button>
                           <Button 
                             onClick={() => handleTaskAction(day.date, block.id, 'level')}
                             size="icon" variant="outline" className="h-14 w-14 rounded-3xl bg-white hover:bg-blue-50 text-blue-500"
                           ><Gauge className="h-6 w-6" /></Button>
                           <Button size="icon" variant="outline" className="h-14 w-14 rounded-3xl bg-white hover:bg-slate-50 text-slate-900"><Edit3 className="h-6 w-6" /></Button>
                           <Button 
                             onClick={() => handleTaskAction(day.date, block.id, 'delete')}
                             size="icon" variant="outline" className="h-14 w-14 rounded-3xl bg-white hover:bg-rose-50 text-rose-500"
                           ><Trash2 className="h-6 w-6" /></Button>
                        </div>
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
