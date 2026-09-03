'use client';

import { Button } from '@/components/ui/button';
import { 
  Brain, 
  Zap, 
  Target, 
  ChevronRight, 
  Sparkles, 
  Clock,
  LayoutDashboard,
  ShieldCheck,
  TrendingUp
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#F8FAFC] selection:bg-accent selection:text-white overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/70 backdrop-blur-2xl border-b border-primary/5 py-4">
        <div className="container mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center text-white font-black italic shadow-xl">D</div>
             <span className="text-xl font-black italic tracking-tighter text-primary uppercase">DEK <span className="text-accent">AI</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {['VİZYON', 'ÖZELLİKLER', 'UZMANLAR', 'İLETİŞİM'].map((item) => (
              <button key={item} className="text-[10px] font-black tracking-[0.2em] text-primary/40 hover:text-primary transition-all uppercase">{item}</button>
            ))}
          </div>
          <Button onClick={() => router.push('/dashboard')} className="h-12 px-8 rounded-xl bg-primary hover:bg-accent text-white font-black text-xs uppercase tracking-widest shadow-2xl shadow-primary/20 transition-all">SİSTEME GİRİŞ</Button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-6">
          <div className="flex flex-col items-center text-center space-y-12 max-w-5xl mx-auto">
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-primary text-white font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-primary/30 animate-in fade-in slide-in-from-top-4 duration-1000">
              <Sparkles className="h-4 w-4 text-accent animate-pulse" /> EĞİTİMİN YENİ NESİL TERMİNALİ
            </div>
            
            <h1 className="text-7xl md:text-[9rem] font-black text-primary tracking-tighter leading-[0.85] italic text-shadow-premium uppercase animate-in fade-in slide-in-from-bottom-8 duration-1000">
              BAŞARIYI <br /><span className="text-accent text-shadow-accent">OTOMATİZE ET.</span>
            </h1>

            <p className="text-2xl text-muted-foreground font-medium leading-relaxed italic max-w-3xl mx-auto animate-in fade-in duration-1000 delay-300">
              Dijital Eğitim Koçu, her saniyenizi saniyeler içinde analiz eden, hedeflerinizi saniyeler içinde akademik bir plana dönüştüren yaşayan bir yapay zeka ekosistemidir.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-6 pt-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500">
              <Button onClick={() => router.push('/dashboard')} size="lg" className="h-20 px-16 rounded-[2rem] bg-primary hover:bg-accent text-white font-black text-xl uppercase tracking-widest shadow-[0_40px_80px_-20px_rgba(15,23,42,0.45)] hover:scale-105 transition-all group">
                HEMEN BAŞLA <ChevronRight className="ml-4 h-6 w-6 group-hover:translate-x-2 transition-transform" />
              </Button>
              <Button onClick={() => router.push('/dashboard/pomodoro')} variant="outline" size="lg" className="h-20 px-12 rounded-[2rem] border-2 border-primary/5 bg-white text-primary font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all">
                <Clock className="mr-3 h-5 w-5 text-accent" /> FOCUS TERMİNALİ
              </Button>
            </div>
          </div>
        </div>

        {/* Feature Preview (Live Terminal) */}
        <section className="mt-40 relative">
          <div className="absolute inset-0 bg-primary skew-y-3 translate-y-32 -z-10 h-full"></div>
          <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-12 text-white">
               <h2 className="text-6xl font-black italic tracking-tighter leading-tight uppercase">Maksimum <br /><span className="text-accent">Odaklanma</span></h2>
               <p className="text-xl opacity-60 font-medium leading-relaxed italic">Apple tasarım standartlarında saniyeler içinde optimize edilmiş Pomodoro terminali ile ders çalışma seanslarınızın verimini saniyeler içinde %40 artırın.</p>
               <div className="grid grid-cols-2 gap-8 pt-8">
                  <div className="space-y-2">
                     <p className="text-5xl font-black text-accent">%94</p>
                     <p className="text-[10px] font-black uppercase tracking-widest opacity-40 italic">ODAK SKORU</p>
                  </div>
                  <div className="space-y-2">
                     <p className="text-5xl font-black">25dk</p>
                     <p className="text-[10px] font-black uppercase tracking-widest opacity-40 italic">İDEAL SEANS</p>
                  </div>
               </div>
            </div>
            
            {/* Visual Preview of Pomodoro */}
            <div className="bg-white rounded-[4rem] p-12 shadow-[0_60px_120px_-30px_rgba(0,0,0,0.5)] border border-white/10 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-48 h-48 bg-accent/5 blur-[80px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
               <div className="text-center space-y-10 py-10">
                  <div className="flex justify-center gap-4">
                     <span className="px-8 py-2.5 rounded-full bg-primary text-white text-[10px] font-black tracking-widest">ÇALIŞMA</span>
                     <span className="px-8 py-2.5 rounded-full bg-slate-50 text-muted-foreground text-[10px] font-black tracking-widest">MOLA</span>
                  </div>
                  <p className="text-[10rem] font-black italic tracking-tighter text-primary leading-none text-shadow-deep">25<span className="text-accent animate-pulse">:</span>00</p>
                  <div className="flex justify-center gap-6">
                     <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center text-white"><Zap className="h-6 w-6" /></div>
                     <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center text-primary"><TrendingUp className="h-6 w-6" /></div>
                  </div>
               </div>
            </div>
          </div>
        </section>

        {/* Global Features Grid */}
        <section className="container mx-auto px-6 py-40">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {[
                { title: "AI AKADEMİK KOÇ", icon: Brain, desc: "Saniyeler içinde öğrenme profilini çıkarır." },
                { title: "DİNAMİK PLANLAMA", icon: Target, iconColor: "text-accent", desc: "Zayıf konularına odaklanan saniyeler içinde akıllı takvim." },
                { title: "GÜVENLİ TESCİL", icon: ShieldCheck, desc: "Tüm akademik verilerin bulutta saniyeler içinde tescillenir." }
              ].map((f, i) => (
                <div key={i} className="p-12 bg-white rounded-[3.5rem] border border-primary/5 shadow-xl hover:shadow-2xl transition-all group">
                   <div className="h-20 w-20 rounded-[1.75rem] bg-slate-50 flex items-center justify-center mb-8 shadow-inner group-hover:scale-110 transition-all">
                      <f.icon className={cn("h-10 w-10", f.iconColor || "text-primary")} />
                   </div>
                   <h3 className="text-2xl font-black italic tracking-tighter text-primary uppercase mb-4">{f.title}</h3>
                   <p className="text-lg font-medium text-muted-foreground italic leading-relaxed">{f.desc}</p>
                </div>
              ))}
           </div>
        </section>
      </main>

      <footer className="py-12 border-t border-primary/5 text-center">
         <p className="text-[10px] font-black uppercase tracking-[0.5em] text-primary/20 italic">DIGITAL EDUCATION COACH v4.8 | © 2026 PREMIUM TERMINAL</p>
      </footer>
    </div>
  );
}
