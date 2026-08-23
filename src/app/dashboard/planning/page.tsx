'use client';

import { useUser, useDoc, useFirestore, useCollection } from '@/firebase';
import { useState, useMemo, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, Video, FileText, CheckCircle2, ChevronRight, 
  ArrowLeft, Home, Search, Sparkles, LayoutTemplate, 
  PlayCircle, FileQuestion, LineChart, Database, Brain, Target,
  PenTool, GraduationCap, Plus, Filter, Play, Trash2, Edit3,
  Clock, Hash, ListChecks, History, AlertTriangle, RotateCcw,
  Atom, FlaskConical, Microscope, Sun
} from 'lucide-react';
import { collection, query, where, orderBy, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';

type ViewMode = 'exams' | 'subjects' | 'units' | 'topics' | 'detail';

export default function ContentCenterPage() {
  const { user } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  
  const [viewMode, setViewMode] = useState<ViewMode>('subjects'); // Default to TYT subjects
  const [selectedExam, setSelectedExam] = useState<string>('TYT');
  const [selectedSubject, setSelectedSubject] = useState<any>(null);
  const [selectedUnit, setSelectedUnit] = useState<any>(null);
  const [selectedTopic, setSelectedTopic] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Fallback subjects if DB is empty (TYT 10 Ders)
  const tytSubjects = [
    { id: 'TYT_TURKCE', name: 'Türkçe', icon: BookOpen },
    { id: 'TYT_MATEMATIK', name: 'Matematik', icon: Calculator },
    { id: 'TYT_GEOMETRI', name: 'Geometri', icon: Ruler },
    { id: 'TYT_FIZIK', name: 'Fizik', icon: Atom },
    { id: 'TYT_KIMYA', name: 'Kimya', icon: FlaskConical },
    { id: 'TYT_BIYOLOJI', name: 'Biyoloji', icon: Microscope },
    { id: 'TYT_TARIH', name: 'Tarih', icon: History },
    { id: 'TYT_COGRAFYA', name: 'Coğrafya', icon: Globe2 },
    { id: 'TYT_FELSEFE', name: 'Felsefe', icon: Brain },
    { id: 'TYT_DIN', name: 'Din Kültürü', icon: Sun },
  ];

  // Programs / Exams
  const exams = [
    { id: 'TYT', title: 'TYT 2026', dersCount: 10, konuCount: 186, icon: Target },
    { id: 'AYT', title: 'AYT 2026', dersCount: 6, konuCount: 142, icon: Brain },
    { id: 'LGS', title: 'LGS 2026', dersCount: 8, konuCount: 94, icon: GraduationCap },
  ];

  // Real DB Subjects based on exam
  const { data: dbSubjects = [] } = useCollection<any>(
    'subjects', 
    where('programId', '==', selectedExam),
    orderBy('order', 'asc')
  );

  const displaySubjects = useMemo(() => {
    return dbSubjects.length > 0 ? dbSubjects : tytSubjects.map((s, i) => ({ ...s, order: i, programId: 'TYT' }));
  }, [dbSubjects]);

  // Units based on subject
  const unitsQuery = useMemo(() => {
    if (!db || !selectedSubject) return null;
    return query(collection(db, 'units'), where('subjectId', '==', selectedSubject.id), orderBy('order', 'asc'));
  }, [db, selectedSubject]);
  const { data: dbUnits = [] } = useCollection<any>(unitsQuery);

  // Topics based on unit
  const topicsQuery = useMemo(() => {
    if (!db || !selectedUnit) return null;
    return query(collection(db, 'topics'), where('unitId', '==', selectedUnit.id), orderBy('order', 'asc'));
  }, [db, selectedUnit]);
  const { data: dbTopics = [] } = useCollection<any>(topicsQuery);

  const goBack = () => {
    if (viewMode === 'detail') setViewMode('topics');
    else if (viewMode === 'topics') setViewMode('units');
    else if (viewMode === 'units') setViewMode('subjects');
    else if (viewMode === 'subjects') setViewMode('exams');
    else router.push('/dashboard');
  };

  return (
    <div className="p-8 lg:p-14 space-y-12 max-w-[1800px] mx-auto w-full animate-in fade-in duration-1000 bg-[#FAFBFF] min-h-screen">
      {/* HEADER SECTION - PROTECTED UI */}
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
                DERS VE <br />
                <span className="text-accent text-shadow-accent">İÇERİK MERKEZİ</span>
             </h2>
          </div>
        </div>
        
        <div className="flex items-center gap-6 w-full md:w-auto">
           <div className="relative group w-full md:w-96">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-accent transition-colors" />
              <Input 
                placeholder="Konu, test veya video ara..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-14 h-16 rounded-2xl bg-white border-none shadow-xl font-bold focus-visible:ring-accent transition-all"
              />
           </div>
           <Button className="h-16 px-8 rounded-2xl bg-primary hover:bg-accent transition-all font-black text-xs uppercase tracking-widest gap-3 shadow-2xl">
             <Plus className="h-5 w-5 text-accent" /> İÇERİK EKLE
           </Button>
        </div>
      </header>

      {/* TYT DERSLERİ SECTION */}
      {viewMode === 'subjects' && (
        <section className="space-y-12 animate-in slide-in-from-bottom-6 duration-1000">
           <div className="flex items-center justify-between px-4">
              <div className="flex items-center gap-4">
                 <h3 className="text-3xl font-black italic tracking-tighter text-primary uppercase">{selectedExam} DERSLERİ</h3>
                 <Badge className="bg-accent text-white border-none font-black text-[10px] uppercase px-4 py-1 shadow-lg shadow-accent/20">AKTİF MÜFREDAT</Badge>
              </div>
              <Button variant="ghost" onClick={() => setViewMode('exams')} className="font-black text-[10px] uppercase tracking-widest text-primary/40 hover:text-primary">SINAV DEĞİŞTİR</Button>
           </div>
           
           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
              {displaySubjects.map((subject: any) => {
                const Icon = subject.icon || BookOpen;
                return (
                  <Card 
                    key={subject.id} 
                    onClick={() => { setSelectedSubject(subject); setViewMode('units'); }}
                    className="group p-10 rounded-[3.5rem] bg-white border border-primary/5 shadow-xl hover:-translate-y-3 hover:shadow-[0_60px_120px_-30px_rgba(15,23,42,0.15)] transition-all cursor-pointer relative overflow-hidden"
                  >
                     <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-accent/20 transition-all duration-700" />
                     <div className="space-y-8 relative z-10">
                        <div className="flex justify-between items-start">
                           <div className="h-16 w-16 rounded-[1.5rem] bg-primary/5 flex items-center justify-center text-primary group-hover:bg-accent group-hover:text-white transition-all shadow-inner group-hover:rotate-6">
                              <Icon className="h-8 w-8" />
                           </div>
                           <div className="text-right">
                              <p className="text-sm font-black text-primary italic leading-none">%{subject.success || 0}</p>
                              <p className="text-[7px] font-black uppercase text-muted-foreground tracking-widest opacity-40">BAŞARI</p>
                           </div>
                        </div>
                        <div className="space-y-2">
                           <h4 className="text-2xl font-black italic tracking-tighter text-primary uppercase leading-tight">{subject.name}</h4>
                           <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden shadow-inner">
                              <div className="h-full bg-accent transition-all duration-1000" style={{ width: `${subject.success || 0}%` }} />
                           </div>
                        </div>
                        <div className="grid grid-cols-2 gap-y-4 pt-2">
                           <div className="space-y-0.5">
                              <p className="text-lg font-black text-primary italic leading-none">12</p>
                              <p className="text-[7px] font-black uppercase text-muted-foreground tracking-widest opacity-40">ÜNİTE</p>
                           </div>
                           <div className="space-y-0.5 text-right">
                              <p className="text-lg font-black text-primary italic leading-none">84</p>
                              <p className="text-[7px] font-black uppercase text-muted-foreground tracking-widest opacity-40">TEST</p>
                           </div>
                        </div>
                        <div className="pt-6 border-t border-primary/5 flex items-center justify-between group-hover:text-accent transition-colors">
                           <span className="text-[9px] font-black uppercase tracking-widest">KONULARI GÖR</span>
                           <ChevronRight className="h-4 w-4" />
                        </div>
                     </div>
                  </Card>
                );
              })}
           </div>
        </section>
      )}

      {/* UNITS / KONULAR LIST SECTION */}
      {viewMode === 'units' && (
        <section className="space-y-10 animate-in slide-in-from-right-8 duration-700">
           <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-primary/5 pb-10">
              <div className="space-y-4">
                 <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-primary/5 text-primary font-black text-[10px] uppercase tracking-widest italic">
                    <LayoutTemplate className="h-3 w-3" /> {selectedExam}
                 </div>
                 <h3 className="text-6xl font-black italic tracking-tighter text-primary uppercase leading-none">{selectedSubject?.name} <br /><span className="text-accent text-shadow-accent">MÜFREDATI</span></h3>
              </div>
              <div className="flex gap-4">
                 <div className="bg-white p-6 rounded-[2.5rem] border border-primary/5 shadow-xl text-center">
                    <p className="text-3xl font-black text-primary italic">0 / {dbUnits.length || '---'}</p>
                    <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground opacity-40">TAMAMLANAN</p>
                 </div>
                 <div className="bg-white p-6 rounded-[2.5rem] border border-primary/5 shadow-xl text-center">
                    <p className="text-3xl font-black text-accent italic">%{selectedSubject?.success || 0}</p>
                    <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground opacity-40">BAŞARI</p>
                 </div>
              </div>
           </div>

           <div className="grid grid-cols-1 gap-5">
              {dbUnits.map((unit: any, i: number) => (
                <Card 
                  key={unit.id} 
                  onClick={() => { setSelectedUnit(unit); setViewMode('topics'); }}
                  className="group p-8 rounded-[3rem] bg-white border border-primary/5 shadow-lg hover:shadow-2xl hover:scale-[1.01] transition-all cursor-pointer flex items-center justify-between"
                >
                   <div className="flex items-center gap-10">
                      <span className="text-3xl font-black text-primary/10 italic tracking-tighter font-mono">{(i+1).toString().padStart(2, '0')}</span>
                      <div className="h-1.5 w-12 rounded-full bg-slate-50" />
                      <div className="space-y-1">
                         <h5 className="text-2xl font-black text-primary italic uppercase tracking-tighter group-hover:text-accent transition-colors leading-none">{unit.name}</h5>
                         <div className="flex gap-6 items-center">
                            <div className="flex items-center gap-1.5 text-muted-foreground/40"><PlayCircle className="h-3.5 w-3.5" /><span className="text-[9px] font-black italic">6 Video</span></div>
                            <div className="flex items-center gap-1.5 text-muted-foreground/40"><FileQuestion className="h-3.5 w-3.5" /><span className="text-[9px] font-black italic">12 Test</span></div>
                            <div className="h-4 w-px bg-slate-100" />
                            <span className="text-[9px] font-black text-accent uppercase tracking-widest">ALT KAZANIMLARI GÖR</span>
                         </div>
                      </div>
                   </div>
                   <Button size="icon" className="h-14 w-14 rounded-3xl bg-primary group-hover:bg-accent transition-all shadow-2xl group-hover:rotate-6"><ChevronRight className="h-6 w-6 text-white" /></Button>
                </Card>
              ))}
              {dbUnits.length === 0 && (
                <div className="py-40 text-center space-y-8">
                  <Database className="h-16 w-16 text-primary/10 mx-auto" />
                  <p className="text-xl font-black text-primary/20 uppercase tracking-widest italic">MÜFREDAT YÜKLENMEMİŞ</p>
                  <Button onClick={() => router.push('/dashboard/admin/curriculum')} className="h-14 px-8 rounded-2xl bg-primary font-black text-xs uppercase tracking-widest">ADMİN TERMİNALİNE GİT</Button>
                </div>
              )}
           </div>
        </section>
      )}

      {/* TOPICS / ALT KONULAR SECTION */}
      {viewMode === 'topics' && (
        <section className="space-y-10 animate-in slide-in-from-right-8 duration-700">
           <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-primary/5 pb-10">
              <div className="space-y-4">
                 <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-primary/5 text-primary font-black text-[10px] uppercase tracking-widest italic">
                    <Hash className="h-3.5 w-3.5 text-accent" /> {selectedSubject?.name} → {selectedUnit?.name}
                 </div>
                 <h3 className="text-6xl font-black italic tracking-tighter text-primary uppercase leading-none">ALT <span className="text-accent text-shadow-accent">KAZANIMLAR</span></h3>
              </div>
           </div>

           <div className="grid grid-cols-1 gap-5">
              {dbTopics.map((topic: any, i: number) => (
                <Card 
                  key={topic.id} 
                  onClick={() => { setSelectedTopic(topic); setViewMode('detail'); }}
                  className="group p-8 rounded-[3rem] bg-white border border-primary/5 shadow-lg hover:shadow-2xl hover:scale-[1.01] transition-all cursor-pointer flex items-center justify-between"
                >
                   <div className="flex items-center gap-10">
                      <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center font-black text-xs text-primary/40 shadow-inner italic">{(i+1).toString().padStart(2, '0')}</div>
                      <h5 className="text-2xl font-black text-primary italic uppercase tracking-tighter group-hover:text-accent transition-colors leading-none">{topic.name}</h5>
                   </div>
                   <div className="flex items-center gap-6">
                      <Badge className="bg-primary/5 text-primary border-none font-black text-[9px] uppercase px-4 py-1.5">USTALAŞILDI</Badge>
                      <Button size="icon" className="h-14 w-14 rounded-3xl bg-primary group-hover:bg-accent transition-all shadow-2xl group-hover:rotate-6"><ChevronRight className="h-6 w-6 text-white" /></Button>
                   </div>
                </Card>
              ))}
           </div>
        </section>
      )}

      {/* TOPIC DETAIL MASTER PANEL */}
      {viewMode === 'detail' && (
        <section className="space-y-12 animate-in slide-in-from-right-8 duration-700">
           <Card className="rounded-[4.5rem] border-none bg-primary text-white p-16 relative overflow-hidden group shadow-[0_60px_120px_-30px_rgba(15,23,42,0.4)]">
              <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-accent/5 blur-[180px] rounded-full translate-x-1/2 -translate-y-1/2" />
              <div className="flex flex-col xl:flex-row justify-between items-center gap-16 relative z-10">
                 <div className="space-y-8 flex-1">
                    <div className="flex items-center gap-4">
                       <Badge className="bg-white/10 text-accent border-none font-black text-[11px] uppercase px-6 py-2 tracking-widest shadow-2xl shadow-accent/20">%{selectedTopic?.success || 84} BAŞARI SKORU</Badge>
                       <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.4em] italic">OPERATIONAL NODE 4.8</span>
                    </div>
                    <h3 className="text-8xl font-black italic tracking-tighter uppercase leading-none text-shadow-premium">{selectedTopic?.name}</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-12 pt-6">
                       <div><p className="text-5xl font-black text-accent italic tracking-tighter">186</p><p className="text-[10px] font-black uppercase tracking-widest opacity-40 italic">TOPLAM SORU</p></div>
                       <div><p className="text-5xl font-black text-white italic tracking-tighter">156</p><p className="text-[10px] font-black uppercase tracking-widest opacity-40 italic">DOĞRU</p></div>
                       <div><p className="text-5xl font-black text-rose-500 italic tracking-tighter">30</p><p className="text-[10px] font-black uppercase tracking-widest opacity-40 italic">YANLIŞ</p></div>
                       <div><p className="text-5xl font-black text-white/40 italic tracking-tighter">04 Eyl</p><p className="text-[10px] font-black uppercase tracking-widest opacity-40 italic">SONRAKİ TEKRAR</p></div>
                    </div>
                 </div>
                 <Card className="bg-white/5 backdrop-blur-3xl p-12 rounded-[4rem] border border-white/10 shadow-2xl space-y-8 w-full max-w-md">
                    <div className="flex items-center gap-4"><Sparkles className="h-6 w-6 text-accent animate-pulse" /><span className="text-[11px] font-black uppercase tracking-widest">PEDAGOGICAL ADVICE</span></div>
                    <p className="text-lg font-bold italic leading-relaxed text-white/80">"Başarı oranınız hedefinizin üzerinde. Bu konuda saniyeler içinde 2 yeni nesil test ve 1 zor soru seti öneriliyor."</p>
                    <Button className="w-full h-20 rounded-[2rem] bg-accent hover:bg-white text-primary font-black text-xs uppercase tracking-[0.3em] shadow-2xl transition-all duration-700 gap-4">
                       <Zap className="h-5 w-5" /> STRATEJİYİ AKTİF ET
                    </Button>
                 </Card>
              </div>
           </Card>

           <Tabs defaultValue="videos" className="space-y-12">
              <TabsList className="bg-slate-100/50 p-2.5 rounded-[3.5rem] h-24 flex gap-3 border border-primary/5 overflow-x-auto scrollbar-hide shadow-inner">
                 <TabsTrigger value="lesson" className="rounded-[2.5rem] px-12 h-full font-black text-[11px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-2xl gap-3"><BookOpen className="h-5 w-5" /> KONU ANLATIMI</TabsTrigger>
                 <TabsTrigger value="videos" className="rounded-[2.5rem] px-12 h-full font-black text-[11px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-2xl gap-3"><PlayCircle className="h-5 w-5" /> VİDEOLAR</TabsTrigger>
                 <TabsTrigger value="tests" className="rounded-[2.5rem] px-12 h-full font-black text-[11px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-2xl gap-3"><FileQuestion className="h-5 w-5" /> TESTLER</TabsTrigger>
                 <TabsTrigger value="wrongs" className="rounded-[2.5rem] px-12 h-full font-black text-[11px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-2xl gap-3 text-rose-500"><PenTool className="h-5 w-5" /> YANLIŞLARIM</TabsTrigger>
                 <TabsTrigger value="reviews" className="rounded-[2.5rem] px-12 h-full font-black text-[11px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-2xl gap-3"><RotateCcw className="h-5 w-5 text-accent" /> TEKRAR SİSTEMİ</TabsTrigger>
              </TabsList>

              <TabsContent value="videos" className="animate-in fade-in slide-in-from-bottom-6 duration-700">
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                    {[1, 2, 3, 4].map(i => (
                      <Card key={i} className="group overflow-hidden rounded-[3.5rem] border-none shadow-2xl bg-white transition-all hover:-translate-y-4">
                         <div className="aspect-video bg-slate-200 relative flex items-center justify-center group-hover:scale-110 transition-transform duration-1000">
                            <PlayCircle className="h-20 w-20 text-white group-hover:text-accent transition-all drop-shadow-2xl" />
                            <div className="absolute bottom-6 right-6 px-4 py-2 bg-black/60 backdrop-blur-xl rounded-xl text-[10px] font-black text-white border border-white/10 tracking-widest">32:14</div>
                         </div>
                         <div className="p-10 space-y-6">
                            <Badge className="bg-primary/5 text-primary border-none font-black text-[9px] uppercase tracking-widest px-4 py-1.5">BAŞLANGIÇ SEVİYE</Badge>
                            <h5 className="text-2xl font-black italic tracking-tighter text-primary uppercase leading-[1.1]">{selectedTopic?.name} - Operasyonel Anlatım {i}</h5>
                            <Button variant="outline" className="w-full h-14 rounded-2xl border-2 border-primary/5 font-black text-[10px] uppercase tracking-widest group-hover:bg-primary group-hover:text-white transition-all shadow-xl">VİDEOYU İZLE <Play className="ml-2 h-3 w-3 fill-current" /></Button>
                         </div>
                      </Card>
                    ))}
                 </div>
              </TabsContent>
              
              <TabsContent value="tests" className="animate-in fade-in slide-in-from-bottom-6 duration-700">
                 <div className="grid gap-6">
                    {[
                      { title: 'Test 01', type: 'Temel Seviye', qs: 20, time: 25, success: 85 },
                      { title: 'Test 02', type: 'Orta Seviye', qs: 20, time: 30, success: 70 },
                      { title: 'Test 03', type: 'Zor Seviye', qs: 15, time: 30, success: 0 },
                    ].map((test, i) => (
                      <Card key={i} className="group p-10 rounded-[3.5rem] bg-white border border-primary/5 shadow-xl flex items-center justify-between hover:shadow-2xl hover:scale-[1.01] transition-all duration-500">
                         <div className="flex items-center gap-12">
                            <div className="h-20 w-20 rounded-[2rem] bg-primary text-white flex items-center justify-center shadow-2xl group-hover:rotate-12 transition-all"><FileQuestion className="h-10 w-10" /></div>
                            <div className="space-y-1">
                               <h5 className="text-3xl font-black italic text-primary uppercase tracking-tighter">{selectedTopic?.name} {test.title}</h5>
                               <p className="text-[11px] font-bold text-muted-foreground uppercase italic opacity-40 tracking-widest">{test.qs} Soru • {test.time} Dakika • {test.type}</p>
                            </div>
                         </div>
                         <Button className="h-16 px-10 rounded-2xl bg-primary hover:bg-accent font-black text-xs uppercase tracking-widest shadow-2xl transition-all gap-4 group/btn">
                            {test.success > 0 ? 'TEKRAR ÇÖZ' : 'TESTE BAŞLA'} 
                            <ChevronRight className="h-5 w-5 group-hover/btn:translate-x-1 transition-transform" />
                         </Button>
                      </Card>
                    ))}
                 </div>
              </TabsContent>

              <TabsContent value="wrongs" className="animate-in fade-in slide-in-from-bottom-6 duration-700">
                 <Card className="p-16 rounded-[4.5rem] bg-white border border-primary/5 shadow-2xl text-center space-y-10">
                    <div className="h-32 w-32 bg-rose-500/5 rounded-[4rem] flex items-center justify-center mx-auto shadow-inner">
                       <PenTool className="h-14 w-14 text-rose-500" />
                    </div>
                    <div className="space-y-4">
                       <h4 className="text-5xl font-black italic tracking-tighter text-primary uppercase">YANLIŞ ANALİZ TERMİNALİ</h4>
                       <p className="text-xl font-medium text-muted-foreground italic max-w-2xl mx-auto">
                          Bu konudaki yanlışlarınız "Spaced Repetition" algoritması ile tekrar önünüze getirilecektir.
                       </p>
                    </div>
                    <Button className="h-20 px-16 rounded-[2rem] bg-rose-500 hover:bg-rose-600 text-white font-black text-xs uppercase tracking-[0.3em] shadow-2xl gap-6 shadow-rose-500/20">
                       <PenTool className="h-6 w-6" /> YANLIŞLARI TEKRAR ÇÖZ
                    </Button>
                 </Card>
              </TabsContent>
           </Tabs>
        </section>
      )}
    </div>
  );
}

// Icons
function Calculator(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="20" x="4" y="2" rx="2"/><line x1="8" x2="16" y1="6" y2="6"/><line x1="16" x2="16" y1="14" y2="18"/><path d="M16 10h.01"/><path d="M12 10h.01"/><path d="M8 10h.01"/><path d="M12 14h.01"/><path d="M8 14h.01"/><path d="M12 18h.01"/><path d="M8 18h.01"/></svg> }
function Ruler(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.3 15.3 4.4 3 2.5 5.5l16.9 12.3 1.9-2.5z"/><path d="m5.5 5.5 2.1 1.5"/><path d="m8.5 7.5 2.1 1.5"/><path d="m11.5 9.5 2.1 1.5"/><path d="m14.5 11.5 2.1 1.5"/><path d="m17.5 13.5 2.1 1.5"/></svg> }
function Globe2(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg> }
