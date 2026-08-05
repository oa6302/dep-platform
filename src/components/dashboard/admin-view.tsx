
'use client';

import { useCollection, useFirestore } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Settings, 
  Database, 
  ShieldCheck, 
  Activity, 
  Loader2, 
  Server, 
  Globe, 
  Lock,
  RefreshCcw,
  Zap,
  Building,
  Key,
  Code,
  ArrowRight,
  ArrowUpRight,
  BookOpenCheck,
  Plus
} from 'lucide-react';
import { orderBy, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { useRouter } from 'next/navigation';
import { EXAM_CONFIGS } from '@/lib/exam-configs';

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
  
  const { data: allUsers } = useCollection<any>('users', orderBy('createdAt', 'desc'));
  
  const teacherCount = allUsers.filter(u => u.role === 'teacher').length;
  const studentCount = allUsers.filter(u => u.role === 'student').length;
  const schoolAdminCount = allUsers.filter(u => u.role === 'school_admin').length;

  const handleSystemRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      toast({ title: 'Sistem Güncellendi', description: 'Tüm metrikler ve loglar tazelendi.' });
    }, 1500);
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
          iconName: 'Target', // Basitleştirme için
          color: 'bg-primary',
          createdAt: serverTimestamp(),
        });

        // Dersleri de ekleyelim
        for (const lessonName of exam.lessons) {
          const subjectId = `${exam.id}_${lessonName.toLowerCase().replace(/\s+/g, '_')}`;
          await setDoc(doc(db, 'subjects', subjectId), {
            programId: exam.id,
            name: lessonName,
            isActive: true,
            order: 1,
            createdAt: serverTimestamp(),
          });
        }
      }
      toast({ title: 'Müfredat Aktarıldı', description: 'Tüm sınav türleri ve dersler veritabanına dinamik olarak yüklendi.' });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Hata', description: error.message });
    } finally {
      setSeeding(false);
    }
  };

  const modules = [
    { title: "Müfredat Yönetimi", icon: BookOpenCheck, color: "bg-orange-600", desc: "Dersler, üniteler ve kazanım motoru", path: '/dashboard/admin/curriculum' },
    { title: "Kullanıcı Yönetimi", icon: Users, color: "bg-slate-700", desc: "Rol tabanlı erişim ve aktivasyon", path: '#' },
    { title: "Yetkilendirme", icon: ShieldCheck, color: "bg-red-800", desc: "İzin sistemleri", path: '#' },
    { title: "Kurum Yönetimi", icon: Building, color: "bg-indigo-800", desc: "Okul ve lisans yönetimi", path: '#' },
    { title: "Lisanslar", icon: Key, color: "bg-amber-600", desc: "Abonelik paketleri", path: '#' },
    { title: "Sunucu Durumu", icon: Server, color: "bg-blue-800", desc: "Performans ve cluster", path: '#' },
  ];

  return (
    <div className="p-6 lg:p-10 space-y-10 max-w-7xl mx-auto w-full animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="space-y-1">
          <h2 className="text-5xl font-black tracking-tighter italic text-primary uppercase text-shadow-premium">Sistem Harekât Merkezi</h2>
          <p className="text-muted-foreground font-medium text-lg italic opacity-60">Global Yönetici Paneli v4.8</p>
        </div>
        <div className="flex gap-4">
           <Button variant="outline" onClick={handleSeedCurriculum} disabled={seeding} className="h-16 px-8 rounded-2xl border-2 border-primary/5 font-black text-[10px] uppercase tracking-widest gap-3 hover:bg-primary hover:text-white transition-all">
             {seeding ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />}
             Varsayılan Müfredatı Yükle
           </Button>
           <Button onClick={handleSystemRefresh} disabled={refreshing} className="h-16 px-8 rounded-2xl bg-primary hover:bg-accent transition-all font-black text-[10px] uppercase tracking-widest gap-3 shadow-2xl shadow-primary/20">
             {refreshing ? <Loader2 className="h-5 w-5 animate-spin" /> : <RefreshCcw className="h-5 w-5" />}
             Sistemi Tazele
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: 'Aktif Okul', val: 124, icon: Globe, color: 'primary' },
          { label: 'Aktif Öğretmen', val: teacherCount, icon: Users, color: 'accent' },
          { label: 'Aktif Öğrenci', val: studentCount, icon: Zap, color: 'primary' },
          { label: 'Sistem Logları', val: '1.2M', icon: Activity, color: 'accent' },
        ].map((stat, i) => (
          <Card key={i} className="rounded-[3.5rem] border-none shadow-[0_40px_80px_-20px_rgba(15,23,42,0.08)] bg-white p-2 border border-primary/5">
            <CardHeader className="pb-2">
              <div className={`h-16 w-16 rounded-[1.75rem] flex items-center justify-center mb-4 shadow-2xl ${stat.color === 'accent' ? 'bg-accent text-white shadow-accent/20' : 'bg-primary text-white shadow-primary/20'}`}>
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
        <div className="flex items-center gap-6">
           <h3 className="text-3xl font-black italic tracking-tighter text-primary uppercase text-shadow-deep">Kontrol Modülleri</h3>
           <div className="h-px flex-1 bg-primary/5"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {modules.map((mod, i) => (
            <Card 
              key={i} 
              onClick={() => mod.path !== '#' && router.push(mod.path)}
              className="group relative overflow-hidden rounded-[3.5rem] border-none shadow-[0_30px_60px_-15px_rgba(15,23,42,0.1)] bg-white p-10 transition-all hover:-translate-y-2 cursor-pointer border border-primary/5"
            >
              <div className={`absolute top-0 right-0 w-40 h-40 ${mod.color} opacity-5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 group-hover:opacity-15 transition-opacity`}></div>
              <div className="space-y-8">
                <div className={`h-20 w-20 rounded-[2rem] ${mod.color} text-white flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
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
         <Card className="rounded-[4rem] border-none shadow-[0_60px_100px_-20px_rgba(15,23,42,0.12)] bg-white p-12 space-y-10 border border-primary/5">
            <div className="flex items-center justify-between">
              <h4 className="text-2xl font-black italic tracking-tighter uppercase text-shadow-deep">Sunucu Kapasitesi</h4>
              <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.8)]"></div>
            </div>
            
            <div className="space-y-10">
               <div className="space-y-4">
                  <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                     <span>CPU İşleme Gücü</span>
                     <span className="text-primary">%24</span>
                  </div>
                  <div className="h-3.5 w-full bg-[#F1F5F9] rounded-full overflow-hidden shadow-inner">
                     <div className="h-full bg-primary transition-all duration-1000 shadow-[0_0_10px_rgba(15,23,42,0.3)]" style={{ width: '24%' }}></div>
                  </div>
               </div>
               <div className="space-y-4">
                  <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                     <span>RAM Verimliliği</span>
                     <span className="text-accent">%42</span>
                  </div>
                  <div className="h-3.5 w-full bg-[#F1F5F9] rounded-full overflow-hidden shadow-inner">
                     <div className="h-full bg-accent transition-all duration-1000 shadow-[0_0_10px_rgba(245,158,11,0.3)]" style={{ width: '42%' }}></div>
                  </div>
               </div>
            </div>

            <div className="p-8 bg-primary rounded-[3rem] text-white flex items-center gap-6 shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 blur-2xl rounded-full"></div>
               <Server className="h-12 w-12 text-accent relative z-10" />
               <div className="relative z-10">
                  <p className="font-black text-xl tracking-tight text-shadow-premium">DEK Cluster-Alpha</p>
                  <p className="text-[10px] font-bold opacity-50 uppercase tracking-[0.2em]">Frankfurt AWS • Stable</p>
               </div>
            </div>
         </Card>

         <Card className="xl:col-span-2 rounded-[4rem] border-none shadow-[0_60px_100px_-20px_rgba(15,23,42,0.12)] bg-white overflow-hidden border border-primary/5">
            <CardHeader className="p-12 border-b border-primary/5 flex flex-row items-center justify-between bg-slate-50/50">
               <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-primary text-white font-black text-[9px] uppercase tracking-widest">Canlı Akış</div>
                  <CardTitle className="text-4xl font-black italic tracking-tighter uppercase text-shadow-deep">Gerçek Zamanlı Loglar</CardTitle>
               </div>
               <Activity className="h-10 w-10 text-primary opacity-10" />
            </CardHeader>
            <CardContent className="p-0">
               <div className="divide-y divide-primary/5">
                  {[
                    { msg: 'Yeni kurum kaydı yapıldı: Atatürk Koleji', time: '1dk önce', user: 'System', icon: Building, color: 'text-primary' },
                    { msg: 'Yapay zeka analiz raporu oluşturuldu.', time: '14dk önce', user: 'AI_Engine', icon: Zap, color: 'text-accent' },
                    { msg: 'Müfredat değişikliği onaylandı (LGS).', time: '1sa önce', user: 'Admin_X', icon: BookOpenCheck, color: 'text-primary' },
                    { msg: 'Kritik sistem yedeği başarıyla tamamlandı.', time: '3sa önce', user: 'BackupBot', icon: Database, color: 'text-emerald-500' },
                  ].map((log, i) => (
                    <div key={i} className="p-10 flex items-center justify-between hover:bg-[#F8FAFC] transition-all group">
                       <div className="flex items-center gap-8">
                          <div className={cn("h-16 w-16 rounded-[1.5rem] bg-white border border-primary/5 shadow-xl flex items-center justify-center group-hover:rotate-6 transition-all duration-500", log.color)}>
                             <log.icon className="h-8 w-8" />
                          </div>
                          <div>
                             <p className="font-black text-2xl tracking-tight text-primary leading-none mb-2">{log.msg}</p>
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
