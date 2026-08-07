
'use client';

import { useUser, useDoc, useAuth } from '@/firebase';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useMemo, Suspense } from 'react';
import { StudentView } from '@/components/dashboard/student-view';
import { TeacherView } from '@/components/dashboard/teacher-view';
import { AdminView } from '@/components/dashboard/admin-view';
import { SchoolAdminView } from '@/components/dashboard/school-admin-view';
import { 
  LogOut, LayoutDashboard, User, 
  Bell, Brain, Headset, 
  Sparkles, Compass, AlertCircle, 
  Home, ArrowLeft, Library,
  Users, PieChart, Eye, XCircle, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { signOut } from 'firebase/auth';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ProfileEditDialog } from '@/components/profile-edit-dialog';
import { EXAM_CONFIGS } from '@/lib/exam-configs';

function DashboardContent() {
  const { user, loading: authLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const simulatedUserId = searchParams.get('simulate');
  
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);

  const { data: userData, loading: docLoading } = useDoc<any>(user?.uid ? `users/${user.uid}` : null);
  const { data: simulatedUserData, loading: simLoading } = useDoc<any>(simulatedUserId ? `users/${simulatedUserId}` : null);

  const logoUrl = PlaceHolderImages.find(img => img.id === 'app-logo')?.imageUrl || "https://picsum.photos/seed/edu-logo-102/400/400";
  
  const currentViewData = simulatedUserData || userData;
  const isSimulating = !!simulatedUserId;

  // Profil verisi beklenirken gösterilecek durum
  const isGlobalLoading = authLoading || (user && docLoading && !userData) || (simulatedUserId && simLoading && !simulatedUserData);

  const dynamicMenu = useMemo(() => {
    if (!currentViewData) return [];
    
    if (currentViewData.role === 'admin') {
      return [
        { label: 'Sistem Paneli', icon: LayoutDashboard, href: '/dashboard' },
        { label: 'Müfredat Motoru', icon: Library, href: '/dashboard/admin/curriculum' },
        { label: 'Uzmanlar', icon: Users, href: '/dashboard/discover' },
        { label: 'Destek', icon: Headset, href: '/dashboard/contact' },
      ];
    }

    if (currentViewData.role === 'school_admin') {
      return [
        { label: 'Okul Paneli', icon: LayoutDashboard, href: '/dashboard' },
        { label: 'Öğretmenler', icon: User, href: '#' },
        { label: 'Şubeler', icon: PieChart, href: '#' },
        { label: 'Destek', icon: Headset, href: '/dashboard/contact' },
      ];
    }

    if (currentViewData.role === 'teacher') {
      return [
        { label: 'Öğretmen Paneli', icon: LayoutDashboard, href: '/dashboard' },
        { label: 'Öğrencilerim', icon: Users, href: '#' },
        { label: 'Uzman Keşfet', icon: Compass, href: '/dashboard/discover' },
        { label: 'Destek', icon: Headset, href: '/dashboard/contact' },
      ];
    }

    const items = [
      { label: 'Akademik Panel', icon: LayoutDashboard, href: '/dashboard' },
      { label: 'AI Analiz', icon: Brain, href: '/dashboard/ai-analysis', accent: true },
      { label: 'Uzman Keşfet', icon: Compass, href: '/dashboard/discover' },
    ];

    const config = EXAM_CONFIGS[currentViewData.targetExam || 'LGS'] || EXAM_CONFIGS['LGS'];
    config.modules?.slice(0, 3).forEach(mod => {
      items.push({ label: mod.title, icon: mod.icon, href: '#' });
    });

    items.push({ label: 'Destek Hattı', icon: Headset, href: '/dashboard/contact' });
    return items;
  }, [currentViewData]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  if (isGlobalLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-8">
          <div className="h-24 w-24 animate-spin rounded-[3rem] border-[8px] border-accent border-t-transparent shadow-[0_0_80px_rgba(245,158,11,0.25)]" />
          <p className="text-[12px] text-primary font-black uppercase tracking-[0.6em] animate-pulse italic">Akademik Veriler Hazırlanıyor...</p>
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

  const renderView = () => {
    if (!currentViewData) {
      return (
        <div className="p-20 flex flex-col items-center justify-center text-center space-y-12 animate-in fade-in zoom-in-95 duration-1000">
           <div className="h-24 w-24 rounded-[2.5rem] bg-destructive/10 flex items-center justify-center shadow-inner">
              <AlertCircle className="h-12 w-12 text-destructive" />
           </div>
           <div className="space-y-4">
             <h2 className="text-5xl font-black text-primary tracking-tighter uppercase italic text-shadow-deep">Profil Kaydı Eksik</h2>
             <p className="text-muted-foreground max-w-md mx-auto italic font-medium text-lg">
                Giriş yaptınız ancak akademik bir profil bulunamadı. Lütfen yeni bir profil oluşturun.
             </p>
           </div>
           <Button onClick={() => router.push('/login?tab=register')} className="h-20 px-12 rounded-[2rem] bg-primary text-white font-black uppercase text-xs tracking-widest flex items-center gap-4 shadow-2xl transition-all hover:scale-105">
              <User className="h-6 w-6 text-accent" /> Profili Şimdi Oluştur
           </Button>
        </div>
      );
    }

    switch (currentViewData.role) {
      case 'student': return <StudentView user={{ uid: currentViewData.uid }} userData={currentViewData} isReadOnly={isSimulating} />;
      case 'teacher': return <TeacherView user={user} userData={currentViewData} />;
      case 'school_admin': return <SchoolAdminView user={user} userData={currentViewData} />;
      case 'admin': return <AdminView user={user} userData={currentViewData} />;
      default: return <StudentView user={{ uid: currentViewData.uid }} userData={currentViewData} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFBFF] selection:bg-accent selection:text-white">
      {isSimulating && (
        <div className="bg-destructive text-white px-8 py-5 flex items-center justify-between sticky top-0 z-[100] shadow-2xl animate-in slide-in-from-top duration-700 backdrop-blur-md bg-destructive/90">
          <div className="flex items-center gap-5 text-xs font-black uppercase tracking-widest italic">
            <Eye className="h-5 w-5" /> SİMÜLASYON: <span className="underline underline-offset-8">{simulatedUserData?.displayName}</span>
          </div>
          <Button variant="ghost" onClick={stopSimulation} className="text-white hover:bg-white/10 font-black h-12 gap-3 rounded-2xl border-2 border-white/20 px-10">
            <XCircle className="h-5 w-5" /> Kapat
          </Button>
        </div>
      )}

      <div className="grid lg:grid-cols-[340px_1fr] min-h-screen">
        <aside className="bg-primary text-white hidden lg:flex flex-col border-r border-white/5 shadow-2xl z-50 sticky top-0 h-screen">
          <div className="p-12">
            <Link href="/dashboard" className="flex items-center gap-6 group">
              <div className="relative h-16 w-16 overflow-hidden rounded-[1.5rem] bg-white p-2">
                <Image src={logoUrl} alt="DEK Logo" fill className="object-contain" />
              </div>
              <div>
                <span className="font-black text-3xl block tracking-tighter italic uppercase text-shadow-premium">DEK</span>
                <span className="text-[9px] opacity-40 block font-black uppercase tracking-widest">Akademik Panel</span>
              </div>
            </Link>
          </div>
          
          <nav className="flex-1 px-8 space-y-3 mt-10">
            {dynamicMenu.map((item, i) => (
              <Button key={i} variant="ghost" className={cn("w-full justify-start rounded-[1.5rem] transition-all h-18 group relative", (item.href === '/dashboard' && !isSimulating) ? "bg-white/15 text-white font-black" : "hover:bg-white/5 opacity-60 hover:opacity-100")} asChild>
                <Link href={item.href}>
                  <item.icon className={cn("mr-6 h-7 w-7 transition-transform group-hover:scale-110", item.accent && "text-accent")} />
                  <span className="text-lg tracking-tight italic uppercase">{item.label}</span>
                </Link>
              </Button>
            ))}
          </nav>

          <div className="p-10">
            <div 
              onClick={() => setIsProfileDialogOpen(true)}
              className="p-8 bg-white/5 rounded-[3rem] border border-white/10 flex items-center gap-6 cursor-pointer hover:bg-white/10 transition-all"
            >
              <div className="h-14 w-14 rounded-[1.25rem] bg-accent flex items-center justify-center text-white font-black text-2xl italic">
                {userData?.displayName?.charAt(0) || <User className="h-6 w-6" />}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-black truncate">{userData?.displayName || 'Yükleniyor...'}</p>
                <p className="text-[10px] opacity-40 uppercase tracking-widest mt-1">HESABIM</p>
              </div>
              <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-destructive rounded-xl transition-all" onClick={(e) => { e.stopPropagation(); handleLogout(); }}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </aside>

        <main className="flex flex-col relative overflow-hidden bg-[#FAFBFF]">
          <header className="h-28 bg-white/80 backdrop-blur-3xl border-b border-primary/5 flex items-center justify-between px-12 sticky top-0 z-40">
            <div className="flex items-center gap-8">
              <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard')} className="h-14 w-14 rounded-2xl bg-slate-100 hover:bg-primary hover:text-white transition-all shadow-sm">
                <Home className="h-6 w-6" />
              </Button>
              <h1 className="text-3xl font-black text-primary uppercase tracking-tighter italic">
                {isSimulating ? 'SİMÜLASYON MODU' : (userData?.role === 'student' ? 'AKADEMİK PANEL' : 'YÖNETİM PANELİ')}
              </h1>
            </div>

            <div className="flex items-center gap-8">
               <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-500 italic">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span> CANLI
               </div>
               <div 
                  onClick={() => setIsProfileDialogOpen(true)}
                  className="h-14 w-14 rounded-2xl bg-accent overflow-hidden cursor-pointer shadow-2xl transition-all hover:scale-105 flex items-center justify-center font-black text-white text-xl italic border-4 border-white/20"
                >
                  {userData?.displayName?.charAt(0) || <User className="h-6 w-6" />}
                </div>
            </div>
          </header>
          
          <div className="flex-1 overflow-y-auto scrollbar-hide">
            {renderView()}
          </div>
        </main>
      </div>

      <ProfileEditDialog isOpen={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen} userData={userData} />
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
