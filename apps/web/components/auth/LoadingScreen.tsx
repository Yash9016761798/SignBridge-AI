'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import Logo from '@/components/brand/Logo';

interface LoadingScreenProps {
  message?: string;
}

export default function LoadingScreen({ message = 'Loading...' }: LoadingScreenProps) {
  return (
    <div
      className="flex min-h-screen items-center justify-center bg-surface-50 dark:bg-[#0D0D0D]"
      role="status"
      aria-live="polite"
    >
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="animate-pulse">
            <Logo size="xl" priority />
          </div>
        </div>
        <div className="flex items-center justify-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin text-primary-600" aria-hidden="true" />
          <span className="text-surface-600 dark:text-surface-400">{message}</span>
        </div>
      </div>
    </div>
  );
}
