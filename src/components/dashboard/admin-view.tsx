
'use client';

import { useCollection, useFirestore, useUser } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, Server, Loader2, RefreshCcw, Zap, Building, 
  Key, ArrowRight, ArrowUpRight, BookOpenCheck, Plus, 
  Activity, ShieldCheck, Globe, Database, UserPlus, Sparkles,
  ShieldAlert
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
  
  const { data: allUsers } = useCollection<any>('users', orderBy('createdAt', 'desc'));
  
  const teacherCount = allUsers.filter(u => u.role === 'teacher').length;
  const studentCount = allUsers.filter(u => u.role === 'student').length;
  const schoolCount = allUsers.filter(u => u.role === 'school_admin').length;

  const handleSystemRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      toast({ title: 'Sistem Güncellendi', description: 'Metrikler ve veritabanı akışı tazelendi.' });
    }, 1500);
  };

  const handleClaimAdmin = async () => {
    if (!db || !currentUser) return;
    try {
      await updateDoc(doc(db, 'users', currentUser.uid), {
        role: 'admin',
        updatedAt: serverTimestamp()
      });
      toast({ title: 'Yetki Tanımlandı', description: 'Şu anki hesabınız Admin olarak güncellendi. Lütfen sayfayı yenileyin.' });
      setTimeout(() => window.location.reload(), 2000);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Hata', description: 'Yetki güncellemesi başarısız.' });
    }
  };

  const handleSeedUsers = async () => {
    if (!db) return;
    setUserSeeding(true);
    try {
      const demoUsers = [
        { uid: 'demo_admin', email: 'admin@dek.com', displayName: 'Sistem Yöneticisi', role: 'admin' },
        { uid: 'demo_teacher', email: 'ogretmen@dek.com', displayName: 'Ahmet Yılmaz', role: 'teacher', branch: 'Edebiyat', activationCode: 'DK-7788-9900', school: 'Atatürk Anadolu Lisesi' },
        { uid: 'demo_student', email: 'ogrenci@dek.com', displayName: 'Can Demir', role: 'student', targetExam: 'YKS_SOZ', coachId: 'demo_teacher' }
      ];

      for (const u of demoUsers) {
        await setDoc(doc(db, 'users', u.uid), {
          ...u,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
      toast({ title: 'Test Kullanıcıları Hazır', description: 'Admin, Öğretmen ve Öğrenci hesapları Firestore\'a eklendi.' });
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
        });

        for (const lessonName of exam.lessons) {
          const subjectId = `${exam.id}_${lessonName.toLowerCase().replace(/\s+/g, '_')}`;
          await setDoc(doc(db, 'subjects', subjectId), {
            id: subjectId,
            programId: exam.id,
            name: lessonName,
            isActive: true,
            order: 1,
            createdAt: serverTimestamp(),
          });
        }
      }
      toast({ title: 'Müfredat Verileri Hazır', description: 'YKS Sözel ve diğer programlar veritabanına aktarıldı.' });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Hata', description: error.message });
    } finally {
      setSeeding(false);
    }
  };

  const modules = [
    { title: "Müfredat Motoru", icon: BookOpenCheck, color: "bg-orange-600", desc: "YKS Sözel dersleri ve konuları", path: '/dashboard/admin/curriculum' },
    { title: "Kullanıcı Yönetimi", icon: Users, color: "bg-slate-700", desc: "Öğrenci ve öğretmen erişimleri", path: '#' },
    { title: "Okul Lisansları", icon: Building, color: "bg-indigo-800", desc: "Kurumsal abonelik ve aktivasyonlar", path: '#' },
    { title: "Sistem Ayarları", icon: ShieldCheck, color: "bg-red-800", desc: "Global konfigürasyon ve izinler", path: '#' },
    { title: "Server Sağlığı", icon: Server, color: "bg-blue-800", desc: "Performans ve veritabanı senkronizasyonu", path: '#' },
    { title: "API Kontrolü", icon: Key, color: "bg-emerald-700", desc: "Genkit AI ve dış servis bağlantıları", path: '#' },
  ];

  return (
    <div className="p-8 lg:p-12 space-y-12 max-w-7xl mx-auto w-full animate-in fade-in duration-1000">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-10">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-primary text-white font-black text-[10px] uppercase tracking-widest shadow-xl">
            <Sparkles className="h-4 w-4 text-accent" /> Sistem Yönetim Merkezi v4.8
          </div>
          <h2 className="text-6xl font-black tracking-tighter italic text-primary uppercase text-shadow-premium leading-none">Global <br /><span className="text-accent text-shadow-accent">Harekât Üssü</span></h2>
        </div>
        <div className="flex flex-wrap gap-4">
           <Button variant="outline" onClick={handleSeedUsers} disabled={userSeeding} className="h-16 px-8 rounded-2xl border-2 border-primary/5 font-black text-[10px] uppercase tracking-widest gap-3 shadow-sm hover:bg-white transition-all">
             {userSeeding ? <Loader2 className="h-5 w-5 animate-spin" /> : <UserPlus className="h-5 w-5 text-primary" />}
             Hesapları Seed Et
           </Button>
           <Button variant="outline" onClick={handleSeedCurriculum} disabled={seeding} className="h-16 px-8 rounded-2xl border-2 border-primary/5 font-black text-[10px] uppercase tracking-widest gap-3 shadow-sm hover:bg-white transition-all">
             {seeding ? <Loader2 className="h-5 w-5 animate-spin" /> : <Database className="h-5 w-5 text-accent" />}
             Müfredatı Kur
           </Button>
           <Button onClick={handleSystemRefresh} disabled={refreshing} className="h-16 px-8 rounded-2xl bg-primary hover:bg-accent transition-all font-black text-[10px] uppercase tracking-widest gap-3 shadow-2xl">
             {refreshing ? <Loader2 className="h-5 w-5 animate-spin" /> : <RefreshCcw className="h-5 w-5" />}
             Sistemi Yenile
           </Button>
        </div>
      </div>

      <Card className="rounded-[4rem] border-none bg-accent p-12 text-white relative overflow-hidden group shadow-2xl">
         <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 blur-[100px] rounded-full"></div>
         <div className="flex flex-col md:flex-row justify-between items-center gap-10 relative z-10">
            <div className="space-y-4 text-center md:text-left">
               <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 font-black text-[9px] uppercase tracking-widest">Hızlı Erişim</div>
               <h3 className="text-4xl font-black italic tracking-tighter uppercase text-shadow-deep">Admin Yetkisi Al</h3>
               <p className="font-medium italic opacity-80 max-w-md">Kendi hesabınızı anında Admin yetkisiyle donatın ve tüm sistemi yönetmeye başlayın.</p>
            </div>
            <Button onClick={handleClaimAdmin} className="h-16 px-10 rounded-2xl bg-white text-primary hover:bg-slate-100 transition-all font-black text-xs uppercase tracking-widest gap-3 shadow-2xl">
               <ShieldAlert className="h-5 w-5 text-accent" /> Hesabımı Admin Yap
            </Button>
         </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: 'Aktif Kurum', val: schoolCount, icon: Globe, color: 'primary' },
          { label: 'Eğitmenler', val: teacherCount, icon: Users, color: 'accent' },
          { label: 'Öğrenciler', val: studentCount, icon: Zap, color: 'primary' },
          { label: 'Sistem Logu', val: '1.2M', icon: Activity, color: 'accent' },
        ].map((stat, i) => (
          <Card key={i} className="rounded-[3.5rem] border-none shadow-[0_30px_60px_-15px_rgba(15,23,42,0.08)] bg-white p-2 border border-primary/5 transition-all hover:-translate-y-2">
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

      <div className="space-y-8">
        <h3 className="text-3xl font-black italic tracking-tighter text-primary uppercase text-shadow-deep">Yönetim Modülleri</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {modules.map((mod, i) => (
            <Card 
              key={i} 
              onClick={() => mod.path !== '#' && router.push(mod.path)}
              className="group relative overflow-hidden rounded-[3.5rem] border-none shadow-lg bg-white p-10 transition-all hover:-translate-y-2 cursor-pointer border border-primary/5"
            >
              <div className="space-y-8">
                <div className={`h-20 w-20 rounded-[2rem] ${mod.color} text-white flex items-center justify-center shadow-2xl group-hover:scale-110 transition-all duration-500`}>
                  <mod.icon className="h-10 w-10" />
                </div>
                <div className="space-y-3">
                  <h4 className="font-black text-3xl italic tracking-tighter text-primary uppercase leading-none">{mod.title}</h4>
                  <p className="text-sm text-muted-foreground font-medium leading-relaxed italic opacity-80">{mod.desc}</p>
                </div>
                <div className="flex items-center text-[10px] font-black uppercase tracking-widest text-accent group-hover:translate-x-2 transition-all">
                  Yönetimi Aç <ArrowRight className="ml-3 h-4 w-4" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
