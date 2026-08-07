'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useUser } from '@/firebase';
import { cn } from '@/lib/utils';
import { PlaceHolderImages } from '@/lib/placeholder-images';

import {
  ArrowRight,
  Play,
  TrendingUp,
  Brain,
  BarChart3,
  Sparkles,
  ShieldCheck,
  Cpu,
  Layers,
  ChevronRight,
  Globe,
  Bell,
  Award,
} from 'lucide-react';

export default function HomePage() {
  const { user, loading } = useUser();
  const [scrolled, setScrolled] = useState(false);

  const logoUrl =
    PlaceHolderImages.find((img) => img.id === 'app-logo')?.imageUrl ||
    'https://picsum.photos/seed/edu-logo-102/400/400';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC] text-slate-900">
      {/* NAVIGATION */}
      <nav
        className={cn(
          'fixed top-0 z-50 w-full px-6 transition-all duration-500',
          scrolled
            ? 'bg-white/90 py-4 shadow-lg backdrop-blur-xl'
            : 'bg-transparent py-7'
        )}
      >
        <div className="container mx-auto flex items-center justify-between">
          {/* LOGO */}
          <Link href="/" className="group flex items-center gap-4">
            <div className="relative h-14 w-14 overflow-hidden rounded-2xl bg-white p-1 shadow-xl">
            <Image 
  src={logoUrl} 
  alt="DEK Logo" 
  fill
  sizes="56px"
  className="object-contain" 
  data-ai-hint="education logo" 
