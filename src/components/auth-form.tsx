'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { EXAM_CONFIGS } from '@/lib/exam-configs';

interface AuthFormProps {
  mode: 'login' | 'register';
}

type AuthMode = 'login' | 'register';
type UserRole = 'student' | 'teacher' | 'school_admin';

export function AuthForm({
  mode: initialMode,
}: AuthFormProps) {
  const [authMode, setAuthMode] = useState<AuthMode>(initialMode);
  const [role, setRole] = useState<UserRole>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [targetExam, setTargetExam] = useState('');
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

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!db || !auth) return;

    if (!email || !password || !displayName || (role === 'student' && !targetExam)) {
      toast({ variant: 'destructive', title: 'Eksik Bilgi', description: 'Lütfen tüm alanları doldurun.' });
      return;
    }

    setLoading(true);
    try {
      const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const finalUser = credential.user;

      await updateProfile(finalUser, { displayName: displayName.trim() });

      const userData: any = {
        uid: finalUser.uid,
        email: email.trim().toLowerCase(),
        displayName: displayName.trim(),
        role,
        targetExam: role === 'student' ? targetExam : null,
        points: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      if (role === 'teacher') {
        userData.activationCode = `DK-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      }

      await setDoc(doc(db, 'users', finalUser.uid), userData);
      
      toast({ 
        title: 'Kayıt Başarılı', 
        description: 'Akademik profiliniz saniyeler içinde tescillendi.',
        className: "bg-primary text-white rounded-[2rem] shadow-2xl"
      });
      
      router.replace('/dashboard');
    } catch (error: any) {
      toast({ 
        variant: 'destructive', 
        title: 'Kayıt Hatası', 
        description: error.message === 'Firebase: Error (auth/email-already-in-use).' 
          ? 'Bu e-posta adresi zaten kullanımda. Lütfen giriş yapın.' 
          : error.message 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!auth) return;
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      toast({ title: 'Giriş Yapıldı', description: 'Terminal senkronize ediliyor.', className: "bg-primary text-white rounded-xl" });
      router.replace('/dashboard');
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Giriş Hatası', description: 'E-posta veya şifre geçersiz.' });
    } finally {
      setLoading(false);
    }
  };

  if (authMode === 'login') {
    return (
      <div className="max-w-md mx-auto space-y-12 px-6 w-full animate-in fade-in duration-700 py-10">
        <div className="text-center space-y-3">
           <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 text-primary font-black text-[10px] uppercase tracking-widest italic border border-primary/5">
              <Key className="h-3 w-3 text-accent" /> SECURE LOGIN
           </div>
           <h2 className="text-5xl font-black italic tracking-tighter text-primary uppercase leading-none">GİRİŞ YAP</h2>
        </div>
        <form onSubmit={handleLogin} className="space-y-6">
           <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-primary/60 ml-4 italic">E-POSTA</Label>
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/20 group-focus-within:text-accent transition-colors" />
                <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="h-16 rounded-2xl bg-white border-none shadow-xl font-bold px-14 focus-visible:ring-accent text-primary" placeholder="E-posta adresiniz" />
              </div>
           </div>
           <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-primary/60 ml-4 italic">ŞİFRE</Label>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/20 group-focus-within:text-accent transition-colors" />
                <Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="h-16 rounded-2xl bg-white border-none shadow-xl font-bold px-14 focus-visible:ring-accent text-primary" placeholder="••••••••" />
              </div>
           </div>
           <Button type="submit" disabled={loading} className="w-full h-20 rounded-[2.5rem] bg-primary hover:bg-accent text-white font-black text-sm uppercase tracking-[0.4em] shadow-2xl gap-4 border-none transition-all active:scale-95">
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <LogIn className="h-6 w-6 text-accent" />} TERMİNALE GİR
           </Button>
           <button type="button" onClick={() => setAuthMode('register')} className="w-full text-center text-[11px] font-black uppercase tracking-widest text-primary/40 hover:text-accent transition-colors italic">YENİ HESAP OLUŞTUR →</button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-12 px-6 w-full animate-in fade-in duration-1000 py-10">
      <div className="text-center space-y-3">
         <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 text-accent font-black text-[10px] uppercase tracking-widest italic border border-accent/10">
            <Sparkles className="h-3 w-3" /> Digital Academy Setup
         </div>
         <h2 className="text-5xl font-black italic tracking-tighter text-primary uppercase leading-none">ÜYE OL</h2>
      </div>
      <form onSubmit={handleRegister} className="space-y-10">
        <div className="grid grid-cols-3 gap-4">
          {[
            { id: 'student', label: 'ÖĞRENCİ', icon: UserRound },
            { id: 'teacher', label: 'EĞİTMEN', icon: Brain },
            { id: 'school_admin', label: 'KURUM', icon: Building },
          ].map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setRole(r.id as UserRole)}
              className={cn(
                'p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-3',
                role === r.id ? 'border-accent bg-white shadow-2xl scale-105' : 'border-primary/5 bg-slate-50 opacity-40 hover:opacity-100'
              )}
            >
              <r.icon className={cn('h-8 w-8', role === r.id ? 'text-accent' : 'text-primary')} />
              <span className="font-black text-[10px] tracking-widest uppercase italic">{r.label}</span>
            </button>
          ))}
        </div>

        <div className="grid gap-6">
          <div className="space-y-2">
             <Label className="text-[10px] font-black uppercase text-primary/60 ml-4 italic">AD SOYAD</Label>
             <div className="relative group">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/20" />
                <Input required value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="h-16 rounded-2xl bg-white border-none shadow-xl font-bold px-14 focus-visible:ring-accent text-primary" placeholder="Adınız Soyadınız" />
             </div>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-primary/60 ml-4 italic">E-POSTA</Label>
              <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="h-16 rounded-2xl bg-white border-none shadow-xl font-bold px-6 focus-visible:ring-accent text-primary" placeholder="ornek@email.com" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-primary/60 ml-4 italic">ŞİFRE</Label>
              <Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="h-16 rounded-2xl bg-white border-none shadow-xl font-bold px-6 focus-visible:ring-accent text-primary" placeholder="Min. 6 Karakter" />
            </div>
          </div>
        </div>

        {role === 'student' && (
           <div className="space-y-6">
              <Label className="text-[11px] font-black uppercase tracking-[0.5em] text-primary/60 block text-center italic">AKADEMİK HEDEF SEÇİMİ</Label>
              <div className="bg-slate-50/50 rounded-[3rem] p-6 border border-primary/5 shadow-inner">
                 <ScrollArea className="h-[250px] pr-4">
                    <div className="space-y-8">
                       {Object.entries(categorizedExams).map(([cat, exams]) => exams.length > 0 && (
                          <div key={cat} className="space-y-4">
                             <h4 className="text-[10px] font-black uppercase text-primary/30 ml-2 italic tracking-widest">{cat}</h4>
                             <div className="grid gap-3">
                                {exams.map((exam) => (
                                   <button
                                     key={exam.id}
                                     type="button"
                                     onClick={() => setTargetExam(exam.id)}
                                     className={cn(
                                       "flex items-center justify-between p-5 rounded-2xl border-2 transition-all text-left",
                                       targetExam === exam.id ? "bg-white border-accent shadow-xl scale-[1.02]" : "bg-white/40 border-transparent hover:bg-white"
                                     )}
                                   >
                                      <div className="flex items-center gap-4">
                                         <Target className={cn("h-5 w-5", targetExam === exam.id ? "text-accent" : "text-primary/20")} />
                                         <span className="font-black text-xs uppercase text-primary">{exam.title}</span>
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

        <Button type="submit" disabled={loading} className="w-full h-24 rounded-[3rem] bg-[#0F172A] hover:bg-accent text-white font-black text-xl uppercase tracking-[0.4em] shadow-2xl transition-all border-none active:scale-95">
           {loading ? <Loader2 className="h-8 w-8 animate-spin" /> : <Zap className="h-8 w-8 text-accent" />} KAYDI TAMAMLA
        </Button>
        <button type="button" onClick={() => setAuthMode('login')} className="w-full text-center text-[10px] font-black uppercase tracking-[0.3em] text-primary/30 hover:text-primary italic transition-colors">ZATEN BİR HESABIM VAR → GİRİŞ YAP</button>
      </form>
    </div>
  );
}
