
'use client';

import { useCollection, useFirestore } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, Calendar, Plus, MessageSquare, ArrowUpRight, Eye, Hash, Copy, 
  TrendingUp, AlertTriangle, Brain, FileText, BarChart3, Search, 
  LayoutDashboard, ClipboardList, Sparkles, PieChart, ArrowRight,
  CheckCircle2, Clock, MapPin, UserCheck, Zap, Mail, ChevronRight,
  CalendarDays, BookOpen, UserPlus, Target
} from 'lucide-react';
import { where, orderBy } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface TeacherViewProps {
  user: any;
  userData: any;
}

export function TeacherView({ user, userData }: TeacherViewProps) {
  const router = useRouter();
  const { toast } = useToast();
  
  const { data: students, loading: studentsLoading } = useCollection<any>(
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

  const stats = [
    { label: 'Toplam Öğrenci', val: students.length, icon: Users, color: 'text-primary' },
    { label: 'Bugünkü Görüşmeler', val: 3, icon: CalendarDays, color: 'text-accent' },
    { label: 'Bekleyen Ödevler', val: 12, icon: ClipboardList, color: 'text-primary' },
    { label: 'Riskli Öğrenciler', val: 2, icon: AlertTriangle, color: 'text-destructive' },
  ];

  return (
    <div className="p-6 lg:p-10 space-y-10 max-w-7xl mx-auto w-full animate-in fade-in duration-1000">
      {/* Premium Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent text-white font-black text-[10px] uppercase tracking-widest shadow-xl shadow-accent/20">
            <Sparkles className="h-3 w-3" /> Akademik Yönetim Merkezi
          </div>
          <h2 className="text-5xl font-black tracking-tighter italic text-primary uppercase leading-tight text-shadow-premium">
            Hoş Geldiniz, <br /><span className="text-accent text-shadow-accent">{userData?.displayName}</span>
          </h2>
        </div>
        <div className="flex flex-wrap gap-4">
           <Card className="bg-primary text-white border-none rounded-[2rem] px-8 py-4 flex items-center gap-6 shadow-2xl">
              <div className="space-y-1">
                 <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Eşleşme Kodun</p>
                 <p className="text-2xl font-black tracking-[0.2em] font-mono">{userData?.activationCode}</p>
              </div>
              <Button size="icon" onClick={copyCode} variant="ghost" className="hover:bg-white/10 rounded-xl h-12 w-12">
                 <Copy className="h-6 w-6 text-accent" />
              </Button>
           </Card>
           <Button className="h-16 px-8 rounded-2xl bg-accent hover:bg-primary transition-all font-black text-xs uppercase tracking-widest gap-3 shadow-2xl shadow-accent/20">
              <UserPlus className="h-5 w-5" /> Öğrenci Davet Et
           </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-10">
        <TabsList className="bg-[#F1F5F9] p-2 rounded-[2.5rem] h-20 shadow-inner flex overflow-x-auto">
          <TabsTrigger value="overview" className="rounded-[2rem] px-10 h-full font-black text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-2xl transition-all gap-3">
             <LayoutDashboard className="h-4 w-4" /> Genel Bakış
          </TabsTrigger>
          <TabsTrigger value="students" className="rounded-[2rem] px-10 h-full font-black text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-2xl transition-all gap-3">
             <Users className="h-4 w-4" /> Öğrencilerim
          </TabsTrigger>
          <TabsTrigger value="performance" className="rounded-[2rem] px-10 h-full font-black text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-2xl transition-all gap-3">
             <TrendingUp className="h-4 w-4" /> Performans
          </TabsTrigger>
          <TabsTrigger value="ai" className="rounded-[2rem] px-10 h-full font-black text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-2xl transition-all gap-3">
             <Brain className="h-4 w-4 text-accent" /> AI Asistanı
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-10 outline-none">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
             {stats.map((stat, i) => (
               <Card key={i} className="premium-card p-8 group border border-primary/5">
                 <div className="flex justify-between items-start mb-6">
                    <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all shadow-inner">
                       <stat.icon className={cn("h-7 w-7", stat.color)} />
                    </div>
                    <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest opacity-40">Canlı</Badge>
                 </div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">{stat.label}</p>
                 <p className="text-5xl font-black text-primary tracking-tighter text-shadow-deep">{stat.val}</p>
               </Card>
             ))}
           </div>

           <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
              <Card className="xl:col-span-2 rounded-[3.5rem] border-none shadow-[0_40px_80px_-20px_rgba(15,23,42,0.1)] bg-white p-10 space-y-8">
                 <div className="flex justify-between items-center">
                    <h3 className="text-2xl font-black italic tracking-tighter uppercase text-shadow-deep">Haftalık Başarı Trendi</h3>
                    <Button variant="ghost" size="sm" className="font-black text-[10px] uppercase tracking-widest">Raporu Aç <ArrowRight className="ml-2 h-3 w-3" /></Button>
                 </div>
                 <div className="h-[300px] flex items-end gap-6 pb-4">
                    {[40, 65, 80, 55, 95, 70, 85].map((h, i) => (
                      <div key={i} className="flex-1 bg-slate-50 rounded-2xl relative group/bar hover:bg-slate-100 transition-all cursor-pointer">
                         <div className="absolute bottom-0 w-full bg-primary rounded-2xl transition-all duration-1000 group-hover/bar:bg-accent shadow-xl" style={{ height: `${h}%` }}></div>
                         <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover/bar:opacity-100 transition-opacity font-black text-xs">%{h}</div>
                      </div>
                    ))}
                 </div>
                 <div className="flex justify-between px-2 text-[10px] font-black uppercase opacity-40">
                    <span>Pzt</span><span>Sal</span><span>Çar</span><span>Per</span><span>Cum</span><span>Cmt</span><span>Paz</span>
                 </div>
              </Card>

              <div className="space-y-8">
                 <Card className="rounded-[3rem] border-none shadow-2xl bg-primary text-white p-10 space-y-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-accent/20 blur-3xl rounded-full"></div>
                    <div className="flex items-center gap-4 relative z-10">
                       <Brain className="h-10 w-10 text-accent" />
                       <h4 className="text-xl font-black italic tracking-tighter uppercase">AI Risk Analizi</h4>
                    </div>
                    <p className="text-sm leading-relaxed font-medium opacity-80 italic relative z-10">
                       "Melis S. ve Ali K. için son 3 denemede matematik netleri düşüş trendinde. Acil konu tekrarı atanması önerilir."
                    </p>
                    <Button className="w-full h-12 rounded-xl bg-accent hover:bg-white hover:text-primary transition-all font-black text-[10px] uppercase tracking-widest relative z-10 shadow-xl shadow-accent/20">Aksiyon Al</Button>
                 </Card>

                 <Card className="rounded-[3rem] border-none shadow-2xl bg-white p-10 space-y-6">
                    <h4 className="text-lg font-black italic tracking-tighter uppercase">Hızlı İşlemler</h4>
                    <div className="grid gap-4">
                       <Button variant="outline" className="w-full h-14 justify-start rounded-2xl border-primary/5 bg-slate-50 hover:bg-white hover:shadow-lg font-bold text-sm transition-all">
                          <Plus className="mr-3 h-5 w-5 text-accent" /> Yeni Görev Ata
                       </Button>
                       <Button variant="outline" className="w-full h-14 justify-start rounded-2xl border-primary/5 bg-slate-50 hover:bg-white hover:shadow-lg font-bold text-sm transition-all">
                          <Calendar className="mr-3 h-5 w-5 text-primary" /> Görüşme Planla
                       </Button>
                       <Button variant="outline" className="w-full h-14 justify-start rounded-2xl border-primary/5 bg-slate-50 hover:bg-white hover:shadow-lg font-bold text-sm transition-all">
                          <Mail className="mr-3 h-5 w-5 text-primary" /> Toplu Duyuru Yap
                       </Button>
                    </div>
                 </Card>
              </div>
           </div>
        </TabsContent>

        <TabsContent value="students" className="outline-none">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {studentsLoading ? (
                 <p className="p-20 text-center font-black uppercase tracking-widest opacity-40">Yükleniyor...</p>
              ) : students.length > 0 ? (
                 students.map((student) => (
                    <Card key={student.id} className="premium-card p-10 group border border-primary/5 relative overflow-hidden">
                       <div className={cn(
                          "absolute top-0 right-0 w-2 h-full",
                          student.risk === 'high' ? 'bg-destructive' : student.risk === 'medium' ? 'bg-accent' : 'bg-emerald-500'
                       )}></div>
                       <div className="space-y-8">
                          <div className="flex justify-between items-start">
                             <div className="h-20 w-20 rounded-[2rem] bg-primary flex items-center justify-center text-white font-black text-3xl italic shadow-2xl relative border-4 border-white">
                                {student.displayName?.charAt(0)}
                             </div>
                             <div className="text-right">
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 text-primary font-black text-[9px] uppercase tracking-widest border border-slate-100">
                                   <Sparkles className="h-2.5 w-2.5 text-accent" /> {student.successScore || 85} AI Skor
                                </div>
                                <p className="text-[9px] font-black uppercase opacity-40 mt-2">Son Giriş: 2 saat önce</p>
                             </div>
                          </div>

                          <div className="space-y-2">
                             <h4 className="text-2xl font-black text-primary tracking-tighter italic uppercase text-shadow-deep">{student.displayName}</h4>
                             <p className="text-[10px] font-black text-accent uppercase tracking-widest">{student.targetExam} • {student.grade}</p>
                          </div>

                          <div className="grid grid-cols-2 gap-4 py-4 border-y border-primary/5">
                             <div>
                                <p className="text-[9px] font-black uppercase opacity-40 mb-1">Ort. Net</p>
                                <p className="text-xl font-black text-primary">74.5</p>
                             </div>
                             <div>
                                <p className="text-[9px] font-black uppercase opacity-40 mb-1">Çalışma</p>
                                <p className="text-xl font-black text-primary">34s 12d</p>
                             </div>
                          </div>

                          <div className="flex gap-4 pt-2">
                             <Button onClick={() => simulateStudent(student.id)} size="icon" className="h-14 w-14 rounded-2xl bg-primary hover:bg-accent text-white shadow-xl transition-all">
                                <Eye className="h-6 w-6" />
                             </Button>
                             <Button variant="outline" className="flex-1 h-14 rounded-2xl border-2 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all">Profil</Button>
                             <Button size="icon" className="h-14 w-14 rounded-2xl bg-slate-50 text-primary hover:bg-slate-100 transition-all">
                                <MessageSquare className="h-6 w-6" />
                             </Button>
                          </div>
                       </div>
                    </Card>
                 ))
              ) : (
                 <div className="col-span-3 py-40 text-center opacity-30 space-y-6">
                    <Users className="h-20 w-20 mx-auto" />
                    <p className="text-xl font-black uppercase tracking-widest italic">Henüz bağlı bir öğrenciniz yok.</p>
                 </div>
              )}
           </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-10 outline-none">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <Card className="premium-card p-12 space-y-10">
                 <h3 className="text-2xl font-black italic tracking-tighter uppercase text-shadow-deep">Konu Tamamlama Oranları</h3>
                 <div className="space-y-8">
                    {[
                       { name: 'Matematik', val: 78, color: 'bg-primary' },
                       { name: 'Türkçe', val: 92, color: 'bg-accent shadow-lg shadow-accent/20' },
                       { name: 'Fen Bilimleri', val: 64, color: 'bg-primary' },
                       { name: 'Sosyal Bilgiler', val: 85, color: 'bg-primary' },
                    ].map((lesson, i) => (
                       <div key={i} className="space-y-3">
                          <div className="flex justify-between text-xs font-black uppercase tracking-widest">
                             <span>{lesson.name}</span>
                             <span>%{lesson.val}</span>
                          </div>
                          <Progress value={lesson.val} className="h-4 rounded-full bg-slate-50" />
                       </div>
                    ))}
                 </div>
              </Card>
              <Card className="premium-card p-12 flex flex-col justify-center items-center text-center space-y-8">
                 <div className="h-32 w-32 rounded-full border-[12px] border-slate-50 border-t-accent animate-spin-slow flex items-center justify-center">
                    <p className="text-4xl font-black text-primary">87</p>
                 </div>
                 <div className="space-y-2">
                    <h4 className="text-2xl font-black italic tracking-tighter uppercase">Genel Başarı Skoru</h4>
                    <p className="text-sm font-medium text-muted-foreground italic">"Geçen aya göre %12'lik bir artış saptandı. Harika gidiyorsunuz!"</p>
                 </div>
                 <Button className="h-14 px-10 rounded-2xl bg-primary hover:bg-accent transition-all font-black text-xs uppercase tracking-widest shadow-xl">Detaylı Analiz Gör</Button>
              </Card>
           </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
