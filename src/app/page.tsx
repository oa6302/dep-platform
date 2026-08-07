'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useUser } from '@/firebase';
import { 
  ArrowRight, 
  Play, 
  TrendingUp, 
  Brain, 
  BarChart3,
  Sparkles,
  Zap,
  ShieldCheck,
  Cpu,
  Layers,
  ChevronRight,
  Globe,
  Bell,
  Award
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function HomePage() {
  const { user, loading } = useUser();
  const [scrolled, setScrolled] = useState(false);

  const logoUrl = PlaceHolderImages.find(img => img.id === 'app-logo')?.imageUrl || "https://picsum.photos/seed/edu-logo-102/400/400";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC] selection:bg-accent selection:text-white">
      {/* Radical Navigation */}
      <nav className={cn(
        "fixed top-0 w-full z-50 transition-all duration-700 px-6 py-8",
        scrolled ? "bg-white/80 backdrop-blur-3xl shadow-[0_10px_40px_-15px_rgba(15,23,42,0.05)] py-5" : "bg-transparent"
      )}>
        <div className="container mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-5 group">
            <div className="relative h-14 w-14 overflow-hidden rounded-[1.25rem] bg-white p-1 shadow-2xl transition-all group-hover:rotate-6 border border-primary/5">
              <Image src={logoUrl} alt="DEK Logo" fill className="object-contain" data-ai-hint="education logo" />
            </div>
            <div className="hidden sm:block">
              <span className="font-black text-3xl block text-primary leading-tight tracking-tighter italic uppercase">DEK</span>
              <span className="text-[10px] text-muted-foreground block font-black uppercase tracking-[0.3em] opacity-40">AOS v4.0</span>
            </div>
          </Link>
          
          <div className="hidden lg:flex items-center gap-12 text-[12px] font-black uppercase tracking-[0.2em] text-primary/60">
            <Link href="/" className="hover:text-accent transition-colors">Sistem</Link>
            <Link href="/features" className="hover:text-accent transition-colors">Teknoloji</Link>
            <Link href="/ai" className="hover:text-accent transition-colors">Yapay Zeka</Link>
            <Link href="/contact" className="hover:text-accent transition-colors">Kurumsal</Link>
          </div>

          <div className="flex items-center gap-6">
            {!loading && (
              user ? (
                <Button className="rounded-2xl px-10 h-14 bg-primary font-black text-xs uppercase tracking-widest shadow-2xl shadow-primary/20 hover:bg-accent transition-all hover:-translate-y-1" asChild>
                  <Link href="/dashboard">Komuta Merkezi</Link>
                </Button>
              ) : (
                <>
                  <Button variant="ghost" className="text-primary hover:bg-primary/5 font-black text-xs uppercase tracking-widest hidden sm:flex" asChild>
                    <Link href="/login">Giriş</Link>
                  </Button>
                  <Button className="rounded-2xl px-10 h-14 bg-accent hover:bg-accent/90 text-white font-black text-xs uppercase tracking-widest shadow-2xl shadow-accent/20 transition-all hover:-translate-y-1" asChild>
                    <Link href="/login?tab=register">Sistemi Başlat</Link>
                  </Button>
                </>
              )
            )}
          </div>
        </div>
      </nav>

      <main>
        {/* Radical Hero Section */}
        <section className="pt-64 pb-32 relative overflow-hidden">
          {/* Futuristic Background */}
          <div className="absolute top-0 right-0 w-[1200px] h-[1200px] bg-accent/5 blur-[200px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-[1000px] h-[1000px] bg-primary/5 blur-[200px] rounded-full translate-y-1/2 -translate-x-1/2"></div>
          
          <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-32 items-center relative z-10">
            <div className="space-y-16">
              <div className="inline-flex items-center gap-4 px-6 py-2.5 rounded-full bg-primary text-white font-black text-[11px] uppercase tracking-[0.4em] shadow-2xl shadow-primary/20">
                <Sparkles className="h-4 w-4 text-accent" /> ACADEMIC OPERATING SYSTEM v4.0
              </div>
              <h1 className="text-8xl md:text-[10rem] font-black text-primary leading-[0.8] tracking-tighter italic uppercase text-shadow-premium">
                Akademik <br /> <span className="text-accent text-shadow-accent">Zekayı</span> <br /> Yönetin.
              </h1>
              <p className="text-2xl text-muted-foreground leading-relaxed max-w-xl font-medium italic">
                Dijital Eğitim Koçu, öğrencinin tüm akademik yaşamını analiz eden, optimize eden ve başarıyı garanti altına alan dünyanın ilk akademik işletim sistemidir.
              </p>
              <div className="flex flex-col sm:flex-row gap-8 pt-8">
                <Button size="lg" className="bg-primary hover:bg-accent transition-all rounded-[2rem] px-14 h-24 text-2xl font-black shadow-[0_40px_80px_-20px_rgba(15,23,42,0.3)] group" asChild>
                  <Link href="/login?tab=register">Ücretsiz Deneyin <ArrowRight className="ml-5 h-8 w-8 transition-transform group-hover:translate-x-2" /></Link>
                </Button>
                <Button size="lg" variant="outline" className="border-4 border-primary/10 rounded-[2rem] px-14 h-24 text-2xl font-black group hover:bg-white transition-all bg-transparent backdrop-blur-sm shadow-xl" asChild>
                  <Link href="/features"><Play className="mr-5 h-8 w-8 fill-current text-accent" /> Tanıtımı İzle</Link>
                </Button>
              </div>
            </div>

            {/* Futuristic Dashboard Preview */}
            <div className="relative group perspective-3000 hidden lg:block">
              <div className="absolute -inset-24 bg-accent/20 blur-[150px] rounded-full opacity-30 group-hover:opacity-60 transition-opacity duration-1000"></div>
              <div className="relative bg-white/40 backdrop-blur-3xl rounded-[5rem] shadow-[0_100px_200px_-40px_rgba(15,23,42,0.35)] border-[16px] border-white/80 overflow-hidden transform-gpu transition-all duration-1000 group-hover:rotate-y-[-12deg] group-hover:rotate-x-[6deg] group-hover:scale-[1.02]">
                 <div className="bg-primary p-16 flex justify-between items-center text-white">
                    <div className="flex items-center gap-8">
                       <div className="h-16 w-16 rounded-[1.5rem] bg-accent flex items-center justify-center shadow-2xl">
                          <TrendingUp className="h-9 w-9 text-white" />
                       </div>
                       <span className="font-black text-3xl italic tracking-tight uppercase">Komuta Merkezi</span>
                    </div>
                    <div className="flex items-center gap-4">
                       <span className="h-4 w-4 rounded-full bg-emerald-500 animate-pulse"></span>
                       <span className="text-[12px] font-black uppercase tracking-[0.3em] opacity-60">Canlı Analiz</span>
                    </div>
                 </div>
                 <div className="p-20 grid grid-cols-2 gap-16">
                    <div className="bg-white p-14 rounded-[4rem] shadow-2xl border border-primary/5 space-y-12">
                       <div className="flex justify-between items-center">
                          <span className="text-[12px] font-black uppercase tracking-[0.4em] text-muted-foreground italic">Gelişim Trendi</span>
                          <BarChart3 className="h-8 w-8 text-accent" />
                       </div>
                       <div className="flex items-end gap-5 h-48">
                          {[40, 70, 50, 90, 60, 80, 75].map((h, i) => (
                            <div key={i} className="flex-1 bg-slate-50 rounded-2xl relative overflow-hidden group/bar">
                               <div className="absolute bottom-0 w-full bg-primary rounded-2xl transition-all duration-1000 group-hover/bar:bg-accent" style={{ height: `${h}%` }}></div>
                            </div>
                          ))}
                       </div>
                    </div>
                    <div className="bg-white p-14 rounded-[4rem] shadow-2xl border border-primary/5 flex flex-col items-center justify-center text-center space-y-10">
                       <div className="relative h-48 w-48">
                          <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                             <circle cx="50" cy="50" r="45" fill="none" stroke="#F8FAFC" strokeWidth="8" />
                             <circle cx="50" cy="50" r="45" fill="none" stroke="#F59E0B" strokeWidth="8" strokeDasharray="283" strokeDashoffset="40" strokeLinecap="round" className="transition-all duration-1000" />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center font-black text-5xl text-primary italic text-shadow-deep">87%</div>
                       </div>
                       <span className="text-[12px] font-black uppercase tracking-[0.4em] text-muted-foreground italic">Hedef Uyumu</span>
                    </div>
                    <div className="col-span-2 bg-[#0F172A] p-16 rounded-[5rem] flex items-center justify-between shadow-2xl border border-white/5 transition-all hover:scale-[1.02] cursor-pointer group/card">
                       <div className="flex items-center gap-12">
                          <div className="h-28 w-28 rounded-[2.5rem] bg-white/5 flex items-center justify-center border border-white/10 shadow-inner group-hover/card:bg-accent/10 transition-colors">
                             <Brain className="h-14 w-14 text-accent animate-pulse" />
                          </div>
                          <div className="space-y-3">
                             <p className="font-black text-white text-4xl italic tracking-tight uppercase">AI Koç Tavsiyesi</p>
                             <p className="text-white/40 font-medium text-xl italic leading-relaxed">"Matematik netlerindeki %12 artış, hedefindeki okula seni %94 yaklaştırdı."</p>
                          </div>
                       </div>
                       <Button size="icon" className="h-24 w-24 rounded-[2.5rem] bg-accent text-white shadow-2xl shadow-accent/20 hover:bg-white hover:text-primary transition-all">
                          <ChevronRight className="h-12 w-12" />
                       </Button>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </section>

        {/* AOS Feature Matrix */}
        <section className="py-64 bg-white relative">
          <div className="container mx-auto px-6">
            <div className="text-center max-w-5xl mx-auto space-y-10 mb-40">
               <h2 className="text-6xl md:text-[8rem] font-black text-primary tracking-tighter italic uppercase leading-none text-shadow-premium">Akademik <br /><span className="text-accent text-shadow-accent">İşletim Sisteminin</span> Gücü</h2>
               <p className="text-3xl text-muted-foreground font-medium italic leading-relaxed opacity-60">Sıradan bir eğitim platformu değil; yapay zeka tarafından yönetilen dinamik bir ekosistem.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-16">
               {[
                 { icon: Cpu, title: "AI ANALİZ MOTORU", desc: "Öğrencinin öğrenme hızını ve eksiklerini milisaniyeler içinde tespit eden sinirsel ağlar.", color: "bg-blue-600" },
                 { icon: Layers, title: "HİBRİT MÜFREDAT", desc: "Milli Eğitim ve uluslararası standartlarla tam uyumlu, kişiye göre mutasyona uğrayan ders planları.", color: "bg-accent" },
                 { icon: ShieldCheck, title: "VERİ GÜVENLİĞİ", desc: "Tüm akademik gelişim verileri en yüksek güvenlik protokolleri ile korunur ve şifrelenir.", color: "bg-emerald-600" },
               ].map((f, i) => (
                 <div key={i} className="group p-16 bg-[#F8FAFC] rounded-[5rem] border border-primary/5 hover:bg-white hover:shadow-[0_60px_120px_-30px_rgba(15,23,42,0.15)] transition-all duration-700 hover:-translate-y-6">
                    <div className={cn("h-24 w-24 rounded-[2rem] flex items-center justify-center text-white shadow-3xl mb-12 group-hover:rotate-12 transition-transform duration-700", f.color)}>
                       <f.icon className="h-12 w-12" />
                    </div>
                    <h3 className="text-3xl font-black text-primary tracking-tighter italic uppercase mb-8 leading-none">{f.title}</h3>
                    <p className="text-xl text-muted-foreground font-medium italic leading-relaxed opacity-70">{f.desc}</p>
                 </div>
               ))}
            </div>
          </div>
        </section>
      </main>

      {/* Radical Footer */}
      <footer className="bg-primary text-white pt-64 pb-24 relative overflow-hidden border-t border-white/5">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-accent/5 blur-[150px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
        <div className="container mx-auto px-6 grid md:grid-cols-4 gap-32 pb-32 border-b border-white/5 relative z-10">
          <div className="col-span-2 space-y-16">
            <Link href="/" className="flex items-center gap-6 group">
              <div className="relative h-20 w-20 overflow-hidden rounded-[1.75rem] bg-white p-1 shadow-3xl transition-transform group-hover:rotate-6">
                <Image src={logoUrl} alt="Logo" fill className="object-contain" />
              </div>
              <div className="space-y-1">
                <span className="font-black text-5xl tracking-tighter block leading-none italic uppercase text-shadow-premium">DEK</span>
                <span className="text-[12px] text-white/40 font-black uppercase tracking-[0.4em]">Academic Operating System</span>
              </div>
            </Link>
            <p className="text-white/50 text-3xl leading-relaxed max-w-2xl font-medium italic">
              Eğitim teknolojilerinde devrim yaparak, her öğrencinin potansiyelini dijital zeka ile zirveye taşıyoruz.
            </p>
          </div>
          <div className="space-y-12">
            <h4 className="font-black text-accent text-sm uppercase tracking-[0.5em] italic">Yol Haritası</h4>
            <ul className="space-y-8 text-white/60 font-bold text-xl uppercase tracking-tight italic">
               <li><Link href="#" className="hover:text-white transition-colors">Yapay Zeka Vizyonu</Link></li>
               <li><Link href="#" className="hover:text-white transition-colors">Kurumsal Çözümler</Link></li>
               <li><Link href="/contact" className="hover:text-white transition-colors">Global Destek</Link></li>
            </ul>
          </div>
          <div className="space-y-12">
            <h4 className="font-black text-accent text-sm uppercase tracking-[0.5em] italic">Ağımız</h4>
            <div className="flex gap-8">
              {[Globe, Bell, Award].map((Icon, i) => (
                <div key={i} className="h-20 w-20 rounded-[1.75rem] bg-white/5 flex items-center justify-center hover:bg-accent hover:scale-110 transition-all cursor-pointer border border-white/10 shadow-2xl">
                  <Icon className="h-9 w-9" />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="container mx-auto px-6 pt-20 text-white/20 text-sm font-black uppercase tracking-[0.4em] flex justify-between items-center relative z-10 italic">
          <p>© 2026 DEK Academic Operating System. Bütün hakları saklıdır.</p>
          <div className="flex gap-12">
             <span>v4.8.5 Stable</span>
             <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Safe & Encrypted</span>
          </div>
        </div>
      </footer>
    </div>
  );
}