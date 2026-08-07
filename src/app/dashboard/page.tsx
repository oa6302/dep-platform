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
} from 'lucide-react';

import {
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';

import {
  doc,
  setDoc,
  serverTimestamp,
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

import { TeacherView } from '@/components/dashboard/teacher-view';
import { AdminView } from '@/components/dashboard/admin-view';
import { SchoolAdminView } from '@/components/dashboard/school-admin-view';

import { useToast } from '@/hooks/use-toast';


// ============================================================
// TYPES
// ============================================================

interface StudentViewProps {
  user: any;
  userData: any;
  isReadOnly?: boolean;
}


// ============================================================
// STUDENT VIEW
// ============================================================

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

  const {
    data: studyPlan,
    loading: studyPlanLoading,
  } = useDoc<any>(
    user?.uid
      ? `studyPlans/${user.uid}`
      : null
  );

  // ----------------------------------------------------------
  // POMODORO TIMER
  // ----------------------------------------------------------

  useEffect(() => {
    if (!activeTimer) return;

    if (timeLeft <= 0) {
      setActiveTimer(false);

      toast({
        title: 'Odak Seansı Tamamlandı 🎯',
        description: '25 dakikalık çalışma seansını tamamladın.',
        className: 'bg-primary text-white rounded-[2rem]',
      });

      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [activeTimer, timeLeft, toast]);

  // ----------------------------------------------------------
  // TOTAL COMPLETED TASKS
  // ----------------------------------------------------------

  const totalTasksCompleted = useMemo(() => {
    if (!studyPlan?.schedule) return 0;

    let count = 0;

    studyPlan.schedule.forEach((day: any) => {
      day.tasks?.forEach((task: any) => {
        if (task.status === 'completed') {
          count++;
        }
      });
    });

    return count;
  }, [studyPlan]);

  // ----------------------------------------------------------
  // GAMIFICATION
  // ----------------------------------------------------------

  const level =
    Math.floor(totalTasksCompleted / 10) + 1;

  const xp =
    totalTasksCompleted * 120;

  const xpToNextLevel = 1000;

  const currentXpInLevel =
    xp % xpToNextLevel;

  const progressToNextLevel =
    Math.min(
      (currentXpInLevel / xpToNextLevel) * 100,
      100
    );

  // ----------------------------------------------------------
  // TODAY
  // ----------------------------------------------------------

  const today = new Intl.DateTimeFormat(
    'tr-TR',
    {
      weekday: 'long',
    }
  ).format(new Date());

  const todayTasks = useMemo(() => {
    if (!studyPlan?.schedule) return [];

    const dayData =
      studyPlan.schedule.find(
        (s: any) =>
          s.day?.toLocaleLowerCase?.() ===
          today.toLocaleLowerCase()
      );

    return dayData?.tasks || [];
  }, [studyPlan, today]);

  // ----------------------------------------------------------
  // STATS
  // ----------------------------------------------------------

  const stats = [
    {
      label: 'TOPLAM XP',
      val: xp.toLocaleString('tr-TR'),
      icon: Zap,
      color: 'text-amber-500',
      bg: 'bg-amber-50',
    },
    {
      label: 'ÇALIŞMA',
      val: `${Math.floor(
        totalTasksCompleted * 0.75
      )} SAAT`,
      icon: Clock,
      color: 'text-blue-500',
      bg: 'bg-blue-50',
    },
    {
      label: 'NET ORT.',
      val: '84.5',
      icon: Target,
      color: 'text-emerald-500',
      bg: 'bg-emerald-50',
    },
  ];

  // ----------------------------------------------------------
  // ACADEMIC BALANCE
  // ----------------------------------------------------------

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

  // ----------------------------------------------------------
  // ADD SESSION
  // ----------------------------------------------------------

  const handleQuickAddSession =
    async (taskData: any) => {
      if (!db || !user) return;

      const newSchedule =
        studyPlan?.schedule
          ? [...studyPlan.schedule]
          : [];

      let dayIndex =
        newSchedule.findIndex(
          (s: any) => s.day === today
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
        newSchedule[dayIndex] = {
          ...newSchedule[dayIndex],
          tasks: [
            ...(newSchedule[dayIndex].tasks || []),
            newTask,
          ],
        };
      }

      try {
        await setDoc(
          doc(
            db,
            'studyPlans',
            user.uid
          ),
          {
            userId: user.uid,
            examId:
              userData?.targetExam ||
              'YKS_SAY',
            schedule: newSchedule,
            updatedAt:
              serverTimestamp(),
          },
          {
            merge: true,
          }
        );

        toast({
          title: 'Görev Senkronize Edildi',
          description:
            `${taskData.subject} seansı bugünlük planınıza eklendi.`,
          className:
            'bg-primary text-white rounded-[2rem]',
        });
      } catch (error) {
        console.error(
          'Görev ekleme hatası:',
          error
        );

        toast({
          variant: 'destructive',
          title: 'Hata',
          description:
            'Görev eklenirken bir sorun oluştu.',
        });
      }
    };

  // ----------------------------------------------------------
  // AI RECOMMENDATION
  // ----------------------------------------------------------

  const handleCreateRecommendedTask =
    async () => {
      setIsRecLoading(true);

      const exam =
        userData?.targetExam ||
        'YKS_SAY';

      const isSoz =
        exam.includes('SOZ');

      const recommendedTask = {
        subject: isSoz
          ? 'Edebiyat'
          : 'TYT Matematik',

        topic: isSoz
          ? 'Cumhuriyet Dönemi'
          : 'Problemler',

        time: '14:00',
        duration: '45 dk',
        difficulty: 'hard',
        xp: 75,
        studyType: 'questions',
      };

      await handleQuickAddSession(
        recommendedTask
      );

      setIsRecLoading(false);
    };

  // ----------------------------------------------------------
  // COMPLETE TASK
  // ----------------------------------------------------------

  const toggleTask = async (
    taskIndex: number
  ) => {
    if (
      isReadOnly ||
      !db ||
      !user ||
      !studyPlan?.schedule
    ) {
      return;
    }

    const newSchedule =
      studyPlan.schedule.map(
        (day: any) => ({
          ...day,
          tasks: [...(day.tasks || [])],
        })
      );

    const dayIndex =
      newSchedule.findIndex(
        (s: any) => s.day === today
      );

    if (dayIndex === -1) return;

    const task =
      newSchedule[dayIndex].tasks[
        taskIndex
      ];

    if (!task) return;

    newSchedule[dayIndex].tasks[
      taskIndex
    ] = {
      ...task,
      status:
        task.status === 'completed'
          ? 'pending'
          : 'completed',
    };

    try {
      await setDoc(
        doc(
          db,
          'studyPlans',
          user.uid
        ),
        {
          schedule: newSchedule,
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
        variant: 'destructive',
        title: 'Hata',
        description:
          'Görev durumu güncellenemedi.',
      });
    }
  };

  // ----------------------------------------------------------
  // FORMAT TIMER
  // ----------------------------------------------------------

  const formatTime = (
    seconds: number
  ) => {
    const minutes =
      Math.floor(seconds / 60);

    const sec =
      seconds % 60;

    return `${minutes}:${
      sec < 10 ? '0' : ''
    }${sec}`;
  };

  // ----------------------------------------------------------
  // RESET TIMER
  // ----------------------------------------------------------

  const resetTimer = () => {
    setActiveTimer(false);
    setTimeLeft(25 * 60);
  };

  // ----------------------------------------------------------
  // LOADING
  // ----------------------------------------------------------

  if (studyPlanLoading) {
    return (
      <div className="p-12 flex items-center justify-center min-h-[500px]">
        <div className="flex flex-col items-center gap-5">
          <Loader2 className="h-10 w-10 animate-spin text-accent" />

          <p className="text-xs font-black uppercase tracking-widest text-primary/40">
            Akademik Plan Yükleniyor
          </p>
        </div>
      </div>
    );
  }

  // ==========================================================
  // STUDENT DASHBOARD
  // ==========================================================

  return (
    <div className="p-8 lg:p-12 space-y-12 max-w-[1800px] mx-auto w-full animate-in fade-in duration-1000">

      {/* ======================================================
          TOP STATS
      ====================================================== */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

        {stats.map((stat, index) => {
          const Icon = stat.icon;

          return (
            <Card
              key={index}
              className="
                p-8
                rounded-[2.5rem]
                border-none
                shadow-[0_20px_40px_-10px_rgba(0,0,0,0.05)]
                bg-white
                flex
                items-center
                gap-6
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
                  'h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:rotate-6 shadow-sm',
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

                <p className="text-3xl font-black text-primary tracking-tighter italic">
                  {stat.val}
                </p>
              </div>
            </Card>
          );
        })}

        {/* STREAK */}

        <Card
          className="
            p-8
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
            cursor-pointer
          "
        >
          <div className="flex items-center gap-6">

            <div className="h-16 w-16 rounded-[1.5rem] bg-[#FFF1F2] flex items-center justify-center shrink-0 transition-transform group-hover:scale-110">
              <Flame className="h-8 w-8 text-[#FF4D4D] fill-current" />
            </div>

            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#94A3B8] mb-0.5">
                GÜNLÜK SERİ
              </p>

              <p className="text-4xl font-black text-[#0F172A] tracking-tighter italic">
                16 GÜN
              </p>
            </div>

          </div>

          <ChevronRight className="h-6 w-6 text-[#E2E8F0] group-hover:text-primary transition-colors" />
        </Card>
      </div>


      {/* ======================================================
          MAIN GRID
      ====================================================== */}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">

        {/* ====================================================
            LEFT
        ==================================================== */}

        <div className="xl:col-span-8 space-y-12">

          {/* ==================================================
              WELCOME CARD
          ================================================== */}

          <Card
            className="
              rounded-[4rem]
              border-none
              shadow-[0_60px_100px_-20px_rgba(15,23,42,0.12)]
              bg-white
              p-14
              relative
              overflow-hidden
              group
              border
              border-primary/5
            "
          >

            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-accent/10 transition-all duration-1000" />

            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-12">

              <div className="space-y-8 flex-1">

                <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-slate-50 border border-primary/5 text-primary/40 font-black text-[10px] uppercase tracking-widest italic shadow-sm">
                  <Activity className="h-3.5 w-3.5 text-accent animate-pulse" />
                  ACADEMIC NODE ACTIVE
                </div>

                <div className="space-y-3">

                  <h1 className="text-6xl font-black text-primary tracking-tighter italic uppercase leading-none text-shadow-deep">
                    GÜNAYDIN,
                    <br />

                    <span className="text-accent text-shadow-accent">
                      {
                        userData?.displayName
                          ?.split(' ')[0] ||
                        'ÖĞRENCİ'
                      }
                    </span>{' '}
                    👋
                  </h1>

                  <p className="text-xl font-medium text-muted-foreground italic leading-relaxed max-w-lg">
                    Bugün seni bekleyen{' '}
                    <span className="text-primary font-bold">
                      {todayTasks.length} kritik görev
                    </span>{' '}
                    ve yaklaşık{' '}
                    <span className="text-primary font-bold">
                      3 saatlik
                    </span>{' '}
                    bir akademik maraton var.
                  </p>

                </div>

                <div className="flex gap-6 flex-wrap">

                  <div className="px-6 py-4 rounded-[1.75rem] bg-primary text-white flex items-center gap-4 shadow-2xl shadow-primary/30">

                    <Zap className="h-5 w-5 text-accent" />

                    <div className="text-left">

                      <p className="text-[9px] font-black uppercase tracking-widest opacity-40">
                        GÜNLÜK HEDEF
                      </p>

                      <p className="text-lg font-black italic tracking-tighter">
                        +350 XP
                      </p>

                    </div>

                  </div>

                  <Button
                    onClick={() =>
                      setIsAddDialogOpen(true)
                    }
                    className="
                      h-16
                      px-10
                      rounded-[1.75rem]
                      bg-white
                      border-2
                      border-primary/5
                      text-primary
                      hover:bg-slate-50
                      font-black
                      text-xs
                      uppercase
                      tracking-widest
                      shadow-sm
                      gap-4
                    "
                  >
                    PROGRAMI YÖNET
                    <ArrowUpRight className="h-5 w-5 text-accent" />
                  </Button>

                </div>

              </div>


              {/* PROGRESS */}

              <div className="relative shrink-0">

                <div className="absolute inset-0 bg-accent/20 blur-[60px] rounded-full" />

                <div className="
                  h-52
                  w-52
                  rounded-[4rem]
                  bg-[#0F172A]
                  flex
                  items-center
                  justify-center
                  shadow-[0_40px_80px_-15px_rgba(0,0,0,0.4)]
                  transform
                  rotate-3
                  hover:rotate-0
                  transition-all
                  duration-700
                  border-[12px]
                  border-white
                  relative
                  z-10
                ">

                  <div className="text-center">

                    <p className="text-7xl font-black text-accent italic tracking-tighter text-shadow-accent">
                      %{progressToNextLevel.toFixed(0)}
                    </p>

                    <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mt-2">
                      PROGRESS
                    </p>

                  </div>

                </div>

              </div>

            </div>
          </Card>


          {/* ==================================================
              TODAY PLAN
          ================================================== */}

          <div className="space-y-8">

            <div className="flex justify-between items-end px-6">

              <div className="space-y-2">

                <p className="text-[11px] font-black uppercase tracking-[0.5em] text-muted-foreground/30 italic">
                  OPERATIONAL SCHEDULE
                </p>

                <h3 className="text-5xl font-black italic tracking-tighter uppercase text-primary flex items-center gap-5">
                  <Calendar className="h-10 w-10 text-accent" />
                  BUGÜNKÜ PLAN
                </h3>

              </div>

              <Button
                onClick={() =>
                  setIsAddDialogOpen(true)
                }
                variant="ghost"
                className="h-12 px-6 rounded-xl text-accent font-black text-xs uppercase tracking-widest hover:bg-accent/5 gap-3"
              >
                <Plus className="h-4 w-4" />
                SEANS EKLE
              </Button>

            </div>


            <div className="grid gap-6">

              {todayTasks.length > 0 ? (

                todayTasks.map(
                  (
                    task: any,
                    index: number
                  ) => (

                    <Card
                      key={index}
                      className="
                        group
                        p-10
                        rounded-[3rem]
                        border-none
                        shadow-[0_20px_50px_-10px_rgba(0,0,0,0.04)]
                        hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)]
                        transition-all
                        hover:scale-[1.01]
                        bg-white
                        flex
                        items-center
                        justify-between
                        border
                        border-primary/5
                        border-l-[12px]
                        border-l-primary
                      "
                    >

                      <div className="flex items-center gap-10">

                        <div className="text-center w-24 shrink-0">

                          <p className="text-2xl font-black text-primary tracking-tighter leading-none">
                            {task.time || '--:--'}
                          </p>

                          <p className="text-[10px] font-black text-muted-foreground/40 uppercase mt-2 tracking-widest">
                            START
                          </p>

                        </div>

                        <div className="h-16 w-px bg-primary/10" />

                        <div className="space-y-2">

                          <div className="flex items-center gap-3 flex-wrap">

                            <h4 className="text-3xl font-black italic tracking-tight text-primary uppercase leading-none group-hover:text-accent transition-colors">
                              {task.subject}
                            </h4>

                            <Badge
                              variant="outline"
                              className="text-[8px] font-black uppercase px-2 py-0 h-4 border-primary/10 opacity-40"
                            >
                              {task.difficulty ||
                                'Medium'}
                            </Badge>

                          </div>

                          <p className="text-lg font-medium text-muted-foreground italic opacity-60">
                            {task.topic}

                            {task.subtopic
                              ? ` • ${task.subtopic}`
                              : ''}

                            {task.duration
                              ? ` • ${task.duration}`
                              : ''}
                          </p>

                        </div>

                      </div>


                      <div className="flex items-center gap-6">

                        <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">

                          {task.bookUrl && (
                            <Button
                              size="icon"
                              variant="ghost"
                              asChild
                              className="h-12 w-12 rounded-[1.25rem] bg-slate-50 hover:bg-primary hover:text-white transition-all"
                            >
                              <a
                                href={task.bookUrl}
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
                              className="h-12 w-12 rounded-[1.25rem] bg-rose-50 hover:bg-rose-500 hover:text-white transition-all text-rose-500"
                            >
                              <a
                                href={task.youtubeUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <PlaySquare className="h-5 w-5" />
                              </a>
                            </Button>
                          )}

                        </div>


                        <Button
                          size="icon"
                          disabled={isReadOnly}
                          onClick={() =>
                            toggleTask(index)
                          }
                          className={cn(
                            `
                              h-16
                              w-16
                              rounded-[1.75rem]
                              shadow-2xl
                              transition-all
                              group-hover:rotate-6
                              group-active:scale-90
                            `,
                            task.status ===
                              'completed'
                              ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                              : 'bg-[#0F172A] text-white hover:bg-accent shadow-primary/20'
                          )}
                        >
                          {task.status ===
                          'completed' ? (
                            <CheckCircle className="h-8 w-8" />
                          ) : (
                            <Play className="h-8 w-8 fill-current" />
                          )}
                        </Button>

                      </div>

                    </Card>

                  )
                )

              ) : (

                <Card className="
                  p-24
                  text-center
                  bg-white/50
                  rounded-[4rem]
                  border
                  border-dashed
                  border-primary/10
                  flex
                  flex-col
                  items-center
                  gap-6
                ">

                  <Calendar className="h-12 w-12 text-primary/10" />

                  <p className="font-black text-primary/20 uppercase tracking-[0.5em] text-xs italic">
                    BUGÜN İÇİN PLANLANMIŞ GÖREV BULUNMUYOR.
                  </p>

                  <Button
                    onClick={() =>
                      setIsAddDialogOpen(true)
                    }
                    className="rounded-2xl bg-primary text-white font-black"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    İLK SEANSI EKLE
                  </Button>

                </Card>

              )}

            </div>

          </div>


          {/* ==================================================
              ANALYTICS
          ================================================== */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

            {/* TREND */}

            <Card className="
              p-12
              rounded-[3.5rem]
              border-none
              shadow-[0_40px_80px_-20px_rgba(0,0,0,0.06)]
              bg-white
              space-y-10
              border
              border-primary/5
            ">

              <div className="flex justify-between items-center">

                <div className="space-y-1">

                  <h4 className="text-2xl font-black italic tracking-tighter uppercase text-primary">
                    Akademik Trend
                  </h4>

                  <p className="text-[10px] font-bold text-muted-foreground italic uppercase tracking-widest">
                    Haftalık XP Dağılımı
                  </p>

                </div>

                <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-emerald-500" />
                </div>

              </div>

              <div className="h-[220px] w-full">

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

                    <defs>

                      <linearGradient
                        id="colorVal"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >

                        <stop
                          offset="5%"
                          stopColor="#F59E0B"
                          stopOpacity={0.4}
                        />

                        <stop
                          offset="95%"
                          stopColor="#F59E0B"
                          stopOpacity={0}
                        />

                      </linearGradient>

                    </defs>

                    <Area
                      type="monotone"
                      dataKey="val"
                      stroke="#F59E0B"
                      strokeWidth={4}
                      fillOpacity={1}
                      fill="url(#colorVal)"
                    />

                  </AreaChart>

                </ResponsiveContainer>

              </div>

            </Card>


            {/* BALANCE */}

            <Card className="
              p-12
              rounded-[3.5rem]
              border-none
              shadow-[0_40px_80px_-20px_rgba(0,0,0,0.06)]
              bg-white
              space-y-10
              border
              border-primary/5
            ">

              <div className="flex justify-between items-center">

                <div className="space-y-1">

                  <h4 className="text-2xl font-black italic tracking-tighter uppercase text-primary">
                    Akademik Denge
                  </h4>

                  <p className="text-[10px] font-bold text-muted-foreground italic uppercase tracking-widest">
                    Ders Yetkinlik Skorları
                  </p>

                </div>

                <div className="h-12 w-12 rounded-2xl bg-primary/5 flex items-center justify-center">
                  <Target className="h-6 w-6 text-primary" />
                </div>

              </div>

              <div className="space-y-6">

                {academicBalance.map(
                  (item, index) => (

                    <div
                      key={index}
                      className="space-y-3 group cursor-default"
                    >

                      <div className="flex justify-between items-center">

                        <span className="text-[11px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors">
                          {item.subject}
                        </span>

                        <span className="text-sm font-black text-primary italic tracking-tighter">
                          %{item.val}
                        </span>

                      </div>

                      <div className="h-2.5 w-full bg-slate-50 rounded-full overflow-hidden shadow-inner p-0.5">

                        <div
                          className="h-full rounded-full transition-all duration-1000 group-hover:brightness-110 shadow-sm"
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
            RIGHT PANEL
        ==================================================== */}

        <div className="xl:col-span-4 space-y-10">

          {/* ==================================================
              METRICS
          ================================================== */}

          <Card className="
            rounded-[4rem]
            border-none
            shadow-[0_60px_120px_-30px_rgba(15,23,42,0.15)]
            bg-white
            overflow-hidden
            border
            border-primary/5
          ">

            <div className="bg-primary p-10 text-white flex justify-between items-center relative overflow-hidden">

              <div className="absolute top-0 right-0 w-48 h-48 bg-accent/10 blur-[80px] rounded-full" />

              <div className="space-y-2 relative z-10">

                <p className="text-[11px] font-black text-white/30 uppercase tracking-[0.4em] italic">
                  OPERATIONAL NODE
                </p>

                <h4 className="text-3xl font-black italic tracking-tighter uppercase leading-none">
                  KİŞİSEL
                  <br />
                  METRİKLER
                </h4>

              </div>

              <Trophy
                className="h-10 w-10 text-accent relative z-10 animate-bounce"
                style={{
                  animationDuration:
                    '3s',
                }}
              />

            </div>


            <div className="p-12 space-y-12">

              {/* LEVEL */}

              <div className="space-y-6">

                <div className="flex items-center gap-6">

                  <div className="h-16 w-16 rounded-[1.5rem] bg-amber-50 flex items-center justify-center shadow-sm">
                    <Award className="h-8 w-8 text-amber-500" />
                  </div>

                  <div>

                    <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest mb-0.5">
                      AKADEMİK RÜTBE
                    </p>

                    <p className="text-2xl font-black text-primary italic tracking-tighter">
                      LEVEL {level}
                    </p>

                  </div>

                </div>


                <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden p-1 shadow-inner">

                  <div
                    className="h-full bg-accent rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(245,158,11,0.5)]"
                    style={{
                      width: `${progressToNextLevel}%`,
                    }}
                  />

                </div>

              </div>


              {/* XP */}

              <div className="flex items-center justify-between">

                <div className="space-y-1">

                  <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">
                    TOPLAM XP
                  </p>

                  <p className="text-6xl font-black text-primary tracking-tighter text-shadow-deep">
                    {xp}
                  </p>

                </div>

                <div className="h-16 w-16 rounded-[2rem] bg-emerald-50 flex items-center justify-center shadow-inner">

                  <TrendingUp className="h-8 w-8 text-emerald-500" />

                </div>

              </div>


              {/* POMODORO */}

              <div className="
                p-10
                bg-[#F8FAFC]
                rounded-[3.5rem]
                border
                border-primary/5
                space-y-8
                shadow-inner
                relative
                overflow-hidden
              ">

                <div className="absolute top-0 right-0 w-40 h-48 bg-accent/5 blur-[60px] rounded-full" />

                <div className="flex items-center justify-between relative z-10">

                  <span className="text-[11px] font-black uppercase tracking-[0.4em] text-primary/30 italic">
                    FOCUS TERMINAL
                  </span>

                  <Timer className="h-6 w-6 text-accent animate-pulse" />

                </div>


                <p className="text-7xl font-black text-primary tracking-tighter leading-none text-shadow-deep relative z-10 text-center tabular-nums">
                  {formatTime(timeLeft)}
                </p>


                <div className="grid grid-cols-[1fr_auto] gap-3 relative z-10">

                  <Button
                    onClick={() =>
                      setActiveTimer(
                        !activeTimer
                      )
                    }
                    className="
                      h-16
                      rounded-2xl
                      bg-primary
                      text-white
                      hover:bg-accent
                      transition-all
                      font-black
                      text-xs
                      uppercase
                      tracking-[0.3em]
                      shadow-2xl
                    "
                  >

                    {activeTimer
                      ? 'SEANSI DURDUR'
                      : 'ODAKLANMAYI BAŞLAT'}

                    <Play className="ml-3 h-5 w-5" />

                  </Button>

                  <Button
                    onClick={resetTimer}
                    variant="outline"
                    className="h-16 w-16 rounded-2xl border-primary/10"
                  >
                    <XCircle className="h-5 w-5" />
                  </Button>

                </div>

              </div>

            </div>

          </Card>


          {/* ==================================================
              AI
          ================================================== */}

          <Card className="
            p-12
            rounded-[4rem]
            border-none
            shadow-[0_60px_100px_-20px_rgba(245,158,11,0.2)]
            bg-accent
            text-primary
            space-y-8
            relative
            overflow-hidden
            group
            border
            border-white/20
          ">

            <Sparkles className="
              absolute
              top-8
              right-8
              h-12
              w-12
              opacity-20
              group-hover:scale-125
              group-hover:rotate-12
              transition-transform
              duration-700
            " />

            <div className="space-y-2 relative z-10">

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-[9px] font-black uppercase tracking-widest">
                Akademik Analiz Motoru
              </div>

              <h4 className="text-3xl font-black italic tracking-tighter uppercase leading-none">
                AI BUGÜN
                <br />
                NE DİYOR?
              </h4>

            </div>


            <div className="space-y-6 relative z-10">

              <p className="text-xl leading-relaxed font-bold italic text-shadow-deep">

                "Bugün{' '}

                <span className="underline decoration-4 decoration-white/40 underline-offset-8">

                  {userData?.targetExam?.includes(
                    'SOZ'
                  )
                    ? 'Edebiyat'
                    : 'TYT Matematik'}

                  {' - '}

                  {userData?.targetExam?.includes(
                    'SOZ'
                  )
                    ? 'Cumhuriyet Dönemi'
                    : 'Problemler'}

                </span>{' '}

                çalışırsan hedef netine{' '}

                <span className="text-white">
                  +0.2 katkı
                </span>{' '}

                sağlayabilirsin."

              </p>


              <Button
                onClick={
                  handleCreateRecommendedTask
                }
                disabled={isRecLoading}
                className="
                  w-full
                  h-14
                  rounded-2xl
                  bg-white/20
                  hover:bg-white/40
                  text-primary
                  font-black
                  text-[11px]
                  uppercase
                  tracking-widest
                  border
                  border-white/20
                  shadow-sm
                  transition-all
                  active:scale-95
                  gap-3
                "
              >

                {isRecLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Zap className="h-4 w-4" />
                )}

                Görevi Hemen Oluştur

              </Button>

            </div>

          </Card>


          {/* ==================================================
              ACHIEVEMENTS
          ================================================== */}

          <Card className="
            p-12
            rounded-[4rem]
            border-none
            shadow-[0_40px_80px_-20px_rgba(0,0,0,0.06)]
            bg-white
            space-y-10
            border
            border-primary/5
          ">

            <div className="flex justify-between items-center">

              <h4 className="text-2xl font-black italic tracking-tighter uppercase text-primary">
                Son Başarılar
              </h4>

              <Award className="h-7 w-7 text-accent" />

            </div>


            <div className="space-y-8">

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
                      className="flex gap-6 items-center group cursor-pointer"
                    >

                      <div
                        className={cn(
                          'h-14 w-14 rounded-[1.25rem] flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-inner',
                          achievement.bg
                        )}
                      >
                        <Icon
                          className={cn(
                            'h-7 w-7',
                            achievement.color
                          )}
                        />
                      </div>

                      <div className="space-y-1">

                        <p className="text-base font-black text-primary uppercase italic leading-none">
                          {achievement.label}
                        </p>

                        <p className="text-[10px] font-bold text-muted-foreground opacity-60 uppercase tracking-widest">
                          {achievement.desc}
                        </p>

                      </div>

                      <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical className="h-5 w-5 text-muted-foreground/30" />
                      </div>

                    </div>
                  );
                }
              )}

            </div>

          </Card>

        </div>

      </div>


      {/* ======================================================
          SESSION DIALOG
      ====================================================== */}

      <AcademicSessionDialog
        isOpen={isAddDialogOpen}
        onOpenChange={
          setIsAddDialogOpen
        }
        onSave={
          handleQuickAddSession
        }
        selectedDay={today}
      />


      {/* ======================================================
          FLOATING ACTION BUTTON
      ====================================================== */}

      <div className="fixed bottom-12 right-12 z-[100] group">

        <div className="
          absolute
          -inset-6
          bg-accent/20
          blur-[40px]
          rounded-full
          opacity-0
          group-hover:opacity-100
          transition-opacity
          duration-700
        " />

        <Button
          onClick={() =>
            setIsAddDialogOpen(true)
          }
          className="
            h-28
            w-28
            rounded-[3.5rem]
            bg-[#0F172A]
            hover:bg-accent
            text-white
            shadow-[0_40px_80px_-20px_rgba(15,23,42,0.6)]
            transition-all
            duration-700
            hover:scale-110
            flex
            flex-col
            items-center
            justify-center
            gap-2
            border-[10px]
            border-white
            relative
            z-10
          "
        >

          <Plus className="
            h-12
            w-12
            text-accent
            group-hover:rotate-90
            transition-transform
            duration-500
          " />

          <span className="text-[9px] font-black tracking-[0.3em] uppercase opacity-40">
            NEW SESSION
          </span>

        </Button>

      </div>

    </div>
  );
}


// ============================================================
// DASHBOARD CONTENT
// ============================================================

function DashboardContent() {
  const {
    user,
    loading: authLoading,
  } = useUser();

  const auth = useAuth();

  const router = useRouter();

  const searchParams =
    useSearchParams();

  const simulatedUserId =
    searchParams.get('simulate');

  const [
    isProfileDialogOpen,
    setIsProfileDialogOpen,
  ] = useState(false);


  // ----------------------------------------------------------
  // USER DATA
  // ----------------------------------------------------------

  const {
    data: userData,
    loading: docLoading,
  } = useDoc<any>(
    user?.uid
      ? `users/${user.uid}`
      : null
  );


  // ----------------------------------------------------------
  // SIMULATED USER
  // ----------------------------------------------------------

  const {
    data: simulatedUserData,
  } = useDoc<any>(
    simulatedUserId
      ? `users/${simulatedUserId}`
      : null
  );


  // ----------------------------------------------------------
  // CURRENT VIEW DATA
  // ----------------------------------------------------------

  const currentViewData =
    simulatedUserData ||
    userData;

  const isSimulating =
    !!simulatedUserId;


  // ----------------------------------------------------------
  // LOGO
  // ----------------------------------------------------------

  const logoUrl =
    PlaceHolderImages.find(
      (img) =>
        img.id === 'app-logo'
    )?.imageUrl ||
    'https://picsum.photos/seed/edu-logo-102/400/400';


  // ----------------------------------------------------------
  // GLOBAL LOADING
  // ----------------------------------------------------------

  const isGlobalLoading =
    authLoading ||
    (!!user && docLoading);


  // ----------------------------------------------------------
  // MENU
  // ----------------------------------------------------------

  const dynamicMenu =
    useMemo(() => {

      if (!currentViewData) {
        return [];
      }

      // ADMIN

      if (
        currentViewData.role ===
        'admin'
      ) {
        return [
          {
            label: 'Sistem Paneli',
            icon: LayoutDashboard,
            href: '/dashboard',
          },
          {
            label: 'Müfredat Motoru',
            icon: Library,
            href: '/dashboard/admin/curriculum',
          },
          {
            label: 'Uzmanlar',
            icon: Users,
            href: '/dashboard/discover',
          },
          {
            label: 'Destek',
            icon: Headset,
            href: '/dashboard/contact',
          },
        ];
      }

      // SCHOOL ADMIN

      if (
        currentViewData.role ===
        'school_admin'
      ) {
        return [
          {
            label: 'Okul Paneli',
            icon: LayoutDashboard,
            href: '/dashboard',
          },
          {
            label: 'Öğretmenler',
            icon: User,
            href: '#',
          },
          {
            label: 'Şubeler',
            icon: PieChart,
            href: '#',
          },
          {
            label: 'Destek',
            icon: Headset,
            href: '/dashboard/contact',
          },
        ];
      }

      // TEACHER

      if (
        currentViewData.role ===
        'teacher'
      ) {
        return [
          {
            label: 'Öğretmen Paneli',
            icon: LayoutDashboard,
            href: '/dashboard',
          },
          {
            label: 'Öğrencilerim',
            icon: Users,
            href: '#',
          },
          {
            label: 'Uzman Keşfet',
            icon: Compass,
            href: '/dashboard/discover',
          },
          {
            label: 'Destek',
            icon: Headset,
            href: '/dashboard/contact',
          },
        ];
      }

      // STUDENT

      const items: any[] = [
        {
          label: 'Akademik Panel',
          icon: LayoutDashboard,
          href: '/dashboard',
        },
        {
          label: 'AI Analiz',
          icon: Brain,
          href: '/dashboard/ai-analysis',
          accent: true,
        },
        {
          label: 'Akıllı Planlama',
          icon: Calendar,
          href: '/dashboard/planning',
        },
        {
          label: 'Uzman Keşfet',
          icon: Compass,
          href: '/dashboard/discover',
        },
      ];

      const config =
        EXAM_CONFIGS[
          currentViewData.targetExam ||
            'LGS'
        ] ||
        EXAM_CONFIGS['LGS'];

      if (config?.modules) {

        config.modules
          .slice(0, 3)
          .forEach((mod: any) => {

            items.push({
              label: mod.title,
              icon: mod.icon,
              href: '#',
            });

          });

      }

      items.push({
        label: 'Destek Hattı',
        icon: Headset,
        href: '/dashboard/contact',
      });

      return items;

    }, [currentViewData]);


  // ----------------------------------------------------------
  // REDIRECT
  // ----------------------------------------------------------

  useEffect(() => {

    if (
      !authLoading &&
      !user
    ) {
      router.push('/login');
    }

  }, [
    user,
    authLoading,
    router,
  ]);


  // ----------------------------------------------------------
  // LOADING SCREEN
  // ----------------------------------------------------------

  if (isGlobalLoading) {

    return (
      <div className="
        min-h-screen
        flex
        items-center
        justify-center
        bg-[#F8FAFC]
      ">

        <div className="flex flex-col items-center gap-10">

          <div className="relative">

            <div className="
              h-32
              w-32
              animate-spin
              rounded-[3.5rem]
              border-[10px]
              border-accent
              border-t-transparent
              shadow-[0_0_80px_rgba(245,158,11,0.3)]
            " />

            <Sparkles className="
              absolute
              inset-0
              m-auto
              h-10
              w-10
              text-accent
              animate-pulse
            " />

          </div>

          <div className="text-center space-y-2">

            <p className="
              text-[14px]
              text-primary
              font-black
              uppercase
              tracking-[0.6em]
              animate-pulse
              italic
            ">
              Akademik Motor Hazırlanıyor
            </p>

            <p className="
              text-[10px]
              text-muted-foreground
              font-bold
              uppercase
              tracking-widest
              italic
              opacity-40
            ">
              Verileriniz Senkronize Ediliyor...
            </p>

          </div>

        </div>

      </div>
    );
  }


  // ----------------------------------------------------------
  // PROFILE COMPLETION
  // ----------------------------------------------------------

  if (
    user &&
    !docLoading &&
    !userData
  ) {

    return (
      <div className="
        min-h-screen
        bg-[#F8FAFC]
        flex
        items-center
        justify-center
        p-6
        relative
        overflow-hidden
      ">

        <div className="
          absolute
          top-0
          right-0
          w-[50%]
          h-[50%]
          bg-accent/5
          blur-[150px]
          rounded-full
        " />

        <div className="
          w-full
          max-w-4xl
          space-y-12
          relative
          z-10
        ">

          <div className="text-center space-y-4">

            <div className="
              inline-flex
              items-center
              gap-2
              px-5
              py-2
              rounded-full
              bg-primary
              text-white
              font-black
              text-[10px]
              uppercase
              tracking-widest
              shadow-xl
            ">

              <ShieldCheck className="h-4 w-4 text-accent" />

              Sistem Kurulumu

            </div>

            <h2 className="
              text-5xl
              font-black
              italic
              tracking-tighter
              text-primary
              uppercase
              leading-none
              text-shadow-premium
            ">

              PROFİLİNİZİ{' '}

              <span className="text-accent text-shadow-accent">
                TAMAMLAYIN
              </span>

            </h2>

            <p className="text-muted-foreground font-medium italic">
              Sistemi size özel yapılandırmak için son birkaç bilgiye ihtiyacımız var.
            </p>

          </div>


          <div className="
            bg-white
            rounded-[4rem]
            shadow-2xl
            border
            border-primary/5
            overflow-hidden
          ">

            <AuthForm
              mode="register"
              isProfileCompletion={true}
            />

          </div>


          <div className="text-center">

            <Button
              variant="ghost"
              onClick={() =>
                auth &&
                signOut(auth)
              }
              className="
                text-muted-foreground
                font-black
                text-[10px]
                uppercase
                tracking-widest
                gap-2
              "
            >

              <LogOut className="h-3 w-3" />

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


  // ----------------------------------------------------------
  // LOGOUT
  // ----------------------------------------------------------

  const handleLogout =
    async () => {

      if (auth) {

        await signOut(auth);

        router.push('/');

      }

    };


  // ----------------------------------------------------------
  // STOP SIMULATION
  // ----------------------------------------------------------

  const stopSimulation =
    () => {

      const params =
        new URLSearchParams(
          searchParams
        );

      params.delete(
        'simulate'
      );

      const query =
        params.toString();

      router.push(
        query
          ? `/dashboard?${query}`
          : '/dashboard'
      );

    };


  // ----------------------------------------------------------
  // RENDER VIEW
  // ----------------------------------------------------------

  const renderView =
    () => {

      switch (
        currentViewData?.role
      ) {

        case 'student':

          return (
            <StudentView
              user={{
                uid:
                  currentViewData.uid,
              }}
              userData={
                currentViewData
              }
              isReadOnly={
                isSimulating
              }
            />
          );


        case 'teacher':

          return (
            <TeacherView
              user={user}
              userData={
                currentViewData
              }
            />
          );


        case 'school_admin':

          return (
            <SchoolAdminView
              user={user}
              userData={
                currentViewData
              }
            />
          );


        case 'admin':

          return (
            <AdminView
              user={user}
              userData={
                currentViewData
              }
            />
          );


        default:

          return (
            <StudentView
              user={{
                uid:
                  currentViewData?.uid,
              }}
              userData={
                currentViewData
              }
            />
          );

      }

    };


  // ==========================================================
  // MAIN DASHBOARD
  // ==========================================================

  return (
    <div className="
      min-h-screen
      bg-[#FAFBFF]
      selection:bg-accent
      selection:text-white
    ">

      {/* ======================================================
          SIMULATION BAR
      ====================================================== */}

      {isSimulating && (

        <div className="
          bg-destructive
          text-white
          px-8
          py-5
          flex
          items-center
          justify-between
          sticky
          top-0
          z-[100]
          shadow-2xl
          animate-in
          slide-in-from-top
          duration-700
          backdrop-blur-md
          bg-destructive/90
        ">

          <div className="
            flex
            items-center
            gap-5
            text-xs
            font-black
            uppercase
            tracking-widest
            italic
          ">

            <Eye className="h-5 w-5" />

            SİMÜLASYON:

            <span className="underline underline-offset-8">
              {
                simulatedUserData?.displayName ||
                'Kullanıcı'
              }
            </span>

          </div>


          <Button
            variant="ghost"
            onClick={
              stopSimulation
            }
            className="
              text-white
              hover:bg-white/10
              font-black
              h-12
              gap-3
              rounded-2xl
              border-2
              border-white/20
              px-10
            "
          >

            <XCircle className="h-5 w-5" />

            Kapat

          </Button>

        </div>

      )}


      {/* ======================================================
          LAYOUT
      ====================================================== */}

      <div className="
        grid
        lg:grid-cols-[340px_1fr]
        min-h-screen
      ">


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
          z-50
          sticky
          top-0
          h-screen
        ">

          {/* LOGO */}

          <div className="p-12">

            <Link
              href="/dashboard"
              className="
                flex
                items-center
                gap-6
                group
              "
            >

              <div className="
                relative
                h-16
                w-16
                overflow-hidden
                rounded-[1.5rem]
                bg-white
                p-2
              ">

                <Image
                  src={logoUrl}
                  alt="DEK Logo"
                  fill
                  className="object-contain"
                />

              </div>


              <div>

                <span className="
                  font-black
                  text-3xl
                  block
                  tracking-tighter
                  italic
                  uppercase
                  text-shadow-premium
                ">
                  DEK
                </span>

                <span className="
                  text-[9px]
                  opacity-40
                  block
                  font-black
                  uppercase
                  tracking-widest
                ">
                  Akademik Panel
                </span>

              </div>

            </Link>

          </div>


          {/* NAVIGATION */}

          <nav className="
            flex-1
            px-8
            space-y-3
            mt-10
          ">

            {dynamicMenu.map(
              (item: any, index) => {

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
                      `
                        w-full
                        justify-start
                        rounded-[1.5rem]
                        transition-all
                        h-18
                        group
                        relative
                      `,
                      active
                        ? 'bg-white/15 text-white font-black'
                        : 'hover:bg-white/5 opacity-60 hover:opacity-100'
                    )}
                    asChild
                  >

                    <Link
                      href={item.href}
                    >

                      <Icon
                        className={cn(
                          `
                            mr-6
                            h-7
                            w-7
                            transition-transform
                            group-hover:scale-110
                          `,
                          item.accent &&
                            'text-accent'
                        )}
                      />

                      <span className="
                        text-lg
                        tracking-tight
                        italic
                        uppercase
                      ">
                        {item.label}
                      </span>

                    </Link>

                  </Button>

                );
              }
            )}

          </nav>


          {/* USER CARD */}

          <div className="p-10">

            <div
              onClick={() =>
                setIsProfileDialogOpen(
                  true
                )
              }
              className="
                p-8
                bg-white/5
                rounded-[3rem]
                border
                border-white/10
                flex
                items-center
                gap-6
                cursor-pointer
                hover:bg-white/10
                transition-all
              "
            >

              <div className="
                h-14
                w-14
                rounded-[1.25rem]
                bg-accent
                flex
                items-center
                justify-center
                text-white
                font-black
                text-2xl
                italic
              ">

                {userData?.displayName?.charAt(
                  0
                ) || (
                  <User className="h-6 w-6" />
                )}

              </div>


              <div className="
                flex-1
                overflow-hidden
              ">

                <p className="text-sm font-black truncate">
                  {userData?.displayName ||
                    'Yükleniyor...'}
                </p>

                <p className="
                  text-[10px]
                  opacity-40
                  uppercase
                  tracking-widest
                  mt-1
                ">
                  HESABIM
                </p>

              </div>


              <Button
                variant="ghost"
                size="icon"
                className="
                  h-10
                  w-10
                  hover:bg-destructive
                  rounded-xl
                  transition-all
                "
                onClick={(event) => {

                  event.stopPropagation();

                  handleLogout();

                }}
              >

                <LogOut className="h-5 w-5" />

              </Button>

            </div>

          </div>

        </aside>


        {/* ====================================================
            MAIN
        ==================================================== */}

        <main className="
          flex
          flex-col
          relative
          overflow-hidden
          bg-[#FAFBFF]
        ">

          {/* HEADER */}

          <header className="
            h-28
            bg-white/80
            backdrop-blur-3xl
            border-b
            border-primary/5
            flex
            items-center
            justify-between
            px-12
            sticky
            top-0
            z-40
          ">

            <div className="
              flex
              items-center
              gap-8
            ">

              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  router.push(
                    '/dashboard'
                  )
                }
                className="
                  h-14
                  w-14
                  rounded-2xl
                  bg-slate-100
                  hover:bg-primary
                  hover:text-white
                  transition-all
                  shadow-sm
                "
              >

                <Home className="h-6 w-6" />

              </Button>


              <h1 className="
                text-3xl
                font-black
                text-primary
                uppercase
                tracking-tighter
                italic
              ">

                {isSimulating
                  ? 'SİMÜLASYON MODU'
                  : userData?.role ===
                    'student'
                  ? 'AKADEMİK KOMUTA MERKEZİ'
                  : 'AKADEMİK HAREKÂT MERKEZİ'}

              </h1>

            </div>


            <div className="
              flex
              items-center
              gap-8
            ">

              <div className="
                flex
                items-center
                gap-2
                text-[10px]
                font-black
                uppercase
                tracking-widest
                text-emerald-500
                italic
              ">

                <span className="
                  h-2
                  w-2
                  rounded-full
                  bg-emerald-500
                  animate-pulse
                " />

                CANLI

              </div>


              <div
                onClick={() =>
                  setIsProfileDialogOpen(
                    true
                  )
                }
                className="
                  h-14
                  w-14
                  rounded-2xl
                  bg-accent
                  overflow-hidden
                  cursor-pointer
                  shadow-2xl
                  transition-all
                  hover:scale-105
                  flex
                  items-center
                  justify-center
                  font-black
                  text-white
                  text-xl
                  italic
                  border-4
                  border-white/20
                "
              >

                {userData?.displayName?.charAt(
                  0
                ) || (
                  <User className="h-6 w-6" />
                )}

              </div>

            </div>

          </header>


          {/* CONTENT */}

          <div className="
            flex-1
            overflow-y-auto
            scrollbar-hide
          ">

            {renderView()}

          </div>

        </main>

      </div>


      {/* PROFILE */}

      <ProfileEditDialog
        isOpen={
          isProfileDialogOpen
        }
        onOpenChange={
          setIsProfileDialogOpen
        }
        userData={userData}
      />

    </div>
  );
}


// ============================================================
// PAGE
// ============================================================

export default function DashboardPage() {

  return (

    <Suspense
      fallback={
        <div className="
          min-h-screen
          flex
          items-center
          justify-center
          bg-[#F8FAFC]
        ">

          <Loader2 className="
            h-10
            w-10
            animate-spin
            text-accent
          " />

        </div>
      }
    >

      <DashboardContent />

    </Suspense>

  );
}