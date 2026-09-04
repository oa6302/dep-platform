
'use client';

import { useUser, useDoc, useAuth } from '@/firebase';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  LayoutDashboard, Calendar, BookOpen, BarChart3, 
  Trophy, Link as LinkIcon, Award, Clock, Users, 
  Brain, Settings, Menu, X, Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect, Suspense } from 'react';
import { StudentView } from '@/components/dashboard/student-view';

function DashboardContent() {
  const { user } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const simulateUid = searchParams.get('simulate');
  
  const targetUid = simulateUid || user?.uid;
  const { data: userData, loading: docLoading } = useDoc<any>(targetUid ? `users/${targetUid}` : null);
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // OTONOM YÖNLENDİRME: Profil yoksa otomatik YKS TM kurulumuna gönder
  useEffect(() => {
    if (mounted && !docLoading && !userData && !simulateUid) {
      router.replace('/dashboard/select-exam');
    }
  }, [userData, docLoading, mounted, router, simulateUid]);

  if (!mounted) return null;

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
  ];

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
              <button 
                key={item.id} 
                onClick={() => { router.push(item.path); setSidebarOpen(false); }} 
                className={cn(
                  "w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-black text-[11px] uppercase tracking-widest text-left group",
                  pathname === item.path 
                    ? "bg-primary text-white shadow-xl shadow-primary/20" 
                    : "text-muted-foreground hover:bg-slate-50 hover:text-primary"
                )}
              >
                <item.icon className={cn("h-5 w-5", pathname === item.path ? "text-accent" : "text-slate-300 group-hover:text-primary")} /> {item.label}
              </button>
            ))}
          </nav>
        </ScrollArea>
      </aside>

      <main className="flex-1 min-w-0">
        <StudentView user={user} userData={userData || { role: 'student', targetExam: 'YKS_EA' }} />
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]"><Loader2 className="h-10 w-10 animate-spin text-accent" /></div>}>
      <DashboardContent />
    </Suspense>
  );
}
