
'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useUser, useFirestore } from '@/firebase';
import { 
  Database, 
  Loader2, 
  ArrowRight, 
  Play, 
  TrendingUp, 
  Brain, 
  Users, 
  BarChart3,
  Star,
  Sparkles,
  ChevronRight,
  Globe,
  Bell,
  Award
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function HomePage() {
  const { user, loading } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [seeding, setSeeding] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const logoUrl = PlaceHolderImages.find(img => img.id === 'app-logo')?.imageUrl || "https://picsum.photos/seed/edu-logo-102/400/400";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSeedData = async () => {
    if (!db) return;
    setSeeding(true);
    try {
      const sampleTeacherId = 'sample-teacher-111';
      await setDoc(doc(db, 'users', sampleTeacherId), {
        uid: sampleTeacherId,
        displayName: 'Mehmet Koç',
        email: 'mehmet@test.com',
        role: 'teacher',
        activationCode: 'DK-TR7X-5K92',
        branch: 'Matematik',
        targetExam: 'YKS',
        experience: 12,
        rating: 4.9,
        reviewCount: 154,
        badges: ['verified', 'diploma', 'premium'],
        bio: 'Boğaziçi Mezunu, 12 yıllık YKS hazırlık tecrübesi ile öğrencilere koçluk yapmaktayım.',
        createdAt: serverTimestamp(),
      });
      toast({ title: 'Sistem Hazır', description: 'Örnek veriler başarıyla oluşturuldu.' });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Hata', description: error.message });
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC]">
      <nav className={cn(
        "fixed top-0 w-full z-50 transition-all duration-500 px-6 py-4",
        scrolled ? "bg-white/70 backdrop-blur-2xl shadow-[0_20px_50px_-15px_rgba(15,23,42,0.1)] translate-y-0" : "bg-transparent translate-y-2"
      )}>
        <div className="container mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-4 group">
            <div className="relative h-12 w-12 overflow-hidden rounded-2xl bg-white p-1 shadow-2xl transition-all group-hover:rotate-6">
              <Image src={logoUrl} alt="DEK Logo" fill className="object-contain" data-ai-hint="education logo" />
            </div>
            <div className="hidden sm:block">
              <span className="font-black text-2xl block text-primary leading-tight tracking-tighter italic text-shadow-premium uppercase">DEK</span>
              <span className="text-[9px] text-muted-foreground block font-black uppercase tracking-[0.2em] opacity-40">Dijital Eğitim Koçu</span>
            </div>
          </Link>
          
          <div className="hidden lg:flex items-center gap-10 text-[11px] font-black uppercase tracking-widest text-primary/60">
            <Link href="/" className="hover:text-accent transition-colors">Ana Sayfa</Link>
            <Link href="/features" className="hover:text-accent transition-colors">Özellikler</Link>
            <Link href="/ai" className="hover:text-accent transition-colors">Yapay Zeka</Link>
            <Link href="/contact" className="hover:text-accent transition-colors">İletişim</Link>
          </div>

          <div className="flex items-center gap-4">
            {!loading && (
              user ? (
                <Button className="rounded-2xl px-8 h-12 bg-primary font-black text-xs uppercase tracking-widest shadow-2xl shadow-primary/20 hover:bg-accent transition-all hover:-translate-y-1" asChild>
                  <Link href="/dashboard">Panelim</Link>
                </Button>
              ) : (
                <>
                  <Button variant="ghost" className="text-primary hover:bg-primary/5 font-black text-xs uppercase tracking-widest hidden sm:flex" asChild>
                    <Link href="/login">Giriş Yap</Link>
                  </Button>
                  <Button className="rounded-2xl px-8 h-12 bg-accent hover:bg-accent/90 text-white font-black text-xs uppercase tracking-widest shadow-2xl shadow-accent/20 transition-all hover:-translate-y-1" asChild>
                    <Link href="/login?tab=register">Ücretsiz Başla</Link>
                  </Button>
                </>
              )
            )}
          </div>
        </div>
      </nav>

      <main>
        <section className="pt-48 pb-32 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-accent/5 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary/5 blur-[150px] rounded-full translate-y-1/2 -translate-x-1/2"></div>
          
          <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-20 items-center relative z-10">
            <div className="space-y-12">
              <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-accent/10 text-accent font-black text-[10px] uppercase tracking-[0.3em] border border-accent/20 shadow-xl shadow-accent/5">
                ✨ Türkiye'nin Yeni Nesil Eğitim Platformu
              </div>
              <h1 className="text-7xl md:text-[8rem] font-black text-primary leading-[0.8] tracking-tighter italic text-shadow-premium uppercase">
                Geleceğini <br /> Dijital <br /> Yönet, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-orange-600 text-shadow-accent">Başarını</span> <br /> Yükselt.
              </h1>
              <p className="text-2xl text-muted-foreground leading-relaxed max-w-xl font-medium italic">
                YKS, LGS ve akademik başarınızı yapay zeka destekli analizlerle takip edin. Profesyonel koçluk parmaklarınızın ucunda.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 pt-6">
                <Button size="lg" className="bg-primary hover:bg-accent transition-all rounded-[1.75rem] px-12 h-20 text-xl font-black shadow-[0_30px_60px_-15px_rgba(15,23,42,0.3)] group" asChild>
                  <Link href="/login?tab=register">Ücretsiz Başla <ArrowRight className="ml-4 h-7 w-7 transition-transform group-hover:translate-x-2" /></Link>
                </Button>
                <Button size="lg" variant="outline" className="border-4 border-primary/10 rounded-[1.75rem] px-12 h-20 text-xl font-black group hover:bg-white transition-all bg-transparent backdrop-blur-sm shadow-xl" asChild>
                  <Link href="/features"><Play className="mr-4 h-7 w-7 fill-current text-accent" /> Özellikleri Keşfet</Link>
                </Button>
              </div>
            </div>

            <div className="relative group perspective-2000">
              <div className="absolute -inset-20 bg-accent/20 blur-[120px] rounded-full opacity-30 group-hover:opacity-50 transition-opacity duration-1000"></div>
              <div className="relative bg-white/40 backdrop-blur-3xl rounded-[4rem] shadow-[0_80px_160px_-40px_rgba(15,23,42,0.4)] border-[12px] border-white/80 overflow-hidden transform-gpu transition-all duration-1000 group-hover:rotate-y-[-8deg] group-hover:rotate-x-[4deg]">
                 <div className="bg-primary p-10 flex justify-between items-center text-white">
                    <div className="flex items-center gap-5">
                       <div className="h-12 w-12 rounded-2xl bg-accent flex items-center justify-center shadow-2xl">
                          <TrendingUp className="h-7 w-7" />
                       </div>
                       <span className="font-black text-xl italic tracking-tight uppercase text-shadow-premium">Akademik Başarı</span>
                    </div>
                 </div>
                 <div className="p-12 grid grid-cols-2 gap-10">
                    <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-primary/5 space-y-8">
                       <div className="flex justify-between items-center">
                          <span className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Haftalık Net</span>
                          <BarChart3 className="h-5 w-5 text-accent" />
                       </div>
                       <div className="flex items-end gap-3 h-32">
                          {[40, 70, 50, 90, 60, 80].map((h, i) => (
                            <div key={i} className="flex-1 bg-[#F1F5F9] rounded-xl relative overflow-hidden group/bar">
                               <div className="absolute bottom-0 w-full bg-accent rounded-xl transition-all duration-1000" style={{ height: `${h}%` }}></div>
                            </div>
                          ))}
                       </div>
                    </div>
                    <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-primary/5 flex flex-col items-center justify-center text-center space-y-6">
                       <div className="relative h-32 w-32">
                          <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                             <circle cx="50" cy="50" r="45" fill="none" stroke="#F1F5F9" strokeWidth="8" />
                             <circle cx="50" cy="50" r="45" fill="none" stroke="#F59E0B" strokeWidth="8" strokeDasharray="283" strokeDashoffset="40" strokeLinecap="round" className="transition-all duration-1000" />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center font-black text-3xl text-primary">87%</div>
                       </div>
                       <span className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Hedef Tamamlama</span>
                    </div>
                    <div className="col-span-2 bg-primary p-10 rounded-[3rem] flex items-center justify-between shadow-2xl transition-all hover:scale-[1.02] cursor-pointer">
                       <div className="flex items-center gap-8">
                          <div className="h-20 w-20 rounded-[2rem] bg-white/10 flex items-center justify-center border border-white/20">
                             <Brain className="h-10 w-10 text-accent" />
                          </div>
                          <div className="space-y-2">
                             <p className="font-black text-white text-2xl italic tracking-tight text-shadow-premium uppercase">AI Koç Tavsiyesi</p>
                             <p className="text-white/60 font-medium">Bu hafta Türev sorularına odaklanmalısın.</p>
                          </div>
                       </div>
                       <Button size="icon" className="h-16 w-16 rounded-[1.5rem] bg-accent text-white shadow-2xl shadow-accent/20" asChild>
                          <Link href="/ai"><ArrowRight className="h-8 w-8" /></Link>
                       </Button>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-32 bg-[#F1F5F9]/50">
          <div className="container mx-auto px-6 text-center max-w-3xl">
            <div className="bg-white p-16 rounded-[4rem] shadow-[0_60px_120px_-30px_rgba(15,23,42,0.1)] border border-primary/5 space-y-12">
              <div className="space-y-4">
                 <h3 className="text-4xl font-black text-primary tracking-tighter italic uppercase text-shadow-premium">Sistemi Başlat</h3>
                 <p className="text-xl text-muted-foreground font-medium italic">Platformu tüm rolleriyle test etmek için örnek verileri yükleyin.</p>
              </div>
              <Button 
                size="lg" 
                className="h-24 px-16 bg-accent hover:bg-primary transition-all rounded-[2rem] font-black text-2xl shadow-[0_30px_60px_-15px_rgba(245,158,11,0.4)] group"
                onClick={handleSeedData}
                disabled={seeding}
              >
                {seeding ? <Loader2 className="mr-4 h-8 w-8 animate-spin" /> : <Database className="mr-4 h-8 w-8 transition-transform group-hover:scale-110" />}
                Örnek Verileri Yükle
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-primary text-white pt-48 pb-20 relative overflow-hidden">
        <div className="container mx-auto px-6 grid md:grid-cols-4 gap-24 pb-24 border-b border-white/5">
          <div className="col-span-2 space-y-12">
            <Link href="/" className="flex items-center gap-5 group">
              <div className="relative h-16 w-16 overflow-hidden rounded-[1.5rem] bg-white p-1 shadow-2xl transition-transform group-hover:rotate-6">
                <Image src={logoUrl} alt="Logo" fill className="object-contain" />
              </div>
              <div className="space-y-1">
                <span className="font-black text-4xl tracking-tighter block leading-none italic text-shadow-premium uppercase">DEK</span>
                <span className="text-[11px] text-white/40 font-black uppercase tracking-[0.2em]">Dijital Eğitim Koçu</span>
              </div>
            </Link>
            <p className="text-white/50 text-2xl leading-relaxed max-w-xl font-medium italic">
              Yapay Zeka destekli eğitim teknolojileri ile akademik başarıyı tesadüf olmaktan çıkarıyoruz.
            </p>
          </div>
          <div className="space-y-10">
            <h4 className="font-black text-accent text-sm uppercase tracking-[0.4em] italic">Kurumsal</h4>
            <ul className="space-y-6 text-white/60 font-bold text-lg">
              <li><Link href="#" className="hover:text-white transition-colors">KVKK ve Gizlilik</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Kullanım Koşulları</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Yardım Merkezi</Link></li>
            </ul>
          </div>
          <div className="space-y-10">
            <h4 className="font-black text-accent text-sm uppercase tracking-[0.4em] italic">Bağlanın</h4>
            <div className="flex gap-6">
              {[Globe, Bell, Award].map((Icon, i) => (
                <div key={i} className="h-16 w-16 rounded-[1.5rem] bg-white/5 flex items-center justify-center hover:bg-accent hover:scale-110 transition-all cursor-pointer border border-white/10 shadow-xl">
                  <Icon className="h-7 w-7" />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="container mx-auto px-6 pt-16 text-white/20 text-xs font-black uppercase tracking-[0.3em]">
          <p>© 2026 Dijital Eğitim Koçu. Tüm hakları saklıdır.</p>
        </div>
      </footer>
    </div>
  );
}
