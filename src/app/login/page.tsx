
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

/**
 * Giriş ve Kayıt süreci artık merkezi olarak /dashboard sayfasında yönetilmektedir.
 * Bu sayfa geriye dönük uyumluluk için Anasayfa'ya yönlendirme yapar.
 */
export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    // Tüm auth süreçleri artık anasayfa terminalinde birleştiği için yönlendiriyoruz.
    router.replace('/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
      <div className="flex flex-col items-center gap-6">
        <Loader2 className="h-10 w-10 animate-spin text-accent" />
        <p className="text-xs font-black uppercase tracking-[0.4em] text-primary/40">Giriş Terminaline Bağlanılıyor...</p>
      </div>
    </div>
  );
}
