
'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useUser, useFirestore } from '@/firebase';
import { BookOpen, Calendar, CheckSquare, GraduationCap, Users, Database, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { doc, setDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

export default function HomePage() {
  const { user, loading } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [seeding, setSeeding] = useState(false);

  const handleSeedData = async () => {
    if (!db) return;
    setSeeding(true);
    try {
      // Create a sample admin
      const sampleAdminId = 'sample-admin-999';
      await setDoc(doc(db, 'users', sampleAdminId), {
        uid: sampleAdminId,
        displayName: 'Sistem Yöneticisi',
        email: 'admin@kocumyanimda.com',
        role: 'admin',
        createdAt: serverTimestamp(),
      });

      // Create a sample teacher
      const sampleTeacherId = 'sample-teacher-111';
      await setDoc(doc(db, 'users', sampleTeacherId), {
        uid: sampleTeacherId,
        displayName: 'Ahmet Koç',
        email: 'ahmet@test.com',
        role: 'teacher',
        createdAt: serverTimestamp(),
      });

      // Create a sample student
      const sampleStudentId = 'sample-student-222';
      await setDoc(doc(db, 'users', sampleStudentId), {
        uid: sampleStudentId,
        displayName: 'Mehmet Öğrenci',
        email: 'mehmet@test.com',
        role: 'student',
        coachId: sampleTeacherId,
        createdAt: serverTimestamp(),
      });

      // Create a sample task
      await addDoc(collection(db, 'tasks'), {
        studentId: sampleStudentId,
        teacherId: sampleTeacherId,
        title: 'Matematik Ödevi #1',
        description: 'Logaritma konusundaki testleri bitir.',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        status: 'pending',
        createdAt: serverTimestamp(),
      });

      // Create a sample session
      await addDoc(collection(db, 'sessions'), {
        studentId: sampleStudentId,
        teacherId: sampleTeacherId,
        scheduledAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        status: 'scheduled',
        notes: 'Haftalık gelişim değerlendirmesi',
        createdAt: serverTimestamp(),
      });

      toast({
        title: 'Veritabanı Başlatıldı',
        description: 'Firestore koleksiyonları (users, tasks, sessions) ve örnek veriler başarıyla oluşturuldu.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Hata',
        description: 'Veriler oluşturulurken bir sorun çıktı: ' + error.message,
      });
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="border-b bg-card shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-2xl text-primary">
            <GraduationCap className="h-8 w-8" />
            <span>Koçum Yanımda</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm font-medium hover:text-primary transition-colors">Özellikler</Link>
            <Link href="#about" className="text-sm font-medium hover:text-primary transition-colors">Hakkımızda</Link>
          </nav>
          <div className="flex items-center gap-2">
            {!loading && (
              user ? (
                <Button asChild>
                  <Link href="/dashboard">Panelim</Link>
                </Button>
              ) : (
                <>
                  <Button variant="ghost" asChild>
                    <Link href="/login">Giriş Yap</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/login?tab=register">Kayıt Ol</Link>
                  </Button>
                </>
              )
            )}
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-b from-primary/10 to-background">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
              Geleceğinize Bir Adım Daha <span className="text-primary">Yaklaşın</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Kişiselleştirilmiş öğrenci koçluğu ile akademik başarınızı artırın, hedeflerinizi birlikte planlayalım.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="px-8" asChild>
                <Link href="/login?tab=register">Hemen Başla</Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="px-8 border-primary text-primary hover:bg-primary/5"
                onClick={handleSeedData}
                disabled={seeding}
              >
                {seeding ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Database className="mr-2 h-5 w-5" />}
                Veritabanını Örnek Verilerle Doldur
              </Button>
            </div>
            <p className="mt-4 text-xs text-muted-foreground italic">
              * Bu buton Firestore koleksiyonlarını (users, tasks, sessions) anında oluşturur ve Firebase panelinde görmenizi sağlar.
            </p>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Neden Biz?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-6 bg-card rounded-xl border shadow-sm hover:shadow-md transition-shadow">
                <Calendar className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Birebir Görüşmeler</h3>
                <p className="text-muted-foreground">Koçunuzla düzenli aralıklarla görüntülü veya yüz yüze görüşmeler yapın.</p>
              </div>
              <div className="p-6 bg-card rounded-xl border shadow-sm hover:shadow-md transition-shadow">
                <CheckSquare className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Hedef Takibi</h3>
                <p className="text-muted-foreground">Haftalık ve aylık hedeflerinizi belirleyin, ilerlemenizi grafiklerle izleyin.</p>
              </div>
              <div className="p-6 bg-card rounded-xl border shadow-sm hover:shadow-md transition-shadow">
                <Users className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Uzman Kadro</h3>
                <p className="text-muted-foreground">Alanında uzman öğretmenler ve eğitim danışmanları ile çalışın.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-12 bg-card">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">&copy; 2024 Koçum Yanımda Öğrenci Koçluğu Platformu. Tüm hakları saklıdır.</p>
        </div>
      </footer>
    </div>
  );
}
