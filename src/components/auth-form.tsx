
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
  Loader2, Mail, Lock, User, School, 
  UserRound, Building, CheckCircle2, 
  ChevronRight, Brain, Key, Sparkles,
  Zap, LogIn, UserPlus
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
      toast({ variant: 'destructive', title: 'Eksik Bilgi', description: 'Lütfen e-posta ve şifrenizi girin.' });
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({ title: 'Bağlantı Kuruldu', description: 'Akademik Komuta Merkezi açılıyor...' });
      router.push('/dashboard');
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Giriş Başarısız', description: 'E-posta veya şifre hatalı.' });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !db) return;
    
    if (!email || !password || !displayName || (role === 'student' && !targetExam)) {
      toast({ variant: 'destructive', title: 'Eksik Bilgi', description: 'Lütfen tüm yıldızlı alanları doldurun.' });
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

  return (
    <div className="p-8 md:p-12 space-y-12">
      <div className="flex justify-center">
        <div className="bg-slate-50 p-1.5 rounded-[2rem] flex gap-2">
           <button 
            onClick={() => setAuthMode('login')}
            className={cn(
              "px-8 py-3 rounded-[1.75rem] font-black text-[10px] uppercase tracking-widest transition-all",
              authMode === 'login' ? "bg-primary text-white shadow-xl" : "text-muted-foreground hover:bg-slate-100"
            )}
           >
              Giriş Yap
           </button>
           <button 
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
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <LogIn className="h-6 w-6" />}
              SİSTEME GİRİŞ YAP
            </Button>
          </form>
        </div>
      ) : (
        <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-700">
          <div className="text-center space-y-4">
            <h2 className="text-5xl font-black italic tracking-tighter text-primary uppercase leading-none">PROFİL OLUŞTUR</h2>
            <p className="text-sm font-medium text-muted-foreground italic">Tek sayfada tüm detayları belirleyin ve sistemi başlatın.</p>
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
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-2">AD SOYAD *</Label>
                  <div className="relative group">
                    <User className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-accent" />
                    <Input required value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="h-14 rounded-2xl bg-[#F8FAFC] border-none shadow-inner pl-12 font-bold" placeholder="Adınız Soyadınız" />
                  </div>
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-2">E-POSTA *</Label>
                  <div className="relative group">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-accent" />
                    <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="h-14 rounded-2xl bg-[#F8FAFC] border-none shadow-inner pl-12 font-bold" placeholder="ornek@email.com" />
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-2">ŞİFRE *</Label>
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
              HESABI OLUŞTUR VE BAŞLAT
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
