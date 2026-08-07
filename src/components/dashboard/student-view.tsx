
'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle2, 
  Clock, 
  Calendar, 
  Brain, 
  Target, 
  TrendingUp, 
  Zap, 
  Timer, 
  ChevronRight, 
  Play, 
  BookOpen, 
  Pencil,
  Flame,
  ArrowRight,
  BookOpenCheck
} from 'lucide-react';
import { useState } from 'react';
import { 
  XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, RadarChart, PolarGrid, 
  PolarAngleAxis, Radar, AreaChart, 
  Area
} from 'recharts';
import { cn } from '@/lib/utils';

// --- MOCK DATA ---
const netGrowthData = [
  { name: 'Eyl', net: 62 },
  { name: 'Eki', net: 68 },
  { name: 'Kas', net: 65 },
  { name: 'Ara', net: 74 },
  { name: 'Oca', net: 82 },
  { name: 'Şub', net: 88 },
];

const dnaData = [
  { subject: 'Problem Çözme', A: 85, fullMark: 100 },
  { subject: 'Hız', A: 70, fullMark: 100 },
  { subject: 'Odak', A: 90, fullMark: 100 },
  { subject: 'Disiplin', A: 80, fullMark: 100 },
  { subject: 'Tekrar', A: 65, fullMark: 100 },
  { subject: 'Analiz', A: 75, fullMark: 100 },
];

const heatMapData = Array.from({ length: 364 }).map((_, i) => ({
  value: Math.floor(Math.random() * 5),
  date: i
}));

interface StudentViewProps {
  user: any;
  userData: any;
  isReadOnly?: boolean;
}

