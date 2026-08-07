
'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { 
  Brain, 
  Calendar, 
  BarChart3, 
  Target, 
  UserCheck, 
  LineChart, 
  CheckCircle2, 
  ClipboardCheck, 
  Building, 
  UserRound, 
  Layers, 
  PieChart,
  ShieldCheck,
  Key,
  Settings,
  ArrowRight,
  Sparkles,
  ChevronLeft,
  Home,Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export default function FeaturesPage() {
  const router = useRouter();

  const featureGroups = [
    {
      role: 'Öğrenci',
      icon: UserRound,
      color: 'bg-accent',
      description: 'Sana özel akademik yol haritası ve AI koçluk desteği.',
      items: [
        { icon: Brain, title: "AI Eğitim Koçu", desc: "Öğrenme stilini analiz eden kişiye özel asistan." },
        { icon: Calendar, title: "Akıllı Ders Planı", desc: "Zayıf konularına odaklanan dinamik takvim." },
        { icon: BarChart3, title: "Deneme Analizi", desc: "Sınav sonuçlarını derinlemesine analiz eder." },
        { icon: UserCheck, title: "Uzman Keşfet", desc: "Sana en uygun koç ve öğretmeni AI ile bul." },
      ]
    },
    {
      role: 'Öğretmen',
      icon: Sparkles,
      color: 'bg-primary',
      description: 'Öğrencilerini veriye dayalı yönet ve başarılarını artır.',
      items: [
        { icon: Users, title: "Öğrenci Yönetimi", desc: "Tüm öğrencilerini tek bir panelden yönet." },
        { icon: LineChart, title: "Sınıf Analizi", desc: "Sınıfın genel başarı durumunu anlık izle." },
        { icon: CheckCircle2, title: "Kazanım Takibi", desc: "Müfredat uyumunu ve konu eksiklerini gör." },
        { icon: ClipboardCheck, title: "Ödev Yönetimi", desc: "Dijital ödevler ata ve kontrol et." },
      ]
    },
    {
      role: 'Okul Yönetimi',
      icon: Building,
      color: 'bg-primary',
      description: 'Kurumsal başarıyı standartlaştır ve verimliliği artır.',
      items: [
        { icon: Building, title: "Kurumsal Yönetim", desc: "Okulunuzun tüm dijital süreçlerini tek merkezden yönetin." },
        { icon: UserRound, title: "Öğretmen Yönetimi", desc: "Öğretmen performanslarını ve verimliliğini izleyin." },
        { icon: Layers, title: "Şube Yönetimi", desc: "Şubeler arası başarı karşılaştırmaları yapın." },
        { icon: PieChart, title: "Akademik Raporlar", desc: "Kurumsal başarı grafiklerini anlık takip edin." },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="py-12 px-6">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
             <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-12 w-12 rounded-xl bg-white shadow-sm border border-primary/5 hover:bg-primary hover:text-white transition-all">
                <ChevronLeft className="h-6 w-6" />
             </Button>
             <Button variant="ghost" size="icon" onClick={() => router.push('/')} className="h-12 w-12 rounded-xl bg-white shadow-sm border border-primary/5 hover:bg-primary hover:text-white transition-all">
                <Home className="h-6 w-6" />
             </Button>
          </div>
          <Link href="/login?tab=register">
            <Button className="h-12 px-8 rounded-xl bg-accent hover:bg-primary font-black text-xs uppercase tracking-widest shadow-xl shadow-accent/20">Ücretsiz Başla</Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-6 pb-32 space-y-32">
        <section className="text-center space-y-8 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-accent/10 text-accent font-black text-[10px] uppercase tracking-widest border border-accent/20">
            <Sparkles className="h-3 w-3" /> Akıllı Modül Motoru
          </div>
          <h1 className="text-6xl md:text-8xl font-black text-primary tracking-tighter leading-none italic text-shadow-premium uppercase">
            Eğitimde <br /><span className="text-accent text-shadow-accent">Dijital Dönüşüm</span>
          </h1>
          <p className="text-2xl text-muted-foreground font-medium leading-relaxed italic">
            Yapay zeka desteğiyle ders çalışma alışkanlıklarını modernize edin, her role özel araçlarla potansiyelinizi zirveye taşıyın.
          </p>
        </section>

        {featureGroups.map((group, idx) => (
          <section key={idx} className="space-y-16">
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-primary/5 pb-10">
               <div className="space-y-4">
                  <div className={cn("h-16 w-16 rounded-2xl flex items-center justify-center text-white shadow-2xl", group.color)}>
                     <group.icon className="h-8 w-8" />
                  </div>
                  <h2 className="text-4xl font-black italic tracking-tighter text-primary uppercase">{group.role} Deneyimi</h2>
                  <p className="text-lg font-medium text-muted-foreground italic">{group.description}</p>
               </div>
               <Button variant="link" className="font-black text-accent uppercase tracking-widest text-xs" asChild>
                  <Link href={`/features/${group.role === 'Öğrenci' ? 'student' : group.role === 'Öğretmen' ? 'teacher' : 'school'}`}>
                     Tüm {group.role} Özelliklerini Gör <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
               </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {group.items.map((item, i) => (
                <div key={i} className="group p-10 bg-white rounded-[3rem] border border-primary/5 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                  <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center mb-8 group-hover:bg-accent group-hover:text-white transition-all shadow-inner">
                    <item.icon className="h-7 w-7" />
                  </div>
                  <h3 className="text-xl font-black text-primary mb-4 tracking-tight italic text-shadow-deep uppercase">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed font-medium text-sm italic opacity-70">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>
        ))}

        <section className="bg-primary rounded-[4rem] p-16 text-white text-center space-y-10 relative overflow-hidden shadow-[0_60px_120px_-30px_rgba(15,23,42,0.4)]">
          <div className="absolute top-0 left-0 w-96 h-96 bg-accent/20 blur-[120px] rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="relative z-10 space-y-6">
            <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase text-shadow-deep">Kendi Başarı Hikayeni <br />Yazmaya Başla</h2>
            <p className="text-xl opacity-60 font-medium max-w-2xl mx-auto italic">Hemen ücretsiz üye ol ve AI destekli koçluk sistemini deneyimle.</p>
            <Button size="lg" className="h-20 px-12 rounded-[2rem] bg-accent hover:bg-white hover:text-primary transition-all font-black text-xl uppercase tracking-widest shadow-2xl shadow-accent/20" asChild>
              <Link href="/login?tab=register">Ücretsiz Hesap Oluştur</Link>
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
