'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth, useFirestore } from '@/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, Lock, User, UserRound, Brain, Key, LogIn, Building, CheckCircle, Zap, Target, Sparkles, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EXAM_CONFIGS } from '@/lib/exam-configs';

interface AuthFormProps {
  mode: 'login' | 'register';
}

type AuthMode = 'login' | 'register';
type UserRole = 'student' | 'teacher' | 'school_admin';

export function AuthForm({ mode: initialMode }: AuthFormProps) {
  const [authMode, setAuthMode] = useState<AuthMode>(initialMode);
  const [role, setRole] = useState<UserRole>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [targetExam, setTargetExam] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const categorizedExams = useMemo(() => {
    const grouped: Record<string, any[]> = {};
    Object.values(EXAM_CONFIGS).forEach((exam: any) => {
      const category = exam.category || 'ÜNİVERSİTE';
      if (!grouped[category]) grouped[category] = [];
      grouped[category].push(exam);
    });
    return grouped;
  }, []);

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    if (newRole !== 'student') setTargetExam('');
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!auth || !db) return;

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = displayName.trim();

    if (!cleanName || !cleanEmail || password.length < 6) {
      toast({ variant: 'destructive', title: 'Validasyon Hatası', description: 'Lütfen tüm alanları doğru doldurun.' });
      return;
    }

    if (role === 'student' && !targetExam) {
      toast({ variant: 'destructive', title: 'Hedef Eksik', description: 'Lütfen sınavınızı seçiniz.' });
      return;
    }

    setLoading(true);
    try {
      const credential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
      await updateProfile(credential.user, { displayName: cleanName });

      const userData: any = {
        uid: credential.user.uid,
        email: cleanEmail,
        displayName: cleanName,
        role,
        targetExam: role === 'student' ? targetExam : null,
        points: 0,
        level: 1,
        totalSolvedQuestions: 0,
        totalCompletedTasks: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        profileCompleted: true,
      };

      if (role === 'teacher') {
        userData.activationCode = `DK-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
        userData.isActivated = false;
      }

      if (role === 'school_admin') {
        userData.isApproved = false; // Kurum yönetici onayı gereklidir
      }

      await setDoc(doc(db, 'users', credential.user.uid), userData);
      toast({ title: 'Kayıt Başarılı', description: 'Profiliniz oluşturuldu.', className: 'bg-primary text-white rounded-2xl' });
      router.replace('/dashboard');
    } catch (error: any) {
      let message = 'Bir hata oluştu.';
      if (error.code === 'auth/email-already-in-use') {
        message = 'Bu e-posta zaten kullanımda.';
        setAuthMode('login');
      }
      toast({ variant: 'destructive', title: 'Kayıt Hatası', description: message });
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!auth) return;
    const cleanEmail = email.trim().toLowerCase();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, cleanEmail, password);
      toast({ title: 'Giriş Başarılı', className: 'bg-primary text-white rounded-2xl' });
      router.replace('/dashboard');
    } catch (error: any) {
      let message = 'E-posta veya şifre hatalı.';
      if (error.code === 'auth/too-many-requests') message = 'Çok fazla deneme yapıldı. Lütfen bekleyin.';
      toast({ variant: 'destructive', title: 'Giriş Hatası', description: message });
    } finally {
      setLoading(false);
    }
  };

  if (authMode === 'login') {
    return (
      <div className="mx-auto w-full max-w-md animate-in fade-in duration-700 px-6 py-10">
        <div className="mb-10 space-y-4 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/5 bg-primary/5 px-4 py-1.5 text-[9px] font-black uppercase italic tracking-widest text-primary">
            <Key className="h-3 w-3 text-accent" /> SECURE LOGIN
          </div>
          <h2 className="text-5xl font-black uppercase italic leading-none tracking-tighter text-primary">GİRİŞ YAP</h2>
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">Akademik takip terminaline bağlan</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <Label className="ml-4 text-[10px] font-black uppercase italic text-primary/80">E-POSTA</Label>
            <div className="group relative">
              <Mail className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-primary/30 transition-colors group-focus-within:text-accent" />
              <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="h-16 rounded-2xl border-none bg-white px-14 font-bold shadow-xl" placeholder="ornek@email.com" />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="ml-4 text-[10px] font-black uppercase italic text-primary/80">ŞİFRE</Label>
            <div className="group relative">
              <Lock className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-primary/30 transition-colors group-focus-within:text-accent" />
              <Input type={showPassword ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)} className="h-16 rounded-2xl border-none bg-white px-14 pr-14 font-bold shadow-xl" placeholder="••••••••" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-primary/30 hover:text-accent">
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>
          <Button type="submit" disabled={loading} className="h-20 w-full gap-4 rounded-[2.5rem] bg-primary text-sm font-black uppercase tracking-[0.35em] text-white shadow-2xl hover:bg-accent transition-all active:scale-95">
            {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <LogIn className="h-6 w-6 text-accent" />}
            {loading ? 'TERMİNAL BAĞLANIYOR' : 'TERMİNALE GİR'}
          </Button>
          <button type="button" onClick={() => setAuthMode('register')} className="w-full text-center text-[10px] font-black uppercase italic tracking-widest text-primary/50 hover:text-accent">YENİ HESAP OLUŞTUR →</button>
        </form>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl animate-in fade-in duration-700 px-6 py-10">
      <div className="mb-10 space-y-4 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-accent/10 bg-accent/10 px-4 py-1.5 text-[9px] font-black uppercase italic tracking-widest text-accent">
          <Sparkles className="h-3 w-3" /> DIGITAL ACADEMY
        </div>
        <h2 className="text-5xl font-black uppercase italic leading-none tracking-tighter text-primary">ÜYE OL</h2>
        <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">Akademik profilini otonom oluştur</p>
      </div>

      <form onSubmit={handleRegister} className="space-y-10">
        <div className="grid grid-cols-3 gap-4">
          {[
            { id: 'student', label: 'ÖĞRENCİ', icon: UserRound, desc: 'YKS / LGS' },
            { id: 'teacher', label: 'EĞİTMEN', icon: Brain, desc: 'Koçluk' },
            { id: 'school_admin', label: 'KURUM', icon: Building, desc: 'Yönetim' },
          ].map((item) => (
            <button key={item.id} type="button" onClick={() => handleRoleChange(item.id as UserRole)} className={cn('flex min-h-[125px] flex-col items-center justify-center gap-2 rounded-[1.7rem] border-2 p-4 transition-all', role === item.id ? 'scale-[1.03] border-accent bg-white shadow-xl' : 'border-primary/5 bg-slate-50 opacity-50')}>
              <item.icon className={cn('h-7 w-7', role === item.id ? 'text-accent' : 'text-primary')} />
              <span className="text-[9px] font-black uppercase tracking-widest text-primary">{item.label}</span>
              <span className="text-center text-[7px] font-bold uppercase text-slate-400">{item.desc}</span>
            </button>
          ))}
        </div>

        <div className="grid gap-6">
          <div className="space-y-2">
            <Label className="ml-4 text-[10px] font-black uppercase italic text-primary/80">AD SOYAD</Label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-primary/30" />
              <Input required value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="h-16 rounded-2xl border-none bg-white px-14 font-bold shadow-xl" placeholder="Adınız Soyadınız" />
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="ml-4 text-[10px] font-black uppercase italic text-primary/80">E-POSTA</Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-primary/30" />
                <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="h-16 rounded-2xl border-none bg-white px-14 font-bold shadow-xl" placeholder="ornek@email.com" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="ml-4 text-[10px] font-black uppercase italic text-primary/80">ŞİFRE</Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-primary/30" />
                <Input type={showPassword ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)} className="h-16 rounded-2xl border-none bg-white px-14 pr-12 font-bold shadow-xl" placeholder="Min. 6 Karakter" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-primary/30">
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {role === 'student' && (
          <div className="space-y-6">
            <div className="text-center">
              <Label className="text-[11px] font-black uppercase italic tracking-[0.35em] text-primary/80">AKADEMİK HEDEFİN</Label>
              <p className="mt-2 text-[8px] font-bold uppercase tracking-widest text-slate-400">Plana göre sınavını seç</p>
            </div>
            <div className="rounded-[2.5rem] border border-primary/5 bg-slate-50/70 p-5 shadow-inner">
              <ScrollArea className="h-[280px] pr-3">
                <div className="space-y-8">
                  {Object.entries(categorizedExams).map(([category, exams]) => (
                    <div key={category} className="space-y-3">
                      <h4 className="ml-2 text-[9px] font-black uppercase text-primary/40 italic">{category}</h4>
                      <div className="grid gap-2">
                        {exams.map((exam) => (
                          <button key={exam.id} type="button" onClick={() => setTargetExam(exam.id)} className={cn('flex items-center justify-between rounded-2xl border-2 p-4 text-left transition-all', targetExam === exam.id ? 'scale-[1.01] border-accent bg-white shadow-lg' : 'border-transparent bg-white/50 hover:bg-white')}>
                            <div className="flex items-center gap-3">
                              <Target className={cn('h-5 w-5', targetExam === exam.id ? 'text-accent' : 'text-primary/20')} />
                              <div>
                                <p className="text-[10px] font-black uppercase text-primary">{exam.title}</p>
                                <p className="mt-1 text-[7px] font-bold uppercase text-slate-400">{exam.description}</p>
                              </div>
                            </div>
                            {targetExam === exam.id && <CheckCircle className="h-5 w-5 text-accent" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        )}

        <Button type="submit" disabled={loading} className="h-20 w-full gap-4 rounded-[2.5rem] bg-primary text-base font-black uppercase tracking-[0.25em] text-white shadow-2xl hover:bg-accent md:h-24 md:text-xl active:scale-95 transition-all">
          {loading ? <Loader2 className="h-7 w-7 animate-spin" /> : <Zap className="h-7 w-7 text-accent" />}
          {loading ? 'PROFİL OLUŞTURULUYOR' : 'KAYDI TAMAMLA'}
        </Button>
        <button type="button" onClick={() => setAuthMode('login')} className="w-full text-center text-[9px] font-black uppercase italic tracking-[0.25em] text-primary/50 hover:text-accent">ZATEN HESABIM VAR → GİRİŞ YAP</button>
      </form>
    </div>
  );
}
