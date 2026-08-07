'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { AuthForm } from '@/components/auth-form';
import Image from 'next/image';
import Link from 'next/link';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ChevronLeft, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  const router = useRouter();
  const logoUrl = PlaceHolderImages.find(img => img.id === 'app-logo')?.imageUrl || "https://picsum.photos/seed/edu-logo-99/400/400";

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] selection:bg-accent selection:text-white relative overflow-hidden">
      {/* Background Mesh Gradients */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent/5 blur-[120px] rounded-full animate-pulse"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/5 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>

      <div className="w-full max-w-2xl px-6 py-12 relative z-10">
        <div className="flex flex-col items-center mb-12 animate-in fade-in slide-in-from-top-4 duration-1000">
          <Link href="/" className="group flex flex-col items-center gap-6">
            <div className="relative h-24 w-24 overflow-hidden rounded-[2.5rem] shadow-2xl transition-all group-hover:scale-105 bg-white p-2 border-[6px] border-primary/5">
              <Image 
                src={logoUrl} 
                alt="DEK Logo" 
                fill 
                className="object-contain"
                priority
              />
            </div>
            <div className="text-center space-y-2">
              <h1 className="font-black text-4xl md:text-5xl text-primary tracking-tighter italic uppercase text-shadow-premium">
                Akademik <span className="text-accent">Açılış</span>
              </h1>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground opacity-40">Dijital Eğitim Koçu v4.0</p>
            </div>
          </Link>
        </div>

        <div className="bg-white/40 backdrop-blur-3xl rounded-[4rem] border border-white/50 shadow-[0_80px_160px_-40px_rgba(15,23,42,0.15)] overflow-hidden">
          <Suspense fallback={<div className="p-20 text-center"><Loader2 className="h-10 w-10 animate-spin mx-auto text-accent" /></div>}>
            <AuthForm mode="register" />
          </Suspense>
        </div>

        <div className="mt-12 flex justify-between items-center px-8 animate-in fade-in duration-1000 delay-500">
          <Link href="/" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group">
            <ChevronLeft className="h-3 w-3 group-hover:-translate-x-1 transition-transform" /> Geri Dön
          </Link>
          <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 italic">
            <Sparkles className="h-3 w-3 text-accent" /> Güvenli Bağlantı Aktif
          </div>
        </div>
      </div>
    </div>
  );
}
