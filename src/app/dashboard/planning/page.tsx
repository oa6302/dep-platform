
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useUser, useDoc, useFirestore } from '@/firebase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Calendar, Zap, Loader2, Sparkles, 
  CheckCircle2, Trash2, ArrowLeft,
  Home, Edit3, Youtube, Save, FileText, 
  BookOpen, Target, Clock, AlertCircle,
  ChevronRight, CalendarDays, Hash, Layers,
  Link as LinkIcon, FileQuestion
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { YKS_TM_TOPICS } from '@/lib/curriculum-data';
import { EXAM_CONFIGS } from '@/lib/exam-configs';
import { doc, updateDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { format, addDays, parseISO, isBefore } from 'date-fns';
import { tr } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function PlanningPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  
  const { data: userData } = useDoc<any>(user?.uid ? `users/${user.uid}` : null);
  const { data: studyPlan } = useDoc<any>(user?.uid ? `studyPlans/${user.uid}` : null);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState('2027-06-15');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<any>(null);

  const generateAutoLinks = (topic: string, lesson: string) => {
    const topicQuery = encodeURIComponent(topic);
    return {
      youtubeUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(lesson + ' ' + topic)}`,
      pdfUrl: `https://ogmmateryal.eba.gov.tr/arama?q=${topicQuery}`,
      mebiUrl: `https://www.eba.gov.tr/arama?q=${topicQuery}`,
      testYoutubeUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(lesson + ' ' + topic + ' soru çözümü')}`,
      testPdfUrl: `https://ogmmateryal.eba.gov.tr/arama?q=${topicQuery}+test`,
      testUrl: `https://www.eba.gov.tr/arama?q=${topicQuery}+test`,
      extraUrl: ''
    };
  };

  const generateFasikulPlan = async () => {
    if (!db || !user) return;

    if (!startDate || !endDate) {
      toast({ variant: 'destructive', title: 'Tarih Eksik', description: 'Başlangıç ve bitiş tarihlerini seçiniz.' });
      return;
    }

    if (endDate < startDate) {
      toast({ variant: 'destructive', title: 'Tarih Hatası', description: 'Bitiş tarihi başlangıç tarihinden önce olamaz.' });
      return;
    }

    setIsGenerating(true);

    try {
      const start = parseISO(startDate);
      const end = parseISO(endDate);
      const diffDays = Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      
      const currentExam = userData?.targetExam || 'YKS_EA';
      const examConfig = EXAM_CONFIGS[currentExam];

      const getTopics = (lesson: string) => {
        const cleanName = lesson.replace(/^(TYT|AYT)\s+/i, '').trim();
        return (
          YKS_TM_TOPICS[lesson] || 
          YKS_TM_TOPICS[cleanName] || 
          ['Genel Tekrar']
        );
      };

      const existingPlan = studyPlan?.masterPlan || [];
      const newPlan = [];
      const lessonPointers: Record<string, number> = {};

      for (let i = 0; i <= diffDays; i++) {
        const currentDt = addDays(start, i);
        const dateStr = format(currentDt, 'yyyy-MM-dd');
        
        let lessonPool = [...(examConfig?.lessons || ['TYT Matematik', 'TYT Türkçe'])];
        const existingDay = existingPlan.find((day: any) => day.date === dateStr);
        const dailyBlocks = [];

        // Blok 1 - 10:00
        const l1 = lessonPool[(i * 2) % lessonPool.length];
        const t1 = getTopics(l1)[lessonPointers[l1] % getTopics(l1).length || 0];
        if (!lessonPointers[l1]) lessonPointers[l1] = 0;
        lessonPointers[l1]++;
        
        dailyBlocks.push({
          id: `block_${dateStr}_0`,
          lesson: l1,
          topic: t1,
          status: existingDay?.blocks?.find((b: any) => b.id === `block_${dateStr}_0`)?.status || 'planned',
          phase1: { type: 'KONU ÇALIŞMA', time: '10:00' },
          phase2: { type: 'TEST ÇÖZME' },
          ...generateAutoLinks(t1, l1)
        });

        // Blok 2 - 11:00
        const l2 = lessonPool[(i * 2 + 1) % lessonPool.length];
        const t2 = getTopics(l2)[lessonPointers[l2] % getTopics(l2).length || 0];
        if (!lessonPointers[l2]) lessonPointers[l2] = 0;
        lessonPointers[l2]++;
        
        dailyBlocks.push({
          id: `block_${dateStr}_1`,
          lesson: l2,
          topic: t2,
          status: existingDay?.blocks?.find((b: any) => b.id === `block_${dateStr}_1`)?.status || 'planned',
          phase1: { type: 'KONU ÇALIŞMA', time: '11:00' },
          phase2: { type: 'TEST ÇÖZME' },
          ...generateAutoLinks(t2, l2)
        });

        // Blok 3 - 12:00 (Stratejik Tekrar)
        dailyBlocks.push({
          id: `review_${dateStr}`,
          lesson: 'GENEL',
          topic: 'DÜNÜN ANALİZİ & STRATEJİK TEKRAR',
          status: existingDay?.blocks?.find((b: any) => b.id === `review_${dateStr}`)?.status || 'planned',
          isReview: true,
          phase1: { type: 'STRATEJİK', time: '12:00' }
        });

        // Blok 4 - 15:00 (Paragraf Kampı)
        dailyBlocks.push({
          id: `para_${dateStr}`,
          lesson: 'TYT Türkçe',
          topic: '20 PARAGRAF SORU ÇÖZÜMÜ',
          status: existingDay?.blocks?.find((b: any) => b.id === `para_${dateStr}`)?.status || 'planned',
          isParagraph: true,
          phase1: { type: 'GÜNLÜK KAMP', time: '15:00' },
          ...generateAutoLinks('Paragraf', 'Türkçe'),
        });

        newPlan.push({
          date: dateStr,
          day: format(currentDt, 'EEEE', { locale: tr }),
          blocks: dailyBlocks
        });
      }

      await setDoc(doc(db, 'studyPlans', user.uid), {
        userId: user.uid,
        targetExam: currentExam,
        masterPlan: newPlan,
        updatedAt: serverTimestamp()
      }, { merge: true });

      toast({ 
        title: 'Akademik Motor Senkronize', 
        description: `${newPlan.length} günlük takvim saniyeler içinde buluta işlendi.`,
        className: "bg-primary text-white rounded-2xl shadow-xl"
      });
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Hata', description: 'Plan üretilemedi.' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTaskAction = async (date: string, blockId: string, action: string) => {
    if (!db || !user || !studyPlan) return;
    
    if (action === 'edit') {
      const block = studyPlan.masterPlan.find((d: any) => d.date === date)?.blocks.find((b: any) => b.id === blockId);
      if (block) {
        setEditingBlock({ ...block, originalDate: date, date: date });
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

    await updateDoc(doc(db, 'studyPlans', user.uid), { 
      masterPlan: newPlan,
      updatedAt: serverTimestamp()
    });
  };

  const handleSaveEdit = async () => {
    if (!db || !user || !editingBlock) return;

    let newPlan = [...studyPlan.masterPlan];

    if (editingBlock.date && editingBlock.date !== editingBlock.originalDate) {
      newPlan = newPlan.map(day => {
        if (day.date === editingBlock.originalDate) {
          return { ...day, blocks: day.blocks.filter((b: any) => b.id !== editingBlock.id) };
        }
        return day;
      });

      newPlan = newPlan.map(day => {
        if (day.date === editingBlock.date) {
          return { ...day, blocks: [...(day.blocks || []), { ...editingBlock, originalDate: editingBlock.date }] };
        }
        return day;
      });
    } else {
      newPlan = newPlan.map(day => {
        if (day.date === editingBlock.originalDate) {
          return {
            ...day,
            blocks: day.blocks.map((b: any) => b.id === editingBlock.id ? { ...editingBlock } : b)
          };
        }
        return day;
      });
    }

    await updateDoc(doc(db, 'studyPlans', user.uid), { 
      masterPlan: newPlan, 
      updatedAt: serverTimestamp() 
    });

    setIsEditDialogOpen(false);
    toast({ title: 'Terminal Güncellendi', className: "bg-primary text-white rounded-xl shadow-2xl" });
  };

  return (
    <div className="p-4 md:p-14 space-y-12 max-w-[1800px] mx-auto w-full animate-in fade-in duration-1000 bg-[#F8FAFC]">
      <header className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-10">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
             <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-12 w-12 rounded-xl bg-white shadow-sm border border-slate-100 hover:bg-primary hover:text-white transition-all shadow-sm group">
                <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
             </Button>
             <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard')} className="h-12 w-12 rounded-xl bg-white shadow-sm border border-slate-100 hover:bg-primary hover:text-white transition-all shadow-sm">
                <Home className="h-5 w-5" />
             </Button>
          </div>
          <div className="space-y-2">
             <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-accent text-primary font-black text-[10px] uppercase tracking-widest shadow-xl shadow-accent/20 italic border border-accent/20">
                <Calendar className="h-3.5 w-3.5" /> MASTER ACADEMIC ENGINE v5.0
             </div>
             <h2 className="text-6xl font-black tracking-tighter italic text-primary uppercase leading-none text-shadow-premium">
                Akademik <br /><span className="text-accent text-shadow-accent">Terminal</span>
             </h2>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-6 items-center w-full xl:w-auto">
           <div className="grid grid-cols-2 gap-4 w-full sm:w-auto">
             <div className="space-y-2">
               <Label className="text-[10px] font-black uppercase opacity-40 ml-4 italic">BAŞLANGIÇ</Label>
               <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="h-16 rounded-2xl bg-white border-none shadow-xl font-bold text-sm px-6" />
             </div>
             <div className="space-y-2">
               <Label className="text-[10px] font-black uppercase opacity-40 ml-4 italic">BİTİŞ</Label>
               <Input type="date" min={startDate} value={endDate} onChange={(e) => setEndDate(e.target.value)} className="h-16 rounded-2xl bg-white border-none shadow-xl font-bold text-sm px-6" />
             </div>
           </div>
           <Button onClick={generateFasikulPlan} disabled={isGenerating} className="w-full sm:w-auto h-20 px-12 rounded-[2rem] bg-primary hover:bg-accent transition-all font-black text-xs uppercase tracking-widest gap-4 shadow-2xl text-white border-none">
              {isGenerating ? <Loader2 className="h-6 w-6 animate-spin" /> : <Sparkles className="h-6 w-6 text-accent" />} MOTORU ÇALIŞTIR
           </Button>
        </div>
      </header>

      <div className="space-y-24">
        {(studyPlan?.masterPlan || []).map((day: any) => (
          <div key={day.date} className="space-y-12">
             <div className="flex items-center gap-10 px-6">
                <h3 className="text-4xl font-black italic text-primary uppercase tracking-tighter">{format(parseISO(day.date), 'd MMMM yyyy', { locale: tr })}</h3>
                <div className="h-px flex-1 bg-slate-200 hidden md:block" />
                <Badge variant="outline" className="h-12 px-6 rounded-2xl font-black uppercase tracking-widest border-2 border-slate-100 text-primary">{day.day}</Badge>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 w-full">
                {day.blocks?.map((block: any) => (
                  <Card key={block.id} className={cn("p-10 rounded-[4rem] border-none shadow-xl transition-all hover:scale-[1.02] bg-white h-full flex flex-col", block.status === 'done' && "opacity-60")}>
                     <div className="space-y-8 h-full flex flex-col flex-1 relative z-10">
                        <div className="flex justify-between items-start gap-4">
                           <div className="space-y-1 flex-1">
                              <div className="flex items-center gap-2 mb-3">
                                <div className="px-3 py-1 rounded-lg bg-accent/10 text-accent flex items-center gap-1.5 border border-accent/20">
                                  <Clock className="h-3.5 w-3.5" />
                                  <span className="text-[10px] font-black">{block.phase1?.time || '10:00'}</span>
                                </div>
                                <p className="text-[8px] font-bold text-muted-foreground/40 uppercase tracking-[0.3em] italic">#{String(block.lesson || 'GENEL').substring(0, 3).toUpperCase()}</p>
                              </div>
                              <h4 className="text-2xl font-black italic leading-[0.9] tracking-tighter uppercase text-primary line-clamp-3">{block.topic || 'GENEL TEKRAR'}</h4>
                           </div>
                           <Badge 
                             className={cn(
                               "px-5 py-2 rounded-full text-[10px] font-black shrink-0", 
                               block.status === 'done' 
                                 ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" 
                                 : "bg-[#FF4D6D] text-white shadow-lg"
                             )}
                           >
                              {block.status === 'done' ? 'TAMAM' : 'BEK'}
                           </Badge>
                        </div>

                        <div className="p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100 space-y-6 shadow-inner flex-1">
                           {/* KONU ÇALIŞMA BÖLÜMÜ */}
                           <div className="space-y-4">
                              <div className="flex justify-between items-center border-b border-slate-200 pb-2.5">
                                 <span className="text-[9px] font-black text-primary/40 uppercase tracking-[0.2em] italic">KONU ÇALIŞMA</span>
                                 <div className="flex gap-1.5 bg-white/50 p-1.5 rounded-xl border border-slate-200 shadow-sm">
                                    {block.youtubeUrl && <a href={block.youtubeUrl} target="_blank" rel="noopener noreferrer" className="text-rose-500 hover:scale-110 transition-all"><Youtube className="h-4 w-4" /></a>}
                                    {block.pdfUrl && <a href={block.pdfUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:scale-110 transition-all"><FileText className="h-4 w-4" /></a>}
                                    {block.mebiUrl && <a href={block.mebiUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:scale-110 transition-all"><BookOpen className="h-4 w-4" /></a>}
                                 </div>
                              </div>
                           </div>

                           {/* TEST ÇÖZME BÖLÜMÜ */}
                           <div className="space-y-4">
                              <div className="flex justify-between items-center">
                                 <p className="text-[10px] font-black text-accent uppercase tracking-[0.2em] italic flex items-center gap-2">
                                    <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" /> TEST ÇÖZME
                                 </p>
                                 <div className="flex gap-1.5 bg-accent/10 p-1.5 rounded-xl border border-accent/20 shadow-sm">
                                    {block.testYoutubeUrl && <a href={block.testYoutubeUrl} target="_blank" rel="noopener noreferrer" className="text-rose-500 hover:scale-110 transition-all"><Youtube className="h-4 w-4" /></a>}
                                    {block.testPdfUrl && <a href={block.testPdfUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:scale-110 transition-all"><FileText className="h-4 w-4" /></a>}
                                    {block.testUrl && <a href={block.testUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:scale-110 transition-all"><BookOpen className="h-4 w-4" /></a>}
                                    {block.extraUrl && <a href={block.extraUrl} target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:scale-110 transition-all"><LinkIcon className="h-4 w-4" /></a>}
                                 </div>
                              </div>
                           </div>
                        </div>

                        <div className="flex justify-between gap-4 pt-8 mt-auto border-t border-slate-50">
                           <button onClick={() => handleTaskAction(day.date, block.id, 'done')} className={cn("h-14 w-14 rounded-full flex items-center justify-center transition-all", block.status === 'done' ? "bg-slate-100 text-slate-400 shadow-inner" : "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30")}><CheckCircle2 className="h-7 w-7" /></button>
                           <div className="flex gap-3">
                              <button onClick={() => handleTaskAction(day.date, block.id, 'edit')} className="h-14 w-14 rounded-full border-2 border-slate-100 flex items-center justify-center text-primary hover:border-primary transition-all shadow-sm"><Edit3 className="h-6 w-6" /></button>
                              <button onClick={() => handleTaskAction(day.date, block.id, 'delete')} className="h-14 w-14 rounded-full border-2 border-slate-100 flex items-center justify-center text-rose-500 hover:border-rose-500 transition-all shadow-sm"><Trash2 className="h-6 w-6" /></button>
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
        <DialogContent className="rounded-[4rem] border-none shadow-[0_60px_120px_-30px_rgba(15,23,42,0.3)] p-0 bg-white max-w-2xl overflow-hidden">
           <DialogHeader className="p-12 pb-0">
              <DialogTitle className="text-5xl font-black italic tracking-tighter text-primary uppercase">GÖREV <span className="text-accent">DÜZENLE</span></DialogTitle>
           </DialogHeader>

           {editingBlock && (
             <ScrollArea className="max-h-[85vh] p-12 pt-8">
                <div className="space-y-12 pb-10">
                   <div className="space-y-3">
                      <Label className="text-[11px] font-black uppercase tracking-[0.2em] opacity-40 ml-6 italic">KONU ADI</Label>
                      <div className="relative group">
                        <Input 
                          value={editingBlock.topic} 
                          onChange={(e) => setEditingBlock({...editingBlock, topic: e.target.value})} 
                          className="h-24 rounded-[2.5rem] bg-slate-50 border-[4px] border-transparent focus-visible:border-accent focus-visible:bg-white font-black text-3xl px-10 shadow-inner text-primary transition-all duration-500 italic" 
                        />
                        <Edit3 className="absolute right-8 top-1/2 -translate-y-1/2 h-8 w-8 text-accent opacity-20 group-focus-within:opacity-100 transition-opacity" />
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="space-y-3">
                         <Label className="text-[11px] font-black uppercase tracking-[0.2em] opacity-40 ml-6 italic">SEANS SAATİ</Label>
                         <div className="relative group">
                            <Clock className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-primary opacity-20 group-focus-within:text-accent transition-colors" />
                            <Input 
                              type="time" 
                              value={editingBlock.phase1?.time || '10:00'} 
                              onChange={(e) => setEditingBlock({...editingBlock, phase1: { ...editingBlock.phase1, time: e.target.value }})} 
                              className="h-20 rounded-3xl bg-slate-50 border-none font-black text-2xl pl-16 shadow-inner text-primary focus-visible:ring-2 focus-visible:ring-accent transition-all" 
                            />
                         </div>
                      </div>

                      <div className="space-y-3">
                         <Label className="text-[11px] font-black uppercase tracking-[0.2em] opacity-40 ml-6 italic">GÖREV TARİHİ</Label>
                         <div className="relative group">
                            <CalendarDays className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-primary opacity-20 group-focus-within:text-accent transition-colors" />
                            <Input 
                              type="date" 
                              value={editingBlock.date} 
                              onChange={(e) => setEditingBlock({...editingBlock, date: e.target.value})} 
                              className="h-20 rounded-3xl bg-slate-50 border-none font-black text-xl pl-16 shadow-inner text-primary focus-visible:ring-2 focus-visible:ring-accent transition-all" 
                            />
                         </div>
                      </div>
                   </div>

                   <div className="space-y-3">
                      <Label className="text-[11px] font-black uppercase tracking-[0.2em] opacity-40 ml-6 italic">BRANŞ / DERS</Label>
                      <Select 
                        value={editingBlock.lesson} 
                        onValueChange={(val) => setEditingBlock({...editingBlock, lesson: val})}
                      >
                         <SelectTrigger className="h-20 rounded-3xl bg-slate-50 border-none shadow-inner font-black text-xl px-8 text-primary focus:ring-accent">
                            <Layers className="h-6 w-6 mr-4 text-accent" />
                            <SelectValue placeholder="Ders Seçin" />
                         </SelectTrigger>
                         <SelectContent className="rounded-3xl border-none shadow-3xl max-h-[300px]">
                            {Object.keys(YKS_TM_TOPICS).map(lesson => (
                               <SelectItem key={lesson} value={lesson} className="font-bold py-4 italic">{lesson.toUpperCase()}</SelectItem>
                            ))}
                            <SelectItem value="GENEL" className="font-bold py-4 italic text-accent">GENEL TEKRAR / ANALİZ</SelectItem>
                         </SelectContent>
                      </Select>
                   </div>

                   <div className="space-y-8">
                      <div className="space-y-4">
                        <Label className="text-[11px] font-black uppercase tracking-[0.2em] opacity-40 ml-6 italic">KONU ÇALIŞMA KAYNAKLARI</Label>
                        {[
                          { key: 'youtubeUrl', label: 'YouTube Playlist', icon: Youtube, color: 'text-rose-500', bg: 'bg-rose-50' },
                          { key: 'pdfUrl', label: 'OGM Materyal / PDF', icon: FileText, color: 'text-blue-500', bg: 'bg-blue-50' },
                          { key: 'mebiUrl', label: 'MEBİ / EBA Terminal', icon: BookOpen, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                        ].map((item) => (
                           <div key={item.key} className="flex gap-4 items-center group">
                              <div className={cn("h-16 w-16 rounded-2xl flex items-center justify-center shrink-0 shadow-lg transition-transform group-hover:rotate-6", item.bg)}>
                                 <item.icon className={cn("h-8 w-8", item.color)} />
                              </div>
                              <Input 
                                value={editingBlock[item.key] || ''} 
                                onChange={(e) => setEditingBlock({...editingBlock, [item.key]: e.target.value})} 
                                className="h-16 rounded-2xl bg-slate-50 border-none px-8 shadow-inner flex-1 text-primary font-bold text-xs focus-visible:ring-accent" 
                                placeholder={item.label} 
                              />
                           </div>
                        ))}
                      </div>

                      <div className="space-y-4">
                        <Label className="text-[11px] font-black uppercase tracking-[0.2em] opacity-40 ml-6 italic">TEST ÇÖZME KAYNAKLARI</Label>
                        {[
                          { key: 'testYoutubeUrl', label: 'YouTube Soru Çözümü', icon: Youtube, color: 'text-rose-500', bg: 'bg-rose-50' },
                          { key: 'testPdfUrl', label: 'PDF Test / Fasikül', icon: FileText, color: 'text-blue-500', bg: 'bg-blue-50' },
                          { key: 'testUrl', label: 'EBA / MEBİ Test Terminali', icon: BookOpen, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                          { key: 'extraUrl', label: 'Ekstra Kaynak / URL', icon: LinkIcon, color: 'text-amber-500', bg: 'bg-amber-50' }
                        ].map((item) => (
                           <div key={item.key} className="flex gap-4 items-center group">
                              <div className={cn("h-16 w-16 rounded-2xl flex items-center justify-center shrink-0 shadow-lg transition-transform group-hover:rotate-6", item.bg)}>
                                 <item.icon className={cn("h-8 w-8", item.color)} />
                              </div>
                              <Input 
                                value={editingBlock[item.key] || ''} 
                                onChange={(e) => setEditingBlock({...editingBlock, [item.key]: e.target.value})} 
                                className="h-16 rounded-2xl bg-slate-50 border-none px-8 shadow-inner flex-1 text-primary font-bold text-xs focus-visible:ring-accent" 
                                placeholder={item.label} 
                              />
                           </div>
                        ))}
                      </div>
                   </div>

                   <div className="pt-10">
                      <Button 
                        onClick={handleSaveEdit}
                        className="w-full h-24 rounded-[2.75rem] bg-[#0F172A] hover:bg-accent text-white font-black text-xl uppercase tracking-[0.5em] gap-8 shadow-[0_40px_80px_-20px_rgba(15,23,42,0.4)] transition-all active:scale-95 border-none group/save"
                      >
                         <Save className="h-10 w-10 text-accent group-hover/save:animate-pulse" /> TERMİNALE KAYDET
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
