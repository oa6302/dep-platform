
'use client';

import { useCollection, useFirestore } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  Target, 
  Brain, 
  Award, 
  Play, 
  BookOpen, 
  Zap, 
  Star,
  MapPin,
  LineChart,
  ClipboardCheck,
  Library,
  ArrowRight
} from 'lucide-react';
import { where, orderBy, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface StudentViewProps {
  user: any;
  userData: any;
  isReadOnly?: boolean;
}

export function StudentView({ user, userData, isReadOnly = false }: StudentViewProps) {
  const db = useFirestore();
  const [timer, setTimer] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: any;
    if (isActive && timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    } else if (timer === 0) {
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, timer]);

  const { data: tasks } = useCollection<any>(
    'tasks',
    where('studentId', '==', user?.uid || ''),
    orderBy('dueDate', 'asc')
  );

  const { data: sessions } = useCollection<any>(
    'sessions',
    where('studentId', '==', user?.uid || ''),
    orderBy('scheduledAt', 'asc')
  );

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const formatDate = (date: any) => {
    if (!date) return '';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
  };

  const handleCompleteTask = (taskId: string) => {
    if (isReadOnly || !db) return;
    const taskRef = doc(db, 'tasks', taskId);
    updateDoc(taskRef, { status: 'completed', updatedAt: serverTimestamp() }).catch(async () => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({ path: taskRef.path, operation: 'update' }));
    });
  };

  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const upcomingSessions = sessions.filter(s => s.status === 'scheduled');

  const modules = [
    { title: "Ders Takibi", icon: BookOpen, color: "bg-blue-500", desc: "Derslerin ve devamsızlık durumun" },
    { title: "Konu Analizi", icon: LineChart, color: "bg-purple-500", desc: "Hangi konuda ne kadar başarılısın?" },
    { title: "Deneme Sonuçları", icon: ClipboardCheck, color: "bg-orange-500", desc: "Tüm deneme sınavı analizlerin" },
    { title: "Çalışma Takvimi", icon: Calendar, color: "bg-green-500", desc: "Kişiselleştirilmiş akademik takvim" },
    { title: "Günlük Hedefler", icon: Target, color: "bg-red-500", desc: "Bugün tamamlaman gereken hedefler" },
    { title: "AI Koç", icon: Brain, color: "bg-indigo-500", desc: "Yapay zeka asistanınla görüş" },
    { title: "Dijital Kütüphane", icon: Library, color: "bg-cyan-500", desc: "Binlerce kaynak ve video ders" },
    { title: "Başarı Karnesi", icon: Award, color: "bg-yellow-500", desc: "Gelişimini özetleyen dijital karne" },
  ];

  return (
    <div className="p-6 lg:p-10 space-y-10 max-w-7xl mx-auto w-full">
      {/* Premium Hero Profile Card */}
      <div className="bg-white rounded-[3.5rem] p-12 shadow-[0_40px_100px_-20px_rgba(15,23,42,0.1)] border border-primary/5 flex flex-col lg:flex-row justify-between items-center gap-12 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-accent/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-accent/10 transition-colors"></div>
        <div className="flex items-center gap-10 relative z-10">
          <div className="relative">
             <div className="absolute -inset-4 bg-accent/20 blur-2xl rounded-full opacity-50 group-hover:opacity-100 transition-opacity"></div>
             <div className="h-28 w-28 rounded-[2.5rem] bg-primary flex items-center justify-center text-white font-black text-4xl italic shadow-2xl relative border-4 border-white">
                {userData?.displayName?.charAt(0) || 'S'}
             </div>
             <div className="absolute -bottom-2 -right-2 h-10 w-10 bg-accent rounded-2xl flex items-center justify-center text-white shadow-lg border-4 border-white">
                <Star className="h-5 w-5 fill-current" />
             </div>
          </div>
          <div className="space-y-3">
            <h2 className="text-4xl font-black tracking-tighter italic text-primary">{userData?.displayName}</h2>
            <div className="flex flex-wrap gap-3">
              <span className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest px-4 py-1.5 bg-primary/5 text-primary rounded-xl border border-primary/10">
                <BookOpen className="h-3.5 w-3.5" /> {userData?.school || 'Sınav Grubu'}
              </span>
              <span className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest px-4 py-1.5 bg-accent/10 text-accent rounded-xl border border-accent/20">
                <Zap className="h-3.5 w-3.5" /> {userData?.grade || '12. Sınıf'} - {userData?.branch || 'SAY'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-10 relative z-10 bg-[#F8FAFC] p-8 rounded-[2.5rem] border border-primary/5 shadow-inner">
          <div className="text-center">
            <p className="text-4xl font-black text-primary tracking-tighter">87%</p>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mt-1">Gelişim</p>
          </div>
          <div className="w-px h-16 bg-primary/10 self-center"></div>
          <div className="text-center">
            <p className="text-4xl font-black text-accent tracking-tighter">124</p>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mt-1">Puan</p>
          </div>
        </div>
      </div>

      {/* Modules Section */}
      <div className="space-y-8">
        <h3 className="text-3xl font-black italic tracking-tighter text-primary uppercase">Eğitim Modüllerin</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {modules.map((mod, i) => (
            <Card key={i} className="group relative overflow-hidden rounded-[2.5rem] border-none shadow-[0_20px_40px_-15px_rgba(15,23,42,0.1)] bg-white p-8 transition-all hover:-translate-y-2 cursor-pointer">
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
                  Şimdi Aç <ArrowRight className="ml-2 h-3 w-3" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-10">
          <div className="bg-primary rounded-[3rem] p-10 text-white shadow-2xl shadow-primary/30 relative overflow-hidden group">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-accent/20 blur-[100px] rounded-full group-hover:scale-125 transition-transform duration-1000"></div>
            <div className="flex flex-col md:flex-row gap-10 items-center relative z-10">
              <div className="h-20 w-20 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-2xl">
                <Brain className="h-10 w-10 text-accent" />
              </div>
              <div className="space-y-3 flex-1">
                <p className="text-[11px] font-black uppercase tracking-[0.3em] text-accent-foreground bg-accent px-4 py-1 rounded-full inline-block">AI Koç Önerisi</p>
                <h3 className="text-2xl font-black italic tracking-tight leading-relaxed">
                  "Matematik-Geometri netlerinde son 3 haftada %12 artış gözlemlendi. Bu hafta Türev konusuna yoğunlaşman kritik."
                </h3>
              </div>
              <Button className="h-16 px-10 rounded-[1.5rem] bg-accent hover:bg-white hover:text-primary transition-all font-black text-sm uppercase tracking-widest shadow-2xl shadow-accent/20 shrink-0">
                Analizi Gör
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
             <Card className="rounded-[3rem] border-none shadow-[0_30px_60px_-15px_rgba(15,23,42,0.1)] bg-white overflow-hidden">
                <CardHeader className="p-10 border-b border-primary/5 flex flex-row items-center justify-between bg-muted/5">
                  <div>
                    <CardTitle className="text-2xl font-black italic tracking-tighter">Görevlerin</CardTitle>
                    <CardDescription className="font-bold opacity-60">Bugün odaklanman gerekenler</CardDescription>
                  </div>
                  <Target className="h-6 w-6 text-accent" />
                </CardHeader>
                <CardContent className="p-8 space-y-4">
                  {pendingTasks.length > 0 ? (
                    pendingTasks.slice(0, 3).map((task) => (
                      <div key={task.id} className="p-6 bg-[#F8FAFC] rounded-[2rem] border border-primary/5 flex items-center justify-between group hover:bg-white hover:shadow-xl transition-all">
                        <div className="space-y-1">
                          <p className="font-black text-lg tracking-tight group-hover:text-primary transition-colors">{task.title}</p>
                          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                             <Clock className="h-3 w-3" /> {formatDate(task.dueDate)}
                          </p>
                        </div>
                        <Button 
                          onClick={() => handleCompleteTask(task.id)}
                          size="icon" 
                          variant="ghost" 
                          className="h-12 w-12 rounded-2xl bg-white border border-primary/5 text-accent shadow-sm hover:bg-accent hover:text-white transition-all"
                        >
                          <CheckCircle2 className="h-6 w-6" />
                        </Button>
                      </div>
                    ))
                  ) : (
                    <div className="py-20 text-center flex flex-col items-center gap-4 opacity-30">
                      <Award className="h-16 w-16" />
                      <p className="text-[10px] font-black uppercase tracking-widest">Harika! Tüm görevler bitti.</p>
                    </div>
                  )}
                </CardContent>
             </Card>

             <Card className="rounded-[3rem] border-none shadow-[0_30px_60px_-15px_rgba(15,23,42,0.1)] bg-white overflow-hidden">
                <CardHeader className="p-10 border-b border-primary/5 flex flex-row items-center justify-between bg-muted/5">
                  <div>
                    <CardTitle className="text-2xl font-black italic tracking-tighter">Görüşmeler</CardTitle>
                    <CardDescription className="font-bold opacity-60">Planlanmış seanslar</CardDescription>
                  </div>
                  <Calendar className="h-6 w-6 text-primary" />
                </CardHeader>
                <CardContent className="p-8 space-y-4">
                  {upcomingSessions.length > 0 ? (
                    upcomingSessions.slice(0, 3).map((session) => (
                      <div key={session.id} className="p-6 bg-[#F8FAFC] rounded-[2rem] border border-primary/5 flex items-center justify-between group hover:bg-white hover:shadow-xl transition-all">
                        <div className="space-y-1">
                          <p className="font-black text-lg tracking-tight">{session.notes || 'Haftalık Koçluk'}</p>
                          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                             <MapPin className="h-3 w-3" /> Online • {formatDate(session.scheduledAt)}
                          </p>
                        </div>
                        <Button className="h-10 px-6 rounded-xl bg-primary text-white font-black text-[10px] uppercase tracking-widest shadow-lg">Katıl</Button>
                      </div>
                    ))
                  ) : (
                    <div className="py-20 text-center flex flex-col items-center gap-4 opacity-30">
                      <Calendar className="h-16 w-16" />
                      <p className="text-[10px] font-black uppercase tracking-widest">Planlanmış görüşme yok.</p>
                    </div>
                  )}
                </CardContent>
             </Card>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-10">
           <Card className="rounded-[3rem] border-none shadow-[0_30px_60px_-15px_rgba(15,23,42,0.1)] bg-white overflow-hidden p-10">
              <div className="text-center space-y-6">
                 <p className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground">Pomodoro Sayaç</p>
                 <div className="relative inline-flex items-center justify-center">
                    <svg className="h-48 w-48 -rotate-90">
                      <circle cx="96" cy="96" r="88" fill="none" stroke="#F1F5F9" strokeWidth="10" />
                      <circle cx="96" cy="96" r="88" fill="none" stroke="#F59E0B" strokeWidth="10" strokeDasharray="552" strokeDashoffset={552 - (552 * timer / (25 * 60))} strokeLinecap="round" className="transition-all duration-1000" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                       <span className="text-5xl font-black text-primary tracking-tighter tabular-nums">{formatTime(timer)}</span>
                    </div>
                 </div>
                 <div className="flex gap-4">
                    <Button 
                      onClick={() => setIsActive(!isActive)}
                      className={`flex-1 h-16 rounded-2xl font-black uppercase tracking-widest text-xs transition-all ${isActive ? 'bg-destructive shadow-destructive/20' : 'bg-primary shadow-primary/20'}`}
                    >
                      {isActive ? 'Durdur' : 'Başlat'} <Play className="ml-2 h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => { setTimer(25 * 60); setIsActive(false); }}
                      className="h-16 w-16 rounded-2xl border-2 font-black"
                    >
                      ↺
                    </Button>
                 </div>
              </div>
           </Card>

           <Card className="rounded-[3rem] border-none shadow-[0_30px_60px_-15px_rgba(15,23,42,0.1)] bg-white overflow-hidden p-10">
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <h4 className="text-xl font-black italic tracking-tighter">Başarıların</h4>
                  <Award className="h-6 w-6 text-accent" />
                </div>
                <div className="grid grid-cols-3 gap-6">
                   {[1, 2, 3, 4, 5, 6].map(i => (
                     <div key={i} className={`h-16 w-16 rounded-2xl flex items-center justify-center transition-all cursor-pointer border-2 ${i <= 3 ? 'bg-accent/10 border-accent/20 text-accent' : 'bg-[#F8FAFC] border-primary/5 text-muted-foreground grayscale opacity-30'}`}>
                        <Star className={`h-8 w-8 ${i <= 3 ? 'fill-current' : ''}`} />
                     </div>
                   ))}
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-center opacity-40">Yeni bir rozet kazanmak için 3 görev daha tamamla!</p>
              </div>
           </Card>

           <div className="bg-accent rounded-[3rem] p-10 text-primary-foreground shadow-2xl shadow-accent/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mb-4">Günün Sözü</p>
              <p className="text-lg font-black italic tracking-tight leading-relaxed">
                "Büyük işler, küçük başlangıçların eseridir. Bugün attığın her adım seni hedefine yaklaştırır."
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}
