'use client';

import { useCollection } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, CheckCircle2, Plus, Clock } from 'lucide-react';
import { where, orderBy } from 'firebase/firestore';

interface StudentViewProps {
  user: any;
  userData: any;
}

export function StudentView({ user, userData }: StudentViewProps) {
  const { data: tasks } = useCollection<any>(
    'tasks',
    where('studentId', '==', user?.uid || ''),
    orderBy('dueDate', 'asc')
  );

  const { data: sessions } = useCollection<any>(
    'sessions',
    where('studentId', '==', user?.uid || ''),
    orderBy('scheduledAt', 'asc')
  );

  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const upcomingSessions = sessions.filter(s => s.status === 'scheduled');

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto w-full">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Bekleyen Görevlerim</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{pendingTasks.length}</p>
            <CardDescription>Tamamlanmayı bekliyor</CardDescription>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Sıradaki Görüşme</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold truncate">
              {upcomingSessions.length > 0 
                ? new Date(upcomingSessions[0].scheduledAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })
                : 'Planlanmış görüşme yok'}
            </p>
            <CardDescription>Koçunuz ile olan seansınız</CardDescription>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Akademik Puan</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">850</p>
            <CardDescription>Gelişim seviyeniz</CardDescription>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Görüşme Takvimim</CardTitle>
              <CardDescription>Yaklaşan koçluk seanslarınız</CardDescription>
            </div>
            <Button size="sm" variant="outline">Tümünü Gör</Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingSessions.length > 0 ? (
                upcomingSessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-semibold">{session.notes || 'Haftalık Değerlendirme'}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(session.scheduledAt).toLocaleString('tr-TR')}
                        </p>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost">Katıl</Button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                  Henüz planlanmış bir görüşmeniz bulunmuyor.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Haftalık Görevler</CardTitle>
              <CardDescription>Başarı hedefleriniz</CardDescription>
            </div>
            <Button size="sm" variant="outline">Arşiv</Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingTasks.length > 0 ? (
                pendingTasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-semibold">{task.title}</p>
                        <p className="text-xs text-muted-foreground">Son Tarih: {new Date(task.dueDate).toLocaleDateString('tr-TR')}</p>
                      </div>
                    </div>
                    <Button size="sm">Tamamla</Button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                  Tebrikler! Bekleyen göreviniz bulunmuyor.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
