'use client';

import { Button } from '@/components/ui/button';
import { 
  Brain, 
  Zap, 
  Target, 
  ChevronRight, 
  Sparkles, 
  Clock,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#F8FAFC] selection:bg-accent selection:text-white overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-2xl border-b border-primary/5 py-4">
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
          <Button onClick={() => router.push('/dashboard')} className="h-12 px-8 rounded-xl bg-primary hover:bg-accent text-white font-black text-[10px] md:text-xs uppercase tracking-widest shadow-2xl shadow-primary/20 transition-all">SİSTEME GİRİŞ</Button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-6">
          <div className="flex flex-col items-center text-center space-y-8 md:space-y-12 max-w-5xl mx-auto">
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-primary text-white font-black text-[9px] md:text-[10px] uppercase tracking-widest shadow-2xl shadow-primary/30 animate-in fade-in slide-in-from-top-4 duration-1000">
              <Sparkles className="h-4 w-4 text-accent animate-pulse" /> EĞİTİMİN YENİ NESİL TERMİNALİ
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-[8.5rem] font-black text-primary tracking-tighter leading-[0.85] italic text-shadow-premium uppercase animate-in fade-in slide-in-from-bottom-8 duration-1000">
              BAŞARIYI <br /><span className="text-accent text-shadow-accent">OTOMATİZE ET.</span>
            </h1>

            <p className="text-lg md:text-2xl text-muted-foreground font-medium leading-relaxed italic max-w-3xl mx-auto animate-in fade-in duration-1000 delay-300">
              Dijital Eğitim Koçu, her saniyenizi analiz eden, hedeflerinizi anında akademik bir plana dönüştüren yaşayan bir yapay zeka ekosistemidir.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-6 pt-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500 w-full sm:w-auto px-4">
              <Button onClick={() => router.push('/dashboard')} size="lg" className="w-full sm:w-auto h-20 px-12 md:px-16 rounded-[2rem] bg-primary hover:bg-accent text-white font-black text-xl uppercase tracking-widest shadow-[0_40px_80px_-20px_rgba(15,23,42,0.45)] hover:scale-105 transition-all group">
                HEMEN BAŞLA <ChevronRight className="ml-4 h-6 w-6 group-hover:translate-x-2 transition-transform" />
              </Button>
              <Button onClick={() => router.push('/dashboard/pomodoro')} variant="outline" size="lg" className="w-full sm:w-auto h-20 px-12 rounded-[2rem] border-2 border-primary/5 bg-white text-primary font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all">
                <Clock className="mr-3 h-5 w-5 text-accent" /> FOCUS TERMİNALİ
              </Button>
            </div>
          </div>
        </div>

        {/* Feature Preview (Live Terminal) - CONTRAST FIXED */}
        <section className="mt-40 relative w-full md:w-[calc(100%-80px)] md:mx-10 py-24 md:py-32 bg-primary rounded-[3rem] md:rounded-[5rem] overflow-hidden group shadow-2xl">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent/5 blur-[150px] rounded-full translate-x-1/3 -translate-y-1/3" />
          <div className="container mx-auto grid lg:grid-cols-2 gap-20 items-center relative z-10 px-6 md:px-12">
            <div className="space-y-10 text-white text-center lg:text-left">
               <h2 className="text-4xl md:text-7xl lg:text-8xl font-black italic tracking-tighter leading-[0.85] uppercase text-shadow-premium text-white">Maksimum <br /><span className="text-accent text-shadow-accent">Odaklanma</span></h2>
               <p className="text-lg md:text-2xl text-white/70 font-medium leading-relaxed italic max-w-xl">
                 Apple tasarım standartlarında optimize edilmiş Pomodoro terminali ile ders çalışma seanslarınızın verimini anında %40 artırın.
               </p>
               <div className="grid grid-cols-2 gap-8 md:gap-12 pt-10 border-t border-white/5">
                  <div>
                     <p className="text-4xl md:text-7xl font-black text-accent text-shadow-accent">%94</p>
                     <p className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.4em] opacity-40 italic mt-2">ODAK SKORU</p>
                  </div>
                  <div>
                     <p className="text-4xl md:text-7xl font-black text-white text-shadow-deep">25dk</p>
                     <p className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.4em] opacity-40 italic mt-2">İDEAL SEANS</p>
                  </div>
               </div>
            </div>
            
            <div className="bg-white/5 backdrop-blur-3xl rounded-[3rem] md:rounded-[4rem] p-8 md:p-16 border border-white/10 shadow-3xl text-center space-y-12 w-full">
               <div className="flex justify-center gap-4">
                  <span className="px-6 md:px-8 py-3 rounded-2xl bg-white text-primary text-[8px] md:text-[10px] font-black tracking-widest shadow-xl">ÇALIŞMA</span>
                  <span className="px-6 md:px-8 py-3 rounded-2xl bg-white/5 text-white/40 text-[8px] md:text-[10px] font-black tracking-widest">MOLA</span>
               </div>
               <p className="text-[5rem] md:text-[11rem] font-black italic tracking-tighter text-white leading-none text-shadow-premium">25<span className="text-accent animate-pulse">:</span>00</p>
               <div className="flex justify-center gap-6 md:gap-8">
                  <div className="h-14 w-14 md:h-20 md:w-20 rounded-full bg-accent flex items-center justify-center text-primary shadow-2xl shadow-accent/20"><Zap className="h-6 w-6 md:h-8 md:w-8" /></div>
                  <div className="h-14 w-14 md:h-20 md:w-20 rounded-full bg-white/10 flex items-center justify-center text-white border border-white/10"><TrendingUp className="h-6 w-6 md:h-8 md:w-8" /></div>
               </div>
            </div>
          </div>
        </section>

        {/* Global Features Grid - DYNAMIC WIDTH FIX */}
        <section className="container mx-auto px-6 py-40">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {[
                { title: "AI AKADEMİK KOÇ", icon: Brain, desc: "Saniyeler içinde öğrenme profilini çıkarır ve eksiklerini tespit eder." },
                { title: "DİNAMİK PLANLAMA", icon: Target, iconColor: "text-accent", desc: "Zayıf olduğun konulara odaklanan, saniyeler içinde yaşayan akıllı takvim." },
                { title: "GÜVENLİ TESCİL", icon: ShieldCheck, desc: "Tüm akademik verilerin ve başarıların bulutta saniyeler içinde tescillenir." }
              ].map((f, i) => (
                <div key={i} className="p-8 md:p-12 bg-white rounded-[2.5rem] md:rounded-[3.5rem] border border-primary/5 shadow-xl hover:shadow-2xl transition-all duration-500 group text-center md:text-left hover:-translate-y-3">
                   <div className="h-16 w-16 md:h-20 md:w-20 rounded-[1.25rem] md:rounded-[1.75rem] bg-slate-50 flex items-center justify-center mb-8 md:mb-10 shadow-inner group-hover:scale-110 group-hover:rotate-6 transition-all mx-auto md:ml-0">
                      <f.icon className={cn("h-8 w-8 md:h-10 md:w-10", f.iconColor || "text-primary")} />
                   </div>
                   <h3 className="text-xl md:text-3xl font-black italic tracking-tighter text-primary uppercase mb-4">{f.title}</h3>
                   <p className="text-base md:text-lg font-medium text-muted-foreground italic leading-relaxed opacity-70">{f.desc}</p>
                </div>
              ))}
           </div>
        </section>
      </main>

      <footer className="py-12 border-t border-primary/5 text-center px-6">
         <p className="text-[9px] font-black uppercase tracking-[0.5em] text-primary/20 italic">DIGITAL EDUCATION COACH v4.8 | © 2026 PREMIUM TERMINAL</p>
      </footer>
    </div>
  );
}
