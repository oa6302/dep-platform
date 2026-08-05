'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useUser, useFirestore } from '@/firebase';
import { 
  Database, 
  Loader2, 
  Globe, 
  ArrowRight, 
  Play, 
  CheckCircle2, 
  TrendingUp, 
  Target, 
  Brain, 
  Users, 
  BookOpen, 
  Award, 
  Zap,
  Star,
  BarChart3,
  Calendar,
  Clock,
  LineChart,
  ClipboardCheck,
  Sparkles,
  MessageSquare,
  FileText,
  Eye,
  Building,
  UserRound,
  Layers,
  PieChart,
  LayoutDashboard,
  CalendarCheck,
  ShieldCheck,
  Key,
  Settings,
  Lock,
  Code2,
  HardDrive,
  Bell
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { doc, setDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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

      const sampleSchoolAdminId = 'sample-school-admin-888';
      await setDoc(doc(db, 'users', sampleSchoolAdminId), {
        uid: sampleSchoolAdminId,
        displayName: 'Müdür Ahmet Bey',
        email: 'mudur@test.com',
        role: 'school_admin',
        school: 'Atatürk Lisesi',
        createdAt: serverTimestamp(),
      });

      const sampleTeacherId = 'sample-teacher-111';
      await setDoc(doc(db, 'users', sampleTeacherId), {
        uid: sampleTeacherId,
        displayName: 'Mehmet Koç',
        email: 'mehmet@test.com',
        role: 'teacher',
        activationCode: 'DK-TR7X-5K92',
        createdAt: serverTimestamp(),
      });

      const sampleStudentId = 'sample-student-222';
      await setDoc(doc(db, 'users', sampleStudentId), {
        uid: sampleStudentId,
        displayName: 'Ali Öğrenci',
        email: 'ali@test.com',
        role: 'student',
        coachId: sampleTeacherId,
        school: 'Atatürk Lisesi',
        grade: '12. Sınıf',
        branch: 'SAY',
        createdAt: serverTimestamp(),
      });

      await addDoc(collection(db, 'tasks'), {
        studentId: sampleStudentId,
        teacherId: sampleTeacherId,
        title: 'Matematik: Türev Tekrarı',
        description: 'Türev alma kuralları ile ilgili 50 soru çöz.',
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        status: 'pending',
        createdAt: serverTimestamp(),
      });

      toast({ title: 'Sistem Hazır', description: 'Örnek veriler başarıyla oluşturuldu.' });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Hata', description: error.message });
    } finally {
      setSeeding(false);
    }
  };

  const featureGroups = {
    student: {
      label: 'Öğrenci',
      icon: Users,
      link: '/features/student',
      items: [
        { icon: Brain, title: "AI Eğitim Koçu", desc: "Öğrenme stilini analiz eden kişiye özel asistan." },
        { icon: Calendar, title: "Akıllı Ders Planı", desc: "Zayıf konularına odaklanan dinamik takvim." },
        { icon: BarChart3, title: "Deneme Analizi", desc: "Sınav sonuçlarını derinlemesine analiz eder." },
        { icon: Target, title: "Hedef Yönetimi", desc: "Kısa ve uzun vadeli akademik hedeflerini izle." },
      ]
    },
    teacher: {
      label: 'Öğretmen',
      icon: UserRound,
      link: '/features/teacher',
      items: [
        { icon: Users, title: "Öğrenci Yönetimi", desc: "Tüm öğrencilerini tek bir panelden yönet." },
        { icon: LineChart, title: "Sınıf Analizi", desc: "Sınıfın genel başarı durumunu anlık izle." },
        { icon: CheckCircle2, title: "Kazanım Takibi", desc: "Müfredat uyumunu ve konu eksiklerini gör." },
        { icon: ClipboardCheck, title: "Ödev Yönetimi", desc: "Dijital ödevler ata ve kontrol et." },
      ]
    },
    school: {
      label: 'Okul Yönetimi',
      icon: Building,
      link: '/features/school',
      items: [
        { icon: Building, title: "Kurumsal Yönetim", desc: "Okulunuzun tüm dijital süreçlerini tek merkezden yönetin." },
        { icon: UserRound, title: "Öğretmen Yönetimi", desc: "Öğretmen performanslarını ve verimliliğini izleyin." },
        { icon: Layers, title: "Şube Yönetimi", desc: "Şubeler arası başarı karşılaştırmaları yapın." },
        { icon: PieChart, title: "Akademik Raporlar", desc: "Kurumsal başarı grafiklerini anlık takip edin." },
      ]
    },
    admin: {
      label: 'Admin',
      icon: ShieldCheck,
      link: '/features/admin',
      items: [
        { icon: Users, title: "Kullanıcı Yönetimi", desc: "Tüm kullanıcı hesaplarını kontrol edin." },
        { icon: ShieldCheck, title: "Rol Yönetimi", desc: "Yetkilendirme ve erişim izinlerini düzenleyin." },
        { icon: Key, title: "Lisans Yönetimi", desc: "Okul lisanslarını ve abonelikleri takip edin." },
        { icon: Settings, title: "Sistem Ayarları", desc: "Platformun genel yapılandırmasını yönetin." },
      ]
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
              <Image src="/logo.png" alt="Logo" fill className="object-contain" />
            </div>
            <div className="hidden sm:block">
              <span className="font-black text-2xl block text-primary leading-tight tracking-tighter italic text-shadow-deep uppercase">DEK</span>
              <span className="text-[9px] text-muted-foreground block font-black uppercase tracking-[0.2em] opacity-40">Dijital Eğitim Koçu</span>
            </div>
          </Link>
          
          <div className="hidden lg:flex items-center gap-10 text-[11px] font-black uppercase tracking-widest text-primary/60">
            <Link href="#" className="hover:text-accent transition-colors">Ana Sayfa</Link>
            <Link href="#features" className="hover:text-accent transition-colors">Özellikler</Link>
            <Link href="/dashboard/ai-analysis" className="hover:text-accent transition-colors">Yapay Zeka</Link>
            <Link href="/dashboard/contact" className="hover:text-accent transition-colors">İletişim</Link>
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
                <Button size="lg" variant="outline" className="border-4 border-primary/10 rounded-[1.75rem] px-12 h-20 text-xl font-black group hover:bg-white transition-all bg-transparent backdrop-blur-sm shadow-xl">
                  <Play className="mr-4 h-7 w-7 fill-current text-accent" /> Canlı Demo
                </Button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-12 pt-20 border-t border-primary/5">
                {[
                  { label: 'Analiz', val: '150K+' },
                  { label: 'Okul', val: '650+' },
                  { label: 'Memnuniyet', val: '%96' },
                  { label: 'Öğretmen', val: '3500+' },
                ].map((stat, i) => (
                  <div key={i} className="space-y-1 group cursor-default">
                    <p className="text-4xl font-black text-primary tracking-tighter group-hover:text-accent transition-colors text-shadow-deep">{stat.val}</p>
                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-60">{stat.label}</p>
                  </div>
                ))}
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
                       <span className="font-black text-xl italic tracking-tight uppercase text-shadow-deep">Akademik Başarı</span>
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
                             <p className="font-black text-white text-2xl italic tracking-tight text-shadow-deep uppercase">AI Koç Tavsiyesi</p>
                             <p className="text-white/60 font-medium">Bu hafta Türev sorularına odaklanmalısın.</p>
                          </div>
                       </div>
                       <Button size="icon" className="h-16 w-16 rounded-[1.5rem] bg-accent text-white shadow-2xl shadow-accent/20">
                          <ArrowRight className="h-8 w-8" />
                       </Button>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="py-40 bg-white relative overflow-hidden">
          <div className="container mx-auto px-6">
            <div className="text-center max-w-4xl mx-auto mb-20 space-y-8">
               <div className="inline-block px-6 py-2 rounded-full bg-primary text-white font-black text-[10px] uppercase tracking-widest">Özellikler</div>
               <h2 className="text-6xl md:text-8xl font-black text-primary tracking-tighter leading-none italic text-shadow-premium uppercase">Yapay Zeka ile <br /><span className="text-accent text-shadow-accent">Daha Akıllı</span> Eğitim.</h2>
               <p className="text-2xl text-muted-foreground font-medium leading-relaxed italic">Başarı tesadüf değildir, doğru analiz edilmiş bir süreçtir.</p>
            </div>
            
            <Tabs defaultValue="student" className="w-full">
              <div className="flex justify-center mb-16">
                <TabsList className="bg-[#F1F5F9] p-2 rounded-[2rem] h-20 md:h-24 shadow-inner">
                  {Object.entries(featureGroups).map(([key, group]) => (
                    <TabsTrigger 
                      key={key} 
                      value={key}
                      className="rounded-[1.5rem] px-8 md:px-12 h-full font-black text-xs md:text-sm uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-2xl transition-all"
                    >
                      <group.icon className="mr-3 h-5 w-5" />
                      {group.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              {Object.entries(featureGroups).map(([key, group]) => (
                <TabsContent key={key} value={key} className="mt-0 outline-none space-y-16">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {group.items.map((item, i) => (
                      <div key={i} className="group p-10 bg-[#F8FAFC] rounded-[3rem] border border-primary/5 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                        <div className="h-16 w-16 rounded-2xl bg-primary/5 flex items-center justify-center mb-8 group-hover:bg-accent group-hover:text-white transition-all">
                          <item.icon className="h-8 w-8" />
                        </div>
                        <h3 className="text-xl font-black text-primary mb-4 tracking-tight italic text-shadow-deep uppercase">{item.title}</h3>
                        <p className="text-muted-foreground leading-relaxed font-medium text-sm mb-6 opacity-70 italic">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                  <div className="text-center">
                    <Button size="lg" className="h-16 px-12 rounded-2xl bg-primary hover:bg-accent transition-all font-black text-xs uppercase tracking-widest shadow-2xl shadow-primary/20 gap-3" asChild>
                       <Link href={group.link}>Tüm {group.label} Özelliklerini Gör <ArrowRight className="h-4 w-4" /></Link>
                    </Button>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </section>

        <section className="py-32 bg-[#F1F5F9]/50">
          <div className="container mx-auto px-6 text-center max-w-3xl">
            <div className="bg-white p-16 rounded-[4rem] shadow-[0_60px_120px_-30px_rgba(15,23,42,0.1)] border border-primary/5 space-y-12">
              <div className="space-y-4">
                 <h3 className="text-4xl font-black text-primary tracking-tighter italic uppercase text-shadow-deep">Sistemi Başlat</h3>
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
                <Image src="/logo.png" alt="Logo" fill className="object-contain" />
              </div>
              <div className="space-y-1">
                <span className="font-black text-4xl tracking-tighter block leading-none italic text-shadow-deep uppercase">DEK</span>
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
              <li><Link href="#" className="hover:text-white transition-colors">Yardım Merkezi</Link></li>
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