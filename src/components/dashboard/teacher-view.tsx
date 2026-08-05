
'use client';

import { useCollection, useFirestore } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Calendar, 
  Plus, 
  MessageSquare, 
  ArrowUpRight, 
  Eye, 
  Hash, 
  Copy, 
  TrendingUp, 
  AlertTriangle, 
  Brain, 
  FileText,
  BarChart3,
  Search
} from 'lucide-react';
import { where, orderBy } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';

interface TeacherViewProps {
  user: any;
  userData: any;
}

export function TeacherView({ user, userData }: TeacherViewProps) {
  const router = useRouter();
  const { toast } = useToast();
  
  const { data: students } = useCollection<any>(
    'users',
    where('role', '==', 'student'),
    where('coachId', '==', user?.uid || '')
  );

  const { data: sessions } = useCollection<any>(
    'sessions',
    where('teacherId', '==', user?.uid || ''),
    orderBy('scheduledAt', 'asc')
  );

  const upcomingSessions = sessions.filter(s => s.status === 'scheduled');

  const copyCode = () => {
    if (userData?.activationCode) {
      navigator.clipboard.writeText(userData.activationCode);
      toast({ title: 'Kopyalandı', description: 'Aktivasyon kodu panoya kopyalandı.' });
    }
  };

  const simulateStudent = (studentId: string) => {
    router.push(`/dashboard?simulate=${studentId}`);
  };

  return (
    <div className="p-6 lg:p-10 space-y-10 max-w-7xl mx-auto w-full">
      {/* Teacher Welcome Header */}
      <div className="bg-primary rounded-[3.5rem] p-12 text-white flex flex-col xl:flex-row justify-between items-center gap-12 shadow-[0_40px_100px_-20px_rgba(15,23,42,0.3)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-accent/20 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="space-y-6 relative z-10 text-center xl:text-left">
          <p className="text-[11px] font-black uppercase tracking-[0.4em] text-accent">Eğitim Koçu Paneli</p>
          <h2 className="text-5xl font-black tracking-tighter italic leading-[1.1]">Hoş Geldiniz, <br /><span className="text-accent">{userData?.displayName}</span></h2>
          <p className="opacity-60 font-medium max-w-lg text-lg">Öğrencilerinizin akademik gelişimini yapay zeka destekli araçlarla yönetin.</p>
        </div>
        <div className="bg-white/10 backdrop-blur-3xl rounded-[3rem] p-10 border border-white/10 flex flex-col items-center gap-6 min-w-[320px] relative z-10 shadow-2xl">
          <div className="flex items-center gap-3 text-accent font-black text-[11px] uppercase tracking-[0.3em] bg-white/5 px-4 py-1.5 rounded-full border border-white/5">
            <Hash className="h-4 w-4" />
            Eşleşme Kodun
          </div>
          <div className="text-3xl font-black tracking-[0.2em] bg-white/5 px-8 py-4 rounded-[1.5rem] border border-white/10 font-mono shadow-inner text-white">
            {userData?.activationCode || 'DK-....-....'}
          </div>
          <Button onClick={copyCode} variant="ghost" className="text-white/60 hover:text-white hover:bg-white/10 font-black text-[11px] uppercase tracking-widest gap-3 h-12 px-8 rounded-2xl transition-all">
            <Copy className="h-5 w-5" />
            Kodu Kopyala
          </Button>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: 'Aktif Öğrenciler', val: students.length, desc: 'Takibinizdeki öğrenciler', icon: Users, color: 'primary' },
          { label: 'Bekleyen Seanslar', val: upcomingSessions.length, desc: 'Haftalık görüşmeler', icon: Calendar, color: 'accent' },
          { label: 'Riskli Öğrenciler', val: 2, desc: 'Netleri düşüşte olanlar', icon: AlertTriangle, color: 'destructive' },
          { label: 'Başarı Oranı', val: '%92', desc: 'Genel gelişim ortalaması', icon: TrendingUp, color: 'primary' },
        ].map((stat, i) => (
          <Card key={i} className="rounded-[2.5rem] border-none shadow-[0_20px_40px_-10px_rgba(15,23,42,0.05)] bg-white transition-all hover:scale-105 group">
            <CardHeader className="pb-2">
              <div className={`h-12 w-12 rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:rotate-6 transition-transform ${stat.color === 'accent' ? 'bg-accent/10 text-accent' : stat.color === 'destructive' ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
                 <stat.icon className="h-6 w-6" />
              </div>
              <CardTitle className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground">{stat.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-black text-primary tracking-tighter">{stat.val}</p>
              <CardDescription className="font-bold opacity-60 text-xs mt-1">{stat.desc}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        {/* Student Management Column */}
        <div className="xl:col-span-2 space-y-10">
          <Card className="rounded-[3.5rem] border-none shadow-[0_40px_80px_-20px_rgba(15,23,42,0.1)] bg-white overflow-hidden">
            <CardHeader className="p-10 border-b border-primary/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-muted/5">
              <div>
                <CardTitle className="text-3xl font-black italic tracking-tighter">Öğrenci Yönetimi</CardTitle>
                <CardDescription className="font-bold">Öğrencinin ekranını görmek için göze tıklayın.</CardDescription>
              </div>
              <div className="flex gap-4 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                   <Input placeholder="Öğrenci ara..." className="pl-11 h-12 rounded-2xl bg-white border-primary/5 shadow-inner" />
                </div>
                <Button size="icon" className="h-12 w-12 rounded-2xl bg-primary shadow-xl shadow-primary/20 shrink-0">
                  <Plus className="h-6 w-6" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-primary/5">
                {students.length > 0 ? (
                  students.map((student) => (
                    <div key={student.id} className="p-8 flex items-center justify-between hover:bg-[#F8FAFC] transition-all group">
                      <div className="flex items-center gap-8">
                        <div className="h-16 w-16 rounded-[1.5rem] bg-primary/5 border border-primary/10 flex items-center justify-center text-primary font-black text-2xl italic shadow-inner group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all">
                          {student.displayName?.charAt(0) || 'S'}
                        </div>
                        <div>
                          <p className="font-black text-xl tracking-tight group-hover:text-primary transition-colors">{student.displayName}</p>
                          <div className="flex gap-3 mt-1">
                             <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-muted rounded-lg">{student.branch || 'MF'}</span>
                             <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-accent/10 text-accent rounded-lg">{student.grade || '12. Sınıf'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <Button size="icon" variant="ghost" className="h-14 w-14 rounded-[1.25rem] bg-[#F1F5F9] hover:bg-accent/10 hover:text-accent transition-all shadow-sm">
                          <MessageSquare className="h-6 w-6" />
                        </Button>
                        <Button onClick={() => simulateStudent(student.id)} size="icon" className="h-14 w-14 rounded-[1.25rem] bg-primary hover:bg-accent text-white shadow-xl shadow-primary/10 transition-all">
                          <Eye className="h-6 w-6" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-24 text-center text-muted-foreground flex flex-col items-center gap-6">
                    <Users className="h-20 w-20 opacity-5" />
                    <p className="font-black uppercase tracking-widest text-xs opacity-40">Henüz bağlı bir öğrenciniz yok.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI & Reports Column */}
        <div className="space-y-10">
           {/* AI Assistant Card */}
           <div className="bg-primary rounded-[3.5rem] p-10 text-white shadow-3xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-48 h-48 bg-accent/20 blur-[80px] rounded-full"></div>
              <div className="space-y-8 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-white/10 backdrop-blur-xl flex items-center justify-center border border-white/20">
                    <Brain className="h-8 w-8 text-accent" />
                  </div>
                  <div>
                    <h4 className="font-black text-xl italic tracking-tighter">AI Eğitmen Asistanı</h4>
                    <p className="text-[10px] uppercase font-bold opacity-50 tracking-widest">Akıllı Analiz v2.0</p>
                  </div>
                </div>
                <div className="p-6 bg-white/5 rounded-[2rem] border border-white/10 space-y-4">
                   <p className="text-sm font-medium leading-relaxed opacity-80">
                     "Bu hafta Melis S. ve Ali K. için Matematik netlerinde %15 düşüş saptandı. Konu bazlı ödevlendirme yapmanızı öneririm."
                   </p>
                   <Button variant="outline" className="w-full h-12 rounded-xl border-white/10 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest">Tüm Analizleri Gör</Button>
                </div>
              </div>
           </div>

           {/* Quick Actions */}
           <Card className="rounded-[3.5rem] border-none shadow-[0_40px_80px_-20px_rgba(15,23,42,0.1)] bg-white overflow-hidden p-10 space-y-8">
              <h4 className="text-xl font-black italic tracking-tighter flex items-center gap-3">
                <BarChart3 className="h-5 w-5 text-accent" /> Hızlı Raporlar
              </h4>
              <div className="grid gap-4">
                 <Button variant="outline" className="w-full h-14 justify-start rounded-2xl border-primary/5 bg-[#F8FAFC] hover:bg-white hover:shadow-lg font-bold text-sm transition-all">
                    <FileText className="mr-3 h-5 w-5 text-primary" /> Haftalık Sınıf Raporu
                 </Button>
                 <Button variant="outline" className="w-full h-14 justify-start rounded-2xl border-primary/5 bg-[#F8FAFC] hover:bg-white hover:shadow-lg font-bold text-sm transition-all">
                    <TrendingUp className="mr-3 h-5 w-5 text-accent" /> Deneme Başarı İstatistikleri
                 </Button>
                 <Button variant="outline" className="w-full h-14 justify-start rounded-2xl border-primary/5 bg-[#F8FAFC] hover:bg-white hover:shadow-lg font-bold text-sm transition-all">
                    <Users className="mr-3 h-5 w-5 text-primary" /> Veli Bilgilendirme Bülteni
                 </Button>
              </div>
           </Card>

           {/* Support Badge */}
           <div className="bg-accent/10 border border-accent/20 rounded-[3rem] p-8 flex items-center gap-6">
              <div className="h-14 w-14 rounded-2xl bg-accent flex items-center justify-center shadow-lg shadow-accent/20">
                 <ArrowUpRight className="h-6 w-6 text-white" />
              </div>
              <div>
                 <p className="font-black text-primary text-sm tracking-tight italic">Premium Koçluk Desteği</p>
                 <p className="text-[10px] font-bold text-accent uppercase tracking-widest">Daha fazla özellik keşfet</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
