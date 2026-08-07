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
  Globe,
  Bell,
  Award,
  Zap,
  ShieldCheck,
  Cpu,
  Layers
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
    <div className="flex flex-col min-h-screen bg-[#F8FAFC]">
      {/* Navigation */}
      <nav className={cn(
        "fixed top-0 w-full z-50 transition-all duration-700 px-6 py-6",
        scrolled ? "bg-white/80 backdrop-blur-3xl shadow-[0_10px_40px_-15px_rgba(15,23,42,0.05)] py-4" : "bg-transparent"
      )}>
        <div className="container mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-4 group">
            <div className="relative h-12 w-12 overflow-hidden rounded-2xl bg-white p-1 shadow-2xl transition-all group-hover:rotate-6 border border-primary/5">
              <Image src={logoUrl} alt="DEK Logo" fill className="object-contain" data-ai-hint="education logo" />
            </div>
            <div className="hidden sm:block">
              <span className="font-black text-2xl block text-primary leading-tight tracking-tighter italic uppercase">DEK</span>
              <span className="text-[9px] text-muted-foreground block font-black uppercase tracking-[0.2em] opacity-40">Digital Education Coach</span>
            </div>
          </Link>
          
          <div className="hidden lg:flex items-center gap-10 text-[11px] font-black uppercase tracking-widest text-primary/60">
            <Link href="/" className="hover:text-accent transition-colors">Platform</Link>
            <Link href="/features" className="hover:text-accent transition-colors">Teknoloji</Link>
            <Link href="/ai" className="hover:text-accent transition-colors">Yapay Zeka</Link>
            <Link href="/contact" className="hover:text-accent transition-colors">Kurumsal</Link>
          </div>

          <div className="flex items-center gap-4">
            {!loading && (
              user ? (
                <Button className="rounded-2xl px-8 h-12 bg-primary font-black text-xs uppercase tracking-widest shadow-2xl shadow-primary/20 hover:bg-accent transition-all hover:-translate-y-1" asChild>
                  <Link href="/dashboard">Komuta Merkezi</Link>
                </Button>
              ) : (
                <>
                  <Button variant="ghost" className="text-primary hover:bg-primary/5 font-black text-xs uppercase tracking-widest hidden sm:flex" asChild>
                    <Link href="/login">Giriş</Link>
                  </Button>
                  <Button className="rounded-2xl px-8 h-12 bg-accent hover:bg-accent/90 text-white font-black text-xs uppercase tracking-widest shadow-2xl shadow-accent/20 transition-all hover:-translate-y-1" asChild>
                    <Link href="/login?tab=register">Sistemi Başlat</Link>
                  </Button>
                </>
              )
            )}
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="pt-48 pb-32 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-accent/5 blur-[180px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-primary/5 blur-[180px] rounded-full translate-y-1/2 -translate-x-1/2"></div>
          
          <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-24 items-center relative z-10">
            <div className="space-y-12">
              <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-primary text-white font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl shadow-primary/20">
                <Sparkles className="h-4 w-4 text-accent" /> Academic Operating System v4.0
              </div>
              <h1 className="text-7xl md:text-[9rem] font-black text-primary leading-[0.8] tracking-tighter italic uppercase text-shadow-premium">
                Akademik <br /> <span className="text-accent">Zekayı</span> <br /> Yönetin.
              </h1>
              <p className="text-2xl text-muted-foreground leading-relaxed max-w-xl font-medium italic">
                Dijital Eğitim Koçu, öğrencinin tüm akademik yaşamını analiz eden, optimize eden ve başarıyı garanti altına alan dünyanın ilk akademik işletim sistemidir.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 pt-6">
                <Button size="lg" className="bg-primary hover:bg-accent transition-all rounded-[1.75rem] px-12 h-20 text-xl font-black shadow-[0_30px_60px_-15px_rgba(15,23,42,0.3)] group" asChild>
                  <Link href="/login?tab=register">Ücretsiz Deneyin <ArrowRight className="ml-4 h-7 w-7 transition-transform group-hover:translate-x-2" /></Link>
                </Button>
                <Button size="lg" variant="outline" className="border-4 border-primary/10 rounded-[1.75rem] px-12 h-20 text-xl font-black group hover:bg-white transition-all bg-transparent backdrop-blur-sm shadow-xl" asChild>
                  <Link href="/features"><Play className="mr-4 h-7 w-7 fill-current text-accent" /> Tanıtımı İzle</Link>
                </Button>
              </div>
            </div>

            {/* Dashboard Preview */}
            <div className="relative group perspective-2000 hidden lg:block">
              <div className="absolute -inset-20 bg-accent/20 blur-[120px] rounded-full opacity-30 group-hover:opacity-50 transition-opacity duration-1000"></div>
              <div className="relative bg-white/40 backdrop-blur-3xl rounded-[4rem] shadow-[0_80px_160px_-40px_rgba(15,23,42,0.3)] border-[12px] border-white/80 overflow-hidden transform-gpu transition-all duration-1000 group-hover:rotate-y-[-10deg] group-hover:rotate-x-[5deg]">
                 <div className="bg-primary p-12 flex justify-between items-center text-white">
                    <div className="flex items-center gap-5">
                       <div className="h-14 w-14 rounded-2xl bg-accent flex items-center justify-center shadow-2xl">
                          <TrendingUp className="h-8 w-8 text-white" />
                       </div>
                       <span className="font-black text-2xl italic tracking-tight uppercase">Komuta Merkezi</span>
                    </div>
                    <div className="flex items-center gap-3">
                       <span className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse"></span>
                       <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Canlı Analiz</span>
                    </div>
                 </div>
                 <div className="p-16 grid grid-cols-2 gap-12">
                    <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl border border-primary/5 space-y-10">
                       <div className="flex justify-between items-center">
                          <span className="text-[11px] font-black uppercase tracking-widest text-muted-foreground italic">Gelişim Trendi</span>
                          <BarChart3 className="h-6 w-6 text-accent" />
                       </div>
                       <div className="flex items-end gap-4 h-40">
                          {[40, 70, 50, 90, 60, 80, 75].map((h, i) => (
                            <div key={i} className="flex-1 bg-slate-50 rounded-2xl relative overflow-hidden group/bar">
                               <div className="absolute bottom-0 w-full bg-primary rounded-2xl transition-all duration-1000 group-hover/bar:bg-accent" style={{ height: `${h}%` }}></div>
                            </div>
                          ))}
                       </div>
                    </div>
                    <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl border border-primary/5 flex flex-col items-center justify-center text-center space-y-8">
                       <div className="relative h-40 w-40">
                          <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                             <circle cx="50" cy="50" r="45" fill="none" stroke="#F8FAFC" strokeWidth="8" />
                             <circle cx="50" cy="50" r="45" fill="none" stroke="#F59E0B" strokeWidth="8" strokeDasharray="283" strokeDashoffset="40" strokeLinecap="round" className="transition-all duration-1000" />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center font-black text-4xl text-primary italic">87%</div>
                       </div>
                       <span className="text-[11px] font-black uppercase tracking-widest text-muted-foreground italic">Hedef Uyumu</span>
                    </div>
                    <div className="col-span-2 bg-[#0F172A] p-12 rounded-[4rem] flex items-center justify-between shadow-2xl border border-white/5 transition-all hover:scale-[1.02] cursor-pointer">
                       <div className="flex items-center gap-10">
                          <div className="h-24 w-24 rounded-[2.5rem] bg-white/5 flex items-center justify-center border border-white/10 shadow-inner">
                             <Brain className="h-12 w-12 text-accent animate-pulse" />
                          </div>
                          <div className="space-y-2">
                             <p className="font-black text-white text-3xl italic tracking-tight uppercase">AI Koç Tavsiyesi</p>
                             <p className="text-white/40 font-medium text-lg italic">"Matematik netlerindeki %12 artış, hedefindeki okula seni %94 yaklaştırdı."</p>
                          </div>
                       </div>
                       <Button size="icon" className="h-20 w-20 rounded-[2rem] bg-accent text-white shadow-2xl shadow-accent/20 hover:bg-white hover:text-primary transition-all">
                          <ArrowRight className="h-10 w-10" />
                       </Button>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </section>

        {/* AOS Core Features */}
        <section className="py-48 bg-white">
          <div className="container mx-auto px-6">
            <div className="text-center max-w-4xl mx-auto space-y-8 mb-32">
               <h2 className="text-5xl md:text-7xl font-black text-primary tracking-tighter italic uppercase leading-none">Akademik <br /><span className="text-accent">İşletim Sisteminin</span> Gücü</h2>
               <p className="text-xl text-muted-foreground font-medium italic leading-relaxed">Sıradan bir eğitim platformu değil; yapay zeka tarafından yönetilen dinamik bir ekosistem.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-12">
               {[
                 { icon: Cpu, title: "AI ANALİZ MOTORU", desc: "Öğrencinin öğrenme hızını ve eksiklerini milisaniyeler içinde tespit eden sinirsel ağlar.", color: "bg-blue-500" },
                 { icon: Layers, title: "HİBRİT MÜFREDAT", desc: "Milli Eğitim ve uluslararası standartlarla tam uyumlu, kişiye göre mutasyona uğrayan ders planları.", color: "bg-accent" },
                 { icon: ShieldCheck, title: "VERİ GÜVENLİĞİ", desc: "Tüm akademik gelişim verileri en yüksek güvenlik protokolleri ile korunur ve şifrelenir.", color: "bg-emerald-500" },
               ].map((f, i) => (
                 <div key={i} className="group p-12 bg-[#F8FAFC] rounded-[4rem] border border-primary/5 hover:bg-white hover:shadow-2xl transition-all duration-700 hover:-translate-y-4">
                    <div className={cn("h-20 w-20 rounded-[2.5rem] flex items-center justify-center text-white shadow-2xl mb-10 group-hover:rotate-12 transition-transform duration-700", f.color)}>
                       <f.icon className="h-10 w-10" />
                    </div>
                    <h3 className="text-2xl font-black text-primary tracking-tighter italic uppercase mb-6 leading-none">{f.title}</h3>
                    <p className="text-muted-foreground font-medium italic leading-relaxed">{f.desc}</p>
                 </div>
               ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-primary text-white pt-48 pb-20 relative overflow-hidden border-t border-white/5">
        <div className="container mx-auto px-6 grid md:grid-cols-4 gap-24 pb-24 border-b border-white/5">
          <div className="col-span-2 space-y-12">
            <Link href="/" className="flex items-center gap-5 group">
              <div className="relative h-16 w-16 overflow-hidden rounded-[1.5rem] bg-white p-1 shadow-2xl transition-transform group-hover:rotate-6">
                <Image src={logoUrl} alt="Logo" fill className="object-contain" />
              </div>
              <div className="space-y-1">
                <span className="font-black text-4xl tracking-tighter block leading-none italic uppercase">DEK</span>
                <span className="text-[11px] text-white/40 font-black uppercase tracking-[0.2em]">Academic Operating System</span>
              </div>
            </Link>
            <p className="text-white/50 text-2xl leading-relaxed max-w-xl font-medium italic">
              Eğitim teknolojilerinde devrim yaparak, her öğrencinin potansiyelini dijital zeka ile zirveye taşıyoruz.
            </p>
          </div>
          <div className="space-y-10">
            <h4 className="font-black text-accent text-sm uppercase tracking-[0.4em] italic">Yol Haritası</h4>
            <ul className="space-y-6 text-white/60 font-bold text-lg">
               <li><Link href="#" className="hover:text-white transition-colors">Yapay Zeka Vizyonu</Link></li>
               <li><Link href="#" className="hover:text-white transition-colors">Kurumsal Çözümler</Link></li>
               <li><Link href="/contact" className="hover:text-white transition-colors">Global Destek</Link></li>
            </ul>
          </div>
          <div className="space-y-10">
            <h4 className="font-black text-accent text-sm uppercase tracking-[0.4em] italic">Ağımız</h4>
            <div className="flex gap-6">
              {[Globe, Bell, Award].map((Icon, i) => (
                <div key={i} className="h-16 w-16 rounded-[1.5rem] bg-white/5 flex items-center justify-center hover:bg-accent hover:scale-110 transition-all cursor-pointer border border-white/10 shadow-xl">
                  <Icon className="h-7 w-7" />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="container mx-auto px-6 pt-16 text-white/20 text-xs font-black uppercase tracking-[0.3em] flex justify-between items-center">
          <p>© 2026 DEK Academic Operating System. Bütün hakları saklıdır.</p>
          <div className="flex gap-10">
             <span>v4.8.2 Stable</span>
             <span>Safe & Encrypted</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
