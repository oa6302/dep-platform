
'use client';

import { useUser, useFirestore, useCollection } from '@/firebase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Link as LinkIcon, Youtube, Globe, FileText, 
  Search, ArrowRight, ArrowLeft, Home, Zap, 
  ExternalLink, Plus, Edit3, Trash2, Loader2, 
  Save, X, CheckCircle2, MoreVertical
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  collection, addDoc, updateDoc, deleteDoc, 
  doc, serverTimestamp, query, orderBy 
} from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from '@/lib/utils';

// Varsayılan Kaynaklar
const DEFAULT_LINKS = [
  { id: 'def1', title: 'OGM Materyal - Video Konu Anlatımları', url: 'https://ogmmateryal.eba.gov.tr/konu-anlatimlari-video?video=1', type: 'web', category: 'RESMİ' },
  { id: 'def2', title: 'MEB Kazanım Kavrama Testleri Arşivi', url: 'https://odsgm.meb.gov.tr/www/kazanim-testleri/kategori/1', type: 'pdf', category: 'ARŞİV' },
  { id: 'def3', title: 'EBA Akademik Destek Portalı', url: 'https://www.eba.gov.tr/akademik-destek', type: 'web', category: 'EĞİTİM' },
  { id: 'def4', title: 'YKS Matematik Master Playlist', url: 'https://www.youtube.com/results?search_query=yks+matematik+konu+anlat%C4%B1m%C4%B1', type: 'youtube', category: 'VİDEO' },
];

