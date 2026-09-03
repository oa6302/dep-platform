
'use client';

import { useUser, useDoc } from '@/firebase';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, Calendar, BookOpen, BarChart3, 
  Trophy, Link as LinkIcon, Award, Clock, Users, 
  Brain, Settings, LogOut, Sparkles, ChevronRight, Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { YKS_TM_TOPICS } from '@/lib/curriculum-data';

export default function DashboardPage() {
  const { user } = useUser();
  const router = useRouter();
  const { data: userData } = useDoc<any>(user?.uid ? `users/${user.uid}` : null);
  const { data: studyPlan } = useDoc<any>(user?.uid ? `studyPlans/${user.uid}` : null);

  const stats = useMemo(() => {
    const totalTopics = Object.values(YKS_TM_TOPICS).reduce((acc, curr) => acc + curr.length, 0);
    const doneTopics = Object.values(userData?.completedTopics || {}).reduce((acc: number, curr: any) => acc + (curr.length || 0), 0);
    
    return {
      hours: 0,
      doneTopics,
      totalTopics,
      questions: 0,
      tests: 0
    };
  }, [userData]);

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const todayTasks = useMemo(() => {
    return (studyPlan?.masterPlan || []).filter((p: any) => p.date === todayStr);
  }, [studyPlan, todayStr]);

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
              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Öğrenci</p>
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
              Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-4">
             <Button variant="ghost" size="icon" className="h-14 w-14 rounded-2xl bg-white shadow-sm border border-slate-100"><Zap className="h-6 w-6 text-accent" /></Button>
             <Button className="h-14 px-8 rounded-2xl bg-primary text-white font-black text-[11px] uppercase tracking-widest gap-3 shadow-2xl shadow-primary/20">Hızlı Eylem</Button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
           {[
             { label: 'Çalışma Saati', val: stats.hours, icon: Clock, color: 'text-blue-500' },
             { label: 'Konu Bitti', val: `${stats.doneTopics}/${stats.totalTopics}`, icon: BookOpen, color: 'text-emerald-500' },
             { label: 'Toplam Soru', val: stats.questions, icon: Zap, color: 'text-accent' },
             { label: 'Çözülen Test', val: stats.tests, icon: Trophy, color: 'text-indigo-500' },
           ].map((stat, i) => (
             <Card key={i} className="p-10 rounded-[3rem] border-none shadow-xl bg-white flex flex-col items-center justify-center text-center group hover:-translate-y-2 transition-all">
                <div className="h-16 w-16 rounded-[1.75rem] bg-slate-50 flex items-center justify-center mb-6 shadow-inner group-hover:rotate-6 transition-all">
                   <stat.icon className={cn("h-8 w-8", stat.color)} />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground italic mb-1">{stat.label}</p>
                <p className="text-4xl font-black text-primary tracking-tighter italic">{stat.val}</p>
             </Card>
           ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
          <Card className="xl:col-span-8 rounded-[4rem] border-none shadow-xl bg-white p-12 space-y-10">
            <div className="flex justify-between items-center px-4">
              <h2 className="text-3xl font-black italic tracking-tighter text-primary uppercase">Bugünkü Görevler</h2>
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-40">{format(new Date(), 'd MMMM yyyy', { locale: tr })}</span>
            </div>
            <div className="space-y-4">
              {todayTasks.length > 0 ? todayTasks.map((task: any, i: number) => (
                <div key={i} className="flex items-center gap-8 p-8 bg-slate-50 rounded-[2.5rem] border border-transparent hover:bg-white hover:border-accent/20 hover:shadow-2xl transition-all group">
                   <div className="h-12 w-12 rounded-2xl bg-primary text-white flex items-center justify-center font-black italic shrink-0 group-hover:rotate-6 transition-all">{i+1}</div>
                   <div className="flex-1">
                      <h4 className="font-black text-xl italic tracking-tight text-primary uppercase">{task.lesson}</h4>
                      <p className="text-xs font-bold text-muted-foreground italic uppercase tracking-widest opacity-60">{task.topic}</p>
                   </div>
                   <div className="text-right">
                      <p className="text-[10px] font-black uppercase tracking-widest text-accent mb-1">{task.duration} DK</p>
                      <Button size="sm" className="bg-primary text-white rounded-xl font-black text-[9px] uppercase tracking-widest">Başla</Button>
                   </div>
                </div>
              )) : (
                <div className="py-20 text-center space-y-6">
                   <p className="text-xl font-black uppercase tracking-widest text-primary/20 italic">Planlanmış görev bulunmuyor.</p>
                   <Button onClick={() => router.push('/dashboard/planning')} className="bg-accent text-primary font-black rounded-2xl h-14 px-8 uppercase tracking-widest shadow-xl shadow-accent/20">Program Oluştur</Button>
                </div>
              )}
            </div>
          </Card>

          <div className="xl:col-span-4 space-y-10">
             <Card className="rounded-[3.5rem] border-none shadow-xl bg-primary text-white p-10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 blur-[60px] rounded-full translate-x-1/2 -translate-y-1/2" />
                <Brain className="h-10 w-10 text-accent mb-6 animate-pulse" />
                <h3 className="text-2xl font-black italic tracking-tighter uppercase mb-4 text-shadow-deep">AI Analiz Motoru</h3>
                <p className="text-sm leading-relaxed font-medium opacity-70 italic mb-8">Haftalık performansın %14 artış gösterdi. Matematik/Problemler konusuna bugün 30 dakika ayırman kritiktir.</p>
                <Button className="w-full h-14 rounded-2xl bg-accent text-primary font-black text-[10px] uppercase tracking-widest shadow-2xl">Detaylı Analiz Gör</Button>
             </Card>

             <Card className="rounded-[3.5rem] border-none shadow-xl bg-white p-10 space-y-8">
                <h3 className="text-xl font-black italic tracking-tighter text-primary uppercase">Rozetlerin</h3>
                <div className="grid grid-cols-4 gap-4">
                   {['🏆', '📝', '⚡', '📚'].map((emoji, i) => (
                     <div key={i} className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center text-2xl shadow-inner border border-slate-100 hover:scale-110 transition-all cursor-pointer">
                        {emoji}
                     </div>
                   ))}
                </div>
                <div className="space-y-2">
                   <div className="flex justify-between text-[9px] font-black uppercase tracking-widest opacity-40">
                      <span>Seviye 4</span>
                      <span>%72</span>
                   </div>
                   <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-accent transition-all duration-1000" style={{ width: '72%' }} />
                   </div>
                </div>
             </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
