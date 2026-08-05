
'use client';

import { useUser, useDoc, useAuth, useFirestore } from '@/firebase';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { StudentView } from '@/components/dashboard/student-view';
import { TeacherView } from '@/components/dashboard/teacher-view';
import { AdminView } from '@/components/dashboard/admin-view';
import { SchoolAdminView } from '@/components/dashboard/school-admin-view';
import { 
  LogOut, LayoutDashboard, Calendar, CheckCircle2, User, 
  Settings, Bell, Eye, XCircle, Search, Brain, Headset, 
  Sparkles, Compass, AlertCircle, ChevronRight, Loader2,
  Home, ArrowLeft, BarChart3, ClipboardCheck, Library,
  Timer, ScrollText, PieChart, ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { signOut } from 'firebase/auth';
import Link from 'next/link';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ProfileEditDialog } from '@/components/profile-edit-dialog';
import { EXAM_CONFIGS } from '@/lib/exam-configs';

export default function DashboardPage() {
  const { user, loading: authLoading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const simulatedUserId = searchParams.get('simulate');
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [fixingProfile, setFixingProfile] = useState(false);

  const { data: userData, loading: docLoading } = useDoc<any>(user?.uid ? `users/${user.uid}` : null);
  const { data: simulatedUserData, loading: simLoading } = useDoc<any>(simulatedUserId ? `users/${simulatedUserId}` : null);

  const logoUrl = PlaceHolderImages.find(img => img.id === 'app-logo')?.imageUrl || "https://picsum.photos/seed/edu-logo-102/400/400";
  
  const currentViewData = simulatedUserData || userData;
  const isSimulating = !!simulatedUserId;

  const dynamicMenu = useMemo(() => {
    if (!currentViewData) return [];
    
    // Öğretmen/Admin Menüsü
    if (currentViewData.role !== 'student') {
      return [
        { label: 'Panelim', icon: LayoutDashboard, href: '/dashboard' },
        { label: 'Uzman Keşfet', icon: Compass, href: '/dashboard/discover' },
        { label: 'Destek', icon: Headset, href: '/dashboard/contact' },
      ];
    }

    // Öğrenci Menüsü (Sınava Özel)
    const config = EXAM_CONFIGS[currentViewData.targetExam || 'LGS'] || EXAM_CONFIGS['LGS'];
    const items = [
      { label: 'Panelim', icon: LayoutDashboard, href: '/dashboard' },
      { label: 'AI Analiz', icon: Brain, href: '/dashboard/ai-analysis', accent: true },
      { label: 'Uzman Keşfet', icon: Compass, href: '/dashboard/discover' },
    ];

    config.modules.slice(0, 4).forEach(mod => {
      items.push({ label: mod.title, icon: mod.icon, href: '#' });
    });

    items.push({ label: 'Destek', icon: Headset, href: '/dashboard/contact' });
    return items;
  }, [currentViewData]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  if (authLoading || docLoading || (simulatedUserId && simLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-8">
          <div className="h-24 w-24 animate-spin rounded-[3rem] border-[8px] border-accent border-t-transparent shadow-[0_0_80px_rgba(245,158,11,0.25)]" />
          <p className="text-[12px] text-primary font-black uppercase tracking-[0.6em] animate-pulse italic">Akademik Motor Hazırlanıyor...</p>
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

  const handleCreateProfile = async (targetRole: 'student' | 'teacher') => {
    if (!user || !db) return;
    setFixingProfile(true);
    try {
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || 'Kullanıcı',
        role: targetRole,
        createdAt: serverTimestamp(),
      }, { merge: true });
      toast({ title: 'Profil Hazır', description: 'Hesabınız yapılandırıldı.' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Hata', description: 'Profil oluşturulamadı.' });
    } finally {
      setFixingProfile(false);
    }
  };

  const renderView = () => {
    if (!currentViewData) {
      return (
        <div className="p-20 flex flex-col items-center justify-center text-center space-y-12 animate-in fade-in zoom-in-95 duration-1000">
           <div className="h-24 w-24 rounded-[2.5rem] bg-destructive/10 flex items-center justify-center shadow-inner">
              <AlertCircle className="h-12 w-12 text-destructive" />
           </div>
           <div className="space-y-4">
              <h2 className="text-5xl font-black text-primary tracking-tighter uppercase italic text-shadow-deep">Profil Saptanamadı</h2>
              <p className="text-muted-foreground font-medium italic max-w-md mx-auto">Sistemde bir profil kaydı bulunamadı. Hemen modunuzu seçerek başlayın.</p>
           </div>
           <div className="flex gap-6">
              <button onClick={() => handleCreateProfile('student')} className="h-20 px-12 rounded-[2rem] bg-primary text-white hover:bg-accent font-black uppercase text-xs tracking-widest flex items-center gap-4 shadow-2xl transition-all">
                <User className="h-6 w-6 text-accent" /> Öğrenci Paneli Kur
              </button>
              <button onClick={() => handleCreateProfile('teacher')} className="h-20 px-12 rounded-[2rem] border-4 border-primary font-black uppercase text-xs tracking-widest flex items-center gap-4 shadow-xl transition-all hover:bg-primary hover:text-white group">
                <Brain className="h-6 w-6 text-primary group-hover:text-accent" /> Öğretmen Paneli Kur
              </button>
           </div>
        </div>
      );
    }

    if (currentViewData.role === 'student' && !currentViewData.targetExam && !isSimulating) {
       return (
         <div className="p-20 flex flex-col items-center justify-center text-center space-y-12 animate-in fade-in zoom-in-95 duration-1000">
            <div className="h-24 w-24 rounded-[2.5rem] bg-accent/10 flex items-center justify-center shadow-inner">
               <Sparkles className="h-12 w-12 text-accent" />
            </div>
            <div className="space-y-4">
               <h2 className="text-5xl font-black text-primary tracking-tighter uppercase italic">Hedef Seçilmedi</h2>
               <p className="text-muted-foreground font-medium italic max-w-md mx-auto">Dashboard'unuzu yapılandırmak için bir eğitim programı seçmelisiniz.</p>
            </div>
            <Button onClick={() => router.push('/dashboard/select-exam')} className="h-20 px-12 rounded-[2rem] bg-primary hover:bg-accent font-black uppercase text-xs tracking-widest gap-4 shadow-2xl transition-all">
               Hedef Belirle <ArrowRight className="h-6 w-6" />
            </Button>
         </div>
       );
    }

    switch (currentViewData.role) {
      case 'student': return <StudentView user={{ uid: currentViewData.uid }} userData={currentViewData} isReadOnly={isSimulating} />;
      case 'teacher': return <TeacherView user={user} userData={currentViewData} />;
      case 'school_admin': return <SchoolAdminView user={user} userData={currentViewData} />;
      case 'admin': return <AdminView user={user} userData={currentViewData} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] selection:bg-accent selection:text-white">
      {isSimulating && (
        <div className="bg-destructive text-white px-8 py-5 flex items-center justify-between sticky top-0 z-[100] shadow-[0_20px_60px_-10px_rgba(239,68,68,0.4)] animate-in slide-in-from-top duration-700 backdrop-blur-md bg-destructive/90">
          <div className="flex items-center gap-5 text-xs font-black uppercase tracking-widest italic">
            <div className="h-10 w-10 rounded-2xl bg-white/20 flex items-center justify-center shadow-xl">
              <Eye className="h-5 w-5" />
            </div>
            SİMÜLASYON AKTİF: <span className="text-white underline underline-offset-8 decoration-white/40">{simulatedUserData?.displayName}</span>
          </div>
          <Button variant="ghost" onClick={stopSimulation} className="text-white hover:bg-white/10 font-black h-12 gap-3 rounded-2xl border-2 border-white/20 px-10 transition-all hover:scale-105 active:scale-95 shadow-2xl">
            <XCircle className="h-5 w-5" /> Simülasyonu Kapat
          </Button>
        </div>
      )}

      <div className="grid lg:grid-cols-[340px_1fr] min-h-screen">
        <aside className="bg-primary text-white hidden lg:flex flex-col border-r border-white/5 shadow-[40px_0_100px_-20px_rgba(15,23,42,0.25)] z-50 sticky top-0 h-screen overflow-hidden">
          <div className="p-12">
            <div onClick={() => router.push('/dashboard')} className="flex items-center gap-6 group cursor-pointer">
              <div className="relative h-20 w-20 overflow-hidden rounded-[2rem] bg-white p-2 shadow-[0_30px_60px_-5px_rgba(255,255,255,0.2)] transition-all duration-500 group-hover:rotate-6 group-hover:scale-110">
                <Image src={logoUrl} alt="DEK Logo" fill className="object-contain" />
              </div>
              <div>
                <span className="font-black text-4xl block tracking-tighter leading-none italic text-shadow-premium uppercase">DEK</span>
                <span className="text-[10px] opacity-40 block font-black uppercase tracking-[0.3em] mt-3">Geleceğin Eğitimi</span>
              </div>
            </div>
          </div>
          
          <nav className="flex-1 px-8 space-y-3 mt-10 overflow-y-auto scrollbar-hide">
            {dynamicMenu.map((item, i) => (
              <SidebarNavItem 
                key={i} 
                href={item.href} 
                icon={item.icon} 
                label={item.label} 
                active={item.href === '/dashboard' && !isSimulating} 
                accent={item.accent} 
              />
            ))}
            
            {!isSimulating && userData?.role === 'student' && (
              <div className="pt-10 mt-10 border-t border-white/10 space-y-3">
                 <SidebarNavItem href="/dashboard/select-exam" icon={Sparkles} label="Hedef Değiştir" accent />
              </div>
            )}
          </nav>

          <div className="p-10">
            <div 
              onClick={() => setIsProfileDialogOpen(true)}
              className="p-8 bg-white/5 rounded-[3rem] border border-white/10 shadow-2xl relative overflow-hidden group/profile cursor-pointer hover:bg-white/10 transition-all"
            >
              <div className="flex items-center gap-6 relative z-10">
                <div className="h-16 w-16 rounded-[1.75rem] bg-accent flex items-center justify-center text-white font-black text-3xl italic border-4 border-white/10 shadow-xl">
                  {userData?.displayName?.charAt(0)}
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-base font-black truncate tracking-tight text-shadow-deep">{userData?.displayName}</p>
                  <p className="text-[10px] opacity-40 truncate font-black uppercase tracking-widest mt-2">{userData?.targetExam || 'Profil Kuruluyor'}</p>
                </div>
                <Button variant="ghost" size="icon" className="h-12 w-12 hover:bg-destructive rounded-2xl transition-all" onClick={(e) => { e.stopPropagation(); handleLogout(); }}>
                  <LogOut className="h-6 w-6" />
                </Button>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex flex-col relative overflow-hidden">
          <header className="h-36 bg-white/80 backdrop-blur-3xl border-b border-primary/5 flex items-center justify-between px-16 sticky top-0 z-40 shadow-sm">
            <div className="flex items-center gap-12 flex-1">
              <div className="flex items-center gap-5">
                <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard')} className="h-16 w-16 rounded-[1.5rem] bg-slate-100 hover:bg-primary hover:text-white transition-all shadow-sm">
                  <Home className="h-7 w-7" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-16 w-16 rounded-[1.5rem] bg-slate-100 hover:bg-primary hover:text-white transition-all shadow-sm">
                  <ArrowLeft className="h-7 w-7" />
                </Button>
              </div>
              <div className="space-y-1">
                 <h1 className="text-4xl font-black text-primary uppercase tracking-tighter italic text-shadow-premium">
                   {isSimulating ? 'Öğrenci Simülasyonu' : userData?.targetExam ? `${userData.targetExam} PANALİ` : 'PANELİM'}
                 </h1>
                 <div className="flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground italic">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span> SİSTEM ÇEVRİMİÇİ
                 </div>
              </div>
            </div>

            <div className="flex items-center gap-10">
              <Button variant="ghost" size="icon" className="relative h-16 w-16 bg-slate-100 rounded-[1.5rem] transition-all hover:scale-110 hover:shadow-xl">
                <Bell className="h-8 w-8 text-primary" />
                {!isSimulating && <span className="absolute top-5 right-5 h-4 w-4 bg-accent rounded-full border-[4px] border-white shadow-xl animate-bounce"></span>}
              </Button>
              
              <div 
                onClick={() => setIsProfileDialogOpen(true)}
                className="h-16 w-16 rounded-[1.5rem] bg-accent overflow-hidden cursor-pointer shadow-2xl transition-all hover:scale-110 flex items-center justify-center font-black text-white text-2xl italic border-4 border-white/20"
              >
                {userData?.displayName?.charAt(0)}
              </div>
            </div>
          </header>
          
          <div className="flex-1 overflow-y-auto scrollbar-hide bg-[#FAFBFF]">
            {renderView()}
          </div>
        </main>
      </div>

      <ProfileEditDialog isOpen={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen} userData={userData} />
    </div>
  );
}

function SidebarNavItem({ href, icon: Icon, label, active = false, accent = false }: any) {
  return (
    <Button variant="ghost" className={cn("w-full justify-start rounded-[1.5rem] transition-all h-18 group relative overflow-hidden", active ? "bg-white/15 text-white font-black shadow-2xl" : "hover:bg-white/5 font-bold opacity-60 hover:opacity-100")} asChild>
      <Link href={href}>
        <Icon className={cn("mr-6 h-7 w-7 transition-transform group-hover:scale-125 duration-500", accent && "text-accent")} />
        <span className="text-lg tracking-tight italic uppercase">{label}</span>
        {active && <div className="absolute right-0 top-0 h-full w-2 bg-accent rounded-l-full shadow-[0_0_30px_rgba(245,158,11,1)]"></div>}
      </Link>
    </Button>
  );
}
