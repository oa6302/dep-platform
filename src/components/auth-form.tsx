
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
  UserRound, Building, CheckCircle2, 
  ChevronRight, Grid3X3, Brain, ArrowLeft, Key, Sparkles,
  Zap, UserPlus, LogIn
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { EXAM_CONFIGS } from '@/lib/exam-configs';

type Step = 'choice' | 'identity' | 'auth' | 'details' | 'goal';

export function AuthForm({ mode: initialMode }: { mode: 'login' | 'register' }) {
  const [step, setStep] = useState<Step>(initialMode === 'login' ? 'auth' : 'choice');
  const [authMode, setAuthMode] = useState<'login' | 'register'>(initialMode);
  const [role, setRole] = useState<'student' | 'teacher' | 'school_admin'>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [targetExam, setTargetExam] = useState<string>('');
  const [schoolName, setSchoolName] = useState('');
  const [teacherCode, setTeacherCode] = useState('');
  const [loading, setLoading] = useState(false);
  
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const { data: dbPrograms } = useCollection<any>('programs', orderBy('title', 'asc'));

  const categorizedExams = useMemo(() => {
    const grouped: Record<string, any[]> = {};
    const categories = [
      'ORTAOKUL', 'ÜNİVERSİTE', 'MEB SINAVLARI', 'KAMU SINAVLARI', 
      'AKADEMİK', 'YABANCI DİL', 'ÜNİVERSİTE GEÇİŞ', 'DİNÎ EĞİTİM', 
      'AKADEMİK DESTEK', 'ÖZEL PROGRAMLAR'
    ];
    
    categories.forEach(cat => grouped[cat] = []);
    
    Object.values(EXAM_CONFIGS).forEach(exam => {
      const cat = exam.category;
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push({ ...exam, source: 'config' });
    });

    if (dbPrograms) {
      dbPrograms.forEach(exam => {
        const cat = exam.category || 'ÖZEL PROGRAMLAR';
        if (!grouped[cat]) grouped[cat] = [];
        if (!grouped[cat].find(e => e.id === exam.id)) {
          grouped[cat].push({ ...exam, source: 'db' });
        }
      });
    }
    return grouped;
  }, [dbPrograms]);

  const handleAuthSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!auth || !db) return;

    if (!email || !password) {
        toast({ variant: 'destructive', title: 'Eksik Bilgi', description: 'Lütfen e-posta ve şifrenizi girin.' });
        return;
    }

    setLoading(true);
    try {
      if (authMode === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
        router.push('/dashboard');
      } else {
        setStep('details');
      }
    } catch (error: any) {
      let title = "Bağlantı Kurulamadı";
      let msg = "Beklenmedik bir hata oluştu.";

      switch (error.code) {
        case 'auth/user-not-found':
          msg = "Bu e-posta adresiyle kayıtlı bir hesap bulunamadı.";
          break;
        case 'auth/wrong-password':
          msg = "Girdiğiniz şifre hatalı. Lütfen tekrar deneyin.";
          break;
        case 'auth/invalid-email':
          msg = "Geçersiz bir e-posta adresi girdiniz.";
          break;
        case 'auth/invalid-credential':
          msg = "E-posta veya şifre hatalı. Bilgilerinizi kontrol edin.";
          break;
        case 'auth/too-many-requests':
          msg = "Çok fazla başarısız deneme. Lütfen bir süre sonra tekrar deneyin.";
          break;
        case 'auth/network-request-failed':
          msg = "İnternet bağlantınızı kontrol edin.";
          break;
      }

      toast({ variant: 'destructive', title, description: msg });
    } finally {
      setLoading(false);
    }
  };

  const handleFinalize = async () => {
    if (!auth || !db) return;
    setLoading(true);

    try {
      let user = auth.currentUser;
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
        if (teacherCode) {
          const q = query(collection(db, 'users'), where('activationCode', '==', teacherCode), where('role', '==', 'teacher'));
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) userData.coachId = querySnapshot.docs[0].id;
        }
      } else if (role === 'school_admin') {
        userData.school = schoolName;
      }

      await updateProfile(user, { displayName });
      await setDoc(doc(db, 'users', user.uid), userData);

      toast({ title: 'Sistem Yapılandırıldı', description: 'Profiliniz başarıyla oluşturuldu.' });
      router.push('/dashboard');
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Kayıt Hatası', description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleNextStep = () => {
    if (step === 'choice') setStep(authMode === 'login' ? 'auth' : 'identity');
    else if (step === 'identity') setStep('auth');
    else if (step === 'auth') {
      if (authMode === 'login') handleAuthSubmit();
      else setStep('details');
    }
    else if (step === 'details') {
      if (role === 'student') setStep('goal');
      else handleFinalize();
    }
    else if (step === 'goal') handleFinalize();
  };

  const handleBackStep = () => {
    if (step === 'identity') setStep('choice');
    else if (step === 'auth') {
        if (initialMode === 'login') router.push('/');
        else setStep(authMode === 'login' ? 'choice' : 'identity');
    }
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
        setStep('identity');
      } else {
        toast({ title: 'Hoş Geldiniz', description: `Tekrar merhaba, ${userDoc.data().displayName}!` });
        router.push('/dashboard');
      }
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Hata', description: 'Google ile bağlantı kurulamadı.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-10 md:p-16 space-y-12">
      {step === 'choice' && (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
           <div className="text-center space-y-4">
              <h2 className="text-5xl font-black italic tracking-tighter text-primary uppercase leading-none">HOŞ GELDİNİZ</h2>
              <p className="text-sm font-medium text-muted-foreground italic">Akademik dünyaya adım atmak için bir seçenek belirleyin.</p>
           </div>
           <div className="grid grid-cols-1 gap-6">
              <button 
                onClick={() => { setAuthMode('login'); setStep('auth'); }}
                className="group flex items-center justify-between p-8 rounded-[2.5rem] bg-slate-50 border-2 border-transparent hover:border-primary/10 hover:bg-white transition-all shadow-sm hover:shadow-xl"
              >
                <div className="flex items-center gap-6">
                  <div className="h-16 w-16 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg group-hover:rotate-6 transition-all">
                    <LogIn className="h-8 w-8" />
                  </div>
                  <div className="text-left">
                    <span className="block font-black text-xl italic text-primary uppercase">GİRİŞ YAP</span>
                    <span className="block text-[9px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">Mevcut Hesabına Eriş</span>
                  </div>
                </div>
                <ChevronRight className="h-6 w-6 text-primary opacity-20" />
              </button>

              <button 
                onClick={() => { setAuthMode('register'); setStep('identity'); }}
                className="group flex items-center justify-between p-8 rounded-[2.5rem] bg-accent/5 border-2 border-accent/10 hover:border-accent hover:bg-white transition-all shadow-sm hover:shadow-xl"
              >
                <div className="flex items-center gap-6">
                  <div className="h-16 w-16 rounded-2xl bg-accent text-white flex items-center justify-center shadow-lg group-hover:rotate-6 transition-all">
                    <UserPlus className="h-8 w-8" />
                  </div>
                  <div className="text-left">
                    <span className="block font-black text-xl italic text-primary uppercase">YENİ KAYIT</span>
                    <span className="block text-[9px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">Sisteme Hemen Katıl</span>
                  </div>
                </div>
                <ChevronRight className="h-6 w-6 text-accent opacity-20" />
              </button>
           </div>
           <div className="relative py-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-primary/5"></div></div>
              <div className="relative flex justify-center text-[9px] font-black uppercase tracking-[0.5em] italic text-muted-foreground/30"><span className="bg-white px-6">HIZLI BAĞLANTI</span></div>
           </div>
           <Button variant="outline" onClick={handleGoogleSignIn} className="w-full h-20 rounded-[2rem] border-2 border-primary/5 bg-white font-black text-xs uppercase tracking-widest gap-5 hover:bg-slate-50 transition-all shadow-sm">
              <svg className="h-6 w-6" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              GOOGLE İLE BAĞLAN
           </Button>
        </div>
      )}

      {step === 'identity' && (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex items-center gap-6">
              <Button variant="ghost" size="icon" onClick={handleBackStep} className="h-12 w-12 rounded-xl bg-slate-50 hover:bg-primary hover:text-white transition-all">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h2 className="text-4xl font-black italic tracking-tighter uppercase text-primary">KİMLİK SEÇİMİ</h2>
           </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { id: 'student', label: 'ÖĞRENCİ', icon: UserRound, desc: 'Kişisel Koçluk' },
              { id: 'teacher', label: 'ÖĞRETMEN', icon: Brain, desc: 'Sınıf Yönetimi' },
              { id: 'school_admin', label: 'KURUM', icon: Building, desc: 'Okul Paneli' },
            ].map((r) => (
              <button
                key={r.id}
                onClick={() => { setRole(r.id as any); setStep('auth'); }}
                className={cn(
                  "group p-8 rounded-[2.5rem] border-2 transition-all flex flex-col items-center gap-6 relative overflow-hidden",
                  role === r.id ? "border-accent bg-white shadow-2xl scale-105" : "border-primary/5 bg-slate-50/50 hover:border-primary/20 hover:bg-white"
                )}
              >
                <div className={cn(
                  "h-16 w-16 rounded-2xl flex items-center justify-center transition-all group-hover:rotate-6",
                  role === r.id ? "bg-accent text-white shadow-accent/20" : "bg-white text-primary shadow-sm"
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

      {step === 'auth' && (
        <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-700">
           <div className="flex items-center gap-6">
              <Button variant="ghost" size="icon" onClick={handleBackStep} className="h-12 w-12 rounded-xl bg-slate-50 transition-all hover:bg-primary hover:text-white">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h2 className="text-4xl font-black italic tracking-tighter uppercase text-primary">
                {authMode === 'login' ? 'BAĞLANTI KUR' : 'GÜVENLİK KARTI'}
              </h2>
           </div>
           
           <form onSubmit={handleAuthSubmit} className="space-y-8">
              <div className="space-y-6">
                 <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-2 italic">E-POSTA ADRESİ</Label>
                    <div className="relative group">
                       <Mail className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-accent transition-colors" />
                       <Input 
                          type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                          className="h-20 rounded-3xl bg-[#F8FAFC] border-2 border-transparent shadow-inner pl-16 font-bold text-lg focus-visible:bg-white focus-visible:border-accent transition-all placeholder:text-muted-foreground/30"
                          placeholder="ornek@email.com"
                       />
                    </div>
                 </div>
                 <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-2 italic">ŞİFRE</Label>
                    <div className="relative group">
                       <Lock className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-accent transition-colors" />
                       <Input 
                          type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                          className="h-20 rounded-3xl bg-[#F8FAFC] border-2 border-transparent shadow-inner pl-16 font-bold text-lg focus-visible:bg-white focus-visible:border-accent transition-all"
                          placeholder="••••••••"
                       />
                    </div>
                 </div>
              </div>

              <Button type="submit" disabled={loading} className="w-full h-20 rounded-[2rem] bg-primary hover:bg-accent transition-all font-black text-sm uppercase tracking-widest gap-4 shadow-2xl shadow-primary/20">
                 {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : 'DEVAM ET'}
                 <ChevronRight className="h-6 w-6" />
              </Button>
           </form>
           
           {authMode === 'login' && (
             <p className="text-center text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 italic">
               Hesabınız yok mu? <button onClick={() => { setAuthMode('register'); setStep('identity'); }} className="text-accent hover:underline">Kayıt Olun</button>
             </p>
           )}
           {authMode === 'register' && (
             <p className="text-center text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 italic">
               Zaten üye misiniz? <button onClick={() => { setAuthMode('login'); setStep('auth'); }} className="text-primary hover:underline">Giriş Yapın</button>
             </p>
           )}
        </div>
      )}

      {step === 'details' && (
        <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-700">
           <div className="flex items-center gap-6">
              <Button variant="ghost" size="icon" onClick={handleBackStep} className="h-12 w-12 rounded-xl bg-slate-50"><ArrowLeft className="h-5 w-5" /></Button>
              <h2 className="text-4xl font-black italic tracking-tighter uppercase text-primary">PROFİLİ KUR</h2>
           </div>

           <div className="space-y-6">
              <div className="space-y-3">
                 <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-2">
                    {role === 'school_admin' ? 'KURUM ADI' : 'AD SOYAD'}
                 </Label>
                 <div className="relative group">
                    <User className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-accent transition-colors" />
                    <Input 
                       required value={displayName} onChange={(e) => setDisplayName(e.target.value)}
                       className="h-20 rounded-3xl bg-[#F8FAFC] border-2 border-transparent shadow-inner pl-16 font-bold text-lg focus-visible:bg-white focus-visible:border-accent transition-all"
                       placeholder={role === 'school_admin' ? 'Okul/Kurum İsmi' : 'Tam Adınız'}
                    />
                 </div>
              </div>

              {(role === 'teacher' || role === 'school_admin') && (
                 <div className="space-y-3 animate-in slide-in-from-top-2">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-2">KURUM / OKUL</Label>
                    <div className="relative group">
                       <School className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-accent transition-colors" />
                       <Input 
                          required value={schoolName} onChange={(e) => setSchoolName(e.target.value)}
                          className="h-20 rounded-3xl bg-[#F8FAFC] border-2 border-transparent shadow-inner pl-16 font-bold text-lg focus-visible:bg-white focus-visible:border-accent transition-all"
                          placeholder="Görev yaptığınız kurum"
                       />
                    </div>
                 </div>
              )}

              {role === 'student' && (
                 <div className="space-y-3 animate-in slide-in-from-top-2">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-accent ml-2 flex items-center gap-2">
                       <Key className="h-3 w-3" /> ÖĞRETMEN KODU (OPSİYONEL)
                    </Label>
                    <div className="relative group">
                       <Hash className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-accent transition-colors" />
                       <Input 
                          value={teacherCode} onChange={(e) => setTeacherCode(e.target.value.toUpperCase())}
                          className="h-20 rounded-3xl bg-white border-2 border-accent/10 shadow-[0_20px_40px_-5px_rgba(245,158,11,0.1)] pl-16 font-black tracking-[0.2em] focus-visible:border-accent transition-all"
                          placeholder="DK-XXXX-XXXX"
                       />
                    </div>
                 </div>
              )}
           </div>

           <Button onClick={handleNextStep} disabled={!displayName || loading} className="w-full h-20 rounded-[2rem] bg-primary hover:bg-accent transition-all font-black text-sm uppercase tracking-widest gap-4 shadow-2xl">
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : 'SİSTEMİ YAPILANDIR'}
              <ChevronRight className="h-6 w-6" />
           </Button>
        </div>
      )}

      {step === 'goal' && (
        <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-700">
           <div className="flex items-center gap-6">
              <Button variant="ghost" size="icon" onClick={handleBackStep} className="h-12 w-12 rounded-xl bg-slate-50"><ArrowLeft className="h-5 w-5" /></Button>
              <h2 className="text-4xl font-black italic tracking-tighter uppercase leading-none text-primary">HEDEFİNİZİ <br />BELİRLEYİN</h2>
           </div>

           <div className="bg-[#F8FAFC] rounded-[3.5rem] p-6 border border-primary/5 shadow-inner">
              <ScrollArea className="h-[450px] pr-4">
                 <div className="space-y-10 py-4">
                    {Object.keys(categorizedExams).map((category) => (
                       categorizedExams[category]?.length > 0 && (
                          <div key={category} className="space-y-6">
                             <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/30 ml-4 border-b border-primary/5 pb-2">{category}</h3>
                             <div className="grid gap-4">
                                {categorizedExams[category].map((exam) => (
                                   <button
                                      key={exam.id}
                                      onClick={() => setTargetExam(exam.id)}
                                      className={cn(
                                         "flex items-center justify-between p-6 rounded-[2.5rem] border-2 transition-all group text-left relative overflow-hidden",
                                         targetExam === exam.id 
                                            ? "border-accent bg-white shadow-xl scale-[1.02]" 
                                            : "border-transparent bg-white/50 hover:bg-white hover:border-primary/10"
                                      )}
                                   >
                                      <div className="flex items-center gap-6 relative z-10">
                                         <div className={cn(
                                            "h-16 w-16 rounded-2xl flex items-center justify-center transition-all shadow-sm",
                                            targetExam === exam.id ? "bg-accent text-white shadow-accent/20" : "bg-primary/5 text-primary"
                                         )}>
                                            {exam.icon ? <exam.icon className="h-8 w-8" /> : <Grid3X3 className="h-8 w-8" />}
                                         </div>
                                         <div className="space-y-0.5">
                                            <p className={cn("font-black text-lg uppercase tracking-tight", targetExam === exam.id ? "text-primary" : "text-primary/70")}>{exam.title}</p>
                                            <p className="text-[9px] font-bold opacity-40 uppercase tracking-widest leading-none">{exam.targetGroup || 'Genel Hazırlık'}</p>
                                         </div>
                                      </div>
                                      {targetExam === exam.id && <CheckCircle2 className="h-7 w-7 text-accent animate-in zoom-in" />}
                                   </button>
                                ))}
                             </div>
                          </div>
                       )
                    ))}
                 </div>
              </ScrollArea>
           </div>

           <div className="pt-4">
              <Button onClick={handleFinalize} disabled={!targetExam || loading} className="w-full h-24 rounded-[2.5rem] bg-primary hover:bg-accent transition-all font-black text-lg uppercase tracking-widest gap-5 shadow-[0_40px_80px_-20px_rgba(15,23,42,0.3)]">
                 {loading ? <Loader2 className="h-7 w-7 animate-spin" /> : 'SİSTEMİ BAŞLAT'}
                 <Sparkles className="h-7 w-7 text-accent" />
              </Button>
           </div>
        </div>
      )}
    </div>
  );
}
