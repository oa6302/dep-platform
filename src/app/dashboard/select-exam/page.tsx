
'use client';

import { useUser, useFirestore } from '@/firebase';
import { useRouter } from 'next/navigation';
import { EXAM_CONFIGS } from '@/lib/exam-configs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useState, useMemo } from 'react';
import { Loader2, ArrowRight, Sparkles, Star, History, Home, ArrowLeft, ChevronRight } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

export default function SelectExamPage() {
  const { user } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  const categories = [
    'ORTAOKUL', 
    'ÜNİVERSİTE', 
    'MEB SINAVLARI', 
    'KAMU SINAVLARI', 
    'AKADEMİK', 
    'YABANCI DİL', 
    'ÜNİVERSİTE GEÇİŞ', 
    'DİNÎ EĞİTİM', 
    'AKADEMİK DESTEK', 
    'ÖZEL PROGRAMLAR'
  ];

  const handleSelect = async (examId: string) => {
    if (!user || !db) return;
    setLoading(examId);
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        targetExam: examId,
        updatedAt: serverTimestamp()
      });
      toast({ 
        title: 'Sistem Yapılandırıldı', 
        description: `${examId} moduna başarıyla geçiş yapıldı.`,
        className: "bg-primary text-white rounded-[2rem]"
      });
      router.push('/dashboard');
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Hata', description: error.message });
      setLoading(null);
    }
  };

  const categorizedExams = useMemo(() => {
    const grouped: Record<string, any[]> = {};
    Object.values(EXAM_CONFIGS).forEach(exam => {
      if (!grouped[exam.category]) grouped[exam.category] = [];
      grouped[exam.category].push(exam);
    });
    return grouped;
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-6">
      <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <header className="flex items-center justify-between">
           <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => router.back()} 
              className="h-14 w-14 rounded-2xl bg-white hover:bg-primary hover:text-white transition-all shadow-sm group/nav"
            >
              <ArrowLeft className="h-6 w-6 group-hover/nav:scale-110" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => router.push('/')} 
              className="h-14 w-14 rounded-2xl bg-white hover:bg-primary hover:text-white transition-all shadow-sm group/nav"
            >
              <Home className="h-6 w-6 group-hover/nav:scale-110" />
            </Button>
          </div>
          <div className="hidden sm:flex items-center gap-3">
             <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
             <span className="font-black text-[10px] uppercase tracking-widest text-primary/40">Dinamik Sınav Motoru Aktif</span>
          </div>
        </header>

        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-accent/10 text-accent font-black text-[10px] uppercase tracking-widest border border-accent/20 shadow-xl shadow-accent/5">
            <Sparkles className="h-3.5 w-3.5" /> Hangi Programa Hazırlanıyorsunuz?
          </div>
          <h1 className="text-6xl md:text-7xl font-black text-primary tracking-tighter italic uppercase text-shadow-premium leading-none">
            Hedefini <span className="text-accent text-shadow-accent">Belirle</span>
          </h1>
          <p className="text-xl text-muted-foreground font-medium italic">
            Size en doğru eğitim deneyimini sunabilmemiz için hazırlanmak istediğiniz programı seçin. Sistem tamamen size özel yapılandırılacaktır.
          </p>
        </div>

        <div className="space-y-24 pt-12">
          {categories.map((category) => (
            categorizedExams[category]?.length > 0 && (
              <div key={category} className="space-y-10">
                <div className="flex items-center gap-6">
                  <h2 className="text-2xl font-black italic tracking-tighter text-primary uppercase text-shadow-deep">{category}</h2>
                  <div className="h-px flex-1 bg-primary/5 shadow-inner"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {categorizedExams[category]?.map((exam) => (
                    <Card 
                      key={exam.id} 
                      className="group relative overflow-hidden rounded-[3.5rem] border-none shadow-[0_40px_80px_-20px_rgba(15,23,42,0.08)] bg-white p-10 transition-all hover:-translate-y-4 hover:shadow-[0_60px_120px_-30px_rgba(15,23,42,0.15)] cursor-pointer border border-primary/5"
                      onClick={() => handleSelect(exam.id)}
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-accent/15 transition-all"></div>
                      <div className="space-y-10">
                        <div className="flex justify-between items-start">
                          <div className="h-20 w-20 rounded-[2rem] bg-primary/5 flex items-center justify-center text-primary group-hover:bg-accent group-hover:text-white transition-all shadow-inner group-hover:rotate-6">
                            <exam.icon className="h-10 w-10" />
                          </div>
                          <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest px-3 py-1 bg-slate-50 border-primary/5">
                             {exam.lessons.length} Modül
                          </Badge>
                        </div>
                        <div className="space-y-3">
                          <h3 className="text-3xl font-black italic tracking-tighter text-primary uppercase text-shadow-deep group-hover:text-accent transition-colors leading-none">{exam.title}</h3>
                          <p className="text-sm text-muted-foreground font-medium leading-relaxed italic line-clamp-2">{exam.description}</p>
                        </div>
                        <div className="pt-6 border-t border-primary/5 flex items-center justify-between">
                           <span className="text-[10px] font-black uppercase tracking-widest text-primary/40">{exam.targetGroup}</span>
                           <div className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-all">
                              <ChevronRight className="h-5 w-5" />
                           </div>
                        </div>
                      </div>
                      {loading === exam.id && (
                        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10">
                           <Loader2 className="h-10 w-10 animate-spin text-accent" />
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              </div>
            )
          ))}
        </div>
      </div>
    </div>
  );
}

function Badge({ className, children, variant }: any) {
  return <div className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors", className)}>{children}</div>;
}
