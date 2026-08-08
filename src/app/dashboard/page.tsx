
'use client';

import {
  useUser,
  useDoc,
  useAuth,
  useFirestore,
} from '@/firebase';

import {
  useRouter,
  useSearchParams,
} from 'next/navigation';

import {
  useEffect,
  useMemo,
  useState,
  Suspense,
} from 'react';

import {
  LogOut,
  LayoutDashboard,
  User,
  Brain,
  Headset,
  Library,
  Users,
  PieChart,
  Eye,
  XCircle,
  Loader2,
  Home,
  Compass,
  Calendar,
  ShieldCheck,
  ArrowLeft,
} from 'lucide-react';

import { signOut } from 'firebase/auth';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { PlaceHolderImages } from '@/lib/placeholder-images';
import { EXAM_CONFIGS } from '@/lib/exam-configs';

import { ProfileEditDialog } from '@/components/profile-edit-dialog';
import { AuthForm } from '@/components/auth-form';

// Modüler View Importları
import { StudentView } from '@/components/dashboard/student-view';
import { TeacherView } from '@/components/dashboard/teacher-view';
import { AdminView } from '@/components/dashboard/admin-view';
import { SchoolAdminView } from '@/components/dashboard/school-admin-view';

/* ============================================================
   DASHBOARD CONTENT
============================================================ */

