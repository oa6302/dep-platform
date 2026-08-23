
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
            { id: 'TR_U1', name: 'Sözcükte Anlam', topics: ['Sözcüğün Anlamı', 'Gerçek Anlam', 'Mecaz Anlam', 'Deyimler', 'Atasözleri'] },
            { id: 'TR_U2', name: 'Cümlede Anlam', topics: ['Neden-Sonuç', 'Amaç-Sonuç', 'Öznel ve Nesnel Yargı', 'Çıkarım'] },
            { id: 'TR_U3', name: 'Paragraf', topics: ['Ana Düşünce', 'Yardımcı Düşünce', 'Paragrafta Yapı', 'Anlatım Teknikleri', 'Sözel Mantık'] },
            { id: 'TR_U4', name: 'Ses Bilgisi', topics: ['Ses Olayları'] },
            { id: 'TR_U5', name: 'Yazım Kuralları', topics: ['Büyük Harfler', 'Birleşik Kelimeler', 'De/da/ki Yazımı'] },
            { id: 'TR_U6', name: 'Noktalama İşaretleri', topics: ['Virgül', 'Noktalı Virgül', 'İki Nokta'] },
            { id: 'TR_U7', name: 'Sözcükte Yapı', topics: ['Kök', 'Gövde', 'Ekler'] },
            { id: 'TR_U8', name: 'Sözcük Türleri', topics: ['İsim', 'Sıfat', 'Zamir', 'Zarf', 'Edat', 'Bağlaç'] },
            { id: 'TR_U9', name: 'Fiiller', topics: ['Fiilde Yapı', 'Fiilde Çatı', 'Fiilimsi'] },
            { id: 'TR_U10', name: 'Cümlenin Ögeleri', topics: ['Özne', 'Yüklem', 'Nesne', 'Tümleç'] },
            { id: 'TR_U11', name: 'Anlatım Bozuklukları', topics: ['Anlamsal Bozukluklar', 'Yapısal Bozukluklar'] }
          ]
        },
        { 
          id: 'TYT_MATEMATIK', name: 'Matematik', order: 2, units: [
            { id: 'MAT_U1', name: 'Temel Kavramlar', topics: ['Sayı Kümeleri', 'Tek-Çift Sayılar', 'Asal Sayılar', 'Ardışık Sayılar'] },
            { id: 'MAT_U2', name: 'Sayı Basamakları', topics: ['Basamak Kavramı', 'Çözümleme'] },
            { id: 'MAT_U3', name: 'Bölme ve Bölünebilme', topics: ['Kurallar', 'Kalan Bulma'] },
            { id: 'MAT_U4', name: 'EBOB-EKOK', topics: ['EBOB-EKOK Problemleri'] },
            { id: 'MAT_U5', name: 'Rasyonel Sayılar', topics: ['Ondalık Sayılar', 'Sıralama'] },
            { id: 'MAT_U6', name: 'Basit Eşitsizlikler', topics: ['Eşitsizlik Çözümü'] },
            { id: 'MAT_U7', name: 'Mutlak Değer', topics: ['Mutlak Değerli Denklemler'] },
            { id: 'MAT_U8', name: 'Üslü Sayılar', topics: ['Üslü İfadeler', 'Üslü Denklemler'] },
            { id: 'MAT_U9', name: 'Köklü Sayılar', topics: ['Köklü İfadeler', 'Eşlenik'] },
            { id: 'MAT_U10', name: 'Çarpanlara Ayırma', topics: ['Özdeşlikler', 'Sadeleştirme'] },
            { id: 'MAT_U11', name: 'Oran-Orantı', topics: ['Doğru-Ters Orantı'] },
            { id: 'MAT_U12', name: 'Problemler', topics: ['Sayı-Kesir', 'Yaş', 'Yüzde-Kar-Zarar', 'Hız', 'Karışım', 'İşçi'] },
            { id: 'MAT_U13', name: 'Kümeler', topics: ['Kartezyen Çarpım'] },
            { id: 'MAT_U14', name: 'Mantık', topics: ['Önermeler'] },
            { id: 'MAT_U15', name: 'Fonksiyonlar', topics: ['Tanım Kümesi', 'Grafikler'] },
            { id: 'MAT_U16', name: 'Veri ve İstatistik', topics: ['Mod-Medyan-Ortalama'] },
            { id: 'MAT_U17', name: 'Olasılık', topics: ['Permütasyon', 'Kombinasyon'] }
          ]
        },
        {
          id: 'TYT_GEOMETRI', name: 'Geometri', order: 3, units: [
            { id: 'GEO_U1', name: 'Doğruda ve Üçgende Açılar', topics: ['Açı İlişkileri'] },
            { id: 'GEO_U2', name: 'Özel Üçgenler', topics: ['Dik Üçgen', 'İkizkenar-Eşkenar'] },
            { id: 'GEO_U3', name: 'Üçgende Alan ve Benzerlik', topics: ['Alan Oranları', 'Benzerlik Teoremleri'] },
            { id: 'GEO_U4', name: 'Çokgenler ve Dörtgenler', topics: ['Paralelkenar', 'Dikdörtgen', 'Kare', 'Yamuk'] },
            { id: 'GEO_U5', name: 'Çember ve Daire', topics: ['Uzunluk', 'Alan'] },
            { id: 'GEO_U6', name: 'Katı Cisimler', topics: ['Prizma', 'Piramit', 'Küre'] },
            { id: 'GEO_U7', name: 'Analitik Geometri', topics: ['Noktanın ve Doğrunun Analitiği'] }
          ]
        },
        {
          id: 'TYT_FIZIK', name: 'Fizik', order: 4, units: [
            { id: 'FIZ_U1', name: 'Fizik Bilimine Giriş', topics: ['Fiziksel Nicelikler'] },
            { id: 'FIZ_U2', name: 'Madde ve Özellikleri', topics: ['Özkütle', 'Dayanıklılık'] },
            { id: 'FIZ_U3', name: 'Hareket ve Kuvvet', topics: ['Newton Yasaları'] },
            { id: 'FIZ_U4', name: 'Enerji', topics: ['İş-Güç-Enerji'] },
            { id: 'FIZ_U5', name: 'Isı ve Sıcaklık', topics: ['Hal Değişimi', 'Genleşme'] },
            { id: 'FIZ_U6', name: 'Elektrostatik', topics: ['Elektrik Yükleri'] },
            { id: 'FIZ_U7', name: 'Elektrik ve Manyetizma', topics: ['Akım-Direnç-Devreler'] },
            { id: 'FIZ_U8', name: 'Basınç ve Kaldırma Kuvveti', topics: ['Sıvı Basıncı', 'Arşimet'] },
            { id: 'FIZ_U9', name: 'Dalgalar', topics: ['Yay-Su-Ses-Deprem'] },
            { id: 'FIZ_U10', name: 'Optik', topics: ['Aynalar', 'Kırılma', 'Mercekler', 'Renk'] }
          ]
        },
        {
          id: 'TYT_KIMYA', name: 'Kimya', order: 5, units: [
            { id: 'KIM_U1', name: 'Kimya Bilimi', topics: ['Güvenlik İşaretleri'] },
            { id: 'KIM_U2', name: 'Atom ve Periyodik Sistem', topics: ['Modeller', 'Periyodik Özellikler'] },
            { id: 'KIM_U3', name: 'Kimyasal Türler Arası Etkileşimler', topics: ['Güçlü ve Zayıf Etkileşimler'] },
            { id: 'KIM_U4', name: 'Maddenin Halleri', topics: ['Gazlar', 'Sıvılar'] },
            { id: 'KIM_U5', name: 'Doğa ve Kimya', topics: ['Su ve Hayat'] },
            { id: 'KIM_U6', name: 'Kimyasal Hesaplamalar', topics: ['Mol Kavramı', 'Tepkimeler'] },
            { id: 'KIM_U7', name: 'Karışımlar', topics: ['Ayırma Teknikleri'] },
            { id: 'KIM_U8', name: 'Asitler, Bazlar ve Tuzlar', topics: ['pH Kavramı'] }
          ]
        },
        {
          id: 'TYT_BIYOLOJI', name: 'Biyoloji', order: 6, units: [
            { id: 'BIY_U1', name: 'Yaşam Bilimi Biyoloji', topics: ['Temel Bileşenler'] },
            { id: 'BIY_U2', name: 'Hücre', topics: ['Organeller', 'Madde Geçişleri'] },
            { id: 'BIY_U3', name: 'Canlıların Dünyası', topics: ['Sınıflandırma'] },
            { id: 'BIY_U4', name: 'Hücre Bölünmeleri', topics: ['Mitoz-Mayoz'] },
            { id: 'BIY_U5', name: 'Kalıtım', topics: ['Mendel İlkeleri'] },
            { id: 'BIY_U6', name: 'Ekosistem Ekolojisi', topics: ['Madde Döngüleri'] }
          ]
        },
        { id: 'TYT_TARIH', name: 'Tarih', order: 7, units: [{ id: 'TAR_U1', name: 'Tarih ve Zaman', topics: ['Takvimler'] }, { id: 'TAR_U2', name: 'İlk Çağ Uygarlıkları', topics: ['Mezopotamya-Mısır'] }, { id: 'TAR_U3', name: 'İslam Tarihi', topics: ['Hz. Muhammed-Dört Halife'] }, { id: 'TAR_U4', name: 'Osmanlı Devleti', topics: ['Kuruluş-Yükselme-Gerileme'] }, { id: 'TAR_U5', name: 'Millî Mücadele', topics: ['Kongreler-Lozan'] }, { id: 'TAR_U6', name: 'Atatürk İlke ve İnkılapları', topics: ['Cumhuriyetçilik-Laiklik'] }] },
        { id: 'TYT_COGRAFYA', name: 'Coğrafya', order: 8, units: [{ id: 'COG_U1', name: 'Doğa ve İnsan', topics: ['Coğrafyanın Bölümleri'] }, { id: 'COG_U2', name: 'Dünya’nın Şekli ve Hareketleri', topics: ['Mevsimler'] }, { id: 'COG_U3', name: 'Harita Bilgisi', topics: ['İzohips'] }, { id: 'COG_U4', name: 'İklim Bilgisi', topics: ['Basınç-Nem'] }, { id: 'COG_U5', name: 'Nüfus ve Yerleşme', topics: ['Piramitler'] }, { id: 'COG_U6', name: 'Ekonomik Faaliyetler', topics: ['Tarım-Sanayi'] }] },
        { id: 'TYT_FELSEFE', name: 'Felsefe', order: 9, units: [{ id: 'FEL_U1', name: 'Felsefeye Giriş', topics: ['Düşünce Özellikleri'] }, { id: 'FEL_U2', name: 'Bilgi Felsefesi', topics: ['Doğruluk-Gerçeklik'] }, { id: 'FEL_U3', name: 'Varlık Felsefesi', topics: ['Ontoloji'] }, { id: 'FEL_U4', name: 'Ahlak Felsefesi', topics: ['Etik'] }] },
        { id: 'TYT_DIN', name: 'Din Kültürü', order: 10, units: [{ id: 'DIN_U1', name: 'Bilgi ve İnanç', topics: ['İman'] }, { id: 'DIN_U2', name: 'İslam ve İbadet', topics: ['Namaz-Hac'] }, { id: 'DIN_U3', name: 'Ahlak ve Değerler', topics: ['Adalet'] }] }
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
