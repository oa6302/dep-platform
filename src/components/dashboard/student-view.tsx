
'use client';

import { useCollection, useFirestore } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Calendar, CheckCircle2, Clock, TrendingUp, Target, Brain, Award, Play, BookOpen, Zap, Star, MapPin, LineChart, ClipboardCheck, Library, ArrowRight, Sparkles 
} from 'lucide-react';
import { where, orderBy, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useState, useEffect, useMemo } from 'react';
import { EXAM_CONFIGS } from '@/lib/exam-configs';

interface StudentViewProps {
  user: any;
  userData: any;
  isReadOnly?: boolean;
}

export function StudentView({ user, userData, isReadOnly = false }: StudentViewProps) {
  const db = useFirestore();
  const [timer, setTimer] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);

  const examConfig = useMemo(() => {
    return EXAM_CONFIGS[userData?.targetExam || 'LGS'] || EXAM_CONFIGS['LGS'];
  }, [userData?.targetExam]);

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

  return (
    <div className="p-6 lg:p-10 space-y-12 max-w-7xl mx-auto w-full">
      {/* Modern Hero Profile Card */}
      <div className="bg-white rounded-[4rem] p-12 shadow-[0_60px_120px_-30px_rgba(15,23,42,0.1)] border border-primary/5 flex flex-col lg:flex-row justify-between items-center gap-12 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="flex items-center gap-12 relative z-10">
          <div className="relative">
             <div className="absolute -inset-6 bg-accent/20 blur-3xl rounded-full opacity-50 group-hover:opacity-100 transition-opacity"></div>
             <div className="h-32 w-32 rounded-[3rem] bg-primary flex items-center justify-center text-white font-black text-5xl italic shadow-2xl relative border-[6px] border-white text-shadow-deep">
                {userData?.displayName?.charAt(0) || 'S'}
             </div>
             <div className="absolute -bottom-2 -right-2 h-12 w-12 bg-accent rounded-2xl flex items-center justify-center text-white shadow-xl border-4 border-white">
                <examConfig.icon className="h-6 w-6" />
             </div>
          </div>
          <div className="space-y-4">
            <h2 className="text-5xl font-black tracking-tighter italic text-primary text-shadow-deep">{userData?.displayName}</h2>
            <div className="flex flex-wrap gap-4">
              <span className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest px-6 py-2.5 bg-primary/5 text-primary rounded-2xl border border-primary/10 shadow-sm">
                <Sparkles className="h-4 w-4 text-accent" /> Hedef: {examConfig.title}
              </span>
              <span className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest px-6 py-2.5 bg-accent/10 text-accent rounded-2xl border border-accent/20 shadow-sm">
                <Zap className="h-4 w-4" /> {userData?.grade || 'Aktif Öğrenci'} - {userData?.branch || 'MF'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-12 relative z-10 bg-[#F8FAFC] p-10 rounded-[3rem] border border-primary/5 shadow-inner">
          <div className="text-center">
            <p className="text-5xl font-black text-primary tracking-tighter text-shadow-deep">87%</p>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mt-1">Gelişim</p>
          </div>
          <div className="w-px h-20 bg-primary/10 self-center"></div>
          <div className="text-center">
            <p className="text-5xl font-black text-accent tracking-tighter text-shadow-accent">124</p>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mt-1">Puan</p>
          </div>
        </div>
      </div>

      {/* Dynamic Exam Lessons Header */}
      <div className="space-y-8 animate-in slide-in-from-right duration-700">
        <h3 className="text-3xl font-black italic tracking-tighter text-primary uppercase text-shadow-deep">Program Dersleri ({examConfig.title})</h3>
        <div className="flex flex-wrap gap-4">
          {examConfig.lessons.map((lesson) => (
            <div key={lesson} className="px-8 py-6 bg-white rounded-[2rem] shadow-xl border border-primary/5 font-black text-sm text-primary italic uppercase tracking-widest hover:bg-primary hover:text-white transition-all cursor-default group">
              <span className="group-hover:translate-x-1 inline-block transition-transform">{lesson}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Dynamic Modules Section */}
      <div className="space-y-10">
        <h3 className="text-4xl font-black italic tracking-tighter text-primary uppercase text-shadow-deep">Aktif Eğitim Modülleri</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {examConfig.modules.map((mod, i) => (
            <Card key={i} className="group relative overflow-hidden rounded-[3rem] border-none shadow-[0_30px_60px_-15px_rgba(15,23,42,0.06)] bg-white p-10 transition-all hover:-translate-y-4 hover:shadow-[0_50px_100px_-20px_rgba(15,23,42,0.12)] cursor-pointer border border-primary/5">
              <div className={`absolute top-0 right-0 w-32 h-32 ${mod.color} opacity-5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 group-hover:opacity-10 transition-opacity`}></div>
              <div className="space-y-8">
                <div className={`h-16 w-16 rounded-2xl ${mod.color} text-white flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all`}>
                  <mod.icon className="h-8 w-8" />
                </div>
                <div className="space-y-3">
                  <h4 className="font-black text-2xl italic tracking-tight text-primary text-shadow-deep">{mod.title}</h4>
                  <p className="text-sm text-muted-foreground font-medium leading-relaxed">{mod.desc}</p>
                </div>
                <div className="flex items-center text-[11px] font-black uppercase tracking-widest text-primary opacity-0 group-hover:opacity-100 transition-all">
                  Modülü Aç <ArrowRight className="ml-2 h-4 w-4" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-10">
          <div className="bg-primary rounded-[3.5rem] p-12 text-white shadow-[0_60px_120px_-30px_rgba(15,23,42,0.4)] relative overflow-hidden group">
            <div className="absolute -top-24 -right-24 w-80 h-80 bg-accent/20 blur-[100px] rounded-full group-hover:scale-125 transition-transform duration-1000"></div>
            <div className="flex flex-col md:flex-row gap-12 items-center relative z-10">
              <div className="h-24 w-24 rounded-[2rem] bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-2xl">
                <Brain className="h-12 w-12 text-accent" />
              </div>
              <div className="space-y-4 flex-1">
                <p className="text-[11px] font-black uppercase tracking-[0.3em] text-accent-foreground bg-accent px-6 py-1.5 rounded-full inline-block shadow-xl">AI Kişiselleştirilmiş Analiz</p>
                <h3 className="text-3xl font-black italic tracking-tight leading-relaxed text-shadow-deep">
                   {examConfig.aiFocus}
                </h3>
              </div>
              <Button className="h-20 px-12 rounded-[2rem] bg-accent hover:bg-white hover:text-primary transition-all font-black text-sm uppercase tracking-widest shadow-2xl shadow-accent/20 shrink-0">
                Detaylı Rapor
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
             <Card className="rounded-[3.5rem] border-none shadow-[0_40px_80px_-20px_rgba(15,23,42,0.1)] bg-white overflow-hidden">
                <CardHeader className="p-10 border-b border-primary/5 flex flex-row items-center justify-between bg-muted/5">
                  <div>
                    <CardTitle className="text-3xl font-black italic tracking-tighter text-shadow-deep">Görevlerin</CardTitle>
                    <CardDescription className="font-bold opacity-60">Bugün odaklanman gerekenler</CardDescription>
                  </div>
                  <Target className="h-8 w-8 text-accent" />
                </CardHeader>
                <CardContent className="p-10 space-y-6">
                  {pendingTasks.length > 0 ? (
                    pendingTasks.slice(0, 3).map((task) => (
                      <div key={task.id} className="p-8 bg-[#F8FAFC] rounded-[2.5rem] border border-primary/5 flex items-center justify-between group hover:bg-white hover:shadow-2xl transition-all">
                        <div className="space-y-2">
                          <p className="font-black text-xl tracking-tight group-hover:text-primary transition-colors text-shadow-deep">{task.title}</p>
                          <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                             <Clock className="h-4 w-4" /> {formatDate(task.dueDate)}
                          </p>
                        </div>
                        <Button 
                          onClick={() => handleCompleteTask(task.id)}
                          size="icon" 
                          variant="ghost" 
                          className="h-14 w-14 rounded-[1.5rem] bg-white border border-primary/5 text-accent shadow-sm hover:bg-accent hover:text-white transition-all"
                        >
                          <CheckCircle2 className="h-7 w-7" />
                        </Button>
                      </div>
                    ))
                  ) : (
                    <div className="py-20 text-center flex flex-col items-center gap-6 opacity-30">
                      <Award className="h-20 w-20" />
                      <p className="text-xs font-black uppercase tracking-widest">Harika! Tüm görevler bitti.</p>
                    </div>
                  )}
                </CardContent>
             </Card>

             <Card className="rounded-[3.5rem] border-none shadow-[0_40px_80px_-20px_rgba(15,23,42,0.1)] bg-white overflow-hidden">
                <CardHeader className="p-10 border-b border-primary/5 flex flex-row items-center justify-between bg-muted/5">
                  <div>
                    <CardTitle className="text-3xl font-black italic tracking-tighter text-shadow-deep">Görüşmeler</CardTitle>
                    <CardDescription className="font-bold opacity-60">Planlanmış seanslar</CardDescription>
                  </div>
                  <Calendar className="h-8 w-8 text-primary" />
                </CardHeader>
                <CardContent className="p-10 space-y-6">
                  {upcomingSessions.length > 0 ? (
                    upcomingSessions.slice(0, 3).map((session) => (
                      <div key={session.id} className="p-8 bg-[#F8FAFC] rounded-[2.5rem] border border-primary/5 flex items-center justify-between group hover:bg-white hover:shadow-2xl transition-all">
                        <div className="space-y-2">
                          <p className="font-black text-xl tracking-tight text-shadow-deep">{session.notes || 'Haftalık Koçluk'}</p>
                          <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                             <MapPin className="h-4 w-4" /> Online • {formatDate(session.scheduledAt)}
                          </p>
                        </div>
                        <Button className="h-12 px-8 rounded-2xl bg-primary text-white font-black text-[11px] uppercase tracking-widest shadow-xl">Katıl</Button>
                      </div>
                    ))
                  ) : (
                    <div className="py-20 text-center flex flex-col items-center gap-6 opacity-30">
                      <Calendar className="h-20 w-20" />
                      <p className="text-xs font-black uppercase tracking-widest">Planlanmış görüşme yok.</p>
                    </div>
                  )}
                </CardContent>
             </Card>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-10">
           <Card className="rounded-[3.5rem] border-none shadow-[0_60px_100px_-20px_rgba(15,23,42,0.12)] bg-white overflow-hidden p-12 border border-primary/5">
              <div className="text-center space-y-10">
                 <p className="text-[12px] font-black uppercase tracking-[0.4em] text-muted-foreground">Odaklanma Süresi</p>
                 <div className="relative inline-flex items-center justify-center">
                    <svg className="h-56 w-56 -rotate-90">
                      <circle cx="112" cy="112" r="100" fill="none" stroke="#F1F5F9" strokeWidth="12" />
                      <circle cx="112" cy="112" r="100" fill="none" stroke="#F59E0B" strokeWidth="12" strokeDasharray="628" strokeDashoffset={628 - (628 * timer / (25 * 60))} strokeLinecap="round" className="transition-all duration-1000 shadow-2xl" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                       <span className="text-6xl font-black text-primary tracking-tighter tabular-nums text-shadow-deep">{formatTime(timer)}</span>
                    </div>
                 </div>
                 <div className="flex gap-4">
                    <Button 
                      onClick={() => setIsActive(!isActive)}
                      className={`flex-1 h-20 rounded-[2rem] font-black uppercase tracking-widest text-sm transition-all shadow-2xl ${isActive ? 'bg-destructive shadow-destructive/20' : 'bg-primary shadow-primary/20'}`}
                    >
                      {isActive ? 'Durdur' : 'Başlat'} <Play className="ml-2 h-5 w-5" />
                    </Button>
                 </div>
              </div>
           </Card>

           <Card className="rounded-[3.5rem] border-none shadow-[0_60px_100px_-20px_rgba(15,23,42,0.12)] bg-white overflow-hidden p-12 border border-primary/5">
              <div className="space-y-10">
                <div className="flex items-center justify-between">
                  <h4 className="text-2xl font-black italic tracking-tighter text-shadow-deep">Başarıların</h4>
                  <Award className="h-8 w-8 text-accent" />
                </div>
                <div className="grid grid-cols-3 gap-6">
                   {[1, 2, 3, 4, 5, 6].map(i => (
                     <div key={i} className={`h-20 w-20 rounded-3xl flex items-center justify-center transition-all cursor-pointer border-2 ${i <= 3 ? 'bg-accent/10 border-accent/20 text-accent shadow-lg' : 'bg-[#F8FAFC] border-primary/5 text-muted-foreground grayscale opacity-20'}`}>
                        <Star className={`h-10 w-10 ${i <= 3 ? 'fill-current' : ''}`} />
                     </div>
                   ))}
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-center opacity-40 italic">Bir sonraki rozet için 3 görev kaldı!</p>
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
}