export default function LinksPage() {
  const { user } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  
  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const linksQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, 'academicLinks'));
  }, [db]);

  const { data: dbLinks = [], loading: linksLoading } = useCollection<any>(linksQuery);

  const links = useMemo(() => {
    return dbLinks.length > 0 ? dbLinks : DEFAULT_LINKS;
  }, [dbLinks]);

  const filtered = useMemo(() => {
    return links.filter(l => 
      l.title?.toLowerCase().includes(search.toLowerCase()) || 
      l.category?.toLowerCase().includes(search.toLowerCase())
    );
  }, [links, search]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!db || !user) return;

    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    const linkData = {
      title: formData.get('title') as string,
      url: formData.get('url') as string,
      type: formData.get('type') as string,
      category: (formData.get('category') as string).toUpperCase(),
      updatedAt: serverTimestamp(),
    };

    try {
      if (editingLink && !editingLink.id.startsWith('def')) {
        await updateDoc(doc(db, 'academicLinks', editingLink.id), linkData);
        toast({ title: 'Güncellendi', description: 'Değişiklikler kaydedildi.' });
      } else {
        await addDoc(collection(db, 'academicLinks'), {
          ...linkData,
          createdAt: serverTimestamp(),
          creatorId: user.uid
        });
        toast({ title: 'Eklendi', description: 'Yeni kaynak kütüphaneye işlendi.' });
      }
      setIsDialogOpen(false);
      setEditingLink(null);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Hata', description: 'İşlem başarısız.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (id.startsWith('def')) return;
    if (!db || !confirm('Silmek istediğinize emin misiniz?')) return;
    try {
      await deleteDoc(doc(db, 'academicLinks', id));
      toast({ title: 'Silindi', variant: 'destructive' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Hata' });
    }
  };

  return (
    <div className="p-8 lg:p-14 space-y-12 max-w-7xl mx-auto w-full animate-in fade-in duration-1000 bg-[#F8FAFC]">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
             <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-12 w-12 rounded-xl bg-white shadow-sm border border-slate-100 hover:bg-primary hover:text-white transition-all"><ArrowLeft className="h-5 w-5" /></Button>
             <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard')} className="h-12 w-12 rounded-xl bg-white shadow-sm border border-slate-100 hover:bg-primary hover:text-white transition-all"><Home className="h-5 w-5" /></Button>
          </div>
          <div className="space-y-2">
             <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-accent text-primary font-black text-[10px] uppercase tracking-widest shadow-xl shadow-accent/20 italic border border-accent/20">
                <LinkIcon className="h-3.5 w-3.5" /> VAULT v4.8
             </div>
             <h2 className="text-6xl font-black tracking-tighter italic text-primary uppercase leading-none">
                Akademik <br /><span className="text-accent">Kaynaklar</span>
             </h2>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-6 w-full md:w-auto">
          <div className="relative w-full md:w-[350px]">
             <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
             <Input 
               value={search} 
               onChange={(e) => setSearch(e.target.value)} 
               placeholder="Kütüphanede ara..." 
               className="h-16 rounded-2xl bg-white border-none shadow-xl pl-16 font-bold text-sm" 
             />
          </div>

          <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if(!open) setEditingLink(null); }}>
            <DialogTrigger asChild>
              <Button className="h-16 px-10 rounded-2xl bg-primary hover:bg-accent transition-all duration-500 font-black text-xs uppercase tracking-widest gap-4 shadow-2xl text-white">
                <Plus className="h-6 w-6 text-accent" /> YENİ KAYNAK EKLE
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-[3rem] border-none shadow-2xl p-12 bg-white max-w-lg">
               <DialogHeader>
                  <DialogTitle className="text-4xl font-black italic tracking-tighter text-primary uppercase">KAYNAK EDİTÖRÜ</DialogTitle>
                  <DialogDescription>Kütüphaneye yeni bir akademik veri ekleyin.</DialogDescription>
               </DialogHeader>

               <form onSubmit={handleSubmit} className="space-y-8 pt-8">
                  <div className="space-y-3">
                     <Label className="text-[10px] font-black uppercase opacity-40 ml-4">BAŞLIK</Label>
                     <Input name="title" required defaultValue={editingLink?.title} placeholder="Örn: OGM Matematik" className="h-16 rounded-2xl bg-slate-50 border-none shadow-inner font-bold" />
                  </div>
                  <div className="space-y-3">
                     <Label className="text-[10px] font-black uppercase opacity-40 ml-4">URL</Label>
                     <Input name="url" required defaultValue={editingLink?.url} placeholder="https://..." className="h-16 rounded-2xl bg-slate-50 border-none shadow-inner font-bold" />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                     <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase opacity-40 ml-4">TÜR</Label>
                        <Select name="type" defaultValue={editingLink?.type || 'web'}>
                           <SelectTrigger className="h-16 rounded-2xl bg-slate-50 border-none shadow-inner font-bold"><SelectValue /></SelectTrigger>
                           <SelectContent className="rounded-2xl">
                              <SelectItem value="youtube">YouTube</SelectItem>
                              <SelectItem value="pdf">PDF</SelectItem>
                              <SelectItem value="web">Web</SelectItem>
                           </SelectContent>
                        </Select>
                     </div>
                     <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase opacity-40 ml-4">KATEGORİ</Label>
                        <Input name="category" required defaultValue={editingLink?.category} placeholder="EĞİTİM" className="h-16 rounded-2xl bg-slate-50 border-none shadow-inner font-bold" />
                     </div>
                  </div>
                  <Button type="submit" disabled={loading} className="w-full h-20 rounded-[2rem] bg-primary hover:bg-accent transition-all font-black text-sm uppercase tracking-[0.4em] shadow-2xl text-white gap-4">
                     {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Save className="h-6 w-6 text-accent" />} TERMİNALE KAYDET
                  </Button>
               </form>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {filtered.map((link) => (
          <Card key={link.id} className="p-10 rounded-[4rem] border-none shadow-xl bg-white hover:-translate-y-3 transition-all duration-700 group relative overflow-hidden border-t-[10px]" style={{ borderTopColor: link.type === 'youtube' ? '#ef4444' : link.type === 'pdf' ? '#3b82f6' : '#10b981' }}>
             <div className="space-y-10 relative z-10">
                <div className="flex justify-between items-start">
                   <div className="h-20 w-20 rounded-[1.75rem] bg-slate-50 flex items-center justify-center shadow-inner group-hover:scale-110 transition-all duration-500">
                      {link.type === 'youtube' ? <Youtube className="h-10 w-10 text-rose-500" /> : 
                       link.type === 'pdf' ? <FileText className="h-10 w-10 text-blue-500" /> : 
                       <Globe className="h-10 w-10 text-emerald-500" />}
                   </div>
                   {!link.id.startsWith('def') && (
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <Button onClick={() => { setEditingLink(link); setIsDialogOpen(true); }} size="icon" variant="ghost" className="h-10 w-10 rounded-xl bg-slate-50 hover:bg-primary hover:text-white transition-all shadow-sm"><Edit3 className="h-4 w-4" /></Button>
                         <Button onClick={() => handleDelete(link.id)} size="icon" variant="ghost" className="h-10 w-10 rounded-xl bg-slate-50 hover:bg-destructive hover:text-white transition-all shadow-sm"><Trash2 className="h-4 w-4" /></Button>
                      </div>
                   )}
                </div>
                <div>
                   <h3 className="text-3xl font-black italic tracking-tighter text-primary uppercase leading-[0.85] mb-2 line-clamp-2">{link.title}</h3>
                   <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 italic">{link.category}</span>
                </div>
                <a href={link.url} target="_blank" rel="noopener noreferrer" className="block">
                   <Button className="w-full h-18 rounded-[2rem] bg-[#0F172A] hover:bg-accent text-white font-black text-xs uppercase tracking-[0.4em] gap-5 shadow-2xl transition-all border-none">
                      KAYNAĞA GİT <ExternalLink className="h-5 w-5 text-accent" />
                   </Button>
                </a>
             </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
