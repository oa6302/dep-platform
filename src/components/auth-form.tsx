'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  useAuth,
  useFirestore,
  useCollection,
  useUser,
} from '@/firebase';

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';

import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
  orderBy,
} from 'firebase/firestore';

import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

import {
  Loader2,
  Mail,
  Lock,
  User,
  School,
  UserRound,
  Brain,
  Key,
  LogIn,
  Building,
  CheckCircle,
  Zap,
  ShieldCheck,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { EXAM_CONFIGS } from '@/lib/exam-configs';

interface AuthFormProps {
  mode: 'login' | 'register';
  isProfileCompletion?: boolean;
}

type AuthMode = 'login' | 'register';

type UserRole = 'student' | 'teacher' | 'school_admin';

interface ExamItem {
  id: string;
  title: string;
  category?: string;
  targetGroup?: string;
  icon?: React.ComponentType<{ className?: string }>;
  source?: 'config' | 'db';
}

interface UserData {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  updatedAt: ReturnType<typeof serverTimestamp>;
  createdAt?: ReturnType<typeof serverTimestamp>;
  targetExam?: string;
  activationCode?: string;
  school?: string;
  coachId?: string;
}

/**
 * Güvenli ve okunabilir bir eğitmen kodu üretir.
 */
function generateTeacherCode(): string {
  const part1 = Math.random()
    .toString(36)
    .substring(2, 6)
    .toUpperCase();

  const part2 = Math.random()
    .toString(36)
    .substring(2, 6)
    .toUpperCase();

  return `DK-${part1}-${part2}`;
}

function normalizeTeacherCode(code: string): string {
  return code.trim().toUpperCase();
}

function getAuthErrorMessage(error: any): string {
  switch (error?.code) {
    case 'auth/invalid-email':
      return 'Geçerli bir e-posta adresi girin.';
    case 'auth/user-not-found':
      return 'Bu e-posta adresiyle kayıtlı kullanıcı bulunamadı.';
    case 'auth/wrong-password':
      return 'Şifre hatalı.';
    case 'auth/invalid-credential':
      return 'E-posta veya şifre hatalı.';
    case 'auth/email-already-in-use':
      return 'Bu e-posta adresi zaten kullanımda.';
    case 'auth/weak-password':
      return 'Şifre en az 6 karakter olmalıdır.';
    case 'auth/too-many-requests':
      return 'Çok fazla başarısız deneme yapıldı. Lütfen daha sonra tekrar deneyin.';
    case 'auth/network-request-failed':
      return 'İnternet bağlantınızı kontrol edin.';
    case 'permission-denied':
      return 'Bu işlem için yetkiniz bulunmuyor.';
    default:
      return error?.message || 'Beklenmeyen bir hata oluştu.';
  }
}

export function AuthForm({
  mode: initialMode,
  isProfileCompletion = false,
}: AuthFormProps) {
  const [authMode, setAuthMode] = useState<AuthMode>(initialMode);
  const [role, setRole] = useState<UserRole>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [targetExam, setTargetExam] = useState('');
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
    const categories = [
      'ORTAOKUL',
      'ÜNİVERSİTE',
      'MEB SINAVLARI',
      'KAMU SINAVLARI',
      'AKADEMİK',
      'YABANCI DİL',
      'ÜNİVERSİTE GEÇİŞ',
      'DİNÎ EĞİTİM',
      'AKADEMİK DESTEK',
      'ÖZEL PROGRAMLAR',
    ];

    const grouped: Record<string, ExamItem[]> = {};
    categories.forEach((category) => {
      grouped[category] = [];
    });

    const existingIds = new Set<string>();

    Object.values(EXAM_CONFIGS).forEach((exam: any) => {
      if (!exam?.id) return;
      const category = exam.category || 'ÖZEL PROGRAMLAR';
      if (!grouped[category]) grouped[category] = [];
      if (existingIds.has(exam.id)) return;
      existingIds.add(exam.id);
      grouped[category].push({ ...exam, source: 'config' });
    });

    if (dbPrograms) {
      dbPrograms.forEach((exam: any) => {
        if (!exam?.id) return;
        const category = exam.category || 'ÖZEL PROGRAMLAR';
        if (!grouped[category]) grouped[category] = [];
        if (existingIds.has(exam.id)) return;
        existingIds.add(exam.id);
        grouped[category].push({ ...exam, source: 'db' });
      });
    }

    Object.keys(grouped).forEach((category) => {
      grouped[category].sort((a, b) => String(a.title || '').localeCompare(String(b.title || ''), 'tr'));
    });

    return grouped;
  }, [dbPrograms]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!auth) {
      toast({ variant: 'destructive', title: 'Sistem Hatası', description: 'Firebase Authentication başlatılamadı.' });
      return;
    }
    if (!cleanEmail || !password) {
      toast({ variant: 'destructive', title: 'Eksik Bilgi', description: 'E-posta ve şifre gereklidir.' });
      return;
    }
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, cleanEmail, password);
      toast({ title: 'Bağlantı Kuruldu', description: 'Akademik Komuta Merkezi açılıyor...' });
      router.replace('/dashboard');
    } catch (error: any) {
      console.error('Login error:', error);
      toast({ variant: 'destructive', title: 'Giriş Başarısız', description: getAuthErrorMessage(error) });
    } finally {
      setLoading(false);
    }
  };

  const findTeacherByCode = async (code: string): Promise<string | null> => {
    if (!db || !code) return null;
    const normalizedCode = normalizeTeacherCode(code);
    const teacherQuery = query(collection(db, 'users'), where('activationCode', '==', normalizedCode), where('role', '==', 'teacher'));
    const snapshot = await getDocs(teacherQuery);
    if (snapshot.empty) return null;
    return snapshot.docs[0].id;
  };

  const handleAction = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!db) {
      toast({ variant: 'destructive', title: 'Veritabanı Hatası', description: 'Firestore bağlantısı kurulamadı.' });
      return;
    }

    const cleanName = displayName.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanSchool = schoolName.trim();
    const cleanTeacherCode = normalizeTeacherCode(teacherCode);

    if (!cleanName) {
      toast({ variant: 'destructive', title: 'Eksik Bilgi', description: 'Ad soyad bilgisi gereklidir.' });
      return;
    }

    if (role === 'student' && !targetExam) {
      toast({ variant: 'destructive', title: 'Akademik Hedef Eksik', description: 'Lütfen bir sınav veya akademik hedef seçin.' });
      return;
    }

    if ((role === 'teacher' || role === 'school_admin') && !cleanSchool) {
      toast({ variant: 'destructive', title: 'Kurum Bilgisi Eksik', description: 'Okul / kurum bilgisi gereklidir.' });
      return;
    }

    if (!isProfileCompletion && authMode === 'register') {
      if (!auth) {
        toast({ variant: 'destructive', title: 'Sistem Hatası', description: 'Firebase Authentication kullanılamıyor.' });
        return;
      }
      if (!cleanEmail || !password) {
        toast({ variant: 'destructive', title: 'Eksik Bilgi', description: 'E-posta ve şifre gereklidir.' });
        return;
      }
      if (password.length < 6) {
        toast({ variant: 'destructive', title: 'Zayıf Şifre', description: 'Şifre en az 6 karakter olmalıdır.' });
        return;
      }
    }

    setLoading(true);
    try {
      let finalUser = currentUser;
      if (!isProfileCompletion && authMode === 'register') {
        if (!auth) throw new Error('Authentication servisi bulunamadı.');
        const credential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
        finalUser = credential.user;
      }

      if (!finalUser) throw new Error('Kullanıcı oturumu bulunamadı.');

      if (finalUser.displayName !== cleanName) {
        await updateProfile(finalUser, { displayName: cleanName });
      }

      const userData: UserData = {
        uid: finalUser.uid,
        email: finalUser.email || cleanEmail,
        displayName: cleanName,
        role,
        updatedAt: serverTimestamp(),
      };

      if (!isProfileCompletion) {
        userData.createdAt = serverTimestamp();
      }

      if (role === 'student') {
        userData.targetExam = targetExam;
        if (cleanTeacherCode) {
          const teacherId = await findTeacherByCode(cleanTeacherCode);
          if (!teacherId) {
            toast({ variant: 'destructive', title: 'Geçersiz Eğitmen Kodu', description: 'Girdiğiniz eğitmen kodu bulunamadı. Kodu kontrol edip tekrar deneyin.' });
            setLoading(false);
            return;
          }
          userData.coachId = teacherId;
        }
      }

      if (role === 'teacher') {
        userData.school = cleanSchool;
        if (!isProfileCompletion) {
          userData.activationCode = generateTeacherCode();
        }
      }

      if (role === 'school_admin') {
        userData.school = cleanSchool;
      }

      await setDoc(doc(db, 'users', finalUser.uid), userData, { merge: true });
      toast({ title: 'Sistem Yapılandırıldı', description: 'Profiliniz başarıyla oluşturuldu.' });
      router.replace('/dashboard');
    } catch (error: any) {
      console.error('Auth / profile error:', error);
      toast({ variant: 'destructive', title: 'İşlem Başarısız', description: getAuthErrorMessage(error) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-12 md:p-20 space-y-16">
      {!isProfileCompletion && (
        <div className="flex justify-center">
          <div className="bg-slate-100/80 p-2 rounded-[3rem] flex gap-3 backdrop-blur-xl border border-primary/5 shadow-inner">
            <button
              type="button"
              disabled={loading}
              onClick={() => setAuthMode('login')}
              className={cn(
                'px-14 py-5 rounded-[2.5rem] font-black text-[12px] uppercase tracking-[0.3em] transition-all duration-500',
                authMode === 'login' ? 'bg-primary text-white shadow-2xl scale-[1.05]' : 'text-muted-foreground hover:bg-slate-200/50'
              )}
            >
              GİRİŞ YAP
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => setAuthMode('register')}
              className={cn(
                'px-14 py-5 rounded-[2.5rem] font-black text-[12px] uppercase tracking-[0.3em] transition-all duration-500',
                authMode === 'register' ? 'bg-primary text-white shadow-2xl scale-[1.05]' : 'text-muted-foreground hover:bg-slate-200/50'
              )}
            >
              YENİ KAYIT
            </button>
          </div>
        </div>
      )}

      {!isProfileCompletion && authMode === 'login' ? (
        <div className="space-y-14 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="text-center space-y-4">
            <h2 className="text-6xl font-black italic tracking-tighter text-primary uppercase leading-none text-shadow-premium">
              SİSTEME <span className="text-accent">DÖN</span>
            </h2>
            <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.5em] italic">Operational Mode: Standard Node</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-10">
            <div className="space-y-8">
              <div className="space-y-4">
                <Label className="text-[12px] font-black uppercase tracking-[0.4em] text-muted-foreground/60 ml-4 italic">E-POSTA TERMİNALİ</Label>
                <div className="relative group">
                  <Mail className="absolute left-8 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground group-focus-within:text-accent transition-all duration-500" />
                  <Input
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-28 rounded-[3rem] bg-[#F8FAFC] border-2 border-transparent shadow-inner pl-24 font-bold text-2xl focus-visible:bg-white focus-visible:border-accent transition-all duration-500 placeholder:text-muted-foreground/20"
                    placeholder="ornek@email.com"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <Label className="text-[12px] font-black uppercase tracking-[0.4em] text-muted-foreground/60 ml-4 italic">GÜVENLİ ANAHTAR</Label>
                <div className="relative group">
                  <Lock className="absolute left-8 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground group-focus-within:text-accent transition-all duration-500" />
                  <Input
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-28 rounded-[3rem] bg-[#F8FAFC] border-2 border-transparent shadow-inner pl-24 font-bold text-2xl focus-visible:bg-white focus-visible:border-accent transition-all duration-500"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-28 rounded-[3.5rem] bg-primary hover:bg-accent transition-all duration-500 font-black text-xl uppercase tracking-[0.4em] gap-8 shadow-[0_40px_80px_-20px_rgba(15,23,42,0.4)]"
            >
              {loading ? <Loader2 className="h-10 w-10 animate-spin" /> : <LogIn className="h-10 w-10 text-accent" />}
              AKADEMİK ERİŞİM
            </Button>
          </form>
        </div>
      ) : (
        <div className="space-y-14 animate-in fade-in slide-in-from-right-8 duration-1000">
          {!isProfileCompletion && (
            <div className="text-center space-y-4">
              <h2 className="text-6xl font-black italic tracking-tighter text-primary uppercase leading-none text-shadow-premium">
                SİSTEM <span className="text-accent">KURULUMU</span>
              </h2>
              <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.5em] italic">Initialization Phase: Identity Mapping</p>
            </div>
          )}
          <form onSubmit={handleAction} className="space-y-16">
            <div className="space-y-8">
              <Label className="text-[12px] font-black uppercase tracking-[0.5em] text-muted-foreground/60 ml-4 italic text-center block">ROLÜNÜZÜ BELİRLEYİN</Label>
              <div className="grid grid-cols-3 gap-8">
                {[
                  { id: 'student', label: 'ÖĞRENCİ', icon: UserRound },
                  { id: 'teacher', label: 'EĞİTMEN', icon: Brain },
                  { id: 'school_admin', label: 'KURUM', icon: Building },
                ].map((r) => {
                  const Icon = r.icon;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      disabled={loading}
                      onClick={() => setRole(r.id as UserRole)}
                      className={cn(
                        'p-10 rounded-[3rem] border-2 transition-all duration-700 flex flex-col items-center gap-6 group',
                        role === r.id ? 'border-accent bg-accent/5 text-primary shadow-3xl scale-[1.08]' : 'border-primary/5 bg-slate-50 opacity-40 hover:opacity-100'
                      )}
                    >
                      <Icon className={cn('h-14 w-14 transition-transform group-hover:scale-110 duration-500', role === r.id ? 'text-accent' : 'text-primary')} />
                      <span className="font-black text-[11px] tracking-[0.3em]">{r.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-10">
              <div className="grid md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <Label className="text-[12px] font-black uppercase tracking-[0.4em] text-muted-foreground/60 ml-4 italic">TAM AD SOYAD *</Label>
                  <div className="relative group">
                    <User className="absolute left-7 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground group-focus-within:text-accent transition-all duration-500" />
                    <Input
                      required
                      autoComplete="name"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="h-24 rounded-[2.5rem] bg-[#F8FAFC] border-none shadow-inner pl-20 font-bold text-xl"
                      placeholder="Adınız Soyadınız"
                    />
                  </div>
                </div>
                {!isProfileCompletion && (
                  <div className="space-y-4">
                    <Label className="text-[12px] font-black uppercase tracking-[0.4em] text-muted-foreground/60 ml-4 italic">SİSTEM E-POSTASI *</Label>
                    <div className="relative group">
                      <Mail className="absolute left-7 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground group-focus-within:text-accent transition-all duration-500" />
                      <Input
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-24 rounded-[2.5rem] bg-[#F8FAFC] border-none shadow-inner pl-20 font-bold text-xl"
                        placeholder="email@adresi.com"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-10">
                {!isProfileCompletion && (
                  <div className="space-y-4">
                    <Label className="text-[12px] font-black uppercase tracking-[0.4em] text-muted-foreground/60 ml-4 italic">GÜVENLİ ŞİFRE *</Label>
                    <div className="relative group">
                      <Lock className="absolute left-7 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground group-focus-within:text-accent transition-all duration-500" />
                      <Input
                        type="password"
                        autoComplete="new-password"
                        required
                        minLength={6}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-24 rounded-[2.5rem] bg-[#F8FAFC] border-none shadow-inner pl-20 font-bold text-xl"
                        placeholder="Min. 6 Karakter"
                      />
                    </div>
                  </div>
                )}

                {(role === 'teacher' || role === 'school_admin') && (
                  <div className="space-y-4">
                    <Label className="text-[12px] font-black uppercase tracking-[0.4em] text-muted-foreground/60 ml-4 italic">OKUL / KURUM *</Label>
                    <div className="relative group">
                      <School className="absolute left-7 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground group-focus-within:text-accent transition-all duration-500" />
                      <Input
                        required
                        value={schoolName}
                        onChange={(e) => setSchoolName(e.target.value)}
                        className="h-24 rounded-[2.5rem] bg-[#F8FAFC] border-none shadow-inner pl-20 font-bold text-xl"
                        placeholder="Çalıştığınız Kurum"
                      />
                    </div>
                  </div>
                )}

                {role === 'student' && (
                  <div className="space-y-4">
                    <Label className="text-[12px] font-black uppercase tracking-[0.4em] text-accent ml-4 italic">EĞİTMEN KODU (OPSİYONEL)</Label>
                    <div className="relative group">
                      <Key className="absolute left-7 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground group-focus-within:text-accent transition-all duration-500" />
                      <Input
                        value={teacherCode}
                        onChange={(e) => setTeacherCode(e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, ''))}
                        maxLength={11}
                        className="h-24 rounded-[2.5rem] bg-white border-2 border-accent/10 shadow-3xl pl-20 font-black tracking-[0.2em] text-center text-xl uppercase"
                        placeholder="DK-XXXX-XXXX"
                      />
                    </div>
                  </div>
                )}
              </div>

              {role === 'student' && (
                <div className="space-y-10">
                  <Label className="text-[12px] font-black uppercase tracking-[0.5em] text-muted-foreground/60 ml-4 italic text-center block">AKADEMİK HEDEFİNİZİ SEÇİN</Label>
                  <div className="bg-[#F8FAFC] rounded-[4rem] p-10 border border-primary/5 shadow-inner relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 blur-[60px] rounded-full" />
                    <ScrollArea className="h-[450px] pr-8">
                      <div className="space-y-12">
                        {Object.keys(categorizedExams).map((category) => categorizedExams[category]?.length > 0 && (
                          <div key={category} className="space-y-6">
                            <h4 className="text-[11px] font-black uppercase tracking-[0.5em] text-primary/30 ml-6 italic">{category}</h4>
                            <div className="grid grid-cols-1 gap-4">
                              {categorizedExams[category].map((exam) => {
                                const ExamIcon = exam.icon || ShieldCheck;
                                return (
                                  <button
                                    key={exam.id}
                                    type="button"
                                    disabled={loading}
                                    onClick={() => setTargetExam(exam.id)}
                                    className={cn(
                                      'flex items-center justify-between p-8 rounded-[2.5rem] border-2 transition-all duration-500 text-left group/exam',
                                      targetExam === exam.id ? 'bg-white border-accent shadow-3xl scale-[1.03]' : 'bg-white/40 border-transparent hover:bg-white shadow-sm'
                                    )}
                                  >
                                    <div className="flex items-center gap-8">
                                      <div className={cn('h-16 w-16 rounded-2xl flex items-center justify-center transition-transform duration-500 group-hover/exam:rotate-6', targetExam === exam.id ? 'bg-accent text-white' : 'bg-slate-100 text-primary')}>
                                        <ExamIcon className="h-8 w-8" />
                                      </div>
                                      <div className="space-y-1">
                                        <span className={cn('font-black text-lg uppercase tracking-tight block transition-colors', targetExam === exam.id ? 'text-primary' : 'text-primary/60')}>{exam.title}</span>
                                        {exam.targetGroup && <span className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.2em]">{exam.targetGroup}</span>}
                                      </div>
                                    </div>
                                    {targetExam === exam.id && <CheckCircle className="h-8 w-8 text-accent shrink-0" />}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                </div>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-32 rounded-[4rem] bg-primary hover:bg-accent transition-all duration-700 font-black text-2xl uppercase tracking-[0.5em] gap-10 shadow-[0_50px_100px_-20px_rgba(15,23,42,0.45)] group/btn"
            >
              {loading ? <Loader2 className="h-12 w-12 animate-spin" /> : <Zap className="h-12 w-12 text-accent group-hover/btn:animate-pulse" />}
              {isProfileCompletion ? 'KURULUMU TAMAMLA' : 'SİSTEMİ BAŞLAT'}
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
