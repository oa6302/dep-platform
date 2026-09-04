
'use client';

import {
  Brain,
  Zap,
  Target,
  ChevronRight,
  Sparkles,
  Clock,
  TrendingUp,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function LandingPage() {
  const router = useRouter();

  const handleStartClick = () => {
    // Üyelik kaldırıldı, doğrudan Dashboard'a git
    router.push('/dashboard');
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  const features = [
    {
      title: 'AI AKADEMİK KOÇ',
      icon: Brain,
      desc: 'Öğrenme profilini analiz eder, eksiklerini belirler ve sana uygun çalışma önerileri oluşturur.',
    },
    {
      title: 'DİNAMİK PLANLAMA',
      icon: Target,
      iconColor: 'text-accent',
      desc: 'Hedeflerine, başarı durumuna ve çalışma performansına göre yaşayan bir akademik takvim oluşturur.',
    },
    {
      title: 'YKS TM ODAKLI',
      icon: ShieldCheck,
      desc: 'Sistem sadece YKS Eşit Ağırlık müfredatıyla tam senkronize çalışır.',
    },
  ];

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#F8FAFC] selection:bg-accent selection:text-white">
      <nav className="fixed inset-x-0 top-0 z-50 border-b border-primary/5 bg-white/85 py-3 backdrop-blur-2xl">
        <div className="container mx-auto flex items-center justify-between px-5 md:px-6">
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary font-black italic text-white shadow-xl">
              D
            </div>
            <span className="text-lg font-black uppercase italic tracking-tighter text-primary md:text-xl">
              DEK <span className="text-accent">AI</span>
            </span>
          </button>

          <div className="hidden items-center gap-7 md:flex">
            <button type="button" onClick={() => scrollToSection('vision')} className="text-[9px] font-black uppercase tracking-[0.2em] text-primary/40 hover:text-primary transition-all">VİZYON</button>
            <button type="button" onClick={() => scrollToSection('features')} className="text-[9px] font-black uppercase tracking-[0.2em] text-primary/40 hover:text-primary transition-all">ÖZELLİKLER</button>
            <button type="button" onClick={() => scrollToSection('focus')} className="text-[9px] font-black uppercase tracking-[0.2em] text-primary/40 hover:text-primary transition-all">ODAK</button>
          </div>

          <Button
            onClick={handleStartClick}
            className="h-11 rounded-xl border-none bg-primary px-5 text-[9px] font-black uppercase tracking-widest text-white shadow-xl shadow-primary/20 hover:bg-accent transition-all md:h-12 md:px-8 md:text-[10px]"
          >
            PANELİME GİT
          </Button>
        </div>
      </nav>

      <main className="w-full pt-28">
        <section id="vision" className="container mx-auto px-5 py-14 md:px-6 md:py-24">
          <div className="mx-auto flex max-w-7xl flex-col items-center space-y-8 text-center md:space-y-12">
            <div className="inline-flex items-center gap-3 rounded-full bg-primary px-5 py-2.5 text-[8px] font-black uppercase tracking-widest text-white shadow-2xl shadow-primary/20 md:text-[10px]">
              <Sparkles className="h-4 w-4 animate-pulse text-accent" />
              YKS TM MASTER TERMİNALİ
            </div>
            <h1 className="text-5xl font-black uppercase italic leading-[0.86] tracking-tighter text-primary text-shadow-premium md:text-7xl lg:text-[8rem]">
              YKS BAŞARISINI <br /><span className="text-accent text-shadow-accent">PLANLA.</span>
            </h1>
            <p className="max-w-3xl px-4 text-base font-medium italic leading-relaxed text-muted-foreground md:text-2xl">
              Yapay zeka destekli otonom planlama motoruyla Eşit Ağırlık hedeflerine saniyeler içinde odaklan.
            </p>
            <div className="flex w-full flex-col items-center gap-4 px-4 pt-5 sm:w-auto sm:flex-row md:gap-6 md:pt-8">
              <Button
                onClick={handleStartClick}
                size="lg"
                className="group h-18 w-full rounded-[1.8rem] border-none bg-primary px-10 text-lg font-black uppercase tracking-widest text-white shadow-[0_30px_70px_-20px_rgba(15,23,42,0.45)] transition-all hover:scale-[1.03] hover:bg-accent sm:w-auto md:h-20 md:px-14 md:text-xl"
              >
                ÜCRETSİZ BAŞLA
                <ChevronRight className="ml-3 h-6 w-6 transition-transform group-hover:translate-x-2" />
              </Button>
            </div>
          </div>
        </section>

        <section id="features" className="container mx-auto w-full px-5 py-28 md:px-6 md:py-40">
           <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-10">
              {features.map((feature, index) => (
                <div key={index} className="group rounded-[3.5rem] border border-primary/5 bg-white p-12 shadow-xl hover:-translate-y-2 transition-all duration-500">
                  <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-[1.25rem] bg-slate-50 shadow-inner group-hover:bg-accent group-hover:text-white transition-all">
                    <feature.icon className="h-8 w-8" />
                  </div>
                  <h3 className="mb-4 text-2xl font-black uppercase italic text-primary">{feature.title}</h3>
                  <p className="text-sm font-medium italic leading-relaxed text-muted-foreground">{feature.desc}</p>
                </div>
              ))}
           </div>
        </section>
      </main>

      <footer className="border-t border-primary/5 bg-white py-12 text-center">
        <p className="text-[9px] font-black uppercase italic tracking-[0.5em] text-primary/20">DIGITAL EDUCATION COACH · YKS TM EDITION</p>
      </footer>
    </div>
  );
}
