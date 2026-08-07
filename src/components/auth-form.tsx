'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth, useFirestore, useCollection, useUser } from '@/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { 
  Loader2, Mail, Lock, User, School, 
  UserRound, Brain, Key, UserPlus, LogIn, Building,
  CheckCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { EXAM_CONFIGS } from '@/lib/exam-configs';

interface AuthFormProps {
  mode: 'login' | 'register';
  isProfileCompletion?: boolean; 
}

export function AuthForm({ mode: initialMode, isProfileCompletion = false }: AuthFormProps) {
  const [authMode, setAuthMode] = useState<'login' | 'register'>(initialMode);
  const [role, setRole] = useState<'student' | 'teacher' | 'school_admin'>(isProfileCompletion ? 'student' : 'student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [targetExam, setTargetExam] = useState<string>('');
  const [schoolName, setSchoolName] = useState('');
  const [teacherCode, setTeacherCode] = useState('');
  const [loading, setLoading] = useState(false);
  
  const auth = useAuth();
  const db = useFirestore();
  const { user: currentUser } = useUser();
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
      toast({ variant: 'destructive', title: 'Eksik Bilgi', description: 'Lütfen e-posta ve şifrenizi girin.' });
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({ title: 'Bağlantı Kuruldu', description: 'Akademik Komuta Merkezi açılıyor...' });
      router.push('/dashboard');
    } catch (error: any) {
      let msg = "Giriş başarısız.";
      if (error.code === 'auth/wrong-password') msg = "Şifre hatalı.";
      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') msg = "E-posta veya şifre hatalı.";
      toast({ variant: 'destructive', title: 'Hata', description: msg });
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) return;

    if (!displayName || (role === 'student' && !targetExam)) {
      toast({ variant: 'destructive', title: 'Eksik Bilgi', description: 'Lütfen zorunlu alanları doldurun.' });
      return;
    }

    setLoading(true);
    try {
      let finalUser = currentUser;

      if (!isProfileCompletion && authMode === 'register') {
        if (!auth || !email || !password) {
           toast({ variant: 'destructive', title: 'Eksik Bilgi', description: 'E-posta ve şifre gereklidir.' });
           setLoading(false);
           return;
        }
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        finalUser = userCredential.user;
      }

      if (!finalUser) throw new Error("Kullanıcı oturumu bulunamadı.");

      const userData: any = {
        uid: finalUser.uid,
        email: finalUser.email || email,
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

      if (finalUser) {
        await updateProfile(finalUser, { displayName });
      }

      await setDoc(doc(db, 'users', finalUser.uid), userData, { merge: true });

      toast({ title: 'Sistem Yapılandırıldı', description: 'Profiliniz başarıyla oluşturuldu.' });
      
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 500);
      
    } catch (error: any) {
      console.error("Auth error:", error);
      let msg = error.message;
      if (error.code === 'auth/email-already-in-use') msg = "Bu e-posta adresi zaten kullanımda.";
      toast({ variant: 'destructive', title: 'Hata', description: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-10 md:p-16 space-y-14">
      {!isProfileCompletion && (
        <div className="flex justify-center">
          <div className="bg-slate-100/50 p-2 rounded-[2.5rem] flex gap-2 backdrop-blur-xl border border-primary/5">
             <button 
              type="button"
              onClick={() => setAuthMode('login')}
              className={cn(
                "px-12 py-4 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.2em] transition-all",
                authMode === 'login' ? "bg-primary text-white shadow-2xl scale-105" : "text-muted-foreground hover:bg-slate-200/50"
              )}
             >
                Giriş Yap
             </button>
             <button 
              type="button"
              onClick={() => setAuthMode('register')}
              className={cn(
                "px-12 py-4 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.2em] transition-all",
                authMode === 'register' ? "bg-primary text-white shadow-2xl scale-105" : "text-muted-foreground hover:bg-slate-200/50"
              )}
             >
                Yeni Kayıt
             </button>
          </div>
        </div>
      )}

      {(!isProfileCompletion && authMode === 'login') ? (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000">
          <div className="text-center space-y-3">
            <h2 className="text-5xl font-black italic tracking-tighter text-primary uppercase leading-none text-shadow-premium">AKADEMİK ERİŞİM</h2>
            <p className="text-sm font-medium text-muted-foreground italic opacity-60 uppercase tracking-widest">Digital Education Coach v4.0</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-10">
            <div className="space-y-8">
              <div className="space-y-3">
                <Label className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 ml-3 italic">E-POSTA ADRESİ</Label>
                <div className="relative group">
                  <Mail className="absolute left-7 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground group-focus-within:text-accent transition-all" />
                  <Input 
                    type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                    className="h-24 rounded-[2.5rem] bg-[#F8FAFC] border-2 border-transparent shadow-inner pl-20 font-bold text-xl focus-visible:bg-white focus-visible:border-accent transition-all placeholder:text-muted-foreground/20"
                    placeholder="ornek@email.com"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <Label className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 ml-3 italic">GÜVENLİ ŞİFRE</Label>
                <div className="relative group">
                  <Lock className="absolute left-7 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground group-focus-within:text-accent transition-all" />
                  <Input 
                    type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                    className="h-24 rounded-[2.5rem] bg-[#F8FAFC] border-2 border-transparent shadow-inner pl-20 font-bold text-xl focus-visible:bg-white focus-visible:border-accent transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full h-24 rounded-[3rem] bg-primary hover:bg-accent transition-all font-black text-lg uppercase tracking-[0.3em] gap-6 shadow-[0_30px_60px_-15px_rgba(15,23,42,0.3)]">
              {loading ? <Loader2 className="h-8 w-8 animate-spin" /> : <LogIn className="h-8 w-8 text-accent" />}
              AKADEMİK GİRİŞ
            </Button>
          </form>
        </div>
      ) : (
        <div className="space-y-12 animate-in fade-in slide-in-from-right-6 duration-1000">
          {!isProfileCompletion && (
            <div className="text-center space-y-3">
              <h2 className="text-5xl font-black italic tracking-tighter text-primary uppercase leading-none text-shadow-premium">SİSTEM KURULUMU</h2>
              <p className="text-sm font-medium text-muted-foreground italic opacity-60 uppercase tracking-widest">Profilinizi Bir Kez Yapılandırın</p>
            </div>
          )}

          <form onSubmit={handleAction} className="space-y-12">
            <div className="space-y-6">
              <Label className="text-[11px] font-black uppercase tracking-[0.4em] text-muted-foreground/60 ml-3 italic text-center block">ROLÜNÜZÜ BELİRLEYİN</Label>
              <div className="grid grid-cols-3 gap-6">
                {[
                  { id: 'student', label: 'ÖĞRENCİ', icon: UserRound },
                  { id: 'teacher', label: 'EĞİTMEN', icon: Brain },
                  { id: 'school_admin', label: 'KURUM', icon: Building },
                ].map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRole(r.id as any)}
                    className={cn(
                      "p-8 rounded-[2.5rem] border-2 transition-all flex flex-col items-center gap-5 group",
                      role === r.id ? "border-accent bg-accent/5 text-primary shadow-2xl scale-105" : "border-primary/5 bg-slate-50 opacity-40 hover:opacity-100"
                    )}
                  >
                    <r.icon className={cn("h-10 w-10 transition-transform group-hover:scale-110", role === r.id ? "text-accent" : "text-primary")} />
                    <span className="font-black text-[10px] tracking-[0.2em]">{r.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 ml-3 italic">AD SOYAD *</Label>
                  <div className="relative group">
                    <User className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-accent" />
                    <Input required value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="h-18 rounded-2xl bg-[#F8FAFC] border-none shadow-inner pl-16 font-bold text-lg" placeholder="Tam Adınız" />
                  </div>
                </div>
                {!isProfileCompletion && (
                  <div className="space-y-3">
                    <Label className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 ml-3 italic">E-POSTA *</Label>
                    <div className="relative group">
                      <Mail className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-accent" />
                      <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="h-18 rounded-2xl bg-[#F8FAFC] border-none shadow-inner pl-16 font-bold text-lg" placeholder="email@adresi.com" />
                    </div>
                  </div>
                )}
              </div>

              {!isProfileCompletion && (
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 ml-3 italic">ŞİFRE BELİRLE *</Label>
                    <div className="relative group">
                      <Lock className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-accent" />
                      <Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="h-18 rounded-2xl bg-[#F8FAFC] border-none shadow-inner pl-16 font-bold text-lg" placeholder="Min. 8 Karakter" />
                    </div>
                  </div>
                  {(role === 'teacher' || role === 'school_admin') ? (
                    <div className="space-y-3">
                      <Label className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 ml-3 italic">OKUL / KURUM</Label>
                      <div className="relative group">
                        <School className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-accent" />
                        <Input required value={schoolName} onChange={(e) => setSchoolName(e.target.value)} className="h-18 rounded-2xl bg-[#F8FAFC] border-none shadow-inner pl-16 font-bold text-lg" placeholder="Çalıştığınız Kurum" />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Label className="text-[11px] font-black uppercase tracking-[0.3em] text-accent ml-3 italic">EĞİTMEN KODU (OPSİYONEL)</Label>
                      <div className="relative group">
                        <Key className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-accent" />
                        <Input value={teacherCode} onChange={(e) => setTeacherCode(e.target.value.toUpperCase())} className="h-18 rounded-2xl bg-white border-2 border-accent/10 shadow-2xl pl-16 font-black tracking-widest text-center" placeholder="DK-XXXX-XXXX" />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {role === 'student' && (
                <div className="space-y-6">
                  <Label className="text-[11px] font-black uppercase tracking-[0.4em] text-muted-foreground/60 ml-3 italic text-center block">AKADEMİK HEDEFİNİZİ SEÇİN</Label>
                  <div className="bg-[#F8FAFC] rounded-[3rem] p-8 border border-primary/5 shadow-inner">
                    <ScrollArea className="h-[400px] pr-6">
                      <div className="space-y-10">
                        {Object.keys(categorizedExams).map((category) => (
                          categorizedExams[category]?.length > 0 && (
                            <div key={category} className="space-y-4">
                              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/30 ml-4 italic">{category}</h4>
                              <div className="grid grid-cols-1 gap-3">
                                {categorizedExams[category].map((exam) => (
                                  <button
                                    key={exam.id}
                                    type="button"
                                    onClick={() => setTargetExam(exam.id)}
                                    className={cn(
                                      "flex items-center justify-between p-6 rounded-[2rem] border-2 transition-all text-left group/exam",
                                      targetExam === exam.id ? "bg-white border-accent shadow-2xl scale-[1.03]" : "bg-white/40 border-transparent hover:bg-white"
                                    )}
                                  >
                                    <div className="flex items-center gap-6">
                                      <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center transition-transform group-hover/exam:rotate-6", targetExam === exam.id ? "bg-accent text-white" : "bg-slate-100 text-primary")}>
                                        <exam.icon className="h-7 w-7" />
                                      </div>
                                      <div className="space-y-0.5">
                                         <span className={cn("font-black text-sm uppercase tracking-tight block", targetExam === exam.id ? "text-primary" : "text-primary/60")}>{exam.title}</span>
                                         <span className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest">{exam.targetGroup}</span>
                                      </div>
                                    </div>
                                    {targetExam === exam.id && <CheckCircle className="h-7 w-7 text-accent" />}
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

            <Button type="submit" disabled={loading} className="w-full h-24 rounded-[3rem] bg-primary hover:bg-accent transition-all font-black text-lg uppercase tracking-[0.3em] gap-6 shadow-[0_40px_80px_-20px_rgba(15,23,42,0.4)]">
              {loading ? <Loader2 className="h-8 w-8 animate-spin" /> : <UserPlus className="h-8 w-8 text-accent" />}
              {isProfileCompletion ? "KURULUMU TAMAMLA" : "SİSTEMİ BAŞLAT"}
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}