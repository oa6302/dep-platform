
'use client';

import { useUser, useDoc, useAuth, useFirestore } from '@/firebase';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { StudentView } from '@/components/dashboard/student-view';
import { TeacherView } from '@/components/dashboard/teacher-view';
import { AdminView } from '@/components/dashboard/admin-view';
import { SchoolAdminView } from '@/components/dashboard/school-admin-view';
import { 
  LogOut, LayoutDashboard, Calendar, CheckCircle2, User, 
  Settings, Bell, Eye, XCircle, Search, Brain, Headset, 
  Sparkles, Compass, AlertCircle, ChevronRight, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { signOut } from 'firebase/auth';
import Link from 'next/link';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

export default function DashboardPage() {
  const { user, loading: authLoading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const simulatedUserId = searchParams.get('simulate');
  const [fixingProfile, setFixingProfile] = useState(false);

  const userDocQuery = user?.uid ? `users/${user.uid}` : null;
  const { data: userData, loading: docLoading } = useDoc<any>(userDocQuery);
  
  const { data: simulatedUserData, loading: simLoading } = useDoc<any>(simulatedUserId ? `users/${simulatedUserId}` : null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
    // Student logic: Force exam selection if not set
    if (!docLoading && userData && userData.role === 'student' && !userData.targetExam && !simulatedUserId) {
      router.push('/dashboard/select-exam');
    }
  }, [user, authLoading, router, userData, docLoading, simulatedUserId]);

  if (authLoading || docLoading || (simulatedUserId && simLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-6">
          <div className="h-16 w-16 animate-spin rounded-[2rem] border-[6px] border-accent border-t-transparent shadow-[0_0_60px_rgba(245,158,11,0.3)]" />
          <p className="text-[10px] text-primary font-black uppercase tracking-[0.4em] animate-pulse italic">Sistem Yükleniyor...</p>
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

  const handleCreateProfile = async (targetRole: 'student' | 'teacher') => {
    if (!user || !db) return;
    setFixingProfile(true);
    try {
      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || 'Kullanıcı',
        role: targetRole,
        createdAt: serverTimestamp(),
        ...(targetRole === 'teacher' ? { activationCode: 'DK-' + Math.random().toString(36).substring(2, 6).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase(), branch: 'Genel' } : {})
      };
      await setDoc(doc(db, 'users', user.uid), userData);
      toast({ title: 'Profil Oluşturuldu', description: `Hesabınız ${targetRole === 'teacher' ? 'Öğretmen' : 'Öğrenci'} olarak yapılandırıldı.` });
      window.location.reload();
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Hata', description: 'Profil oluşturulamadı.' });
    } finally {
      setFixingProfile(false);
    }
  };

  const stopSimulation = () => {
    const params = new URLSearchParams(searchParams);
    params.delete('simulate');
    router.push(`/dashboard?${params.toString()}`);
  };

  const roleLabels: Record<string, string> = {
    student: 'Öğrenci',
    teacher: 'Akademik Koç',
    school_admin: 'Okul Yönetimi',
    admin: 'Sistem Yöneticisi'
  };

  const currentViewData = simulatedUserData || userData;
  const isSimulating = !!simulatedUserId;

  const renderView = () => {
    if (!currentViewData) {
      return (
        <div className="p-20 flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in zoom-in-95 duration-700">
           <div className="h-24 w-24 rounded-[2.5rem] bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="h-12 w-12 text-destructive" />
           </div>
           <div className="space-y-4">
              <h2 className="text-4xl font-black text-primary tracking-tighter uppercase italic text-shadow-deep">Profil Bulunamadı</h2>
              <p className="text-muted-foreground font-medium italic max-w-md mx-auto">Sistemde size ait bir profil kaydı saptanamadı. Lütfen aşağıdaki seçeneklerden birini seçerek profilinizi hemen oluşturun.</p>
           </div>
           <div className="flex gap-4">
              <Button onClick={() => handleCreateProfile('student')} disabled={fixingProfile} className="h-14 px-8 rounded-2xl bg-primary hover:bg-accent font-black uppercase text-xs tracking-widest gap-3">
                {fixingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : <User className="h-4 w-4" />}
                Öğrenci Profili Kur
              </Button>
              <Button onClick={() => handleCreateProfile('teacher')} disabled={fixingProfile} variant="outline" className="h-14 px-8 rounded-2xl border-2 font-black uppercase text-xs tracking-widest gap-3">
                {fixingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
                Öğretmen Profili Kur
              </Button>
           </div>
        </div>
      );
    }

    const role = currentViewData?.role;
    switch (role) {
      case 'student':
        return <StudentView user={{ uid: currentViewData.uid }} userData={currentViewData} isReadOnly={isSimulating} />;
      case 'teacher':
        return <TeacherView user={user} userData={currentViewData} />;
      case 'school_admin':
        return <SchoolAdminView user={user} userData={currentViewData} />;
      case 'admin':
        return <AdminView user={user} userData={currentViewData} />;
      default:
        return (
          <div className="p-20 text-center space-y-6">
            <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-destructive text-white font-black text-xs uppercase tracking-widest shadow-2xl">
              <AlertCircle className="h-4 w-4" /> Yetkilendirme Hatası
            </div>
            <p className="text-xl font-black text-primary italic uppercase tracking-tighter text-shadow-deep">Bilinmeyen Kullanıcı Rolü: {role}</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] selection:bg-accent selection:text-white">
      {/* Simulation Banner */}
      {isSimulating && (
        <div className="bg-destructive text-white px-6 py-4 flex items-center justify-between sticky top-0 z-[100] shadow-[0_20px_50px_-10px_rgba(239,68,68,0.3)] animate-in slide-in-from-top duration-500">
          <div className="flex items-center gap-4 text-xs font-black uppercase tracking-widest italic">
            <div className="h-8 w-8 rounded-xl bg-white/20 flex items-center justify-center">
              <Eye className="h-4 w-4" />
            </div>
            SİMÜLASYON MODU: <span className="text-white underline decoration-white/30 underline-offset-4">{simulatedUserData?.displayName}</span> hesabını yönetiyorsunuz.
          </div>
          <Button variant="ghost" size="sm" onClick={stopSimulation} className="text-white hover:bg-white/10 font-black h-11 gap-3 rounded-2xl border border-white/20 px-8 transition-all hover:scale-105">
            <XCircle className="h-4 w-4" />
            Simülasyondan Çık
          </Button>
        </div>
      )}

      <div className="grid lg:grid-cols-[340px_1fr] min-h-screen">
        {/* Apple Style Sidebar */}
        <aside className="bg-primary text-white hidden lg:flex flex-col border-r border-white/5 shadow-[40px_0_100px_-20px_rgba(15,23,42,0.15)] z-50 sticky top-0 h-screen overflow-hidden">
          <div className="p-10">
            <Link href="/" className="flex items-center gap-5 group">
              <div className="relative h-16 w-16 overflow-hidden rounded-[1.75rem] bg-white p-1.5 shadow-[0_20px_40px_-5px_rgba(255,255,255,0.2)] transition-all duration-500 group-hover:rotate-6 group-hover:scale-110">
                <Image 
                  src="/logo.png" 
                  alt="DEK Logo" 
                  fill 
                  className="object-contain"
                />
              </div>
              <div className="overflow-hidden">
                <span className="font-black text-3xl block tracking-tighter leading-none italic text-shadow-premium uppercase">DEK</span>
                <span className="text-[9px] opacity-40 block font-black uppercase tracking-[0.2em] mt-1.5">Eğitim Koçu v4.0</span>
              </div>
            </Link>
          </div>
          
          <nav className="flex-1 px-8 space-y-2 mt-6 overflow-y-auto scrollbar-hide">
            <SidebarNavItem href="/dashboard" icon={LayoutDashboard} label="Panelim" active />
            <SidebarNavItem href="/dashboard/ai-analysis" icon={Brain} label="AI Asistanım" accent />
            {userData?.role === 'student' && (
              <SidebarNavItem href="/dashboard/discover" icon={Compass} label="Uzman Keşfet" accent />
            )}
            <SidebarNavItem href="#" icon={Calendar} label="Takvim" />
            <SidebarNavItem href="#" icon={CheckCircle2} label="Görevlerim" />
            <SidebarNavItem href="#" icon={User} label="Profilim" />
            <SidebarNavItem href="/dashboard/contact" icon={Headset} label="Destek Merkezi" accent />
            
            {userData?.role === 'student' && (
              <div className="pt-8 mt-8 border-t border-white/10 space-y-2">
                 <SidebarNavItem href="/dashboard/select-exam" icon={Sparkles} label="Hedef Değiştir" accent />
              </div>
            )}
            <SidebarNavItem href="#" icon={Settings} label="Sistem Ayarları" />
          </nav>

          <div className="p-8 mt-auto">
            <div className="p-6 bg-white/5 rounded-[2.5rem] border border-white/10 shadow-2xl relative overflow-hidden group/profile">
              <div className="absolute top-0 right-0 w-24 h-24 bg-accent/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 group-hover/profile:bg-accent/20 transition-all"></div>
              <div className="flex items-center gap-4 relative z-10">
                <div className="h-14 w-14 rounded-2xl bg-accent flex items-center justify-center text-white font-black shadow-xl shadow-accent/20 text-2xl italic border-4 border-white/10 transition-transform group-hover/profile:rotate-3">
                  {userData?.displayName?.charAt(0) || user?.displayName?.charAt(0) || 'U'}
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-black truncate tracking-tight text-shadow-deep">{userData?.displayName || user?.displayName}</p>
                  <p className="text-[9px] opacity-40 truncate font-black uppercase tracking-widest mt-0.5">{userData?.targetExam || roleLabels[userData?.role || 'student']}</p>
                </div>
                <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-destructive rounded-xl transition-all shadow-sm" onClick={handleLogout}>
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </aside>

        {/* Dynamic Main Content */}
        <main className="flex flex-col relative">
          <header className="h-32 bg-white/70 backdrop-blur-3xl border-b border-primary/5 flex items-center justify-between px-12 sticky top-0 z-40">
            <div className="flex items-center gap-12 flex-1 max-w-3xl">
              <div className="space-y-1">
                 <h1 className="text-3xl font-black text-primary uppercase tracking-tighter italic shrink-0 text-shadow-premium">
                   {isSimulating ? 'Öğrenci Simülasyonu' : roleLabels[userData?.role] || 'Panel'}
                 </h1>
                 <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground italic">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Sistem Çevrimiçi
                 </div>
              </div>
              
              <div className="relative w-full hidden md:block group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-accent transition-colors" />
                <Input 
                  placeholder="Hızlı arama: Öğrenci, ders, görev veya analiz..." 
                  className="pl-14 h-14 rounded-2xl bg-[#F1F5F9]/50 border-none shadow-inner focus-visible:ring-accent font-bold text-sm transition-all focus-visible:bg-white focus-visible:shadow-2xl"
                />
              </div>
            </div>

            <div className="flex items-center gap-8">
              <Button variant="ghost" size="icon" className="relative h-14 w-14 bg-[#F1F5F9] rounded-2xl transition-all hover:scale-110 hover:shadow-xl group">
                <Bell className="h-7 w-7 text-primary group-hover:text-accent transition-colors" />
                {!isSimulating && <span className="absolute top-4 right-4 h-3.5 w-3.5 bg-accent rounded-full border-[4px] border-white shadow-xl animate-bounce"></span>}
              </Button>
              
              {/* Mobile Logout */}
              <div className="lg:hidden">
                <Button variant="ghost" size="icon" className="h-14 w-14 rounded-2xl bg-destructive/5 text-destructive" onClick={handleLogout}>
                  <LogOut className="h-7 w-7" />
                </Button>
              </div>
            </div>
          </header>
          
          <div className="flex-1 overflow-y-auto scrollbar-hide">
            {renderView()}
          </div>
        </main>
      </div>
    </div>
  );
}

function SidebarNavItem({ href, icon: Icon, label, active = false, accent = false }: { href: string, icon: any, label: string, active?: boolean, accent?: boolean }) {
  return (
    <Button 
      variant="ghost" 
      className={cn(
        "w-full justify-start rounded-2xl transition-all h-16 group relative overflow-hidden",
        active 
          ? "bg-white/10 text-white font-black shadow-2xl shadow-black/20" 
          : "hover:bg-white/5 font-bold opacity-60 hover:opacity-100"
      )} 
      asChild
    >
      <Link href={href}>
        <Icon className={cn(
          "mr-5 h-6 w-6 transition-transform group-hover:scale-125 duration-500", 
          accent && "text-accent"
        )} />
        <span className="tracking-tight italic">{label}</span>
        {active && <div className="absolute right-0 top-0 h-full w-1.5 bg-accent rounded-l-full shadow-[0_0_20px_rgba(245,158,11,1)]"></div>}
      </Link>
    </Button>
  );
}
