'use client';

import {
  useUser,
  useDoc,
  useAuth,
  useFirestore,
} from '@/firebase';

import {
  useRouter,
  useSearchParams,
} from 'next/navigation';

import {
  useEffect,
  useMemo,
  useState,
  Suspense,
} from 'react';

import {
  LogOut,
  LayoutDashboard,
  User,
  Brain,
  Headset,
  Library,
  Users,
  PieChart,
  Eye,
  XCircle,
  Loader2,
  Home,
  Compass,
  Sparkles,
  ShieldCheck,
  Calendar,
  CheckCircle,
  Clock,
  Target,
  TrendingUp,
  Zap,
  Timer,
  Play,
  Flame,
  Award,
  ChevronRight,
  Plus,
  ArrowUpRight,
  BookOpen,
  Trophy,
  Activity,
  PlaySquare,
  Book,
  MoreVertical,
  GraduationCap,
  BarChart3,
  UserCheck,
  Settings,
  Search,
  Lock,
  UserRoundCheck,
} from 'lucide-react';

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  Tooltip,
} from 'recharts';

import {
  doc,
  setDoc,
  serverTimestamp,
  collection,
  getDocs,
  query,
  where,
} from 'firebase/firestore';

import { signOut } from 'firebase/auth';

import Link from 'next/link';
import Image from 'next/image';

import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import { PlaceHolderImages } from '@/lib/placeholder-images';
import { EXAM_CONFIGS } from '@/lib/exam-configs';

import { ProfileEditDialog } from '@/components/profile-edit-dialog';
import { AcademicSessionDialog } from '@/components/academic-session-dialog';
import { AuthForm } from '@/components/auth-form';

import { useToast } from '@/hooks/use-toast';

/* ============================================================
   TYPES
============================================================ */

interface DashboardUser {
  uid?: string;
  displayName?: string;
  email?: string;
  role?: string;
  targetExam?: string;
  schoolId?: string;
  teacherId?: string;
  classId?: string;
  photoURL?: string;
  [key: string]: any;
}

interface StudentViewProps {
  user: any;
  userData: DashboardUser;
  isReadOnly?: boolean;
}

interface StudentListItem {
  uid: string;
  displayName: string;
  email?: string;
  targetExam?: string;
  role?: string;
  schoolId?: string;
}

/* ============================================================
   HELPERS
============================================================ */

const DEFAULT_LOGO =
  'https://picsum.photos/seed/edu-logo-102/400/400';

function normalizeText(value: any) {
  return String(value || '')
    .trim()
    .toLocaleLowerCase('tr-TR');
}

function getTodayName() {
  return new Intl.DateTimeFormat('tr-TR', {
    weekday: 'long',
  }).format(new Date());
}

function getFirstName(name?: string) {
  return name?.trim()?.split(/\s+/)[0] || 'ÖĞRENCİ';
}

function getDifficultyLabel(value?: string) {
  const map: Record<string, string> = {
    easy: 'Kolay',
    medium: 'Orta',
    hard: 'Zor',
  };

  return map[value || ''] || value || 'Orta';
}

/* ============================================================
   STUDENT DASHBOARD
============================================================ */

