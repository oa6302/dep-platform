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
    const categories = ['ORTAOKUL', 'ÜNİVERSİTE', 'MEB SINAVLARI', 'KAMU SINAVLARI', 'AKADEMİK', 'YABANCI DİL', 'ÜNİVERSİTE GEÇİŞ', 'DİNÎ EĞİTİM', 'AKADEMİK DESTEK', 'ÖZEL PROGRAMLAR'];
    const grouped: Record<string, ExamItem[]> = {};
    categories.forEach((category) => { grouped[category] = []; });

    Object.values(EXAM_CONFIGS).forEach((exam: any) => {
      const category = exam.category || 'ÖZEL PROGRAMLAR';
      if (!grouped[category]) grouped[category] = [];
      grouped[category].push(exam);
    });

    if (dbPrograms) {
      dbPrograms.forEach((exam: any) => {
        const category = exam.category || 'ÖZEL PROGRAMLAR';
        if (!grouped[category]) grouped[category] = [];
        if (!grouped[category].find(e => e.id === exam.id)) grouped[category].push(exam);
      });
    }

    return grouped;
  }, [dbPrograms]);

  const handleAction = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!db) return;

    setLoading(true);
    try {
      let finalUser = currentUser;
      if (!isProfileCompletion && authMode === 'register') {
        if (!auth) throw new Error('Auth servisi bulunamadı.');
        const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
        finalUser = credential.user;
      }

      if (!finalUser) throw new Error('Kullanıcı oturumu bulunamadı.');

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
      }

      if (role !== 'student' && schoolName) {
        userData.school = schoolName.trim();
      }

      await setDoc(doc(db, 'users', finalUser.uid), userData, { merge: true });
      toast({ title: 'Sistem Yapılandırıldı', description: 'Profiliniz başarıyla oluşturuldu.' });
      router.replace('/dashboard');
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'İşlem Başarısız', description: error.message });
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
      <div className="max-w-md mx-auto space-y-8 md:space-y-12 animate-in fade-in duration-700 px-4">
        <div className="text-center space-y-3">
           <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter text-primary uppercase text-shadow-deep">SİSTEME DÖN</h2>
           <p className="text-[9px] md:text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.4em] italic">Operational Node v4.8</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-5 md:space-y-6">
           <div className="space-y-1.5 md:space-y-2">
              <Label className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/50 ml-4 italic">E-POSTA</Label>
              <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="h-14 md:h-16 rounded-2xl bg-white border-none shadow-xl font-bold px-6 text-primary" placeholder="ornek@email.com" />
           </div>
           <div className="space-y-1.5 md:space-y-2">
              <Label className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/50 ml-4 italic">ŞİFRE</Label>
              <Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="h-14 md:h-16 rounded-2xl bg-white border-none shadow-xl font-bold px-6 text-primary" placeholder="••••••••" />
           </div>
           <Button type="submit" disabled={loading} className="w-full h-18 md:h-20 rounded-[1.5rem] md:rounded-[2rem] bg-primary hover:bg-accent transition-all font-black text-xs uppercase tracking-[0.4em] shadow-2xl gap-4 text-white">
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <LogIn className="h-5 w-5 text-accent" />} ERİŞİM SAĞLA
           </Button>
           <button type="button" onClick={() => setAuthMode('register')} className="w-full text-center text-[9px] md:text-[10px] font-black uppercase tracking-widest text-primary/40 hover:text-accent transition-colors">YENİ KAYIT OLUŞTUR</button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-10 md:space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-1000 px-4 md:px-6">
      <form onSubmit={handleAction} className="space-y-10 md:space-y-16">
        <div className="space-y-6 md:space-y-10">
          <Label className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.5em] text-muted-foreground/60 block text-center italic">ROLÜNÜZÜ BELİRLEYİN</Label>
          <div className="grid grid-cols-3 gap-4 md:gap-8">
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
                  onClick={() => setRole(r.id as UserRole)}
                  className={cn(
                    'p-4 md:p-10 rounded-[1.5rem] md:rounded-[2.5rem] border-2 transition-all duration-500 flex flex-col items-center gap-2 md:gap-5 group',
                    role === r.id ? 'border-accent bg-white shadow-[0_30px_60px_-10px_rgba(245,158,11,0.2)] scale-[1.05]' : 'border-primary/5 bg-slate-50 opacity-40 hover:opacity-100'
                  )}
                >
                  <Icon className={cn('h-6 w-6 md:h-10 md:w-10 transition-transform group-hover:scale-110', role === r.id ? 'text-accent' : 'text-primary')} />
                  <span className="font-black text-[7px] md:text-[9px] tracking-[0.2em] md:tracking-[0.3em] uppercase">{r.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-6 md:space-y-8">
          <div className="space-y-2 md:space-y-4">
             <Label className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/50 ml-6 italic">TAM AD SOYAD *</Label>
             <div className="relative group">
                <User className="absolute left-6 md:left-7 top-1/2 -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-muted-foreground/40 group-focus-within:text-accent transition-colors" />
                <Input 
                  required 
                  value={displayName} 
                  onChange={(e) => setDisplayName(e.target.value)} 
                  className="h-14 md:h-20 rounded-[1.25rem] md:rounded-[2rem] bg-white border-none shadow-[0_20px_40px_-5px_rgba(0,0,0,0.03)] shadow-inner pl-14 md:pl-16 font-bold text-base md:text-lg focus-visible:ring-accent text-primary" 
                  placeholder="Adınız Soyadınız" 
                />
             </div>
          </div>

          {!isProfileCompletion && (
             <div className="space-y-2 md:space-y-4">
                <Label className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/50 ml-6 italic">SİSTEM E-POSTASI *</Label>
                <div className="relative group">
                   <Mail className="absolute left-6 md:left-7 top-1/2 -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-muted-foreground/40 group-focus-within:text-accent transition-colors" />
                   <Input 
                     type="email" 
                     required 
                     value={email} 
                     onChange={(e) => setEmail(e.target.value)} 
                     className="h-14 md:h-20 rounded-[1.25rem] md:rounded-[2rem] bg-white border-none shadow-[0_20px_40px_-5px_rgba(0,0,0,0.03)] shadow-inner pl-14 md:pl-16 font-bold text-base md:text-lg focus-visible:ring-accent text-primary" 
                     placeholder="ornek@eposta.com" 
                   />
                </div>
             </div>
          )}

          {role === 'student' ? (
             <div className="space-y-2 md:space-y-4">
                <Label className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] text-accent ml-6 italic">EĞİTMEN KODU (OPSİYONEL)</Label>
                <div className="relative group">
                   <Key className="absolute left-6 md:left-7 top-1/2 -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-muted-foreground/40 group-focus-within:text-accent transition-colors" />
                   <Input 
                     value={teacherCode} 
                     onChange={(e) => setTeacherCode(e.target.value.toUpperCase())} 
                     className="h-14 md:h-20 rounded-[1.25rem] md:rounded-[2rem] bg-white border-none shadow-[0_30px_60px_-10px_rgba(0,0,0,0.05)] shadow-inner pl-14 md:pl-16 font-black tracking-[0.2em] md:tracking-[0.3em] text-base md:text-lg uppercase focus-visible:ring-accent text-primary" 
                     placeholder="DK-XXXX-XXXX" 
                   />
                </div>
             </div>
          ) : (
            <div className="space-y-2 md:space-y-4">
               <Label className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/50 ml-6 italic">KURUM ADI *</Label>
               <div className="relative group">
                  <School className="absolute left-6 md:left-7 top-1/2 -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-muted-foreground/40 group-focus-within:text-accent transition-colors" />
                  <Input 
                    required 
                    value={schoolName} 
                    onChange={(e) => setSchoolName(e.target.value)} 
                    className="h-14 md:h-20 rounded-[1.25rem] md:rounded-[2rem] bg-white border-none shadow-inner pl-14 md:pl-16 font-bold text-base md:text-lg text-primary" 
                    placeholder="Çalıştığınız Kurum" 
                  />
               </div>
            </div>
          )}

          {!isProfileCompletion && (
            <div className="space-y-2 md:space-y-4">
               <Label className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/50 ml-6 italic">GÜVENLİ ŞİFRE *</Label>
               <div className="relative group">
                  <Lock className="absolute left-6 md:left-7 top-1/2 -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-muted-foreground/40 group-focus-within:text-accent transition-colors" />
                  <Input 
                    type="password" 
                    required 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    className="h-14 md:h-20 rounded-[1.25rem] md:rounded-[2rem] bg-white border-none shadow-inner pl-14 md:pl-16 font-bold text-base md:text-lg text-primary" 
                    placeholder="Min. 6 Karakter" 
                  />
               </div>
            </div>
          )}
        </div>

        {role === 'student' && (
           <div className="space-y-6 md:space-y-10">
              <Label className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.5em] text-muted-foreground/60 block text-center italic">AKADEMİK HEDEFİNİZİ SEÇİN</Label>
              <div className="bg-[#F8FAFC]/50 rounded-[2.5rem] md:rounded-[4rem] p-6 md:p-12 border-2 border-white shadow-2xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 md:w-48 h-32 md:h-48 bg-accent/5 blur-3xl md:blur-[80px] rounded-full" />
                 <ScrollArea className="h-[300px] md:h-[400px] pr-4 md:pr-8">
                    <div className="space-y-10 md:space-y-12">
                       {Object.entries(categorizedExams).map(([cat, exams]) => exams.length > 0 && (
                          <div key={cat} className="space-y-4 md:space-y-6">
                             <h4 className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] md:tracking-[0.5em] text-primary/30 ml-4 md:ml-6 italic">{cat}</h4>
                             <div className="grid gap-3 md:gap-4">
                                {exams.map((exam) => (
                                   <button
                                     key={exam.id}
                                     type="button"
                                     onClick={() => setTargetExam(exam.id)}
                                     className={cn(
                                       "flex items-center justify-between p-5 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] border-2 transition-all duration-500 text-left group/item",
                                       targetExam === exam.id ? "bg-white border-accent shadow-xl scale-[1.01] md:scale-[1.02]" : "bg-white/40 border-transparent hover:bg-white/80"
                                     )}
                                   >
                                      <div className="flex items-center gap-4 md:gap-8">
                                         <div className={cn("h-12 w-12 md:h-16 md:w-16 rounded-[1rem] md:rounded-[1.5rem] bg-slate-50 flex items-center justify-center shadow-inner group-hover/item:rotate-6 transition-all", targetExam === exam.id ? "bg-accent/10" : "")}>
                                            <Target className={cn("h-5 w-5 md:h-7 md:w-7", targetExam === exam.id ? "text-accent" : "text-primary/20")} />
                                         </div>
                                         <div className="space-y-0.5 md:space-y-1">
                                            <span className={cn("font-black text-sm md:text-lg uppercase tracking-tight block leading-none", targetExam === exam.id ? "text-primary" : "text-primary/60")}>{exam.title}</span>
                                            <span className="text-[7px] md:text-[9px] font-black text-muted-foreground/40 uppercase tracking-[0.1em] md:tracking-[0.2em]">{exam.targetGroup}</span>
                                         </div>
                                      </div>
                                      {targetExam === exam.id && <CheckCircle className="h-5 w-5 md:h-8 md:w-8 text-accent animate-in zoom-in-50" />}
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

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-24 md:h-32 rounded-[2rem] md:rounded-[3.5rem] bg-[#0F172A] hover:bg-accent transition-all duration-700 font-black text-xl md:text-2xl uppercase tracking-[0.3em] md:tracking-[0.5em] gap-6 md:gap-10 shadow-[0_50px_100px_-20px_rgba(15,23,42,0.45)] group/btn text-white"
        >
          {loading ? <Loader2 className="h-8 w-8 md:h-10 md:w-10 animate-spin" /> : <Zap className="h-8 w-8 md:h-10 md:w-10 text-accent group-hover/btn:animate-pulse" />}
          KURULUMU TAMAMLA
        </Button>
      </form>
      {!isProfileCompletion && (
         <button type="button" onClick={() => setAuthMode('login')} className="w-full text-center text-[8px] md:text-[11px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-primary/30 hover:text-primary transition-all italic">ZATEN BİR HESABIM VAR → GİRİŞ YAP</button>
      )}
    </div>
  );
}
