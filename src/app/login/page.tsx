
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
    <div className="min-h-screen flex items-center justify-center bg-muted/40 px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center gap-4 mb-4">
          <Link href="/" className="flex flex-col items-center gap-2 group">
            <div className="relative h-20 w-20 overflow-hidden rounded-2xl shadow-xl transition-transform group-hover:scale-105 bg-white p-1">
              <Image 
                src={logoUrl} 
                alt="Dijital Eğitim Koçu Logo" 
                fill 
                className="object-contain"
                data-ai-hint="education logo blue gold"
              />
            </div>
            <div className="text-center">
              <span className="font-black text-3xl text-primary tracking-tighter block">Dijital Eğitim Koçu</span>
              <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Öğrenci Koçluğu Platformu</p>
            </div>
          </Link>
        </div>

        <Card className="border-t-4 border-t-accent shadow-2xl rounded-[2rem] overflow-hidden">
          <CardHeader className="bg-white/50 backdrop-blur-sm border-b pb-8 pt-8">
            <CardTitle className="text-2xl font-black text-primary text-center">
              {activeTab === 'login' ? 'Tekrar Hoş Geldin!' : 'Yeni Bir Başlangıç'}
            </CardTitle>
            <CardDescription className="text-center font-medium mt-2">
              {activeTab === 'login' 
                ? 'Hesabınıza erişmek için bilgilerinizi girin.' 
                : 'Yeni bir hesap oluşturun ve koçluk almaya başlayın.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8 bg-muted/50 p-1 rounded-2xl">
                <TabsTrigger value="login" className="rounded-xl font-bold">Giriş Yap</TabsTrigger>
                <TabsTrigger value="register" className="rounded-xl font-bold">Kayıt Ol</TabsTrigger>
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

        <p className="text-center text-xs text-muted-foreground font-medium">
          Giriş yaparak <Link href="#" className="underline hover:text-accent">Kullanım Koşullarını</Link> kabul etmiş sayılırsınız.
        </p>
      </div>
    </div>
  );
}
