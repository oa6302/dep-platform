
'use client';

import { useUser, useDoc, useAuth } from '@/firebase';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useState, Suspense } from 'react';
import { 
  LogOut, LayoutDashboard, User, Brain, Headset, 
  BookOpen, PieChart, Loader2, Calendar, Target, 
  Award, Clock, TrendingUp, MessageSquare, Settings, 
  FileText, History, Star, Link as LinkIcon
} from 'lucide-react';
import { signOut } from 'firebase/auth';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ProfileEditDialog } from '@/components/profile-edit-dialog';
import { AuthForm } from '@/components/auth-form';
import { StudentView } from '@/components/dashboard/student-view';
import { TeacherView } from '@/components/dashboard/teacher-view';
import { AdminView } from '@/components/dashboard/admin-view';

function DashboardContent() {
  const { user, loading: authLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';
  const authMode = searchParams.get('auth') === 'register' ? 'register' : 'login';

  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const { data: userData, loading: docLoading } = useDoc<any>(user?.uid ? `users/${user.uid}` : null);

  const logoUrl = PlaceHolderImages.find((img) => img.id === 'app-logo')?.imageUrl || 'https://picsum.photos/seed/edu-logo-102/400/400';
  const isGlobalLoading = authLoading || (!!user && docLoading);

  const menuItems = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard?tab=overview' },
    { id: 'planning', label: 'Planlama', icon: Calendar, href: '/dashboard/planning' },
    { id: 'topics', label: 'Konu Takibi', icon: BookOpen, href: '/dashboard/topics' },
    { id: 'test-analysis', label: 'Test Analizi', icon: FileText, href: '/dashboard/analysis/test' },
    { id: 'deneme-analysis', label: 'Deneme Analizi', icon: Target, href: '/dashboard/analysis/deneme' },
    { id: 'links', label: 'Kaynak Linkleri', icon: LinkIcon, href: '/dashboard/links' },
    { id: 'awards', label: 'Ödüller', icon: Award, href: '/dashboard/awards' },
    { id: 'pomodoro', label: 'Pomodoro', icon: Clock, href: '/dashboard/pomodoro' },
    { id: 'tracking', label: 'Öğrenci Takip', icon: TrendingUp, href: '/dashboard/tracking' },
    { id: 'ai-assistant', label: 'AI Asistan', icon: Brain, href: '/dashboard/ai-analysis' },
    { id: 'settings', label: 'Ayarlar', icon: Settings, href: '#' },
  ];

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
        <div className="w-full max-w-4xl">
           <AuthForm mode={authMode} isProfileCompletion={!!user} />
        </div>
      </div>
    );
  }

  const renderView = () => {
    switch (userData?.role) {
      case 'admin': return <AdminView user={user} userData={userData} />;
      case 'teacher': return <TeacherView user={user} userData={userData} />;
      default: return <StudentView user={user} userData={userData} />;
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-[280px_1fr] bg-[#FAFBFF]">
      <aside className="bg-white text-slate-900 hidden lg:flex flex-col border-r border-slate-200 sticky top-0 h-screen z-50">
        <div className="p-8 flex flex-col gap-2">
           <div className="flex items-center gap-4">
              <div className="relative h-10 w-10 overflow-hidden rounded-xl">
                 <Image src={logoUrl} alt="Logo" fill className="object-contain" />
              </div>
              <div>
                 <span className="font-black text-xl block tracking-tighter italic uppercase text-primary leading-none">YKS TM PRO</span>
                 <span className="text-[8px] text-muted-foreground block font-bold uppercase tracking-[0.2em] mt-1">Academic OS v4.8</span>
              </div>
           </div>
           <div className="px-1 py-1 rounded-lg bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-widest text-center mt-2 border border-emerald-100">
             ☁️ Tüm Cihazlarla Senkron
           </div>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto scrollbar-hide py-4">
          {menuItems.map((item) => (
            <Button 
              key={item.id} 
              variant="ghost" 
              className={cn(
                'w-full justify-start rounded-xl h-12 group transition-all', 
                activeTab === item.id 
                  ? 'bg-primary/5 text-primary border border-primary/10 font-bold' 
                  : 'hover:bg-slate-50 text-muted-foreground hover:text-slate-900'
              )} 
              asChild
            >
              <Link href={item.href}>
                <item.icon className={cn("mr-3 h-5 w-5", activeTab === item.id ? "text-secondary" : "text-muted-foreground/60")} />
                <span className="text-[11px] uppercase tracking-wider">{item.label}</span>
              </Link>
            </Button>
          ))}
        </nav>

        <div className="p-6 mt-auto">
           <div onClick={() => setIsProfileDialogOpen(true)} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-3 cursor-pointer hover:bg-slate-100 transition-all">
              <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center text-white font-black text-sm">
                {userData?.displayName?.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-black truncate uppercase text-primary">{userData?.displayName}</p>
                <p className="text-[8px] text-muted-foreground uppercase font-bold tracking-widest">AKADEMİK PROFİL</p>
              </div>
              <LogOut className="h-4 w-4 text-muted-foreground hover:text-destructive transition-all" onClick={(e) => { e.stopPropagation(); handleLogout(); }} />
           </div>
        </div>
      </aside>

      <main className="flex flex-col relative overflow-y-auto">
        {renderView()}
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
