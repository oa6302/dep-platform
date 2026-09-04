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
  serverTimestamp,
  setDoc,
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
  Target,
  Sparkles
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
  icon?: any;
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
  const [loading, setLoading] = useState(false);

  const auth = useAuth();
  const db = useFirestore();
  const { user: currentUser } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  const categorizedExams = useMemo(() => {
    const categories = ['ORTAOKUL', 'ÜNİVERSİTE', 'KAMU SINAVLARI', 'AKADEMİK', 'YABANCI DİL'];
    const grouped: Record<string, ExamItem[]> = {};
    categories.forEach((category) => { grouped[category] = []; });

    Object.values(EXAM_CONFIGS).forEach((exam: any) => {
      const category = exam.category || 'ÜNİVERSİTE';
      if (!grouped[category]) grouped[category] = [];
      grouped[category].push(exam);
    });

    return grouped;
  }, []);

  const handleAction = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!db || !auth) return;

    if (authMode === 'register' && !isProfileCompletion) {
      if (!email || !password || !displayName) {
        toast({ variant: 'destructive', title: 'Hata', description: 'Lütfen tüm alanları doldurun.' });
        return;
      }
    }

    setLoading(true);
    try {
      let finalUser = currentUser;
      
      if (!isProfileCompletion && authMode === 'register') {
        const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
        finalUser = credential.user;
      }

      if (!finalUser) throw new Error('Oturum başlatılamadı.');

      await updateProfile(finalUser, { displayName: displayName.trim() });

      const userData: any = {
        uid: finalUser.uid,
        email: finalUser.email || email.trim().toLowerCase(),
        displayName: displayName.trim(),
        role,
        targetExam,
        updatedAt: serverTimestamp(),
      };

      if (!isProfileCompletion) {
        userData.createdAt = serverTimestamp();
        if (role === 'teacher') {
          userData.activationCode = `DK-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
        }
      }

      if (role !== 'student' && schoolName) {
        userData.school = schoolName.trim();
      }

      await setDoc(doc(db, 'users', finalUser.uid), userData, { merge: true });
      
      toast({ 
        title: 'Kurulum Başarılı', 
        description: 'Profiliniz saniyeler içinde tescillendi.',
        className: "bg-primary text-white rounded-[2rem]"
      });
      
      router.replace('/dashboard');
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Hata', description: error.message });
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
      router.replace('/dashboard');
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Hata', description: 'E-posta veya şifre hatalı.' });
    } finally {
      setLoading(false);
    }
  };

  if (authMode === 'login' && !isProfileCompletion) {
    return (
      <div className="max-w-md mx-auto space-y-12 px-4 w-full animate-in fade-in duration-700">
        <div className="text-center space-y-3">
           <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 text-primary font-black text-[10px] uppercase tracking-widest italic border border-primary/5">
              <Key className="h-3 w-3 text-accent" /> Secure Access
           </div>
           <h2 className="text-5xl font-black italic tracking-tighter text-primary uppercase text-shadow-deep">SİSTEME GİRİŞ</h2>
           <p className="text-[10px] font-black text-primary/40 uppercase tracking-[0.4em] italic">Terminal v4.8</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-6">
           <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-4 italic">E-POSTA TERMİNALİ</Label>
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/20 group-focus-within:text-accent transition-colors" />
                <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="h-16 rounded-2xl bg-white border-none shadow-xl font-bold px-14 focus-visible:ring-accent" placeholder="ornek@email.com" />
              </div>
           </div>
           <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-4 italic">GÜVENLİ ŞİFRE</Label>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/20 group-focus-within:text-accent transition-colors" />
                <Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="h-16 rounded-2xl bg-white border-none shadow-xl font-bold px-14 focus-visible:ring-accent" placeholder="••••••••" />
              </div>
           </div>
           <Button type="submit" disabled={loading} className="w-full h-20 rounded-[2.5rem] bg-primary hover:bg-accent text-white font-black text-sm uppercase tracking-[0.4em] shadow-2xl gap-4 transition-all active:scale-95">
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <LogIn className="h-6 w-6 text-accent" />} ERİŞİM SAĞLA
           </Button>
           <button type="button" onClick={() => setAuthMode('register')} className="w-full text-center text-[11px] font-black uppercase tracking-widest text-primary/40 hover:text-accent italic">YENİ AKADEMİK KAYIT OLUŞTUR</button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-12 px-4 w-full animate-in fade-in duration-1000">
      <div className="text-center space-y-3">
         <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 text-accent font-black text-[10px] uppercase tracking-widest italic border border-accent/10">
            <Sparkles className="h-3 w-3" /> Digital Onboarding
         </div>
         <h2 className="text-5xl font-black italic tracking-tighter text-primary uppercase text-shadow-deep">ÜYE OL / <span className="text-accent">KURULUM</span></h2>
         <p className="text-[10px] font-black text-primary/40 uppercase tracking-[0.4em] italic">Master Engine v4.8</p>
      </div>
      <form onSubmit={handleAction} className="space-y-10">
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

        <div className="space-y-6">
          <div className="space-y-2">
             <Label className="text-[10px] font-black uppercase text-primary/60 ml-4 italic">TAM AD SOYAD</Label>
             <div className="relative group">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/20 group-focus-within:text-accent transition-colors" />
                <Input required value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="h-16 rounded-2xl bg-white border-none shadow-xl font-bold px-14 focus-visible:ring-accent" placeholder="Adınız Soyadınız" />
             </div>
          </div>
          {!isProfileCompletion && (
             <>
               <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-primary/60 ml-4 italic">E-POSTA ADRESİ</Label>
                  <div className="relative group">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/20 group-focus-within:text-accent transition-colors" />
                    <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="h-16 rounded-2xl bg-white border-none shadow-xl font-bold px-14 focus-visible:ring-accent" placeholder="ornek@email.com" />
                  </div>
               </div>
               <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-primary/60 ml-4 italic">GÜVENLİ ŞİFRE</Label>
                  <div className="relative group">
                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/20 group-focus-within:text-accent transition-colors" />
                    <Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="h-16 rounded-2xl bg-white border-none shadow-xl font-bold px-14 focus-visible:ring-accent" placeholder="Min. 6 Karakter" />
                  </div>
               </div>
             </>
          )}
        </div>

        {role === 'student' && (
           <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
              <Label className="text-[11px] font-black uppercase tracking-[0.5em] text-primary/60 block text-center italic">AKADEMİK HEDEF TESCİLİ</Label>
              <div className="bg-slate-50/50 rounded-[3rem] p-6 border-2 border-white shadow-inner">
                 <ScrollArea className="h-[280px] pr-4">
                    <div className="space-y-10">
                       {Object.entries(categorizedExams).map(([cat, exams]) => exams.length > 0 && (
                          <div key={cat} className="space-y-4">
                             <h4 className="text-[10px] font-black uppercase text-primary/30 ml-4 italic tracking-widest">{cat}</h4>
                             <div className="grid gap-3">
                                {exams.map((exam) => (
                                   <button
                                     key={exam.id}
                                     type="button"
                                     onClick={() => setTargetExam(exam.id)}
                                     className={cn(
                                       "flex items-center justify-between p-6 rounded-2xl border-2 transition-all text-left group/card",
                                       targetExam === exam.id ? "bg-white border-accent shadow-2xl scale-[1.02]" : "bg-white/40 border-transparent hover:border-primary/10 hover:bg-white"
                                     )}
                                   >
                                      <div className="flex items-center gap-5">
                                         <Target className={cn("h-5 w-5", targetExam === exam.id ? "text-accent" : "text-primary/20")} />
                                         <div className="space-y-0.5">
                                            <span className="font-black text-xs uppercase tracking-tight text-primary">{exam.title}</span>
                                            <p className="text-[8px] font-bold text-muted-foreground uppercase opacity-40 italic">{exam.targetGroup}</p>
                                         </div>
                                      </div>
                                      {targetExam === exam.id && <CheckCircle className="h-5 w-5 text-accent animate-in zoom-in-50" />}
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

        <Button type="submit" disabled={loading} className="w-full h-24 rounded-[3rem] bg-[#0F172A] hover:bg-accent text-white font-black text-xl uppercase tracking-[0.4em] shadow-[0_40px_80px_-20px_rgba(15,23,42,0.45)] gap-6 transition-all active:scale-95 group">
           {loading ? <Loader2 className="h-8 w-8 animate-spin" /> : <Zap className="h-8 w-8 text-accent group-hover:animate-pulse" />} KAYDI TAMAMLA
        </Button>
        <button type="button" onClick={() => setAuthMode('login')} className="w-full text-center text-[10px] font-black uppercase tracking-[0.3em] text-primary/30 hover:text-primary italic">ZATEN BİR HESABIM VAR → GİRİŞ YAP</button>
      </form>
    </div>
  );
}