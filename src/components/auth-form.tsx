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
  const [teacherCode, setTeacherCode] = useState('');
  const [loading, setLoading] = useState(false);

  const auth = useAuth();
  const db = useFirestore();
  const { user: currentUser } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  const { data: dbPrograms } = useCollection<any>('programs', orderBy('title', 'asc'));

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
        // Varsayılan aktivasyon kodu üretimi (Öğretmenler için)
        if (role === 'teacher') {
          userData.activationCode = `DK-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
        }
      }

      if (role !== 'student' && schoolName) {
        userData.school = schoolName.trim();
      }

      await setDoc(doc(db, 'users', finalUser.uid), userData, { merge: true });
      
      toast({ 
        title: 'Kayıt Başarılı', 
        description: 'Profiliniz saniyeler içinde yapılandırıldı.',
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
      toast({ variant: 'destructive', title: 'Hata', description: 'Giriş yapılamadı.' });
    } finally {
      setLoading(false);
    }
  };

  if (authMode === 'login' && !isProfileCompletion) {
    return (
      <div className="max-w-md mx-auto space-y-12 px-4 w-full">
        <div className="text-center space-y-3">
           <h2 className="text-4xl font-black italic tracking-tighter text-primary uppercase">SİSTEME GİRİŞ</h2>
           <p className="text-[10px] font-black text-primary/40 uppercase tracking-[0.4em]">Terminal v4.8</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-6">
           <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-4">E-POSTA</Label>
              <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="h-16 rounded-2xl bg-white border-none shadow-xl font-bold px-6" placeholder="ornek@email.com" />
           </div>
           <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-4">ŞİFRE</Label>
              <Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="h-16 rounded-2xl bg-white border-none shadow-xl font-bold px-6" placeholder="••••••••" />
           </div>
           <Button type="submit" disabled={loading} className="w-full h-20 rounded-[2rem] bg-primary hover:bg-accent text-white font-black text-xs uppercase tracking-[0.4em] shadow-2xl gap-4">
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <LogIn className="h-5 w-5 text-accent" />} ERİŞİM SAĞLA
           </Button>
           <button type="button" onClick={() => setAuthMode('register')} className="w-full text-center text-[11px] font-black uppercase tracking-widest text-primary/40 hover:text-accent">YENİ KAYIT OLUŞTUR</button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-12 px-4 w-full">
      <div className="text-center space-y-3">
         <h2 className="text-4xl font-black italic tracking-tighter text-primary uppercase">ÜYE OL / KURULUM</h2>
         <p className="text-[10px] font-black text-primary/40 uppercase tracking-[0.4em]">Master Engine v4.8</p>
      </div>
      <form onSubmit={handleAction} className="space-y-10">
        <div className="grid grid-cols-3 gap-3">
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
                'p-5 rounded-2xl border-2 transition-all flex flex-col items-center gap-3',
                role === r.id ? 'border-accent bg-white shadow-xl scale-105' : 'border-primary/5 bg-slate-50 opacity-40'
              )}
            >
              <r.icon className={cn('h-6 w-6', role === r.id ? 'text-accent' : 'text-primary')} />
              <span className="font-black text-[8px] tracking-widest uppercase">{r.label}</span>
            </button>
          ))}
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
             <Label className="text-[10px] font-black uppercase text-primary/60 ml-4">AD SOYAD</Label>
             <Input required value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="h-16 rounded-2xl bg-white border-none shadow-xl font-bold px-6" placeholder="Adınız Soyadınız" />
          </div>
          {!isProfileCompletion && (
             <>
               <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-primary/60 ml-4">E-POSTA</Label>
                  <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="h-16 rounded-2xl bg-white border-none shadow-xl font-bold px-6" placeholder="ornek@email.com" />
               </div>
               <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-primary/60 ml-4">ŞİFRE</Label>
                  <Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="h-16 rounded-2xl bg-white border-none shadow-xl font-bold px-6" placeholder="Min. 6 Karakter" />
               </div>
             </>
          )}
        </div>

        {role === 'student' && (
           <div className="space-y-6">
              <Label className="text-[11px] font-black uppercase tracking-[0.5em] text-primary/60 block text-center">AKADEMİK HEDEF</Label>
              <div className="bg-slate-50 rounded-[2.5rem] p-4 border-2 border-white shadow-inner">
                 <ScrollArea className="h-[250px] pr-4">
                    <div className="space-y-8">
                       {Object.entries(categorizedExams).map(([cat, exams]) => exams.length > 0 && (
                          <div key={cat} className="space-y-4">
                             <h4 className="text-[9px] font-black uppercase text-primary/30 ml-4 italic">{cat}</h4>
                             <div className="grid gap-2">
                                {exams.map((exam) => (
                                   <button
                                     key={exam.id}
                                     type="button"
                                     onClick={() => setTargetExam(exam.id)}
                                     className={cn(
                                       "flex items-center justify-between p-5 rounded-xl border-2 transition-all text-left",
                                       targetExam === exam.id ? "bg-white border-accent shadow-md scale-[1.01]" : "bg-white/40 border-transparent"
                                     )}
                                   >
                                      <div className="flex items-center gap-4">
                                         <Target className={cn("h-4 w-4", targetExam === exam.id ? "text-accent" : "text-primary/20")} />
                                         <span className="font-black text-xs uppercase">{exam.title}</span>
                                      </div>
                                      {targetExam === exam.id && <CheckCircle className="h-4 w-4 text-accent" />}
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

        <Button type="submit" disabled={loading} className="w-full h-24 rounded-[2.5rem] bg-primary hover:bg-accent text-white font-black text-xl uppercase tracking-[0.4em] shadow-2xl gap-6">
           {loading ? <Loader2 className="h-8 w-8 animate-spin" /> : <Zap className="h-8 w-8 text-accent" />} KAYDI TAMAMLA
        </Button>
        <button type="button" onClick={() => setAuthMode('login')} className="w-full text-center text-[10px] font-black uppercase tracking-[0.3em] text-primary/30 hover:text-primary italic">ZATEN BİR HESABIM VAR → GİRİŞ YAP</button>
      </form>
    </div>
  );
}
