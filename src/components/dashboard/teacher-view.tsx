
'use client';

import { useCollection, useFirestore } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, Calendar, Plus, MessageSquare, ArrowUpRight, Eye, Hash, Copy, 
  TrendingUp, AlertTriangle, Brain, FileText, BarChart3, Search, 
  LayoutDashboard, ClipboardList, Sparkles, PieChart, ArrowRight,
  CheckCircle2, Clock, MapPin, UserCheck, Zap, Mail, ChevronRight,
  CalendarDays, BookOpen, UserPlus, Target, Settings, ShieldCheck, Activity,
  School, Layers, BookOpenCheck, Loader2, Save, Trash2, Edit3, Grid3X3
} from 'lucide-react';
import { collection, doc, setDoc, deleteDoc, query, where, orderBy, serverTimestamp, updateDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useState, useMemo } from 'react';
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
import { Label } from '@/components/ui/label';

interface TeacherViewProps {
  user: any;
  userData: any;
}

export function TeacherView({ user, userData }: TeacherViewProps) {
  const router = useRouter();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState<string | null>(null);
  const [isAddingClass, setIsAddingClass] = useState(false);
  const [isAddingSubject, setIsAddingSubject] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<string>('');

  // Veri Çekme
  const { data: students } = useCollection<any>(
    'users',
    where('role', '==', 'student'),
    where('coachId', '==', user?.uid || '')
  );

  const { data: classrooms } = useCollection<any>(
    'classrooms',
    where('teacherId', '==', user?.uid || '')
  );

  const { data: programs } = useCollection<any>('programs', orderBy('title', 'asc'));
  
  const mySubjectsQuery = useMemo(() => {
    if (!user?.uid) return null;
    return query(collection(db!, 'subjects'), where('creatorId', '==', user.uid));
  }, [db, user?.uid]);
  
  const { data: mySubjects } = useCollection<any>(mySubjectsQuery);

  const copyCode = () => {
    if (userData?.activationCode) {
      navigator.clipboard.writeText(userData.activationCode);
      toast({ title: 'Kopyalandı', description: 'Aktivasyon kodu panoya kopyalandı.' });
    }
  };

  const handleAddClassroom = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!db || !user) return;
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const grade = formData.get('grade') as string;
    const id = `class_${user.uid}_${Date.now()}`;

    setLoading('add-class');
    try {
      await setDoc(doc(db, 'classrooms', id), {
        id,
        name,
        grade,
        teacherId: user.uid,
        schoolId: userData.school || '',
        studentIds: [],
        createdAt: serverTimestamp(),
      });
      toast({ title: 'Sınıf Oluşturuldu', description: `${name} şubesi başarıyla sisteme eklendi.` });
      setIsAddingClass(false);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Hata', description: 'Sınıf eklenemedi.' });
    } finally {
      setLoading(null);
    }
  };

  const handleAddSubject = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!db || !user || !selectedProgram) return;
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const id = `subj_${user.uid}_${Date.now()}`;

    setLoading('add-subject');
    try {
      await setDoc(doc(db, 'subjects', id), {
        id,
        programId: selectedProgram,
        name,
        creatorId: user.uid,
        isActive: true,
        order: (mySubjects?.length || 0) + 1,
        createdAt: serverTimestamp(),
      });
      toast({ title: 'Özel Ders Eklendi', description: `${name} dersi müfredatınıza eklendi.` });
      setIsAddingSubject(false);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Hata', description: 'Ders eklenemedi.' });
    } finally {
      setLoading(null);
    }
  };

  const stats = [
    { label: 'Toplam Öğrenci', val: students.length, icon: Users, color: 'text-primary' },
    { label: 'Aktif Sınıf', val: classrooms.length, icon: School, color: 'text-accent' },
    { label: 'Özel Dersler', val: mySubjects.length, icon: BookOpenCheck, color: 'text-primary' },
    { label: 'Riskli Durum', val: 2, icon: AlertTriangle, color: 'text-destructive' },
  ];

  return (
    <div className="p-8 lg:p-12 space-y-12 max-w-7xl mx-auto w-full animate-in fade-in duration-1000">
      {/* Premium Header */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-10">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-accent text-white font-black text-[10px] uppercase tracking-widest shadow-[0_20px_40px_-5px_rgba(245,158,11,0.3)]">
            <Sparkles className="h-3.5 w-3.5" /> Akademik Harekât Merkezi
          </div>
          <h2 className="text-6xl font-black tracking-tighter italic text-primary uppercase leading-[0.9] text-shadow-premium">
            Hoş Geldiniz, <br /><span className="text-accent text-shadow-accent">{userData?.displayName}</span>
          </h2>
        </div>
        <div className="flex flex-wrap gap-6 w-full xl:w-auto">
           <Card className="bg-primary text-white border-none rounded-[2.5rem] px-10 py-6 flex items-center gap-10 shadow-[0_40px_80px_-20px_rgba(15,23,42,0.4)] relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 blur-[60px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
              <div className="space-y-1 relative z-10">
                 <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 italic">Eşleşme Kodun</p>
                 <p className="text-3xl font-black tracking-[0.25em] font-mono text-shadow-deep">{userData?.activationCode}</p>
              </div>
              <Button size="icon" onClick={copyCode} variant="ghost" className="hover:bg-white/10 rounded-2xl h-14 w-14 relative z-10 transition-all hover:scale-110 active:scale-95 border border-white/5">
                 <Copy className="h-7 w-7 text-accent" />
              </Button>
           </Card>
           <Button className="h-20 px-10 rounded-[2rem] bg-accent hover:bg-primary transition-all duration-500 font-black text-sm uppercase tracking-widest gap-4 shadow-[0_30px_60px_-15px_rgba(245,158,11,0.4)] hover:-translate-y-1">
              <UserPlus className="h-6 w-6" /> Öğrenci Davet Et
           </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-12">
        <TabsList className="bg-[#F1F5F9]/80 backdrop-blur-xl p-2.5 rounded-[3rem] h-24 shadow-inner flex overflow-x-auto scrollbar-hide border border-primary/5">
          <TabsTrigger value="overview" className="rounded-[2.5rem] px-12 h-full font-black text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-xl transition-all duration-500 gap-4 group">
             <LayoutDashboard className="h-5 w-5 group-data-[state=active]:text-accent" /> Genel Bakış
          </TabsTrigger>
          <TabsTrigger value="classrooms" className="rounded-[2.5rem] px-12 h-full font-black text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-xl transition-all duration-500 gap-4 group">
             <School className="h-5 w-5 group-data-[state=active]:text-accent" /> Sınıf Yönetimi
          </TabsTrigger>
          <TabsTrigger value="curriculum" className="rounded-[2.5rem] px-12 h-full font-black text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-xl transition-all duration-500 gap-4 group">
             <BookOpenCheck className="h-5 w-5 group-data-[state=active]:text-accent" /> Müfredatım
          </TabsTrigger>
          <TabsTrigger value="students" className="rounded-[2.5rem] px-12 h-full font-black text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-xl transition-all duration-500 gap-4 group">
             <Users className="h-5 w-5 group-data-[state=active]:text-accent" /> Öğrencilerim
          </TabsTrigger>
          <TabsTrigger value="ai" className="rounded-[2.5rem] px-12 h-full font-black text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-xl transition-all duration-500 gap-4 group">
             <Brain className="h-5 w-5 text-accent animate-pulse" /> AI Asistanı
          </TabsTrigger>
        </TabsList>

        {/* --- GENEL BAKIŞ --- */}
        <TabsContent value="overview" className="space-y-12 outline-none animate-in fade-in slide-in-from-bottom-4">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
             {stats.map((stat, i) => (
               <Card key={i} className="premium-card p-10 group border border-primary/5 relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-[40px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
                 <div className="flex justify-between items-start mb-8 relative z-10">
                    <div className="h-16 w-16 rounded-[1.25rem] bg-slate-50 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all shadow-inner">
                       <stat.icon className={cn("h-8 w-8", stat.color)} />
                    </div>
                    <Badge variant="outline" className="text-[10px] font-black uppercase opacity-40">Canlı</Badge>
                 </div>
                 <p className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-1 italic">{stat.label}</p>
                 <p className="text-6xl font-black text-primary tracking-tighter text-shadow-deep">{stat.val}</p>
               </Card>
             ))}
           </div>

           <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
              <Card className="xl:col-span-8 rounded-[4rem] border-none shadow-xl bg-white p-12 space-y-10 border border-primary/5">
                 <div className="flex justify-between items-center">
                    <h3 className="text-3xl font-black italic tracking-tighter uppercase text-shadow-deep">Haftalık Başarı Trendi</h3>
                    <Button variant="ghost" className="font-black text-[10px] uppercase tracking-widest gap-2">Detaylar <ArrowRight className="h-4 w-4" /></Button>
                 </div>
                 <div className="h-[300px] flex items-end gap-8 pb-4">
                    {[45, 68, 85, 52, 98, 74, 88].map((h, i) => (
                      <div key={i} className="flex-1 bg-slate-50 rounded-[2rem] relative group/bar hover:bg-slate-100 transition-all">
                         <div className="absolute bottom-0 w-full bg-primary rounded-[2rem] transition-all duration-1000 group-hover/bar:bg-accent" style={{ height: `${h}%` }}></div>
                      </div>
                    ))}
                 </div>
              </Card>

              <div className="xl:col-span-4 space-y-10">
                 <Card className="rounded-[3.5rem] border-none shadow-xl bg-primary text-white p-12 space-y-8 relative overflow-hidden group">
                    <Brain className="h-12 w-12 text-accent absolute top-8 right-8 opacity-20" />
                    <h4 className="text-2xl font-black italic tracking-tighter uppercase">AI Risk Analizi</h4>
                    <p className="text-lg leading-relaxed font-medium opacity-90 italic">
                       "Sınıf genelinde Matematik netleri geçen haftaya göre %12 düşüşte. Acil telafi dersi önerilir."
                    </p>
                    <Button className="w-full h-16 rounded-2xl bg-accent hover:bg-white hover:text-primary transition-all font-black text-xs uppercase tracking-widest shadow-2xl shadow-accent/20">Aksiyon Al</Button>
                 </Card>
              </div>
           </div>
        </TabsContent>

        {/* --- SINIF YÖNETİMİ --- */}
        <TabsContent value="classrooms" className="space-y-12 outline-none animate-in fade-in">
           <header className="flex justify-between items-center">
              <div className="space-y-1">
                 <h3 className="text-4xl font-black italic tracking-tighter text-primary uppercase">Şube & Sınıf Merkezi</h3>
                 <p className="text-sm font-bold text-muted-foreground italic uppercase">Eğitim verdiğiniz tüm şubeleri buradan yönetin.</p>
              </div>
              <Dialog open={isAddingClass} onOpenChange={setIsAddingClass}>
                 <DialogTrigger asChild>
                    <Button className="h-16 px-8 rounded-2xl bg-primary hover:bg-accent transition-all font-black text-xs uppercase tracking-widest gap-3 shadow-xl shadow-primary/20">
                       <Plus className="h-5 w-5" /> Yeni Şube Oluştur
                    </Button>
                 </DialogTrigger>
                 <DialogContent className="rounded-[3rem] border-none shadow-2xl p-10 bg-white">
                    <DialogHeader>
                       <DialogTitle className="text-3xl font-black italic tracking-tighter text-primary uppercase">Sınıf Tanımla</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleAddClassroom} className="space-y-8 pt-8">
                       <div className="space-y-3">
                          <Label className="text-xs font-black uppercase tracking-widest opacity-40 ml-2">Şube Adı</Label>
                          <Input name="name" required placeholder="Örn: 12-A SAY, 11-B MF..." className="h-16 rounded-2xl bg-slate-50 border-none shadow-inner font-black text-xl" />
                       </div>
                       <div className="space-y-3">
                          <Label className="text-xs font-black uppercase tracking-widest opacity-40 ml-2">Kademe / Sınıf</Label>
                          <Select name="grade" required>
                             <SelectTrigger className="h-16 rounded-2xl bg-slate-50 border-none shadow-inner font-bold text-lg">
                                <SelectValue placeholder="Seçiniz" />
                             </SelectTrigger>
                             <SelectContent className="rounded-2xl">
                                {['8. Sınıf', '9. Sınıf', '10. Sınıf', '11. Sınıf', '12. Sınıf', 'Mezun'].map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                             </SelectContent>
                          </Select>
                       </div>
                       <Button type="submit" disabled={loading === 'add-class'} className="w-full h-18 rounded-[1.75rem] bg-primary hover:bg-accent font-black text-xs uppercase tracking-widest gap-3 shadow-2xl">
                          {loading === 'add-class' ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                          Sisteme Kaydet
                       </Button>
                    </form>
                 </DialogContent>
              </Dialog>
           </header>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {classrooms.length > 0 ? classrooms.map((cls) => (
                 <Card key={cls.id} className="premium-card p-10 group border border-primary/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 blur-[40px] rounded-full"></div>
                    <div className="space-y-8">
                       <div className="flex justify-between items-start">
                          <div className="h-16 w-16 rounded-2xl bg-primary flex items-center justify-center text-white shadow-xl group-hover:rotate-6 transition-all">
                             <Layers className="h-8 w-8" />
                          </div>
                          <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 font-black text-[10px] uppercase">Aktif</Badge>
                       </div>
                       <div>
                          <h4 className="text-3xl font-black text-primary italic uppercase tracking-tighter leading-none mb-1">{cls.name}</h4>
                          <p className="text-[11px] font-black text-accent uppercase tracking-widest">{cls.grade} • {cls.studentIds?.length || 0} Öğrenci</p>
                       </div>
                       <div className="flex gap-4 pt-2">
                          <Button variant="outline" className="flex-1 h-12 rounded-xl border-2 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50">Öğrenciler</Button>
                          <Button size="icon" className="h-12 w-12 rounded-xl bg-slate-50 text-primary hover:bg-primary hover:text-white shadow-inner transition-all"><Settings className="h-5 w-5" /></Button>
                       </div>
                    </div>
                 </Card>
              )) : (
                 <div className="col-span-full py-40 text-center opacity-30 italic font-black uppercase tracking-widest text-xs">Henüz bir şube tanımlamadınız.</div>
              )}
           </div>
        </TabsContent>

        {/* --- MÜFREDAT YÖNETİMİ --- */}
        <TabsContent value="curriculum" className="space-y-12 outline-none animate-in fade-in">
           <header className="flex justify-between items-center">
              <div className="space-y-1">
                 <h3 className="text-4xl font-black italic tracking-tighter text-primary uppercase">Özel Müfredat & İçerik</h3>
                 <p className="text-sm font-bold text-muted-foreground italic uppercase">Kendi derslerinizi oluşturun ve öğrencilerinizle paylaşın.</p>
              </div>
              <Dialog open={isAddingSubject} onOpenChange={setIsAddingSubject}>
                 <DialogTrigger asChild>
                    <Button className="h-16 px-8 rounded-2xl bg-accent hover:bg-primary transition-all font-black text-xs uppercase tracking-widest gap-3 shadow-xl shadow-accent/20">
                       <Plus className="h-5 w-5" /> Yeni Ders Ekle
                    </Button>
                 </DialogTrigger>
                 <DialogContent className="rounded-[3rem] border-none shadow-2xl p-10 bg-white">
                    <DialogHeader>
                       <DialogTitle className="text-3xl font-black italic tracking-tighter text-primary uppercase">Ders Oluştur</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleAddSubject} className="space-y-8 pt-8">
                       <div className="space-y-3">
                          <Label className="text-xs font-black uppercase tracking-widest opacity-40 ml-2">Program (Sınav)</Label>
                          <Select value={selectedProgram} onValueChange={setSelectedProgram} required>
                             <SelectTrigger className="h-16 rounded-2xl bg-slate-50 border-none shadow-inner font-bold text-lg">
                                <SelectValue placeholder="Bir Program Seç" />
                             </SelectTrigger>
                             <SelectContent className="rounded-2xl">
                                {programs.map(p => <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>)}
                             </SelectContent>
                          </Select>
                       </div>
                       <div className="space-y-3">
                          <Label className="text-xs font-black uppercase tracking-widest opacity-40 ml-2">Ders Adı</Label>
                          <Input name="name" required placeholder="Örn: İleri Geometri, Robotik Kodlama..." className="h-16 rounded-2xl bg-slate-50 border-none shadow-inner font-black text-xl" />
                       </div>
                       <Button type="submit" disabled={loading === 'add-subject' || !selectedProgram} className="w-full h-18 rounded-[1.75rem] bg-primary hover:bg-accent font-black text-xs uppercase tracking-widest gap-3 shadow-2xl">
                          {loading === 'add-subject' ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                          Dersi Kaydet
                       </Button>
                    </form>
                 </DialogContent>
              </Dialog>
           </header>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {mySubjects.length > 0 ? mySubjects.map((subj) => (
                 <Card key={subj.id} className="premium-card p-10 group border border-primary/5 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                       <div className="h-16 w-16 rounded-2xl bg-accent text-white flex items-center justify-center shadow-xl group-hover:scale-110 transition-all">
                          <BookOpen className="h-8 w-8" />
                       </div>
                       <div>
                          <h4 className="text-2xl font-black text-primary italic uppercase tracking-tighter leading-none mb-1">{subj.name}</h4>
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Program: {subj.programId}</p>
                       </div>
                    </div>
                    <div className="flex gap-3">
                       <Button size="icon" variant="ghost" className="h-12 w-12 rounded-xl hover:bg-slate-50"><Edit3 className="h-5 w-5" /></Button>
                       <Button size="icon" variant="ghost" className="h-12 w-12 rounded-xl hover:bg-destructive/5 text-destructive"><Trash2 className="h-5 w-5" /></Button>
                    </div>
                 </Card>
              )) : (
                 <div className="col-span-full py-40 text-center bg-slate-50 rounded-[3rem] border border-dashed border-primary/10 opacity-30 italic font-black uppercase tracking-widest text-xs">
                    Henüz özel bir ders oluşturmadınız.
                 </div>
              )}
           </div>
        </TabsContent>

        {/* --- ÖĞRENCİLERİM --- */}
        <TabsContent value="students" className="outline-none animate-in fade-in">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {students.length > 0 ? (
                 students.map((student) => (
                    <Card key={student.id} className="premium-card p-12 group border border-primary/5 relative overflow-hidden">
                       <div className={cn(
                          "absolute top-0 right-0 w-3 h-full",
                          student.risk === 'high' ? 'bg-destructive' : 'bg-emerald-500'
                       )}></div>
                       <div className="space-y-8">
                          <div className="flex justify-between items-start">
                             <div className="h-24 w-24 rounded-[2.25rem] bg-primary flex items-center justify-center text-white font-black text-4xl italic shadow-2xl relative border-[6px] border-white group-hover:scale-105 transition-all">
                                {student.displayName?.charAt(0)}
                             </div>
                             <div className="text-right">
                                <Badge className="bg-slate-50 text-primary border-slate-100 font-black text-[10px] uppercase">%{student.successScore || 85} AI Skor</Badge>
                             </div>
                          </div>
                          <div>
                             <h4 className="text-3xl font-black text-primary italic uppercase tracking-tighter leading-none mb-1">{student.displayName}</h4>
                             <p className="text-[11px] font-black text-accent uppercase tracking-widest">{student.targetExam} • {student.grade}</p>
                          </div>
                          <div className="flex gap-4">
                             <Button onClick={() => router.push(`/dashboard?simulate=${student.id}`)} size="icon" className="h-14 w-14 rounded-2xl bg-primary hover:bg-accent text-white shadow-xl transition-all"><Eye className="h-6 w-6" /></Button>
                             <Button variant="outline" className="flex-1 h-14 rounded-2xl border-2 font-black text-xs uppercase tracking-widest">İncele</Button>
                          </div>
                       </div>
                    </Card>
                 ))
              ) : (
                 <div className="col-span-full py-60 text-center opacity-30 italic font-black uppercase tracking-widest text-xs">Henüz bağlı bir öğrenciniz yok.</div>
              )}
           </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
