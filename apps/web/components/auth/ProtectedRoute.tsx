'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isFirebaseEnabled, auth } from '@/lib/firebase';
import { useAuthStore } from '@/stores/auth-store';
import LoadingScreen from './LoadingScreen';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

export default function ProtectedRoute({ children, requiredRoles }: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    if (!isFirebaseEnabled) {
      setAuthenticated(isAuthenticated);
      setLoading(false);
      if (!isAuthenticated) {
        router.push('/login');
      }
      return;
    }

    let unsubscribe: (() => void) | undefined;

    import('firebase/auth').then(({ onAuthStateChanged }) => {
      unsubscribe = onAuthStateChanged(auth, (user: any) => {
        if (user) {
          setAuthenticated(true);
        } else {
          router.push('/login');
        }
        setLoading(false);
      });
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [router, isAuthenticated]);

  if (loading) {
    return <LoadingScreen message="Checking authentication..." />;
  }

  if (!authenticated) {
    return null;
  }

  return <>{children}</>;
}
