'use client';

import { useCollection, useFirestore } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, Calendar, Plus, MessageSquare, ArrowUpRight, Eye, Hash, Copy, 
  TrendingUp, AlertTriangle, Brain, FileText, BarChart3, Search, 
  LayoutDashboard, ClipboardList, Sparkles, PieChart, ArrowRight,
  CheckCircle2, Clock, MapPin, UserCheck, Zap, Mail, ChevronRight,
  CalendarDays, BookOpen, UserPlus, Target, Settings, ShieldCheck, Activity
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
    <div className="p-8 lg:p-12 space-y-12 max-w-7xl mx-auto w-full animate-in fade-in duration-1000">
      {/* Premium Header */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-10">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-accent text-white font-black text-[10px] uppercase tracking-widest shadow-[0_20px_40px_-5px_rgba(245,158,11,0.3)]">
            <Sparkles className="h-3.5 w-3.5" /> Akademik Harekât Merkezi
          </div>
          <h2 className="text-6xl font-black tracking-tighter italic text-primary uppercase leading-[0.9] text-shadow-premium">
            Hoş Geldiniz, <br /><span className="text-accent text-shadow-accent">{userData?.displayName}</span>
          </h2>
        </div>
        <div className="flex flex-wrap gap-6 w-full xl:w-auto">
           <Card className="bg-primary text-white border-none rounded-[2.5rem] px-10 py-6 flex items-center gap-10 shadow-[0_40px_80px_-20px_rgba(15,23,42,0.4)] relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 blur-[60px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
              <div className="space-y-1 relative z-10">
                 <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 italic">Eşleşme Kodun</p>
                 <p className="text-3xl font-black tracking-[0.25em] font-mono text-shadow-deep">{userData?.activationCode}</p>
              </div>
              <Button size="icon" onClick={copyCode} variant="ghost" className="hover:bg-white/10 rounded-2xl h-14 w-14 relative z-10 transition-all hover:scale-110 active:scale-95 border border-white/5">
                 <Copy className="h-7 w-7 text-accent" />
              </Button>
           </Card>
           <Button className="h-20 px-10 rounded-[2rem] bg-accent hover:bg-primary transition-all duration-500 font-black text-sm uppercase tracking-widest gap-4 shadow-[0_30px_60px_-15px_rgba(245,158,11,0.4)] hover:-translate-y-1">
              <UserPlus className="h-6 w-6" /> Öğrenci Davet Et
           </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-12">
        <TabsList className="bg-[#F1F5F9]/80 backdrop-blur-xl p-2.5 rounded-[3rem] h-24 shadow-inner flex overflow-x-auto scrollbar-hide border border-primary/5">
          <TabsTrigger value="overview" className="rounded-[2.5rem] px-12 h-full font-black text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-[0_20px_40px_-10px_rgba(15,23,42,0.1)] transition-all duration-500 gap-4 group">
             <LayoutDashboard className="h-5 w-5 group-data-[state=active]:text-accent transition-colors" /> Genel Bakış
          </TabsTrigger>
          <TabsTrigger value="students" className="rounded-[2.5rem] px-12 h-full font-black text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-[0_20px_40px_-10px_rgba(15,23,42,0.1)] transition-all duration-500 gap-4 group">
             <Users className="h-5 w-5 group-data-[state=active]:text-accent transition-colors" /> Öğrencilerim
          </TabsTrigger>
          <TabsTrigger value="performance" className="rounded-[2.5rem] px-12 h-full font-black text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-[0_20px_40px_-10px_rgba(15,23,42,0.1)] transition-all duration-500 gap-4 group">
             <Activity className="h-5 w-5 group-data-[state=active]:text-accent transition-colors" /> Performans Analizi
          </TabsTrigger>
          <TabsTrigger value="ai" className="rounded-[2.5rem] px-12 h-full font-black text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-[0_20px_40px_-10px_rgba(15,23,42,0.1)] transition-all duration-500 gap-4 group">
             <Brain className="h-5 w-5 text-accent animate-pulse" /> AI Asistanı
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-12 outline-none animate-in fade-in slide-in-from-bottom-4 duration-700">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
             {stats.map((stat, i) => (
               <Card key={i} className="premium-card p-10 group border border-primary/5 relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-[40px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
                 <div className="flex justify-between items-start mb-8 relative z-10">
                    <div className="h-16 w-16 rounded-[1.25rem] bg-slate-50 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-inner">
                       <stat.icon className={cn("h-8 w-8", stat.color)} />
                    </div>
                    <Badge variant="outline" className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 px-3 py-1 rounded-full">Canlı</Badge>
                 </div>
                 <p className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-1 relative z-10 italic">{stat.label}</p>
                 <p className="text-6xl font-black text-primary tracking-tighter text-shadow-deep relative z-10">{stat.val}</p>
               </Card>
             ))}
           </div>

           <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
              <Card className="xl:col-span-8 rounded-[4rem] border-none shadow-[0_60px_120px_-30px_rgba(15,23,42,0.12)] bg-white p-12 space-y-10 border border-primary/5">
                 <div className="flex justify-between items-center">
                    <div className="space-y-1">
                       <h3 className="text-3xl font-black italic tracking-tighter uppercase text-shadow-deep">Haftalık Başarı Trendi</h3>
                       <p className="text-xs font-bold text-muted-foreground italic uppercase tracking-widest">Sınıf Geneli Net Ortalaması</p>
                    </div>
                    <Button variant="ghost" size="sm" className="h-12 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50">
                       Rapor Detayı <ArrowRight className="ml-3 h-4 w-4" />
                    </Button>
                 </div>
                 <div className="h-[400px] flex items-end gap-8 pb-4 relative">
                    <div className="absolute inset-0 flex flex-col justify-between opacity-10 pointer-events-none">
                       {[1,2,3,4,5].map(l => <div key={l} className="w-full h-px bg-primary"></div>)}
                    </div>
                    {[45, 68, 85, 52, 98, 74, 88].map((h, i) => (
                      <div key={i} className="flex-1 bg-slate-50 rounded-[2rem] relative group/bar hover:bg-slate-100 transition-all cursor-pointer">
                         <div className="absolute bottom-0 w-full bg-primary rounded-[2rem] transition-all duration-1000 group-hover/bar:bg-accent group-hover/bar:shadow-[0_0_30px_rgba(245,158,11,0.4)]" style={{ height: `${h}%` }}></div>
                         <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover/bar:opacity-100 transition-all duration-300 font-black text-sm bg-primary text-white px-4 py-2 rounded-xl shadow-2xl">%{h}</div>
                      </div>
                    ))}
                 </div>
                 <div className="flex justify-between px-4 text-[11px] font-black uppercase tracking-widest opacity-40 italic">
                    <span>Pzt</span><span>Sal</span><span>Çar</span><span>Per</span><span>Cum</span><span>Cmt</span><span>Paz</span>
                 </div>
              </Card>

              <div className="xl:col-span-4 space-y-10">
                 <Card className="rounded-[3.5rem] border-none shadow-[0_50px_100px_-20px_rgba(15,23,42,0.2)] bg-primary text-white p-12 space-y-10 relative overflow-hidden group">
                    <div className="absolute -top-20 -right-20 w-48 h-48 bg-accent/20 blur-[100px] rounded-full group-hover:scale-150 transition-transform duration-1000"></div>
                    <div className="flex items-center gap-6 relative z-10">
                       <div className="h-16 w-16 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center">
                          <Brain className="h-9 w-9 text-accent" />
                       </div>
                       <h4 className="text-2xl font-black italic tracking-tighter uppercase text-shadow-premium">AI Risk Analizi</h4>
                    </div>
                    <p className="text-lg leading-relaxed font-medium opacity-90 italic relative z-10">
                       "Melis S. ve Ali K. için son 3 denemede matematik netleri düşüş trendinde. Acil konu tekrarı atanması önerilir."
                    </p>
                    <Button className="w-full h-16 rounded-2xl bg-accent hover:bg-white hover:text-primary transition-all duration-500 font-black text-xs uppercase tracking-widest relative z-10 shadow-2xl shadow-accent/20">Aksiyon Al</Button>
                 </Card>

                 <Card className="rounded-[3.5rem] border-none shadow-[0_40px_80px_-20px_rgba(15,23,42,0.08)] bg-white p-12 space-y-8 border border-primary/5">
                    <h4 className="text-xl font-black italic tracking-tighter uppercase text-shadow-deep">Hızlı İşlemler</h4>
                    <div className="grid gap-5">
                       <QuickActionButton icon={Plus} label="Yeni Görev Ata" color="text-accent" />
                       <QuickActionButton icon={CalendarDays} label="Görüşme Planla" color="text-primary" />
                       <QuickActionButton icon={Mail} label="Toplu Duyuru Yap" color="text-primary" />
                    </div>
                 </Card>
              </div>
           </div>
        </TabsContent>

        <TabsContent value="students" className="outline-none animate-in fade-in duration-700">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {studentsLoading ? (
                 <div className="col-span-full py-40 flex flex-col items-center gap-6 opacity-30">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                    <p className="font-black uppercase tracking-widest text-xs italic">Veriler Hazırlanıyor...</p>
                 </div>
              ) : students.length > 0 ? (
                 students.map((student) => (
                    <Card key={student.id} className="premium-card p-12 group border border-primary/5 relative overflow-hidden">
                       <div className={cn(
                          "absolute top-0 right-0 w-3 h-full transition-all duration-500",
                          student.risk === 'high' ? 'bg-destructive shadow-[0_0_20px_rgba(239,68,68,0.5)]' : student.risk === 'medium' ? 'bg-accent shadow-[0_0_20px_rgba(245,158,11,0.5)]' : 'bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)]'
                       )}></div>
                       <div className="space-y-10">
                          <div className="flex justify-between items-start">
                             <div className="h-24 w-24 rounded-[2.25rem] bg-primary flex items-center justify-center text-white font-black text-4xl italic shadow-2xl relative border-[6px] border-white group-hover:scale-105 transition-all duration-500 group-hover:rotate-3">
                                {student.displayName?.charAt(0)}
                             </div>
                             <div className="text-right space-y-3">
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-50 text-primary font-black text-[10px] uppercase tracking-widest border border-slate-100 shadow-sm">
                                   <Sparkles className="h-3 w-3 text-accent" /> {student.successScore || 85} AI Skor
                                </div>
                                <p className="text-[10px] font-black uppercase opacity-40 mt-1 italic tracking-widest">Son Aktif: 2sa</p>
                             </div>
                          </div>

                          <div className="space-y-2">
                             <h4 className="text-3xl font-black text-primary tracking-tighter italic uppercase text-shadow-deep leading-none">{student.displayName}</h4>
                             <p className="text-[11px] font-black text-accent uppercase tracking-widest flex items-center gap-2">
                                <Target className="h-3.5 w-3.5" /> {student.targetExam} • {student.grade}
                             </p>
                          </div>

                          <div className="grid grid-cols-2 gap-6 py-6 border-y border-primary/5">
                             <div>
                                <p className="text-[10px] font-black uppercase opacity-40 mb-1 tracking-widest">Ort. Net</p>
                                <p className="text-2xl font-black text-primary italic text-shadow-deep">74.5</p>
                             </div>
                             <div>
                                <p className="text-[10px] font-black uppercase opacity-40 mb-1 tracking-widest">Çalışma</p>
                                <p className="text-2xl font-black text-primary italic text-shadow-deep">34s 12d</p>
                             </div>
                          </div>

                          <div className="flex gap-4 pt-2">
                             <Button onClick={() => simulateStudent(student.id)} size="icon" className="h-16 w-16 rounded-2xl bg-primary hover:bg-accent text-white shadow-2xl transition-all duration-500 hover:rotate-3 active:scale-95">
                                <Eye className="h-7 w-7" />
                             </Button>
                             <Button variant="outline" className="flex-1 h-16 rounded-2xl border-2 font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all duration-300">Profil</Button>
                             <Button size="icon" className="h-16 w-16 rounded-2xl bg-slate-50 text-primary hover:bg-primary hover:text-white transition-all duration-500 shadow-inner">
                                <MessageSquare className="h-7 w-7" />
                             </Button>
                          </div>
                       </div>
                    </Card>
                 ))
              ) : (
                 <div className="col-span-3 py-60 text-center opacity-30 space-y-8 animate-in fade-in duration-1000">
                    <Users className="h-24 w-24 mx-auto text-primary" />
                    <p className="text-2xl font-black uppercase tracking-widest italic text-primary">Henüz bağlı bir öğrenciniz yok.</p>
                 </div>
              )}
           </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function QuickActionButton({ icon: Icon, label, color }: { icon: any, label: string, color: string }) {
  return (
    <Button variant="outline" className="w-full h-16 justify-start rounded-2xl border-primary/5 bg-slate-50 hover:bg-white hover:shadow-2xl hover:-translate-y-1 font-black text-xs uppercase tracking-widest transition-all duration-300 group">
       <div className="h-10 w-10 rounded-xl bg-white border border-primary/5 flex items-center justify-center mr-4 group-hover:rotate-6 transition-transform">
          <Icon className={cn("h-5 w-5", color)} />
       </div>
       {label}
       <ChevronRight className="ml-auto h-4 w-4 opacity-20 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
    </Button>
  );
}
