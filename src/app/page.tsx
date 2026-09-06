'use client';

import {
  Brain,
  Zap,
  Target,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  const router = useRouter();

  const handleStartClick = () => {
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
      number: '01',
      title: 'AI AKADEMİK KOÇ',
      icon: Brain,
      desc: 'Öğrenme profilini analiz eder, eksiklerini belirler ve sana uygun çalışma önerileri oluşturur.',
      tag: 'AKILLI PLANLAMA',
    },
    {
      number: '02',
      title: 'DİNAMİK PLANLAMA',
      icon: Target,
      desc: 'Hedeflerine, başarı durumuna ve çalışma performansına göre yaşayan bir akademik takvim oluşturur.',
      tag: 'OTONOM SİSTEM',
    },
    {
      number: '03',
      title: 'YKS TM ODAKLI',
      icon: ShieldCheck,
      desc: 'Eşit Ağırlık hedefin için çalışma sürecini düzenler, konularını ve hedeflerini tek merkezden takip eder.',
      tag: 'YKS EŞİT AĞIRLIK',
    },
  ];

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#F8FAFC] text-primary selection:bg-accent selection:text-white">

      {/* NAVBAR */}
      <nav className="fixed inset-x-0 top-0 z-50 border-b border-slate-200/60 bg-white/80 py-3 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 md:px-6">

          <button
            type="button"
            onClick={() =>
              window.scrollTo({
                top: 0,
                behavior: 'smooth',
              })
            }
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary font-black italic text-white shadow-lg">
              D
            </div>

            <span className="text-lg font-black uppercase italic tracking-tighter text-primary md:text-xl">
              DEK <span className="text-accent">AI</span>
            </span>
          </button>

          <div className="hidden items-center gap-8 md:flex">
            <button
              type="button"
              onClick={() => scrollToSection('vision')}
              className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 transition-all hover:text-primary"
            >
              VİZYON
            </button>

            <button
              type="button"
              onClick={() => scrollToSection('features')}
              className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 transition-all hover:text-primary"
            >
              ÖZELLİKLER
            </button>

            <button
              type="button"
              onClick={() => scrollToSection('focus')}
              className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 transition-all hover:text-primary"
            >
              ODAK
            </button>
          </div>

          <Button
            onClick={handleStartClick}
            className="h-11 rounded-xl border-none bg-primary px-5 text-[9px] font-black uppercase tracking-widest text-white shadow-lg shadow-primary/20 transition-all hover:bg-accent md:h-12 md:px-7"
          >
            SİSTEME BAĞLAN
          </Button>
        </div>
      </nav>

      {/* HERO */}
      <main className="w-full pt-24">

        <section
          id="vision"
          className="relative overflow-hidden px-5 pb-20 pt-16 md:px-6 md:pb-28 md:pt-24"
        >

          {/* Background effects */}
          <div className="pointer-events-none absolute left-1/2 top-20 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-accent/10 blur-[140px]" />

          <div className="relative mx-auto flex max-w-6xl flex-col items-center text-center">

            <div className="mb-7 inline-flex items-center gap-3 rounded-full border border-primary/10 bg-white px-5 py-2.5 text-[9px] font-black uppercase tracking-[0.2em] text-primary shadow-sm">
              <Sparkles className="h-4 w-4 text-accent" />
              YKS TM MASTER TERMİNALİ
            </div>

            <h1 className="max-w-6xl text-5xl font-black uppercase italic leading-[0.9] tracking-[-0.06em] text-primary md:text-7xl lg:text-[6.5rem]">
              YKS BAŞARISINI
              <br />
              <span className="text-accent">
                PLANLA.
              </span>
            </h1>

            <p className="mt-8 max-w-2xl px-3 text-base font-medium italic leading-7 text-slate-500 md:text-xl md:leading-8">
              Yapay zeka destekli akademik planlama motoruyla
              Eşit Ağırlık hedeflerine daha düzenli, daha bilinçli
              ve daha güçlü ilerle.
            </p>

            <div className="mt-9 flex w-full flex-col items-center justify-center gap-4 sm:w-auto sm:flex-row">

              <Button
                onClick={handleStartClick}
                size="lg"
                className="group h-16 w-full rounded-2xl border-none bg-primary px-8 text-base font-black uppercase tracking-widest text-white shadow-[0_25px_60px_-20px_rgba(15,23,42,0.5)] transition-all hover:scale-[1.03] hover:bg-accent sm:w-auto md:h-18 md:px-12 md:text-lg"
              >
                HEMEN BAŞLA

                <ChevronRight className="ml-3 h-5 w-5 transition-transform group-hover:translate-x-1.5" />
              </Button>

              <button
                type="button"
                onClick={() => scrollToSection('features')}
                className="flex h-14 items-center gap-2 rounded-2xl px-6 text-[10px] font-black uppercase tracking-widest text-slate-400 transition-all hover:text-primary"
              >
                SİSTEMİ KEŞFET
                <ArrowRight className="h-4 w-4" />
              </button>

            </div>
          </div>
        </section>


        {/* FEATURES */}
        <section
          id="features"
          className="mx-auto w-full max-w-7xl px-5 py-20 md:px-6 md:py-28"
        >

          <div className="mb-12 text-center md:mb-16">

            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/5 px-4 py-2 text-[9px] font-black uppercase tracking-[0.25em] text-primary/50">
              <Zap className="h-3.5 w-3.5 text-accent" />
              SİSTEM ÖZELLİKLERİ
            </div>

            <h2 className="text-4xl font-black uppercase italic tracking-tighter text-primary md:text-6xl">
              BAŞARI İÇİN{' '}
              <span className="text-accent">
                3 GÜÇ
              </span>
            </h2>

            <p className="mx-auto mt-5 max-w-xl text-sm font-medium leading-6 text-slate-400 md:text-base">
              Akademik hedeflerini tek bir merkezden planla,
              takip et ve geliştir.
            </p>
          </div>


          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">

            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <div
                  key={feature.number}
                  className="group relative flex min-h-[330px] flex-col overflow-hidden rounded-[2rem] border border-slate-200/70 bg-white p-7 shadow-[0_15px_50px_-25px_rgba(15,23,42,0.25)] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_30px_70px_-30px_rgba(15,23,42,0.35)]"
                >

                  {/* Decorative circle */}
                  <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-accent/5 blur-3xl transition-all duration-500 group-hover:bg-accent/15" />

                  {/* Number */}
                  <div className="absolute right-7 top-5 text-6xl font-black italic tracking-tighter text-slate-100">
                    {feature.number}
                  </div>

                  {/* Icon */}
                  <div className="relative mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-primary shadow-inner transition-all duration-500 group-hover:bg-primary group-hover:text-white">
                    <Icon className="h-7 w-7" />
                  </div>

                  {/* Tag */}
                  <div className="relative mb-4 w-fit rounded-full bg-accent/10 px-3 py-1.5 text-[8px] font-black uppercase tracking-[0.15em] text-accent">
                    {feature.tag}
                  </div>

                  {/* Content */}
                  <div className="relative flex flex-1 flex-col">

                    <h3 className="mb-4 text-xl font-black uppercase italic tracking-tight text-primary md:text-2xl">
                      {feature.title}
                    </h3>

                    <p className="text-sm font-medium leading-7 text-slate-500">
                      {feature.desc}
                    </p>

                  </div>

                  {/* Bottom line */}
                  <div className="relative mt-8 h-1 w-12 overflow-hidden rounded-full bg-accent transition-all duration-500 group-hover:w-full" />

                </div>
              );
            })}

          </div>
        </section>


        {/* FOCUS ENGINE */}
        <section
          id="focus"
          className="w-full px-4 py-10 sm:px-8 md:py-16"
        >

          <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] bg-[#0F172A] p-7 text-white shadow-2xl sm:p-10 md:rounded-[3rem] md:p-16 lg:p-20">

            {/* Background glow */}
            <div className="pointer-events-none absolute -right-32 -top-32 h-[450px] w-[450px] rounded-full bg-accent/10 blur-[120px]" />

            <div className="relative z-10 grid items-center gap-12 lg:grid-cols-2 lg:gap-20">

              {/* Text */}
              <div>

                <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[9px] font-black uppercase tracking-[0.2em] text-accent">
                  <Zap className="h-3.5 w-3.5" />
                  FOCUS ENGINE v4.8
                </div>

                <h2 className="text-4xl font-black uppercase italic leading-[0.9] tracking-tighter md:text-6xl lg:text-7xl">
                  MAKSİMUM
                  <br />
                  <span className="text-accent">
                    ODAKLANMA
                  </span>
                </h2>

                <p className="mt-6 max-w-xl text-base font-medium italic leading-7 text-white/50 md:text-lg md:leading-8">
                  Pomodoro tabanlı odak terminali ile çalışma
                  ve mola sürelerini düzenle, akademik performansını
                  daha istikrarlı hale getir.
                </p>

                <div className="mt-8 grid max-w-md grid-cols-2 gap-4 border-t border-white/10 pt-7">

                  <div>
                    <p className="text-4xl font-black text-accent md:text-5xl">
                      25
                    </p>

                    <p className="mt-1 text-[9px] font-black uppercase tracking-widest text-white/30">
                      DAKİKA ÇALIŞMA
                    </p>
                  </div>

                  <div>
                    <p className="text-4xl font-black text-white md:text-5xl">
                      5
                    </p>

                    <p className="mt-1 text-[9px] font-black uppercase tracking-widest text-white/30">
                      DAKİKA MOLA
                    </p>
                  </div>

                </div>

              </div>


              {/* Timer Card */}
              <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-7 text-center shadow-2xl backdrop-blur-xl sm:p-10">

                <div className="mb-7 flex items-center justify-between">

                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30">
                    FOCUS MODE
                  </span>

                  <div className="flex h-2 w-2 rounded-full bg-accent shadow-[0_0_15px_rgba(245,158,11,0.8)]" />

                </div>

                <p className="text-6xl font-black italic tracking-tighter text-white sm:text-7xl md:text-[6rem]">
                  25
                  <span className="text-accent">
                    :
                  </span>
                  00
                </p>

                <div className="mt-8 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full w-full rounded-full bg-accent" />
                </div>

                <p className="mt-6 text-[9px] font-black uppercase tracking-[0.35em] text-white/30">
                  FOKUSUNU YÖNET · HEDEFİNE ULAŞ
                </p>

              </div>

            </div>

          </div>
        </section>


        {/* FINAL CTA */}
        <section className="px-5 py-20 md:py-28">

          <div className="mx-auto max-w-4xl text-center">

            <div className="mb-5 flex justify-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-white shadow-xl">
                <CheckCircle2 className="h-7 w-7" />
              </div>
            </div>

            <h2 className="text-4xl font-black uppercase italic tracking-tighter text-primary md:text-6xl">
              HEDEFİNİ
              <br />
              <span className="text-accent">
                BUGÜN BAŞLAT.
              </span>
            </h2>

            <p className="mx-auto mt-5 max-w-xl text-sm leading-6 text-slate-400 md:text-base">
              Çalışma sürecini planla, eksiklerini gör ve
              YKS yolculuğunu daha bilinçli yönet.
            </p>

            <Button
              onClick={handleStartClick}
              className="mt-8 h-14 rounded-2xl bg-primary px-8 text-[10px] font-black uppercase tracking-widest text-white shadow-xl transition-all hover:bg-accent md:px-10"
            >
              DASHBOARD'A GİT
              <ArrowRight className="ml-3 h-4 w-4" />
            </Button>

          </div>

        </section>

      </main>


      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-white py-10 text-center">

        <div className="mb-3 text-lg font-black uppercase italic tracking-tighter text-primary">
          DEK <span className="text-accent">AI</span>
        </div>

        <p className="text-[8px] font-black uppercase italic tracking-[0.35em] text-primary/25">
          DIGITAL EDUCATION COACH · YKS TM EDITION · 2026
        </p>

      </footer>

    </div>
  );
}