'use client';

import { useUser, useDoc } from '@/firebase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Award, Star, Zap, Trophy, ShieldCheck, 
  Target, Brain, Flame, ArrowLeft, Home, Sparkles
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function AwardsPage() {
  const { user } = useUser();
  const router = useRouter();
  const { data: userData } = useDoc<any>(user?.uid ? `users/${user.uid}` : null);

  const badges = [
    { title: "HIZLI BAŞLANGIÇ", icon: Zap, color: "text-amber-500", bg: "bg-amber-50", desc: "Sisteme ilk girişi gerçekleştirdi.", date: "Gününde" },
    { title: "DENEME CANAVARI", icon: Trophy, color: "text-rose-500", bg: "bg-rose-50", desc: "İlk 5 denemesini başarıyla tamamladı.", date: "Bekliyor" },
    { title: "DİSİPLİN ABİDESİ", icon: ShieldCheck, color: "text-blue-500", bg: "bg-blue-50", desc: "7 gün kesintisiz çalışma yaptı.", date: "Bekliyor" },
    { title: "KONU HAKİMİ", icon: Brain, icon2: Target, color: "text-emerald-500", bg: "bg-emerald-50", desc: "Bir dersin tüm konularını bitirdi.", date: "Bekliyor" },
  ];

  return (
    <div className="p-8 lg:p-14 space-y-12 max-w-7xl mx-auto w-full animate-in fade-in duration-700 bg-[#F8FAFC]">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
             <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-12 w-12 rounded-xl bg-white shadow-sm border border-slate-100 hover:bg-primary hover:text-white transition-all"><ArrowLeft className="h-5 w-5" /></Button>
             <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard')} className="h-12 w-12 rounded-xl bg-white shadow-sm border border-slate-100 hover:bg-primary hover:text-white transition-all"><Home className="h-5 w-5" /></Button>
          </div>
          <div className="space-y-2">
             <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-accent text-primary font-black text-[10px] uppercase tracking-widest shadow-xl shadow-accent/20 italic">
                <Award className="h-3.5 w-3.5" /> TROPHY ROOM v4.8
             </div>
             <h2 className="text-6xl font-black tracking-tighter italic text-primary uppercase leading-none text-shadow-deep">
                Başarı <br /><span className="text-accent text-shadow-accent">Rozetleri</span>
             </h2>
          </div>
        </div>

        <div className="flex gap-6">
           <Card className="p-8 rounded-[2.5rem] bg-white border-none shadow-xl text-center min-w-[150px] group hover:bg-primary hover:text-white transition-all duration-500">
              <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-1 group-hover:text-accent">TOPLAM XP</p>
              <p className="text-4xl font-black italic tracking-tighter">{userData?.points || 1250}</p>
           </Card>
           <Card className="p-8 rounded-[2.5rem] bg-white border-none shadow-xl text-center min-w-[150px] group hover:bg-accent transition-all duration-500">
              <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-1">STREAK</p>
              <p className="text-4xl font-black italic tracking-tighter flex items-center justify-center gap-2">4 <Flame className="h-8 w-8 text-orange-500 fill-current" /></p>
           </Card>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {badges.map((badge, i) => (
          <Card key={i} className="p-10 rounded-[4rem] border-none shadow-xl bg-white text-center space-y-8 group hover:-translate-y-4 transition-all duration-700 relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-br from-transparent to-slate-50 opacity-0 group-hover:opacity-100 transition-opacity" />
             <div className={cn("h-28 w-28 rounded-[2.75rem] flex items-center justify-center mx-auto shadow-2xl relative z-10 group-hover:rotate-12 transition-transform", badge.bg)}>
                <badge.icon className={cn("h-14 w-14", badge.color)} />
             </div>
             <div className="space-y-3 relative z-10">
                <h3 className="text-xl font-black italic tracking-tighter text-primary uppercase leading-tight">{badge.title}</h3>
                <p className="text-[11px] font-medium text-muted-foreground italic leading-relaxed px-4 opacity-60">{badge.desc}</p>
             </div>
             <div className="pt-6 border-t border-slate-50 relative z-10">
                <span className={cn("text-[9px] font-black uppercase tracking-[0.3em]", badge.date === 'Bekliyor' ? 'text-muted-foreground opacity-30' : 'text-emerald-500')}>{badge.date}</span>
             </div>
          </Card>
        ))}
      </div>

      <Card className="p-16 rounded-[5rem] bg-primary text-white border-none shadow-[0_60px_120px_-30px_rgba(15,23,42,0.4)] relative overflow-hidden group">
         <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2" />
         <div className="grid lg:grid-cols-2 gap-20 items-center relative z-10">
            <div className="space-y-8">
               <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-accent font-black text-[10px] uppercase tracking-widest">
                  <Sparkles className="h-4 w-4 animate-pulse" /> ÖZEL GÖREV
               </div>
               <h2 className="text-6xl font-black tracking-tighter italic uppercase leading-none text-shadow-deep">Efsanevi <br /><span className="text-accent">Şampiyon</span></h2>
               <p className="text-xl font-medium opacity-60 italic leading-relaxed">Sınava kadar her gün 200 soru hedefini saniyeler içinde tamamlayarak bu efsanevi rozeti açabilirsin.</p>
               <Button className="h-20 px-12 rounded-[2rem] bg-accent hover:bg-white hover:text-primary transition-all font-black text-lg uppercase tracking-widest text-primary shadow-2xl">GÖREVE BAŞLA</Button>
            </div>
            <div className="flex justify-center">
               <div className="relative">
                  <div className="h-64 w-64 bg-accent rounded-[5rem] animate-pulse blur-[40px] absolute inset-0 opacity-20" />
                  <Trophy className="h-72 w-72 text-accent relative drop-shadow-3xl" />
               </div>
            </div>
         </div>
      </Card>
    </div>
  );
}
