
'use client';

import { useCollection, useFirestore } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Calendar, CheckCircle2, Clock, TrendingUp, Target, Brain, Award, Play, BookOpen, Zap, Star, MapPin, LineChart, ClipboardCheck, Library, ArrowRight, Sparkles 
} from 'lucide-react';
import { collection, query, where, orderBy, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useState, useEffect, useMemo } from 'react';
import { EXAM_CONFIGS } from '@/lib/exam-configs';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StudentViewProps {
  user: any;
  userData: any;
  isReadOnly?: boolean;
}

export function StudentView({ user, userData, isReadOnly = false }: StudentViewProps) {
  const db = useFirestore();
  const [timer, setTimer] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);

  // Mevcut sınav konfigürasyonunu al
  const examConfig = useMemo(() => {
    return EXAM_CONFIGS[userData?.targetExam || 'LGS'] || EXAM_CONFIGS['LGS'];
  }, [userData?.targetExam]);

  // Firestore'dan bu sınava özel dersleri çek
  const subjectsQuery = useMemo(() => {
    if (!db || !userData?.targetExam) return null;
    return query(collection(db, 'subjects'), where('programId', '==', userData.targetExam));
  }, [db, userData?.targetExam]);

  const { data: dbSubjects } = useCollection<any>(subjectsQuery);

  useEffect(() => {
    let interval: any;
    if (isActive && timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    } else if (timer === 0) {
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, timer]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="p-6 lg:p-10 space-y-12 max-w-7xl mx-auto w-full animate-in fade-in duration-1000">
      {/* Dynamic Hero Card */}
      <div className="bg-white rounded-[4rem] p-12 shadow-[0_60px_120px_-30px_rgba(15,23,42,0.1)] border border-primary/5 flex flex-col lg:flex-row justify-between items-center gap-12 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="flex items-center gap-12 relative z-10">
          <div className="relative">
             <div className="h-32 w-32 rounded-[3rem] bg-primary flex items-center justify-center text-white font-black text-5xl italic shadow-2xl relative border-[6px] border-white text-shadow-deep">
                {userData?.displayName?.charAt(0) || 'S'}
             </div>
             <div className="absolute -bottom-2 -right-2 h-12 w-12 bg-accent rounded-2xl flex items-center justify-center text-white shadow-xl border-4 border-white">
                <examConfig.icon className="h-6 w-6" />
             </div>
          </div>
          <div className="space-y-4 text-center lg:text-left">
            <h2 className="text-5xl font-black tracking-tighter italic text-primary text-shadow-deep leading-none">{userData?.displayName}</h2>
            <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
              <span className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest px-6 py-2.5 bg-primary/5 text-primary rounded-2xl border border-primary/10 shadow-sm">
                <Sparkles className="h-4 w-4 text-accent" /> Hedef: {examConfig.title}
              </span>
              <span className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest px-6 py-2.5 bg-accent/10 text-accent rounded-2xl border border-accent/20 shadow-sm">
                <Zap className="h-4 w-4" /> {examConfig.category}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-12 relative z-10 bg-[#F8FAFC] p-10 rounded-[3rem] border border-primary/5 shadow-inner">
          <div className="text-center">
            <p className="text-5xl font-black text-primary tracking-tighter text-shadow-deep">%{Math.floor(Math.random() * 20) + 70}</p>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mt-1">Uyum Skoru</p>
          </div>
          <div className="w-px h-20 bg-primary/10 self-center"></div>
          <div className="text-center">
            <p className="text-5xl font-black text-accent tracking-tighter text-shadow-accent">S</p>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mt-1">Seviye</p>
          </div>
        </div>
      </div>

      {/* Dinamik Modüller - Sınava Göre Değişen Bölümler */}
      <div className="space-y-10">
        <div className="flex items-center justify-between">
           <h3 className="text-4xl font-black italic tracking-tighter text-primary uppercase text-shadow-deep">Aktif Eğitim Paneli</h3>
           <Badge variant="outline" className="h-10 px-6 rounded-full font-black text-[10px] uppercase tracking-widest bg-white shadow-sm">{examConfig.title} Müfredatı</Badge>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Firestore Dersleri */}
          {dbSubjects?.length > 0 && dbSubjects.map((subj, i) => (
            <Card key={subj.id} className="group relative overflow-hidden rounded-[3rem] border-none shadow-[0_30px_60px_-15px_rgba(15,23,42,0.06)] bg-white p-10 transition-all hover:-translate-y-4 hover:shadow-[0_50px_100px_-20px_rgba(15,23,42,0.12)] cursor-pointer border border-primary/5">
              <div className="space-y-8">
                <div className="h-16 w-16 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all">
                  <BookOpen className="h-8 w-8" />
                </div>
                <div className="space-y-3">
                  <h4 className="font-black text-2xl italic tracking-tight text-primary uppercase leading-tight">{subj.name}</h4>
                  <p className="text-sm text-muted-foreground font-medium italic">Kazanım ve içerik takibi</p>
                </div>
                <div className="flex items-center text-[10px] font-black uppercase tracking-widest text-accent opacity-0 group-hover:opacity-100 transition-all">
                  Derse Git <ArrowRight className="ml-2 h-4 w-4" />
                </div>
              </div>
            </Card>
          ))}

          {/* Sınava Özel Dinamik Modüller */}
          {examConfig.modules.map((mod, i) => (
            <Card key={i} className="group relative overflow-hidden rounded-[3.5rem] border-none shadow-[0_30px_60px_-15px_rgba(15,23,42,0.06)] bg-white p-10 transition-all hover:-translate-y-4 hover:shadow-[0_50px_100px_-20px_rgba(15,23,42,0.12)] cursor-pointer border border-primary/5">
              <div className={cn("absolute top-0 right-0 w-32 h-32 opacity-5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2", mod.color)}></div>
              <div className="space-y-8">
                <div className={cn("h-16 w-16 rounded-2xl text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-all", mod.color)}>
                  <mod.icon className="h-8 w-8" />
                </div>
                <div className="space-y-3">
                  <h4 className="font-black text-2xl italic tracking-tight text-primary leading-tight">{mod.title}</h4>
                  <p className="text-sm text-muted-foreground font-medium italic">{mod.desc}</p>
                </div>
                <div className="flex items-center text-[10px] font-black uppercase tracking-widest text-primary opacity-0 group-hover:opacity-100 transition-all">
                  Modülü Aç <ArrowRight className="ml-2 h-4 w-4" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* AI Context Card */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        <Card className="xl:col-span-2 bg-primary rounded-[3.5rem] p-12 text-white shadow-[0_60px_120px_-30px_rgba(15,23,42,0.4)] relative overflow-hidden group">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-accent/20 blur-[120px] rounded-full group-hover:scale-125 transition-transform duration-1000"></div>
          <div className="flex flex-col md:flex-row gap-12 items-center relative z-10">
             <div className="h-28 w-28 rounded-[2.5rem] bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-2xl shrink-0">
                <Brain className="h-14 w-14 text-accent" />
             </div>
             <div className="space-y-6">
                <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-accent text-primary font-black text-[10px] uppercase tracking-widest shadow-xl">AI Koç Tavsiyesi</div>
                <h3 className="text-3xl font-black italic tracking-tight leading-relaxed text-shadow-deep">
                   {examConfig.aiFocus}
                </h3>
                <Button className="h-16 px-10 rounded-2xl bg-white text-primary hover:bg-accent hover:text-white transition-all font-black text-xs uppercase tracking-widest gap-4">
                  Detaylı Analiz Al <ArrowRight className="h-5 w-5" />
                </Button>
             </div>
          </div>
        </Card>

        {/* Pomodoro/Focus widget */}
        <Card className="rounded-[3.5rem] border-none shadow-[0_60px_100px_-20px_rgba(15,23,42,0.12)] bg-white overflow-hidden p-12 border border-primary/5">
           <div className="text-center space-y-10">
              <p className="text-[12px] font-black uppercase tracking-[0.4em] text-muted-foreground">Odaklanma Süresi</p>
              <div className="relative inline-flex items-center justify-center">
                 <svg className="h-56 w-56 -rotate-90">
                   <circle cx="112" cy="112" r="100" fill="none" stroke="#F1F5F9" strokeWidth="12" />
                   <circle cx="112" cy="112" r="100" fill="none" stroke="#F59E0B" strokeWidth="12" strokeDasharray="628" strokeDashoffset={628 - (628 * timer / (25 * 60))} strokeLinecap="round" className="transition-all duration-1000 shadow-2xl" />
                 </svg>
                 <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-6xl font-black text-primary tracking-tighter tabular-nums text-shadow-deep">{formatTime(timer)}</span>
                 </div>
              </div>
              <Button 
                onClick={() => setIsActive(!isActive)}
                className={cn(
                  "w-full h-20 rounded-[2.5rem] font-black uppercase tracking-widest text-sm transition-all shadow-2xl",
                  isActive ? "bg-destructive text-white shadow-destructive/20" : "bg-primary text-white shadow-primary/20"
                )}
              >
                {isActive ? 'Durdur' : 'Başlat'} <Play className="ml-3 h-6 w-6" />
              </Button>
           </div>
        </Card>
      </div>
    </div>
  );
}
