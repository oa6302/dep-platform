
'use client';

import { useUser, useFirestore, useCollection } from '@/firebase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  BarChart3, TrendingUp, Target, Plus, 
  Loader2, Trash2, ArrowLeft, Home, Zap, Award
} from 'lucide-react';
import { useState } from 'react';
import { collection, addDoc, serverTimestamp, query, where, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Cell 
} from 'recharts';

export default function TestAnalysisPage() {
  const { user } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const { data: results = [] } = useCollection<any>(
    user?.uid ? query(collection(db!, 'testResults'), where('userId', '==', user.uid), orderBy('createdAt', 'desc')) : null
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!db || !user) return;
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const correct = parseInt(formData.get('correct') as string);
    const wrong = parseInt(formData.get('wrong') as string);
    const net = correct - (wrong * 0.25);

    try {
      await addDoc(collection(db, 'testResults'), {
        userId: user.uid,
        lesson: formData.get('lesson'),
        topic: formData.get('topic'),
        correct,
        wrong,
        net,
        createdAt: serverTimestamp(),
      });
      toast({ title: 'Veri İşlendi', description: 'Test sonucu analitik merkeze saniyeler içinde aktarıldı.' });
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Hata', description: 'Kayıt yapılamadı.' });
    } finally {
      setLoading(false);
    }
  };

  const chartData = results.slice(0, 7).reverse().map((r: any) => ({
    name: r.lesson.substring(0, 3).toUpperCase(),
    net: r.net
  }));

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
                <BarChart3 className="h-3.5 w-3.5" /> DATA LAB v4.8
             </div>
             <h2 className="text-6xl font-black tracking-tighter italic text-primary uppercase leading-none text-shadow-deep">
                Test <br /><span className="text-accent text-shadow-accent">Analizi</span>
             </h2>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        {/* Input Card */}
        <Card className="xl:col-span-4 p-10 rounded-[3.5rem] border-none shadow-xl bg-white space-y-10">
           <div className="space-y-2 text-center">
              <h3 className="text-3xl font-black italic tracking-tighter text-primary uppercase">VERİ GİRİŞİ</h3>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest italic opacity-40">Saniyeler içinde analiz al</p>
           </div>
           <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                 <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4">DERS SEÇİMİ</Label>
                 <Input name="lesson" required placeholder="Örn: TYT Matematik" className="h-14 rounded-2xl bg-slate-50 border-none font-bold" />
              </div>
              <div className="space-y-2">
                 <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4">KONU ADI</Label>
                 <Input name="topic" required placeholder="Örn: Üslü Sayılar" className="h-14 rounded-2xl bg-slate-50 border-none font-bold" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4">DOĞRU</Label>
                    <Input name="correct" type="number" required placeholder="0" className="h-14 rounded-2xl bg-slate-50 border-none font-bold text-center" />
                 </div>
                 <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4">YANLIŞ</Label>
                    <Input name="wrong" type="number" required placeholder="0" className="h-14 rounded-2xl bg-slate-50 border-none font-bold text-center" />
                 </div>
              </div>
              <Button type="submit" disabled={loading} className="w-full h-20 rounded-[2rem] bg-primary hover:bg-accent text-white font-black text-xs uppercase tracking-widest gap-4 shadow-2xl transition-all">
                 {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Zap className="h-5 w-5 text-accent" />} TERMİNALE İŞLE
              </Button>
           </form>
        </Card>

        {/* Charts & Table */}
        <div className="xl:col-span-8 space-y-10">
           <Card className="p-10 rounded-[3.5rem] border-none shadow-xl bg-white h-[450px] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-accent/5 blur-[80px] rounded-full translate-x-1/2 -translate-y-1/2" />
              <div className="flex justify-between items-center mb-10 relative z-10">
                 <h3 className="text-2xl font-black italic tracking-tighter uppercase text-primary">Başarı Trendi</h3>
                 <TrendingUp className="h-6 w-6 text-accent" />
              </div>
              <div className="h-[300px] w-full relative z-10">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                       <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#64748b' }} dy={10} />
                       <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#64748b' }} dx={-10} />
                       <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', fontWeight: 900 }} />
                       <Bar dataKey="net" radius={[10, 10, 0, 0]} barSize={40}>
                          {chartData.map((entry: any, index: number) => (
                             <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#0f172a' : '#f59e0b'} />
                          ))}
                       </Bar>
                    </BarChart>
                 </ResponsiveContainer>
              </div>
           </Card>

           <div className="space-y-4">
              <h3 className="text-xl font-black italic tracking-tighter text-primary uppercase ml-6">GEÇMİŞ VERİLER</h3>
              <div className="space-y-3">
                 {results.slice(0, 5).map((r: any) => (
                    <Card key={r.id} className="p-6 rounded-[2.5rem] border-none shadow-lg bg-white flex items-center justify-between group hover:scale-[1.01] transition-all">
                       <div className="flex items-center gap-6">
                          <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center font-black italic text-primary shadow-inner">{r.lesson.charAt(0)}</div>
                          <div>
                             <p className="text-[12px] font-black text-primary uppercase tracking-tight">{r.lesson} / {r.topic}</p>
                             <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{new Date(r.createdAt?.toDate()).toLocaleDateString('tr-TR')}</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-10">
                          <div className="text-right">
                             <p className="text-[9px] font-black text-muted-foreground uppercase opacity-40">NET SKOR</p>
                             <p className="text-2xl font-black text-primary italic tracking-tighter">{r.net}</p>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => deleteDoc(doc(db!, 'testResults', r.id))}
                            className="h-10 w-10 rounded-xl hover:bg-rose-50 text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                          ><Trash2 className="h-4 w-4" /></Button>
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
