'use client';

import { useUser, useDoc, useAuth } from '@/firebase';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { StudentView } from '@/components/dashboard/student-view';
import { TeacherView } from '@/components/dashboard/teacher-view';
import { AdminView } from '@/components/dashboard/admin-view';
import { SchoolAdminView } from '@/components/dashboard/school-admin-view';
import { LogOut, LayoutDashboard, Calendar, CheckCircle2, User, Settings, Bell, Eye, XCircle, Search, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { signOut } from 'firebase/auth';
import Link from 'next/link';
import Image from 'next/image';
import { Input } from '@/components/ui/input';

export default function DashboardPage() {
  const { user, loading: authLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const simulatedUserId = searchParams.get('simulate');

  const userDocQuery = user?.uid ? `users/${user.uid}` : null;
  const { data: userData, loading: docLoading } = useDoc<any>(userDocQuery);
  
  const { data: simulatedUserData, loading: simLoading } = useDoc<any>(simulatedUserId ? `users/${simulatedUserId}` : null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  if (authLoading || docLoading || (simulatedUserId && simLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-6">
          <div className="h-16 w-16 animate-spin rounded-[2rem] border-[6px] border-accent border-t-transparent shadow-[0_0_40px_rgba(245,158,11,0.2)]" />
          <p className="text-xs text-primary font-black uppercase tracking-[0.3em] animate-pulse italic">Sistem Hazırlanıyor...</p>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
      router.push('/');
    }
  };

  const stopSimulation = () => {
    const params = new URLSearchParams(searchParams);
    params.delete('simulate');
    router.push(`/dashboard?${params.toString()}`);
  };

  const roleLabels: Record<string, string> = {
    student: 'Öğrenci',
    teacher: 'Öğretmen (Koç)',
    school_admin: 'Okul Yönetimi',
    admin: 'Sistem Yöneticisi'
  };

  const currentViewData = simulatedUserData || userData;
  const isSimulating = !!simulatedUserId;

  const renderView = () => {
    const role = currentViewData?.role;
    switch (role) {
      case 'student':
        return <StudentView user={{ uid: currentViewData.uid }} userData={currentViewData} isReadOnly={isSimulating} />;
      case 'teacher':
        return <TeacherView user={user} userData={userData} />;
      case 'school_admin':
        return <SchoolAdminView user={user} userData={userData} />;
      case 'admin':
        return <AdminView user={user} userData={userData} />;
      default:
        return <div className="p-12 font-black text-destructive text-center uppercase tracking-widest italic">Yetkilendirme Hatası.</div>;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] selection:bg-accent selection:text-white">
      {/* Simulation Banner */}
      {isSimulating && (
        <div className="bg-destructive text-white px-6 py-3 flex items-center justify-between sticky top-0 z-[100] shadow-xl animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-4 text-xs font-black uppercase tracking-widest italic">
            <Eye className="h-4 w-4" />
            SİMÜLASYON MODU: {simulatedUserData?.displayName} hesabını görüntülüyorsunuz.
          </div>
          <Button variant="ghost" size="sm" onClick={stopSimulation} className="text-white hover:bg-white/10 font-black h-9 gap-2 rounded-xl border border-white/20 px-6">
            <XCircle className="h-4 w-4" />
            Simülasyondan Çık
          </Button>
        </div>
      )}

      <div className="grid lg:grid-cols-[300px_1fr] min-h-screen">
        {/* Sidebar */}
        <aside className="bg-primary text-white hidden lg:block border-r border-white/5 shadow-2xl z-50 overflow-y-auto sticky top-0 h-screen">
          <div className="flex flex-col h-full">
            <div className="p-10">
              <Link href="/" className="flex items-center gap-4 group">
                <div className="relative h-14 w-14 overflow-hidden rounded-2xl bg-white p-1 shadow-2xl transition-all group-hover:rotate-3 group-hover:scale-105">
                  <Image 
                    src="/logo.png" 
                    alt="Logo" 
                    fill 
                    className="object-contain"
                  />
                </div>
                <div className="overflow-hidden">
                  <span className="font-black text-2xl block tracking-tighter leading-none italic">DEK</span>
                  <span className="text-[8px] opacity-40 block font-black uppercase tracking-[0.2em] mt-1">Dijital Eğitim Koçu</span>
                </div>
              </Link>
            </div>
            
            <nav className="flex-1 px-6 space-y-2 mt-4">
              <Button variant="ghost" className="w-full justify-start rounded-2xl bg-white/10 hover:bg-accent font-black transition-all h-14 group" asChild>
                <Link href="/dashboard">
                  <LayoutDashboard className="mr-4 h-5 w-5 transition-transform group-hover:scale-110" />
                  Panelim
                </Link>
              </Button>
              <Button variant="ghost" className="w-full justify-start rounded-2xl hover:bg-white/5 font-black transition-all opacity-60 hover:opacity-100 h-14 group" asChild>
                <Link href="/dashboard/ai-analysis">
                  <Brain className="mr-4 h-5 w-5 transition-transform group-hover:scale-110 text-accent" />
                  AI Asistanım
                </Link>
              </Button>
              <Button variant="ghost" className="w-full justify-start rounded-2xl hover:bg-white/5 font-black transition-all opacity-60 hover:opacity-100 h-14 group">
                <Calendar className="mr-4 h-5 w-5 transition-transform group-hover:scale-110" />
                Takvim
              </Button>
              <Button variant="ghost" className="w-full justify-start rounded-2xl hover:bg-white/5 font-black transition-all opacity-60 hover:opacity-100 h-14 group">
                <CheckCircle2 className="mr-4 h-5 w-5 transition-transform group-hover:scale-110" />
                Görevlerim
              </Button>
              <Button variant="ghost" className="w-full justify-start rounded-2xl hover:bg-white/5 font-black transition-all opacity-60 hover:opacity-100 h-14 group">
                <User className="mr-4 h-5 w-5 transition-transform group-hover:scale-110" />
                Profilim
              </Button>
              <Button variant="ghost" className="w-full justify-start rounded-2xl hover:bg-white/5 font-black transition-all opacity-60 hover:opacity-100 h-14 group">
                <Settings className="mr-4 h-5 w-5 transition-transform group-hover:scale-110" />
                Sistem Ayarları
              </Button>
            </nav>

            <div className="p-8 mt-auto">
              <div className="flex items-center gap-4 px-5 py-5 bg-white/5 rounded-[2rem] border border-white/10 shadow-2xl">
                <div className="h-12 w-12 rounded-2xl bg-accent flex items-center justify-center text-white font-black shadow-lg shadow-accent/20 text-xl italic border border-white/10">
                  {userData?.displayName?.charAt(0) || 'U'}
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-black truncate tracking-tight">{userData?.displayName}</p>
                  <p className="text-[9px] opacity-40 truncate font-black uppercase tracking-widest">{roleLabels[userData?.role || 'student']}</p>
                </div>
                <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-destructive rounded-xl transition-all" onClick={handleLogout}>
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex flex-col relative">
          <header className="h-28 bg-white/70 backdrop-blur-2xl border-b border-primary/5 flex items-center justify-between px-10 sticky top-0 z-40">
            <div className="flex items-center gap-10 flex-1 max-w-2xl">
              <h1 className="text-2xl font-black text-primary uppercase tracking-tighter italic shrink-0">
                {isSimulating ? 'Öğrenci Paneli' : roleLabels[userData?.role] || 'Panel'}
              </h1>
              <div className="relative w-full hidden md:block">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Hızlı arama: Öğrenci, ders, görev..." 
                  className="pl-11 h-12 rounded-2xl bg-[#F1F5F9]/50 border-none shadow-inner focus-visible:ring-accent font-medium text-sm"
                />
              </div>
            </div>
            <div className="flex items-center gap-6">
              <Button variant="ghost" size="icon" className="relative h-12 w-12 bg-[#F1F5F9] rounded-2xl transition-transform hover:scale-105 shadow-sm">
                <Bell className="h-6 w-6 text-primary" />
                {!isSimulating && <span className="absolute top-3 right-3 h-3 w-3 bg-accent rounded-full border-[3px] border-white animate-pulse"></span>}
              </Button>
              <div className="lg:hidden">
                <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl bg-destructive/5 text-destructive" onClick={handleLogout}>
                  <LogOut className="h-6 w-6" />
                </Button>
              </div>
            </div>
          </header>
          
          <div className="flex-1 overflow-y-auto">
            {/* 
              This part is tricky because the dashboard/page.tsx renders view components.
              I will add a check if we are on the AI subpage in a real app, 
              but for this prototype, the renderView handles the root dashboard.
              The subpages like /ai-analysis are handled by Next.js routing.
            */}
            {renderView()}
          </div>
        </main>
      </div>
    </div>
  );
}
