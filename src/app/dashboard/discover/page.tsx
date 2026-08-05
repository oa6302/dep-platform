
'use client';

import { useUser, useCollection, useDoc } from '@/firebase';
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, Users, Star, Award, ShieldCheck, GraduationCap, 
  MapPin, Brain, Sparkles, Filter, ArrowRight, UserCheck,
  CheckCircle2, Clock, MessageSquare, ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';

export default function DiscoverPage() {
  const { user } = useUser();
  const { data: userData } = useDoc<any>(user?.uid ? `users/${user.uid}` : null);
  const { data: teachers, loading } = useCollection<any>('users', (q: any) => q); // In real app, filter where role == teacher

  const [search, setSearch] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [selectedExam, setSelectedExam] = useState('all');

  // Filter teachers only
  const teacherList = useMemo(() => {
    return (teachers || []).filter(t => t.role === 'teacher');
  }, [teachers]);

  const filteredTeachers = useMemo(() => {
    return teacherList.filter(t => {
      const matchesSearch = t.displayName?.toLowerCase().includes(search.toLowerCase());
      const matchesBranch = selectedBranch === 'all' || t.branch === selectedBranch;
      const matchesExam = selectedExam === 'all' || t.targetExam === selectedExam;
      return matchesSearch && matchesBranch && matchesExam;
    });
  }, [teacherList, search, selectedBranch, selectedExam]);

  // Mock AI Compatibility Score
  const calculateMatchScore = (teacher: any) => {
    if (!userData || !teacher) return 85;
    let score = 70;
    if (teacher.targetExam === userData.targetExam) score += 20;
    if (teacher.branch === userData.branch) score += 5;
    return Math.min(score + Math.floor(Math.random() * 5), 100);
  };

  const branches = ["Matematik", "Türkçe", "Fen Bilimleri", "İngilizce", "Fizik", "Rehberlik"];

  if (loading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <div className="h-16 w-16 animate-spin rounded-[2rem] border-[6px] border-accent border-t-transparent shadow-xl" />
        <p className="text-xs font-black uppercase tracking-widest animate-pulse italic">Uzmanlar Keşfediliyor...</p>
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
          <h2 className="text-5xl font-black tracking-tighter italic text-primary uppercase leading-none">
            Geleceğini <br /><span className="text-accent">Doğru Kişiyle Planla</span>
          </h2>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="rounded-[2.5rem] border-none shadow-[0_40px_80px_-20px_rgba(15,23,42,0.1)] bg-white p-6 md:p-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="relative md:col-span-2">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="Eğitmen, branş veya kurum ara..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 h-14 rounded-2xl bg-[#F1F5F9]/50 border-none shadow-inner font-bold focus-visible:ring-accent"
            />
          </div>
          <Select value={selectedBranch} onValueChange={setSelectedBranch}>
            <SelectTrigger className="h-14 rounded-2xl bg-white border-2 border-primary/5 shadow-sm font-bold">
              <SelectValue placeholder="Branş Seç" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl">
              <SelectItem value="all">Tüm Branşlar</SelectItem>
              {branches.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button className="h-14 rounded-2xl bg-primary hover:bg-accent font-black text-xs uppercase tracking-widest gap-3 shadow-xl transition-all">
            <Filter className="h-5 w-5" /> Filtrele
          </Button>
        </div>
      </Card>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {filteredTeachers.map((teacher, i) => {
          const matchScore = calculateMatchScore(teacher);
          return (
            <Card key={i} className="group relative overflow-hidden rounded-[3rem] border-none shadow-[0_30px_60px_-15px_rgba(15,23,42,0.08)] bg-white transition-all hover:-translate-y-3 hover:shadow-[0_50px_100px_-20px_rgba(15,23,42,0.15)] border border-primary/5">
              <div className="absolute top-0 right-0 w-40 h-40 bg-accent/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2"></div>
              
              <div className="p-8 space-y-8">
                <div className="flex justify-between items-start">
                  <div className="relative">
                    <div className="h-24 w-24 rounded-[2rem] bg-primary flex items-center justify-center text-white font-black text-3xl italic shadow-2xl relative border-[4px] border-white">
                      {teacher.displayName?.charAt(0)}
                    </div>
                    {teacher.badges?.includes('verified') && (
                      <div className="absolute -bottom-2 -right-2 h-10 w-10 bg-accent rounded-2xl flex items-center justify-center text-white shadow-xl border-4 border-white">
                        <ShieldCheck className="h-5 w-5" />
                      </div>
                    )}
                  </div>
                  <div className="text-right space-y-1">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 font-black text-[10px] uppercase tracking-widest border border-emerald-100">
                      <Sparkles className="h-3 w-3" /> %{matchScore} AI Uyum
                    </div>
                    <div className="flex items-center justify-end gap-1 text-accent font-black">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="text-sm">{teacher.rating || '5.0'}</span>
                      <span className="text-[10px] text-muted-foreground opacity-60">({teacher.reviewCount || 0})</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-2xl font-black text-primary tracking-tight italic uppercase">{teacher.displayName}</h4>
                    <p className="text-xs font-black text-accent uppercase tracking-widest">{teacher.branch} Uzmanı</p>
                  </div>
                  
                  <p className="text-xs text-muted-foreground font-medium leading-relaxed line-clamp-2">
                    {teacher.bio || "Öğrencilerin akademik hedeflerine ulaşması için profesyonel koçluk ve branş desteği sağlıyorum."}
                  </p>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="px-4 py-2 bg-[#F8FAFC] rounded-xl border border-primary/5 flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-primary opacity-40" />
                      <span className="text-[10px] font-black uppercase text-primary/70">{teacher.experience || '5+'} Yıl Deneyim</span>
                    </div>
                    <div className="px-4 py-2 bg-[#F8FAFC] rounded-xl border border-primary/5 flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary opacity-40" />
                      <span className="text-[10px] font-black uppercase text-primary/70">{teacher.activeStudents || '12'} Öğrenci</span>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-primary/5 flex gap-4">
                  <Button variant="outline" className="flex-1 h-14 rounded-2xl border-2 font-black text-[10px] uppercase tracking-widest hover:bg-primary hover:text-white transition-all" asChild>
                    <Link href={`/dashboard/teacher/${teacher.uid}`}>Profili Gör</Link>
                  </Button>
                  <Button className="flex-1 h-14 rounded-2xl bg-primary hover:bg-accent font-black text-[10px] uppercase tracking-widest gap-2 shadow-lg shadow-primary/20">
                    İstek Gönder <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {filteredTeachers.length === 0 && (
        <div className="py-40 text-center space-y-6 opacity-30">
          <Search className="h-20 w-20 mx-auto" />
          <p className="text-xl font-black uppercase tracking-widest italic text-primary">Aradığınız kriterde uzman bulunamadı.</p>
        </div>
      )}
    </div>
  );
}
