
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
  Grid3X3, Database, Save
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AdminCurriculumPage() {
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  
  const [selectedProgram, setSelectedProgram] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [loading, setLoading] = useState<string | null>(null);
  const [isAddingProgram, setIsAddingProgram] = useState(false);
  const [isAddingSubject, setIsAddingSubject] = useState(false);
  
  const { data: programs, loading: programsLoading } = useCollection<any>('programs', orderBy('title', 'asc'));
  
  const subjectsQuery = useMemo(() => {
    if (!selectedProgram) return null;
    return query(collection(db!, 'subjects'), where('programId', '==', selectedProgram));
  }, [db, selectedProgram]);
  
  const { data: subjects } = useCollection<any>(subjectsQuery);

  const unitsQuery = useMemo(() => {
    if (!selectedSubject) return null;
    return query(collection(db!, 'units'), where('subjectId', '==', selectedSubject));
  }, [db, selectedSubject]);

  const { data: units } = useCollection<any>(unitsQuery);

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
      });
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
    const id = `${selectedProgram}_${name.toLowerCase().replace(/\s+/g, '_')}`;

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

  const handleDeleteProgram = async (id: string) => {
    if (!db || !confirm('Bu programı silmek istediğinize emin misiniz?')) return;
    try {
      await deleteDoc(doc(db, 'programs', id));
      toast({ title: 'Silindi', description: 'Program başarıyla kaldırıldı.' });
      if (selectedProgram === id) setSelectedProgram('');
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
                <DialogDescription className="font-medium italic">Sisteme yeni bir sınav türü veya eğitim programı ekleyin.</DialogDescription>
             </DialogHeader>
             <form onSubmit={handleAddProgram} className="space-y-8 pt-8">
                <div className="space-y-3">
                   <Label className="text-xs font-black uppercase tracking-widest opacity-40 ml-2 italic">Program Adı</Label>
                   <Input name="title" required placeholder="Örn: LGS 2026, TYT Kampı..." className="h-16 rounded-2xl bg-slate-50 border-none shadow-inner font-black text-xl focus:ring-accent" />
                </div>
                <div className="space-y-3">
                   <Label className="text-xs font-black uppercase tracking-widest opacity-40 ml-2 italic">Kategori</Label>
                   <Select name="category" required>
                      <SelectTrigger className="h-16 rounded-2xl bg-slate-50 border-none shadow-inner font-bold text-lg">
                         <SelectValue placeholder="Kategori Seç" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-none shadow-2xl">
                         {['ORTAOKUL', 'ÜNİVERSİTE', 'KAMU', 'DİL', 'ÖZEL'].map(c => <SelectItem key={c} value={c} className="font-bold">{c}</SelectItem>)}
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
        <div className="lg:col-span-4 space-y-10">
           <Card className="rounded-[4rem] border-none shadow-[0_60px_100px_-20px_rgba(15,23,42,0.12)] bg-white p-12 space-y-10 border border-primary/5">
              <div className="flex items-center justify-between border-b border-primary/5 pb-8">
                 <h3 className="text-3xl font-black italic tracking-tighter text-primary uppercase">Programlar</h3>
                 <Target className="h-8 w-8 text-accent opacity-20" />
              </div>
              <div className="space-y-4">
                 {programsLoading ? (
                    <div className="py-20 text-center opacity-30 animate-pulse font-black uppercase tracking-widest text-xs">Yükleniyor...</div>
                 ) : programs.map((p) => (
                    <div 
                      key={p.id} 
                      onClick={() => setSelectedProgram(p.id)}
                      className={cn(
                        "flex items-center justify-between p-8 rounded-[2.5rem] border transition-all cursor-pointer group",
                        selectedProgram === p.id 
                          ? "bg-primary border-primary text-white shadow-[0_30px_60px_-15px_rgba(15,23,42,0.4)] scale-[1.02]" 
                          : "bg-slate-50 border-transparent hover:bg-white hover:shadow-2xl"
                      )}
                    >
                       <div className="flex items-center gap-6">
                          <div className={cn(
                            "h-14 w-14 rounded-2xl flex items-center justify-center transition-all",
                            selectedProgram === p.id ? "bg-accent text-white" : "bg-white text-primary shadow-sm"
                          )}>
                             <Grid3X3 className="h-7 w-7" />
                          </div>
                          <div>
                             <p className="font-black text-xl tracking-tight leading-none mb-1 uppercase">{p.title}</p>
                             <p className={cn("text-[9px] font-black uppercase tracking-[0.2em]", selectedProgram === p.id ? "opacity-40" : "text-muted-foreground opacity-40")}>{p.category}</p>
                          </div>
                       </div>
                       <Button 
                         variant="ghost" 
                         size="icon" 
                         onClick={(e) => { e.stopPropagation(); handleDeleteProgram(p.id); }}
                         className={cn("h-10 w-10 opacity-0 group-hover:opacity-100 transition-opacity", selectedProgram === p.id ? "hover:bg-white/10 text-white" : "hover:bg-destructive/10 text-destructive")}
                       >
                          <Trash2 className="h-5 w-5" />
                       </Button>
                    </div>
                 ))}
              </div>
           </Card>
        </div>

        <div className="lg:col-span-8 space-y-12">
           {selectedProgram ? (
              <>
                 <Card className="rounded-[4rem] border-none shadow-[0_60px_100px_-20px_rgba(15,23,42,0.12)] bg-white p-12 space-y-10 border border-primary/5 animate-in slide-in-from-right duration-700">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-8 border-b border-primary/5 pb-10">
                       <div className="space-y-2">
                          <h3 className="text-4xl font-black italic tracking-tighter text-primary uppercase">Ders Yapısı</h3>
                          <p className="text-sm font-bold text-muted-foreground italic uppercase tracking-widest">{programs.find(p => p.id === selectedProgram)?.title} için içerik yönetimi</p>
                       </div>
                       <Dialog open={isAddingSubject} onOpenChange={setIsAddingSubject}>
                          <DialogTrigger asChild>
                             <Button className="h-16 px-8 rounded-2xl bg-accent hover:bg-primary transition-all font-black text-[10px] uppercase tracking-widest gap-3 shadow-2xl shadow-accent/20">
                                <Plus className="h-5 w-5" /> Ders Ekle
                             </Button>
                          </DialogTrigger>
                          <DialogContent className="rounded-[3rem] border-none shadow-2xl p-12 bg-white max-w-md">
                             <DialogHeader className="space-y-4">
                                <DialogTitle className="text-3xl font-black italic tracking-tighter text-primary uppercase">Yeni Ders Tanımla</DialogTitle>
                             </DialogHeader>
                             <form onSubmit={handleAddSubject} className="space-y-8 pt-8">
                                <div className="space-y-3">
                                   <Label className="text-xs font-black uppercase tracking-widest opacity-40 ml-2">Ders Adı</Label>
                                   <Input name="name" required placeholder="Örn: Analitik Geometri..." className="h-16 rounded-2xl bg-slate-50 border-none shadow-inner font-black text-xl" />
                                </div>
                                <Button type="submit" disabled={loading === 'add-subject'} className="w-full h-18 rounded-[1.75rem] bg-primary hover:bg-accent transition-all font-black text-xs uppercase tracking-widest gap-3 shadow-2xl">
                                   {loading === 'add-subject' ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                                   Dersi Kaydet
                                </Button>
                             </form>
                          </DialogContent>
                       </Dialog>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       {subjects.map((s) => (
                          <div 
                            key={s.id} 
                            onClick={() => setSelectedSubject(s.id)}
                            className={cn(
                              "group p-10 rounded-[3rem] border transition-all cursor-pointer relative overflow-hidden",
                              selectedSubject === s.id 
                                ? "bg-slate-900 border-primary text-white shadow-2xl" 
                                : "bg-[#F8FAFC] border-transparent hover:bg-white hover:shadow-xl"
                            )}
                          >
                             <div className="flex justify-between items-start mb-8 relative z-10">
                                <div className={cn(
                                  "h-16 w-16 rounded-2xl flex items-center justify-center transition-all shadow-xl group-hover:scale-110 group-hover:rotate-6",
                                  selectedSubject === s.id ? "bg-accent text-white shadow-accent/20" : "bg-white text-primary"
                                )}>
                                   <Layers className="h-8 w-8" />
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                   <Button size="icon" variant="ghost" className={cn("h-10 w-10 rounded-xl", selectedSubject === s.id ? "hover:bg-white/10" : "hover:bg-slate-100")}><Edit3 className="h-4 w-4" /></Button>
                                   <Button size="icon" variant="ghost" className={cn("h-10 w-10 rounded-xl text-destructive", selectedSubject === s.id ? "hover:bg-white/10" : "hover:bg-destructive/10")}><Trash2 className="h-4 w-4" /></Button>
                                </div>
                             </div>
                             <h4 className="text-2xl font-black italic tracking-tighter uppercase mb-2 relative z-10">{s.name}</h4>
                             <div className="flex items-center gap-3 relative z-10">
                                <span className={cn("text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full", selectedSubject === s.id ? "bg-white/10 text-accent" : "bg-primary/5 text-primary")}>14 Ünite</span>
                                <span className={cn("text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full", selectedSubject === s.id ? "bg-white/10 text-emerald-400" : "bg-emerald-50 text-emerald-600")}>Aktif</span>
                             </div>
                          </div>
                       ))}
                    </div>

                    {subjects.length === 0 && (
                       <div className="py-40 text-center space-y-8 opacity-20 italic">
                          <Database className="h-20 w-20 mx-auto" />
                          <p className="text-xl font-black uppercase tracking-widest">Bu programda henüz ders tanımlanmamış.</p>
                       </div>
                    )}
                 </Card>

                 {selectedSubject && (
                    <Card className="rounded-[4rem] border-none shadow-[0_60px_100px_-20px_rgba(15,23,42,0.12)] bg-white p-12 space-y-10 border border-primary/5 animate-in zoom-in-95 duration-500">
                       <div className="flex items-center justify-between">
                          <div className="space-y-1">
                             <h3 className="text-3xl font-black italic tracking-tighter text-primary uppercase">Üniteler & Konular</h3>
                             <p className="text-xs font-bold text-muted-foreground italic uppercase tracking-widest">{subjects.find(s => s.id === selectedSubject)?.name} için müfredat detayı</p>
                          </div>
                          <Button variant="outline" className="h-14 px-8 rounded-2xl border-2 border-primary/5 font-black text-[10px] uppercase tracking-widest gap-3 hover:bg-primary hover:text-white transition-all shadow-sm">
                             <Plus className="h-4 w-4" /> Yeni Ünite
                          </Button>
                       </div>
                       
                       <div className="grid gap-6">
                          {units.length > 0 ? units.map((u, idx) => (
                             <div key={u.id} className="p-8 bg-[#F8FAFC] rounded-[2.5rem] border border-primary/5 flex items-center justify-between group hover:bg-white hover:shadow-2xl transition-all">
                                <div className="flex items-center gap-8">
                                   <div className="h-12 w-12 rounded-2xl bg-white border border-primary/5 flex items-center justify-center font-black text-lg text-primary shadow-sm group-hover:bg-accent group-hover:text-white transition-all">{idx + 1}</div>
                                   <p className="text-2xl font-black italic tracking-tight text-primary leading-none uppercase">{u.name}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                   <Button variant="ghost" className="h-12 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest gap-2">12 Konu <ChevronRight className="h-4 w-4" /></Button>
                                   <Button size="icon" variant="ghost" className="h-10 w-10 text-destructive"><Trash2 className="h-5 w-5" /></Button>
                                </div>
                             </div>
                          )) : (
                             <div className="p-20 text-center bg-slate-50 rounded-[3rem] border border-dashed border-primary/10 opacity-30 italic font-black uppercase tracking-widest text-xs">Henüz ünite tanımlanmamış.</div>
                          )}
                       </div>
                    </Card>
                 )}
              </>
           ) : (
              <div className="h-full min-h-[600px] flex flex-col items-center justify-center text-center space-y-10 animate-in fade-in duration-1000">
                 <div className="relative">
                    <div className="absolute -inset-10 bg-accent/10 blur-[80px] rounded-full"></div>
                    <BookOpenCheck className="h-40 w-40 text-primary relative z-10 opacity-10" />
                 </div>
                 <div className="space-y-4 relative z-10">
                    <h3 className="text-4xl font-black italic tracking-tighter text-primary uppercase">Program Seçin</h3>
                    <p className="text-xl text-muted-foreground font-medium italic max-w-md mx-auto">Sol taraftaki listeden yönetim yapmak istediğiniz eğitim programını seçerek başlayın.</p>
                 </div>
              </div>
           )}
        </div>
      </div>
    </div>
  );
}