/>
            </div>

            <div className="hidden sm:block">
              <span className="block text-3xl font-black italic tracking-tighter text-primary">
                DEK
              </span>

              <span className="block text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
                AOS v4.0
              </span>
            </div>
          </Link>

          {/* MENU */}
          <div className="hidden items-center gap-10 text-xs font-black uppercase tracking-widest text-primary/60 lg:flex">
            <Link
              href="/"
              className="transition-colors hover:text-accent"
            >
              Sistem
            </Link>

            <Link
              href="/features"
              className="transition-colors hover:text-accent"
            >
              Teknoloji
            </Link>

            <Link
              href="/ai"
              className="transition-colors hover:text-accent"
            >
              Yapay Zeka
            </Link>

            <Link
              href="/contact"
              className="transition-colors hover:text-accent"
            >
              Kurumsal
            </Link>
          </div>

          {/* AUTH BUTTONS */}
          <div className="flex items-center gap-3">
            {!loading &&
              (user ? (
                <Button
                  asChild
                  className="h-12 rounded-xl bg-primary px-6 text-xs font-black uppercase tracking-widest"
                >
                  <Link href="/dashboard">
                    Komuta Merkezi
                  </Link>
                </Button>
              ) : (
                <>
                  <Button
                    asChild
                    variant="ghost"
                    className="hidden text-xs font-black uppercase tracking-widest text-primary sm:flex"
                  >
                    <Link href="/login">Giriş</Link>
                  </Button>

                  <Button
                    asChild
                    className="h-12 rounded-xl bg-accent px-6 text-xs font-black uppercase tracking-widest text-white hover:bg-accent/90"
                  >
                    <Link href="/login?tab=register">
                      Sistemi Başlat
                    </Link>
                  </Button>
                </>
              ))}
          </div>
        </div>
      </nav>

      <main>
        {/* HERO */}
        <section className="relative overflow-hidden px-6 pb-24 pt-48 md:pt-56">
          {/* BACKGROUND EFFECTS */}
          <div className="pointer-events-none absolute right-0 top-0 h-[700px] w-[700px] rounded-full bg-accent/10 blur-[140px]" />

          <div className="pointer-events-none absolute bottom-0 left-0 h-[600px] w-[600px] rounded-full bg-primary/5 blur-[140px]" />

          <div className="container relative z-10 mx-auto grid items-center gap-16 lg:grid-cols-2">
            {/* LEFT */}
            <div className="space-y-10">
              <div className="inline-flex items-center gap-3 rounded-full bg-primary px-5 py-3 text-xs font-black uppercase tracking-widest text-white">
                <Sparkles className="h-4 w-4 text-accent" />
                Academic Operating System v4.0
              </div>

              <h1 className="text-6xl font-black uppercase leading-[0.9] tracking-tighter text-primary md:text-8xl">
                Akademik
                <br />
                <span className="text-accent">
                  Zekayı
                </span>
                <br />
                Yönetin.
              </h1>

              <p className="max-w-xl text-xl font-medium leading-relaxed text-muted-foreground md:text-2xl">
                Dijital Eğitim Koçu; öğrencinin akademik yaşamını analiz
                eden, planlayan ve gelişimini takip eden yeni nesil
                akademik işletim sistemidir.
              </p>

              <div className="flex flex-col gap-4 pt-4 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  className="h-16 rounded-2xl bg-primary px-8 text-lg font-black shadow-xl"
                >
                  <Link href="/login?tab=register">
                    Ücretsiz Deneyin
                    <ArrowRight className="ml-3 h-6 w-6" />
                  </Link>
                </Button>

                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-16 rounded-2xl border-2 px-8 text-lg font-black"
                >
                  <Link href="/features">
                    <Play className="mr-3 h-5 w-5 fill-current text-accent" />
                    Tanıtımı İzle
                  </Link>
                </Button>
              </div>
            </div>

            {/* DASHBOARD PREVIEW */}
            <div className="hidden lg:block">
              <div className="rounded-[3rem] border-8 border-white bg-white/70 p-5 shadow-2xl backdrop-blur-xl">
                {/* DASHBOARD HEADER */}
                <div className="flex items-center justify-between rounded-[2rem] bg-primary p-8 text-white">
                  <div className="flex items-center gap-5">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent">
                      <TrendingUp className="h-7 w-7" />
                    </div>

                    <div>
                      <div className="text-xl font-black uppercase">
                        Komuta Merkezi
                      </div>

                      <div className="text-xs uppercase tracking-widest text-white/50">
                        Akademik Panel
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 animate-pulse rounded-full bg-emerald-500" />
                    <span className="hidden text-[10px] font-bold uppercase tracking-widest text-white/50 xl:block">
                      Canlı Analiz
                    </span>
                  </div>
                </div>

                {/* DASHBOARD CARDS */}
                <div className="grid gap-5 p-5 sm:grid-cols-2">
                  {/* TREND */}
                  <div className="rounded-3xl bg-white p-7 shadow-lg">
                    <div className="mb-6 flex items-center justify-between">
                      <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                        Gelişim Trendi
                      </span>

                      <BarChart3 className="h-6 w-6 text-accent" />
                    </div>

                    <div className="flex h-40 items-end gap-3">
                      {[40, 70, 50, 90, 60, 80, 75].map(
                        (height, index) => (
                          <div
                            key={index}
                            className="relative h-full flex-1 overflow-hidden rounded-xl bg-slate-100"
                          >
                            <div
                              className="absolute bottom-0 w-full rounded-xl bg-primary"
                              style={{ height: `${height}%` }}
                            />
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  {/* TARGET */}
                  <div className="flex flex-col items-center justify-center rounded-3xl bg-white p-7 shadow-lg">
                    <div className="relative h-36 w-36">
                      <svg
                        className="h-full w-full -rotate-90"
                        viewBox="0 0 100 100"
                      >
                        <circle
                          cx="50"
                          cy="50"
                          r="42"
                          fill="none"
                          stroke="#F1F5F9"
                          strokeWidth="8"
                        />

                        <circle
                          cx="50"
                          cy="50"
                          r="42"
                          fill="none"
                          stroke="#F59E0B"
                          strokeWidth="8"
                          strokeDasharray="264"
                          strokeDashoffset="37"
                          strokeLinecap="round"
                        />
                      </svg>

                      <div className="absolute inset-0 flex items-center justify-center text-4xl font-black text-primary">
                        87%
                      </div>
                    </div>

                    <span className="mt-5 text-xs font-black uppercase tracking-widest text-muted-foreground">
                      Hedef Uyumu
                    </span>
                  </div>

                  {/* AI ADVICE */}
                  <div className="col-span-2 rounded-[2rem] bg-[#0F172A] p-7 text-white shadow-xl">
                    <div className="flex items-center gap-5">
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/5">
                        <Brain className="h-8 w-8 text-accent" />
                      </div>

                      <div>
                        <p className="text-xl font-black uppercase">
                          AI Koç Tavsiyesi
                        </p>

                        <p className="mt-2 text-sm leading-relaxed text-white/50">
                          Matematik performansındaki gelişim hedefindeki
                          okula ulaşma ihtimalini artırıyor.
                        </p>
                      </div>

                      <div className="ml-auto hidden h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent sm:flex">
                        <ChevronRight className="h-6 w-6" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="bg-white px-6 py-32">
          <div className="container mx-auto">
            <div className="mx-auto mb-20 max-w-4xl text-center">
              <h2 className="text-5xl font-black uppercase leading-tight tracking-tighter text-primary md:text-7xl">
                Akademik İşletim
                <br />
                <span className="text-accent">
                  Sisteminin Gücü
                </span>
              </h2>

              <p className="mt-8 text-xl leading-relaxed text-muted-foreground">
                Sıradan bir eğitim platformu değil; öğrencinin gelişimini
                veriye dayalı olarak takip eden dinamik bir sistem.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              {[
                {
                  icon: Cpu,
                  title: 'AI ANALİZ MOTORU',
                  description:
                    'Öğrencinin öğrenme sürecini, performansını ve eksiklerini analiz eder.',
                  className: 'bg-blue-600',
                },
                {
                  icon: Layers,
                  title: 'HİBRİT MÜFREDAT',
                  description:
                    'Ders planlarını öğrencinin seviyesine ve hedeflerine göre düzenler.',
                  className: 'bg-accent',
                },
                {
                  icon: ShieldCheck,
                  title: 'VERİ GÜVENLİĞİ',
                  description:
                    'Akademik verilerin güvenli şekilde saklanmasına yardımcı olur.',
                  className: 'bg-emerald-600',
                },
              ].map((feature) => {
                const Icon = feature.icon;

                return (
                  <div
                    key={feature.title}
                    className="rounded-[2.5rem] border border-primary/5 bg-[#F8FAFC] p-10 transition-all duration-300 hover:-translate-y-2 hover:bg-white hover:shadow-2xl"
                  >
                    <div
                      className={cn(
                        'mb-8 flex h-20 w-20 items-center justify-center rounded-2xl text-white shadow-lg',
                        feature.className
                      )}
                    >
                      <Icon className="h-10 w-10" />
                    </div>

                    <h3 className="mb-5 text-2xl font-black tracking-tight text-primary">
                      {feature.title}
                    </h3>

                    <p className="text-lg leading-relaxed text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-primary px-6 py-20 text-white">
        <div className="container mx-auto">
          <div className="grid gap-16 border-b border-white/10 pb-16 md:grid-cols-4">
            <div className="md:col-span-2">
              <div className="flex items-center gap-5">
                <div className="relative h-16 w-16 overflow-hidden rounded-2xl bg-white p-1">
                <Image 
  src={logoUrl} 
  alt="Logo" 
  fill
  sizes="80px"
  className="object-contain" 
/>
                </div>

                <div>
                  <div className="text-4xl font-black italic tracking-tighter">
                    DEK
                  </div>

                  <div className="text-xs font-bold uppercase tracking-widest text-white/40">
                    Academic Operating System
                  </div>
                </div>
              </div>

              <p className="mt-8 max-w-xl text-xl leading-relaxed text-white/50">
                Eğitim teknolojileriyle öğrencilerin akademik potansiyelini
                daha verimli kullanmasına yardımcı oluyoruz.
              </p>
            </div>

            <div>
              <h4 className="mb-6 text-xs font-black uppercase tracking-widest text-accent">
                Yol Haritası
              </h4>

              <div className="space-y-4 text-white/60">
                <Link
                  href="/ai"
                  className="block hover:text-white"
                >
                  Yapay Zeka
                </Link>

                <Link
                  href="/features"
                  className="block hover:text-white"
                >
                  Teknoloji
                </Link>

                <Link
                  href="/contact"
                  className="block hover:text-white"
                >
                  Kurumsal
                </Link>
              </div>
            </div>

            <div>
              <h4 className="mb-6 text-xs font-black uppercase tracking-widest text-accent">
                Ağımız
              </h4>

              <div className="flex gap-3">
                {[Globe, Bell, Award].map((Icon, index) => (
                  <div
                    key={index}
                    className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 transition hover:bg-accent"
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-between gap-4 pt-8 text-xs font-bold uppercase tracking-widest text-white/30 md:flex-row">
            <p>
              © 2026 DEK Academic Operating System.
            </p>

            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              Safe & Encrypted
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}