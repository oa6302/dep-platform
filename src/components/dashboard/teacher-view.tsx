'use client';

import { useCollection, useFirestore } from '@/firebase';
import {
  Users,
  School,
  Plus,
  Copy,
  Brain,
  LayoutDashboard,
  Sparkles,
  BookOpenCheck,
  Loader2,
  Save,
  Trash2,
  Edit3,
  Layers,
  Eye,
  Key,
  TrendingUp,
  MessageSquare,
  Settings,
  Search,
  UserRound,
  ArrowRight,
} from 'lucide-react';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

import { collection, doc, setDoc, query, where, orderBy, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { useState, useMemo } from 'react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
  const [selectedProgram, setSelectedProgram] = useState('');
  const [studentSearch, setStudentSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');

  /*
   * ---------------------------------------------------------
   * VERİLER
   * ---------------------------------------------------------
   */

  const { data: students = [] } = useCollection<any>(
    'users',
    where('role', '==', 'student'),
    where('coachId', '==', user?.uid || '')
  );

  const { data: classrooms = [] } = useCollection<any>(
    'classrooms',
    where('teacherId', '==', user?.uid || '')
  );

  const { data: programs = [] } = useCollection<any>(
    'programs',
    orderBy('title', 'asc')
  );

  const mySubjectsQuery = useMemo(() => {
    if (!user?.uid || !db) return null;

    return query(
      collection(db, 'subjects'),
      where('creatorId', '==', user.uid)
    );
  }, [db, user?.uid]);

  const { data: mySubjects = [] } = useCollection<any>(mySubjectsQuery);

  const { data: requests = [] } = useCollection<any>(
    'requests',
    where('teacherId', '==', user?.uid || ''),
    where('status', '==', 'pending')
  );

  /*
   * ---------------------------------------------------------
   * ÖĞRENCİ FİLTRELEME
   * ---------------------------------------------------------
   */

  const filteredStudents = useMemo(() => {
    let result = [...students];

    if (selectedClass !== 'all') {
      result = result.filter((student) => {
        return (
          student.classroomId === selectedClass ||
          student.classId === selectedClass ||
          student.grade === selectedClass
        );
      });
    }

    if (studentSearch.trim()) {
      const search = studentSearch.toLocaleLowerCase('tr-TR');

      result = result.filter((student) => {
        const name = student.displayName?.toLocaleLowerCase('tr-TR') || '';
        const email = student.email?.toLocaleLowerCase('tr-TR') || '';

        return name.includes(search) || email.includes(search);
      });
    }

    return result;
  }, [students, selectedClass, studentSearch]);

  /*
   * ---------------------------------------------------------
   * SİMÜLASYON
   * ---------------------------------------------------------
   */

  const openStudentSimulation = (student: any) => {
    if (!student?.id) return;

    router.push(`/dashboard?simulate=${encodeURIComponent(student.id)}`);
  };

  /*
   * ---------------------------------------------------------
   * KOPYALAMA
   * ---------------------------------------------------------
   */

  const copyCode = () => {
    if (!userData?.activationCode) return;

    navigator.clipboard.writeText(userData.activationCode);

    toast({
      title: 'Kopyalandı',
      description: 'Aktivasyon kodu panoya kopyalandı.',
    });
  };

  /*
   * ---------------------------------------------------------
   * SINIF EKLE
   * ---------------------------------------------------------
   */

  const handleAddClassroom = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!db || !user) return;

    const formData = new FormData(e.currentTarget);

    const name = formData.get('name') as string;
    const grade = formData.get('grade') as string;

    if (!name || !grade) return;

    const id = `class_${user.uid}_${Date.now()}`;

    setLoading('add-class');

    try {
      await setDoc(doc(db, 'classrooms', id), {
        id,
        name,
        grade,
        teacherId: user.uid,
        schoolId: userData?.school || '',
        studentIds: [],
        createdAt: serverTimestamp(),
      });

      toast({
        title: 'Sınıf Oluşturuldu',
        description: `${name} şubesi başarıyla eklendi.`,
      });

      setIsAddingClass(false);
    } catch (error) {
      console.error(error);

      toast({
        variant: 'destructive',
        title: 'Hata',
        description: 'Sınıf eklenemedi.',
      });
    } finally {
      setLoading(null);
    }
  };

  /*
   * ---------------------------------------------------------
   * DERS EKLE
   * ---------------------------------------------------------
   */

  const handleAddSubject = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!db || !user || !selectedProgram) return;

    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;

    if (!name) return;

    const id = `subj_${user.uid}_${Date.now()}`;

    setLoading('add-subject');

    try {
      await setDoc(doc(db, 'subjects', id), {
        id,
        programId: selectedProgram,
        name,
        creatorId: user.uid,
        isActive: true,
        order: mySubjects.length + 1,
        createdAt: serverTimestamp(),
      });

      toast({
        title: 'Özel Ders Eklendi',
        description: `${name} dersi müfredatınıza eklendi.`,
      });

      setIsAddingSubject(false);
      setSelectedProgram('');
    } catch (error) {
      console.error(error);

      toast({
        variant: 'destructive',
        title: 'Hata',
        description: 'Ders eklenemedi.',
      });
    } finally {
      setLoading(null);
    }
  };

  /*
   * ---------------------------------------------------------
   * İSTATİSTİKLER
   * ---------------------------------------------------------
   */

  const stats = [
    {
      label: 'Öğrencilerim',
      val: students.length,
      icon: Users,
      color: 'text-primary',
    },
    {
      label: 'Sınıflarım',
      val: classrooms.length,
      icon: School,
      color: 'text-accent',
    },
    {
      label: 'Bekleyen İstek',
      val: requests.length,
      icon: MessageSquare,
      color: requests.length > 0
        ? 'text-destructive'
        : 'text-primary',
    },
    {
      label: 'Özel Dersler',
      val: mySubjects.length,
      icon: BookOpenCheck,
      color: 'text-primary',
    },
  ];

  /*
   * ---------------------------------------------------------
   * RENDER
   * ---------------------------------------------------------
   */

  return (
    <div className="p-8 lg:p-12 space-y-12 max-w-7xl mx-auto w-full animate-in fade-in duration-1000">

      {/* HEADER */}

      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-10">

        <div className="space-y-4">

          <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-accent text-white font-black text-[10px] uppercase tracking-widest shadow-[0_20px_40px_-5px_rgba(245,158,11,0.3)]">
            <Sparkles className="h-3.5 w-3.5" />
            Akademik Harekât Merkezi
          </div>

          <h2 className="text-6xl font-black tracking-tighter italic text-primary uppercase leading-[0.9] text-shadow-premium">
            Hoş Geldiniz,
            <br />

            <span className="text-accent text-shadow-accent">
              {userData?.displayName}
            </span>
          </h2>

        </div>

        {/* AKTİVASYON KODU */}

        <Card className="bg-primary text-white border-none rounded-[2.5rem] px-10 py-6 flex items-center gap-10 shadow-[0_40px_80px_-20px_rgba(15,23,42,0.4)] relative overflow-hidden">

          <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 blur-[60px] rounded-full translate-x-1/2 -translate-y-1/2" />

          <div className="space-y-1 relative z-10">

            <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 italic">
              Aktivasyon Kodunuz
            </p>

            <p className="text-3xl font-black tracking-[0.25em] font-mono">
              {userData?.activationCode || '---'}
            </p>

          </div>

          <Button
            size="icon"
            onClick={copyCode}
            variant="ghost"
            className="hover:bg-white/10 rounded-2xl h-14 w-14 relative z-10 border border-white/5"
          >
            <Copy className="h-7 w-7 text-accent" />
          </Button>

        </Card>

      </div>

      <Tabs defaultValue="overview" className="space-y-12">

        <TabsList className="bg-[#F1F5F9]/80 backdrop-blur-xl p-2.5 rounded-[3rem] h-24 shadow-inner flex overflow-x-auto scrollbar-hide border border-primary/5">

          <TabsTrigger
            value="overview"
            className="rounded-[2.5rem] px-12 h-full font-black text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-xl gap-4"
          >
            <LayoutDashboard className="h-5 w-5" />
            Genel Bakış
          </TabsTrigger>

          <TabsTrigger
            value="classrooms"
            className="rounded-[2.5rem] px-12 h-full font-black text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-xl gap-4"
          >
            <School className="h-5 w-5" />
            Sınıf Yönetimi
          </TabsTrigger>

          <TabsTrigger
            value="curriculum"
            className="rounded-[2.5rem] px-12 h-full font-black text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-xl gap-4"
          >
            <BookOpenCheck className="h-5 w-5" />
            Müfredatım
          </TabsTrigger>

          <TabsTrigger
            value="students"
            className="rounded-[2.5rem] px-12 h-full font-black text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-xl gap-4"
          >
            <Users className="h-5 w-5" />
            Öğrencilerim
          </TabsTrigger>

          <TabsTrigger
            value="requests"
            className="rounded-[2.5rem] px-12 h-full font-black text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-xl gap-4 relative"
          >
            <MessageSquare className="h-5 w-5" />
            İstekler

            {requests.length > 0 && (
              <span className="absolute top-4 right-8 h-5 w-5 bg-destructive text-white rounded-full flex items-center justify-center text-[10px] font-black border-2 border-white">
                {requests.length}
              </span>
            )}

          </TabsTrigger>

        </TabsList>

        {/* ================================================= */}
        {/* GENEL BAKIŞ */}
        {/* ================================================= */}

        <TabsContent
          value="overview"
          className="space-y-12 animate-in fade-in"
        >

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

            {stats.map((stat, i) => (
              <Card
                key={i}
                className="premium-card p-10 group border border-primary/5 relative overflow-hidden"
              >

                <div className="flex justify-between items-start mb-8">

                  <div className="h-16 w-16 rounded-[1.25rem] bg-slate-50 flex items-center justify-center shadow-inner group-hover:scale-110 transition-all">

                    <stat.icon
                      className={cn(
                        'h-8 w-8',
                        stat.color
                      )}
                    />

                  </div>

                  <Badge
                    variant="outline"
                    className="text-[10px] font-black uppercase opacity-40"
                  >
                    Canlı
                  </Badge>

                </div>

                <p className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-1 italic">
                  {stat.label}
                </p>

                <p className="text-6xl font-black text-primary tracking-tighter">
                  {stat.val}
                </p>

              </Card>
            ))}

          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">

            <Card className="xl:col-span-8 rounded-[4rem] border-none shadow-xl bg-white p-12 space-y-10">

              <div className="flex justify-between items-center">

                <h3 className="text-3xl font-black italic tracking-tighter uppercase">
                  Haftalık Başarı Trendi
                </h3>

                <TrendingUp className="h-8 w-8 text-accent opacity-20" />

              </div>

              <div className="h-[300px] flex items-end gap-8 pb-4">

                {[45, 68, 85, 52, 98, 74, 88].map((h, i) => (

                  <div
                    key={i}
                    className="flex-1 bg-slate-50 rounded-[2rem] relative group/bar"
                  >

                    <div
                      className="absolute bottom-0 w-full bg-primary rounded-[2rem] transition-all duration-1000 group-hover/bar:bg-accent"
                      style={{
                        height: `${h}%`,
                      }}
                    />

                  </div>

                ))}

              </div>

            </Card>

            <Card className="xl:col-span-4 rounded-[3.5rem] border-none shadow-xl bg-primary text-white p-12 space-y-8 relative overflow-hidden">

              <Brain className="h-12 w-12 text-accent absolute top-8 right-8 opacity-20" />

              <h4 className="text-2xl font-black italic tracking-tighter uppercase">
                AI Eğitmen Analizi
              </h4>

              <p className="text-lg leading-relaxed font-medium opacity-90 italic">
                Bağlı öğrencilerinizin performans verilerini inceleyerek
                eksik konuları takip edebilirsiniz.
              </p>

              <Button className="w-full h-16 rounded-2xl bg-accent hover:bg-white hover:text-primary font-black text-xs uppercase tracking-widest">
                Raporu Gör
              </Button>

            </Card>

          </div>

        </TabsContent>

        {/* ================================================= */}
        {/* SINIFLAR */}
        {/* ================================================= */}

        <TabsContent
          value="classrooms"
          className="space-y-12 animate-in fade-in"
        >

          <header className="flex justify-between items-center">

            <h3 className="text-4xl font-black italic tracking-tighter text-primary uppercase">
              Şube & Sınıf Merkezi
            </h3>

            <Dialog
              open={isAddingClass}
              onOpenChange={setIsAddingClass}
            >

              <DialogTrigger asChild>

                <Button className="h-16 px-8 rounded-2xl bg-primary hover:bg-accent transition-all font-black text-xs uppercase tracking-widest gap-3 shadow-xl">

                  <Plus className="h-5 w-5" />

                  Yeni Şube Oluştur

                </Button>

              </DialogTrigger>

              <DialogContent className="rounded-[3rem] border-none shadow-2xl p-10 bg-white">

                <DialogHeader>

                  <DialogTitle className="text-3xl font-black italic tracking-tighter text-primary uppercase">
                    Sınıf Tanımla
                  </DialogTitle>

                </DialogHeader>

                <form
                  onSubmit={handleAddClassroom}
                  className="space-y-8 pt-8"
                >

                  <div className="space-y-3">

                    <Label>Şube Adı</Label>

                    <Input
                      name="name"
                      required
                      placeholder="Örn: 12-A SAY"
                      className="h-16 rounded-2xl bg-slate-50 border-none shadow-inner font-black text-xl"
                    />

                  </div>

                  <div className="space-y-3">

                    <Label>Kademe / Sınıf</Label>

                    <Select name="grade" required>

                      <SelectTrigger className="h-16 rounded-2xl bg-slate-50 border-none shadow-inner font-bold text-lg">

                        <SelectValue placeholder="Seçiniz" />

                      </SelectTrigger>

                      <SelectContent>

                        {[
                          '8. Sınıf',
                          '9. Sınıf',
                          '10. Sınıf',
                          '11. Sınıf',
                          '12. Sınıf',
                          'Mezun',
                        ].map((grade) => (

                          <SelectItem
                            key={grade}
                            value={grade}
                          >
                            {grade}
                          </SelectItem>

                        ))}

                      </SelectContent>

                    </Select>

                  </div>

                  <Button
                    type="submit"
                    disabled={loading === 'add-class'}
                    className="w-full h-18 rounded-[1.75rem] bg-primary hover:bg-accent font-black text-xs uppercase tracking-widest gap-3"
                  >

                    {loading === 'add-class'
                      ? <Loader2 className="h-5 w-5 animate-spin" />
                      : <Save className="h-5 w-5" />
                    }

                    Sisteme Kaydet

                  </Button>

                </form>

              </DialogContent>

            </Dialog>

          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

            {classrooms.map((cls: any) => (

              <Card
                key={cls.id}
                className="premium-card p-10 group border border-primary/5"
              >

                <div className="space-y-8">

                  <div className="flex justify-between items-start">

                    <div className="h-16 w-16 rounded-2xl bg-primary flex items-center justify-center text-white shadow-xl">

                      <Layers className="h-8 w-8" />

                    </div>

                    <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 font-black text-[10px] uppercase">
                      Aktif
                    </Badge>

                  </div>

                  <div>

                    <h4 className="text-3xl font-black text-primary italic uppercase tracking-tighter leading-none mb-1">
                      {cls.name}
                    </h4>

                    <p className="text-[11px] font-black text-accent uppercase tracking-widest">
                      {cls.grade} • {cls.studentIds?.length || 0} Öğrenci
                    </p>

                  </div>

                  <Button
                    variant="outline"
                    className="w-full h-12 rounded-xl border-2 font-black text-[10px] uppercase tracking-widest"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Sınıfı Yönet
                  </Button>

                </div>

              </Card>

            ))}

          </div>

        </TabsContent>

        {/* ================================================= */}
        {/* MÜFREDAT */}
        {/* ================================================= */}

        <TabsContent
          value="curriculum"
          className="space-y-12 animate-in fade-in"
        >

          <header className="flex justify-between items-center">

            <h3 className="text-4xl font-black italic tracking-tighter text-primary uppercase">
              Özel Müfredat & İçerik
            </h3>

            <Dialog
              open={isAddingSubject}
              onOpenChange={setIsAddingSubject}
            >

              <DialogTrigger asChild>

                <Button className="h-16 px-8 rounded-2xl bg-accent hover:bg-primary transition-all font-black text-xs uppercase tracking-widest gap-3 shadow-xl">

                  <Plus className="h-5 w-5" />

                  Yeni Ders Ekle

                </Button>

              </DialogTrigger>

              <DialogContent className="rounded-[3rem] border-none shadow-2xl p-10 bg-white">

                <DialogHeader>

                  <DialogTitle className="text-3xl font-black italic tracking-tighter text-primary uppercase">
                    Ders Oluştur
                  </DialogTitle>

                </DialogHeader>

                <form
                  onSubmit={handleAddSubject}
                  className="space-y-8 pt-8"
                >

                  <div className="space-y-3">

                    <Label>Program</Label>

                    <Select
                      value={selectedProgram}
                      onValueChange={setSelectedProgram}
                    >

                      <SelectTrigger className="h-16 rounded-2xl bg-slate-50 border-none shadow-inner font-bold text-lg">

                        <SelectValue placeholder="Bir Program Seç" />

                      </SelectTrigger>

                      <SelectContent>

                        {programs.map((program: any) => (

                          <SelectItem
                            key={program.id}
                            value={program.id}
                          >
                            {program.title}
                          </SelectItem>

                        ))}

                      </SelectContent>

                    </Select>

                  </div>

                  <div className="space-y-3">

                    <Label>Ders Adı</Label>

                    <Input
                      name="name"
                      required
                      placeholder="Örn: İleri Geometri"
                      className="h-16 rounded-2xl bg-slate-50 border-none shadow-inner font-black text-xl"
                    />

                  </div>

                  <Button
                    type="submit"
                    disabled={
                      loading === 'add-subject' ||
                      !selectedProgram
                    }
                    className="w-full h-18 rounded-[1.75rem] bg-primary hover:bg-accent font-black text-xs uppercase tracking-widest gap-3"
                  >

                    {loading === 'add-subject'
                      ? <Loader2 className="h-5 w-5 animate-spin" />
                      : <Save className="h-5 w-5" />
                    }

                    Dersi Kaydet

                  </Button>

                </form>

              </DialogContent>

            </Dialog>

          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            {mySubjects.map((subject: any) => (

              <Card
                key={subject.id}
                className="premium-card p-10 group border border-primary/5 flex items-center justify-between"
              >

                <div className="flex items-center gap-8">

                  <div className="h-16 w-16 rounded-2xl bg-accent text-white flex items-center justify-center shadow-xl">

                    <BookOpenCheck className="h-8 w-8" />

                  </div>

                  <div>

                    <h4 className="text-2xl font-black text-primary italic uppercase tracking-tighter">
                      {subject.name}
                    </h4>

                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                      Program: {subject.programId}
                    </p>

                  </div>

                </div>

                <div className="flex gap-3">

                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-12 w-12 rounded-xl"
                  >
                    <Edit3 className="h-5 w-5" />
                  </Button>

                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-12 w-12 rounded-xl text-destructive"
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>

                </div>

              </Card>

            ))}

          </div>

        </TabsContent>

        {/* ================================================= */}
        {/* ÖĞRENCİLER */}
        {/* ================================================= */}

        <TabsContent
          value="students"
          className="outline-none animate-in fade-in space-y-10"
        >

          {/* BAŞLIK */}

          <div className="flex flex-col xl:flex-row justify-between gap-6">

            <div>

              <h3 className="text-4xl font-black italic tracking-tighter text-primary uppercase">
                Öğrencilerim
              </h3>

              <p className="text-muted-foreground font-medium mt-2">
                Öğrencilerinizin akademik ekranlarını görüntüleyebilir ve
                simülasyon modunda inceleyebilirsiniz.
              </p>

            </div>

            <Badge className="h-12 px-6 rounded-2xl bg-primary text-white font-black uppercase tracking-widest">
              {students.length} Öğrenci
            </Badge>

          </div>

          {/* ARAMA / FİLTRE */}

          <Card className="p-6 rounded-[2rem] border border-primary/5 shadow-sm">

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4">

              <div className="relative">

                <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />

                <Input
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  placeholder="Öğrenci adı veya e-posta ara..."
                  className="h-14 rounded-2xl pl-14 bg-slate-50 border-none font-bold"
                />

              </div>

              <Select
                value={selectedClass}
                onValueChange={setSelectedClass}
              >

                <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-none font-bold">

                  <SelectValue placeholder="Tüm sınıflar" />

                </SelectTrigger>

                <SelectContent>

                  <SelectItem value="all">
                    Tüm Öğrenciler
                  </SelectItem>

                  {classrooms.map((cls: any) => (

                    <SelectItem
                      key={cls.id}
                      value={cls.id}
                    >
                      {cls.name}
                    </SelectItem>

                  ))}

                </SelectContent>

              </Select>

            </div>

          </Card>

          {/* ÖĞRENCİLER */}

          {filteredStudents.length === 0 ? (

            <Card className="py-32 text-center rounded-[3rem] border-dashed">

              <UserRound className="h-16 w-16 mx-auto text-muted-foreground opacity-20" />

              <p className="mt-6 font-black uppercase tracking-widest text-xs text-muted-foreground">
                Öğrenci bulunamadı
              </p>

            </Card>

          ) : (

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">

              {filteredStudents.map((student: any) => {

                const riskColor =
                  student.risk === 'high'
                    ? 'bg-destructive'
                    : 'bg-emerald-500';

                return (

                  <Card
                    key={student.id}
                    className="premium-card p-10 group border border-primary/5 relative overflow-hidden"
                  >

                    <div
                      className={cn(
                        'absolute top-0 right-0 w-3 h-full',
                        riskColor
                      )}
                    />

                    <div className="space-y-8">

                      {/* PROFİL */}

                      <div className="flex justify-between items-start">

                        <div className="h-24 w-24 rounded-[2.25rem] bg-primary flex items-center justify-center text-white font-black text-4xl italic shadow-2xl border-[6px] border-white group-hover:scale-105 transition-all">

                          {student.displayName?.charAt(0) || '?'}

                        </div>

                        <Badge className="bg-slate-50 text-primary border-slate-100 font-black text-[10px] uppercase">

                          %{student.successScore || 85} AI Skor

                        </Badge>

                      </div>

                      {/* BİLGİ */}

                      <div>

                        <h4 className="text-3xl font-black text-primary italic uppercase tracking-tighter leading-none mb-2">

                          {student.displayName || 'İsimsiz Öğrenci'}

                        </h4>

                        <p className="text-[11px] font-black text-accent uppercase tracking-widest">

                          {student.targetExam || 'Sınav'} • {student.grade || 'Hazırlık'}

                        </p>

                      </div>

                      {/* SİMÜLASYON */}

                      <div className="space-y-3">

                        <Button
                          onClick={() =>
                            openStudentSimulation(student)
                          }
                          className="w-full h-14 rounded-2xl bg-primary hover:bg-accent text-white shadow-xl transition-all font-black text-xs uppercase tracking-widest gap-3"
                        >

                          <Eye className="h-5 w-5" />

                          Öğrenci Sayfasını Gör

                          <ArrowRight className="h-4 w-4 ml-auto" />

                        </Button>

                        <Button
                          variant="outline"
                          className="w-full h-12 rounded-2xl border-2 font-black text-[10px] uppercase tracking-widest"
                        >

                          <Brain className="h-4 w-4 mr-2" />

                          Akademik Analiz

                        </Button>

                      </div>

                    </div>

                  </Card>

                );
              })}

            </div>

          )}

        </TabsContent>

        {/* ================================================= */}
        {/* İSTEKLER */}
        {/* ================================================= */}

        <TabsContent
          value="requests"
          className="outline-none animate-in fade-in"
        >

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            {requests.map((request: any) => (

              <Card
                key={request.id}
                className="premium-card p-10 border border-primary/5 bg-white relative overflow-hidden"
              >

                <div className="flex items-center gap-8">

                  <div className="h-16 w-16 rounded-2xl bg-primary flex items-center justify-center text-white shadow-xl">

                    <Key className="h-8 w-8" />

                  </div>

                  <div className="flex-1">

                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1 italic">
                      BAĞLANTI İSTEĞİ
                    </p>

                    <p className="text-xl font-black text-primary tracking-tight">
                      {request.message}
                    </p>

                  </div>

                </div>

                <div className="flex gap-4 pt-8">

                  <Button className="flex-1 h-14 rounded-xl bg-emerald-500 hover:bg-emerald-600 font-black text-[10px] uppercase tracking-widest">
                    Onayla
                  </Button>

                  <Button
                    variant="outline"
                    className="flex-1 h-14 rounded-xl border-2 font-black text-[10px] uppercase tracking-widest text-destructive"
                  >
                    Reddet
                  </Button>

                </div>

              </Card>

            ))}

            {requests.length === 0 && (

              <div className="col-span-full py-40 text-center opacity-30 italic font-black uppercase tracking-widest text-xs">

                Henüz bekleyen bir talep bulunmuyor.

              </div>

            )}

          </div>

        </TabsContent>

      </Tabs>

    </div>
  );
}