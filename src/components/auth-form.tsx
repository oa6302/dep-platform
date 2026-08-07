
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
  CheckCircle2
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
      
      // Kayıt başarılı olduktan sonra verilerin Firestore'da yansıması için kısa bir bekleme ve yönlendirme
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
    <div className="p-8 md:p-12 space-y-12">
      {!isProfileCompletion && (
        <div className="flex justify-center">
          <div className="bg-slate-50 p-1.5 rounded-[2rem] flex gap-2">
             <button 
              type="button"
              onClick={() => setAuthMode('login')}
              className={cn(
                "px-8 py-3 rounded-[1.75rem] font-black text-[10px] uppercase tracking-widest transition-all",
                authMode === 'login' ? "bg-primary text-white shadow-xl" : "text-muted-foreground hover:bg-slate-100"
              )}
             >
                Giriş Yap
             </button>
             <button 
              type="button"
              onClick={() => setAuthMode('register')}
              className={cn(
                "px-8 py-3 rounded-[1.75rem] font-black text-[10px] uppercase tracking-widest transition-all",
                authMode === 'register' ? "bg-primary text-white shadow-xl" : "text-muted-foreground hover:bg-slate-100"
              )}
             >
                Yeni Kayıt
             </button>
          </div>
        </div>
      )}

      {(!isProfileCompletion && authMode === 'login') ? (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="text-center space-y-2">
            <h2 className="text-4xl font-black italic tracking-tighter text-primary uppercase leading-none">AKADEMİK ERİŞİM</h2>
            <p className="text-xs font-medium text-muted-foreground italic">Kimlik bilgilerinizi doğrulayın.</p>
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
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <LogIn className="h-6 w-6" />}
              SİSTEME GİRİŞ YAP
            </Button>
          </form>
        </div>
      ) : (
        <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-700">
          {!isProfileCompletion && (
            <div className="text-center space-y-2">
              <h2 className="text-4xl font-black italic tracking-tighter text-primary uppercase leading-none">PROFİL OLUŞTUR</h2>
              <p className="text-xs font-medium text-muted-foreground italic">Akademik kaydınızı tek adımda tamamlayın.</p>
            </div>
          )}

          <form onSubmit={handleAction} className="space-y-10">
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

            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-2">AD SOYAD *</Label>
                  <div className="relative group">
                    <User className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-accent" />
                    <Input required value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="h-14 rounded-2xl bg-[#F8FAFC] border-none shadow-inner pl-12 font-bold" placeholder="Adınız Soyadınız" />
                  </div>
                </div>
                {!isProfileCompletion && (
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-2">E-POSTA *</Label>
                    <div className="relative group">
                      <Mail className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-accent" />
                      <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="h-14 rounded-2xl bg-[#F8FAFC] border-none shadow-inner pl-12 font-bold" placeholder="ornek@email.com" />
                    </div>
                  </div>
                )}
              </div>

              {!isProfileCompletion && (
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-2">ŞİFRE *</Label>
                    <div className="relative group">
                      <Lock className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-accent transition-colors" />
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
              )}

              {isProfileCompletion && (role === 'teacher' || role === 'school_admin') && (
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-2">KURUM / OKUL</Label>
                  <div className="relative group">
                    <School className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-accent" />
                    <Input required value={schoolName} onChange={(e) => setSchoolName(e.target.value)} className="h-14 rounded-2xl bg-[#F8FAFC] border-none shadow-inner pl-12 font-bold" placeholder="Görev Yaptığınız Yer" />
                  </div>
                </div>
              )}

              {role === 'student' && (
                <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-2">AKADEMİK HEDEFİNİZ *</Label>
                  <div className="bg-[#F8FAFC] rounded-3xl p-4 border border-primary/5 shadow-inner">
                    <ScrollArea className="h-[300px] pr-4">
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
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <UserPlus className="h-6 w-6" />}
              {isProfileCompletion ? "KURULUMU TAMAMLA VE BAŞLAT" : "HESABI OLUŞTUR VE BAŞLAT"}
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
