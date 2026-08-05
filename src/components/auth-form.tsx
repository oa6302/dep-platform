'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth, useFirestore } from '@/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, Lock, User, School, Hash, Target, Sparkles } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { EXAM_CONFIGS } from '@/lib/exam-configs';

interface AuthFormProps {
  mode: 'login' | 'register';
}

const errorMessageMap: Record<string, string> = {
  'auth/email-already-in-use': 'Bu e-posta adresi zaten kullanımda.',
  'auth/invalid-email': 'Geçersiz bir e-posta adresi girdiniz.',
  'auth/weak-password': 'Şifreniz çok zayıf. En az 6 karakter kullanın.',
  'auth/user-not-found': 'Bilgiler hatalı.',
  'auth/wrong-password': 'Bilgiler hatalı.',
  'auth/invalid-credential': 'Giriş bilgileri doğrulanamadı.',
};

export function AuthForm({ mode }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [targetExam, setTargetExam] = useState<string>('');
  const [school, setSchool] = useState('');
  const [teacherCode, setTeacherCode] = useState('');
  const [loading, setLoading] = useState(false);
  
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const generateTeacherCode = () => {
    return 'DK-' + Math.random().toString(36).substring(2, 6).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
  };

  const handleGoogleSignIn = async () => {
    if (!auth || !db) return;
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          role: 'student', 
          createdAt: serverTimestamp(),
        });
        // Eğer Google ile ilk kez kayıt oluyorsa hedef seçimine yönlendir
        toast({ title: 'Hoş Geldiniz', description: 'Lütfen hedefinizi belirleyin.' });
        router.push('/dashboard/select-exam');
      } else {
        toast({ title: 'Giriş Başarılı', description: 'Hoş geldiniz!' });
        router.push('/dashboard');
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Giriş Başarısız',
        description: 'Google ile giriş yapılamadı.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !db) return;

    if (mode === 'register' && role === 'student' && !targetExam) {
      toast({ variant: 'destructive', title: 'Hata', description: 'Lütfen bir hedef sınav seçin.' });
      return;
    }

    setLoading(true);
    try {
      if (mode === 'register') {
        let coachId = '';
        if (role === 'student' && teacherCode) {
          const q = query(collection(db, 'users'), where('activationCode', '==', teacherCode), where('role', '==', 'teacher'));
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            coachId = querySnapshot.docs[0].id;
          } else {
            toast({ variant: 'destructive', title: 'Hata', description: 'Geçersiz öğretmen kodu.' });
            setLoading(false);
            return;
          }
        }

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        const userData: any = {
          uid: user.uid,
          email,
          displayName,
          role,
          school,
          createdAt: serverTimestamp(),
        };

        if (role === 'teacher') {
          userData.activationCode = generateTeacherCode();
        } else if (role === 'student') {
          userData.targetExam = targetExam;
          if (coachId) userData.coachId = coachId;
        }

        await Promise.all([
          updateProfile(user, { displayName }),
          setDoc(doc(db, 'users', user.uid), userData)
        ]);

        toast({ title: 'Kayıt Başarılı', description: role === 'teacher' ? 'Hesabınız oluşturuldu.' : `Hoş geldin! Sistem ${targetExam} moduna göre yapılandırıldı.` });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        toast({ title: 'Giriş Başarılı', description: 'Hoş geldiniz!' });
      }
      router.push('/dashboard');
    } catch (error: any) {
      const description = errorMessageMap[error.code] || 'Bir hata oluştu.';
      toast({
        variant: 'destructive',
        title: 'İşlem Başarısız',
        description,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'register' && (
          <>
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs font-black uppercase tracking-widest opacity-60">Ad Soyad</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  placeholder="Adınız Soyadınız"
                  className="pl-10 rounded-xl h-12 bg-[#F8FAFC] border-none shadow-inner font-bold"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role" className="text-xs font-black uppercase tracking-widest opacity-60">Hesap Türü</Label>
                <Select value={role} onValueChange={(v: any) => setRole(v)}>
                  <SelectTrigger className="w-full rounded-xl h-12 bg-[#F8FAFC] border-none shadow-inner font-bold">
                    <SelectValue placeholder="Rol Seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student" className="font-bold">Öğrenci</SelectItem>
                    <SelectItem value="teacher" className="font-bold">Öğretmen</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="school" className="text-xs font-black uppercase tracking-widest opacity-60">Okul</Label>
                <div className="relative">
                  <School className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="school"
                    placeholder="Okul Adı"
                    className="pl-10 rounded-xl h-12 bg-[#F8FAFC] border-none shadow-inner font-bold"
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {role === 'student' && (
              <div className="space-y-4 animate-in slide-in-from-top duration-500">
                <div className="space-y-2">
                  <Label htmlFor="targetExam" className="text-xs font-black uppercase tracking-widest text-accent">🎯 Hedef Sınavın</Label>
                  <div className="relative">
                    <Target className="absolute left-3 top-3 h-4 w-4 text-accent" />
                    <Select value={targetExam} onValueChange={setTargetExam}>
                      <SelectTrigger className="w-full pl-10 rounded-xl h-12 bg-[#F8FAFC] border-2 border-accent/20 shadow-inner font-bold text-primary">
                        <SelectValue placeholder="Sınavını Seç" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(EXAM_CONFIGS).map((exam) => (
                          <SelectItem key={exam.id} value={exam.id} className="font-bold">
                            {exam.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground italic px-1">Seçtiğin sınava göre tüm sistemin (dersler, AI asistan) otomatik değişecek.</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="teacherCode" className="text-xs font-black uppercase tracking-widest opacity-60">Öğretmen Kodu (Opsiyonel)</Label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="teacherCode"
                      placeholder="DK-XXXX-XXXX"
                      className="pl-10 rounded-xl h-12 bg-[#F8FAFC] border-none shadow-inner font-bold"
                      value={teacherCode}
                      onChange={(e) => setTeacherCode(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-xs font-black uppercase tracking-widest opacity-60">E-posta</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="ornek@eposta.com"
              className="pl-10 rounded-xl h-12 bg-[#F8FAFC] border-none shadow-inner font-bold"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="password" className="text-xs font-black uppercase tracking-widest opacity-60">Şifre</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              className="pl-10 rounded-xl h-12 bg-[#F8FAFC] border-none shadow-inner font-bold"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </div>
        <Button type="submit" className="w-full h-14 rounded-2xl bg-accent hover:bg-primary transition-all font-black text-xs uppercase tracking-widest shadow-xl shadow-accent/20 gap-3" disabled={loading}>
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
            <>
              {mode === 'login' ? 'Giriş Yap' : 'Hemen Başla'}
              <Sparkles className="h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator />
        </div>
        <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest">
          <span className="bg-white px-4 text-muted-foreground">Veya</span>
        </div>
      </div>

      <Button variant="outline" type="button" className="w-full h-14 rounded-2xl border-2 font-black text-xs uppercase tracking-widest transition-all hover:bg-[#F8FAFC] gap-3" onClick={handleGoogleSignIn} disabled={loading}>
        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
          <div className="flex items-center gap-3">
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Google ile Giriş Yap
          </div>
        )}
      </Button>
    </div>
  );
}