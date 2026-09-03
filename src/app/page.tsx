'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC]">
      <div className="text-center space-y-8 max-w-md mx-auto p-12 bg-white rounded-[3rem] shadow-xl border border-slate-100">
        <div className="h-20 w-20 bg-primary/5 rounded-[1.75rem] flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">✨</span>
        </div>
        <h1 className="text-5xl font-black italic tracking-tighter text-primary uppercase leading-none">TEMİZ <br /><span className="text-accent">SAYFA</span></h1>
        <p className="text-slate-500 font-medium italic">Sistem tamamen temizlendi. Yeni mimariyi inşa etmeye saniyeler içinde başlayabilirsiniz.</p>
        <Button asChild className="w-full h-16 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest shadow-2xl shadow-primary/20 hover:bg-accent transition-all">
          <Link href="/dashboard">Sistemi Başlat</Link>
        </Button>
      </div>
    </div>
  );
}
