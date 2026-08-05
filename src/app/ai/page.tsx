
'use client';

import { Button } from '@/components/ui/button';
import { 
  Brain, 
  Sparkles, 
  Zap, 
  Target, 
  TrendingUp, 
  ChevronLeft,
  Home
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';

export default function AiVisionPage() {
  const router = useRouter();
  const { user } = useUser();

  const handleHomeClick = () => {
    if (user) {
      router.push('/dashboard');
    } else {
      router.push('/');
    }
  };

  const aiFeatures = [
    { 
      title: "AI Kişiselleştirilmiş Koç", 
      desc: "Her öğrencinin öğrenme hızını ve stilini analiz ederek tamamen ona özel çalışma programları üretir.",
      icon: Brain,
      color: "text-accent"
    },
    { 
      title: "Match Score (Uyum Puanı)", 
      desc: "Öğrencinin hedefleri ile öğretmen uzmanlığını eşleştirerek en verimli eşleşmeyi sağlar.",
      icon: Target,
      color: "text-blue-500"
    },
    { 
      title: "Gelecek Tahminleme", 
      desc: "Mevcut verilerle sınav sonucunu ve başarı sıralamasını %94 doğruluk payıyla önceden tahmin eder.",
      icon: TrendingUp,
      color: "text-emerald-500"
    },
    { 
      title: "Risk Analiz Motoru", 
      desc: "Düşüş yaşayan veya motivasyonu azalan öğrencileri anında tespit ederek öğretmene aksiyon önerisi sunar.",
      icon: Zap,
      color: "text-orange-500"
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
             <Button variant="ghost" size="icon" onClick={handleHomeClick} className="h-12 w-12 rounded-xl bg-white shadow-sm border border-primary/5 hover:bg-primary hover:text-white transition-all">
                <Home className="h-6 w-6" />
             </Button>
          </div>
          <span className="font-black text-[10px] uppercase tracking-[0.4em] text-primary/40 italic">AI Vizyon v4.0</span>
        </div>
      </header>

      <main className="container mx-auto px-6 pb-32 space-y-32">
        <section className="text-center space-y-12 max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-primary text-white font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-primary/20">
            <Sparkles className="h-4 w-4 text-accent" /> Yapay Zeka Devrimi
          </div>
          <h1 className="text-7xl md:text-[9rem] font-black text-primary tracking-tighter leading-[0.8] italic text-shadow-premium uppercase">
            Eğitimin <br /><span className="text-accent text-shadow-accent">Yeni Beyni</span>
          </h1>
          <p className="text-2xl text-muted-foreground font-medium leading-relaxed italic max-w-3xl mx-auto">
            Dijital Eğitim Koçu, sadece bir takip sistemi değil; her öğrencinin potansiyelini keşfeden yaşayan bir yapay zeka ekosistemidir.
          </p>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
           {aiFeatures.map((feature, i) => (
             <div key={i} className="group relative bg-white p-12 rounded-[4rem] border border-primary/5 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-accent/5 blur-[80px] rounded-full translate-x-1/2 -translate-y-1/2 group-hover:bg-accent/10 transition-all"></div>
                <div className="space-y-8 relative z-10">
                   <div className="h-20 w-20 rounded-[1.75rem] bg-slate-50 flex items-center justify-center shadow-inner group-hover:scale-110 group-hover:rotate-6 transition-all">
                      <feature.icon className={cn("h-10 w-10", feature.color)} />
                   </div>
                   <div className="space-y-4">
                      <h3 className="text-3xl font-black italic tracking-tighter text-primary uppercase text-shadow-deep">{feature.title}</h3>
                      <p className="text-lg font-medium text-muted-foreground leading-relaxed italic">{feature.desc}</p>
                   </div>
                </div>
             </div>
           ))}
        </div>

        <section className="bg-primary text-white rounded-[5rem] p-16 md:p-24 relative overflow-hidden">
           <div className="absolute -bottom-20 -right-20 w-[600px] h-[600px] bg-accent/10 blur-[150px] rounded-full"></div>
           <div className="grid lg:grid-cols-2 gap-20 items-center relative z-10">
              <div className="space-y-10">
                 <h2 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase leading-none text-shadow-premium">Sınırları <br /><span className="text-accent">Aşın.</span></h2>
                 <p className="text-xl text-white/60 font-medium leading-relaxed italic">
                    Yapay zekamız sürekli öğrenen bir yapıdadır. Milyonlarca başarılı öğrenci verisini analiz ederek size en kısa başarı yolunu çizer.
                 </p>
                 <div className="grid grid-cols-2 gap-8">
                    <div>
                       <p className="text-5xl font-black text-accent text-shadow-accent">%94</p>
                       <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mt-1">Doğruluk Payı</p>
                    </div>
                    <div>
                       <p className="text-5xl font-black text-white text-shadow-deep">3sn</p>
                       <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mt-1">Analiz Hızı</p>
                    </div>
                 </div>
              </div>
              <div className="bg-white/5 backdrop-blur-3xl rounded-[3rem] border border-white/10 p-12 space-y-8">
                 <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="font-black text-xs uppercase tracking-widest italic">AI Aktif Analiz Modu</span>
                 </div>
                 <div className="space-y-6">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-4 bg-white/10 rounded-full w-full relative overflow-hidden">
                         <div className="absolute inset-y-0 left-0 bg-accent rounded-full transition-all duration-1000" style={{ width: `${30 + i * 20}%` }}></div>
                      </div>
                    ))}
                 </div>
                 <p className="text-sm font-medium italic opacity-60">"Sistem şu anda 650+ okulun verisiyle başarı korelasyonu hesaplıyor..."</p>
              </div>
           </div>
        </section>
      </main>
    </div>
  );
}
