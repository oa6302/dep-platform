'use client';

import { useUser, useDoc, useFirestore } from '@/firebase';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  LayoutDashboard, Calendar, BookOpen, BarChart3, 
  Trophy, Link as LinkIcon, Award, Clock, Users, 
  Brain, Settings, LogOut, Sparkles, ChevronRight, Zap,
  Play, RotateCcw, CheckCircle2, AlertTriangle, TrendingUp,
  FastForward, History
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { YKS_TM_TOPICS } from '@/lib/curriculum-data';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';

export default function DashboardPage() {
  const { user } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { data: userData } = useDoc<any>(user?.uid ? `users/${user.uid}` : null);
  const { data: studyPlan } = useDoc<any>(user?.uid ? `studyPlans/${user.uid}` : null);

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const todayPlan = useMemo(() => {
    return (studyPlan?.masterPlan || []).find((p: any) => p.date === todayStr);
  }, [studyPlan, todayStr]);

  const stats = useMemo(() => {
    const totalTopics = Object.values(YKS_TM_TOPICS).reduce((acc, curr) => acc + curr.length, 0);
    const doneTopics = Object.values(userData?.completedTopics || {}).reduce((acc: number, curr: any) => acc + (curr.length || 0), 0);
    const completionRate = Math.round((doneTopics / totalTopics) * 100);
    
    return {
      hours: studyPlan?.stats?.totalHours || 0,
      doneTopics,
      totalTopics,
      completionRate,
      questions: studyPlan?.stats?.totalQuestions || 0,
      tests: studyPlan?.stats?.totalTests || 0,
      dailySuccess: 84 // Örnek veri
    };
  }, [userData, studyPlan]);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { id: 'planning', label: 'Planlama', icon: Calendar, path: '/dashboard/planning' },
    { id: 'topics', label: 'Konu Takibi', icon: BookOpen, path: '/dashboard/topics' },
    { id: 'test-analysis', label: 'Test Analizi', icon: BarChart3, path: '/dashboard/test-analysis' },
    { id: 'deneme-analysis', label: 'Deneme Analizi', icon: Trophy, path: '/dashboard/deneme-analysis' },
    { id: 'links', label: 'Kaynaklar', icon: LinkIcon, path: '/dashboard/links' },
    { id: 'awards', label: 'Ödüller', icon: Award, path: '/dashboard/awards' },
    { id: 'pomodoro', label: 'Pomodoro', icon: Clock, path: '/dashboard/pomodoro' },
    { id: 'ai-assistant', label: 'AI Asistan', icon: Brain, path: '/dashboard/ai-analysis' },
    { id: 'settings', label: 'Ayarlar', icon: Settings, path: '/dashboard/settings' },
  ];

  const handleTaskAction = async (taskId: string, action: 'done' | 'repeat' | 'postpone') => {
    if (!db || !user || !studyPlan) return;
    const newPlan = studyPlan.masterPlan.map((day: any) => {
      if (day.date === todayStr) {
        return {
          ...day,
          tasks: day.tasks.map((t: any) => {
            if (t.id === taskId) {
              if (action === 'done') return { ...t, status: 'done' };
              if (action === 'repeat') return { ...t, status: 'repeat' };
              return t;
            }
            return t;
          })
        };
      }
      return day;
    });

    await updateDoc(doc(db, 'studyPlans', user.uid), { 
      masterPlan: newPlan,
      updatedAt: serverTimestamp()
    });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      {/* Sidebar */}
      <aside className="w-[280px] bg-white border-r border-slate-100 flex flex-col fixed inset-y-0 left-0 z-50">
        <div className="p-8 border-b border-slate-50">
          <div className="text-2xl font-black italic tracking-tighter text-primary uppercase leading-none">
            YKS TM <span className="text-accent">PRO</span>
            <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em] mt-1 italic not-italic">Premium Terminal</span>
          </div>
        </div>
        <nav className="flex-1 p-6 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => router.push(item.path)}
              className={cn(
                "w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-black text-[11px] uppercase tracking-widest group",
                router.pathname === item.path ? "bg-primary text-white shadow-xl shadow-primary/20" : "text-muted-foreground hover:bg-slate-50 hover:text-primary"
              )}
            >
              <item.icon className={cn("h-5 w-5", router.pathname === item.path ? "text-accent" : "text-slate-300 group-hover:text-primary")} />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-8 border-t border-slate-50">
          <div className="flex items-center gap-4 px-4 py-3 bg-slate-50 rounded-2xl">
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-white font-black italic">
              {userData?.displayName?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="font-black text-[11px] uppercase truncate">{userData?.displayName || 'Kullanıcı'}</p>
              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">TM Öğrencisi</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-[280px] flex-1 p-12 lg:p-20">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-accent text-primary font-black text-[10px] uppercase tracking-widest shadow-xl shadow-accent/20">
              <Sparkles className="h-3 w-3" /> Canlı Senkronizasyon Aktif
            </div>
            <h1 className="text-6xl font-black tracking-tighter italic text-primary uppercase leading-none">
              Akademik Üs
            </h1>
          </div>
          <div className="flex items-center gap-4">
             <Button variant="outline" onClick={() => router.push('/dashboard/ai-analysis')} className="h-14 px-8 rounded-2xl border-primary/5 font-black text-[11px] uppercase tracking-widest gap-3 shadow-sm bg-white">
                <Brain className="h-5 w-5 text-accent" /> AI Koç'a Sor
             </Button>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
           <Card className="p-10 rounded-[3rem] border-none shadow-xl bg-white flex flex-col items-center justify-center text-center group hover:-translate-y-2 transition-all">
              <div className="h-16 w-16 rounded-[1.75rem] bg-slate-50 flex items-center justify-center mb-6 shadow-inner group-hover:rotate-6 transition-all">
                 <Clock className="h-8 w-8 text-blue-500" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground italic mb-1">Toplam Çalışma</p>
              <p className="text-4xl font-black text-primary tracking-tighter italic">{stats.hours} Saat</p>
           </Card>
           <Card className="p-10 rounded-[3rem] border-none shadow-xl bg-white flex flex-col items-center justify-center text-center group hover:-translate-y-2 transition-all">
              <div className="h-16 w-16 rounded-[1.75rem] bg-slate-50 flex items-center justify-center mb-6 shadow-inner group-hover:rotate-6 transition-all">
                 <BookOpen className="h-8 w-8 text-emerald-500" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground italic mb-1">Konu İlerleme</p>
              <p className="text-4xl font-black text-primary tracking-tighter italic">%{stats.completionRate}</p>
           </Card>
           <Card className="p-10 rounded-[3rem] border-none shadow-xl bg-white flex flex-col items-center justify-center text-center group hover:-translate-y-2 transition-all">
              <div className="h-16 w-16 rounded-[1.75rem] bg-slate-50 flex items-center justify-center mb-6 shadow-inner group-hover:rotate-6 transition-all">
                 <Zap className="h-8 w-8 text-accent" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground italic mb-1">Toplam Soru</p>
              <p className="text-4xl font-black text-primary tracking-tighter italic">{stats.questions}</p>
           </Card>
           <Card className="p-10 rounded-[3rem] border-none shadow-xl bg-white flex flex-col items-center justify-center text-center group hover:-translate-y-2 transition-all">
              <div className="h-16 w-16 rounded-[1.75rem] bg-slate-50 flex items-center justify-center mb-6 shadow-inner group-hover:rotate-6 transition-all">
                 <TrendingUp className="h-8 w-8 text-indigo-500" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground italic mb-1">Günlük Başarı</p>
              <p className="text-4xl font-black text-primary tracking-tighter italic">%{stats.dailySuccess}</p>
           </Card>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
          {/* Tasks Column */}
          <div className="xl:col-span-8 space-y-10">
            <div className="flex justify-between items-center px-4">
              <h2 className="text-3xl font-black italic tracking-tighter text-primary uppercase">Bugünkü Fasikül Akışı</h2>
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-40">{format(new Date(), 'd MMMM yyyy', { locale: tr })}</span>
            </div>
            <div className="space-y-4">
              {todayPlan?.tasks?.length > 0 ? todayPlan.tasks.map((task: any, i: number) => (
                <Card key={task.id} className={cn(
                  "p-8 rounded-[2.5rem] border border-transparent transition-all group",
                  task.status === 'done' ? "bg-emerald-50/50 opacity-60" : "bg-white shadow-xl hover:border-accent/20"
                )}>
                   <div className="flex flex-col md:flex-row items-center gap-8">
                      <div className={cn(
                        "h-16 w-16 rounded-2xl flex items-center justify-center font-black italic shrink-0 shadow-lg",
                        task.status === 'done' ? "bg-emerald-500 text-white" : "bg-primary text-white"
                      )}>
                        {task.status === 'done' ? <CheckCircle2 className="h-8 w-8" /> : (i + 1)}
                      </div>
                      <div className="flex-1 text-center md:text-left">
                         <div className="flex items-center justify-center md:justify-start gap-3 mb-1">
                            <h4 className="font-black text-2xl italic tracking-tight text-primary uppercase leading-none">{task.lesson}</h4>
                            <span className="text-[9px] font-black uppercase bg-slate-100 px-2 py-0.5 rounded-full text-muted-foreground">{task.type}</span>
                         </div>
                         <p className="text-sm font-bold text-muted-foreground italic uppercase tracking-widest opacity-60">{task.topic}</p>
                      </div>
                      <div className="flex flex-wrap justify-center gap-2 md:justify-end">
                         {task.status !== 'done' ? (
                           <>
                              <Button size="sm" onClick={() => handleTaskAction(task.id, 'done')} className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black text-[9px] uppercase tracking-widest h-10 px-4">Tamamlandı</Button>
                              <Button size="sm" variant="secondary" className="rounded-xl font-black text-[9px] uppercase tracking-widest h-10 px-4">Başla</Button>
                              <Button size="sm" variant="ghost" onClick={() => handleTaskAction(task.id, 'repeat')} className="rounded-xl font-black text-[9px] uppercase tracking-widest h-10 px-4 text-accent"><RotateCcw className="h-3 w-3 mr-2" /> Tekrar Et</Button>
                              <Button size="sm" variant="ghost" className="rounded-xl font-black text-[9px] uppercase tracking-widest h-10 px-4 text-muted-foreground"><FastForward className="h-3 w-3 mr-2" /> Ertele</Button>
                           </>
                         ) : (
                           <span className="text-[10px] font-black uppercase text-emerald-600 italic">✓ Tamamlandı</span>
                         )}
                      </div>
                   </div>
                </Card>
              )) : (
                <div className="py-20 text-center space-y-6">
                   <p className="text-xl font-black uppercase tracking-[0.3em] text-primary/20 italic">Planlanmış görev bulunmuyor.</p>
                   <Button onClick={() => router.push('/dashboard/planning')} className="bg-accent text-primary font-black rounded-2xl h-16 px-12 uppercase tracking-widest shadow-2xl shadow-accent/20 hover:scale-105 transition-all">Akademik Plan Oluştur</Button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="xl:col-span-4 space-y-10">
             <Card className="rounded-[3.5rem] border-none shadow-xl bg-primary text-white p-10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 blur-[60px] rounded-full translate-x-1/2 -translate-y-1/2" />
                <Brain className="h-10 w-10 text-accent mb-6 animate-pulse" />
                <h3 className="text-2xl font-black italic tracking-tighter uppercase mb-4 text-shadow-deep">AI Analiz Motoru</h3>
                <p className="text-sm leading-relaxed font-medium opacity-70 italic mb-8">
                  Haftalık Edebiyat netlerin %18 artış gösterdi. Ancak "Matematik/Problemler" konusunda kritik seviyedesin. Bugün bu konuya 45 dakika ayırman önerilir.
                </p>
                <Button onClick={() => router.push('/dashboard/ai-analysis')} className="w-full h-14 rounded-2xl bg-accent text-primary font-black text-[10px] uppercase tracking-widest shadow-2xl">Detaylı Analiz Al</Button>
             </Card>

             <Card className="rounded-[3.5rem] border-none shadow-xl bg-white p-10 space-y-8">
                <div className="flex items-center justify-between">
                   <h3 className="text-xl font-black italic tracking-tighter text-primary uppercase leading-none">Net Gelişimi</h3>
                   <TrendingUp className="h-5 w-5 text-accent" />
                </div>
                <div className="space-y-6">
                   <div>
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">
                         <span>TYT Hedefi (90 Net)</span>
                         <span>%72</span>
                      </div>
                      <Progress value={72} className="h-2 bg-slate-50" />
                   </div>
                   <div>
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">
                         <span>AYT Hedefi (70 Net)</span>
                         <span>%45</span>
                      </div>
                      <Progress value={45} className="h-2 bg-slate-50" />
                   </div>
                </div>
             </Card>

             <Card className="rounded-[3.5rem] border-none shadow-xl bg-white p-10 space-y-8">
                <div className="flex items-center justify-between">
                   <h3 className="text-xl font-black italic tracking-tighter text-primary uppercase leading-none">Kritik Konular</h3>
                   <AlertTriangle className="h-5 w-5 text-destructive" />
                </div>
                <div className="space-y-3">
                   {['Paragraf', 'Yaş Problemleri', 'Osmanlı Kuruluş'].map((konu, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-white hover:shadow-lg transition-all cursor-pointer group">
                         <span className="font-bold text-xs uppercase tracking-tight text-primary">{konu}</span>
                         <span className="text-[9px] font-black uppercase text-destructive opacity-0 group-hover:opacity-100 transition-opacity italic">Tekrar Bekliyor</span>
                      </div>
                   ))}
                </div>
             </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
