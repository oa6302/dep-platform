
'use client';

import { useUser, useDoc, useAuth } from '@/firebase';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { StudentView } from '@/components/dashboard/student-view';
import { TeacherView } from '@/components/dashboard/teacher-view';
import { AdminView } from '@/components/dashboard/admin-view';
import { LogOut, LayoutDashboard, Calendar, CheckCircle2, User, Settings, Bell, Eye, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { signOut } from 'firebase/auth';
import Link from 'next/link';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function DashboardPage() {
  const { user, loading: authLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const simulatedUserId = searchParams.get('simulate');

  const logoUrl = PlaceHolderImages.find(img => img.id === 'app-logo')?.imageUrl || "https://picsum.photos/seed/edu-logo-99/400/400";

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
          <p className="text-xs text-primary font-black uppercase tracking-[0.3em] animate-pulse italic">Veriler Yükleniyor...</p>
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
    admin: 'Yönetici'
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
      case 'admin':
        return <AdminView user={user} userData={userData} />;
      default:
        return <div className="p-12 font-black text-destructive text-center uppercase tracking-widest italic">Rolünüz tanımlanırken bir hata oluştu.</div>;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Simulation Banner */}
      {isSimulating && (
        <div className="bg-destructive text-white px-6 py-2 flex items-center justify-between sticky top-0 z-[100] shadow-lg animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-4 text-xs font-black uppercase tracking-widest italic">
            <Eye className="h-4 w-4" />
            SİMÜLASYON MODU: {simulatedUserData?.displayName} hesabını görüntülüyorsunuz.
          </div>
          <Button variant="ghost" size="sm" onClick={stopSimulation} className="text-white hover:bg-white/10 font-black h-8 gap-2 rounded-lg">
            <XCircle className="h-4 w-4" />
            Simülasyondan Çık
          </Button>
        </div>
      )}

      <div className="grid lg:grid-cols-[300px_1fr] min-h-screen">
        <aside className="bg-primary text-white hidden lg:block border-r border-white/5 shadow-2xl z-50">
          <div className="flex flex-col h-full">
            <div className="p-10">
              <Link href="/" className="flex items-center gap-4 group">
                <div className="relative h-12 w-12 overflow-hidden rounded-2xl bg-white p-0.5 shadow-xl transition-transform group-hover:rotate-3">
                  <Image 
                    src={logoUrl} 
                    alt="Logo" 
                    fill 
                    className="object-contain"
                    data-ai-hint="education logo blue gold"
                  />
                </div>
                <div className="overflow-hidden space-y-0.5">
                  <span className="font-black text-2xl block tracking-tighter leading-none italic">DEK</span>
                  <span className="text-[8px] opacity-40 block font-black uppercase tracking-[0.2em]">Eğitim Koçu</span>
                </div>
              </Link>
            </div>
            
            <nav className="flex-1 px-6 space-y-3 mt-4">
              <Button variant="ghost" className="w-full justify-start rounded-[1.25rem] bg-white/10 hover:bg-accent font-black transition-all h-14 group" asChild>
                <Link href="/dashboard">
                  <LayoutDashboard className="mr-4 h-5 w-5 transition-transform group-hover:scale-110" />
                  Panelim
                </Link>
              </Button>
              <Button variant="ghost" className="w-full justify-start rounded-[1.25rem] hover:bg-white/5 font-black transition-all opacity-60 hover:opacity-100 h-14 group">
                <Calendar className="mr-4 h-5 w-5 transition-transform group-hover:scale-110" />
                Görüşmeler
              </Button>
              <Button variant="ghost" className="w-full justify-start rounded-[1.25rem] hover:bg-white/5 font-black transition-all opacity-60 hover:opacity-100 h-14 group">
                <CheckCircle2 className="mr-4 h-5 w-5 transition-transform group-hover:scale-110" />
                Görevler
              </Button>
              <Button variant="ghost" className="w-full justify-start rounded-[1.25rem] hover:bg-white/5 font-black transition-all opacity-60 hover:opacity-100 h-14 group">
                <User className="mr-4 h-5 w-5 transition-transform group-hover:scale-110" />
                Profilim
              </Button>
              <Button variant="ghost" className="w-full justify-start rounded-[1.25rem] hover:bg-white/5 font-black transition-all opacity-60 hover:opacity-100 h-14 group">
                <Settings className="mr-4 h-5 w-5 transition-transform group-hover:scale-110" />
                Ayarlar
              </Button>
            </nav>

            <div className="p-8">
              <div className="flex items-center gap-4 px-5 py-5 bg-white/5 rounded-[2rem] border border-white/10 shadow-2xl">
                <div className="h-12 w-12 rounded-2xl bg-accent flex items-center justify-center text-white font-black shadow-lg shadow-accent/20 text-xl italic">
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

        <main className="flex flex-col relative">
          <header className="h-24 bg-white/70 backdrop-blur-xl border-b border-primary/5 flex items-center justify-between px-10 sticky top-0 z-40">
            <div className="flex items-center gap-6">
              <h1 className="text-xl font-black text-primary uppercase tracking-tighter italic">
                {isSimulating ? 'Öğrenci Görünümü' : `Hoş Geldin, ${userData?.displayName?.split(' ')[0]}`}
              </h1>
            </div>
            <div className="flex items-center gap-6">
              <Button variant="ghost" size="icon" className="relative h-12 w-12 bg-[#F1F5F9] rounded-2xl transition-transform hover:scale-105">
                <Bell className="h-6 w-6 text-primary" />
                {!isSimulating && <span className="absolute top-3 right-3 h-2.5 w-2.5 bg-accent rounded-full border-[3px] border-white animate-pulse"></span>}
              </Button>
              <div className="lg:hidden">
                <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl bg-destructive/5 text-destructive" onClick={handleLogout}>
                  <LogOut className="h-6 w-6" />
                </Button>
              </div>
            </div>
          </header>
          <div className="flex-1 overflow-y-auto">
            {renderView()}
          </div>
        </main>
      </div>
    </div>
  );
}
