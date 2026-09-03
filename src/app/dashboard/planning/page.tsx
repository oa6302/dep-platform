
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
import { format, addDays, isBefore, parseISO, startOfToday, subDays, isSameDay } from 'date-fns';
import { tr } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
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
    const currentPlan = [...studyPlan.masterPlan];
    
    const yesterdayIdx = currentPlan.findIndex(d => d.date === yesterdayStr);
    const todayIdx = currentPlan.findIndex(d => d.date === todayStr);

    if (yesterdayIdx !== -1 && todayIdx !== -1) {
      const uncompleted = currentPlan[yesterdayIdx].blocks.filter((b: any) => b.status === 'planned');
      if (uncompleted.length > 0) {
        hasDelayed = true;
        currentPlan[yesterdayIdx].blocks = currentPlan[yesterdayIdx].blocks.filter((b: any) => b.status === 'done');
        currentPlan[todayIdx].blocks = [
          ...uncompleted.map((b: any) => ({ ...b, status: 'delayed', reminder: 'DÜNDEN AKTARILDI: ' + (b.reminder || '') })),
          ...currentPlan[todayIdx].blocks
        ];
      }
    }

    if (hasDelayed) {
      updateDoc(doc(db, 'studyPlans', user.uid), { masterPlan: currentPlan, updatedAt: serverTimestamp() });
      toast({ title: 'AI PLAN DENGELENDİ', className: "bg-accent text-primary rounded-2xl" });
    }
  }, [studyPlan?.masterPlan, user, db]);

  const generateFasikulPlan = async () => {
    if (!db || !user || !endDate || !startDate) return;
    setIsGenerating(true);

    try {
      const start = parseISO(startDate);
      const end = parseISO(endDate);
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

      const newPlan = [];
      for (let i = 0; i <= diffDays; i++) {
        const currentDt = addDays(start, i);
        const dateStr = format(currentDt, 'yyyy-MM-dd');
        const dayName = format(currentDt, 'EEEE', { locale: tr });
        
        const existingDay = (studyPlan?.masterPlan || []).find((d: any) => d.date === dateStr);
        if (existingDay && (isBefore(currentDt, startOfToday()) || existingDay.blocks.some((b: any) => b.status === 'done'))) {
          newPlan.push(existingDay);
          continue;
        }

        const dailyBlocks = [];
        for (let j = 0; j < 3; j++) {
          const lesson = subjectsPool[(i * 3 + j) % subjectsPool.length];
          const topics = lessonQueues[lesson] || [];
          const topic = topics[lessonPointers[lesson] % (topics.length || 1)] || 'Genel Tekrar';
          
          dailyBlocks.push({
            id: `block_${dateStr}_${j}`,
            lesson,
            topic,
            status: 'planned',
            phase1: { type: 'KONU ÇALIŞMA', time: '10:00' },
            phase2: { type: 'TEST ÇÖZME', time: '11:00' },
            reminder: '',
            targetQuestions: 40,
            solvedQuestions: 0,
            youtubeUrl: '',
            pdfUrl: '',
            mebiUrl: '',
            isKonuDone: false,
            isTestDone: false
          });
          lessonPointers[lesson]++;
        }

        dailyBlocks.push({
          id: `review_${dateStr}`,
          lesson: 'Genel',
          topic: 'DÜNKÜ ÇALIŞMALARIN TEKRARI',
          status: 'planned',
          phase1: { type: 'DÜNÜN ANALİZİ', time: '12:00' },
          phase2: { type: 'TESCİL', time: '12:30' },
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
    const topic = encodeURIComponent(editingBlock.topic);
    let url = '';
    
    switch(type) {
      case 'youtube': url = `https://www.youtube.com/results?search_query=${topic}+konu+anlatımı`; break;
      case 'pdf': url = `https://ogmmateryal.eba.gov.tr/panel/FasikulGoster.aspx?arama=${topic}`; break;
      case 'mebi': url = `https://mebi.eba.gov.tr/arama?q=${topic}`; break;
    }

    setEditingBlock({ ...editingBlock, [`${type}Url`]: url });
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
    <div className="p-4 md:p-14 space-y-12 max-w-[1800px] mx-auto w-full animate-in fade-in duration-1000 bg-[#F8FAFC]">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
             <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-10 w-10 rounded-xl bg-white shadow-sm border border-slate-100 hover:bg-primary hover:text-white transition-all"><ArrowLeft className="h-4 w-4" /></Button>
             <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard')} className="h-10 w-10 rounded-xl bg-white shadow-sm border border-slate-100 hover:bg-primary hover:text-white transition-all"><Home className="h-4 w-4" /></Button>
          </div>
          <div className="space-y-1">
             <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent text-primary font-black text-[9px] uppercase tracking-widest shadow-lg shadow-accent/20 italic border border-accent/20">
                <Calendar className="h-3 w-3" /> MASTER ACADEMIC ENGINE v4.8
             </div>
             <h2 className="text-4xl md:text-5xl font-black tracking-tighter italic text-primary uppercase leading-none text-shadow-premium">
                Akademik <br /><span className="text-accent text-shadow-accent">Terminal</span>
             </h2>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 items-center">
           <div className="flex gap-2">
             <div className="space-y-1">
               <Label className="text-[8px] font-black uppercase tracking-widest opacity-40 ml-2">BAŞLANGIÇ</Label>
               <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="h-12 rounded-xl bg-white border-none shadow-xl font-bold text-xs" />
             </div>
             <div className="space-y-1">
               <Label className="text-[8px] font-black uppercase tracking-widest opacity-40 ml-2">SINAV</Label>
               <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="h-12 rounded-xl bg-white border-none shadow-xl font-bold text-xs" />
             </div>
           </div>
           <Button onClick={generateFasikulPlan} disabled={isGenerating} className="h-20 px-10 rounded-[1.75rem] bg-primary hover:bg-accent transition-all font-black text-[10px] uppercase tracking-widest gap-3 shadow-2xl text-white">
              {isGenerating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5 text-accent" />} MOTORU ÇALIŞTIR
           </Button>
        </div>
      </header>

      <div className="space-y-24">
        {(studyPlan?.masterPlan || []).map((day: any) => (
          <div key={day.date} className="space-y-8 animate-in slide-in-from-bottom-8 duration-700">
             <div className="flex items-center gap-6 px-4">
                <h3 className="text-2xl md:text-3xl font-black italic text-primary uppercase tracking-tighter">{format(parseISO(day.date), 'd MMMM yyyy', { locale: tr })}</h3>
                <div className="h-px flex-1 bg-slate-200 hidden md:block" />
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {day.blocks?.map((block: any) => (
                  <Card key={block.id} className={cn("p-8 rounded-[3.5rem] border-none shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] group relative overflow-hidden bg-white hover:scale-[1.02] transition-all duration-500", block.status === 'done' && "opacity-60")}>
                     <div className="space-y-6 relative z-10 h-full flex flex-col">
                        <div className="flex justify-between items-start">
                           <div className="space-y-1">
                              <h4 className="text-2xl font-black italic leading-tight tracking-tighter uppercase text-primary text-shadow-deep line-clamp-2">{block.topic}</h4>
                              <p className="text-[8px] font-bold text-muted-foreground/40 uppercase tracking-widest italic">#{block.lesson.substring(0, 3)}</p>
                           </div>
                           <Badge className={cn("px-4 py-1.5 rounded-full text-[8px] font-black", block.status === 'done' ? "bg-emerald-500 text-white" : "bg-[#FF4D6D] text-white")}>
                              {block.status === 'done' ? 'OK' : 'BEK'}
                           </Badge>
                        </div>

                        <div className="grid grid-cols-1 gap-4 flex-1">
                           <div className="p-4 rounded-3xl bg-slate-50 border border-slate-100 space-y-2 hover:bg-white transition-all">
                              <div className="flex justify-between items-center border-b border-slate-200 pb-1.5">
                                 <span className="text-[8px] font-black text-primary/30 uppercase">10:00 - KONU</span>
                                 <div className="flex gap-2">
                                    {block.youtubeUrl && <a href={block.youtubeUrl} target="_blank" className="text-rose-500 hover:scale-110"><Youtube className="h-4 w-4" /></a>}
                                    {block.pdfUrl && <a href={block.pdfUrl} target="_blank" className="text-blue-500 hover:scale-110"><FileText className="h-4 w-4" /></a>}
                                 </div>
                              </div>
                              <p className="text-[10px] font-bold text-primary opacity-60">Kazanım tescili ve akademik okuma.</p>
                           </div>
                           <div className="p-4 rounded-3xl bg-slate-50 border border-slate-100 space-y-2 hover:bg-white transition-all">
                              <div className="flex justify-between items-center border-b border-slate-200 pb-1.5">
                                 <span className="text-[8px] font-black text-primary/30 uppercase">11:00 - TEST</span>
                                 <div className="flex gap-2">
                                    <span className="text-[8px] font-black text-accent uppercase">{block.solvedQuestions || 0}/{block.targetQuestions || 40} SORU</span>
                                 </div>
                              </div>
                              <p className="text-[10px] font-bold text-primary opacity-60">Fasikül testleri ve saniyeler içinde analiz.</p>
                           </div>
                        </div>

                        {block.reminder && (
                           <div className="p-3 bg-accent/5 border border-accent/10 rounded-2xl flex items-center gap-3">
                              <BellRing className="h-3 w-3 text-accent shrink-0" />
                              <p className="text-[9px] font-black text-primary italic leading-tight truncate">{block.reminder}</p>
                           </div>
                        )}

                        <div className="flex justify-between gap-2 pt-4 border-t border-slate-50">
                           <Button onClick={() => handleTaskAction(day.date, block.id, 'done')} size="icon" className={cn("h-10 w-10 rounded-full shadow-lg transition-all", block.status === 'done' ? "bg-slate-100 text-slate-400" : "bg-emerald-500 text-white")}><CheckCircle2 className="h-4 w-4" /></Button>
                           <div className="flex gap-2">
                              <Button onClick={() => handleTaskAction(day.date, block.id, 'edit')} size="icon" variant="outline" className="h-10 w-10 rounded-full bg-white border border-slate-100 text-primary shadow-md hover:bg-slate-50"><Edit3 className="h-4 w-4" /></Button>
                              <Button onClick={() => handleTaskAction(day.date, block.id, 'delete')} size="icon" variant="outline" className="h-10 w-10 rounded-full bg-white border border-slate-100 text-rose-500 shadow-md hover:bg-rose-50"><Trash2 className="h-4 w-4" /></Button>
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
        <DialogContent className="rounded-[4rem] border-none shadow-2xl p-0 bg-white max-w-2xl overflow-hidden">
           <DialogHeader className="p-10 pb-0">
              <div className="inline-flex items-center gap-2 text-accent font-black text-[9px] uppercase tracking-widest italic">
                <Sparkles className="h-3 w-3" /> BLOK EDİTÖRÜ v4.8
              </div>
              <DialogTitle className="text-4xl font-black italic tracking-tighter text-primary uppercase leading-tight">GÖREV <span className="text-accent text-shadow-accent">TERMİNALİ</span></DialogTitle>
           </DialogHeader>

           {editingBlock && (
             <ScrollArea className="max-h-[70vh] p-10 pt-6">
                <div className="space-y-10">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                         <Label className="text-[10px] font-black uppercase ml-2 opacity-40">KONU ADI</Label>
                         <Input 
                            value={editingBlock.topic} 
                            onChange={(e) => setEditingBlock({...editingBlock, topic: e.target.value})}
                            className="h-14 rounded-2xl bg-slate-50 border-none font-bold text-lg px-6" 
                         />
                      </div>
                      <div className="space-y-2">
                         <Label className="text-[10px] font-black uppercase ml-2 opacity-40">HATIRLATICI NOTU</Label>
                         <Input 
                            value={editingBlock.reminder || ''} 
                            onChange={(e) => setEditingBlock({...editingBlock, reminder: e.target.value})}
                            className="h-14 rounded-2xl bg-slate-50 border-none font-bold px-6" 
                            placeholder="Örn: 2. testi çözmeyi unutma"
                         />
                      </div>
                   </div>

                   <div className="space-y-6">
                      <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 block ml-2">AKADEMİK KAYNAKLAR</Label>
                      <div className="grid gap-4">
                         {[
                           { key: 'youtubeUrl', label: 'YOUTUBE LİNKİ', icon: Youtube, color: 'text-rose-500', type: 'youtube' as const },
                           { key: 'pdfUrl', label: 'PDF / OGM MATERYAL', icon: FileText, color: 'text-blue-500', type: 'pdf' as const },
                           { key: 'mebiUrl', label: 'MEBİ LİNKİ', icon: BookOpen, color: 'text-emerald-500', type: 'mebi' as const }
                         ].map((item) => (
                            <div key={item.key} className="flex gap-2">
                               <div className="relative flex-1 group">
                                  <item.icon className={cn("absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 opacity-40 transition-all group-focus-within:opacity-100", item.color)} />
                                  <Input 
                                    value={editingBlock[item.key] || ''} 
                                    onChange={(e) => setEditingBlock({...editingBlock, [item.key]: e.target.value})}
                                    className="h-14 rounded-2xl bg-slate-50 border-none pl-14 font-bold text-sm" 
                                    placeholder={item.label}
                                  />
                               </div>
                               <Button 
                                  onClick={() => handleAutoFind(item.type)}
                                  variant="outline" 
                                  className="h-14 w-14 rounded-2xl border-2 border-slate-50 bg-white hover:bg-slate-50 shadow-sm"
                               >
                                  <Search className="h-5 w-5 text-primary opacity-40" />
                               </Button>
                            </div>
                         ))}
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-4">
                         <Label className="text-[10px] font-black uppercase ml-2 opacity-40">SORU TAKİBİ</Label>
                         <div className="flex gap-4">
                            <div className="flex-1 space-y-1">
                               <span className="text-[8px] font-black uppercase ml-2 text-muted-foreground">HEDEF</span>
                               <Input 
                                  type="number" 
                                  value={editingBlock.targetQuestions || 40} 
                                  onChange={(e) => setEditingBlock({...editingBlock, targetQuestions: parseInt(e.target.value)})}
                                  className="h-12 rounded-xl bg-slate-50 border-none text-center font-black" 
                               />
                            </div>
                            <div className="flex-1 space-y-1">
                               <span className="text-[8px] font-black uppercase ml-2 text-accent">ÇÖZÜLEN</span>
                               <Input 
                                  type="number" 
                                  value={editingBlock.solvedQuestions || 0} 
                                  onChange={(e) => setEditingBlock({...editingBlock, solvedQuestions: parseInt(e.target.value)})}
                                  className="h-12 rounded-xl bg-slate-50 border-none text-center font-black" 
                               />
                            </div>
                         </div>
                      </div>
                      <div className="space-y-4">
                         <Label className="text-[10px] font-black uppercase ml-2 opacity-40">DURUM TESCİLİ</Label>
                         <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl">
                               <Checkbox 
                                  checked={editingBlock.isKonuDone} 
                                  onCheckedChange={(val) => setEditingBlock({...editingBlock, isKonuDone: !!val})} 
                                  className="rounded-lg h-6 w-6"
                               />
                               <span className="text-[9px] font-black uppercase">KONU</span>
                            </div>
                            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl">
                               <Checkbox 
                                  checked={editingBlock.isTestDone} 
                                  onCheckedChange={(val) => setEditingBlock({...editingBlock, isTestDone: !!val})} 
                                  className="rounded-lg h-6 w-6"
                               />
                               <span className="text-[9px] font-black uppercase">TEST</span>
                            </div>
                         </div>
                      </div>
                   </div>

                   <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
                      <CollapsibleTrigger asChild>
                         <Button variant="ghost" className="w-full h-12 rounded-2xl font-black text-[10px] uppercase tracking-widest text-primary/40 gap-2">
                            {isAdvancedOpen ? 'GEREKSİZ ALANLARI GİZLE' : '+ GELİŞMİŞ BİLGİLER'}
                            <ChevronDown className={cn("h-4 w-4 transition-transform", isAdvancedOpen && "rotate-180")} />
                         </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="space-y-6 pt-6">
                         <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-2">
                               <Label className="text-[10px] font-black uppercase ml-2 opacity-40">ÇALIŞMA SÜRESİ</Label>
                               <Input 
                                  value={editingBlock.duration || '45 dk'} 
                                  onChange={(e) => setEditingBlock({...editingBlock, duration: e.target.value})}
                                  className="h-12 rounded-xl bg-slate-50 border-none px-6 font-bold" 
                               />
                            </div>
                            <div className="space-y-2">
                               <Label className="text-[10px] font-black uppercase ml-2 opacity-40">TEKRAR TARİHİ</Label>
                               <Input 
                                  type="date" 
                                  value={editingBlock.nextReviewDate || ''} 
                                  onChange={(e) => setEditingBlock({...editingBlock, nextReviewDate: e.target.value})}
                                  className="h-12 rounded-xl bg-slate-50 border-none px-6 font-bold" 
                               />
                            </div>
                         </div>
                         <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase ml-2 opacity-40">EK KAYNAK LİNKİ</Label>
                            <Input 
                               value={editingBlock.extraUrl || ''} 
                               onChange={(e) => setEditingBlock({...editingBlock, extraUrl: e.target.value})}
                               className="h-12 rounded-xl bg-slate-50 border-none px-6 font-bold" 
                               placeholder="https://..."
                            />
                         </div>
                      </CollapsibleContent>
                   </Collapsible>

                   <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-100">
                      <Button onClick={() => handleSaveEdit(false)} className="flex-1 h-20 rounded-[2rem] bg-[#0F172A] hover:bg-accent text-white font-black text-xs uppercase tracking-[0.3em] gap-4 shadow-2xl">
                         <Save className="h-6 w-6 text-accent" /> KAYDET
                      </Button>
                      <Button onClick={() => handleSaveEdit(true)} className="flex-1 h-20 rounded-[2rem] bg-accent hover:bg-primary text-primary hover:text-white transition-all font-black text-xs uppercase tracking-[0.2em] gap-4 shadow-2xl">
                         SONRAKİ KARTA GEÇ <ArrowRight className="h-6 w-6" />
                      </Button>
                   </div>
                   
                   <div className="flex gap-4">
                      <Button onClick={() => setIsEditDialogOpen(false)} variant="outline" className="flex-1 h-14 rounded-2xl border-2 font-black text-[10px] uppercase text-primary/40">VAZGEÇ</Button>
                      <Button onClick={() => handleTaskAction(editingBlock.date, editingBlock.id, 'delete')} variant="outline" className="h-14 w-14 rounded-2xl border-2 border-rose-50 text-rose-500 hover:bg-rose-50"><Trash2 className="h-6 w-6" /></Button>
                   </div>
                </div>
             </ScrollArea>
           )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
