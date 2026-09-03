
'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Link as LinkIcon, Youtube, Globe, FileText, 
  Search, ArrowRight, ArrowLeft, Home, Zap, ExternalLink
} from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LinksPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');

  const links = [
    { title: "OGM Materyal - Konu Anlatımı", url: "https://ogmmateryal.eba.gov.tr/konu-anlatimlari-video?video=1", type: "video", category: "RESMİ" },
    { title: "EBA Soru Bankası", url: "https://ogmmateryal.eba.gov.tr/soru-bankasi", type: "web", category: "RESMİ" },
    { title: "MEB Akademik Destek", url: "https://www.eba.gov.tr/akademik-destek", type: "web", category: "RESMİ" },
    { title: "YKS Çıkmış Sorular (ÖSYM)", url: "https://www.osym.gov.tr/TR,15065/yks-cikmis-sorular.html", type: "pdf", category: "ARŞİV" },
    { title: "Benim Hocam - TYT Matematik", url: "https://www.youtube.com/results?search_query=benim+hocam+tyt+matematik", type: "youtube", category: "EĞİTİM" },
    { title: "Hocalara Geldik - Edebiyat", url: "https://www.youtube.com/results?search_query=hocalara+geldik+edebiyat", type: "youtube", category: "EĞİTİM" },
  ];

  const filtered = links.filter(l => l.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-8 lg:p-14 space-y-12 max-w-7xl mx-auto w-full animate-in fade-in duration-700 bg-[#F8FAFC]">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
             <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-12 w-12 rounded-xl bg-white shadow-sm border border-slate-100 hover:bg-primary hover:text-white transition-all"><ArrowLeft className="h-5 w-5" /></Button>
             <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard')} className="h-12 w-12 rounded-xl bg-white shadow-sm border border-slate-100 hover:bg-primary hover:text-white transition-all"><Home className="h-5 w-5" /></Button>
          </div>
          <div className="space-y-2">
             <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-accent text-primary font-black text-[10px] uppercase tracking-widest shadow-xl shadow-accent/20 italic">
                <LinkIcon className="h-3.5 w-3.5" /> VAULT v4.8
             </div>
             <h2 className="text-6xl font-black tracking-tighter italic text-primary uppercase leading-none text-shadow-deep">
                Akademik <br /><span className="text-accent text-shadow-accent">Kaynaklar</span>
             </h2>
          </div>
        </div>
        <div className="relative w-full md:w-[350px] group">
           <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-accent transition-colors" />
           <Input 
             value={search} 
             onChange={(e) => setSearch(e.target.value)} 
             placeholder="Kütüphanede ara..." 
             className="h-16 rounded-2xl bg-white border-none shadow-xl pl-16 font-bold" 
           />
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map((link, i) => (
          <Card key={i} className="p-10 rounded-[3.5rem] border-none shadow-xl bg-white hover:-translate-y-3 transition-all duration-500 group relative overflow-hidden">
             <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-full translate-x-1/2 -translate-y-1/2 group-hover:bg-accent/5 transition-all" />
             <div className="space-y-10 relative z-10">
                <div className="flex justify-between items-start">
                   <div className="h-16 w-16 rounded-[1.25rem] bg-slate-50 flex items-center justify-center shadow-inner group-hover:scale-110 transition-all">
                      {link.type === 'youtube' ? <Youtube className="h-8 w-8 text-rose-500" /> : 
                       link.type === 'pdf' ? <FileText className="h-8 w-8 text-blue-500" /> : 
                       <Globe className="h-8 w-8 text-emerald-500" />}
                   </div>
                   <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-40 italic">{link.category}</span>
                </div>
                <div className="space-y-2">
                   <h3 className="text-2xl font-black italic tracking-tighter text-primary uppercase leading-tight">{link.title}</h3>
                   <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-40 truncate">{link.url}</p>
                </div>
                <a href={link.url} target="_blank" rel="noopener noreferrer">
                   <Button className="w-full h-14 rounded-2xl bg-primary hover:bg-accent text-white font-black text-[10px] uppercase tracking-widest gap-3 shadow-2xl">
                      KAYNAĞA GİT <ExternalLink className="h-4 w-4" />
                   </Button>
                </a>
             </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
