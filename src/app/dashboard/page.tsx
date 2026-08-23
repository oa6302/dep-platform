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
  Loader2,
  Home,
  Compass,
  Calendar,
  ShieldCheck,
  ShieldAlert,
  ArrowLeft,
  XCircle,
  Eye,
  BookOpen,
  PieChart,
  Target,
  Video,
  FileQuestion,
  History
} from 'lucide-react';

import { signOut } from 'firebase/auth';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ProfileEditDialog } from '@/components/profile-edit-dialog';
import { AuthForm } from '@/components/auth-form';

import { StudentView } from '@/components/dashboard/student-view';
import { TeacherView } from '@/components/dashboard/teacher-view';
import { AdminView } from '@/components/dashboard/admin-view';
import { SchoolAdminView } from '@/components/dashboard/school-admin-view';

function DashboardContent() {
  const { user, loading: authLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const simulatedUserId = searchParams.get('simulate');
  const authTab = searchParams.get('tab') === 'register' ? 'register' : 'login';

  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);

  const { data: userData, loading: docLoading } = useDoc<any>(user?.uid ? `users/${user.uid}` : null);
  const { data: simulatedUserData } = useDoc<any>(simulatedUserId ? `users/${simulatedUserId}` : null);

  const isSimulating = Boolean(simulatedUserId);
  const currentViewData = useMemo(() => {
    if (isSimulating) return simulatedUserData;
    if (userData) return userData;
    return null;
  }, [isSimulating, simulatedUserData, userData]);

  const currentViewUid = isSimulating ? simulatedUserId : user?.uid;
  const logoUrl = PlaceHolderImages.find((img) => img.id === 'app-logo')?.imageUrl || 'https://picsum.photos/seed/edu-logo-102/400/400';
  const isGlobalLoading = authLoading || (!!user && docLoading);

  const dynamicMenu = useMemo(() => {
    if (!currentViewData) return [];
    
    return [
      { label: 'Akademik Panel', icon: LayoutDashboard, href: '/dashboard' },
      { label: 'İçerik Merkezi', icon: BookOpen, href: '/dashboard/planning' },
      { label: 'Eğitmen', icon: User, href: '/dashboard/discover' },
      { label: 'Analiz & Risk', icon: PieChart, href: '/dashboard/ai-analysis' },
      { label: 'Yanlışlarım', icon: History, href: '#' },
      { label: 'Destek', icon: Headset, href: '/dashboard/contact' },
    ];
  }, [currentViewData]);

  const handleLogout = async () => {
    if (!auth) return;
    await signOut(auth);
    router.push('/dashboard');
  };

  if (isGlobalLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
      <Loader2 className="h-12 w-12 animate-spin text-accent" />
    </div>
  );

  if (!user || !userData) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-4xl space-y-12">
           <AuthForm mode={authTab} isProfileCompletion={!!user} />
        </div>
      </div>
    );
  }

  const renderView = () => {
    switch (currentViewData?.role) {
      case 'admin': return <AdminView user={{ uid: currentViewUid }} userData={currentViewData} />;
      case 'teacher': return <TeacherView user={{ uid: currentViewUid }} userData={currentViewData} />;
      case 'school_admin': return <SchoolAdminView user={{ uid: currentViewUid }} userData={currentViewData} />;
      default: return <StudentView user={{ uid: currentViewUid }} userData={currentViewData} isReadOnly={isSimulating} />;
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-[280px_1fr] bg-[#FAFBFF]">
      <aside className="bg-[#0F172A] text-white hidden lg:flex flex-col shadow-2xl sticky top-0 h-screen z-50">
        <div className="p-10 flex items-center gap-4">
           <div className="relative h-12 w-12 overflow-hidden rounded-xl bg-white p-2">
              <Image src={logoUrl} alt="DEK Logo" fill className="object-contain" />
           </div>
           <div>
              <span className="font-black text-2xl block tracking-tighter italic uppercase leading-none">DEK</span>
              <span className="text-[7px] opacity-40 block font-black uppercase tracking-widest mt-1">AOS v4.8 Stable</span>
           </div>
        </div>

        <nav className="flex-1 px-6 space-y-1 pt-6">
          {dynamicMenu.map((item, index) => (
            <Button key={index} variant="ghost" className={cn('w-full justify-start rounded-2xl h-14 group', (item.label === 'Akademik Panel') ? 'bg-white/10 text-white font-black' : 'hover:bg-white/5 opacity-40 hover:opacity-100')} asChild>
              <Link href={item.href}>
                <item.icon className="mr-5 h-5 w-5" />
                <span className="text-xs font-bold tracking-tight italic uppercase">{item.label}</span>
              </Link>
            </Button>
          ))}
        </nav>

        <div className="p-8">
           <div onClick={() => setIsProfileDialogOpen(true)} className="p-5 bg-white/5 rounded-3xl border border-white/5 flex items-center gap-4 cursor-pointer hover:bg-white/10 transition-all">
              <div className="h-10 w-10 rounded-xl bg-accent flex items-center justify-center text-primary font-black text-lg italic">
                {userData?.displayName?.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black truncate uppercase">{userData?.displayName}</p>
                <p className="text-[7px] opacity-40 uppercase tracking-widest">AKADEMİK DÜĞÜM</p>
              </div>
              <LogOut className="h-4 w-4 opacity-20 hover:text-destructive transition-all" onClick={(e) => { e.stopPropagation(); handleLogout(); }} />
           </div>
        </div>
      </aside>

      <main className="flex flex-col relative">
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {renderView()}
        </div>
      </main>

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
