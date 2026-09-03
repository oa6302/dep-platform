
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

export default function LinksPage() {
  const { user } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  
  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Firestore'dan canlı verileri çek
  const { data: links = [], loading: linksLoading } = useCollection<any>(
    db ? query(collection(db, 'academicLinks'), orderBy('createdAt', 'desc')) : null
  );

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
      if (editingLink) {
        await updateDoc(doc(db, 'academicLinks', editingLink.id), linkData);
        toast({ title: 'KAYNAK GÜNCELLENDİ', description: 'Değişiklikler saniyeler içinde senkronize edildi.', className: "bg-primary text-white rounded-2xl" });
      } else {
        await addDoc(collection(db, 'academicLinks'), {
          ...linkData,
          createdAt: serverTimestamp(),
          creatorId: user.uid
        });
        toast({ title: 'YENİ KAYNAK EKLENDİ', description: 'Kütüphaneye yeni bir veri saniyeler içinde işlendi.', className: "bg-emerald-500 text-white rounded-2xl shadow-2xl" });
      }
      setIsDialogOpen(false);
      setEditingLink(null);
    } catch (error) {
      toast({ variant: 'destructive', title: 'HATA', description: 'Veri terminale işlenirken bir sorun oluştu.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!db || !confirm('Bu kaynağı kütüphaneden silmek istediğinize emin misiniz?')) return;
    try {
      await deleteDoc(doc(db, 'academicLinks', id));
      toast({ title: 'KAYNAK SİLİNDİ', description: 'Veri saniyeler içinde buluttan kaldırıldı.', variant: 'destructive' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Hata', description: 'Silme işlemi başarısız.' });
    }
  };

  const openEdit = (link: any) => {
    setEditingLink(link);
    setIsDialogOpen(true);
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
             <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-accent text-primary font-black text-[10px] uppercase tracking-widest shadow-xl shadow-accent/20 italic">
                <LinkIcon className="h-3.5 w-3.5" /> VAULT v4.8
             </div>
             <h2 className="text-6xl font-black tracking-tighter italic text-primary uppercase leading-none text-shadow-deep">
                Akademik <br /><span className="text-accent text-shadow-accent">Kaynaklar</span>
             </h2>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-6 w-full md:w-auto">
          <div className="relative w-full md:w-[350px] group">
             <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-accent transition-colors" />
             <Input 
               value={search} 
               onChange={(e) => setSearch(e.target.value)} 
               placeholder="Kütüphanede ara..." 
               className="h-16 rounded-2xl bg-white border-none shadow-xl pl-16 font-bold text-sm focus-visible:ring-accent" 
             />
          </div>

          <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if(!open) setEditingLink(null); }}>
            <DialogTrigger asChild>
              <Button className="h-16 px-10 rounded-2xl bg-primary hover:bg-accent transition-all duration-500 font-black text-xs uppercase tracking-widest gap-4 shadow-2xl shadow-primary/20 text-white">
                <Plus className="h-6 w-6 text-accent" /> YENİ KAYNAK EKLE
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-[3rem] border-none shadow-2xl p-12 bg-white max-w-lg overflow-hidden">
               <DialogHeader className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 text-primary font-black text-[10px] uppercase tracking-widest italic shadow-sm w-fit">
                    <Zap className="h-3 w-3 text-accent" /> VAULT EDİTÖRÜ
                  </div>
                  <DialogTitle className="text-4xl font-black italic tracking-tighter text-primary uppercase leading-none">
                    {editingLink ? 'KAYNAĞI DÜZENLE' : 'YENİ KAYNAK TANIMLA'}
                  </DialogTitle>
                  <DialogDescription className="font-medium italic">Kütüphaneye saniyeler içinde yeni bir akademik veri sığdırın.</DialogDescription>
               </DialogHeader>

               <form onSubmit={handleSubmit} className="space-y-8 pt-8">
                  <div className="space-y-3">
                     <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4 italic">BAŞLIK</Label>
                     <Input name="title" required defaultValue={editingLink?.title} placeholder="Örn: OGM Materyal - Matematik" className="h-16 rounded-2xl bg-slate-50 border-none shadow-inner font-bold" />
                  </div>
                  <div className="space-y-3">
                     <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4 italic">URL ADRESİ</Label>
                     <Input name="url" required defaultValue={editingLink?.url} placeholder="https://..." className="h-16 rounded-2xl bg-slate-50 border-none shadow-inner font-bold" />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                     <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4 italic">TÜR</Label>
                        <Select name="type" defaultValue={editingLink?.type || 'web'}>
                           <SelectTrigger className="h-16 rounded-2xl bg-slate-50 border-none shadow-inner font-bold">
                              <SelectValue placeholder="Tür Seçin" />
                           </SelectTrigger>
                           <SelectContent className="rounded-2xl border-none shadow-2xl">
                              <SelectItem value="youtube" className="font-bold">YouTube Video</SelectItem>
                              <SelectItem value="pdf" className="font-bold">PDF Döküman</SelectItem>
                              <SelectItem value="web" className="font-bold">Web Sayfası</SelectItem>
                           </SelectContent>
                        </Select>
                     </div>
                     <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4 italic">KATEGORİ</Label>
                        <Input name="category" required defaultValue={editingLink?.category} placeholder="RESMİ, ARŞİV vb." className="h-16 rounded-2xl bg-slate-50 border-none shadow-inner font-bold" />
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

      {linksLoading ? (
        <div className="py-40 flex flex-col items-center justify-center gap-6">
           <div className="h-16 w-16 animate-spin rounded-[2rem] border-[6px] border-accent border-t-transparent shadow-xl" />
           <p className="text-xs font-black uppercase tracking-[0.4em] text-primary/40 italic animate-pulse">Vault Terminaline Bağlanılıyor...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {filtered.map((link, i) => (
            <Card key={link.id} className="p-10 rounded-[4rem] border-none shadow-[0_50px_100px_-25px_rgba(0,0,0,0.12)] bg-white hover:-translate-y-3 transition-all duration-700 group relative overflow-hidden border-t-[10px]" style={{ borderTopColor: link.type === 'youtube' ? '#ef4444' : link.type === 'pdf' ? '#3b82f6' : '#10b981' }}>
               <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50/50 rounded-full translate-x-1/2 -translate-y-1/2 group-hover:bg-accent/5 transition-all" />
               
               <div className="space-y-10 relative z-10">
                  <div className="flex justify-between items-start">
                     <div className="h-20 w-20 rounded-[1.75rem] bg-slate-50 flex items-center justify-center shadow-inner group-hover:scale-110 transition-all duration-500">
                        {link.type === 'youtube' ? <Youtube className="h-10 w-10 text-rose-500" /> : 
                         link.type === 'pdf' ? <FileText className="h-10 w-10 text-blue-500" /> : 
                         <Globe className="h-10 w-10 text-emerald-500" />}
                     </div>
                     <div className="flex flex-col items-end gap-3">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 italic">{link.category}</span>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                           <Button onClick={() => openEdit(link)} size="icon" variant="ghost" className="h-10 w-10 rounded-xl bg-slate-50 hover:bg-primary hover:text-white transition-all shadow-sm">
                              <Edit3 className="h-4 w-4" />
                           </Button>
                           <Button onClick={() => handleDelete(link.id)} size="icon" variant="ghost" className="h-10 w-10 rounded-xl bg-slate-50 hover:bg-destructive hover:text-white transition-all shadow-sm">
                              <Trash2 className="h-4 w-4" />
                           </Button>
                        </div>
                     </div>
                  </div>

                  <div className="space-y-3">
                     <h3 className="text-3xl font-black italic tracking-tighter text-primary uppercase leading-[0.85] text-shadow-deep line-clamp-2">{link.title}</h3>
                     <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest opacity-30 truncate italic">{link.url}</p>
                  </div>

                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="block">
                     <Button className="w-full h-18 rounded-[2rem] bg-[#0F172A] hover:bg-accent text-white font-black text-xs uppercase tracking-[0.4em] gap-5 shadow-[0_30px_60px_-15px_rgba(15,23,42,0.4)] transition-all">
                        KAYNAĞA GİT <ExternalLink className="h-5 w-5 text-accent" />
                     </Button>
                  </a>
               </div>
            </Card>
          ))}
          {filtered.length === 0 && (
             <div className="col-span-full py-40 text-center space-y-8 animate-in zoom-in-95 duration-700">
                <div className="h-32 w-32 bg-primary/5 rounded-[3rem] flex items-center justify-center mx-auto shadow-inner">
                   <LinkIcon className="h-16 w-16 text-primary opacity-20" />
                </div>
                <p className="text-2xl font-black uppercase tracking-[0.5em] italic text-primary/20">Kütüphanede veri bulunamadı...</p>
                <Button variant="link" onClick={() => setSearch('')} className="font-black text-accent uppercase tracking-widest text-xs">Aramayı Temizle</Button>
             </div>
          )}
        </div>
      )}
    </div>
  );
}
