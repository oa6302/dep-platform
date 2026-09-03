'use client';

import { useUser, useDoc, useFirestore } from '@/firebase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, CheckCircle2, ChevronRight, Search, 
  Target, Zap, ArrowLeft, Home, Star, Layout
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { YKS_TM_TOPICS } from '@/lib/curriculum-data';
import { cn } from '@/lib/utils';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

export default function TopicsPage() {
  const { user } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { data: userData } = useDoc<any>(user?.uid ? `users/${user.uid}` : null);
  
  const [search, setSearch] = useState('');
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);

  const completedTopics = userData?.completedTopics || {};

  const toggleTopic = async (lesson: string, topic: string) => {
    if (!db || !user) return;
    const currentList = completedTopics[lesson] || [];
    const newList = currentList.includes(topic)
      ? currentList.filter((t: string) => t !== topic)
      : [...currentList, topic];

    await updateDoc(doc(db, 'users', user.uid), {
      [`completedTopics.${lesson}`]: newList,
      updatedAt: serverTimestamp()
    });
  };

  const stats = useMemo(() => {
    const total = Object.values(YKS_TM_TOPICS).reduce((acc, curr) => acc + curr.length, 0);
    const done = Object.values(completedTopics).reduce((acc: number, curr: any) => acc + (curr.length || 0), 0);
    return { total, done, rate: Math.round((done / total) * 100) };
  }, [completedTopics]);

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
                <BookOpen className="h-3.5 w-3.5" /> MÜFREDAT RADARI v4.8
             </div>
             <h2 className="text-6xl font-black tracking-tighter italic text-primary uppercase leading-none text-shadow-deep">
                Konu <br /><span className="text-accent text-shadow-accent">Takibi</span>
             </h2>
          </div>
        </div>

        <Card className="p-8 rounded-[3rem] bg-primary text-white border-none shadow-2xl relative overflow-hidden min-w-[300px]">
           <div className="absolute top-0 right-0 w-32 h-32 bg-accent/20 blur-[60px] rounded-full translate-x-1/2 -translate-y-1/2" />
           <div className="relative z-10 space-y-4">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">GENEL İLERLEME</p>
              <p className="text-5xl font-black italic tracking-tighter">%{stats.rate}</p>
              <div className="space-y-2">
                 <Progress value={stats.rate} className="h-2 bg-white/10" />
                 <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest">{stats.done} / {stats.total} KAZANIM TAMAMLANDI</p>
              </div>
           </div>
        </Card>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {Object.entries(YKS_TM_TOPICS).map(([lesson, topics]) => {
          const doneCount = (completedTopics[lesson] || []).length;
          const rate = Math.round((doneCount / topics.length) * 100);
          
          return (
            <Card key={lesson} className="p-8 rounded-[3.5rem] border-none shadow-xl bg-white hover:-translate-y-2 transition-all group relative overflow-hidden">
               <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-full translate-x-1/2 -translate-y-1/2 group-hover:bg-accent/5 transition-all" />
               <div className="space-y-6 relative z-10">
                  <div className="flex justify-between items-start">
                     <div className="h-16 w-16 rounded-[1.5rem] bg-slate-50 flex items-center justify-center group-hover:rotate-6 transition-all shadow-inner">
                        <Layout className="h-8 w-8 text-primary" />
                     </div>
                     <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 font-black text-[10px] uppercase">%{rate}</Badge>
                  </div>
                  <div>
                     <h3 className="text-2xl font-black italic tracking-tighter text-primary uppercase leading-none mb-1">{lesson}</h3>
                     <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{topics.length} KRİTİK KAZANIM</p>
                  </div>
                  <div className="space-y-3 pt-4">
                     {topics.slice(0, 3).map((topic) => (
                        <button 
                          key={topic} 
                          onClick={() => toggleTopic(lesson, topic)}
                          className={cn(
                            "w-full flex items-center justify-between p-4 rounded-2xl border transition-all text-left",
                            (completedTopics[lesson] || []).includes(topic)
                              ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                              : "bg-slate-50 border-transparent hover:border-slate-200"
                          )}
                        >
                           <span className="text-[11px] font-bold uppercase tracking-tight truncate mr-4">{topic}</span>
                           {(completedTopics[lesson] || []).includes(topic) && <CheckCircle2 className="h-4 w-4 shrink-0" />}
                        </button>
                     ))}
                     {topics.length > 3 && (
                        <Button variant="ghost" className="w-full h-12 rounded-2xl font-black text-[10px] uppercase tracking-widest text-accent hover:bg-accent/5">Tümünü Gör ({topics.length})</Button>
                     )}
                  </div>
               </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
