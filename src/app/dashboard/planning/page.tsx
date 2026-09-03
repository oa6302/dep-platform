
'use client';

import { useState, useMemo, useEffect } from 'react';
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
  BellRing, Link2, ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { YKS_TM_TOPICS } from '@/lib/curriculum-data';
import { EXAM_CONFIGS } from '@/lib/exam-configs';
import { doc, updateDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { format, addDays, isBefore, parseISO, startOfToday, getDate, subDays, isSameDay } from 'date-fns';
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
import { ScrollArea } from '@/components/ui/scroll-area';

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

  // Otomatik Öteleme (Postpone Logic)
  useEffect(() => {
    if (!studyPlan?.masterPlan || !user || !db) return;

    const todayStr = format(startOfToday(), 'yyyy-MM-dd');
    const yesterdayStr = format(subDays(startOfToday(), 1), 'yyyy-MM-dd');
    
    let hasDelayed = false;
    const newPlan = studyPlan.masterPlan.map((day: any) => {
      // Eğer dünkü bloklar hala 'planned' ise onları bugüne aktaracağız
      if (day.date === yesterdayStr) {
        const uncompleted = day.blocks.filter((b: any) => b.status === 'planned');
        if (uncompleted.length > 0) {
          hasDelayed = true;
          return {
            ...day,
            blocks: day.blocks.filter((b: any) => b.status === 'done')
          };
        }
      }
      
      if (day.date === todayStr && hasDelayed) {
        const delayedBlocks = studyPlan.masterPlan.find((d: any) => d.date === yesterdayStr)
          ?.blocks.filter((b: any) => b.status === 'planned')
          .map((b: any) => ({ ...b, status: 'delayed', reminder: 'DÜNDEN AKTARILDI: ' + (b.reminder || '') }));
        
        return {
          ...day,
          blocks: [...(delayedBlocks || []), ...day.blocks]
        };
      }
      return day;
    });

    if (hasDelayed) {
      updateDoc(doc(db, 'studyPlans', user.uid), { masterPlan: newPlan, updatedAt: serverTimestamp() });
      toast({ 
        title: 'AI PLAN DENGELENDİ', 
        description: 'Dünden kalan görevleriniz saniyeler içinde bugüne aktarıldı.',
        className: "bg-accent text-primary rounded-2xl"
      });
    }
  }, [studyPlan?.masterPlan, user, db]);

  const createBlockData = (dateStr: string, lesson: string, topic: string, customTimes?: any) => {
    const topicEscaped = encodeURIComponent(topic);
    return {
      id: `block_${dateStr}_${lesson.replace(/\s+/g, '_')}_${Math.random().toString(36).substr(2, 5)}`,
      lesson,
      topic,
      status: 'planned',
      difficulty: 'ORTA',
      reminder: lesson === 'Paragraf' ? 'Her gün 20 paragraf çözmeden güne başlama.' : '',
      phase1: {
        type: 'KONU ÇALIŞMA',
        time: customTimes?.p1 || '10:00',
        duration: 60,
        resources: {
          youtube: `https://www.youtube.com/results?search_query=${encodeURIComponent(lesson + ' ' + topic + ' konu anlatımı')}`,
          ogm: `https://ogmmateryal.eba.gov.tr/konu-anlatimlari-video?video=1`,
          pdf: `https://ogmmateryal.eba.gov.tr/panel/FasikulGoster.aspx?alan=${lesson}`,
          kamp: ''
        }
      },
      phase2: {
        type: 'TEST ÇÖZME',
        time: customTimes?.p2 || '11:00',
        duration: 60,
        resources: {
          youtube: `https://www.youtube.com/results?search_query=${encodeURIComponent(lesson + ' ' + topic + ' soru çözümü')}`,
          ogm: `https://ogmmateryal.eba.gov.tr/soru-bankasi/${lesson}`,
          pdf: '',
          kamp: ''
        }
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

      const currentExam = userData?.targetExam || 'YKS_EA';
      const examConfig = EXAM_CONFIGS[currentExam];
      const subjectsPool = examConfig?.lessons || ['TYT Matematik', 'Edebiyat', 'Tarih', 'Coğrafya'];

      const completed = userData?.completedTopics || {};
      const lessonQueues: Record<string, string[]> = {};
      subjectsPool.forEach(lesson => {
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
        const isPast = isBefore(currentDt, today);

        const existingDay = existingPlan.find((d: any) => d.date === dateStr);
        if (existingDay && (isPast || existingDay.blocks.some((b: any) => b.status === 'done'))) {
          newPlan.push(existingDay);
          continue;
        }

        const aytActive = !isBefore(currentDt, parseISO('2026-12-01'));
        const activeLessons = subjectsPool.filter(l => {
          if ((l === 'AYT Matematik' || l === 'Edebiyat') && currentExam.startsWith('YKS')) return aytActive;
          return true;
        });

        const dailyBlocks = [];
        
        // 1. DERS (10:00 - 12:00)
        const lesson1 = activeLessons[i % activeLessons.length];
        const topics1 = lessonQueues[lesson1] || [];
        const topic1 = topics1[lessonPointers[lesson1] % (topics1.length || 1)] || 'Genel Tekrar';
        dailyBlocks.push(createBlockData(dateStr, lesson1, topic1));
        lessonPointers[lesson1]++;

        // 2. DERS (Farklı branş rotasyonu)
        const lesson2 = activeLessons[(i + 1) % activeLessons.length];
        const topics2 = lessonQueues[lesson2] || [];
        const topic2 = topics2[lessonPointers[lesson2] % (topics2.length || 1)] || 'Kazanım Analizi';
        const block2 = createBlockData(dateStr, lesson2, topic2, { p1: '11:00', p2: '11:30' });
        dailyBlocks.push(block2);
        lessonPointers[lesson2]++;

        // 3. PARAGRAF (Günlük Sabit 11:30)
        const paragrafBlock = createBlockData(dateStr, 'Paragraf', '20 SORU KONDİSYON', { p1: '11:45', p2: '12:00' });
        paragrafBlock.reminder = 'Hız ve odaklanma için 20 soruyu saniyeler içinde bitir.';
        dailyBlocks.push(paragrafBlock);

        // 4. KART: DÜNKÜ ÇALIŞMALARIN TEKRARI (12:00 - 13:00)
        dailyBlocks.push({
          id: `review_${dateStr}`,
          lesson: 'Genel',
          topic: 'DÜNKÜ ÇALIŞMALARIN TEKRARI',
          status: 'planned',
          difficulty: 'ORTA',
          reminder: 'Yanlış yaptığın soruların analizlerini terminale işle.',
          phase1: {
            type: 'DÜNÜN ANALİZİ',
            time: '12:00',
            duration: 30,
            resources: { youtube: '', ogm: '', pdf: '', kamp: '' }
          },
          phase2: {
            type: 'KAZANIM TESCİLİ',
            time: '12:30',
            duration: 30,
            resources: { youtube: '', ogm: '', pdf: '', kamp: '' }
          }
        });

        newPlan.push({ date: dateStr, day: dayName, blocks: dailyBlocks });
      }

      await setDoc(doc(db, 'studyPlans', user.uid), {
        userId: user.uid,
        masterPlan: newPlan,
        startDate,
        targetExamDate: endDate,
        updatedAt: serverTimestamp()
      }, { merge: true });

      toast({ title: 'Akademik Plan Senkronize Edildi', className: "bg-primary text-white rounded-2xl" });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Hata', description: 'Plan güncellenemedi.' });
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

    const newPlan = studyPlan.masterPlan.map((day: any) => {
      if (day.date === date) {
        return {
          ...day,
          blocks: day.blocks.map((b: any) => {
            if (b.id === blockId) {
              if (action === 'done') return { ...b, status: b.status === 'done' ? 'planned' : 'done' };
              if (action === 'postpone') {
                toast({ title: 'ERTELENDİ', description: 'Görev bir sonraki güne aktarıldı.', className: "bg-accent text-primary" });
                return null; 
              }
              if (action === 'delete') return null;
              return b;
            }
            return b;
          }).filter(Boolean)
        };
      }
      
      // Postpone edildiyse bir sonraki güne ekle
      if (action === 'postpone' && date !== day.date && isBefore(parseISO(date), parseISO(day.date))) {
         const originalBlock = studyPlan.masterPlan.find((d: any) => d.date === date)?.blocks.find((b: any) => b.id === blockId);
         if (originalBlock && isSameDay(addDays(parseISO(date), 1), parseISO(day.date))) {
            return {
              ...day,
              blocks: [...day.blocks, { ...originalBlock, status: 'delayed', reminder: 'DÜNDEN AKTARILDI: ' + (originalBlock.reminder || '') }]
            };
         }
      }
      
      return day;
    });

    updateDoc(doc(db, 'studyPlans', user.uid), { masterPlan: newPlan, updatedAt: serverTimestamp() });
  };

  const handleSaveEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!db || !user || !studyPlan || !editingBlock) return;

    const formData = new FormData(e.currentTarget);
    const newPlan = studyPlan.masterPlan.map((day: any) => {
      if (day.date === editingBlock.date) {
        return {
          ...day,
          blocks: day.blocks.map((b: any) => b.id === editingBlock.id ? {
            ...b,
            topic: formData.get('topic'),
            reminder: formData.get('reminder'),
            phase1: { ...b.phase1, time: formData.get('p1Time'), resources: { ...b.phase1.resources, youtube: formData.get('p1Youtube'), pdf: formData.get('p1Pdf'), kamp: formData.get('p1Kamp') } },
            phase2: { ...b.phase2, time: formData.get('p2Time'), resources: { ...b.phase2.resources, youtube: formData.get('p2Youtube'), pdf: formData.get('p2Pdf'), kamp: formData.get('p2Kamp') } }
          } : b)
        };
      }
      return day;
    });

    await updateDoc(doc(db, 'studyPlans', user.uid), { masterPlan: newPlan, updatedAt: serverTimestamp() });
    setIsEditDialogOpen(false);
    toast({ title: 'BAŞARIYLA KAYDEDİLDİ', className: "bg-primary text-white rounded-2xl" });
  };

  return (
    <div className="p-4 md:p-14 space-y-12 max-w-[1800px] mx-auto w-full animate-in fade-in duration-1000 bg-[#F8FAFC]">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
             <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-12 w-12 rounded-xl bg-white shadow-sm border border-slate-100 hover:bg-primary hover:text-white transition-all"><ArrowLeft className="h-5 w-5" /></Button>
             <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard')} className="h-12 w-12 rounded-xl bg-white shadow-sm border border-slate-100 hover:bg-primary hover:text-white transition-all"><Home className="h-5 w-5" /></Button>
          </div>
          <div className="space-y-2">
             <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-accent text-primary font-black text-[10px] uppercase tracking-widest shadow-xl shadow-accent/20 italic border border-accent/20">
                <Calendar className="h-3.5 w-3.5" /> MASTER ACADEMIC ENGINE v4.8
             </div>
             <h2 className="text-4xl md:text-6xl font-black tracking-tighter italic text-primary uppercase leading-none text-shadow-premium">
                Akademik <br /><span className="text-accent text-shadow-accent">Terminal</span>
             </h2>
          </div>
        </div>
      </header>

      <Card className="rounded-[4rem] border-none shadow-[0_50px_100px_-20px_rgba(15,23,42,0.1)] bg-white p-8 md:p-12 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-6 italic">BAŞLANGIÇ</Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="h-20 rounded-[2rem] bg-slate-50 border-none shadow-inner font-black text-2xl pl-8" />
           </div>
           <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-6 italic">HEDEF SINAV</Label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="h-20 rounded-[2rem] bg-slate-50 border-none shadow-inner font-black text-2xl pl-8" />
           </div>
           <div className="flex items-end">
              <Button onClick={generateFasikulPlan} disabled={isGenerating} className="w-full h-20 rounded-[2rem] bg-primary hover:bg-accent transition-all font-black text-xs uppercase tracking-widest gap-4 shadow-2xl text-white">
                {isGenerating ? <Loader2 className="h-6 w-6 animate-spin" /> : <Sparkles className="h-6 w-6 text-accent" />} FASİKÜL MOTORUNU ÇALIŞTIR
              </Button>
           </div>
        </div>
        <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100 flex items-center gap-4">
           <AlertTriangle className="h-6 w-6 text-blue-500 shrink-0" />
           <p className="text-sm font-bold text-blue-800 italic">Planlama saniyeler içinde 10:00 - 13:00 arasını hedefler. Tamamlanmayan görevler saniyeler içinde bir sonraki güne otomatik aktarılır.</p>
        </div>
      </Card>

      <div className="space-y-24">
        {(studyPlan?.masterPlan || []).map((day: any) => {
          const currentDt = parseISO(day.date);
          const isToday = format(currentDt, 'yyyy-MM-dd') === format(startOfToday(), 'yyyy-MM-dd');
          
          return (
            <div key={day.date} className="space-y-12 animate-in slide-in-from-bottom-8 duration-700">
               <div className="flex items-center gap-8 px-6">
                  <h3 className="text-3xl md:text-5xl font-black italic text-primary uppercase tracking-tighter">{format(currentDt, 'd MMMM yyyy', { locale: tr })}</h3>
                  {isToday && <Badge className="bg-accent text-primary uppercase text-[12px] font-black py-2 px-6 rounded-full animate-pulse shadow-xl">BUGÜN</Badge>}
                  <div className="h-px flex-1 bg-slate-200 hidden md:block" />
               </div>
               <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
                  {day.blocks?.map((block: any) => (
                    <Card key={block.id} className={cn("p-8 md:p-12 rounded-[5.5rem] border-none shadow-[0_80px_160px_-40px_rgba(0,0,0,0.15)] group relative overflow-hidden bg-white hover:scale-[1.02] transition-all duration-700", block.status === 'done' && "opacity-80")}>
                       <div className="space-y-10 relative z-10">
                          <div className="flex justify-between items-start">
                             <div className="space-y-2">
                                <h4 className="text-3xl md:text-[3.5rem] font-black italic leading-[0.8] tracking-tighter uppercase text-primary text-shadow-deep break-words max-w-[450px]">{block.topic}</h4>
                                <p className="text-[12px] font-bold text-muted-foreground/30 uppercase tracking-[0.4em] italic">#{block.lesson.substring(0, 3)} MODÜLÜ</p>
                             </div>
                             <Badge className={cn("px-8 py-3 rounded-full text-[12px] font-black shadow-2xl", block.status === 'done' ? "bg-emerald-500 text-white" : "bg-[#FF4D6D] text-white")}>
                                {block.status === 'done' ? 'TAMAMLANDI' : 'BEKLİYOR'}
                             </Badge>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                             <div className="p-8 md:p-10 rounded-[4rem] bg-slate-50/50 border border-slate-100 space-y-6">
                                <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                                   <span className="text-[11px] font-black text-primary/30 uppercase tracking-[0.3em]">1. AŞAMA</span>
                                   <span className="text-xl font-black text-primary">{block.phase1?.time}</span>
                                </div>
                                <h5 className="font-black text-xl md:text-[1.8rem] italic text-primary leading-tight uppercase">{block.phase1?.type}</h5>
                                <div className="flex gap-6">
                                   {block.phase1?.resources?.youtube && <a href={block.phase1.resources.youtube} target="_blank" className="text-rose-500 hover:scale-125 transition-all"><Youtube /></a>}
                                   {block.phase1?.resources?.pdf && <a href={block.phase1.resources.pdf} target="_blank" className="text-blue-500 hover:scale-125 transition-all"><FileText /></a>}
                                </div>
                             </div>
                             <div className="p-8 md:p-10 rounded-[4rem] bg-slate-50/50 border border-slate-100 space-y-6">
                                <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                                   <span className="text-[11px] font-black text-primary/30 uppercase tracking-[0.3em]">2. AŞAMA</span>
                                   <span className="text-xl font-black text-primary">{block.phase2?.time}</span>
                                </div>
                                <h5 className="font-black text-xl md:text-[1.8rem] italic text-primary leading-tight uppercase">{block.phase2?.type}</h5>
                                <div className="flex gap-6">
                                   {block.phase2?.resources?.youtube && <a href={block.phase2.resources.youtube} target="_blank" className="text-rose-500 hover:scale-125 transition-all"><Youtube /></a>}
                                   {block.phase2?.resources?.ogm && <a href={block.phase2.resources.ogm} target="_blank" className="text-emerald-500 hover:scale-125 transition-all"><Globe /></a>}
                                </div>
                             </div>
                          </div>

                          {block.reminder && (
                            <div className="p-8 bg-accent/5 border border-accent/10 rounded-[3rem] flex items-center gap-6">
                               <BellRing className="h-6 w-6 text-accent" />
                               <p className="text-lg font-black text-primary italic leading-tight">{block.reminder}</p>
                            </div>
                          )}

                          <div className="flex justify-center gap-6 pt-10 border-t border-slate-50">
                             <Button onClick={() => handleTaskAction(day.date, block.id, 'done')} size="icon" className={cn("h-16 w-16 rounded-full shadow-xl transition-all hover:scale-110", block.status === 'done' ? "bg-slate-100 text-slate-400" : "bg-emerald-500 text-white")}><CheckCircle2 /></Button>
                             <Button onClick={() => handleTaskAction(day.date, block.id, 'postpone')} size="icon" variant="outline" className="h-16 w-16 rounded-full bg-white border-2 border-slate-100 text-primary hover:bg-slate-50 transition-all hover:scale-110 shadow-xl"><FastForward /></Button>
                             <Button onClick={() => handleTaskAction(day.date, block.id, 'edit')} size="icon" variant="outline" className="h-16 w-16 rounded-full bg-white border-2 border-slate-100 text-primary hover:bg-slate-50 transition-all hover:scale-110 shadow-xl"><Edit3 /></Button>
                             <Button onClick={() => handleTaskAction(day.date, block.id, 'delete')} size="icon" variant="outline" className="h-16 w-16 rounded-full bg-white border-2 border-slate-100 text-rose-500 hover:bg-rose-50 transition-all hover:scale-110 shadow-xl"><Trash2 /></Button>
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
              <DialogDescription className="font-medium italic">Kaynakları ve zamanlamayı saniyeler içinde mühürleyin.</DialogDescription>
           </DialogHeader>
           {editingBlock && (
             <form onSubmit={handleSaveEdit} className="space-y-8 pt-8">
                <div className="space-y-2">
                   <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4 italic">KONU ADI</Label>
                   <Input name="topic" required defaultValue={editingBlock.topic} className="h-16 rounded-2xl bg-slate-50 border-none font-bold" />
                </div>
                <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-2"><Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4 italic">YOUTUBE LİNK</Label><Input name="p1Youtube" defaultValue={editingBlock.phase1.resources.youtube} className="h-14 rounded-xl" /></div>
                   <div className="space-y-2"><Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4 italic">PDF LİNK</Label><Input name="p1Pdf" defaultValue={editingBlock.phase1.resources.pdf} className="h-14 rounded-xl" /></div>
                </div>
                <Button type="submit" className="w-full h-20 rounded-[2rem] bg-primary hover:bg-accent transition-all font-black text-xs uppercase tracking-widest shadow-2xl text-white gap-4">
                   <Save className="h-6 w-6 text-accent" /> TERMİNALE KAYDET
                </Button>
             </form>
           )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
