'use client';

import { useState, useMemo, useEffect } from 'react';
import { useUser, useDoc, useFirestore } from '@/firebase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Calendar, Clock, Zap, Loader2, Sparkles, 
  CheckCircle2, Trash2, ArrowLeft, ArrowRight,
  Home, RotateCcw, FastForward, Edit3,
  Youtube, Globe, Save, FileText, AlertTriangle,
  BellRing, ChevronRight, BookOpen, Search, 
  Plus, Check, X, GraduationCap, Target, ListChecks,
  ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { YKS_TM_TOPICS } from '@/lib/curriculum-data';
import { EXAM_CONFIGS } from '@/lib/exam-configs';
import { doc, updateDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { format, addDays, isBefore, parseISO, startOfToday, subDays, isAfter } from 'date-fns';
import { tr } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

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
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  // Otonom Öteleme Mantığı
  useEffect(() => {
    if (!studyPlan?.masterPlan || !user || !db) return;

    const todayStr = format(startOfToday(), 'yyyy-MM-dd');
    const yesterdayStr = format(subDays(startOfToday(), 1), 'yyyy-MM-dd');
    
    let hasDelayed = false;
    const currentPlan = JSON.parse(JSON.stringify(studyPlan.masterPlan));
    
    const yesterdayIdx = currentPlan.findIndex((d: any) => d.date === yesterdayStr);
    const todayIdx = currentPlan.findIndex((d: any) => d.date === todayStr);

    if (yesterdayIdx !== -1 && todayIdx !== -1) {
      const uncompleted = currentPlan[yesterdayIdx].blocks.filter((b: any) => b.status === 'planned' && !b.isReview && !b.isParagraph);
      if (uncompleted.length > 0) {
        hasDelayed = true;
        currentPlan[yesterdayIdx].blocks = currentPlan[yesterdayIdx].blocks.filter((b: any) => b.status === 'done' || b.isReview || b.isParagraph);
        
        currentPlan[todayIdx].blocks = [
          ...uncompleted.map((b: any) => ({ 
            ...b, 
            status: 'delayed', 
            reminder: 'DÜNDEN AKTARILDI: ' + (b.reminder || '') 
          })),
          ...currentPlan[todayIdx].blocks
        ].slice(0, 6);
      }
    }

    if (hasDelayed) {
      updateDoc(doc(db, 'studyPlans', user.uid), { 
        masterPlan: currentPlan, 
        updatedAt: serverTimestamp() 
      });
      toast({ title: 'AI PLAN DENGELENDİ', className: "bg-accent text-primary rounded-2xl" });
    }
  }, [studyPlan?.masterPlan, user, db]);

  const generateAutoLinks = (topic: string, lesson: string) => {
    const encodedTopic = encodeURIComponent(topic);
    const encodedLesson = encodeURIComponent(lesson);
    return {
      youtubeUrl: `https://www.youtube.com/results?search_query=${encodedTopic}+${encodedLesson}+konu+anlatımı`,
      pdfUrl: `https://ogmmateryal.eba.gov.tr/panel/FasikulGoster.aspx?arama=${encodedTopic}`,
      mebiUrl: `https://mebi.eba.gov.tr/arama?q=${encodedTopic}`
    };
  };

  const generateFasikulPlan = async () => {
    if (!db || !user || !endDate || !startDate) return;
    setIsGenerating(true);

    try {
      const start = parseISO(startDate);
      const end = parseISO(endDate);
      const diffDays = Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

      const currentExam = userData?.targetExam || 'YKS_EA';
      const examConfig = EXAM_CONFIGS[currentExam];
      const aytStartDate = parseISO('2026-12-01');

      const getLessonPool = (date: Date) => {
        let pool = [...(examConfig?.lessons || ['TYT Matematik', 'TYT Türkçe'])];
        // 1 ARALIK AYT Otonom Vites
        if (isAfter(date, aytStartDate) || date.getTime() === aytStartDate.getTime()) {
           if (currentExam === 'YKS_EA' || currentExam === 'YKS_SAY') {
              const aytMath = 'AYT Matematik';
              const aytSpec = currentExam === 'YKS_EA' ? 'Edebiyat' : 'Fizik';
              if (!pool.includes(aytMath)) pool.push(aytMath);
              if (!pool.includes(aytSpec)) pool.push(aytSpec);
           }
        }
        return pool;
      };

      const newPlan = [];
      const lessonPointers: Record<string, number> = {};

      for (let i = 0; i <= diffDays; i++) {
        const currentDt = addDays(start, i);
        const dateStr = format(currentDt, 'yyyy-MM-dd');
        const dayName = format(currentDt, 'EEEE', { locale: tr });
        
        const pool = getLessonPool(currentDt);
        const dailyBlocks = [];

        // 1 & 2: Ana Konular
        for (let j = 0; j < 2; j++) {
          const lesson = pool[(i * 2 + j) % pool.length];
          const topics = YKS_TM_TOPICS[lesson] || ['Genel Tekrar'];
          if (!lessonPointers[lesson]) lessonPointers[lesson] = 0;
          const topic = topics[lessonPointers[lesson] % topics.length];
          
          const links = generateAutoLinks(topic, lesson);

          dailyBlocks.push({
            id: `block_${dateStr}_${j}`,
            lesson,
            topic,
            status: 'planned',
            phase1: { type: 'KONU ÇALIŞMA', time: j === 0 ? '10:00' : '11:00' },
            phase2: { type: 'TEST ÇÖZME', time: j === 0 ? '10:30' : '11:30' },
            targetQuestions: 40,
            solvedQuestions: 0,
            ...links,
            isKonuDone: false,
            isTestDone: false
          });
          lessonPointers[lesson]++;
        }

        // 3: 20 Paragraf (HERGÜN)
        dailyBlocks.push({
          id: `para_${dateStr}`,
          lesson: 'TÜRKÇE',
          topic: '20 PARAGRAF SORU ÇÖZÜMÜ',
          status: 'planned',
          phase1: { type: 'GÜNLÜK KAMP', time: '11:30' },
          phase2: { type: 'ANALİZ', time: '12:00' },
          targetQuestions: 20,
          solvedQuestions: 0,
          youtubeUrl: 'https://www.youtube.com/results?search_query=paragraf+çözüm+teknikleri',
          pdfUrl: 'https://ogmmateryal.eba.gov.tr/panel/FasikulGoster.aspx?arama=paragraf',
          isParagraph: true,
          isTestDone: false
        });

        // 4: Dünün Tekrarı (HERGÜN)
        dailyBlocks.push({
          id: `review_${dateStr}`,
          lesson: 'GENEL',
          topic: 'DÜNÜN ANALİZİ & TEKRARI',
          status: 'planned',
          phase1: { type: 'TESCİL', time: '12:30' },
          phase2: { type: 'STRATEJİK', time: '13:00' },
          isReview: true
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

  const handleAutoFind = (type: 'youtube' | 'pdf' | 'mebi') => {
    if (!editingBlock?.topic) return;
    const links = generateAutoLinks(editingBlock.topic, editingBlock.lesson);
    setEditingBlock({ ...editingBlock, [`${type}Url`]: links[type === 'youtube' ? 'youtubeUrl' : type === 'pdf' ? 'pdfUrl' : 'mebiUrl'] });
    toast({ title: 'KAYNAK BULUNDU', className: "bg-emerald-500 text-white rounded-xl" });
  };

  const handleSaveEdit = async (saveAndNext = false) => {
    if (!db || !user || !studyPlan || !editingBlock) return;

    const newPlan = studyPlan.masterPlan.map((day: any) => {
      if (day.date === editingBlock.date) {
        return {
          ...day,
          blocks: day.blocks.map((b: any) => b.id === editingBlock.id ? { ...editingBlock } : b)
        };
      }
      return day;
    });

    await updateDoc(doc(db, 'studyPlans', user.uid), { masterPlan: newPlan, updatedAt: serverTimestamp() });
    
    if (saveAndNext) {
      const currentDay = studyPlan.masterPlan.find((d: any) => d.date === editingBlock.date);
      const currentIndex = currentDay.blocks.findIndex((b: any) => b.id === editingBlock.id);
      const nextBlock = currentDay.blocks[currentIndex + 1];

      if (nextBlock) {
        setEditingBlock({ ...nextBlock, date: editingBlock.date });
      } else {
        setIsEditDialogOpen(false);
      }
    } else {
      setIsEditDialogOpen(false);
    }
    
    toast({ title: 'TERMİNALE İŞLENDİ', className: "bg-primary text-white rounded-2xl" });
  };

  return (
    <div className="p-4 md:p-8 lg:p-14 space-y-8 md:space-y-12 max-w-[1800px] mx-auto w-full animate-in fade-in duration-1000 bg-[#F8FAFC] overflow-x-hidden">
      <header className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 md:gap-8">
        <div className="flex flex-col gap-4 md:gap-6 w-full xl:w-auto">
          <div className="flex items-center gap-3 md:gap-4">
             <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-white shadow-sm border border-slate-100 hover:bg-primary hover:text-white transition-all"><ArrowLeft className="h-4 w-4 md:h-5 md:w-5" /></Button>
             <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard')} className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-white shadow-sm border border-slate-100 hover:bg-primary hover:text-white transition-all"><Home className="h-4 w-4 md:h-5 md:w-5" /></Button>
          </div>
          <div className="space-y-1">
             <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent text-primary font-black text-[8px] md:text-[9px] uppercase tracking-widest shadow-lg shadow-accent/20 italic border border-accent/20">
                <Calendar className="h-3 w-3" /> MASTER ACADEMIC ENGINE v4.8
             </div>
             <h2 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tighter italic text-primary uppercase leading-none text-shadow-premium">
                Akademik <br className="hidden md:block" /><span className="text-accent text-shadow-accent">Terminal</span>
             </h2>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 items-center w-full xl:w-auto">
           <div className="grid grid-cols-2 gap-2 w-full sm:w-auto">
             <div className="space-y-1">
               <Label className="text-[8px] font-black uppercase tracking-widest opacity-40 ml-2">BAŞLANGIÇ</Label>
               <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="h-12 md:h-14 rounded-xl bg-white border-none shadow-xl font-bold text-xs" />
             </div>
             <div className="space-y-1">
               <Label className="text-[8px] font-black uppercase tracking-widest opacity-40 ml-2">SINAV</Label>
               <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="h-12 md:h-14 rounded-xl bg-white border-none shadow-xl font-bold text-xs" />
             </div>
           </div>
           <Button onClick={generateFasikulPlan} disabled={isGenerating} className="w-full sm:w-auto h-16 md:h-20 px-8 md:px-10 rounded-[1.25rem] md:rounded-[1.75rem] bg-primary hover:bg-accent transition-all font-black text-[10px] md:text-xs uppercase tracking-widest gap-3 shadow-2xl text-white">
              {isGenerating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5 text-accent" />} MOTORU ÇALIŞTIR
           </Button>
        </div>
      </header>

      <div className="space-y-12 md:space-y-24">
        {(studyPlan?.masterPlan || []).map((day: any) => (
          <div key={day.date} className="space-y-6 md:space-y-10 animate-in slide-in-from-bottom-8 duration-700">
             <div className="flex items-center gap-4 md:gap-6 px-4">
                <h3 className="text-xl md:text-3xl lg:text-4xl font-black italic text-primary uppercase tracking-tighter whitespace-nowrap">{format(parseISO(day.date), 'd MMMM yyyy', { locale: tr })}</h3>
                <div className="h-px flex-1 bg-slate-200 hidden sm:block" />
             </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                {day.blocks?.map((block: any) => (
                  <Card key={block.id} className={cn("p-6 md:p-10 rounded-[2.5rem] md:rounded-[4.5rem] border-none shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] group relative overflow-hidden bg-white hover:scale-[1.02] transition-all duration-500 flex flex-col h-full min-h-[400px]", block.status === 'done' && "opacity-60")}>
                     <div className="space-y-6 md:space-y-8 relative z-10 h-full flex flex-col flex-1">
                        <div className="flex justify-between items-start gap-2">
                           <div className="space-y-1 flex-1 min-w-0">
                              <h4 className="text-xl md:text-3xl lg:text-[2.2rem] font-black italic leading-[0.9] tracking-tighter uppercase text-primary text-shadow-deep line-clamp-3">{block.topic}</h4>
                              <p className="text-[8px] md:text-[9px] font-bold text-muted-foreground/40 uppercase tracking-[0.3em] italic mt-2">#{block.lesson.substring(0, 3)} MODÜLÜ</p>
                           </div>
                           <Badge className={cn("px-4 py-1.5 rounded-full text-[8px] md:text-[9px] font-black shrink-0", block.status === 'done' ? "bg-emerald-500 text-white" : "bg-[#FF4D6D] text-white shadow-lg")}>
                              {block.status === 'done' ? 'TAMAM' : 'BEK'}
                           </Badge>
                        </div>

                        <div className="grid grid-cols-1 gap-3 md:gap-4 flex-1">
                           <div className="p-4 md:p-6 rounded-2xl md:rounded-[2.5rem] bg-slate-50/50 border border-slate-100 space-y-2 md:space-y-3 hover:bg-white hover:shadow-xl transition-all">
                              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                                 <span className="text-[8px] md:text-[9px] font-black text-primary/30 uppercase tracking-[0.2em]">{block.phase1?.time || '10:00'} - PHASE 1</span>
                                 <div className="flex gap-3">
                                    {block.youtubeUrl && <a href={block.youtubeUrl} target="_blank" className="text-rose-500 hover:scale-110"><Youtube className="h-4 w-4 md:h-5 md:w-5" /></a>}
                                    {block.pdfUrl && <a href={block.pdfUrl} target="_blank" className="text-blue-500 hover:scale-110"><FileText className="h-4 w-4 md:h-5 md:w-5" /></a>}
                                    {block.mebiUrl && <a href={block.mebiUrl} target="_blank" className="text-emerald-500 hover:scale-110"><BookOpen className="h-4 w-4 md:h-5 md:w-5" /></a>}
                                 </div>
                              </div>
                              <p className="text-[9px] md:text-[11px] font-black text-primary opacity-60 line-clamp-1 uppercase italic">{block.phase1?.type || 'AKADEMİK ÇALIŞMA'}</p>
                           </div>
                           <div className="p-4 md:p-6 rounded-2xl md:rounded-[2.5rem] bg-slate-50/50 border border-slate-100 space-y-2 md:space-y-3 hover:bg-white hover:shadow-xl transition-all">
                              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                                 <span className="text-[8px] md:text-[9px] font-black text-primary/30 uppercase tracking-[0.2em]">{block.phase2?.time || '11:00'} - PHASE 2</span>
                                 <div className="flex gap-2">
                                    <span className="text-[8px] md:text-[10px] font-black text-accent uppercase">{block.solvedQuestions || 0}/{block.targetQuestions || 40}</span>
                                 </div>
                              </div>
                              <p className="text-[9px] md:text-[11px] font-black text-primary opacity-60 line-clamp-1 uppercase italic">{block.phase2?.type || 'PEKİŞTİRME'}</p>
                           </div>
                        </div>

                        {block.reminder && (
                           <div className="p-4 bg-accent/5 border border-accent/10 rounded-[1.5rem] md:rounded-[2rem] flex items-center gap-3 mt-2">
                              <BellRing className="h-3.5 w-3.5 md:h-4 md:w-4 text-accent shrink-0" />
                              <p className="text-[9px] md:text-[11px] font-black text-primary italic leading-tight truncate">{block.reminder}</p>
                           </div>
                        )}

                        <div className="flex justify-between gap-2 pt-6 mt-auto border-t border-slate-50">
                           <Button onClick={() => handleTaskAction(day.date, block.id, 'done')} size="icon" className={cn("h-11 w-11 md:h-14 md:w-14 rounded-full shadow-xl transition-all hover:scale-110", block.status === 'done' ? "bg-slate-100 text-slate-400" : "bg-emerald-500 text-white")}><CheckCircle2 className="h-5 w-5 md:h-7 md:w-7" /></Button>
                           <div className="flex gap-2">
                              <Button onClick={() => handleTaskAction(day.date, block.id, 'edit')} size="icon" variant="outline" className="h-11 w-11 md:h-14 md:w-14 rounded-full bg-white border-2 border-slate-100 text-primary shadow-lg hover:border-primary transition-all"><Edit3 className="h-5 w-5 md:h-6 md:w-6" /></Button>
                              <Button onClick={() => handleTaskAction(day.date, block.id, 'delete')} size="icon" variant="outline" className="h-11 w-11 md:h-14 md:w-14 rounded-full bg-white border-2 border-slate-100 text-rose-500 shadow-lg hover:border-rose-500 transition-all"><Trash2 className="h-5 w-5 md:h-6 md:w-6" /></Button>
                           </div>
                        </div>
                     </div>
                  </Card>
                ))}
             </div>
          </div>
        ))}
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="rounded-[2.5rem] md:rounded-[4rem] border-none shadow-2xl p-0 bg-white max-w-2xl overflow-hidden">
           <DialogHeader className="p-8 md:p-12 pb-0">
              <div className="inline-flex items-center gap-2 text-accent font-black text-[9px] md:text-[10px] uppercase tracking-widest italic bg-slate-50 px-4 py-1.5 rounded-full w-fit">
                <Sparkles className="h-3 w-3" /> BLOK EDİTÖRÜ v4.8
              </div>
              <DialogTitle className="text-3xl md:text-5xl font-black italic tracking-tighter text-primary uppercase leading-tight mt-4">GÖREV <span className="text-accent text-shadow-accent">TERMİNALİ</span></DialogTitle>
           </DialogHeader>

           {editingBlock && (
             <ScrollArea className="max-h-[85vh] md:max-h-[70vh] p-8 md:p-12 pt-6">
                <div className="space-y-8 md:space-y-12">
                   <div className="grid grid-cols-1 gap-6 md:gap-10">
                      <div className="space-y-2">
                         <Label className="text-[10px] font-black uppercase ml-4 opacity-40 italic tracking-widest">KONU ADI</Label>
                         <Input 
                            value={editingBlock.topic} 
                            onChange={(e) => setEditingBlock({...editingBlock, topic: e.target.value})}
                            className="h-14 md:h-20 rounded-[1.5rem] md:rounded-[2.25rem] bg-slate-50 border-none font-black text-xl md:text-3xl px-8 shadow-inner" 
                         />
                      </div>
                      <div className="space-y-2">
                         <Label className="text-[10px] font-black uppercase ml-4 opacity-40 italic tracking-widest">HATIRLATICI NOTU</Label>
                         <Input 
                            value={editingBlock.reminder || ''} 
                            onChange={(e) => setEditingBlock({...editingBlock, reminder: e.target.value})}
                            className="h-14 md:h-16 rounded-[1.25rem] md:rounded-[1.75rem] bg-slate-50 border-none font-bold px-8 shadow-inner" 
                            placeholder="Örn: 2. testi çözmeyi unutma"
                         />
                      </div>
                   </div>

                   <div className="space-y-4 md:space-y-8">
                      <Label className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 block ml-4 italic">AKADEMİK KAYNAKLAR</Label>
                      <div className="grid gap-4 md:gap-6">
                         {[
                           { key: 'youtubeUrl', label: 'YOUTUBE LİNKİ', icon: Youtube, color: 'text-rose-500', type: 'youtube' as const },
                           { key: 'pdfUrl', label: 'PDF / OGM MATERYAL', icon: FileText, color: 'text-blue-500', type: 'pdf' as const },
                           { key: 'mebiUrl', label: 'MEBİ LİNKİ', icon: BookOpen, color: 'text-emerald-500', type: 'mebi' as const }
                         ].map((item) => (
                            <div key={item.key} className="flex gap-3">
                               <div className="relative flex-1 group">
                                  <item.icon className={cn("absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 opacity-30 transition-all group-focus-within:opacity-100", item.color)} />
                                  <Input 
                                    value={editingBlock[item.key] || ''} 
                                    onChange={(e) => setEditingBlock({...editingBlock, [item.key]: e.target.value})}
                                    className="h-14 md:h-16 rounded-2xl md:rounded-3xl bg-slate-50 border-none pl-14 md:pl-16 font-bold text-[10px] md:text-xs shadow-inner" 
                                    placeholder={item.label}
                                  />
                               </div>
                               <Button 
                                  onClick={() => handleAutoFind(item.type)}
                                  variant="outline" 
                                  className="h-14 w-14 md:h-16 md:w-16 rounded-2xl md:rounded-3xl border-2 border-slate-50 bg-white hover:bg-slate-50 shadow-md shrink-0 transition-all active:scale-95"
                               >
                                  <Search className="h-5 w-5 text-primary opacity-30" />
                                </Button>
                            </div>
                         ))}
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                      <div className="space-y-6">
                         <Label className="text-[10px] font-black uppercase ml-4 opacity-40 italic tracking-widest">SORU TAKİBİ</Label>
                         <div className="flex gap-4">
                            <div className="flex-1 space-y-2">
                               <span className="text-[8px] font-black uppercase ml-4 text-muted-foreground italic">HEDEF</span>
                               <Input 
                                  type="number" 
                                  value={editingBlock.targetQuestions || 40} 
                                  onChange={(e) => setEditingBlock({...editingBlock, targetQuestions: parseInt(e.target.value)})}
                                  className="h-14 md:h-16 rounded-2xl bg-slate-50 border-none text-center font-black text-2xl shadow-inner" 
                               />
                            </div>
                            <div className="flex-1 space-y-2">
                               <span className="text-[8px] font-black uppercase ml-4 text-accent italic">ÇÖZÜLEN</span>
                               <Input 
                                  type="number" 
                                  value={editingBlock.solvedQuestions || 0} 
                                  onChange={(e) => setEditingBlock({...editingBlock, solvedQuestions: parseInt(e.target.value)})}
                                  className="h-14 md:h-16 rounded-2xl bg-slate-50 border-none text-center font-black text-2xl shadow-inner" 
                               />
                            </div>
                         </div>
                      </div>
                      <div className="space-y-6">
                         <Label className="text-[10px] font-black uppercase ml-4 opacity-40 italic tracking-widest">DURUM TESCİLİ</Label>
                         <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-3 p-5 md:p-6 bg-slate-50 rounded-[1.5rem] md:rounded-[2rem] shadow-inner group transition-all hover:bg-white hover:shadow-xl cursor-pointer">
                               <Checkbox 
                                  checked={editingBlock.isKonuDone} 
                                  onCheckedChange={(val) => setEditingBlock({...editingBlock, isKonuDone: !!val})} 
                                  className="rounded-lg h-6 w-6 md:h-8 md:w-8 border-primary/20 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                               />
                               <span className="text-[9px] md:text-[11px] font-black uppercase italic text-primary/40 group-data-[state=checked]:text-primary">KONU</span>
                            </div>
                            <div className="flex items-center gap-3 p-5 md:p-6 bg-slate-50 rounded-[1.5rem] md:rounded-[2rem] shadow-inner group transition-all hover:bg-white hover:shadow-xl cursor-pointer">
                               <Checkbox 
                                  checked={editingBlock.isTestDone} 
                                  onCheckedChange={(val) => setEditingBlock({...editingBlock, isTestDone: !!val})} 
                                  className="rounded-lg h-6 w-6 md:h-8 md:w-8 border-primary/20 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                               />
                               <span className="text-[9px] md:text-[11px] font-black uppercase italic text-primary/40 group-data-[state=checked]:text-primary">TEST</span>
                            </div>
                         </div>
                      </div>
                   </div>

                   <Collapsible title="Gelişmiş" open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
                      <CollapsibleTrigger asChild>
                         <Button variant="ghost" className="w-full h-12 rounded-[1.25rem] md:rounded-[1.75rem] font-black text-[10px] uppercase tracking-[0.3em] text-primary/20 gap-3 hover:bg-slate-50">
                            {isAdvancedOpen ? 'GEREKSİZ ALANLARI GİZLE' : '+ GELİŞMİŞ BİLGİLER'}
                            <ChevronDown className={cn("h-4 w-4 transition-transform duration-500", isAdvancedOpen && "rotate-180")} />
                         </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="space-y-6 md:space-y-10 pt-6 md:pt-10">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
                            <div className="space-y-2">
                               <Label className="text-[10px] font-black uppercase ml-4 opacity-40 italic">ÇALIŞMA SÜRESİ</Label>
                               <Input 
                                  value={editingBlock.duration || '45 dk'} 
                                  onChange={(e) => setEditingBlock({...editingBlock, duration: e.target.value})}
                                  className="h-12 md:h-14 rounded-xl bg-slate-50 border-none px-6 font-bold shadow-inner" 
                               />
                            </div>
                            <div className="space-y-2">
                               <Label className="text-[10px] font-black uppercase ml-4 opacity-40 italic">TEKRAR TARİHİ</Label>
                               <Input 
                                  type="date" 
                                  value={editingBlock.nextReviewDate || ''} 
                                  onChange={(e) => setEditingBlock({...editingBlock, nextReviewDate: e.target.value})}
                                  className="h-12 md:h-14 rounded-xl bg-slate-50 border-none px-6 font-bold shadow-inner" 
                               />
                            </div>
                         </div>
                         <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase ml-4 opacity-40 italic">EK KAYNAK LİNKİ</Label>
                            <Input 
                               value={editingBlock.extraUrl || ''} 
                               onChange={(e) => setEditingBlock({...editingBlock, extraUrl: e.target.value})}
                               className="h-12 md:h-14 rounded-xl bg-slate-50 border-none px-6 font-bold shadow-inner" 
                               placeholder="https://..."
                            />
                         </div>
                      </CollapsibleContent>
                   </Collapsible>

                   <div className="flex flex-col gap-4 pt-6 md:pt-10 border-t border-slate-100">
                      <Button onClick={() => handleSaveEdit(false)} className="w-full h-20 md:h-24 rounded-[1.75rem] md:rounded-[2.5rem] bg-[#0F172A] hover:bg-accent text-white font-black text-sm uppercase tracking-[0.4em] gap-4 shadow-[0_40px_80px_-20px_rgba(15,23,42,0.45)] transition-all active:scale-95 group">
                         <Save className="h-6 w-6 text-accent group-hover:animate-pulse" /> TERMİNALE KAYDET
                      </Button>
                      <Button onClick={() => handleSaveEdit(true)} className="w-full h-16 md:h-20 rounded-[1.5rem] md:rounded-[2rem] bg-accent hover:bg-primary text-primary hover:text-white transition-all font-black text-xs uppercase tracking-[0.2em] gap-3 md:gap-4 shadow-2xl">
                         SONRAKİ KARTA GEÇ <ArrowRight className="h-5 w-5 md:h-6 md:w-6" />
                      </Button>
                   </div>
                   
                   <div className="flex gap-4">
                      <Button onClick={() => setIsEditDialogOpen(false)} variant="outline" className="flex-1 h-14 md:h-16 rounded-[1.25rem] md:rounded-[1.75rem] border-2 font-black text-[10px] uppercase text-primary/40 hover:bg-slate-50">VAZGEÇ</Button>
                      <Button onClick={() => handleTaskAction(editingBlock.date, editingBlock.id, 'delete')} variant="outline" className="h-14 w-14 md:h-16 md:w-16 rounded-[1.25rem] md:rounded-[1.75rem] border-2 border-rose-50 text-rose-500 hover:bg-rose-50 hover:border-rose-500 shrink-0 transition-all"><Trash2 className="h-5 w-5 md:h-6 md:w-6" /></Button>
                   </div>
                </div>
             </ScrollArea>
           )}
        </DialogContent>
      </Dialog>
    </div>
  );
}