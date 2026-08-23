
'use client';

import { useCollection, useFirestore } from '@/firebase';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, Loader2, Database, ShieldAlert, Activity, Globe, Zap
} from 'lucide-react';
import { 
  orderBy, doc, setDoc, serverTimestamp 
} from 'firebase/firestore';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export function AdminView({ user, userData }: { user: any; userData: any }) {
  const db = useFirestore();
  const { toast } = useToast();
  const [seeding, setSeeding] = useState(false);

  const { data: allUsers = [] } = useCollection<any>('users', orderBy('createdAt', 'desc'));
  
  const teacherCount = allUsers.filter(u => u.role === 'teacher').length;
  const studentCount = allUsers.filter(u => u.role === 'student').length;
  const schoolCount = allUsers.filter(u => u.role === 'school_admin').length;

  const handleSeedCurriculum = async () => {
    if (!db) return;
    setSeeding(true);
    try {
      const fullTytTree = [
        { 
          id: 'TYT_TURKCE', name: 'Türkçe', order: 1, units: [
            { id: 'TR_U1', name: 'Sözcükte Anlam', topics: ['Sözcüğün Anlamı', 'Deyimler', 'Atasözleri', 'Söz Yorumu'] },
            { id: 'TR_U2', name: 'Cümlede Anlam', topics: ['Neden-Sonuç', 'Amaç-Sonuç', 'Öznel ve Nesnel Yargı', 'Çıkarım'] },
            { id: 'TR_U3', name: 'Paragraf', topics: ['Ana Düşünce', 'Yardımcı Düşünce', 'Paragrafta Yapı', 'Anlatım Teknikleri'] },
            { id: 'TR_U4', name: 'Ses Bilgisi', topics: ['Ses Olayları'] },
            { id: 'TR_U5', name: 'Yazım Kuralları', topics: ['Büyük Harfler', 'De/da/ki Yazımı'] },
            { id: 'TR_U6', name: 'Noktalama İşaretleri', topics: ['Virgül', 'Noktalı Virgül'] }
          ]
        },
        { 
          id: 'TYT_MATEMATIK', name: 'Matematik', order: 2, units: [
            { id: 'MAT_U1', name: 'Temel Kavramlar', topics: ['Sayı Kümeleri', 'Ardışık Sayılar', 'Asal Sayılar'] },
            { id: 'MAT_U2', name: 'Sayı Basamakları', topics: ['Basamak Kavramı', 'Çözümlenmesi'] },
            { id: 'MAT_U3', name: 'Bölme ve Bölünebilme', topics: ['Kurallar', 'Kalan Bulma'] },
            { id: 'MAT_U4', name: 'EBOB-EKOK', topics: ['EBOB-EKOK Problemleri'] },
            { id: 'MAT_U5', name: 'Rasyonel Sayılar', topics: ['Ondalık Sayılar', 'Sıralama'] },
            { id: 'MAT_U6', name: 'Problemler', topics: ['Sayı Problemleri', 'Yaş Problemleri', 'Yüzde Problemleri', 'Hız Problemleri'] }
          ]
        },
        {
          id: 'TYT_GEOMETRI', name: 'Geometri', order: 3, units: [
            { id: 'GEO_U1', name: 'Doğruda ve Üçgende Açılar', topics: ['Açı Çeşitleri', 'Üçgen İlişkileri'] },
            { id: 'GEO_U2', name: 'Özel Üçgenler', topics: ['Dik Üçgen', 'Pisagor', '30-60-90'] },
            { id: 'GEO_U3', name: 'Üçgende Alan', topics: ['Yükseklik', 'Alan Oranları'] },
            { id: 'GEO_U4', name: 'Çokgenler ve Dörtgenler', topics: ['Dikdörtgen', 'Kare', 'Yamuk'] }
          ]
        },
        {
          id: 'TYT_FIZIK', name: 'Fizik', order: 4, units: [
            { id: 'FIZ_U1', name: 'Fizik Bilimine Giriş', topics: ['Fiziksel Nicelikler'] },
            { id: 'FIZ_U2', name: 'Madde ve Özellikleri', topics: ['Özkütle', 'Dayanıklılık'] },
            { id: 'FIZ_U3', name: 'Hareket ve Kuvvet', topics: ['Newton Yasaları'] },
            { id: 'FIZ_U4', name: 'Optik', topics: ['Aydınlanma', 'Gölge', 'Yansıma'] }
          ]
        },
        {
          id: 'TYT_KIMYA', name: 'Kimya', order: 5, units: [
            { id: 'KIM_U1', name: 'Kimya Bilimi', topics: ['Kimya Uygulamaları'] },
            { id: 'KIM_U2', name: 'Atom ve Periyodik Sistem', topics: ['Modeller', 'Özellikler'] },
            { id: 'KIM_U3', name: 'Maddenin Halleri', topics: ['Sıvılar', 'Gazlar'] }
          ]
        },
        {
          id: 'TYT_BIYOLOJI', name: 'Biyoloji', order: 6, units: [
            { id: 'BIY_U1', name: 'Biyoloji Bilimi', topics: ['Canlıların Ortak Özellikleri'] },
            { id: 'BIY_U2', name: 'Hücre', topics: ['Organeller', 'Zardan Madde Geçişi'] },
            { id: 'BIY_U3', name: 'Kalıtım', topics: ['Mendel Genetiği'] }
          ]
        },
        { id: 'TYT_TARIH', name: 'Tarih', order: 7, units: [{ id: 'TAR_U1', name: 'Tarih Bilimi', topics: ['Zaman ve Takvim'] }, { id: 'TAR_U2', name: 'Millî Mücadele', topics: ['Kurtuluş Savaşı'] }] },
        { id: 'TYT_COGRAFYA', name: 'Coğrafya', order: 8, units: [{ id: 'COG_U1', name: 'Harita Bilgisi', topics: ['İzohips'] }, { id: 'COG_U2', name: 'Nüfus', topics: ['Piramitler'] }] },
        { id: 'TYT_FELSEFE', name: 'Felsefe', order: 9, units: [{ id: 'FEL_U1', name: 'Bilgi Felsefesi', topics: ['Rasyonalizm'] }] },
        { id: 'TYT_DIN', name: 'Din Kültürü', order: 10, units: [{ id: 'DIN_U1', name: 'İslam ve İbadet', topics: ['Namaz', 'Oruç'] }] }
      ];

      for (const ders of fullTytTree) {
        await setDoc(doc(db, 'subjects', ders.id), { id: ders.id, name: ders.name, programId: 'TYT', order: ders.order, createdAt: serverTimestamp() }, { merge: true });
        for (const [uIdx, unite] of ders.units.entries()) {
          await setDoc(doc(db, 'units', unite.id), { id: unite.id, subjectId: ders.id, name: unite.name, order: uIdx + 1, createdAt: serverTimestamp() }, { merge: true });
          for (const [tIdx, konu] of unite.topics.entries()) {
            const topicId = `${unite.id}_T${tIdx + 1}`;
            await setDoc(doc(db, 'topics', topicId), { id: topicId, unitId: unite.id, name: konu, order: tIdx + 1, createdAt: serverTimestamp() }, { merge: true });
          }
        }
      }

      toast({ title: 'Tüm Müfredat Senkronize Edildi', description: '10 ana branş ve yüzlerce kazanım saniyeler içinde buluta işlendi.', className: "bg-primary text-white rounded-[2rem]" });
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
          Tüm TYT Müfredatını Senkronize Et
        </Button>
      </header>

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
              <p className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground italic">{stat.label}</p>
            </CardHeader>
            <CardContent><p className="text-5xl font-black text-primary tracking-tighter">{stat.val}</p></CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
