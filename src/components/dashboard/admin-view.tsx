
'use client';

import { useCollection, useFirestore } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, Server, Loader2, RefreshCcw, Zap, Building, 
  Key, ArrowRight, ArrowUpRight, BookOpenCheck, Plus, 
  Activity, ShieldCheck, Globe, Database, UserPlus, Sparkles
} from 'lucide-react';
import { orderBy, doc, setDoc, serverTimestamp } from 'firebase/firestore';
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
        setDoc(doc(db, 'users', u.uid), {
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
        setDoc(doc(db, 'programs', exam.id), {
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
          setDoc(doc(db, 'subjects', subjectId), {
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

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
         <Card className="rounded-[4rem] border-none shadow-xl bg-white p-12 space-y-10 border border-primary/5">
            <h4 className="text-2xl font-black italic tracking-tighter uppercase">Sunucu Durumu</h4>
            <div className="space-y-10">
               <div className="space-y-4">
                  <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                     <span>CPU İşleme Gücü</span>
                     <span className="text-primary font-black">%24</span>
                  </div>
                  <div className="h-4 w-full bg-slate-50 rounded-full overflow-hidden shadow-inner p-1">
                     <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: '24%' }}></div>
                  </div>
               </div>
               <div className="space-y-4">
                  <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                     <span>RAM Verimliliği</span>
                     <span className="text-accent font-black">%42</span>
                  </div>
                  <div className="h-4 w-full bg-slate-50 rounded-full overflow-hidden shadow-inner p-1">
                     <div className="h-full bg-accent rounded-full transition-all duration-1000" style={{ width: '42%' }}></div>
                  </div>
               </div>
            </div>
            <div className="p-8 bg-primary rounded-[3rem] text-white flex items-center gap-6 shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
               <Server className="h-12 w-12 text-accent relative z-10" />
               <div className="relative z-10">
                  <p className="font-black text-xl tracking-tight">DEK Cluster-Alpha</p>
                  <p className="text-[10px] font-bold opacity-50 uppercase tracking-[0.2em]">Stable • AWS Frankfurt</p>
               </div>
            </div>
         </Card>

         <Card className="xl:col-span-2 rounded-[4rem] border-none shadow-xl bg-white overflow-hidden border border-primary/5">
            <CardHeader className="p-12 border-b border-primary/5 flex flex-row items-center justify-between bg-slate-50/50">
               <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary text-white font-black text-[9px] uppercase tracking-widest">Global Veri Akışı</div>
                  <CardTitle className="text-4xl font-black italic tracking-tighter uppercase">Gerçek Zamanlı Akış</CardTitle>
               </div>
               <Activity className="h-10 w-10 text-primary opacity-10" />
            </CardHeader>
            <CardContent className="p-0">
               <div className="divide-y divide-primary/5">
                  {[
                    { msg: 'Yeni kurum kaydı senkronize edildi: Atatürk Koleji', time: '1dk önce', user: 'Cloud_Sync', icon: Building, color: 'text-primary' },
                    { msg: 'YKS Sözel müfredatı veritabanına işlendi.', time: '14dk önce', user: 'DB_Master', icon: Database, color: 'text-accent' },
                    { msg: 'Yapay zeka analiz motoru optimize edildi.', time: '1sa önce', user: 'AI_Core', icon: Zap, color: 'text-primary' },
                    { msg: 'Global sistem yedeği güvenli bölgeye taşındı.', time: '3sa önce', user: 'Backup_Srv', icon: ShieldCheck, color: 'text-emerald-500' },
                  ].map((log, i) => (
                    <div key={i} className="p-10 flex items-center justify-between hover:bg-[#F8FAFC] transition-all group">
                       <div className="flex items-center gap-8">
                          <div className={cn("h-16 w-16 rounded-[1.5rem] bg-white border border-primary/5 shadow-xl flex items-center justify-center group-hover:rotate-6 transition-all", log.color)}>
                             <log.icon className="h-8 w-8" />
                          </div>
                          <div>
                             <p className="font-black text-2xl tracking-tight text-primary leading-none mb-2 italic">{log.msg}</p>
                             <p className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-50">
                                {log.user} • {log.time}
                             </p>
                          </div>
                       </div>
                       <ArrowUpRight className="h-6 w-6 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  ))}
               </div>
            </CardContent>
         </Card>
      </div>
    </div>
  );
}
