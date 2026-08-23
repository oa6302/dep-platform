
'use client';

import { useCollection, useFirestore, useUser } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, Server, Loader2, RefreshCcw, Zap, Building, 
  Key, ArrowRight, BookOpenCheck, Plus, 
  Activity, ShieldCheck, Globe, Database, UserPlus, Sparkles,
  ShieldAlert, LayoutDashboard, Terminal, HardDrive, Cpu,
  Trash2, UserCog, CheckCircle2, XCircle, Search, Mail,
  Shield, Video, FileQuestion, BookOpen
} from 'lucide-react';
import { 
  orderBy, doc, setDoc, serverTimestamp, updateDoc, 
  deleteDoc, query, collection, where 
} from 'firebase/firestore';
import { useState, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { EXAM_CONFIGS } from '@/lib/exam-configs';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface AdminViewProps {
  user: any;
  userData: any;
}

export function AdminView({ user, userData }: AdminViewProps) {
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  
  const [refreshing, setRefreshing] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [userSeeding, setUserSeeding] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  
  const [isAddingVideo, setIsAddingVideo] = useState(false);
  const [isAddingTest, setIsAddingTest] = useState(false);

  // Veri Çekme
  const { data: allUsers = [], loading: usersLoading } = useCollection<any>('users', orderBy('createdAt', 'desc'));
  
  const teacherCount = allUsers.filter(u => u.role === 'teacher').length;
  const studentCount = allUsers.filter(u => u.role === 'student').length;
  const schoolCount = allUsers.filter(u => u.role === 'school_admin').length;

  const filteredUsers = useMemo(() => {
    return allUsers.filter(u => 
      u.displayName?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email?.toLowerCase().includes(userSearch.toLowerCase())
    );
  }, [allUsers, userSearch]);

  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    if (!db) return;
    try {
      await updateDoc(doc(db, 'users', userId), { role: newRole, updatedAt: serverTimestamp() });
      toast({ title: 'Yetki Güncellendi', description: 'Kullanıcı rolü başarıyla değiştirildi.' });
    } catch (e) {
      toast({ variant: 'destructive', title: 'Hata', description: 'Yetki güncellenemedi.' });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!db || !confirm('Bu kullanıcıyı sistemden silmek istediğinize emin misiniz?')) return;
    try {
      await deleteDoc(doc(db, 'users', userId));
      toast({ title: 'Silindi', description: 'Kullanıcı hesabı ve verileri kaldırıldı.' });
    } catch (e) {
      toast({ variant: 'destructive', title: 'Hata', description: 'Kullanıcı silinemedi.' });
    }
  };

  const handleSystemRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      toast({ 
        title: 'Sistem Güncellendi', 
        description: 'Global AOS metrikleri ve veritabanı akışı başarıyla tazelendi.',
        className: "bg-primary text-white rounded-[2rem]"
      });
    }, 1000);
  };

  const handleSeedUsers = async () => {
    if (!db) return;
    setUserSeeding(true);
    try {
      const demoUsers = [
        { uid: 'demo_teacher_1', email: 'ahmet.hoca@dek.com', displayName: 'Ahmet Yılmaz', role: 'teacher', branch: 'Matematik', activationCode: 'DK-MATH-2025', school: 'Fen Lisesi' },
        { uid: 'demo_student_1', email: 'can.demir@dek.com', displayName: 'Can Demir', role: 'student', targetExam: 'YKS_SAY', coachId: 'demo_teacher_1' }
      ];

      for (const u of demoUsers) {
        await setDoc(doc(db, 'users', u.uid), {
          ...u,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }, { merge: true });
      }
      toast({ title: 'Test Hesapları Enjekte Edildi', description: 'Kritik kullanıcı rolleri Firestore üzerine başarıyla işlendi.' });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Hata', description: error.message });
    } finally {
      setUserSeeding(false);
    }
  };

  const handleSeedCurriculum = async () => {
    if (!db) return;
    setSeeding(true);
    try {
      for (const exam of Object.values(EXAM_CONFIGS)) {
        await setDoc(doc(db, 'programs', exam.id), {
          id: exam.id,
          title: exam.title,
          category: exam.category,
          description: exam.description,
          targetGroup: exam.targetGroup,
          aiFocus: exam.aiFocus,
          createdAt: serverTimestamp(),
        }, { merge: true });
      }
      toast({ title: 'Müfredat Motoru Güncellendi', description: 'Tüm sınav türleri ve dersler AOS terminaline işlendi.' });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Hata', description: error.message });
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="p-8 lg:p-12 space-y-12 max-w-7xl mx-auto w-full animate-in fade-in duration-1000">
      <header className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-10">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-primary text-white font-black text-[10px] uppercase tracking-widest shadow-2xl">
            <ShieldAlert className="h-4 w-4 text-accent animate-pulse" /> ROOT ACCESS: LEVEL 4.8
          </div>
          <h2 className="text-6xl font-black tracking-tighter italic text-primary uppercase text-shadow-premium leading-none">Küresel <br /><span className="text-accent text-shadow-accent">Harekât Merkezi</span></h2>
          <p className="text-xl font-medium text-muted-foreground italic">Tüm sistemi yönetin, verileri kontrol edin ve her düğüme müdahale edin.</p>
        </div>
        <div className="flex flex-wrap gap-4">
           <Button onClick={handleSystemRefresh} disabled={refreshing} className="h-16 px-8 rounded-2xl bg-primary hover:bg-accent transition-all font-black text-[10px] uppercase tracking-widest gap-3 shadow-[0_20px_40px_-10px_rgba(15,23,42,0.4)]">
             {refreshing ? <Loader2 className="h-5 w-5 animate-spin" /> : <RefreshCcw className="h-5 w-5 text-accent" />}
             Sistemi Yenile
           </Button>
        </div>
      </header>

      <Tabs defaultValue="stats" className="space-y-12">
        <TabsList className="bg-slate-100 p-2 rounded-[2.5rem] h-20 flex gap-2 overflow-x-auto scrollbar-hide">
          <TabsTrigger value="stats" className="rounded-2xl px-8 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-lg">Metrikler</TabsTrigger>
          <TabsTrigger value="content" className="rounded-2xl px-8 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-lg">İçerik Yönetimi</TabsTrigger>
          <TabsTrigger value="users" className="rounded-2xl px-8 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-lg">Kullanıcı Yönetimi</TabsTrigger>
          <TabsTrigger value="system" className="rounded-2xl px-8 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-lg">Sistem Araçları</TabsTrigger>
        </TabsList>

        <TabsContent value="stats" className="space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { label: 'Aktif Kurum', val: schoolCount, icon: Globe, color: 'primary' },
              { label: 'Toplam Eğitmen', val: teacherCount, icon: Users, color: 'accent' },
              { label: 'Toplam Öğrenci', val: studentCount, icon: Zap, color: 'primary' },
              { label: 'İşlem Logu', val: '1.4M', icon: Activity, color: 'accent' },
            ].map((stat, i) => (
              <Card key={i} className="rounded-[3.5rem] border-none shadow-lg bg-white p-2 border border-primary/5">
                <CardHeader className="pb-2">
                  <div className={cn(
                    "h-16 w-16 rounded-[1.75rem] flex items-center justify-center mb-4 shadow-2xl",
                    stat.color === 'accent' ? 'bg-accent text-white' : 'bg-primary text-white'
                  )}>
                    <stat.icon className="h-8 w-8" />
                  </div>
                  <CardTitle className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground italic">{stat.label}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-5xl font-black text-primary tracking-tighter tabular-nums">{stat.val}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             <Card onClick={() => router.push('/dashboard/admin/curriculum')} className="group p-10 rounded-[3.5rem] border-none shadow-xl bg-white hover:shadow-2xl transition-all cursor-pointer border border-primary/5">
                <div className="space-y-6">
                   <div className="h-20 w-20 rounded-[2rem] bg-orange-600 text-white flex items-center justify-center shadow-2xl group-hover:scale-110 transition-all">
                      <BookOpenCheck className="h-10 w-10" />
                   </div>
                   <h4 className="text-3xl font-black italic tracking-tighter text-primary uppercase">Müfredat Motoru</h4>
                   <p className="text-sm text-muted-foreground italic">Dinamik sınav, ders, ünite ve konu yapılandırma merkezi.</p>
                   <div className="flex items-center text-[10px] font-black uppercase tracking-widest text-accent group-hover:translate-x-2 transition-all">Yönetimi Aç <ArrowRight className="ml-3 h-4 w-4" /></div>
                </div>
             </Card>
             <Card className="p-10 rounded-[3.5rem] border-none shadow-xl bg-primary text-white space-y-6 relative overflow-hidden">
                <Cpu className="h-12 w-12 text-accent absolute top-8 right-8 opacity-20" />
                <h4 className="text-2xl font-black italic tracking-tighter uppercase">AI Kontrol Üssü</h4>
                <p className="text-sm opacity-80">Genkit AI modelleri üzerinden müfredat uyumu ve tahminleme algoritmalarını denetleyin.</p>
                <Button variant="outline" className="w-full h-14 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 text-white font-black text-[10px] uppercase tracking-widest transition-all">Modelleri Optimize Et</Button>
             </Card>
             <Card className="p-10 rounded-[3.5rem] border-none shadow-xl bg-slate-900 text-white space-y-6 relative overflow-hidden">
                <Database className="h-12 w-12 text-blue-400 absolute top-8 right-8 opacity-20" />
                <h4 className="text-2xl font-black italic tracking-tighter uppercase">Server Durumu</h4>
                <div className="flex items-center gap-3">
                   <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse"></div>
                   <span className="text-[10px] font-black uppercase tracking-widest">Global Sync: Aktif</span>
                </div>
                <p className="text-xs opacity-60 italic">"9003 portu üzerinden AOS v4.8 veritabanı akışı %100 sağlıklı."</p>
             </Card>
          </div>
        </TabsContent>

        <TabsContent value="content" className="space-y-8">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="p-10 rounded-[3rem] bg-white border border-primary/5 shadow-xl space-y-8 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 blur-3xl rounded-full" />
                 <div className="h-16 w-16 rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-lg group-hover:rotate-6 transition-all"><Video className="h-8 w-8" /></div>
                 <div>
                    <h4 className="text-2xl font-black italic tracking-tighter uppercase text-primary">YouTube Videoları</h4>
                    <p className="text-xs text-muted-foreground font-medium italic">Konulara özel video içerikleri ekleyin.</p>
                 </div>
                 <Button onClick={() => setIsAddingVideo(true)} className="w-full h-14 rounded-2xl bg-primary hover:bg-accent font-black text-[10px] uppercase tracking-widest gap-2 shadow-xl">İÇERİK EKLE <Plus className="h-4 w-4" /></Button>
              </Card>

              <Card className="p-10 rounded-[3rem] bg-white border border-primary/5 shadow-xl space-y-8 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl rounded-full" />
                 <div className="h-16 w-16 rounded-2xl bg-blue-500 text-white flex items-center justify-center shadow-lg group-hover:rotate-6 transition-all"><FileQuestion className="h-8 w-8" /></div>
                 <div>
                    <h4 className="text-2xl font-black italic tracking-tighter uppercase text-primary">Test & Sorular</h4>
                    <p className="text-xs text-muted-foreground font-medium italic">Özel soru setleri ve PDF testler yükleyin.</p>
                 </div>
                 <Button onClick={() => setIsAddingTest(true)} className="w-full h-14 rounded-2xl bg-primary hover:bg-accent font-black text-[10px] uppercase tracking-widest gap-2 shadow-xl">TEST OLUŞTUR <Plus className="h-4 w-4" /></Button>
              </Card>

              <Card className="p-10 rounded-[3rem] bg-white border border-primary/5 shadow-xl space-y-8 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full" />
                 <div className="h-16 w-16 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg group-hover:rotate-6 transition-all"><BookOpen className="h-8 w-8" /></div>
                 <div>
                    <h4 className="text-2xl font-black italic tracking-tighter uppercase text-primary">Konu Anlatımları</h4>
                    <p className="text-xs text-muted-foreground font-medium italic">Master müfredat içeriklerini düzenleyin.</p>
                 </div>
                 <Button onClick={() => router.push('/dashboard/admin/curriculum')} className="w-full h-14 rounded-2xl bg-primary hover:bg-accent font-black text-[10px] uppercase tracking-widest gap-2 shadow-xl">MÜFREDATI YÖNET <ArrowRight className="h-4 w-4" /></Button>
              </Card>
           </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-8">
          <Card className="rounded-[3rem] border-none shadow-xl bg-white p-10 border border-primary/5">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
               <div className="relative flex-1 w-full group">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary" />
                  <Input 
                    placeholder="Kullanıcı adı veya e-posta ara..." 
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="pl-14 h-16 rounded-2xl bg-slate-50 border-none shadow-inner font-bold text-lg"
                  />
               </div>
               <Badge className="h-12 px-6 rounded-xl bg-primary text-white font-black uppercase tracking-widest">{filteredUsers.length} Toplam Kayıt</Badge>
            </div>

            <div className="grid gap-6">
              {usersLoading ? (
                <div className="py-20 text-center opacity-30 italic font-black uppercase">Veriler Yükleniyor...</div>
              ) : filteredUsers.map((u) => (
                <div key={u.uid} className="flex flex-col lg:flex-row items-center justify-between p-8 bg-slate-50 rounded-[2.5rem] border border-primary/5 hover:bg-white hover:shadow-2xl transition-all group">
                   <div className="flex items-center gap-8 w-full lg:w-auto">
                      <div className="h-16 w-16 rounded-2xl bg-primary text-white flex items-center justify-center font-black text-2xl italic shadow-lg shrink-0 group-hover:rotate-6 transition-all">
                        {u.displayName?.charAt(0) || '?'}
                      </div>
                      <div className="space-y-1">
                         <div className="flex items-center gap-3">
                            <h4 className="text-xl font-black text-primary tracking-tight uppercase leading-none">{u.displayName}</h4>
                            <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest px-2">{u.role}</Badge>
                         </div>
                         <div className="flex items-center gap-2 text-muted-foreground">
                            <Mail className="h-3.5 w-3.5" />
                            <span className="text-xs font-bold italic">{u.email}</span>
                         </div>
                      </div>
                   </div>

                   <div className="flex flex-wrap items-center gap-4 mt-6 lg:mt-0 w-full lg:w-auto justify-end">
                      <Select defaultValue={u.role} onValueChange={(val) => handleUpdateUserRole(u.uid, val)}>
                         <SelectTrigger className="w-40 h-12 rounded-xl bg-white border-primary/5 shadow-sm font-black text-[10px] uppercase tracking-widest">
                            <SelectValue />
                         </SelectTrigger>
                         <SelectContent className="rounded-xl border-none shadow-2xl">
                            <SelectItem value="student">Öğrenci</SelectItem>
                            <SelectItem value="teacher">Eğitmen</SelectItem>
                            <SelectItem value="school_admin">Okul Yöneticisi</SelectItem>
                            <SelectItem value="admin">Yönetici (Admin)</SelectItem>
                         </SelectContent>
                      </Select>
                      <Button 
                        onClick={() => handleDeleteUser(u.uid)}
                        variant="ghost" 
                        size="icon" 
                        className="h-12 w-12 rounded-xl text-destructive hover:bg-destructive/5 transition-all"
                      >
                         <Trash2 className="h-6 w-6" />
                      </Button>
                   </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-8">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <Card className="rounded-[4rem] p-12 bg-white border border-primary/5 shadow-xl space-y-8">
                 <div className="flex items-center gap-6">
                    <div className="h-16 w-16 rounded-2xl bg-primary/5 flex items-center justify-center text-primary shadow-inner">
                       <Database className="h-8 w-8" />
                    </div>
                    <div>
                       <h4 className="text-2xl font-black italic tracking-tighter uppercase text-primary">Veri Tohumla (Seed)</h4>
                       <p className="text-sm text-muted-foreground font-medium italic">Sistemi test verileriyle hızlıca kurun.</p>
                    </div>
                 </div>
                 <div className="grid gap-4">
                    <Button variant="outline" onClick={handleSeedUsers} disabled={userSeeding} className="h-16 rounded-2xl border-2 border-primary/5 font-black text-[10px] uppercase tracking-widest gap-3 hover:bg-primary hover:text-white transition-all group">
                       {userSeeding ? <Loader2 className="h-5 w-5 animate-spin" /> : <UserPlus className="h-5 w-5" />}
                       Test Kullanıcılarını Yükle
                    </Button>
                    <Button variant="outline" onClick={handleSeedCurriculum} disabled={seeding} className="h-16 rounded-2xl border-2 border-primary/5 font-black text-[10px] uppercase tracking-widest gap-3 hover:bg-accent hover:text-white transition-all group">
                       {seeding ? <Loader2 className="h-5 w-5 animate-spin" /> : <Shield className="h-5 w-5" />}
                       Müfredat Motorunu Kur
                    </Button>
                 </div>
              </Card>

              <Card className="rounded-[4rem] p-12 bg-slate-900 text-white shadow-2xl space-y-8 relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 blur-[100px] rounded-full"></div>
                 <div className="flex items-center gap-6 relative z-10">
                    <div className="h-16 w-16 rounded-2xl bg-white/5 flex items-center justify-center text-accent shadow-inner">
                       <Terminal className="h-8 w-8" />
                    </div>
                    <div>
                       <h4 className="text-2xl font-black italic tracking-tighter uppercase">Root Terminal</h4>
                       <p className="text-sm text-white/40 font-medium italic">Kritik sistem müdahaleleri.</p>
                    </div>
                 </div>
                 <div className="space-y-4 relative z-10">
                    <Button className="w-full h-16 rounded-2xl bg-destructive hover:bg-rose-700 text-white font-black text-[10px] uppercase tracking-widest shadow-2xl gap-3">
                       <XCircle className="h-5 w-5" /> Tüm Logları Temizle
                    </Button>
                    <div className="p-6 bg-black/40 rounded-2xl border border-white/5 font-mono text-[10px] text-emerald-400 space-y-2">
                       <p>> AOS v4.8 Global Harekât Modu Aktif</p>
                       <p>> Port 9003: Dinleniyor...</p>
                       <p>> Auth Node: Güvenli</p>
                       <p>> Firestore Sync: %100</p>
                    </div>
                 </div>
              </Card>
           </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
