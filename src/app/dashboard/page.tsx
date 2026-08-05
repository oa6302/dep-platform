
'use client';

import { useUser, useDoc, useAuth } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { StudentView } from '@/components/dashboard/student-view';
import { TeacherView } from '@/components/dashboard/teacher-view';
import { AdminView } from '@/components/dashboard/admin-view';
import { LogOut, LayoutDashboard, Calendar, CheckCircle2, User, Settings, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { signOut } from 'firebase/auth';
import Link from 'next/link';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function DashboardPage() {
  const { user, loading: authLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();

  const logoUrl = PlaceHolderImages.find(img => img.id === 'app-logo')?.imageUrl || "https://picsum.photos/seed/edu-logo-99/400/400";

  const userDocQuery = user?.uid ? `users/${user.uid}` : null;
  const { data: userData, loading: docLoading } = useDoc<any>(userDocQuery);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  if (authLoading || docLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-accent border-t-transparent shadow-xl" />
          <p className="text-sm text-primary font-bold uppercase tracking-widest animate-pulse">Dijital Eğitim Koçu Hazırlanıyor...</p>
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

  const roleLabels: Record<string, string> = {
    student: 'Öğrenci',
    teacher: 'Öğretmen (Koç)',
    admin: 'Yönetici'
  };

  const renderView = () => {
    switch (userData?.role) {
      case 'student':
        return <StudentView user={user} userData={userData} />;
      case 'teacher':
        return <TeacherView user={user} userData={userData} />;
      case 'admin':
        return <AdminView user={user} userData={userData} />;
      default:
        return <div className="p-8 font-bold text-destructive">Rolünüz tanımlanırken bir hata oluştu. Lütfen destekle iletişime geçin.</div>;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="grid lg:grid-cols-[280px_1fr] min-h-screen">
        <aside className="bg-primary text-white hidden lg:block border-r border-white/5 shadow-2xl z-50">
          <div className="flex flex-col h-full">
            <div className="p-8">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="relative h-10 w-10 overflow-hidden rounded-xl bg-white p-0.5">
                  <Image 
                    src={logoUrl} 
                    alt="Logo" 
                    fill 
                    className="object-contain"
                    data-ai-hint="education logo blue gold"
                  />
                </div>
                <div className="overflow-hidden">
                  <span className="font-black text-xl block tracking-tighter leading-none">DEK</span>
                  <span className="text-[9px] opacity-60 block font-bold uppercase tracking-widest">Dijital Eğitim Koçu</span>
                </div>
              </Link>
            </div>
            
            <nav className="flex-1 px-4 space-y-2 mt-4">
              <Button variant="ghost" className="w-full justify-start rounded-2xl bg-white/10 hover:bg-accent font-bold transition-all" asChild>
                <Link href="/dashboard">
                  <LayoutDashboard className="mr-3 h-5 w-5" />
                  Panelim
                </Link>
              </Button>
              <Button variant="ghost" className="w-full justify-start rounded-2xl hover:bg-accent font-bold transition-all opacity-80 hover:opacity-100">
                <Calendar className="mr-3 h-5 w-5" />
                Görüşmeler
              </Button>
              <Button variant="ghost" className="w-full justify-start rounded-2xl hover:bg-accent font-bold transition-all opacity-80 hover:opacity-100">
                <CheckCircle2 className="mr-3 h-5 w-5" />
                Görevler
              </Button>
              <Button variant="ghost" className="w-full justify-start rounded-2xl hover:bg-accent font-bold transition-all opacity-80 hover:opacity-100">
                <User className="mr-3 h-5 w-5" />
                Profilim
              </Button>
              <Button variant="ghost" className="w-full justify-start rounded-2xl hover:bg-accent font-bold transition-all opacity-80 hover:opacity-100">
                <Settings className="mr-3 h-5 w-5" />
                Ayarlar
              </Button>
            </nav>

            <div className="p-6">
              <div className="flex items-center gap-3 px-4 py-4 bg-white/5 rounded-3xl border border-white/10">
                <div className="h-10 w-10 rounded-2xl bg-accent flex items-center justify-center text-white font-black shadow-lg shadow-accent/20">
                  {userData?.displayName?.charAt(0) || 'U'}
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-bold truncate">{userData?.displayName}</p>
                  <p className="text-[10px] opacity-50 truncate font-bold uppercase">{roleLabels[userData?.role || 'student']}</p>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-destructive rounded-xl transition-colors" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex flex-col">
          <header className="h-20 bg-white/80 backdrop-blur-md border-b flex items-center justify-between px-8 sticky top-0 z-40">
            <div className="flex items-center gap-4">
              <h1 className="text-lg font-black text-primary uppercase tracking-tight">
                Hoş Geldin, <span className="text-accent">{userData?.displayName?.split(' ')[0]}</span>
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="relative h-10 w-10 bg-[#F1F5F9] rounded-2xl">
                <Bell className="h-5 w-5 text-primary" />
                <span className="absolute top-2 right-2 h-2 w-2 bg-accent rounded-full border-2 border-white"></span>
              </Button>
              <div className="lg:hidden">
                <Button variant="ghost" size="icon" className="h-10 w-10" onClick={handleLogout}>
                  <LogOut className="h-5 w-5 text-destructive" />
                </Button>
              </div>
            </div>
          </header>
          <div className="flex-1">
            {renderView()}
          </div>
        </main>
      </div>
    </div>
  );
}