export function StudentView({ user, userData, isReadOnly = false }: StudentViewProps) {
  const [activeTimer, setActiveTimer] = useState(false);
  const [timeLeft, setTimerLeft] = useState(25 * 60);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec < 10 ? '0' : ''}${sec}`;
  };

  return (
    <div className="p-6 lg:p-10 space-y-10 max-w-[1600px] mx-auto w-full animate-in fade-in duration-1000 bg-[#FAFBFF]">
      
      {/* 1. GÜNÜN AKADEMİK ÖZETİ */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <Card className="lg:col-span-8 rounded-[3.5rem] border-none shadow-[0_40px_100px_-20px_rgba(15,23,42,0.1)] bg-white p-12 relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
           <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10 relative z-10">
              <div className="space-y-6">
                 <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-slate-50 border border-primary/5 text-primary font-black text-[10px] uppercase tracking-widest italic shadow-sm">
                    ✨ AKADEMİK KOMUTA MERKEZİ
                 </div>
                 <h1 className="text-5xl md:text-7xl font-black text-primary tracking-tighter italic uppercase leading-none">
                    GÜNAYDIN <br /><span className="text-accent text-shadow-accent">{userData?.displayName?.split(' ')[0] || 'ÖĞRENCİ'} 👋</span>
                 </h1>
                 <p className="text-xl text-muted-foreground font-medium italic opacity-70">Bugünkü akademik planın hazır. Senin için 4 kritik görev belirledik.</p>
              </div>
              <div className="flex items-center gap-8 bg-[#0F172A] p-8 rounded-[3rem] text-white shadow-2xl shrink-0 group-hover:scale-105 transition-transform duration-500">
                 <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40 italic">AI AKADEMİK SKOR</p>
                    <p className="text-6xl font-black italic tracking-tighter text-accent">82<span className="text-2xl text-white/20">/100</span></p>
                 </div>
                 <div className="h-16 w-px bg-white/10"></div>
                 <TrendingUp className="h-12 w-12 text-emerald-400 animate-pulse" />
              </div>
           </div>
           
           <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-12 mt-12 border-t border-primary/5">
              {[
                { label: 'Görev', val: '4', sub: 'Tamamlanan: 2', icon: CheckCircle2, color: 'text-emerald-500' },
                { label: 'Konu', val: '3', sub: 'Bugünkü Hedef', icon: BookOpenCheck, color: 'text-blue-500' },
                { label: 'Soru', val: '120', sub: 'Çözülen: 84', icon: Pencil, color: 'text-orange-500' },
                { label: 'Çalışma', val: '3s', sub: 'Gerçekleşen: 1.5s', icon: Clock, color: 'text-accent' },
              ].map((item, i) => (
                <div key={i} className="space-y-1">
                   <div className="flex items-center gap-2 mb-1">
                      <item.icon className={cn("h-4 w-4", item.color)} />
                      <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-60">{item.label}</span>
                   </div>
                   <p className="text-3xl font-black text-primary leading-none">{item.val}</p>
                   <p className="text-[10px] font-bold text-muted-foreground/40 italic">{item.sub}</p>
                </div>
              ))}
           </div>
        </Card>

        {/* GÜNLÜK İLERLEME */}
        <Card className="lg:col-span-4 rounded-[3.5rem] border-none shadow-[0_40px_100px_-20px_rgba(15,23,42,0.1)] bg-[#0F172A] p-12 text-white flex flex-col items-center justify-center space-y-10 relative overflow-hidden group">
           <div className="absolute inset-0 bg-accent/5 blur-[100px] rounded-full scale-150 group-hover:scale-100 transition-all duration-1000"></div>
           <div className="relative h-56 w-56 flex items-center justify-center">
              <svg className="h-full w-full -rotate-90">
                 <circle cx="112" cy="112" r="100" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="18" />
                 <circle cx="112" cy="112" r="100" fill="none" stroke="#F59E0B" strokeWidth="18" strokeDasharray="628" strokeDashoffset={628 - (628 * 0.68)} strokeLinecap="round" className="transition-all duration-1000 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                 <span className="text-6xl font-black italic tracking-tighter">68%</span>
                 <span className="text-[9px] font-black uppercase tracking-[0.3em] opacity-40">TAMAMLANDI</span>
              </div>
           </div>
           <div className="grid grid-cols-3 w-full gap-4 relative z-10 text-center">
              {[
                { label: 'TAMAM', val: '7', color: 'text-emerald-400' },
                { label: 'BEKLEYEN', val: '3', color: 'text-blue-400' },
                { label: 'GECİKEN', val: '1', color: 'text-rose-400' },
              ].map((stat, i) => (
                <div key={i} className="space-y-1">
                   <p className={cn("text-2xl font-black italic", stat.color)}>{stat.val}</p>
                   <p className="text-[8px] font-black uppercase tracking-widest opacity-30">{stat.label}</p>
                </div>
              ))}
           </div>
        </Card>
      </section>

      {/* 2. GÖREVLER & TAKVİM */}
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-10">
         <div className="xl:col-span-8 space-y-8">
            <div className="flex justify-between items-end px-4">
               <h3 className="text-3xl font-black italic tracking-tighter uppercase text-primary">BUGÜNKÜ GÖREVLER</h3>
               <button className="text-accent font-black uppercase text-[10px] tracking-widest hover:underline">Tümünü Gör</button>
            </div>
            <div className="grid gap-6">
               {[
                 { time: '08:30', title: 'Matematik', sub: 'Problemler & Sayılar', dur: '45 dk', status: 'completed' },
                 { time: '11:00', title: 'Paragraf', sub: '30 Soru Çözümü', dur: '45 dk', status: 'delayed' },
                 { time: '14:00', title: 'Fen Bilimleri', sub: 'Asitler ve Bazlar', dur: '60 dk', status: 'pending' },
                 { time: '16:30', title: 'İngilizce', sub: 'Vocabulary & Reading', dur: '30 dk', status: 'pending' },
               ].map((task, i) => (
                 <Card key={i} className={cn(
                   "p-8 rounded-[2.5rem] border-none shadow-lg flex items-center justify-between group transition-all hover:scale-[1.02]",
                   task.status === 'completed' ? "bg-emerald-50/50" : 
                   task.status === 'delayed' ? "bg-rose-50/50" : "bg-white"
                 )}>
                    <div className="flex items-center gap-8">
                       <div className="text-center shrink-0 w-20">
                          <p className="text-lg font-black text-primary leading-none">{task.time}</p>
                          <p className="text-[10px] font-bold text-muted-foreground opacity-40 uppercase tracking-widest mt-1 italic">BAŞLANGIÇ</p>
                       </div>
                       <div className="h-10 w-px bg-primary/5"></div>
                       <div>
                          <div className="flex items-center gap-3 mb-1">
                             <h4 className="text-2xl font-black italic tracking-tight text-primary leading-none uppercase">{task.title}</h4>
                             <Badge variant="outline" className={cn(
                               "text-[9px] font-black uppercase px-2 py-0.5",
                               task.status === 'completed' ? "bg-emerald-500 text-white border-none" :
                               task.status === 'delayed' ? "bg-rose-500 text-white border-none" : "bg-blue-50 text-blue-600"
                             )}>
                                {task.status === 'completed' ? 'TAMAMLANDI' : task.status === 'delayed' ? 'GECİKTİ' : 'SIRADA'}
                             </Badge>
                          </div>
                          <p className="text-sm font-medium text-muted-foreground italic">{task.sub} • {task.dur}</p>
                       </div>
                    </div>
                    <Button size="icon" className={cn(
                      "h-14 w-14 rounded-2xl shadow-xl transition-all group-hover:rotate-6",
                      task.status === 'completed' ? "bg-emerald-500 text-white" :
                      task.status === 'delayed' ? "bg-rose-500 text-white" : "bg-[#0F172A] text-white hover:bg-accent"
                    )}>
                       {task.status === 'completed' ? <CheckCircle2 className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                    </Button>
                 </Card>
               ))}
            </div>
         </div>

         <Card className="xl:col-span-4 rounded-[3.5rem] border-none shadow-[0_40px_80px_-20px_rgba(15,23,42,0.08)] bg-white p-10 flex flex-col space-y-8 border border-primary/5">
            <h4 className="text-2xl font-black italic tracking-tighter uppercase flex items-center gap-3">
               <Calendar className="h-6 w-6 text-accent" /> AJANDA
            </h4>
            <div className="grid grid-cols-2 gap-4">
               {['BUGÜN', 'YARIN', 'HAFTA', 'AY'].map((t, i) => (
                 <Button key={i} variant={i === 0 ? 'default' : 'ghost'} className={cn(
                   "h-12 rounded-2xl font-black text-[10px] uppercase tracking-widest",
                   i === 0 ? "bg-primary text-white" : "bg-slate-50 text-muted-foreground hover:bg-primary/5"
                 )}>{t}</Button>
               ))}
            </div>
            <div className="space-y-6 flex-1 overflow-y-auto pr-2 scrollbar-hide">
               {[
                 { title: 'Deneme Sınavı', time: '10:00', cat: 'Sınav', color: 'bg-orange-500' },
                 { title: 'Koçluk Seansı', time: '17:00', cat: 'Koçluk', color: 'bg-indigo-500' },
                 { title: 'Genel Tekrar', time: '20:00', cat: 'Tekrar', color: 'bg-emerald-500' },
                 { title: 'Matematik Etüt', time: 'Yarın', cat: 'Etüt', color: 'bg-blue-500' },
               ].map((ev, i) => (
                 <div key={i} className="flex gap-5 group cursor-pointer">
                    <div className={cn("w-1.5 h-12 rounded-full shrink-0 group-hover:scale-y-125 transition-all", ev.color)}></div>
                    <div className="space-y-1">
                       <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-40 leading-none">{ev.cat} • {ev.time}</p>
                       <p className="text-lg font-black text-primary italic leading-none">{ev.title}</p>
                    </div>
                 </div>
               ))}
            </div>
            <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-primary/5 space-y-4">
               <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">ODAKLANMA</span>
                  <Timer className="h-4 w-4 text-accent" />
               </div>
               <p className="text-4xl font-black text-primary tracking-tighter leading-none">{formatTime(timeLeft)}</p>
               <Button onClick={() => setActiveTimer(!activeTimer)} className="w-full h-12 rounded-xl bg-primary text-white font-black text-[10px] uppercase tracking-widest shadow-xl">
                  {activeTimer ? 'DURDUR' : 'SEANSI BAŞLAT'}
               </Button>
            </div>
         </Card>
      </section>

      {/* 3. ANALİZLER & HEDEF TAKİBİ */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-10">
         <Card className="rounded-[3.5rem] border-none shadow-xl bg-white p-10 space-y-10 border border-primary/5 relative overflow-hidden group">
            <Target className="absolute top-8 right-8 h-12 w-12 text-accent opacity-10 group-hover:scale-110 transition-transform" />
            <h4 className="text-2xl font-black italic tracking-tighter uppercase leading-none">HEDEF TAKİBİ</h4>
            <div className="space-y-8">
               <div className="bg-slate-50 p-6 rounded-[2.5rem] space-y-6">
                  <div className="flex justify-between items-center">
                     <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">HEDEF PUAN</span>
                     <span className="text-2xl font-black text-primary italic">480</span>
                  </div>
                  <div className="h-2 w-full bg-white rounded-full overflow-hidden shadow-inner">
                     <div className="h-full bg-accent transition-all duration-1000" style={{ width: '85%' }}></div>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                     <div>
                        <p className="text-[8px] font-black uppercase opacity-40 mb-1">MEVCUT TAHMİN</p>
                        <p className="text-2xl font-black text-primary">452</p>
                     </div>
                     <div className="text-right">
                        <p className="text-[8px] font-black uppercase opacity-40 mb-1">EKSİK</p>
                        <p className="text-2xl font-black text-rose-500">28 Puan</p>
                     </div>
                  </div>
               </div>
               <div className="space-y-4">
                  <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest">
                     <span className="text-muted-foreground italic">AI BAŞARI TAHMİNİ</span>
                     <span className="text-emerald-500">%91</span>
                  </div>
                  <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center gap-4">
                     <Brain className="h-5 w-5 text-emerald-600" />
                     <p className="text-[10px] font-bold text-emerald-800 leading-tight italic">"Mevcut trendinle hedefine ulaşma olasılığın çok yüksek. Fen netlerini korumalısın."</p>
                  </div>
               </div>
            </div>
         </Card>

         <Card className="xl:col-span-2 rounded-[3.5rem] border-none shadow-xl bg-white p-10 space-y-8 border border-primary/5">
            <div className="flex justify-between items-center">
               <h4 className="text-2xl font-black italic tracking-tighter uppercase leading-none">NET GELİŞİM TRENDİ</h4>
               <div className="flex gap-2">
                  {['Hafta', 'Ay', 'Yıl'].map((f, i) => (
                    <button key={i} className={cn("text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full transition-all", i === 1 ? "bg-primary text-white" : "bg-slate-50 text-muted-foreground hover:bg-primary/5")}>{f}</button>
                  ))}
               </div>
            </div>
            <div className="h-[300px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={netGrowthData}>
                     <defs>
                        <linearGradient id="colorNet" x1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3}/>
                           <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                        </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                     <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94A3B8' }} dy={15} />
                     <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94A3B8' }} />
                     <Tooltip 
                        contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', padding: '15px' }}
                        itemStyle={{ fontWeight: 900, fontSize: '12px', textTransform: 'uppercase' }}
                     />
                     <Area type="monotone" dataKey="net" stroke="#F59E0B" strokeWidth={5} fillOpacity={1} fill="url(#colorNet)" />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
         </Card>
      </section>

      {/* 4. AOS ZEKA MERKEZİ */}
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-10">
         <Card className="xl:col-span-4 rounded-[4rem] border-none shadow-2xl bg-[#0F172A] p-12 text-white space-y-10 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-80 h-80 bg-accent/10 blur-[100px] rounded-full"></div>
            <h4 className="text-2xl font-black italic tracking-tighter uppercase text-shadow-deep">PLAN UYUMLULUĞU</h4>
            <div className="space-y-8 relative z-10">
               <div className="flex justify-between items-end">
                  <div className="space-y-1">
                     <p className="text-[10px] font-black uppercase tracking-widest opacity-40">HAFTALIK UYUM</p>
                     <p className="text-6xl font-black italic tracking-tighter text-accent">84%</p>
                  </div>
                  <TrendingUp className="h-10 w-10 text-emerald-400 mb-2" />
               </div>
               <div className="space-y-6 pt-6 border-t border-white/10">
                  {[
                    { label: 'Çalışma Süresi', plan: '4s', real: '3.2s', uyum: 79 },
                    { label: 'Soru Sayısı', plan: '120', real: '96', uyum: 80 },
                    { label: 'Konu Bitirme', plan: '4', real: '3', uyum: 75 },
                  ].map((p, i) => (
                    <div key={i} className="space-y-2">
                       <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                          <span className="opacity-40">{p.label}</span>
                          <span className="text-accent">{p.real} / {p.plan}</span>
                       </div>
                       <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-accent transition-all duration-1000" style={{ width: `${p.uyum}%` }}></div>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
         </Card>

         <Card className="xl:col-span-8 rounded-[4rem] border-none shadow-xl bg-white p-12 grid grid-cols-1 md:grid-cols-2 gap-12 border border-primary/5">
            <div className="space-y-10">
               <h4 className="text-2xl font-black italic tracking-tighter uppercase leading-none">AKADEMİK DNA</h4>
               <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                     <RadarChart cx="50%" cy="50%" outerRadius="80%" data={dnaData}>
                        <PolarGrid stroke="#F1F5F9" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 900 }} />
                        <Radar name="Beceri" dataKey="A" stroke="#F59E0B" strokeWidth={3} fill="#F59E0B" fillOpacity={0.4} />
                     </RadarChart>
                  </ResponsiveContainer>
               </div>
            </div>
            <div className="space-y-10">
               <h4 className="text-2xl font-black italic tracking-tighter uppercase leading-none">KONU İLERLEMESİ</h4>
               <div className="space-y-8">
                  {[
                    { label: 'Türkçe', val: 92, color: 'bg-blue-600' },
                    { label: 'Matematik', val: 73, color: 'bg-orange-500' },
                    { label: 'Fen Bilimleri', val: 68, color: 'bg-purple-600' },
                    { label: 'İngilizce', val: 84, color: 'bg-emerald-500' },
                    { label: 'Sosyal Bilgiler', val: 71, color: 'bg-red-500' },
                  ].map((sub, i) => (
                    <div key={i} className="space-y-3">
                       <div className="flex justify-between items-end">
                          <span className="font-black text-sm uppercase tracking-tight text-primary">{sub.label}</span>
                          <span className="text-xl font-black text-primary italic leading-none">{sub.val}%</span>
                       </div>
                       <div className="h-3.5 w-full bg-slate-50 rounded-full overflow-hidden shadow-inner border border-primary/5 p-0.5">
                          <div className={cn("h-full rounded-full transition-all duration-1000", sub.color)} style={{ width: `${sub.val}%` }}></div>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
         </Card>
      </section>

      {/* 5. GAMIFICATION & ISTS */}
      <section className="grid grid-cols-1 xl:grid-cols-4 gap-8">
         <Card className="xl:col-span-1 rounded-[3rem] border-none shadow-xl bg-white p-10 space-y-8 border border-primary/5 text-center relative overflow-hidden group">
            <div className="h-24 w-24 rounded-[2.5rem] bg-accent flex items-center justify-center mx-auto text-white shadow-2xl relative z-10 group-hover:rotate-12 transition-transform">
               <Flame className="h-12 w-12" />
            </div>
            <div className="space-y-2 relative z-10">
               <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-40">AKADEMİK SEVİYE</p>
               <h5 className="text-5xl font-black text-primary tracking-tighter italic uppercase leading-none">LEVEL 18</h5>
               <p className="text-xs font-bold text-accent italic">Matematik Ustası Rozeti • 3 Gün Kaldı</p>
            </div>
            <div className="pt-6 border-t border-primary/5 space-y-4">
               <Progress value={84} className="h-2 rounded-full" />
            </div>
         </Card>

         <Card className="xl:col-span-3 rounded-[3rem] border-none shadow-xl bg-white p-10 space-y-8 border border-primary/5 overflow-hidden group">
            <div className="flex justify-between items-center">
               <h4 className="text-2xl font-black italic tracking-tighter uppercase leading-none">ÇALIŞMA YOĞUNLUĞU</h4>
            </div>
            <div className="flex flex-wrap gap-1.5">
               {heatMapData.map((d, i) => (
                 <div key={i} className={cn(
                   "h-4 w-4 rounded-sm transition-all hover:scale-150 cursor-pointer",
                   d.value === 0 ? "bg-slate-50" :
                   d.value === 1 ? "bg-accent/20" :
                   d.value === 2 ? "bg-accent/40" :
                   d.value === 3 ? "bg-accent/70" : "bg-accent"
                 )}></div>
               ))}
            </div>
         </Card>
      </section>

      {/* AI KOÇ BUTTON */}
      <div className="fixed bottom-10 right-10 z-[100]">
         <Button className="h-24 w-24 rounded-[2.5rem] bg-[#0F172A] hover:bg-accent text-white shadow-[0_30px_60px_-10px_rgba(15,23,42,0.5)] group transition-all duration-500 hover:scale-110 flex flex-col items-center justify-center gap-1 border-[6px] border-white">
            <Brain className="h-10 w-10 text-accent group-hover:text-white transition-colors" />
            <span className="text-[8px] font-black tracking-widest uppercase">AI KOÇ</span>
         </Button>
      </div>

    </div>
  );
}
