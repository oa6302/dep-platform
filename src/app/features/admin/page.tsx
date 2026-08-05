'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { 
  Users, 
  ShieldCheck, 
  Key, 
  Settings, 
  Database, 
  Lock, 
  Code2, 
  HardDrive,
  ShieldAlert, 
  ChevronLeft 
} from 'lucide-react';

export default function AdminFeaturesPage() {
  const features = [
    { icon: Users, title: "Kullanıcı Yönetimi", desc: "Tüm sistem kullanıcılarını, kayıtlarını ve hareketlerini merkezi olarak kontrol edin." },
    { icon: ShieldCheck, title: "Rol Yönetimi", desc: "Öğrenci, öğretmen, veli ve okul yönetimi için özelleştirilmiş erişim yetkileri tanımlayın." },
    { icon: Key, title: "Lisans Yönetimi", desc: "Aktif okul lisanslarını, abonelik sürelerini ve ödeme durumlarını takip edin." },
    { icon: Settings, title: "Sistem Ayarları", desc: "Platformun genel konfigürasyonunu, tema ve dil ayarlarını yönetin." },
    { icon: Database, title: "Log Yönetimi", desc: "Kritik sistem hareketlerini ve veritabanı işlemlerini anlık olarak izleyin." },
    { icon: Lock, title: "Güvenlik Merkezi", desc: "Veri güvenliğini, SSL sertifikalarını ve erişim kısıtlamalarını denetleyin." },
    { icon: Code2, title: "API Yönetimi", desc: "Harici servis entegrasyonlarını, API anahtarlarını ve veri akışını yönetin." },
    { icon: HardDrive, title: "Yedekleme", desc: "Sistem verilerini periyodik olarak yedekleyin ve felaket kurtarma senaryolarını işletin." },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="py-12 px-6">
        <div className="container mx-auto">
          <Link href="/" className="inline-flex items-center text-primary font-black uppercase text-[10px] tracking-widest hover:text-accent transition-colors">
            <ChevronLeft className="mr-2 h-4 w-4" /> Ana Sayfaya Dön
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-6 pb-32 space-y-24">
        <section className="text-center space-y-8 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-destructive text-white font-black text-[10px] uppercase tracking-widest shadow-xl shadow-destructive/20">
            <ShieldAlert className="h-3 w-3" /> Sistem Yönetimi
          </div>
          <h1 className="text-6xl md:text-8xl font-black text-primary tracking-tighter leading-none italic text-shadow-premium uppercase">
            Global <br /><span className="text-accent text-shadow-accent">Kontrol Merkezi</span>
          </h1>
          <p className="text-2xl text-muted-foreground font-medium leading-relaxed italic">
            Tüm platform altyapısını en yüksek güvenlik ve performans standartlarıyla yönetin.
          </p>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, i) => (
            <div key={i} className="group p-10 bg-white rounded-[3rem] border border-primary/5 shadow-[0_30px_60px_-15px_rgba(15,23,42,0.08)] hover:shadow-[0_50px_100px_-20px_rgba(15,23,42,0.15)] transition-all duration-500 hover:-translate-y-3 relative overflow-hidden">
              <div className="h-16 w-16 rounded-2xl bg-destructive/5 flex items-center justify-center mb-6 group-hover:bg-destructive group-hover:text-white transition-all duration-500">
                <feature.icon className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-black text-primary mb-3 italic tracking-tight text-shadow-deep uppercase">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed font-medium text-sm italic opacity-80">{feature.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}