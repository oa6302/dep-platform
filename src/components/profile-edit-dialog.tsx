
'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFirestore } from '@/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Camera, Loader2, User, CheckCircle2, UserRound, Brain, Building } from 'lucide-react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';

interface ProfileEditDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  userData: any;
}

export function ProfileEditDialog({ isOpen, onOpenChange, userData }: ProfileEditDialogProps) {
  const db = useFirestore();
  const { toast } = useToast();
  const [displayName, setDisplayName] = useState(userData?.displayName || '');
  const [photoUrl, setPhotoUrl] = useState(userData?.photoUrl || '');
  const [role, setRole] = useState(userData?.role || 'student');
  const [loading, setLoading] = useState(false);

  const defaultAvatar = PlaceHolderImages.find(img => img.id === 'default-avatar')?.imageUrl || "https://picsum.photos/seed/avatar-99/200/200";

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      toast({
        variant: 'destructive',
        title: 'Hata',
        description: 'Resim boyutu 1MB\'dan küçük olmalıdır.'
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!db || !userData?.uid) return;
    setLoading(true);
    try {
      const userRef = doc(db, 'users', userData.uid);
      await updateDoc(userRef, {
        displayName,
        photoUrl,
        role,
        updatedAt: serverTimestamp()
      });
      toast({
        title: 'Sistem Güncellendi',
        description: 'Profil bilgileriniz ve yetki seviyeniz başarıyla değiştirildi.',
        className: "bg-primary text-white rounded-[2rem]"
      });
      onOpenChange(false);
      // Sayfayı yenileyerek yeni görünümün yüklenmesini sağlar
      window.location.reload();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Hata',
        description: 'Profil güncellenirken bir sorun oluştu.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-[3rem] border-none shadow-[0_60px_120px_-30px_rgba(15,23,42,0.3)] p-10 max-w-md bg-white">
        <DialogHeader className="space-y-4 text-center">
          <DialogTitle className="text-3xl font-black italic tracking-tighter uppercase text-primary">Profili Düzenle</DialogTitle>
          <DialogDescription className="font-medium italic">
            Bilgilerinizi ve sistem rolünüzü buradan güncelleyebilirsiniz.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-8 pt-6">
          <div className="flex flex-col items-center gap-4">
            <div className="relative group">
              <div className="h-32 w-32 rounded-[2.5rem] bg-slate-100 overflow-hidden relative shadow-2xl border-4 border-white transition-all group-hover:scale-105">
                <Image 
                  src={photoUrl || defaultAvatar} 
                  alt="Avatar" 
                  fill 
                  className="object-cover"
                  unoptimized
                />
              </div>
              <label htmlFor="photo-upload" className="absolute -bottom-2 -right-2 h-10 w-10 bg-accent rounded-xl flex items-center justify-center text-white shadow-xl border-4 border-white cursor-pointer hover:bg-primary transition-all">
                <Camera className="h-5 w-5" />
                <input 
                  id="photo-upload" 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleImageUpload} 
                />
              </label>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Görünür Ad</Label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-accent transition-colors" />
                <Input 
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="h-14 rounded-2xl bg-slate-50 border-none shadow-inner font-bold pl-12 focus-visible:ring-accent focus-visible:bg-white transition-all"
                  placeholder="Adınız Soyadınız"
                />
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2 italic text-center block">SİSTEM ROLÜNÜ DEĞİŞTİR</Label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'student', label: 'ÖĞRENCİ', icon: UserRound },
                  { id: 'teacher', label: 'EĞİTMEN', icon: Brain },
                  { id: 'school_admin', label: 'KURUM', icon: Building },
                ].map((r) => {
                  const Icon = r.icon;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setRole(r.id)}
                      className={cn(
                        'p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2',
                        role === r.id ? 'border-accent bg-accent/5 text-primary shadow-lg scale-105' : 'border-primary/5 bg-slate-50 opacity-40 hover:opacity-100'
                      )}
                    >
                      <Icon className={cn('h-6 w-6', role === r.id ? 'text-accent' : 'text-primary')} />
                      <span className="font-black text-[8px] tracking-widest">{r.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <Button 
            onClick={handleSave}
            disabled={loading}
            className="w-full h-16 rounded-2xl bg-primary hover:bg-accent transition-all font-black text-xs uppercase tracking-widest gap-3 shadow-2xl shadow-primary/20"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />}
            Değişiklikleri Kaydet
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
