'use client';

import { useState, useMemo } from 'react';
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
import { 
  Loader2, Mail, Lock, User, School, Hash, 
  Sparkles, UserRound, Building, CheckCircle2, QrCode, 
  ChevronRight, Grid3X3, Brain, ArrowRight, ArrowLeft, Key
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { EXAM_CONFIGS } from '@/lib/exam-configs';

type Step = 'identity' | 'auth' | 'details' | 'goal' | 'finish';

export function AuthForm({ mode: initialMode }: { mode: 'login' | 'register' }) {
  const [step, setStep] = useState<Step>('identity');
  const [role, setRole] = useState<'student' | 'teacher' | 'school_admin'>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [targetExam, setTargetExam] = useState<string>('');
  const [schoolName, setSchoolName] = useState('');
  const [teacherCode, setTeacherCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const { data: dbPrograms } = useCollection<any>('programs', orderBy('title', 'asc'));

  const categorizedExams = useMemo(() => {
    const grouped: Record<string, any[]> = {};
    const categories = ['ORTAOKUL', 'ÜNİVERSİTE', 'MEB SINAVLARI', 'KAMU SINAVLARI', 'AKADEMİK', 'YABANCI DİL', 'ÜNİVERSİTE GEÇİŞ', 'DİNÎ EĞİTİM', 'AKADEMİK DESTEK', 'ÖZEL PROGRAMLAR'];
    
    categories.forEach(cat => grouped[cat] = []);

    dbPrograms.forEach(exam => {
      const cat = exam.category || 'ÖZEL PROGRAMLAR';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push({ ...exam, source: 'db' });
    });

    Object.values(EXAM_CONFIGS).forEach(exam => {
      const cat = exam.category;
      if (!grouped[cat]) grouped[cat] = [];
      if (!grouped[cat].find(e => e.id === exam.id)) {
        grouped[cat].push({ ...exam, source: 'config' });
      }
    });

    return grouped;
  }, [dbPrograms]);

  const handleNextStep = () => {
    if (step === 'identity') setStep('auth');
    else if (step === 'auth' && authMode === 'register') setStep('details');
    else if (step === 'details') {
      if (role === 'student') setStep('goal');
      else handleFinalize();
    }
    else if (step === 'goal') handleFinalize();
  };

  const handleBackStep = () => {
    if (step === 'auth') setStep('identity');
    else if (step === 'details') setStep('auth');
    else if (step === 'goal') setStep('details');
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
        setDisplayName(user.displayName || '');
        setEmail(user.email || '');
        setAuthMode('register');
        setStep('details');
      } else {
        router.push('/dashboard');
      }
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Hata', description: 'Google ile giriş yapılamadı.' });
    } finally {
      setLoading(false);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !db) return;

    setLoading(true);
    try {
      if (authMode === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
        toast({ title: 'Giriş Başarılı', description: 'Sisteme hoş geldiniz!' });
        router.push('/dashboard');
      } else {
        // Just move to details, create at the very end
        setStep('details');
      }
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        setAuthMode('register');
        setStep('details');
      } else {
        toast({ variant: 'destructive', title: 'Hata', description: 'Giriş bilgileri hatalı.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFinalize = async () => {
    if (!auth || !db) return;
    setLoading(true);

    try {
      let coachId = '';
      if (role === 'student' && teacherCode) {
        const q = query(collection(db, 'users'), where('activationCode', '==', teacherCode), where('role', '==', 'teacher'));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) coachId = querySnapshot.docs[0].id;
      }

      let user: any = auth.currentUser;
      
      if (!user) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        user = userCredential.user;
      }

      const userData: any = {
        uid: user.uid,
        email: user.email,
        displayName,
        role,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      if (role === 'teacher') {
        userData.activationCode = 'DK-' + Math.random().toString(36).substring(2, 6).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
        userData.school = schoolName;
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

      toast({ title: 'Sistem Hazır', description: 'Akademik profiliniz oluşturuldu.', className: "bg-primary text-white rounded-[2rem]" });
      router.push('/dashboard');
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Hata', description: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-10 md:p-16 space-y-12">
      {/* 1. ADIM: KİMLİK SEÇİMİ */}
      {step === 'identity' && (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="text-center space-y-4">
             <h2 className="text-4xl font-black italic tracking-tighter text-primary uppercase leading-none">Kimliğinizi <br />Seçin</h2>
             <p className="text-sm font-medium text-muted-foreground italic">Size en uygun arayüzü hazırlamamız için bir rol seçin.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { id: 'student', label: 'ÖĞRENCİ', icon: UserRound, desc: 'Kişisel Koçluk' },
              { id: 'teacher', label: 'ÖĞRETMEN', icon: Brain, desc: 'Sınıf Yönetimi' },
              { id: 'school_admin', label: 'KURUM', icon: Building, desc: 'Okul Paneli' },
            ].map((r) => (
              <button
                key={r.id}
                onClick={() => { setRole(r.id as any); handleNextStep(); }}
                className={cn(
                  "group p-8 rounded-[2.5rem] border-2 transition-all flex flex-col items-center gap-6 relative overflow-hidden",
                  role === r.id ? "border-accent bg-white shadow-2xl scale-105" : "border-primary/5 bg-slate-50/50 hover:border-primary/20 hover:bg-white"
                )}
              >
                <div className={cn(
                  "h-16 w-16 rounded-2xl flex items-center justify-center transition-all group-hover:rotate-6",
                  role === r.id ? "bg-accent text-white" : "bg-white text-primary shadow-sm"
                )}>
                  <r.icon className="h-8 w-8" />
                </div>
                <div className="text-center">
                  <span className="block font-black text-xs tracking-widest italic">{r.label}</span>
                  <span className="block text-[8px] font-bold text-muted-foreground uppercase tracking-widest mt-1 opacity-60">{r.desc}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 2. ADIM: AUTH (GİRİŞ/MAGIC) */}
      {step === 'auth' && (
        <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-700">
           <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={handleBackStep} className="h-12 w-12 rounded-xl bg-slate-50"><ArrowLeft className="h-5 w-5" /></Button>
              <h2 className="text-3xl font-black italic tracking-tighter uppercase">GİRİŞ YAPIN</h2>
           </div>
           
           <form onSubmit={handleAuthSubmit} className="space-y-6">
              <div className="space-y-4">
                 <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">E-POSTA ADRESİ</Label>
                    <div className="relative group">
                       <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-accent transition-colors" />
                       <Input 
                          type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                          className="h-16 rounded-2xl bg-slate-50 border-none shadow-inner pl-12 font-bold focus-visible:bg-white transition-all"
                          placeholder="ornek@email.com"
                       />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">ŞİFRE</Label>
                    <div className="relative group">
                       <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-accent transition-colors" />
                       <Input 
                          type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                          className="h-16 rounded-2xl bg-slate-50 border-none shadow-inner pl-12 font-bold focus-visible:bg-white transition-all"
                          placeholder="••••••••"
                       />
                    </div>
                 </div>
              </div>

              <Button type="submit" disabled={loading} className="w-full h-18 rounded-[1.75rem] bg-primary hover:bg-accent transition-all font-black text-xs uppercase tracking-widest gap-3 shadow-2xl">
                 {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (authMode === 'login' ? 'DEVAM ET' : 'KAYIT OL VE DEVAM ET')}
                 <ChevronRight className="h-5 w-5" />
              </Button>
           </form>

           <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-primary/5"></div></div>
              <div className="relative flex justify-center text-[8px] font-black uppercase tracking-[0.4em] italic text-muted-foreground"><span className="bg-white/40 px-4">VEYA</span></div>
           </div>

           <Button variant="outline" onClick={handleGoogleSignIn} className="w-full h-16 rounded-[1.75rem] border-2 bg-white/50 font-black text-xs uppercase tracking-widest gap-4 hover:bg-white transition-all shadow-sm">
              <svg className="h-5 w-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              GOOGLE İLE BAĞLAN
           </Button>
        </div>
      )}

      {/* 3. ADIM: PROFİL DETAYLARI */}
      {step === 'details' && (
        <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-700">
           <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={handleBackStep} className="h-12 w-12 rounded-xl bg-slate-50"><ArrowLeft className="h-5 w-5" /></Button>
              <h2 className="text-3xl font-black italic tracking-tighter uppercase">PROFİLİ KUR</h2>
           </div>

           <div className="space-y-6">
              <div className="space-y-2">
                 <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">{role === 'school_admin' ? 'KURUM ADI' : 'AD SOYAD'}</Label>
                 <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-accent transition-colors" />
                    <Input 
                       required value={displayName} onChange={(e) => setDisplayName(e.target.value)}
                       className="h-16 rounded-2xl bg-slate-50 border-none shadow-inner pl-12 font-bold focus-visible:bg-white transition-all"
                       placeholder={role === 'school_admin' ? 'Okul/Kurum İsmi' : 'Tam Adınız'}
                    />
                 </div>
              </div>

              {(role === 'teacher' || role === 'school_admin') && (
                 <div className="space-y-2 animate-in slide-in-from-top-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">KURUM / OKUL</Label>
                    <div className="relative group">
                       <School className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-accent transition-colors" />
                       <Input 
                          required value={schoolName} onChange={(e) => setSchoolName(e.target.value)}
                          className="h-16 rounded-2xl bg-slate-50 border-none shadow-inner pl-12 font-bold focus-visible:bg-white transition-all"
                          placeholder="Görev yaptığınız kurum"
                       />
                    </div>
                 </div>
              )}

              {role === 'student' && (
                 <div className="space-y-2 animate-in slide-in-from-top-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-accent ml-2 flex items-center gap-2">
                       <Key className="h-3 w-3" /> ÖĞRETMEN KODU (OPSİYONEL)
                    </Label>
                    <div className="relative group">
                       <Hash className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-accent transition-colors" />
                       <Input 
                          value={teacherCode} onChange={(e) => setTeacherCode(e.target.value.toUpperCase())}
                          className="h-16 rounded-2xl bg-white border-2 border-accent/10 shadow-lg pl-12 font-black tracking-widest focus-visible:border-accent transition-all"
                          placeholder="DK-XXXX-XXXX"
                       />
                    </div>
                    <p className="text-[8px] font-bold text-muted-foreground italic px-2">Bağlı olduğunuz bir koç varsa kodunu buraya girin.</p>
                 </div>
              )}
           </div>

           <Button onClick={handleNextStep} disabled={!displayName || loading} className="w-full h-18 rounded-[1.75rem] bg-primary hover:bg-accent transition-all font-black text-xs uppercase tracking-widest gap-3 shadow-2xl">
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'SİSTEMİ YAPILANDIR'}
              <ChevronRight className="h-5 w-5" />
           </Button>
        </div>
      )}

      {/* 4. ADIM: HEDEF SEÇİMİ (Sadece Öğrenci) */}
      {step === 'goal' && (
        <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-700">
           <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={handleBackStep} className="h-12 w-12 rounded-xl bg-slate-50"><ArrowLeft className="h-5 w-5" /></Button>
              <h2 className="text-3xl font-black italic tracking-tighter uppercase leading-none">HEDEFİNİZİ <br />BELİRLEYİN</h2>
           </div>

           <div className="bg-slate-50/50 rounded-[3rem] p-4 border border-primary/5 shadow-inner">
              <ScrollArea className="h-[400px] pr-4">
                 <div className="space-y-10 py-4">
                    {Object.keys(categorizedExams).map((category) => (
                       categorizedExams[category]?.length > 0 && (
                          <div key={category} className="space-y-4 px-2">
                             <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-primary/30 ml-2">{category}</h3>
                             <div className="grid gap-3">
                                {categorizedExams[category].map((exam) => (
                                   <button
                                      key={exam.id}
                                      onClick={() => setTargetExam(exam.id)}
                                      className={cn(
                                         "flex items-center justify-between p-6 rounded-[2rem] border-2 transition-all group text-left",
                                         targetExam === exam.id 
                                            ? "border-accent bg-white shadow-xl scale-[1.02]" 
                                            : "border-white bg-white/40 hover:border-primary/10 hover:bg-white"
                                      )}
                                   >
                                      <div className="flex items-center gap-5">
                                         <div className={cn(
                                            "h-12 w-12 rounded-xl flex items-center justify-center transition-all",
                                            targetExam === exam.id ? "bg-accent text-white shadow-accent/20" : "bg-primary/5 text-primary"
                                         )}>
                                            {exam.icon ? <exam.icon className="h-6 w-6" /> : <Grid3X3 className="h-6 w-6" />}
                                         </div>
                                         <div>
                                            <p className={cn("font-black text-sm uppercase tracking-tight", targetExam === exam.id ? "text-primary" : "text-primary/70")}>{exam.title}</p>
                                            <p className="text-[8px] font-bold opacity-30 uppercase tracking-widest">{exam.targetGroup || 'Genel Sınav'}</p>
                                         </div>
                                      </div>
                                      {targetExam === exam.id && <CheckCircle2 className="h-5 w-5 text-accent animate-in zoom-in" />}
                                   </button>
                                ))}
                             </div>
                          </div>
                       )
                    ))}
                 </div>
              </ScrollArea>
           </div>

           <Button onClick={handleFinalize} disabled={!targetExam || loading} className="w-full h-20 rounded-[2rem] bg-primary hover:bg-accent transition-all font-black text-sm uppercase tracking-widest gap-4 shadow-[0_30px_60px_-10px_rgba(15,23,42,0.3)]">
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : 'SİSTEMİ BAŞLAT'}
              <Sparkles className="h-6 w-6 text-accent" />
           </Button>
        </div>
      )}
    </div>
  );
}
