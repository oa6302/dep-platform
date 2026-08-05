
'use client';

import { useCollection } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  BarChart3, 
  TrendingUp, 
  School, 
  Bell, 
  FileText, 
  ArrowUpRight, 
  Award,
  BookOpen,
  LineChart,
  UserPlus
} from 'lucide-react';
import { where } from 'firebase/firestore';

interface SchoolAdminViewProps {
  user: any;
  userData: any;
}

export function SchoolAdminView({ user, userData }: SchoolAdminViewProps) {
  const { data: teachers } = useCollection<any>('users', where('role', '==', 'teacher'));
  const { data: students } = useCollection<any>('users', where('role', '==', 'student'));

  return (
    <div className="p-6 lg:p-10 space-y-10 max-w-7xl mx-auto w-full">
      {/* School Admin Welcome */}
      <div className="bg-white rounded-[3.5rem] p-12 shadow-[0_40px_100px_-20px_rgba(15,23,42,0.1)] border border-primary/5 flex flex-col xl:flex-row justify-between items-center gap-12 relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-80 h-80 bg-accent/5 blur-[120px] rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        <div className="space-y-6 relative z-10 text-center xl:text-left">
           <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-primary text-white font-black text-[11px] uppercase tracking-widest shadow-xl shadow-primary/20">
              <School className="h-4 w-4 text-accent" /> {userData?.school || 'Merkez Kampüs'}
           </div>
           <h2 className="text-5xl font-black tracking-tighter italic leading-none text-primary">Okul Yönetimi <br /><span className="text-accent">Paneli</span></h2>
           <p className="text-lg font-medium text-muted-foreground max-w-md">Kurumsal başarı verilerini, şube performanslarını ve öğretmen analizlerini buradan takip edebilirsiniz.</p>
        </div>
        <div className="grid grid-cols-2 gap-6 relative z-10">
           <div className="bg-[#F8FAFC] p-8 rounded-[2.5rem] border border-primary/5 text-center shadow-inner group/stat hover:bg-white hover:shadow-2xl transition-all">
              <p className="text-4xl font-black text-primary tracking-tighter">{teachers.length}</p>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mt-1">Öğretmen</p>
           </div>
           <div className="bg-[#F8FAFC] p-8 rounded-[2.5rem] border border-primary/5 text-center shadow-inner group/stat hover:bg-white hover:shadow-2xl transition-all">
              <p className="text-4xl font-black text-accent tracking-tighter">{students.length}</p>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mt-1">Öğrenci</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        {/* Performance Charts & Comparisons */}
        <div className="xl:col-span-2 space-y-10">
           <Card className="rounded-[3.5rem] border-none shadow-[0_40px_80px_-20px_rgba(15,23,42,0.1)] bg-white overflow-hidden">
              <CardHeader className="p-10 border-b border-primary/5 flex flex-row items-center justify-between bg-muted/5">
                 <div>
                    <CardTitle className="text-3xl font-black italic tracking-tighter">Şube Karşılaştırmaları</CardTitle>
                    <CardDescription className="font-bold">Akademik başarı ortalamalarına göre şubeler</CardDescription>
                 </div>
                 <BarChart3 className="h-8 w-8 text-accent" />
              </CardHeader>
              <CardContent className="p-10">
                 <div className="space-y-10">
                    {[
                      { name: '12-A SAY', val: 84, trend: '+4%', color: 'accent' },
                      { name: '12-B SAY', val: 78, trend: '+2%', color: 'primary' },
                      { name: '12-C EA', val: 72, trend: '-1%', color: 'primary' },
                      { name: '11-A SAY', val: 81, trend: '+6%', color: 'accent' },
                    ].map((branch, i) => (
                      <div key={i} className="space-y-4">
                         <div className="flex justify-between items-end">
                            <span className="font-black text-lg tracking-tight text-primary">{branch.name}</span>
                            <div className="text-right">
                               <span className={`text-[10px] font-black uppercase tracking-widest ${branch.trend.startsWith('+') ? 'text-emerald-500' : 'text-destructive'}`}>{branch.trend}</span>
                               <p className="text-2xl font-black text-primary leading-none">%{branch.val}</p>
                            </div>
                         </div>
                         <div className="h-4 w-full bg-[#F1F5F9] rounded-full overflow-hidden">
                            <div className={`h-full transition-all duration-1000 ${branch.color === 'accent' ? 'bg-accent shadow-[0_0_15px_rgba(245,158,11,0.5)]' : 'bg-primary'}`} style={{ width: `${branch.val}%` }}></div>
                         </div>
                      </div>
                    ))}
                 </div>
              </CardContent>
           </Card>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <Card className="rounded-[3rem] border-none shadow-[0_30px_60px_-15px_rgba(15,23,42,0.1)] bg-white p-10 space-y-6">
                 <h4 className="text-xl font-black italic tracking-tighter flex items-center gap-3">
                   <TrendingUp className="h-6 w-6 text-accent" /> Aktif Kullanım
                 </h4>
                 <div className="flex items-center gap-6 p-6 bg-[#F8FAFC] rounded-3xl border border-primary/5">
                    <p className="text-5xl font-black text-primary tracking-tighter">142</p>
                    <div>
                       <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground leading-none">Bugün Aktif</p>
                       <p className="font-bold text-emerald-500 text-xs mt-1">+12% Düne Göre</p>
                    </div>
                 </div>
              </Card>
              <Card className="rounded-[3rem] border-none shadow-[0_30px_60px_-15px_rgba(15,23,42,0.1)] bg-white p-10 space-y-6">
                 <h4 className="text-xl font-black italic tracking-tighter flex items-center gap-3">
                   <Bell className="h-6 w-6 text-primary" /> Duyurular
                 </h4>
                 <div className="space-y-3">
                    <div className="p-4 bg-primary/5 rounded-2xl border-l-4 border-accent">
                       <p className="text-xs font-bold text-primary">Veli Toplantısı Bildirimi</p>
                       <p className="text-[9px] uppercase font-black tracking-widest opacity-40 mt-1">Bugün 14:00</p>
                    </div>
                    <div className="p-4 bg-primary/5 rounded-2xl border-l-4 border-primary">
                       <p className="text-xs font-bold text-primary">Deneme Sınavı Takvimi</p>
                       <p className="text-[9px] uppercase font-black tracking-widest opacity-40 mt-1">Pazartesi</p>
                    </div>
                 </div>
              </Card>
           </div>
        </div>

        {/* School Admin Sidebar */}
        <div className="space-y-10">
           <Card className="rounded-[3.5rem] border-none shadow-[0_40px_80px_-20px_rgba(15,23,42,0.1)] bg-white p-10 space-y-8">
              <h4 className="text-2xl font-black italic tracking-tighter">AI Kurumsal Öneri</h4>
              <div className="bg-primary rounded-3xl p-8 text-white space-y-6 relative overflow-hidden">
                 <Brain className="h-10 w-10 text-accent absolute top-6 right-6 opacity-20" />
                 <p className="text-sm leading-relaxed font-medium opacity-90 relative z-10">
                   "Son yapılan genel denemede 11-SAY grubunun Biyoloji başarısı okul ortalamasının %18 altında kaldı. Branş öğretmenleri ile ek etüt planlanması önerilir."
                 </p>
                 <Button className="w-full h-12 rounded-xl bg-accent hover:bg-white hover:text-primary transition-all font-black text-[10px] uppercase tracking-widest">Detaylı Rapor</Button>
              </div>
           </Card>

           <Card className="rounded-[3.5rem] border-none shadow-[0_40px_80px_-20px_rgba(15,23,42,0.1)] bg-white p-10 space-y-8">
              <h4 className="text-xl font-black italic tracking-tighter">Yönetim Araçları</h4>
              <div className="grid gap-4">
                 <Button variant="outline" className="w-full h-14 justify-start rounded-2xl border-primary/5 bg-[#F8FAFC] hover:bg-white hover:shadow-lg font-bold text-sm transition-all">
                    <BookOpen className="mr-3 h-5 w-5 text-primary" /> Müfredat Durumu
                 </Button>
                 <Button variant="outline" className="w-full h-14 justify-start rounded-2xl border-primary/5 bg-[#F8FAFC] hover:bg-white hover:shadow-lg font-bold text-sm transition-all">
                    <Award className="mr-3 h-5 w-5 text-accent" /> Öğretmen Performansı
                 </Button>
                 <Button variant="outline" className="w-full h-14 justify-start rounded-2xl border-primary/5 bg-[#F8FAFC] hover:bg-white hover:shadow-lg font-bold text-sm transition-all">
                    <UserPlus className="mr-3 h-5 w-5 text-primary" /> Toplu Öğrenci Kaydı
                 </Button>
              </div>
           </Card>

           <div className="bg-white rounded-[3rem] p-8 border border-primary/5 flex items-center justify-between group cursor-pointer hover:shadow-2xl transition-all">
              <div className="flex items-center gap-5">
                 <div className="h-12 w-12 rounded-2xl bg-[#F8FAFC] flex items-center justify-center border border-primary/5 group-hover:bg-accent group-hover:text-white transition-all">
                    <LineChart className="h-6 w-6" />
                 </div>
                 <p className="font-black text-primary text-sm tracking-tight italic">Akademik Karneler</p>
              </div>
              <ArrowUpRight className="h-5 w-5 text-muted-foreground opacity-30 group-hover:opacity-100 group-hover:text-accent transition-all" />
           </div>
        </div>
      </div>
    </div>
  );
}
