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
  Youtube, Globe, Save, X, CalendarDays, FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { YKS_TM_TOPICS } from '@/lib/curriculum-data';
import { doc, updateDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { format, addDays, isBefore, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
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
  const { data: studyPlan, loading: planLoading } = useDoc<any>(user?.uid ? `studyPlans/${user.uid}` : null);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState('2027-06-15');

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<any>(null);

  const generateFasikulPlan = async () => {
    if (!db || !user || !endDate || !startDate) return;
    setIsGenerating(true);

    try {
      const start = parseISO(startDate);
      const end = parseISO(endDate);
      const diffDays = Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

      const otherLessons = [
        'TYT Matematik',
        'AYT Matematik',
        'Edebiyat',
        'Tarih',
        'Coğrafya',
        'Felsefe'
      ];

      const lessonPointers: Record<string, number> = {};
      [...otherLessons, 'TYT Türkçe'].forEach(l => { lessonPointers[l] = 0; });

      const fullPlan = [];

      for (let i = 0; i <= diffDays; i++) {
        const currentDt = addDays(start, i);
        const dateStr = format(currentDt, 'yyyy-MM-dd');
        const dayName = format(currentDt, 'EEEE', { locale: tr });
        
        const dec1 = new Date(currentDt.getFullYear(), 11, 1);
        const aytActive = !isBefore(currentDt, dec1);

        const dailyBlocks = [];
        
        // 1. HER GÜN PARAGRAF (TYT Türkçe)
        const trTopics = YKS_TM_TOPICS['TYT Türkçe'];
        const trTopic = trTopics[lessonPointers['TYT Türkçe'] % trTopics.length];
        dailyBlocks.push(createBlockData(dateStr, 'TYT Türkçe', trTopic, '09:00'));
        lessonPointers['TYT Türkçe']++;

        // 2. ROTASYON
        const activePool = otherLessons.filter(l => {
          if (l === 'AYT Matematik' || l === 'Edebiyat') return aytActive;
          return true;
        });

        const slotsPerDay = aytActive ? 3 : 2;
        const startHour = 11;

        for (let j = 0; j < slotsPerDay; j++) {
          const poolIndex = (i * slotsPerDay + j) % activePool.length;
          const lesson = activePool[poolIndex];
          const topics = YKS_TM_TOPICS[lesson];
          const topic = topics[lessonPointers[lesson] % topics.length];
          const time = `${startHour + (j * 2)}:00`;
          dailyBlocks.push(createBlockData(dateStr, lesson, topic, time));
          lessonPointers[lesson]++;
        }

        fullPlan.push({ date: dateStr, day: dayName, blocks: dailyBlocks });
      }

      const planRef = doc(db, 'studyPlans', user.uid);
      await setDoc(planRef, {
        userId: user.uid,
        masterPlan: fullPlan,
        startDate: startDate,
        targetExamDate: endDate,
        updatedAt: serverTimestamp()
      }, { merge: true });

      toast({ 
        title: 'Akademik Plan Senkronize Edildi', 
        description: 'Seçtiğiniz tarihten itibaren tam döngü sistemi saniyeler içinde aktif edildi.',
        className: "bg-primary text-white rounded-2xl shadow-2xl"
      });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Hata', description: 'Plan oluşturulamadı.' });
    } finally {
      setIsGenerating(false);
    }
  };

  const createBlockData = (dateStr: string, lesson: string, topic: string, time: string) => {
    return {
      id: `block_${dateStr}_${lesson.replace(/\s+/g, '_')}_${Math.random().toString(36).substr(2, 5)}`,
      lesson,
      topic,
      status: 'planned',
      difficulty: 'ORTA',
      phase1: {
        type: 'YENİ KONU ÇALIŞMASI',
        time: time,
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
        time: format(addDays(new Date(`2000-01-01 ${time}`), 0).setHours(parseInt(time.split(':')[0]) + 1), 'HH:mm'),
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
      
      if (!nextDay) {
        toast({ variant: 'destructive', title: 'Hata', description: 'Ötelenecek sonraki gün bulunamadı. Lütfen planı uzatın.' });
        return;
      }

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

      const planRef = doc(db, 'studyPlans', user.uid);
      updateDoc(planRef, { masterPlan: newPlan, updatedAt: serverTimestamp() })
        .then(() => {
          toast({ title: 'Görev Ötelendi', description: 'Çalışma saniyeler içinde bir sonraki güne aktarıldı.', className: "bg-accent text-primary rounded-2xl" });
        });
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

    const planRef = doc(db, 'studyPlans', user.uid);
    updateDoc(planRef, { masterPlan: newPlan, updatedAt: serverTimestamp() })
      .catch(async (err) => {
        const permissionError = new FirestorePermissionError({
          path: planRef.path,
          operation: 'update',
          requestResourceData: { masterPlan: 'updated_via_action' },
        });
        errorEmitter.emit('permission-error', permissionError);
      });
  };

  const handleSaveEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!db || !user || !studyPlan || !editingBlock) return;

    const formData = new FormData(e.currentTarget);
    const updatedTopic = formData.get('topic') as string;
    const updatedDate = formData.get('date') as string;

    const newPlan = studyPlan.masterPlan.map((day: any) => {
      // Önce mevcut günden sil (eğer tarih değiştiyse)
      if (day.date === editingBlock.date && updatedDate !== editingBlock.date) {
        return { ...day, blocks: (day.blocks || []).filter((b: any) => b.id !== editingBlock.id) };
      }
      
      // Mevcut gün güncelleniyorsa
      if (day.date === editingBlock.date && updatedDate === editingBlock.date) {
        return {
          ...day,
          blocks: (day.blocks || []).map((b: any) => {
            if (b.id === editingBlock.id) {
              return {
                ...b,
                topic: updatedTopic,
                difficulty: formData.get('difficulty'),
                phase1: {
                  ...b.phase1,
                  time: formData.get('p1Time'),
                  resources: { 
                    ...b.phase1.resources, 
                    youtube: formData.get('p1Youtube'), 
                    ogm: formData.get('p1Ogm'),
                    pdf: formData.get('p1Pdf'),
                    kamp: formData.get('p1Kamp')
                  }
                },
                phase2: {
                  ...b.phase2,
                  time: formData.get('p2Time'),
                  resources: { 
                    ...b.phase2.resources, 
                    youtube: formData.get('p2Youtube'), 
                    ogm: formData.get('p2Ogm'),
                    pdf: formData.get('p2Pdf'),
                    kamp: formData.get('p2Kamp')
                  }
                }
              };
            }
            return b;
          })
        };
      }

      // Yeni tarihe ekle
      if (day.date === updatedDate && updatedDate !== editingBlock.date) {
        const blocks = day.blocks || [];
        return {
          ...day,
          blocks: [...blocks, {
            ...editingBlock,
            topic: updatedTopic,
            difficulty: formData.get('difficulty'),
            phase1: {
              ...editingBlock.phase1,
              time: formData.get('p1Time'),
              resources: { 
                ...editingBlock.phase1.resources, 
                youtube: formData.get('p1Youtube'), 
                ogm: formData.get('p1Ogm'),
                pdf: formData.get('p1Pdf'),
                kamp: formData.get('p1Kamp')
              }
            },
            phase2: {
              ...editingBlock.phase2,
              time: formData.get('p2Time'),
              resources: { 
                ...editingBlock.phase2.resources, 
                youtube: formData.get('p2Youtube'), 
                ogm: formData.get('p2Ogm'),
                pdf: formData.get('p2Pdf'),
                kamp: formData.get('p2Kamp')
              }
            }
          }]
        };
      }

      return day;
    });

    const planRef = doc(db, 'studyPlans', user.uid);
    try {
      await updateDoc(planRef, { masterPlan: newPlan, updatedAt: serverTimestamp() });
      toast({ title: 'Güncellendi', description: 'Fasikül bloğu saniyeler içinde revize edildi.', className: "bg-primary text-white rounded-2xl" });
      setIsEditDialogOpen(false);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Hata', description: 'Güncelleme yapılamadı.' });
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
                disabled={isGenerating || !endDate}
                className="w-full h-20 rounded-[2rem] bg-primary hover:bg-accent transition-all duration-500 font-black text-xs uppercase tracking-[0.2em] gap-5 shadow-2xl shadow-primary/30 text-white"
              >
                {isGenerating ? <Loader2 className="h-7 w-7 animate-spin" /> : <Sparkles className="h-7 w-7 text-accent" />}
                FASİKÜL MOTORUNU ÇALIŞTIR
              </Button>
           </div>
        </div>
      </Card>

      <div className="space-y-24">
        {(studyPlan?.masterPlan || []).slice(0, 14).map((day: any) => {
          const isPast = isBefore(parseISO(day.date), new Date()) && day.date !== format(new Date(), 'yyyy-MM-dd');
          
          return (
            <div key={day.date} className={cn("space-y-12", isPast && "opacity-60")}>
               <div className="flex items-center gap-6 px-6">
                  <div className="flex items-center gap-4">
                     <h3 className="text-4xl font-black italic text-primary uppercase tracking-tighter">{day.date} — {day.day.toUpperCase()}</h3>
                     {isPast && <Badge className="bg-slate-200 text-slate-500 uppercase text-[10px] font-black py-1 px-4 rounded-full">GEÇMİŞ GÜN</Badge>}
                     {day.date === format(new Date(), 'yyyy-MM-dd') && <Badge className="bg-accent text-primary uppercase text-[10px] font-black py-1 px-4 rounded-full animate-pulse shadow-lg shadow-accent/20">BUGÜN</Badge>}
                  </div>
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
                                <h4 className="text-[3.2rem] font-black italic leading-[0.8] tracking-tighter uppercase text-primary text-shadow-deep line-clamp-2">
                                  {block.topic}
                                </h4>
                                <div className="flex items-center gap-3">
                                  <p className="text-[11px] font-bold text-muted-foreground/40 uppercase tracking-[0.3em] italic">
                                    {block.lesson === 'TYT Türkçe' ? 'GÜNLÜK PARAGRAF RUTİNİ' : 'GÜNLÜK FASİKÜL MODÜLÜ'}
                                  </p>
                                  <span className={cn("text-[9px] font-black uppercase px-3 py-1 rounded-full text-white", block.lesson.includes('AYT') ? 'bg-indigo-600' : 'bg-slate-400')}>
                                    {block.lesson.includes('AYT') ? 'AYT' : 'TYT'}
                                  </span>
                                </div>
                             </div>
                             <div className="flex items-center gap-4">
                               {block.status === 'done' ? (
                                 <div className="bg-emerald-500 text-white px-6 py-2.5 rounded-full text-[11px] font-black flex items-center gap-3 shadow-xl">
                                   <CheckCircle2 className="h-5 w-5" /> TAMAMLANDI
                                 </div>
                               ) : (
                                 <div className="bg-rose-500 text-white px-6 py-2.5 rounded-full text-[11px] font-black flex items-center gap-3 shadow-xl">
                                   <Clock className="h-5 w-5" /> BEKLİYOR
                                 </div>
                               )}
                             </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                             <div className="p-10 rounded-[3.5rem] bg-slate-50/50 border border-slate-100 space-y-6 relative overflow-hidden group/p1">
                                <div className="flex justify-between items-center border-b border-slate-200 pb-4 mb-2">
                                   <span className="text-[10px] font-black text-primary/40 uppercase tracking-[0.2em]">1. AŞAMA: KONU</span>
                                   <span className="text-lg font-black text-primary italic">{block.phase1.time}</span>
                                </div>
                                <h5 className="font-black text-2xl italic text-primary leading-tight uppercase group-hover/p1:text-accent transition-colors">{block.phase1.type}</h5>
                                <div className="flex flex-wrap gap-3">
                                   <span className="text-[10px] font-black uppercase bg-white px-4 py-1.5 rounded-2xl text-primary border border-slate-200 shadow-sm flex items-center gap-2">⏱️ {block.phase1.duration}DK</span>
                                </div>
                                <div className="flex gap-6 pt-4">
                                   {block.phase1.resources?.youtube && <a href={block.phase1.resources.youtube} target="_blank" className="hover:scale-125 transition-transform text-rose-500 opacity-60 hover:opacity-100"><Youtube className="h-7 w-7" /></a>}
                                   {block.phase1.resources?.pdf && <a href={block.phase1.resources.pdf} target="_blank" className="hover:scale-125 transition-transform text-blue-600 opacity-60 hover:opacity-100"><FileText className="h-7 w-7" /></a>}
                                   {block.phase1.resources?.kamp && <a href={block.phase1.resources.kamp} target="_blank" className="hover:scale-125 transition-transform text-orange-500 opacity-60 hover:opacity-100"><Zap className="h-7 w-7" /></a>}
                                   {block.phase1.resources?.ogm && <a href={block.phase1.resources.ogm} target="_blank" className="hover:scale-125 transition-transform text-emerald-600 opacity-60 hover:opacity-100"><Globe className="h-7 w-7" /></a>}
                                </div>
                             </div>

                             <div className="p-10 rounded-[3.5rem] bg-orange-50/50 border border-orange-100 space-y-6 relative overflow-hidden group/p2">
                                <div className="flex justify-between items-center border-b border-orange-200 pb-4 mb-2">
                                   <span className="text-[10px] font-black text-accent uppercase tracking-[0.2em]">2. AŞAMA: TEST</span>
                                   <span className="text-lg font-black text-primary italic">{block.phase2.time}</span>
                                </div>
                                <h5 className="font-black text-2xl italic text-primary leading-tight uppercase group-hover/p2:text-accent transition-colors">{block.phase2.type}</h5>
                                <div className="flex flex-wrap gap-3">
                                   <span className="text-[10px] font-black uppercase bg-white px-4 py-1.5 rounded-2xl text-accent border border-orange-200 shadow-sm flex items-center gap-2">⏱️ {block.phase2.duration}DK</span>
                                </div>
                                <div className="flex gap-6 pt-4">
                                   {block.phase2.resources?.youtube && <a href={block.phase2.resources.youtube} target="_blank" className="hover:scale-125 transition-transform text-rose-500 opacity-60 hover:opacity-100"><Youtube className="h-7 w-7" /></a>}
                                   {block.phase2.resources?.pdf && <a href={block.phase2.resources.pdf} target="_blank" className="hover:scale-125 transition-transform text-blue-600 opacity-60 hover:opacity-100"><FileText className="h-7 w-7" /></a>}
                                   {block.phase2.resources?.kamp && <a href={block.phase2.resources.kamp} target="_blank" className="hover:scale-125 transition-transform text-orange-500 opacity-60 hover:opacity-100"><Zap className="h-7 w-7" /></a>}
                                   {block.phase2.resources?.ogm && <a href={block.phase2.resources.ogm} target="_blank" className="hover:scale-125 transition-transform text-emerald-600 opacity-60 hover:opacity-100"><Globe className="h-7 w-7" /></a>}
                                </div>
                             </div>
                          </div>

                          {/* Actions Terminal */}
                          <div className="flex justify-center gap-6 pt-10 border-t border-slate-50">
                             <Button 
                               onClick={() => handleTaskAction(day.date, block.id, 'done')}
                               size="icon"
                               title="Tamamlandı Olarak İşaretle"
                               className={cn(
                                 "h-16 w-16 rounded-full transition-all duration-500 shadow-xl", 
                                 block.status === 'done' ? "bg-slate-100 text-slate-400" : "bg-emerald-500 text-white hover:scale-110"
                               )}
                             ><CheckCircle2 className="h-7 w-7" /></Button>

                             <Button 
                               onClick={() => handleTaskAction(day.date, block.id, 'repeat')}
                               size="icon" variant="outline" 
                               title="Tekrar Listesine Al"
                               className="h-16 w-16 rounded-full bg-white border-2 border-slate-100 hover:border-orange-500 text-orange-500 hover:bg-orange-50 transition-all hover:scale-110 shadow-lg"
                             ><RotateCcw className="h-7 w-7" /></Button>

                             <Button 
                               onClick={() => handleTaskAction(day.date, block.id, 'postpone')}
                               size="icon" variant="outline"
                               title="Sonraki Güne Ötele"
                               className="h-16 w-16 rounded-full bg-white border-2 border-slate-100 hover:border-accent text-accent hover:bg-accent/5 transition-all hover:scale-110 shadow-lg"
                             ><FastForward className="h-7 w-7" /></Button>

                             <Button 
                               onClick={() => handleTaskAction(day.date, block.id, 'edit')}
                               size="icon" variant="outline" 
                               title="Düzenle"
                               className="h-16 w-16 rounded-full bg-white border-2 border-slate-100 hover:border-primary text-primary hover:bg-slate-50 transition-all hover:scale-110 shadow-lg"
                             ><Edit3 className="h-7 w-7" /></Button>

                             <Button 
                               onClick={() => handleTaskAction(day.date, block.id, 'level')}
                               size="icon" variant="outline" 
                               title="Zorluk Seviyesi"
                               className="h-16 w-16 rounded-full bg-white border-2 border-slate-100 hover:border-blue-500 text-blue-500 hover:bg-blue-50 transition-all hover:scale-110 shadow-lg"
                             ><Gauge className="h-7 w-7" /></Button>

                             <Button 
                               onClick={() => handleTaskAction(day.date, block.id, 'delete')}
                               size="icon" variant="outline" 
                               title="Kalıcı Olarak Sil"
                               className="h-16 w-16 rounded-full bg-white border-2 border-slate-100 hover:border-rose-500 text-rose-500 hover:bg-rose-50 transition-all hover:scale-110 shadow-lg"
                             ><Trash2 className="h-7 w-7" /></Button>
                          </div>
                       </div>
                    </Card>
                  ))}
               </div>
            </div>
          );
        })}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="rounded-[4rem] border-none shadow-2xl p-12 bg-white max-w-2xl overflow-hidden">
           <DialogHeader className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 text-primary font-black text-[10px] uppercase tracking-widest italic shadow-sm w-fit">
                <Edit3 className="h-3 w-3 text-accent" /> BLOK EDİTÖRÜ
              </div>
              <DialogTitle className="text-4xl font-black italic tracking-tighter text-primary uppercase leading-none">FASİKÜL BLOĞUNU DÜZENLE</DialogTitle>
              <DialogDescription className="font-medium italic">Seçili bloğun akademik detaylarını saniyeler içinde revize edin.</DialogDescription>
           </DialogHeader>

           {editingBlock && (
             <form onSubmit={handleSaveEdit} className="space-y-10 pt-10">
                <div className="grid grid-cols-2 gap-8">
                   <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4 italic">KONU ADI</Label>
                      <Input name="topic" required defaultValue={editingBlock.topic} className="h-16 rounded-2xl bg-slate-50 border-none shadow-inner font-bold" />
                   </div>
                   <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4 italic">TARİH</Label>
                      <Input name="date" type="date" required defaultValue={editingBlock.date} className="h-16 rounded-2xl bg-slate-50 border-none shadow-inner font-bold" />
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-10">
                   {/* PHASE 1 */}
                   <div className="p-8 rounded-[2.5rem] bg-slate-50 space-y-6">
                      <h5 className="font-black text-xs uppercase tracking-widest text-primary/40">1. AŞAMA (KONU)</h5>
                      <div className="space-y-4">
                         <div className="relative group">
                            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/20" />
                            <Input name="p1Time" required defaultValue={editingBlock.phase1.time} className="h-12 pl-12 rounded-xl bg-white border-none shadow-sm font-bold" />
                         </div>
                         <div className="relative group">
                            <Youtube className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-rose-500/40" />
                            <Input name="p1Youtube" defaultValue={editingBlock.phase1.resources?.youtube} placeholder="YouTube Link" className="h-12 pl-12 rounded-xl bg-white border-none shadow-sm font-bold text-xs" />
                         </div>
                         <div className="grid grid-cols-2 gap-3">
                            <div className="relative group">
                               <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-blue-500/40" />
                               <Input name="p1Pdf" defaultValue={editingBlock.phase1.resources?.pdf} placeholder="PDF Link" className="h-11 pl-9 rounded-xl bg-white border-none shadow-sm font-bold text-[10px]" />
                            </div>
                            <div className="relative group">
                               <Zap className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-orange-500/40" />
                               <Input name="p1Kamp" defaultValue={editingBlock.phase1.resources?.kamp} placeholder="Kamp Link" className="h-11 pl-9 rounded-xl bg-white border-none shadow-sm font-bold text-[10px]" />
                            </div>
                         </div>
                      </div>
                   </div>

                   {/* PHASE 2 */}
                   <div className="p-8 rounded-[2.5rem] bg-orange-50 space-y-6">
                      <h5 className="font-black text-xs uppercase tracking-widest text-accent">2. AŞAMA (TEST)</h5>
                      <div className="space-y-4">
                         <div className="relative group">
                            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/20" />
                            <Input name="p2Time" required defaultValue={editingBlock.phase2.time} className="h-12 pl-12 rounded-xl bg-white border-none shadow-sm font-bold" />
                         </div>
                         <div className="relative group">
                            <Youtube className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-rose-500/40" />
                            <Input name="p2Youtube" defaultValue={editingBlock.phase2.resources?.youtube} placeholder="YouTube Link" className="h-12 pl-12 rounded-xl bg-white border-none shadow-sm font-bold text-xs" />
                         </div>
                         <div className="grid grid-cols-2 gap-3">
                            <div className="relative group">
                               <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-blue-500/40" />
                               <Input name="p2Pdf" defaultValue={editingBlock.phase2.resources?.pdf} placeholder="PDF Link" className="h-11 pl-9 rounded-xl bg-white border-none shadow-sm font-bold text-[10px]" />
                            </div>
                            <div className="relative group">
                               <Zap className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-orange-500/40" />
                               <Input name="p2Kamp" defaultValue={editingBlock.phase2.resources?.kamp} placeholder="Kamp Link" className="h-11 pl-9 rounded-xl bg-white border-none shadow-sm font-bold text-[10px]" />
                            </div>
                         </div>
                      </div>
                   </div>
                </div>

                <div className="flex gap-4">
                   <Button type="submit" className="flex-1 h-20 rounded-[2rem] bg-primary hover:bg-accent transition-all font-black text-sm uppercase tracking-[0.4em] shadow-2xl text-white gap-4">
                      <Save className="h-6 w-6 text-accent" /> DEĞİŞİKLİKLERİ KAYDET
                   </Button>
                   <Button type="button" onClick={() => setIsEditDialogOpen(false)} variant="outline" className="h-20 w-20 rounded-[2rem] border-2 border-slate-100 hover:bg-slate-50">
                      <X className="h-6 w-6 text-slate-400" />
                   </Button>
                </div>
             </form>
           )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
