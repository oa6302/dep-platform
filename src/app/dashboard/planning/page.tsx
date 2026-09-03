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
  Youtube, Globe, Save, X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { YKS_TM_TOPICS } from '@/lib/curriculum-data';
import { doc, updateDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { format, addDays } from 'date-fns';
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

const LESSON_COLORS: Record<string, string> = {
  'TYT Matematik': '#0f172a',
  'AYT Matematik': '#1e293b',
  'Geometri': '#064e3b',
  'TYT Türkçe': '#1e40af',
  'Edebiyat': '#881337',
  'Tarih': '#7c2d12',
  'Coğrafya': '#14532d',
  'Felsefe': '#4c1d95',
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

  // Edit States
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<any>(null);

  const generateFasikulPlan = async () => {
    if (!db || !user || !endDate) return;
    setIsGenerating(true);

    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffDays = Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

      const lessons = Object.keys(YKS_TM_TOPICS);
      const lessonPointers: Record<string, number> = {};
      lessons.forEach(l => { lessonPointers[l] = 0; });

      const fullPlan = [];

      for (let i = 0; i <= diffDays; i++) {
        const currentDt = addDays(start, i);
        const dateStr = format(currentDt, 'yyyy-MM-dd');
        const dayName = format(currentDt, 'EEEE', { locale: tr });

        const dailyBlocks = [];
        
        lessons.forEach((lesson) => {
          const topics = YKS_TM_TOPICS[lesson];
          const topic = topics[lessonPointers[lesson] % topics.length];
          
          dailyBlocks.push({
            id: `block_${dateStr}_${lesson.replace(/\s+/g, '_')}`,
            lesson,
            topic,
            status: 'planned',
            difficulty: 'ORTA',
            phase1: {
              type: 'YENİ KONU ÇALIŞMASI',
              time: '10:00',
              duration: 60,
              questionTarget: 10,
              resources: {
                youtube: `https://www.youtube.com/results?search_query=${encodeURIComponent(lesson + ' ' + topic)}`,
                ogm: `https://ogmmateryal.eba.gov.tr/konu-ozeti/${encodeURIComponent(topic)}`,
              }
            },
            phase2: {
              type: 'TEST VE AYRINTI ANALİZİ',
              time: '11:00',
              duration: 60,
              questionTarget: 20,
              resources: {
                youtube: `https://www.youtube.com/results?search_query=${encodeURIComponent(lesson + ' ' + topic + ' soru çözümü')}`,
                ogm: `https://ogmmateryal.eba.gov.tr/soru-bankasi/${encodeURIComponent(lesson)}`,
              }
            }
          });

          lessonPointers[lesson]++;
        });

        fullPlan.push({ date: dateStr, day: dayName, blocks: dailyBlocks });
      }

      await setDoc(doc(db, 'studyPlans', user.uid), {
        userId: user.uid,
        masterPlan: fullPlan,
        targetExamDate: endDate,
        updatedAt: serverTimestamp()
      }, { merge: true });

      toast({ title: 'Plan Senkronize Edildi', description: 'Fasikül blokları (Konu + Test) takvime işlendi.' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Hata', description: 'Plan oluşturulamadı.' });
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
    
    toast({ 
      title: 'İşlem Başarılı', 
      description: action === 'delete' ? 'Görev silindi.' : 'Durum saniyeler içinde güncellendi.',
      className: "bg-primary text-white rounded-2xl"
    });
  };

  const handleSaveEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!db || !user || !studyPlan || !editingBlock) return;

    const formData = new FormData(e.currentTarget);
    const updatedTopic = formData.get('topic') as string;
    const updatedDate = formData.get('date') as string;

    const newPlan = studyPlan.masterPlan.map((day: any) => {
      // Remove block from current date if date changed
      if (day.date === editingBlock.date && updatedDate !== editingBlock.date) {
        return {
          ...day,
          blocks: day.blocks.filter((b: any) => b.id !== editingBlock.id)
        };
      }
      
      // Update block if date is same
      if (day.date === editingBlock.date && updatedDate === editingBlock.date) {
        return {
          ...day,
          blocks: day.blocks.map((b: any) => {
            if (b.id === editingBlock.id) {
              return {
                ...b,
                topic: updatedTopic,
                difficulty: formData.get('difficulty'),
                phase1: {
                  ...b.phase1,
                  time: formData.get('p1Time'),
                  resources: { ...b.phase1.resources, youtube: formData.get('p1Youtube'), ogm: formData.get('p1Ogm') }
                },
                phase2: {
                  ...b.phase2,
                  time: formData.get('p2Time'),
                  resources: { ...b.phase2.resources, youtube: formData.get('p2Youtube'), ogm: formData.get('p2Ogm') }
                }
              };
            }
            return b;
          })
        };
      }

      // Add block to new date if date changed
      if (day.date === updatedDate && updatedDate !== editingBlock.date) {
        return {
          ...day,
          blocks: [...day.blocks, {
            ...editingBlock,
            topic: updatedTopic,
            difficulty: formData.get('difficulty'),
            phase1: {
              ...editingBlock.phase1,
              time: formData.get('p1Time'),
              resources: { ...editingBlock.phase1.resources, youtube: formData.get('p1Youtube'), ogm: formData.get('p1Ogm') }
            },
            phase2: {
              ...editingBlock.phase2,
              time: formData.get('p2Time'),
              resources: { ...editingBlock.phase2.resources, youtube: formData.get('p2Youtube'), ogm: formData.get('p2Ogm') }
            }
          }]
        };
      }

      return day;
    });

    const planRef = doc(db, 'studyPlans', user.uid);
    try {
      await updateDoc(planRef, { masterPlan: newPlan, updatedAt: serverTimestamp() });
      toast({ title: 'Güncellendi', description: 'Fasikül bloğu saniyeler içinde revize edildi.' });
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
           <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-6 italic">HEDEF SINAV TARİHİ</Label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="h-20 rounded-[2rem] bg-slate-50 border-none shadow-inner font-black text-2xl px-8" />
           </div>
           <div className="space-y-3 flex items-end">
              <Button 
                onClick={generateFasikulPlan}
                disabled={isGenerating || !endDate}
                className="w-full h-20 rounded-[2rem] bg-primary hover:bg-accent transition-all duration-500 font-black text-xs uppercase tracking-[0.2em] gap-5 shadow-2xl shadow-primary/30 text-white"
              >
                {isGenerating ? <Loader2 className="h-7 w-7 animate-spin" /> : <Zap className="h-7 w-7 text-accent" />}
                FASİKÜL MOTORUNU ÇALIŞTIR
              </Button>
           </div>
        </div>
      </Card>

      <div className="space-y-24">
        {(studyPlan?.masterPlan || []).slice(0, 14).map((day: any) => (
          <div key={day.date} className="space-y-12">
             <div className="flex items-center gap-6 px-6">
                <h3 className="text-4xl font-black italic text-primary uppercase tracking-tighter">{day.date} — {day.day.toUpperCase()}</h3>
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
                        {/* Header */}
                        <div className="flex justify-between items-start">
                           <div className="space-y-1">
                              <h4 className="text-[3.2rem] font-black italic leading-[0.8] tracking-tighter uppercase text-primary text-shadow-deep">
                                {block.topic}
                              </h4>
                              <p className="text-[11px] font-bold text-muted-foreground/40 uppercase tracking-[0.3em] italic">
                                GÜNLÜK FASİKÜL MODÜLÜ
                              </p>
                           </div>
                           <div className="flex items-center gap-4">
                             {block.status === 'done' ? (
                               <div className="bg-emerald-500 text-white px-6 py-2.5 rounded-full text-[11px] font-black flex items-center gap-3 shadow-xl animate-in zoom-in-50">
                                 <CheckCircle2 className="h-5 w-5" /> TAMAMLANDI
                               </div>
                             ) : (
                               <div className="bg-rose-500 text-white px-6 py-2.5 rounded-full text-[11px] font-black flex items-center gap-3 shadow-xl">
                                 <Clock className="h-5 w-5" /> BEKLİYOR
                               </div>
                             )}
                           </div>
                        </div>

                        {/* Combined Stages */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                           {/* Phase 1: Konu */}
                           <div className="p-10 rounded-[3.5rem] bg-slate-50/50 border border-slate-100 space-y-6 relative overflow-hidden group/p1">
                              <div className="flex justify-between items-center border-b border-slate-200 pb-4 mb-2">
                                 <span className="text-[10px] font-black text-primary/40 uppercase tracking-[0.2em]">1. AŞAMA: KONU</span>
                                 <span className="text-lg font-black text-primary italic">{block.phase1.time}</span>
                              </div>
                              <h5 className="font-black text-2xl italic text-primary leading-tight uppercase group-hover/p1:text-accent transition-colors">{block.phase1.type}</h5>
                              <div className="flex flex-wrap gap-3">
                                 <span className="text-[10px] font-black uppercase bg-white px-4 py-1.5 rounded-2xl text-primary border border-slate-200 shadow-sm flex items-center gap-2">⏱️ {block.phase1.duration}DK</span>
                                 <span className="text-[10px] font-black uppercase bg-white px-4 py-1.5 rounded-2xl text-primary border border-slate-200 shadow-sm flex items-center gap-2">📝 {block.phase1.questionTarget} HEDEF</span>
                              </div>
                              <div className="flex gap-6 pt-4">
                                 <a href={block.phase1.resources?.youtube} target="_blank" className="hover:scale-125 transition-transform text-rose-500 opacity-60 hover:opacity-100"><Youtube className="h-7 w-7" /></a>
                                 <a href={block.phase1.resources?.ogm} target="_blank" className="hover:scale-125 transition-transform text-blue-500 opacity-60 hover:opacity-100"><Globe className="h-7 w-7" /></a>
                              </div>
                           </div>

                           {/* Phase 2: Test */}
                           <div className="p-10 rounded-[3.5rem] bg-orange-50/50 border border-orange-100 space-y-6 relative overflow-hidden group/p2">
                              <div className="flex justify-between items-center border-b border-orange-200 pb-4 mb-2">
                                 <span className="text-[10px] font-black text-accent uppercase tracking-[0.2em]">2. AŞAMA: TEST</span>
                                 <span className="text-lg font-black text-primary italic">{block.phase2.time}</span>
                              </div>
                              <h5 className="font-black text-2xl italic text-primary leading-tight uppercase group-hover/p2:text-accent transition-colors">{block.phase2.type}</h5>
                              <div className="flex flex-wrap gap-3">
                                 <span className="text-[10px] font-black uppercase bg-white px-4 py-1.5 rounded-2xl text-accent border border-orange-200 shadow-sm flex items-center gap-2">⏱️ {block.phase2.duration}DK</span>
                                 <span className="text-[10px] font-black uppercase bg-white px-4 py-1.5 rounded-2xl text-accent border border-orange-200 shadow-sm flex items-center gap-2">📝 {block.phase2.questionTarget} SORU</span>
                              </div>
                              <div className="flex gap-6 pt-4">
                                 <a href={block.phase2.resources?.youtube} target="_blank" className="hover:scale-125 transition-transform text-rose-500 opacity-60 hover:opacity-100"><Youtube className="h-7 w-7" /></a>
                                 <a href={block.phase2.resources?.ogm} target="_blank" className="hover:scale-125 transition-transform text-blue-500 opacity-60 hover:opacity-100"><Globe className="h-7 w-7" /></a>
                              </div>
                           </div>
                        </div>

                        {/* Actions Terminal */}
                        <div className="flex justify-center gap-6 pt-10 border-t border-slate-50">
                           <Button 
                             onClick={() => handleTaskAction(day.date, block.id, 'done')}
                             size="icon"
                             className={cn(
                               "h-16 w-16 rounded-full transition-all duration-500 shadow-xl", 
                               block.status === 'done' ? "bg-slate-100 text-slate-400" : "bg-emerald-500 text-white hover:scale-110"
                             )}
                           ><CheckCircle2 className="h-7 w-7" /></Button>
                           
                           <Button 
                             onClick={() => handleTaskAction(day.date, block.id, 'repeat')}
                             size="icon" variant="outline" 
                             className="h-16 w-16 rounded-full bg-white border-2 border-slate-100 hover:border-orange-500 text-orange-500 hover:bg-orange-50 transition-all hover:scale-110 shadow-lg"
                           ><RotateCcw className="h-7 w-7" /></Button>
                           
                           <Button 
                             onClick={() => handleTaskAction(day.date, block.id, 'skip')}
                             size="icon" variant="outline" 
                             className="h-16 w-16 rounded-full bg-white border-2 border-slate-100 hover:border-slate-400 text-slate-400 hover:bg-slate-50 transition-all hover:scale-110 shadow-lg"
                           ><FastForward className="h-7 w-7" /></Button>
                           
                           <Button 
                             onClick={() => handleTaskAction(day.date, block.id, 'level')}
                             size="icon" variant="outline" 
                             className="h-16 w-16 rounded-full bg-white border-2 border-slate-100 hover:border-blue-500 text-blue-500 hover:bg-blue-50 transition-all hover:scale-110 shadow-lg"
                           ><Gauge className="h-7 w-7" /></Button>
                           
                           <Button 
                             onClick={() => handleTaskAction(day.date, block.id, 'edit')}
                             size="icon" variant="outline" 
                             className="h-16 w-16 rounded-full bg-white border-2 border-slate-100 hover:border-primary text-slate-900 hover:bg-slate-50 transition-all hover:scale-110 shadow-lg"
                           ><Edit3 className="h-7 w-7" /></Button>
                           
                           <Button 
                             onClick={() => handleTaskAction(day.date, block.id, 'delete')}
                             size="icon" variant="outline" 
                             className="h-16 w-16 rounded-full bg-white border-2 border-slate-100 hover:border-rose-500 text-rose-500 hover:bg-rose-50 transition-all hover:scale-110 shadow-lg"
                           ><Trash2 className="h-7 w-7" /></Button>
                        </div>
                     </div>
                  </Card>
                ))}
             </div>
          </div>
        ))}
      </div>

      {/* Edit Block Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="rounded-[3rem] border-none shadow-2xl p-10 bg-white max-w-2xl">
          <DialogHeader className="space-y-4">
             <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-primary/5 text-primary font-black text-[10px] uppercase tracking-widest italic">
                <Edit3 className="h-3 w-3" /> FASİKÜL EDİTÖRÜ
             </div>
             <DialogTitle className="text-4xl font-black italic tracking-tighter text-primary uppercase">Bloğu Düzenle</DialogTitle>
             <DialogDescription className="font-medium italic">Seçili fasikül bloğunun detaylarını revize edin.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveEdit} className="space-y-8 pt-6">
             <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                   <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Konu Adı</Label>
                   <Input name="topic" defaultValue={editingBlock?.topic} className="h-14 rounded-2xl bg-slate-50 border-none font-bold" />
                </div>
                <div className="space-y-2">
                   <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Tarih</Label>
                   <Input name="date" type="date" defaultValue={editingBlock?.date} className="h-14 rounded-2xl bg-slate-50 border-none font-bold" />
                </div>
             </div>

             <div className="grid grid-cols-2 gap-10">
                <div className="space-y-6 p-6 bg-slate-50 rounded-[2rem]">
                   <p className="text-[10px] font-black uppercase tracking-widest text-primary">AŞAMA 1: KONU</p>
                   <div className="space-y-4">
                      <Input name="p1Time" placeholder="Saat" defaultValue={editingBlock?.phase1?.time} className="h-12 rounded-xl bg-white border-none text-xs" />
                      <Input name="p1Youtube" placeholder="Youtube Link" defaultValue={editingBlock?.phase1?.resources?.youtube} className="h-12 rounded-xl bg-white border-none text-xs" />
                      <Input name="p1Ogm" placeholder="OGM Link" defaultValue={editingBlock?.phase1?.resources?.ogm} className="h-12 rounded-xl bg-white border-none text-xs" />
                   </div>
                </div>

                <div className="space-y-6 p-6 bg-orange-50 rounded-[2rem]">
                   <p className="text-[10px] font-black uppercase tracking-widest text-accent">AŞAMA 2: TEST</p>
                   <div className="space-y-4">
                      <Input name="p2Time" placeholder="Saat" defaultValue={editingBlock?.phase2?.time} className="h-12 rounded-xl bg-white border-none text-xs" />
                      <Input name="p2Youtube" placeholder="Youtube Link" defaultValue={editingBlock?.phase2?.resources?.youtube} className="h-12 rounded-xl bg-white border-none text-xs" />
                      <Input name="p2Ogm" placeholder="OGM Link" defaultValue={editingBlock?.phase2?.resources?.ogm} className="h-12 rounded-xl bg-white border-none text-xs" />
                   </div>
                </div>
             </div>

             <div className="flex gap-4">
                <Button type="button" variant="ghost" onClick={() => setIsEditDialogOpen(false)} className="flex-1 h-16 rounded-2xl font-black text-xs uppercase tracking-widest">Vazgeç</Button>
                <Button type="submit" className="flex-1 h-16 rounded-2xl bg-primary hover:bg-accent text-white font-black text-xs uppercase tracking-widest gap-3 shadow-2xl">
                   <Save className="h-5 w-5" /> Değişiklikleri Kaydet
                </Button>
             </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
