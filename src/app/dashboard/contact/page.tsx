'use client';

import { useUser, useDoc } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Headset, 
  HelpCircle, 
  FileText, 
  Wrench, 
  MessageSquare, 
  Users, 
  Video, 
  BookOpen, 
  Building, 
  CalendarDays, 
  FileCode, 
  ShieldAlert, 
  Zap, 
  Brain, 
  ArrowRight,
  Sparkles,
  Home,
  ArrowLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export default function ContactPage() {
  const { user } = useUser();
  const router = useRouter();
  const { data: userData } = useDoc<any>(user?.uid ? `users/${user.uid}` : null);

  const role = userData?.role || 'student';

  const contactOptions: Record<string, any[]> = {
    student: [
      { title: "AI Yardım Merkezi", icon: Brain, desc: "Yapay zeka asistanından anlık cevaplar al.", color: "bg-accent" },
      { title: "Canlı Destek", icon: MessageSquare, desc: "Eğitmenlerimizle anlık yazışmaya başla.", color: "bg-primary" },
      { title: "Sıkça Sorulan Sorular", icon: HelpCircle, desc: "Platform kullanımı hakkında hızlı cevaplar.", color: "bg-primary" },
      { title: "Teknik Destek", icon: Wrench, desc: "Sistemle ilgili bir sorun mu yaşıyorsun?", color: "bg-primary" },
      { title: "Geri Bildirim", icon: Zap, desc: "Platformu geliştirmemiz için bize yaz.", color: "bg-primary" },
      { title: "Rehberlik Talebi", icon: CalendarDays, desc: "Koçundan özel bir görüşme randevusu al.", color: "bg-accent" },
    ],
    teacher: [
      { title: "Öğretmen Destek Merkezi", icon: Users, desc: "Öğretmenlere özel araçlar ve yardım.", color: "bg-accent" },
      { title: "Eğitim Dokümanları", icon: BookOpen, desc: "AI asistanı kullanımı ve raporlama rehberleri.", color: "bg-primary" },
      { title: "Webinarlar", icon: Video, desc: "Canlı eğitimlere ve kayıtlı oturumlara katıl.", color: "bg-primary" },
      { title: "Teknik Destek", icon: Wrench, desc: "Eğitmen paneli teknik sorunları.", color: "bg-primary" },
      { title: "Canlı Görüşme", icon: MessageSquare, desc: "Sistem yöneticileriyle direkt iletişim.", color: "bg-primary" },
    ],
    school_admin: [
      { title: "Kurumsal Destek", icon: Building, desc: "Okul geneli yönetim ve veri desteği.", color: "bg-accent" },
      { title: "Eğitim Danışmanı", icon: Users, desc: "Okulunuzun özel akademik danışmanıyla görüşün.", color: "bg-primary" },
      { title: "Teknik Destek", icon: Wrench, desc: "Kurumsal entegrasyon ve panel sorunları.", color: "bg-primary" },
      { title: "Kurumsal Talepler", icon: FileText, desc: "Resmi yazışmalar ve özel rapor talepleri.", color: "bg-primary" },
      { title: "Demo ve Eğitim Planlama", icon: Video, desc: "Öğretmenleriniz için AI eğitimleri planlayın.", color: "bg-primary" },
    ],
    admin: [
      { title: "Sistem Destek Merkezi", icon: ShieldAlert, desc: "Kritik sistem operasyonları desteği.", color: "bg-destructive" },
      { title: "Geliştirici Dokümanları", icon: FileCode, desc: "API ve veritabanı entegrasyon rehberleri.", color: "bg-primary" },
      { title: "API Destek", icon: Wrench, desc: "Entegrasyon ve endpoint sorunları.", color: "bg-primary" },
      { title: "Hata Yönetimi", icon: Zap, desc: "Bildirilen sistem hataları ve çözümleri.", color: "bg-primary" },
      { title: "Acil Müdahale Merkezi", icon: Zap, desc: "7/24 Sunucu ve güvenlik müdahale hattı.", color: "bg-destructive" },
    ]
  };

  const currentOptions = contactOptions[role] || contactOptions.student;

  return (
    <div className="p-6 lg:p-10 space-y-10 max-w-7xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => router.back()} 
              className="h-12 w-12 rounded-xl bg-slate-100 hover:bg-primary hover:text-white transition-all shadow-sm"
              title="Geri Dön"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => router.push('/')} 
              className="h-12 w-12 rounded-xl bg-slate-100 hover:bg-primary hover:text-white transition-all shadow-sm"
              title="Ana Sayfa"
            >
              <Home className="h-5 w-5" />
            </Button>
          </div>
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent text-white font-black text-[10px] uppercase tracking-widest shadow-xl shadow-accent/20">
              <Headset className="h-3 w-3" /> Destek Merkezi
            </div>
            <h2 className="text-5xl font-black tracking-tighter italic text-primary uppercase leading-none">
              Size Nasıl <br /><span className="text-accent">Yardımcı Olabiliriz?</span>
            </h2>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {currentOptions.map((option, i) => (
          <Card key={i} className="group relative overflow-hidden rounded-[2.5rem] border-none shadow-[0_20px_40px_-15px_rgba(15,23,42,0.1)] bg-white p-8 transition-all hover:-translate-y-2 border border-primary/5 cursor-pointer">
            <div className={cn(
              "absolute top-0 right-0 w-32 h-32 opacity-5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2",
              option.color === 'bg-accent' ? 'bg-accent' : option.color === 'bg-destructive' ? 'bg-destructive' : 'bg-primary'
            )}></div>
            <div className="space-y-6">
              <div className={cn(
                "h-14 w-14 rounded-2xl flex items-center justify-center shadow-lg transition-all group-hover:rotate-6",
                option.color === 'bg-accent' ? 'bg-accent text-white' : option.color === 'bg-destructive' ? 'bg-destructive text-white' : 'bg-primary text-white'
              )}>
                <option.icon className="h-7 w-7" />
              </div>
              <div className="space-y-2">
                <h4 className="font-black text-xl italic tracking-tight text-primary leading-tight">{option.title}</h4>
                <p className="text-xs text-muted-foreground font-medium leading-relaxed">{option.desc}</p>
              </div>
              <Button variant="ghost" className="p-0 h-auto text-[10px] font-black uppercase tracking-widest text-accent group-hover:translate-x-2 transition-transform">
                İletişime Geç <ArrowRight className="ml-2 h-3 w-3" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        <Card className="xl:col-span-2 rounded-[3.5rem] border-none shadow-[0_40px_80px_-20px_rgba(15,23,42,0.1)] bg-primary text-white p-10 relative overflow-hidden group">
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-accent/20 blur-[100px] rounded-full group-hover:scale-125 transition-transform duration-1000"></div>
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
            <div className="h-24 w-24 rounded-[2rem] bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-2xl shrink-0">
              <Sparkles className="h-12 w-12 text-accent" />
            </div>
            <div className="space-y-4">
              <h3 className="text-3xl font-black italic tracking-tight">Akıllı Çözüm Merkezi</h3>
              <p className="text-lg leading-relaxed font-medium opacity-90 italic">
                "Sorularınızın %85'i yapay zeka asistanımız tarafından 3 saniye içinde çözülüyor. Teknik bir talep açmadan önce AI Asistanımızla görüşmenizi öneririz."
              </p>
              <Button className="h-14 px-8 rounded-2xl bg-accent hover:bg-white hover:text-primary transition-all font-black text-xs uppercase tracking-widest shadow-2xl shadow-accent/20 gap-3">
                AI Asistanla Görüş <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>

        <Card className="rounded-[3.5rem] border-none shadow-[0_40px_80px_-20px_rgba(15,23,42,0.1)] bg-white p-10 space-y-6">
          <h4 className="text-xl font-black italic tracking-tighter uppercase">Acil Durum</h4>
          <div className="space-y-4">
             <div className="p-6 bg-destructive/5 rounded-[2rem] border border-destructive/10 group cursor-pointer hover:bg-destructive hover:text-white transition-all">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-40 group-hover:opacity-100">7/24 Acil Destek</p>
                <p className="text-xl font-black italic tracking-tighter mt-1">0850 400 6 400</p>
             </div>
             <div className="p-6 bg-[#F8FAFC] rounded-[2rem] border border-primary/5 group cursor-pointer hover:bg-primary hover:text-white transition-all">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-40 group-hover:opacity-100">E-posta Destek</p>
                <p className="text-xl font-black italic tracking-tighter mt-1">destek@dek.com</p>
             </div>
          </div>
        </Card>
      </div>
    </div>
  );
}