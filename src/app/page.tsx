
'use client';

import {
  Brain,
  Zap,
  Target,
  ChevronRight,
  Sparkles,
  Clock,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  const router = useRouter();

  const handleStartClick = () => {
    // Üyelik ve modal kaldırıldı, doğrudan otonom dashboard'a git
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
            SİSTEME BAĞLAN
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
                HEMEN BAŞLA
                <ChevronRight className="ml-3 h-6 w-6 transition-transform group-hover:translate-x-2" />
              </Button>
            </div>
          </div>
        </section>

        <section id="focus" className="relative w-full px-4 sm:px-8 mt-12 md:mt-24">
           <div className="bg-[#0F172A] rounded-[4rem] p-12 md:p-24 text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/10 blur-[150px] rounded-full"></div>
              <div className="grid lg:grid-cols-2 gap-20 items-center relative z-10">
                 <div className="space-y-8">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-accent font-black text-[10px] uppercase tracking-widest">
                       <Zap className="h-3.5 w-3.5" /> FOCUS ENGINE v4.8
                    </div>
                    <h2 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase leading-[0.9] text-shadow-premium">MAKSİMUM <br /><span className="text-accent">ODAKLANMA</span></h2>
                    <p className="text-xl opacity-60 italic leading-relaxed">Pomodoro tabanlı odak terminali ile çalışma ve mola sürelerini düzenle, akademik performansını stabil hale getir.</p>
                    <div className="grid grid-cols-2 gap-6 pt-10 border-t border-white/10">
                       <div><p className="text-4xl font-black text-accent md:text-6xl">25</p><p className="text-[10px] font-black uppercase tracking-widest opacity-40 mt-1">DAKİKA ÇALIŞMA</p></div>
                       <div><p className="text-4xl font-black text-white md:text-6xl">5</p><p className="text-[10px] font-black uppercase tracking-widest opacity-40 mt-1">DAKİKA MOLA</p></div>
                    </div>
                 </div>
                 <div className="bg-white/5 backdrop-blur-3xl rounded-[3rem] border border-white/10 p-12 text-center space-y-8 shadow-3xl">
                    <p className="text-7xl md:text-[8rem] font-black italic tracking-tighter text-white text-shadow-premium leading-none">25<span className="text-accent animate-pulse">:</span>00</p>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30 italic">FOKUSUNU YÖNET · HEDEFİNE ULAŞ</p>
                 </div>
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
        <p className="text-[9px] font-black uppercase italic tracking-[0.5em] text-primary/20">DIGITAL EDUCATION COACH · YKS TM EDITION · 2026</p>
      </footer>
    </div>
  );
}
