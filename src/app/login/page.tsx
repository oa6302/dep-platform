
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AuthForm } from '@/components/auth-form';
import { GraduationCap } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tab = searchParams.get('tab') || 'login';
  const [activeTab, setActiveTab] = useState(tab);

  useEffect(() => {
    setActiveTab(tab);
  }, [tab]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center gap-2 mb-4">
          <Link href="/" className="flex items-center gap-2 font-bold text-3xl text-primary">
            <GraduationCap className="h-10 w-10" />
            <span>Koçum Yanımda</span>
          </Link>
          <p className="text-muted-foreground">Öğrenci Koçluğu Platformuna Hoş Geldiniz</p>
        </div>

        <Card className="border-t-4 border-t-primary shadow-xl">
          <CardHeader>
            <CardTitle>{activeTab === 'login' ? 'Giriş Yap' : 'Kayıt Ol'}</CardTitle>
            <CardDescription>
              {activeTab === 'login' 
                ? 'Hesabınıza erişmek için bilgilerinizi girin.' 
                : 'Yeni bir hesap oluşturun ve koçluk almaya başlayın.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Giriş</TabsTrigger>
                <TabsTrigger value="register">Kayıt</TabsTrigger>
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
      </div>
    </div>
  );
}
