'use client';

import { useCollection } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Settings, Database, ShieldCheck, Activity } from 'lucide-react';
import { orderBy, limit } from 'firebase/firestore';

interface AdminViewProps {
  user: any;
  userData: any;
}

export function AdminView({ user, userData }: AdminViewProps) {
  const { data: allUsers } = useCollection<any>('users', orderBy('createdAt', 'desc'));
  const { data: recentSessions } = useCollection<any>('sessions', orderBy('scheduledAt', 'desc'), limit(10));

  const teacherCount = allUsers.filter(u => u.role === 'teacher').length;
  const studentCount = allUsers.filter(u => u.role === 'student').length;

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto w-full">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Toplam Kullanıcı</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{allUsers.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Öğretmenler</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{teacherCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Öğrenciler</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{studentCount}</p>
          </CardContent>
        </Card>
        <Card className="bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-primary">Sistem Durumu</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-primary font-bold">
              <Activity className="h-4 w-4" />
              Aktif
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="xl:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Son Kayıtlar</CardTitle>
              <CardDescription>Platforma yeni katılan kullanıcılar</CardDescription>
            </div>
            <Button size="sm" variant="ghost">Hepsini İndir</Button>
          </CardHeader>
          <CardContent>
            <div className="relative overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                  <tr>
                    <th className="px-4 py-3">Ad Soyad</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Rol</th>
                    <th className="px-4 py-3">Kayıt Tarihi</th>
                  </tr>
                </thead>
                <tbody>
                  {allUsers.slice(0, 10).map((u) => (
                    <tr key={u.id} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-medium">{u.displayName}</td>
                      <td className="px-4 py-3">{u.email}</td>
                      <td className="px-4 py-3 capitalize">{u.role}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {u.createdAt?.toDate ? u.createdAt.toDate().toLocaleDateString('tr-TR') : 'Bilinmiyor'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sistem Yönetimi</CardTitle>
              <CardDescription>Hızlı erişim araçları</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2">
              <Button variant="outline" className="w-full justify-start">
                <ShieldCheck className="mr-2 h-4 w-4" /> Roller ve Yetkiler
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Database className="mr-2 h-4 w-4" /> Veritabanı Bakımı
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Settings className="mr-2 h-4 w-4" /> Genel Ayarlar
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Aktif Oturumlar</CardTitle>
              <CardDescription>Gerçek zamanlı koçluk seansları</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold flex items-center gap-2">
                <Users className="h-5 w-5 text-muted-foreground" />
                {recentSessions.filter(s => s.status === 'scheduled').length} Seans
              </div>
              <p className="text-xs text-muted-foreground mt-2">Son 24 saat içinde planlananlar</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
