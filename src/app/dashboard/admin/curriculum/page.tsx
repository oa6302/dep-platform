
'use client';

import { useCollection, useFirestore } from '@/firebase';
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Plus, Search, BookOpen, Trash2, Edit3, ChevronRight, 
  ArrowLeft, Home, BookOpenCheck, Target, Layers, 
  Sparkles, Loader2, CheckCircle2, MoreVertical, 
  Grid3X3, Database, Save, LayoutTemplate, FileText
} from 'lucide-react';
import { 
  collection, doc, setDoc, deleteDoc, 
  query, where, orderBy, serverTimestamp, updateDoc 
} from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AdminCurriculumPage() {
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  
  const [selectedProgram, setSelectedProgram] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedUnit, setSelectedUnit] = useState<string>('');
  
  const [loading, setLoading] = useState<string | null>(null);
  const [isAddingProgram, setIsAddingProgram] = useState(false);
  const [isAddingSubject, setIsAddingSubject] = useState(false);
  const [isAddingUnit, setIsAddingUnit] = useState(false);
  const [isAddingTopic, setIsAddingTopic] = useState(false);
  
  // Programs
  const { data: programs = [], loading: programsLoading } = useCollection<any>('programs', orderBy('title', 'asc'));
  
  // Subjects
  const subjectsQuery = useMemo(() => {
    if (!db || !selectedProgram) return null;
    return query(collection(db, 'subjects'), where('programId', '==', selectedProgram), orderBy('order', 'asc'));
  }, [db, selectedProgram]);
  const { data: subjects = [] } = useCollection<any>(subjectsQuery);

  // Units
  const unitsQuery = useMemo(() => {
    if (!db || !selectedSubject) return null;
    return query(collection(db, 'units'), where('subjectId', '==', selectedSubject), orderBy('order', 'asc'));
  }, [db, selectedSubject]);
  const { data: units = [] } = useCollection<any>(unitsQuery);

  // Topics
  const topicsQuery = useMemo(() => {
    if (!db || !selectedUnit) return null;
    return query(collection(db, 'topics'), where('unitId', '==', selectedUnit), orderBy('order', 'asc'));
  }, [db, selectedUnit]);
  const { data: topics = [] } = useCollection<any>(topicsQuery);

  const handleAddProgram = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!db) return;
    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const category = formData.get('category') as string;
    const id = title.toUpperCase().replace(/\s+/g, '_');

    setLoading('add-program');
    try {
      await setDoc(doc(db, 'programs', id), {
        id,
        title,
        category,
        createdAt: serverTimestamp(),
      }, { merge: true });
      toast({ title: 'Program Eklendi', description: `${title} başarıyla oluşturuldu.` });
      setIsAddingProgram(false);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Hata', description: 'Program eklenemedi.' });
    } finally {
      setLoading(null);
    }
  };

  const handleAddSubject = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!db || !selectedProgram) return;
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const id = `${selectedProgram}_${name.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`;

    setLoading('add-subject');
    try {
      await setDoc(doc(db, 'subjects', id), {
        id,
        programId: selectedProgram,
        name,
        isActive: true,
        order: subjects.length + 1,
        createdAt: serverTimestamp(),
      });
      toast({ title: 'Ders Eklendi', description: `${name} başarıyla oluşturuldu.` });
      setIsAddingSubject(false);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Hata', description: 'Ders eklenemedi.' });
    } finally {
      setLoading(null);
    }
  };

  const handleAddUnit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!db || !selectedSubject) return;
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const id = `unit_${selectedSubject}_${Date.now()}`;

    setLoading('add-unit');
    try {
      await setDoc(doc(db, 'units', id), {
        id,
        subjectId: selectedSubject,
        name,
        order: units.length + 1,
        createdAt: serverTimestamp(),
      });
      toast({ title: 'Ünite Eklendi', description: `${name} oluşturuldu.` });
      setIsAddingUnit(false);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Hata', description: 'Ünite eklenemedi.' });
    } finally {
      setLoading(null);
    }
  };

  const handleAddTopic = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!db || !selectedUnit) return;
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const id = `topic_${selectedUnit}_${Date.now()}`;

    setLoading('add-topic');
    try {
      await setDoc(doc(db, 'topics', id), {
        id,
        unitId: selectedUnit,
        name,
        order: topics.length + 1,
        createdAt: serverTimestamp(),
      });
      toast({ title: 'Konu Eklendi', description: `${name} oluşturuldu.` });
      setIsAddingTopic(false);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Hata', description: 'Konu eklenemedi.' });
    } finally {
      setLoading(null);
    }
  };

  const handleDeleteItem = async (col: string, id: string) => {
    if (!db || !confirm('Bu öğeyi silmek istediğinize emin misiniz?')) return;
    try {
      await deleteDoc(doc(db, col, id));
      toast({ title: 'Öğe Silindi', description: 'Veritabanından kalıcı olarak kaldırıldı.' });
      if (id === selectedProgram) setSelectedProgram('');
      if (id === selectedSubject) setSelectedSubject('');
      if (id === selectedUnit) setSelectedUnit('');
    } catch (error) {
      toast({ variant: 'destructive', title: 'Hata', description: 'Silme işlemi başarısız.' });
    }
  };

  return (
    <div className="p-8 lg:p-12 space-y-12 max-w-7xl mx-auto w-full animate-in fade-in duration-1000">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
             <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-12 w-12 rounded-xl bg-slate-100 hover:bg-primary hover:text-white transition-all shadow-sm">
                <ArrowLeft className="h-6 w-6" />
             </Button>
             <Button variant="ghost" size="icon" onClick={() => router.push('/')} className="h-12 w-12 rounded-xl bg-slate-100 hover:bg-primary hover:text-white transition-all shadow-sm">
                <Home className="h-6 w-6" />
             </Button>
          </div>
          <div className="space-y-2">
             <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-accent text-white font-black text-[10px] uppercase tracking-widest shadow-xl shadow-accent/20">
                <BookOpenCheck className="h-3.5 w-3.5" /> Dinamik Müfredat Motoru
             </div>
             <h2 className="text-6xl font-black tracking-tighter italic text-primary uppercase leading-none text-shadow-premium">
                Müfredat <br /><span className="text-accent text-shadow-accent">Yönetimi</span>
             </h2>
          </div>
        </div>

        <Dialog open={isAddingProgram} onOpenChange={setIsAddingProgram}>
          <DialogTrigger asChild>
             <Button className="h-20 px-10 rounded-[2rem] bg-primary hover:bg-accent transition-all duration-500 font-black text-sm uppercase tracking-widest gap-4 shadow-2xl shadow-primary/20">
                <Plus className="h-7 w-7 text-accent" /> Yeni Program Ekle
             </Button>
          </DialogTrigger>
          <DialogContent className="rounded-[3rem] border-none shadow-2xl p-12 bg-white max-w-lg">
             <DialogHeader className="space-y-4">
                <DialogTitle className="text-4xl font-black italic tracking-tighter text-primary uppercase">Program Tanımla</DialogTitle>
                <DialogDescription className="font-medium italic">Sisteme yeni bir sınav türü ekleyin.</DialogDescription>
             </DialogHeader>
             <form onSubmit={handleAddProgram} className="space-y-8 pt-8">
                <div className="space-y-3">
                   <Label className="text-xs font-black uppercase tracking-widest opacity-40 ml-2 italic">Program Adı</Label>
                   <Input name="title" required placeholder="Örn: LGS 2026..." className="h-16 rounded-2xl bg-slate-50 border-none shadow-inner font-black text-xl" />
                </div>
                <div className="space-y-3">
                   <Label className="text-xs font-black uppercase tracking-widest opacity-40 ml-2 italic">Kategori</Label>
                   <Select name="category" required>
                      <SelectTrigger className="h-16 rounded-2xl bg-slate-50 border-none shadow-inner font-bold text-lg">
                         <SelectValue placeholder="Kategori Seç" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-none shadow-2xl">
                         {['ORTAOKUL', 'ÜNİVERSİTE', 'KAMU', 'DİL', 'AKADEMİK'].map(c => <SelectItem key={c} value={c} className="font-bold">{c}</SelectItem>)}
                      </SelectContent>
                   </Select>
                </div>
                <Button type="submit" disabled={loading === 'add-program'} className="w-full h-20 rounded-[2rem] bg-primary hover:bg-accent transition-all font-black text-sm uppercase tracking-widest gap-3 shadow-2xl">
                   {loading === 'add-program' ? <Loader2 className="h-6 w-6 animate-spin" /> : <Save className="h-6 w-6" />}
                   Sisteme Kaydet
                </Button>
             </form>
          </DialogContent>
        </Dialog>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* PROGRAMS COLUMN */}
        <div className="lg:col-span-3 space-y-6">
           <div className="flex items-center justify-between px-4">
              <h3 className="text-xl font-black italic tracking-tighter text-primary uppercase">Programlar</h3>
              <Target className="h-5 w-5 text-accent opacity-20" />
           </div>
           <div className="space-y-3">
              {programsLoading ? (
                 <div className="py-20 text-center opacity-30 animate-pulse font-black uppercase tracking-widest text-xs">Yükleniyor...</div>
              ) : programs.map((p) => (
                 <div 
                   key={p.id} 
                   onClick={() => { setSelectedProgram(p.id); setSelectedSubject(''); setSelectedUnit(''); }}
                   className={cn(
                     "flex items-center justify-between p-6 rounded-[2rem] border transition-all cursor-pointer group",
                     selectedProgram === p.id 
                       ? "bg-primary border-primary text-white shadow-xl scale-[1.02]" 
                       : "bg-white border-primary/5 hover:bg-slate-50 hover:shadow-lg"
                   )}
                 >
                    <div className="flex items-center gap-4">
                       <Grid3X3 className={cn("h-5 w-5", selectedProgram === p.id ? "text-accent" : "text-primary")} />
                       <p className="font-black text-sm tracking-tight leading-none uppercase">{p.title}</p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={(e) => { e.stopPropagation(); handleDeleteItem('programs', p.id); }}
                      className={cn("h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity", selectedProgram === p.id ? "hover:bg-white/10 text-white" : "hover:bg-destructive/10 text-destructive")}
                    >
                       <Trash2 className="h-4 w-4" />
                    </Button>
                 </div>
              ))}
           </div>
        </div>

        {/* SUBJECTS COLUMN */}
        <div className="lg:col-span-3 space-y-6">
           {selectedProgram ? (
              <>
                 <div className="flex items-center justify-between px-4">
                    <h3 className="text-xl font-black italic tracking-tighter text-primary uppercase">Dersler</h3>
                    <Dialog open={isAddingSubject} onOpenChange={setIsAddingSubject}>
                       <DialogTrigger asChild>
                          <Button size="icon" className="h-10 w-10 rounded-full bg-accent hover:bg-primary transition-all shadow-lg shadow-accent/20">
                             <Plus className="h-5 w-5 text-white" />
                          </Button>
                       </DialogTrigger>
                       <DialogContent className="rounded-[3rem] border-none shadow-2xl p-10 bg-white max-w-md">
                          <DialogHeader><DialogTitle className="text-2xl font-black italic tracking-tighter text-primary uppercase">Ders Ekle</DialogTitle></DialogHeader>
                          <form onSubmit={handleAddSubject} className="space-y-6 pt-6">
                             <div className="space-y-2">
                                <Label>Ders Adı</Label>
                                <Input name="name" required placeholder="Örn: Matematik..." className="h-14 rounded-xl" />
                             </div>
                             <Button type="submit" disabled={loading === 'add-subject'} className="w-full h-14 rounded-xl bg-primary hover:bg-accent font-black text-xs uppercase tracking-widest gap-2">
                                {loading === 'add-subject' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Kaydet
                             </Button>
                          </form>
                       </DialogContent>
                    </Dialog>
                 </div>
                 <div className="space-y-3">
                    {subjects.map((s) => (
                       <div 
                         key={s.id} 
                         onClick={() => { setSelectedSubject(s.id); setSelectedUnit(''); }}
                         className={cn(
                           "flex items-center justify-between p-6 rounded-[2rem] border transition-all cursor-pointer group",
                           selectedSubject === s.id 
                             ? "bg-slate-900 border-primary text-white shadow-xl scale-[1.02]" 
                             : "bg-white border-primary/5 hover:bg-slate-50 hover:shadow-lg"
                         )}
                       >
                          <div className="flex items-center gap-4">
                             <Layers className={cn("h-5 w-5", selectedSubject === s.id ? "text-accent" : "text-primary")} />
                             <p className="font-black text-sm tracking-tight leading-none uppercase">{s.name}</p>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={(e) => { e.stopPropagation(); handleDeleteItem('subjects', s.id); }}
                            className={cn("h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity", selectedSubject === s.id ? "hover:bg-white/10 text-white" : "hover:bg-destructive/10 text-destructive")}
                          >
                             <Trash2 className="h-4 w-4" />
                          </Button>
                       </div>
                    ))}
                    {subjects.length === 0 && <div className="p-10 text-center opacity-20 italic text-xs uppercase">Ders Bulunmuyor</div>}
                 </div>
              </>
           ) : <div className="h-full flex items-center justify-center opacity-10 font-black uppercase text-xs">Program Seçin</div>}
        </div>

        {/* UNITS COLUMN */}
        <div className="lg:col-span-3 space-y-6">
           {selectedSubject ? (
              <>
                 <div className="flex items-center justify-between px-4">
                    <h3 className="text-xl font-black italic tracking-tighter text-primary uppercase">Üniteler</h3>
                    <Dialog open={isAddingUnit} onOpenChange={setIsAddingUnit}>
                       <DialogTrigger asChild>
                          <Button size="icon" className="h-10 w-10 rounded-full bg-accent hover:bg-primary transition-all shadow-lg shadow-accent/20">
                             <Plus className="h-5 w-5 text-white" />
                          </Button>
                       </DialogTrigger>
                       <DialogContent className="rounded-[3rem] border-none shadow-2xl p-10 bg-white max-w-md">
                          <DialogHeader><DialogTitle className="text-2xl font-black italic tracking-tighter text-primary uppercase">Ünite Ekle</DialogTitle></DialogHeader>
                          <form onSubmit={handleAddUnit} className="space-y-6 pt-6">
                             <div className="space-y-2">
                                <Label>Ünite Adı</Label>
                                <Input name="name" required placeholder="Örn: Sayılar..." className="h-14 rounded-xl" />
                             </div>
                             <Button type="submit" disabled={loading === 'add-unit'} className="w-full h-14 rounded-xl bg-primary hover:bg-accent font-black text-xs uppercase tracking-widest gap-2">
                                {loading === 'add-unit' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Kaydet
                             </Button>
                          </form>
                       </DialogContent>
                    </Dialog>
                 </div>
                 <div className="space-y-3">
                    {units.map((u) => (
                       <div 
                         key={u.id} 
                         onClick={() => setSelectedUnit(u.id)}
                         className={cn(
                           "flex items-center justify-between p-6 rounded-[2rem] border transition-all cursor-pointer group",
                           selectedUnit === u.id 
                             ? "bg-primary border-primary text-white shadow-xl scale-[1.02]" 
                             : "bg-white border-primary/5 hover:bg-slate-50 hover:shadow-lg"
                         )}
                       >
                          <div className="flex items-center gap-4">
                             <LayoutTemplate className={cn("h-5 w-5", selectedUnit === u.id ? "text-accent" : "text-primary")} />
                             <p className="font-black text-sm tracking-tight leading-none uppercase">{u.name}</p>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={(e) => { e.stopPropagation(); handleDeleteItem('units', u.id); }}
                            className={cn("h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity", selectedUnit === u.id ? "hover:bg-white/10 text-white" : "hover:bg-destructive/10 text-destructive")}
                          >
                             <Trash2 className="h-4 w-4" />
                          </Button>
                       </div>
                    ))}
                    {units.length === 0 && <div className="p-10 text-center opacity-20 italic text-xs uppercase">Ünite Bulunmuyor</div>}
                 </div>
              </>
           ) : <div className="h-full flex items-center justify-center opacity-10 font-black uppercase text-xs">Ders Seçin</div>}
        </div>

        {/* TOPICS COLUMN */}
        <div className="lg:col-span-3 space-y-6">
           {selectedUnit ? (
              <>
                 <div className="flex items-center justify-between px-4">
                    <h3 className="text-xl font-black italic tracking-tighter text-primary uppercase">Konular</h3>
                    <Dialog open={isAddingTopic} onOpenChange={setIsAddingTopic}>
                       <DialogTrigger asChild>
                          <Button size="icon" className="h-10 w-10 rounded-full bg-accent hover:bg-primary transition-all shadow-lg shadow-accent/20">
                             <Plus className="h-5 w-5 text-white" />
                          </Button>
                       </DialogTrigger>
                       <DialogContent className="rounded-[3rem] border-none shadow-2xl p-10 bg-white max-w-md">
                          <DialogHeader><DialogTitle className="text-2xl font-black italic tracking-tighter text-primary uppercase">Konu Ekle</DialogTitle></DialogHeader>
                          <form onSubmit={handleAddTopic} className="space-y-6 pt-6">
                             <div className="space-y-2">
                                <Label>Konu / Kazanım Adı</Label>
                                <Input name="name" required placeholder="Örn: Tam Sayılar..." className="h-14 rounded-xl" />
                             </div>
                             <Button type="submit" disabled={loading === 'add-topic'} className="w-full h-14 rounded-xl bg-primary hover:bg-accent font-black text-xs uppercase tracking-widest gap-2">
                                {loading === 'add-topic' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Kaydet
                             </Button>
                          </form>
                       </DialogContent>
                    </Dialog>
                 </div>
                 <div className="space-y-3">
                    {topics.map((t) => (
                       <div 
                         key={t.id} 
                         className="flex items-center justify-between p-6 rounded-[2rem] border bg-white border-primary/5 hover:bg-slate-50 hover:shadow-lg transition-all group"
                       >
                          <div className="flex items-center gap-4">
                             <FileText className="h-5 w-5 text-primary opacity-40" />
                             <p className="font-bold text-sm tracking-tight leading-none uppercase">{t.name}</p>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={(e) => { e.stopPropagation(); handleDeleteItem('topics', t.id); }}
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 text-destructive"
                          >
                             <Trash2 className="h-4 w-4" />
                          </Button>
                       </div>
                    ))}
                    {topics.length === 0 && <div className="p-10 text-center opacity-20 italic text-xs uppercase">Konu Bulunmuyor</div>}
                 </div>
              </>
           ) : <div className="h-full flex items-center justify-center opacity-10 font-black uppercase text-xs">Ünite Seçin</div>}
        </div>
      </div>
    </div>
  );
}
