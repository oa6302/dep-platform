
'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useUser, useFirestore } from '@/firebase';
import { 
  Database, 
  Loader2, 
  Globe, 
  Moon, 
  Bell, 
  ArrowRight, 
  Play, 
  CheckCircle2, 
  TrendingUp, 
  Target, 
  Brain, 
  Users, 
  BookOpen, 
  ShieldCheck, 
  Award, 
  LayoutDashboard 
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { doc, setDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
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

  const logoUrl = PlaceHolderImages.find(img => img.id === 'app-logo')?.imageUrl || "https://picsum.photos/seed/edu-logo-99/400/400";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSeedData = async () => {
    if (!db) return;
    setSeeding(true);
    try {
      const sampleAdminId = 'sample-admin-999';
      await setDoc(doc(db, 'users', sampleAdminId), {
        uid: sampleAdminId,
        displayName: 'Sistem Yöneticisi',
        email: 'admin@dijitalegitim.com',
        role: 'admin',
        createdAt: serverTimestamp(),
      });

      const sampleTeacherId = 'sample-teacher-111';
      await setDoc(doc(db, 'users', sampleTeacherId), {
        uid: sampleTeacherId,
        displayName: 'Ahmet Koç',
        email: 'ahmet@test.com',
        role: 'teacher',
        createdAt: serverTimestamp(),
      });

      const sampleStudentId = 'sample-student-222';
      await setDoc(doc(db, 'users', sampleStudentId), {
        uid: sampleStudentId,
        displayName: 'Mehmet Öğrenci',
        email: 'mehmet@test.com',
        role: 'student',
        coachId: sampleTeacherId,
        createdAt: serverTimestamp(),
      });

      await addDoc(collection(db, 'tasks'), {
        studentId: sampleStudentId,
        teacherId: sampleTeacherId,
        title: 'Matematik Ödevi #1',
        description: 'Logaritma konusundaki testleri bitir.',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        status: 'pending',
        createdAt: serverTimestamp(),
      });

      toast({
        title: 'Veritabanı Başlatıldı',
        description: 'Örnek veriler başarıyla oluşturuldu.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Hata',
        description: error.message,
      });
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC]">
      {/* Navbar */}
      <nav className={cn(
        "fixed top-0 w-full z-50 transition-all duration-300 px-6 py-4",
        scrolled ? "glass-morphism shadow-sm translate-y-0" : "bg-transparent translate-y-2"
      )}>
        <div className="container mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative h-12 w-12 overflow-hidden rounded-xl bg-white p-0.5 shadow-sm border border-primary/5">
              <Image 
                src={logoUrl} 
                alt="Dijital Eğitim Koçu Logo" 
                fill 
                className="object-contain"
                data-ai-hint="education logo blue gold"
              />
            </div>
            <div className="hidden sm:block">
              <span className="font-black text-xl block text-primary leading-tight tracking-tighter">Dijital Eğitim Koçu</span>
              <span className="text-[10px] text-muted-foreground block font-bold uppercase tracking-widest opacity-60">AI Destekli Akademik Platform</span>
            </div>
          </Link>
          
          <div className="hidden lg:flex items-center gap-8 text-sm font-bold text-primary/70">
            <Link href="#" className="hover:text-accent transition-colors">Ana Sayfa</Link>
            <Link href="#features" className="hover:text-accent transition-colors">Özellikler</Link>
            <Link href="#" className="hover:text-accent transition-colors">Modüller</Link>
            <Link href="#" className="hover:text-accent transition-colors">Yapay Zeka</Link>
            <Link href="#" className="hover:text-accent transition-colors">Koçluk</Link>
            <Link href="#" className="hover:text-accent transition-colors">İletişim</Link>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 mr-4">
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl"><Globe className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl"><Moon className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl"><Bell className="h-4 w-4" /></Button>
            </div>
            {!loading && (
              user ? (
                <Button className="rounded-2xl px-6 bg-primary font-bold shadow-xl shadow-primary/20 hover:bg-accent hover:-translate-y-0.5 transition-all" asChild>
                  <Link href="/dashboard">Panelim</Link>
                </Button>
              ) : (
                <>
                  <Button variant="ghost" className="text-primary hover:bg-primary/5 font-bold" asChild>
                    <Link href="/login">Giriş Yap</Link>
                  </Button>
                  <Button className="rounded-2xl px-6 bg-accent hover:bg-accent/90 text-white font-bold shadow-xl shadow-accent/20 hover:-translate-y-0.5 transition-all" asChild>
                    <Link href="/login?tab=register">Ücretsiz Başla</Link>
                  </Button>
                </>
              )
            )}
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="pt-40 pb-24 relative overflow-hidden hero-gradient">
          <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-10">
              <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-accent/10 text-accent font-black text-xs uppercase tracking-widest border border-accent/20">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent"></span>
                </span>
                ✨ Türkiye'nin Yeni Nesil Dijital Eğitim Platformu
              </div>
              
              <h1 className="text-6xl md:text-8xl font-black text-primary leading-[1] tracking-tighter">
                Geleceğini <br />
                Dijital Olarak <br />
                Yönet, <br />
                <span className="text-gradient-orange">Profesyonelce</span> <br />
                Yükselt.
              </h1>

              <p className="text-xl text-muted-foreground leading-relaxed max-w-xl font-medium">
                LGS, YKS, AGS ve okul başarınızı yapay zekâ destekli analizler ile takip edin. 
                Öğrenci, öğretmen ve veli tek platformda buluşsun.
              </p>

              <div className="flex flex-col sm:flex-row gap-5">
                <Button size="lg" className="bg-primary hover:bg-accent transition-all rounded-[1.5rem] px-10 py-8 text-xl font-black shadow-2xl shadow-primary/30" asChild>
                  <Link href="/login?tab=register">Ücretsiz Başla <ArrowRight className="ml-3 h-6 w-6" /></Link>
                </Button>
                <Button size="lg" variant="outline" className="border-2 border-primary/10 rounded-[1.5rem] px-10 py-8 text-xl font-black group hover:bg-white transition-all bg-transparent">
                  <Play className="mr-3 h-6 w-6 fill-current group-hover:text-accent transition-colors" /> Canlı Demo İzle
                </Button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-12 pt-12 border-t border-primary/5">
                <div className="space-y-1">
                  <p className="text-4xl font-black text-primary tracking-tighter">150K+</p>
                  <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Analiz</p>
                </div>
                <div className="space-y-1">
                  <p className="text-4xl font-black text-primary tracking-tighter">650+</p>
                  <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Okul</p>
                </div>
                <div className="space-y-1">
                  <p className="text-4xl font-black text-primary tracking-tighter">96%</p>
                  <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Memnuniyet</p>
                </div>
                <div className="space-y-1">
                  <p className="text-4xl font-black text-primary tracking-tighter">3500+</p>
                  <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Öğretmen</p>
                </div>
              </div>
            </div>

            {/* Dashboard Mockup */}
            <div className="relative group">
              <div className="absolute -inset-10 bg-accent/20 blur-[100px] rounded-full opacity-30 group-hover:opacity-50 transition-opacity duration-1000 animate-pulse"></div>
              <div className="relative glass-morphism rounded-[3.5rem] shadow-[0_50px_100px_-20px_rgba(15,23,42,0.3)] overflow-hidden border-[12px] border-primary/5 transition-transform duration-700 hover:scale-[1.02]">
                <div className="bg-primary p-8 flex justify-between items-center text-white border-b border-white/5">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-2xl bg-accent flex items-center justify-center shadow-lg shadow-accent/20">
                      <TrendingUp className="h-6 w-6 text-white" />
                    </div>
                    <span className="font-black text-lg tracking-tight uppercase italic">Akademik Başarı</span>
                  </div>
                  <div className="h-10 w-10 rounded-2xl bg-white/10 border border-white/10"></div>
                </div>
                <div className="p-10 grid grid-cols-2 gap-8 bg-white/40 backdrop-blur-3xl">
                  <div className="bg-white/80 p-8 rounded-[2rem] shadow-xl shadow-primary/5 border border-white/20 space-y-6 transition-all hover:bg-white">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Haftalık Gelişim</p>
                    <div className="flex items-end gap-3 h-28">
                      {[40, 70, 50, 90, 60, 80].map((h, i) => (
                        <div key={i} className="flex-1 bg-accent/10 rounded-xl relative group/bar overflow-hidden">
                          <div className="absolute bottom-0 w-full bg-accent rounded-xl transition-all duration-1000 shadow-[0_0_20px_rgba(245,158,11,0.3)]" style={{ height: `${h}%` }}></div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white/80 p-8 rounded-[2rem] shadow-xl shadow-primary/5 border border-white/20 flex flex-col items-center justify-center text-center space-y-4 transition-all hover:bg-white">
                    <div className="relative h-24 w-24">
                       <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="45" fill="transparent" stroke="currentColor" strokeWidth="8" className="text-accent/10" />
                        <circle cx="50" cy="50" r="45" fill="transparent" stroke="currentColor" strokeWidth="8" strokeDasharray="283" strokeDashoffset="40" className="text-accent transition-all duration-1000" />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="font-black text-2xl text-primary">87%</span>
                      </div>
                    </div>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Hedef Tamamlama</p>
                  </div>
                  <div className="bg-primary p-8 rounded-[2rem] shadow-2xl shadow-primary/40 col-span-2 flex items-center justify-between group/advice cursor-pointer transition-all hover:translate-y-[-4px]">
                    <div className="flex items-center gap-6">
                      <div className="bg-white/10 p-4 rounded-2xl border border-white/10 transition-transform group-hover/advice:scale-110"><Brain className="h-8 w-8 text-accent" /></div>
                      <div>
                        <p className="font-black text-white text-lg tracking-tight">AI Koç Tavsiyesi</p>
                        <p className="text-sm text-white/60 font-medium">Bugün Logaritma testlerine odaklanmalısın.</p>
                      </div>
                    </div>
                    <Button size="icon" variant="ghost" className="h-12 w-12 rounded-2xl bg-white/5 text-white hover:bg-accent transition-colors"><ArrowRight className="h-6 w-6" /></Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-32 bg-white relative">
          <div className="container mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-24 space-y-6">
              <h2 className="text-5xl md:text-6xl font-black text-primary tracking-tighter">Neden Biz?</h2>
              <p className="text-muted-foreground text-xl font-medium leading-relaxed">Eğitimde başarı bir varış noktası değil, bir yolculuktur. Biz bu yolculukta sizin en akıllı pusulanızız.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
              {[
                { icon: Target, title: "Akıllı Hedefler", desc: "Yapay zekâ günlük hedeflerinizi ilgi alanlarınıza ve eksiklerinize göre anlık oluşturur.", color: "accent" },
                { icon: TrendingUp, title: "Başarı Analizi", desc: "En ince detayına kadar hazırlanmış grafikler ve raporlar ile gelişim sürecinizi izleyin.", color: "primary" },
                { icon: Brain, title: "AI Eğitim Koçu", desc: "Sizi tanıyan, öğrenme stilinizi analiz eden ve kişiye özel rota öneren akıllı asistan.", color: "accent" },
                { icon: Award, title: "Sınav Takibi", desc: "LGS'den KPSS'ye kadar tüm ulusal sınav süreçlerini tek bir panelden kontrol edin.", color: "primary" },
              ].map((feature, i) => (
                <div key={i} className="group p-12 bg-[#F8FAFC] rounded-[3rem] border border-transparent hover:border-accent/10 hover:bg-white hover:shadow-[0_40px_80px_-20px_rgba(15,23,42,0.1)] hover:-translate-y-3 transition-all duration-700">
                  <div className={cn(
                    "h-20 w-20 rounded-[1.75rem] flex items-center justify-center mb-10 transition-all group-hover:scale-110 group-hover:rotate-6 duration-500 shadow-lg",
                    feature.color === "accent" ? "bg-accent text-white shadow-accent/20" : "bg-primary text-white shadow-primary/20"
                  )}>
                    <feature.icon className="h-10 w-10" />
                  </div>
                  <h3 className="text-2xl font-black text-primary mb-6 tracking-tight">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed font-medium">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* AI Section */}
        <section className="py-32 bg-primary text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-2/3 h-full bg-accent/10 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/2 animate-pulse"></div>
          <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-24 items-center">
            <div className="space-y-12 relative z-10">
              <h2 className="text-5xl md:text-7xl font-black leading-[1] tracking-tighter">
                Yapay Zeka <br />
                <span className="text-accent">Başarıyı</span> <br />
                Tesadüfe Bırakmaz.
              </h2>
              <ul className="space-y-8">
                {[
                  "Eksik konuları tespit eder ve odağı belirler.",
                  "Kişiselleştirilmiş haftalık çalışma planı hazırlar.",
                  "Sınav sonuçlarına göre başarı tahmini üretir.",
                  "Motivasyonunuzu artıracak kişisel koçluk sunar."
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-6 text-xl font-bold opacity-90 group cursor-default">
                    <div className="h-8 w-8 rounded-xl bg-accent/20 flex items-center justify-center border border-accent/40 group-hover:bg-accent transition-colors">
                      <CheckCircle2 className="h-5 w-5 text-accent group-hover:text-white" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
              <Button size="lg" className="bg-accent hover:bg-white hover:text-primary transition-all rounded-[1.5rem] px-12 py-9 text-xl font-black shadow-2xl shadow-accent/30">
                AI Asistanı Şimdi Dene
              </Button>
            </div>
            
            <div className="relative group">
              <div className="absolute -inset-4 bg-accent/20 blur-2xl rounded-[4rem] opacity-20 group-hover:opacity-40 transition-opacity"></div>
              <div className="relative glass-morphism rounded-[3.5rem] p-12 border-white/10 shadow-3xl bg-white/5 backdrop-blur-3xl transition-all duration-700 group-hover:translate-x-4">
                <div className="space-y-10">
                  <div className="flex justify-between items-center border-b border-white/10 pb-8">
                    <div className="space-y-1">
                      <span className="font-black text-accent text-2xl tracking-tighter italic">Haftalık AI Analizi</span>
                      <p className="text-[10px] uppercase font-black tracking-widest text-white/40">Sistem Sürümü v4.2.0</p>
                    </div>
                    <Award className="h-10 w-10 text-accent" />
                  </div>
                  <div className="space-y-8">
                    <p className="text-lg opacity-80 leading-relaxed italic font-medium border-l-4 border-accent pl-6">
                      "Analizlerimize göre Matematik-Geometri netlerinde son 3 haftada %12 artış gözlemlendi. 
                      Bu hafta Türev konusuna yoğunlaşman sınav hedefin için kritik öneme sahip."
                    </p>
                    <div className="grid grid-cols-3 gap-6 text-center">
                      <div className="bg-white/10 p-6 rounded-[1.5rem] border border-white/10 transition-transform hover:scale-105">
                        <p className="text-3xl font-black">92%</p>
                        <p className="text-[10px] opacity-60 font-black uppercase mt-1">Tahmin Gücü</p>
                      </div>
                      <div className="bg-white/10 p-6 rounded-[1.5rem] border border-white/10 transition-transform hover:scale-105">
                        <p className="text-3xl font-black text-accent">+14</p>
                        <p className="text-[10px] opacity-60 font-black uppercase mt-1">Net Artışı</p>
                      </div>
                      <div className="bg-white/10 p-6 rounded-[1.5rem] border border-white/10 transition-transform hover:scale-105">
                        <p className="text-3xl font-black">🔥</p>
                        <p className="text-[10px] opacity-60 font-black uppercase mt-1">Motivasyon</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Database Seed Section (Temp for setup) */}
        <section className="py-24 border-t border-primary/5 bg-[#F8FAFC]">
          <div className="container mx-auto px-6 text-center max-w-2xl">
            <div className="bg-white p-12 rounded-[3rem] shadow-2xl shadow-primary/5 border border-primary/5">
              <h3 className="text-2xl font-black text-primary mb-6">Sistemi Başlatın</h3>
              <p className="text-muted-foreground mb-10 font-medium">Platformu test etmek için gerekli olan tüm koleksiyonları ve örnek verileri tek tıkla oluşturun.</p>
              <Button 
                size="lg" 
                variant="outline" 
                className="px-12 py-8 border-2 border-accent text-accent hover:bg-accent hover:text-white transition-all rounded-[1.5rem] font-black text-lg shadow-xl shadow-accent/10"
                onClick={handleSeedData}
                disabled={seeding}
              >
                {seeding ? <Loader2 className="mr-3 h-6 w-6 animate-spin" /> : <Database className="mr-3 h-6 w-6" />}
                Örnek Verileri Yükle
              </Button>
              <p className="mt-6 text-[10px] text-muted-foreground font-black uppercase tracking-widest">
                * Bu işlem Firestore üzerinde users, tasks ve sessions koleksiyonlarını oluşturur.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-primary text-white pt-32 pb-16">
        <div className="container mx-auto px-6 grid md:grid-cols-4 gap-20 pb-20 border-b border-white/5">
          <div className="col-span-2 space-y-10">
            <Link href="/" className="flex items-center gap-4">
              <div className="relative h-14 w-14 overflow-hidden rounded-2xl bg-white p-1 shadow-2xl">
                <Image 
                  src={logoUrl} 
                  alt="Dijital Eğitim Koçu Logo" 
                  fill 
                  className="object-contain"
                  data-ai-hint="education logo blue gold"
                />
              </div>
              <div className="space-y-0.5">
                <span className="font-black text-3xl tracking-tighter block leading-none">Dijital Eğitim Koçu</span>
                <span className="text-[10px] text-white/40 font-black uppercase tracking-[0.2em]">Premium Education Platform</span>
              </div>
            </Link>
            <p className="text-white/50 text-xl leading-relaxed max-w-md font-medium">
              Yapay Zekâ Destekli Akademik Başarı ve Eğitim Yönetim Platformu. Geleceğinizi bugünden inşa edin.
            </p>
          </div>
          <div className="space-y-8">
            <h4 className="font-black text-accent text-lg uppercase tracking-widest italic">Kurumsal</h4>
            <ul className="space-y-5 text-white/50 font-bold">
              <li><Link href="#" className="hover:text-white transition-colors">KVKK ve Gizlilik</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Yardım Merkezi</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">İş Ortaklığı</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Akademik Blog</Link></li>
            </ul>
          </div>
          <div className="space-y-8">
            <h4 className="font-black text-accent text-lg uppercase tracking-widest italic">Bizi Takip Edin</h4>
            <div className="flex gap-4">
              {[Globe, Award, Bell].map((Icon, i) => (
                <div key={i} className="h-14 w-14 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-accent transition-all cursor-pointer border border-white/5 hover:translate-y-[-4px]">
                  <Icon className="h-6 w-6" />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="container mx-auto px-6 pt-16 flex flex-col md:flex-row justify-between items-center gap-6 text-white/30 text-[10px] font-black uppercase tracking-widest">
          <p>© 2026 Dijital Eğitim Koçu. Tüm hakları saklıdır.</p>
          <div className="flex gap-8">
            <Link href="#" className="hover:text-white transition-colors">Kullanım Koşulları</Link>
            <Link href="#" className="hover:text-white transition-colors">Çerez Politikası</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
