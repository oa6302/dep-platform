
'use client';

import { useCollection, useFirestore } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, CheckCircle2, Clock, TrendingUp, Target, Brain, Award, Lock } from 'lucide-react';
import { where, orderBy, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

interface StudentViewProps {
  user: any;
  userData: any;
  isReadOnly?: boolean;
}

export function StudentView({ user, userData, isReadOnly = false }: StudentViewProps) {
  const db = useFirestore();

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

  const formatDate = (date: any) => {
    if (!date) return '';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
  };

  const handleCompleteTask = (taskId: string) => {
    if (isReadOnly || !db) return;

    const taskRef = doc(db, 'tasks', taskId);
    updateDoc(taskRef, {
      status: 'completed',
      updatedAt: serverTimestamp()
    }).catch(async (err) => {
      const permissionError = new FirestorePermissionError({
        path: taskRef.path,
        operation: 'update',
        requestResourceData: { status: 'completed' }
      });
      errorEmitter.emit('permission-error', permissionError);
    });
  };

  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const upcomingSessions = sessions.filter(s => s.status === 'scheduled');

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto w-full">
      {/* Student Welcome Header */}
      <div className="bg-white rounded-[3rem] p-10 shadow-2xl shadow-primary/5 border border-primary/5 flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 blur-[60px] rounded-full transition-all group-hover:scale-150"></div>
        <div className="flex items-center gap-8 relative z-10">
          <div className="h-20 w-20 rounded-[2rem] bg-accent flex items-center justify-center text-white font-black text-3xl italic shadow-2xl shadow-accent/20 rotate-3 transition-transform group-hover:rotate-0">
            {userData?.displayName?.charAt(0) || 'S'}
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-black tracking-tighter italic text-primary">{userData?.displayName}</h2>
            <div className="flex flex-wrap gap-4">
              <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-primary/5 text-primary rounded-lg border border-primary/10">
                {userData?.school || 'Okul Belirtilmedi'}
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-accent/10 text-accent rounded-lg border border-accent/20">
                {userData?.grade || '12. Sınıf'} - {userData?.branch || 'MF'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-6 relative z-10">
          <div className="text-center p-4">
            <p className="text-2xl font-black text-primary tracking-tighter">87%</p>
            <p className="text-[9px] font-black uppercase tracking-widest opacity-40">Tamamlama</p>
          </div>
          <div className="w-px h-12 bg-primary/10 self-center"></div>
          <div className="text-center p-4">
            <p className="text-2xl font-black text-accent tracking-tighter">42</p>
            <p className="text-[9px] font-black uppercase tracking-widest opacity-40">Rozetler</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="rounded-[2.5rem] border-none shadow-xl bg-white overflow-hidden group hover:scale-[1.02] transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center justify-between">
              Bekleyen Görevler
              <CheckCircle2 className="h-4 w-4 text-accent" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-black text-primary">{pendingTasks.length}</p>
            <CardDescription className="font-bold opacity-60">Bugün yapılması gerekenler</CardDescription>
          </CardContent>
        </Card>
        <Card className="rounded-[2.5rem] border-none shadow-xl bg-white overflow-hidden group hover:scale-[1.02] transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center justify-between">
              Sıradaki Görüşme
              <Calendar className="h-4 w-4 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-black text-primary truncate">
              {upcomingSessions.length > 0 
                ? formatDate(upcomingSessions[0].scheduledAt)
                : 'Planlanmış seans yok'}
            </p>
            <CardDescription className="font-bold opacity-60">Koçunuz ile olan seans</CardDescription>
          </CardContent>
        </Card>
        <Card className="rounded-[2.5rem] border-none shadow-xl bg-white overflow-hidden group hover:scale-[1.02] transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center justify-between">
              Haftalık Puan
              <Award className="h-4 w-4 text-accent" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-black text-accent">1,250</p>
            <CardDescription className="font-bold opacity-60">Gelişim seviyeniz</CardDescription>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <Card className="rounded-[3rem] border-none shadow-2xl bg-white overflow-hidden">
          <CardHeader className="p-8 border-b bg-muted/5 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-black italic tracking-tighter">Görüşme Takvimim</CardTitle>
              <CardDescription className="font-bold">Yaklaşan koçluk seanslarınız</CardDescription>
            </div>
            <Button size="sm" variant="outline" className="rounded-xl font-black border-2 text-[10px] uppercase tracking-widest">Tümünü Gör</Button>
          </CardHeader>
          <CardContent className="p-8">
            <div className="space-y-6">
              {upcomingSessions.length > 0 ? (
                upcomingSessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-6 bg-muted/20 rounded-[2rem] border border-muted/30 group hover:bg-white transition-all hover:shadow-lg">
                    <div className="flex items-center gap-6">
                      <div className="h-14 w-14 rounded-2xl bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                        <Calendar className="h-6 w-6 text-accent" />
                      </div>
                      <div>
                        <p className="font-black text-lg tracking-tight">{session.notes || 'Haftalık Değerlendirme'}</p>
                        <p className="text-xs font-bold text-muted-foreground flex items-center gap-2 uppercase tracking-widest">
                          <Clock className="h-3.5 w-3.5" />
                          {formatDate(session.scheduledAt)}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" className="rounded-xl h-10 px-6 font-black text-[10px] uppercase tracking-widest text-primary hover:bg-primary hover:text-white transition-all">Katıl</Button>
                  </div>
                ))
              ) : (
                <div className="text-center py-20 text-muted-foreground flex flex-col items-center gap-4 border-2 border-dashed rounded-[2rem] bg-muted/5">
                  <Calendar className="h-16 w-16 opacity-10" />
                  <p className="font-black uppercase tracking-widest text-[10px] opacity-40">Henüz planlanmış bir görüşmeniz bulunmuyor.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[3rem] border-none shadow-2xl bg-white overflow-hidden">
          <CardHeader className="p-8 border-b bg-muted/5 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-black italic tracking-tighter">Haftalık Görevler</CardTitle>
              <CardDescription className="font-bold">Başarı hedefleriniz</CardDescription>
            </div>
            <Button size="sm" variant="outline" className="rounded-xl font-black border-2 text-[10px] uppercase tracking-widest">Arşiv</Button>
          </CardHeader>
          <CardContent className="p-8">
            <div className="space-y-6">
              {pendingTasks.length > 0 ? (
                pendingTasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-6 bg-muted/20 rounded-[2rem] border border-muted/30 group hover:bg-white transition-all hover:shadow-lg">
                    <div className="flex items-center gap-6">
                      <div className={`h-14 w-14 rounded-2xl flex items-center justify-center shadow-sm transition-transform ${isReadOnly ? 'bg-muted opacity-50' : 'bg-white group-hover:scale-110'}`}>
                        {isReadOnly ? <Lock className="h-6 w-6 text-muted-foreground" /> : <CheckCircle2 className="h-6 w-6 text-muted-foreground" />}
                      </div>
                      <div>
                        <p className="font-black text-lg tracking-tight">{task.title}</p>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                          <Clock className="h-3.5 w-3.5" />
                          Son Tarih: {formatDate(task.dueDate)}
                        </p>
                      </div>
                    </div>
                    {!isReadOnly && (
                      <Button onClick={() => handleCompleteTask(task.id)} className="rounded-xl h-10 px-6 font-black text-[10px] uppercase tracking-widest bg-accent hover:bg-primary transition-colors shadow-lg shadow-accent/20">
                        Tamamla
                      </Button>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-20 text-muted-foreground flex flex-col items-center gap-4 border-2 border-dashed rounded-[2rem] bg-muted/5">
                  <Award className="h-16 w-16 opacity-10" />
                  <p className="font-black uppercase tracking-widest text-[10px] opacity-40">Tebrikler! Bekleyen göreviniz bulunmuyor.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Coach Suggestion Bar */}
      <div className="bg-primary rounded-[3rem] p-10 text-white flex flex-col md:flex-row justify-between items-center gap-8 shadow-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 blur-[100px] rounded-full"></div>
        <div className="flex items-center gap-8 relative z-10">
          <div className="h-16 w-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shadow-inner">
            <Brain className="h-8 w-8 text-accent" />
          </div>
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-accent">AI Koç Tavsiyesi</p>
            <p className="text-lg font-black italic tracking-tight leading-relaxed max-w-xl">
              "Matematik-Geometri netlerinde son 3 haftada %12 artış gözlemlendi. Bu hafta Türev konusuna yoğunlaşman kritik."
            </p>
          </div>
        </div>
        <Button className="rounded-[1.5rem] h-14 px-10 font-black text-sm uppercase tracking-widest bg-accent hover:bg-white hover:text-primary transition-all shadow-2xl shadow-accent/30 relative z-10">
          Detaylı Analiz
        </Button>
      </div>
    </div>
  );
}
