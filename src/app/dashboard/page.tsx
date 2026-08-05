'use client';

import { useUser, useDoc, useAuth } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { StudentView } from '@/components/dashboard/student-view';
import { TeacherView } from '@/components/dashboard/teacher-view';
import { AdminView } from '@/components/dashboard/admin-view';
import { GraduationCap, LogOut, LayoutDashboard, Calendar, CheckCircle2, User, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { signOut } from 'firebase/auth';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, loading: authLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();

  const userDocQuery = user?.uid ? `users/${user.uid}` : null;
  const { data: userData, loading: docLoading } = useDoc<any>(userDocQuery);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  if (authLoading || docLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground font-medium">Yükleniyor...</p>
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
        return <div className="p-8">Rolünüz tanımlanırken bir hata oluştu.</div>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="grid lg:grid-cols-[280px_1fr] min-h-screen">
        <aside className="border-r bg-muted/20 hidden lg:block">
          <div className="flex flex-col h-full">
            <div className="p-6">
              <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
                <GraduationCap className="h-6 w-6" />
                <span>Koçum Yanımda</span>
              </Link>
            </div>
            <nav className="flex-1 px-4 space-y-2">
              <Button variant="secondary" className="w-full justify-start" asChild>
                <Link href="/dashboard">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Panelim
                </Link>
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <Calendar className="mr-2 h-4 w-4" />
                Görüşmeler
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Görevler
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <User className="mr-2 h-4 w-4" />
                Profilim
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <Settings className="mr-2 h-4 w-4" />
                Ayarlar
              </Button>
            </nav>
            <div className="p-4 border-t">
              <div className="flex items-center gap-3 px-2 py-3 bg-card border rounded-lg">
                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
                  {userData?.displayName?.charAt(0) || 'U'}
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-xs font-semibold truncate">{userData?.displayName}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{roleLabels[userData?.role || 'student']}</p>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex flex-col">
          <header className="h-16 border-b flex items-center justify-between px-6 lg:px-8 bg-card shadow-sm sticky top-0 z-40">
            <h1 className="text-lg font-bold">Hoş Geldiniz, {userData?.displayName}</h1>
            <div className="lg:hidden">
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </header>
          {renderView()}
        </main>
      </div>
    </div>
  );
}
