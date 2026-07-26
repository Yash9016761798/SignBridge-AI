'use client';

import React from 'react';
import { HandMetal, Loader2 } from 'lucide-react';

interface LoadingScreenProps {
  message?: string;
}

export default function LoadingScreen({ message = 'Loading...' }: LoadingScreenProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <HandMetal className="h-12 w-12 text-primary-600 animate-pulse" />
        </div>
        <div className="flex items-center justify-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin text-primary-600" />
          <span className="text-gray-600">{message}</span>
        </div>
      </div>
    </div>
  );
}
