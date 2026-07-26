'use client';

import React from 'react';

interface SkeletonLoaderProps {
  className?: string;
  count?: number;
}

function SkeletonLine({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded bg-gray-200 ${className}`}
      aria-hidden="true"
    />
  );
}

export default function SkeletonLoader({ className = '', count = 1 }: SkeletonLoaderProps) {
  return (
    <div className={`space-y-4 ${className}`} role="status" aria-label="Loading">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <SkeletonLine className="h-12 w-12 rounded-lg" />
            <div className="flex-1 space-y-2">
              <SkeletonLine className="h-4 w-1/3" />
              <SkeletonLine className="h-3 w-1/2" />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <SkeletonLine className="h-3 w-full" />
            <SkeletonLine className="h-3 w-3/4" />
          </div>
        </div>
      ))}
      <span className="sr-only">Loading...</span>
    </div>
  );
}
