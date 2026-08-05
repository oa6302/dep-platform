
'use client';

import { useUser, useDoc, useAuth, useCollection } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { GraduationCap, LogOut, Calendar, CheckCircle2, User, Settings, LayoutDashboard, Plus } from 'lucide-react';
import { signOut } from 'firebase/auth';
import Link from 'next/link';
import { collection, query, where, orderBy, limit } from 'firebase/firestore';

export default function DashboardPage() {
  const { user, loading: authLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();

  const userDocQuery = user?.uid ? `users/${user.uid}` : null;
  const { data: userData, loading: docLoading } = useDoc<any>(userDocQuery);

  // Memoized query for tasks
  const tasksQuery = useMemo(() => {
    if (!user?.uid) return null;
    return query(
      collection(useAuth()?.app ? (window as any).firestore : null as any, 'tasks'), // Workaround to get firestore if not directly accessible via hook here without re-invoking useFirestore
      where('studentId', '==', user.uid),
      orderBy('dueDate', 'asc'),
      limit(5)
    );
  }, [user?.uid]);

  // Using useCollection with path string for simplicity since useMemoFirebase isn't available in current context, 
  // but useCollection handles path strings.
  const { data: tasks, loading: tasksLoading } = useCollection<any>(
    user?.uid ? 'tasks' : null,
    where('studentId', '==', user?.uid || ''),
    orderBy('dueDate', 'asc')
  );

  const { data: sessions, loading: sessionsLoading } = useCollection<any>(
    user?.uid ? 'sessions' : null,
    where(userData?.role === 'teacher' ? 'teacherId' : 'studentId', '==', user?.uid || ''),
    orderBy('scheduledAt', 'asc')
  );

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

  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const upcomingSessions = sessions.filter(s => s.status === 'scheduled');

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

          <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto w-full">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-primary/5 border-primary/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Aktif Görevler</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{pendingTasks.length}</p>
                  <CardDescription>Tamamlanmayı bekliyor</CardDescription>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Yaklaşan Görüşme</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xl font-bold">
                    {upcomingSessions.length > 0 
                      ? new Date(upcomingSessions[0].scheduledAt).toLocaleDateString('tr-TR', { weekday: 'long', hour: '2-digit', minute: '2-digit' })
                      : 'Henüz görüşme yok'}
                  </p>
                  <CardDescription>Planlanmış son görüşme</CardDescription>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Gelişim Puanı</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">850</p>
                  <CardDescription>+120 son 30 günde</CardDescription>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Yaklaşan Görüşmeler</CardTitle>
                    <CardDescription>Takviminizi kontrol edin</CardDescription>
                  </div>
                  <Button size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-1" /> Yeni
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {upcomingSessions.length > 0 ? (
                      upcomingSessions.map((session) => (
                        <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                              <Calendar className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="font-semibold">{session.notes || 'Koçluk Seansı'}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(session.scheduledAt).toLocaleString('tr-TR')}
                              </p>
                            </div>
                          </div>
                          <Button size="sm" variant="outline">Detay</Button>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        Planlanmış bir görüşmeniz bulunmuyor.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Bekleyen Görevler</CardTitle>
                    <CardDescription>Haftalık hedefleriniz</CardDescription>
                  </div>
                  <Button size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-1" /> Ekle
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pendingTasks.length > 0 ? (
                      pendingTasks.map((task) => (
                        <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-4">
                            <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="font-semibold">{task.title}</p>
                              <p className="text-xs text-muted-foreground">Teslim: {new Date(task.dueDate).toLocaleDateString('tr-TR')}</p>
                            </div>
                          </div>
                          <Button size="sm">Tamamla</Button>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        Şu an bekleyen bir göreviniz yok.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
