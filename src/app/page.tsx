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
import {
  useEffect,
  useState,
} from 'react';

import { Button } from '@/components/ui/button';
import { AuthForm } from '@/components/auth-form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useUser } from '@/firebase';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

export default function LandingPage() {
  const router = useRouter();
  const { user } = useUser();

  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Zaten giriş yapmışsa dashboard'a otonom fırlatır
  useEffect(() => {
    if (user) {
      router.replace('/dashboard');
    }
  }, [user, router]);

  const handleStartClick = () => {
    if (user) {
      router.replace('/dashboard');
      return;
    }
    setIsAuthOpen(true);
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
      title: 'GÜVENLİ AKADEMİK PROFİL',
      icon: ShieldCheck,
      desc: 'Çalışma geçmişin, hedeflerin ve akademik ilerlemen güvenli bir profil altında takip edilir.',
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
            <button
              type="button"
              onClick={() => scrollToSection('vision')}
              className="text-[9px] font-black uppercase tracking-[0.2em] text-primary/40 transition-all hover:text-primary"
            >
              VİZYON
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('features')}
              className="text-[9px] font-black uppercase tracking-[0.2em] text-primary/40 transition-all hover:text-primary"
            >
              ÖZELLİKLER
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('focus')}
              className="text-[9px] font-black uppercase tracking-[0.2em] text-primary/40 transition-all hover:text-primary"
            >
              ODAK
            </button>
          </div>

          <Button
            onClick={handleStartClick}
            className="h-11 rounded-xl border-none bg-primary px-5 text-[9px] font-black uppercase tracking-widest text-white shadow-xl shadow-primary/20 transition-all hover:bg-accent md:h-12 md:px-8 md:text-[10px]"
          >
            {user ? 'PANELİME GİT' : 'SİSTEME GİRİŞ'}
          </Button>
        </div>
      </nav>

      <main className="w-full pt-28">

        <section id="vision" className="container mx-auto px-5 py-14 md:px-6 md:py-24">
          <div className="mx-auto flex max-w-7xl flex-col items-center space-y-8 text-center md:space-y-12">
            <div className="inline-flex items-center gap-3 rounded-full bg-primary px-5 py-2.5 text-[8px] font-black uppercase tracking-widest text-white shadow-2xl shadow-primary/20 animate-in fade-in slide-in-from-top-4 duration-700 md:text-[10px]">
              <Sparkles className="h-4 w-4 animate-pulse text-accent" />
              EĞİTİMİN YENİ NESİL TERMİNALİ
            </div>

            <h1 className="text-5xl font-black uppercase italic leading-[0.86] tracking-tighter text-primary text-shadow-premium animate-in fade-in slide-in-from-bottom-8 duration-1000 md:text-7xl lg:text-[8rem]">
              BAŞARIYI <br /><span className="text-accent text-shadow-accent">PLANLA.</span>
            </h1>

            <p className="max-w-3xl px-4 text-base font-medium italic leading-relaxed text-muted-foreground animate-in fade-in duration-1000 md:text-2xl">
              Dijital Eğitim Koçu; akademik hedeflerinizi analiz eden, çalışma planınızı otonom oluşturan ve gelişiminizi günlük olarak takip eden yapay zekâ destekli eğitim ekosistemidir.
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

              <Button
                onClick={() => router.push('/dashboard/pomodoro')}
                variant="outline"
                size="lg"
                className="h-18 w-full rounded-[1.8rem] border-2 border-primary/5 bg-white px-10 text-xs font-black uppercase tracking-widest text-primary shadow-sm transition-all hover:bg-slate-50 sm:w-auto md:h-20"
              >
                <Clock className="mr-3 h-5 w-5 text-accent" />
                FOCUS TERMİNALİ
              </Button>
            </div>
          </div>
        </section>

        <section id="focus" className="relative mt-16 w-full px-4 sm:px-8 md:mt-24">
          <div className="group relative w-full overflow-hidden rounded-[3rem] border border-white/5 bg-[#0F172A] py-16 shadow-2xl sm:rounded-[4rem] md:py-28 lg:rounded-[5rem]">
            <div className="absolute -right-40 -top-40 h-[600px] w-[600px] rounded-full bg-accent/10 blur-[150px]" />
            <div className="container relative z-10 mx-auto grid items-center gap-14 px-6 md:px-12 lg:grid-cols-2 lg:gap-20">
              <div className="space-y-7 text-center text-white lg:text-left">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[8px] font-black uppercase tracking-[0.2em] text-accent">
                  <Zap className="h-3.5 w-3.5" />
                  FOCUS SYSTEM
                </div>
                <h2 className="text-5xl font-black uppercase italic leading-[0.88] tracking-tighter text-white text-shadow-premium md:text-7xl lg:text-8xl">
                  MAKSİMUM <br /><span className="text-accent text-shadow-accent">ODAKLANMA</span>
                </h2>
                <p className="max-w-xl text-base font-medium italic leading-relaxed text-white/95 md:text-xl lg:text-2xl">
                  Pomodoro tabanlı odak terminali ile çalışma ve mola sürelerini düzenleyin, akademik performansınızı saniyeler içinde daha istikrarlı hale getirin.
                </p>
                <div className="grid grid-cols-2 gap-5 border-t border-white/10 pt-8 md:gap-10 md:pt-10">
                  <div>
                    <p className="text-4xl font-black text-accent md:text-6xl">25</p>
                    <p className="mt-2 text-[8px] font-black uppercase tracking-[0.3em] text-white/50 md:text-[10px]">DAKİKA ÇALIŞMA</p>
                  </div>
                  <div>
                    <p className="text-4xl font-black text-white md:text-6xl">5</p>
                    <p className="mt-2 text-[8px] font-black uppercase tracking-[0.3em] text-white/50 md:text-[10px]">DAKİKA MOLA</p>
                  </div>
                </div>
              </div>

              <div className="mx-auto w-full max-w-md rounded-[2.5rem] border border-white/10 bg-white/5 p-7 text-center shadow-3xl backdrop-blur-3xl md:rounded-[4rem] md:p-14 lg:max-w-none">
                <div className="mb-8 flex justify-center gap-2 md:gap-4">
                  <span className="rounded-xl bg-white px-5 py-2.5 text-[8px] font-black tracking-widest text-primary shadow-xl md:px-7 md:py-3 md:text-[10px]">ÇALIŞMA</span>
                  <span className="rounded-xl bg-white/5 px-5 py-2.5 text-[8px] font-black tracking-widest text-white/70 md:px-7 md:py-3 md:text-[10px]">MOLA</span>
                </div>
                <p className="text-7xl font-black italic leading-none tracking-tighter text-white text-shadow-premium sm:text-8xl md:text-[10rem]">
                  25<span className="animate-pulse text-accent">:</span>00
                </p>
                <div className="mt-10 flex justify-center gap-4 md:gap-6">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent text-primary shadow-2xl shadow-accent/20 md:h-20 md:w-20">
                    <Zap className="h-7 w-7 md:h-8 md:w-8" />
                  </div>
                  <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white md:h-20 md:w-20">
                    <TrendingUp className="h-7 w-7 md:h-8 md:w-8" />
                  </div>
                </div>
                <p className="mt-8 text-[8px] font-black uppercase tracking-[0.25em] text-white/30">FOKUSUNU YÖNET · HEDEFİNE ULAŞ</p>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="container mx-auto w-full px-5 py-28 md:px-6 md:py-40">
          <div className="mb-14 text-center md:mb-20">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-2 text-[8px] font-black uppercase tracking-[0.25em] text-accent">
              <Sparkles className="h-3.5 w-3.5" />
              AKILLI EĞİTİM EKOSİSTEMİ
            </div>
            <h2 className="text-4xl font-black uppercase italic tracking-tighter text-primary md:text-6xl">
              SENİN İÇİN <br /><span className="text-accent">TASARLANDI.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8 lg:gap-10">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="group w-full rounded-[2.5rem] border border-primary/5 bg-white p-8 text-center shadow-xl transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl md:rounded-[3.5rem] md:p-12 md:text-left">
                  <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-[1.25rem] bg-slate-50 shadow-inner transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 md:mx-0 md:mb-10 md:h-20 md:w-20 md:rounded-[1.75rem]">
                    <Icon className={cn('h-8 w-8 md:h-10 md:w-10', feature.iconColor || 'text-primary')} />
                  </div>
                  <h3 className="mb-4 text-xl font-black uppercase italic leading-tight tracking-tighter text-primary md:text-3xl">{feature.title}</h3>
                  <p className="text-sm font-medium italic leading-relaxed text-muted-foreground md:text-lg">{feature.desc}</p>
                  <div className="mt-7 flex items-center justify-center gap-2 text-[8px] font-black uppercase tracking-[0.2em] text-accent md:justify-start">
                    KEŞFET <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <footer className="border-t border-primary/5 bg-white px-6 py-12 text-center">
        <div className="mb-5 flex items-center justify-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-black italic text-white">D</div>
          <span className="text-sm font-black uppercase italic tracking-tighter text-primary">DEK <span className="text-accent">AI</span></span>
        </div>
        <p className="text-[8px] font-black uppercase italic tracking-[0.35em] text-primary/20 md:text-[9px] md:tracking-[0.5em]">DIGITAL EDUCATION COACH · 2026</p>
      </footer>

      <Dialog open={isAuthOpen} onOpenChange={setIsAuthOpen}>
        <DialogContent className="max-h-[95vh] max-w-2xl overflow-hidden rounded-[2rem] border-none bg-white p-0 shadow-3xl sm:rounded-[3rem]">
          <DialogHeader className="border-b border-slate-100 px-6 pb-4 pt-7 md:px-10 md:pt-9">
            <DialogTitle className="text-center">
              <span className="inline-flex items-center gap-2 rounded-full bg-primary/5 px-4 py-2 text-[8px] font-black uppercase italic tracking-[0.2em] text-primary/50 md:text-[9px]">
                <Sparkles className="h-3 w-3 text-accent" />
                DEK AI · AKADEMİK SİSTEM
              </span>
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[calc(95vh-90px)]">
            <AuthForm mode="register" />
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
