
'use client';

/**
 * @fileOverview Auth Bypass: Üyelik sistemi kaldırıldı, sistem herkese açık "Misafir" moduna alındı.
 */
export function useUser() {
  return { 
    user: { 
      uid: 'guest_yks_tm_user', 
      displayName: 'Misafir Öğrenci', 
      email: 'misafir@dek.com' 
    }, 
    loading: false 
  };
}
