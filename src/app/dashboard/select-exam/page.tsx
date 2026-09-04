
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

/**
 * @fileOverview Bu sayfa otonom kurulum ile devreden çıkarılmıştır.
 * Doğrudan Dashboard'a yönlendirme yapılır.
 */
export default function SelectExamPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
      <Loader2 className="h-10 w-10 animate-spin text-accent" />
    </div>
  );
}
