'use client';

import { useUser, useDoc, useAuth } from '@/firebase';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  LayoutDashboard, Calendar, BookOpen, BarChart3, 
  Trophy, Link as LinkIcon, Award, Clock, Users, 
  Brain, Settings, LogOut, Sparkles, Menu, X, Loader2, UserCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { StudentView } from '@/components/dashboard/student-view';
import { TeacherView } from '@/components/dashboard/teacher-view';
import { SchoolAdminView } from '@/components/dashboard/school-admin-view';
import { AdminView } from '@/components/dashboard/admin-view';
import { signOut } from 'firebase/auth';

export default function DashboardPage() {
  const { user, loading: authLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const { data: userData, loading: docLoading } = useDoc<any>(user?.uid ? `users/${user.uid}` : null);
  
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!docLoading && user && userData) {
      if (userData.role === 'student' && !userData.targetExam) {
        router.replace('/dashboard/select-exam');
      }
    }
  }, [userData, docLoading, user, router]);

  if (authLoading || (user && docLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-6">
          <Loader2 className="h-10 w-10 animate-spin text-accent" />
          <p className="text-xs font-black uppercase tracking-[0.4em] text-primary/40 italic">Terminal Senkronize Ediliyor...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  if (!userData && !docLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] py-20 px-6 flex items-center justify-center">
        <div className="max-w-md w-full text-center space-y-10">
           <UserCircle className="h-24 w-24 text-accent mx-auto" />
           <h2 className="text-2xl font-black text-primary uppercase italic">PROFİL EKSİK</h2>
           <p className="text-muted-foreground font-medium italic">Sistemde size ait akademik profil bulunamadı.</p>
           <Button onClick={() => auth && signOut(auth)} className="w-full h-16 rounded-2xl bg-primary text-white font-black">GÜVENLİ ÇIKIŞ YAP</Button>
        </div>
      </div>
    );
  }

  const navItems = [
    { id: 'dashboard', label: 'Anasayfa', icon: LayoutDashboard, path: '/dashboard' },
    { id: 'planning', label: 'Planlama', icon: Calendar, path: '/dashboard/planning' },
    { id: 'topics', label: 'Konu Takibi', icon: BookOpen, path: '/dashboard/topics' },
    { id: 'test-analysis', label: 'Test Analizi', icon: BarChart3, path: '/dashboard/test-analysis' },
    { id: 'deneme-analysis', label: 'Deneme Analizi', icon: Trophy, path: '/dashboard/deneme-analysis' },
    { id: 'links', label: 'Kaynaklar', icon: LinkIcon, path: '/dashboard/links' },
    { id: 'awards', label: 'Ödüller', icon: Award, path: '/dashboard/awards' },
    { id: 'pomodoro', label: 'Pomodoro', icon: Clock, path: '/dashboard/pomodoro' },
    { id: 'ai-assistant', label: 'AI Asistan', icon: Brain, path: '/dashboard/ai-analysis' },
    { id: 'discover', label: 'Uzman Keşfet', icon: Users, path: '/dashboard/discover' },
    { id: 'settings', label: 'Ayarlar', icon: Settings, path: '/dashboard/settings' },
  ];

  const renderView = () => {
    switch (userData?.role) {
      case 'student': return <StudentView user={user} userData={userData} />;
      case 'teacher': return <TeacherView user={user} userData={userData} />;
      case 'school_admin': return <SchoolAdminView user={user} userData={userData} />;
      case 'admin': return <AdminView user={user} userData={userData} />;
      default: return <StudentView user={user} userData={userData} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row relative">
      <header className="md:hidden h-20 bg-white border-b border-slate-100 flex items-center justify-between px-6 sticky top-0 z-[60]">
        <div className="text-xl font-black italic tracking-tighter text-primary uppercase">DEK <span className="text-accent">AI</span></div>
        <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)} className="rounded-xl h-12 w-12 bg-slate-50">
          {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </header>

      {sidebarOpen && <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[55] md:hidden" onClick={() => setSidebarOpen(false)} />}

      <aside className={cn("w-[280px] bg-white border-r border-slate-100 flex flex-col fixed md:sticky inset-y-0 left-0 z-[58] transition-transform duration-500 md:translate-x-0 h-screen", sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0")}>
        <div className="p-8 border-b border-slate-50 hidden md:block">
          <div className="text-2xl font-black italic tracking-tighter text-primary uppercase leading-none">DEK <span className="text-accent">AI</span></div>
        </div>
        <ScrollArea className="flex-1 p-6">
          <nav className="space-y-2">
            {navItems.map((item) => (
              <button key={item.id} onClick={() => { router.push(item.path); setSidebarOpen(false); }} className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-black text-[11px] uppercase tracking-widest text-muted-foreground hover:bg-slate-50 hover:text-primary">
                <item.icon className="h-5 w-5 text-slate-300" /> {item.label}
              </button>
            ))}
          </nav>
        </ScrollArea>
        <div className="p-8 border-t border-slate-50 space-y-4">
          <Button variant="ghost" onClick={() => auth && signOut(auth)} className="w-full justify-start gap-4 px-6 h-12 rounded-xl text-destructive font-black text-[10px] uppercase tracking-widest hover:bg-destructive/5">
             <LogOut className="h-4 w-4" /> Çıkış Yap
          </Button>
        </div>
      </aside>

      <main className="flex-1 min-w-0">{renderView()}</main>
    </div>
  );
}