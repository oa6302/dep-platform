
'use client';

import { useState, useEffect } from 'react';
import { useUser, useDoc, useFirestore } from '@/firebase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Calendar, Zap, Loader2, Sparkles, 
  CheckCircle2, Trash2, ArrowLeft, ArrowRight,
  Home, Edit3, Youtube, Save, FileText, 
  BookOpen, Plus, Target
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { YKS_TM_TOPICS } from '@/lib/curriculum-data';
import { EXAM_CONFIGS } from '@/lib/exam-configs';
import { doc, updateDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { format, addDays, parseISO, startOfToday, subDays, isAfter } from 'date-fns';
import { tr } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

export default function PlanningPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  
  const { data: userData } = useDoc<any>(user?.uid ? `users/${user.uid}` : null);
  const { data: studyPlan } = useDoc<any>(user?.uid ? `studyPlans/${user.uid}` : null);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [startDate, setStartDate] = useState('2026-09-03');
  const [endDate, setEndDate] = useState('2027-06-15');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<any>(null);

  const generateAutoLinks = (topic: string, lesson: string) => {
    const queryStr = encodeURIComponent(`${lesson} ${topic}`);
    return {
      youtubeUrl: `https://www.youtube.com/results?search_query=${queryStr}+konu+anlatımı`,
      pdfUrl: `https://ogmmateryal.eba.gov.tr/panel/FasikulGoster.aspx?arama=${encodeURIComponent(topic)}`,
      mebiUrl: `https://mebi.eba.gov.tr/arama?q=${encodeURIComponent(topic)}`
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
      const aytCutoffDate = parseISO(`2026-12-01`);

      const newPlan = [];
      const lessonPointers: Record<string, number> = {};

      for (let i = 0; i <= diffDays; i++) {
        const currentDt = addDays(start, i);
        const dateStr = format(currentDt, 'yyyy-MM-dd');
        const dayName = format(currentDt, 'EEEE', { locale: tr });
        
        // 1 DEC AYT LOGIC
        const isAytAllowed = isAfter(currentDt, aytCutoffDate) || currentDt.getTime() === aytCutoffDate.getTime();
        
        let pool = [...(examConfig?.lessons || ['TYT Matematik', 'TYT Türkçe'])];
        if (!isAytAllowed) {
          pool = pool.filter(l => !l.toUpperCase().includes('AYT') && !['Edebiyat'].includes(l));
        }

        const dailyBlocks = [];

        // BLOCK 1 & 2: Main Academic
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
            ...links
          });
          lessonPointers[lesson]++;
        }

        // BLOCK 3: Paragraph
        dailyBlocks.push({
          id: `para_${dateStr}`,
          lesson: 'TÜRKÇE',
          topic: '20 PARAGRAF SORU ÇÖZÜMÜ',
          status: 'planned',
          isParagraph: true,
          phase1: { type: 'GÜNLÜK KAMP', time: '12:00' },
          ...generateAutoLinks('Paragraf', 'Türkçe'),
        });

        // BLOCK 4: Review
        dailyBlocks.push({
          id: `review_${dateStr}`,
          lesson: 'GENEL',
          topic: 'DÜNÜN ANALİZİ & TEKRARI',
          status: 'planned',
          isReview: true,
          phase1: { type: 'STRATEJİK', time: '12:30' }
        });

        newPlan.push({ date: dateStr, day: dayName, blocks: dailyBlocks });
      }

      const planRef = doc(db, 'studyPlans', user.uid);
      await setDoc(planRef, {
        userId: user.uid,
        targetExam: currentExam,
        masterPlan: newPlan,
        startDate,
        targetExamDate: endDate,
        updatedAt: serverTimestamp()
      }, { merge: true });

      toast({ title: 'Akademik Plan Senkronize Edildi', className: "bg-primary text-white rounded-2xl shadow-2xl" });
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
  };

  return (
    <div className="p-4 md:p-14 space-y-12 max-w-[1800px] mx-auto w-full animate-in fade-in duration-1000 bg-[#F8FAFC]">
      <header className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-10">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
             <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-12 w-12 rounded-xl bg-white shadow-sm border border-slate-100 hover:bg-primary hover:text-white transition-all"><ArrowLeft className="h-5 w-5" /></Button>
             <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard')} className="h-12 w-12 rounded-xl bg-white shadow-sm border border-slate-100 hover:bg-primary hover:text-white transition-all"><Home className="h-5 w-5" /></Button>
          </div>
          <div className="space-y-2">
             <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-accent text-primary font-black text-[10px] uppercase tracking-widest shadow-xl shadow-accent/20 italic border border-accent/20">
                <Calendar className="h-3.5 w-3.5" /> MASTER ACADEMIC ENGINE v4.8
             </div>
             <h2 className="text-6xl font-black tracking-tighter italic text-primary uppercase leading-none text-shadow-premium">
                Akademik <br /><span className="text-accent text-shadow-accent">Terminal</span>
             </h2>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-6 items-center w-full xl:w-auto">
           <div className="grid grid-cols-2 gap-4 w-full sm:w-auto">
             <div className="space-y-2">
               <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4 italic">BAŞLANGIÇ</Label>
               <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="h-16 rounded-2xl bg-white border-none shadow-xl font-bold text-sm px-6" />
             </div>
             <div className="space-y-2">
               <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4 italic">SINAV</Label>
               <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="h-16 rounded-2xl bg-white border-none shadow-xl font-bold text-sm px-6" />
             </div>
           </div>
           <Button onClick={generateFasikulPlan} disabled={isGenerating} className="w-full sm:w-auto h-20 px-12 rounded-[2rem] bg-primary hover:bg-accent transition-all font-black text-xs uppercase tracking-widest gap-4 shadow-2xl text-white border-none">
              {isGenerating ? <Loader2 className="h-6 w-6 animate-spin" /> : <Sparkles className="h-6 w-6 text-accent" />} MOTORU ÇALIŞTIR
           </Button>
        </div>
      </header>

      <div className="space-y-24">
        {(studyPlan?.masterPlan || []).map((day: any) => (
          <div key={day.date} className="space-y-12 animate-in slide-in-from-bottom-4 duration-700">
             <div className="flex items-center gap-10 px-6">
                <h3 className="text-4xl font-black italic text-primary uppercase tracking-tighter">{format(parseISO(day.date), 'd MMMM yyyy', { locale: tr })}</h3>
                <div className="h-px flex-1 bg-slate-200 hidden md:block" />
                <Badge variant="outline" className="h-12 px-6 rounded-2xl font-black uppercase tracking-widest border-2 border-slate-100">{day.day}</Badge>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 w-full">
                {day.blocks?.map((block: any) => (
                  <Card key={block.id} className={cn("p-10 rounded-[4rem] border-none shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] group relative overflow-hidden bg-white hover:scale-[1.02] transition-all duration-500 h-full flex flex-col", block.status === 'done' && "opacity-60")}>
                     <div className="space-y-8 relative z-10 h-full flex flex-col flex-1">
                        <div className="flex justify-between items-start gap-4">
                           <div className="space-y-1 flex-1 min-w-0">
                              <h4 className="text-3xl font-black italic leading-[0.9] tracking-tighter uppercase text-primary text-shadow-deep line-clamp-3">{block.topic}</h4>
                              <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.3em] italic mt-2">#{block.lesson.substring(0, 3)}</p>
                           </div>
                           <Badge className={cn("px-5 py-2 rounded-full text-[10px] font-black shrink-0 shadow-lg", block.status === 'done' ? "bg-emerald-500 text-white" : "bg-[#FF4D6D] text-white")}>
                              {block.status === 'done' ? 'TAMAM' : 'BEK'}
                           </Badge>
                        </div>

                        <div className="grid grid-cols-1 gap-6 flex-1">
                           <div className="p-6 rounded-[2.5rem] bg-slate-50 border border-slate-100 space-y-4 hover:bg-white transition-all shadow-inner">
                              <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                                 <span className="text-[10px] font-black text-primary/30 uppercase tracking-[0.3em]">KAYNAKLAR</span>
                                 <div className="flex gap-4">
                                    {block.youtubeUrl && <a href={block.youtubeUrl} target="_blank" className="text-rose-500 hover:scale-110 transition-all"><Youtube className="h-5 w-5" /></a>}
                                    {block.pdfUrl && <a href={block.pdfUrl} target="_blank" className="text-blue-500 hover:scale-110 transition-all"><FileText className="h-5 w-5" /></a>}
                                    {block.mebiUrl && <a href={block.mebiUrl} target="_blank" className="text-emerald-500 hover:scale-110 transition-all"><BookOpen className="h-5 w-5" /></a>}
                                 </div>
                              </div>
                              <p className="text-[12px] font-black text-primary opacity-60 uppercase italic leading-tight">{block.phase1?.type || (block.isReview ? 'STRATEJİK TEKRAR' : 'DERS ÇALIŞMASI')}</p>
                           </div>
                        </div>

                        <div className="flex justify-between gap-4 pt-8 mt-auto border-t border-slate-50">
                           <Button onClick={() => handleTaskAction(day.date, block.id, 'done')} size="icon" className={cn("h-14 w-14 rounded-full shadow-2xl transition-all", block.status === 'done' ? "bg-slate-100 text-slate-400" : "bg-emerald-500 text-white")}><CheckCircle2 className="h-7 w-7" /></Button>
                           <div className="flex gap-3">
                              <Button onClick={() => handleTaskAction(day.date, block.id, 'edit')} size="icon" variant="outline" className="h-14 w-14 rounded-full bg-white border-2 border-slate-100 text-primary shadow-xl hover:border-primary transition-all"><Edit3 className="h-6 w-6" /></Button>
                              <Button onClick={() => handleTaskAction(day.date, block.id, 'delete')} size="icon" variant="outline" className="h-14 w-14 rounded-full bg-white border-2 border-slate-100 text-rose-500 shadow-xl hover:border-rose-500 transition-all"><Trash2 className="h-6 w-6" /></Button>
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
           <DialogHeader className="p-12 pb-0">
              <div className="inline-flex items-center gap-2 text-accent font-black text-[10px] uppercase tracking-widest italic bg-slate-50 px-5 py-2 rounded-full w-fit">
                <Sparkles className="h-4 w-4" /> BLOK EDİTÖRÜ v4.8
              </div>
              <DialogTitle className="text-4xl font-black italic tracking-tighter text-primary uppercase mt-6">GÖREV <span className="text-accent">TERMİNALİ</span></DialogTitle>
           </DialogHeader>

           {editingBlock && (
             <ScrollArea className="max-h-[70vh] p-12 pt-8">
                <div className="space-y-12">
                   <div className="space-y-8">
                      <div className="space-y-3">
                         <Label className="text-[11px] font-black uppercase ml-6 opacity-40 italic">KONU ADI</Label>
                         <Input value={editingBlock.topic} onChange={(e) => setEditingBlock({...editingBlock, topic: e.target.value})} className="h-20 rounded-3xl bg-slate-50 border-none font-black text-2xl px-8 shadow-inner" />
                      </div>
                   </div>

                   <div className="space-y-8">
                      <Label className="text-[11px] font-black uppercase tracking-[0.4em] opacity-40 block ml-6 italic">AKADEMİK KAYNAKLAR</Label>
                      <div className="grid gap-6">
                         {[
                           { key: 'youtubeUrl', label: 'YOUTUBE LİNKİ', icon: Youtube, color: 'text-rose-500' },
                           { key: 'pdfUrl', label: 'OGM MATERYAL', icon: FileText, color: 'text-blue-500' },
                           { key: 'mebiUrl', label: 'MEBİ LİNKİ', icon: BookOpen, color: 'text-emerald-500' }
                         ].map((item) => (
                            <div key={item.key} className="relative group">
                               <item.icon className={cn("absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 opacity-30", item.color)} />
                               <div className="flex gap-2">
                                  <Input value={editingBlock[item.key] || ''} onChange={(e) => setEditingBlock({...editingBlock, [item.key]: e.target.value})} className="h-16 rounded-2xl bg-slate-50 border-none pl-16 font-bold text-sm shadow-inner flex-1" placeholder={item.label} />
                                  <Button size="icon" variant="ghost" className="h-16 w-16 rounded-2xl bg-slate-100 hover:bg-accent text-primary transition-all"><Plus className="h-6 w-6" /></Button>
                               </div>
                            </div>
                         ))}
                      </div>
                   </div>

                   <div className="flex flex-col gap-6 pt-12 border-t border-slate-100">
                      <Button onClick={() => handleSaveEdit(false)} className="w-full h-24 rounded-[3rem] bg-[#0F172A] hover:bg-accent text-white font-black text-lg uppercase tracking-[0.4em] gap-6 shadow-3xl transition-all border-none">
                         <Save className="h-8 w-8 text-accent" /> TERMİNALE KAYDET
                      </Button>
                      <Button onClick={() => handleSaveEdit(true)} className="w-full h-20 rounded-[2.5rem] bg-accent hover:bg-primary text-primary hover:text-white transition-all font-black text-xs uppercase tracking-[0.3em] gap-6 shadow-2xl border-none">
                         SONRAKİ KARTA GEÇ <ArrowRight className="h-6 w-6" />
                      </Button>
                   </div>
                </div>
             </ScrollArea>
           )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
