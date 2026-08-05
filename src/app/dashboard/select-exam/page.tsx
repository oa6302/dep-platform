
'use client';

import { useUser, useFirestore } from '@/firebase';
import { useRouter } from 'next/navigation';
import { EXAM_CONFIGS } from '@/lib/exam-configs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Loader2, ArrowRight, Sparkles } from 'lucide-react';

export default function SelectExamPage() {
  const { user } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

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

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
      <div className="max-w-6xl w-full space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <div className="text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 text-accent font-black text-[10px] uppercase tracking-widest border border-accent/20">
            <Sparkles className="h-3 w-3" /> Akıllı Modül Motoru
          </div>
          <h1 className="text-6xl font-black text-primary tracking-tighter italic uppercase text-shadow-premium">Hedefinizi <span className="text-accent text-shadow-accent">Seçin</span></h1>
          <p className="text-xl text-muted-foreground font-medium italic">Yapay zekâ destekli kişiselleştirilmiş eğitim deneyimi için sınavınızı belirleyin.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Object.values(EXAM_CONFIGS).map((exam) => (
            <Card 
              key={exam.id} 
              className="group relative overflow-hidden rounded-[3rem] border-none shadow-[0_40px_80px_-20px_rgba(15,23,42,0.1)] bg-white p-10 transition-all hover:-translate-y-3 hover:shadow-[0_60px_120px_-30px_rgba(15,23,42,0.2)] cursor-pointer"
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
                <Button className="w-full h-14 rounded-2xl bg-primary hover:bg-accent font-black text-xs uppercase tracking-widest gap-3 transition-all">
                  {loading === exam.id ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Başla'}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
