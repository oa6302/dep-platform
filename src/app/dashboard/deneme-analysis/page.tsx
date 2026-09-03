
'use client';

import { useUser, useFirestore, useCollection } from '@/firebase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Trophy, TrendingUp, Star, Plus, 
  Loader2, ArrowLeft, Home, Zap, Target, BookOpenCheck, ChevronDown, Calendar
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { collection, addDoc, serverTimestamp, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { YKS_TM_TOPICS } from '@/lib/curriculum-data';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export default function DenemeAnalysisPage() {
  const { user } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [examType, setExamType] = useState('TYT');
  const [selectedLesson, setSelectedLesson] = useState('');

  const denemeResultsQuery = useMemo(() => {
    if (!db || !user?.uid) return null;
    return query(collection(db, 'denemeResults'), where('userId', '==', user.uid), orderBy('examDate', 'desc'));
  }, [db, user?.uid]);

  const { data: results = [] } = useCollection<any>(denemeResultsQuery);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!db || !user) return;
    
    if (examType === 'DERS' && !selectedLesson) {
      toast({ variant: 'destructive', title: 'Hata', description: 'Lütfen deneme için bir ders seçin.' });
      return;
    }

    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const dateVal = formData.get('date') as string;
    const examDate = dateVal ? new Date(dateVal) : new Date();

    const data = {
      userId: user.uid,
      type: examType,
      lesson: examType === 'DERS' ? selectedLesson : null,
      totalNet: parseFloat(formData.get('net') as string),
      points: parseFloat(formData.get('points') as string) || 0,
      examDate: Timestamp.fromDate(examDate),
      createdAt: serverTimestamp(),
    };

    try {
      await addDoc(collection(db, 'denemeResults'), data);
      toast({ 
        title: 'BAŞARI TERMİNALDE', 
        description: 'Deneme verileriniz saniyeler içinde global analize işlendi.',
        className: "bg-primary text-white rounded-[2rem] shadow-2xl" 
      });
      (e.target as HTMLFormElement).reset();
      setSelectedLesson('');
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

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
        {/* Giriş Formu */}
        <Card className="xl:col-span-4 p-12 rounded-[4rem] border-none shadow-[0_40px_100px_-25px_rgba(15,23,42,0.2)] bg-white space-y-10 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
           
           <form onSubmit={handleSubmit} className="space-y-10 relative z-10">
              <div className="space-y-3">
                 <Label className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 ml-4 italic text-primary">SINAV TÜRÜ</Label>
                 <div className="relative group">
                    <select 
                      name="type" 
                      value={examType}
                      onChange={(e) => setExamType(e.target.value)}
                      className="w-full h-16 rounded-2xl bg-[#F8FAFC] border-none font-black text-xs uppercase px-6 outline-none appearance-none cursor-pointer focus:ring-2 focus:ring-accent transition-all shadow-inner"
                    >
                       <option value="TYT">TYT GENEL DENEME</option>
                       <option value="AYT">AYT ALAN DENEMESİ</option>
                       <option value="MSU">MSÜ ASKERİ SINAV</option>
                       <option value="DERS">DERS DENEMESİ (BRANŞ)</option>
                    </select>
                    <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 h-4 w-4 opacity-20 pointer-events-none" />
                 </div>
              </div>

              {examType === 'DERS' && (
                <div className="space-y-3 animate-in slide-in-from-top-4 duration-500">
                   <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-accent ml-4 italic">DERS SEÇİMİ</Label>
                   <div className="relative group">
                      <select 
                        value={selectedLesson}
                        onChange={(e) => setSelectedLesson(e.target.value)}
                        className="w-full h-16 rounded-2xl bg-[#F8FAFC] border-none font-black text-xs uppercase px-6 outline-none appearance-none cursor-pointer focus:ring-2 focus:ring-accent transition-all shadow-inner"
                      >
                         <option value="">BRANŞ SEÇİN</option>
                         {Object.keys(YKS_TM_TOPICS).map(lesson => (
                           <option key={lesson} value={lesson}>{lesson.toUpperCase()}</option>
                         ))}
                      </select>
                      <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 h-4 w-4 opacity-20 pointer-events-none" />
                   </div>
                </div>
              )}

              <div className="space-y-3">
                 <Label className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 ml-4 italic text-primary">DENEME TARİHİ</Label>
                 <Input 
                   name="date" 
                   type="date" 
                   required 
                   defaultValue={format(new Date(), 'yyyy-MM-dd')} 
                   className="h-16 rounded-2xl bg-[#F8FAFC] border-none font-black text-xs uppercase px-6 outline-none shadow-inner focus-visible:ring-accent" 
                 />
              </div>

              <div className="space-y-3">
                 <Label className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 ml-4 italic text-primary">TOPLAM NET</Label>
                 <Input name="net" type="number" step="0.25" required placeholder="0.00" className="h-20 rounded-[2.25rem] bg-[#F8FAFC] border-none font-black text-4xl text-center shadow-inner focus-visible:ring-accent" />
              </div>

              <div className="space-y-3">
                 <Label className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 ml-4 italic text-primary">PUAN (ÖSYM TAHMİNİ)</Label>
                 <Input name="points" type="number" step="0.1" placeholder="0.00" className="h-20 rounded-[2.25rem] bg-[#F8FAFC] border-none font-black text-4xl text-center shadow-inner focus-visible:ring-accent" />
              </div>

              <Button type="submit" disabled={loading} className="w-full h-24 rounded-[2.75rem] bg-[#0F172A] hover:bg-accent text-white font-black text-sm uppercase tracking-[0.4em] gap-6 shadow-[0_40px_80px_-20px_rgba(15,23,42,0.45)] transition-all active:scale-95 group">
                 {loading ? <Loader2 className="h-8 w-8 animate-spin" /> : <Star className="h-8 w-8 text-accent group-hover:animate-pulse" />} TERMİNALE İŞLE
              </Button>
           </form>
        </Card>

        {/* İstatistikler ve Geçmiş */}
        <div className="xl:col-span-8 space-y-12">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <Card className="p-12 rounded-[4rem] border-none shadow-[0_50px_100px_-25px_rgba(15,23,42,0.25)] bg-primary text-white space-y-4 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-48 h-48 bg-accent/20 blur-[80px] rounded-full translate-x-1/2 -translate-y-1/2" />
                 <Target className="h-12 w-12 text-accent mb-6 animate-pulse" />
                 <p className="text-[11px] font-black uppercase tracking-[0.4em] opacity-40 italic">EN YÜKSEK SKOR (TYT)</p>
                 <p className="text-[5rem] font-black italic tracking-tighter text-shadow-premium leading-none">
                    {Math.max(...results.filter((r:any) => r.type === 'TYT').map((r:any) => r.totalNet), 0)} 
                    <span className="text-2xl opacity-40 ml-4">NET</span>
                 </p>
              </Card>
              <Card className="p-12 rounded-[4rem] border-none shadow-[0_50px_100px_-25px_rgba(0,0,0,0.1)] bg-white space-y-4 group transition-all hover:bg-accent hover:text-white">
                 <TrendingUp className="h-12 w-12 text-emerald-500 mb-6 group-hover:text-white transition-colors" />
                 <p className="text-[11px] font-black uppercase tracking-[0.4em] text-muted-foreground italic group-hover:text-white/60">GENEL ORTALAMA</p>
                 <p className="text-[5rem] font-black italic tracking-tighter leading-none">
                    {(results.reduce((acc: number, curr: any) => acc + curr.totalNet, 0) / (results.length || 1)).toFixed(1)}
                 </p>
              </Card>
           </div>

           <div className="space-y-8">
              <div className="flex items-center gap-6 ml-8">
                 <h3 className="text-2xl font-black italic tracking-tighter text-primary uppercase">DENEME TARİHÇESİ</h3>
                 <div className="h-px flex-1 bg-slate-200" />
              </div>
              <div className="grid gap-6">
                 {results.map((r: any) => (
                    <Card key={r.id} className="p-10 rounded-[3.5rem] border-none shadow-xl bg-white flex flex-col md:flex-row items-center justify-between group transition-all hover:scale-[1.02]">
                       <div className="flex items-center gap-10">
                          <div className={cn(
                            "h-20 w-20 rounded-[1.75rem] flex items-center justify-center font-black italic text-xl shadow-inner",
                            r.type === 'DERS' ? "bg-accent/10 text-accent" : "bg-[#F8FAFC] text-primary"
                          )}>
                             {r.type === 'DERS' ? <BookOpenCheck className="h-8 w-8" /> : r.type}
                          </div>
                          <div className="space-y-1">
                             <div className="flex items-center gap-3">
                                <p className="text-2xl font-black text-primary italic uppercase tracking-tight">
                                   {r.type === 'DERS' ? `${r.lesson} BRANŞ DENEMESİ` : `${r.type} GENEL DENEME`}
                                </p>
                                {r.type === 'DERS' && <span className="bg-accent/10 text-accent text-[9px] font-black uppercase px-3 py-1 rounded-full border border-accent/20">BRANŞ</span>}
                             </div>
                             <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest opacity-60 italic flex items-center gap-2">
                                <Calendar className="h-3 w-3" />
                                {r.examDate ? format(r.examDate.toDate(), 'd MMMM yyyy', { locale: require('date-fns/locale/tr') }) : 'Tarih Belirtilmedi'}
                             </p>
                          </div>
                       </div>
                       <div className="text-center md:text-right mt-6 md:mt-0">
                          <p className="text-[10px] font-black text-accent uppercase tracking-[0.3em] mb-2 italic">TERMİNAL SKORU</p>
                          <p className="text-5xl font-black text-primary italic tracking-tighter leading-none">{r.totalNet} <span className="text-sm opacity-20 italic">NET</span></p>
                       </div>
                    </Card>
                 ))}
                 {results.length === 0 && (
                    <div className="py-32 text-center opacity-20 italic font-black uppercase tracking-[0.5em] text-xs">Terminalde veri bulunamadı...</div>
                 )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
