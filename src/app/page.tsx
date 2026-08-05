
'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useUser, useFirestore } from '@/firebase';
import { 
  GraduationCap, 
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

export default function HomePage() {
  const { user, loading } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [seeding, setSeeding] = useState(false);
  const [scrolled, setScrolled] = useState(false);

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
            <div className="bg-primary text-white p-2 rounded-xl group-hover:bg-accent transition-colors">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <span className="font-bold text-xl block text-primary">Dijital Eğitim Koçu</span>
              <span className="text-[10px] text-muted-foreground block -mt-1 font-medium">AI Destekli Akademik Platform</span>
            </div>
          </Link>
          
          <div className="hidden lg:flex items-center gap-8 text-sm font-semibold text-primary/80">
            <Link href="#" className="hover:text-accent transition-colors">Ana Sayfa</Link>
            <Link href="#features" className="hover:text-accent transition-colors">Özellikler</Link>
            <Link href="#" className="hover:text-accent transition-colors">Modüller</Link>
            <Link href="#" className="hover:text-accent transition-colors">Yapay Zeka</Link>
            <Link href="#" className="hover:text-accent transition-colors">Koçluk</Link>
            <Link href="#" className="hover:text-accent transition-colors">İletişim</Link>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 mr-4">
              <Button variant="ghost" size="icon" className="h-8 w-8"><Globe className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" className="h-8 w-8"><Moon className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" className="h-8 w-8"><Bell className="h-4 w-4" /></Button>
            </div>
            {!loading && (
              user ? (
                <Button className="rounded-full px-6 shadow-lg shadow-primary/20" asChild>
                  <Link href="/dashboard">Panelim</Link>
                </Button>
              ) : (
                <>
                  <Button variant="ghost" className="text-accent hover:bg-accent/5 font-bold" asChild>
                    <Link href="/login">Giriş Yap</Link>
                  </Button>
                  <Button className="rounded-full px-6 bg-primary hover:bg-primary/90 text-white font-bold" asChild>
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
        <section className="pt-32 pb-20 relative overflow-hidden hero-gradient">
          <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent font-bold text-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
                </span>
                ✨ Türkiye'nin Yeni Nesil Dijital Eğitim Platformu
              </div>
              
              <h1 className="text-5xl md:text-7xl font-black text-primary leading-[1.1] tracking-tight">
                Geleceğini <br />
                Dijital Olarak <br />
                Yönet, <br />
                <span className="text-gradient-orange">Profesyonelce</span> <br />
                Yükselt.
              </h1>

              <p className="text-xl text-muted-foreground leading-relaxed max-w-lg">
                LGS, YKS, AGS ve okul başarınızı yapay zekâ destekli analizler ile takip edin. 
                Öğrenci, öğretmen ve veli tek platformda buluşsun.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-primary hover:bg-accent transition-all rounded-2xl px-8 py-7 text-lg font-bold" asChild>
                  <Link href="/login?tab=register">Ücretsiz Başla <ArrowRight className="ml-2 h-5 w-5" /></Link>
                </Button>
                <Button size="lg" variant="outline" className="border-2 rounded-2xl px-8 py-7 text-lg font-bold group">
                  <Play className="mr-2 h-5 w-5 fill-current group-hover:text-accent" /> Canlı Demo İzle
                </Button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-8 border-t">
                <div>
                  <p className="text-3xl font-black text-primary">150K+</p>
                  <p className="text-sm text-muted-foreground font-medium">Analiz</p>
                </div>
                <div>
                  <p className="text-3xl font-black text-primary">650+</p>
                  <p className="text-sm text-muted-foreground font-medium">Okul</p>
                </div>
                <div>
                  <p className="text-3xl font-black text-primary">96%</p>
                  <p className="text-sm text-muted-foreground font-medium">Memnuniyet</p>
                </div>
                <div>
                  <p className="text-3xl font-black text-primary">3500+</p>
                  <p className="text-sm text-muted-foreground font-medium">Öğretmen</p>
                </div>
              </div>
            </div>

            {/* Dashboard Mockup */}
            <div className="relative">
              <div className="absolute -inset-4 bg-accent/20 blur-3xl rounded-full opacity-20 animate-pulse"></div>
              <div className="relative glass-morphism rounded-[2.5rem] shadow-2xl overflow-hidden border-8 border-primary/5">
                <div className="bg-primary p-6 flex justify-between items-center text-white">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-6 w-6 text-accent" />
                    <span className="font-bold">Akademik Başarı</span>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-white/20"></div>
                </div>
                <div className="p-8 grid grid-cols-2 gap-6 bg-white/50">
                  <div className="bg-white p-6 rounded-3xl shadow-sm space-y-4">
                    <p className="text-xs font-bold text-muted-foreground uppercase">Haftalık Gelişim</p>
                    <div className="flex items-end gap-2 h-20">
                      {[40, 70, 50, 90, 60, 80].map((h, i) => (
                        <div key={i} className="flex-1 bg-accent/20 rounded-t-lg relative group">
                          <div className="absolute bottom-0 w-full bg-accent rounded-t-lg transition-all duration-1000" style={{ height: `${h}%` }}></div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-3xl shadow-sm flex flex-col items-center justify-center text-center space-y-2">
                    <div className="h-16 w-16 rounded-full border-4 border-accent border-t-transparent animate-spin-slow flex items-center justify-center">
                      <span className="font-black text-primary">87%</span>
                    </div>
                    <p className="text-xs font-bold text-muted-foreground">Hedef Tamamlama</p>
                  </div>
                  <div className="bg-white p-6 rounded-3xl shadow-sm col-span-2 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-primary/5 p-3 rounded-2xl"><Brain className="h-6 w-6 text-primary" /></div>
                      <div>
                        <p className="font-bold text-primary">AI Tavsiyesi</p>
                        <p className="text-xs text-muted-foreground">Bugün Matematik Problemleri çalış.</p>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost" className="text-accent font-bold">Detay <ArrowRight className="h-4 w-4 ml-1" /></Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-white">
          <div className="container mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-20 space-y-4">
              <h2 className="text-4xl font-black text-primary">Neden Biz?</h2>
              <p className="text-muted-foreground text-lg">Eğitimde başarı tesadüf değildir. Dijital Eğitim Koçu ile her adımınızı planlayın.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { icon: Target, title: "Akıllı Hedefler", desc: "Yapay zekâ günlük hedeflerinizi ilgi alanlarınıza göre oluşturur.", color: "accent" },
                { icon: TrendingUp, title: "Başarı Analizi", desc: "Grafikler ve raporlar ile gelişim sürecinizi anlık izleyin.", color: "primary" },
                { icon: Brain, title: "AI Eğitim Koçu", desc: "Sizi tanıyan ve kişiye özel çalışma rotası öneren akıllı asistan.", color: "accent" },
                { icon: Award, title: "Sınav Takibi", desc: "LGS, YKS, AGS ve KPSS süreçlerini tek panelden yönetin.", color: "primary" },
              ].map((feature, i) => (
                <div key={i} className="group p-10 bg-[#F8FAFC] rounded-[2rem] border border-transparent hover:border-accent/20 hover:bg-white hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
                  <div className={cn(
                    "h-16 w-16 rounded-2xl flex items-center justify-center mb-8 transition-transform group-hover:scale-110 duration-500",
                    feature.color === "accent" ? "bg-accent/10 text-accent" : "bg-primary/5 text-primary"
                  )}>
                    <feature.icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold text-primary mb-4">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* AI Section */}
        <section className="py-24 bg-primary text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-accent/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-10">
              <h2 className="text-4xl md:text-6xl font-black leading-tight">
                Yapay Zeka <br />
                <span className="text-accent">Başarıyı</span> <br />
                Tesadüfe Bırakmaz.
              </h2>
              <ul className="space-y-6">
                {[
                  "Eksik konuları tespit eder ve odağı belirler.",
                  "Kişiselleştirilmiş haftalık çalışma planı hazırlar.",
                  "Sınav sonuçlarına göre başarı tahmini üretir.",
                  "Motivasyonunuzu artıracak kişisel koçluk sunar."
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-4 text-lg font-medium opacity-90">
                    <div className="h-6 w-6 rounded-full bg-accent/20 flex items-center justify-center border border-accent/40">
                      <CheckCircle2 className="h-4 w-4 text-accent" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
              <Button size="lg" className="bg-accent hover:bg-white hover:text-primary transition-all rounded-2xl px-10 py-7 text-lg font-bold">
                AI Asistanı Deneyin
              </Button>
            </div>
            
            <div className="relative">
              <div className="glass-morphism rounded-[3rem] p-8 border-white/10 shadow-3xl bg-white/5">
                <div className="space-y-6">
                  <div className="flex justify-between items-center border-b border-white/10 pb-6">
                    <span className="font-bold text-accent">Haftalık AI Analizi</span>
                    <Award className="h-6 w-6 text-accent" />
                  </div>
                  <div className="space-y-4">
                    <p className="text-sm opacity-80 leading-relaxed italic">
                      "Analizlerimize göre Matematik-Geometri netlerinde son 3 haftada %12 artış gözlemlendi. 
                      Bu hafta Türev konusuna yoğunlaşman sınav hedefin için kritik öneme sahip."
                    </p>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="bg-white/10 p-4 rounded-2xl">
                        <p className="text-2xl font-black">92%</p>
                        <p className="text-[10px] opacity-60">Doğru Tahmin</p>
                      </div>
                      <div className="bg-white/10 p-4 rounded-2xl">
                        <p className="text-2xl font-black">+14</p>
                        <p className="text-[10px] opacity-60">Net Artışı</p>
                      </div>
                      <div className="bg-white/10 p-4 rounded-2xl">
                        <p className="text-2xl font-black">🔥</p>
                        <p className="text-[10px] opacity-60">Motivasyon</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Roles Section */}
        <section className="py-24 bg-[#F8FAFC]">
          <div className="container mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-20">
              <h2 className="text-4xl font-black text-primary mb-4">Herkes İçin Tek Çözüm</h2>
              <p className="text-muted-foreground text-lg font-medium">Öğrenci, öğretmen, veli ve yönetim tek bir güçlü ekosistemde.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { icon: Users, role: "Öğrenci Paneli", desc: "Bireysel gelişim ve sınav hazırlık süreci.", emoji: "👨‍🎓" },
                { icon: BookOpen, role: "Öğretmen Paneli", desc: "Öğrenci takibi ve dijital rehberlik.", emoji: "👨‍🏫" },
                { icon: ShieldCheck, role: "Veli Paneli", desc: "Şeffaf takip ve başarı raporları.", emoji: "👨‍👩‍👧" },
                { icon: LayoutDashboard, role: "Okul Yönetimi", desc: "Kurumsal analiz ve sistem kontrolü.", emoji: "🏫" },
              ].map((item, i) => (
                <div key={i} className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-transparent hover:border-accent hover:shadow-xl transition-all duration-300 text-center">
                  <div className="text-5xl mb-6">{item.emoji}</div>
                  <h3 className="text-xl font-bold text-primary mb-3">{item.role}</h3>
                  <p className="text-sm text-muted-foreground font-medium">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Database Seed Section (Temp for setup) */}
        <section className="py-20 border-t bg-white">
          <div className="container mx-auto px-6 text-center">
            <Button 
              size="lg" 
              variant="outline" 
              className="px-8 border-accent text-accent hover:bg-accent hover:text-white transition-all rounded-full font-bold"
              onClick={handleSeedData}
              disabled={seeding}
            >
              {seeding ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Database className="mr-2 h-5 w-5" />}
              Örnek Verileri Yükle & Koleksiyonları Başlat
            </Button>
            <p className="mt-4 text-xs text-muted-foreground font-medium italic">
              * Bu buton Firestore koleksiyonlarını ve örnek verileri anında oluşturur.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-primary text-white pt-24 pb-12">
        <div className="container mx-auto px-6 grid md:grid-cols-4 gap-12 pb-16 border-b border-white/10">
          <div className="col-span-2 space-y-8">
            <div className="flex items-center gap-3">
              <div className="bg-accent text-white p-2 rounded-xl">
                <GraduationCap className="h-6 w-6" />
              </div>
              <span className="font-black text-2xl tracking-tighter">Dijital Eğitim Koçu</span>
            </div>
            <p className="text-white/60 text-lg leading-relaxed max-w-sm font-medium">
              Yapay Zekâ Destekli Akademik Başarı ve Eğitim Yönetim Platformu. Geleceğinizi bugün planlayın.
            </p>
          </div>
          <div className="space-y-6">
            <h4 className="font-bold text-accent text-lg">Kurumsal</h4>
            <ul className="space-y-4 text-white/60 font-medium">
              <li><Link href="#" className="hover:text-white transition-colors">KVKK</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Yardım Merkezi</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">İletişim</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Blog</Link></li>
            </ul>
          </div>
          <div className="space-y-6">
            <h4 className="font-bold text-accent text-lg">Bizi Takip Edin</h4>
            <div className="flex gap-4">
              {/* Social icons would go here */}
              <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-accent transition-all cursor-pointer">
                <Globe className="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-6 pt-12 text-center text-white/40 text-sm font-medium">
          <p>© 2026 Dijital Eğitim Koçu. Tüm hakları saklıdır.</p>
        </div>
      </footer>
    </div>
  );
}
