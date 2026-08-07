'use client';

import { Suspense, useEffect } from 'react';
import { AuthForm } from '@/components/auth-form';
import Image from 'next/image';
import Link from 'next/link';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ChevronLeft, Sparkles, Loader2, ShieldCheck } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useUser } from '@/firebase';

function AuthContent() {
  const searchParams = useSearchParams();
  const mode = searchParams.get('tab') === 'register' ? 'register' : 'login';
  
  return <AuthForm mode={mode} />;
}

export default function LoginPage() {
  const { user, loading } = useUser();
  const router = useRouter();
  const logoUrl = PlaceHolderImages.find(img => img.id === 'app-logo')?.imageUrl || "https://picsum.photos/seed/edu-logo-102/400/400";

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] selection:bg-accent selection:text-white relative overflow-hidden font-body">
      {/* AOS v4.0 Background Neural Map Effect */}
      <div className="absolute top-[-25%] right-[-15%] w-[70%] h-[70%] bg-accent/5 blur-[200px] rounded-full animate-pulse"></div>
      <div className="absolute bottom-[-25%] left-[-15%] w-[70%] h-[70%] bg-primary/5 blur-[200px] rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-[0.02] pointer-events-none">
         <div className="w-full h-full bg-[radial-gradient(#0F172A_1px,transparent_1px)] [background-size:40px_40px]"></div>
      </div>

      <div className="w-full max-w-3xl px-8 py-16 relative z-10">
        <div className="flex flex-col items-center mb-16 animate-in fade-in slide-in-from-top-6 duration-1000">
          <div className="relative mb-10">
            <div className="h-32 w-32 rounded-[2.75rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(15,23,42,0.2)] border-[6px] border-white bg-white p-2.5 transition-transform hover:rotate-6 duration-500">
               <Image 
                src={logoUrl} 
                alt="DEK Logo" 
                fill 
                className="object-contain"
                priority
              />
            </div>
          </div>
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2.5 px-5 py-1.5 rounded-full bg-primary/5 border border-primary/10 text-primary font-black text-[10px] uppercase tracking-[0.4em] italic mb-4 shadow-sm">
               <ShieldCheck className="h-3.5 w-3.5 text-accent" /> Encrypted Node Connection
            </div>
            <h1 className="font-black text-6xl md:text-8xl text-primary tracking-tighter italic uppercase text-shadow-premium leading-none">
              AKADEMİK <span className="text-accent text-shadow-accent">AÇILIŞ</span>
            </h1>
            <p className="text-[11px] font-black uppercase tracking-[0.6em] text-muted-foreground/30 italic">Digital Education Coach v4.8 Stable</p>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-3xl rounded-[5rem] shadow-[0_120px_240px_-40px_rgba(15,23,42,0.2)] border border-white/20 overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-accent/10 transition-all duration-1000"></div>
          <Suspense fallback={<div className="p-32 text-center"><Loader2 className="h-12 w-12 animate-spin mx-auto text-accent" /></div>}>
            <AuthContent />
          </Suspense>
        </div>

        <div className="mt-16 flex justify-between items-center px-12 animate-in fade-in duration-1000 delay-500">
          <Link href="/" className="text-[12px] font-black uppercase tracking-[0.3em] text-muted-foreground hover:text-primary transition-all flex items-center gap-4 group/back">
            <div className="h-10 w-10 rounded-2xl bg-white border border-primary/5 flex items-center justify-center shadow-sm group-hover/back:bg-primary group-hover/back:text-white transition-all">
               <ChevronLeft className="h-4 w-4 group-hover/back:-translate-x-1 transition-transform" />
            </div>
            SİSTEME GERİ DÖN
          </Link>
          <div className="flex items-center gap-4 text-[11px] font-black uppercase tracking-[0.4em] text-muted-foreground/40 italic">
            <Sparkles className="h-4 w-4 text-accent animate-pulse" /> GÜVENLİ TERMİNAL AKTİF
          </div>
        </div>
      </div>
    </div>
  );
}