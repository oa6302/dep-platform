
'use client';

import { useUser, useFirestore, useCollection } from '@/firebase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Trophy, TrendingUp, Star, Plus, 
  Loader2, ArrowLeft, Home, Zap, Target
} from 'lucide-react';
import { useState } from 'react';
import { collection, addDoc, serverTimestamp, query, where, orderBy } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export default function DenemeAnalysisPage() {
  const { user } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const { data: results = [] } = useCollection<any>(
    user?.uid ? query(collection(db!, 'denemeResults'), where('userId', '==', user.uid), orderBy('createdAt', 'desc')) : null
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!db || !user) return;
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      userId: user.uid,
      type: formData.get('type'),
      totalNet: parseFloat(formData.get('net') as string),
      points: parseFloat(formData.get('points') as string),
      createdAt: serverTimestamp(),
    };

    try {
      await addDoc(collection(db, 'denemeResults'), data);
      toast({ title: 'Başarı Tescillendi', description: 'Deneme sonucunuz saniyeler içinde global skorboarda eklendi.' });
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Hata', description: 'Kayıt yapılamadı.' });
    } finally {
      setLoading(false);
    }
  };

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
                <Trophy className="h-3.5 w-3.5" /> CHAMPIONSHIP v4.8
             </div>
             <h2 className="text-6xl font-black tracking-tighter italic text-primary uppercase leading-none text-shadow-deep">
                Deneme <br /><span className="text-accent text-shadow-accent">Analizi</span>
             </h2>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        <Card className="xl:col-span-4 p-10 rounded-[3.5rem] border-none shadow-xl bg-white space-y-10">
           <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-2">
                 <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4">SINAV TÜRÜ</Label>
                 <select name="type" className="w-full h-14 rounded-2xl bg-slate-50 border-none font-black text-xs uppercase px-6 outline-none appearance-none">
                    <option value="TYT">TYT GENEL DENEME</option>
                    <option value="AYT">AYT ALAN DENEMESİ</option>
                    <option value="MSU">MSÜ ASKERİ SINAV</option>
                 </select>
              </div>
              <div className="space-y-2">
                 <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4">TOPLAM NET</Label>
                 <Input name="net" type="number" step="0.25" required placeholder="0.00" className="h-16 rounded-[1.75rem] bg-slate-50 border-none font-black text-2xl text-center shadow-inner" />
              </div>
              <div className="space-y-2">
                 <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4">PUAN (ÖSYM TAHMİNİ)</Label>
                 <Input name="points" type="number" step="0.1" placeholder="0.00" className="h-16 rounded-[1.75rem] bg-slate-50 border-none font-black text-2xl text-center shadow-inner" />
              </div>
              <Button type="submit" disabled={loading} className="w-full h-24 rounded-[2.5rem] bg-[#0F172A] hover:bg-accent text-white font-black text-sm uppercase tracking-[0.4em] gap-6 shadow-[0_40px_80px_-20px_rgba(15,23,42,0.4)]">
                 {loading ? <Loader2 className="h-7 w-7 animate-spin" /> : <Star className="h-7 w-7 text-accent" />} TERMİNALE İŞLE
              </Button>
           </form>
        </Card>

        <div className="xl:col-span-8 space-y-10">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="p-10 rounded-[3.5rem] border-none shadow-xl bg-primary text-white space-y-4 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-accent/20 blur-[60px] rounded-full translate-x-1/2 -translate-y-1/2" />
                 <Target className="h-10 w-10 text-accent mb-4" />
                 <p className="text-[11px] font-black uppercase tracking-[0.3em] opacity-40">EN YÜKSEK SKOR (TYT)</p>
                 <p className="text-6xl font-black italic tracking-tighter text-shadow-deep">{Math.max(...results.filter((r:any) => r.type === 'TYT').map((r:any) => r.totalNet), 0)} <span className="text-2xl opacity-40">NET</span></p>
              </Card>
              <Card className="p-10 rounded-[3.5rem] border-none shadow-xl bg-white space-y-4 group">
                 <TrendingUp className="h-10 w-10 text-emerald-500 mb-4 group-hover:scale-110 transition-transform" />
                 <p className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground italic">DENEME ORTALAMASI</p>
                 <p className="text-6xl font-black italic tracking-tighter text-primary">{(results.reduce((acc: number, curr: any) => acc + curr.totalNet, 0) / (results.length || 1)).toFixed(1)}</p>
              </Card>
           </div>

           <div className="space-y-6">
              <h3 className="text-xl font-black italic tracking-tighter text-primary uppercase ml-6">DENEME TARİHÇESİ</h3>
              <div className="grid gap-4">
                 {results.map((r: any) => (
                    <Card key={r.id} className="p-8 rounded-[3rem] border-none shadow-lg bg-white flex items-center justify-between group">
                       <div className="flex items-center gap-8">
                          <div className="h-16 w-16 rounded-[1.5rem] bg-slate-50 flex items-center justify-center font-black italic text-primary shadow-inner">{r.type}</div>
                          <div>
                             <p className="text-xl font-black text-primary italic uppercase tracking-tight">{r.type} GENEL DENEME</p>
                             <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{new Date(r.createdAt?.toDate()).toLocaleDateString('tr-TR')}</p>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className="text-[10px] font-black text-accent uppercase tracking-widest mb-1">GLOBAL SKOR</p>
                          <p className="text-4xl font-black text-primary italic tracking-tighter">{r.totalNet} <span className="text-sm opacity-20">NET</span></p>
                       </div>
                    </Card>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
