
'use client';

import { useCollection } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, BarChart3, TrendingUp, School, Bell, ArrowRight, Brain, 
  UserRound, Layers, FileSpreadsheet, Cpu, GraduationCap, Award
} from 'lucide-react';
import { where } from 'firebase/firestore';

interface SchoolAdminViewProps {
  user: any;
  userData: any;
}

export function SchoolAdminView({ user, userData }: SchoolAdminViewProps) {
  const { data: teachers } = useCollection<any>('users', where('role', '==', 'teacher'));
  const { data: students } = useCollection<any>('users', where('role', '==', 'student'));

  const modules = [
    { title: "Öğretmen Yönetimi", icon: UserRound, color: "bg-blue-700", desc: "Öğretmen performansı ve atamalar" },
    { title: "Öğrenci Yönetimi", icon: Users, color: "bg-green-700", desc: "Okul geneli akademik veriler" },
    { title: "Şube Yönetimi", icon: Layers, color: "bg-purple-700", desc: "Şubeler arası başarı dengesi" },
    { title: "Sınav Merkezi", icon: School, color: "bg-orange-700", desc: "Okul geneli sınav planlama" },
    { title: "Akademik Analiz", icon: TrendingUp, color: "bg-red-700", desc: "Ders ve konu bazlı grafikler" },
    { title: "Kurumsal Raporlar", icon: FileSpreadsheet, color: "bg-indigo-700", desc: "Resmi ve akademik çıktılar" },
    { title: "AI Yönetim Üssü", icon: Cpu, color: "bg-pink-700", desc: "Yönetim kararları için AI önerileri" },
    { title: "Duyuru Sistemi", icon: Bell, color: "bg-cyan-700", desc: "Tüm paydaşlara anlık bildirim" },
  ];

  return (
    <div className="p-6 lg:p-10 space-y-10 max-w-7xl mx-auto w-full animate-in fade-in duration-700">
      <div className="bg-white rounded-[3.5rem] p-12 shadow-xl border border-primary/5 flex flex-col xl:flex-row justify-between items-center gap-12 relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-80 h-80 bg-accent/5 blur-[120px] rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        <div className="space-y-6 relative z-10 text-center xl:text-left">
           <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-primary text-white font-black text-[11px] uppercase tracking-widest shadow-xl shadow-primary/20">
              <School className="h-4 w-4 text-accent" /> {userData?.school || 'Merkez Kampüs'}
           </div>
           <h2 className="text-5xl font-black tracking-tighter italic leading-none text-primary uppercase">Kurumsal <br /><span className="text-accent">Yönetim Paneli</span></h2>
           <p className="text-lg font-medium text-muted-foreground max-w-md italic opacity-80">Okulunuzun tüm akademik süreçlerini veriyle yönetin.</p>
        </div>
        <div className="grid grid-cols-2 gap-6 relative z-10">
           <div className="bg-[#F8FAFC] p-8 rounded-[2.5rem] border border-primary/5 text-center shadow-inner group/stat hover:bg-white hover:shadow-2xl transition-all">
              <p className="text-4xl font-black text-primary tracking-tighter">{teachers.length}</p>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mt-1">Aktif Öğretmen</p>
           </div>
           <div className="bg-[#F8FAFC] p-8 rounded-[2.5rem] border border-primary/5 text-center shadow-inner group/stat hover:bg-white hover:shadow-2xl transition-all">
              <p className="text-4xl font-black text-accent tracking-tighter">{students.length}</p>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mt-1">Kayıtlı Öğrenci</p>
           </div>
        </div>
      </div>

      <div className="space-y-8">
        <h3 className="text-3xl font-black italic tracking-tighter text-primary uppercase">Yönetim Modülleri</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {modules.map((mod, i) => (
            <Card key={i} className="group relative overflow-hidden rounded-[2.5rem] border-none shadow-lg bg-white p-8 transition-all hover:-translate-y-2 cursor-pointer border border-primary/5">
              <div className="space-y-6">
                <div className={`h-14 w-14 rounded-2xl ${mod.color} text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-all`}>
                  <mod.icon className="h-7 w-7" />
                </div>
                <div className="space-y-2">
                  <h4 className="font-black text-xl italic tracking-tight text-primary leading-none uppercase">{mod.title}</h4>
                  <p className="text-xs text-muted-foreground font-medium leading-relaxed italic">{mod.desc}</p>
                </div>
                <div className="flex items-center text-[10px] font-black uppercase tracking-widest text-accent opacity-0 group-hover:opacity-100 transition-all">
                  Yönetimi Aç <ArrowRight className="ml-2 h-3 w-3" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        <Card className="xl:col-span-2 rounded-[3.5rem] border-none shadow-xl bg-white overflow-hidden">
           <CardHeader className="p-10 border-b border-primary/5 flex flex-row items-center justify-between bg-muted/5">
              <div>
                 <CardTitle className="text-3xl font-black italic tracking-tighter uppercase">Şube Karşılaştırmaları</CardTitle>
                 <CardDescription className="font-bold italic">Akademik başarı ortalamasına göre şubeler</CardDescription>
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
                      <div className="h-4 w-full bg-[#F1F5F9] rounded-full overflow-hidden shadow-inner">
                         <div className={`h-full transition-all duration-1000 ${branch.color === 'accent' ? 'bg-accent' : 'bg-primary'}`} style={{ width: `${branch.val}%` }}></div>
                      </div>
                   </div>
                 ))}
              </div>
           </CardContent>
        </Card>

        <div className="space-y-10">
           <Card className="rounded-[3.5rem] border-none shadow-xl bg-primary text-white p-10 space-y-8 relative overflow-hidden group">
              <Brain className="h-10 w-10 text-accent absolute top-6 right-6 opacity-20" />
              <h4 className="text-2xl font-black italic tracking-tighter uppercase">AI Kurumsal Öneri</h4>
              <p className="text-sm leading-relaxed font-medium opacity-90 italic">
                "Son deneme sonuçlarına göre 11-SAY grubunun Fizik ortalaması diğer şubelerin %14 gerisinde kaldı. Ek bir etüt planlanması başarınızı yükseltecektir."
              </p>
              <Button className="w-full h-14 rounded-2xl bg-accent hover:bg-white hover:text-primary transition-all font-black text-[10px] uppercase tracking-widest shadow-2xl">Raporu İndir</Button>
           </Card>

           <Card className="rounded-[3.5rem] border-none shadow-xl bg-white p-10 space-y-8">
              <h4 className="text-xl font-black italic tracking-tighter uppercase">Hızlı Araçlar</h4>
              <div className="grid gap-4">
                 <Button variant="outline" className="w-full h-14 justify-start rounded-2xl border-primary/5 bg-[#F8FAFC] hover:bg-white transition-all font-bold group">
                    <Award className="mr-3 h-5 w-5 text-accent" /> Öğretmen Karnesi
                 </Button>
                 <Button variant="outline" className="w-full h-14 justify-start rounded-2xl border-primary/5 bg-[#F8FAFC] hover:bg-white transition-all font-bold group">
                    <GraduationCap className="mr-3 h-5 w-5 text-primary" /> Mezun Takibi
                 </Button>
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
}
