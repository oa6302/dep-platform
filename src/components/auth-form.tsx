
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
  Zap, UserPlus, LogIn, GraduationCap, Target
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { EXAM_CONFIGS } from '@/lib/exam-configs';

export function AuthForm({ mode: initialMode }: { mode: 'login' | 'register' }) {
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !email || !password) {
      toast({ variant: 'destructive', title: 'Hata', description: 'Lütfen e-posta ve şifrenizi girin.' });
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({ title: 'Giriş Başarılı', description: 'Akademik Komuta Merkezi açılıyor...' });
      router.push('/dashboard');
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Bağlantı Kurulamadı', description: 'E-posta veya şifre hatalı.' });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !db) return;
    
    if (!email || !password || !displayName || (role === 'student' && !targetExam)) {
      toast({ variant: 'destructive', title: 'Eksik Bilgi', description: 'Lütfen tüm zorunlu alanları doldurun.' });
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

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
        toast({ title: 'Profil Gerekli', description: 'Lütfen kayıt formunu doldurarak devam edin.' });
        setDisplayName(user.displayName || '');
        setEmail(user.email || '');
        setAuthMode('register');
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
    <div className="p-8 md:p-12 space-y-12">
      {authMode === 'login' ? (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="text-center space-y-4">
            <h2 className="text-5xl font-black italic tracking-tighter text-primary uppercase leading-none">BAĞLANTI KUR</h2>
            <p className="text-sm font-medium text-muted-foreground italic">Mevcut hesabınıza erişerek akademik takibi sürdürün.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-8">
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
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : 'SİSTEME GİRİŞ YAP'}
              <ChevronRight className="h-6 w-6" />
            </Button>
          </form>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-primary/5"></div></div>
            <div className="relative flex justify-center text-[9px] font-black uppercase tracking-[0.5em] italic text-muted-foreground/30"><span className="bg-white px-6">VEYA</span></div>
          </div>

          <Button variant="outline" onClick={handleGoogleSignIn} className="w-full h-20 rounded-[2rem] border-2 border-primary/5 bg-white font-black text-xs uppercase tracking-widest gap-5 hover:bg-slate-50 transition-all shadow-sm">
            <svg className="h-6 w-6" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            GOOGLE İLE BAĞLAN
          </Button>

          <p className="text-center text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 italic">
            Hesabınız yok mu? <button onClick={() => setAuthMode('register')} className="text-accent hover:underline">Kayıt Olun</button>
          </p>
        </div>
      ) : (
        <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-700">
          <div className="text-center space-y-4">
            <h2 className="text-5xl font-black italic tracking-tighter text-primary uppercase leading-none">YENİ KAYIT</h2>
            <p className="text-sm font-medium text-muted-foreground italic">Sistemi yapılandırmak için aşağıdaki formu doldurun.</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-10">
            {/* ROL SEÇİMİ */}
            <div className="space-y-4">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-2">KİMLİK TÜRÜ</Label>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { id: 'student', label: 'ÖĞRENCİ', icon: UserRound },
                  { id: 'teacher', label: 'ÖĞRETMEN', icon: Brain },
                  { id: 'school_admin', label: 'KURUM', icon: Building },
                ].map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRole(r.id as any)}
                    className={cn(
                      "p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-3",
                      role === r.id ? "border-accent bg-accent/5 text-primary shadow-lg" : "border-primary/5 bg-slate-50 opacity-60 hover:opacity-100"
                    )}
                  >
                    <r.icon className={cn("h-6 w-6", role === r.id ? "text-accent" : "text-primary")} />
                    <span className="font-black text-[9px] tracking-widest">{r.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* BİLGİLER */}
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-2">AD SOYAD</Label>
                  <div className="relative group">
                    <User className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-accent" />
                    <Input required value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="h-14 rounded-2xl bg-[#F8FAFC] border-none shadow-inner pl-12 font-bold" placeholder="Adınız Soyadınız" />
                  </div>
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-2">E-POSTA</Label>
                  <div className="relative group">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-accent" />
                    <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="h-14 rounded-2xl bg-[#F8FAFC] border-none shadow-inner pl-12 font-bold" placeholder="ornek@email.com" />
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-2">ŞİFRE</Label>
                  <div className="relative group">
                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-accent" />
                    <Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="h-14 rounded-2xl bg-[#F8FAFC] border-none shadow-inner pl-12 font-bold" placeholder="••••••••" />
                  </div>
                </div>
                {(role === 'teacher' || role === 'school_admin') ? (
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-2">KURUM / OKUL</Label>
                    <div className="relative group">
                      <School className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-accent" />
                      <Input required value={schoolName} onChange={(e) => setSchoolName(e.target.value)} className="h-14 rounded-2xl bg-[#F8FAFC] border-none shadow-inner pl-12 font-bold" placeholder="Görev Yaptığınız Yer" />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-accent ml-2">ÖĞRETMEN KODU (OPSİYONEL)</Label>
                    <div className="relative group">
                      <Key className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-accent" />
                      <Input value={teacherCode} onChange={(e) => setTeacherCode(e.target.value.toUpperCase())} className="h-14 rounded-2xl bg-white border-2 border-accent/10 shadow-sm pl-12 font-black tracking-widest" placeholder="DK-XXXX-XXXX" />
                    </div>
                  </div>
                )}
              </div>

              {/* HEDEF SEÇİMİ (Sadece Öğrenci) */}
              {role === 'student' && (
                <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-2">HEDEFİNİ BELİRLE</Label>
                  <div className="bg-[#F8FAFC] rounded-3xl p-4 border border-primary/5 shadow-inner">
                    <ScrollArea className="h-[250px] pr-4">
                      <div className="space-y-6">
                        {Object.keys(categorizedExams).map((category) => (
                          categorizedExams[category]?.length > 0 && (
                            <div key={category} className="space-y-3">
                              <h4 className="text-[8px] font-black uppercase tracking-[0.3em] text-primary/30 ml-2">{category}</h4>
                              <div className="grid grid-cols-1 gap-2">
                                {categorizedExams[category].map((exam) => (
                                  <button
                                    key={exam.id}
                                    type="button"
                                    onClick={() => setTargetExam(exam.id)}
                                    className={cn(
                                      "flex items-center justify-between p-4 rounded-xl border transition-all text-left",
                                      targetExam === exam.id ? "bg-white border-accent shadow-md scale-[1.02]" : "bg-white/50 border-transparent hover:bg-white"
                                    )}
                                  >
                                    <div className="flex items-center gap-4">
                                      <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center", targetExam === exam.id ? "bg-accent text-white" : "bg-slate-100 text-primary")}>
                                        <exam.icon className="h-5 w-5" />
                                      </div>
                                      <span className={cn("font-black text-xs uppercase tracking-tight", targetExam === exam.id ? "text-primary" : "text-primary/60")}>{exam.title}</span>
                                    </div>
                                    {targetExam === exam.id && <CheckCircle2 className="h-5 w-5 text-accent" />}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                </div>
              )}
            </div>

            <Button type="submit" disabled={loading} className="w-full h-20 rounded-[2rem] bg-primary hover:bg-accent transition-all font-black text-sm uppercase tracking-widest gap-4 shadow-2xl">
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : 'SİSTEMİ YAPILANDIR VE BAŞLAT'}
              <Sparkles className="h-6 w-6 text-accent" />
            </Button>
          </form>

          <p className="text-center text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 italic">
            Zaten üye misiniz? <button onClick={() => setAuthMode('login')} className="text-primary hover:underline">Giriş Yapın</button>
          </p>
        </div>
      )}
    </div>
  );
}
