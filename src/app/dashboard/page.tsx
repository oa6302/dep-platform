
'use client';

import { useUser, useDoc, useFirestore } from '@/firebase';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  LayoutDashboard, Calendar, BookOpen, BarChart3, 
  Trophy, Link as LinkIcon, Award, Clock, Users, 
  Brain, Settings, LogOut, Sparkles, ChevronRight, Zap,
  Menu, X, Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { StudentView } from '@/components/dashboard/student-view';
import { TeacherView } from '@/components/dashboard/teacher-view';
import { SchoolAdminView } from '@/components/dashboard/school-admin-view';
import { AdminView } from '@/components/dashboard/admin-view';
import { AuthForm } from '@/components/auth-form';

export default function DashboardPage() {
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { data: userData, loading: docLoading } = useDoc<any>(user?.uid ? `users/${user.uid}` : null);
  
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  if (authLoading || (user && docLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-6">
          <Loader2 className="h-10 w-10 animate-spin text-accent" />
          <p className="text-xs font-black uppercase tracking-[0.4em] text-primary/40 italic">Bağlantı Kuruluyor...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] py-20 px-6 flex items-center justify-center">
        <AuthForm mode="login" />
      </div>
    );
  }

  // If user is logged in but has no profile data (shouldn't happen with our new form, but for safety)
  if (!userData) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] py-20 px-6 flex items-center justify-center">
        <AuthForm mode="register" isProfileCompletion />
      </div>
    );
  }

  const renderView = () => {
    switch (userData.role) {
      case 'student': return <StudentView user={user} userData={userData} />;
      case 'teacher': return <TeacherView user={user} userData={userData} />;
      case 'school_admin': return <SchoolAdminView user={user} userData={userData} />;
      case 'admin': return <AdminView user={user} userData={userData} />;
      default: return <StudentView user={user} userData={userData} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row relative">
      {/* Mobile Header */}
      <header className="md:hidden h-20 bg-white border-b border-slate-100 flex items-center justify-between px-6 sticky top-0 z-[60]">
        <div className="text-xl font-black italic tracking-tighter text-primary uppercase leading-none">
          YKS TM <span className="text-accent">PRO</span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)} className="rounded-xl h-12 w-12 bg-slate-50">
          {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </header>

      {/* Sidebar Overlay (Mobile) */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[55] md:hidden transition-all animate-in fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "w-[280px] bg-white border-r border-slate-100 flex flex-col fixed md:sticky inset-y-0 left-0 z-[58] transition-transform duration-500 ease-spring md:translate-x-0 h-screen",
        sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="p-8 border-b border-slate-50 hidden md:block">
          <div className="text-2xl font-black italic tracking-tighter text-primary uppercase leading-none">
            YKS TM <span className="text-accent">PRO</span>
            <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em] mt-1 italic not-italic">Premium Terminal</span>
          </div>
        </div>
        
        <ScrollArea className="flex-1 p-6">
          <nav className="space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  router.push(item.path);
                  setSidebarOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-black text-[11px] uppercase tracking-widest group",
                  item.path === '/dashboard' ? "bg-primary text-white shadow-xl shadow-primary/20" : "text-muted-foreground hover:bg-slate-50 hover:text-primary"
                )}
              >
                <item.icon className={cn("h-5 w-5", item.path === '/dashboard' ? "text-accent" : "text-slate-300 group-hover:text-primary")} />
                {item.label}
              </button>
            ))}
          </nav>
        </ScrollArea>

        <div className="p-8 border-t border-slate-50">
          <div className="flex items-center gap-4 px-4 py-3 bg-slate-50 rounded-2xl">
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-white font-black italic">
              {userData?.displayName?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="font-black text-[11px] uppercase truncate">{userData?.displayName || 'Kullanıcı'}</p>
              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{userData.role?.toUpperCase() || 'ÖĞRENCİ'}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        {renderView()}
      </main>
    </div>
  );
}
