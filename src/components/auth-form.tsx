
'use client';

import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth, useFirestore, useCollection } from '@/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp, getDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, Lock, User, School, Hash, Target, Sparkles, UserRound, Building, CheckCircle2, QrCode, Star, History, ChevronRight, Grid3X3 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';

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
  const [role, setRole] = useState<'student' | 'teacher' | 'school_admin'>('student');
  const [targetExam, setTargetExam] = useState<string>('');
  const [schoolName, setSchoolName] = useState('');
  const [teacherCode, setTeacherCode] = useState('');
  const [studentMode, setStudentMode] = useState<'individual' | 'connected'>('individual');
  const [loading, setLoading] = useState(false);
  
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const { data: dbPrograms, loading: programsLoading } = useCollection<any>('programs', orderBy('title', 'asc'));

  const categories = ['ORTAOKUL', 'ÜNİVERSİTE', 'KAMU', 'ÜNİVERSİTE GEÇİŞ', 'DİL', 'DİNÎ', 'AKADEMİK', 'ÖZEL'] as const;

  const categorizedExams = useMemo(() => {
    const grouped: Record<string, any[]> = {};
    dbPrograms.forEach(exam => {
      const cat = exam.category || 'ÖZEL';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(exam);
    });
    return grouped;
  }, [dbPrograms]);

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

      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        const userData: any = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          role: role,
          createdAt: serverTimestamp(),
        };

        if (role === 'teacher') userData.activationCode = generateTeacherCode();

        await setDoc(userDocRef, userData);
        toast({ title: 'Hoş Geldiniz', description: `Hesabınız ${role === 'teacher' ? 'Öğretmen' : 'Öğrenci'} olarak oluşturuldu.` });
        
        if (role === 'student' && !targetExam) {
          router.push('/dashboard/select-exam');
        } else {
          router.push('/dashboard');
        }
      } else {
        toast({ title: 'Giriş Başarılı', description: 'Hoş geldiniz!' });
        router.push('/dashboard');
      }
    } catch (error: any) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Giriş Başarısız', description: 'Google ile giriş yapılamadı.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !db) return;

    if (mode === 'register' && role === 'student' && !targetExam) {
      toast({ variant: 'destructive', title: 'Hata', description: 'Lütfen bir hedef program seçin.' });
      return;
    }

    setLoading(true);
    try {
      if (mode === 'register') {
        let coachId = '';
        if (role === 'student' && studentMode === 'connected' && teacherCode) {
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
          createdAt: serverTimestamp(),
        };

        if (role === 'teacher') {
          userData.activationCode = generateTeacherCode();
          userData.school = schoolName;
          userData.branch = 'Genel';
        } else if (role === 'student') {
          userData.targetExam = targetExam;
          if (coachId) userData.coachId = coachId;
        } else if (role === 'school_admin') {
          userData.school = schoolName;
        }

        await Promise.all([
          updateProfile(user, { displayName }),
          setDoc(doc(db, 'users', user.uid), userData)
        ]);

        toast({ title: 'Kayıt Başarılı', description: role === 'teacher' ? `Öğretmen hesabınız oluşturuldu. Kodunuz: ${userData.activationCode}` : `Sistem yapılandırıldı.` });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        toast({ title: 'Giriş Başarılı', description: 'Hoş geldiniz!' });
      }
      router.push('/dashboard');
    } catch (error: any) {
      const description = errorMessageMap[error.code] || 'Bir hata oluştu.';
      toast({ variant: 'destructive', title: 'İşlem Başarısız', description });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {mode === 'register' && (
        <div className="space-y-3">
          <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 italic">Sistemi Nasıl Kullanacaksınız?</Label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'student', label: 'Öğrenci', icon: User },
              { id: 'teacher', label: 'Öğretmen', icon: UserRound },
              { id: 'school_admin', label: 'Okul', icon: Building },
            ].map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setRole(r.id as any)}
                className={cn(
                  "flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all gap-2 group",
                  role === r.id ? "border-accent bg-accent/5 text-primary" : "border-primary/5 bg-white text-muted-foreground hover:border-primary/20"
                )}
              >
                <r.icon className={cn("h-6 w-6 transition-transform group-hover:scale-110", role === r.id ? "text-accent" : "text-muted-foreground")} />
                <span className="text-[10px] font-black uppercase tracking-tighter italic">{r.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {mode === 'register' && (
          <>
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs font-black uppercase tracking-widest opacity-60">
                {role === 'school_admin' ? 'Okul / Kurum Adı' : 'Ad Soyad'}
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  placeholder={role === 'school_admin' ? 'Örn: Atatürk Koleji' : 'Adınız Soyadınız'}
                  className="pl-10 rounded-xl h-12 bg-[#F8FAFC] border-none shadow-inner font-bold"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                />
              </div>
            </div>

            {role === 'student' && (
              <div className="space-y-8 animate-in slide-in-from-top duration-500">
                <div className="space-y-3">
                   <Label className="text-xs font-black uppercase tracking-widest opacity-60 italic">Kullanım Modu</Label>
                   <RadioGroup value={studentMode} onValueChange={(v: any) => setStudentMode(v)} className="grid grid-cols-2 gap-4">
                      <div className={cn(
                        "flex items-center space-x-2 rounded-xl p-4 border-2 transition-all cursor-pointer shadow-sm",
                        studentMode === 'individual' ? "border-primary bg-primary text-white" : "border-primary/5 bg-white"
                      )} onClick={() => setStudentMode('individual')}>
                        <RadioGroupItem value="individual" id="individual" className="hidden" />
                        <CheckCircle2 className={cn("h-5 w-5", studentMode === 'individual' ? "text-accent" : "text-muted-foreground")} />
                        <Label htmlFor="individual" className="font-black text-[10px] uppercase tracking-widest cursor-pointer">Bireysel Devam Et</Label>
                      </div>
                      <div className={cn(
                        "flex items-center space-x-2 rounded-xl p-4 border-2 transition-all cursor-pointer shadow-sm",
                        studentMode === 'connected' ? "border-accent bg-accent text-white" : "border-primary/5 bg-white"
                      )} onClick={() => setStudentMode('connected')}>
                        <RadioGroupItem value="connected" id="connected" className="hidden" />
                        <UserRound className={cn("h-5 w-5", studentMode === 'connected' ? "text-white" : "text-muted-foreground")} />
                        <Label htmlFor="connected" className="font-black text-[10px] uppercase tracking-widest cursor-pointer">Öğretmene Bağlan</Label>
                      </div>
                   </RadioGroup>
                </div>

                {studentMode === 'connected' && (
                  <div className="space-y-2 animate-in slide-in-from-right">
                    <Label htmlFor="teacherCode" className="text-xs font-black uppercase tracking-widest text-accent flex items-center gap-2">
                       <QrCode className="h-3 w-3" /> ÖĞRETMEN AKTİVASYON KODU
                    </Label>
                    <div className="relative">
                      <Hash className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="teacherCode"
                        placeholder="DK-XXXX-XXXX"
                        className="pl-10 rounded-xl h-12 bg-white border-2 border-accent/20 shadow-lg font-black text-primary"
                        value={teacherCode}
                        onChange={(e) => setTeacherCode(e.target.value)}
                        required={studentMode === 'connected'}
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <Label className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2 italic">
                     <Target className="h-4 w-4 text-accent" /> HEDEF PROGRAMINIZI SEÇİN
                  </Label>
                  
                  <div className="bg-slate-50 p-4 rounded-[2rem] border-2 border-primary/5 shadow-inner">
                    <ScrollArea className="h-[450px] pr-4">
                       {programsLoading ? (
                         <div className="py-20 text-center opacity-30 animate-pulse font-black uppercase tracking-widest text-xs italic">Müfredat Motoru Hazırlanıyor...</div>
                       ) : (
                         <div className="space-y-10">
                            {categories.map((category) => (
                              categorizedExams[category] && (
                                <div key={category} className="space-y-4">
                                   <div className="flex items-center gap-3">
                                      <div className="h-1 w-8 bg-accent rounded-full"></div>
                                      <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/40">{category}</h3>
                                   </div>
                                   <div className="grid grid-cols-1 gap-3">
                                      {categorizedExams[category]?.map((exam) => (
                                        <button
                                          key={exam.id}
                                          type="button"
                                          onClick={() => setTargetExam(exam.id)}
                                          className={cn(
                                            "flex items-center justify-between p-5 rounded-2xl border-2 transition-all group text-left",
                                            targetExam === exam.id 
                                              ? "border-accent bg-white shadow-xl shadow-accent/5 ring-4 ring-accent/5" 
                                              : "border-white bg-white/50 hover:border-primary/10 hover:bg-white"
                                          )}
                                        >
                                           <div className="flex items-center gap-5">
                                              <div className={cn(
                                                "h-12 w-12 rounded-xl flex items-center justify-center transition-all",
                                                targetExam === exam.id ? "bg-accent text-white" : "bg-primary/5 text-primary"
                                              )}>
                                                 <Grid3X3 className="h-6 w-6" />
                                              </div>
                                              <div>
                                                 <p className={cn("font-black text-sm uppercase tracking-tight", targetExam === exam.id ? "text-primary" : "text-primary/70")}>{exam.title}</p>
                                                 <p className="text-[9px] font-bold opacity-40 uppercase tracking-widest">{exam.targetGroup || 'Aktif Müfredat'}</p>
                                              </div>
                                           </div>
                                           {targetExam === exam.id ? (
                                              <CheckCircle2 className="h-5 w-5 text-accent animate-in zoom-in duration-300" />
                                           ) : (
                                              <ChevronRight className="h-4 w-4 text-muted-foreground opacity-20 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                           )}
                                        </button>
                                      ))}
                                   </div>
                                </div>
                              )
                            ))}
                         </div>
                       )}
                    </ScrollArea>
                  </div>
                </div>
              </div>
            )}

            {(role === 'teacher' || role === 'school_admin') && (
              <div className="space-y-2 animate-in fade-in">
                <Label htmlFor="school" className="text-xs font-black uppercase tracking-widest opacity-60">Kurum / Okul Adı</Label>
                <div className="relative">
                  <Building className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="school"
                    placeholder="Görev yaptığınız okul"
                    className="pl-10 rounded-xl h-12 bg-[#F8FAFC] border-none shadow-inner font-bold"
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}
          </>
        )}

        <div className="space-y-2">
          <Label htmlFor="email" className="text-xs font-black uppercase tracking-widest opacity-60">E-posta</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
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
            <Lock className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
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

        <Button type="submit" className="w-full h-16 rounded-2xl bg-primary hover:bg-accent transition-all font-black text-xs uppercase tracking-widest shadow-2xl shadow-primary/20 gap-3 mt-6" disabled={loading}>
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
            <>
              {mode === 'login' ? 'Giriş Yap' : 'Hesabımı Yapılandır'}
              <Sparkles className="h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <Separator />
        </div>
        <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest italic">
          <span className="bg-white px-4 text-muted-foreground">Veya Kurumsal Giriş</span>
        </div>
      </div>

      <Button variant="outline" type="button" className="w-full h-14 rounded-2xl border-2 font-black text-xs uppercase tracking-widest transition-all hover:bg-[#F8FAFC] gap-3 shadow-sm" onClick={handleGoogleSignIn} disabled={loading}>
        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
          <div className="flex items-center gap-3">
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            {role === 'teacher' ? 'Öğretmen Olarak Google ile Gir' : role === 'school_admin' ? 'Okul Olarak Google ile Gir' : 'Öğrenci Olarak Google ile Gir'}
          </div>
        )}
      </Button>
    </div>
  );
}
