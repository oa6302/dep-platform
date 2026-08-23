
'use client';

import { useUser, useDoc, useFirestore, useCollection } from '@/firebase';
import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, Video, FileText, CheckCircle2, ChevronRight, 
  ArrowLeft, Home, Search, Sparkles, LayoutTemplate, 
  PlayCircle, FileQuestion, LineChart, Bookmark, 
  MoreVertical, Filter, Database, Brain, Target,
  PenTool, GraduationCap
} from 'lucide-react';
import { doc, updateDoc, serverTimestamp, collection, query, where, orderBy } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { EXAM_CONFIGS } from '@/lib/exam-configs';

type ViewMode = 'courses' | 'topics' | 'detail';

export default function ContentCenterPage() {
  const { user } = useUser();
  const db = useFirestore();
  const router = useRouter();
  
  const { data: userData } = useDoc<any>(user?.uid ? `users/${user.uid}` : null);
  const targetExam = userData?.targetExam || 'YKS_SAY';
  const examConfig = EXAM_CONFIGS[targetExam];

  const [viewMode, setViewMode] = useState<ViewMode>('courses');
  const [selectedSubject, setSelectedSubject] = useState<any>(null);
  const [selectedTopic, setSelectedTopic] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Firestore Data
  const { data: subjects = [] } = useCollection<any>(
    'subjects', 
    where('programId', '==', targetExam),
    orderBy('order', 'asc')
  );

  const topicsQuery = useMemo(() => {
    if (!db || !selectedSubject) return null;
    return query(collection(db, 'topics'), where('subjectId', '==', selectedSubject.id), orderBy('order', 'asc'));
  }, [db, selectedSubject]);
  const { data: topics = [] } = useCollection<any>(topicsQuery);

  const handleSubjectClick = (subject: any) => {
    setSelectedSubject(subject);
    setViewMode('topics');
  };

  const handleTopicClick = (topic: any) => {
    setSelectedTopic(topic);
    setViewMode('detail');
  };

  const goBack = () => {
    if (viewMode === 'detail') setViewMode('topics');
    else if (viewMode === 'topics') setViewMode('courses');
    else router.push('/dashboard');
  };

  return (
    <div className="p-8 lg:p-14 space-y-12 max-w-7xl mx-auto w-full animate-in fade-in duration-700 bg-[#FAFBFF]">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={goBack} className="h-12 w-12 rounded-xl bg-white shadow-sm border border-primary/5 hover:bg-primary hover:text-white transition-all"><ArrowLeft className="h-6 w-6" /></Button>
            <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard')} className="h-12 w-12 rounded-xl bg-white shadow-sm border border-primary/5 hover:bg-primary hover:text-white transition-all"><Home className="h-6 w-6" /></Button>
          </div>
          <div className="space-y-2">
             <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-primary text-white font-black text-[10px] uppercase tracking-widest shadow-xl">
                <Database className="h-3.5 w-3.5 text-accent" /> AOS CONTENT CENTER v4.8
             </div>
             <h2 className="text-6xl font-black tracking-tighter italic text-primary uppercase leading-none text-shadow-premium">
                {viewMode === 'courses' ? 'DERS VE' : selectedSubject?.name || 'MÜFREDAT'} <br />
                <span className="text-accent text-shadow-accent">
                  {viewMode === 'courses' ? 'İÇERİK MERKEZİ' : (selectedTopic?.name || 'YÖNETİMİ')}
                </span>
             </h2>
          </div>
        </div>
        
        <div className="relative group w-full md:w-96">
           <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-accent transition-colors" />
           <Input 
             placeholder="Konu, test veya video ara..." 
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
             className="pl-14 h-16 rounded-2xl bg-white border-none shadow-xl font-bold focus-visible:ring-accent transition-all"
           />
        </div>
      </header>

      {/* VIEW: COURSE LIST */}
      {viewMode === 'courses' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-4 duration-700">
           {subjects.map((subject: any) => (
             <Card 
               key={subject.id} 
               onClick={() => handleSubjectClick(subject)}
               className="group p-10 rounded-[3.5rem] bg-white border border-primary/5 shadow-xl hover:-translate-y-3 hover:shadow-2xl transition-all cursor-pointer relative overflow-hidden"
             >
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-accent/15 transition-all" />
                <div className="space-y-8 relative z-10">
                   <div className="flex justify-between items-start">
                      <div className="h-20 w-20 rounded-[2rem] bg-primary/5 flex items-center justify-center text-primary group-hover:bg-accent group-hover:text-white transition-all shadow-inner group-hover:rotate-6">
                         <BookOpen className="h-10 w-10" />
                      </div>
                      <Badge variant="outline" className="font-black text-[10px] uppercase px-3 py-1 border-primary/10">%{subject.success || 0} BAŞARI</Badge>
                   </div>
                   <div className="space-y-2">
                      <h4 className="text-3xl font-black italic tracking-tighter text-primary uppercase group-hover:text-accent transition-colors leading-none">{subject.name}</h4>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-40">Müfredat Bazlı İçerik</p>
                   </div>
                   <div className="grid grid-cols-2 gap-4 pt-4">
                      <div className="space-y-1">
                         <p className="text-xl font-black text-primary italic">18 / 42</p>
                         <p className="text-[8px] font-black uppercase text-muted-foreground tracking-widest opacity-60">TAMAMLANAN KONU</p>
                      </div>
                      <div className="space-y-1 text-right">
                         <p className="text-xl font-black text-accent italic">126</p>
                         <p className="text-[8px] font-black uppercase text-muted-foreground tracking-widest opacity-60">TOPLAM TEST</p>
                      </div>
                   </div>
                   <div className="pt-6 border-t border-primary/5 flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest text-primary/40">KONULARI GÖR</span>
                      <ChevronRight className="h-5 w-5 text-accent" />
                   </div>
                </div>
             </Card>
           ))}
        </div>
      )}

      {/* VIEW: TOPIC LIST */}
      {viewMode === 'topics' && (
        <div className="space-y-8 animate-in slide-in-from-right-8 duration-700">
           <div className="grid grid-cols-1 gap-4">
              {topics.map((topic: any, i: number) => (
                <Card 
                  key={topic.id} 
                  onClick={() => handleTopicClick(topic)}
                  className="group p-8 rounded-[2.5rem] bg-white border border-primary/5 shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all cursor-pointer flex items-center justify-between"
                >
                   <div className="flex items-center gap-10">
                      <span className="text-2xl font-black text-primary/10 italic tracking-tighter font-mono">{(i+1).toString().padStart(2, '0')}</span>
                      <div className="space-y-1">
                         <h5 className="text-2xl font-black text-primary italic uppercase tracking-tighter group-hover:text-accent transition-colors">{topic.name}</h5>
                         <div className="flex gap-4 items-center">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-40 italic">Son Çalışma: 22.08.2026</span>
                            <div className="h-1 w-24 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-accent" style={{ width: '64%' }} /></div>
                            <span className="text-[9px] font-black text-accent uppercase tracking-widest">%64 BAŞARI</span>
                         </div>
                      </div>
                   </div>
                   <div className="flex items-center gap-8">
                      <div className="flex gap-4">
                         <div className="flex items-center gap-1 text-muted-foreground/40"><Video className="h-4 w-4" /><span className="text-[10px] font-black italic">12</span></div>
                         <div className="flex items-center gap-1 text-muted-foreground/40"><FileText className="h-4 w-4" /><span className="text-[10px] font-black italic">8</span></div>
                      </div>
                      <Button size="icon" className="h-12 w-12 rounded-[1.25rem] bg-primary group-hover:bg-accent transition-all shadow-xl"><ChevronRight className="h-5 w-5" /></Button>
                   </div>
                </Card>
              ))}
           </div>
        </div>
      )}

      {/* VIEW: TOPIC DETAIL */}
      {viewMode === 'detail' && (
        <div className="space-y-12 animate-in slide-in-from-right-8 duration-700">
           <Card className="rounded-[4rem] border-none bg-primary text-white p-12 relative overflow-hidden group shadow-2xl">
              <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent/5 blur-[150px] rounded-full translate-x-1/2 -translate-y-1/2" />
              <div className="flex flex-col lg:flex-row justify-between items-center gap-16 relative z-10">
                 <div className="space-y-6 flex-1">
                    <div className="flex items-center gap-4">
                       <Badge className="bg-white/10 text-accent border-none font-black text-[10px] uppercase px-4 py-1">%{selectedTopic?.success || 64} BAŞARI SKORU</Badge>
                       <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest italic">Son Çalışma: Bugün</span>
                    </div>
                    <h3 className="text-6xl font-black italic tracking-tighter uppercase leading-none">{selectedTopic?.name}</h3>
                    <div className="flex gap-10 pt-4">
                       <div><p className="text-4xl font-black text-accent italic">84</p><p className="text-[10px] font-black uppercase tracking-widest opacity-40">ÇÖZÜLEN</p></div>
                       <div className="w-px h-10 bg-white/10" />
                       <div><p className="text-4xl font-black text-white italic">54</p><p className="text-[10px] font-black uppercase tracking-widest opacity-40">DOĞRU</p></div>
                       <div className="w-px h-10 bg-white/10" />
                       <div><p className="text-4xl font-black text-rose-500 italic">30</p><p className="text-[10px] font-black uppercase tracking-widest opacity-40">YANLIŞ</p></div>
                    </div>
                 </div>
                 <Card className="bg-white/5 backdrop-blur-3xl p-10 rounded-[3rem] border border-white/10 shadow-2xl space-y-6 w-full max-w-sm">
                    <p className="text-xs font-bold italic text-white/60">"Bu konuda başarı oranını artırmak için saniyeler içinde 2 video ve 1 test öneriliyor."</p>
                    <Button className="w-full h-16 rounded-2xl bg-accent hover:bg-white text-primary font-black text-xs uppercase tracking-widest shadow-2xl transition-all gap-4">
                       <Sparkles className="h-4 w-4" /> AI ANALİZİ YAP
                    </Button>
                 </Card>
              </div>
           </Card>

           <Tabs defaultValue="lesson" className="space-y-12">
              <TabsList className="bg-slate-100/50 p-2 rounded-[2.5rem] h-20 flex gap-2 border border-primary/5 overflow-x-auto scrollbar-hide">
                 <TabsTrigger value="lesson" className="rounded-2xl px-8 h-full font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-lg gap-2"><BookOpen className="h-4 w-4" /> KONU ANLATIMI</TabsTrigger>
                 <TabsTrigger value="videos" className="rounded-2xl px-8 h-full font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-lg gap-2"><PlayCircle className="h-4 w-4" /> VİDEOLAR</TabsTrigger>
                 <TabsTrigger value="tests" className="rounded-2xl px-8 h-full font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-lg gap-2"><FileQuestion className="h-4 w-4" /> TESTLER</TabsTrigger>
                 <TabsTrigger value="wrongs" className="rounded-2xl px-8 h-full font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-lg gap-2"><PenTool className="h-4 w-4 text-rose-500" /> YANLIŞLAR</TabsTrigger>
                 <TabsTrigger value="analysis" className="rounded-2xl px-8 h-full font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-lg gap-2"><LineChart className="h-4 w-4" /> ANALİZ</TabsTrigger>
              </TabsList>

              <TabsContent value="lesson" className="animate-in fade-in slide-in-from-bottom-4">
                 <Card className="p-12 rounded-[3.5rem] bg-white border border-primary/5 shadow-xl space-y-8">
                    <div className="prose prose-slate max-w-none">
                       <h4 className="text-3xl font-black italic text-primary uppercase tracking-tight mb-6">{selectedTopic?.name} Özet</h4>
                       <p className="text-lg leading-relaxed font-medium text-muted-foreground italic">
                          Bu bölümde {selectedTopic?.name} konusuna ait temel formüller, kritik ipuçları ve sınavlarda sıkça çıkan soru tiplerinin analizleri yer almaktadır.
                       </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
                       <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-primary/5">
                          <p className="font-black text-xs uppercase tracking-widest text-primary/40 mb-4 italic">Kritik Formüller</p>
                          <div className="h-40 flex items-center justify-center border-2 border-dashed border-primary/5 rounded-2xl">
                             <FileText className="h-10 w-10 text-primary/10" />
                          </div>
                       </div>
                       <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-primary/5">
                          <p className="font-black text-xs uppercase tracking-widest text-primary/40 mb-4 italic">Alt Konu Listesi</p>
                          <ul className="space-y-4">
                             {[1,2,3,4].map(i => (
                               <li key={i} className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm border border-primary/5">
                                  <div className="h-8 w-8 rounded-xl bg-primary/5 flex items-center justify-center font-black text-xs text-primary">{i}</div>
                                  <span className="font-bold text-sm italic uppercase text-primary/70">Alt Konu Başlığı {i}</span>
                                  <CheckCircle2 className="ml-auto h-5 w-5 text-emerald-500 opacity-20" />
                               </li>
                             ))}
                          </ul>
                       </div>
                    </div>
                 </Card>
              </TabsContent>

              <TabsContent value="videos" className="animate-in fade-in slide-in-from-bottom-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3].map(i => (
                      <Card key={i} className="group overflow-hidden rounded-[3rem] border-none shadow-xl bg-white transition-all hover:-translate-y-2">
                         <div className="aspect-video bg-slate-200 relative flex items-center justify-center group-hover:scale-105 transition-transform duration-700">
                            <PlayCircle className="h-16 w-16 text-primary group-hover:text-accent transition-colors" />
                            <div className="absolute bottom-4 right-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[10px] font-black text-white">32:14</div>
                         </div>
                         <div className="p-8 space-y-4">
                            <Badge className="bg-primary/5 text-primary border-none font-black text-[8px] uppercase tracking-widest">BAŞLANGIÇ SEVİYE</Badge>
                            <h5 className="text-xl font-black italic tracking-tighter text-primary uppercase leading-tight">{selectedTopic?.name} - Konu Anlatımı {i}</h5>
                            <Button variant="outline" className="w-full h-12 rounded-xl border-2 font-black text-[10px] uppercase tracking-widest group-hover:bg-primary group-hover:text-white transition-all">VİDEOYU İZLE</Button>
                         </div>
                      </Card>
                    ))}
                 </div>
              </TabsContent>
              
              <TabsContent value="tests" className="animate-in fade-in slide-in-from-bottom-4">
                 <div className="grid gap-6">
                    {[1, 2, 3, 4].map(i => (
                      <Card key={i} className="group p-8 rounded-[2.5rem] bg-white border border-primary/5 shadow-lg flex items-center justify-between hover:shadow-xl transition-all">
                         <div className="flex items-center gap-8">
                            <div className="h-16 w-16 rounded-[1.25rem] bg-primary text-white flex items-center justify-center shadow-xl group-hover:scale-110 transition-all"><FileQuestion className="h-8 w-8" /></div>
                            <div className="space-y-1">
                               <h5 className="text-xl font-black italic text-primary uppercase tracking-tighter">{selectedTopic?.name} Test 0{i}</h5>
                               <p className="text-[10px] font-bold text-muted-foreground uppercase italic opacity-40">20 Soru • 30 Dakika • Orta Seviye</p>
                            </div>
                         </div>
                         <div className="flex items-center gap-6">
                            <div className="text-right hidden md:block">
                               <p className="text-sm font-black text-primary">%{70 + i * 5}</p>
                               <p className="text-[8px] font-black uppercase text-muted-foreground opacity-40">SON BAŞARI</p>
                            </div>
                            <Button className="h-14 px-8 rounded-2xl bg-primary hover:bg-accent font-black text-xs uppercase tracking-widest shadow-2xl transition-all gap-2">BAŞLAT <ChevronRight className="h-4 w-4" /></Button>
                         </div>
                      </Card>
                    ))}
                 </div>
              </TabsContent>
           </Tabs>
        </div>
      )}
    </div>
  );
}
