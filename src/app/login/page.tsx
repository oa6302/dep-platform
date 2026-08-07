
'use client';

import { Suspense } from 'react';
import { AuthForm } from '@/components/auth-form';
import Image from 'next/image';
import Link from 'next/link';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ChevronLeft, Sparkles, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const logoUrl = PlaceHolderImages.find(img => img.id === 'app-logo')?.imageUrl || "https://picsum.photos/seed/edu-logo-102/400/400";

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] selection:bg-accent selection:text-white relative overflow-hidden">
      {/* Background Soft Glows */}
      <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-accent/5 blur-[150px] rounded-full"></div>
      <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/5 blur-[150px] rounded-full"></div>

      <div className="w-full max-w-xl px-6 py-12 relative z-10">
        <div className="flex flex-col items-center mb-12 animate-in fade-in slide-in-from-top-4 duration-1000">
          <div className="relative mb-8">
            <div className="h-28 w-28 rounded-[2.5rem] overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] border-4 border-white bg-white p-2">
               <Image 
                src={logoUrl} 
                alt="DEK Logo" 
                fill 
                className="object-contain"
                priority
              />
            </div>
          </div>
          <div className="text-center space-y-1">
            <h1 className="font-black text-5xl md:text-6xl text-primary tracking-tighter italic uppercase text-shadow-premium">
              AKADEMİK <span className="text-accent text-shadow-accent">AÇILIŞ</span>
            </h1>
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-muted-foreground/40 italic">DİJİTAL EĞİTİM KOÇU V4.0</p>
          </div>
        </div>

        <div className="bg-white rounded-[4rem] shadow-[0_80px_160px_-40px_rgba(15,23,42,0.12)] border border-primary/5 overflow-hidden">
          <Suspense fallback={<div className="p-20 text-center"><Loader2 className="h-10 w-10 animate-spin mx-auto text-accent" /></div>}>
            <AuthForm mode="register" />
          </Suspense>
        </div>

        <div className="mt-12 flex justify-between items-center px-10 animate-in fade-in duration-1000 delay-500">
          <Link href="/" className="text-[11px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group">
            <ChevronLeft className="h-3.5 w-3.5 group-hover:-translate-x-1 transition-transform" /> GERİ DÖN
          </Link>
          <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground/30 italic">
            <Sparkles className="h-3 w-3 text-accent" /> GÜVENLİ BAĞLANTI AKTİF
          </div>
        </div>
      </div>
    </div>
  );
}
