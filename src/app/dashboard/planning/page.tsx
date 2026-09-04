
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useUser, useDoc, useFirestore } from '@/firebase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Calendar, Zap, Loader2, Sparkles, 
  ArrowLeft,
  Home, Edit3, Youtube, Save, FileText, 
  BookOpen, X, Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { doc, updateDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { format, parseISO, isBefore, isSameMonth, addDays } from 'date-fns';
import { tr } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';
import { generateAdaptivePlan } from '@/app/dashboard/page';

export default function PlanningPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  
  const { data: userData } = useDoc<any>(user?.uid ? `users/${user.uid}` : null);
  const { data: studyPlan, loading: planLoading } = useDoc<any>(user?.uid ? `studyPlans/${user.uid}` : null);
  
  const [viewMode, setViewMode] = useState<'monthly' | 'daily'>('daily');
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date(2026, 8, 1));
  const [startDate, setStartDate] = useState('2026-09-01');
  const [endDate, setEndDate] = useState('2026-09-14');
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<any>(null);

  useEffect(() => {
    if (studyPlan?.startDate) {
      setStartDate(studyPlan.startDate);
    }
    if (studyPlan?.endDate) {
      setEndDate(studyPlan.endDate);
    }
  }, [studyPlan]);

  const academicMonths = useMemo(() => [
    { label: 'AĞU', date: new Date(2026, 7, 1) }, { label: 'EYL', date: new Date(2026, 8, 1) },
    { label: 'EKİ', date: new Date(2026, 9, 1) }, { label: 'KAS', date: new Date(2026, 10, 1) },
    { label: 'ARA', date: new Date(2026, 11, 1) }, { label: 'OCA', date: new Date(2027, 0, 1) },
    { label: 'ŞUB', date: new Date(2027, 1, 1) }, { label: 'MAR', date: new Date(2027, 2, 1) },
    { label: 'NİS', date: new Date(2027, 3, 1) }, { label: 'MAY', date: new Date(2027, 4, 1) },
    { label: 'HAZ', date: new Date(2027, 5, 1) }, { label: 'TEM', date: new Date(2027, 6, 1) }
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

  const handleRegeneratePlan = async () => {
    if (!db || !user || !userData) return;
    setIsRegenerating(true);
    try {
      const newPlan = generateAdaptivePlan(startDate, userData.completedTopics || {});
      await setDoc(doc(db, 'studyPlans', user.uid), {
        userId: user.uid,
        startDate: startDate,
        endDate: endDate,
        masterPlan: newPlan,
        updatedAt: serverTimestamp()
      }, { merge: true });

      toast({ 
        title: "TERMİNAL MÜHÜRLENDİ", 
        description: "Akademik yol haritası saniyeler içinde yeni miladına göre kurgulandı.",
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
             <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-accent text-primary font-black text-[10px] uppercase tracking-widest shadow-xl shadow-accent/20 italic border border-accent/20"><Calendar className="h-3.5 w-3.5" /> MEMORY SYNC v23.0</div>
             <h2 className="text-6xl font-black tracking-tighter italic text-primary uppercase leading-none text-shadow-premium">Akademik <br /><span className="text-accent text-shadow-accent">Terminal</span></h2>
          </div>
        </div>

        <div className="flex flex-col gap-6 w-full xl:w-auto">
          <Card className="p-8 rounded-[3rem] border-none shadow-[0_40px_100px_-25px_rgba(15,23,42,0.15)] bg-white flex flex-wrap gap-8 items-end justify-center md:justify-start">
             <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase opacity-40 ml-4 italic text-primary">BAŞLAMA TARİHİ</Label>
                <Input 
                  type="date" 
                  value={startDate} 
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setViewMode('daily');
                  }} 
                  className="h-16 rounded-2xl bg-slate-50 border-none font-black text-xs px-6 shadow-inner focus-visible:ring-accent" 
                />
             </div>
             <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase opacity-40 ml-4 italic text-primary">BİTİŞ TARİHİ</Label>
                <Input 
                  type="date" 
                  value={endDate} 
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setViewMode('daily');
                  }} 
                  className="h-16 rounded-2xl bg-slate-50 border-none font-black text-xs px-6 shadow-inner focus-visible:ring-accent" 
                />
             </div>
             <Button 
               onClick={handleRegeneratePlan} 
               disabled={isRegenerating} 
               className="h-16 px-10 rounded-2xl bg-accent hover:bg-primary text-primary hover:text-white font-black text-[10px] uppercase tracking-[0.2em] gap-4 shadow-2xl transition-all"
             >
                {isRegenerating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />} PLANI YENİDEN KURGULA
             </Button>
          </Card>
          
          <div className="flex gap-2 bg-white/50 p-2 rounded-2xl border-2 border-primary/5 shadow-sm overflow-x-auto scrollbar-hide">
             {academicMonths.map((m, i) => (
               <button key={i} onClick={() => { setSelectedMonth(m.date); setViewMode('monthly'); }} className={cn("h-12 px-6 rounded-xl font-black text-[10px] uppercase transition-all whitespace-nowrap", isSameMonth(m.date, selectedMonth) && viewMode === 'monthly' ? "bg-primary text-white shadow-xl" : "bg-white text-muted-foreground hover:bg-slate-50 border border-primary/5")}>{m.label}</button>
             ))}
          </div>
        </div>
      </header>

      <div className="space-y-24 pb-20">
        {viewMode === 'monthly' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-8">
             {filteredPlan.map((day: any) => (
              <Card key={day.date} onClick={() => { setStartDate(day.date); setEndDate(day.date); setViewMode('daily'); }} className={cn("p-10 rounded-[4rem] border-none shadow-xl bg-white hover:scale-[1.03] transition-all cursor-pointer group min-h-[300px]")}>
                 <div className="space-y-8">
                    <div className="flex justify-between">
                       <span className="text-5xl font-black text-primary italic tracking-tighter">{format(parseISO(day.date), 'd')}</span>
                    </div>
                    <div className="space-y-3">
                       {day.blocks?.map((b: any, bi: number) => (
                         <div key={bi} className="p-3 rounded-2xl bg-[#F8FAFC] border border-slate-100 group-hover:bg-white transition-all">
                            <p className="text-[10px] font-black text-primary uppercase line-clamp-1 italic">{b.topic}</p>
                         </div>
                       ))}
                    </div>
                 </div>
              </Card>
            ))}
            {filteredPlan.length === 0 && <div className="col-span-full py-40 text-center opacity-10 font-black uppercase text-2xl tracking-[0.5em] italic">Bu ay için veri bulunamadı</div>}
          </div>
        ) : filteredPlan.map((day: any) => (
          <div key={day.date} className="space-y-16">
             <div className="flex items-center gap-10">
                <h3 className="text-5xl font-black italic text-primary uppercase tracking-tighter">{format(parseISO(day.date), 'd MMMM yyyy', { locale: tr })}</h3>
                <div className="h-px flex-1 bg-slate-200" />
                <Badge variant="outline" className="h-14 px-8 rounded-3xl font-black uppercase border-2 border-slate-100 text-primary text-[12px]">{day.day}</Badge>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-8">
                {day.blocks?.map((block: any) => (
                  <Card key={block.id} className={cn("p-12 rounded-[5.5rem] border-none shadow-[0_50px_100px_-25px_rgba(0,0,0,0.12)] transition-all hover:scale-[1.03] bg-white h-full flex flex-col group relative overflow-hidden", block.status === 'done' && "opacity-60")}>
                     <div className="space-y-12 relative z-10 flex-1 flex flex-col">
                        <div className="flex justify-between items-center">
                           <div className="px-6 py-2.5 rounded-[1.25rem] bg-[#FFF8E7] text-[#0F172A] font-black text-[14px] border border-[#FEF3C7] shadow-sm flex items-center gap-2">
                             <Clock className="h-4 w-4 text-accent" />
                             {block.phase1?.time || '10:00'}
                           </div>
                           <Badge className={cn("px-8 py-3 rounded-2xl text-[11px] font-black shadow-xl", block.status === 'done' ? "bg-emerald-50 text-white" : "bg-[#FF4D6D] text-white")}>{block.status === 'done' ? 'TAMAM' : 'BEK'}</Badge>
                        </div>
                        <h4 className="text-[5rem] font-black italic leading-[0.8] tracking-tighter uppercase text-primary text-shadow-premium text-center break-words">{block.topic.length > 8 ? block.topic.substring(0, 7) + ".." : block.topic}</h4>
                        <div className="bg-[#F8FAFC]/50 rounded-[4.5rem] p-12 space-y-12 border border-slate-50 shadow-inner">
                           {/* KONU ÇALIŞMA BÖLÜMÜ */}
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
                           
                           {/* TEST ÇÖZME BÖLÜMÜ */}
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
                           <Button onClick={() => { setEditingBlock({...block, date: day.date}); setIsEditDialogOpen(true); }} className="flex-1 h-18 rounded-3xl bg-primary text-white font-black uppercase text-[12px] tracking-widest gap-4 shadow-2xl">DÜZENLE <Edit3 className="h-5 w-5 text-accent" /></Button>
                        </div>
                     </div>
                  </Card>
                ))}
             </div>
          </div>
        ))}
        {viewMode === 'daily' && filteredPlan.length === 0 && <div className="py-60 text-center opacity-10 font-black uppercase text-4xl tracking-[0.8em] italic">Seçilen aralıkta veri girişi bekleniyor</div>}
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
                <Button onClick={handleSaveEdit} className="w-full h-20 rounded-[2.5rem] bg-primary hover:bg-accent text-white font-black text-xl uppercase gap-8 shadow-2xl transition-all">KAYDET <Save className="h-8 w-8 text-accent" /></Button>
             </div>
           )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

