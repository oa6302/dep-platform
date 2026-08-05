
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth, useFirestore } from '@/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, Lock, User, UserCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AuthFormProps {
  mode: 'login' | 'register';
}

const errorMessageMap: Record<string, string> = {
  'auth/email-already-in-use': 'Bu e-posta adresi zaten kullanımda. Lütfen giriş yapmayı deneyin.',
  'auth/invalid-email': 'Geçersiz bir e-posta adresi girdiniz.',
  'auth/weak-password': 'Şifreniz çok zayıf. En az 6 karakter kullanın.',
  'auth/user-not-found': 'Kullanıcı bulunamadı veya bilgiler hatalı.',
  'auth/wrong-password': 'Kullanıcı bulunamadı veya bilgiler hatalı.',
  'auth/invalid-credential': 'Giriş bilgileri doğrulanamadı.',
  'auth/too-many-requests': 'Çok fazla deneme yapıldı. Lütfen daha sonra tekrar deneyin.',
};

export function AuthForm({ mode }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<'student' | 'teacher' | 'admin'>('student');
  const [loading, setLoading] = useState(false);
  
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !db) return;

    setLoading(true);
    try {
      if (mode === 'register') {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await updateProfile(user, { displayName });

        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email,
          displayName,
          role,
          createdAt: serverTimestamp(),
        });

        toast({ title: 'Kayıt Başarılı', description: 'Hesabınız başarıyla oluşturuldu.' });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        toast({ title: 'Giriş Başarılı', description: 'Hoş geldiniz!' });
      }
      router.push('/dashboard');
    } catch (error: any) {
      const errorCode = error.code;
      const description = errorMessageMap[errorCode] || 'Bir hata oluştu. Lütfen tekrar deneyin.';
      
      toast({
        variant: 'destructive',
        title: 'İşlem Başarısız',
        description: description,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {mode === 'register' && (
        <>
          <div className="space-y-2">
            <Label htmlFor="name">Ad Soyad</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="name"
                placeholder="Adınız Soyadınız"
                className="pl-10"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Hesap Türü</Label>
            <Select value={role} onValueChange={(v: any) => setRole(v)}>
              <SelectTrigger className="w-full pl-10">
                <div className="flex items-center gap-2">
                  <UserCircle className="h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="Rol Seçin" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="student">Öğrenci</SelectItem>
                <SelectItem value="teacher">Öğretmen (Koç)</SelectItem>
                <SelectItem value="admin">Yönetici</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </>
      )}
      <div className="space-y-2">
        <Label htmlFor="email">E-posta</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            placeholder="ornek@eposta.com"
            className="pl-10"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Şifre</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            className="pl-10"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            İşleniyor...
          </>
        ) : (
          mode === 'login' ? 'Giriş Yap' : 'Kayıt Ol'
        )}
      </Button>
    </form>
  );
}
