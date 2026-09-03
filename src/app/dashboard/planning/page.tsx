'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Home } from 'lucide-react';

export default function PlanningPage() {
  const router = useRouter();
  return (
    <div className="p-12 min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center gap-12">
      <div className="flex gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-14 w-14 rounded-2xl bg-white shadow-xl border border-slate-100 hover:bg-primary hover:text-white transition-all">
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard')} className="h-14 w-14 rounded-2xl bg-white shadow-xl border border-slate-100 hover:bg-primary hover:text-white transition-all">
          <Home className="h-6 w-6" />
        </Button>
      </div>
      <div className="text-center space-y-6">
        <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-slate-100 text-slate-400 font-black text-[10px] uppercase tracking-widest">
           Sistem Beklemede
        </div>
        <h2 className="text-6xl font-black text-primary uppercase italic tracking-tighter opacity-10">Planlama Boş</h2>
        <p className="text-slate-400 font-medium italic">Tüm akademik takvim verileri saniyeler içinde temizlendi.</p>
      </div>
    </div>
  );
}
