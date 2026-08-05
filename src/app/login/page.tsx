
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AuthForm } from '@/components/auth-form';
import Image from 'next/image';
import Link from 'next/link';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function LoginPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tab = searchParams.get('tab') || 'login';
  const [activeTab, setActiveTab] = useState(tab);

  const logoUrl = PlaceHolderImages.find(img => img.id === 'app-logo')?.imageUrl || "https://picsum.photos/seed/edu-logo-99/400/400";

  useEffect(() => {
    setActiveTab(tab);
  }, [tab]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] px-4 py-12 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-accent/5 blur-[100px] rounded-full"></div>
      <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-primary/5 blur-[100px] rounded-full"></div>

      <div className="w-full max-w-md space-y-8 relative z-10">
        <div className="flex flex-col items-center gap-6 mb-8">
          <Link href="/" className="flex flex-col items-center gap-4 group">
            <div className="relative h-24 w-24 overflow-hidden rounded-[2rem] shadow-2xl transition-all group-hover:scale-105 bg-white p-1 border-[6px] border-primary/5">
              <Image 
                src={logoUrl} 
                alt="Dijital Eğitim Koçu Logo" 
                fill 
                className="object-contain"
                data-ai-hint="education logo blue gold"
              />
            </div>
            <div className="text-center">
              <span className="font-black text-4xl text-primary tracking-tighter block leading-none italic">Dijital Eğitim Koçu</span>
              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.3em] mt-2 opacity-60">Geleceğin Eğitim Platformu</p>
            </div>
          </Link>
        </div>

        <Card className="border-none shadow-[0_40px_80px_-20px_rgba(15,23,42,0.15)] rounded-[3rem] overflow-hidden bg-white/80 backdrop-blur-xl">
          <CardHeader className="bg-primary p-10 text-white text-center space-y-3">
            <CardTitle className="text-3xl font-black tracking-tight italic">
              {activeTab === 'login' ? 'Tekrar Hoş Geldin!' : 'Yeni Bir Başlangıç'}
            </CardTitle>
            <CardDescription className="text-white/60 font-bold text-sm uppercase tracking-widest">
              {activeTab === 'login' 
                ? 'Hesabınıza erişmek için bilgilerinizi girin.' 
                : 'Yeni bir hesap oluşturun ve koçluk almaya başlayın.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-10">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-10 bg-[#F1F5F9] p-1.5 rounded-2xl">
                <TabsTrigger value="login" className="rounded-xl font-black py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-lg text-xs uppercase tracking-widest">Giriş Yap</TabsTrigger>
                <TabsTrigger value="register" className="rounded-xl font-black py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-lg text-xs uppercase tracking-widest">Kayıt Ol</TabsTrigger>
              </TabsList>
              <TabsContent value="login">
                <AuthForm mode="login" />
              </TabsContent>
              <TabsContent value="register">
                <AuthForm mode="register" />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <p className="text-center text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-60">
          Giriş yaparak <Link href="#" className="underline hover:text-accent transition-colors">Kullanım Koşullarını</Link> kabul etmiş sayılırsınız.
        </p>
      </div>
    </div>
  );
}
