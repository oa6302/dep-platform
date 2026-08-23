
'use client';

import { useCollection, useFirestore, useUser } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, Server, Loader2, RefreshCcw, Zap, Building, 
  Key, ArrowRight, BookOpenCheck, Plus, 
  Activity, ShieldCheck, Globe, Database, UserPlus, Sparkles,
  ShieldAlert, LayoutDashboard, Terminal, HardDrive, Cpu,
  Trash2, UserCog, CheckCircle2, XCircle, Search, Mail,
  Shield, Video, FileQuestion, BookOpen, Sun, Atom, FlaskConical, Microscope, Calculator
} from 'lucide-react';
import { 
  orderBy, doc, setDoc, serverTimestamp, updateDoc, 
  deleteDoc, query, collection, where 
} from 'firebase/firestore';
import { useState, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { EXAM_CONFIGS } from '@/lib/exam-configs';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface AdminViewProps {
  user: any;
  userData: any;
}

export function AdminView({ user, userData }: AdminViewProps) {
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  
  const [refreshing, setRefreshing] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [userSearch, setUserSearch] = useState('');

  const { data: allUsers = [], loading: usersLoading } = useCollection<any>('users', orderBy('createdAt', 'desc'));
  
  const teacherCount = allUsers.filter(u => u.role === 'teacher').length;
  const studentCount = allUsers.filter(u => u.role === 'student').length;
  const schoolCount = allUsers.filter(u => u.role === 'school_admin').length;

  const handleSeedCurriculum = async () => {
    if (!db) return;
    setSeeding(true);
    try {
      const tytTree = [
        { 
          id: 'TYT_TURKCE', name: 'Türkçe', order: 1, units: [
            { id: 'TR_U1', name: 'Sözcükte Anlam', topics: ['Gerçek ve Mecaz Anlam', 'Deyimler ve Atasözleri', 'Söz Yorumu'] },
            { id: 'TR_U2', name: 'Cümlede Anlam', topics: ['Neden-Sonuç / Amaç-Sonuç', 'Öznel ve Nesnel Yargı', 'Çıkarım'] },
            { id: 'TR_U3', name: 'Paragraf', topics: ['Ana Düşünce', 'Paragrafta Yapı', 'Anlatım Teknikleri', 'Sözel Mantık'] },
            { id: 'TR_U4', name: 'Dil Bilgisi', topics: ['Ses Bilgisi', 'Yazım Kuralları', 'Noktalama İşaretleri', 'Sözcük Türleri', 'Cümlenin Ögeleri'] }
          ]
        },
        { 
          id: 'TYT_MATEMATIK', name: 'Matematik', order: 2, units: [
            { id: 'MAT_U1', name: 'Temel Kavramlar', topics: ['Sayı Kümeleri', 'Ardışık Sayılar', 'Asal Sayılar'] },
            { id: 'MAT_U2', name: 'Sayı Basamakları', topics: ['Basamak Kavramı', 'Çözümleme'] },
            { id: 'MAT_U3', name: 'Bölme ve Bölünebilme', topics: ['Bölünebilme Kuralları', 'Kalan Bulma'] },
            { id: 'MAT_U4', name: 'EBOB-EKOK', topics: ['EBOB-EKOK Problemleri'] },
            { id: 'MAT_U5', name: 'Rasyonel Sayılar', topics: ['Ondalık Sayılar', 'Sıralama'] },
            { id: 'MAT_U6', name: 'Problemler', topics: ['Sayı Problemleri', 'Yaş Problemleri', 'Yüzde Problemleri', 'Hareket Problemleri', 'Grafik Problemleri'] },
            { id: 'MAT_U7', name: 'Mantık ve Kümeler', topics: ['Bileşik Önermeler', 'Kartezyen Çarpım'] }
          ]
        },
        {
          id: 'TYT_GEOMETRI', name: 'Geometri', order: 3, units: [
            { id: 'GEO_U1', name: 'Üçgenler', topics: ['Doğruda ve Üçgende Açılar', 'Özel Üçgenler', 'Benzerlik', 'Alan'] },
            { id: 'GEO_U2', name: 'Çokgenler ve Dörtgenler', topics: ['Paralelkenar', 'Dikdörtgen', 'Yamuk'] },
            { id: 'GEO_U3', name: 'Çember ve Daire', topics: ['Çemberde Açı', 'Dairede Alan'] },
            { id: 'GEO_U4', name: 'Katı Cisimler', topics: ['Prizmalar', 'Piramit ve Koni'] }
          ]
        },
        {
          id: 'TYT_FIZIK', name: 'Fizik', order: 4, units: [
            { id: 'FIZ_U1', name: 'Madde ve Özellikleri', topics: ['Özkütle', 'Dayanıklılık'] },
            { id: 'FIZ_U2', name: 'Hareket ve Kuvvet', topics: ['Newton Yasaları', 'İvme'] },
            { id: 'FIZ_U3', name: 'Isı ve Sıcaklık', topics: ['Hal Değişimi', 'Genleşme'] },
            { id: 'FIZ_U4', name: 'Optik', topics: ['Aynalar', 'Kırılma', 'Renk'] }
          ]
        },
        {
          id: 'TYT_COGRAFYA', name: 'Coğrafya', order: 8, units: [
            { id: 'COG_U1', name: 'Dünyanın Şekli ve Hareketleri', topics: ['Eksen Eğikliği', 'Mevsimler'] },
            { id: 'COG_U2', name: 'Harita Bilgisi', topics: ['İzohipsler', 'Ölçekler'] },
            { id: 'COG_U3', name: 'Türkiye Coğrafyası', topics: ['Yer Şekilleri', 'Nüfus Politikaları'] }
          ]
        }
      ];

      for (const ders of tytTree) {
        // Create Subject
        await setDoc(doc(db, 'subjects', ders.id), {
          id: ders.id,
          name: ders.name,
          programId: 'TYT',
          order: ders.order,
          isActive: true,
          createdAt: serverTimestamp()
        }, { merge: true });

        for (const [uIdx, unite] of ders.units.entries()) {
          // Create Unit
          await setDoc(doc(db, 'units', unite.id), {
            id: unite.id,
            subjectId: ders.id,
            name: unite.name,
            order: uIdx + 1,
            createdAt: serverTimestamp()
          }, { merge: true });

          for (const [tIdx, konu] of unite.topics.entries()) {
            // Create Topic
            const topicId = `${unite.id}_T${tIdx + 1}`;
            await setDoc(doc(db, 'topics', topicId), {
              id: topicId,
              unitId: unite.id,
              name: konu,
              order: tIdx + 1,
              createdAt: serverTimestamp()
            }, { merge: true });
          }
        }
      }

      toast({ title: 'Müfredat Tohumlandı', description: 'TYT 2026 ders ağacı saniyeler içinde buluta işlendi.', className: "bg-primary text-white rounded-[2rem]" });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Hata', description: error.message });
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="p-8 lg:p-12 space-y-12 max-w-7xl mx-auto w-full animate-in fade-in duration-1000">
      <header className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-10">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-primary text-white font-black text-[10px] uppercase tracking-widest shadow-2xl">
            <ShieldAlert className="h-4 w-4 text-accent animate-pulse" /> ROOT ACCESS: LEVEL 4.8
          </div>
          <h2 className="text-6xl font-black tracking-tighter italic text-primary uppercase text-shadow-premium leading-none">Küresel <br /><span className="text-accent text-shadow-accent">Harekât Merkezi</span></h2>
        </div>
        <Button onClick={handleSeedCurriculum} disabled={seeding} className="h-16 px-8 rounded-2xl bg-primary hover:bg-accent transition-all font-black text-[10px] uppercase tracking-widest gap-3 shadow-2xl">
          {seeding ? <Loader2 className="h-5 w-5 animate-spin" /> : <Database className="h-5 w-5 text-accent" />}
          Müfredat Motorunu Kur (Seed)
        </Button>
      </header>

      <Tabs defaultValue="stats" className="space-y-12">
        <TabsList className="bg-slate-100 p-2 rounded-[2.5rem] h-20 flex gap-2 overflow-x-auto scrollbar-hide">
          <TabsTrigger value="stats" className="rounded-2xl px-8 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-lg">Metrikler</TabsTrigger>
          <TabsTrigger value="users" className="rounded-2xl px-8 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-lg">Kullanıcılar</TabsTrigger>
        </TabsList>

        <TabsContent value="stats" className="space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { label: 'Aktif Kurum', val: schoolCount, icon: Globe, color: 'primary' },
              { label: 'Toplam Eğitmen', val: teacherCount, icon: Users, color: 'accent' },
              { label: 'Toplam Öğrenci', val: studentCount, icon: Zap, color: 'primary' },
              { label: 'İşlem Logu', val: '1.4M', icon: Activity, color: 'accent' },
            ].map((stat, i) => (
              <Card key={i} className="rounded-[3.5rem] border-none shadow-lg bg-white p-2 border border-primary/5">
                <CardHeader className="pb-2">
                  <div className={cn(stat.color === 'accent' ? 'bg-accent' : 'bg-primary', "h-16 w-16 rounded-[1.75rem] flex items-center justify-center mb-4 text-white shadow-lg")}>
                    <stat.icon className="h-8 w-8" />
                  </div>
                  <CardTitle className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground italic">{stat.label}</CardTitle>
                </CardHeader>
                <CardContent><p className="text-5xl font-black text-primary tracking-tighter">{stat.val}</p></CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
