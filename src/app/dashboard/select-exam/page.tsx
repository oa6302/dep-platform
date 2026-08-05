
'use client';

import { useUser, useFirestore } from '@/firebase';
import { useRouter } from 'next/navigation';
import { EXAM_CONFIGS } from '@/lib/exam-configs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useState, useMemo } from 'react';
import { Loader2, ArrowRight, Sparkles, Star, History } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

export default function SelectExamPage() {
  const { user } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  const categories = ['ORTAOKUL', 'ÜNİVERSİTE', 'KAMU', 'DİL', 'DİNÎ', 'AKADEMİK', 'ÖZEL'];

  const handleSelect = async (examId: string) => {
    if (!user || !db) return;
    setLoading(examId);
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        targetExam: examId,
        updatedAt: serverTimestamp()
      });
      toast({ title: 'Hedef Belirlendi', description: `Sistem ${examId} moduna göre yapılandırıldı.` });
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
        <div className="text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 text-accent font-black text-[10px] uppercase tracking-widest border border-accent/20">
            <Sparkles className="h-3 w-3" /> Akıllı Modül Motoru v2.0
          </div>
          <h1 className="text-6xl font-black text-primary tracking-tighter italic uppercase text-shadow-premium">Hedefinizi <span className="text-accent text-shadow-accent">Seçin</span></h1>
          <p className="text-xl text-muted-foreground font-medium italic">Yapay zekâ destekli kişiselleştirilmiş eğitim deneyimi için programınızı belirleyin.</p>
        </div>

        {/* Quick Access Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <Card className="p-8 rounded-[3rem] border-none shadow-xl bg-primary text-white space-y-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/20 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
              <div className="flex items-center gap-4 relative z-10">
                 <History className="h-6 w-6 text-accent" />
                 <h3 className="text-xl font-black italic tracking-tighter uppercase">Son Kullandıklarım</h3>
              </div>
              <div className="flex gap-4 relative z-10">
                 <Button variant="outline" className="bg-white/5 border-white/10 hover:bg-white/10 text-white rounded-2xl h-14 px-8 font-black text-xs uppercase tracking-widest" onClick={() => handleSelect('LGS')}>LGS</Button>
                 <Button variant="outline" className="bg-white/5 border-white/10 hover:bg-white/10 text-white rounded-2xl h-14 px-8 font-black text-xs uppercase tracking-widest" onClick={() => handleSelect('YKS')}>YKS</Button>
              </div>
           </Card>
           <Card className="p-8 rounded-[3rem] border-none shadow-xl bg-white space-y-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
              <div className="flex items-center gap-4 relative z-10">
                 <Star className="h-6 w-6 text-accent fill-current" />
                 <h3 className="text-xl font-black italic tracking-tighter uppercase text-primary">Favorilerim</h3>
              </div>
              <div className="flex gap-4 relative z-10">
                 <Button variant="outline" className="border-primary/10 hover:bg-primary/5 text-primary rounded-2xl h-14 px-8 font-black text-xs uppercase tracking-widest" onClick={() => handleSelect('KPSS')}>KPSS</Button>
                 <Button variant="outline" className="border-primary/10 hover:bg-primary/5 text-primary rounded-2xl h-14 px-8 font-black text-xs uppercase tracking-widest" onClick={() => handleSelect('DIL')}>Dil Eğitimi</Button>
              </div>
           </Card>
        </div>

        {/* Categorized List */}
        <div className="space-y-16">
          {categories.map((category) => (
            <div key={category} className="space-y-8">
              <div className="flex items-center gap-6">
                <h2 className="text-2xl font-black italic tracking-tighter text-primary uppercase text-shadow-deep">{category}</h2>
                <div className="h-px flex-1 bg-primary/5"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {categorizedExams[category]?.map((exam) => (
                  <Card 
                    key={exam.id} 
                    className="group relative overflow-hidden rounded-[3rem] border-none shadow-[0_40px_80px_-20px_rgba(15,23,42,0.08)] bg-white p-10 transition-all hover:-translate-y-3 hover:shadow-[0_60px_120px_-30px_rgba(15,23,42,0.15)] cursor-pointer border border-primary/5"
                    onClick={() => handleSelect(exam.id)}
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-accent/10 transition-all"></div>
                    <div className="space-y-8">
                      <div className="h-20 w-20 rounded-[1.75rem] bg-primary/5 flex items-center justify-center text-primary group-hover:bg-accent group-hover:text-white transition-all shadow-inner group-hover:rotate-6">
                        <exam.icon className="h-10 w-10" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-3xl font-black italic tracking-tighter text-primary uppercase text-shadow-deep">{exam.title}</h3>
                        <p className="text-sm text-muted-foreground font-medium leading-relaxed italic">{exam.description}</p>
                      </div>
                      <div className="pt-4 border-t border-primary/5 space-y-4">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest opacity-40">
                          <span>Hedef Kitle</span>
                          <span>{exam.targetGroup}</span>
                        </div>
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest opacity-40">
                          <span>Ders Sayısı</span>
                          <span>{exam.lessons.length} Ders</span>
                        </div>
                      </div>
                      <Button className="w-full h-14 rounded-2xl bg-primary hover:bg-accent font-black text-xs uppercase tracking-widest gap-3 transition-all shadow-xl shadow-primary/10 group-hover:shadow-accent/20">
                        {loading === exam.id ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Sistemi Yapılandır'}
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
