
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
    <div className="flex min-h-screen flex-col bg-[#F8FAFC] text-slate-900 selection:bg-accent selection:text-white">
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
            <Link href="/" className="transition-colors hover:text-accent">Sistem</Link>
            <Link href="/features" className="transition-colors hover:text-accent">Teknoloji</Link>
            <Link href="/ai" className="transition-colors hover:text-accent">Yapay Zeka</Link>
            <Link href="/contact" className="transition-colors hover:text-accent">Kurumsal</Link>
          </div>

          {/* AUTH BUTTONS */}
          <div className="flex items-center gap-3">
            {!loading &&
              (user ? (
                <Button
                  asChild
                  className="h-12 rounded-xl bg-primary px-6 text-xs font-black uppercase tracking-widest shadow-xl shadow-primary/20"
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
                    <Link href="/dashboard">Giriş</Link>
                  </Button>

                  <Button
                    asChild
                    className="h-12 rounded-xl bg-accent px-6 text-xs font-black uppercase tracking-widest text-white hover:bg-accent/90 shadow-xl shadow-accent/20"
                  >
                    <Link href="/dashboard?tab=register">
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
          <div className="pointer-events-none absolute right-0 top-0 h-[700px] w-[700px] rounded-full bg-accent/10 blur-[140px]" />
          <div className="pointer-events-none absolute bottom-0 left-0 h-[600px] w-[600px] rounded-full bg-primary/5 blur-[140px]" />

          <div className="container relative z-10 mx-auto grid items-center gap-16 lg:grid-cols-2">
            <div className="space-y-10">
              <div className="inline-flex items-center gap-3 rounded-full bg-primary px-5 py-3 text-xs font-black uppercase tracking-widest text-white border border-white/10 shadow-2xl">
                <Sparkles className="h-4 w-4 text-accent" />
                Academic Operating System v4.0
              </div>

              <h1 className="text-6xl font-black uppercase leading-[0.9] tracking-tighter text-primary md:text-8xl italic text-shadow-premium">
                Akademik
                <br />
                <span className="text-accent text-shadow-accent">
                  Zekayı
                </span>
                <br />
                Yönetin.
              </h1>

              <p className="max-w-xl text-xl font-medium leading-relaxed text-muted-foreground md:text-2xl italic">
                Dijital Eğitim Koçu; öğrencinin akademik yaşamını analiz
                eden, planlayan ve gelişimini takip eden yeni nesil
                akademik işletim sistemidir.
              </p>

              <div className="flex flex-col gap-4 pt-4 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  className="h-16 rounded-2xl bg-primary px-8 text-lg font-black shadow-2xl shadow-primary/20 italic"
                >
                  <Link href="/dashboard?tab=register">
                    Ücretsiz Deneyin
                    <ArrowRight className="ml-3 h-6 w-6 text-accent" />
                  </Link>
                </Button>

                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-16 rounded-2xl border-2 px-8 text-lg font-black italic shadow-lg bg-white"
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
              <div className="rounded-[4rem] border-8 border-white bg-white/70 p-5 shadow-[0_80px_160px_-40px_rgba(15,23,42,0.2)] backdrop-blur-3xl transform hover:scale-[1.02] transition-transform duration-1000">
                <div className="flex items-center justify-between rounded-[3rem] bg-primary p-10 text-white relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 blur-3xl rounded-full"></div>
                  <div className="flex items-center gap-6 relative z-10">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent shadow-2xl group-hover:rotate-6 transition-transform">
                      <TrendingUp className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <div className="text-2xl font-black uppercase italic tracking-tighter">
                        Komuta Merkezi
                      </div>
                      <div className="text-[10px] uppercase tracking-[0.4em] text-white/40 font-bold mt-1">
                        Akademik Terminal v4.0
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 relative z-10">
                    <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-white/60">
                      Canlı Analiz Modu
                    </span>
                  </div>
                </div>

                <div className="grid gap-6 p-6 sm:grid-cols-2">
                  <div className="rounded-[3rem] bg-white p-8 shadow-xl border border-primary/5">
                    <div className="mb-8 flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 italic">
                        Gelişim Trendi
                      </span>
                      <BarChart3 className="h-6 w-6 text-accent" />
                    </div>
                    <div className="flex h-44 items-end gap-3 px-2">
                      {[40, 70, 50, 90, 60, 80, 75].map((height, index) => (
                          <div key={index} className="relative h-full flex-1 overflow-hidden rounded-2xl bg-slate-50 border border-primary/5">
                            <div className="absolute bottom-0 w-full rounded-2xl bg-primary transition-all duration-1000" style={{ height: `${height}%` }} />
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-center justify-center rounded-[3rem] bg-white p-8 shadow-xl border border-primary/5">
                    <div className="relative h-44 w-44">
                      <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="42" fill="none" stroke="#F1F5F9" strokeWidth="10" />
                        <circle cx="50" cy="50" r="42" fill="none" stroke="#F59E0B" strokeWidth="10" strokeDasharray="264" strokeDashoffset="37" strokeLinecap="round" className="drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center text-5xl font-black text-primary italic tracking-tighter">
                        87%
                      </div>
                    </div>
                    <span className="mt-8 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 italic">
                      Hedef Uyumu
                    </span>
                  </div>

                  <div className="col-span-2 rounded-[3rem] bg-[#0F172A] p-8 text-white shadow-2xl relative overflow-hidden group border border-white/5">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-accent/5 blur-[80px] rounded-full"></div>
                    <div className="flex items-center gap-8 relative z-10">
                      <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[1.75rem] bg-white/5 border border-white/10 shadow-inner group-hover:scale-110 transition-all">
                        <Brain className="h-10 w-10 text-accent" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <p className="text-2xl font-black uppercase italic tracking-tighter">
                          AI Koç Tavsiyesi
                        </p>
                        <p className="text-base leading-relaxed text-white/40 italic">
                          "Matematik performansındaki gelişim, hedefindeki üniversiteye ulaşma ihtimalini bu hafta %14 artırdı."
                        </p>
                      </div>
                      <div className="h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-accent text-primary flex shadow-2xl group-hover:translate-x-2 transition-transform">
                        <ChevronRight className="h-7 w-7" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="bg-white px-6 py-40 relative">
          <div className="container mx-auto">
            <div className="mx-auto mb-32 max-w-4xl text-center space-y-8">
              <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-slate-50 border border-primary/5 text-primary/40 font-black text-[10px] uppercase tracking-widest italic">
                AOS CORE TECHNOLOGY
              </div>
              <h2 className="text-6xl font-black uppercase leading-none tracking-tighter text-primary md:text-8xl italic text-shadow-premium">
                Akademik İşletim
                <br />
                <span className="text-accent text-shadow-accent">
                  Sisteminin Gücü
                </span>
              </h2>
              <p className="text-2xl leading-relaxed text-muted-foreground font-medium max-w-2xl mx-auto italic">
                Sıradan bir takip platformu değil; öğrencinin akademik DNA'sını analiz eden, yaşayan bir ekosistem.
              </p>
            </div>

            <div className="grid gap-12 md:grid-cols-3">
              {[
                {
                  icon: Cpu,
                  title: 'AI ANALİZ MOTORU',
                  description: 'Öğrencinin öğrenme hızını, mental yorgunluk eşiğini ve konu bazlı yetkinliklerini analiz eder.',
                  className: 'bg-blue-600 shadow-blue-500/20',
                },
                {
                  icon: Layers,
                  title: 'HİBRİT MÜFREDAT',
                  description: 'Ders planlarını öğrencinin seviyesine ve hedeflerine göre her gün yeniden optimize eder.',
                  className: 'bg-accent shadow-accent/20',
                },
                {
                  icon: ShieldCheck,
                  title: 'VERİ GÜVENLİĞİ',
                  description: 'Akademik verilerin güvenli şekilde saklanmasını ve sadece yetkili düğümlerle paylaşılmasını sağlar.',
                  className: 'bg-emerald-600 shadow-emerald-500/20',
                },
              ].map((feature) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.title}
                    className="rounded-[3.5rem] border border-primary/5 bg-[#F8FAFC] p-12 transition-all duration-500 hover:-translate-y-4 hover:bg-white hover:shadow-[0_80px_160px_-40px_rgba(0,0,0,0.1)] group"
                  >
                    <div className={cn('mb-10 flex h-24 w-24 items-center justify-center rounded-[2rem] text-white shadow-2xl transition-transform group-hover:rotate-6', feature.className)}>
                      <Icon className="h-12 w-12" />
                    </div>
                    <h3 className="mb-6 text-3xl font-black tracking-tight text-primary italic uppercase leading-none">
                      {feature.title}
                    </h3>
                    <p className="text-lg leading-relaxed text-muted-foreground font-medium italic opacity-70">
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
      <footer className="bg-primary px-6 py-24 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 blur-[120px] rounded-full"></div>
        <div className="container mx-auto relative z-10">
          <div className="grid gap-20 border-b border-white/5 pb-20 md:grid-cols-4">
            <div className="md:col-span-2 space-y-10">
              <div className="flex items-center gap-6">
                <div className="relative h-20 w-20 overflow-hidden rounded-3xl bg-white p-2 shadow-2xl">
                  <Image src={logoUrl} alt="Logo" fill sizes="80px" className="object-contain" />
                </div>
                <div>
                  <div className="text-5xl font-black italic tracking-tighter uppercase leading-none">
                    DEK
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/20 mt-2">
                    Academic Operating System
                  </div>
                </div>
              </div>
              <p className="max-w-xl text-xl leading-relaxed text-white/40 italic font-medium">
                Eğitim teknolojileriyle öğrencilerin akademik potansiyelini daha verimli kullanmasına yardımcı olan küresel bir düğümüz.
              </p>
            </div>

            <div className="space-y-8">
              <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-accent italic">Yol Haritası</h4>
              <div className="space-y-5 text-lg font-bold italic text-white/60">
                <Link href="/ai" className="block hover:text-white transition-colors">Yapay Zeka</Link>
                <Link href="/features" className="block hover:text-white transition-colors">Teknoloji</Link>
                <Link href="/contact" className="block hover:text-white transition-colors">Kurumsal</Link>
              </div>
            </div>

            <div className="space-y-8">
              <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-accent italic">Ekosistem</h4>
              <div className="flex gap-4">
                {[Globe, Bell, Award].map((Icon, index) => (
                  <div key={index} className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 border border-white/5 transition-all hover:bg-accent hover:text-primary cursor-pointer group shadow-inner">
                    <Icon className="h-6 w-6 group-hover:scale-110 transition-transform" />
                  </div>
                ))}
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">v4.8 Stable Engine</p>
            </div>
          </div>

          <div className="flex flex-col justify-between gap-6 pt-12 text-[10px] font-black uppercase tracking-[0.4em] text-white/10 md:flex-row items-center">
            <p>© 2026 DEK ACADEMIC OPERATING SYSTEM. ALL RIGHTS RESERVED.</p>
            <div className="flex items-center gap-4 px-5 py-2.5 rounded-full bg-white/5 border border-white/5">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              END-TO-END ENCRYPTED NODE
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
