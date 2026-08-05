
'use client';

import { useCollection, useFirestore } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Calendar, Plus, MessageSquare, ArrowUpRight, Eye, Hash, Copy } from 'lucide-react';
import { where, orderBy } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

interface TeacherViewProps {
  user: any;
  userData: any;
}

export function TeacherView({ user, userData }: TeacherViewProps) {
  const router = useRouter();
  const { toast } = useToast();
  
  const { data: students } = useCollection<any>(
    'users',
    where('role', '==', 'student'),
    where('coachId', '==', user?.uid || '')
  );

  const { data: sessions } = useCollection<any>(
    'sessions',
    where('teacherId', '==', user?.uid || ''),
    orderBy('scheduledAt', 'asc')
  );

  const upcomingSessions = sessions.filter(s => s.status === 'scheduled');

  const copyCode = () => {
    if (userData?.activationCode) {
      navigator.clipboard.writeText(userData.activationCode);
      toast({ title: 'Kopyalandı', description: 'Aktivasyon kodu panoya kopyalandı.' });
    }
  };

  const simulateStudent = (studentId: string) => {
    router.push(`/dashboard?simulate=${studentId}`);
  };

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto w-full">
      {/* Top Welcome Bar */}
      <div className="bg-primary rounded-[3rem] p-10 text-white flex flex-col md:flex-row justify-between items-center gap-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 blur-[100px] rounded-full"></div>
        <div className="space-y-4 relative z-10">
          <h2 className="text-4xl font-black tracking-tighter italic">Koçluk Paneline Hoş Geldiniz</h2>
          <p className="opacity-60 font-bold max-w-md">Öğrencilerinizin gelişimini takip edebilir, seansları yönetebilir ve AI destekli analizleri görüntüleyebilirsiniz.</p>
        </div>
        <div className="bg-white/10 backdrop-blur-xl rounded-[2rem] p-8 border border-white/10 flex flex-col items-center gap-4 min-w-[280px] relative z-10">
          <div className="flex items-center gap-3 text-accent font-black text-xs uppercase tracking-[0.3em]">
            <Hash className="h-4 w-4" />
            Aktivasyon Kodunuz
          </div>
          <div className="text-2xl font-black tracking-widest bg-white/5 px-6 py-3 rounded-xl border border-white/5 font-mono">
            {userData?.activationCode || 'Oluşturuluyor...'}
          </div>
          <Button onClick={copyCode} variant="ghost" className="text-white/60 hover:text-white hover:bg-white/5 font-black text-[10px] uppercase tracking-widest gap-2">
            <Copy className="h-4 w-4" />
            Kodu Kopyala
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="rounded-[2.5rem] border-none shadow-xl bg-white transition-transform hover:-translate-y-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Aktif Öğrenciler</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-black text-primary">{students.length}</p>
            <CardDescription className="font-bold opacity-60">Sizinle eşleşmiş öğrenciler</CardDescription>
          </CardContent>
        </Card>
        <Card className="rounded-[2.5rem] border-none shadow-xl bg-white transition-transform hover:-translate-y-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Bekleyen Seanslar</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-black text-accent">{upcomingSessions.length}</p>
            <CardDescription className="font-bold opacity-60">Bu hafta planlanan görüşmeler</CardDescription>
          </CardContent>
        </Card>
        <Card className="rounded-[2.5rem] border-none shadow-xl bg-white transition-transform hover:-translate-y-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Risk Analizi</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-black text-destructive">2</p>
            <CardDescription className="font-bold opacity-60">Netleri düşen öğrenci sayısı</CardDescription>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <Card className="rounded-[3rem] border-none shadow-2xl bg-white overflow-hidden">
          <CardHeader className="p-8 border-b bg-muted/5 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-black italic tracking-tighter">Öğrenci Listesi</CardTitle>
              <CardDescription className="font-bold">Öğrencilerinizin üzerine tıklayarak panellerini simüle edebilirsiniz.</CardDescription>
            </div>
            <Button size="icon" className="h-12 w-12 rounded-2xl bg-primary shadow-lg shadow-primary/20">
              <Plus className="h-6 w-6" />
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-muted/50">
              {students.length > 0 ? (
                students.map((student) => (
                  <div key={student.id} className="p-6 flex items-center justify-between hover:bg-muted/10 transition-colors group">
                    <div className="flex items-center gap-6">
                      <div className="h-14 w-14 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center text-primary font-black text-xl italic shadow-inner group-hover:scale-110 transition-transform">
                        {student.displayName?.charAt(0) || 'S'}
                      </div>
                      <div>
                        <p className="font-black text-lg tracking-tight group-hover:text-primary transition-colors">{student.displayName}</p>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{student.school || 'Okul Belirtilmedi'}</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Button size="icon" variant="ghost" className="h-12 w-12 rounded-2xl hover:bg-accent/10 hover:text-accent transition-all">
                        <MessageSquare className="h-5 w-5" />
                      </Button>
                      <Button onClick={() => simulateStudent(student.id)} size="icon" variant="ghost" className="h-12 w-12 rounded-2xl hover:bg-primary hover:text-white transition-all shadow-sm">
                        <Eye className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-20 text-center text-muted-foreground flex flex-col items-center gap-4">
                  <Users className="h-16 w-16 opacity-10" />
                  <p className="font-black uppercase tracking-widest text-xs opacity-40">Henüz öğrenciniz bulunmuyor.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[3rem] border-none shadow-2xl bg-white overflow-hidden">
          <CardHeader className="p-8 border-b bg-muted/5 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-black italic tracking-tighter">Seans Takvimi</CardTitle>
              <CardDescription className="font-bold">Planlanmış rehberlik görüşmeleri.</CardDescription>
            </div>
            <Button size="icon" className="h-12 w-12 rounded-2xl bg-accent shadow-lg shadow-accent/20">
              <Calendar className="h-6 w-6" />
            </Button>
          </CardHeader>
          <CardContent className="p-8">
            <div className="space-y-6">
              {upcomingSessions.length > 0 ? (
                upcomingSessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-6 bg-muted/20 rounded-[2rem] border border-muted/30 group">
                    <div className="flex items-center gap-6">
                      <div className="h-14 w-14 rounded-2xl bg-white flex items-center justify-center shadow-md group-hover:rotate-6 transition-transform">
                        <Calendar className="h-6 w-6 text-accent" />
                      </div>
                      <div>
                        <p className="font-black text-lg tracking-tight">{session.notes || 'Rehberlik Görüşmesi'}</p>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                          {new Date(session.scheduledAt).toLocaleString('tr-TR')}
                        </p>
                      </div>
                    </div>
                    <Button className="rounded-xl h-10 px-6 font-black text-xs uppercase tracking-widest bg-primary hover:bg-accent transition-colors shadow-lg shadow-primary/10">
                      Başlat
                    </Button>
                  </div>
                ))
              ) : (
                <div className="py-20 text-center text-muted-foreground flex flex-col items-center gap-4">
                  <Calendar className="h-16 w-16 opacity-10" />
                  <p className="font-black uppercase tracking-widest text-xs opacity-40">Planlanmış bir görüşme yok.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
