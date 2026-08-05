'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { 
  Building, UserRound, Layers, PieChart, Globe, LayoutDashboard, 
  CalendarCheck, Bell, ArrowRight, School, ChevronLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SchoolFeaturesPage() {
  const features = [
    { icon: Building, title: "Kurumsal Yönetim", desc: "Okulunuzun tüm dijital süreçlerini tek merkezden yönetin, kurumsal başarıyı standartlaştırın." },
    { icon: UserRound, title: "Öğretmen Yönetimi", desc: "Öğretmen performanslarını, müfredat uyumlarını ve rehberlik verimliliklerini anlık izleyin." },
    { icon: Layers, title: "Şube Yönetimi", desc: "Şubeler arası başarı karşılaştırmaları yapın, akademik dengeleri veriyle sağlayın." },
    { icon: PieChart, title: "Akademik Raporlar", desc: "Okul genelindeki tüm akademik verileri profesyonel ve kurumsal raporlara dönüştürün." },
    { icon: Globe, title: "İstatistik Merkezi", desc: "Öğrenci bazlı değil, kurum bazlı büyük veri analizleri ile geleceği planlayın." },
    { icon: LayoutDashboard, title: "AI Yönetim Paneli", desc: "Yönetim kararlarını tahmine değil, yapay zekanın sunduğu somut verilere dayandırın." },
    { icon: CalendarCheck, title: "Sınav Takibi", desc: "Okul geneli sınav takvimini planlayın, sonuçları anlık olarak tüm paydaşlara duyurun." },
    { icon: Bell, title: "Duyuru Sistemi", desc: "Tüm okula, sınıfa veya bireye özel anlık bildirimlerle iletişimi kesintisiz sürdürün." },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="py-12 px-6">
        <div className="container mx-auto">
          <Link href="/" className="inline-flex items-center text-primary font-black uppercase text-[10px] tracking-widest hover:text-accent transition-colors">
            <ChevronLeft className="mr-2 h-4 w-4" /> Ana Sayfaya Dön
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-6 pb-32 space-y-24">
        {/* Hero Section */}
        <section className="text-center space-y-8 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-accent text-white font-black text-[10px] uppercase tracking-widest">
            <School className="h-3 w-3" /> Kurumsal Deneyim
          </div>
          <h1 className="text-6xl md:text-8xl font-black text-primary tracking-tighter leading-none italic text-shadow-premium uppercase">
            Kurumsal <br /><span className="text-accent text-shadow-accent">Yönetim Gücü</span>
          </h1>
          <p className="text-2xl text-muted-foreground font-medium leading-relaxed italic">
            Okulunuzu veriye dayalı yönetim stratejileriyle bir üst seviyeye taşıyın.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, i) => (
            <div key={i} className="group p-10 bg-white rounded-[3rem] border border-primary/5 shadow-[0_30px_60px_-15px_rgba(15,23,42,0.08)] hover:shadow-[0_50px_100px_-20px_rgba(15,23,42,0.15)] transition-all duration-500 hover:-translate-y-3 relative overflow-hidden">
              <div className="h-16 w-16 rounded-2xl bg-primary/5 flex items-center justify-center mb-6 group-hover:bg-accent group-hover:text-white transition-all duration-500">
                <feature.icon className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-black text-primary mb-3 italic tracking-tight text-shadow-deep uppercase">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed font-medium text-sm italic opacity-80">{feature.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
