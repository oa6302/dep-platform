'use client';

import { useUser, useDoc, useAuth } from '@/firebase';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Loader2, LogOut, Home, Layout } from 'lucide-react';
import { AuthForm } from '@/components/auth-form';

export default function DashboardPage() {
  const { user, loading: authLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const { data: userData, loading: docLoading } = useDoc<any>(user?.uid ? `users/${user.uid}` : null);

  const handleLogout = async () => {
    if (!auth) return;
    await signOut(auth);
    router.push('/');
  };

  if (authLoading || (!!user && docLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <Loader2 className="h-10 w-10 animate-spin text-accent" />
      </div>
    );
  }

  if (!user || !userData) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-8">
        <AuthForm mode="login" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="py-12 px-8 border-b border-slate-50">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-6">
            <Button variant="ghost" size="icon" onClick={() => router.push('/')} className="h-12 w-12 rounded-xl bg-slate-50 border border-slate-100">
              <Home className="h-5 w-5" />
            </Button>
            <div className="h-8 w-px bg-slate-100 hidden sm:block" />
            <span className="font-black text-[10px] uppercase tracking-[0.4em] text-primary/30 italic hidden sm:block">AOS Clean Slate v4.8</span>
          </div>
          <Button variant="ghost" onClick={handleLogout} className="h-12 px-6 rounded-xl font-black text-xs uppercase tracking-widest gap-3 opacity-40 hover:opacity-100 transition-opacity">
            <LogOut className="h-4 w-4" /> Çıkış Yap
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-8 py-24">
        <div className="space-y-12">
          <div className="text-center space-y-4">
             <h2 className="text-6xl font-black text-primary italic uppercase tracking-tighter leading-none">Harekât <br /><span className="text-accent">Üssü</span></h2>
             <p className="text-lg text-slate-400 font-medium italic">Terminal operasyonlar için hazır bekliyor.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="p-16 border-4 border-dashed border-slate-100 rounded-[4rem] flex flex-col items-center justify-center text-center gap-6 group hover:border-accent/20 transition-colors cursor-pointer">
                <Layout className="h-12 w-12 text-slate-200 group-hover:text-accent transition-colors" />
                <p className="font-black text-xs uppercase tracking-widest text-slate-300">Yeni Modül Ekle</p>
             </div>
             <div className="p-16 border-4 border-dashed border-slate-100 rounded-[4rem] flex flex-col items-center justify-center text-center gap-6 group hover:border-primary/20 transition-colors cursor-pointer">
                <span className="text-4xl grayscale opacity-20 group-hover:grayscale-0 group-hover:opacity-100 transition-all">🏗️</span>
                <p className="font-black text-xs uppercase tracking-widest text-slate-300">Sistemi İnşa Et</p>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}
