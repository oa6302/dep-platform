'use client';

import { useDoc, useUser } from '@/firebase';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Star, Award, ShieldCheck, GraduationCap, MapPin, 
  Brain, Sparkles, CheckCircle2, Clock, MessageSquare, 
  ChevronLeft, Calendar, FileText, TrendingUp, Zap, Target,
  Home, ArrowLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function TeacherProfilePage() {
  const { uid } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { data: teacher, loading } = useDoc<any>(`users/${uid}`);
  const [requestSent, setRequestSent] = useState(false);

  const handleSendRequest = () => {
    setRequestSent(true);
    toast({
      title: 'İstek Gönderildi',
      description: `${teacher?.displayName} hocamız talebinizi inceleyip onaylayacaktır.`,
      className: "bg-primary text-white rounded-[2rem]"
    });
  };

  if (loading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center min-h-screen">
        <div className="h-16 w-16 animate-spin rounded-[2rem] border-[6px] border-accent border-t-transparent shadow-xl" />
      </div>
    );
  }

  if (!teacher) return <div className="p-20 text-center font-black">Uzman bulunamadı.</div>;

  return (
    <div className="p-6 lg:p-10 space-y-12 max-w-7xl mx-auto w-full animate-in slide-in-from-bottom-4 duration-700">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => router.back()} 
            className="h-12 w-12 rounded-xl bg-slate-100 hover:bg-primary hover:text-white transition-all shadow-sm group/nav"
            title="Geri Dön"
          >
            <ArrowLeft className="h-5 w-5 group-hover/nav:scale-110" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => router.push('/')} 
            className="h-12 w-12 rounded-xl bg-slate-100 hover:bg-primary hover:text-white transition-all shadow-sm group/nav"
            title="Ana Sayfa"
          >
            <Home className="h-5 w-5 group-hover/nav:scale-110" />
          </Button>
          <span className="ml-4 font-black uppercase text-[10px] tracking-widest text-muted-foreground hidden sm:block">Uzman Profili</span>
        </div>
        <div className="flex gap-4">
           <Button variant="outline" className="h-12 px-6 rounded-xl border-2 font-black text-[10px] uppercase tracking-widest gap-3">
             <MessageSquare className="h-4 w-4" /> Soru Sor
           </Button>
           <Button 
             onClick={handleSendRequest}
             disabled={requestSent}
             className="h-12 px-8 rounded-xl bg-accent hover:bg-primary transition-all font-black text-[10px] uppercase tracking-widest gap-3 shadow-xl shadow-accent/20"
           >
             {requestSent ? <CheckCircle2 className="h-4 w-4" /> : <Target className="h-4 w-4" />}
             {requestSent ? 'İstek Gönderildi' : 'Bağlantı Kur'}
           </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4 space-y-10">
           <Card className="rounded-[4rem] border-none shadow-[0_40px_100px_-20px_rgba(15,23,42,0.12)] bg-white p-12 text-center space-y-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
              <div className="relative mx-auto h-48 w-48 rounded-[4rem] bg-primary flex items-center justify-center text-white font-black text-6xl italic shadow-3xl border-[8px] border-white group-hover:scale-105 transition-transform duration-500">
                 {teacher.displayName?.charAt(0)}
              </div>
              <div className="space-y-3">
                 <h2 className="text-3xl font-black text-primary italic uppercase tracking-tighter">{teacher.displayName}</h2>
                 <p className="text-sm font-black text-accent uppercase tracking-[0.2em]">{teacher.hideBranch ? (teacher.coachType || "Eğitim Koçu") : `${teacher.branch} Uzmanı`}</p>
                 <div className="flex items-center justify-center gap-2">
                    {[1,2,3,4,5].map(s => <Star key={s} className="h-4 w-4 fill-accent text-accent" />)}
                    <span className="text-xs font-black ml-2">5.0 (42 Yorum)</span>
                 </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="p-6 bg-[#F8FAFC] rounded-[2.5rem] border border-primary/5">
                    <p className="text-2xl font-black text-primary">{teacher.experience || '8'}</p>
                    <p className="text-[9px] font-black uppercase opacity-40">Yıl Deneyim</p>
                 </div>
                 <div className="p-6 bg-[#F8FAFC] rounded-[2.5rem] border border-primary/5">
                    <p className="text-2xl font-black text-accent">{teacher.activeStudents || '12'}</p>
                    <p className="text-[9px] font-black uppercase opacity-40">Aktif Öğrenci</p>
                 </div>
              </div>
           </Card>

           <Card className="rounded-[3.5rem] border-none shadow-xl bg-primary text-white p-10 space-y-8">
              <h4 className="text-xl font-black italic tracking-tighter uppercase text-accent">Doğrulanmış Rozetler</h4>
              <div className="space-y-4">
                 {[
                   { icon: ShieldCheck, label: 'Kimlik Doğrulandı', color: 'text-emerald-400' },
                   { icon: GraduationCap, label: 'Diploma Onaylandı', color: 'text-blue-400' },
                   { icon: Award, label: 'Premium Eğitim Koçu', color: 'text-accent' },
                 ].map((badge, i) => (
                   <div key={i} className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 group hover:bg-white/10 transition-all">
                      <badge.icon className={cn("h-6 w-6", badge.color)} />
                      <span className="text-xs font-bold tracking-tight">{badge.label}</span>
                   </div>
                 ))}
              </div>
           </Card>
        </div>

        <div className="lg:col-span-8 space-y-10">
           <Card className="rounded-[4rem] border-none shadow-xl bg-white p-12 space-y-10">
              <div className="space-y-6">
                 <h3 className="text-3xl font-black italic tracking-tighter text-primary uppercase">Hakkında</h3>
                 <p className="text-lg leading-relaxed font-medium text-muted-foreground italic">
                    "{teacher.bio || "Eğitim yolculuğunda öğrencilere sadece ders anlatmakla kalmıyor, onların öğrenme stillerini analiz ederek kişiye özel akademik yol haritaları oluşturuyorum."}"
                  </p>
              </div>

              <div className="grid md:grid-cols-2 gap-10">
                 <div className="space-y-6">
                    <h4 className="text-xl font-black italic text-primary uppercase">Uzmanlık Alanları</h4>
                    <div className="flex flex-wrap gap-3">
                       {['YKS Hazırlık', 'Sayısal Branşlar', 'Hızlı Okuma', 'Sınav Kaygısı', 'Pomodoro Tekniği'].map(skill => (
                         <span key={skill} className="px-5 py-2.5 bg-accent/10 text-accent text-[11px] font-black uppercase tracking-widest rounded-xl border border-accent/20">
                            {skill}
                         </span>
                       ))}
                    </div>
                 </div>
                 <div className="space-y-6">
                    <h4 className="text-xl font-black italic text-primary uppercase">Eğitim & Kariyer</h4>
                    <ul className="space-y-4">
                       <li className="flex gap-4">
                          <div className="h-10 w-10 rounded-xl bg-[#F8FAFC] flex items-center justify-center text-primary font-black shadow-inner italic">İTÜ</div>
                          <div>
                             <p className="text-sm font-black">Matematik Mühendisliği</p>
                             <p className="text-[10px] uppercase font-bold opacity-40">Lisans Mezunu</p>
                          </div>
                       </li>
                       <li className="flex gap-4">
                          <div className="h-10 w-10 rounded-xl bg-[#F8FAFC] flex items-center justify-center text-primary font-black shadow-inner italic">ICF</div>
                          <div>
                             <p className="text-sm font-black">Profesyonel Koçluk Sertifikası</p>
                             <p className="text-[10px] uppercase font-bold opacity-40">Uluslararası Akredite</p>
                          </div>
                       </li>
                    </ul>
                 </div>
              </div>

              <div className="pt-10 border-t border-primary/5 grid md:grid-cols-2 gap-10">
                 <div className="space-y-6">
                    <h4 className="text-xl font-black italic text-primary uppercase flex items-center gap-3">
                       <Calendar className="h-6 w-6 text-accent" /> Çalışma Takvimi
                    </h4>
                    <div className="grid grid-cols-4 gap-2">
                       {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map(day => (
                         <div key={day} className={cn(
                           "p-3 rounded-xl border text-center font-black text-[10px] uppercase",
                           ['Pzt', 'Sal', 'Per', 'Cum'].includes(day) ? "bg-emerald-50 border-emerald-100 text-emerald-600" : "bg-[#F8FAFC] border-primary/5 text-muted-foreground opacity-40"
                         )}>
                            {day}
                         </div>
                       ))}
                    </div>
                    <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest italic">Haftalık 4 gün online görüşmeye uygun.</p>
                 </div>
                 <div className="bg-[#F8FAFC] rounded-[3rem] p-8 flex flex-col justify-center items-center text-center space-y-4">
                    <Zap className="h-12 w-12 text-accent" />
                    <h5 className="text-2xl font-black text-primary italic uppercase tracking-tighter">AI Mentor Önerisi</h5>
                    <p className="text-xs font-medium text-muted-foreground italic">"Hedefindeki başarı kriterleri için {teacher.displayName} hocamızın koçluk yaklaşımı geçmiş yıllardaki öğrenci profillerinle %98 uyumlu."</p>
                 </div>
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
}