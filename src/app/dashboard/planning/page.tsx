
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
  Link as LinkIcon, FileQuestion, BarChart3, List,
  ArrowRight, X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { 
  format, addDays, parseISO, isBefore, 
  startOfMonth, endOfMonth, eachDayOfInterval, 
  isSameMonth, startOfToday, endOfToday, 
  startOfWeek, endOfWeek, isSameDay
} from 'date-fns';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type ViewMode = 'yearly' | 'monthly' | 'daily';

export default function PlanningPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  
  const { data: userData } = useDoc<any>(user?.uid ? `users/${user.uid}` : null);
  const { data: studyPlan } = useDoc<any>(user?.uid ? `studyPlans/${user.uid}` : null);
  
  const [viewMode, setViewMode] = useState<ViewMode>('monthly');
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date(2026, 8, 1));
  
  const [startDate, setStartDate] = useState('2026-09-04');
  const [endDate, setEndDate] = useState('2026-09-14');
  const [isReporting, setIsReporting] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<any>(null);

  const academicMonths = useMemo(() => [
    { label: 'EYL', date: new Date(2026, 8, 1) },
    { label: 'EKİ', date: new Date(2026, 9, 1) },
    { label: 'KAS', date: new Date(2026, 10, 1) },
    { label: 'ARA', date: new Date(2026, 11, 1) },
    { label: 'OCA', date: new Date(2027, 0, 1) },
    { label: 'ŞUB', date: new Date(2027, 1, 1) },
    { label: 'MAR', date: new Date(2027, 2, 1) },
    { label: 'NİS', date: new Date(2027, 3, 1) },
    { label: 'MAY', date: new Date(2027, 4, 1) },
    { label: 'HAZ', date: new Date(2027, 5, 1) }
  ], []);

  const calculateMonthStats = (monthDate: Date) => {
    if (!studyPlan?.masterPlan) return { total: 0, done: 0, percent: 0 };
    const monthStr = format(monthDate, 'yyyy-MM');
    const monthTasks = studyPlan.masterPlan.filter((d: any) => d.date.startsWith(monthStr));
    let total = 0;
    let done = 0;
    monthTasks.forEach((d: any) => {
      d.blocks?.forEach((b: any) => {
        total++;
        if (b.status === 'done') done++;
      });
    });
    return { total, done, percent: total > 0 ? Math.round((done / total) * 100) : 0 };
  };

  const filteredPlan = useMemo(() => {
    if (!studyPlan?.masterPlan) return [];
    if (viewMode === 'daily') {
      return studyPlan.masterPlan.filter((d: any) => 
        !isBefore(parseISO(d.date), parseISO(startDate)) && 
        !isBefore(parseISO(endDate), parseISO(d.date))
      );
    }
    if (viewMode === 'monthly') {
      const mStr = format(selectedMonth, 'yyyy-MM');
      return studyPlan.masterPlan.filter((d: any) => d.date.startsWith(mStr));
    }
    return [];
  }, [studyPlan, viewMode, startDate, endDate, selectedMonth]);

  const handleRunReport = () => {
    setIsReporting(true);
    setTimeout(() => {
      setIsReporting(false);
      toast({
        title: "Rapor Hazır",
        description: `${format(parseISO(startDate), 'd MMM')} - ${format(parseISO(endDate), 'd MMM')} arası otonom olarak analiz edildi.`,
        className: "bg-primary text-white rounded-[2rem] shadow-2xl"
      });
    }, 800);
  };

  const applyQuickFilter = (type: 'today' | 'week' | 'month' | 'term' | 'year') => {
    if (type === 'today') {
      const td = format(new Date(), 'yyyy-MM-dd');
      setStartDate(td);
      setEndDate(td);
    } else if (type === 'week') {
      setStartDate('2026-09-04');
      setEndDate('2026-09-11');
    } else if (type === 'month') {
      setStartDate(format(startOfMonth(selectedMonth), 'yyyy-MM-dd'));
      setEndDate(format(endOfMonth(selectedMonth), 'yyyy-MM-dd'));
    } else if (type === 'year') {
      setStartDate('2026-09-01');
      setEndDate('2027-06-15');
    }
    setViewMode('daily');
    handleRunReport();
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
    
    // Tarih değiştiyse eskisinden sil, yeniye ekle
    if (editingBlock.date && editingBlock.date !== editingBlock.originalDate) {
      newPlan = newPlan.map(day => day.date === editingBlock.originalDate 
        ? { ...day, blocks: day.blocks.filter((b: any) => b.id !== editingBlock.id) } 
        : day
      );
      newPlan = newPlan.map(day => day.date === editingBlock.date 
        ? { ...day, blocks: [...(day.blocks || []), { ...editingBlock, originalDate: editingBlock.date }] } 
        : day
      );
    } else {
      // Sadece içerik değiştiyse güncelle
      newPlan = newPlan.map(day => day.date === editingBlock.originalDate 
        ? { ...day, blocks: day.blocks.map((b: any) => b.id === editingBlock.id ? { ...editingBlock } : b) } 
        : day
      );
    }
    
    await updateDoc(doc(db, 'studyPlans', user.uid), { masterPlan: newPlan, updatedAt: serverTimestamp() });
    setIsEditDialogOpen(false);
    toast({ title: 'Terminal Güncellendi', className: "bg-primary text-white rounded-xl shadow-2xl" });
  };

  return (
    <div className="p-4 md:p-14 space-y-12 max-w-[1800px] mx-auto w-full animate-in fade-in duration-1000 bg-[#F8FAFC]">
      <header className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-10">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
             <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-12 w-12 rounded-xl bg-white shadow-sm border border-slate-100 hover:bg-primary hover:text-white transition-all group">
                <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
             </Button>
             <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard')} className="h-12 w-12 rounded-xl bg-white shadow-sm border border-slate-100 hover:bg-primary hover:text-white transition-all">
                <Home className="h-5 w-5" />
             </Button>
          </div>
          <div className="space-y-2">
             <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-accent text-primary font-black text-[10px] uppercase tracking-widest shadow-xl shadow-accent/20 italic border border-accent/20">
                <Calendar className="h-3.5 w-3.5" /> MASTER ACADEMIC TERMINAL v6.5
             </div>
             <h2 className="text-6xl font-black tracking-tighter italic text-primary uppercase leading-none text-shadow-premium">
                {format(selectedMonth, 'MMMM', { locale: tr })} <br /><span className="text-accent text-shadow-accent">{format(selectedMonth, 'yyyy')}</span>
             </h2>
          </div>
        </div>

        <div className="flex flex-col gap-6 w-full xl:w-auto">
          <div className="flex gap-2 bg-white/50 p-2 rounded-2xl border-2 border-primary/5 shadow-sm overflow-x-auto scrollbar-hide">
            {academicMonths.map((m, i) => (
              <button 
                key={i} 
                onClick={() => { setSelectedMonth(m.date); setViewMode('monthly'); }} 
                className={cn(
                  "h-12 px-6 rounded-xl font-black text-[10px] uppercase transition-all whitespace-nowrap", 
                  isSameMonth(m.date, selectedMonth) 
                    ? "bg-primary text-white shadow-xl scale-105" 
                    : "bg-white text-muted-foreground hover:bg-slate-50 border border-primary/5"
                )}
              >
                {m.label}
              </button>
            ))}
          </div>
          
          <div className="flex flex-wrap gap-4 items-end animate-in slide-in-from-top-4 duration-500">
             <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)} className="w-full sm:w-auto">
                <TabsList className="h-14 bg-white border-2 border-primary/5 rounded-2xl p-1.5 shadow-lg w-full sm:w-fit">
                  <TabsTrigger value="yearly" className="rounded-xl px-6 h-full font-black text-[9px] uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white gap-2"><BarChart3 className="h-4 w-4" /> Yıllık</TabsTrigger>
                  <TabsTrigger value="monthly" className="rounded-xl px-6 h-full font-black text-[9px] uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white gap-2"><Calendar className="h-4 w-4" /> Aylık</TabsTrigger>
                  <TabsTrigger value="daily" className="rounded-xl px-6 h-full font-black text-[9px] uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white gap-2"><List className="h-4 w-4" /> Günlük</TabsTrigger>
                </TabsList>
             </Tabs>
             <div className="flex gap-2 bg-white p-2 rounded-2xl border-2 border-primary/5 shadow-lg">
                <button onClick={() => applyQuickFilter('today')} className="h-10 px-4 rounded-xl font-black text-[9px] uppercase hover:bg-slate-50 transition-all">Bugün</button>
                <button onClick={() => applyQuickFilter('week')} className="h-10 px-4 rounded-xl font-black text-[9px] uppercase hover:bg-slate-50 transition-all">Hafta</button>
                <button onClick={() => applyQuickFilter('year')} className="h-10 px-4 rounded-xl font-black text-[9px] uppercase hover:bg-slate-50 transition-all">2027 Hedef</button>
             </div>
             <Button 
               onClick={handleRunReport}
               disabled={isReporting}
               className="h-14 px-10 rounded-xl bg-primary hover:bg-accent font-black text-[10px] uppercase tracking-widest gap-3 text-white shadow-xl transition-all active:scale-95"
             >
                {isReporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4 text-accent" />}
                RAPORU ÇALIŞTIR
             </Button>
          </div>
        </div>
      </header>

      {isReporting ? (
        <div className="py-40 flex flex-col items-center justify-center gap-6 animate-pulse">
           <div className="h-20 w-20 rounded-[2.5rem] bg-accent/20 border-4 border-accent flex items-center justify-center animate-spin">
              <Zap className="h-10 w-10 text-accent" />
           </div>
           <p className="text-sm font-black uppercase tracking-[0.4em] text-primary/40 italic">Otonom Veriler Analiz Ediliyor...</p>
        </div>
      ) : (
        <ScrollArea className="h-full">
          <div className="space-y-24 pb-20">
            {viewMode === 'yearly' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 animate-in zoom-in-95 duration-500 px-6">
                {academicMonths.map((m, i) => {
                  const stats = calculateMonthStats(m.date);
                  return (
                    <Card key={i} onClick={() => { setSelectedMonth(m.date); setViewMode('monthly'); }} className="p-8 rounded-[3rem] border-none shadow-xl bg-white hover:-translate-y-2 transition-all cursor-pointer group relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full translate-x-1/2 -translate-y-1/2 group-hover:bg-accent/10 transition-all" />
                      <div className="space-y-6 relative z-10">
                        <h4 className="text-2xl font-black italic text-primary uppercase tracking-tighter">{format(m.date, 'MMMM', { locale: tr })}</h4>
                        <div className="space-y-2">
                          <p className="text-[10px] font-black text-muted-foreground uppercase opacity-40">TAMAMLANMA</p>
                          <p className="text-4xl font-black italic text-primary">%{stats.percent}</p>
                          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                            <div className="h-full bg-accent transition-all duration-1000" style={{ width: `${stats.percent}%` }} />
                          </div>
                        </div>
                        <div className="pt-4 border-t border-slate-50 flex justify-between items-center">
                          <span className="text-[9px] font-black uppercase text-muted-foreground/40 italic">{format(m.date, 'yyyy-MM') >= '2026-12' ? 'TYT + AYT' : 'TYT TEMEL'}</span>
                          <ChevronRight className="h-4 w-4 text-accent group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}

            {viewMode === 'monthly' && (
              <div className="space-y-12 animate-in fade-in duration-700 px-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {filteredPlan.map((day: any) => (
                      <Card 
                        key={day.date} 
                        onClick={() => { setStartDate(day.date); setEndDate(day.date); setViewMode('daily'); }} 
                        className={cn(
                          "p-8 rounded-[3.5rem] border-none shadow-[0_20px_50px_-10px_rgba(0,0,0,0.05)] bg-white hover:scale-[1.03] transition-all cursor-pointer relative overflow-hidden group min-h-[280px] flex flex-col",
                          day.isAytDay && "border-2 border-accent/20"
                        )}
                      >
                         <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full translate-x-1/2 -translate-y-1/2 group-hover:bg-accent/5 transition-all" />
                         <div className="space-y-6 relative z-10 flex-1 flex flex-col">
                            <div className="flex justify-between items-start">
                               <div className="flex flex-col">
                                 <span className="text-[10px] font-black text-primary/30 uppercase tracking-widest leading-none mb-1">{day.day}</span>
                                 <span className="text-4xl font-black text-primary italic leading-none tracking-tighter">{format(parseISO(day.date), 'd')}</span>
                               </div>
                               {day.isAytDay && <Badge className="bg-accent text-primary font-black text-[8px] animate-pulse">🎯 AYT</Badge>}
                            </div>
                            <div className="space-y-3 flex-1">
                               {day.blocks?.map((b: any, bi: number) => (
                                 <div key={bi} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100/50 group-hover:bg-white group-hover:shadow-md transition-all">
                                    <div className="flex items-center gap-2 mb-1.5">
                                       <div className={cn("h-2 w-2 rounded-full", b.status === 'done' ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-slate-200")} />
                                       <span className="text-[9px] font-black uppercase text-primary/40 italic tracking-widest">{b.phase1?.time || '10:00'}</span>
                                    </div>
                                    <p className="text-[11px] font-black text-primary leading-tight uppercase line-clamp-1 italic tracking-tight">{b.topic}</p>
                                 </div>
                               ))}
                            </div>
                         </div>
                      </Card>
                    ))}
                 </div>
              </div>
            )}

            {viewMode === 'daily' && filteredPlan.map((day: any) => (
              <div key={day.date} className="space-y-12 px-6">
                 {day.isAytDay && (
                   <div className="p-8 rounded-[3rem] bg-accent text-primary flex items-center justify-between shadow-2xl animate-pulse">
                      <div className="flex items-center gap-6">
                         <div className="h-16 w-16 rounded-[1.75rem] bg-white flex items-center justify-center"><Target className="h-10 w-10 text-accent" /></div>
                         <div><h3 className="text-3xl font-black italic tracking-tighter uppercase leading-none">AYT PROGRAMI BAŞLADI</h3><p className="text-sm font-bold opacity-60 italic mt-1">TYT çalışmalarına devam ederken AYT konu programı otonom olarak aktif hale geldi.</p></div>
                      </div>
                      <Badge className="bg-primary text-white h-12 px-8 rounded-2xl font-black text-xs uppercase tracking-widest">01 ARALIK</Badge>
                   </div>
                 )}
                 <div className="flex items-center gap-10">
                    <h3 className="text-4xl font-black italic text-primary uppercase tracking-tighter">{format(parseISO(day.date), 'd MMMM yyyy', { locale: tr })}</h3>
                    <div className="h-px flex-1 bg-slate-200 hidden md:block" />
                    <Badge variant="outline" className="h-12 px-6 rounded-2xl font-black uppercase tracking-widest border-2 border-slate-100 text-primary">{day.day}</Badge>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 w-full">
                    {day.blocks?.map((block: any) => (
                      <Card key={block.id} className={cn("p-10 rounded-[4rem] border-none shadow-xl transition-all hover:scale-[1.02] bg-white h-full flex flex-col group relative overflow-hidden", block.status === 'done' && "opacity-60")}>
                         <div className="space-y-8 h-full flex flex-col flex-1 relative z-10">
                            <div className="flex justify-between items-start gap-4">
                               <div className="space-y-1 flex-1">
                                  <div className="flex items-center gap-2 mb-3">
                                    <div className="px-3 py-1 rounded-lg bg-accent/10 text-accent flex items-center gap-1.5 border border-accent/20">
                                      <Clock className="h-3.5 w-3.5" />
                                      <span className="text-[10px] font-black">{block.phase1?.time || '10:00'}</span>
                                    </div>
                                    <p className="text-[8px] font-bold text-muted-foreground/40 uppercase tracking-[0.3em] italic">#{String(block.lesson || 'GENEL').substring(0, 4).toUpperCase()}</p>
                                  </div>
                                  <h4 className="text-2xl font-black italic leading-[0.9] tracking-tighter uppercase text-primary line-clamp-3">{block.topic}</h4>
                               </div>
                               <Badge className={cn("px-5 py-2 rounded-full text-[10px] font-black shrink-0 shadow-lg", block.status === 'done' ? "bg-emerald-500 text-white" : "bg-rose-500 text-white")}>
                                  {block.status === 'done' ? 'TAMAM' : 'BEK'}
                               </Badge>
                            </div>

                            <div className="p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100 space-y-6 flex-1 shadow-inner">
                               <div className="space-y-3">
                                  <div className="flex justify-between items-center border-b border-slate-200 pb-2.5">
                                     <span className="text-[9px] font-black text-primary/40 uppercase tracking-[0.2em] italic">KONU ÇALIŞMA</span>
                                     <div className="flex gap-2">
                                        {block.youtubeUrl && <a href={block.youtubeUrl} target="_blank" className="text-rose-500 hover:scale-125 transition-all"><Youtube className="h-4 w-4" /></a>}
                                        {block.mebiUrl && <a href={block.mebiUrl} target="_blank" className="text-emerald-500 hover:scale-125 transition-all"><BookOpen className="h-4 w-4" /></a>}
                                        {block.pdfUrl && <a href={block.pdfUrl} target="_blank" className="text-blue-500 hover:scale-125 transition-all"><FileText className="h-4 w-4" /></a>}
                                        {block.konuExtraUrl && <a href={block.konuExtraUrl} target="_blank" className="text-amber-500 hover:scale-125 transition-all"><LinkIcon className="h-4 w-4" /></a>}
                                     </div>
                                  </div>
                               </div>
                               <div className="space-y-3">
                                  <div className="flex justify-between items-center">
                                     <p className="text-[10px] font-black text-accent uppercase tracking-[0.2em] italic flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" /> TEST ÇÖZME</p>
                                     <div className="flex gap-2">
                                        {block.testYoutubeUrl && <a href={block.testYoutubeUrl} target="_blank" className="text-rose-500 hover:scale-125 transition-all"><Youtube className="h-4 w-4" /></a>}
                                        {block.testUrl && <a href={block.testUrl} target="_blank" className="text-emerald-500 hover:scale-125 transition-all"><BookOpen className="h-4 w-4" /></a>}
                                        {block.testPdfUrl && <a href={block.testPdfUrl} target="_blank" className="text-blue-500 hover:scale-125 transition-all"><FileText className="h-4 w-4" /></a>}
                                        {block.extraUrl && <a href={block.extraUrl} target="_blank" className="text-amber-500 hover:scale-125 transition-all"><LinkIcon className="h-4 w-4" /></a>}
                                     </div>
                                  </div>
                               </div>
                            </div>

                            <div className="flex justify-between gap-4 pt-8 border-t border-slate-50 mt-auto">
                               <button onClick={() => handleTaskAction(day.date, block.id, 'done')} className={cn("h-14 w-14 rounded-full flex items-center justify-center transition-all", block.status === 'done' ? "bg-slate-100 text-slate-400 shadow-inner" : "bg-emerald-500 text-white shadow-xl")}><CheckCircle2 className="h-7 w-7" /></button>
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
        </ScrollArea>
      )}

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="rounded-[4rem] border-none shadow-2xl p-0 bg-white max-w-2xl overflow-hidden">
           <DialogHeader className="p-12 pb-0 flex flex-row items-center justify-between">
              <DialogTitle className="text-5xl font-black italic tracking-tighter text-primary uppercase">GÖREV <span className="text-accent">DÜZENLE</span></DialogTitle>
              <Button variant="ghost" size="icon" onClick={() => setIsEditDialogOpen(false)} className="rounded-full h-12 w-12 bg-slate-50"><X className="h-6 w-6" /></Button>
           </DialogHeader>
           {editingBlock && (
             <ScrollArea className="max-h-[85vh] p-12 pt-8">
                <div className="space-y-12 pb-10">
                   <div className="space-y-3">
                      <Label className="text-[11px] font-black uppercase tracking-[0.2em] opacity-40 ml-6 italic">KONU ADI</Label>
                      <Input value={editingBlock.topic} onChange={(e) => setEditingBlock({...editingBlock, topic: e.target.value})} className="h-20 rounded-3xl bg-slate-50 border-none font-black text-2xl px-10 shadow-inner focus-visible:ring-accent" />
                   </div>

                   <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-3">
                         <Label className="text-[11px] font-black uppercase tracking-[0.2em] opacity-40 ml-6 italic">SAAT</Label>
                         <div className="relative group">
                            <Input type="time" value={editingBlock.phase1?.time || '10:00'} onChange={(e) => setEditingBlock({...editingBlock, phase1: { ...editingBlock.phase1, time: e.target.value }})} className="h-16 rounded-2xl bg-slate-50 border-none font-black text-xl px-10 shadow-inner focus-visible:ring-accent" />
                            <Clock className="absolute right-6 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/20 group-focus-within:text-accent" />
                         </div>
                      </div>
                      <div className="space-y-3">
                         <Label className="text-[11px] font-black uppercase tracking-[0.2em] opacity-40 ml-6 italic">TARİH</Label>
                         <div className="relative group">
                            <Input type="date" value={editingBlock.date} onChange={(e) => setEditingBlock({...editingBlock, date: e.target.value})} className="h-16 rounded-2xl bg-slate-50 border-none font-black text-sm px-10 shadow-inner focus-visible:ring-accent" />
                            <Calendar className="absolute right-6 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/20 group-focus-within:text-accent" />
                         </div>
                      </div>
                   </div>

                   <div className="space-y-8">
                      <div className="flex items-center gap-4 ml-6">
                         <span className="h-3 w-3 rounded-full bg-primary" />
                         <h4 className="text-sm font-black uppercase tracking-widest text-primary italic">KONU ÇALIŞMA KAYNAKLARI</h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="space-y-2">
                            <Label className="text-[9px] font-black uppercase opacity-30 ml-6 italic">YOUTUBE (KONU)</Label>
                            <div className="relative group">
                               <Youtube className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-rose-500 opacity-40 group-focus-within:opacity-100" />
                               <Input value={editingBlock.youtubeUrl || ''} onChange={(e) => setEditingBlock({...editingBlock, youtubeUrl: e.target.value})} className="h-14 rounded-2xl bg-slate-50 border-none shadow-inner pl-14 text-xs" placeholder="Video Linki" />
                            </div>
                         </div>
                         <div className="space-y-2">
                            <Label className="text-[9px] font-black uppercase opacity-30 ml-6 italic">MEBİ / EBA (KONU)</Label>
                            <div className="relative group">
                               <BookOpen className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500 opacity-40 group-focus-within:opacity-100" />
                               <Input value={editingBlock.mebiUrl || ''} onChange={(e) => setEditingBlock({...editingBlock, mebiUrl: e.target.value})} className="h-14 rounded-2xl bg-slate-50 border-none shadow-inner pl-14 text-xs" placeholder="Konu Anlatım" />
                            </div>
                         </div>
                         <div className="space-y-2">
                            <Label className="text-[9px] font-black uppercase opacity-30 ml-6 italic">PDF (KONU)</Label>
                            <div className="relative group">
                               <FileText className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-500 opacity-40 group-focus-within:opacity-100" />
                               <Input value={editingBlock.pdfUrl || ''} onChange={(e) => setEditingBlock({...editingBlock, pdfUrl: e.target.value})} className="h-14 rounded-2xl bg-slate-50 border-none shadow-inner pl-14 text-xs" placeholder="Ders Notu PDF" />
                            </div>
                         </div>
                         <div className="space-y-2">
                            <Label className="text-[9px] font-black uppercase opacity-30 ml-6 italic">KONU EXTRA</Label>
                            <div className="relative group">
                               <LinkIcon className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-500 opacity-40 group-focus-within:opacity-100" />
                               <Input value={editingBlock.konuExtraUrl || ''} onChange={(e) => setEditingBlock({...editingBlock, konuExtraUrl: e.target.value})} className="h-14 rounded-2xl bg-slate-50 border-none shadow-inner pl-14 text-xs" placeholder="Extra Kaynak" />
                            </div>
                         </div>
                      </div>
                   </div>

                   <div className="space-y-8">
                      <div className="flex items-center gap-4 ml-6">
                         <span className="h-3 w-3 rounded-full bg-accent" />
                         <h4 className="text-sm font-black uppercase tracking-widest text-accent italic">TEST ÇÖZME KAYNAKLARI</h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="space-y-2">
                            <Label className="text-[9px] font-black uppercase opacity-30 ml-6 italic">YOUTUBE (ÇÖZÜM)</Label>
                            <div className="relative group">
                               <Youtube className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-rose-500 opacity-40 group-focus-within:opacity-100" />
                               <Input value={editingBlock.testYoutubeUrl || ''} onChange={(e) => setEditingBlock({...editingBlock, testYoutubeUrl: e.target.value})} className="h-14 rounded-2xl bg-slate-50 border-none shadow-inner pl-14 text-xs" placeholder="Soru Çözüm Videosu" />
                            </div>
                         </div>
                         <div className="space-y-2">
                            <Label className="text-[9px] font-black uppercase opacity-30 ml-6 italic">MEBİ / EBA (SORU)</Label>
                            <div className="relative group">
                               <BookOpen className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500 opacity-40 group-focus-within:opacity-100" />
                               <Input value={editingBlock.testUrl || ''} onChange={(e) => setEditingBlock({...editingBlock, testUrl: e.target.value})} className="h-14 rounded-2xl bg-slate-50 border-none shadow-inner pl-14 text-xs" placeholder="EBA Test Linki" />
                            </div>
                         </div>
                         <div className="space-y-2">
                            <Label className="text-[9px] font-black uppercase opacity-30 ml-6 italic">PDF (TEST)</Label>
                            <div className="relative group">
                               <FileText className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-500 opacity-40 group-focus-within:opacity-100" />
                               <Input value={editingBlock.testPdfUrl || ''} onChange={(e) => setEditingBlock({...editingBlock, testPdfUrl: e.target.value})} className="h-14 rounded-2xl bg-slate-50 border-none shadow-inner pl-14 text-xs" placeholder="Yaprak Test PDF" />
                            </div>
                         </div>
                         <div className="space-y-2">
                            <Label className="text-[9px] font-black uppercase opacity-30 ml-6 italic">TEST EXTRA</Label>
                            <div className="relative group">
                               <LinkIcon className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-500 opacity-40 group-focus-within:opacity-100" />
                               <Input value={editingBlock.extraUrl || ''} onChange={(e) => setEditingBlock({...editingBlock, extraUrl: e.target.value})} className="h-14 rounded-2xl bg-slate-50 border-none shadow-inner pl-14 text-xs" placeholder="Extra Link" />
                            </div>
                         </div>
                      </div>
                   </div>

                   <Button onClick={handleSaveEdit} className="w-full h-24 rounded-[2.75rem] bg-primary hover:bg-accent text-white font-black text-xl uppercase tracking-[0.4em] gap-8 shadow-2xl transition-all">
                      <Save className="h-10 w-10 text-accent" /> TERMİNALE KAYDET
                   </Button>
                </div>
             </ScrollArea>
           )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
