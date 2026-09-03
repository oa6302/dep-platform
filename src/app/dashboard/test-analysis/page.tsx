
'use client';

import { useUser, useFirestore, useCollection } from '@/firebase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  BarChart3, TrendingUp, Target, Plus, 
  Loader2, Trash2, ArrowLeft, Home, Zap, Award,
  Calendar, Hash, ListChecks, CheckCircle2
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { collection, addDoc, serverTimestamp, query, where, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import { YKS_TM_TOPICS } from '@/lib/curriculum-data';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format, startOfToday } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';

export default function TestAnalysisPage() {
  const { user } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<string>('');
  const [selectedTopic, setSelectedTopic] = useState<string>('');

  const testResultsQuery = useMemo(() => {
    if (!db || !user?.uid) return null;
    return query(collection(db, 'testResults'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'));
  }, [db, user?.uid]);

  const { data: results = [] } = useCollection<any>(testResultsQuery);

  const todayTests = useMemo(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    return results.filter((r: any) => r.testDate === today).length;
  }, [results]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!db || !user || !selectedLesson || !selectedTopic) {
      toast({ variant: 'destructive', title: 'Hata', description: 'Lütfen ders ve konu seçimini tamamlayın.' });
      return;
    }
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const totalQuestions = parseInt(formData.get('totalQuestions') as string) || 0;
    const correct = parseInt(formData.get('correct') as string) || 0;
    const wrong = parseInt(formData.get('wrong') as string) || 0;
    const net = correct - (wrong * 0.25);
    const testDate = format(new Date(), 'yyyy-MM-dd');

    try {
      await addDoc(collection(db, 'testResults'), {
        userId: user.uid,
        lesson: selectedLesson,
        topic: selectedTopic,
        totalQuestions,
        correct,
        wrong,
        net,
        testDate,
        createdAt: serverTimestamp(),
      });
      toast({ 
        title: 'Veri Terminale İşlendi', 
        description: 'Test sonucu analitik merkeze saniyeler içinde aktarıldı.',
        className: "bg-primary text-white rounded-2xl shadow-2xl" 
      });
      (e.target as HTMLFormElement).reset();
      setSelectedLesson('');
      setSelectedTopic('');
    } catch (error) {
      toast({ variant: 'destructive', title: 'Hata', description: 'Kayıt yapılamadı.' });
    } finally {
      setLoading(false);
    }
  };

  const chartData = useMemo(() => {
    return [...results].slice(0, 7).reverse().map((r: any) => ({
      name: r.lesson.substring(0, 3).toUpperCase(),
      net: r.net
    }));
  }, [results]);

  const lessonsList = Object.keys(YKS_TM_TOPICS);
  const topicsList = selectedLesson ? YKS_TM_TOPICS[selectedLesson] : [];

  return (
    <div className="p-8 lg:p-14 space-y-12 max-w-7xl mx-auto w-full animate-in fade-in duration-700 bg-[#F8FAFC]">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
             <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-12 w-12 rounded-xl bg-white shadow-sm border border-slate-100 hover:bg-primary hover:text-white transition-all"><ArrowLeft className="h-5 w-5" /></Button>
             <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard')} className="h-12 w-12 rounded-xl bg-white shadow-sm border border-slate-100 hover:bg-primary hover:text-white transition-all"><Home className="h-5 w-5" /></Button>
          </div>
          <div className="space-y-2">
             <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-accent text-primary font-black text-[10px] uppercase tracking-widest shadow-xl shadow-accent/20 italic border border-accent/20">
                <BarChart3 className="h-3.5 w-3.5" /> DATA LAB v4.8
             </div>
             <h2 className="text-6xl font-black tracking-tighter italic text-primary uppercase leading-none text-shadow-deep">
                Test <br /><span className="text-accent text-shadow-accent">Analizi</span>
             </h2>
          </div>
        </div>

        <div className="flex gap-4">
           <Card className="p-6 rounded-3xl bg-white border-none shadow-xl flex flex-col items-center justify-center min-w-[140px] group hover:bg-primary hover:text-white transition-all duration-500">
              <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-1 group-hover:text-accent">BUGÜN GİRİLEN</p>
              <p className="text-4xl font-black italic tracking-tighter">{todayTests} <span className="text-xs opacity-20">TEST</span></p>
           </Card>
           <Card className="p-6 rounded-3xl bg-white border-none shadow-xl flex flex-col items-center justify-center min-w-[140px] group hover:bg-accent transition-all duration-500">
              <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-1">TOPLAM VERİ</p>
              <p className="text-4xl font-black italic tracking-tighter">{results.length}</p>
           </Card>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        {/* Input Card */}
        <Card className="xl:col-span-4 p-12 rounded-[4rem] border-none shadow-[0_40px_100px_-25px_rgba(15,23,42,0.15)] bg-white space-y-10 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
           
           <div className="space-y-2 text-center relative z-10">
              <h3 className="text-3xl font-black italic tracking-tighter text-primary uppercase">VERİ GİRİŞİ</h3>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest italic opacity-40">Saniyeler içinde analiz al</p>
           </div>

           <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
              <div className="space-y-2">
                 <Label className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 ml-4 italic">GİRİŞ TARİHİ (OTOMATİK)</Label>
                 <div className="relative group">
                    <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/20" />
                    <Input 
                      disabled 
                      value={format(new Date(), 'd MMMM yyyy', { locale: tr })} 
                      className="h-14 rounded-2xl bg-[#F8FAFC] border-none font-bold text-sm pl-12 opacity-60 shadow-inner" 
                    />
                 </div>
              </div>

              <div className="space-y-2">
                 <Label className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 ml-4 italic">DERS SEÇİMİ</Label>
                 <Select value={selectedLesson} onValueChange={(val) => { setSelectedLesson(val); setSelectedTopic(''); }}>
                    <SelectTrigger className="h-16 rounded-2xl bg-[#F8FAFC] border-none font-black text-xs uppercase shadow-inner focus:ring-accent transition-all">
                       <SelectValue placeholder="BİR DERS SEÇİN" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-none shadow-2xl">
                       {lessonsList.map(l => <SelectItem key={l} value={l} className="font-black text-[10px] uppercase">{l}</SelectItem>)}
                    </SelectContent>
                 </Select>
              </div>

              <div className="space-y-2">
                 <Label className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 ml-4 italic">KONU ADI</Label>
                 <Select value={selectedTopic} onValueChange={setSelectedTopic} disabled={!selectedLesson}>
                    <SelectTrigger className="h-16 rounded-2xl bg-[#F8FAFC] border-none font-bold text-xs shadow-inner focus:ring-accent transition-all">
                       <SelectValue placeholder={selectedLesson ? "BİR KONU SEÇİN" : "ÖNCE DERS SEÇİN"} />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-none shadow-2xl max-h-[300px]">
                       {topicsList.map(t => <SelectItem key={t} value={t} className="font-bold text-[10px] uppercase tracking-tight">{t}</SelectItem>)}
                    </SelectContent>
                 </Select>
              </div>

              <div className="space-y-2">
                 <Label className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 ml-4 italic">TOPLAM SORU SAYISI</Label>
                 <div className="relative group">
                    <Hash className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/20 group-focus-within:text-accent transition-colors" />
                    <Input name="totalQuestions" type="number" required placeholder="Örn: 40" className="h-16 rounded-2xl bg-[#F8FAFC] border-none font-black text-xl pl-12 shadow-inner focus-visible:ring-accent transition-all" />
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 ml-4 italic">DOĞRU</Label>
                    <Input name="correct" type="number" required defaultValue="0" className="h-16 rounded-2xl bg-[#F8FAFC] border-none font-black text-2xl text-center shadow-inner focus-visible:ring-emerald-500" />
                 </div>
                 <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 ml-4 italic">YANLIŞ</Label>
                    <Input name="wrong" type="number" required defaultValue="0" className="h-16 rounded-2xl bg-[#F8FAFC] border-none font-black text-2xl text-center shadow-inner focus-visible:ring-rose-500" />
                 </div>
              </div>

              <Button type="submit" disabled={loading} className="w-full h-24 rounded-[2.5rem] bg-[#0F172A] hover:bg-accent text-white font-black text-sm uppercase tracking-[0.4em] gap-6 shadow-[0_40px_80px_-20px_rgba(15,23,42,0.45)] transition-all active:scale-95 group">
                 {loading ? <Loader2 className="h-8 w-8 animate-spin" /> : <Zap className="h-8 w-8 text-accent group-hover:animate-pulse" />} TERMİNALE İŞLE
              </Button>
           </form>
        </Card>

        {/* Charts & Table */}
        <div className="xl:col-span-8 space-y-10">
           <Card className="p-12 rounded-[4.5rem] border-none shadow-[0_50px_100px_-25px_rgba(0,0,0,0.1)] bg-white h-[480px] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2" />
              <div className="flex justify-between items-center mb-12 relative z-10">
                 <div className="space-y-1">
                    <h3 className="text-3xl font-black italic tracking-tighter uppercase text-primary leading-none">Başarı Trendi</h3>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest italic opacity-40">Son 7 test verisi saniyeler içinde simüle edildi</p>
                 </div>
                 <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center shadow-inner"><TrendingUp className="h-7 w-7 text-accent" /></div>
              </div>
              <div className="h-[320px] w-full relative z-10">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                       <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#64748b' }} dy={15} />
                       <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#64748b' }} dx={-15} />
                       <Tooltip 
                         cursor={{ fill: '#f8fafc' }} 
                         contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 30px 60px rgba(0,0,0,0.15)', fontWeight: 900, padding: '1.5rem' }} 
                       />
                       <Bar dataKey="net" radius={[12, 12, 0, 0]} barSize={45}>
                          {chartData.map((entry: any, index: number) => (
                             <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#0f172a' : '#f59e0b'} />
                          ))}
                       </Bar>
                    </BarChart>
                 </ResponsiveContainer>
              </div>
           </Card>

           <div className="space-y-8">
              <div className="flex items-center gap-6 ml-8">
                 <h3 className="text-2xl font-black italic tracking-tighter text-primary uppercase">GEÇMİŞ VERİLER</h3>
                 <div className="h-px flex-1 bg-slate-200" />
              </div>
              <div className="grid gap-4">
                 {results.slice(0, 5).map((r: any) => (
                    <Card key={r.id} className="p-8 rounded-[3rem] border-none shadow-xl bg-white flex flex-col md:flex-row items-center justify-between group hover:scale-[1.02] transition-all duration-500 border border-primary/5">
                       <div className="flex items-center gap-10">
                          <div className="h-20 w-20 rounded-[1.75rem] bg-[#F8FAFC] flex flex-col items-center justify-center font-black italic text-primary shadow-inner group-hover:bg-primary group-hover:text-white transition-all">
                             <span className="text-2xl leading-none">{r.lesson.charAt(0)}</span>
                             <span className="text-[8px] uppercase tracking-widest mt-1 opacity-40">{r.lesson.substring(0, 3)}</span>
                          </div>
                          <div className="space-y-1">
                             <div className="flex items-center gap-3">
                                <p className="text-2xl font-black text-primary uppercase tracking-tight italic">{r.topic}</p>
                                <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border-primary/10">{r.lesson}</Badge>
                             </div>
                             <div className="flex items-center gap-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-40 italic">
                                <span className="flex items-center gap-1.5"><Calendar className="h-3 w-3" /> {r.testDate || new Date(r.createdAt?.toDate()).toLocaleDateString('tr-TR')}</span>
                                <span className="flex items-center gap-1.5"><ListChecks className="h-3 w-3" /> {r.totalQuestions || '---'} SORU</span>
                             </div>
                          </div>
                       </div>
                       <div className="flex items-center gap-12 mt-6 md:mt-0">
                          <div className="grid grid-cols-2 gap-4 text-center">
                             <div>
                                <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-1">DOĞRU</p>
                                <p className="text-xl font-black text-primary">{r.correct}</p>
                             </div>
                             <div>
                                <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest mb-1">YANLIŞ</p>
                                <p className="text-xl font-black text-primary">{r.wrong}</p>
                             </div>
                          </div>
                          <div className="text-right border-l border-slate-100 pl-10">
                             <p className="text-[10px] font-black text-accent uppercase tracking-[0.3em] mb-1 italic">NET SKOR</p>
                             <p className="text-4xl font-black text-primary italic tracking-tighter">{r.net}</p>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => { if(confirm('Bu veriyi terminalden silmek istediğinize emin misiniz?')) deleteDoc(doc(db!, 'testResults', r.id)); }}
                            className="h-12 w-12 rounded-2xl hover:bg-rose-50 text-rose-500 opacity-0 group-hover:opacity-100 transition-all shadow-sm border border-transparent hover:border-rose-100"
                          ><Trash2 className="h-5 w-5" /></Button>
                       </div>
                    </Card>
                 ))}
                 {results.length === 0 && (
                    <div className="py-40 text-center space-y-8 animate-in zoom-in-95 duration-700">
                       <div className="h-32 w-32 bg-primary/5 rounded-[3rem] flex items-center justify-center mx-auto shadow-inner">
                          <Zap className="h-16 w-16 text-primary opacity-20" />
                       </div>
                       <p className="text-2xl font-black uppercase tracking-[0.5em] italic text-primary/20">Data Lab terminaline veri girişi bekleniyor...</p>
                    </div>
                 )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
