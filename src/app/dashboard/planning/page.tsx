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
  Youtube, Globe, Save, X, CalendarDays, FileText, AlertTriangle,
  BellRing
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { YKS_TM_TOPICS } from '@/lib/curriculum-data';
import { doc, updateDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { format, addDays, isBefore, parseISO, startOfToday, getDate } from 'date-fns';
import { tr } from 'date-fns/locale';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';

const LESSON_COLORS: Record<string, string> = {
  'TYT Matematik': '#0f172a',
  'AYT Matematik': '#1e293b',
  'Felsefe': '#4c1d95',
  'TYT Türkçe': '#1e40af',
  'Edebiyat': '#881337',
  'Tarih': '#7c2d12',
  'Coğrafya': '#14532d',
  'Din Kültürü': '#312e81',
  'Genel': '#334155',
};

export default function PlanningPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  
  const { data: userData } = useDoc<any>(user?.uid ? `users/${user.uid}` : null);
  const { data: studyPlan, loading: planLoading } = useDoc<any>(user?.uid ? `studyPlans/${user.uid}` : null);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [startDate, setStartDate] = useState('2026-09-03');
  const [endDate, setEndDate] = useState('2027-06-15');

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<any>(null);

  const createBlockData = (dateStr: string, lesson: string, topic: string, time: string) => {
    return {
      id: `block_${dateStr}_${lesson.replace(/\s+/g, '_')}_${Math.random().toString(36).substr(2, 5)}`,
      lesson,
      topic,
      status: 'planned',
      difficulty: 'ORTA',
      reminder: '',
      phase1: {
        type: 'YENİ KONU ÇALIŞMASI',
        time: time, // Default 10:00
        duration: 60,
        questionTarget: 10,
        resources: {
          youtube: `https://www.youtube.com/results?search_query=${encodeURIComponent(lesson + ' ' + topic)}`,
          ogm: `https://ogmmateryal.eba.gov.tr/konu-anlatimlari-video?video=1`,
          pdf: '',
          kamp: ''
        }
      },
      phase2: {
        type: 'TEST VE AYRINTI ANALİZİ',
        time: '11:00', // Always 1 hour after Phase 1 start
        duration: 60,
        questionTarget: 20,
        resources: {
          youtube: `https://www.youtube.com/results?search_query=${encodeURIComponent(lesson + ' ' + topic + ' soru çözümü')}`,
          ogm: `https://ogmmateryal.eba.gov.tr/soru-bankasi/${encodeURIComponent(lesson)}`,
          pdf: '',
          kamp: ''
        }
      }
    };
  };

  const createReviewBlockData = (dateStr: string, title: string, time: string, duration: number, type: 'DAILY' | 'WEEKLY' | 'MONTHLY') => {
    return {
      id: `review_${dateStr}_${type}_${Math.random().toString(36).substr(2, 5)}`,
      lesson: 'Genel',
      topic: title,
      status: 'planned',
      difficulty: type === 'MONTHLY' ? 'ZOR' : 'ORTA',
      reminder: type === 'MONTHLY' ? 'Tüm ayın eksik analizlerini terminalden indir.' : '',
      phase1: {
        type: `${type === 'DAILY' ? 'DÜNÜN' : type === 'WEEKLY' ? 'HAFTANIN' : 'AYIN'} ANALİZİ`,
        time: time, // Default 12:00
        duration: duration,
        questionTarget: type === 'DAILY' ? 15 : type === 'WEEKLY' ? 50 : 100,
        resources: { youtube: '', ogm: '', pdf: '', kamp: '' }
      },
      phase2: {
        type: 'HATA VE EKSİK TAKİBİ',
        time: '13:00', // Review end
        duration: 0,
        questionTarget: 0,
        resources: { youtube: '', ogm: '', pdf: '', kamp: '' }
      }
    };
  };

  const generateFasikulPlan = async () => {
    if (!db || !user || !endDate || !startDate) return;
    setIsGenerating(true);

    try {
      const start = parseISO(startDate);
      const end = parseISO(endDate);
      const today = startOfToday();
      
      const diffDays = Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

      const otherLessons = [
        'TYT Matematik',
        'AYT Matematik',
        'Edebiyat',
        'Tarih',
        'Coğrafya',
        'Felsefe',
        'TYT Türkçe'
      ];

      const completed = userData?.completedTopics || {};
      const lessonQueues: Record<string, string[]> = {};
      otherLessons.forEach(lesson => {
        const allTopics = YKS_TM_TOPICS[lesson] || [];
        const done = completed[lesson] || [];
        lessonQueues[lesson] = allTopics.filter(t => !done.includes(t));
        if (lessonQueues[lesson].length === 0) lessonQueues[lesson] = [...allTopics];
      });

      const lessonPointers: Record<string, number> = {};
      Object.keys(lessonQueues).forEach(l => { lessonPointers[l] = 0; });

      const existingPlan = studyPlan?.masterPlan || [];
      const newPlan = [];

      for (let i = 0; i <= diffDays; i++) {
        const currentDt = addDays(start, i);
        const dateStr = format(currentDt, 'yyyy-MM-dd');
        const dayName = format(currentDt, 'EEEE', { locale: tr });
        const dayOfMonth = getDate(currentDt);
        
        // Protect past data
        const existingDay = existingPlan.find((d: any) => d.date === dateStr);
        if (existingDay && (isBefore(currentDt, today))) {
          newPlan.push(existingDay);
          continue;
        }

        const aytStartDate = parseISO('2026-12-01');
        const isAytActive = !isBefore(currentDt, aytStartDate);

        const dailyBlocks = [];
        
        // 10:00 - 12:00 Subject Block
        const activePool = otherLessons.filter(l => {
          if (l === 'AYT Matematik' || l === 'Edebiyat') return isAytActive;
          return true;
        });

        // Rotate through one subject per day to fit the 10-13 window
        const poolIndex = i % activePool.length;
        const lesson = activePool[poolIndex];
        const queue = lessonQueues[lesson];
        if (queue && queue.length > 0) {
          const topic = queue[lessonPointers[lesson] % queue.length];
          dailyBlocks.push(createBlockData(dateStr, lesson, topic, '10:00'));
          lessonPointers[lesson]++;
        }

        // 12:00 - 13:00 Daily Review (Dünün Analizi)
        dailyBlocks.push(createReviewBlockData(dateStr, 'DÜNÜN ANALİZİ VE TEKRARI', '12:00', 60, 'DAILY'));

        // Weekend/Monthly Additions (Optional markers, keeping them compact)
        if (dayName === 'Pazar') {
          dailyBlocks.push(createReviewBlockData(dateStr, 'HAFTALIK MASTER ANALİZ', '13:00', 30, 'WEEKLY'));
        }

        if (dayOfMonth === 30) {
          dailyBlocks.push(createReviewBlockData(dateStr, 'AYLIK KAZANIM TESCİLİ', '13:00', 30, 'MONTHLY'));
        }

        newPlan.push({ date: dateStr, day: dayName, blocks: dailyBlocks });
      }

      const planRef = doc(db, 'studyPlans', user.uid);
      await setDoc(planRef, {
        userId: user.uid,
        masterPlan: newPlan,
        startDate: startDate,
        targetExamDate: endDate,
        updatedAt: serverTimestamp()
      }, { merge: true });

      toast({ 
        title: 'Akademik Plan Güncellendi', 
        description: 'Çalışma saatleri 10:00 - 13:00 olarak saniyeler içinde mühürlendi.',
        className: "bg-primary text-white rounded-2xl shadow-2xl"
      });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Hata', description: 'Plan güncellenirken bir sorun oluştu.' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTaskAction = (date: string, blockId: string, action: string) => {
    if (!db || !user || !studyPlan) return;
    
    if (action === 'edit') {
      const block = studyPlan.masterPlan.find((d: any) => d.date === date)?.blocks.find((b: any) => b.id === blockId);
      if (block) {
        setEditingBlock({ ...block, date });
        setIsEditDialogOpen(true);
      }
      return;
    }

    if (action === 'postpone') {
      const currentDayIdx = studyPlan.masterPlan.findIndex((d: any) => d.date === date);
      const nextDay = studyPlan.masterPlan[currentDayIdx + 1];
      if (!nextDay) return;

      const currentDay = studyPlan.masterPlan[currentDayIdx];
      const blockToMove = currentDay.blocks.find((b: any) => b.id === blockId);

      const newPlan = studyPlan.masterPlan.map((day: any, idx: number) => {
        if (idx === currentDayIdx) {
          return { ...day, blocks: (day.blocks || []).filter((b: any) => b.id !== blockId) };
        }
        if (idx === currentDayIdx + 1) {
          return { ...day, blocks: [...(day.blocks || []), { ...blockToMove, status: 'planned' }] };
        }
        return day;
      });

      updateDoc(doc(db, 'studyPlans', user.uid), { masterPlan: newPlan, updatedAt: serverTimestamp() })
        .then(() => toast({ title: 'Görev Ötelendi', className: "bg-accent text-primary rounded-2xl" }));
      return;
    }

    const newPlan = studyPlan.masterPlan.map((day: any) => {
      if (day.date === date) {
        return {
          ...day,
          blocks: (day.blocks || []).map((b: any) => {
            if (b.id === blockId) {
              if (action === 'done') return { ...b, status: b.status === 'done' ? 'planned' : 'done' };
              if (action === 'repeat') return { ...b, status: 'repeat' };
              if (action === 'skip') return { ...b, status: 'skipped' };
              if (action === 'level') {
                const levels = ['KOLAY', 'ORTA', 'ZOR'];
                const nextIdx = (levels.indexOf(b.difficulty || 'ORTA') + 1) % levels.length;
                return { ...b, difficulty: levels[nextIdx] };
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

    updateDoc(doc(db, 'studyPlans', user.uid), { masterPlan: newPlan, updatedAt: serverTimestamp() });
  };

  const handleSaveEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!db || !user || !studyPlan || !editingBlock) return;

    const formData = new FormData(e.currentTarget);
    const updatedTopic = formData.get('topic') as string;
    const updatedDate = formData.get('date') as string;
    const updatedReminder = formData.get('reminder') as string;

    const newPlan = studyPlan.masterPlan.map((day: any) => {
      if (day.date === editingBlock.date && updatedDate !== editingBlock.date) {
        return { ...day, blocks: (day.blocks || []).filter((b: any) => b.id !== editingBlock.id) };
      }
      if (day.date === updatedDate || day.date === editingBlock.date) {
        const blocks = (day.blocks || []);
        if (day.date === editingBlock.date && updatedDate === editingBlock.date) {
          return {
            ...day,
            blocks: blocks.map((b: any) => b.id === editingBlock.id ? {
              ...b,
              topic: updatedTopic,
              difficulty: formData.get('difficulty'),
              reminder: updatedReminder,
              phase1: { ...b.phase1, time: formData.get('p1Time'), resources: { ...b.phase1.resources, youtube: formData.get('p1Youtube'), ogm: formData.get('p1Ogm'), pdf: formData.get('p1Pdf'), kamp: formData.get('p1Kamp') } },
              phase2: { ...b.phase2, time: formData.get('p2Time'), resources: { ...b.phase2.resources, youtube: formData.get('p2Youtube'), ogm: formData.get('p2Ogm'), pdf: formData.get('p2Pdf'), kamp: formData.get('p2Kamp') } }
            } : b)
          };
        }
        if (day.date === updatedDate) {
          return {
            ...day,
            blocks: [...blocks, {
              ...editingBlock,
              topic: updatedTopic,
              difficulty: formData.get('difficulty'),
              reminder: updatedReminder,
              phase1: { ...editingBlock.phase1, time: formData.get('p1Time'), resources: { ...editingBlock.phase1.resources, youtube: formData.get('p1Youtube'), ogm: formData.get('p1Ogm'), pdf: formData.get('p1Pdf'), kamp: formData.get('p1Kamp') } },
              phase2: { ...editingBlock.phase2, time: formData.get('p2Time'), resources: { ...editingBlock.phase2.resources, youtube: formData.get('p2Youtube'), ogm: formData.get('p2Ogm'), pdf: formData.get('p2Pdf'), kamp: formData.get('p2Kamp') } }
            }]
          };
        }
      }
      return day;
    });

    try {
      await updateDoc(doc(db, 'studyPlans', user.uid), { masterPlan: newPlan, updatedAt: serverTimestamp() });
      toast({ title: 'Güncellendi' });
      setIsEditDialogOpen(false);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Hata' });
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
           <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-6 italic">BAŞLANGIÇ TARİHİ</Label>
              <div className="relative group">
                 <CalendarDays className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-primary/20 group-focus-within:text-accent transition-colors" />
                 <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="h-20 rounded-[2rem] bg-slate-50 border-none shadow-inner font-black text-2xl pl-16 pr-8" />
              </div>
           </div>
           <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-6 italic">HEDEF SINAV TARİHİ</Label>
              <div className="relative group">
                 <Zap className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-primary/20 group-focus-within:text-accent transition-colors" />
                 <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="h-20 rounded-[2rem] bg-slate-50 border-none shadow-inner font-black text-2xl pl-16 pr-8" />
              </div>
              <p className="text-[9px] font-black text-accent uppercase tracking-widest mt-2 ml-6 italic">AYT DERSLERİ 1 ARALIK'TA OTOMATİK BAŞLAR</p>
           </div>
           <div className="space-y-3 flex items-end">
              <Button 
                onClick={generateFasikulPlan}
                disabled={isGenerating}
                className="w-full h-20 rounded-[2rem] bg-primary hover:bg-accent transition-all duration-500 font-black text-xs uppercase tracking-[0.2em] gap-5 shadow-2xl shadow-primary/30 text-white"
              >
                {isGenerating ? <Loader2 className="h-7 w-7 animate-spin" /> : <Sparkles className="h-7 w-7 text-accent" />}
                FASİKÜL MOTORUNU ÇALIŞTIR
              </Button>
           </div>
        </div>
        <div className="flex items-center gap-3 p-6 bg-blue-50 rounded-3xl border border-blue-100">
           <AlertTriangle className="h-5 w-5 text-blue-500" />
           <p className="text-xs font-bold text-blue-700 italic">Zamanlama saniyeler içinde 10:00 - 13:00 penceresine saniyeler içinde sığdırıldı. Geçmiş verileriniz saniyeler içinde korunmaktadır.</p>
        </div>
      </Card>

      <div className="space-y-24">
        {(studyPlan?.masterPlan || []).map((day: any) => {
          const currentDt = parseISO(day.date);
          const today = startOfToday();
          const isPast = isBefore(currentDt, today);
          const isToday = format(currentDt, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
          
          return (
            <div key={day.date} className={cn("space-y-12", isPast && "opacity-60")}>
               <div className="flex items-center gap-6 px-6">
                  <h3 className="text-4xl font-black italic text-primary uppercase tracking-tighter">{format(currentDt, 'd MMMM yyyy', { locale: tr })} — {day.day.toUpperCase()}</h3>
                  {isToday && <Badge className="bg-accent text-primary uppercase text-[10px] font-black py-1 px-4 rounded-full animate-pulse shadow-lg">BUGÜN</Badge>}
                  <div className="h-px flex-1 bg-slate-200" />
               </div>
               <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
                  {day.blocks?.map((block: any) => (
                    <Card 
                      key={block.id} 
                      className={cn(
                        "p-10 rounded-[5rem] border-none transition-all hover:scale-[1.02] shadow-[0_60px_120px_-30px_rgba(0,0,0,0.15)] group relative overflow-hidden bg-white border-t-[14px]",
                        block.status === 'done' && "opacity-80"
                      )}
                      style={{ borderTopColor: LESSON_COLORS[block.lesson] || '#334155' }}
                    >
                       <div className="space-y-12 relative z-10">
                          <div className="flex justify-between items-start">
                             <div className="space-y-1">
                                <h4 className="text-[3.2rem] font-black italic leading-[0.8] tracking-tighter uppercase text-primary text-shadow-deep line-clamp-2">{block.topic}</h4>
                                <p className="text-[11px] font-bold text-muted-foreground/40 uppercase tracking-[0.3em] italic">{block.lesson === 'Genel' ? 'PERİYODİK ANALİZ TERMİNALİ' : 'GÜNLÜK FASİKÜL MODÜLÜ'}</p>
                             </div>
                             <div className="bg-slate-50 px-6 py-2.5 rounded-full text-[11px] font-black flex items-center gap-3 border border-slate-100">
                                {block.status === 'done' ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : <Clock className="h-5 w-5 text-primary" />}
                                {block.status === 'done' ? 'TAMAMLANDI' : 'BEKLİYOR'}
                             </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                             <div className="p-10 rounded-[3.5rem] bg-slate-50/50 border border-slate-100 space-y-6 relative group/p1">
                                <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                                   <span className="text-[10px] font-black text-primary/40 uppercase tracking-[0.2em]">1. AŞAMA</span>
                                   <span className="text-lg font-black text-primary italic">{block.phase1.time}</span>
                                </div>
                                <h5 className="font-black text-2xl italic text-primary leading-tight uppercase group-hover/p1:text-accent transition-colors">{block.phase1.type}</h5>
                                <div className="flex gap-6 pt-4">
                                   {block.phase1.resources?.youtube && <a href={block.phase1.resources.youtube} target="_blank" className="hover:scale-125 transition-transform text-rose-500 opacity-60 hover:opacity-100"><Youtube className="h-7 w-7" /></a>}
                                   {block.phase1.resources?.pdf && <a href={block.phase1.resources.pdf} target="_blank" className="hover:scale-125 transition-transform text-blue-600 opacity-60 hover:opacity-100"><FileText className="h-7 w-7" /></a>}
                                   {block.phase1.resources?.kamp && <a href={block.phase1.resources.kamp} target="_blank" className="hover:scale-125 transition-transform text-orange-500 opacity-60 hover:opacity-100"><Zap className="h-7 w-7" /></a>}
                                </div>
                             </div>

                             <div className="p-10 rounded-[3.5rem] bg-orange-50/50 border border-orange-100 space-y-6 relative group/p2">
                                <div className="flex justify-between items-center border-b border-orange-200 pb-4">
                                   <span className="text-[10px] font-black text-accent uppercase tracking-[0.2em]">2. AŞAMA</span>
                                   <span className="text-lg font-black text-primary italic">{block.phase2.time}</span>
                                </div>
                                <h5 className="font-black text-2xl italic text-primary leading-tight uppercase group-hover/p2:text-accent transition-colors">{block.phase2.type}</h5>
                                <div className="flex gap-6 pt-4">
                                   {block.phase2.resources?.youtube && <a href={block.phase2.resources.youtube} target="_blank" className="hover:scale-125 transition-transform text-rose-500 opacity-60 hover:opacity-100"><Youtube className="h-7 w-7" /></a>}
                                   {block.phase2.resources?.ogm && <a href={block.phase2.resources.ogm} target="_blank" className="hover:scale-125 transition-transform text-emerald-600 opacity-60 hover:opacity-100"><Globe className="h-7 w-7" /></a>}
                                </div>
                             </div>
                          </div>

                          {block.reminder && (
                            <div className="p-6 bg-accent/5 border border-accent/10 rounded-[2.5rem] flex items-center gap-4">
                               <BellRing className="h-5 w-5 text-accent" />
                               <p className="text-sm font-black text-primary italic leading-tight">{block.reminder}</p>
                            </div>
                          )}

                          <div className="flex justify-center gap-6 pt-10 border-t border-slate-50 opacity-0 group-hover:opacity-100 transition-all">
                             <Button onClick={() => handleTaskAction(day.date, block.id, 'done')} size="icon" className={cn("h-16 w-16 rounded-full", block.status === 'done' ? "bg-slate-100" : "bg-emerald-500 text-white")}><CheckCircle2 className="h-7 w-7" /></Button>
                             <Button onClick={() => handleTaskAction(day.date, block.id, 'repeat')} size="icon" variant="outline" className="h-16 w-16 rounded-full hover:border-orange-500 text-orange-500"><RotateCcw className="h-7 w-7" /></Button>
                             <Button onClick={() => handleTaskAction(day.date, block.id, 'postpone')} size="icon" variant="outline" className="h-16 w-16 rounded-full hover:border-accent text-accent"><FastForward className="h-7 w-7" /></Button>
                             <Button onClick={() => handleTaskAction(day.date, block.id, 'edit')} size="icon" variant="outline" className="h-16 w-16 rounded-full hover:border-primary text-primary"><Edit3 className="h-7 w-7" /></Button>
                             <Button onClick={() => handleTaskAction(day.date, block.id, 'delete')} size="icon" variant="outline" className="h-16 w-16 rounded-full hover:border-rose-500 text-rose-500"><Trash2 className="h-7 w-7" /></Button>
                          </div>
                       </div>
                    </Card>
                  ))}
               </div>
            </div>
          );
        })}
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="rounded-[4rem] border-none shadow-2xl p-12 bg-white max-w-2xl">
           <DialogHeader className="space-y-4">
              <DialogTitle className="text-4xl font-black italic tracking-tighter text-primary uppercase">BLOK EDİTÖRÜ</DialogTitle>
              <DialogDescription className="font-medium italic">Zamanlama penceresini buradan da revize edebilirsiniz.</DialogDescription>
           </DialogHeader>
           {editingBlock && (
             <form onSubmit={handleSaveEdit} className="space-y-8 pt-8">
                <div className="grid grid-cols-2 gap-8">
                   <div className="space-y-3"><Label>Konu</Label><Input name="topic" required defaultValue={editingBlock.topic} className="h-16 rounded-2xl bg-slate-50 border-none shadow-inner font-bold" /></div>
                   <div className="space-y-3"><Label>Tarih</Label><Input name="date" type="date" required defaultValue={editingBlock.date} className="h-16 rounded-2xl bg-slate-50 border-none shadow-inner font-bold" /></div>
                </div>
                <div className="space-y-3"><Label>Hatırlatıcı</Label><Input name="reminder" defaultValue={editingBlock.reminder} className="h-16 rounded-2xl bg-slate-50 border-none shadow-inner font-bold" /></div>
                <div className="grid grid-cols-2 gap-10">
                   <div className="p-8 rounded-[2.5rem] bg-slate-50 space-y-4">
                      <Label>1. Aşama (Konu)</Label>
                      <Input name="p1Time" required defaultValue={editingBlock.phase1.time} className="h-12 rounded-xl" />
                   </div>
                   <div className="p-8 rounded-[2.5rem] bg-orange-50 space-y-4">
                      <Label>2. Aşama (Test)</Label>
                      <Input name="p2Time" required defaultValue={editingBlock.phase2.time} className="h-12 rounded-xl" />
                   </div>
                </div>
                <Button type="submit" className="w-full h-20 rounded-[2rem] bg-primary text-white font-black uppercase tracking-widest gap-4 shadow-2xl"><Save className="h-6 w-6 text-accent" /> TERMİNALE KAYDET</Button>
             </form>
           )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
