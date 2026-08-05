'use client';

import { useCollection } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Calendar, Plus, MessageSquare, ArrowUpRight } from 'lucide-react';
import { where, orderBy } from 'firebase/firestore';

interface TeacherViewProps {
  user: any;
  userData: any;
}

export function TeacherView({ user, userData }: TeacherViewProps) {
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

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto w-full">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Öğrenci Sayım</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{students.length}</p>
            <CardDescription>Aktif danışmanlık verdiğiniz öğrenciler</CardDescription>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Bugünkü Görüşmeler</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{upcomingSessions.filter(s => new Date(s.scheduledAt).toDateString() === new Date().toDateString()).length}</p>
            <CardDescription>Takviminizdeki bugünkü seanslar</CardDescription>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Bekleyen Görev Atamaları</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">12</p>
            <CardDescription>Kontrol etmeniz gereken ödevler</CardDescription>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Öğrencilerim</CardTitle>
              <CardDescription>Gelişimlerini takip edin</CardDescription>
            </div>
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-2" /> Yeni Öğrenci
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {students.length > 0 ? (
                students.map((student) => (
                  <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {student.displayName?.charAt(0) || 'S'}
                      </div>
                      <div>
                        <p className="font-semibold">{student.displayName}</p>
                        <p className="text-xs text-muted-foreground">{student.email}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="icon" variant="ghost" className="h-8 w-8">
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8">
                        <ArrowUpRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                  Henüz bir öğrenciniz bulunmuyor.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Seans Takvimi</CardTitle>
              <CardDescription>Görüşmelerinizi yönetin</CardDescription>
            </div>
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-2" /> Planla
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingSessions.length > 0 ? (
                upcomingSessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-semibold">{session.notes || 'Rehberlik Görüşmesi'}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(session.scheduledAt).toLocaleString('tr-TR')}
                        </p>
                      </div>
                    </div>
                    <Button size="sm">Seans Başlat</Button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                  Planlanmış bir görüşme yok.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
