'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { 
  Users, 
  LineChart, 
  CheckCircle2, 
  ClipboardCheck, 
  Sparkles, 
  MessageSquare, 
  FileText, 
  Eye, 
  ChevronLeft, 
  UserRound,
  Star
} from 'lucide-react';

export default function TeacherFeaturesPage() {
  const features = [
    { icon: Users, title: "Öğrenci Yönetimi", desc: "Tüm öğrencilerinin akademik verilerini, devamsızlıklarını ve gelişimlerini tek bir ekrandan yönet." },
    { icon: LineChart, title: "Sınıf Analizi", desc: "Sınıf bazlı başarı ortalamalarını gör, hangi öğrencilerin desteğe ihtiyacı olduğunu AI ile tespit et." },
    { icon: CheckCircle2, title: "Kazanım Takibi", desc: "Müfredat konularının ne kadarının tamamlandığını ve öğrenildiğini görsel grafiklerle izle." },
    { icon: ClipboardCheck, title: "Ödev Yönetimi", desc: "Öğrencilerine dijital ödevler ata, tamamlanma durumlarını anlık olarak kontrol et." },
    { icon: Sparkles, title: "AI Eğitmen Asistanı", desc: "Haftalık raporlama, ders planı önerileri ve öğrenci analizlerinde yapay zekadan destek al." },
    { icon: MessageSquare, title: "Veli Bilgilendirme", desc: "Öğrenci başarılarını ve duyuruları velilere otomatik bildirimler halinde ilet." },
    { icon: FileText, title: "Akademik Raporlar", desc: "Resmi kurumlara veya veli görüşmelerine sunabileceğin profesyonel gelişim raporları oluştur." },
    { icon: Eye, title: "Simülasyon Modu", desc: "Öğrencinin panelini onun gözünden görerek hangi alanlarda zorlandığını birebir tespit et." },
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
        <section className="text-center space-y-8 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-primary text-white font-black text-[10px] uppercase tracking-widest">
            <UserRound className="h-3 w-3" /> Eğitmen Deneyimi
          </div>
          <h1 className="text-6xl md:text-8xl font-black text-primary tracking-tighter leading-none italic text-shadow-premium uppercase">
            Eğitimde <br /><span className="text-accent text-shadow-accent">Dijital Dönüşüm</span>
          </h1>
          <p className="text-2xl text-muted-foreground font-medium leading-relaxed italic">
            Veriye dayalı rehberlik araçlarıyla her öğrencinin potansiyelini keşfedin ve başarıya yönlendirin.
          </p>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {features.map((feature, i) => (
            <div key={i} className="group p-12 bg-white rounded-[3rem] border border-primary/5 shadow-[0_30px_60px_-15px_rgba(15,23,42,0.08)] hover:shadow-[0_50px_100px_-20px_rgba(15,23,42,0.15)] transition-all duration-500 hover:-translate-y-3 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 group-hover:bg-primary/10 transition-colors"></div>
              <div className="h-20 w-20 rounded-[1.5rem] bg-accent/5 flex items-center justify-center mb-8 group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-inner">
                <feature.icon className="h-10 w-10 text-accent group-hover:text-white" />
              </div>
              <h3 className="text-2xl font-black text-primary mb-4 italic tracking-tight text-shadow-deep uppercase">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed font-medium text-lg italic opacity-80">{feature.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}