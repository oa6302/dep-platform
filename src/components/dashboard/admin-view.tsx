
'use client';

import { useCollection, useFirestore, useUser } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, Server, Loader2, RefreshCcw, Zap, Building, 
  Key, ArrowRight, ArrowUpRight, BookOpenCheck, Plus, 
  Activity, ShieldCheck, Globe, Database, UserPlus, Sparkles,
  ShieldAlert, LayoutDashboard, Terminal, HardDrive, Cpu
} from 'lucide-react';
import { orderBy, doc, setDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { EXAM_CONFIGS } from '@/lib/exam-configs';
import { cn } from '@/lib/utils';

interface AdminViewProps {
  user: any;
  userData: any;
}

export function AdminView({ user, userData }: AdminViewProps) {
  const db = useFirestore();
  const { user: currentUser } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [refreshing, setRefreshing] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [userSeeding, setUserSeeding] = useState(false);
  
  const { data: allUsers = [] } = useCollection<any>('users', orderBy('createdAt', 'desc'));
  
  const teacherCount = allUsers.filter(u => u.role === 'teacher').length;
  const studentCount = allUsers.filter(u => u.role === 'student').length;
  const schoolCount = allUsers.filter(u => u.role === 'school_admin').length;

  const handleSystemRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      toast({ 
        title: 'Sistem Güncellendi', 
        description: 'Global AOS metrikleri ve veritabanı akışı başarıyla tazelendi.',
        className: "bg-primary text-white rounded-[2rem]"
      });
    }, 1500);
  };

  const handleSeedUsers = async () => {
    if (!db) return;
    setUserSeeding(true);
    try {
      const demoUsers = [
        { uid: 'demo_admin_root', email: 'admin@gmail.com', displayName: 'Yönetici (Root)', role: 'admin' },
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
      toast({ title: 'Test Hesapları Enjekte Edildi', description: 'Kritik kullanıcı roller Firestore üzerine başarıyla işlendi.' });
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

  const modules = [
    { title: "Müfredat Motoru", icon: BookOpenCheck, color: "bg-orange-600", desc: "Dinamik sınav ve ders yapısı", path: '/dashboard/admin/curriculum' },
    { title: "Kullanıcı Terminali", icon: Users, color: "bg-slate-800", desc: "Root seviye yetki kontrolü", path: '#' },
    { title: "Okul Lisansları", icon: Building, color: "bg-indigo-900", desc: "Kurumsal aktivasyon yönetimi", path: '#' },
    { title: "Server Sağlığı", icon: Server, color: "bg-blue-900", desc: "Global veritabanı senkronizasyonu", path: '#' },
    { title: "AI Kontrol Üssü", icon: Cpu, color: "bg-emerald-800", desc: "Genkit AI model optimizasyonu", path: '#' },
    { title: "Sistem Logları", icon: Terminal, color: "bg-rose-900", desc: "Kritik sistem hareket dökümü", path: '#' },
  ];

  return (
    <div className="p-8 lg:p-12 space-y-12 max-w-7xl mx-auto w-full animate-in fade-in duration-1000">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-10">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-primary text-white font-black text-[10px] uppercase tracking-widest shadow-2xl">
            <ShieldAlert className="h-4 w-4 text-accent animate-pulse" /> ROOT ACCESS: LEVEL 4.8
          </div>
          <h2 className="text-6xl font-black tracking-tighter italic text-primary uppercase text-shadow-premium leading-none">Küresel <br /><span className="text-accent text-shadow-accent">Harekât Üssü</span></h2>
          <p className="text-xl font-medium text-muted-foreground italic">Tüm sistemi merkezi olarak yönetin, verileri kontrol edin ve yetkilendirmeleri düzenleyin.</p>
        </div>
        <div className="flex flex-wrap gap-4">
           <Button variant="outline" onClick={handleSeedUsers} disabled={userSeeding} className="h-16 px-8 rounded-2xl border-2 border-primary/5 font-black text-[10px] uppercase tracking-widest gap-3 shadow-sm hover:bg-white transition-all group">
             {userSeeding ? <Loader2 className="h-5 w-5 animate-spin" /> : <UserPlus className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />}
             Kullanıcıları Seed Et
           </Button>
           <Button variant="outline" onClick={handleSeedCurriculum} disabled={seeding} className="h-16 px-8 rounded-2xl border-2 border-primary/5 font-black text-[10px] uppercase tracking-widest gap-3 shadow-sm hover:bg-white transition-all group">
             {seeding ? <Loader2 className="h-5 w-5 animate-spin" /> : <Database className="h-5 w-5 text-accent group-hover:rotate-12 transition-transform" />}
             Müfredatı Kur
           </Button>
           <Button onClick={handleSystemRefresh} disabled={refreshing} className="h-16 px-8 rounded-2xl bg-primary hover:bg-accent transition-all font-black text-[10px] uppercase tracking-widest gap-3 shadow-[0_20px_40px_-10px_rgba(15,23,42,0.4)]">
             {refreshing ? <Loader2 className="h-5 w-5 animate-spin" /> : <RefreshCcw className="h-5 w-5 text-accent" />}
             Sistemi Yenile
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: 'Aktif Kurum', val: schoolCount, icon: Globe, color: 'primary' },
          { label: 'Toplam Eğitmen', val: teacherCount, icon: Users, color: 'accent' },
          { label: 'Toplam Öğrenci', val: studentCount, icon: Zap, color: 'primary' },
          { label: 'İşlem Logu', val: '1.4M', icon: Activity, color: 'accent' },
        ].map((stat, i) => (
          <Card key={i} className="rounded-[3.5rem] border-none shadow-[0_30px_60px_-15px_rgba(15,23,42,0.08)] bg-white p-2 transition-all hover:-translate-y-2 border border-primary/5">
            <CardHeader className="pb-2">
              <div className={cn(
                "h-16 w-16 rounded-[1.75rem] flex items-center justify-center mb-4 shadow-2xl",
                stat.color === 'accent' ? 'bg-accent text-white shadow-accent/20' : 'bg-primary text-white shadow-primary/20'
              )}>
                 <stat.icon className="h-8 w-8" />
              </div>
              <CardTitle className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground italic">{stat.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-5xl font-black text-primary tracking-tighter tabular-nums text-shadow-deep">{stat.val}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-8">
        <h3 className="text-3xl font-black italic tracking-tighter text-primary uppercase text-shadow-deep flex items-center gap-4">
          <LayoutDashboard className="h-8 w-8 text-accent" /> Yönetim Modülleri
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {modules.map((mod, i) => (
            <Card 
              key={i} 
              onClick={() => mod.path !== '#' && router.push(mod.path)}
              className="group relative overflow-hidden rounded-[3.5rem] border-none shadow-lg bg-white p-10 transition-all hover:-translate-y-2 cursor-pointer border border-primary/5"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full -translate-y-1/2 translate-x-1/2"></div>
              <div className="space-y-8 relative z-10">
                <div className={cn(
                  "h-20 w-20 rounded-[2rem] text-white flex items-center justify-center shadow-2xl group-hover:scale-110 transition-all duration-500",
                  mod.color
                )}>
                  <mod.icon className="h-10 w-10" />
                </div>
                <div className="space-y-3">
                  <h4 className="font-black text-3xl italic tracking-tighter text-primary uppercase leading-none group-hover:text-accent transition-colors">{mod.title}</h4>
                  <p className="text-sm text-muted-foreground font-medium leading-relaxed italic opacity-80">{mod.desc}</p>
                </div>
                <div className="flex items-center text-[10px] font-black uppercase tracking-widest text-accent group-hover:translate-x-2 transition-all">
                  Terminali Başlat <ArrowRight className="ml-3 h-4 w-4" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <Card className="rounded-[4rem] border-none bg-[#F8FAFC] border-2 border-dashed border-primary/10 p-20 text-center space-y-8">
         <ShieldCheck className="h-20 w-20 text-primary/10 mx-auto" />
         <p className="text-2xl font-black uppercase tracking-[0.4em] text-primary/20 italic">SİSTEM GÜVENLİĞİ: MAKSİMUM SEVİYE</p>
      </Card>
    </div>
  );
}