function StudentView({
  user,
  userData,
  isReadOnly = false,
}: StudentViewProps) {
  const db = useFirestore();
  const { toast } = useToast();

  const [activeTimer, setActiveTimer] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isRecLoading, setIsRecLoading] = useState(false);

  const uid = user?.uid || userData?.uid;

  const {
    data: studyPlan,
    loading: studyPlanLoading,
  } = useDoc(
    uid
      ? `studyPlans/${uid}`
      : null
  );

  /* ==========================================================
     POMODORO
  ========================================================== */

  useEffect(() => {
    if (!activeTimer) return;

    if (timeLeft <= 0) {
      setActiveTimer(false);

      toast({
        title: 'Odak Seansı Tamamlandı 🎯',
        description:
          '25 dakikalık çalışma seansını tamamladın.',
        className:
          'bg-primary text-white rounded-[2rem]',
      });

      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) =>
        Math.max(prev - 1, 0)
      );
    }, 1000);

    return () =>
      clearInterval(timer);
  }, [
    activeTimer,
    timeLeft,
    toast,
  ]);

  /* ==========================================================
     TODAY
  ========================================================== */

  const today = getTodayName();

  /* ==========================================================
     TOTAL COMPLETED TASKS
  ========================================================== */

  const totalTasksCompleted = useMemo(() => {
    if (!studyPlan?.schedule) return 0;

    let count = 0;

    studyPlan.schedule.forEach(
      (day: any) => {
        day?.tasks?.forEach(
          (task: any) => {
            if (
              task?.status ===
              'completed'
            ) {
              count++;
            }
          }
        );
      }
    );

    return count;
  }, [studyPlan]);

  /* ==========================================================
     TOTAL TASKS
  ========================================================== */

  const totalTasks = useMemo(() => {
    if (!studyPlan?.schedule) return 0;

    return studyPlan.schedule.reduce(
      (total: number, day: any) =>
        total +
        (day?.tasks?.length || 0),
      0
    );
  }, [studyPlan]);

  /* ==========================================================
     TODAY TASKS
  ========================================================== */

  const todayTasks = useMemo(() => {
    if (!studyPlan?.schedule) return [];

    const dayData =
      studyPlan.schedule.find(
        (s: any) =>
          normalizeText(s?.day) ===
          normalizeText(today)
      );

    return dayData?.tasks || [];
  }, [studyPlan, today]);

  /* ==========================================================
     GAMIFICATION
  ========================================================== */

  const xp =
    totalTasksCompleted * 120;

  const level =
    Math.floor(
      totalTasksCompleted / 10
    ) + 1;

  const xpToNextLevel = 1000;

  const currentXpInLevel =
    xp % xpToNextLevel;

  const progressToNextLevel =
    Math.min(
      (currentXpInLevel /
        xpToNextLevel) *
        100,
      100
    );

  /* ==========================================================
     STATS
  ========================================================== */

  const studyHours =
    Math.floor(
      totalTasksCompleted * 0.75
    );

  const stats = [
    {
      label: 'TOPLAM XP',
      val: xp.toLocaleString(
        'tr-TR'
      ),
      icon: Zap,
      color: 'text-amber-500',
      bg: 'bg-amber-50',
    },
    {
      label: 'ÇALIŞMA',
      val: `${studyHours} SAAT`,
      icon: Clock,
      color: 'text-blue-500',
      bg: 'bg-blue-50',
    },
    {
      label: 'NET ORT.',
      val:
        userData?.netAverage
          ? String(
              userData.netAverage
            )
          : '84.5',
      icon: Target,
      color:
        'text-emerald-500',
      bg: 'bg-emerald-50',
    },
  ];

  /* ==========================================================
     ACADEMIC BALANCE
  ========================================================== */

  const academicBalance = [
    {
      subject: 'Matematik',
      val: 85,
      color: '#F59E0B',
    },
    {
      subject: 'Edebiyat',
      val: 72,
      color: '#0F172A',
    },
    {
      subject: 'Tarih',
      val: 90,
      color: '#F59E0B',
    },
    {
      subject: 'Coğrafya',
      val: 64,
      color: '#0F172A',
    },
    {
      subject: 'Türkçe',
      val: 94,
      color: '#F59E0B',
    },
  ];

  /* ==========================================================
     ADD SESSION
  ========================================================== */

  const handleQuickAddSession =
    async (taskData: any) => {
      if (
        isReadOnly ||
        !db ||
        !uid
      ) {
        if (isReadOnly) {
          toast({
            title:
              'Salt-okunur mod',
            description:
              'Simülasyon sırasında öğrenci planı değiştirilemez.',
          });
        }

        return;
      }

      const newSchedule =
        studyPlan?.schedule
          ? studyPlan.schedule.map(
              (day: any) => ({
                ...day,
                tasks: [
                  ...(day.tasks || []),
                ],
              })
            )
          : [];

      let dayIndex =
        newSchedule.findIndex(
          (s: any) =>
            normalizeText(
              s?.day
            ) ===
            normalizeText(
              today
            )
        );

      const newTask = {
        ...taskData,
        status: 'pending',
        createdAt:
          new Date().toISOString(),
      };

      if (dayIndex === -1) {
        newSchedule.push({
          day: today,
          tasks: [newTask],
        });
      } else {
        newSchedule[
          dayIndex
        ] = {
          ...newSchedule[
            dayIndex
          ],
          tasks: [
            ...(
              newSchedule[
                dayIndex
              ].tasks || []
            ),
            newTask,
          ],
        };
      }

      try {
        await setDoc(
          doc(
            db,
            'studyPlans',
            uid
          ),
          {
            userId: uid,
            examId:
              userData?.targetExam ||
              'YKS_SAY',
            schedule:
              newSchedule,
            updatedAt:
              serverTimestamp(),
          },
          {
            merge: true,
          }
        );

        toast({
          title:
            'Görev Senkronize Edildi',
          description:
            `${taskData.subject || 'Çalışma'} seansı bugünlük planınıza eklendi.`,
          className:
            'bg-primary text-white rounded-[2rem]',
        });

        setIsAddDialogOpen(
          false
        );
      } catch (error) {
        console.error(
          'Görev ekleme hatası:',
          error
        );

        toast({
          variant:
            'destructive',
          title: 'Hata',
          description:
            'Görev eklenirken bir sorun oluştu.',
        });
      }
    };

  /* ==========================================================
     AI RECOMMENDATION
  ========================================================== */

  const handleCreateRecommendedTask =
    async () => {
      if (isReadOnly) {
        toast({
          title:
            'Salt-okunur mod',
          description:
            'Simülasyon sırasında yeni görev oluşturulamaz.',
        });

        return;
      }

      setIsRecLoading(true);

      try {
        const exam =
          userData?.targetExam ||
          'YKS_SAY';

        const isSoz =
          exam.includes('SOZ');

        const recommendedTask =
          {
            subject: isSoz
              ? 'Edebiyat'
              : 'TYT Matematik',

            topic: isSoz
              ? 'Cumhuriyet Dönemi'
              : 'Problemler',

            time: '14:00',
            duration: '45 dk',
            difficulty:
              'hard',

            xp: 75,

            studyType:
              'questions',

            source:
              'AI Recommendation',
          };

        await handleQuickAddSession(
          recommendedTask
        );
      } finally {
        setIsRecLoading(false);
      }
    };

  /* ==========================================================
     COMPLETE TASK
  ========================================================== */

  const toggleTask = async (
    taskIndex: number
  ) => {
    if (
      isReadOnly ||
      !db ||
      !uid ||
      !studyPlan?.schedule
    ) {
      if (isReadOnly) {
        toast({
          title:
            'Salt-okunur mod',
          description:
            'Bu öğrenci ekranı öğretmen simülasyonunda görüntüleniyor.',
        });
      }

      return;
    }

    const newSchedule =
      studyPlan.schedule.map(
        (day: any) => ({
          ...day,
          tasks: [
            ...(day.tasks || []),
          ],
        })
      );

    const dayIndex =
      newSchedule.findIndex(
        (s: any) =>
          normalizeText(
            s?.day
          ) ===
          normalizeText(
            today
          )
      );

    if (dayIndex === -1)
      return;

    const task =
      newSchedule[
        dayIndex
      ].tasks[taskIndex];

    if (!task) return;

    newSchedule[
      dayIndex
    ].tasks[taskIndex] = {
      ...task,
      status:
        task.status ===
        'completed'
          ? 'pending'
          : 'completed',
      completedAt:
        task.status ===
        'completed'
          ? null
          : new Date().toISOString(),
    };

    try {
      await setDoc(
        doc(
          db,
          'studyPlans',
          uid
        ),
        {
          schedule:
            newSchedule,
          updatedAt:
            serverTimestamp(),
        },
        {
          merge: true,
        }
      );
    } catch (error) {
      console.error(
        'Görev güncelleme hatası:',
        error
      );

      toast({
        variant:
          'destructive',
        title: 'Hata',
        description:
          'Görev durumu güncellenemedi.',
      });
    }
  };

  /* ==========================================================
     TIMER
  ========================================================== */

  const formatTime = (
    seconds: number
  ) => {
    const minutes =
      Math.floor(
        seconds / 60
      );

    const sec =
      seconds % 60;

    return `${minutes}:${
      sec < 10 ? '0' : ''
    }${sec}`;
  };

  const resetTimer = () => {
    setActiveTimer(false);
    setTimeLeft(25 * 60);
  };

  /* ==========================================================
     LOADING
  ========================================================== */

  if (studyPlanLoading) {
    return (
      <div className="min-h-[600px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-5">
          <Loader2 className="h-10 w-10 animate-spin text-accent" />

          <p className="text-xs font-black uppercase tracking-widest text-primary/40">
            Akademik Plan Yükleniyor
          </p>
        </div>
      </div>
    );
  }

  /* ==========================================================
     STUDENT DASHBOARD
  ========================================================== */

  return (
    <div className="p-8 xl:p-12 space-y-12">

      {/* ======================================================
          READ ONLY NOTICE
      ====================================================== */}

      {isReadOnly && (
        <Card className="rounded-[2rem] bg-amber-50 border border-amber-200 p-5">
          <div className="flex items-center gap-4">
            <Lock className="h-5 w-5 text-amber-600" />

            <div>
              <p className="font-black text-amber-900">
                SALT-OKUNUR SİMÜLASYON
              </p>

              <p className="text-xs font-medium text-amber-700">
                Bu öğrenci ekranı öğretmen tarafından görüntüleniyor.
                Öğrenci verileri değiştirilemez.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* ======================================================
          TOP STATS
      ====================================================== */}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

        {stats.map(
          (stat, index) => {
            const Icon =
              stat.icon;

            return (
              <Card
                key={index}
                className="
                  p-7
                  rounded-[2.5rem]
                  border-none
                  shadow-[0_20px_40px_-10px_rgba(0,0,0,0.05)]
                  bg-white
                  flex
                  items-center
                  gap-5
                  group
                  hover:shadow-xl
                  transition-all
                  hover:-translate-y-1
                  border
                  border-primary/5
                "
              >
                <div
                  className={cn(
                    'h-14 w-14 rounded-2xl flex items-center justify-center shrink-0',
                    stat.bg
                  )}
                >
                  <Icon
                    className={cn(
                      'h-7 w-7',
                      stat.color
                    )}
                  />
                </div>

                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 mb-1">
                    {stat.label}
                  </p>

                  <p className="text-2xl font-black text-primary tracking-tighter italic">
                    {stat.val}
                  </p>
                </div>
              </Card>
            );
          }
        )}

        {/* STREAK */}

        <Card
          className="
            p-7
            rounded-[2.5rem]
            border-none
            shadow-[0_20px_40px_-10px_rgba(0,0,0,0.05)]
            bg-white
            flex
            items-center
            justify-between
            group
            hover:shadow-xl
            transition-all
            hover:-translate-y-1
            border
            border-primary/5
          "
        >
          <div className="flex items-center gap-5">
            <div className="h-14 w-14 rounded-2xl bg-rose-50 flex items-center justify-center">
              <Flame className="h-7 w-7 text-rose-500 fill-current" />
            </div>

            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                GÜNLÜK SERİ
              </p>

              <p className="text-3xl font-black text-primary italic tracking-tighter">
                {userData?.streak ||
                  0}{' '}
                GÜN
              </p>
            </div>
          </div>

          <ChevronRight className="h-5 w-5 text-slate-300" />
        </Card>
      </div>

      {/* ======================================================
          MAIN GRID
      ====================================================== */}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">

        {/* ====================================================
            LEFT
        ==================================================== */}

        <div className="xl:col-span-8 space-y-10">

          {/* WELCOME */}

          <Card
            className="
              rounded-[3.5rem]
              border-none
              shadow-[0_60px_100px_-20px_rgba(15,23,42,0.12)]
              bg-white
              p-10 xl:p-14
              relative
              overflow-hidden
              border
              border-primary/5
            "
          >
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-accent/5 blur-[120px] rounded-full" />

            <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-10">

              <div className="space-y-7 flex-1">

                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-50 border border-primary/5 text-primary/50 font-black text-[9px] uppercase tracking-widest">
                  <Activity className="h-3.5 w-3.5 text-accent animate-pulse" />
                  ACADEMIC NODE ACTIVE
                </div>

                <div>
                  <h1 className="text-5xl xl:text-6xl font-black text-primary tracking-tighter italic uppercase leading-none">
                    GÜNAYDIN,
                    <br />

                    <span className="text-accent">
                      {getFirstName(
                        userData?.displayName
                      )}
                    </span>{' '}
                    👋
                  </h1>

                  <p className="mt-5 text-lg font-medium text-muted-foreground italic leading-relaxed max-w-xl">
                    Bugün seni bekleyen{' '}
                    <span className="text-primary font-bold">
                      {todayTasks.length}{' '}
                      görev
                    </span>{' '}
                    bulunuyor.
                  </p>
                </div>

                <div className="flex gap-4 flex-wrap">

                  <div className="px-5 py-4 rounded-2xl bg-primary text-white flex items-center gap-3 shadow-xl">
                    <Zap className="h-5 w-5 text-accent" />

                    <div>
                      <p className="text-[8px] font-black uppercase tracking-widest opacity-40">
                        GÜNLÜK HEDEF
                      </p>

                      <p className="font-black italic">
                        +350 XP
                      </p>
                    </div>
                  </div>

                  <Button
                    disabled={
                      isReadOnly
                    }
                    onClick={() =>
                      setIsAddDialogOpen(
                        true
                      )
                    }
                    className="
                      h-14
                      px-7
                      rounded-2xl
                      bg-white
                      border-2
                      border-primary/5
                      text-primary
                      hover:bg-slate-50
                      font-black
                      text-xs
                      uppercase
                      tracking-widest
                    "
                  >
                    PROGRAMI YÖNET

                    <ArrowUpRight className="ml-3 h-5 w-5 text-accent" />
                  </Button>
                </div>
              </div>

              {/* PROGRESS */}

              <div className="relative shrink-0">
                <div className="absolute inset-0 bg-accent/20 blur-[60px] rounded-full" />

                <div className="
                  h-48
                  w-48
                  rounded-[3.5rem]
                  bg-[#0F172A]
                  flex
                  items-center
                  justify-center
                  shadow-2xl
                  rotate-3
                  border-[10px]
                  border-white
                  relative
                ">
                  <div className="text-center">
                    <p className="text-6xl font-black text-accent italic tracking-tighter">
                      %
                      {progressToNextLevel.toFixed(
                        0
                      )}
                    </p>

                    <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em] mt-2">
                      LEVEL PROGRESS
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* TODAY PLAN */}

          <div className="space-y-7">

            <div className="flex justify-between items-end px-3">

              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/30 italic">
                  OPERATIONAL SCHEDULE
                </p>

                <h3 className="text-4xl font-black italic tracking-tighter uppercase text-primary flex items-center gap-4">
                  <Calendar className="h-8 w-8 text-accent" />
                  BUGÜNKÜ PLAN
                </h3>
              </div>

              <Button
                disabled={
                  isReadOnly
                }
                onClick={() =>
                  setIsAddDialogOpen(
                    true
                  )
                }
                variant="ghost"
                className="text-accent font-black text-xs uppercase tracking-widest"
              >
                <Plus className="h-4 w-4 mr-2" />
                SEANS EKLE
              </Button>
            </div>

            <div className="grid gap-5">

              {todayTasks.length >
              0 ? (
                todayTasks.map(
                  (
                    task: any,
                    index: number
                  ) => (
                    <Card
                      key={index}
                      className="
                        group
                        p-7
                        rounded-[2.5rem]
                        border-none
                        shadow-lg
                        hover:shadow-xl
                        transition-all
                        bg-white
                        flex
                        items-center
                        justify-between
                        border
                        border-primary/5
                        border-l-[8px]
                        border-l-primary
                      "
                    >
                      <div className="flex items-center gap-7 min-w-0">

                        <div className="text-center w-20 shrink-0">
                          <p className="text-xl font-black text-primary tracking-tighter">
                            {task.time ||
                              '--:--'}
                          </p>

                          <p className="text-[8px] font-black text-slate-400 uppercase mt-1">
                            START
                          </p>
                        </div>

                        <div className="h-14 w-px bg-primary/10" />

                        <div className="min-w-0">
                          <div className="flex items-center gap-3 flex-wrap">
                            <h4
                              className={cn(
                                'text-2xl font-black italic tracking-tight uppercase leading-none',
                                task.status ===
                                  'completed'
                                  ? 'text-emerald-500 line-through'
                                  : 'text-primary'
                              )}
                            >
                              {task.subject ||
                                'Ders'}
                            </h4>

                            <Badge
                              variant="outline"
                              className="text-[8px] font-black uppercase"
                            >
                              {getDifficultyLabel(
                                task.difficulty
                              )}
                            </Badge>
                          </div>

                          <p className="mt-2 text-sm font-medium text-muted-foreground italic truncate max-w-[500px]">
                            {task.topic ||
                              'Konu belirtilmedi'}

                            {task.subtopic
                              ? ` • ${task.subtopic}`
                              : ''}

                            {task.duration
                              ? ` • ${task.duration}`
                              : ''}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 ml-4">

                        {task.bookUrl && (
                          <Button
                            size="icon"
                            variant="ghost"
                            asChild
                            className="h-11 w-11 rounded-xl bg-slate-50"
                          >
                            <a
                              href={
                                task.bookUrl
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Book className="h-5 w-5" />
                            </a>
                          </Button>
                        )}

                        {task.youtubeUrl && (
                          <Button
                            size="icon"
                            variant="ghost"
                            asChild
                            className="h-11 w-11 rounded-xl bg-rose-50 text-rose-500"
                          >
                            <a
                              href={
                                task.youtubeUrl
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <PlaySquare className="h-5 w-5" />
                            </a>
                          </Button>
                        )}

                        <Button
                          size="icon"
                          disabled={
                            isReadOnly
                          }
                          onClick={() =>
                            toggleTask(
                              index
                            )
                          }
                          className={cn(
                            'h-14 w-14 rounded-2xl shadow-xl',
                            task.status ===
                              'completed'
                              ? 'bg-emerald-500 text-white'
                              : 'bg-primary text-white hover:bg-accent'
                          )}
                        >
                          {task.status ===
                          'completed' ? (
                            <CheckCircle className="h-7 w-7" />
                          ) : (
                            <Play className="h-6 w-6 fill-current" />
                          )}
                        </Button>
                      </div>
                    </Card>
                  )
                )
              ) : (
                <Card className="p-20 text-center bg-white/60 rounded-[3rem] border border-dashed border-primary/10">
                  <Calendar className="h-10 w-10 text-primary/10 mx-auto mb-5" />

                  <p className="font-black text-primary/30 uppercase tracking-widest text-xs">
                    BUGÜN İÇİN PLAN YOK
                  </p>

                  <Button
                    disabled={
                      isReadOnly
                    }
                    onClick={() =>
                      setIsAddDialogOpen(
                        true
                      )
                    }
                    className="mt-5 rounded-xl bg-primary text-white font-black"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    İLK SEANSI EKLE
                  </Button>
                </Card>
              )}
            </div>
          </div>

          {/* ANALYTICS */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-7">

            <Card className="p-9 rounded-[3rem] border-none shadow-xl bg-white">
              <div className="flex justify-between items-center mb-7">
                <div>
                  <h4 className="text-xl font-black italic tracking-tighter uppercase text-primary">
                    Akademik Trend
                  </h4>

                  <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                    Haftalık XP
                  </p>
                </div>

                <TrendingUp className="h-6 w-6 text-emerald-500" />
              </div>

              <div className="h-[200px]">
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <AreaChart
                    data={[
                      {
                        day: 'Pzt',
                        val: 400,
                      },
                      {
                        day: 'Sal',
                        val: 750,
                      },
                      {
                        day: 'Çar',
                        val: 500,
                      },
                      {
                        day: 'Per',
                        val: 900,
                      },
                      {
                        day: 'Cum',
                        val: 600,
                      },
                      {
                        day: 'Cmt',
                        val: 800,
                      },
                      {
                        day: 'Paz',
                        val: 700,
                      },
                    ]}
                  >
                    <XAxis
                      dataKey="day"
                      hide
                    />

                    <Tooltip />

                    <Area
                      type="monotone"
                      dataKey="val"
                      stroke="#F59E0B"
                      strokeWidth={4}
                      fill="#F59E0B"
                      fillOpacity={0.15}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="p-9 rounded-[3rem] border-none shadow-xl bg-white">
              <div className="flex justify-between items-center mb-7">
                <div>
                  <h4 className="text-xl font-black italic tracking-tighter uppercase text-primary">
                    Akademik Denge
                  </h4>

                  <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                    Yetkinlik
                  </p>
                </div>

                <Target className="h-6 w-6 text-primary" />
              </div>

              <div className="space-y-4">
                {academicBalance.map(
                  (
                    item,
                    index
                  ) => (
                    <div
                      key={index}
                      className="space-y-2"
                    >
                      <div className="flex justify-between">
                        <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                          {item.subject}
                        </span>

                        <span className="text-xs font-black text-primary">
                          %{item.val}
                        </span>
                      </div>

                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${item.val}%`,
                            backgroundColor:
                              item.color,
                          }}
                        />
                      </div>
                    </div>
                  )
                )}
              </div>
            </Card>
          </div>
        </div>

        {/* ====================================================
            RIGHT
        ==================================================== */}

        <div className="xl:col-span-4 space-y-7">

          {/* METRICS */}

          <Card className="rounded-[3.5rem] border-none shadow-2xl bg-white overflow-hidden">

            <div className="bg-primary p-9 text-white flex justify-between items-center">
              <div>
                <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.4em]">
                  OPERATIONAL NODE
                </p>

                <h4 className="text-2xl font-black italic tracking-tighter uppercase">
                  KİŞİSEL
                  <br />
                  METRİKLER
                </h4>
              </div>

              <Trophy className="h-9 w-9 text-accent" />
            </div>

            <div className="p-9 space-y-9">

              {/* LEVEL */}

              <div className="space-y-5">
                <div className="flex items-center gap-5">
                  <div className="h-14 w-14 rounded-2xl bg-amber-50 flex items-center justify-center">
                    <Award className="h-7 w-7 text-amber-500" />
                  </div>

                  <div>
                    <p className="text-[9px] font-black text-muted-foreground/50 uppercase tracking-widest">
                      AKADEMİK RÜTBE
                    </p>

                    <p className="text-xl font-black text-primary italic">
                      LEVEL {level}
                    </p>
                  </div>
                </div>

                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent rounded-full"
                    style={{
                      width: `${progressToNextLevel}%`,
                    }}
                  />
                </div>
              </div>

              {/* XP */}

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest">
                    TOPLAM XP
                  </p>

                  <p className="text-5xl font-black text-primary tracking-tighter">
                    {xp}
                  </p>
                </div>

                <TrendingUp className="h-8 w-8 text-emerald-500" />
              </div>

              {/* POMODORO */}

              <div className="p-7 bg-slate-50 rounded-[2.5rem] border border-primary/5 space-y-6">

                <div className="flex justify-between">
                  <span className="text-[9px] font-black uppercase tracking-widest text-primary/30">
                    FOCUS TERMINAL
                  </span>

                  <Timer className="h-5 w-5 text-accent" />
                </div>

                <p className="text-6xl font-black text-primary tracking-tighter text-center tabular-nums">
                  {formatTime(
                    timeLeft
                  )}
                </p>

                <div className="grid grid-cols-[1fr_auto] gap-2">

                  <Button
                    onClick={() =>
                      setActiveTimer(
                        !activeTimer
                      )
                    }
                    className="h-14 rounded-xl bg-primary text-white font-black text-[10px] uppercase tracking-widest"
                  >
                    {activeTimer
                      ? 'SEANSI DURDUR'
                      : 'ODAKLANMAYI BAŞLAT'}

                    <Play className="ml-2 h-4 w-4" />
                  </Button>

                  <Button
                    onClick={
                      resetTimer
                    }
                    variant="outline"
                    className="h-14 w-14 rounded-xl"
                  >
                    <XCircle className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* AI */}

          <Card className="p-9 rounded-[3.5rem] border-none shadow-2xl bg-accent text-primary space-y-7">

            <Sparkles className="h-10 w-10 opacity-20 ml-auto" />

            <div>
              <Badge className="bg-white/20 text-primary border-none">
                AKADEMİK ANALİZ MOTORU
              </Badge>

              <h4 className="mt-4 text-3xl font-black italic tracking-tighter uppercase leading-none">
                AI BUGÜN
                <br />
                NE DİYOR?
              </h4>
            </div>

            <p className="text-lg leading-relaxed font-bold italic">
              Bugün{' '}
              <span className="underline decoration-white/50 underline-offset-4">
                {userData?.targetExam?.includes(
                  'SOZ'
                )
                  ? 'Edebiyat - Cumhuriyet Dönemi'
                  : 'TYT Matematik - Problemler'}
              </span>{' '}
              çalışmak akademik hedefin için iyi bir tercih olabilir.
            </p>

            <Button
              onClick={
                handleCreateRecommendedTask
              }
              disabled={
                isRecLoading ||
                isReadOnly
              }
              className="w-full h-14 rounded-xl bg-white/30 hover:bg-white/50 text-primary font-black text-[10px] uppercase tracking-widest"
            >
              {isRecLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Zap className="h-4 w-4" />
              )}

              Görevi Hemen Oluştur
            </Button>
          </Card>

          {/* ACHIEVEMENTS */}

          <Card className="p-9 rounded-[3rem] border-none shadow-xl bg-white">

            <div className="flex justify-between items-center mb-8">
              <h4 className="text-xl font-black italic tracking-tighter uppercase text-primary">
                Son Başarılar
              </h4>

              <Award className="h-6 w-6 text-accent" />
            </div>

            <div className="space-y-6">

              {[
                {
                  icon: Trophy,
                  label: '1000 XP Barajı',
                  desc: 'Akademik rütbe atlandı',
                  color: 'text-amber-500',
                  bg: 'bg-amber-50',
                },
                {
                  icon: Flame,
                  label: '7 Gün Seri',
                  desc: 'Disiplin madalyası',
                  color: 'text-rose-500',
                  bg: 'bg-rose-50',
                },
                {
                  icon: BookOpen,
                  label: '100 Saat Çalışma',
                  desc: 'Bilgi avcısı ünvanı',
                  color: 'text-blue-500',
                  bg: 'bg-blue-50',
                },
              ].map(
                (
                  achievement,
                  index
                ) => {
                  const Icon =
                    achievement.icon;

                  return (
                    <div
                      key={index}
                      className="flex items-center gap-4"
                    >
                      <div
                        className={cn(
                          'h-12 w-12 rounded-xl flex items-center justify-center',
                          achievement.bg
                        )}
                      >
                        <Icon
                          className={cn(
                            'h-6 w-6',
                            achievement.color
                          )}
                        />
                      </div>

                      <div>
                        <p className="text-sm font-black text-primary uppercase italic">
                          {
                            achievement.label
                          }
                        </p>

                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                          {
                            achievement.desc
                          }
                        </p>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* SESSION DIALOG */}

      <AcademicSessionDialog
        isOpen={
          isAddDialogOpen
        }
        onOpenChange={
          setIsAddDialogOpen
        }
        onSave={
          handleQuickAddSession
        }
        selectedDay={
          today
        }
      />

      {/* FLOATING BUTTON */}

      {!isReadOnly && (
        <div className="fixed bottom-8 right-8 z-[100]">
          <Button
            onClick={() =>
              setIsAddDialogOpen(
                true
              )
            }
            className="
              h-20
              w-20
              rounded-[1.8rem]
              bg-primary
              hover:bg-accent
              text-white
              shadow-2xl
              transition-all
              hover:scale-110
            "
          >
            <Plus className="h-8 w-8 text-accent" />
          </Button>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   TEACHER VIEW
============================================================ */

function TeacherDashboard({
  user,
  userData,
}: {
  user: any;
  userData: DashboardUser;
}) {
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const [students, setStudents] =
    useState<StudentListItem[]>(
      []
    );

  const [loadingStudents, setLoadingStudents] =
    useState(true);

  const [search, setSearch] =
    useState('');

  const loadStudents =
    async () => {
      if (!db) return;

      setLoadingStudents(
        true
      );

      try {
        const usersRef =
          collection(
            db,
            'users'
          );

        /*
         * Mevcut Firebase yapısında
         * öğretmen bağlantısı teacherId
         * üzerinden tutuluyorsa öğrenciler
         * buradan alınır.
         */

        let snapshot;

        try {
          snapshot =
            await getDocs(
              query(
                usersRef,
                where(
                  'teacherId',
                  '==',
                  user?.uid
                )
              )
            );
        } catch {
          snapshot =
            await getDocs(
              query(
                usersRef,
                where(
                  'role',
                  '==',
                  'student'
                )
              )
            );
        }

        const result: StudentListItem[] =
          [];

        snapshot.forEach(
          (item) => {
            const data =
              item.data();

            if (
              data.role ===
                'student' ||
              !data.role
            ) {
              result.push({
                uid: item.id,
                displayName:
                  data.displayName ||
                  'İsimsiz Öğrenci',
                email:
                  data.email,
                targetExam:
                  data.targetExam,
                role:
                  data.role ||
                  'student',
                schoolId:
                  data.schoolId,
              });
            }
          }
        );

        setStudents(result);
      } catch (error) {
        console.error(
          'Öğrenci listesi:',
          error
        );

        toast({
          variant:
            'destructive',
          title:
            'Öğrenciler alınamadı',
          description:
            'Firebase yetkilerinizi veya teacherId alanını kontrol edin.',
        });
      } finally {
        setLoadingStudents(
          false
        );
      }
    };

  useEffect(() => {
    loadStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db, user?.uid]);

  const filteredStudents =
    students.filter(
      (student) =>
        normalizeText(
          student.displayName
        ).includes(
          normalizeText(search)
        ) ||
        normalizeText(
          student.email
        ).includes(
          normalizeText(search)
        )
    );

  const simulateStudent = (
    uid: string
  ) => {
    router.push(
      `/dashboard?simulate=${encodeURIComponent(
        uid
      )}`
    );
  };

  return (
    <div className="p-8 xl:p-12 space-y-10">

      <div>
        <Badge className="bg-primary text-white">
          <UserCheck className="h-3 w-3 mr-2" />
          ÖĞRETMEN PANELİ
        </Badge>

        <h2 className="mt-4 text-5xl font-black italic tracking-tighter uppercase text-primary">
          ÖĞRENCİLERİM
        </h2>

        <p className="mt-2 text-muted-foreground">
          Yetkiniz dahilindeki öğrencilerin akademik ekranlarını inceleyebilir ve simülasyon modunda görüntüleyebilirsiniz.
        </p>
      </div>

      <Card className="p-5 rounded-[2rem] bg-white border border-primary/5">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />

          <input
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            placeholder="Öğrenci ara..."
            className="w-full h-14 rounded-2xl bg-slate-50 border-none outline-none pl-12 pr-5 font-medium"
          />
        </div>
      </Card>

      {loadingStudents ? (
        <Card className="p-20 rounded-[3rem] text-center">
          <Loader2 className="h-8 w-8 animate-spin text-accent mx-auto" />

          <p className="mt-4 text-xs font-black uppercase tracking-widest text-slate-400">
            Öğrenciler yükleniyor
          </p>
        </Card>
      ) : filteredStudents.length ===
        0 ? (
        <Card className="p-20 rounded-[3rem] text-center">
          <Users className="h-12 w-12 text-slate-200 mx-auto" />

          <p className="mt-5 font-black text-slate-400 uppercase tracking-widest">
            Öğrenci bulunamadı
          </p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">

          {filteredStudents.map(
            (student) => (
              <Card
                key={student.uid}
                className="p-7 rounded-[2.5rem] border-none shadow-xl bg-white hover:-translate-y-1 transition-all"
              >
                <div className="flex items-center gap-5">

                  <div className="h-16 w-16 rounded-2xl bg-accent flex items-center justify-center text-white font-black text-2xl">
                    {student.displayName
                      ?.charAt(0)
                      ?.toUpperCase() ||
                      'Ö'}
                  </div>

                  <div className="min-w-0">
                    <p className="font-black text-primary truncate">
                      {
                        student.displayName
                      }
                    </p>

                    <p className="text-xs text-muted-foreground truncate">
                      {student.email ||
                        'E-posta yok'}
                    </p>

                    {student.targetExam && (
                      <Badge
                        variant="outline"
                        className="mt-2 text-[8px]"
                      >
                        {
                          student.targetExam
                        }
                      </Badge>
                    )}
                  </div>
                </div>

                <Button
                  onClick={() =>
                    simulateStudent(
                      student.uid
                    )
                  }
                  className="w-full mt-6 h-13 rounded-xl bg-primary text-white font-black uppercase text-[10px] tracking-widest"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Öğrenciyi Görüntüle
                </Button>
              </Card>
            )
          )}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   SCHOOL ADMIN VIEW
============================================================ */

function SchoolAdminDashboard({
  userData,
}: {
  userData: DashboardUser;
}) {
  return (
    <div className="p-8 xl:p-12 space-y-10">

      <div>
        <Badge className="bg-primary text-white">
          <ShieldCheck className="h-3 w-3 mr-2" />
          OKUL YÖNETİMİ
        </Badge>

        <h2 className="mt-4 text-5xl font-black italic tracking-tighter uppercase text-primary">
          OKUL PANELİ
        </h2>

        <p className="mt-2 text-muted-foreground">
          Okulunuzun akademik yönetim merkezi.
        </p>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">

        {[
          {
            title: 'ÖĞRENCİLER',
            value: '—',
            icon: Users,
          },
          {
            title: 'ÖĞRETMENLER',
            value: '—',
            icon: GraduationCap,
          },
          {
            title: 'ŞUBELER',
            value: '—',
            icon: PieChart,
          },
          {
            title: 'AKTİVİTE',
            value: 'CANLI',
            icon: Activity,
          },
        ].map(
          (
            item,
            index
          ) => {
            const Icon =
              item.icon;

            return (
              <Card
                key={index}
                className="p-7 rounded-[2.5rem] border-none shadow-xl bg-white"
              >
                <Icon className="h-7 w-7 text-accent" />

                <p className="mt-6 text-[9px] font-black uppercase tracking-widest text-slate-400">
                  {item.title}
                </p>

                <p className="mt-2 text-3xl font-black text-primary">
                  {item.value}
                </p>
              </Card>
            );
          }
        )}
      </div>

      <Card className="p-10 rounded-[3rem] bg-white border-none shadow-xl">
        <h3 className="text-2xl font-black text-primary italic uppercase">
          Yönetim Modülleri
        </h3>

        <div className="grid md:grid-cols-3 gap-5 mt-7">

          {[
            {
              title:
                'Öğretmen Yönetimi',
              icon: UserCheck,
            },
            {
              title:
                'Şube Yönetimi',
              icon: Library,
            },
            {
              title:
                'Akademik Raporlar',
              icon: BarChart3,
            },
          ].map(
            (
              item,
              index
            ) => {
              const Icon =
                item.icon;

              return (
                <Button
                  key={index}
                  variant="outline"
                  className="h-24 rounded-2xl justify-start gap-4 text-primary font-black"
                >
                  <Icon className="h-6 w-6 text-accent" />
                  {item.title}
                </Button>
              );
            }
          )}
        </div>
      </Card>
    </div>
  );
}

/* ============================================================
   ADMIN VIEW
============================================================ */

function AdminDashboard() {
  return (
    <div className="p-8 xl:p-12 space-y-10">

      <div>
        <Badge className="bg-primary text-white">
          <ShieldCheck className="h-3 w-3 mr-2" />
          SYSTEM ADMIN
        </Badge>

        <h2 className="mt-4 text-5xl font-black italic tracking-tighter uppercase text-primary">
          SİSTEM PANELİ
        </h2>

        <p className="mt-2 text-muted-foreground">
          Akademik platformun sistem yönetim merkezi.
        </p>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">

        {[
          {
            title:
              'SİSTEM DURUMU',
            value: 'ONLINE',
            icon: Activity,
          },
          {
            title:
              'MÜFREDAT',
            value: 'AKTİF',
            icon: Library,
          },
          {
            title:
              'KULLANICILAR',
            value: '—',
            icon: Users,
          },
          {
            title:
              'AKTİVİTE',
            value: 'CANLI',
            icon: TrendingUp,
          },
        ].map(
          (
            item,
            index
          ) => {
            const Icon =
              item.icon;

            return (
              <Card
                key={index}
                className="p-7 rounded-[2.5rem] border-none shadow-xl bg-white"
              >
                <Icon className="h-7 w-7 text-accent" />

                <p className="mt-6 text-[9px] font-black uppercase tracking-widest text-slate-400">
                  {item.title}
                </p>

                <p className="mt-2 text-3xl font-black text-primary">
                  {item.value}
                </p>
              </Card>
            );
          }
        )}
      </div>

      <Card className="p-10 rounded-[3rem] bg-primary text-white border-none shadow-2xl">

        <h3 className="text-3xl font-black italic uppercase tracking-tighter">
          Sistem Yönetimi
        </h3>

        <p className="mt-3 text-white/50">
          Platform modüllerine ve akademik altyapıya buradan erişebilirsiniz.
        </p>

        <div className="grid md:grid-cols-3 gap-4 mt-8">

          <Link
            href="/dashboard/admin/curriculum"
            className="h-24 rounded-2xl bg-white/10 hover:bg-white/20 flex items-center px-6 gap-4 transition-all"
          >
            <Library className="h-6 w-6 text-accent" />

            <span className="font-black">
              Müfredat Motoru
            </span>
          </Link>

          <Link
            href="/dashboard/discover"
            className="h-24 rounded-2xl bg-white/10 hover:bg-white/20 flex items-center px-6 gap-4 transition-all"
          >
            <Users className="h-6 w-6 text-accent" />

            <span className="font-black">
              Uzmanlar
            </span>
          </Link>

          <Link
            href="/dashboard/contact"
            className="h-24 rounded-2xl bg-white/10 hover:bg-white/20 flex items-center px-6 gap-4 transition-all"
          >
            <Headset className="h-6 w-6 text-accent" />

            <span className="font-black">
              Destek
            </span>
          </Link>
        </div>
      </Card>
    </div>
  );
}

/* ============================================================
   DASHBOARD CONTENT
============================================================ */

function DashboardContent() {
  const {
    user,
    loading: authLoading,
  } = useUser();

  const auth = useAuth();
  const db = useFirestore();

  const router = useRouter();
  const searchParams =
    useSearchParams();

  const simulatedUserId =
    searchParams.get(
      'simulate'
    );

  const [
    isProfileDialogOpen,
    setIsProfileDialogOpen,
  ] = useState(false);

  /* ==========================================================
     CURRENT USER
  ========================================================== */

  const {
    data: userData,
    loading: docLoading,
  } = useDoc(
    user?.uid
      ? `users/${user.uid}`
      : null
  );

  /* ==========================================================
     SIMULATED USER
  ========================================================== */

  const {
    data: simulatedUserData,
    loading:
      simulatedUserLoading,
  } = useDoc(
    simulatedUserId
      ? `users/${simulatedUserId}`
      : null
  );

  /* ==========================================================
     VIEW DATA
  ========================================================== */

  const isSimulating =
    Boolean(
      simulatedUserId
    );

  const currentViewData =
    isSimulating
      ? simulatedUserData
      : userData;

  /*
   * Simülasyonda görüntülenecek öğrencinin
   * UID'si URL'den alınır.
   */

  const currentViewUid =
    isSimulating
      ? simulatedUserId
      : user?.uid;

  /* ==========================================================
     LOGO
  ========================================================== */

  const logoUrl =
    PlaceHolderImages.find(
      (img) =>
        img.id === 'app-logo'
    )?.imageUrl ||
    DEFAULT_LOGO;

  /* ==========================================================
     LOADING
  ========================================================== */

  const isGlobalLoading =
    authLoading ||
    (!!user && docLoading) ||
    (!!simulatedUserId &&
      simulatedUserLoading);

  /* ==========================================================
     REDIRECT
  ========================================================== */

  useEffect(() => {
    if (
      !authLoading &&
      !user
    ) {
      router.push(
        '/login'
      );
    }
  }, [
    user,
    authLoading,
    router,
  ]);

  /* ==========================================================
     MENU
  ========================================================== */

  const dynamicMenu =
    useMemo(() => {
      if (!currentViewData)
        return [];

      if (
        currentViewData.role ===
        'admin'
      ) {
        return [
          {
            label:
              'Sistem Paneli',
            icon:
              LayoutDashboard,
            href:
              '/dashboard',
          },
          {
            label:
              'Müfredat Motoru',
            icon: Library,
            href:
              '/dashboard/admin/curriculum',
          },
          {
            label:
              'Uzmanlar',
            icon: Users,
            href:
              '/dashboard/discover',
          },
          {
            label:
              'Destek',
            icon: Headset,
            href:
              '/dashboard/contact',
          },
        ];
      }

      if (
        currentViewData.role ===
        'school_admin'
      ) {
        return [
          {
            label:
              'Okul Paneli',
            icon:
              LayoutDashboard,
            href:
              '/dashboard',
          },
          {
            label:
              'Öğretmenler',
            icon: User,
            href: '#',
          },
          {
            label:
              'Şubeler',
            icon: PieChart,
            href: '#',
          },
          {
            label:
              'Destek',
            icon: Headset,
            href:
              '/dashboard/contact',
          },
        ];
      }

      if (
        currentViewData.role ===
        'teacher'
      ) {
        return [
          {
            label:
              'Öğretmen Paneli',
            icon:
              LayoutDashboard,
            href:
              '/dashboard',
          },
          {
            label:
              'Öğrencilerim',
            icon: Users,
            href:
              '/dashboard',
          },
          {
            label:
              'Uzman Keşfet',
            icon:
              Compass,
            href:
              '/dashboard/discover',
          },
          {
            label:
              'Destek',
            icon: Headset,
            href:
              '/dashboard/contact',
          },
        ];
      }

      const items: any[] =
        [
          {
            label:
              'Akademik Panel',
            icon:
              LayoutDashboard,
            href:
              '/dashboard',
          },
          {
            label:
              'AI Analiz',
            icon: Brain,
            href:
              '/dashboard/ai-analysis',
            accent: true,
          },
          {
            label:
              'Akıllı Planlama',
            icon: Calendar,
            href:
              '/dashboard/planning',
          },
          {
            label:
              'Uzman Keşfet',
            icon: Compass,
            href:
              '/dashboard/discover',
          },
        ];

      const config =
        EXAM_CONFIGS[
          currentViewData.targetExam ||
            'LGS'
        ] ||
        EXAM_CONFIGS['LGS'];

      if (
        config?.modules
      ) {
        config.modules
          .slice(0, 3)
          .forEach(
            (mod: any) => {
              items.push({
                label:
                  mod.title,
                icon:
                  mod.icon,
                href: '#',
              });
            }
          );
      }

      items.push({
        label:
          'Destek Hattı',
        icon: Headset,
        href:
          '/dashboard/contact',
      });

      return items;
    }, [
      currentViewData,
    ]);

  /* ==========================================================
     LOGOUT
  ========================================================== */

  const handleLogout =
    async () => {
      if (!auth) return;

      await signOut(auth);

      router.push('/');
    };

  /* ==========================================================
     STOP SIMULATION
  ========================================================== */

  const stopSimulation =
    () => {
      const params =
        new URLSearchParams(
          searchParams.toString()
        );

      params.delete(
        'simulate'
      );

      const queryString =
        params.toString();

      router.push(
        queryString
          ? `/dashboard?${queryString}`
          : '/dashboard'
      );
    };

  /* ==========================================================
     PROFILE COMPLETION
  ========================================================== */

  if (isGlobalLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-6">
          <Loader2 className="h-12 w-12 animate-spin text-accent" />

          <p className="text-xs font-black uppercase tracking-[0.4em] text-primary/40">
            Akademik Motor Hazırlanıyor
          </p>
        </div>
      </div>
    );
  }

  if (
    user &&
    !docLoading &&
    !userData
  ) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
        <div className="w-full max-w-4xl">

          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary text-white font-black text-[10px] uppercase tracking-widest">
              <ShieldCheck className="h-4 w-4 text-accent" />
              Sistem Kurulumu
            </div>

            <h2 className="mt-5 text-5xl font-black italic tracking-tighter text-primary uppercase">
              PROFİLİNİZİ{' '}
              <span className="text-accent">
                TAMAMLAYIN
              </span>
            </h2>

            <p className="mt-4 text-muted-foreground">
              Sistemi size özel yapılandırmak için son birkaç bilgiye ihtiyacımız var.
            </p>
          </div>

          <div className="bg-white rounded-[3rem] shadow-2xl border border-primary/5 overflow-hidden">
            <AuthForm
              mode="register"
              isProfileCompletion={
                true
              }
            />
          </div>

          <div className="text-center mt-6">
            <Button
              variant="ghost"
              onClick={() =>
                auth &&
                signOut(auth)
              }
              className="text-muted-foreground font-black text-[10px] uppercase tracking-widest"
            >
              <LogOut className="h-3 w-3 mr-2" />
              Başka Bir Hesapla Giriş Yap
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (
    !user ||
    !currentViewData
  ) {
    return null;
  }

  /* ==========================================================
     RENDER VIEW
  ========================================================== */

  const renderView =
    () => {
      switch (
        currentViewData.role
      ) {
        case 'teacher':
          return (
            <TeacherDashboard
              user={user}
              userData={
                currentViewData
              }
            />
          );

        case 'school_admin':
          return (
            <SchoolAdminDashboard
              userData={
                currentViewData
              }
            />
          );

        case 'admin':
          return (
            <AdminDashboard />
          );

        case 'student':
        default:
          return (
            <StudentView
              user={{
                uid:
                  currentViewUid,
              }}
              userData={{
                ...currentViewData,
                uid:
                  currentViewUid,
              }}
              isReadOnly={
                isSimulating
              }
            />
          );
      }
    };

  /* ==========================================================
     MAIN
  ========================================================== */

  return (
    <div className="min-h-screen">

      {/* ======================================================
          SIMULATION BAR
      ====================================================== */}

      {isSimulating && (
        <div className="
          bg-destructive/95
          text-white
          px-6
          py-4
          flex
          items-center
          justify-between
          sticky
          top-0
          z-[100]
          shadow-2xl
          backdrop-blur-md
        ">

          <div className="flex items-center gap-4 text-xs font-black uppercase tracking-widest">
            <Eye className="h-5 w-5" />

            <span>
              SİMÜLASYON:
            </span>

            <span className="underline underline-offset-4">
              {simulatedUserData?.displayName ||
                'Kullanıcı'}
            </span>

            <Badge className="bg-white/20 text-white border-none">
              SALT OKUNUR
            </Badge>
          </div>

          <Button
            variant="ghost"
            onClick={
              stopSimulation
            }
            className="text-white hover:bg-white/10 font-black gap-2 rounded-xl border border-white/20"
          >
            <XCircle className="h-5 w-5" />
            Kapat
          </Button>
        </div>
      )}

      {/* ======================================================
          LAYOUT
      ====================================================== */}

      <div className="grid lg:grid-cols-[320px_1fr] min-h-screen">

        {/* ====================================================
            SIDEBAR
        ==================================================== */}

        <aside className="
          bg-primary
          text-white
          hidden
          lg:flex
          flex-col
          border-r
          border-white/5
          shadow-2xl
          sticky
          top-0
          h-screen
          z-50
        ">

          {/* LOGO */}

          <div className="p-10">
            <Link
              href="/dashboard"
              className="flex items-center gap-5"
            >
              <div className="relative h-14 w-14 overflow-hidden rounded-2xl bg-white p-2">
                <Image
                  src={logoUrl}
                  alt="DEK Logo"
                  fill
                  className="object-contain"
                />
              </div>

              <div>
                <span className="font-black text-3xl block tracking-tighter italic uppercase">
                  DEK
                </span>

                <span className="text-[8px] opacity-40 block font-black uppercase tracking-widest">
                  Akademik Panel
                </span>
              </div>
            </Link>
          </div>

          {/* NAVIGATION */}

          <nav className="flex-1 px-6 space-y-2">

            {dynamicMenu.map(
              (
                item: any,
                index
              ) => {
                const Icon =
                  item.icon;

                const active =
                  item.href ===
                    '/dashboard' &&
                  !isSimulating;

                return (
                  <Button
                    key={index}
                    variant="ghost"
                    className={cn(
                      'w-full justify-start rounded-2xl h-14 group',
                      active
                        ? 'bg-white/15 text-white font-black'
                        : 'hover:bg-white/5 opacity-60 hover:opacity-100'
                    )}
                    asChild
                  >
                    <Link
                      href={
                        item.href
                      }
                    >
                      <Icon
                        className={cn(
                          'mr-5 h-5 w-5',
                          item.accent &&
                            'text-accent'
                        )}
                      />

                      <span className="text-sm tracking-tight italic uppercase">
                        {
                          item.label
                        }
                      </span>
                    </Link>
                  </Button>
                );
              }
            )}
          </nav>

          {/* USER */}

          <div className="p-7">

            <div
              onClick={() =>
                setIsProfileDialogOpen(
                  true
                )
              }
              className="p-5 bg-white/5 rounded-3xl border border-white/10 flex items-center gap-4 cursor-pointer hover:bg-white/10 transition-all"
            >
              <div className="h-12 w-12 rounded-xl bg-accent flex items-center justify-center text-white font-black text-xl">
                {userData?.displayName?.charAt(
                  0
                ) || (
                  <User className="h-5 w-5" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-black truncate">
                  {userData?.displayName ||
                    'Kullanıcı'}
                </p>

                <p className="text-[9px] opacity-40 uppercase tracking-widest">
                  {userData?.role ||
                    'HESABIM'}
                </p>
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 hover:bg-destructive rounded-xl"
                onClick={(
                  event
                ) => {
                  event.stopPropagation();

                  handleLogout();
                }}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </aside>

        {/* ====================================================
            MAIN
        ==================================================== */}

        <main className="flex flex-col relative overflow-hidden bg-[#FAFBFF]">

          {/* HEADER */}

          <header className="
            h-24
            bg-white/80
            backdrop-blur-3xl
            border-b
            border-primary/5
            flex
            items-center
            justify-between
            px-8 xl:px-12
            sticky
            top-0
            z-40
          ">

            <div className="flex items-center gap-5">

              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  router.push(
                    '/dashboard'
                  )
                }
                className="h-12 w-12 rounded-xl bg-slate-100 hover:bg-primary hover:text-white"
              >
                <Home className="h-5 w-5" />
              </Button>

              <h1 className="text-xl xl:text-2xl font-black text-primary uppercase tracking-tighter italic">
                {isSimulating
                  ? 'SİMÜLASYON MODU'
                  : currentViewData.role ===
                    'student'
                  ? 'AKADEMİK KOMUTA MERKEZİ'
                  : 'AKADEMİK HAREKÂT MERKEZİ'}
              </h1>
            </div>

            <div className="flex items-center gap-5">

              <div className="hidden md:flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-emerald-500 italic">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                CANLI
              </div>

              <div
                onClick={() =>
                  setIsProfileDialogOpen(
                    true
                  )
                }
                className="h-12 w-12 rounded-xl bg-accent overflow-hidden cursor-pointer shadow-xl flex items-center justify-center font-black text-white text-lg italic"
              >
                {userData?.displayName?.charAt(
                  0
                ) || (
                  <User className="h-5 w-5" />
                )}
              </div>
            </div>
          </header>

          {/* CONTENT */}

          <div className="flex-1 overflow-y-auto scrollbar-hide">
            {renderView()}
          </div>
        </main>
      </div>

      {/* ======================================================
          PROFILE
      ====================================================== */}

      <ProfileEditDialog
        isOpen={
          isProfileDialogOpen
        }
        onOpenChange={
          setIsProfileDialogOpen
        }
        userData={
          userData
        }
      />
    </div>
  );
}

/* ============================================================
   PAGE
============================================================ */

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
          <Loader2 className="h-10 w-10 animate-spin text-accent" />
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}