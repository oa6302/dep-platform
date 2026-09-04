
'use client';

import { useUser, useDoc, useFirestore } from '@/firebase';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

import {
  LayoutDashboard,
  Calendar,
  BookOpen,
  BarChart3,
  Trophy,
  Link as LinkIcon,
  Award,
  Clock,
  Brain,
  Menu,
  X,
  Loader2,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { useState, useEffect, Suspense } from 'react';

import { StudentView } from '@/components/dashboard/student-view';

import {
  doc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';

import {
  format,
  addDays,
  differenceInDays,
  parseISO,
  isBefore,
} from 'date-fns';

import { tr } from 'date-fns/locale';

import { EXAM_CONFIGS } from '@/lib/exam-configs';
import { YKS_TM_TOPICS } from '@/lib/curriculum-data';

/* =========================================================
   AYARLAR
========================================================= */

const DEFAULT_PLAN_START = '2026-09-01';
const AYT_START_DATE = '2026-12-01';

/* =========================================================
   TİPLER
========================================================= */

type CompletedTopics = Record<string, string[]>;

interface StudyBlock {
  id: string;
  lesson: string;
  topic: string;
  status: 'planned' | 'done' | 'skipped';

  phase1: {
    type: string;
    time: string;
  };

  youtubeUrl: string;
  mebiUrl: string;
  pdfUrl: string;

  testYoutubeUrl: string;
  testUrl: string;
  testPdfUrl: string;
}

interface StudyDay {
  date: string;
  day: string;
  blocks: StudyBlock[];
}

/* =========================================================
   ADAPTİF PLAN MOTORU v24.0
========================================================= */

export const generateAdaptivePlan = (
  startDateStr: string,
  completedTopics: CompletedTopics = {}
): StudyDay[] => {
  const config = EXAM_CONFIGS['YKS_EA'];

  if (!config) {
    console.error('YKS_EA sınav konfigürasyonu bulunamadı.');
    return [];
  }

  const startDate = parseISO(startDateStr);
  const aytDate = parseISO(AYT_START_DATE);
  const endDate = parseISO(config.examDate);

  const daysInterval = differenceInDays(endDate, startDate);

  if (daysInterval < 0) {
    return [];
  }

  const getTopics = (lesson: string): string[] => {
    let topics = YKS_TM_TOPICS[lesson];
    if (!topics) {
      const normalizedLesson = lesson
        .replace(/^TYT\s+/i, '')
        .replace(/^AYT\s+/i, '')
        .trim();
      topics = YKS_TM_TOPICS[normalizedLesson];
    }
    return Array.isArray(topics) ? topics : [];
  };

  const getRemainingTopics = (lesson: string): string[] => {
    const allTopics = getTopics(lesson);
    const completed = completedTopics[lesson] || [];
    return allTopics.filter((topic) => !completed.includes(topic));
  };

  const lessonPointers: Record<string, number> = {};
  const plan: StudyDay[] = [];

  for (let i = 0; i <= daysInterval; i++) {
    const currentDate = addDays(startDate, i);
    const dateStr = format(currentDate, 'yyyy-MM-dd');
    const dayName = format(currentDate, 'EEEE', { locale: tr });

    const isAytStarted = !isBefore(currentDate, aytDate);
    let currentLessons: string[];

    if (isAytStarted) {
      currentLessons = [...config.tytLessons.slice(0, 2), ...config.aytLessons];
    } else {
      currentLessons = [...config.tytLessons];
    }

    if (currentLessons.length === 0) continue;

    const dailyBlocks: StudyBlock[] = [];
    
    // 1 & 2. ANA DERS BLOKLARI (SAYISAL/SÖZEL)
    for (let j = 0; j < 2; j++) {
      const lessonIndex = (i * 2 + j) % currentLessons.length;
      const lesson = currentLessons[lessonIndex];

      if (lessonPointers[lesson] === undefined) lessonPointers[lesson] = 0;

      const allTopics = getTopics(lesson);
      const remainingTopics = getRemainingTopics(lesson);

      let topic = 'Genel Tekrar';
      if (remainingTopics.length > 0) {
        const pointer = lessonPointers[lesson] % remainingTopics.length;
        topic = remainingTopics[pointer];
      } else if (allTopics.length > 0) {
        const pointer = lessonPointers[lesson] % allTopics.length;
        topic = allTopics[pointer];
      }

      lessonPointers[lesson]++;

      const topicQuery = encodeURIComponent(`${lesson} ${topic}`);
      const testQuery = encodeURIComponent(`${lesson} ${topic} soru çözümü`);
      const testSearchQuery = encodeURIComponent(`${lesson} ${topic} test`);

      dailyBlocks.push({
        id: `block_${dateStr}_${j}`,
        lesson,
        topic,
        status: 'planned',
        phase1: {
          type: 'KONU ÇALIŞMA',
          time: j === 0 ? '10:00' : '11:00',
        },
        youtubeUrl: `https://www.youtube.com/results?search_query=${topicQuery}`,
        mebiUrl: `https://www.eba.gov.tr/arama?q=${topicQuery}`,
        pdfUrl: `https://ogmmateryal.eba.gov.tr/arama?q=${topicQuery}`,
        testYoutubeUrl: `https://www.youtube.com/results?search_query=${testQuery}`,
        testUrl: `https://www.eba.gov.tr/arama?q=${testSearchQuery}`,
        testPdfUrl: `https://ogmmateryal.eba.gov.tr/arama?q=${testSearchQuery}`,
      });
    }

    // 3. DÜNÜN TEKRARI (12:00)
    dailyBlocks.push({
      id: `block_${dateStr}_review`,
      lesson: 'STRATEJİK TEKRAR',
      topic: 'DÜNÜN TEKRARI',
      status: 'planned',
      phase1: {
        type: 'HIZLI TARAMA',
        time: '12:00',
      },
      youtubeUrl: '',
      mebiUrl: '',
      pdfUrl: '',
      testYoutubeUrl: '',
      testUrl: '',
      testPdfUrl: '',
    });

    // 4. PARAGRAF ÇALIŞMASI (15:00)
    dailyBlocks.push({
      id: `block_${dateStr}_paragraf`,
      lesson: 'TYT TÜRKÇE',
      topic: '20 ADET PARAGRAF',
      status: 'planned',
      phase1: {
        type: 'SORU ÇÖZÜMÜ',
        time: '15:00',
      },
      youtubeUrl: '',
      mebiUrl: '',
      pdfUrl: '',
      testYoutubeUrl: 'https://www.youtube.com/results?search_query=paragraf+soru+çözümü+teknikleri',
      testUrl: 'https://www.eba.gov.tr/arama?q=paragraf+testi',
      testPdfUrl: 'https://ogmmateryal.eba.gov.tr/arama?q=paragraf+testi',
    });

    // Zaman sırasına göre sırala
    dailyBlocks.sort((a, b) => a.phase1.time.localeCompare(b.phase1.time));

    plan.push({
      date: dateStr,
      day: dayName,
      blocks: dailyBlocks,
    });
  }

  return plan;
};

/* =========================================================
   DASHBOARD
========================================================= */

function DashboardContent() {
  const { user } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const simulateUid = searchParams.get('simulate');
  
  const targetUid = simulateUid || user?.uid;

  const { data: userData, loading: docLoading } = useDoc<any>(targetUid ? `users/${targetUid}` : null);
  const { data: studyPlan, loading: planLoading } = useDoc<any>(targetUid ? `studyPlans/${targetUid}` : null);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !db || !user || simulateUid) return;

    const initProfile = async () => {
      try {
        if (!docLoading && !userData) {
          await setDoc(doc(db, 'users', user.uid), {
            uid: user.uid,
            displayName: 'Misafir Öğrenci',
            role: 'student',
            targetExam: 'YKS_EA',
            points: 1250,
            completedTopics: {},
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          }, { merge: true });
          return;
        }

        if (!planLoading && !studyPlan && userData) {
          const adaptivePlan = generateAdaptivePlan(DEFAULT_PLAN_START, userData.completedTopics || {});
          await setDoc(doc(db, 'studyPlans', user.uid), {
            userId: user.uid,
            startDate: DEFAULT_PLAN_START,
            endDate: format(addDays(parseISO(DEFAULT_PLAN_START), 14), 'yyyy-MM-dd'),
            aytStartDate: AYT_START_DATE,
            masterPlan: adaptivePlan,
            updatedAt: serverTimestamp(),
          }, { merge: true });
        }
      } catch (error) {
        console.error('Profil / plan oluşturma hatası:', error);
      }
    };

    initProfile();
  }, [mounted, db, user, simulateUid, userData, studyPlan, docLoading, planLoading]);

  if (!mounted) return null;

  const navItems = [
    { id: 'dashboard', label: 'Anasayfa', icon: LayoutDashboard, path: '/dashboard' },
    { id: 'planning', label: 'Akademik Terminal', icon: Calendar, path: '/dashboard/planning' },
    { id: 'topics', label: 'Konu Takibi', icon: BookOpen, path: '/dashboard/topics' },
    { id: 'test-analysis', label: 'Test Analizi', icon: BarChart3, path: '/dashboard/test-analysis' },
    { id: 'deneme-analysis', label: 'Deneme Analizi', icon: Trophy, path: '/dashboard/deneme-analysis' },
    { id: 'links', label: 'Kaynaklar', icon: LinkIcon, path: '/dashboard/links' },
    { id: 'awards', label: 'Ödüller', icon: Award, path: '/dashboard/awards' },
    { id: 'pomodoro', label: 'Pomodoro', icon: Clock, path: '/dashboard/pomodoro' },
    { id: 'ai-assistant', label: 'AI Asistan', icon: Brain, path: '/dashboard/ai-analysis' },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row relative overflow-hidden">
      {/* MOBILE HEADER */}
      <header className="md:hidden h-20 bg-white border-b border-slate-100 flex items-center justify-between px-6 sticky top-0 z-[60]">
        <div className="text-xl font-black italic tracking-tighter text-primary uppercase">
          DEK <span className="text-accent">AI</span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)} className="rounded-xl h-12 w-12 bg-slate-50">
          {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </header>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[55] md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* SIDEBAR - v15.0 VISUAL MATCH */}
      <aside className={cn(`w-[280px] bg-white border-r border-slate-100 flex flex-col fixed md:sticky inset-y-0 left-0 z-[58] transition-transform duration-500 md:translate-x-0 h-screen`,
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        <div className="p-8 border-b border-slate-50 hidden md:block">
          <div className="text-2xl font-black italic tracking-tighter text-primary uppercase leading-none">
            DEK <span className="text-accent">AI</span>
          </div>
        </div>

        <ScrollArea className="flex-1 p-6">
          <nav className="space-y-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    router.push(item.path);
                    setSidebarOpen(false);
                  }}
                  className={cn(`w-full flex items-center gap-4 px-6 py-4 rounded-[1.25rem] transition-all font-black text-[11px] uppercase tracking-widest text-left group`,
                    isActive ? `bg-[#0F172A] text-white shadow-[0_20px_40px_-10px_rgba(15,23,42,0.4)]` : `text-primary/40 hover:bg-slate-50 hover:text-primary`
                  )}
                >
                  <Icon className={cn('h-5 w-5', isActive ? 'text-accent' : `text-slate-300 group-hover:text-primary`)} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </ScrollArea>
      </aside>

      <main className="flex-1 min-w-0 overflow-x-hidden">
        <StudentView user={user} userData={userData || { role: 'student', targetExam: 'YKS_EA' }} />
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]"><Loader2 className="h-10 w-10 animate-spin text-accent" /></div>}>
      <DashboardContent />
    </Suspense>
  );
}