function DashboardContent() {
  const {
    user,
    loading: authLoading,
  } = useUser();

  const auth = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const simulatedUserId = searchParams.get('simulate');

  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);

  // Mevcut Kullanıcı Verisi
  const {
    data: userData,
    loading: docLoading,
  } = useDoc(user?.uid ? `users/${user.uid}` : null);

  // Simüle Edilen Kullanıcı Verisi (Öğretmen simülasyonu için)
  const {
    data: simulatedUserData,
    loading: simulatedUserLoading,
  } = useDoc(simulatedUserId ? `users/${simulatedUserId}` : null);

  const isSimulating = Boolean(simulatedUserId);
  const currentViewData = isSimulating ? simulatedUserData : userData;
  const currentViewUid = isSimulating ? simulatedUserId : user?.uid;

  const logoUrl = PlaceHolderImages.find((img) => img.id === 'app-logo')?.imageUrl || 'https://picsum.photos/seed/edu-logo-102/400/400';

  const isGlobalLoading = authLoading || (!!user && docLoading) || (!!simulatedUserId && simulatedUserLoading);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Dinamik Menü Oluşturucu
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
        { label: 'Destek', icon: Headset, href: '/dashboard/contact' },
      ];
    }

    if (currentViewData.role === 'teacher') {
      return [
        { label: 'Eğitmen Paneli', icon: LayoutDashboard, href: '/dashboard' },
        { label: 'Uzman Keşfet', icon: Compass, href: '/dashboard/discover' },
        { label: 'Destek', icon: Headset, href: '/dashboard/contact' },
      ];
    }

    const items = [
      { label: 'Akademik Panel', icon: LayoutDashboard, href: '/dashboard' },
      { label: 'AI Analiz', icon: Brain, href: '/dashboard/ai-analysis', accent: true },
      { label: 'Akıllı Planlama', icon: Calendar, href: '/dashboard/planning' },
      { label: 'Uzman Keşfet', icon: Compass, href: '/dashboard/discover' },
    ];

    const config = EXAM_CONFIGS[currentViewData.targetExam || 'LGS'] || EXAM_CONFIGS['LGS'];
    if (config?.modules) {
      config.modules.slice(0, 2).forEach((mod: any) => {
        items.push({ label: mod.title, icon: mod.icon, href: '#' });
      });
    }

    items.push({ label: 'Destek Hattı', icon: Headset, href: '/dashboard/contact' });
    return items;
  }, [currentViewData]);

  const handleLogout = async () => {
    if (!auth) return;
    await signOut(auth);
    router.push('/login');
  };

  const stopSimulation = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('simulate');
    router.push(`/dashboard${params.toString() ? '?' + params.toString() : ''}`);
  };

  if (isGlobalLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-6">
          <Loader2 className="h-12 w-12 animate-spin text-accent" />
          <p className="text-xs font-black uppercase tracking-[0.4em] text-primary/40">Akademik Motor Hazırlanıyor</p>
        </div>
      </div>
    );
  }

  // Profil Tamamlama Ekranı
  if (user && !docLoading && !userData) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-8 relative overflow-hidden">
        {/* Dekoratif Arka Plan */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/5 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/5 blur-[150px] rounded-full translate-y-1/2 -translate-x-1/2"></div>

        <div className="w-full max-w-4xl relative z-10 space-y-12">
          <div className="flex flex-col items-center text-center space-y-8 animate-in fade-in slide-in-from-top-4 duration-1000">
            <div className="relative">
              <div className="h-24 w-24 rounded-[2rem] bg-white shadow-2xl flex items-center justify-center p-4 border border-primary/5">
                <Image src={logoUrl} alt="DEK Logo" width={60} height={60} className="object-contain" />
              </div>
              <div className="absolute -bottom-2 -right-2 h-10 w-10 bg-accent rounded-xl flex items-center justify-center text-white shadow-xl border-4 border-white animate-bounce">
                <ShieldCheck className="h-5 w-5" />
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-primary text-white font-black text-[10px] uppercase tracking-[0.4em] shadow-2xl shadow-primary/20 italic">
                Sistem Kurulum Fazı v4.8
              </div>
              <h2 className="text-6xl font-black italic tracking-tighter text-primary uppercase leading-none text-shadow-premium">
                PROFİLİNİZİ <span className="text-accent text-shadow-accent">TAMAMLAYIN</span>
              </h2>
              <p className="text-xl font-medium text-muted-foreground italic max-w-xl mx-auto">
                Hoş geldiniz! Akademik komuta merkezinizi size özel yapılandırmak için son birkaç bilgiye ihtiyacımız var.
              </p>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-3xl rounded-[4rem] shadow-[0_80px_160px_-40px_rgba(15,23,42,0.2)] border border-white/20 overflow-hidden group">
            <AuthForm mode="register" isProfileCompletion={true} />
          </div>

          <div className="flex justify-center animate-in fade-in duration-1000 delay-500">
             <Button 
               variant="ghost" 
               onClick={handleLogout}
               className="h-16 px-10 rounded-2xl font-black text-xs uppercase tracking-[0.3em] text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-all gap-4 group"
             >
                <LogOut className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                BAŞKA HESAPLA GİRİŞ YAP VEYA ÇIKIŞ YAP
             </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!user || !currentViewData) return null;

  const renderView = () => {
    switch (currentViewData.role) {
      case 'teacher':
        return <TeacherView user={{ uid: currentViewUid }} userData={currentViewData} />;
      case 'school_admin':
        return <SchoolAdminView user={{ uid: currentViewUid }} userData={currentViewData} />;
      case 'admin':
        return <AdminView user={{ uid: currentViewUid }} userData={currentViewData} />;
      case 'student':
      default:
        return <StudentView user={{ uid: currentViewUid }} userData={currentViewData} isReadOnly={isSimulating} />;
    }
  };

  return (
    <div className="min-h-screen">
      {isSimulating && (
        <div className="bg-destructive/95 text-white px-6 py-4 flex items-center justify-between sticky top-0 z-[100] shadow-2xl backdrop-blur-md">
          <div className="flex items-center gap-4 text-xs font-black uppercase tracking-widest">
            <Eye className="h-5 w-5" />
            <span>SİMÜLASYON:</span>
            <span className="underline underline-offset-4">{simulatedUserData?.displayName || 'Kullanıcı'}</span>
            <Badge className="bg-white/20 text-white border-none">SALT OKUNUR</Badge>
          </div>
          <Button variant="ghost" onClick={stopSimulation} className="text-white hover:bg-white/10 font-black gap-2 rounded-xl border border-white/20">
            <XCircle className="h-5 w-5" /> Kapat
          </Button>
        </div>
      )}

      <div className="grid lg:grid-cols-[320px_1fr] min-h-screen">
        <aside className="bg-primary text-white hidden lg:flex flex-col border-r border-white/5 shadow-2xl sticky top-0 h-screen z-50">
          <div className="p-10">
            <Link href="/dashboard" className="flex items-center gap-5">
              <div className="relative h-14 w-14 overflow-hidden rounded-2xl bg-white p-2">
                <Image src={logoUrl} alt="DEK Logo" fill className="object-contain" />
              </div>
              <div>
                <span className="font-black text-3xl block tracking-tighter italic uppercase leading-none">DEK</span>
                <span className="text-[8px] opacity-40 block font-black uppercase tracking-widest mt-1">Akademik Panel</span>
              </div>
            </Link>
          </div>

          <nav className="flex-1 px-6 space-y-2">
            {dynamicMenu.map((item: any, index) => (
              <Button key={index} variant="ghost" className={cn('w-full justify-start rounded-2xl h-14 group', item.href === '/dashboard' && !isSimulating ? 'bg-white/15 text-white font-black' : 'hover:bg-white/5 opacity-60 hover:opacity-100')} asChild>
                <Link href={item.href}>
                  <item.icon className={cn('mr-5 h-5 w-5', item.accent && 'text-accent')} />
                  <span className="text-sm tracking-tight italic uppercase">{item.label}</span>
                </Link>
              </Button>
            ))}
          </nav>

          <div className="p-7">
            <div onClick={() => setIsProfileDialogOpen(true)} className="p-5 bg-white/5 rounded-3xl border border-white/10 flex items-center gap-4 cursor-pointer hover:bg-white/10 transition-all">
              <div className="h-12 w-12 rounded-xl bg-accent flex items-center justify-center text-white font-black text-xl">
                {userData?.displayName?.charAt(0) || <User className="h-5 w-5" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black truncate">{userData?.displayName || 'Kullanıcı'}</p>
                <p className="text-[9px] opacity-40 uppercase tracking-widest">{userData?.role?.replace('_', ' ') || 'HESABIM'}</p>
              </div>
              <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-destructive rounded-xl" onClick={(e) => { e.stopPropagation(); handleLogout(); }}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </aside>

        <main className="flex flex-col relative overflow-hidden bg-[#FAFBFF]">
          <header className="h-24 bg-white/80 backdrop-blur-3xl border-b border-primary/5 flex items-center justify-between px-8 xl:px-12 sticky top-0 z-40">
            <div className="flex items-center gap-5">
              <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard')} className="h-12 w-12 rounded-xl bg-slate-100 hover:bg-primary hover:text-white">
                <Home className="h-5 w-5" />
              </Button>
              <h1 className="text-xl xl:text-2xl font-black text-primary uppercase tracking-tighter italic">
                {isSimulating ? 'SİMÜLASYON MODU' : currentViewData.role === 'student' ? 'AKADEMİK KOMUTA MERKEZİ' : 'AKADEMİK HAREKÂT MERKEZİ'}
              </h1>
            </div>
            <div className="flex items-center gap-5">
              <div className="hidden md:flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-emerald-500 italic">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> CANLI
              </div>
              <div onClick={() => setIsProfileDialogOpen(true)} className="h-12 w-12 rounded-xl bg-accent overflow-hidden cursor-pointer shadow-xl flex items-center justify-center font-black text-white text-lg italic">
                {userData?.displayName?.charAt(0) || <User className="h-5 w-5" />}
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
