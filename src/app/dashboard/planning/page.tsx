
'use client';

import { useUser, useFirestore, useCollection } from '@/firebase';
import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, Video, FileText, ChevronRight, 
  ArrowLeft, Home, Search, Sparkles, LayoutTemplate, 
  PlayCircle, FileQuestion, Database, Brain, Target,
  PenTool, GraduationCap, Plus, Play, RotateCcw,
  Atom, FlaskConical, Microscope, Sun, History, Calculator, Ruler, Globe2, Hash
} from 'lucide-react';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

type ViewMode = 'subjects' | 'units' | 'topics' | 'detail';

export default function ContentCenterPage() {
  const { user } = useUser();
  const db = useFirestore();
  const router = useRouter();
  
  const [viewMode, setViewMode] = useState<ViewMode>('subjects');
  const [selectedExam] = useState<string>('TYT');
  const [selectedSubject, setSelectedSubject] = useState<any>(null);
  const [selectedUnit, setSelectedUnit] = useState<any>(null);
  const [selectedTopic, setSelectedTopic] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Veritabanından tüm ilişkili verileri çekiyoruz
  const { data: allSubjects = [] } = useCollection<any>('subjects', where('programId', '==', selectedExam), orderBy('order', 'asc'));
  const { data: allUnits = [] } = useCollection<any>('units', orderBy('order', 'asc'));
  const { data: allTopics = [] } = useCollection<any>('topics', orderBy('order', 'asc'));
  const { data: allTests = [] } = useCollection<any>('tests');
  const { data: allVideos = [] } = useCollection<any>('videos');

  const getStats = (subjectId: string) => {
    // Placeholder (12 Ünite / 84 Test) yerine gerçek sayıları hesaplıyoruz
    const subjectUnits = allUnits.filter(u => u.subjectId === subjectId);
    const subjectUnitIds = subjectUnits.map(u => u.id);
    const subjectTopics = allTopics.filter(t => subjectUnitIds.includes(t.unitId));
    const subjectTopicIds = subjectTopics.map(t => t.id);
    
    return {
      units: subjectUnits.length,
      topics: subjectTopics.length,
      tests: allTests.filter(t => subjectTopicIds.includes(t.topicId)).length,
      videos: allVideos.filter(v => subjectTopicIds.includes(v.topicId)).length,
      success: 0
    };
  };

  const goBack = () => {
    if (viewMode === 'detail') setViewMode('topics');
    else if (viewMode === 'topics') setViewMode('units');
    else if (viewMode === 'units') setViewMode('subjects');
    else router.push('/dashboard');
  };

  const filteredUnits = useMemo(() => {
    return allUnits.filter(u => u.subjectId === selectedSubject?.id);
  }, [allUnits, selectedSubject]);

  const filteredTopics = useMemo(() => {
    return allTopics.filter(t => t.unitId === selectedUnit?.id);
  }, [allTopics, selectedUnit]);

  const IconMap: any = {
    'TYT_TURKCE': BookOpen,
    'TYT_MATEMATIK': Calculator,
    'TYT_GEOMETRI': Ruler,
    'TYT_FIZIK': Atom,
    'TYT_KIMYA': FlaskConical,
    'TYT_BIYOLOJI': Microscope,
    'TYT_TARIH': History,
    'TYT_COGRAFYA': Globe2,
    'TYT_FELSEFE': Brain,
    'TYT_DIN': Sun
  };

  return (
    <div className="p-8 lg:p-14 space-y-12 max-w-[1800px] mx-auto w-full animate-in fade-in duration-1000 bg-[#FAFBFF] min-h-screen">
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

      {viewMode === 'subjects' && (
        <section className="space-y-12 animate-in slide-in-from-bottom-6 duration-1000">
           <div className="flex items-center justify-between px-4">
              <div className="flex items-center gap-4">
                 <h3 className="text-3xl font-black italic tracking-tighter text-primary uppercase">{selectedExam} DERSLERİ</h3>
                 <Badge className="bg-accent text-white border-none font-black text-[10px] uppercase px-4 py-1 shadow-lg shadow-accent/20">AKTİF MÜFREDAT</Badge>
              </div>
           </div>
           
           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
              {allSubjects.map((subject: any) => {
                const stats = getStats(subject.id);
                const Icon = IconMap[subject.id] || BookOpen;

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
                              <p className="text-sm font-black text-primary italic leading-none">%{stats.success}</p>
                              <p className="text-[7px] font-black uppercase text-muted-foreground tracking-widest opacity-40">BAŞARI</p>
                           </div>
                        </div>
                        <div className="space-y-2">
                           <h4 className="text-2xl font-black italic tracking-tighter text-primary uppercase leading-tight">{subject.name}</h4>
                           <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden shadow-inner">
                              <div className="h-full bg-accent transition-all duration-1000" style={{ width: `${stats.success}%` }} />
                           </div>
                        </div>
                        <div className="grid grid-cols-2 gap-y-4 pt-2">
                           <div className="space-y-0.5">
                              <p className="text-lg font-black text-primary italic leading-none">{stats.units || 0}</p>
                              <p className="text-[7px] font-black uppercase text-muted-foreground tracking-widest opacity-40">ÜNİTE</p>
                           </div>
                           <div className="space-y-0.5 text-right">
                              <p className="text-lg font-black text-primary italic leading-none">{stats.tests || 0}</p>
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
           {allSubjects.length === 0 && (
             <div className="py-20 text-center space-y-6">
                <Sparkles className="h-12 w-12 text-accent opacity-20 mx-auto" />
                <p className="text-xs font-black uppercase tracking-[0.4em] text-primary/30">Müfredat Motoru Kurulumu Bekleniyor...</p>
                <p className="text-[10px] italic text-muted-foreground">Admin panelinden "Müfredat Motorunu Kur" butonuna basarak 10 branşı saniyeler içinde yükleyebilirsiniz.</p>
             </div>
           )}
        </section>
      )}

      {viewMode === 'units' && (
        <section className="space-y-10 animate-in slide-in-from-right-8 duration-700">
           <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-primary/5 pb-10">
              <div className="space-y-4">
                 <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-primary/5 text-primary font-black text-[10px] uppercase tracking-widest italic">
                    <LayoutTemplate className="h-3 w-3" /> {selectedExam}
                 </div>
                 <h3 className="text-6xl font-black italic tracking-tighter text-primary uppercase leading-none">{selectedSubject?.name} <br /><span className="text-accent text-shadow-accent">MÜFREDATI</span></h3>
              </div>
           </div>

           <div className="grid grid-cols-1 gap-5">
              {filteredUnits.map((unit: any, i: number) => (
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
                         <span className="text-[9px] font-black text-accent uppercase tracking-widest">ALT KAZANIMLARI GÖR</span>
                      </div>
                   </div>
                   <Button size="icon" className="h-14 w-14 rounded-3xl bg-primary group-hover:bg-accent transition-all shadow-2xl group-hover:rotate-6"><ChevronRight className="h-6 w-6 text-white" /></Button>
                </Card>
              ))}
           </div>
        </section>
      )}

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
              {filteredTopics.map((topic: any, i: number) => (
                <Card 
                  key={topic.id} 
                  onClick={() => { setSelectedTopic(topic); setViewMode('detail'); }}
                  className="group p-8 rounded-[3rem] bg-white border border-primary/5 shadow-lg hover:shadow-2xl hover:scale-[1.01] transition-all cursor-pointer flex items-center justify-between"
                >
                   <div className="flex items-center gap-10">
                      <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center font-black text-xs text-primary/40 shadow-inner italic">{(i+1).toString().padStart(2, '0')}</div>
                      <h5 className="text-2xl font-black text-primary italic uppercase tracking-tighter group-hover:text-accent transition-colors leading-none">{topic.name}</h5>
                   </div>
                   <Button size="icon" className="h-14 w-14 rounded-3xl bg-primary group-hover:bg-accent transition-all shadow-2xl group-hover:rotate-6"><ChevronRight className="h-6 w-6 text-white" /></Button>
                </Card>
              ))}
           </div>
        </section>
      )}

      {viewMode === 'detail' && (
        <section className="space-y-12 animate-in slide-in-from-right-8 duration-700">
           <Card className="rounded-[4.5rem] border-none bg-primary text-white p-16 relative overflow-hidden group shadow-[0_60px_120px_-30px_rgba(15,23,42,0.4)]">
              <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-accent/5 blur-[180px] rounded-full translate-x-1/2 -translate-y-1/2" />
              <div className="flex flex-col xl:flex-row justify-between items-center gap-16 relative z-10">
                 <div className="space-y-8 flex-1">
                    <div className="flex items-center gap-4">
                       <Badge className="bg-white/10 text-accent border-none font-black text-[11px] uppercase px-6 py-2 tracking-widest shadow-2xl shadow-accent/20">%0 BAŞARI SKORU</Badge>
                       <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.4em] italic">OPERATIONAL NODE 4.8</span>
                    </div>
                    <h3 className="text-8xl font-black italic tracking-tighter uppercase leading-none text-shadow-premium">{selectedTopic?.name}</h3>
                 </div>
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

              <TabsContent value="videos" className="text-center py-20 opacity-30 italic font-black uppercase tracking-widest">Henüz video eklenmemiş</TabsContent>
              <TabsContent value="tests" className="text-center py-20 opacity-30 italic font-black uppercase tracking-widest">Henüz test eklenmemiş</TabsContent>
           </Tabs>
        </section>
      )}
    </div>
  );
}
