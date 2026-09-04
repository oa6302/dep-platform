'use client';

import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';

import {
  useAuth,
  useFirestore,
} from '@/firebase';

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';

import {
  doc,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';

import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

import {
  Loader2,
  Mail,
  Lock,
  User,
  UserRound,
  Brain,
  Key,
  LogIn,
  Building,
  CheckCircle,
  Zap,
  Target,
  Sparkles,
  Eye,
  EyeOff,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { EXAM_CONFIGS } from '@/lib/exam-configs';

interface AuthFormProps {
  mode: 'login' | 'register';
}

type AuthMode = 'login' | 'register';

type UserRole =
  | 'student'
  | 'teacher'
  | 'school_admin';

export function AuthForm({
  mode: initialMode,
}: AuthFormProps) {
  const [authMode, setAuthMode] =
    useState<AuthMode>(initialMode);

  const [role, setRole] =
    useState<UserRole>('student');

  const [email, setEmail] = useState('');
  const [password, setPassword] =
    useState('');

  const [displayName, setDisplayName] =
    useState('');

  const [targetExam, setTargetExam] =
    useState('');

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const auth = useAuth();
  const db = useFirestore();

  const router = useRouter();
  const { toast } = useToast();

  /*
   * =========================================================
   * SINAV KATEGORİLERİ
   * =========================================================
   */

  const categorizedExams = useMemo(() => {
    const grouped: Record<
      string,
      any[]
    > = {};

    Object.values(EXAM_CONFIGS).forEach(
      (exam: any) => {
        const category =
          exam.category || 'ÜNİVERSİTE';

        if (!grouped[category]) {
          grouped[category] = [];
        }

        grouped[category].push(exam);
      }
    );

    return grouped;
  }, []);

  /*
   * =========================================================
   * ROL DEĞİŞTİRME
   * =========================================================
   */

  const handleRoleChange = (
    newRole: UserRole
  ) => {
    setRole(newRole);

    /*
     * Öğrenci değilse sınav hedefini
     * temizliyoruz.
     */
    if (newRole !== 'student') {
      setTargetExam('');
    }
  };

  /*
   * =========================================================
   * REGISTER
   * =========================================================
   */

  const handleRegister = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!auth || !db) {
      toast({
        variant: 'destructive',
        title: 'Bağlantı Hatası',
        description:
          'Firebase bağlantısı hazır değil.',
      });

      return;
    }

    const cleanEmail =
      email.trim().toLowerCase();

    const cleanName =
      displayName.trim();

    /*
     * Temel validasyon
     */

    if (!cleanName) {
      toast({
        variant: 'destructive',
        title: 'Ad Soyad Eksik',
        description:
          'Lütfen adınızı ve soyadınızı giriniz.',
      });

      return;
    }

    if (!cleanEmail) {
      toast({
        variant: 'destructive',
        title: 'E-posta Eksik',
        description:
          'Lütfen geçerli bir e-posta adresi giriniz.',
      });

      return;
    }

    if (!password) {
      toast({
        variant: 'destructive',
        title: 'Şifre Eksik',
        description:
          'Lütfen bir şifre oluşturunuz.',
      });

      return;
    }

    if (password.length < 6) {
      toast({
        variant: 'destructive',
        title: 'Şifre Çok Kısa',
        description:
          'Şifreniz en az 6 karakter olmalıdır.',
      });

      return;
    }

    /*
     * Öğrenci için hedef sınav zorunlu
     */

    if (
      role === 'student' &&
      !targetExam
    ) {
      toast({
        variant: 'destructive',
        title: 'Akademik Hedef Eksik',
        description:
          'Lütfen hazırlanacağınız sınavı seçiniz.',
      });

      return;
    }

    setLoading(true);

    try {
      /*
       * Firebase Authentication hesabı
       */

      const credential =
        await createUserWithEmailAndPassword(
          auth,
          cleanEmail,
          password
        );

      const finalUser =
        credential.user;

      /*
       * Firebase profil adı
       */

      await updateProfile(
        finalUser,
        {
          displayName: cleanName,
        }
      );

      /*
       * Kullanıcı Firestore profili
       */

      const userData: any = {
        uid: finalUser.uid,

        email: cleanEmail,

        displayName: cleanName,

        role,

        targetExam:
          role === 'student'
            ? targetExam
            : null,

        points: 0,

        level: 1,

        totalSolvedQuestions: 0,

        totalCompletedTasks: 0,

        createdAt:
          serverTimestamp(),

        updatedAt:
          serverTimestamp(),

        profileCompleted: true,
      };

      /*
       * Öğretmen aktivasyon kodu
       */

      if (role === 'teacher') {
        userData.activationCode =
          `DK-${Math.random()
            .toString(36)
            .substring(2, 6)
            .toUpperCase()}-${Math.random()
            .toString(36)
            .substring(2, 6)
            .toUpperCase()}`;

        userData.isActivated = false;
      }

      /*
       * Kurum yöneticisi
       */

      if (role === 'school_admin') {
        userData.isApproved = false;
      }

      /*
       * Firestore kullanıcı kaydı
       */

      await setDoc(
        doc(
          db,
          'users',
          finalUser.uid
        ),
        userData
      );

      /*
       * Başarılı
       */

      toast({
        title: 'Kayıt Başarılı',
        description:
          'Akademik profiliniz oluşturuldu. Dashboard hazırlanıyor.',
        className:
          'bg-primary text-white rounded-[2rem] shadow-2xl',
      });

      /*
       * Dashboard
       */

      router.replace('/dashboard');

    } catch (error: any) {
      console.error(
        'Register Error:',
        error
      );

      let title =
        'Kayıt Başarısız';

      let message =
        'Kayıt sırasında beklenmeyen bir hata oluştu.';

      switch (error?.code) {
        case 'auth/email-already-in-use':
          title =
            'E-posta Kullanımda';
          message =
            'Bu e-posta adresiyle zaten bir hesap bulunuyor.';
          setAuthMode('login');
          break;

        case 'auth/invalid-email':
          title =
            'Geçersiz E-posta';
          message =
            'Lütfen geçerli bir e-posta adresi giriniz.';
          break;

        case 'auth/weak-password':
          title =
            'Zayıf Şifre';
          message =
            'Şifreniz en az 6 karakter olmalıdır.';
          break;

        case 'auth/network-request-failed':
          title =
            'Bağlantı Hatası';
          message =
            'İnternet bağlantınızı kontrol edip tekrar deneyiniz.';
          break;

        case 'auth/operation-not-allowed':
          title =
            'Kayıt Kullanılamıyor';
          message =
            'E-posta ile kayıt Firebase tarafında etkin değil.';
          break;

        default:
          break;
      }

      toast({
        variant: 'destructive',
        title,
        description: message,
      });

    } finally {
      setLoading(false);
    }
  };

  /*
   * =========================================================
   * LOGIN
   * =========================================================
   */

  const handleLogin = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!auth) {
      toast({
        variant: 'destructive',
        title: 'Bağlantı Hatası',
        description:
          'Firebase bağlantısı hazır değil.',
      });

      return;
    }

    const cleanEmail =
      email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      toast({
        variant: 'destructive',
        title: 'Eksik Bilgi',
        description:
          'E-posta ve şifre alanlarını doldurunuz.',
      });

      return;
    }

    setLoading(true);

    try {
      await signInWithEmailAndPassword(
        auth,
        cleanEmail,
        password
      );

      toast({
        title: 'Giriş Başarılı',
        description:
          'Akademik terminal senkronize ediliyor.',
        className:
          'bg-primary text-white rounded-2xl',
      });

      router.replace('/dashboard');

    } catch (error: any) {
      console.error(
        'Login Error:',
        error
      );

      let message =
        'E-posta veya şifre hatalı.';

      switch (error?.code) {
        case 'auth/user-not-found':
          message =
            'Bu e-posta ile kayıtlı bir hesap bulunamadı.';
          break;

        case 'auth/wrong-password':
          message =
            'Şifre hatalı. Lütfen tekrar deneyiniz.';
          break;

        case 'auth/invalid-credential':
          message =
            'E-posta veya şifre hatalı.';
          break;

        case 'auth/too-many-requests':
          message =
            'Çok fazla başarısız giriş denemesi yapıldı. Lütfen daha sonra tekrar deneyiniz.';
          break;

        case 'auth/network-request-failed':
          message =
            'İnternet bağlantınızı kontrol ediniz.';
          break;

        default:
          break;
      }

      toast({
        variant: 'destructive',
        title: 'Giriş Hatası',
        description: message,
      });

    } finally {
      setLoading(false);
    }
  };

  /*
   * =========================================================
   * LOGIN SCREEN
   * =========================================================
   */

  if (authMode === 'login') {
    return (
      <div className="mx-auto w-full max-w-md animate-in fade-in duration-700 px-6 py-10">

        <div className="mb-10 space-y-4 text-center">

          <div className="inline-flex items-center gap-2 rounded-full border border-primary/5 bg-primary/5 px-4 py-1.5 text-[9px] font-black uppercase italic tracking-widest text-primary">
            <Key className="h-3 w-3 text-accent" />
            SECURE LOGIN
          </div>

          <h2 className="text-5xl font-black uppercase italic leading-none tracking-tighter text-primary">
            GİRİŞ YAP
          </h2>

          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">
            Akademik takip sistemine giriş yap
          </p>

        </div>

        <form
          onSubmit={handleLogin}
          className="space-y-6"
        >

          {/* E-POSTA */}

          <div className="space-y-2">

            <Label className="ml-4 text-[10px] font-black uppercase italic text-primary/80">
              E-POSTA
            </Label>

            <div className="group relative">

              <Mail className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-primary/30 transition-colors group-focus-within:text-accent" />

              <Input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                className="h-16 rounded-2xl border-none bg-white px-14 font-bold text-primary shadow-xl focus-visible:ring-accent"
                placeholder="E-posta adresiniz"
              />

            </div>
          </div>

          {/* ŞİFRE */}

          <div className="space-y-2">

            <Label className="ml-4 text-[10px] font-black uppercase italic text-primary/80">
              ŞİFRE
            </Label>

            <div className="group relative">

              <Lock className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-primary/30 transition-colors group-focus-within:text-accent" />

              <Input
                type={
                  showPassword
                    ? 'text'
                    : 'password'
                }
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                className="h-16 rounded-2xl border-none bg-white px-14 pr-14 font-bold text-primary shadow-xl focus-visible:ring-accent"
                placeholder="••••••••"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    (value) => !value
                  )
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 text-primary/30 transition-colors hover:text-accent"
                aria-label={
                  showPassword
                    ? 'Şifreyi gizle'
                    : 'Şifreyi göster'
                }
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>

            </div>
          </div>

          {/* GİRİŞ */}

          <Button
            type="submit"
            disabled={loading}
            className="h-20 w-full gap-4 rounded-[2.5rem] border-none bg-primary text-sm font-black uppercase tracking-[0.35em] text-white shadow-2xl transition-all hover:bg-accent active:scale-95"
          >

            {loading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <LogIn className="h-6 w-6 text-accent" />
            )}

            {loading
              ? 'GİRİŞ YAPILIYOR'
              : 'TERMİNALE GİR'}

          </Button>

          <button
            type="button"
            onClick={() =>
              setAuthMode('register')
            }
            className="w-full text-center text-[10px] font-black uppercase italic tracking-widest text-primary/50 transition-colors hover:text-accent"
          >
            YENİ HESAP OLUŞTUR →
          </button>

        </form>
      </div>
    );
  }

  /*
   * =========================================================
   * REGISTER SCREEN
   * =========================================================
   */

  return (
    <div className="mx-auto w-full max-w-2xl animate-in fade-in duration-700 px-6 py-10">

      {/* HEADER */}

      <div className="mb-10 space-y-4 text-center">

        <div className="inline-flex items-center gap-2 rounded-full border border-accent/10 bg-accent/10 px-4 py-1.5 text-[9px] font-black uppercase italic tracking-widest text-accent">
          <Sparkles className="h-3 w-3" />
          DIGITAL ACADEMY
        </div>

        <h2 className="text-5xl font-black uppercase italic leading-none tracking-tighter text-primary">
          ÜYE OL
        </h2>

        <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">
          Akademik profilini birkaç adımda oluştur
        </p>

      </div>

      <form
        onSubmit={handleRegister}
        className="space-y-10"
      >

        {/* =================================================
            ROLE
        ================================================= */}

        <div className="grid grid-cols-3 gap-3 md:gap-4">

          {[
            {
              id: 'student',
              label: 'ÖĞRENCİ',
              icon: UserRound,
              description:
                'YKS / LGS hazırlık',
            },
            {
              id: 'teacher',
              label: 'EĞİTMEN',
              icon: Brain,
              description:
                'Öğrenci takibi',
            },
            {
              id: 'school_admin',
              label: 'KURUM',
              icon: Building,
              description:
                'Kurum yönetimi',
            },
          ].map((item) => {

            const Icon =
              item.icon;

            const active =
              role === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() =>
                  handleRoleChange(
                    item.id as UserRole
                  )
                }
                className={cn(
                  'flex min-h-[125px] flex-col items-center justify-center gap-2 rounded-[1.7rem] border-2 p-4 transition-all',
                  active
                    ? 'scale-[1.03] border-accent bg-white shadow-xl'
                    : 'border-primary/5 bg-slate-50 opacity-50 hover:opacity-100'
                )}
              >

                <Icon
                  className={cn(
                    'h-7 w-7',
                    active
                      ? 'text-accent'
                      : 'text-primary'
                  )}
                />

                <span className="text-[9px] font-black uppercase italic tracking-widest text-primary">
                  {item.label}
                </span>

                <span className="text-center text-[7px] font-bold uppercase tracking-wide text-slate-400">
                  {item.description}
                </span>

              </button>
            );
          })}

        </div>

        {/* =================================================
            PERSONAL INFORMATION
        ================================================= */}

        <div className="grid gap-6">

          {/* NAME */}

          <div className="space-y-2">

            <Label className="ml-4 text-[10px] font-black uppercase italic text-primary/80">
              AD SOYAD
            </Label>

            <div className="relative">

              <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-primary/30" />

              <Input
                required
                autoComplete="name"
                value={displayName}
                onChange={(e) =>
                  setDisplayName(
                    e.target.value
                  )
                }
                className="h-16 rounded-2xl border-none bg-white px-14 font-bold text-primary shadow-xl focus-visible:ring-accent"
                placeholder="Adınız Soyadınız"
              />

            </div>

          </div>

          {/* EMAIL + PASSWORD */}

          <div className="grid gap-6 md:grid-cols-2">

            <div className="space-y-2">

              <Label className="ml-4 text-[10px] font-black uppercase italic text-primary/80">
                E-POSTA
              </Label>

              <div className="relative">

                <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-primary/30" />

                <Input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(
                      e.target.value
                    )
                  }
                  className="h-16 rounded-2xl border-none bg-white px-14 font-bold text-primary shadow-xl focus-visible:ring-accent"
                  placeholder="ornek@email.com"
                />

              </div>

            </div>

            <div className="space-y-2">

              <Label className="ml-4 text-[10px] font-black uppercase italic text-primary/80">
                ŞİFRE
              </Label>

              <div className="relative">

                <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-primary/30" />

                <Input
                  type={
                    showPassword
                      ? 'text'
                      : 'password'
                  }
                  required
                  minLength={6}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) =>
                    setPassword(
                      e.target.value
                    )
                  }
                  className="h-16 rounded-2xl border-none bg-white px-14 pr-12 font-bold text-primary shadow-xl focus-visible:ring-accent"
                  placeholder="Min. 6 karakter"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (value) => !value
                    )
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-primary/30 hover:text-accent"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>

              </div>

            </div>

          </div>
        </div>

        {/* =================================================
            STUDENT TARGET
        ================================================= */}

        {role === 'student' && (
          <div className="space-y-6">

            <div className="text-center">

              <Label className="text-[11px] font-black uppercase italic tracking-[0.35em] text-primary/80">
                AKADEMİK HEDEFİN
              </Label>

              <p className="mt-2 text-[8px] font-bold uppercase tracking-widest text-slate-400">
                Sana özel çalışma planının oluşturulması için sınavını seç
              </p>

            </div>

            <div className="rounded-[2.5rem] border border-primary/5 bg-slate-50/70 p-5 shadow-inner md:p-6">

              <ScrollArea className="h-[280px] pr-3">

                <div className="space-y-8">

                  {Object.entries(
                    categorizedExams
                  ).map(
                    ([category, exams]) => {

                      if (
                        !exams?.length
                      ) {
                        return null;
                      }

                      return (
                        <div
                          key={category}
                          className="space-y-3"
                        >

                          <h4 className="ml-2 text-[9px] font-black uppercase italic tracking-[0.2em] text-primary/40">
                            {category}
                          </h4>

                          <div className="grid gap-2">

                            {exams.map(
                              (
                                exam
                              ) => {

                                const selected =
                                  targetExam ===
                                  exam.id;

                                return (
                                  <button
                                    key={
                                      exam.id
                                    }
                                    type="button"
                                    onClick={() =>
                                      setTargetExam(
                                        exam.id
                                      )
                                    }
                                    className={cn(
                                      'flex items-center justify-between rounded-2xl border-2 p-4 text-left transition-all',
                                      selected
                                        ? 'scale-[1.01] border-accent bg-white shadow-lg'
                                        : 'border-transparent bg-white/50 hover:bg-white'
                                    )}
                                  >

                                    <div className="flex min-w-0 items-center gap-3">

                                      <Target
                                        className={cn(
                                          'h-5 w-5 shrink-0',
                                          selected
                                            ? 'text-accent'
                                            : 'text-primary/20'
                                        )}
                                      />

                                      <div className="min-w-0">

                                        <p className="truncate text-[10px] font-black uppercase text-primary">
                                          {exam.title}
                                        </p>

                                        {exam.description && (
                                          <p className="mt-1 line-clamp-1 text-[7px] font-bold uppercase tracking-wide text-slate-400">
                                            {
                                              exam.description
                                            }
                                          </p>
                                        )}

                                      </div>

                                    </div>

                                    {selected && (
                                      <CheckCircle className="h-5 w-5 shrink-0 text-accent" />
                                    )}

                                  </button>
                                );
                              }
                            )}

                          </div>
                        </div>
                      );
                    }
                  )}

                </div>

              </ScrollArea>

            </div>

          </div>
        )}

        {/* =================================================
            REGISTER BUTTON
        ================================================= */}

        <Button
          type="submit"
          disabled={loading}
          className="h-20 w-full gap-4 rounded-[2.5rem] border-none bg-primary text-base font-black uppercase tracking-[0.25em] text-white shadow-2xl transition-all hover:bg-accent active:scale-[0.98] md:h-24 md:text-xl"
        >

          {loading ? (
            <Loader2 className="h-7 w-7 animate-spin" />
          ) : (
            <Zap className="h-7 w-7 text-accent" />
          )}

          {loading
            ? 'PROFİL OLUŞTURULUYOR'
            : 'KAYDI TAMAMLA'}

        </Button>

        {/* =================================================
            LOGIN
        ================================================= */}

        <button
          type="button"
          onClick={() =>
            setAuthMode('login')
          }
          className="w-full text-center text-[9px] font-black uppercase italic tracking-[0.25em] text-primary/50 transition-colors hover:text-accent"
        >
          ZATEN BİR HESABIM VAR → GİRİŞ YAP
        </button>

      </form>
    </div>
  );
}
