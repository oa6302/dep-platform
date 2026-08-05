
'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useUser } from '@/firebase';
import { BookOpen, Calendar, CheckSquare, GraduationCap, Users } from 'lucide-react';

export default function HomePage() {
  const { user, loading } = useUser();

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
              <Button size="lg" variant="outline" className="px-8" asChild>
                <Link href="#features">Daha Fazla Bilgi</Link>
              </Button>
            </div>
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

        {/* Roles Section */}
        <section className="py-20 bg-muted/50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Platform Rollerimiz</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col items-center p-8 bg-card rounded-2xl shadow-sm text-center">
                <GraduationCap className="h-16 w-16 mb-4 text-primary" />
                <h3 className="text-2xl font-bold mb-2">Öğrenci</h3>
                <p className="text-sm text-muted-foreground mb-4">Gelişiminizi takip edin, ödevlerinizi yapın ve koçunuzla iletişimde kalın.</p>
              </div>
              <div className="flex flex-col items-center p-8 bg-card rounded-2xl shadow-sm text-center border-2 border-primary">
                <Users className="h-16 w-16 mb-4 text-primary" />
                <h3 className="text-2xl font-bold mb-2">Öğretmen (Koç)</h3>
                <p className="text-sm text-muted-foreground mb-4">Öğrencilerinizi yönetin, onlara özel programlar hazırlayın ve raporlar sunun.</p>
              </div>
              <div className="flex flex-col items-center p-8 bg-card rounded-2xl shadow-sm text-center">
                <BookOpen className="h-16 w-16 mb-4 text-primary" />
                <h3 className="text-2xl font-bold mb-2">Yönetici</h3>
                <p className="text-sm text-muted-foreground mb-4">Tüm sistemi, koçları ve öğrencileri merkezi bir panelden denetleyin.</p>
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
