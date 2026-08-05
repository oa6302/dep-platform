
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
  ArrowUpRight
} from 'lucide-react';
import { orderBy } from 'firebase/firestore';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';

interface AdminViewProps {
  user: any;
  userData: any;
}

export function AdminView({ user, userData }: AdminViewProps) {
  const db = useFirestore();
  const { toast } = useToast();
  const [refreshing, setRefreshing] = useState(false);
  
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

  const modules = [
    { title: "Sistem Modülleri", icon: Settings, color: "bg-slate-700", desc: "Genel sistem ayarları ve modül yönetimi" },
    { title: "Yetkilendirme", icon: ShieldCheck, color: "bg-red-800", desc: "Rol ve izin tabanlı erişim kontrolü" },
    { title: "Kurum Yönetimi", icon: Building, color: "bg-indigo-800", desc: "Okullar ve kurumsal lisans sahipleri" },
    { title: "Lisanslar", icon: Key, color: "bg-amber-600", desc: "Aktif abonelikler ve lisans anahtarları" },
    { title: "API Yönetimi", icon: Code, color: "bg-emerald-700", desc: "Harici servisler ve veri entegrasyonu" },
    { title: "Sunucu Durumu", icon: Server, color: "bg-blue-800", desc: "Altyapı performansı ve cluster yönetimi" },
    { title: "Sistem Logları", icon: Database, color: "bg-zinc-800", desc: "Tüm kritik veritabanı ve kullanıcı kayıtları" },
  ];

  return (
    <div className="p-6 lg:p-10 space-y-10 max-w-7xl mx-auto w-full">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h2 className="text-4xl font-black tracking-tighter italic text-primary uppercase">Sistem Kontrol Merkezi</h2>
          <p className="text-muted-foreground font-medium text-lg">Dijital Eğitim Koçu v4.5.0 • Global Yönetici Paneli</p>
        </div>
        <div className="flex gap-4">
           <Button variant="outline" onClick={handleSystemRefresh} disabled={refreshing} className="h-14 px-8 rounded-2xl border-2 font-black text-xs uppercase tracking-widest gap-3">
             {refreshing ? <Loader2 className="h-5 w-5 animate-spin" /> : <RefreshCcw className="h-5 w-5" />}
             Sistemi Tazele
           </Button>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: 'Aktif Okul', val: 124, icon: Globe, color: 'primary' },
          { label: 'Aktif Öğretmen', val: teacherCount, icon: Users, color: 'accent' },
          { label: 'Aktif Öğrenci', val: studentCount, icon: Zap, color: 'primary' },
          { label: 'Okul Yöneticisi', val: schoolAdminCount, icon: ShieldCheck, color: 'accent' },
        ].map((stat, i) => (
          <Card key={i} className="rounded-[3rem] border-none shadow-[0_20px_40px_-10px_rgba(15,23,42,0.05)] bg-white p-2">
            <CardHeader className="pb-2">
              <div className={`h-14 w-14 rounded-2xl flex items-center justify-center mb-4 shadow-xl shadow-${stat.color}/20 ${stat.color === 'accent' ? 'bg-accent text-white' : 'bg-primary text-white'}`}>
                 <stat.icon className="h-7 w-7" />
              </div>
              <CardTitle className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground">{stat.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-black text-primary tracking-tighter tabular-nums">{stat.val}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modules Section */}
      <div className="space-y-8">
        <h3 className="text-3xl font-black italic tracking-tighter text-primary uppercase">Sistem Modülleri</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {modules.map((mod, i) => (
            <Card key={i} className="group relative overflow-hidden rounded-[2.5rem] border-none shadow-[0_20px_40px_-15px_rgba(15,23,42,0.1)] bg-white p-8 transition-all hover:-translate-y-2 cursor-pointer border border-primary/5">
              <div className={`absolute top-0 right-0 w-32 h-32 ${mod.color} opacity-5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 group-hover:opacity-10 transition-opacity`}></div>
              <div className="space-y-6">
                <div className={`h-14 w-14 rounded-2xl ${mod.color} text-white flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all`}>
                  <mod.icon className="h-7 w-7" />
                </div>
                <div className="space-y-2">
                  <h4 className="font-black text-xl italic tracking-tight text-primary">{mod.title}</h4>
                  <p className="text-xs text-muted-foreground font-medium leading-relaxed">{mod.desc}</p>
                </div>
                <div className="flex items-center text-[10px] font-black uppercase tracking-widest text-primary opacity-0 group-hover:opacity-100 transition-all">
                  Yönetimi Aç <ArrowRight className="ml-2 h-3 w-3" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        <div className="xl:col-span-1 space-y-10">
           <Card className="rounded-[3.5rem] border-none shadow-[0_40px_80px_-20px_rgba(15,23,42,0.1)] bg-white p-10 space-y-10">
              <div className="flex items-center justify-between">
                <h4 className="text-2xl font-black italic tracking-tighter">Sunucu Durumu</h4>
                <div className="h-4 w-4 rounded-full bg-emerald-500 animate-pulse"></div>
              </div>
              
              <div className="space-y-8">
                 <div className="space-y-3">
                    <div className="flex justify-between text-xs font-black uppercase tracking-widest text-muted-foreground">
                       <span>İşlemci Yükü</span>
                       <span>24%</span>
                    </div>
                    <Progress value={24} className="h-3 rounded-full bg-[#F1F5F9]" />
                 </div>
                 <div className="space-y-3">
                    <div className="flex justify-between text-xs font-black uppercase tracking-widest text-muted-foreground">
                       <span>Bellek Kullanımı</span>
                       <span>42%</span>
                    </div>
                    <Progress value={42} className="h-3 rounded-full bg-[#F1F5F9]" />
                 </div>
              </div>

              <div className="p-6 bg-primary rounded-[2.5rem] text-white flex items-center gap-6">
                 <Server className="h-10 w-10 text-accent" />
                 <div>
                    <p className="font-black text-sm tracking-tight">Main Cluster #1</p>
                    <p className="text-[10px] font-bold opacity-50 uppercase tracking-widest">Frankfurt - AWS Zone</p>
                 </div>
              </div>
           </Card>
        </div>

        <div className="xl:col-span-2 space-y-10">
           <Card className="rounded-[3.5rem] border-none shadow-[0_40px_80px_-20px_rgba(15,23,42,0.1)] bg-white overflow-hidden">
              <CardHeader className="p-10 border-b border-primary/5 flex flex-row items-center justify-between bg-muted/5">
                 <div>
                    <CardTitle className="text-3xl font-black italic tracking-tighter">Sistem Logları</CardTitle>
                    <CardDescription className="font-bold">Gerçek zamanlı sunucu ve kullanıcı hareketleri</CardDescription>
                 </div>
                 <Activity className="h-8 w-8 text-primary opacity-20" />
              </CardHeader>
              <CardContent className="p-0">
                 <div className="divide-y divide-primary/5">
                    {[
                      { msg: 'Yeni kullanıcı kaydı yapıldı.', time: '1 dakika önce', user: 'Ali V.', icon: Users },
                      { msg: 'Yıllık rapor başarıyla oluşturuldu.', time: '14 dakika önce', user: 'Sistem', icon: Database },
                      { msg: 'Güvenlik taraması tamamlandı. 0 risk.', time: '1 saat önce', user: 'ShieldBot', icon: Lock },
                      { msg: 'Okul Yönetimi girişi yapıldı.', time: '2 saat önce', user: 'Admin_7X', icon: LayoutDashboard },
                    ].map((log, i) => (
                      <div key={i} className="p-8 flex items-center justify-between hover:bg-[#F8FAFC] transition-all group">
                         <div className="flex items-center gap-6">
                            <div className="h-14 w-14 rounded-2xl bg-white border border-primary/5 shadow-sm flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                               <log.icon className="h-6 w-6" />
                            </div>
                            <div>
                               <p className="font-bold text-lg tracking-tight text-primary">{log.msg}</p>
                               <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
                                  {log.user} • {log.time}
                               </p>
                            </div>
                         </div>
                         <ArrowUpRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    ))}
                 </div>
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
