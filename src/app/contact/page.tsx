
'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Headset, 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  Sparkles, 
  ChevronLeft, 
  Home,
  MessageSquare,
  Building,
  Globe
} from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export default function PublicContactPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Mesajınız İletildi",
        description: "Ekibimiz en kısa sürede sizinle iletişime geçecektir.",
        className: "bg-primary text-white rounded-[2rem]"
      });
    }, 1500);
  };

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
          <div className="hidden sm:flex items-center gap-3">
             <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
             <span className="font-black text-[10px] uppercase tracking-widest text-primary/40">Destek Hattı Çevrimiçi</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 pb-32">
        <div className="grid lg:grid-cols-2 gap-20 items-start">
          <div className="space-y-12">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent text-white font-black text-[10px] uppercase tracking-widest shadow-xl shadow-accent/20">
                <Headset className="h-3 w-3" /> İletişim Merkezi
              </div>
              <h1 className="text-6xl md:text-8xl font-black text-primary tracking-tighter leading-[0.85] italic text-shadow-premium uppercase">
                Bir Soru <br /><span className="text-accent text-shadow-accent">Bırakın.</span>
              </h1>
              <p className="text-2xl text-muted-foreground font-medium leading-relaxed italic">
                Platform kullanımı, kurumsal entegrasyon veya demo talepleriniz için bize ulaşın.
              </p>
            </div>

            <div className="grid gap-6">
               {[
                 { icon: Phone, label: "Destek Hattı", val: "0850 400 6 400", color: "bg-blue-500" },
                 { icon: Mail, label: "E-posta", val: "destek@dek.com", color: "bg-accent" },
                 { icon: Building, label: "Kurumsal", val: "Teknokent, Ankara", color: "bg-primary" },
               ].map((item, i) => (
                 <div key={i} className="flex items-center gap-6 p-8 bg-white rounded-[2.5rem] border border-primary/5 shadow-xl group hover:shadow-2xl transition-all cursor-pointer">
                    <div className={cn("h-16 w-16 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform group-hover:rotate-6", item.color)}>
                       <item.icon className="h-8 w-8" />
                    </div>
                    <div>
                       <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">{item.label}</p>
                       <p className="text-xl font-black text-primary tracking-tight italic">{item.val}</p>
                    </div>
                 </div>
               ))}
            </div>
          </div>

          <Card className="rounded-[4rem] border-none shadow-[0_60px_120px_-30px_rgba(15,23,42,0.15)] bg-white p-12 md:p-16 space-y-10">
             <div className="space-y-4">
                <h2 className="text-4xl font-black italic tracking-tighter text-primary uppercase">Bize Yazın</h2>
                <p className="text-sm font-medium text-muted-foreground italic">Tüm talepleriniz yapay zeka destekli destek birimimiz tarafından 24 saat içinde yanıtlanır.</p>
             </div>

             <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Ad Soyad</Label>
                      <Input placeholder="Adınız Soyadınız" required className="h-14 rounded-2xl bg-[#F8FAFC] border-none shadow-inner font-bold" />
                   </div>
                   <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">E-posta</Label>
                      <Input type="email" placeholder="ornek@eposta.com" required className="h-14 rounded-2xl bg-[#F8FAFC] border-none shadow-inner font-bold" />
                   </div>
                </div>
                <div className="space-y-2">
                   <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Konu</Label>
                   <Input placeholder="Mesajınızın konusu" required className="h-14 rounded-2xl bg-[#F8FAFC] border-none shadow-inner font-bold" />
                </div>
                <div className="space-y-2">
                   <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Mesajınız</Label>
                   <Textarea placeholder="Size nasıl yardımcı olabiliriz?" required className="min-h-[150px] rounded-3xl bg-[#F8FAFC] border-none shadow-inner font-bold p-6" />
                </div>
                <Button disabled={loading} type="submit" className="w-full h-20 rounded-[2rem] bg-primary hover:bg-accent transition-all font-black text-sm uppercase tracking-widest gap-4 shadow-2xl shadow-primary/20">
                   {loading ? "Gönderiliyor..." : "Mesajı Gönder"}
                   <Send className="h-5 w-5" />
                </Button>
             </form>
          </Card>
        </div>
      </main>
    </div>
  );
}
