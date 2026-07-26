'use client';

import React, { useEffect, useState } from 'react';
import { isFirebaseEnabled, auth } from '@/lib/firebase';
import { useAuthStore } from '@/stores/auth-store';
import LoadingScreen from '@/components/auth/LoadingScreen';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseEnabled) {
      setLoading(false);
      return;
    }

    let unsubscribe: (() => void) | undefined;

    import('firebase/auth').then(({ onAuthStateChanged }) => {
      unsubscribe = onAuthStateChanged(auth, async (firebaseUser: any) => {
        if (firebaseUser) {
          try {
            const token = await firebaseUser.getIdToken();
            const apiUrl = process.env.NEXT_PUBLIC_API_URL;
            if (apiUrl) {
              const response = await fetch(`${apiUrl}/auth/me`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              if (response.ok) {
                const result = await response.json();
                setUser(result.data || result);
              } else {
                setUser(null);
              }
            } else {
              setUser(null);
            }
          } catch (err) {
            console.error('Failed to fetch user profile:', err);
            setUser(null);
          }
        } else {
          setUser(null);
        }
        setLoading(false);
      });
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [setUser]);

  if (loading) {
    return <LoadingScreen message="Loading SignBridge AI..." />;
  }

  return <>{children}</>;
}
