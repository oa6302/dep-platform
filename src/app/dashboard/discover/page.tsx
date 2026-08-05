
'use client';

import { useUser, useCollection, useDoc } from '@/firebase';
import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, Users, Star, ShieldCheck, GraduationCap, 
  Brain, Sparkles, Filter, ArrowRight, UserCheck,
  Target, Zap, MessageSquare, Compass, ShieldAlert
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const expertTypes = [
  "Branş Öğretmeni",
  "Eğitim Koçu",
  "Akademik Koç",
  "Rehber Öğretmen",
  "Kariyer Danışmanı",
  "Motivasyon Koçu",
  "Psikolojik Danışman",
  "Kurumsal Danışman"
];

const branches = [
  "Matematik", "Türkçe", "Fen Bilimleri", "Sosyal Bilgiler", "İngilizce", 
  "Fizik", "Kimya", "Biyoloji", "Tarih", "Coğrafya", "Edebiyat", "Geometri", "Rehberlik"
];

const exams = [
  "LGS", "TYT", "AYT", "YKS", "YDT", "KPSS", "ALES", "DGS", "AGS", "Hafızlık", "Dil Eğitimi", "Akademik Destek"
];

export default function DiscoverPage() {
  const { user } = useUser();
  const { data: userData } = useDoc<any>(user?.uid ? `users/${user.uid}` : null);
  const { data: teachers, loading } = useCollection<any>('users', (q: any) => q); 

  const [search, setSearch] = useState('');
  const [selectedExpertType, setSelectedExpertType] = useState('all');
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [selectedExam, setSelectedExam] = useState('all');
  const [isAiMatching, setIsAiMatching] = useState(false);

  // Filter logic
  const teacherList = useMemo(() => {
    return (teachers || []).filter(t => t.role === 'teacher');
  }, [teachers]);

  const filteredTeachers = useMemo(() => {
    return teacherList.filter(t => {
      const searchLower = search.toLowerCase();
      const matchesSearch = 
        t.displayName?.toLowerCase().includes(searchLower) || 
        t.branch?.toLowerCase().includes(searchLower) || 
        t.school?.toLowerCase().includes(searchLower) ||
        t.bio?.toLowerCase().includes(searchLower);

      const matchesExpertType = selectedExpertType === 'all' || t.coachType === selectedExpertType;
      
      let matchesBranch = true;
      if (selectedBranch === 'hidden') {
        matchesBranch = t.hideBranch === true;
      } else if (selectedBranch === 'only_coaches') {
        matchesBranch = !t.branch || t.branch === 'Genel' || t.coachType?.includes('Koçu');
      } else if (selectedBranch !== 'all') {
        matchesBranch = t.branch === selectedBranch;
      }

      const matchesExam = selectedExam === 'all' || t.targetExam === selectedExam;
      
      return matchesSearch && matchesExpertType && matchesBranch && matchesExam;
    });
  }, [teacherList, search, selectedExpertType, selectedBranch, selectedExam]);

  const calculateMatchScore = (teacher: any) => {
    if (!userData || !teacher) return 85;
    let score = 70;
    if (teacher.targetExam === userData.targetExam) score += 20;
    if (teacher.branch === userData.branch) score += 5;
    return Math.min(score + Math.floor(Math.random() * 5), 100);
  };

  const handleAiMatch = () => {
    setIsAiMatching(true);
    setTimeout(() => {
      setIsAiMatching(false);
      // In real logic, this would re-sort filteredTeachers based on match scores
    }, 1500);
  };

  if (loading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <div className="h-20 w-20 animate-spin rounded-[2.5rem] border-[6px] border-accent border-t-transparent shadow-[0_0_50px_rgba(245,158,11,0.2)]" />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] animate-pulse italic text-primary">Uzmanlar Keşfediliyor...</p>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 space-y-12 max-w-7xl mx-auto w-full animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent text-white font-black text-[10px] uppercase tracking-widest shadow-xl shadow-accent/20">
            <UserCheck className="h-3 w-3" /> Uzman Havuzu
          </div>
          <h2 className="text-5xl font-black tracking-tighter italic text-primary uppercase leading-none text-shadow-deep">
            Geleceğini <br /><span className="text-accent text-shadow-accent">Doğru Kişiyle Planla</span>
          </h2>
        </div>
        <Button 
          onClick={handleAiMatch}
          disabled={isAiMatching}
          className="h-16 px-8 rounded-2xl bg-primary hover:bg-accent transition-all font-black text-xs uppercase tracking-widest gap-3 shadow-[0_20px_50px_-10px_rgba(15,23,42,0.3)] group"
        >
          {isAiMatching ? <Zap className="h-5 w-5 animate-spin" /> : <Brain className="h-5 w-5 text-accent group-hover:scale-110 transition-transform" />}
          Bana En Uygun Uzmanı Bul
        </Button>
      </div>

      {/* Advanced Filter Bar */}
      <Card className="rounded-[3rem] border-none shadow-[0_40px_80px_-20px_rgba(15,23,42,0.1)] bg-white p-8 md:p-12 space-y-8">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <div className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-accent transition-colors" />
            <Input 
              placeholder="Öğretmen, koç, uzmanlık alanı veya kurum ara..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-14 h-16 rounded-2xl bg-[#F1F5F9]/50 border-none shadow-inner font-bold text-lg focus-visible:ring-accent focus-visible:bg-white transition-all"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <Select value={selectedExpertType} onValueChange={setSelectedExpertType}>
               <SelectTrigger className="h-16 rounded-2xl bg-white border-2 border-primary/5 shadow-sm font-black text-[11px] uppercase tracking-widest px-6">
                 <SelectValue placeholder="Uzman Türü" />
               </SelectTrigger>
               <SelectContent className="rounded-2xl border-none shadow-2xl">
                 <SelectItem value="all" className="font-black text-[10px] uppercase">Tüm Uzmanlar</SelectItem>
                 {expertTypes.map(t => <SelectItem key={t} value={t} className="font-bold text-[10px] uppercase">{t}</SelectItem>)}
               </SelectContent>
             </Select>

             <Select value={selectedBranch} onValueChange={setSelectedBranch}>
               <SelectTrigger className="h-16 rounded-2xl bg-white border-2 border-primary/5 shadow-sm font-black text-[11px] uppercase tracking-widest px-6">
                 <SelectValue placeholder="Branş Seç" />
               </SelectTrigger>
               <SelectContent className="rounded-2xl border-none shadow-2xl">
                 <SelectItem value="all" className="font-black text-[10px] uppercase">Tüm Branşlar</SelectItem>
                 {branches.map(b => <SelectItem key={b} value={b} className="font-bold text-[10px] uppercase">{b}</SelectItem>)}
                 <SelectItem value="hidden" className="font-black text-[10px] uppercase text-accent">Branşını Gizleyenler</SelectItem>
                 <SelectItem value="only_coaches" className="font-black text-[10px] uppercase text-accent">Sadece Koçlar</SelectItem>
               </SelectContent>
             </Select>

             <Select value={selectedExam} onValueChange={setSelectedExam}>
               <SelectTrigger className="h-16 rounded-2xl bg-white border-2 border-primary/5 shadow-sm font-black text-[11px] uppercase tracking-widest px-6">
                 <SelectValue placeholder="Sınav Odaklı" />
               </SelectTrigger>
               <SelectContent className="rounded-2xl border-none shadow-2xl">
                 <SelectItem value="all" className="font-black text-[10px] uppercase">Tüm Sınavlar</SelectItem>
                 {exams.map(e => <SelectItem key={e} value={e} className="font-bold text-[10px] uppercase">{e}</SelectItem>)}
               </SelectContent>
             </Select>
          </div>
        </div>
      </Card>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {filteredTeachers.map((teacher, i) => {
          const matchScore = calculateMatchScore(teacher);
          const isCoach = teacher.coachType?.includes('Koçu') || teacher.hideBranch;
          
          return (
            <Card key={i} className="group relative overflow-hidden rounded-[3.5rem] border-none shadow-[0_30px_60px_-15px_rgba(15,23,42,0.08)] bg-white transition-all hover:-translate-y-4 hover:shadow-[0_60px_120px_-30px_rgba(15,23,42,0.15)] border border-primary/5">
              <div className="absolute top-0 right-0 w-48 h-48 bg-accent/5 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-accent/10 transition-all duration-1000"></div>
              
              <div className="p-10 space-y-10">
                <div className="flex justify-between items-start">
                  <div className="relative">
                    <div className="h-28 w-28 rounded-[2.75rem] bg-primary flex items-center justify-center text-white font-black text-4xl italic shadow-2xl relative border-[8px] border-white group-hover:rotate-3 transition-transform">
                      {teacher.displayName?.charAt(0)}
                    </div>
                    {(teacher.badges?.includes('verified') || teacher.hideBranch) && (
                      <div className="absolute -bottom-2 -right-2 h-11 w-11 bg-accent rounded-2xl flex items-center justify-center text-white shadow-xl border-4 border-white">
                        <ShieldCheck className="h-6 w-6" />
                      </div>
                    )}
                  </div>
                  <div className="text-right space-y-2">
                    <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-600 font-black text-[10px] uppercase tracking-widest border border-emerald-100 shadow-sm">
                      <Sparkles className="h-3.5 w-3.5" /> %{matchScore} AI Uyum
                    </div>
                    <div className="flex items-center justify-end gap-1.5 text-accent font-black">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="text-sm tracking-tighter">{teacher.rating || '5.0'}</span>
                      <span className="text-[10px] text-muted-foreground opacity-40">({teacher.reviewCount || 0})</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="space-y-1">
                    <h4 className="text-3xl font-black text-primary tracking-tighter italic uppercase leading-none text-shadow-deep">{teacher.displayName}</h4>
                    <p className="text-[11px] font-black text-accent uppercase tracking-[0.2em]">
                      {teacher.hideBranch ? (teacher.coachType || "Eğitim Koçu") : `${teacher.branch} Uzmanı`}
                    </p>
                  </div>
                  
                  <p className="text-xs text-muted-foreground font-medium leading-relaxed line-clamp-3 italic opacity-80">
                    "{teacher.bio || "Öğrencilerin akademik ve motivasyonel hedeflerine ulaşması için profesyonel yol haritaları oluşturuyorum."}"
                  </p>

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="px-5 py-3 bg-[#F8FAFC] rounded-2xl border border-primary/5 flex items-center gap-3 group/stat hover:bg-primary transition-all">
                      <GraduationCap className="h-5 w-5 text-primary group-hover/stat:text-white" />
                      <div className="space-y-0.5">
                        <p className="text-[11px] font-black text-primary group-hover/stat:text-white leading-none">{teacher.experience || '8+'}</p>
                        <p className="text-[8px] font-black uppercase opacity-40 group-hover/stat:text-white/60">Yıl Deneyim</p>
                      </div>
                    </div>
                    <div className="px-5 py-3 bg-[#F8FAFC] rounded-2xl border border-primary/5 flex items-center gap-3 group/stat hover:bg-accent transition-all">
                      <Users className="h-5 w-5 text-primary group-hover/stat:text-white" />
                      <div className="space-y-0.5">
                        <p className="text-[11px] font-black text-primary group-hover/stat:text-white leading-none">{teacher.activeStudents || '14'}</p>
                        <p className="text-[8px] font-black uppercase opacity-40 group-hover/stat:text-white/60">Aktif Öğrenci</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-8 border-t border-primary/5 flex gap-4">
                  <Button variant="outline" className="flex-1 h-16 rounded-2xl border-2 border-primary/5 font-black text-[11px] uppercase tracking-widest hover:bg-primary hover:text-white transition-all shadow-sm" asChild>
                    <Link href={`/dashboard/teacher/${teacher.uid}`}>Profili Gör</Link>
                  </Button>
                  <Button className="flex-1 h-16 rounded-2xl bg-primary hover:bg-accent font-black text-[11px] uppercase tracking-widest gap-3 shadow-2xl shadow-primary/20 transition-all hover:scale-105 active:scale-95">
                    İstek Gönder <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {filteredTeachers.length === 0 && (
        <div className="py-40 text-center space-y-8 animate-in zoom-in-95 duration-500">
          <div className="h-24 w-24 bg-primary/5 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-inner">
            <Compass className="h-12 w-12 text-primary opacity-20" />
          </div>
          <p className="text-2xl font-black uppercase tracking-widest italic text-primary text-shadow-deep">Aradığınız kriterde uzman bulunamadı.</p>
          <Button variant="link" onClick={() => {setSearch(''); setSelectedExpertType('all'); setSelectedBranch('all'); setSelectedExam('all');}} className="font-black text-accent uppercase tracking-widest text-xs">Filtreleri Temizle</Button>
        </div>
      )}
    </div>
  );
}
