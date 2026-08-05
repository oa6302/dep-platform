'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { 
  Brain, Calendar, BarChart3, Target, BookOpen, Award, Clock, Zap,
  ArrowRight, Sparkles, Star, TrendingUp, ChevronLeft
} from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export default function StudentFeaturesPage() {
  const features = [
    { icon: Brain, title: "AI Eğitim Koçu", desc: "Öğrenme stilini analiz eden, sana özel çalışma stratejileri geliştiren yapay zeka asistanın." },
    { icon: Calendar, title: "Akıllı Ders Planı", desc: "Zayıf olduğun konuları tespit edip onlara odaklanan, yaşayan ve dinamik ders çalışma takvimi." },
    { icon: BarChart3, title: "Deneme Analizi", desc: "Sınav sonuçlarını sadece puan olarak değil, konu bazlı analizlerle derinlemesine takip et." },
    { icon: Target, title: "Hedef Yönetimi", desc: "Hayalindeki üniversite ve bölüme ne kadar yakınsın? Hedeflerini belirle ve ilerlemeni izle." },
    { icon: BookOpen, title: "Dijital Kütüphane", desc: "Binlerce video ders, PDF kaynak ve interaktif içerik tek bir merkezde elinin altında." },
    { icon: Award, title: "Başarı Karnesi", desc: "Sadece notlar değil, beceri ve gelişim odaklı dijital başarı karnenle fark yarat." },
    { icon: Clock, title: "Çalışma Takvimi", desc: "Pomodoro entegrasyonu ile zamanını en verimli şekilde yönet, odaklanma süreni artır." },
    { icon: Zap, title: "Motivasyon Sistemi", desc: "Çalıştıkça kazanacağın rozetler, puanlar ve hediye sistemleriyle motivasyonunu zirvede tut." },
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
          <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-accent/10 text-accent font-black text-[10px] uppercase tracking-widest border border-accent/20">
            <Star className="h-3 w-3 fill-current" /> Öğrenci Deneyimi
          </div>
          <h1 className="text-6xl md:text-8xl font-black text-primary tracking-tighter leading-none italic text-shadow-premium uppercase">
            Sana Özel <br /><span className="text-accent text-shadow-accent">Başarı Yolculuğu</span>
          </h1>
          <p className="text-2xl text-muted-foreground font-medium leading-relaxed italic">
            Yapay zeka desteğiyle ders çalışma alışkanlıklarını modernize et, potansiyelini zirveye taşı.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {features.map((feature, i) => (
            <div key={i} className="group p-12 bg-white rounded-[3rem] border border-primary/5 shadow-[0_30px_60px_-15px_rgba(15,23,42,0.08)] hover:shadow-[0_50px_100px_-20px_rgba(15,23,42,0.15)] transition-all duration-500 hover:-translate-y-3 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 group-hover:bg-accent/10 transition-colors"></div>
              <div className="h-20 w-20 rounded-[1.5rem] bg-primary/5 flex items-center justify-center mb-8 group-hover:bg-accent group-hover:text-white transition-all duration-500 shadow-inner">
                <feature.icon className="h-10 w-10" />
              </div>
              <h3 className="text-2xl font-black text-primary mb-4 italic tracking-tight text-shadow-deep uppercase">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed font-medium text-lg italic opacity-80">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* Action Card */}
        <div className="bg-primary rounded-[4rem] p-16 text-white text-center space-y-10 relative overflow-hidden shadow-[0_60px_120px_-30px_rgba(15,23,42,0.4)]">
          <div className="absolute top-0 left-0 w-96 h-96 bg-accent/20 blur-[120px] rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="relative z-10 space-y-6">
            <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase text-shadow-deep">Kendi Başarı Hikayeni <br />Yazmaya Başla</h2>
            <p className="text-xl opacity-60 font-medium max-w-2xl mx-auto italic">Hemen ücretsiz üye ol ve AI destekli koçluk sistemini deneyimle.</p>
            <Button size="lg" className="h-20 px-12 rounded-[2rem] bg-accent hover:bg-white hover:text-primary transition-all font-black text-xl uppercase tracking-widest shadow-2xl shadow-accent/20" asChild>
              <Link href="/login?tab=register">Ücretsiz Hesap Oluştur</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
