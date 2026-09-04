
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useUser, useDoc, useFirestore } from '@/firebase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Calendar, Zap, Loader2, Sparkles, 
  ArrowLeft, Home, Edit3, Youtube, Save, FileText, 
  BookOpen, X, Clock, Target, TrendingUp, Award, Brain,
  ChevronRight, ListFilter, LayoutGrid, CalendarDays, CheckCircle2, AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { doc, updateDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { format, parseISO, isBefore, isSameMonth, addDays, startOfWeek, endOfWeek, isWithinInterval, startOfMonth, endOfMonth } from 'date-fns';
import { tr } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { generateAdaptivePlan } from '@/app/dashboard/page';

type ViewMode = 'annual' | 'monthly' | 'daily';

export default function PlanningPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  
  const { data: userData } = useDoc<any>(user?.uid ? `users/${user.uid}` : null);
  const { data: studyPlan, loading: planLoading } = useDoc<any>(user?.uid ? `studyPlans/${user.uid}` : null);
  
  const [viewMode, setViewMode] = useState<ViewMode>('daily');
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date(2026, 8, 1)); // Eylül 2026 default
  const [startDate, setStartDate] = useState('2026-09-01');
  const [endDate, setEndDate] = useState('2026-09-14'); // Varsayılan 2 haftalık görünüm
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<any>(null);

  useEffect(() => {
    if (studyPlan?.startDate) setStartDate(studyPlan.startDate);
    if (studyPlan?.endDate) setEndDate(studyPlan.endDate);
  }, [studyPlan]);

  const academicMonths = useMemo(() => [
    { label: 'EYLÜL', date: new Date(2026, 8, 1) },
    { label: 'EKİM', date: new Date(2026, 9, 1) },
    { label: 'KASIM', date: new Date(2026, 10, 1) },
    { label: 'ARALIK', date: new Date(2026, 11, 1), isAyt: true },
    { label: 'OCAK', date: new Date(2027, 0, 1) },
    { label: 'ŞUBAT', date: new Date(2027, 1, 1) },
    { label: 'MART', date: new Date(2027, 2, 1) },
    { label: 'NİSAN', date: new Date(2027, 3, 1) },
    { label: 'MAYIS', date: new Date(2027, 4, 1) },
    { label: 'HAZİRAN', date: new Date(2027, 5, 1) }
  ], []);

  const filteredPlan = useMemo(() => {
    if (!studyPlan?.masterPlan) return [];
    if (viewMode === 'daily') {
      return studyPlan.masterPlan.filter((d: any) => 
        !isBefore(parseISO(d.date), parseISO(startDate)) && 
        !isBefore(parseISO(endDate), parseISO(d.date))
      );
    }
    const mStr = format(selectedMonth, 'yyyy-MM');
    return studyPlan.masterPlan.filter((d: any) => d.date.startsWith(mStr));
  }, [studyPlan, viewMode, startDate, endDate, selectedMonth]);

  const stats = useMemo(() => {
    if (!studyPlan?.masterPlan) return { planned: 0, completed: 0, missing: 0, rate: 0 };
    
    const relevantPlan = viewMode === 'monthly' 
      ? studyPlan.masterPlan.filter((d: any) => d.date.startsWith(format(selectedMonth, 'yyyy-MM')))
      : studyPlan.masterPlan.filter((d: any) => !isBefore(parseISO(d.date), parseISO(startDate)) && !isBefore(parseISO(endDate), parseISO(d.date)));

    const total = relevantPlan.reduce((acc: number, day: any) => acc + (day.blocks?.length || 0), 0);
    const done = relevantPlan.reduce((acc: number, day: any) => acc + (day.blocks?.filter((b: any) => b.status === 'done' || b.status === 'completed').length || 0), 0);
    
    return {
      planned: total,
      completed: done,
      missing: total - done,
      rate: Math.round((done / (total || 1)) * 100)
    };
  }, [studyPlan, selectedMonth, viewMode, startDate, endDate]);

  const handleRegeneratePlan = async () => {
    if (!db || !user || !userData) return;
    setIsRegenerating(true);
    try {
      // Yıllık planı 1 Eylül'den başlayarak tekrar kurgula
      const newPlan = generateAdaptivePlan('2026-09-01', userData.completedTopics || {});
      
      await setDoc(doc(db, 'studyPlans', user.uid), {
        userId: user.uid,
        startDate: startDate,
        endDate: endDate,
        masterPlan: newPlan,
        updatedAt: serverTimestamp()
      }, { merge: true });

      toast({ 
        title: "TERMİNAL MÜHÜRLENDİ", 
        description: "Yıllık akademik strateji saniyeler içinde yeni miladına göre kurgulandı.",
        className: "bg-accent text-primary rounded-2xl font-black shadow-2xl border-none" 
      });
    } catch (e) { 
      console.error(e);
      toast({ variant: 'destructive', title: 'Hata', description: 'Plan kurgulanamadı.' }); 
    } finally { 
      setIsRegenerating(false); 
    }
  };

  const handleSaveEdit = async () => {
    if (!db || !user || !editingBlock || !studyPlan) return;
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
    setIsEditDialogOpen(false);
    toast({ title: 'Terminal Güncellendi', className: "bg-primary text-white rounded-2xl shadow-2xl" });
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
             <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-accent text-primary font-black text-[10px] uppercase tracking-widest shadow-xl shadow-accent/20 italic border border-accent/20"><Calendar className="h-3.5 w-3.5" /> MEMORY SYNC v28.0</div>
             <h2 className="text-6xl md:text-[7rem] font-black tracking-tighter italic text-primary uppercase leading-[0.8] text-shadow-premium">Akademik <br /><span className="text-accent text-shadow-accent">Terminal</span></h2>
          </div>
        </div>

        <div className="flex flex-col gap-8 w-full xl:w-auto">
          <Card className="p-10 rounded-[4rem] border-none shadow-[0_60px_120px_-30px_rgba(15,23,42,0.15)] bg-white flex flex-wrap gap-10 items-end justify-center md:justify-start relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
             
             <div className="space-y-3 relative z-10">
                <Label className="text-[11px] font-black uppercase tracking-[0.3em] opacity-40 ml-4 italic text-primary">BAŞLANGIÇ</Label>
                <Input 
                  type="date" 
                  value={startDate} 
                  onChange={(e) => { setStartDate(e.target.value); setViewMode('daily'); }} 
                  className="h-20 w-[240px] rounded-3xl bg-slate-50 border-none font-black text-lg px-8 shadow-inner focus-visible:ring-accent transition-all" 
                />
             </div>

             <div className="space-y-3 relative z-10">
                <Label className="text-[11px] font-black uppercase tracking-[0.3em] opacity-40 ml-4 italic text-primary">BİTİŞ</Label>
                <Input 
                  type="date" 
                  value={endDate} 
                  onChange={(e) => { setEndDate(e.target.value); setViewMode('daily'); }} 
                  className="h-20 w-[240px] rounded-3xl bg-slate-50 border-none font-black text-lg px-8 shadow-inner focus-visible:ring-accent transition-all" 
                />
             </div>

             <Button 
               onClick={handleRegeneratePlan} 
               disabled={isRegenerating} 
               className="h-20 px-12 rounded-[2rem] bg-primary hover:bg-accent text-white font-black text-[12px] uppercase tracking-[0.2em] gap-5 shadow-[0_30px_60px_-15px_rgba(15,23,42,0.4)] transition-all active:scale-95 relative z-10 border-none"
             >
                {isRegenerating ? <Loader2 className="h-6 w-6 animate-spin" /> : <Sparkles className="h-6 w-6 animate-pulse text-accent" />} RAPORU ÇALIŞTIR
             </Button>
          </Card>
          
          <div className="flex gap-2 bg-white p-3 rounded-3xl border border-primary/5 shadow-xl overflow-x-auto scrollbar-hide max-w-full">
             <button onClick={() => setViewMode('annual')} className={cn("h-14 px-6 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all", viewMode === 'annual' ? "bg-primary text-white" : "bg-transparent text-primary/40 hover:bg-slate-50")}>TÜM YIL</button>
             <div className="w-px h-8 bg-slate-100 my-auto mx-2" />
             {academicMonths.map((m, i) => (
               <button 
                 key={i} 
                 onClick={() => { setSelectedMonth(m.date); setViewMode('monthly'); }} 
                 className={cn(
                   "h-14 min-w-[100px] px-6 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all whitespace-nowrap flex items-center justify-center gap-2", 
                   isSameMonth(m.date, selectedMonth) && viewMode === 'monthly' 
                     ? "bg-primary text-white shadow-xl scale-105" 
                     : "bg-transparent text-primary/40 hover:bg-slate-50 border border-transparent",
                   m.isAyt && "text-accent"
                 )}
               >
                 {m.label} {m.isAyt && <Zap className="h-3 w-3 fill-current" />}
               </button>
             ))}
          </div>
        </div>
      </header>

      {/* ANALİTİK ÖZET KARTLARI - "KARTLAR NEREDE" ÇÖZÜMÜ */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
         {[
           { label: 'İLERLEME', val: `%${stats.rate}`, sub: 'GENEL BAŞARI', color: 'primary', icon: Target },
           { label: 'PLANLANAN', val: stats.planned, sub: 'TOPLAM GÖREV', color: 'accent', icon: Calendar },
           { label: 'TAMAMLANAN', val: stats.completed, sub: 'MÜHÜRLENEN', color: 'primary', icon: CheckCircle2 },
           { label: 'EKSİK', val: stats.missing, sub: 'KRİTİK YOLLAR', color: 'accent', icon: AlertCircle },
           { label: 'DURUM', val: stats.rate > 70 ? 'STABİL' : 'RİSKLİ', sub: 'AI ANALİZİ', color: 'primary', icon: Brain },
         ].map((item, i) => (
           <Card key={i} className="premium-card p-8 border border-primary/5 group relative overflow-hidden bg-white">
              <div className="space-y-6 relative z-10">
                 <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center text-white shadow-lg", item.color === 'accent' ? 'bg-accent' : 'bg-primary')}>
                    <item.icon className="h-6 w-6" />
                 </div>
                 <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-1 italic">{item.label}</p>
                    <p className="text-4xl font-black text-primary italic tracking-tighter">{item.val}</p>
                    <p className="text-[8px] font-bold text-muted-foreground/30 uppercase mt-1.5 tracking-widest">{item.sub}</p>
                 </div>
              </div>
           </Card>
         ))}
      </div>

      <div className="space-y-24 pb-20">
        {viewMode === 'annual' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-10">
             {academicMonths.map((m, i) => {
               const mStr = format(m.date, 'yyyy-MM');
               const mData = studyPlan?.masterPlan?.filter((d: any) => d.date.startsWith(mStr)) || [];
               const mTotal = mData.reduce((acc: number, day: any) => acc + (day.blocks?.length || 0), 0);
               const mDone = mData.reduce((acc: number, day: any) => acc + (day.blocks?.filter((b: any) => b.status === 'done' || b.status === 'completed').length || 0), 0);
               const mRate = Math.round((mDone / (mTotal || 1)) * 100);

               return (
                <Card key={i} className="p-10 rounded-[3.5rem] bg-white border border-primary/5 shadow-xl group hover:scale-[1.02] transition-all">
                   <div className="flex justify-between items-center mb-8">
                      <div className="flex items-center gap-4">
                         <span className="text-4xl font-black text-primary italic tracking-tighter">{m.label}</span>
                         {m.isAyt && <Badge className="bg-accent text-primary font-black text-[9px] px-3 py-1 rounded-full">AYT BAŞLANGICI</Badge>}
                      </div>
                      <span className="text-2xl font-black text-accent">%{mRate}</span>
                   </div>
                   <Progress value={mRate} className="h-3 bg-slate-50" />
                   <div className="mt-6 flex justify-between text-[10px] font-black uppercase tracking-widest text-primary/30 italic">
                      <span>{mDone} TAMAMLANDI</span>
                      <span>{mTotal} PLANLANDI</span>
                   </div>
                </Card>
               );
             })}
          </div>
        ) : (
          <div className="space-y-20">
            {filteredPlan.map((day: any) => (
              <div key={day.date} className="space-y-16">
                 <div className="flex items-center gap-10">
                    <h3 className="text-5xl md:text-6xl font-black italic text-primary uppercase tracking-tighter">{format(parseISO(day.date), 'd MMMM yyyy', { locale: tr })}</h3>
                    <div className="h-px flex-1 bg-slate-200" />
                    <Badge variant="outline" className="h-14 px-8 rounded-3xl font-black uppercase border-2 border-slate-100 text-primary text-[14px]">{day.day}</Badge>
                 </div>
                 
                 {/* DAILY GRID - SIMETRİK 4 KART */}
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-10">
                    {day.blocks?.map((block: any) => (
                      <Card key={block.id} className={cn("p-12 md:p-14 rounded-[5.5rem] border-none shadow-[0_60px_120px_-30px_rgba(15,23,42,0.15)] transition-all hover:scale-[1.03] bg-white h-full flex flex-col group relative overflow-hidden", (block.status === 'done' || block.status === 'completed') && "opacity-60")}>
                         <div className="space-y-14 relative z-10 flex-1 flex flex-col">
                            <div className="flex justify-between items-center">
                               <div className="flex items-center gap-6">
                                  <div className="px-7 py-3 rounded-[1.5rem] bg-[#FFF8E7] text-[#0F172A] flex items-center gap-3 border border-[#FEF3C7] shadow-sm">
                                    <Clock className="h-5 w-5 text-accent" />
                                    <span className="text-[16px] font-black">{block.phase1?.time || '10:00'}</span>
                                  </div>
                                  <span className="text-[14px] font-black text-primary/10 uppercase tracking-[0.2em] italic">#{String(block.lesson).includes('AYT') ? 'AYT' : 'TYT'}</span>
                               </div>
                               <Badge className={cn("px-8 py-3.5 rounded-[1.5rem] text-[12px] font-black shadow-xl", (block.status === 'done' || block.status === 'completed') ? "bg-emerald-500 text-white" : "bg-[#FF4D6D] text-white")}>
                                 {(block.status === 'done' || block.status === 'completed') ? 'TAMAM' : 'BEK'}
                               </Badge>
                            </div>

                            <div className="flex-1 flex items-center justify-center py-6">
                               <h4 className="text-[5rem] md:text-[8.5rem] font-black italic leading-[0.8] tracking-tighter uppercase text-primary text-shadow-premium text-center break-words max-w-full">
                                  {block.topic.length > 8 ? block.topic.substring(0, 7) + ".." : block.topic}
                               </h4>
                            </div>

                            <div className="bg-[#F8FAFC]/50 rounded-[4.5rem] p-12 space-y-12 border border-slate-50 shadow-inner">
                               <div className="space-y-5">
                                  <div className="flex items-center justify-between">
                                     <span className="text-[12px] font-black text-primary/20 uppercase tracking-[0.3em] italic">KONU ÇALIŞMA</span>
                                     <div className="flex gap-5 items-center">
                                        {block.youtubeUrl && <a href={block.youtubeUrl} target="_blank" className="hover:scale-110 transition-all"><Youtube className="h-6 w-6 text-rose-500 opacity-60" /></a>}
                                        {block.pdfUrl && <a href={block.pdfUrl} target="_blank" className="hover:scale-110 transition-all"><FileText className="h-6 w-6 text-blue-500 opacity-60" /></a>}
                                        {block.mebiUrl && <a href={block.mebiUrl} target="_blank" className="hover:scale-110 transition-all"><BookOpen className="h-6 w-6 text-emerald-500 opacity-60" /></a>}
                                     </div>
                                  </div>
                               </div>
                               <div className="h-px w-full bg-slate-200/40" />
                               <div className="space-y-5">
                                  <div className="flex items-center justify-between">
                                     <div className="flex items-center gap-3">
                                        <div className="h-2.5 w-2.5 rounded-full bg-accent shadow-[0_0_15px_rgba(245,158,11,0.6)]" />
                                        <span className="text-[13px] font-black text-accent uppercase tracking-[0.3em] italic">TEST ÇÖZME</span>
                                     </div>
                                     <div className="flex gap-5 items-center">
                                        {block.testYoutubeUrl && <a href={block.testYoutubeUrl} target="_blank" className="hover:scale-110 transition-all"><Youtube className="h-6 w-6 text-rose-500 opacity-80" /></a>}
                                        {block.testUrl && <a href={block.testUrl} target="_blank" className="hover:scale-110 transition-all"><BookOpen className="h-6 w-6 text-emerald-500 opacity-80" /></a>}
                                        {block.testPdfUrl && <a href={block.testPdfUrl} target="_blank" className="hover:scale-110 transition-all"><FileText className="h-6 w-6 text-blue-500 opacity-80" /></a>}
                                     </div>
                                  </div>
                               </div>
                            </div>
                            <div className="flex gap-4 pt-4 mt-auto">
                               <Button onClick={() => { setEditingBlock({...block, date: day.date}); setIsEditDialogOpen(true); }} className="flex-1 h-20 rounded-3xl bg-primary text-white font-black uppercase text-[12px] tracking-widest gap-4 shadow-2xl">DÜZENLE <Edit3 className="h-6 w-6 text-accent" /></Button>
                            </div>
                         </div>
                      </Card>
                    ))}
                 </div>
              </div>
            ))}
            {filteredPlan.length === 0 && (
              <div className="py-40 text-center space-y-8 animate-in zoom-in-95 duration-700">
                <div className="h-32 w-32 bg-primary/5 rounded-[3rem] flex items-center justify-center mx-auto shadow-inner">
                  <Zap className="h-16 w-16 text-primary opacity-20" />
                </div>
                <p className="text-2xl font-black uppercase tracking-[0.5em] italic text-primary/20">Seçili tarihlerde veri bulunamadı.</p>
              </div>
            )}
          </div>
        )}
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="rounded-[4rem] border-none shadow-2xl p-12 bg-white max-w-2xl overflow-hidden">
           <DialogHeader className="flex flex-row items-center justify-between">
              <DialogTitle className="text-5xl font-black italic tracking-tighter text-primary uppercase">GÖREV <span className="text-accent">DÜZENLE</span></DialogTitle>
              <Button variant="ghost" size="icon" onClick={() => setIsEditDialogOpen(false)} className="rounded-full h-12 w-12 bg-slate-50"><X className="h-6 w-6" /></Button>
           </DialogHeader>
           {editingBlock && (
             <div className="space-y-10 pt-8">
                <div className="space-y-3"><Label className="text-[11px] font-black uppercase opacity-40 ml-6 italic">KONU ADI</Label><Input value={editingBlock.topic} onChange={(e) => setEditingBlock({...editingBlock, topic: e.target.value})} className="h-16 rounded-2xl bg-slate-50 border-none font-black text-xl px-10 shadow-inner" /></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-3"><Label className="text-[10px] font-bold uppercase opacity-40 ml-4">YOUTUBE KONU</Label><Input value={editingBlock.youtubeUrl || ''} onChange={(e) => setEditingBlock({...editingBlock, youtubeUrl: e.target.value})} className="h-14 rounded-2xl bg-slate-50 border-none shadow-inner" /></div>
                   <div className="space-y-3"><Label className="text-[10px] font-bold uppercase opacity-40 ml-4">YOUTUBE SORU</Label><Input value={editingBlock.testYoutubeUrl || ''} onChange={(e) => setEditingBlock({...editingBlock, testYoutubeUrl: e.target.value})} className="h-14 rounded-2xl bg-slate-50 border-none shadow-inner" /></div>
                </div>
                <div className="space-y-3">
                  <Label className="text-[11px] font-black uppercase opacity-40 ml-6 italic">DURUM</Label>
                  <div className="flex gap-4">
                    <button 
                      onClick={() => setEditingBlock({...editingBlock, status: 'planned'})}
                      className={cn("flex-1 h-16 rounded-2xl font-black uppercase text-xs transition-all", editingBlock.status === 'planned' ? "bg-primary text-white" : "bg-slate-50 text-primary/40")}
                    >BEKLEMEDE</button>
                    <button 
                      onClick={() => setEditingBlock({...editingBlock, status: 'done'})}
                      className={cn("flex-1 h-16 rounded-2xl font-black uppercase text-xs transition-all", editingBlock.status === 'done' || editingBlock.status === 'completed' ? "bg-emerald-500 text-white" : "bg-slate-50 text-primary/40")}
                    >TAMAMLANDI</button>
                  </div>
                </div>
                <Button onClick={handleSaveEdit} className="w-full h-20 rounded-[2.5rem] bg-primary hover:bg-accent text-white font-black text-xl uppercase gap-8 shadow-2xl transition-all">KAYDET <Save className="h-8 w-8 text-accent" /></Button>
             </div>
           )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
