
'use client';

import { useCollection, useFirestore } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Settings, Database, ShieldCheck, Activity, PlusCircle, Loader2 } from 'lucide-react';
import { orderBy, limit, doc, setDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface AdminViewProps {
  user: any;
  userData: any;
}

export function AdminView({ user, userData }: AdminViewProps) {
  const db = useFirestore();
  const { toast } = useToast();
  const [seeding, setSeeding] = useState(false);
  
  const { data: allUsers, loading: usersLoading } = useCollection<any>('users', orderBy('createdAt', 'desc'));
  const { data: recentSessions } = useCollection<any>('sessions', orderBy('scheduledAt', 'desc'), limit(10));

  const teacherCount = allUsers.filter(u => u.role === 'teacher').length;
  const studentCount = allUsers.filter(u => u.role === 'student').length;

  const handleSeedData = async () => {
    if (!db) return;
    setSeeding(true);
    try {
      // Create a sample student if none exists
      const sampleStudentId = 'sample-student-123';
      await setDoc(doc(db, 'users', sampleStudentId), {
        uid: sampleStudentId,
        displayName: 'Örnek Öğrenci (Test)',
        email: 'ogrenci@test.com',
        role: 'student',
        coachId: user.uid,
        createdAt: serverTimestamp(),
      });

      // Create a sample task
      await addDoc(collection(db, 'tasks'), {
        studentId: sampleStudentId,
        teacherId: user.uid,
        title: 'Platforma Hoş Geldin!',
        description: 'Bu otomatik oluşturulmuş bir test görevidir.',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        status: 'pending',
        createdAt: serverTimestamp(),
      });

      toast({
        title: 'Sistem Başlatıldı',
        description: 'Örnek koleksiyonlar ve veriler başarıyla oluşturuldu.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Hata',
        description: 'Veriler oluşturulurken bir sorun çıktı.',
      });
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Sistem Genel Bakış</h2>
          <p className="text-muted-foreground">Platformun genel durumunu ve kullanıcıları buradan yönetebilirsiniz.</p>
        </div>
        {allUsers.length === 0 && !usersLoading && (
          <Button onClick={handleSeedData} disabled={seeding} className="shadow-lg">
            {seeding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
            İlk Koleksiyonları ve Verileri Oluştur
          </Button>
        )}
      </div>

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
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-primary">Sistem Durumu</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-primary font-bold text-sm">
              <Activity className="h-4 w-4 animate-pulse" />
              Sistem Aktif
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
          </CardHeader>
          <CardContent>
            {allUsers.length > 0 ? (
              <div className="relative overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Ad Soyad</th>
                      <th className="px-4 py-3 font-semibold">Email</th>
                      <th className="px-4 py-3 font-semibold">Rol</th>
                      <th className="px-4 py-3 font-semibold">Tarih</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allUsers.slice(0, 10).map((u) => (
                      <tr key={u.id} className="border-b hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-medium">{u.displayName}</td>
                        <td className="px-4 py-3">{u.email}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            u.role === 'teacher' ? 'bg-blue-100 text-blue-700' : 
                            u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {u.role === 'teacher' ? 'Koç' : u.role === 'admin' ? 'Yönetici' : 'Öğrenci'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {u.createdAt?.toDate ? u.createdAt.toDate().toLocaleDateString('tr-TR') : 'Yeni'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 text-center border-2 border-dashed rounded-lg">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                <p className="text-muted-foreground">Henüz kayıtlı kullanıcı bulunmuyor.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Hızlı Araçlar</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2">
              <Button variant="outline" className="w-full justify-start text-sm">
                <ShieldCheck className="mr-2 h-4 w-4" /> Roller ve Yetkiler
              </Button>
              <Button variant="outline" className="w-full justify-start text-sm">
                <Database className="mr-2 h-4 w-4" /> Veritabanı Temizliği
              </Button>
              <Button variant="outline" className="w-full justify-start text-sm" onClick={handleSeedData} disabled={seeding}>
                <Database className="mr-2 h-4 w-4" /> Örnek Veri Ekle
              </Button>
              <Button variant="outline" className="w-full justify-start text-sm">
                <Settings className="mr-2 h-4 w-4" /> Sistem Ayarları
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Canlı Seanslar</CardTitle>
              <CardDescription>Şu an planlanan görüşmeler</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold flex items-center gap-2">
                <Users className="h-6 w-6 text-primary" />
                {recentSessions.filter(s => s.status === 'scheduled').length}
              </div>
              <p className="text-xs text-muted-foreground mt-2">Aktif planlanmış koçluk seansı sayısı.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
