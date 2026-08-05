
'use client';

import { useCollection, useFirestore } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, Server, Loader2, RefreshCcw, Zap, Building, 
  Key, ArrowRight, ArrowUpRight, BookOpenCheck, Plus, 
  Activity, ShieldCheck, Globe, Database
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
  
  const { data: allUsers } = useCollection<any>('users', orderBy('createdAt', 'desc'));
  
  const teacherCount = allUsers.filter(u => u.role === 'teacher').length;
  const studentCount = allUsers.filter(u => u.role === 'student').length;
  const schoolCount = allUsers.filter(u => u.role === 'school_admin').length;

  const handleSystemRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      toast({ title: 'Sistem Güncellendi', description: 'Metrikler tazelendi.' });
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
      toast({ title: 'Müfredat Hazır', description: 'Tüm sınav türleri veritabanına aktarıldı.' });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Hata', description: error.message });
    } finally {
      setSeeding(false);
    }
  };

  const modules = [
    { title: "Müfredat Motoru", icon: BookOpenCheck, color: "bg-orange-600", desc: "Dersler, üniteler ve kazanımlar", path: '/dashboard/admin/curriculum' },
    { title: "Kullanıcı Yönetimi", icon: Users, color: "bg-slate-700", desc: "Roller ve aktivasyon kodları", path: '#' },
    { title: "Okul Lisansları", icon: Building, color: "bg-indigo-800", desc: "Kurumsal abonelik takibi", path: '#' },
    { title: "Global Ayarlar", icon: ShieldCheck, color: "bg-red-800", desc: "Sistem izinleri ve güvenlik", path: '#' },
    { title: "Server Status", icon: Server, color: "bg-blue-800", desc: "Performans ve veritabanı sağlığı", path: '#' },
    { title: "API Gateway", icon: Key, color: "bg-emerald-700", desc: "Harici servis bağlantıları", path: '#' },
  ];

  return (
    <div className="p-8 lg:p-12 space-y-12 max-w-7xl mx-auto w-full animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-8">
        <div className="space-y-1">
          <h2 className="text-6xl font-black tracking-tighter italic text-primary uppercase text-shadow-premium leading-none">Global <br /><span className="text-accent">Harekât Merkezi</span></h2>
          <p className="text-muted-foreground font-medium text-lg italic opacity-60">Sistem Yönetici Paneli v4.8</p>
        </div>
        <div className="flex flex-wrap gap-4">
           <Button variant="outline" onClick={handleSeedCurriculum} disabled={seeding} className="h-16 px-8 rounded-2xl border-2 border-primary/5 font-black text-[10px] uppercase tracking-widest gap-3 shadow-sm hover:bg-primary hover:text-white transition-all">
             {seeding ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />}
             Müfredat Kur
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
          <Card key={i} className="rounded-[3.5rem] border-none shadow-xl bg-white p-2 border border-primary/5">
            <CardHeader className="pb-2">
              <div className={`h-16 w-16 rounded-[1.75rem] flex items-center justify-center mb-4 shadow-2xl ${stat.color === 'accent' ? 'bg-accent text-white' : 'bg-primary text-white'}`}>
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
                     <span className="text-primary">%24</span>
                  </div>
                  <div className="h-3.5 w-full bg-[#F1F5F9] rounded-full overflow-hidden shadow-inner">
                     <div className="h-full bg-primary transition-all duration-1000" style={{ width: '24%' }}></div>
                  </div>
               </div>
               <div className="space-y-4">
                  <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                     <span>RAM Verimliliği</span>
                     <span className="text-accent">%42</span>
                  </div>
                  <div className="h-3.5 w-full bg-[#F1F5F9] rounded-full overflow-hidden shadow-inner">
                     <div className="h-full bg-accent transition-all duration-1000" style={{ width: '42%' }}></div>
                  </div>
               </div>
            </div>
            <div className="p-8 bg-primary rounded-[3rem] text-white flex items-center gap-6 shadow-2xl relative overflow-hidden">
               <Server className="h-12 w-12 text-accent" />
               <div>
                  <p className="font-black text-xl tracking-tight">DEK Cluster-Alpha</p>
                  <p className="text-[10px] font-bold opacity-50 uppercase tracking-[0.2em]">Stable • AWS Frankfurt</p>
               </div>
            </div>
         </Card>

         <Card className="xl:col-span-2 rounded-[4rem] border-none shadow-xl bg-white overflow-hidden border border-primary/5">
            <CardHeader className="p-12 border-b border-primary/5 flex flex-row items-center justify-between bg-slate-50/50">
               <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-primary text-white font-black text-[9px] uppercase tracking-widest">Global Log</div>
                  <CardTitle className="text-4xl font-black italic tracking-tighter uppercase">Gerçek Zamanlı Akış</CardTitle>
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
                          <div className={cn("h-16 w-16 rounded-[1.5rem] bg-white border border-primary/5 shadow-xl flex items-center justify-center group-hover:rotate-6 transition-all", log.color)}>
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
